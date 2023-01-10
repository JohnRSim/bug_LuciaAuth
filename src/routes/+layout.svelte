<script>
	import { goto, invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { handleSession, signOut, getUser } from '@lucia-auth/sveltekit/client';
	
	//libs
	//
	import '../app.css';

	//global
	let mounted = false;
	let siteHeight = 0;
	let minHeight = '';

	//search
	let searchField = '';	

	$: if (siteHeight > 0) {
		setHeight();
	}

	//set session
	handleSession(page);
	//$:console.log($page);

	onMount(async() => {
		mounted = true;

	});

	/**
	 * login twitter
	 */
	async function login() {
		goto('/api/auth/twitter/login');
	}

	/**
	 * Signout twitter
	 */
	async function signout() {
		await signOut();
		invalidateAll();
	}
</script>

<!-- Site Container -->
<div>
	<!-- Auth -->
	{#if !$page.data._lucia.user}
		<!-- Login -->
		<button
			class="bg-slate-900 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 text-white font-semibold h-12 px-6 rounded-lg w-full flex items-center justify-center sm:w-auto dark:bg-sky-500 dark:highlight-white/20 dark:hover:bg-sky-400"
			on:click={login}>Login</button
		>
		<!-- xLogin -->
	{:else}
		<!-- Logout -->
		<button
			class="bg-slate-900 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 text-white font-semibold h-12 px-6 rounded-lg w-full flex items-center justify-center sm:w-auto dark:bg-sky-500 dark:highlight-white/20 dark:hover:bg-sky-400"
			on:click={signout}>Signout</button
		>
		<!-- xLogout -->
	{/if}
	<!-- xAuth -->
	<main>
		<slot />
	</main>
</div>
<!-- xSite Container -->

<style>
</style>
