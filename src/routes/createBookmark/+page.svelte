<script lang="ts">
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  import { SendIntent } from 'send-intent';
  import { App } from '@capacitor/app';
  import type { PluginListenerHandle } from '@capacitor/core';
  import ReadeckApi from '$lib/ReadeckApi';
  import { getPreferences } from '$lib/preferences';

  type SaveState = 'ready' | 'saving' | 'saved' | 'done';

  let url = $state(page.url.searchParams.get('url') || '');
  let title = $state(page.url.searchParams.get('title') || '');

  let saveState = $state<SaveState>('ready');
  let hasCredentials = $state<boolean | null>(null); // null = checking, true = has creds, false = missing creds
  let countdown = $state(3); // Countdown timer for when done
  let waitForScrape = $state(true); // Default to true, will be loaded from preferences

  function handleBack() {
    // If we're in the middle of saving, don't allow going back
    if (saveState === 'saving' || saveState === 'saved') {
      return;
    }

    // If we go back from this screen, we should just kill the app since you can only get here from the share intent
    App.exitApp();
  }

  async function checkCredentials() {
    try {
      const preferences = await getPreferences();
      const { serverUrl, apiToken } = preferences;
      waitForScrape = preferences.waitForScrape ?? true;
      hasCredentials = !!(serverUrl && apiToken);
    } catch (error) {
      console.error('Error checking credentials:', error);
      hasCredentials = false;
    }
  }

  // Handle hardware back button on Android
  onMount(() => {
    let backButtonListener: PluginListenerHandle | null = null;

    const setupListener = async () => {
      backButtonListener = await App.addListener('backButton', () => {
        handleBack();
      });
    };

    setupListener();
    checkCredentials(); // Check if user has saved their credentials

    // Cleanup listener on component destroy
    return () => {
      if (backButtonListener) {
        backButtonListener.remove();
      }
    };
  });

  async function handleSave() {
    console.log('Save clicked! URL:', url, title);
    saveState = 'saving';

    try {
      const preferences = await getPreferences();
      const { serverUrl, apiToken, waitForScrape } = preferences;

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

        if (waitForScrape) {
          // Wait for scraping to complete (current behavior)
          const checkBookmarkLoaded = async (): Promise<void> => {
            const bookmarkResponse = await api.getBookmark(response.bookmarkId);
            if (bookmarkResponse.loaded === false) {
              // Wait 1 second before checking again
              setTimeout(() => checkBookmarkLoaded(), 1000);
            } else {
              saveState = 'done';
              // Start countdown and finish the intent when it reaches 0
              countdown = 3;
              const countdownInterval = setInterval(() => {
                countdown--;
                if (countdown <= 0) {
                  clearInterval(countdownInterval);
                  SendIntent.finish();
                }
              }, 1000);
            }
          };

          // Start checking
          checkBookmarkLoaded();
        } else {
          // Return immediately without waiting for scraping
          saveState = 'done';
          countdown = 3;
          const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown <= 0) {
              clearInterval(countdownInterval);
              SendIntent.finish();
            }
          }, 1000);
        }
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
      <!-- Header with back button -->
      <div class="mb-6 flex items-center">
        <button
          onclick={handleBack}
          class="mr-3 flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          disabled={saveState === 'saving' || saveState === 'saved'}
          aria-label="Go back"
          title="Go back"
        >
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h1 class="text-2xl font-bold text-gray-900">Create Bookmark</h1>
      </div>

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

      <!-- Credentials Warning -->
      {#if hasCredentials === null}
        <div class="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div class="flex items-center space-x-3">
            <div
              class="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"
            ></div>
            <span class="text-sm text-gray-600">Checking connection...</span>
          </div>
        </div>
      {:else if hasCredentials === false}
        <div class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <div class="flex items-start space-x-3">
            <div class="flex h-5 w-5 items-center justify-center rounded-full bg-red-100">
              <svg class="h-3 w-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-sm font-medium text-red-800">Readeck Not Connected</h3>
              <p class="mt-1 text-xs text-red-700">
                You need to configure your Readeck server URL and API token before you can save
                bookmarks. Please open the main app and go to Settings to connect to your Readeck
                instance.
              </p>
            </div>
          </div>
        </div>
      {/if}

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
              {#if waitForScrape}
                <div class="h-4 w-4 animate-pulse rounded-full bg-orange-500"></div>
                <span class="text-sm text-blue-700">Processing content...</span>
              {:else}
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
                <span class="text-sm text-green-700">Bookmark saved!</span>
              {/if}
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
                Bookmark saved successfully! Page will close in {countdown}s
              </span>
            {/if}
          </div>
        </div>
      {/if}

      <button
        onclick={handleSave}
        class="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!url || saveState !== 'ready' || hasCredentials !== true}
      >
        {#if hasCredentials === null}
          Checking...
        {:else if hasCredentials === false}
          Setup Required
        {:else if saveState === 'ready'}
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
