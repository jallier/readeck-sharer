<script lang="ts">
	import { page } from '$app/state';
	import { Preferences } from '@capacitor/preferences';
	import { SendIntent } from 'send-intent';
	import ReadeckApi from '$lib/ReadeckApi';

	const url = page.url.searchParams.get('url') || '';
	const title = page.url.searchParams.get('title') || '';

	async function handleSave() {
		console.log('Save clicked! URL:', url, title);
		let serverUrl = '';
		let apiToken = '';
		const serverUrlResult = await Preferences.get({ key: 'serverUrl' });
		if (serverUrlResult.value) {
			serverUrl = serverUrlResult.value;
		}
		const apiTokenResult = await Preferences.get({ key: 'apiToken' });
		if (apiTokenResult.value) {
			apiToken = apiTokenResult.value;
		}

		if (!serverUrl || !apiToken) {
			alert('Please set your server URL and API token in settings.');
			return;
		}

		try {
			const api = new ReadeckApi({ baseUrl: serverUrl, apiKey: apiToken });
			const bookmarkData = { url, title };
			const response = await api.bookmark(bookmarkData);
			if (response) {
				alert('Bookmark saved successfully!');
				// window.location.href = '/';
				// Finish the intent, since we're done
				SendIntent.finish();
			} else {
				alert('Failed to save bookmark.');
			}
		} catch (error) {
			console.error('Error saving bookmark:', error);
			alert('An error occurred while saving the bookmark.');
		}
	}
</script>

<div class="min-h-screen bg-gray-50 p-4">
	<div class="mx-auto max-w-md">
		<div class="rounded-lg bg-white p-6 shadow-md">
			<h1 class="mb-6 text-2xl font-bold text-gray-900">Create Bookmark</h1>

			<div class="mb-6">
				<label for="url" class="mb-2 block text-sm font-medium text-gray-700">URL</label>
				<input
					id="url"
					type="url"
					value={url}
					readonly
					class="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-600"
					placeholder="No URL provided"
				/>
			</div>

			<button
				on:click={handleSave}
				class="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
				disabled={!url}
			>
				Save
			</button>
		</div>
	</div>
</div>
