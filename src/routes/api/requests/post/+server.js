export async function POST({ locals }) {
	//grab session
	const session = await locals.validate();
	console.log(session);//returns null in Chrome Version 108.0.5359.125 (Official Build) (64-bit)

	//confirm user is logged in
	if (session) {
		//return test data
		return new Response(JSON.stringify({worked:true}));

	//if no session should redirect back to homepage.
	} else {
		//302:no session detected
		return new Response(JSON.stringify({failed:true}));
	}
}