/*
 * Simple interfaces for the api. Note that these are not complete and only cover the endpoints used in the app.
 */

interface ReadeckConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
}

interface ProfileResponse {
  user: {
    email: string;
    username: string;
  };
}

interface CreateBookmarkRequest {
  url: string;
  title?: string;
  labels?: string[];
}

interface CreateBookmarkResponse {
  bookmarkId: string;
}

interface GetBookmarkResponse {
  loaded: boolean;
}

interface LoginRequest {
  username: string;
  password: string;
  application: string;
}

interface LoginResponse {
  id: string;
  token: string;
}

class ReadeckApi {
  private baseUrl: string;
  private apiKey: string | undefined;
  private timeout: number;

  constructor(config: ReadeckConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 5000;
  }

  /**
   * Static method to login with username and password to get an API token
   * This doesn't require an existing instance since it's used to obtain the token
   * @param baseUrl The base URL of the Readeck server
   * @param username User's username
   * @param password User's password
   * @param application Application name for the token (optional)
   * @param timeout Request timeout in milliseconds (optional)
   * @returns Login response containing the token
   */
  static async login(
    baseUrl: string,
    username: string,
    password: string,
    application: string = 'Readeck Sharer',
    timeout: number = 5000
  ): Promise<LoginResponse> {
    const loginData: LoginRequest = {
      username,
      password,
      application,
    };

    const url = `${baseUrl.replace(/\/$/, '')}/api/auth`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(loginData),
        signal: AbortSignal.timeout(timeout),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Login Error: ${response.status} - ${errorText}`);
        throw new Error(`Login failed: ${response.status} - ${errorText || response.statusText}`);
      }

      const result: LoginResponse = await response.json();
      return result;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Login failed: ${error.message}`);
        throw new Error(`Login failed: ${error.message}`);
      }
      console.error('Unknown error occurred during login:', error);
      throw error;
    }
  }

  /**
   * Instance method to login with username and password to get an API token
   * Updates this instance's API key upon successful login
   * @param username User's username
   * @param password User's password
   * @param application Application name for the token (optional)
   * @returns Login response containing the token
   */
  async login(
    username: string,
    password: string,
    application: string = 'Readeck Sharer'
  ): Promise<LoginResponse> {
    const loginData: LoginRequest = {
      username,
      password,
      application,
    };

    const url = `${this.baseUrl}/api/auth`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(loginData),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Login Error: ${response.status} - ${errorText}`);
        throw new Error(`Login failed: ${response.status} - ${errorText || response.statusText}`);
      }

      const result: LoginResponse = await response.json();

      // Set the API key for future requests
      this.apiKey = result.token;

      return result;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Login failed: ${error.message}`);
        throw new Error(`Login failed: ${error.message}`);
      }
      console.error('Unknown error occurred during login:', error);
      throw error;
    }
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
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: AbortSignal.timeout(this.timeout),
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
  async createBookmark(bookmarkData: CreateBookmarkRequest): Promise<CreateBookmarkResponse> {
    const response = await this.request('/bookmarks', {
      method: 'POST',
      body: JSON.stringify(bookmarkData),
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
      bookmarkId,
    };
  }

  async getBookmark(bookmarkId: string): Promise<GetBookmarkResponse> {
    const response = await this.request(`/bookmarks/${bookmarkId}`);

    if (response.status !== 200) {
      throw new Error(`Failed to check bookmark: ${response.statusText}`);
    }

    const data: GetBookmarkResponse = await response.json();

    return data;
  }
}

export default ReadeckApi;
export type {
  ReadeckConfig,
  ProfileResponse,
  CreateBookmarkRequest,
  CreateBookmarkResponse,
  GetBookmarkResponse,
  LoginRequest,
  LoginResponse,
};
