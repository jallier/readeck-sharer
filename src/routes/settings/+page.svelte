<script lang="ts">
	import { Preferences } from '@capacitor/preferences';
	import ReadeckApi from '$lib/ReadeckApi';
	import { getPreferences, setPreferences, type UserPreferences } from '$lib/preferences';

	type SaveStatus = 'success' | 'error' | 'cleared' | 'network-error' | 'login-error' | '';
	type AuthMethod = 'token' | 'credentials';

	let authMethod = $state<AuthMethod>('token');
	let apiToken = $state('');
	let serverUrl = $state('');
	let username = $state('');
	let password = $state('');
	let isLoading = $state(false);
	let saveStatus = $state<SaveStatus>('');

	// Load the saved preferences when component mounts
	loadPreferences();

	async function loadPreferences() {
		try {
			const preferences = await getPreferences();
			apiToken = preferences.apiToken;
			serverUrl = preferences.serverUrl;
			username = preferences.username || '';
			password = preferences.password || '';
			authMethod = preferences.authMethod || 'token';
		} catch (error) {
			console.error('Error loading preferences:', error);
		}
	}

	async function checkCredentials(serverUrl: string, apiToken: string): Promise<boolean> {
		try {
			const api = new ReadeckApi({ baseUrl: serverUrl, apiKey: apiToken });
			const result = await api.profile();
			return !!result;
		} catch (error) {
			console.error('Error checking credentials:', error);
			return false;
		}
	}

	/**
	 * Handle login with username and password to get an API token instead of using the token directly.
	 * @param serverUrl
	 * @param username
	 * @param password
	 */
	async function loginWithCredentials(
		serverUrl: string,
		username: string,
		password: string
	): Promise<string | null> {
		try {
			const loginResult = await ReadeckApi.login(serverUrl, username, password);
			return loginResult.token;
		} catch (error) {
			console.error('Error logging in:', error);
			return null;
		}
	}

	async function saveSettings() {
		if (!serverUrl.trim()) {
			saveStatus = 'error';
			setTimeout(() => (saveStatus = ''), 3000);
			return;
		}

		isLoading = true;
		saveStatus = '';

		let finalToken = apiToken;

		try {
			if (authMethod === 'credentials') {
				if (!username.trim() || !password.trim()) {
					saveStatus = 'error';
					isLoading = false;
					setTimeout(() => (saveStatus = ''), 3000);
					return;
				}

				// Login to get token
				const token = await loginWithCredentials(serverUrl, username, password);
				if (!token) {
					saveStatus = 'login-error';
					isLoading = false;
					setTimeout(() => (saveStatus = ''), 3000);
					return;
				}
				finalToken = token;
			} else {
				// Token method
				if (!apiToken.trim()) {
					saveStatus = 'error';
					isLoading = false;
					setTimeout(() => (saveStatus = ''), 3000);
					return;
				}
			}

			// Verify the token works
			const isValid = await checkCredentials(serverUrl, finalToken);
			if (!isValid) {
				saveStatus = 'network-error';
				isLoading = false;
				setTimeout(() => (saveStatus = ''), 3000);
				return;
			}

			// Save preferences
			const preferences: UserPreferences = {
				serverUrl: serverUrl.trim(),
				apiToken: finalToken,
				authMethod,
				...(authMethod === 'credentials' && {
					username: username.trim(),
					password: password.trim()
				})
			};

			await setPreferences(preferences);

			// Update the token field if we got it from login
			if (authMethod === 'credentials') {
				apiToken = finalToken;
			}

			saveStatus = 'success';
			console.log('Settings saved successfully');
		} catch (error) {
			console.error('Error saving settings:', error);
			saveStatus = 'error';
		} finally {
			isLoading = false;
			setTimeout(() => (saveStatus = ''), 3000);
		}
	}

	async function clearSettings() {
		isLoading = true;

		try {
			await Promise.all([
				Preferences.remove({ key: 'apiToken' }),
				Preferences.remove({ key: 'username' }),
				Preferences.remove({ key: 'password' }),
				Preferences.remove({ key: 'authMethod' })
			]);

			apiToken = '';
			username = '';
			password = '';
			authMethod = 'token';
			saveStatus = 'cleared';
			console.log('Settings cleared');
		} catch (error) {
			console.error('Error clearing settings:', error);
			saveStatus = 'error';
		} finally {
			isLoading = false;
			setTimeout(() => (saveStatus = ''), 3000);
		}
	}

	function switchAuthMethod(method: AuthMethod) {
		authMethod = method;
		saveStatus = '';
	}
</script>

<div class="min-h-screen bg-gray-50 p-4">
	<div class="mx-auto max-w-md">
		<div class="rounded-lg bg-white p-6 shadow-md">
			<h1 class="mb-6 text-2xl font-bold text-gray-900">Settings</h1>

			<!-- Server URL -->
			<div class="mb-6">
				<label for="serverUrl" class="mb-2 block text-sm font-medium text-gray-700">
					Server URL
				</label>
				<input
					id="serverUrl"
					type="url"
					bind:value={serverUrl}
					placeholder="https://your-readeck-server.com"
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
					disabled={isLoading}
				/>
			</div>

			<!-- Authentication Method Selector -->
			<div class="mb-6">
				<fieldset>
					<legend class="mb-3 block text-sm font-medium text-gray-700">
						Authentication Method
					</legend>
					<div class="flex space-x-1 rounded-lg bg-gray-100 p-1">
						<button
							type="button"
							onclick={() => switchAuthMethod('credentials')}
							class="flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors {authMethod ===
							'credentials'
								? 'bg-white text-gray-900 shadow-sm'
								: 'text-gray-500 hover:text-gray-700'}"
							disabled={isLoading}
						>
							Username/Password
						</button>
						<button
							type="button"
							onclick={() => switchAuthMethod('token')}
							class="flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors {authMethod ===
							'token'
								? 'bg-white text-gray-900 shadow-sm'
								: 'text-gray-500 hover:text-gray-700'}"
							disabled={isLoading}
						>
							API Token
						</button>
					</div>
				</fieldset>
			</div>

			{#if authMethod === 'credentials'}
				<!-- Username/Password Fields -->
				<div class="mb-4">
					<label for="username" class="mb-2 block text-sm font-medium text-gray-700">
						Username
					</label>
					<input
						id="username"
						type="text"
						bind:value={username}
						placeholder="Enter your username"
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
						disabled={isLoading}
					/>
				</div>
				<div class="mb-6">
					<label for="password" class="mb-2 block text-sm font-medium text-gray-700">
						Password
					</label>
					<input
						id="password"
						type="password"
						bind:value={password}
						placeholder="Enter your password"
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
						disabled={isLoading}
					/>
				</div>

				{#if apiToken}
					<!-- Show the token that will be used (read-only) -->
					<div class="mb-6">
						<label for="generatedToken" class="mb-2 block text-sm font-medium text-gray-700">
							Generated API Token
							<span class="text-xs text-gray-500">(automatically generated from login)</span>
						</label>
						<input
							id="generatedToken"
							type="text"
							value={apiToken}
							readonly
							class="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600"
						/>
					</div>
				{/if}
			{:else}
				<!-- Direct API Token Field -->
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
					<p class="mt-1 text-xs text-gray-500">
						You can find your API token in your Readeck account settings.
					</p>
				</div>
			{/if}

			<!-- Status Messages -->
			{#if saveStatus === 'success'}
				<div class="mb-4 rounded-md bg-green-50 p-3">
					<p class="text-sm text-green-700">✓ Settings saved successfully</p>
				</div>
			{:else if saveStatus === 'cleared'}
				<div class="mb-4 rounded-md bg-blue-50 p-3">
					<p class="text-sm text-blue-700">✓ Settings cleared</p>
				</div>
			{:else if saveStatus === 'error'}
				<div class="mb-4 rounded-md bg-red-50 p-3">
					<p class="text-sm text-red-700">✗ Please fill in all required fields</p>
				</div>
			{:else if saveStatus === 'login-error'}
				<div class="mb-4 rounded-md bg-red-50 p-3">
					<p class="text-sm text-red-700">
						✗ Login failed. Please check your username and password
					</p>
				</div>
			{:else if saveStatus === 'network-error'}
				<div class="mb-4 rounded-md bg-red-50 p-3">
					<p class="text-sm text-red-700">
						✗ Could not connect to Readeck instance. Please check your server URL and credentials
					</p>
				</div>
			{/if}

			<!-- Action Buttons -->
			<div class="flex gap-3">
				<button
					onclick={saveSettings}
					disabled={isLoading ||
						!serverUrl.trim() ||
						(authMethod === 'token' && !apiToken.trim()) ||
						(authMethod === 'credentials' && (!username.trim() || !password.trim()))}
					class="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
				>
					{#if isLoading}
						{authMethod === 'credentials' ? 'Logging in...' : 'Saving...'}
					{:else}
						Save Settings
					{/if}
				</button>

				<button
					onclick={clearSettings}
					disabled={isLoading}
					class="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
				>
					Clear
				</button>
			</div>
		</div>

		<div class="mt-6 rounded-lg bg-white p-6 shadow-md">
			<h2 class="mb-4 text-lg font-semibold text-gray-900">About</h2>
			<p class="text-sm text-gray-600">
				You can authenticate using either your username and password, or by
				entering an API token directly.
			</p>
			{#if authMethod === 'credentials'}
				<p class="mt-2 text-sm text-gray-600">
					<strong>Username/Password:</strong> Your credentials will be used to generate an API token
					automatically. The token will be stored locally for future use.
				</p>
			{:else}
				<p class="mt-2 text-sm text-gray-600">
					<strong>API Token:</strong> You can find your API token in your Readeck account settings under
					the API section.
				</p>
			{/if}
		</div>
	</div>
</div>
