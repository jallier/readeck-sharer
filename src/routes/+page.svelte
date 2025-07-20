<script lang="ts">
	import { SendIntent } from 'send-intent';

	SendIntent.checkSendIntentReceived()
		.then((result) => {
			if (result) {
				console.log('SendIntent received');
				console.log(JSON.stringify(result));
			}
			if (result.url) {
				console.log('URL received:', result.url);
				window.location.href = `/createBookmark?url=${encodeURIComponent(result.url)}`;
			}
		})
		.catch((err) => console.error('error checking send intent', err))
		.finally(() => {
      console.log('SendIntent check finished');
			// SendIntent.finish();
		});
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
