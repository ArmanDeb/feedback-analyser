<script lang="ts">
	import type { PageData } from './$types';
	
	export let data: PageData;
</script>

<svelte:head>
	<title>Dashboard - AppReview Triage</title>
</svelte:head>

<div class="max-w-6xl mx-auto p-6">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-3xl font-bold">My Apps</h1>
		<a
			href="/dashboard/apps/new"
			class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
		>
			+ Add App
		</a>
	</div>
	
	{#if data.apps.length === 0}
		<div class="bg-white rounded-lg shadow p-12 text-center">
			<p class="text-gray-600 mb-4">No apps added yet.</p>
			<a
				href="/dashboard/apps/new"
				class="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
			>
				Add Your First App
			</a>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each data.apps as app}
				<a
					href="/dashboard/apps/{app.id}"
					class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
				>
					<div class="flex items-start gap-4 mb-2">
						{#if app.icon}
							<img
								src={app.icon}
								alt={app.name || `${app.platform.toUpperCase()} App`}
								class="w-16 h-16 rounded-lg object-cover flex-shrink-0"
							/>
						{:else}
							<div class="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
								<span class="text-2xl">
									{app.platform === 'ios' ? '📱' : '🤖'}
								</span>
							</div>
						{/if}
						<div class="flex-1 min-w-0">
							<div class="flex items-start justify-between mb-1">
								<h2 class="text-xl font-semibold truncate">
									{app.name || `${app.platform.toUpperCase()} App`}
								</h2>
								<span class="px-2 py-1 text-xs bg-gray-100 rounded ml-2 flex-shrink-0">
									{app.platform}
								</span>
							</div>
							<p class="text-sm text-gray-500 mb-2 truncate">{app.storeUrl}</p>
							<div class="flex items-center text-sm text-gray-600">
								<span class="font-medium">{app._count.reviews}</span>
								<span class="ml-1">reviews</span>
							</div>
						</div>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

