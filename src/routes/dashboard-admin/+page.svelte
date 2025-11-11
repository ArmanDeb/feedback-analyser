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
	<title>Dashboard Admin - Analyseur de Feedback</title>
</svelte:head>

<div class="min-h-screen" style="background: var(--bg-page);">
	<div class="max-w-7xl mx-auto px-6 py-8">
		<header class="mb-8 pb-4 border-b-2" style="border-color: var(--border-subtle);">
			<h1 class="text-4xl mb-2 flex items-center gap-3" style="color: var(--text-primary);">
				<svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<defs>
						<linearGradient id="adminHeaderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" style="stop-color:#2C2C2C;stop-opacity:1" />
							<stop offset="100%" style="stop-color:#888888;stop-opacity:1" />
					</linearGradient>
				</defs>
				<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" fill="url(#adminHeaderGradient)"/>
			</svg>
			Dashboard Admin
		</h1>
		<p class="mb-4" style="color: var(--text-secondary);">Monitoring des coûts et statistiques d'utilisation</p>
		<div class="text-sm flex items-center gap-3" style="color: var(--text-secondary);">
			Connecté en tant que: <strong style="color: var(--text-primary); font-weight: var(--font-weight-medium);">{data.currentUser.email}</strong>
			<span class="px-3 py-1 rounded-md text-xs font-semibold" style="background: var(--text-primary); color: var(--bg-widget);">Admin</span>
		</div>
	</header>

	{#if hasDbError}
		<div class="p-6 mb-8 rounded-sm border-2" style="background: var(--color-error-light); border-color: var(--color-error);">
			<h2 class="flex items-center mb-2" style="color: var(--color-error);">
				<svg class="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<defs>
						<linearGradient id="adminErrorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" style="stop-color:#ef4444;stop-opacity:1" />
							<stop offset="100%" style="stop-color:#dc2626;stop-opacity:1" />
						</linearGradient>
					</defs>
					<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="url(#adminErrorGradient)"/>
				</svg>
				Configuration Requise
			</h2>
			<p class="mb-4">{data.error}</p>
			<div class="mt-4" style="color: var(--text-secondary);">
				<h3 class="font-semibold mb-2" style="color: var(--text-primary);">Instructions :</h3>
				<ol class="list-decimal list-inside space-y-1">
					<li>Vérifiez que votre <code class="px-1 py-0.5 rounded" style="background: var(--bg-widget);">DATABASE_URL</code> est correctement configurée dans le fichier <code class="px-1 py-0.5 rounded" style="background: var(--bg-widget);">.env</code></li>
					<li>Le format doit être : <code class="px-1 py-0.5 rounded" style="background: var(--bg-widget);">postgresql://user:password@host/database?sslmode=require</code></li>
					<li>Exécutez : <code class="px-1 py-0.5 rounded" style="background: var(--bg-widget);">npx prisma db push</code> pour créer les tables</li>
					<li>Rechargez cette page</li>
				</ol>
			</div>
		</div>
	{/if}

	<!-- Statistiques Globales -->
	<section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
		<div class="flex items-center gap-6 p-6 rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
			<svg class="w-12 h-12 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<linearGradient id="adminChartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" style="stop-color:#2C2C2C;stop-opacity:1" />
						<stop offset="100%" style="stop-color:#888888;stop-opacity:1" />
					</linearGradient>
				</defs>
				<path d="M3 3v18h18V3H3zm16 16H5V5h14v14z" fill="url(#adminChartGradient)"/>
				<path d="M7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z" fill="url(#adminChartGradient)"/>
			</svg>
			<div class="flex-1">
				<div class="text-sm font-medium mb-1" style="color: var(--text-secondary);">Total Analyses</div>
				<div class="text-4xl font-bold" style="color: var(--text-primary);">{formatNumber(data.globalStats.totalAnalyses)}</div>
			</div>
		</div>

		<div class="flex items-center gap-6 p-6 rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
			<svg class="w-12 h-12 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<linearGradient id="adminUsersGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" style="stop-color:#2C2C2C;stop-opacity:1" />
						<stop offset="100%" style="stop-color:#888888;stop-opacity:1" />
					</linearGradient>
				</defs>
				<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="url(#adminUsersGradient)"/>
			</svg>
			<div class="flex-1">
				<div class="text-sm font-medium mb-1" style="color: var(--text-secondary);">Utilisateurs</div>
				<div class="text-4xl font-bold" style="color: var(--text-primary);">{formatNumber(data.globalStats.totalUsers)}</div>
			</div>
		</div>

		<div class="flex items-center gap-6 p-6 rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
			<svg class="w-12 h-12 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<linearGradient id="adminApiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" style="stop-color:#2C2C2C;stop-opacity:1" />
						<stop offset="100%" style="stop-color:#888888;stop-opacity:1" />
					</linearGradient>
				</defs>
				<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="url(#adminApiGradient)"/>
			</svg>
			<div class="flex-1">
				<div class="text-sm font-medium mb-1" style="color: var(--text-secondary);">Appels API</div>
				<div class="text-4xl font-bold" style="color: var(--text-primary);">{formatNumber(data.globalStats.totalApiCalls)}</div>
			</div>
		</div>

		<div class="flex items-center gap-6 p-6 rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5" style="background: var(--text-primary); color: var(--bg-widget); border: 1px solid var(--border-subtle);">
			<svg class="w-12 h-12 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: var(--bg-widget);">
				<defs>
					<linearGradient id="adminCostGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
						<stop offset="100%" style="stop-color:#f0f0f0;stop-opacity:1" />
					</linearGradient>
				</defs>
				<path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" fill="url(#adminCostGradient)"/>
			</svg>
			<div class="flex-1">
				<div class="text-sm font-medium mb-1">Coût Total</div>
				<div class="text-4xl font-bold">{formatCost(data.globalStats.totalCost)}</div>
			</div>
		</div>

		<div class="flex items-center gap-6 p-6 rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
			<svg class="w-12 h-12 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<linearGradient id="adminTokensInGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" style="stop-color:#2C2C2C;stop-opacity:1" />
						<stop offset="100%" style="stop-color:#888888;stop-opacity:1" />
					</linearGradient>
				</defs>
				<path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" fill="url(#adminTokensInGradient)"/>
			</svg>
			<div class="flex-1">
				<div class="text-sm font-medium mb-1" style="color: var(--text-secondary);">Tokens In</div>
				<div class="text-4xl font-bold" style="color: var(--text-primary);">{formatNumber(data.globalStats.totalTokensIn)}</div>
			</div>
		</div>

		<div class="flex items-center gap-6 p-6 rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
			<svg class="w-12 h-12 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<linearGradient id="adminTokensOutGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" style="stop-color:#2C2C2C;stop-opacity:1" />
						<stop offset="100%" style="stop-color:#888888;stop-opacity:1" />
					</linearGradient>
				</defs>
				<path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" fill="url(#adminTokensOutGradient)"/>
			</svg>
			<div class="flex-1">
				<div class="text-sm font-medium mb-1" style="color: var(--text-secondary);">Tokens Out</div>
				<div class="text-4xl font-bold" style="color: var(--text-primary);">{formatNumber(data.globalStats.totalTokensOut)}</div>
			</div>
		</div>
	</section>

	<!-- Estimation Coût Mensuel -->
	<section class="mb-8">
		<h2 class="text-2xl font-semibold mb-6 flex items-center gap-3" style="color: var(--text-primary);">
			<svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<linearGradient id="adminProjectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" style="stop-color:#2C2C2C;stop-opacity:1" />
						<stop offset="100%" style="stop-color:#888888;stop-opacity:1" />
					</linearGradient>
				</defs>
				<path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" fill="url(#adminProjectionGradient)"/>
			</svg>
			Estimation Mensuelle
		</h2>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<div class="p-6 rounded-lg text-center" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
				<div class="text-sm font-medium mb-2" style="color: var(--text-secondary);">Coût (7 derniers jours)</div>
				<div class="text-3xl font-bold" style="color: var(--text-primary);">{formatCost(data.monthlyCostEstimate.weekCost)}</div>
			</div>
			<div class="p-6 rounded-lg text-center" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
				<div class="text-sm font-medium mb-2" style="color: var(--text-secondary);">Moyenne journalière</div>
				<div class="text-3xl font-bold" style="color: var(--text-primary);">{formatCost(data.monthlyCostEstimate.dailyAverage)}</div>
			</div>
			<div class="p-6 rounded-lg text-center" style="background: var(--text-primary); color: var(--bg-widget); border: 1px solid var(--border-subtle);">
				<div class="text-sm font-medium mb-2">Estimation mensuelle</div>
				<div class="text-3xl font-bold">{formatCost(data.monthlyCostEstimate.estimatedMonthlyCost)}</div>
			</div>
		</div>
	</section>

	<!-- Statistiques par Utilisateur -->
	<section class="mb-8">
		<h2 class="text-2xl font-semibold mb-6 flex items-center gap-3" style="color: var(--text-primary);">
			<svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<linearGradient id="adminUsersSectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" style="stop-color:#2C2C2C;stop-opacity:1" />
						<stop offset="100%" style="stop-color:#888888;stop-opacity:1" />
					</linearGradient>
				</defs>
				<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="url(#adminUsersSectionGradient)"/>
			</svg>
			Statistiques par Utilisateur
		</h2>
		<div class="overflow-x-auto rounded-lg" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
			<table class="w-full">
				<thead>
					<tr class="border-b" style="border-color: var(--border-subtle);">
						<th class="px-6 py-4 text-left text-sm font-semibold" style="color: var(--text-primary);">Email</th>
						<th class="px-6 py-4 text-left text-sm font-semibold" style="color: var(--text-primary);">Rôle</th>
						<th class="px-6 py-4 text-left text-sm font-semibold" style="color: var(--text-primary);">Analyses</th>
						<th class="px-6 py-4 text-left text-sm font-semibold" style="color: var(--text-primary);">Appels API</th>
						<th class="px-6 py-4 text-left text-sm font-semibold" style="color: var(--text-primary);">Tokens</th>
						<th class="px-6 py-4 text-left text-sm font-semibold" style="color: var(--text-primary);">Coût Total</th>
						<th class="px-6 py-4 text-left text-sm font-semibold" style="color: var(--text-primary);">Coût Moyen</th>
					</tr>
				</thead>
				<tbody>
					{#each data.userStats as user}
						<tr class="border-b" style="border-color: var(--border-subtle);">
							<td class="px-6 py-4 text-sm font-mono font-medium" style="color: var(--text-primary);">{user.email}</td>
							<td class="px-6 py-4">
								<span class="px-3 py-1 rounded-md text-xs font-semibold" style="background: {user.role === 'admin' ? 'var(--text-primary)' : 'var(--bg-sidebar)'}; color: {user.role === 'admin' ? 'var(--bg-widget)' : 'var(--text-primary)'};">
									{user.role}
								</span>
							</td>
							<td class="px-6 py-4 text-sm" style="color: var(--text-secondary);">{formatNumber(user.analysesCount)}</td>
							<td class="px-6 py-4 text-sm" style="color: var(--text-secondary);">{formatNumber(user.apiCallsCount)}</td>
							<td class="px-6 py-4 text-sm" style="color: var(--text-secondary);">{formatNumber(user.totalTokens)}</td>
							<td class="px-6 py-4 text-sm font-semibold" style="color: var(--text-primary);">{formatCost(user.totalCost)}</td>
							<td class="px-6 py-4 text-sm font-semibold" style="color: var(--text-primary);">{formatCost(user.avgCostPerCall)}</td>
						</tr>
					{:else}
						<tr>
							<td colspan="7" class="px-6 py-4 text-center text-sm italic" style="color: var(--text-muted);">Aucune donnée utilisateur</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<!-- Logs API Récents -->
	<section class="mb-8">
		<h2 class="text-2xl font-semibold mb-6 flex items-center gap-3" style="color: var(--text-primary);">
			<svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<linearGradient id="adminLogsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" style="stop-color:#2C2C2C;stop-opacity:1" />
						<stop offset="100%" style="stop-color:#888888;stop-opacity:1" />
					</linearGradient>
				</defs>
				<path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="url(#adminLogsGradient)"/>
			</svg>
			Logs API Récents (50 derniers)
		</h2>
		<div class="overflow-x-auto rounded-lg" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
			<table class="w-full">
				<thead>
					<tr class="border-b" style="border-color: var(--border-subtle);">
						<th class="px-6 py-4 text-left text-sm font-semibold" style="color: var(--text-primary);">Date/Heure</th>
						<th class="px-6 py-4 text-left text-sm font-semibold" style="color: var(--text-primary);">Utilisateur</th>
						<th class="px-6 py-4 text-left text-sm font-semibold" style="color: var(--text-primary);">Modèle</th>
						<th class="px-6 py-4 text-left text-sm font-semibold" style="color: var(--text-primary);">Tokens In</th>
						<th class="px-6 py-4 text-left text-sm font-semibold" style="color: var(--text-primary);">Tokens Out</th>
						<th class="px-6 py-4 text-left text-sm font-semibold" style="color: var(--text-primary);">Total</th>
						<th class="px-6 py-4 text-left text-sm font-semibold" style="color: var(--text-primary);">Coût</th>
					</tr>
				</thead>
				<tbody>
					{#each data.recentLogs as log}
						<tr class="border-b" style="border-color: var(--border-subtle);">
							<td class="px-6 py-4 text-sm" style="color: var(--text-secondary);">{formatDate(log.timestamp)}</td>
							<td class="px-6 py-4 text-sm font-mono font-medium" style="color: var(--text-primary);">{log.userEmail}</td>
							<td class="px-6 py-4 text-sm font-mono font-medium" style="color: var(--text-primary);">{log.modelUsed}</td>
							<td class="px-6 py-4 text-sm" style="color: var(--text-secondary);">{formatNumber(log.tokensIn)}</td>
							<td class="px-6 py-4 text-sm" style="color: var(--text-secondary);">{formatNumber(log.tokensOut)}</td>
							<td class="px-6 py-4 text-sm" style="color: var(--text-secondary);">{formatNumber(log.totalTokens)}</td>
							<td class="px-6 py-4 text-sm font-semibold" style="color: var(--text-primary);">{formatCost(log.cost)}</td>
						</tr>
					{:else}
						<tr>
							<td colspan="7" class="px-6 py-4 text-center text-sm italic" style="color: var(--text-muted);">Aucun log disponible</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
	</div>
</div>


