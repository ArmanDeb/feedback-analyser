<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

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

<div class="admin-dashboard">
	<header class="admin-header">
		<h1>🔐 Dashboard Admin</h1>
		<p>Monitoring des coûts et statistiques d'utilisation</p>
		<div class="user-info">
			Connecté en tant que: <strong>{data.currentUser.email}</strong>
		</div>
	</header>

	<!-- Statistiques Globales -->
	<section class="stats-grid">
		<div class="stat-card">
			<div class="stat-icon">📊</div>
			<div class="stat-content">
				<div class="stat-label">Total Analyses</div>
				<div class="stat-value">{formatNumber(data.globalStats.totalAnalyses)}</div>
			</div>
		</div>

		<div class="stat-card">
			<div class="stat-icon">👥</div>
			<div class="stat-content">
				<div class="stat-label">Utilisateurs</div>
				<div class="stat-value">{formatNumber(data.globalStats.totalUsers)}</div>
			</div>
		</div>

		<div class="stat-card">
			<div class="stat-icon">🤖</div>
			<div class="stat-content">
				<div class="stat-label">Appels API</div>
				<div class="stat-value">{formatNumber(data.globalStats.totalApiCalls)}</div>
			</div>
		</div>

		<div class="stat-card highlight">
			<div class="stat-icon">💰</div>
			<div class="stat-content">
				<div class="stat-label">Coût Total</div>
				<div class="stat-value">{formatCost(data.globalStats.totalCost)}</div>
			</div>
		</div>

		<div class="stat-card">
			<div class="stat-icon">🔢</div>
			<div class="stat-content">
				<div class="stat-label">Tokens In</div>
				<div class="stat-value">{formatNumber(data.globalStats.totalTokensIn)}</div>
			</div>
		</div>

		<div class="stat-card">
			<div class="stat-icon">📤</div>
			<div class="stat-content">
				<div class="stat-label">Tokens Out</div>
				<div class="stat-value">{formatNumber(data.globalStats.totalTokensOut)}</div>
			</div>
		</div>
	</section>

	<!-- Estimation Coût Mensuel -->
	<section class="monthly-estimate">
		<h2>📈 Estimation Mensuelle</h2>
		<div class="estimate-grid">
			<div class="estimate-card">
				<div class="estimate-label">Coût (7 derniers jours)</div>
				<div class="estimate-value">{formatCost(data.monthlyCostEstimate.weekCost)}</div>
			</div>
			<div class="estimate-card">
				<div class="estimate-label">Moyenne journalière</div>
				<div class="estimate-value">{formatCost(data.monthlyCostEstimate.dailyAverage)}</div>
			</div>
			<div class="estimate-card highlight">
				<div class="estimate-label">Estimation mensuelle</div>
				<div class="estimate-value">{formatCost(data.monthlyCostEstimate.estimatedMonthlyCost)}</div>
			</div>
		</div>
	</section>

	<!-- Statistiques par Utilisateur -->
	<section class="user-stats">
		<h2>👥 Statistiques par Utilisateur</h2>
		<div class="table-container">
			<table>
				<thead>
					<tr>
						<th>Email</th>
						<th>Rôle</th>
						<th>Analyses</th>
						<th>Appels API</th>
						<th>Tokens</th>
						<th>Coût Total</th>
						<th>Coût Moyen</th>
					</tr>
				</thead>
				<tbody>
					{#each data.userStats as user}
						<tr>
							<td class="email">{user.email}</td>
							<td>
								<span class="role-badge" class:admin={user.role === 'admin'}>
									{user.role}
								</span>
							</td>
							<td>{formatNumber(user.analysesCount)}</td>
							<td>{formatNumber(user.apiCallsCount)}</td>
							<td>{formatNumber(user.totalTokens)}</td>
							<td class="cost">{formatCost(user.totalCost)}</td>
							<td class="cost">{formatCost(user.avgCostPerCall)}</td>
						</tr>
					{:else}
						<tr>
							<td colspan="7" class="empty">Aucune donnée utilisateur</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<!-- Logs API Récents -->
	<section class="recent-logs">
		<h2>📋 Logs API Récents (50 derniers)</h2>
		<div class="table-container">
			<table>
				<thead>
					<tr>
						<th>Date/Heure</th>
						<th>Utilisateur</th>
						<th>Modèle</th>
						<th>Tokens In</th>
						<th>Tokens Out</th>
						<th>Total</th>
						<th>Coût</th>
					</tr>
				</thead>
				<tbody>
					{#each data.recentLogs as log}
						<tr>
							<td class="timestamp">{formatDate(log.timestamp)}</td>
							<td class="email">{log.userEmail}</td>
							<td class="model">{log.modelUsed}</td>
							<td>{formatNumber(log.tokensIn)}</td>
							<td>{formatNumber(log.tokensOut)}</td>
							<td>{formatNumber(log.totalTokens)}</td>
							<td class="cost">{formatCost(log.cost)}</td>
						</tr>
					{:else}
						<tr>
							<td colspan="7" class="empty">Aucun log disponible</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
</div>

<style>
	.admin-dashboard {
		max-width: 1400px;
		margin: 0 auto;
		padding: 2rem;
	}

	.admin-header {
		margin-bottom: 3rem;
		padding-bottom: 2rem;
		border-bottom: 2px solid #e0e0e0;
	}

	.admin-header h1 {
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
		color: #333;
	}

	.admin-header p {
		color: #666;
		font-size: 1.1rem;
		margin-bottom: 1rem;
	}

	.user-info {
		color: #667eea;
		font-size: 0.95rem;
	}

	/* Stats Grid */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
		margin-bottom: 3rem;
	}

	.stat-card {
		background: white;
		padding: 1.5rem;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		display: flex;
		align-items: center;
		gap: 1rem;
		transition: transform 0.3s ease;
	}

	.stat-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.stat-card.highlight {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.stat-icon {
		font-size: 2.5rem;
	}

	.stat-content {
		flex: 1;
	}

	.stat-label {
		font-size: 0.85rem;
		opacity: 0.8;
		margin-bottom: 0.25rem;
	}

	.stat-value {
		font-size: 1.75rem;
		font-weight: 700;
	}

	/* Monthly Estimate */
	.monthly-estimate {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		margin-bottom: 3rem;
	}

	.monthly-estimate h2 {
		margin: 0 0 1.5rem 0;
		font-size: 1.5rem;
	}

	.estimate-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
	}

	.estimate-card {
		padding: 1.5rem;
		background: #f8f9fa;
		border-radius: 8px;
		text-align: center;
	}

	.estimate-card.highlight {
		background: linear-gradient(135deg, #10b981 0%, #059669 100%);
		color: white;
	}

	.estimate-label {
		font-size: 0.9rem;
		opacity: 0.8;
		margin-bottom: 0.5rem;
	}

	.estimate-value {
		font-size: 1.75rem;
		font-weight: 700;
	}

	/* User Stats & Logs */
	.user-stats,
	.recent-logs {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		margin-bottom: 3rem;
	}

	.user-stats h2,
	.recent-logs h2 {
		margin: 0 0 1.5rem 0;
		font-size: 1.5rem;
	}

	.table-container {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th {
		text-align: left;
		padding: 1rem;
		background: #f8f9fa;
		font-weight: 600;
		color: #333;
		border-bottom: 2px solid #e0e0e0;
	}

	td {
		padding: 1rem;
		border-bottom: 1px solid #f0f0f0;
	}

	tr:hover {
		background: #f8f9fa;
	}

	.email {
		font-family: monospace;
		font-size: 0.9rem;
		color: #667eea;
	}

	.role-badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		background: #e0e0e0;
		border-radius: 12px;
		font-size: 0.85rem;
		font-weight: 600;
	}

	.role-badge.admin {
		background: #667eea;
		color: white;
	}

	.cost {
		font-weight: 600;
		color: #10b981;
	}

	.model {
		font-family: monospace;
		font-size: 0.85rem;
		color: #666;
	}

	.timestamp {
		font-size: 0.9rem;
		color: #666;
	}

	.empty {
		text-align: center;
		color: #999;
		font-style: italic;
		padding: 2rem;
	}

	@media (max-width: 768px) {
		.admin-dashboard {
			padding: 1rem;
		}

		.stats-grid {
			grid-template-columns: 1fr;
		}

		.estimate-grid {
			grid-template-columns: 1fr;
		}

		table {
			font-size: 0.85rem;
		}

		th, td {
			padding: 0.5rem;
		}
	}
</style>

