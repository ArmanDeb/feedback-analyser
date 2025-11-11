<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	
	// Vérifier si on a une erreur BDD
	$: hasDbError = 'error' in data && data.error;

	// Formater les montants en dollars
	function formatCost(cost: number): string {
		return `$${cost.toFixed(4)}`;
	}

	// Formater les grands nombres
	function formatNumber(num: number): string {
		return num.toLocaleString('fr-FR');
	}

	// Formater les dates
	function formatDate(date: Date | string): string {
		return new Date(date).toLocaleString('fr-FR');
	}
</script>

<svelte:head>
	<title>Mon Utilisation - Analyseur de Feedback</title>
</svelte:head>

<div class="min-h-screen" style="background: var(--bg-page);">
	<div class="max-w-7xl mx-auto px-6 py-8">
		<header class="mb-8 pb-4 border-b-2" style="border-color: var(--border-subtle);">
			<h1 class="text-4xl mb-2 flex items-center gap-3" style="color: var(--text-primary);">
				<svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<defs>
						<linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" style="stop-color:#2C2C2C;stop-opacity:1" />
							<stop offset="100%" style="stop-color:#888888;stop-opacity:1" />
					</linearGradient>
				</defs>
				<path d="M3 3v18h18V3H3zm16 16H5V5h14v14z" fill="url(#headerGradient)"/>
				<path d="M7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z" fill="url(#headerGradient)"/>
			</svg>
			Mon Utilisation
		</h1>
		<p class="mb-4" style="color: var(--text-secondary);">Statistiques et coûts de votre compte</p>
		<div class="text-sm" style="color: var(--text-secondary);">
			Compte: <strong style="color: var(--text-primary); font-weight: var(--font-weight-semibold);">{data.currentUser.email}</strong>
		</div>
	</header>

	{#if hasDbError}
		<div class="p-6 mb-8 rounded-sm border-2" style="background: var(--color-error-light); border-color: var(--color-error);">
			<h2 class="flex items-center mb-2" style="color: var(--color-error);">
				<svg class="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<defs>
						<linearGradient id="errorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" style="stop-color:#ef4444;stop-opacity:1" />
							<stop offset="100%" style="stop-color:#dc2626;stop-opacity:1" />
						</linearGradient>
					</defs>
					<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="url(#errorGradient)"/>
				</svg>
				Configuration Requise
			</h2>
			<p>{data.error}</p>
			<div class="mt-4" style="color: var(--text-secondary);">
				<p>La base de données n'est pas encore configurée. Contactez l'administrateur.</p>
			</div>
		</div>
	{/if}

	<!-- Statistiques Personnelles -->
	<section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
		<div class="flex items-center gap-6 p-6 rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
			<svg class="w-12 h-12 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" style="stop-color:#2C2C2C;stop-opacity:1" />
						<stop offset="100%" style="stop-color:#888888;stop-opacity:1" />
					</linearGradient>
				</defs>
				<path d="M3 3v18h18V3H3zm16 16H5V5h14v14z" fill="url(#chartGradient)"/>
				<path d="M7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z" fill="url(#chartGradient)"/>
			</svg>
			<div class="flex-1">
				<div class="text-sm font-medium mb-1" style="color: var(--text-secondary);">Mes Analyses</div>
				<div class="text-4xl font-bold" style="color: var(--text-primary);">{formatNumber(data.userStats.totalAnalyses)}</div>
			</div>
		</div>

		<div class="flex items-center gap-6 p-6 rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
			<svg class="w-12 h-12 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<linearGradient id="apiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" style="stop-color:#2C2C2C;stop-opacity:1" />
						<stop offset="100%" style="stop-color:#888888;stop-opacity:1" />
					</linearGradient>
				</defs>
				<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="url(#apiGradient)"/>
			</svg>
			<div class="flex-1">
				<div class="text-sm font-medium mb-1" style="color: var(--text-secondary);">Appels API</div>
				<div class="text-4xl font-bold" style="color: var(--text-primary);">{formatNumber(data.userStats.totalApiCalls)}</div>
			</div>
		</div>

		<div class="flex items-center gap-6 p-6 rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5" style="background: var(--text-primary); color: var(--bg-widget); border: 1px solid var(--border-subtle);">
			<svg class="w-12 h-12 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: var(--bg-widget);">
				<defs>
					<linearGradient id="costGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
						<stop offset="100%" style="stop-color:#f0f0f0;stop-opacity:1" />
					</linearGradient>
				</defs>
				<path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" fill="url(#costGradient)"/>
			</svg>
			<div class="flex-1">
				<div class="text-sm font-medium mb-1">Coût Total</div>
				<div class="text-4xl font-bold">{formatCost(data.userStats.totalCost)}</div>
			</div>
		</div>

		<div class="flex items-center gap-6 p-6 rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
			<svg class="w-12 h-12 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<linearGradient id="tokenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" style="stop-color:#2C2C2C;stop-opacity:1" />
						<stop offset="100%" style="stop-color:#888888;stop-opacity:1" />
					</linearGradient>
				</defs>
				<path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" fill="url(#tokenGradient)"/>
			</svg>
			<div class="flex-1">
				<div class="text-sm font-medium mb-1" style="color: var(--text-secondary);">Tokens Utilisés</div>
				<div class="text-4xl font-bold mb-2" style="color: var(--text-primary);">{formatNumber(data.userStats.totalTokens)}</div>
				<div class="flex gap-4 text-xs" style="color: var(--text-secondary);">
					<span>↑ In: {formatNumber(data.userStats.totalTokensIn)}</span>
					<span>↓ Out: {formatNumber(data.userStats.totalTokensOut)}</span>
				</div>
			</div>
		</div>
	</section>

	<!-- Estimation Mensuelle -->
	<section class="mb-8">
		<h2 class="text-2xl font-semibold mb-6 flex items-center gap-3" style="color: var(--text-primary);">
			<svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<linearGradient id="projectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" style="stop-color:#2C2C2C;stop-opacity:1" />
						<stop offset="100%" style="stop-color:#888888;stop-opacity:1" />
					</linearGradient>
				</defs>
				<path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" fill="url(#projectionGradient)"/>
			</svg>
			Estimation Mensuelle
		</h2>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<div class="p-6 rounded-lg" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
				<div class="text-sm font-medium mb-2" style="color: var(--text-secondary);">Coût 7 derniers jours</div>
				<div class="text-3xl font-bold" style="color: var(--text-primary);">{formatCost(data.monthlyCostEstimate.weekCost)}</div>
			</div>
			<div class="p-6 rounded-lg" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
				<div class="text-sm font-medium mb-2" style="color: var(--text-secondary);">Moyenne Quotidienne</div>
				<div class="text-3xl font-bold" style="color: var(--text-primary);">{formatCost(data.monthlyCostEstimate.dailyAverage)}</div>
			</div>
			<div class="p-6 rounded-lg" style="background: var(--text-primary); color: var(--bg-widget); border: 1px solid var(--border-subtle);">
				<div class="text-sm font-medium mb-2">Estimation Mensuelle</div>
				<div class="text-3xl font-bold mb-2">{formatCost(data.monthlyCostEstimate.estimatedMonthlyCost)}</div>
				<div class="text-xs opacity-90">Basée sur l'activité des 7 derniers jours</div>
			</div>
		</div>
	</section>

	<!-- Historique des Appels API -->
	<section class="mb-8">
		<h2 class="text-2xl font-semibold mb-6 flex items-center gap-3" style="color: var(--text-primary);">
			<svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<linearGradient id="searchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" style="stop-color:#2C2C2C;stop-opacity:1" />
						<stop offset="100%" style="stop-color:#888888;stop-opacity:1" />
					</linearGradient>
				</defs>
				<circle cx="11" cy="11" r="7" stroke="url(#searchGradient)" stroke-width="2" fill="none"/>
				<path d="m20 20-4.35-4.35" stroke="url(#searchGradient)" stroke-width="2" stroke-linecap="round"/>
			</svg>
			Historique des Appels API
		</h2>
		{#if data.recentLogs.length === 0}
			<div class="p-16 rounded-lg text-center" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
				<p class="mb-2" style="color: var(--text-secondary);">Aucun appel API enregistré pour le moment.</p>
				<p style="color: var(--text-secondary);">Créez votre première analyse pour voir les statistiques ici.</p>
			</div>
		{:else}
			<div class="overflow-x-auto rounded-lg" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
				<table class="w-full">
					<thead>
						<tr class="border-b" style="border-color: var(--border-subtle);">
							<th class="px-6 py-4 text-left text-sm font-semibold" style="color: var(--text-primary);">Date & Heure</th>
							<th class="px-6 py-4 text-left text-sm font-semibold" style="color: var(--text-primary);">Modèle</th>
							<th class="px-6 py-4 text-left text-sm font-semibold" style="color: var(--text-primary);">Tokens In</th>
							<th class="px-6 py-4 text-left text-sm font-semibold" style="color: var(--text-primary);">Tokens Out</th>
							<th class="px-6 py-4 text-left text-sm font-semibold" style="color: var(--text-primary);">Coût</th>
						</tr>
					</thead>
					<tbody>
						{#each data.recentLogs as log}
							<tr class="border-b" style="border-color: var(--border-subtle);">
								<td class="px-6 py-4 text-sm" style="color: var(--text-secondary);">{formatDate(log.timestamp)}</td>
								<td class="px-6 py-4 text-sm font-mono font-medium" style="color: var(--text-primary);">{log.modelUsed}</td>
								<td class="px-6 py-4 text-sm" style="color: var(--text-secondary);">{formatNumber(log.tokensIn)}</td>
								<td class="px-6 py-4 text-sm" style="color: var(--text-secondary);">{formatNumber(log.tokensOut)}</td>
								<td class="px-6 py-4 text-sm font-semibold" style="color: var(--text-primary);">{formatCost(log.cost)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>

	<!-- Actions Rapides -->
	<section class="mb-8">
		<h2 class="text-2xl font-semibold mb-6" style="color: var(--text-primary);">Actions Rapides</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<a href="/nouvelle-analyse" class="flex items-center gap-4 p-6 rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5 no-underline" style="background: var(--text-primary); color: var(--bg-widget);">
				<svg class="w-8 h-8 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: var(--bg-widget);">
					<defs>
						<linearGradient id="newGradient" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
							<stop offset="100%" style="stop-color:#f0f0f0;stop-opacity:1" />
						</linearGradient>
					</defs>
					<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="url(#newGradient)"/>
				</svg>
				<span class="text-lg font-semibold">Nouvelle Analyse</span>
			</a>
			<a href="/tableau-de-bord" class="flex items-center gap-4 p-6 rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5 no-underline" style="background: var(--bg-widget); color: var(--text-primary); border: 1px solid var(--border-subtle);">
				<svg class="w-8 h-8 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: var(--text-primary);">
					<defs>
						<linearGradient id="dashboardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" style="stop-color:#2C2C2C;stop-opacity:1" />
							<stop offset="100%" style="stop-color:#888888;stop-opacity:1" />
						</linearGradient>
					</defs>
					<path d="M3 3v18h18V3H3zm16 16H5V5h14v14z" fill="url(#dashboardGradient)"/>
					<path d="M7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z" fill="url(#dashboardGradient)"/>
				</svg>
				<span class="text-lg font-semibold">Mes Analyses</span>
			</a>
		</div>
	</section>
	</div>
</div>


