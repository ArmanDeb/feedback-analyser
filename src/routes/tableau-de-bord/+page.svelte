<script lang="ts">
	import type { SavedAnalysis, AnalysisResult } from '$lib/types';
	import type { PageData } from './$types';

	export let data: PageData;

	let analyses = data.analyses || [];
	let totalAnalyses = data.totalAnalyses || 0;
	let selectedAnalysis: SavedAnalysis | null = null;

	function viewAnalysis(item: SavedAnalysis) {
		selectedAnalysis = item;
		document.querySelector('.results-section')?.scrollIntoView({ behavior: 'smooth' });
	}

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

	function getSentimentGaugeRotation(score: number): number {
		return ((score + 1) / 2) * 180;
	}

	function getSentimentColor(sentiment: string): string {
		switch (sentiment) {
			case 'positive': return '#10b981';
			case 'negative': return '#ef4444';
			default: return '#6b7280';
		}
	}

	function getSeverityColor(severity: string): string {
		switch (severity) {
			case 'high': return '#ef4444';
			case 'medium': return '#f59e0b';
			default: return '#6b7280';
		}
	}
</script>

<svelte:head>
	<title>Tableau de Bord - Analyseur de Feedback</title>
</svelte:head>

<div class="page">
	<header class="page-header">
		<h1>Tableau de Bord</h1>
		<p>Gérez et consultez toutes vos analyses de feedback</p>
	</header>

	<main class="page-main">
		<!-- Stats -->
		<section class="stats-section">
			<div class="stat-card">
				<div class="stat-icon">📊</div>
				<div class="stat-content">
					<div class="stat-value">{totalAnalyses}</div>
					<div class="stat-label">Analyses Total</div>
				</div>
			</div>
			<div class="stat-card">
				<div class="stat-icon">📋</div>
				<div class="stat-content">
					<div class="stat-value">{analyses.length}</div>
					<div class="stat-label">Analyses Récentes</div>
				</div>
			</div>
			<div class="stat-card action-card">
				<a href="/nouvelle-analyse" class="stat-link">
					<div class="stat-icon">✨</div>
					<div class="stat-content">
						<div class="stat-label">Nouvelle Analyse</div>
						<div class="stat-cta">Créer →</div>
					</div>
				</a>
			</div>
		</section>

		<!-- Historique -->
		<section class="history-section">
			<h2>📋 Historique des Analyses</h2>
			{#if analyses.length > 0}
				<div class="history-grid">
					{#each analyses as analysis}
						<div 
							class="history-card" 
							class:selected={selectedAnalysis?.id === analysis.id}
							on:click={() => viewAnalysis(analysis)} 
							on:keypress={(e) => e.key === 'Enter' && viewAnalysis(analysis)} 
							role="button" 
							tabindex="0"
						>
							<div class="history-header">
								<span class="history-date">{formatDate(analysis.createdAt)}</span>
								<span 
									class="sentiment-dot" 
									style="background: {getSentimentColor(analysis.result.sentiment)}" 
									title="{analysis.result.sentiment}"
								></span>
							</div>
							<p class="history-feedback">{truncateText(analysis.feedbackText)}</p>
							<div class="history-meta">
								<span class="meta-item">
									{#if analysis.result.bugs.length > 0}
										🐛 {analysis.result.bugs.length}
									{/if}
								</span>
								<span class="meta-item">
									{#if analysis.result.featureRequests.length > 0}
										💡 {analysis.result.featureRequests.length}
									{/if}
								</span>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="empty-state">
					<h3>Aucune analyse pour le moment</h3>
					<p>Commencez par analyser votre premier feedback !</p>
					<a href="/nouvelle-analyse" class="btn-primary">Créer une analyse</a>
				</div>
			{/if}
		</section>

		<!-- Résultats de l'analyse sélectionnée -->
		{#if selectedAnalysis}
			{@const displayResult = selectedAnalysis.result}
			{@const totalThemes = displayResult.themes.positive.length + displayResult.themes.negative.length}
			{@const positivePercentage = totalThemes > 0 ? (displayResult.themes.positive.length / totalThemes) * 100 : 50}
			{@const negativePercentage = totalThemes > 0 ? (displayResult.themes.negative.length / totalThemes) * 100 : 50}
			<section class="results-section">
				<div class="results-header">
					<h2>📊 Résultats de l'Analyse</h2>
					<button class="btn-close" on:click={() => selectedAnalysis = null}>✕ Fermer</button>
				</div>
				
				<!-- Sentiment général -->
				<div class="sentiment-card" style="border-left-color: {getSentimentColor(displayResult.sentiment)}">
					<div class="sentiment-header">
						<h3>Sentiment Général</h3>
						<span class="sentiment-badge" style="background: {getSentimentColor(displayResult.sentiment)}">
							{displayResult.sentiment}
						</span>
					</div>
					
					<div class="sentiment-gauge-container">
						<svg class="sentiment-gauge" viewBox="0 0 200 120" width="200" height="120">
							<path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e0e0e0" stroke-width="20" stroke-linecap="round"/>
							<path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="{getSentimentColor(displayResult.sentiment)}" stroke-width="20" stroke-linecap="round" stroke-dasharray="{((displayResult.score + 1) / 2) * 251.2} 251.2" style="transition: stroke-dasharray 1s ease;"/>
							<g transform="translate(100, 100) rotate({getSentimentGaugeRotation(displayResult.score) - 90})">
								<line x1="0" y1="0" x2="70" y2="0" stroke="#333" stroke-width="3" stroke-linecap="round"/>
								<circle cx="0" cy="0" r="5" fill="#333"/>
							</g>
							<text x="15" y="115" font-size="10" fill="#999">-1</text>
							<text x="93" y="30" font-size="10" fill="#999">0</text>
							<text x="178" y="115" font-size="10" fill="#999">+1</text>
						</svg>
						<div class="sentiment-score">Score: {displayResult.score.toFixed(2)}</div>
					</div>
					
					<p class="summary">{displayResult.summary}</p>
				</div>

				<!-- Thèmes -->
				<div class="themes-container">
					<h3>🎯 Distribution des Thèmes</h3>
					
					<div class="theme-distribution">
						<div class="distribution-chart">
							<div class="chart-bar">
								<div class="bar-segment positive" style="width: {positivePercentage}%">
									<span class="bar-label">{displayResult.themes.positive.length} positif{displayResult.themes.positive.length > 1 ? 's' : ''}</span>
								</div>
								<div class="bar-segment negative" style="width: {negativePercentage}%">
									<span class="bar-label">{displayResult.themes.negative.length} négatif{displayResult.themes.negative.length > 1 ? 's' : ''}</span>
								</div>
							</div>
						</div>
					</div>
					
					<div class="themes-grid">
						<div class="theme-card positive">
							<h4>✅ Points Positifs ({displayResult.themes.positive.length})</h4>
							{#if displayResult.themes.positive.length > 0}
								<ul>
									{#each displayResult.themes.positive as theme}
										<li>{theme}</li>
									{/each}
								</ul>
							{:else}
								<p class="empty">Aucun point positif identifié</p>
							{/if}
						</div>

						<div class="theme-card negative">
							<h4>⚠️ Points Négatifs ({displayResult.themes.negative.length})</h4>
							{#if displayResult.themes.negative.length > 0}
								<ul>
									{#each displayResult.themes.negative as theme}
										<li>{theme}</li>
									{/each}
								</ul>
							{:else}
								<p class="empty">Aucun point négatif identifié</p>
							{/if}
						</div>
					</div>
				</div>

				{#if displayResult.bugs.length > 0}
					<div class="bugs-card">
						<h3>🐛 Bugs Identifiés ({displayResult.bugs.length})</h3>
						<div class="bugs-list">
							{#each displayResult.bugs as bug}
								<div class="bug-item" style="border-left-color: {getSeverityColor(bug.severity)}">
									<span class="severity-badge" style="background: {getSeverityColor(bug.severity)}">{bug.severity}</span>
									<p>{bug.description}</p>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				{#if displayResult.featureRequests.length > 0}
					<div class="features-card">
						<h3>💡 Demandes de Fonctionnalités ({displayResult.featureRequests.length})</h3>
						<div class="features-list">
							{#each displayResult.featureRequests as feature}
								<div class="feature-item" style="border-left-color: {getSeverityColor(feature.priority)}">
									<span class="priority-badge" style="background: {getSeverityColor(feature.priority)}">{feature.priority}</span>
									<p>{feature.description}</p>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Feedback original -->
				<div class="original-feedback-card">
					<h4>📝 Feedback Original</h4>
					<p class="original-text">{selectedAnalysis.feedbackText}</p>
					<div class="original-meta">
						<span>Analysé le: {formatDate(selectedAnalysis.createdAt)}</span>
					</div>
				</div>
			</section>
		{/if}
	</main>
</div>

<style>
	.page {
		max-width: 1400px;
		margin: 0 auto;
		padding: 2rem;
	}

	.page-header {
		margin-bottom: 3rem;
	}

	.page-header h1 {
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
		color: #333;
	}

	.page-header p {
		color: #666;
		font-size: 1.1rem;
	}

	.page-main {
		display: flex;
		flex-direction: column;
		gap: 3rem;
	}

	/* Stats */
	.stats-section {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.stat-card {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.stat-card.action-card {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		cursor: pointer;
		transition: transform 0.3s ease, box-shadow 0.3s ease;
	}

	.stat-card.action-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
	}

	.stat-link {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		text-decoration: none;
		color: white;
		width: 100%;
	}

	.stat-icon {
		font-size: 2.5rem;
	}

	.action-card .stat-icon {
		filter: brightness(0) invert(1);
	}

	.stat-content {
		flex: 1;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: 700;
		color: #333;
		line-height: 1;
		margin-bottom: 0.25rem;
	}

	.stat-label {
		font-size: 0.9rem;
		color: #666;
		font-weight: 500;
	}

	.stat-cta {
		font-size: 1.1rem;
		font-weight: 600;
		margin-top: 0.25rem;
	}

	/* Historique */
	.history-section h2 {
		font-size: 1.5rem;
		margin-bottom: 1.5rem;
		color: #333;
	}

	.history-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 1.5rem;
	}

	.history-card {
		background: white;
		padding: 1.5rem;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		cursor: pointer;
		transition: all 0.3s ease;
		border-left: 4px solid #667eea;
	}

	.history-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
	}

	.history-card.selected {
		border-left-color: #764ba2;
		box-shadow: 0 4px 16px rgba(118, 75, 162, 0.3);
	}

	.history-card:focus {
		outline: 2px solid #667eea;
		outline-offset: 2px;
	}

	.history-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.history-date {
		font-size: 0.85rem;
		color: #666;
		font-weight: 600;
	}

	.sentiment-dot {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.history-feedback {
		color: #333;
		line-height: 1.5;
		margin-bottom: 1rem;
		min-height: 3rem;
	}

	.history-meta {
		display: flex;
		gap: 1rem;
		font-size: 0.9rem;
		color: #666;
	}

	.meta-item {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.empty-state {
		background: white;
		padding: 4rem 2rem;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		text-align: center;
	}

	.empty-state h3 {
		font-size: 1.5rem;
		color: #333;
		margin-bottom: 0.5rem;
	}

	.empty-state p {
		color: #666;
		margin-bottom: 2rem;
	}

	.btn-primary {
		display: inline-block;
		padding: 1rem 2rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		text-decoration: none;
		border-radius: 8px;
		font-weight: 600;
		transition: all 0.3s ease;
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	/* Results */
	.results-section {
		animation: slideIn 0.3s ease;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.results-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.results-header h2 {
		font-size: 1.5rem;
		color: #333;
	}

	.btn-close {
		background: #ef4444;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 8px;
		cursor: pointer;
		font-weight: 600;
		transition: all 0.3s ease;
	}

	.btn-close:hover {
		background: #dc2626;
		transform: translateY(-2px);
	}

	.sentiment-card {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		border-left: 4px solid;
		margin-bottom: 2rem;
	}

	.sentiment-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.sentiment-header h3 {
		margin: 0;
		font-size: 1.5rem;
	}

	.sentiment-badge {
		padding: 0.5rem 1rem;
		border-radius: 20px;
		color: white;
		font-weight: 600;
		text-transform: uppercase;
		font-size: 0.85rem;
	}

	.sentiment-gauge-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 1.5rem 0;
	}

	.sentiment-gauge {
		margin-bottom: 0.5rem;
	}

	.sentiment-score {
		font-size: 1.25rem;
		font-weight: 600;
		color: #667eea;
		text-align: center;
	}

	.summary {
		font-size: 1rem;
		color: #666;
		line-height: 1.6;
	}

	.themes-container {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		margin-bottom: 2rem;
	}

	.themes-container > h3 {
		margin: 0 0 1.5rem 0;
		font-size: 1.5rem;
	}

	.theme-distribution {
		margin-bottom: 2rem;
	}

	.distribution-chart {
		width: 100%;
	}

	.chart-bar {
		display: flex;
		height: 60px;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.bar-segment {
		display: flex;
		align-items: center;
		justify-content: center;
		transition: width 1s ease;
		min-width: 60px;
	}

	.bar-segment.positive {
		background: linear-gradient(135deg, #10b981 0%, #059669 100%);
	}

	.bar-segment.negative {
		background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
	}

	.bar-label {
		color: white;
		font-weight: 600;
		font-size: 0.9rem;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
	}

	.themes-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.theme-card {
		background: #f8f9fa;
		padding: 1.5rem;
		border-radius: 12px;
		border-left: 4px solid;
	}

	.theme-card.positive {
		border-left-color: #10b981;
	}

	.theme-card.negative {
		border-left-color: #ef4444;
	}

	.theme-card h4 {
		margin: 0 0 1rem 0;
		font-size: 1.1rem;
	}

	.theme-card ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.theme-card li {
		padding: 0.75rem;
		background: #f8f9fa;
		border-radius: 8px;
		margin-bottom: 0.5rem;
	}

	.theme-card .empty {
		color: #999;
		font-style: italic;
	}

	.bugs-card {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		margin-bottom: 2rem;
	}

	.bugs-card h3 {
		margin: 0 0 1.5rem 0;
		font-size: 1.5rem;
	}

	.bugs-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.bug-item {
		padding: 1rem;
		background: #fef2f2;
		border-left: 4px solid;
		border-radius: 8px;
		display: flex;
		align-items: flex-start;
		gap: 1rem;
	}

	.severity-badge {
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		color: white;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		flex-shrink: 0;
	}

	.bug-item p {
		margin: 0;
		flex: 1;
	}

	.features-card {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		margin-bottom: 2rem;
	}

	.features-card h3 {
		margin: 0 0 1.5rem 0;
		font-size: 1.5rem;
	}

	.features-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.feature-item {
		padding: 1rem;
		background: #f0f9ff;
		border-left: 4px solid;
		border-radius: 8px;
		display: flex;
		align-items: flex-start;
		gap: 1rem;
	}

	.priority-badge {
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		color: white;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		flex-shrink: 0;
	}

	.feature-item p {
		margin: 0;
		flex: 1;
	}

	.original-feedback-card {
		background: #f8f9fa;
		padding: 2rem;
		border-radius: 12px;
		border: 2px dashed #e0e0e0;
	}

	.original-feedback-card h4 {
		margin: 0 0 1rem 0;
		font-size: 1.1rem;
		color: #666;
	}

	.original-text {
		font-size: 1rem;
		color: #333;
		line-height: 1.6;
		margin-bottom: 1rem;
		white-space: pre-wrap;
	}

	.original-meta {
		font-size: 0.85rem;
		color: #999;
		font-style: italic;
	}
</style>

