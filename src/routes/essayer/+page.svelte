<script lang="ts">
	import { onMount } from 'svelte';
	import type { AnalyzeResponse, ApiError } from '$lib/types';

	// Essayer (Démo) - Mode visiteur avec limite de 5 analyses
	let feedback = '';
	let isAnalyzing = false;
	let analysisResult: AnalyzeResponse | null = null;
	let error: string | null = null;
	
	// Gestion de la limite démo
	let demoCount = 0;
	const DEMO_LIMIT = 5;
	$: isLimitReached = demoCount >= DEMO_LIMIT;
	$: remaining = DEMO_LIMIT - demoCount;
	
	// Validation en temps réel
	const MAX_FEEDBACK_LENGTH = 5000;
	const MIN_FEEDBACK_LENGTH = 10;
	$: feedbackLength = feedback.length;
	$: isValidLength = feedbackLength >= MIN_FEEDBACK_LENGTH && feedbackLength <= MAX_FEEDBACK_LENGTH;
	$: isTooLong = feedbackLength > MAX_FEEDBACK_LENGTH;
	$: isTooShort = feedbackLength > 0 && feedbackLength < MIN_FEEDBACK_LENGTH;
	$: percentageUsed = (feedbackLength / MAX_FEEDBACK_LENGTH) * 100;

	onMount(() => {
		// Charger le compteur depuis le localStorage
		const stored = localStorage.getItem('demoCount');
		if (stored) {
			demoCount = parseInt(stored, 10);
		}
	});

	async function analyzeFeedback() {
		if (isLimitReached) {
			error = '🚫 Limite de démo atteinte';
			return;
		}

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
			
			// Incrémenter le compteur de démo
			demoCount++;
			localStorage.setItem('demoCount', demoCount.toString());

		} catch (err) {
			console.error('❌ Erreur lors de l\'analyse:', err);
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
	<title>Essayer - Analyseur de Feedback</title>
</svelte:head>

<div class="page">
	<header class="page-header">
		<h1>Essayer l'Analyseur</h1>
		<p>Mode démo - {remaining} analyse{remaining > 1 ? 's' : ''} restante{remaining > 1 ? 's' : ''} sur {DEMO_LIMIT}</p>
		{#if remaining <= 2 && remaining > 0}
			<p class="warning-text">⚠️ Plus que {remaining} analyse{remaining > 1 ? 's' : ''} ! <a href="/auth/signup">Créez un compte</a> pour profiter d'analyses illimitées.</p>
		{/if}
	</header>

	<main class="page-main">
		{#if isLimitReached}
			<section class="limit-reached-section">
				<div class="limit-card">
					<h2>🎉 Limite de démo atteinte !</h2>
					<p>Vous avez utilisé vos {DEMO_LIMIT} analyses gratuites.</p>
					<p class="cta-text">Créez un compte pour continuer à analyser vos feedbacks clients sans limite.</p>
					<div class="cta-buttons">
						<a href="/auth/signup" class="btn btn-primary">Créer un compte</a>
						<a href="/auth/signin" class="btn btn-secondary">Se connecter</a>
					</div>
				</div>
			</section>
		{:else}
			<section class="analyzer-section">
				<div class="demo-banner">
					<strong>Mode Démo:</strong> Vos analyses ne seront pas sauvegardées. 
					<a href="/auth/signup">Créez un compte</a> pour sauvegarder et retrouver votre historique.
				</div>
				
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
							Analyser le Feedback ({remaining} restantes)
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

					<!-- CTA après résultats -->
					<div class="cta-after-results">
						<h3>💡 Vous aimez cet outil ?</h3>
						<p>Créez un compte pour sauvegarder vos analyses et accéder à l'historique complet !</p>
						<a href="/auth/signup" class="btn btn-cta">Créer un compte gratuit</a>
					</div>
				</section>
			{/if}
		{/if}
	</main>
</div>

<style>
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
		margin-bottom: 0.5rem;
	}

	.warning-text {
		color: #f59e0b;
		font-weight: 600;
		margin-top: 1rem;
	}

	.warning-text a {
		color: #667eea;
		text-decoration: underline;
	}

	.page-main {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.demo-banner {
		background: #fef3c7;
		border: 2px solid #f59e0b;
		border-radius: 8px;
		padding: 1rem;
		margin-bottom: 1rem;
		text-align: center;
	}

	.demo-banner a {
		color: #667eea;
		font-weight: 600;
		text-decoration: underline;
	}

	.limit-reached-section {
		margin: 4rem 0;
	}

	.limit-card {
		background: white;
		padding: 3rem;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		text-align: center;
	}

	.limit-card h2 {
		font-size: 2rem;
		margin-bottom: 1rem;
		color: #333;
	}

	.limit-card p {
		font-size: 1.1rem;
		color: #666;
		margin-bottom: 1rem;
	}

	.cta-text {
		font-size: 1.2rem;
		font-weight: 600;
		color: #333;
		margin: 2rem 0;
	}

	.cta-buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
		margin-top: 2rem;
	}

	.btn {
		padding: 1rem 2rem;
		border-radius: 8px;
		text-decoration: none;
		font-weight: 600;
		transition: all 0.3s ease;
		border: none;
		font-size: 1rem;
		cursor: pointer;
	}

	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.btn-secondary {
		background: white;
		color: #667eea;
		border: 2px solid #667eea;
	}

	.btn-secondary:hover {
		background: #f8f9ff;
	}

	.cta-after-results {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 2rem;
		border-radius: 12px;
		text-align: center;
		margin-top: 2rem;
	}

	.cta-after-results h3 {
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
	}

	.cta-after-results p {
		font-size: 1.1rem;
		margin-bottom: 1.5rem;
	}

	.btn-cta {
		background: white;
		color: #667eea;
		padding: 1rem 2rem;
		border-radius: 8px;
		text-decoration: none;
		font-weight: 600;
		display: inline-block;
		transition: all 0.3s ease;
	}

	.btn-cta:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
	}

	/* Réutilisation des styles de nouvelle-analyse */
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

	.results-section h2 {
		font-size: 1.5rem;
		margin-bottom: 1rem;
		color: #333;
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
</style>

