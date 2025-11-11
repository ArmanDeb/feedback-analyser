<script lang="ts">
	import type { AnalyzeResponse, ApiError } from '$lib/types';

	// Dashboard - Interface principale de l'utilisateur
	let feedback = '';
	let isAnalyzing = false;
	let analysisResult: AnalyzeResponse | null = null;
	let error: string | null = null;

	async function analyzeFeedback() {
		// Validation
		if (!feedback.trim()) {
			error = 'Veuillez entrer du feedback à analyser';
			return;
		}

		if (feedback.length > 5000) {
			error = 'Le feedback est trop long (maximum 5000 caractères)';
			return;
		}

		// Reset state
		isAnalyzing = true;
		analysisResult = null;
		error = null;

		try {
			console.log('📤 Envoi du feedback à l\'API...');
			
			const response = await fetch('/api/analyze', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ feedbackText: feedback })
			});

			const data = await response.json();

			if (!response.ok) {
				const apiError = data as ApiError;
				throw new Error(apiError.details || apiError.error || 'Erreur inconnue');
			}

			analysisResult = data as AnalyzeResponse;
			console.log('✅ Analyse complétée:', analysisResult);

		} catch (err) {
			console.error('❌ Erreur lors de l\'analyse:', err);
			error = err instanceof Error ? err.message : 'Une erreur est survenue';
		} finally {
			isAnalyzing = false;
		}
	}

	// Helper pour la couleur du sentiment
	function getSentimentColor(sentiment: string): string {
		switch (sentiment) {
			case 'positive': return '#10b981';
			case 'negative': return '#ef4444';
			default: return '#6b7280';
		}
	}

	// Helper pour la couleur de sévérité
	function getSeverityColor(severity: string): string {
		switch (severity) {
			case 'high': return '#ef4444';
			case 'medium': return '#f59e0b';
			default: return '#6b7280';
		}
	}
</script>

<svelte:head>
	<title>Dashboard - Analyseur de Feedback</title>
</svelte:head>

<div class="dashboard">
	<header class="dashboard-header">
		<h1>Tableau de Bord</h1>
		<p>Analysez vos feedbacks clients en quelques secondes</p>
	</header>

	<main class="dashboard-main">
		<section class="analyzer-section">
			<h2>Nouvelle Analyse</h2>
			<div class="analyzer-card">
				<textarea
					bind:value={feedback}
					placeholder="Collez ici le feedback client à analyser...&#10;&#10;Exemple: 'J'adore votre produit mais j'ai rencontré un bug lors du paiement. Aussi, ce serait génial d'avoir une fonctionnalité d'export en PDF.'"
					rows="8"
					disabled={isAnalyzing}
				></textarea>

				<button 
					class="btn-analyze" 
					on:click={analyzeFeedback}
					disabled={isAnalyzing || !feedback.trim()}
				>
					{#if isAnalyzing}
						<span class="spinner"></span>
						Analyse en cours...
					{:else}
						Analyser le Feedback
					{/if}
				</button>
			</div>
		</section>

	{#if error}
		<section class="error-section">
			<div class="error-card">
				<h3>❌ Erreur</h3>
				<p>{error}</p>
			</div>
		</section>
	{/if}

	{#if analysisResult}
		<section class="results-section">
			<h2>📊 Résultats de l'Analyse</h2>
			
			<!-- Sentiment général -->
			<div class="sentiment-card" style="border-left-color: {getSentimentColor(analysisResult.analysis.sentiment)}">
				<div class="sentiment-header">
					<h3>Sentiment Général</h3>
					<span class="sentiment-badge" style="background: {getSentimentColor(analysisResult.analysis.sentiment)}">
						{analysisResult.analysis.sentiment}
					</span>
				</div>
				<div class="sentiment-score">
					Score: {analysisResult.analysis.score.toFixed(2)} / 1.0
				</div>
				<p class="summary">{analysisResult.analysis.summary}</p>
			</div>

			<!-- Thèmes -->
			<div class="themes-grid">
				<div class="theme-card positive">
					<h3>✅ Points Positifs</h3>
					{#if analysisResult.analysis.themes.positive.length > 0}
						<ul>
							{#each analysisResult.analysis.themes.positive as theme}
								<li>{theme}</li>
							{/each}
						</ul>
					{:else}
						<p class="empty">Aucun point positif identifié</p>
					{/if}
				</div>

				<div class="theme-card negative">
					<h3>⚠️ Points Négatifs</h3>
					{#if analysisResult.analysis.themes.negative.length > 0}
						<ul>
							{#each analysisResult.analysis.themes.negative as theme}
								<li>{theme}</li>
							{/each}
						</ul>
					{:else}
						<p class="empty">Aucun point négatif identifié</p>
					{/if}
				</div>
			</div>

			<!-- Bugs -->
			{#if analysisResult.analysis.bugs.length > 0}
				<div class="bugs-card">
					<h3>🐛 Bugs Identifiés ({analysisResult.analysis.bugs.length})</h3>
					<div class="bugs-list">
						{#each analysisResult.analysis.bugs as bug}
							<div class="bug-item" style="border-left-color: {getSeverityColor(bug.severity)}">
								<span class="severity-badge" style="background: {getSeverityColor(bug.severity)}">
									{bug.severity}
								</span>
								<p>{bug.description}</p>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Feature Requests -->
			{#if analysisResult.analysis.featureRequests.length > 0}
				<div class="features-card">
					<h3>💡 Demandes de Fonctionnalités ({analysisResult.analysis.featureRequests.length})</h3>
					<div class="features-list">
						{#each analysisResult.analysis.featureRequests as feature}
							<div class="feature-item" style="border-left-color: {getSeverityColor(feature.priority)}">
								<span class="priority-badge" style="background: {getSeverityColor(feature.priority)}">
									{feature.priority}
								</span>
								<p>{feature.description}</p>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Métadonnées -->
			<div class="metadata-card">
				<h4>📈 Métadonnées</h4>
				<div class="metadata-grid">
					<div class="metadata-item">
						<span class="label">Modèle:</span>
						<span class="value">{analysisResult.metadata.model}</span>
					</div>
					<div class="metadata-item">
						<span class="label">Tokens:</span>
						<span class="value">{analysisResult.metadata.totalTokens}</span>
					</div>
					<div class="metadata-item">
						<span class="label">Durée:</span>
						<span class="value">{(analysisResult.metadata.duration / 1000).toFixed(2)}s</span>
					</div>
					<div class="metadata-item">
						<span class="label">Timestamp:</span>
						<span class="value">{new Date(analysisResult.metadata.timestamp).toLocaleString('fr-FR')}</span>
					</div>
				</div>
			</div>
		</section>
	{/if}

		<section class="history-section">
			<h2>Historique des Analyses</h2>
			<div class="history-placeholder">
				<p>Aucune analyse pour le moment. Commencez par analyser votre premier feedback !</p>
				<p class="note">L'historique sera implémenté dans l'Épopée S4</p>
			</div>
		</section>
	</main>
</div>

<style>
	.dashboard {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.dashboard-header {
		margin-bottom: 3rem;
	}

	.dashboard-header h1 {
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
		color: #333;
	}

	.dashboard-header p {
		color: #666;
		font-size: 1.1rem;
	}

	.dashboard-main {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.analyzer-section h2,
	.results-section h2,
	.history-section h2 {
		font-size: 1.5rem;
		margin-bottom: 1rem;
		color: #333;
	}

	.analyzer-card {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	textarea {
		width: 100%;
		padding: 1rem;
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		font-family: inherit;
		font-size: 1rem;
		resize: vertical;
		margin-bottom: 1rem;
		transition: border-color 0.3s ease;
	}

	textarea:focus {
		outline: none;
		border-color: #667eea;
	}

	textarea:disabled {
		background-color: #f5f5f5;
		cursor: not-allowed;
	}

	.btn-analyze {
		width: 100%;
		padding: 1rem 2rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 1.1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.btn-analyze:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.btn-analyze:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}


	.history-placeholder {
		background: white;
		padding: 3rem;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		text-align: center;
		color: #666;
	}

	.history-placeholder .note {
		font-size: 0.9rem;
		color: #999;
		font-style: italic;
		margin-top: 0.5rem;
	}

	/* Error section */
	.error-section {
		margin: 2rem 0;
	}

	.error-card {
		background: #fee;
		border: 2px solid #ef4444;
		border-radius: 12px;
		padding: 1.5rem;
		color: #991b1b;
	}

	.error-card h3 {
		margin: 0 0 0.5rem 0;
		color: #dc2626;
	}

	.error-card p {
		margin: 0;
		color: #7f1d1d;
	}

	/* Sentiment card */
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

	.sentiment-score {
		font-size: 1.25rem;
		font-weight: 600;
		color: #667eea;
		margin-bottom: 1rem;
	}

	.summary {
		font-size: 1rem;
		color: #666;
		line-height: 1.6;
	}

	/* Themes grid */
	.themes-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.theme-card {
		background: white;
		padding: 1.5rem;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		border-left: 4px solid;
	}

	.theme-card.positive {
		border-left-color: #10b981;
	}

	.theme-card.negative {
		border-left-color: #ef4444;
	}

	.theme-card h3 {
		margin: 0 0 1rem 0;
		font-size: 1.25rem;
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

	/* Bugs card */
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

	/* Features card */
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

	/* Metadata card */
	.metadata-card {
		background: #f8f9fa;
		padding: 1.5rem;
		border-radius: 12px;
	}

	.metadata-card h4 {
		margin: 0 0 1rem 0;
		font-size: 1rem;
		color: #666;
	}

	.metadata-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.metadata-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.metadata-item .label {
		font-size: 0.85rem;
		color: #999;
	}

	.metadata-item .value {
		font-weight: 600;
		color: #333;
	}
</style>

