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

<div class="user-usage-dashboard">
	<header class="dashboard-header">
		<h1>📊 Mon Utilisation</h1>
		<p>Statistiques et coûts de votre compte</p>
		<div class="user-info">
			Compte: <strong>{data.currentUser.email}</strong>
		</div>
	</header>

	{#if hasDbError}
		<div class="error-banner">
			<h2>⚠️ Configuration Requise</h2>
			<p>{data.error}</p>
			<div class="error-instructions">
				<p>La base de données n'est pas encore configurée. Contactez l'administrateur.</p>
			</div>
		</div>
	{/if}

	<!-- Statistiques Personnelles -->
	<section class="stats-grid">
		<div class="stat-card">
			<div class="stat-icon">📊</div>
			<div class="stat-content">
				<div class="stat-label">Mes Analyses</div>
				<div class="stat-value">{formatNumber(data.userStats.totalAnalyses)}</div>
			</div>
		</div>

		<div class="stat-card">
			<div class="stat-icon">🤖</div>
			<div class="stat-content">
				<div class="stat-label">Appels API</div>
				<div class="stat-value">{formatNumber(data.userStats.totalApiCalls)}</div>
			</div>
		</div>

		<div class="stat-card cost-card">
			<div class="stat-icon">💰</div>
			<div class="stat-content">
				<div class="stat-label">Coût Total</div>
				<div class="stat-value">{formatCost(data.userStats.totalCost)}</div>
			</div>
		</div>

		<div class="stat-card">
			<div class="stat-icon">🔤</div>
			<div class="stat-content">
				<div class="stat-label">Tokens Utilisés</div>
				<div class="stat-value">{formatNumber(data.userStats.totalTokens)}</div>
				<div class="stat-details">
					<span class="detail-item">
						↑ In: {formatNumber(data.userStats.totalTokensIn)}
					</span>
					<span class="detail-item">
						↓ Out: {formatNumber(data.userStats.totalTokensOut)}
					</span>
				</div>
			</div>
		</div>
	</section>

	<!-- Estimation Mensuelle -->
	<section class="cost-projection">
		<h2>📈 Estimation Mensuelle</h2>
		<div class="projection-grid">
			<div class="projection-card">
				<div class="projection-label">Coût 7 derniers jours</div>
				<div class="projection-value">{formatCost(data.monthlyCostEstimate.weekCost)}</div>
			</div>
			<div class="projection-card">
				<div class="projection-label">Moyenne Quotidienne</div>
				<div class="projection-value">{formatCost(data.monthlyCostEstimate.dailyAverage)}</div>
			</div>
			<div class="projection-card highlight">
				<div class="projection-label">Estimation Mensuelle</div>
				<div class="projection-value">{formatCost(data.monthlyCostEstimate.estimatedMonthlyCost)}</div>
				<div class="projection-note">Basée sur l'activité des 7 derniers jours</div>
			</div>
		</div>
	</section>

	<!-- Historique des Appels API -->
	<section class="api-logs">
		<h2>🔍 Historique des Appels API</h2>
		{#if data.recentLogs.length === 0}
			<div class="empty-state">
				<p>Aucun appel API enregistré pour le moment.</p>
				<p>Créez votre première analyse pour voir les statistiques ici.</p>
			</div>
		{:else}
			<div class="logs-table-container">
				<table class="logs-table">
					<thead>
						<tr>
							<th>Date & Heure</th>
							<th>Modèle</th>
							<th>Tokens In</th>
							<th>Tokens Out</th>
							<th>Coût</th>
						</tr>
					</thead>
					<tbody>
						{#each data.recentLogs as log}
							<tr>
								<td>{formatDate(log.timestamp)}</td>
								<td class="model-name">{log.modelUsed}</td>
								<td>{formatNumber(log.tokensIn)}</td>
								<td>{formatNumber(log.tokensOut)}</td>
								<td class="cost-cell">{formatCost(log.cost)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>

	<!-- Actions Rapides -->
	<section class="quick-actions">
		<h2>Actions Rapides</h2>
		<div class="actions-grid">
			<a href="/nouvelle-analyse" class="action-btn primary">
				<span class="action-icon">✨</span>
				<span class="action-label">Nouvelle Analyse</span>
			</a>
			<a href="/tableau-de-bord" class="action-btn">
				<span class="action-icon">📊</span>
				<span class="action-label">Mes Analyses</span>
			</a>
		</div>
	</section>
</div>

<style>
	.user-usage-dashboard {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.dashboard-header {
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid #e0e0e0;
	}

	.dashboard-header h1 {
		font-size: 2rem;
		margin-bottom: 0.5rem;
		color: #333;
	}

	.dashboard-header p {
		color: #666;
		margin-bottom: 1rem;
	}

	.user-info {
		color: #666;
		font-size: 0.9rem;
	}

	.user-info strong {
		color: #667eea;
	}

	/* Error Banner */
	.error-banner {
		background: #fee;
		border: 2px solid #fcc;
		border-radius: 8px;
		padding: 1.5rem;
		margin-bottom: 2rem;
	}

	.error-banner h2 {
		color: #c00;
		margin-bottom: 0.5rem;
	}

	.error-instructions {
		margin-top: 1rem;
		color: #666;
	}

	/* Stats Grid */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.stat-card {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		display: flex;
		align-items: center;
		gap: 1rem;
		transition: transform 0.3s ease, box-shadow 0.3s ease;
	}

	.stat-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
	}

	.stat-card.cost-card {
		border-left: 4px solid #f59e0b;
	}

	.stat-icon {
		font-size: 2.5rem;
	}

	.stat-content {
		flex: 1;
	}

	.stat-label {
		font-size: 0.9rem;
		color: #666;
		margin-bottom: 0.25rem;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: 700;
		color: #333;
	}

	.stat-details {
		display: flex;
		gap: 1rem;
		margin-top: 0.5rem;
		font-size: 0.85rem;
		color: #666;
	}

	/* Cost Projection */
	.cost-projection {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		margin-bottom: 2rem;
	}

	.cost-projection h2 {
		margin-bottom: 1.5rem;
		color: #333;
	}

	.projection-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.projection-card {
		background: #f8f9fa;
		border-radius: 8px;
		padding: 1.5rem;
		text-align: center;
	}

	.projection-card.highlight {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.projection-label {
		font-size: 0.85rem;
		opacity: 0.8;
		margin-bottom: 0.5rem;
	}

	.projection-value {
		font-size: 1.8rem;
		font-weight: 700;
		margin-bottom: 0.25rem;
	}

	.projection-note {
		font-size: 0.75rem;
		opacity: 0.8;
		margin-top: 0.5rem;
	}

	/* API Logs */
	.api-logs {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		margin-bottom: 2rem;
	}

	.api-logs h2 {
		margin-bottom: 1.5rem;
		color: #333;
	}

	.empty-state {
		text-align: center;
		padding: 3rem;
		color: #666;
	}

	.logs-table-container {
		overflow-x: auto;
	}

	.logs-table {
		width: 100%;
		border-collapse: collapse;
	}

	.logs-table thead {
		background: #f8f9fa;
	}

	.logs-table th {
		padding: 0.75rem;
		text-align: left;
		font-weight: 600;
		color: #666;
		border-bottom: 2px solid #e0e0e0;
	}

	.logs-table td {
		padding: 0.75rem;
		border-bottom: 1px solid #f0f0f0;
	}

	.logs-table tbody tr:hover {
		background: #f8f9fa;
	}

	.model-name {
		font-family: 'Monaco', 'Courier New', monospace;
		font-size: 0.85rem;
		color: #667eea;
	}

	.cost-cell {
		font-weight: 600;
		color: #f59e0b;
	}

	/* Quick Actions */
	.quick-actions {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.quick-actions h2 {
		margin-bottom: 1.5rem;
		color: #333;
	}

	.actions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		padding: 1rem 1.5rem;
		border-radius: 8px;
		text-decoration: none;
		font-weight: 600;
		transition: all 0.3s ease;
		border: 2px solid #e0e0e0;
		color: #333;
	}

	.action-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.action-btn.primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-color: transparent;
	}

	.action-icon {
		font-size: 1.5rem;
	}

	@media (max-width: 768px) {
		.user-usage-dashboard {
			padding: 1rem;
		}

		.stats-grid {
			grid-template-columns: 1fr;
		}

		.projection-grid {
			grid-template-columns: 1fr;
		}

		.logs-table {
			font-size: 0.85rem;
		}

		.logs-table th,
		.logs-table td {
			padding: 0.5rem;
		}
	}
</style>

