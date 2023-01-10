import { auth } from '$lib/server/lucia';
import { TwitterApi } from 'twitter-api-v2';

import { TWITTER_APPKEY, TWITTER_SECRET } from '$env/static/private';

//tmp
const twitterClient = new TwitterApi({
	appKey: TWITTER_APPKEY,
	appSecret: TWITTER_SECRET,
});

// GET REQUEST
export async function GET({ cookies, params, url, locals }) {
	const path = params.auth;

	//auth paths
	switch (path) {
		case 'auth/twitter/login':
			return await handleTwitterLogin(cookies, url);
		case 'auth/twitter/callback':
			return await handleTwitterCallback(params, url, cookies, locals);
		default:
			return new Response(null, {
				status: 404,
			});
	}
}

/**
 * twitterUserClient
 * @param {*} accessToken 
 * @param {*} accessSecret 
 * @returns 
 */
function twitterUserClient(accessToken, accessSecret) {
	return new TwitterApi({
		appKey: TWITTER_APPKEY,
		appSecret: TWITTER_SECRET,
		accessToken,
		accessSecret
	});
}

/**
 * handleTwitterLogin
 * Generates Twitter authentication URL and temporarily stores `oauth_token` in database.
 * @param {*} cookies 
 * @param {*} url 
 * @returns 
 */
async function handleTwitterLogin(cookies,url) {
	//generate auth link
	let authLink;
	try {
		authLink = await twitterClient.generateAuthLink(
			`${url.origin}/api/auth/twitter/callback`
		);
	} catch (e) {
		console.error('Unable to generate AuthLink', e);
		return new Response(null, {
			status: 303,
			headers: { location: '/'},
		});
	}

	//confirm authlink has correct keys
	if (!authLink?.url || !authLink?.oauth_token || !authLink?.oauth_token_secret) {
		console.error('AuthLink has an invalid object?',authLink);
		return new Response(null, {
			status: 500,
		});
	}

	//set tmp cookie to grab with callback
	cookies.set('oauth_token_secret', authLink.oauth_token_secret, {
		path: '/api/auth/twitter',
		maxAge: 60 * 60
	});

	
	// Successfully generated authlink
	return new Response(null, {
		status: 303,
		headers: { location: authLink.url} 
	});
}

/**
 * handleTwitterCallback
 * Handles Twitters authentication callback, fetches permanent access-tokens, creates user if not defined
 * and saves them to the database and sets session
 * @param {*} params 
 * @param {*} url 
 * @param {*} cookies 
 * @param {*} locals 
 * @returns 
 */
async function handleTwitterCallback(params, url, cookies, locals) {
	const oauth_token = url.searchParams.get('oauth_token');
	const oauth_verifier = url.searchParams.get('oauth_verifier');

	//confirm url params returned
	if (!oauth_token || !oauth_verifier) {
		console.error('No oauth_token in callback request');
		
		return new Response(null, {
			status: 303,
			headers: { location: '/'},
		});
	}

	//get oauth_token_secret
	const oauth_token_secret = cookies.get('oauth_token_secret');
	
	//check token was successfully stored and retrieved.
	if (!oauth_token_secret) {
		console.error('No oauth_token_secret found',oauth_token_secret);

		return new Response(null, {
			status: 500,
		});
	}

	//cleanup cookie
	cookies.delete('oauth_token_secret');

	try {
		// Create twitter user-client from temporary tokens
		const twitterClient = twitterUserClient(oauth_token, oauth_token_secret);
		const { accessToken: access_token, accessSecret: access_secret } = await twitterClient.login(
			oauth_verifier
		);
    
		const twitterAuthClient = await twitterUserClient(access_token, access_secret);
		const twitterUser = await twitterAuthClient.v1.verifyCredentials({ include_email: true });

		console.log(twitterUser);

		const attributesExist =
			twitterUser?.id_str &&
			twitterUser?.email &&
			twitterUser?.screen_name &&
			twitterUser?.name &&
			twitterUser?.followers_count &&
			twitterUser?.friends_count &&
			twitterUser?.profile_image_url_https;

		//check required attributes
		if (!attributesExist) {
			console.error('Error attributes missing', attributesExist, twitterUser);

			// err…
			return new Response(null, {
				status: 500,
			});
		}
		
		//get existing user if exists
		let existingUser = null;
		try {
		existingUser = await auth.getUserByProviderId('twitter', twitterUser.email);
		}
		catch {
		// existingUser is null
		}

		//get user info
		const user = 
			existingUser ??
			(await auth.createUser(
				'twitter', 
				twitterUser.email, 
				{
					attributes: {
						username: twitterUser.screen_name,
						twitter_user_id: twitterUser.id_str,
						full_name: twitterUser.name,
						followers_count: twitterUser.followers_count,
						avatar_url: twitterUser.profile_image_url_https,
						accessToken: access_token,
						accessSecret: access_secret,//should I encrypt..
					}
				},
			));

		//set session
		const session = await auth.createSession(user.userId);
		locals.setSession(session);

		// Successfully authenticated, redirecting…
		return new Response(null, {
			status: 303,
			headers: { location: '/'},
		});
	} catch (e) {
		console.error('Error while logging in with twitter user-client', e);

		return new Response(null, {
			status: 500
		});
	}
}