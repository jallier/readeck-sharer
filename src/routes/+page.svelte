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
				const queryObject = { url: result.url, title: result.title ?? '' };
				const queryString = new URLSearchParams(queryObject).toString();
				window.location.href = `/createBookmark?${queryString}`;
			}
		})
		.catch((err) => console.error('error checking send intent', err))
		.finally(() => {
			console.log('SendIntent check finished');
			// SendIntent.finish();
		});
</script>

<div class="min-h-screen bg-gray-50 p-4">
	<div class="mx-auto max-w-md">
		<div class="rounded-lg bg-white p-6 shadow-md">
			<div class="h1">Readeck Sharer</div>
			<a
				href="/settings"
				class="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
			>
				Go to Settings
			</a>
		</div>
	</div>
</div>
