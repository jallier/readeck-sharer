<script lang="ts">
	import { Preferences } from '@capacitor/preferences';

	let apiToken = $state('');
	let isLoading = $state(false);
	let saveStatus = $state('');

	// Load the saved API token when component mounts
	$effect(() => {
		loadApiToken();
	});

	async function loadApiToken() {
		try {
			const result = await Preferences.get({ key: 'apiToken' });
			if (result.value) {
				apiToken = result.value;
			}
		} catch (error) {
			console.error('Error loading API token:', error);
		}
	}

	async function saveApiToken() {
		if (!apiToken.trim()) {
			saveStatus = 'error';
			setTimeout(() => saveStatus = '', 3000);
			return;
		}

		isLoading = true;
		saveStatus = '';

		try {
			await Preferences.set({
				key: 'apiToken',
				value: apiToken.trim()
			});
			
			saveStatus = 'success';
			console.log('API token saved successfully');
		} catch (error) {
			console.error('Error saving API token:', error);
			saveStatus = 'error';
		} finally {
			isLoading = false;
			// Clear status after 3 seconds
			setTimeout(() => saveStatus = '', 3000);
		}
	}

	async function clearApiToken() {
		isLoading = true;
		
		try {
			await Preferences.remove({ key: 'apiToken' });
			apiToken = '';
			saveStatus = 'cleared';
			console.log('API token cleared');
		} catch (error) {
			console.error('Error clearing API token:', error);
			saveStatus = 'error';
		} finally {
			isLoading = false;
			setTimeout(() => saveStatus = '', 3000);
		}
	}
</script>

<div class="min-h-screen bg-gray-50 p-4">
	<div class="mx-auto max-w-md">
		<div class="rounded-lg bg-white p-6 shadow-md">
			<h1 class="mb-6 text-2xl font-bold text-gray-900">Settings</h1>
			
			<div class="mb-6">
				<label for="apiToken" class="mb-2 block text-sm font-medium text-gray-700">
					API Token
				</label>
				<input
					id="apiToken"
					type="password"
					bind:value={apiToken}
					placeholder="Enter your API token"
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
					disabled={isLoading}
				/>
				<p class="mt-1 text-xs text-gray-500">
					Your API token will be stored securely on this device
				</p>
			</div>

			{#if saveStatus === 'success'}
				<div class="mb-4 rounded-md bg-green-50 p-3">
					<p class="text-sm text-green-700">✓ API token saved successfully</p>
				</div>
			{:else if saveStatus === 'cleared'}
				<div class="mb-4 rounded-md bg-blue-50 p-3">
					<p class="text-sm text-blue-700">✓ API token cleared</p>
				</div>
			{:else if saveStatus === 'error'}
				<div class="mb-4 rounded-md bg-red-50 p-3">
					<p class="text-sm text-red-700">✗ Please enter a valid API token</p>
				</div>
			{/if}

			<div class="flex gap-3">
				<button
					onclick={saveApiToken}
					disabled={isLoading || !apiToken.trim()}
					class="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{isLoading ? 'Saving...' : 'Save Token'}
				</button>

				<button
					onclick={clearApiToken}
					disabled={isLoading || !apiToken}
					class="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				>
					Clear
				</button>
			</div>
		</div>

		<div class="mt-6 rounded-lg bg-white p-6 shadow-md">
			<h2 class="mb-4 text-lg font-semibold text-gray-900">About</h2>
			<p class="text-sm text-gray-600">
				This app allows you to share links and save them as bookmarks. 
				Configure your API token above to start saving bookmarks to your service.
			</p>
		</div>
	</div>
</div>
