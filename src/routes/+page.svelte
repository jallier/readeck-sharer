<script lang="ts">
  import { SendIntent } from 'send-intent';
  import { getPreferences } from '../lib/preferences';

  SendIntent.checkSendIntentReceived()
    .then((result) => {
      if (result?.url) {
        console.log('URL received:', result.url);
        const queryObject = { url: result.url, title: result.title ?? '' };
        const queryString = new URLSearchParams(queryObject).toString();
        window.location.href = `/createBookmark?${queryString}`;
      }
    })
    .catch((err) => console.error('error checking send intent', err))
    .finally(() => {
      console.log('SendIntent check finished');
    });

  async function isReady() {
    try {
      await getPreferences();
      isReadyToUse = true;
    } catch (error) {
      console.error('Error loading preferences:', error);
      isReadyToUse = false;
    }
  }

  let isReadyToUse = $state(false);
  isReady();
</script>

<div
  class="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
>
  <div class="mx-auto w-full max-w-lg">
    <div class="rounded-xl border border-gray-100 bg-white p-8 shadow-lg">
      <!-- Header Section -->
      <div class="mb-8 text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
          <img
            src="/icon-only.png"
            alt="Readeck Sharer Icon"
            class="h-16 w-16 rounded-2xl shadow-lg"
          />
        </div>
        <h1 class="mb-2 text-3xl font-bold text-gray-900">Readeck Sharer</h1>
        <p class="text-lg text-gray-600">
          Share articles and links to your Readeck library via the share menu
        </p>
      </div>

      <!-- Settings Button -->
      <div class="text-center">
        <a
          href="/settings"
          class="inline-flex transform items-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-medium text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg"
        >
          <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Open Settings
        </a>
      </div>

      <!-- Status Info -->
      <div class="mt-6 border-t border-gray-100 pt-6 text-center">
        {#if isReadyToUse}
          <div
            class="animate-in fade-in slide-in-from-bottom-4 flex items-center justify-center space-x-2 duration-700"
          >
            <div
              class="h-3 w-3 animate-pulse rounded-full bg-green-500 shadow-lg ring-2 shadow-green-500/50 ring-green-200"
            ></div>
            <p
              class="animate-in slide-in-from-right-2 text-xs font-medium text-green-600 delay-200 duration-500"
            >
              Ready to receive shared content
            </p>
          </div>
        {:else}
          <div
            class="animate-in fade-in slide-in-from-bottom-4 flex items-center justify-center space-x-2 duration-700"
          >
            <div
              class="h-3 w-3 animate-ping rounded-full bg-orange-500 shadow-lg ring-2 shadow-orange-500/50 ring-orange-200"
            ></div>
            <p
              class="animate-in slide-in-from-right-2 text-xs font-medium text-orange-600 delay-200 duration-500"
            >
              Configuration required - Open Settings
            </p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
