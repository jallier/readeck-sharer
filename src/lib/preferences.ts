import { Preferences } from '@capacitor/preferences';

export interface UserPreferences {
	serverUrl: string;
	apiToken: string;
	// Optional fields for username/password login
	username?: string;
	password?: string;
	authMethod?: 'token' | 'credentials';
	// Bookmark creation behavior
	waitForScrape?: boolean; // true = wait for scraping, false = immediate return
}

/**
 * Get the user's preferences for server URL and API token.
 * This function retrieves the preferences from Capacitor's storage.
 * @returns UserPreferences object containing server URL and API token
 * @throws Error if preferences are not set
 */
export async function getPreferences(): Promise<UserPreferences> {
	const serverUrlResult = Preferences.get({ key: 'serverUrl' });
	const apiTokenResult = Preferences.get({ key: 'apiToken' });
	const usernameResult = Preferences.get({ key: 'username' });
	const passwordResult = Preferences.get({ key: 'password' });
	const authMethodResult = Preferences.get({ key: 'authMethod' });
	const waitForScrapeResult = Preferences.get({ key: 'waitForScrape' });
	
	const [serverUrl, apiToken, username, password, authMethod, waitForScrape] = await Promise.all([
		serverUrlResult, 
		apiTokenResult, 
		usernameResult, 
		passwordResult, 
		authMethodResult,
		waitForScrapeResult
	]);
	
	if (!serverUrl.value || !apiToken.value) {
		throw new Error('Preferences not set. Please configure the server URL and API token.');
	}

	return {
		serverUrl: serverUrl.value,
		apiToken: apiToken.value,
		username: username.value || undefined,
		password: password.value || undefined,
		authMethod: (authMethod.value as 'token' | 'credentials') || 'token',
		waitForScrape: waitForScrape.value !== null ? waitForScrape.value === 'true' : true // Default to true
	};
}

/**
 * Set the user's preferences for server URL and API token.
 * @param preferences Object containing server URL, API token, and optional credentials
 * @returns Promise that resolves when preferences are set
 */
export async function setPreferences(preferences: UserPreferences): Promise<void> {
	const promises = [
		Preferences.set({ key: 'serverUrl', value: preferences.serverUrl }),
		Preferences.set({ key: 'apiToken', value: preferences.apiToken }),
		Preferences.set({ key: 'authMethod', value: preferences.authMethod || 'token' }),
		Preferences.set({ key: 'waitForScrape', value: String(preferences.waitForScrape ?? true) })
	];

	// Only store username/password if provided and using credentials auth method
	if (preferences.authMethod === 'credentials' && preferences.username && preferences.password) {
		promises.push(
			Preferences.set({ key: 'username', value: preferences.username }),
			Preferences.set({ key: 'password', value: preferences.password })
		);
	} else {
		// Clear stored credentials if switching to token-only auth
		promises.push(Preferences.remove({ key: 'username' }), Preferences.remove({ key: 'password' }));
	}

	await Promise.all(promises);
}
