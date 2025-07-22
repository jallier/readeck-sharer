<script lang="ts">
	import { page } from '$app/state';
	import { SendIntent } from 'send-intent';
	import ReadeckApi from '$lib/ReadeckApi';
	import { getPreferences } from '$lib/preferences';

	type SaveState = 'ready' | 'saving' | 'saved' | 'done';

	let url = $state(page.url.searchParams.get('url') || '');
	let title = $state(page.url.searchParams.get('title') || '');

	let saveState = $state<SaveState>('ready');

	async function handleSave() {
		console.log('Save clicked! URL:', url, title);
		saveState = 'saving';

		try {
			const { serverUrl, apiToken } = await getPreferences();

			if (!serverUrl || !apiToken) {
				alert('Please set your server URL and API token in settings.');
				saveState = 'ready';
				return;
			}

			const api = new ReadeckApi({ baseUrl: serverUrl, apiKey: apiToken });
			const bookmarkData = { url, title };
			const response = await api.createBookmark(bookmarkData);
			if (response) {
				saveState = 'saved';

				// Check the bookmark loading state with delay
				const checkBookmarkLoaded = async (): Promise<void> => {
					const bookmarkResponse = await api.getBookmark(response.bookmarkId);
					if (bookmarkResponse.loaded === false) {
						// Wait 1 second before checking again
						setTimeout(() => checkBookmarkLoaded(), 1000);
					} else {
						saveState = 'done';
						// Finish the intent, since we're done
						setTimeout(() => {
							SendIntent.finish();
						}, 3000);
					}
				};

				// Start checking
				checkBookmarkLoaded();
			} else {
				alert('Failed to save bookmark.');
				saveState = 'ready';
			}
		} catch (error) {
			console.error('Error saving bookmark:', error);
			alert('An error occurred while saving the bookmark.');
			saveState = 'ready';
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
					bind:value={url}
					readonly
					class="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-600"
					placeholder="No URL provided"
				/>
			</div>

			<div class="mb-6">
				<label for="title" class="mb-2 block text-sm font-medium text-gray-700">Title</label>
				<input
					id="title"
					type="text"
					bind:value={title}
					class="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-600"
					placeholder="No title provided"
				/>
			</div>

			<!-- Progress Section -->
			{#if saveState !== 'ready'}
				<div class="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
					<!-- Progress Bar -->
					<div class="mb-3">
						<div class="mb-1 flex justify-between text-sm font-medium text-blue-700">
							<span>Progress</span>
							<span>
								{#if saveState === 'saving'}
									25%
								{:else if saveState === 'saved'}
									75%
								{:else if saveState === 'done'}
									100%
								{/if}
							</span>
						</div>
						<div class="h-2 w-full rounded-full bg-blue-200">
							<div
								class="h-2 rounded-full bg-blue-600 transition-all duration-500 ease-in-out"
								style="width: {saveState === 'saving'
									? '25%'
									: saveState === 'saved'
										? '75%'
										: '100%'}"
							></div>
						</div>
					</div>

					<!-- Status Message -->
					<div class="flex items-center space-x-2">
						{#if saveState === 'saving'}
							<div
								class="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"
							></div>
							<span class="text-sm text-blue-700">Saving bookmark...</span>
						{:else if saveState === 'saved'}
							<div class="h-4 w-4 animate-pulse rounded-full bg-orange-500"></div>
							<span class="text-sm text-blue-700">Processing content...</span>
						{:else if saveState === 'done'}
							<div class="flex h-4 w-4 items-center justify-center rounded-full bg-green-500">
								<svg
									class="h-3 w-3 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="3"
										d="M5 13l4 4L19 7"
									/>
								</svg>
							</div>
							<span class="text-sm font-medium text-green-700">
								Bookmark saved successfully! Page will close in 3s
							</span>
						{/if}
					</div>
				</div>
			{/if}

			<button
				onclick={handleSave}
				class="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
				disabled={!url || saveState !== 'ready'}
			>
				{#if saveState === 'ready'}
					Save Bookmark
				{:else if saveState === 'saving'}
					Saving...
				{:else if saveState === 'saved'}
					Processing...
				{:else if saveState === 'done'}
					Completed!
				{/if}
			</button>
		</div>
	</div>
</div>
