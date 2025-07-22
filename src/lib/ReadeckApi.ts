interface ReadeckConfig {
	baseUrl: string;
	apiKey: string;
	timeout?: number;
}

interface ProfileResponse {
	user: {
		email: string;
		username: string;
	};
}

interface BookmarkRequest {
	url: string;
	title?: string;
	labels?: string[];
}

type BookmarkResponse =
	| {
			message: string;
			status: number;
	  }
	| {
			bookmarkId: string;
	  };

class ReadeckApi {
	private baseUrl: string;
	private apiKey: string;
	private timeout: number;

	constructor(config: ReadeckConfig) {
		this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
		this.apiKey = config.apiKey;
		this.timeout = config.timeout || 5000;
	}

	/**
	 * Makes an HTTP request to the Readeck API.
	 * We return the raw response object to allow the caller access to the headers, as Readeck API uses headers to return data in some cases
	 * @param endpoint API endpoint to request
	 * @param options Fetch API options
	 * @returns Response object
	 */
	private async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
		const url = `${this.baseUrl}/api${endpoint}`;
		const headers = {
			'Content-Type': 'application/json',
			...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
			...options.headers
		};

		try {
			const response = await fetch(url, {
				...options,
				headers,
				signal: AbortSignal.timeout(this.timeout)
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error(`API Error: ${response.status} - ${errorText}`);
				throw new Error(`API Error: ${response.status} - ${errorText || response.statusText}`);
			}

			return await response;
		} catch (error) {
			if (error instanceof Error) {
				console.error(`Request failed: ${error.message}`);
				throw new Error(`Request failed: ${error.message}`);
			}
			console.error('Unknown error occurred during request:', error);
			throw error;
		}
	}

	/**
	 * Get the users profile
	 * @returns User profile information
	 */
	async profile(): Promise<ProfileResponse> {
		return (await this.request('/profile', { method: 'GET' })).json();
	}

	/**
	 * Create a new bookmark
	 * @param bookmarkData Data for the bookmark to create
	 * @returns BookmarkResponse containing the bookmark ID or an error message
	 */
	async bookmark(bookmarkData: BookmarkRequest): Promise<BookmarkResponse> {
		const response = await this.request('/bookmarks', {
			method: 'POST',
			body: JSON.stringify(bookmarkData)
		});

		if (response.status < 200 || response.status >= 300) {
			const result = await response.json();
			throw new Error(`Failed to create bookmark: ${result.message}`);
		}

		const bookmarkId = response.headers.get('Bookmark-Id');
		if (!bookmarkId) {
			throw new Error('Bookmark-Id header not found in response');
		}

		return {
			bookmarkId
		};
	}
}

export default ReadeckApi;
export type { ReadeckConfig, ProfileResponse, BookmarkRequest, BookmarkResponse };
