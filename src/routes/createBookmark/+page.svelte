<script lang="ts">
	import { page } from '$app/state';

  const url = page.url.searchParams.get('url') || '';

	function handleSave() {
		console.log('Save clicked! URL:', url);
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
					value={url}
					readonly
					class="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-600"
					placeholder="No URL provided"
				/>
			</div>

			<button
				on:click={handleSave}
				class="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				disabled={!url}
			>
				Save
			</button>
		</div>
	</div>
</div>
