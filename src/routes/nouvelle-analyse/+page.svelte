<script lang="ts">
	import type { AnalyzeResponse, ApiError } from '$lib/types';
	import { page } from '$app/stores';

	// Nouvelle Analyse - Interface d'analyse sans historique
	let feedback = '';
	let isAnalyzing = false;
	let analysisResult: AnalyzeResponse | null = null;
	let error: string | null = null;
	
	// Vérifier si l'utilisateur est connecté
	$: user = $page.data.user;
	$: isAuthenticated = !!user;
	
	// Validation en temps réel
	// Pas de limite pour les utilisateurs connectés, limite de 5000 pour les visiteurs
	const MAX_FEEDBACK_LENGTH = isAuthenticated ? Infinity : 5000;
	const MIN_FEEDBACK_LENGTH = 10;
	$: feedbackLength = feedback.length;
	$: isValidLength = feedbackLength >= MIN_FEEDBACK_LENGTH && (!isAuthenticated ? feedbackLength <= MAX_FEEDBACK_LENGTH : true);
	$: isTooLong = !isAuthenticated && feedbackLength > 5000;
	$: isTooShort = feedbackLength > 0 && feedbackLength < MIN_FEEDBACK_LENGTH;
	$: percentageUsed = isAuthenticated ? 0 : (feedbackLength / 5000) * 100;

	async function analyzeFeedback() {
		// Validation améliorée
		if (!feedback.trim()) {
			error = 'Veuillez entrer du feedback à analyser';
			return;
		}

		if (feedback.length < MIN_FEEDBACK_LENGTH) {
			error = `Le feedback est trop court (minimum ${MIN_FEEDBACK_LENGTH} caractères, vous avez ${feedback.length})`;
			return;
		}

		// Vérifier la limite uniquement si l'utilisateur n'est pas connecté
		if (!isAuthenticated && feedback.length > 5000) {
			error = `Le feedback est trop long (maximum 5000 caractères, vous avez ${feedback.length})`;
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

			// Gérer les erreurs HTTP avant de parser le JSON
			if (!response.ok) {
				let errorMessage = 'Erreur lors de l\'analyse';
				
				if (response.status === 429) {
					errorMessage = 'Trop de requêtes. La limite de taux a été atteinte. Veuillez patienter quelques instants avant de réessayer.';
				} else if (response.status >= 500) {
					errorMessage = 'Erreur serveur. Le service est temporairement indisponible. Veuillez réessayer dans quelques instants.';
				} else if (response.status === 400) {
					errorMessage = 'Requête invalide. Vérifiez que le feedback n\'est pas vide.';
				}
				
				// Essayer de parser le JSON pour obtenir plus de détails
				try {
					const errorData = await response.json();
					if (errorData.error || errorData.details) {
						errorMessage = errorData.details || errorData.error || errorMessage;
					}
				} catch {
					// Si le JSON ne peut pas être parsé, utiliser le message par défaut
				}
				
				throw new Error(errorMessage);
			}

			const data = await response.json();
			analysisResult = data as AnalyzeResponse;
			console.log('Analyse complétée:', analysisResult);

		} catch (err) {
			console.error('Erreur lors de l\'analyse:', err);
			// Messages d'erreur plus explicites
			if (err instanceof Error) {
				if (err.message.includes('timeout') || err.message.includes('délai')) {
					error = 'L\'analyse a pris trop de temps. Essayez avec un feedback plus court ou réessayez dans quelques instants.';
				} else if (err.message.includes('network') || err.message.includes('connexion') || err.message.includes('Failed to fetch')) {
					error = 'Erreur de connexion. Vérifiez votre connexion internet et réessayez.';
				} else if (err.message.includes('429') || err.message.includes('limite') || err.message.includes('taux')) {
					error = 'Trop de requêtes. La limite de taux a été atteinte. Veuillez patienter quelques instants avant de réessayer.';
				} else {
					error = err.message || 'Une erreur inattendue est survenue. Veuillez réessayer.';
				}
			} else {
				error = 'Une erreur inattendue est survenue. Veuillez réessayer.';
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
			case 'positive': return 'var(--color-success)';
			case 'negative': return 'var(--color-error)';
			default: return 'var(--gray-500)';
		}
	}

	// Helper pour la couleur basée sur le score (0-10)
	function getScoreColor(score: number): string {
		if (score >= 7) return 'var(--color-success)'; // Vert (positif)
		if (score >= 4) return 'var(--color-warning)'; // Orange (neutre/mitigé)
		return 'var(--color-error)'; // Rouge (négatif)
	}

	// Helper pour la couleur de sévérité
	function getSeverityColor(severity: string): string {
		switch (severity) {
			case 'high': return 'var(--color-error)';
			case 'medium': return 'var(--color-warning)';
			default: return 'var(--gray-500)';
		}
	}
</script>

<svelte:head>
	<title>Nouvelle Analyse - Analyseur de Feedback</title>
</svelte:head>

<div class="page">
	<header class="page-header">
		<h1>
			<svg class="page-header-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<linearGradient id="newAnalysisHeaderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" style="stop-color:#2C2C2C;stop-opacity:1" />
						<stop offset="100%" style="stop-color:#888888;stop-opacity:1" />
					</linearGradient>
				</defs>
				<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="url(#newAnalysisHeaderGradient)"/>
			</svg>
			Nouvelle Analyse
		</h1>
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
						{#if isAuthenticated}
							<span class="count">{feedbackLength} caractères</span>
						{:else}
							<span class="count">{feedbackLength} / 5000</span>
						{/if}
					{#if isTooLong}
						<span class="counter-message">Trop long ({feedbackLength - 5000} caractères en trop)</span>
					{:else if isTooShort}
						<span class="counter-message">Trop court (minimum {MIN_FEEDBACK_LENGTH} caractères)</span>
					{:else if feedbackLength > 0}
						<span class="counter-message">Longueur valide</span>
					{/if}
					</div>
					
					<!-- Barre de progression (uniquement pour les visiteurs) -->
					{#if feedbackLength > 0 && !isAuthenticated}
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
					<h3>Erreur</h3>
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
				<h2>
					<svg class="section-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<defs>
							<linearGradient id="resultsExpertGradient" x1="0%" y1="0%" x2="100%" y2="100%">
								<stop offset="0%" style="stop-color:#2C2C2C;stop-opacity:1" />
								<stop offset="100%" style="stop-color:#888888;stop-opacity:1" />
							</linearGradient>
						</defs>
						<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" fill="url(#resultsExpertGradient)"/>
					</svg>
					Résultats de l'Analyse Expert
				</h2>
				
				<!-- Synthèse Managériale (Nouveau) -->
				{#if hasAdvancedAnalysis}
					<div class="executive-summary-card">
						<h3>
							<svg class="section-icon-small" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<defs>
									<linearGradient id="executiveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
										<stop offset="0%" style="stop-color:#2C2C2C;stop-opacity:1" />
										<stop offset="100%" style="stop-color:#888888;stop-opacity:1" />
								</linearGradient>
							</defs>
							<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="url(#executiveGradient)"/>
						</svg>
						Synthèse Managériale
					</h3>
						<div class="key-insight">
							<strong>Insight Clé:</strong> {displayResult.executiveSummary.keyInsight}
						</div>
						
						<div class="summary-grid">
							<!-- Top 3 Points de Friction -->
							<div class="summary-column friction-column">
								<h4>Top 3 Points de Friction</h4>
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
														<span class="stat-impact negative-impact">Impact: {(friction.impact || friction.sentimentImpact || 0).toFixed(1)}/10</span>
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
														<strong>Action:</strong> {friction.recommendation}
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
								<h4>Top 3 Points Forts</h4>
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
														<span class="stat-impact positive-impact">Impact: {(strength.impact || strength.sentimentImpact || 0).toFixed(1)}/10</span>
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
							<h3>
								<svg class="section-icon-small" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<defs>
										<linearGradient id="driverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
											<stop offset="0%" style="stop-color:#2C2C2C;stop-opacity:1" />
											<stop offset="100%" style="stop-color:#888888;stop-opacity:1" />
									</linearGradient>
								</defs>
								<path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" fill="url(#driverGradient)"/>
							</svg>
							Rapport d'Analyse des Drivers
						</h3>
							<div class="driver-grid">
								<!-- Classement par Volume -->
								{#if displayResult.driverReport.themesByVolume?.length > 0}
									<div class="driver-column">
										<h4>Thèmes par Volume de Mentions</h4>
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
										<h4>Thèmes par Impact Sentiment</h4>
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
							<h3>
								<svg class="section-icon-small" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<defs>
										<linearGradient id="rootCauseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
											<stop offset="0%" style="stop-color:#2C2C2C;stop-opacity:1" />
											<stop offset="100%" style="stop-color:#888888;stop-opacity:1" />
									</linearGradient>
								</defs>
								<circle cx="11" cy="11" r="7" stroke="url(#rootCauseGradient)" stroke-width="2" fill="none"/>
								<path d="m20 20-4.35-4.35" stroke="url(#rootCauseGradient)" stroke-width="2" stroke-linecap="round"/>
							</svg>
							Analyse des Causes Profondes
						</h3>
							{#each displayResult.rootCauseAnalyses as analysis}
								<div class="root-cause-item">
									<h4 class="root-cause-title">{analysis.frictionPoint}</h4>
									{#each analysis.subthemes as subtheme}
										<div class="subtheme-section">
											<h5 class="subtheme-title">{subtheme.name}</h5>
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
							<h3>
								<svg class="section-icon-small" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<defs>
										<linearGradient id="insightsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
											<stop offset="0%" style="stop-color:#2C2C2C;stop-opacity:1" />
											<stop offset="100%" style="stop-color:#888888;stop-opacity:1" />
									</linearGradient>
								</defs>
								<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#insightsGradient)"/>
							</svg>
							Informations Exploitables & Recommandations
						</h3>
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
							<h3>
								<svg class="section-icon-small" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<defs>
										<linearGradient id="allThemesGradient" x1="0%" y1="0%" x2="100%" y2="100%">
											<stop offset="0%" style="stop-color:#2C2C2C;stop-opacity:1" />
											<stop offset="100%" style="stop-color:#888888;stop-opacity:1" />
									</linearGradient>
								</defs>
								<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="url(#allThemesGradient)"/>
							</svg>
							Tous les Thèmes Identifiés ({displayResult.allThemes.length})
						</h3>
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
											<span class="metric-mentions">{theme.mentionCount}×</span>
											<span class="metric-impact">{theme.impactScore.toFixed(1)}/10</span>
											<span class="metric-sentiment" class:positive={theme.sentiment === 'positive'} class:negative={theme.sentiment === 'negative'}>
												{theme.sentiment === 'positive' ? '+' : theme.sentiment === 'negative' ? '-' : '='}
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
					{#if displayResult.score !== undefined}
						{@const stars = getStarsFromScore(displayResult.score)}
						<div class="sentiment-stars-container">
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
								{/each}
							</div>
							<div class="sentiment-score" style="color: {getScoreColor(displayResult.score)};">
								{((displayResult.score / 10) * 5).toFixed(1)}/5 étoiles
							</div>
							<div class="sentiment-label">
								{#if displayResult.score >= 7}
									Très satisfait
								{:else if displayResult.score >= 4}
									Mitigé
								{:else}
									Insatisfait
								{/if}
							</div>
							<div class="sentiment-score-detail">
								Score détaillé: {displayResult.score.toFixed(1)}/10
							</div>
						</div>
					{/if}
					
					<p class="summary">{displayResult.summary}</p>
				</div>

				<!-- Thèmes avec graphique -->
				<div class="themes-container">
					<h3>
						<svg class="section-icon-small" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<defs>
								<linearGradient id="themesDistGradient" x1="0%" y1="0%" x2="100%" y2="100%">
									<stop offset="0%" style="stop-color:#2C2C2C;stop-opacity:1" />
									<stop offset="100%" style="stop-color:#888888;stop-opacity:1" />
							</linearGradient>
						</defs>
						<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="url(#themesDistGradient)"/>
					</svg>
					Distribution des Thèmes
				</h3>
					
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
							<h4>Points Positifs ({displayResult.themes.positive.length})</h4>
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
							<h4>Points Négatifs ({displayResult.themes.negative.length})</h4>
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
						<h3>
							<svg class="section-icon-small" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<defs>
									<linearGradient id="bugsNewGradient" x1="0%" y1="0%" x2="100%" y2="100%">
										<stop offset="0%" style="stop-color:#ef4444;stop-opacity:1" />
										<stop offset="100%" style="stop-color:#dc2626;stop-opacity:1" />
								</linearGradient>
							</defs>
							<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="url(#bugsNewGradient)"/>
						</svg>
						Bugs Identifiés ({displayResult.bugs.length})
					</h3>
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
						<h3>
							<svg class="section-icon-small" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<defs>
									<linearGradient id="featuresNewGradient" x1="0%" y1="0%" x2="100%" y2="100%">
										<stop offset="0%" style="stop-color:#2C2C2C;stop-opacity:1" />
										<stop offset="100%" style="stop-color:#888888;stop-opacity:1" />
								</linearGradient>
							</defs>
							<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#featuresNewGradient)"/>
						</svg>
						Demandes de Fonctionnalités ({displayResult.featureRequests.length})
					</h3>
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
					<h4>
						<svg class="section-icon-small" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<defs>
								<linearGradient id="metadataGradient" x1="0%" y1="0%" x2="100%" y2="100%">
									<stop offset="0%" style="stop-color:#2C2C2C;stop-opacity:1" />
									<stop offset="100%" style="stop-color:#888888;stop-opacity:1" />
							</linearGradient>
						</defs>
						<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" fill="url(#metadataGradient)"/>
					</svg>
					Métadonnées
				</h4>
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
		padding: var(--spacing-8);
		background: var(--bg-page);
		min-height: 100vh;
	}

	.page-header {
		margin-bottom: var(--spacing-12);
	}

	.page-header h1 {
		font-size: var(--font-size-4xl);
		margin-bottom: var(--spacing-2);
		color: var(--text-primary);
		display: flex;
		align-items: center;
		gap: var(--spacing-3);
	}

	.page-header-icon {
		width: 40px;
		height: 40px;
	}

	.section-icon {
		width: 28px;
		height: 28px;
		margin-right: var(--spacing-2);
	}

	.section-icon-small {
		width: 24px;
		height: 24px;
		margin-right: var(--spacing-2);
	}

	.page-header p {
		color: var(--text-secondary);
		font-size: var(--font-size-lg);
	}

	.page-main {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-8);
	}

	.results-section h2 {
		font-size: var(--font-size-2xl);
		margin-bottom: var(--spacing-4);
		color: var(--text-primary);
		display: flex;
		align-items: center;
		gap: var(--spacing-3);
	}

	.analyzer-card {
		background: var(--bg-widget);
		padding: var(--spacing-8);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-soft);
	}

	.textarea-wrapper {
		position: relative;
		margin-bottom: var(--spacing-4);
	}

	textarea {
		width: 100%;
		padding: var(--spacing-4);
		border: 2px solid var(--border-subtle);
		border-radius: var(--radius-sm);
		font-family: inherit;
		font-size: var(--font-size-base);
		resize: vertical;
		margin-bottom: var(--spacing-2);
		transition: border-color var(--transition-base);
		color: var(--text-primary);
		background: var(--bg-widget);
	}

	textarea:focus {
		outline: none;
		border-color: var(--text-primary);
	}

	textarea:disabled {
		background-color: var(--bg-sidebar);
		cursor: not-allowed;
	}

	textarea.warning {
		border-color: var(--color-warning);
	}

	textarea.error {
		border-color: var(--color-error);
	}

	.char-counter {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: var(--font-size-sm);
		color: var(--text-secondary);
		padding: var(--spacing-2) 0;
		transition: color var(--transition-base);
	}

	.char-counter.warning { color: var(--color-warning); }
	.char-counter.error { color: var(--color-error); }
	.char-counter.ok { color: var(--color-success); }

	.count {
		font-weight: var(--font-weight-semibold);
		font-family: 'Courier New', monospace;
	}

	.counter-message {
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
	}

	.progress-bar {
		height: 4px;
		background: var(--border-subtle);
		border-radius: var(--radius-sm);
		overflow: hidden;
		margin-top: var(--spacing-2);
	}

	.progress-fill {
		height: 100%;
		transition: width var(--transition-base), background-color var(--transition-base);
	}

	.progress-fill.ok {
		background: var(--gradient-success);
	}

	.progress-fill.warning {
		background: var(--gradient-warning);
	}

	.progress-fill.error {
		background: var(--gradient-error);
	}

	.btn-analyze {
		width: 100%;
		padding: var(--spacing-4) var(--spacing-8);
		background: var(--text-primary);
		color: var(--bg-widget);
		border: none;
		border-radius: var(--radius-sm);
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
		transition: all var(--transition-base);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-2);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.btn-analyze:hover:not(:disabled) {
		background: #2A2824;
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	}

	.btn-analyze:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(250, 249, 246, 0.3);
		border-top-color: var(--bg-widget);
		border-radius: var(--radius-full);
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.error-section {
		margin: var(--spacing-8) 0;
	}

	.error-card {
		background: var(--color-error-light);
		border: 2px solid var(--color-error);
		border-radius: var(--radius-md);
		padding: var(--spacing-6);
		color: var(--text-primary);
	}

	.error-card h3 {
		margin: 0 0 var(--spacing-2) 0;
		color: var(--color-error);
	}

	.error-card p {
		margin: 0;
		color: var(--text-primary);
	}

	.sentiment-card {
		background: var(--bg-widget);
		padding: var(--spacing-8);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-soft);
		border-left: 4px solid;
		margin-bottom: var(--spacing-8);
	}

	.sentiment-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-4);
	}

	.sentiment-header h3 {
		margin: 0;
		font-size: var(--font-size-2xl);
		color: var(--text-primary);
	}

	.sentiment-badge {
		padding: var(--spacing-2) var(--spacing-4);
		border-radius: var(--radius-full);
		color: var(--color-white);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		font-size: var(--font-size-xs);
	}

	.sentiment-stars-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: var(--spacing-8) 0;
		gap: var(--spacing-4);
	}

	.stars-display {
		display: flex;
		gap: var(--spacing-2);
		align-items: center;
	}

	.star {
		width: 48px;
		height: 48px;
		transition: transform var(--transition-fast);
	}

	.star:hover {
		transform: scale(1.15);
	}

	.star-full {
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
	}

	.sentiment-score {
		font-size: var(--font-size-2xl);
		font-weight: var(--font-weight-bold);
		text-align: center;
		color: var(--text-primary);
	}

	.sentiment-label {
		text-align: center;
		font-size: var(--font-size-lg);
		color: var(--text-secondary);
		font-weight: var(--font-weight-semibold);
	}

	.sentiment-score-detail {
		text-align: center;
		font-size: var(--font-size-sm);
		color: var(--text-muted);
		font-weight: var(--font-weight-medium);
	}

	.summary {
		font-size: var(--font-size-base);
		color: var(--text-secondary);
		line-height: var(--line-height-relaxed);
	}

	.themes-container {
		background: var(--bg-widget);
		padding: var(--spacing-8);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-soft);
		margin-bottom: var(--spacing-8);
	}

	.themes-container > h3 {
		margin: 0 0 var(--spacing-6) 0;
		font-size: var(--font-size-2xl);
		color: var(--text-primary);
		display: flex;
		align-items: center;
		gap: var(--spacing-3);
	}

	.theme-distribution {
		margin-bottom: var(--spacing-8);
	}

	.distribution-chart {
		width: 100%;
	}

	.chart-bar {
		display: flex;
		height: 60px;
		border-radius: var(--radius-sm);
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
		background: var(--bg-widget);
		padding: 1.5rem;
		border-radius: var(--radius-md);
		border-left: 4px solid;
		border: 1px solid var(--border-subtle);
	}

	.theme-card.positive {
		border-left-color: var(--color-success);
	}

	.theme-card.negative {
		border-left-color: var(--color-error);
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
		background: var(--bg-sidebar);
		border-radius: var(--radius-sm);
		margin-bottom: 0.5rem;
	}

	.theme-card .empty {
		color: var(--text-muted);
		font-style: italic;
	}

	.bugs-card {
		background: var(--bg-widget);
		padding: var(--spacing-8);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-soft);
		margin-bottom: var(--spacing-8);
	}

	.bugs-card h3 {
		margin: 0 0 1.5rem 0;
		font-size: 1.5rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.bugs-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.bug-item {
		padding: 1rem;
		background: var(--color-error-light);
		border-left: 4px solid;
		border-radius: var(--radius-sm);
		display: flex;
		align-items: flex-start;
		gap: 1rem;
	}

	.severity-badge {
		padding: 0.25rem 0.75rem;
		border-radius: var(--radius-md);
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
		background: var(--bg-widget);
		padding: var(--spacing-8);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-soft);
		margin-bottom: var(--spacing-8);
	}

	.features-card h3 {
		margin: 0 0 1.5rem 0;
		font-size: 1.5rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.features-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.feature-item {
		padding: 1rem;
		background: var(--color-info-light);
		border-left: 4px solid;
		border-radius: var(--radius-sm);
		display: flex;
		align-items: flex-start;
		gap: 1rem;
	}

	.priority-badge {
		padding: 0.25rem 0.75rem;
		border-radius: var(--radius-md);
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
		background: var(--bg-widget);
		padding: 1.5rem;
		border-radius: var(--radius-md);
		border: 1px solid var(--border-subtle);
	}

	.metadata-card h4 {
		margin: 0 0 1rem 0;
		font-size: 1rem;
		color: var(--text-secondary);
		display: flex;
		align-items: center;
		gap: 0.5rem;
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
		color: var(--text-muted);
	}

	.metadata-item .value {
		font-weight: 600;
		color: var(--text-primary);
	}

	/* Nouveaux styles pour l'analyse avancée */
	.executive-summary-card {
		background: var(--bg-widget);
		padding: var(--spacing-8);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-soft);
		margin-bottom: var(--spacing-8);
		border-top: 4px solid var(--text-primary);
		border: 1px solid var(--border-subtle);
	}

	.executive-summary-card h3 {
		margin: 0 0 1.5rem 0;
		font-size: 1.75rem;
		color: var(--text-primary);
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.key-insight {
		background: var(--bg-sidebar);
		padding: 1.5rem;
		border-radius: var(--radius-sm);
		margin-bottom: var(--spacing-8);
		border-left: 4px solid var(--text-primary);
		font-size: 1.05rem;
		line-height: 1.6;
		color: var(--text-primary);
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
		background: var(--bg-widget);
		border-radius: var(--radius-md);
		padding: 1.5rem;
		display: flex;
		gap: 1rem;
		border-left: 4px solid;
		border: 1px solid var(--border-subtle);
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.priority-item:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-medium);
	}

	.friction-item {
		border-left-color: var(--color-error);
		background: var(--color-error-light);
	}

	.strength-item {
		border-left-color: var(--color-success);
		background: var(--color-success-light);
	}

	.priority-badge {
		background: var(--text-primary);
		color: var(--bg-widget);
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
		color: var(--text-primary);
		margin-bottom: 0.5rem;
	}

	.priority-detail {
		color: var(--text-secondary);
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
		background: var(--bg-widget);
		padding: 0.25rem 0.75rem;
		border-radius: 6px;
		font-weight: 600;
	}

	.stat-impact.negative-impact {
		color: var(--color-error);
	}

	.stat-impact.positive-impact {
		color: var(--color-success);
	}

	.priority-quotes {
		margin: 1rem 0;
	}

	.priority-quotes blockquote {
		background: var(--bg-sidebar);
		padding: 0.75rem 1rem;
		border-left: 3px solid var(--text-primary);
		margin: 0.5rem 0;
		font-style: italic;
		color: var(--text-secondary);
		border-radius: 4px;
	}

	.priority-recommendation {
		background: var(--color-warning-light);
		border: 2px dashed var(--color-warning);
		padding: 1rem;
		border-radius: var(--radius-sm);
		margin-top: 1rem;
		color: var(--text-primary);
		line-height: 1.5;
	}

	.driver-report-card {
		background: var(--bg-widget);
		padding: var(--spacing-8);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-soft);
		margin-bottom: var(--spacing-8);
	}

	.driver-report-card h3 {
		margin: 0 0 1.5rem 0;
		font-size: 1.5rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.driver-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
		gap: 2rem;
	}

	.driver-column h4 {
		font-size: 1.1rem;
		margin-bottom: 1rem;
		color: var(--text-primary);
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
		background: var(--bg-widget);
		padding: 1rem;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border-subtle);
	}

	.driver-rank {
		background: var(--text-primary);
		color: var(--bg-widget);
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
		color: var(--text-primary);
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
		background: var(--text-primary);
		border-radius: 4px;
		transition: width 1s ease;
	}

	.driver-value {
		font-size: 0.85rem;
		color: var(--text-secondary);
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
		background: var(--bg-widget);
		padding: var(--spacing-8);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-soft);
		margin-bottom: var(--spacing-8);
	}

	.root-cause-card h3 {
		margin: 0 0 1.5rem 0;
		font-size: 1.5rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.root-cause-item {
		background: var(--bg-widget);
		padding: 1.5rem;
		border-radius: var(--radius-md);
		margin-bottom: 1.5rem;
		border-left: 4px solid var(--text-primary);
		border: 1px solid var(--border-subtle);
	}

	.root-cause-title {
		font-size: 1.25rem;
		color: var(--text-primary);
		margin: 0 0 1rem 0;
	}

	.subtheme-section {
		background: var(--bg-widget);
		padding: 1.5rem;
		border-radius: var(--radius-sm);
		margin-bottom: 1rem;
	}

	.subtheme-title {
		font-size: 1.1rem;
		color: var(--text-primary);
		margin: 0 0 1rem 0;
	}

	.causes-list {
		margin-bottom: 1rem;
	}

	.causes-list ul {
		margin: 0.5rem 0 0 1.5rem;
		color: var(--text-secondary);
	}

	.causes-list li {
		margin-bottom: 0.5rem;
		line-height: 1.5;
	}

	.root-cause-quotes {
		margin-top: 1rem;
	}

	.root-quote {
		background: var(--bg-sidebar);
		border-left: 3px solid var(--text-primary);
		padding: 0.75rem 1rem;
		margin: 0.5rem 0;
		font-style: italic;
		color: var(--text-secondary);
		border-radius: 4px;
	}

	.actionable-insights-card {
		background: var(--bg-widget);
		padding: var(--spacing-8);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-soft);
		margin-bottom: var(--spacing-8);
	}

	.actionable-insights-card h3 {
		margin: 0 0 1.5rem 0;
		font-size: 1.5rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.insights-grid {
		display: grid;
		gap: 1rem;
	}

	.insight-item {
		background: var(--bg-widget);
		padding: 1.5rem;
		border-radius: var(--radius-md);
		border-left: 4px solid;
		border: 1px solid var(--border-subtle);
	}

	.insight-item.high {
		border-left-color: var(--color-error);
		background: var(--color-error-light);
	}

	.insight-item.medium {
		border-left-color: var(--color-warning);
		background: var(--color-warning-light);
	}

	.insight-item.low {
		border-left-color: var(--border-medium);
		background: var(--bg-sidebar);
	}

	.insight-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.insight-priority-badge {
		padding: 0.25rem 0.75rem;
		border-radius: var(--radius-md);
		color: white;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
	}

	.insight-priority-badge.high {
		background: var(--color-error);
	}

	.insight-priority-badge.medium {
		background: var(--color-warning);
	}

	.insight-priority-badge.low {
		background: var(--border-medium);
	}

	.insight-friction {
		font-weight: 700;
		color: var(--text-primary);
		font-size: 1.05rem;
	}

	.insight-recommendation {
		color: var(--text-secondary);
		line-height: 1.6;
	}

	.all-themes-card {
		background: var(--bg-widget);
		padding: var(--spacing-8);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-soft);
		margin-bottom: var(--spacing-8);
	}

	.all-themes-card h3 {
		margin: 0 0 1.5rem 0;
		font-size: 1.5rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.themes-hierarchical-grid {
		display: grid;
		gap: 1rem;
	}

	.theme-hierarchical-item {
		background: var(--bg-widget);
		padding: 1rem 1.5rem;
		border-radius: var(--radius-sm);
		border-left: 4px solid;
		border: 1px solid var(--border-subtle);
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
		border-left-color: var(--color-success);
		background: var(--color-success-light);
	}

	.theme-hierarchical-item.negative {
		border-left-color: var(--color-error);
		background: var(--color-error-light);
	}

	.theme-hierarchical-item.neutral {
		border-left-color: var(--border-medium);
		background: var(--bg-sidebar);
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
		color: var(--text-primary);
	}

	.taxonomy-arrow {
		color: var(--text-muted);
		font-weight: 400;
	}

	.taxonomy-subtheme {
		font-weight: 600;
		color: var(--text-primary);
	}

	.taxonomy-issue {
		color: var(--text-secondary);
	}

	.theme-metrics {
		display: flex;
		align-items: center;
		gap: 1rem;
		font-size: 0.85rem;
	}

	.metric-mentions, .metric-impact {
		background: var(--bg-widget);
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
