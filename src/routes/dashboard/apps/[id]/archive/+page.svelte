<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import CommandPalette from '$lib/components/CommandPalette.svelte';
	import HoverPreview from '$lib/components/HoverPreview.svelte';
	import Treemap from '$lib/components/Treemap.svelte';
	
	export let data: PageData;
	
	let selectedStatus = data.filters.status;
	let selectedCategory = data.filters.category;
	let selectedIndex = -1; // For keyboard navigation
	
	// Keyboard navigation
	function handleKeydown(event: KeyboardEvent) {
		// Only handle if not typing in input/select
		if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) {
			return;
		}
		
		// j = down, k = up, Enter = open
		if (event.key === 'j' || event.key === 'J') {
			event.preventDefault();
			selectedIndex = Math.min(selectedIndex + 1, data.clusters.length - 1);
			// Scroll into view
			const row = document.querySelector(`[data-cluster-index="${selectedIndex}"]`);
			row?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		} else if (event.key === 'k' || event.key === 'K') {
			event.preventDefault();
			selectedIndex = Math.max(selectedIndex - 1, -1);
			// Scroll into view
			const row = document.querySelector(`[data-cluster-index="${selectedIndex}"]`);
			row?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		} else if (event.key === 'Enter' && selectedIndex >= 0) {
			event.preventDefault();
			// Open cluster (could navigate to detail page or trigger action)
			// For now, just mark as seen if it's open
			const cluster = data.clusters[selectedIndex];
			if (cluster && cluster.status === 'open') {
				// Trigger mark as seen
				const form = document.querySelector(`[data-cluster-id="${cluster.id}"] form`) as HTMLFormElement;
				form?.submit();
			}
		}
	}
	
	function updateFilters() {
		const params = new URLSearchParams();
		if (selectedStatus !== 'all') params.set('status', selectedStatus);
		if (selectedCategory !== 'all') params.set('category', selectedCategory);
		window.location.search = params.toString();
	}
	
	// Treemap data
	$: treemapData = [
		{ label: 'Bug Reports', value: data.stats.bugs, color: '#ef4444' },
		{ label: 'Feature Requests', value: data.stats.features, color: '#3b82f6' },
		{ label: 'Complaints', value: data.stats.complaints, color: '#f97316' }
	].filter(item => item.value > 0);
	
	function getStatusLabel(status: string) {
		switch (status) {
			case 'open': return 'New';
			case 'resolved': return 'Seen';
			case 'ignored': return 'Archived';
			default: return status;
		}
	}
	
	function getStatusColor(status: string) {
		switch (status) {
			case 'open': return 'bg-green-100 text-green-800';
			case 'resolved': return 'bg-gray-100 text-gray-800';
			case 'ignored': return 'bg-gray-200 text-gray-600';
			default: return 'bg-gray-100 text-gray-800';
		}
	}
	
	function getCategoryColor(category: string) {
		switch (category) {
			case 'Bug Report': return 'bg-red-100 text-red-800';
			case 'Feature Request': return 'bg-blue-100 text-blue-800';
			case 'Complaint': return 'bg-orange-100 text-orange-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}
	
</script>

<svelte:head>
	<title>Cluster Archive - {data.app.name || 'App'} - AppReview Triage</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<CommandPalette appId={data.app.id} />

<div class="max-w-7xl mx-auto p-6">
	<div class="mb-6">
		<a href="/dashboard/apps/{data.app.id}" class="text-blue-600 hover:underline mb-2 inline-block">
			← Back to App
		</a>
		<h1 class="text-3xl font-bold mb-2">Cluster Archive</h1>
		<p class="text-gray-600">All Insights - Dense, actionable list</p>
		<p class="text-xs text-gray-500 mt-1">Press <kbd class="px-1.5 py-0.5 bg-gray-100 rounded">Cmd+K</kbd> for command palette | <kbd class="px-1.5 py-0.5 bg-gray-100 rounded">j</kbd>/<kbd class="px-1.5 py-0.5 bg-gray-100 rounded">k</kbd> to navigate</p>
	</div>
	
	<!-- Treemap Visualization -->
	{#if treemapData.length > 0}
		<div class="bg-white rounded-lg shadow p-4 mb-6">
			<h2 class="text-sm font-medium text-gray-700 mb-3">Category Distribution</h2>
			<Treemap data={treemapData} width={400} height={150} />
		</div>
	{/if}
	
	<!-- Filters -->
	<div class="bg-white rounded-lg shadow p-4 mb-6">
		<div class="flex flex-wrap gap-4 items-center">
			<span class="text-sm font-medium text-gray-700">Filters:</span>
			
			<select 
				bind:value={selectedStatus}
				on:change={updateFilters}
				class="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
			>
				<option value="all">Status: All ({data.stats.total})</option>
				<option value="open">New ({data.stats.new})</option>
				<option value="resolved">Seen ({data.stats.seen})</option>
				<option value="ignored">Archived</option>
			</select>
			
			<select 
				bind:value={selectedCategory}
				on:change={updateFilters}
				class="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
			>
				<option value="all">Category: All</option>
				<option value="Bug Report">Bug Report</option>
				<option value="Feature Request">Feature Request</option>
				<option value="Complaint">Complaint</option>
			</select>
			
			{#if selectedStatus !== 'all' || selectedCategory !== 'all'}
				<a 
					href="/dashboard/apps/{data.app.id}/archive"
					class="text-sm text-blue-600 hover:underline"
				>
					Clear filters
				</a>
			{/if}
		</div>
	</div>
	
	<!-- Dense List Table -->
	<div class="bg-white rounded-lg shadow overflow-hidden">
		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insight</th>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reports</th>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#each data.clusters as cluster, index}
						<tr 
							class="hover:bg-gray-50 transition-colors {selectedIndex === index ? 'bg-blue-50' : ''}"
							data-cluster-index={index}
							data-cluster-id={cluster.id}
						>
							<td class="px-4 py-3 whitespace-nowrap">
								<span class="px-2 py-1 text-xs font-medium rounded {getStatusColor(cluster.status)}">
									{getStatusLabel(cluster.status)}
								</span>
							</td>
							<td class="px-4 py-3 whitespace-nowrap">
								<span class="px-2 py-1 text-xs font-medium rounded {getCategoryColor(cluster.category)}">
									{cluster.category}
								</span>
							</td>
							<td class="px-4 py-3">
								<HoverPreview reviews={cluster.reviews}>
									<div class="text-sm font-medium text-gray-900 cursor-pointer">{cluster.title}</div>
								</HoverPreview>
								<div class="text-xs text-gray-500 mt-1">
									Created {new Date(cluster.createdAt).toLocaleDateString()}
								</div>
							</td>
							<td class="px-4 py-3 whitespace-nowrap">
								<span class="text-sm font-semibold text-gray-900">{cluster._count.reviews}</span>
							</td>
							<td class="px-4 py-3 whitespace-nowrap">
								<div class="flex flex-wrap gap-2">
									{#if cluster.status === 'open'}
										<!-- Mark as Seen -->
										<form method="POST" action="?/markSeen" use:enhance>
											<input type="hidden" name="clusterId" value={cluster.id} />
											<button
												type="submit"
												class="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
											>
												Mark as Seen
											</button>
										</form>
									{:else}
										<!-- Archive action -->
										<form method="POST" action="?/archive" use:enhance>
											<input type="hidden" name="clusterId" value={cluster.id} />
											<button
												type="submit"
												class="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
											>
												Archive
											</button>
										</form>
									{/if}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
			
			{#if data.clusters.length === 0}
				<div class="text-center py-12">
					<p class="text-gray-500">No clusters found matching your filters.</p>
				</div>
			{/if}
		</div>
	</div>
	
	<!-- Summary -->
	<div class="mt-4 text-sm text-gray-600">
		Showing {data.clusters.length} of {data.stats.total} clusters
	</div>
</div>

