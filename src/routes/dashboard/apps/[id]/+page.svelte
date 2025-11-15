<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	
	export let data: PageData;
	
	let showDeleteConfirm = false;
	let isDeleting = false;
	let isFetching = false;
	let isClustering = false;
	let onboardingStep = 1;
	let isOnboardingActive = data.showOnboarding;
	let pollInterval: ReturnType<typeof setInterval> | null = null;
	
	onMount(() => {
		// If onboarding, automatically trigger fetch and poll for progress
		if (data.showOnboarding && data.reviewCount === 0) {
			startOnboarding();
		}
		
		return () => {
			if (pollInterval) {
				clearInterval(pollInterval);
			}
		};
	});
	
	async function startOnboarding() {
		isOnboardingActive = true;
		onboardingStep = 1; // Step 1: Found app
		
		// Wait a moment to show step 1
		await new Promise(resolve => setTimeout(resolve, 800));
		
		// Step 2: Fetch reviews
		onboardingStep = 2;
		isFetching = true;
		
		try {
			// Create form data for the fetch action
			const formData = new FormData();
			const response = await fetch(window.location.pathname + '?/fetchReviews', {
				method: 'POST',
				body: formData
			});
			
			// Step 3: AI triage (happens automatically during fetch)
			onboardingStep = 3;
			
			// Poll for reviews to appear (check every 2 seconds)
			pollInterval = setInterval(async () => {
				try {
					const checkResponse = await fetch(window.location.pathname);
					const html = await checkResponse.text();
					
					// Check if reviews have been added (look for review count or first look content)
					if (html.includes('First Look') || html.includes('reviews') || html.includes('Bug Reports')) {
						onboardingStep = 4;
						if (pollInterval) {
							clearInterval(pollInterval);
							pollInterval = null;
						}
						// Refresh page after a moment to show first look
						setTimeout(() => {
							window.location.href = window.location.pathname; // Remove onboarding param
						}, 2000);
					}
				} catch (error) {
					console.error('Polling error:', error);
				}
			}, 2000);
			
			// Stop polling after 60 seconds max
			setTimeout(() => {
				if (pollInterval) {
					clearInterval(pollInterval);
					pollInterval = null;
				}
				// Refresh anyway to show progress
				window.location.reload();
			}, 60000);
		} catch (error) {
			console.error('Onboarding fetch failed:', error);
			isOnboardingActive = false;
		}
	}
	
	function handleDelete() {
		showDeleteConfirm = true;
	}
	
	function cancelDelete() {
		showDeleteConfirm = false;
	}
	
	function handleDeleteSubmit() {
		isDeleting = true;
	}
	
	function handleFetchSubmit() {
		isFetching = true;
	}
	
	function handleClusterSubmit() {
		isClustering = true;
	}
	
	function getStatusColor(status: string) {
		switch (status) {
			case 'open': return 'bg-red-100 text-red-700';
			case 'resolved': return 'bg-green-100 text-green-700';
			case 'ignored': return 'bg-gray-100 text-gray-700';
			default: return 'bg-gray-100 text-gray-700';
		}
	}
	
	function getUrgencyColor(urgency: string | null | undefined) {
		if (!urgency) return 'bg-gray-100 text-gray-700';
		switch (urgency) {
			case 'Critical': return 'bg-red-200 text-red-900 font-semibold';
			case 'High': return 'bg-orange-200 text-orange-900';
			case 'Low': return 'bg-yellow-100 text-yellow-800';
			case 'None': return 'bg-gray-100 text-gray-600';
			default: return 'bg-gray-100 text-gray-700';
		}
	}
</script>

<svelte:head>
	<title>{data.app.name || 'App'} - Issue Clusters - AppReview Triage</title>
</svelte:head>

<div class="max-w-6xl mx-auto p-6">
	<!-- Onboarding Loading State -->
	{#if isOnboardingActive}
		<div class="max-w-2xl mx-auto">
			<div class="bg-white rounded-lg shadow-lg p-8">
				<h1 class="text-3xl font-bold mb-6 text-center">
					Analyzing {data.app.name || `${data.app.platform.toUpperCase()} App`}...
				</h1>
				
				<div class="space-y-4">
					<!-- Step 1: Found app -->
					<div class="flex items-center gap-4 p-4 rounded-lg {onboardingStep >= 1 ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50'}">
						<div class="text-2xl">{onboardingStep >= 1 ? '✅' : '⏳'}</div>
						<div class="flex-1">
							<p class="font-medium">Step 1: Found app on the store</p>
							<p class="text-sm text-gray-600">{data.app.storeUrl}</p>
						</div>
					</div>
					
					<!-- Step 2: Fetching reviews -->
					<div class="flex items-center gap-4 p-4 rounded-lg {onboardingStep >= 2 ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'}">
						<div class="text-2xl">
							{#if onboardingStep === 2}
								<span class="animate-spin">⚙️</span>
							{:else if onboardingStep > 2}
								✅
							{:else}
								⏳
							{/if}
						</div>
						<div class="flex-1">
							<p class="font-medium">Step 2: Fetching your 100 most recent reviews...</p>
							{#if onboardingStep === 2}
								<p class="text-sm text-gray-600">This may take a moment...</p>
							{/if}
						</div>
					</div>
					
					<!-- Step 3: AI triage -->
					<div class="flex items-center gap-4 p-4 rounded-lg {onboardingStep >= 3 ? 'bg-purple-50 border-2 border-purple-200' : 'bg-gray-50'}">
						<div class="text-2xl">
							{#if onboardingStep === 3}
								<span class="animate-spin">🧠</span>
							{:else if onboardingStep > 3}
								✅
							{:else}
								⏳
							{/if}
						</div>
						<div class="flex-1">
							<p class="font-medium">Step 3: Running AI triage on reviews...</p>
							{#if onboardingStep === 3}
								<p class="text-sm text-gray-600">Categorizing and analyzing each review...</p>
							{/if}
						</div>
					</div>
					
					<!-- Step 4: Generating report -->
					<div class="flex items-center gap-4 p-4 rounded-lg {onboardingStep >= 4 ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-gray-50'}">
						<div class="text-2xl">
							{#if onboardingStep === 4}
								<span class="animate-pulse">📊</span>
							{:else}
								⏳
							{/if}
						</div>
						<div class="flex-1">
							<p class="font-medium">Step 4: Generating your 'First Look' report...</p>
							{#if onboardingStep === 4}
								<p class="text-sm text-gray-600">Almost done! Preparing your insights...</p>
							{/if}
						</div>
					</div>
				</div>
			</div>
		</div>
	{:else if data.showFirstLook}
		<!-- First Look Report - One-time, non-interactive report -->
		<div class="max-w-3xl mx-auto">
			<!-- Header with actions -->
			<div class="mb-4 flex items-center justify-between">
				<a href="/dashboard" class="text-blue-600 hover:underline">
					← Back to Dashboard
				</a>
				<button
					on:click={handleDelete}
					class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
					disabled={isDeleting}
				>
					Delete App
				</button>
			</div>
			
			<div class="bg-white rounded-lg shadow-lg p-8">
				<div class="flex flex-col items-center mb-6">
					{#if data.app.icon}
						<img
							src={data.app.icon}
							alt={data.app.name || `${data.app.platform.toUpperCase()} App`}
							class="w-24 h-24 rounded-lg object-cover mb-4"
						/>
					{:else}
						<div class="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center mb-4">
							<span class="text-4xl">
								{data.app.platform === 'ios' ? '📱' : '🤖'}
							</span>
						</div>
					{/if}
					<h1 class="text-3xl font-bold mb-2 text-center">
						First Look: {data.app.name || `${data.app.platform.toUpperCase()} App`}
					</h1>
					<p class="text-center text-gray-600 mb-8">
						We analyzed your {data.reviewCount} most recent reviews. Here's what we found:
					</p>
				</div>
				
				<!-- Stats Cards -->
				{#if data.unclusteredReviews.length > 0}
					{@const bugReports = data.unclusteredReviews.filter(r => r.aiCategory === 'Bug Report').length}
					{@const featureRequests = data.unclusteredReviews.filter(r => r.aiCategory === 'Feature Request').length}
					{@const praise = data.unclusteredReviews.filter(r => r.aiCategory === 'Praise').length}
					
					<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
						<div class="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
							<div class="text-4xl font-bold text-red-700 mb-2">{bugReports}</div>
							<div class="text-lg text-red-600 font-medium">Urgent Bug Reports</div>
						</div>
						
						<div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
							<div class="text-4xl font-bold text-blue-700 mb-2">{featureRequests}</div>
							<div class="text-lg text-blue-600 font-medium">New Feature Requests</div>
						</div>
						
						<div class="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
							<div class="text-4xl font-bold text-green-700 mb-2">{praise}</div>
							<div class="text-lg text-green-600 font-medium">Positive Comments</div>
						</div>
					</div>
					
					<!-- Top 3 Urgent Items -->
					{#if bugReports > 0}
						{@const urgentReviews = data.unclusteredReviews
							.filter(r => r.aiCategory === 'Bug Report' && (r.aiUrgency === 'Critical' || r.aiUrgency === 'High'))
							.sort((a, b) => {
								const urgencyOrder = { 'Critical': 0, 'High': 1, 'Low': 2, 'None': 3 };
								return (urgencyOrder[a.aiUrgency as keyof typeof urgencyOrder] ?? 99) - 
								       (urgencyOrder[b.aiUrgency as keyof typeof urgencyOrder] ?? 99);
							})
							.slice(0, 3)}
						
						{#if urgentReviews.length > 0}
							<div class="mb-10">
								<h2 class="text-2xl font-bold mb-6 text-center">Top 3 Urgent Items:</h2>
								<div class="space-y-4">
									{#each urgentReviews as review}
										<div class="bg-gray-50 border-l-4 border-red-500 rounded-r-lg p-5">
											<p class="text-lg text-gray-900 font-medium leading-relaxed">
												"{review.aiSummary || review.body}"
											</p>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					{/if}
					
					<!-- Daily Analysis Active Message -->
					<div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center mb-6">
						<p class="text-blue-800 text-lg">
							<strong>Your daily analysis is now active.</strong> We'll start clustering these insights and will send your first 'Top 5' alert via email soon.
						</p>
					</div>
					
					<!-- Link to trigger clustering and view archive -->
					<div class="text-center">
						<form method="POST" action="?/clusterReviews" use:enhance={handleClusterSubmit} class="inline-block">
							<button
								type="submit"
								class="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
								disabled={isClustering}
							>
								{isClustering ? 'Clustering...' : 'Cluster Reviews & View Archive'}
							</button>
						</form>
					</div>
				{:else}
					<div class="text-center py-12">
						<p class="text-gray-600">No reviews found. Please try fetching reviews again.</p>
					</div>
				{/if}
			</div>
			
			<!-- Delete Confirmation Modal (for First Look) -->
			{#if showDeleteConfirm}
				<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
						<h2 class="text-xl font-bold mb-4">Delete App</h2>
						<p class="text-gray-600 mb-6">
							Are you sure you want to delete this app? This will permanently delete the app and all associated reviews and clusters. This action cannot be undone.
						</p>
						<div class="flex gap-3 justify-end">
							<button
								on:click={cancelDelete}
								class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
								disabled={isDeleting}
							>
								Cancel
							</button>
							<form method="POST" action="?/delete" use:enhance={handleDeleteSubmit}>
								<button
									type="submit"
									class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
									disabled={isDeleting}
								>
									{isDeleting ? 'Deleting...' : 'Delete'}
								</button>
							</form>
						</div>
					</div>
				</div>
			{/if}
		</div>
	{:else}
		<!-- Normal Dashboard View -->
		<div class="mb-6">
			<a href="/dashboard" class="text-blue-600 hover:underline mb-2 inline-block">
				← Back to Dashboard
			</a>
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-4">
					{#if data.app.icon}
						<img
							src={data.app.icon}
							alt={data.app.name || `${data.app.platform.toUpperCase()} App`}
							class="w-16 h-16 rounded-lg object-cover"
						/>
					{:else}
						<div class="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
							<span class="text-3xl">
								{data.app.platform === 'ios' ? '📱' : '🤖'}
							</span>
						</div>
					{/if}
					<div>
						<h1 class="text-3xl font-bold">
							{data.app.name || `${data.app.platform.toUpperCase()} App`}
						</h1>
						<p class="text-gray-600 mt-1">{data.app.storeUrl}</p>
					</div>
				</div>
				<div class="flex items-center gap-4">
					<span class="px-3 py-1 bg-gray-100 rounded">
						{data.clusters.length} clusters, {data.unclusteredReviews.length} unclustered
					</span>
					<form method="POST" action="?/fetchReviews" use:enhance={handleFetchSubmit}>
						<button
							type="submit"
							class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
							disabled={isDeleting || isFetching || isClustering}
						>
							{isFetching ? 'Fetching...' : 'Fetch Reviews'}
						</button>
					</form>
					<form method="POST" action="?/clusterReviews" use:enhance={handleClusterSubmit}>
						<button
							type="submit"
							class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm disabled:opacity-50"
							disabled={isDeleting || isFetching || isClustering}
						>
							{isClustering ? 'Clustering...' : 'Cluster Reviews'}
						</button>
					</form>
					<button
						on:click={handleDelete}
						class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
						disabled={isDeleting}
					>
						Delete App
					</button>
				</div>
			</div>
			
			<!-- Delete Confirmation Modal -->
			{#if showDeleteConfirm}
				<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
						<h2 class="text-xl font-bold mb-4">Delete App</h2>
						<p class="text-gray-600 mb-6">
							Are you sure you want to delete this app? This will permanently delete the app and all associated reviews and clusters. This action cannot be undone.
						</p>
						<div class="flex gap-3 justify-end">
							<button
								on:click={cancelDelete}
								class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
								disabled={isDeleting}
							>
								Cancel
							</button>
							<form method="POST" action="?/delete" use:enhance={handleDeleteSubmit}>
								<button
									type="submit"
									class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
									disabled={isDeleting}
								>
									{isDeleting ? 'Deleting...' : 'Delete'}
								</button>
							</form>
						</div>
					</div>
				</div>
			{/if}
			
			{#if $page.form?.error}
				<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
					<p class="text-sm text-red-600">{$page.form.error}</p>
				</div>
			{/if}
			
			{#if data.fetchedCount !== null}
				<div class="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
					<p class="text-sm text-green-600">
						✅ Fetched {data.fetchedCount} new reviews
					</p>
				</div>
			{/if}
			
			{#if data.clusteredCount !== null}
				<div class="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-md">
					<p class="text-sm text-purple-600">
						✅ Clustered {data.clusteredCount} reviews into {data.clusters.length} issue clusters
					</p>
				</div>
			{/if}
		</div>
		
		<!-- Issue Clusters Section -->
		<div class="mb-8">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-2xl font-bold">Issue Clusters</h2>
				<a 
					href="/dashboard/apps/{data.app.id}/archive"
					class="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors text-sm"
				>
					View Archive (Mature View) →
				</a>
			</div>
			
			{#if data.clusters.length > 0}
				<div class="space-y-4">
					{#each data.clusters as cluster}
						<div class="bg-white rounded-lg shadow p-6 border-l-4 {cluster.stats.hasCritical ? 'border-red-500' : cluster.stats.hasHigh ? 'border-orange-500' : 'border-blue-500'}">
							<div class="flex items-start justify-between mb-4">
								<div class="flex-1">
									<div class="flex items-center gap-3 mb-2 flex-wrap">
										<h3 class="text-xl font-semibold">{cluster.title}</h3>
										<span class="px-2 py-1 text-xs rounded font-medium {getStatusColor(cluster.status)}">
											{cluster.status}
										</span>
										<span class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
											{cluster.category}
										</span>
										<span class="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
											{cluster._count.reviews} {cluster._count.reviews === 1 ? 'review' : 'reviews'}
										</span>
										{#if cluster.stats.hasCritical}
											<span class="px-2 py-1 text-xs bg-red-200 text-red-900 font-semibold rounded">
												Critical
											</span>
										{:else if cluster.stats.hasHigh}
											<span class="px-2 py-1 text-xs bg-orange-200 text-orange-900 rounded">
												High Priority
											</span>
										{/if}
										{#if cluster.stats.avgRating > 0}
											<span class="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
												⭐ {cluster.stats.avgRating.toFixed(1)}
											</span>
										{/if}
									</div>
									<p class="text-sm text-gray-500">
										Created {new Date(cluster.createdAt).toLocaleDateString()}
										{#if Object.keys(cluster.stats.urgencyCounts).length > 0}
											• {Object.entries(cluster.stats.urgencyCounts).map(([urg, count]) => `${count} ${urg}`).join(', ')}
										{/if}
									</p>
								</div>
							</div>
							
							<!-- Sample Reviews -->
							<div class="mt-4 space-y-3">
								<h4 class="text-sm font-medium text-gray-700 mb-2">Sample Reviews:</h4>
								{#each cluster.reviews as review}
									<div class="bg-gray-50 rounded p-3 border-l-2 border-gray-300">
										<div class="flex items-center gap-2 mb-1">
											<div class="flex items-center">
												{#each Array(5) as _, i}
													<span class="text-sm">
														{i < review.rating ? '★' : '☆'}
													</span>
												{/each}
											</div>
											{#if review.author}
												<span class="text-xs text-gray-600">{review.author}</span>
											{/if}
											{#if review.aiUrgency}
												<span class="px-1.5 py-0.5 text-xs rounded font-medium {getUrgencyColor(review.aiUrgency)}">
													{review.aiUrgency}
												</span>
											{/if}
											<span class="text-xs text-gray-500 ml-auto">
												{new Date(review.createdAt).toLocaleDateString()}
											</span>
										</div>
										<p class="text-sm text-gray-800">{review.body}</p>
									</div>
								{/each}
								{#if cluster._count.reviews > cluster.reviews.length}
									<p class="text-xs text-gray-500 italic">
										+ {cluster._count.reviews - cluster.reviews.length} more {cluster._count.reviews - cluster.reviews.length === 1 ? 'review' : 'reviews'}
									</p>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="bg-white rounded-lg shadow p-6 text-center">
					<p class="text-gray-600 mb-4">No clusters yet. Click "Cluster Reviews" to group similar issues.</p>
					<a 
						href="/dashboard/apps/{data.app.id}/archive"
						class="text-blue-600 hover:underline"
					>
						View Archive →
					</a>
				</div>
			{/if}
		</div>
		
		<!-- Unclustered Reviews Section -->
		{#if data.unclusteredReviews.length > 0}
			<div>
				<h2 class="text-2xl font-bold mb-4">Unclustered Reviews</h2>
				<div class="space-y-4">
					{#each data.unclusteredReviews as review}
						<div class="bg-white rounded-lg shadow p-6">
							<div class="flex items-start justify-between mb-3">
								<div class="flex items-center gap-3 flex-wrap">
									<div class="flex items-center">
										{#each Array(5) as _, i}
											<span class="text-2xl">
												{i < review.rating ? '★' : '☆'}
											</span>
										{/each}
									</div>
									{#if review.author}
										<span class="text-sm text-gray-600">{review.author}</span>
									{/if}
									
									{#if review.aiCategory}
										<span class="px-2 py-1 text-xs rounded font-medium bg-gray-100 text-gray-700">
											{review.aiCategory}
										</span>
									{/if}
									{#if review.aiUrgency}
										<span class="px-2 py-1 text-xs rounded font-medium {getUrgencyColor(review.aiUrgency)}">
											{review.aiUrgency}
										</span>
									{/if}
								</div>
								<span class="text-xs text-gray-500">
									{new Date(review.createdAt).toLocaleDateString()}
								</span>
							</div>
							
							<p class="text-gray-800 whitespace-pre-wrap">{review.body}</p>
						</div>
					{/each}
				</div>
			</div>
		{:else if data.clusters.length === 0}
			<div class="bg-white rounded-lg shadow p-12 text-center">
				<p class="text-gray-600">No reviews yet. Fetch reviews and cluster them to see issue groups.</p>
			</div>
		{/if}
	{/if}
</div>
