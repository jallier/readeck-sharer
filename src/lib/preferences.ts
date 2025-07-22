import { Preferences } from '@capacitor/preferences';

export interface Preferences {
	serverUrl: string;
	apiToken: string;
}

/**
 * Get the user's preferences for server URL and API token.
 * This function retrieves the preferences from Capacitor's storage.
 * @returns Preferences object containing server URL and API token
 * @throws Error if preferences are not set
 */
export async function getPreferences(): Promise<Preferences> {
	const serverUrlResult = Preferences.get({ key: 'serverUrl' });
	const apiTokenResult = Preferences.get({ key: 'apiToken' });
	const [serverUrl, apiToken] = await Promise.all([serverUrlResult, apiTokenResult]);
	if (!serverUrl.value || !apiToken.value) {
		throw new Error('Preferences not set. Please configure the server URL and API token.');
	}

	return {
		serverUrl: serverUrl.value,
		apiToken: apiToken.value
	};
}

/**
 * Set the user's preferences for server URL and API token.
 * @param param0 Object containing server URL and API token
 * @returns Promise that resolves when preferences are set
 */
export async function setPreferences({ serverUrl, apiToken }: Preferences): Promise<void> {
	await Promise.all([
		Preferences.set({ key: 'serverUrl', value: serverUrl }),
		Preferences.set({ key: 'apiToken', value: apiToken })
	]);
}
