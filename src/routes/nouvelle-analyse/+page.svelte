<script lang="ts">
	import type { AnalyzeResponse, ApiError } from '$lib/types';

	// Nouvelle Analyse - Interface d'analyse sans historique
	let feedback = '';
	let isAnalyzing = false;
	let analysisResult: AnalyzeResponse | null = null;
	let error: string | null = null;
	
	// Validation en temps réel
	const MAX_FEEDBACK_LENGTH = 5000;
	const MIN_FEEDBACK_LENGTH = 10;
	$: feedbackLength = feedback.length;
	$: isValidLength = feedbackLength >= MIN_FEEDBACK_LENGTH && feedbackLength <= MAX_FEEDBACK_LENGTH;
	$: isTooLong = feedbackLength > MAX_FEEDBACK_LENGTH;
	$: isTooShort = feedbackLength > 0 && feedbackLength < MIN_FEEDBACK_LENGTH;
	$: percentageUsed = (feedbackLength / MAX_FEEDBACK_LENGTH) * 100;

	async function analyzeFeedback() {
		// Validation améliorée
		if (!feedback.trim()) {
			error = '⚠️ Veuillez entrer du feedback à analyser';
			return;
		}

		if (feedback.length < MIN_FEEDBACK_LENGTH) {
			error = `⚠️ Le feedback est trop court (minimum ${MIN_FEEDBACK_LENGTH} caractères, vous avez ${feedback.length})`;
			return;
		}

		if (feedback.length > MAX_FEEDBACK_LENGTH) {
			error = `⚠️ Le feedback est trop long (maximum ${MAX_FEEDBACK_LENGTH} caractères, vous avez ${feedback.length})`;
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
			// Messages d'erreur plus explicites
			if (err instanceof Error) {
				if (err.message.includes('timeout') || err.message.includes('délai')) {
					error = '⏱️ L\'analyse a pris trop de temps. Essayez avec un feedback plus court ou réessayez dans quelques instants.';
				} else if (err.message.includes('network') || err.message.includes('connexion')) {
					error = '🌐 Erreur de connexion. Vérifiez votre connexion internet et réessayez.';
				} else {
					error = `❌ ${err.message}`;
				}
			} else {
				error = '❌ Une erreur inattendue est survenue. Veuillez réessayer.';
			}
		} finally {
			isAnalyzing = false;
		}
	}

	// Helper pour créer le gauge SVG du sentiment
	function getSentimentGaugeRotation(score: number): number {
		return ((score + 1) / 2) * 180;
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
	<title>Nouvelle Analyse - Analyseur de Feedback</title>
</svelte:head>

<div class="page">
	<header class="page-header">
		<h1>Nouvelle Analyse</h1>
		<p>Analysez vos feedbacks clients en quelques secondes</p>
	</header>

	<main class="page-main">
		<section class="analyzer-section">
			<div class="analyzer-card">
				<div class="textarea-wrapper">
					<textarea
						bind:value={feedback}
						placeholder="Collez ici le feedback client à analyser...&#10;&#10;Exemple: 'J'adore votre produit mais j'ai rencontré un bug lors du paiement. Aussi, ce serait génial d'avoir une fonctionnalité d'export en PDF.'"
						rows="8"
						disabled={isAnalyzing}
						class:warning={isTooShort}
						class:error={isTooLong}
					></textarea>
					
					<!-- Compteur de caractères -->
					<div class="char-counter" class:warning={isTooShort} class:error={isTooLong} class:ok={isValidLength}>
						<span class="count">{feedbackLength} / {MAX_FEEDBACK_LENGTH}</span>
						{#if isTooLong}
							<span class="counter-message">❌ Trop long ({feedbackLength - MAX_FEEDBACK_LENGTH} caractères en trop)</span>
						{:else if isTooShort}
							<span class="counter-message">⚠️ Trop court (minimum {MIN_FEEDBACK_LENGTH} caractères)</span>
						{:else if feedbackLength > 0}
							<span class="counter-message">✓ Longueur valide</span>
						{/if}
					</div>
					
					<!-- Barre de progression -->
					{#if feedbackLength > 0}
						<div class="progress-bar">
							<div 
								class="progress-fill" 
								class:warning={percentageUsed > 80 && percentageUsed <= 100}
								class:error={percentageUsed > 100}
								class:ok={percentageUsed <= 80}
								style="width: {Math.min(percentageUsed, 100)}%"
							></div>
						</div>
					{/if}
				</div>

				<button 
					class="btn-analyze" 
					on:click={analyzeFeedback}
					disabled={isAnalyzing || !feedback.trim() || !isValidLength}
					title={!isValidLength && feedback.trim() ? 'La longueur du feedback n\'est pas valide' : ''}
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
			{@const displayResult = analysisResult.analysis}
			{@const totalThemes = displayResult.themes.positive.length + displayResult.themes.negative.length}
			{@const positivePercentage = totalThemes > 0 ? (displayResult.themes.positive.length / totalThemes) * 100 : 50}
			{@const negativePercentage = totalThemes > 0 ? (displayResult.themes.negative.length / totalThemes) * 100 : 50}
			<section class="results-section">
				<h2>📊 Résultats de l'Analyse</h2>
				
				<!-- Sentiment général -->
				<div class="sentiment-card" style="border-left-color: {getSentimentColor(displayResult.sentiment)}">
					<div class="sentiment-header">
						<h3>Sentiment Général</h3>
						<span class="sentiment-badge" style="background: {getSentimentColor(displayResult.sentiment)}">
							{displayResult.sentiment}
						</span>
					</div>
					
					<!-- Gauge visuel du sentiment -->
					<div class="sentiment-gauge-container">
						<svg class="sentiment-gauge" viewBox="0 0 200 120" width="200" height="120">
							<path 
								d="M 20 100 A 80 80 0 0 1 180 100" 
								fill="none" 
								stroke="#e0e0e0" 
								stroke-width="20" 
								stroke-linecap="round"
							/>
							<path 
								d="M 20 100 A 80 80 0 0 1 180 100" 
								fill="none" 
								stroke="{getSentimentColor(displayResult.sentiment)}" 
								stroke-width="20" 
								stroke-linecap="round"
								stroke-dasharray="{((displayResult.score + 1) / 2) * 251.2} 251.2"
								style="transition: stroke-dasharray 1s ease;"
							/>
							<g transform="translate(100, 100) rotate({getSentimentGaugeRotation(displayResult.score) - 90})">
								<line x1="0" y1="0" x2="70" y2="0" stroke="#333" stroke-width="3" stroke-linecap="round"/>
								<circle cx="0" cy="0" r="5" fill="#333"/>
							</g>
							<text x="15" y="115" font-size="10" fill="#999">-1</text>
							<text x="93" y="30" font-size="10" fill="#999">0</text>
							<text x="178" y="115" font-size="10" fill="#999">+1</text>
						</svg>
						<div class="sentiment-score">
							Score: {displayResult.score.toFixed(2)}
						</div>
					</div>
					
					<p class="summary">{displayResult.summary}</p>
				</div>

				<!-- Thèmes avec graphique -->
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

				<!-- Bugs -->
				{#if displayResult.bugs.length > 0}
					<div class="bugs-card">
						<h3>🐛 Bugs Identifiés ({displayResult.bugs.length})</h3>
						<div class="bugs-list">
							{#each displayResult.bugs as bug}
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
				{#if displayResult.featureRequests.length > 0}
					<div class="features-card">
						<h3>💡 Demandes de Fonctionnalités ({displayResult.featureRequests.length})</h3>
						<div class="features-list">
							{#each displayResult.featureRequests as feature}
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
	</main>
</div>

<style>
	/* Réutilisation des styles du dashboard */
	.page {
		max-width: 1200px;
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
		gap: 2rem;
	}

	.results-section h2 {
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

	.textarea-wrapper {
		position: relative;
		margin-bottom: 1rem;
	}

	textarea {
		width: 100%;
		padding: 1rem;
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		font-family: inherit;
		font-size: 1rem;
		resize: vertical;
		margin-bottom: 0.5rem;
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

	textarea.warning {
		border-color: #f59e0b;
	}

	textarea.error {
		border-color: #ef4444;
	}

	.char-counter {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.875rem;
		color: #666;
		padding: 0.5rem 0;
		transition: color 0.3s ease;
	}

	.char-counter.warning { color: #f59e0b; }
	.char-counter.error { color: #ef4444; }
	.char-counter.ok { color: #10b981; }

	.count {
		font-weight: 600;
		font-family: 'Courier New', monospace;
	}

	.counter-message {
		font-size: 0.8rem;
		font-weight: 500;
	}

	.progress-bar {
		height: 4px;
		background: #e0e0e0;
		border-radius: 2px;
		overflow: hidden;
		margin-top: 0.5rem;
	}

	.progress-fill {
		height: 100%;
		transition: width 0.3s ease, background-color 0.3s ease;
	}

	.progress-fill.ok {
		background: linear-gradient(90deg, #10b981 0%, #059669 100%);
	}

	.progress-fill.warning {
		background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
	}

	.progress-fill.error {
		background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
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
