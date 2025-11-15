<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	
	let submitting = false;
	let formElement: HTMLFormElement;
	let storeUrl = '';
	let isValidating = false;
	let validationResult: { valid: boolean; platform?: string; error?: string } | null = null;
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;
	
	function handleSubmit() {
		submitting = true;
	}
	
	async function validateUrl(url: string) {
		if (!url || url.length < 10) {
			validationResult = null;
			return;
		}
		
		isValidating = true;
		
		try {
			const response = await fetch(`/api/validate-app-url?url=${encodeURIComponent(url)}`);
			const data = await response.json();
			validationResult = data;
		} catch (error) {
			validationResult = { valid: false, error: 'Failed to validate URL' };
		} finally {
			isValidating = false;
		}
	}
	
	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		storeUrl = target.value;
		
		// Debounce validation
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}
		
		debounceTimer = setTimeout(() => {
			validateUrl(storeUrl);
		}, 500);
	}
</script>

<svelte:head>
	<title>Add New App - AppReview Triage</title>
</svelte:head>

<div class="max-w-2xl mx-auto p-6">
	<h1 class="text-3xl font-bold mb-6">Add New App</h1>
	
	<div class="bg-white rounded-lg shadow p-6">
		<p class="text-gray-600 mb-6">
			Enter your app's App Store or Play Store URL. We'll automatically start tracking reviews.
		</p>
		
		<form 
			method="POST" 
			use:enhance={handleSubmit}
			bind:this={formElement}
		>
			<div class="mb-4">
				<label for="storeUrl" class="block text-sm font-medium text-gray-700 mb-2">
					Store URL
				</label>
				<input
					type="url"
					id="storeUrl"
					name="storeUrl"
					bind:value={storeUrl}
					on:input={handleInput}
					required
					placeholder="https://apps.apple.com/us/app/your-app/id123456789 or https://play.google.com/store/apps/details?id=com.example.app"
					class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 {validationResult?.valid ? 'border-green-500' : validationResult?.valid === false ? 'border-red-500' : 'border-gray-300'}"
					disabled={submitting}
				/>
				
				<!-- Validation feedback -->
				{#if isValidating}
					<p class="mt-2 text-sm text-blue-600 flex items-center gap-2">
						<span class="animate-spin">⚙️</span> Validating URL...
					</p>
				{:else if validationResult?.valid}
					<p class="mt-2 text-sm text-green-600 flex items-center gap-2">
						<span>✅</span> Found {validationResult.platform?.toUpperCase()} app. Ready to analyze!
					</p>
				{:else if validationResult?.valid === false}
					<p class="mt-2 text-sm text-red-600">
						{validationResult.error || 'Invalid URL'}
					</p>
				{:else}
					<p class="mt-2 text-sm text-gray-500">
						Supports iOS App Store and Android Play Store URLs
					</p>
				{/if}
			</div>
			
			{#if $page.form?.error}
				<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
					<p class="text-sm text-red-600">{$page.form.error}</p>
				</div>
			{/if}
			
			<div class="flex gap-4">
				<button
					type="submit"
					disabled={submitting || !validationResult?.valid}
					class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{submitting ? 'Starting Analysis...' : validationResult?.valid ? 'Start First Analysis' : 'Add App'}
				</button>
				<a
					href="/dashboard"
					class="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
				>
					Cancel
				</a>
			</div>
		</form>
	</div>
</div>

