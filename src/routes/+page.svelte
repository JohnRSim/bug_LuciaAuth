<script lang="ts">
	import { signOut, getUser } from '@lucia-auth/sveltekit/client';
	import { invalidateAll } from '$app/navigation';
	const user = getUser();

	
	async function postTest() {
		console.log('[getMore]');
		
		const response = await fetch(`/api/requests/getUserTimeline`, {
			method: 'POST',
			body: JSON.stringify({
				username: 'test',
			}),
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
	on:click={postTest}>Post Test</button
>
