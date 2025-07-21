<script lang="ts">
	import { Preferences } from '@capacitor/preferences';
	import ReadeckApi from '$lib/ReadeckApi';

	type SaveStatus = 'success' | 'error' | 'cleared' | 'network-error' | '';

	let apiToken = $state('');
	let serverUrl = $state('');
	let isLoading = $state(false);
	let saveStatus = $state<SaveStatus>('');

	// Load the saved API token when component mounts
	$effect(() => {
		loadApiToken();
	});

	async function loadApiToken() {
		try {
			const serverUrlResult = await Preferences.get({ key: 'serverUrl' });
			if (serverUrlResult.value) {
				serverUrl = serverUrlResult.value;
			}
			const apiTokenResult = await Preferences.get({ key: 'apiToken' });
			if (apiTokenResult.value) {
				apiToken = apiTokenResult.value;
			}
		} catch (error) {
			console.error('Error loading API token:', error);
		}
	}

	async function checkCredentials(serverUrl: string, apiToken: string): Promise<boolean> {
		isLoading = true;
		saveStatus = '';

		try {
			const api = new ReadeckApi({ baseUrl: serverUrl, apiKey: apiToken });
			const result = await api.profile();

			if (result) {
				saveStatus = 'success';
				console.log('Credentials are valid');
			} else {
				saveStatus = 'error';
			}
		} catch (error) {
			console.error('Error checking credentials:', error);
			saveStatus = 'error';
			return false;
		} finally {
			isLoading = false;
		}
		return true;
	}

	async function saveSettings() {
		if (!apiToken.trim()) {
			saveStatus = 'error';
			setTimeout(() => (saveStatus = ''), 3000);
			return;
		}

		if (!serverUrl.trim()) {
			saveStatus = 'error';
			setTimeout(() => (saveStatus = ''), 3000);
			return;
		}

		isLoading = true;
		saveStatus = '';

		// Check credentials before saving
		const isValid = await checkCredentials(serverUrl, apiToken);
		if (!isValid) {
			saveStatus = 'network-error';
			isLoading = false;
			return;
		}

		try {
			await Preferences.set({
				key: 'apiToken',
				value: apiToken.trim()
			});

			await Preferences.set({
				key: 'serverUrl',
				value: serverUrl.trim()
			});

			saveStatus = 'success';
			console.log('API token and URL saved successfully');
		} catch (error) {
			console.error('Error saving settings:', error);
			saveStatus = 'error';
		} finally {
			isLoading = false;
			// Clear status after 3 seconds
			setTimeout(() => (saveStatus = ''), 3000);
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
			setTimeout(() => (saveStatus = ''), 3000);
		}
	}
</script>

<div class="min-h-screen bg-gray-50 p-4">
	<div class="mx-auto max-w-md">
		<div class="rounded-lg bg-white p-6 shadow-md">
			<h1 class="mb-6 text-2xl font-bold text-gray-900">Settings</h1>

			<div class="mb-6">
				<label for="serverUrl" class="mb-2 block text-sm font-medium text-gray-700">
					Server URL
				</label>
				<input
					id="serverUrl"
					type="url"
					bind:value={serverUrl}
					placeholder="Enter your server URL"
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
					disabled={isLoading}
				/>
			</div>

			<div class="mb-6">
				<label for="apiToken" class="mb-2 block text-sm font-medium text-gray-700">
					API Token
				</label>
				<input
					id="apiToken"
					type="password"
					bind:value={apiToken}
					placeholder="Enter your API token"
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
					disabled={isLoading}
				/>
			</div>

			{#if saveStatus === 'success'}
				<div class="mb-4 rounded-md bg-green-50 p-3">
					<p class="text-sm text-green-700">✓ Settings saved successfully</p>
				</div>
			{:else if saveStatus === 'cleared'}
				<div class="mb-4 rounded-md bg-blue-50 p-3">
					<p class="text-sm text-blue-700">✓ API token cleared</p>
				</div>
			{:else if saveStatus === 'error'}
				<div class="mb-4 rounded-md bg-red-50 p-3">
					<p class="text-sm text-red-700">✗ Please enter valid details</p>
				</div>
			{:else if saveStatus === 'network-error'}
				<div class="mb-4 rounded-md bg-red-50 p-3">
					<p class="text-sm text-red-700">
						✗ Could not connect to readeck instance, please check credentials
					</p>
				</div>
			{/if}

			<div class="flex gap-3">
				<button
					onclick={saveSettings}
					disabled={isLoading || !apiToken.trim() || !serverUrl.trim()}
					class="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
				>
					{isLoading ? 'Saving...' : 'Save'}
				</button>

				<button
					onclick={clearApiToken}
					disabled={isLoading || !apiToken}
					class="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
				>
					Clear
				</button>
			</div>
		</div>

		<div class="mt-6 rounded-lg bg-white p-6 shadow-md">
			<h2 class="mb-4 text-lg font-semibold text-gray-900">About</h2>
			<p class="text-sm text-gray-600">
				This app allows you to share links and save them as bookmarks. Configure your API token
				above to start saving bookmarks to your service.
			</p>
		</div>
	</div>
</div>
