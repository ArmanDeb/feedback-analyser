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

	// Helper pour convertir score 0-10 en étoiles sur 5
	function getStarsFromScore(score: number): { full: number, half: boolean, empty: number } {
		const stars = (score / 10) * 5; // Convertir 0-10 vers 0-5
		const full = Math.floor(stars);
		const half = stars - full >= 0.5;
		const empty = 5 - full - (half ? 1 : 0);
		return { full, half, empty };
	}

	// Helper pour la couleur du sentiment
	function getSentimentColor(sentiment: string): string {
		switch (sentiment) {
			case 'positive': return '#10b981';
			case 'negative': return '#ef4444';
			default: return '#6b7280';
		}
	}

	// Helper pour la couleur basée sur le score (0-10)
	function getScoreColor(score: number): string {
		if (score >= 7) return '#10b981'; // Vert (positif)
		if (score >= 4) return '#f59e0b'; // Orange (neutre/mitigé)
		return '#ef4444'; // Rouge (négatif)
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
			{@const hasAdvancedAnalysis = displayResult.executiveSummary && (displayResult.executiveSummary.topFrictionPoints?.length > 0 || displayResult.executiveSummary.topStrengthPoints?.length > 0)}
			<section class="results-section">
				<h2>📊 Résultats de l'Analyse Expert</h2>
				
				<!-- Synthèse Managériale (Nouveau) -->
				{#if hasAdvancedAnalysis}
					<div class="executive-summary-card">
						<h3>🎯 Synthèse Managériale</h3>
						<div class="key-insight">
							<strong>Insight Clé:</strong> {displayResult.executiveSummary.keyInsight}
						</div>
						
						<div class="summary-grid">
							<!-- Top 3 Points de Friction -->
							<div class="summary-column friction-column">
								<h4>⚠️ Top 3 Points de Friction</h4>
								{#if displayResult.executiveSummary.topFrictionPoints?.length > 0}
									<div class="priority-list">
										{#each displayResult.executiveSummary.topFrictionPoints.slice(0, 3) as friction, index}
											<div class="priority-item friction-item">
												<div class="priority-badge">#{friction.priority}</div>
												<div class="priority-content">
													<div class="priority-title">
														{friction.category || (friction.theme?.category)}
													</div>
													<div class="priority-detail">{friction.issue || friction.theme?.specificIssue}</div>
													<div class="priority-stats">
														<span class="stat-impact negative-impact">💥 Impact: {(friction.impact || friction.sentimentImpact || 0).toFixed(1)}/10</span>
													</div>
													{#if friction.quote}
														<div class="priority-quotes">
															<blockquote>"{friction.quote}"</blockquote>
														</div>
													{:else if friction.theme?.quotes && friction.theme.quotes.length > 0}
														<div class="priority-quotes">
															{#each friction.theme.quotes.slice(0, 2) as quote}
																<blockquote>"{quote}"</blockquote>
															{/each}
														</div>
													{/if}
													<div class="priority-recommendation">
														💡 <strong>Action:</strong> {friction.recommendation}
													</div>
												</div>
											</div>
										{/each}
									</div>
								{:else}
									<p class="empty">Aucun point de friction majeur identifié</p>
								{/if}
							</div>
							
							<!-- Top 3 Points Forts -->
							<div class="summary-column strength-column">
								<h4>✅ Top 3 Points Forts</h4>
								{#if displayResult.executiveSummary.topStrengthPoints?.length > 0}
									<div class="priority-list">
										{#each displayResult.executiveSummary.topStrengthPoints.slice(0, 3) as strength, index}
											<div class="priority-item strength-item">
												<div class="priority-badge">#{strength.priority}</div>
												<div class="priority-content">
													<div class="priority-title">
														{strength.category || (strength.theme?.category)}
													</div>
													<div class="priority-detail">{strength.strength || strength.theme?.specificIssue}</div>
													<div class="priority-stats">
														<span class="stat-impact positive-impact">💚 Impact: {(strength.impact || strength.sentimentImpact || 0).toFixed(1)}/10</span>
													</div>
													{#if strength.quote}
														<div class="priority-quotes">
															<blockquote>"{strength.quote}"</blockquote>
														</div>
													{:else if strength.theme?.quotes && strength.theme.quotes.length > 0}
														<div class="priority-quotes">
															{#each strength.theme.quotes.slice(0, 2) as quote}
																<blockquote>"{quote}"</blockquote>
															{/each}
														</div>
													{/if}
												</div>
											</div>
										{/each}
									</div>
								{:else}
									<p class="empty">Aucun point fort majeur identifié</p>
								{/if}
							</div>
						</div>
					</div>
					
					<!-- Rapport des Drivers (Nouveau) -->
					{#if displayResult.driverReport && (displayResult.driverReport.themesByVolume?.length > 0 || displayResult.driverReport.themesBySentimentImpact?.length > 0)}
						<div class="driver-report-card">
							<h3>📈 Rapport d'Analyse des Drivers</h3>
							<div class="driver-grid">
								<!-- Classement par Volume -->
								{#if displayResult.driverReport.themesByVolume?.length > 0}
									<div class="driver-column">
										<h4>📊 Thèmes par Volume de Mentions</h4>
										<div class="driver-list">
											{#each displayResult.driverReport.themesByVolume as item, index}
												<div class="driver-item">
													<span class="driver-rank">#{index + 1}</span>
													<div class="driver-info">
														<div class="driver-name">{item.theme}</div>
														<div class="driver-bar-container">
															<div class="driver-bar" style="width: {item.percentage}%"></div>
															<span class="driver-value">{item.volume} mentions ({item.percentage.toFixed(1)}%)</span>
														</div>
													</div>
												</div>
											{/each}
										</div>
									</div>
								{/if}
								
								<!-- Classement par Impact Sentiment -->
								{#if displayResult.driverReport.themesBySentimentImpact?.length > 0}
									<div class="driver-column">
										<h4>💥 Thèmes par Impact Sentiment</h4>
										<div class="driver-list">
											{#each displayResult.driverReport.themesBySentimentImpact as item, index}
												<div class="driver-item">
													<span class="driver-rank">#{index + 1}</span>
													<div class="driver-info">
														<div class="driver-name">{item.theme}</div>
														<div class="driver-sentiment-bar">
															<div 
																class="sentiment-impact-indicator"
																class:positive={item.sentiment === 'positive'}
																class:negative={item.sentiment === 'negative'}
																class:neutral={item.sentiment === 'neutral'}
																style="width: {(item.sentimentImpact / 10) * 100}%"
															></div>
															<span class="driver-value">{item.sentimentImpact.toFixed(1)}/10</span>
														</div>
													</div>
												</div>
											{/each}
										</div>
									</div>
								{/if}
							</div>
						</div>
					{/if}
					
					<!-- Analyse des Causes Profondes (Nouveau) -->
					{#if displayResult.rootCauseAnalyses && displayResult.rootCauseAnalyses.length > 0}
						<div class="root-cause-card">
							<h3>🔍 Analyse des Causes Profondes</h3>
							{#each displayResult.rootCauseAnalyses as analysis}
								<div class="root-cause-item">
									<h4 class="root-cause-title">{analysis.frictionPoint}</h4>
									{#each analysis.subthemes as subtheme}
										<div class="subtheme-section">
											<h5 class="subtheme-title">📌 {subtheme.name}</h5>
											<div class="causes-list">
												<strong>Causes spécifiques:</strong>
												<ul>
													{#each subtheme.specificCauses as cause}
														<li>{cause}</li>
													{/each}
												</ul>
											</div>
											{#if subtheme.quotes && subtheme.quotes.length > 0}
												<div class="root-cause-quotes">
													<strong>Citations représentatives:</strong>
													{#each subtheme.quotes as quote}
														<blockquote class="root-quote">"{quote}"</blockquote>
													{/each}
												</div>
											{/if}
										</div>
									{/each}
								</div>
							{/each}
						</div>
					{/if}
					
					<!-- Informations Exploitables (Nouveau) -->
					{#if displayResult.actionableInsights && displayResult.actionableInsights.length > 0}
						<div class="actionable-insights-card">
							<h3>💡 Informations Exploitables & Recommandations</h3>
							<div class="insights-grid">
								{#each displayResult.actionableInsights as insight}
									<div class="insight-item" class:high={insight.priority === 'high'} class:medium={insight.priority === 'medium'} class:low={insight.priority === 'low'}>
										<div class="insight-header">
											<span class="insight-priority-badge" class:high={insight.priority === 'high'} class:medium={insight.priority === 'medium'} class:low={insight.priority === 'low'}>
												{insight.priority}
											</span>
											<span class="insight-friction">{insight.frictionPoint}</span>
										</div>
										<div class="insight-recommendation">
											<strong>Recommandation:</strong> {insight.recommendation}
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}
					
					<!-- Tous les Thèmes Identifiés (Nouveau) -->
					{#if displayResult.allThemes && displayResult.allThemes.length > 0}
						<div class="all-themes-card">
							<h3>🎯 Tous les Thèmes Identifiés ({displayResult.allThemes.length})</h3>
							<div class="themes-hierarchical-grid">
								{#each displayResult.allThemes as theme}
									<div class="theme-hierarchical-item" class:positive={theme.sentiment === 'positive'} class:negative={theme.sentiment === 'negative'} class:neutral={theme.sentiment === 'neutral'}>
										<div class="theme-taxonomy">
											<span class="taxonomy-category">{theme.category}</span>
											<span class="taxonomy-arrow">›</span>
											<span class="taxonomy-subtheme">{theme.subtheme}</span>
											<span class="taxonomy-arrow">›</span>
											<span class="taxonomy-issue">{theme.specificIssue}</span>
										</div>
										<div class="theme-metrics">
											<span class="metric-mentions">📊 {theme.mentionCount}×</span>
											<span class="metric-impact">{theme.impactScore.toFixed(1)}/10</span>
											<span class="metric-sentiment" class:positive={theme.sentiment === 'positive'} class:negative={theme.sentiment === 'negative'}>
												{theme.sentiment === 'positive' ? '😊' : theme.sentiment === 'negative' ? '😟' : '😐'}
											</span>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				{/if}
				
				<!-- Sentiment général -->
				<div class="sentiment-card" style="border-left-color: {getSentimentColor(displayResult.sentiment)}">
					<div class="sentiment-header">
						<h3>Sentiment Général</h3>
						<span class="sentiment-badge" style="background: {getSentimentColor(displayResult.sentiment)}">
							{displayResult.sentiment}
						</span>
					</div>
					
					<!-- Étoiles de satisfaction (sur 5) -->
					<div class="sentiment-stars-container">
						{@const stars = getStarsFromScore(displayResult.score)}
						<div class="stars-display">
							<!-- Étoiles pleines -->
							{#each Array(stars.full) as _, i}
								<svg class="star star-full" viewBox="0 0 24 24" fill="{getScoreColor(displayResult.score)}" xmlns="http://www.w3.org/2000/svg">
									<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
								</svg>
							{/each}
							<!-- Demi-étoile -->
							{#if stars.half}
								<svg class="star star-half" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
									<defs>
										<linearGradient id="halfStarGradient">
											<stop offset="50%" stop-color="{getScoreColor(displayResult.score)}" />
											<stop offset="50%" stop-color="#e5e7eb" />
										</linearGradient>
									</defs>
									<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#halfStarGradient)"/>
								</svg>
							{/if}
							<!-- Étoiles vides -->
							{#each Array(stars.empty) as _, i}
								<svg class="star star-empty" viewBox="0 0 24 24" fill="none" stroke="#e5e7eb" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
									<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
								</svg>
							{/if}
						</div>
						<div class="sentiment-score" style="color: {getScoreColor(displayResult.score)};">
							{((displayResult.score / 10) * 5).toFixed(1)}/5 étoiles
						</div>
						<div class="sentiment-label">
							{#if displayResult.score >= 7}
								😊 Très satisfait
							{:else if displayResult.score >= 4}
								😐 Mitigé
							{:else}
								😟 Insatisfait
							{/if}
						</div>
						<div class="sentiment-score-detail">
							Score détaillé: {displayResult.score.toFixed(1)}/10
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

	.sentiment-stars-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 2rem 0;
		gap: 1rem;
	}

	.stars-display {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.star {
		width: 48px;
		height: 48px;
		transition: transform 0.2s ease;
	}

	.star:hover {
		transform: scale(1.15);
	}

	.star-full {
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
	}

	.sentiment-score {
		font-size: 1.5rem;
		font-weight: 700;
		text-align: center;
	}

	.sentiment-label {
		text-align: center;
		font-size: 1.1rem;
		color: #666;
		font-weight: 600;
	}

	.sentiment-score-detail {
		text-align: center;
		font-size: 0.9rem;
		color: #999;
		font-weight: 500;
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

	/* Nouveaux styles pour l'analyse avancée */
	.executive-summary-card {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		margin-bottom: 2rem;
		border-top: 4px solid #667eea;
	}

	.executive-summary-card h3 {
		margin: 0 0 1.5rem 0;
		font-size: 1.75rem;
		color: #333;
	}

	.key-insight {
		background: linear-gradient(135deg, #f6f8fb 0%, #e9ecf5 100%);
		padding: 1.5rem;
		border-radius: 8px;
		margin-bottom: 2rem;
		border-left: 4px solid #667eea;
		font-size: 1.05rem;
		line-height: 1.6;
	}

	.summary-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
		gap: 2rem;
	}

	.summary-column h4 {
		font-size: 1.25rem;
		margin-bottom: 1rem;
	}

	.priority-list {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.priority-item {
		background: #f8f9fa;
		border-radius: 12px;
		padding: 1.5rem;
		display: flex;
		gap: 1rem;
		border-left: 4px solid;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.priority-item:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.friction-item {
		border-left-color: #ef4444;
		background: #fef2f2;
	}

	.strength-item {
		border-left-color: #10b981;
		background: #f0fdf4;
	}

	.priority-badge {
		background: #667eea;
		color: white;
		font-weight: 700;
		font-size: 1.25rem;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.priority-content {
		flex: 1;
	}

	.priority-title {
		font-weight: 700;
		font-size: 1.1rem;
		color: #333;
		margin-bottom: 0.5rem;
	}

	.priority-detail {
		color: #666;
		margin-bottom: 0.75rem;
		line-height: 1.5;
	}

	.priority-stats {
		display: flex;
		gap: 1rem;
		margin-bottom: 0.75rem;
		font-size: 0.9rem;
	}

	.stat-volume, .stat-impact {
		background: white;
		padding: 0.25rem 0.75rem;
		border-radius: 6px;
		font-weight: 600;
	}

	.stat-impact.negative-impact {
		color: #dc2626;
	}

	.stat-impact.positive-impact {
		color: #059669;
	}

	.priority-quotes {
		margin: 1rem 0;
	}

	.priority-quotes blockquote {
		background: white;
		padding: 0.75rem 1rem;
		border-left: 3px solid #667eea;
		margin: 0.5rem 0;
		font-style: italic;
		color: #555;
		border-radius: 4px;
	}

	.priority-recommendation {
		background: #fff7ed;
		border: 2px dashed #f59e0b;
		padding: 1rem;
		border-radius: 8px;
		margin-top: 1rem;
		color: #92400e;
		line-height: 1.5;
	}

	.driver-report-card {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		margin-bottom: 2rem;
	}

	.driver-report-card h3 {
		margin: 0 0 1.5rem 0;
		font-size: 1.5rem;
	}

	.driver-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
		gap: 2rem;
	}

	.driver-column h4 {
		font-size: 1.1rem;
		margin-bottom: 1rem;
		color: #555;
	}

	.driver-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.driver-item {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		background: #f8f9fa;
		padding: 1rem;
		border-radius: 8px;
	}

	.driver-rank {
		background: #667eea;
		color: white;
		font-weight: 700;
		font-size: 0.85rem;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		flex-shrink: 0;
	}

	.driver-info {
		flex: 1;
	}

	.driver-name {
		font-weight: 600;
		color: #333;
		margin-bottom: 0.5rem;
	}

	.driver-bar-container {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.driver-bar {
		height: 24px;
		background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
		border-radius: 4px;
		transition: width 1s ease;
	}

	.driver-value {
		font-size: 0.85rem;
		color: #666;
		font-weight: 600;
	}

	.driver-sentiment-bar {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		height: 24px;
	}

	.sentiment-impact-indicator {
		height: 100%;
		border-radius: 4px;
		transition: width 1s ease;
	}

	.sentiment-impact-indicator.positive {
		background: linear-gradient(90deg, #10b981 0%, #059669 100%);
	}

	.sentiment-impact-indicator.negative {
		background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
	}

	.sentiment-impact-indicator.neutral {
		background: linear-gradient(90deg, #6b7280 0%, #4b5563 100%);
	}

	.root-cause-card {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		margin-bottom: 2rem;
	}

	.root-cause-card h3 {
		margin: 0 0 1.5rem 0;
		font-size: 1.5rem;
	}

	.root-cause-item {
		background: #f8f9fa;
		padding: 1.5rem;
		border-radius: 12px;
		margin-bottom: 1.5rem;
		border-left: 4px solid #667eea;
	}

	.root-cause-title {
		font-size: 1.25rem;
		color: #333;
		margin: 0 0 1rem 0;
	}

	.subtheme-section {
		background: white;
		padding: 1.5rem;
		border-radius: 8px;
		margin-bottom: 1rem;
	}

	.subtheme-title {
		font-size: 1.1rem;
		color: #555;
		margin: 0 0 1rem 0;
	}

	.causes-list {
		margin-bottom: 1rem;
	}

	.causes-list ul {
		margin: 0.5rem 0 0 1.5rem;
		color: #666;
	}

	.causes-list li {
		margin-bottom: 0.5rem;
		line-height: 1.5;
	}

	.root-cause-quotes {
		margin-top: 1rem;
	}

	.root-quote {
		background: #f0f9ff;
		border-left: 3px solid #3b82f6;
		padding: 0.75rem 1rem;
		margin: 0.5rem 0;
		font-style: italic;
		color: #1e40af;
		border-radius: 4px;
	}

	.actionable-insights-card {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		margin-bottom: 2rem;
	}

	.actionable-insights-card h3 {
		margin: 0 0 1.5rem 0;
		font-size: 1.5rem;
	}

	.insights-grid {
		display: grid;
		gap: 1rem;
	}

	.insight-item {
		background: #f8f9fa;
		padding: 1.5rem;
		border-radius: 12px;
		border-left: 4px solid;
	}

	.insight-item.high {
		border-left-color: #ef4444;
		background: #fef2f2;
	}

	.insight-item.medium {
		border-left-color: #f59e0b;
		background: #fffbeb;
	}

	.insight-item.low {
		border-left-color: #6b7280;
		background: #f9fafb;
	}

	.insight-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.insight-priority-badge {
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		color: white;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
	}

	.insight-priority-badge.high {
		background: #ef4444;
	}

	.insight-priority-badge.medium {
		background: #f59e0b;
	}

	.insight-priority-badge.low {
		background: #6b7280;
	}

	.insight-friction {
		font-weight: 700;
		color: #333;
		font-size: 1.05rem;
	}

	.insight-recommendation {
		color: #555;
		line-height: 1.6;
	}

	.all-themes-card {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		margin-bottom: 2rem;
	}

	.all-themes-card h3 {
		margin: 0 0 1.5rem 0;
		font-size: 1.5rem;
	}

	.themes-hierarchical-grid {
		display: grid;
		gap: 1rem;
	}

	.theme-hierarchical-item {
		background: #f8f9fa;
		padding: 1rem 1.5rem;
		border-radius: 8px;
		border-left: 4px solid;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		transition: transform 0.2s ease;
	}

	.theme-hierarchical-item:hover {
		transform: translateX(4px);
	}

	.theme-hierarchical-item.positive {
		border-left-color: #10b981;
		background: #f0fdf4;
	}

	.theme-hierarchical-item.negative {
		border-left-color: #ef4444;
		background: #fef2f2;
	}

	.theme-hierarchical-item.neutral {
		border-left-color: #6b7280;
		background: #f9fafb;
	}

	.theme-taxonomy {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex: 1;
		flex-wrap: wrap;
	}

	.taxonomy-category {
		font-weight: 700;
		color: #333;
	}

	.taxonomy-arrow {
		color: #999;
		font-weight: 400;
	}

	.taxonomy-subtheme {
		font-weight: 600;
		color: #555;
	}

	.taxonomy-issue {
		color: #666;
	}

	.theme-metrics {
		display: flex;
		align-items: center;
		gap: 1rem;
		font-size: 0.85rem;
	}

	.metric-mentions, .metric-impact {
		background: white;
		padding: 0.25rem 0.5rem;
		border-radius: 6px;
		font-weight: 600;
	}

	.metric-sentiment {
		font-size: 1.25rem;
	}

	.metric-sentiment.positive {
		filter: hue-rotate(0deg);
	}

	.metric-sentiment.negative {
		filter: hue-rotate(0deg);
	}
</style>
