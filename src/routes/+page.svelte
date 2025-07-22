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
		});
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
	<div class="mx-auto max-w-lg w-full">
		<div class="rounded-xl bg-white p-8 shadow-lg border border-gray-100">
			<!-- Header Section -->
			<div class="text-center mb-8">
				<div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
					<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
					</svg>
				</div>
				<h1 class="text-3xl font-bold text-gray-900 mb-2">Readeck Sharer</h1>
				<p class="text-gray-600 text-lg">Share articles and links to your Readeck library</p>
			</div>

			<!-- Settings Button -->
			<div class="text-center">
				<a
					href="/settings"
					class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
				>
					<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
					Open Settings
				</a>
			</div>

			<!-- Status Info -->
			<div class="mt-6 pt-6 border-t border-gray-100 text-center">
				<p class="text-xs text-gray-500">Ready to receive shared content</p>
			</div>
		</div>
	</div>
</div>
