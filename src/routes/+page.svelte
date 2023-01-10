<script lang="ts">
	import { signOut, getUser } from '@lucia-auth/sveltekit/client';
	import { invalidateAll } from '$app/navigation';
	const user = getUser();

	
	async function postTest() {
		console.log('[getMore]');
		
		const response = await fetch(`/api/requests/post`, {
			method: 'POST',
			body: JSON.stringify({
				username: 'test',
			}),
		});
		let res = await response.json();
		console.log('res', res);
	}
	
	async function getTest() {
		console.log('[getMore]');
		
		const response = await fetch(`/api/requests/get`, {
			method: 'GET'
		});
		let res = await response.json();
		console.log('res', res);
	}
</script>

<p>This page is protected and can only be accessed by authenticated users.</p>
<pre class="code">
{JSON.stringify($user, null, 2)}
</pre>

<button
	class="bg-slate-900 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 text-white font-semibold h-12 px-6 rounded-lg w-full flex items-center justify-center sm:w-auto dark:bg-sky-500 dark:highlight-white/20 dark:hover:bg-sky-400"
	on:click={postTest}>Post Test</button
>


<button
	class="bg-slate-900 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 text-white font-semibold h-12 px-6 rounded-lg w-full flex items-center justify-center sm:w-auto dark:bg-sky-500 dark:highlight-white/20 dark:hover:bg-sky-400"
	on:click={getTest}>GET Test</button
>
