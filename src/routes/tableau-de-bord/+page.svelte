<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';

	export let data: PageData;

	let analyses = data.analyses || [];
	let totalAnalyses = data.totalAnalyses || 0;

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat('fr-FR', {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(date);
	}

	function truncateText(text: string, maxLength: number = 100): string {
		if (text.length <= maxLength) return text;
		return text.substring(0, maxLength) + '...';
	}

	function getSentimentColor(sentiment: string): string {
		switch (sentiment) {
			case 'positive': return 'var(--color-success)';
			case 'negative': return 'var(--color-error)';
			default: return 'var(--gray-500)';
		}
	}
</script>

<svelte:head>
	<title>Tableau de Bord - Analyseur de Feedback</title>
</svelte:head>

<div class="min-h-screen" style="background: var(--bg-page);">
	<div class="max-w-7xl mx-auto px-6 py-8">
		<!-- Header -->
		<header class="mb-12">
			<h1 class="text-4xl font-bold mb-2 flex items-center gap-3" style="color: var(--text-primary);">
				<svg class="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<defs>
						<linearGradient id="dashboardHeaderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" style="stop-color:#2C2C2C;stop-opacity:1" />
							<stop offset="100%" style="stop-color:#888888;stop-opacity:1" />
					</linearGradient>
				</defs>
				<path d="M3 3v18h18V3H3zm16 16H5V5h14v14z" fill="url(#dashboardHeaderGradient)"/>
				<path d="M7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z" fill="url(#dashboardHeaderGradient)"/>
			</svg>
			Tableau de Bord
		</h1>
		<p class="text-lg" style="color: var(--text-secondary);">Gérez et consultez toutes vos analyses de feedback</p>
		</header>

		<main class="space-y-12">
			<!-- Stats -->
			<section class="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div class="flex items-center gap-6 p-8 rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
					<svg class="w-12 h-12 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<defs>
							<linearGradient id="totalAnalysesGradient" x1="0%" y1="0%" x2="100%" y2="100%">
								<stop offset="0%" style="stop-color:#2C2C2C;stop-opacity:1" />
								<stop offset="100%" style="stop-color:#888888;stop-opacity:1" />
						</linearGradient>
					</defs>
					<path d="M3 3v18h18V3H3zm16 16H5V5h14v14z" fill="url(#totalAnalysesGradient)"/>
					<path d="M7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z" fill="url(#totalAnalysesGradient)"/>
				</svg>
				<div class="flex-1">
					<div class="text-4xl font-bold mb-1" style="color: var(--text-primary);">{totalAnalyses}</div>
					<div class="text-sm font-medium" style="color: var(--text-secondary);">Analyses Total</div>
				</div>
			</div>
			<div class="flex items-center gap-6 p-8 rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
				<svg class="w-12 h-12 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<defs>
						<linearGradient id="recentAnalysesGradient" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" style="stop-color:#2C2C2C;stop-opacity:1" />
							<stop offset="100%" style="stop-color:#888888;stop-opacity:1" />
					</linearGradient>
				</defs>
				<path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0013 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" fill="url(#recentAnalysesGradient)"/>
			</svg>
				<div class="flex-1">
					<div class="text-4xl font-bold mb-1" style="color: var(--text-primary);">{analyses.length}</div>
					<div class="text-sm font-medium" style="color: var(--text-secondary);">Analyses Récentes</div>
				</div>
			</div>
			<a href="/nouvelle-analyse" class="flex items-center gap-6 p-8 rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer no-underline" style="background: var(--text-primary); color: var(--bg-widget);">
				<svg class="w-12 h-12 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: var(--bg-widget);">
					<defs>
						<linearGradient id="newAnalysisGradient" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
							<stop offset="100%" style="stop-color:#f0f0f0;stop-opacity:1" />
					</linearGradient>
				</defs>
				<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="url(#newAnalysisGradient)"/>
			</svg>
				<div class="flex-1">
					<div class="text-sm font-medium mb-1">Nouvelle Analyse</div>
					<div class="text-lg font-semibold">Créer →</div>
				</div>
			</a>
		</section>

		<!-- Historique -->
		<section>
			<h2 class="text-2xl font-semibold mb-6 flex items-center gap-3" style="color: var(--text-primary);">
				<svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<defs>
						<linearGradient id="historyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" style="stop-color:#2C2C2C;stop-opacity:1" />
							<stop offset="100%" style="stop-color:#888888;stop-opacity:1" />
					</linearGradient>
				</defs>
				<path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="url(#historyGradient)"/>
			</svg>
			Historique des Analyses
		</h2>
			{#if analyses.length > 0}
				<div class="overflow-x-auto rounded-lg" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
					<table class="w-full">
						<thead>
							<tr style="border-bottom: 1px solid var(--border-subtle);">
								<th class="px-6 py-4 text-left text-sm font-semibold" style="color: var(--text-primary);">Date</th>
								<th class="px-6 py-4 text-left text-sm font-semibold" style="color: var(--text-primary);">Feedback</th>
								<th class="px-6 py-4 text-center text-sm font-semibold" style="color: var(--text-primary);">Sentiment</th>
								<th class="px-6 py-4 text-center text-sm font-semibold" style="color: var(--text-primary);">Bugs</th>
								<th class="px-6 py-4 text-center text-sm font-semibold" style="color: var(--text-primary);">Fonctionnalités</th>
								<th class="px-6 py-4 text-center text-sm font-semibold" style="color: var(--text-primary);">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each analyses as analysis}
								<tr 
									class="transition-colors hover:bg-[var(--bg-sidebar)] cursor-pointer"
									style="border-bottom: 1px solid var(--border-subtle);"
									on:click={() => goto(`/tableau-de-bord/analyse/${analysis.id}`)}
									on:keypress={(e) => e.key === 'Enter' && goto(`/tableau-de-bord/analyse/${analysis.id}`)}
									role="button"
									tabindex="0"
								>
									<td class="px-6 py-4 text-sm whitespace-nowrap" style="color: var(--text-secondary);">
										{formatDate(analysis.createdAt)}
									</td>
									<td class="px-6 py-4 text-sm max-w-md" style="color: var(--text-primary);">
										<div class="line-clamp-2 font-medium">{analysis.title || truncateText(analysis.feedbackText, 150)}</div>
										{#if analysis.title}
											<div class="text-xs mt-1" style="color: var(--text-muted);">{truncateText(analysis.feedbackText, 80)}</div>
										{/if}
									</td>
									<td class="px-6 py-4 text-center">
										<span 
											class="inline-block w-3 h-3 rounded-full" 
											style="background: {getSentimentColor(analysis.result.sentiment)}" 
											title="{analysis.result.sentiment}"
										></span>
									</td>
									<td class="px-6 py-4 text-center text-sm" style="color: var(--text-secondary);">
										{#if analysis.result.bugs.length > 0}
											<span class="px-2 py-1 rounded-md" style="background: var(--color-error-light); color: var(--color-error); font-semibold;">
												{analysis.result.bugs.length}
											</span>
										{:else}
											<span style="color: var(--text-muted);">-</span>
										{/if}
									</td>
									<td class="px-6 py-4 text-center text-sm" style="color: var(--text-secondary);">
										{#if analysis.result.featureRequests.length > 0}
											<span class="px-2 py-1 rounded-md" style="background: var(--color-info-light); color: var(--color-info); font-semibold;">
												{analysis.result.featureRequests.length}
											</span>
										{:else}
											<span style="color: var(--text-muted);">-</span>
										{/if}
									</td>
									<td class="px-6 py-4 text-center">
										<a 
											href="/tableau-de-bord/analyse/{analysis.id}"
											class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-sm"
											style="background: var(--text-primary); color: var(--bg-widget);"
											on:click|stopPropagation
										>
											Voir
											<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
												<path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
											</svg>
										</a>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<div class="p-16 rounded-lg text-center" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
					<h3 class="text-2xl font-semibold mb-2" style="color: var(--text-primary);">Aucune analyse pour le moment</h3>
					<p class="mb-8" style="color: var(--text-secondary);">Commencez par analyser votre premier feedback !</p>
					<a href="/nouvelle-analyse" class="inline-block px-8 py-4 rounded-lg font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5" style="background: var(--text-primary); color: var(--bg-widget);">Créer une analyse</a>
				</div>
			{/if}
		</section>

	</main>
	</div>
</div>

