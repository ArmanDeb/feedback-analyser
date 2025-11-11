<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';

	export let data: PageData;

	const analysis = data.analysis;
	const displayResult = analysis.result;
	
	// Calculate metrics
	const totalThemes = displayResult.themes.positive.length + displayResult.themes.negative.length;
	const positivePercentage = totalThemes > 0 ? (displayResult.themes.positive.length / totalThemes) * 100 : 50;
	const negativePercentage = totalThemes > 0 ? (displayResult.themes.negative.length / totalThemes) * 100 : 50;
	const hasAdvancedAnalysis = displayResult.executiveSummary && (displayResult.executiveSummary.topFrictionPoints?.length > 0 || displayResult.executiveSummary.topStrengthPoints?.length > 0);
	
	// Calculate donut chart values
	const circumference = 2 * Math.PI * 50;
	const positiveDash = (positivePercentage / 100) * circumference;
	const negativeDash = (negativePercentage / 100) * circumference;
	
	let showFeedback = false;
	let expandedCards: Record<string, boolean> = {};
	
	function toggleCard(cardId: string) {
		expandedCards[cardId] = !expandedCards[cardId];
		expandedCards = expandedCards; // Trigger reactivity
	}

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat('fr-FR', {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(date);
	}

	// Helper pour convertir score 0-10 en étoiles sur 5
	function getStarsFromScore(score: number): { full: number, half: boolean, empty: number } {
		const stars = (score / 10) * 5; // Convertir 0-10 vers 0-5
		const full = Math.floor(stars);
		const half = stars - full >= 0.5;
		const empty = 5 - full - (half ? 1 : 0);
		return { full, half, empty };
	}

	// Helper pour la couleur du sentiment - version très subtile
	function getSentimentColor(sentiment: string): string {
		switch (sentiment) {
			case 'positive': return 'var(--color-success-subtle)';
			case 'negative': return 'var(--color-error-subtle)';
			default: return 'var(--text-secondary)';
		}
	}

	// Helper pour la couleur basée sur le score (0-10) - version très subtile
	function getScoreColor(score: number): string {
		if (score >= 7) return 'var(--color-success-subtle)';
		if (score >= 4) return 'var(--text-secondary)';
		return 'var(--color-error-subtle)';
	}

	// Helper pour la couleur de sévérité - version très subtile
	function getSeverityColor(severity: string): string {
		switch (severity) {
			case 'high': return 'var(--color-error-subtle)';
			case 'medium': return 'var(--text-secondary)';
			default: return 'var(--text-secondary)';
		}
	}
</script>

<svelte:head>
	<title>Analyse - Analyseur de Feedback</title>
</svelte:head>

<div class="dashboard-page">
	<!-- Header -->
	<header class="dashboard-header">
		<div class="header-left">
			<button 
				on:click={() => goto('/tableau-de-bord')}
				class="back-button"
			>
				<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</button>
			<div>
				<h1 class="dashboard-title">Dashboard</h1>
				<p class="dashboard-subtitle">Analyse du {formatDate(analysis.createdAt)}</p>
			</div>
		</div>
	</header>

	<!-- Summary Cards Row -->
	<div class="summary-cards-row">
		<!-- Score Card -->
		<div class="summary-card">
			<div class="card-header">
				<div class="card-icon">
					<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="var(--text-secondary)"/>
					</svg>
				</div>
			</div>
			<div class="card-value">{displayResult.score !== undefined ? ((displayResult.score / 10) * 5).toFixed(1) : 'N/A'}</div>
			<div class="card-label">Score /5</div>
		</div>

		<!-- Themes Card -->
		<div class="summary-card">
			<div class="card-header">
				<div class="card-icon">
					<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="var(--text-secondary)"/>
					</svg>
				</div>
			</div>
			<div class="card-value">{totalThemes}</div>
			<div class="card-label">Thèmes</div>
		</div>

		<!-- Bugs Card -->
		<div class="summary-card">
			<div class="card-header">
				<div class="card-icon">
					<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="var(--text-secondary)"/>
					</svg>
				</div>
			</div>
			<div class="card-value">{displayResult.bugs.length}</div>
			<div class="card-label">Bugs</div>
		</div>

		<!-- Features Card -->
		<div class="summary-card">
			<div class="card-header">
				<div class="card-icon">
					<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="var(--text-secondary)"/>
					</svg>
				</div>
			</div>
			<div class="card-value">{displayResult.featureRequests.length}</div>
			<div class="card-label">Fonctionnalités</div>
		</div>
	</div>

	<!-- Main Content - Two Column Layout -->
	<main class="dashboard-main">
		<!-- Left Column (Main Content) -->
		<div class="dashboard-left">
			<!-- Synthèse Managériale -->
			{#if hasAdvancedAnalysis}
				<div class="expandable-card" class:expanded={expandedCards['executive']}>
					<div class="expandable-card-header" on:click={() => toggleCard('executive')}>
						<div class="expandable-card-title">
							<svg class="section-icon-small" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="var(--text-primary)"/>
							</svg>
							<span>Synthèse Managériale</span>
						</div>
						<svg class="expand-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M6 9l6 6 6-6" stroke="var(--text-secondary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</div>
					{#if expandedCards['executive']}
						<div class="expandable-card-content">
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
						{/if}
					</div>
				
				<!-- Rapport des Drivers -->
				{#if displayResult.driverReport && (displayResult.driverReport.themesByVolume?.length > 0 || displayResult.driverReport.themesBySentimentImpact?.length > 0)}
					<div class="expandable-card" class:expanded={expandedCards['drivers']}>
						<div class="expandable-card-header" on:click={() => toggleCard('drivers')}>
							<div class="expandable-card-title">
								<svg class="section-icon-small" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" fill="var(--text-primary)"/>
								</svg>
								<span>Rapport d'Analyse des Drivers</span>
							</div>
							<svg class="expand-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M6 9l6 6 6-6" stroke="var(--text-secondary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</div>
						{#if expandedCards['drivers']}
							<div class="expandable-card-content">
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
					</div>
				{/if}
				
				<!-- Analyse des Causes Profondes -->
				{#if displayResult.rootCauseAnalyses && displayResult.rootCauseAnalyses.length > 0}
					<div class="expandable-card" class:expanded={expandedCards['rootCause']}>
						<div class="expandable-card-header" on:click={() => toggleCard('rootCause')}>
							<div class="expandable-card-title">
								<svg class="section-icon-small" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<circle cx="11" cy="11" r="7" stroke="var(--text-primary)" stroke-width="2" fill="none"/>
									<path d="m20 20-4.35-4.35" stroke="var(--text-primary)" stroke-width="2" stroke-linecap="round"/>
								</svg>
								<span>Analyse des Causes Profondes</span>
							</div>
							<svg class="expand-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M6 9l6 6 6-6" stroke="var(--text-secondary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</div>
						{#if expandedCards['rootCause']}
							<div class="expandable-card-content">
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
					</div>
				{/if}
				
				<!-- Informations Exploitables -->
				{#if displayResult.actionableInsights && displayResult.actionableInsights.length > 0}
					<div class="expandable-card" class:expanded={expandedCards['insights']}>
						<div class="expandable-card-header" on:click={() => toggleCard('insights')}>
							<div class="expandable-card-title">
								<svg class="section-icon-small" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="var(--text-primary)"/>
								</svg>
								<span>Informations Exploitables & Recommandations</span>
							</div>
							<svg class="expand-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M6 9l6 6 6-6" stroke="var(--text-secondary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</div>
						{#if expandedCards['insights']}
							<div class="expandable-card-content">
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
					</div>
				{/if}
				
				<!-- Tous les Thèmes Identifiés -->
				{#if displayResult.allThemes && displayResult.allThemes.length > 0}
					<div class="expandable-card" class:expanded={expandedCards['allThemes']}>
						<div class="expandable-card-header" on:click={() => toggleCard('allThemes')}>
							<div class="expandable-card-title">
								<svg class="section-icon-small" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="var(--text-primary)"/>
								</svg>
								<span>Tous les Thèmes Identifiés ({displayResult.allThemes.length})</span>
							</div>
							<svg class="expand-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M6 9l6 6 6-6" stroke="var(--text-secondary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</div>
						{#if expandedCards['allThemes']}
							<div class="expandable-card-content">
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
					</div>
				{/if}
			{/if}
			
			<!-- Sentiment général -->
			<div class="sentiment-card">
				<div class="sentiment-header">
					<h3>Sentiment Général</h3>
					<span class="sentiment-badge" data-sentiment={displayResult.sentiment}>
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
								<svg class="star star-full" viewBox="0 0 24 24" fill="var(--text-primary)" xmlns="http://www.w3.org/2000/svg">
									<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
								</svg>
							{/each}
							<!-- Demi-étoile -->
							{#if stars.half}
								<svg class="star star-half" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
									<defs>
										<linearGradient id="halfStarGradient">
											<stop offset="50%" stop-color="var(--text-primary)" />
											<stop offset="50%" stop-color="var(--border-subtle)" />
										</linearGradient>
									</defs>
									<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#halfStarGradient)"/>
								</svg>
							{/if}
							<!-- Étoiles vides -->
							{#each Array(stars.empty) as _, i}
								<svg class="star star-empty" viewBox="0 0 24 24" fill="none" stroke="var(--border-subtle)" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
									<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
								</svg>
							{/each}
						</div>
						<div class="sentiment-score">
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
							Score détaillé: {((displayResult.score / 10) * 5).toFixed(1)}/5
						</div>
					</div>
				{/if}
				
				<p class="summary">{displayResult.summary}</p>
			</div>

			<!-- Thèmes avec graphique -->
			<div class="themes-container">
				<h3>
					<svg class="section-icon-small" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="var(--text-primary)"/>
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
					<div class="theme-card">
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

					<div class="theme-card">
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
				<div class="expandable-card" class:expanded={expandedCards['bugs']}>
					<div class="expandable-card-header" on:click={() => toggleCard('bugs')}>
						<div class="expandable-card-title">
							<svg class="section-icon-small" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="var(--text-primary)"/>
							</svg>
							<span>Bugs Identifiés ({displayResult.bugs.length})</span>
						</div>
						<svg class="expand-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M6 9l6 6 6-6" stroke="var(--text-secondary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</div>
					{#if expandedCards['bugs']}
						<div class="expandable-card-content">
							<div class="bugs-list">
								{#each displayResult.bugs as bug}
									<div class="bug-item">
										<span class="severity-badge">
											{bug.severity}
										</span>
										<p>{bug.description}</p>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Feature Requests -->
			{#if displayResult.featureRequests.length > 0}
				<div class="expandable-card" class:expanded={expandedCards['features']}>
					<div class="expandable-card-header" on:click={() => toggleCard('features')}>
						<div class="expandable-card-title">
							<svg class="section-icon-small" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="var(--text-primary)"/>
							</svg>
							<span>Demandes de Fonctionnalités ({displayResult.featureRequests.length})</span>
						</div>
						<svg class="expand-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M6 9l6 6 6-6" stroke="var(--text-secondary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</div>
					{#if expandedCards['features']}
						<div class="expandable-card-content">
							<div class="features-list">
								{#each displayResult.featureRequests as feature}
									<div class="feature-item">
										<span class="priority-badge">
											{feature.priority}
										</span>
										<p>{feature.description}</p>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Feedback original -->
			<div class="feedback-card">
				<button
					on:click={() => showFeedback = !showFeedback}
					class="feedback-toggle"
				>
					<h3>
						<svg class="section-icon-small" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="var(--text-primary)"/>
						</svg>
						Feedback original
					</h3>
					<svg 
						class="toggle-icon" 
						class:rotate-180={showFeedback}
						viewBox="0 0 24 24" 
						fill="none" 
						xmlns="http://www.w3.org/2000/svg"
					>
						<path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</button>
				{#if showFeedback}
					<div class="feedback-content">
						<p class="feedback-text">{analysis.feedbackText}</p>
					</div>
				{/if}
			</div>
		</div>

		<!-- Right Column (Sidebar) -->
		<div class="dashboard-right">
			<!-- Sentiment Summary Card -->
			<div class="sidebar-card sentiment-summary-card">
				<div class="sidebar-card-header">
					<h3>Sentiment Général</h3>
					<span class="sentiment-badge-sidebar" data-sentiment={displayResult.sentiment}>
						{displayResult.sentiment}
					</span>
				</div>
				{#if displayResult.score !== undefined}
					{@const stars = getStarsFromScore(displayResult.score)}
					<div class="sentiment-stars-sidebar">
						<div class="stars-display-sidebar">
							{#each Array(stars.full) as _, i}
								<svg class="star-sidebar star-full" viewBox="0 0 24 24" fill="var(--text-primary)" xmlns="http://www.w3.org/2000/svg">
									<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
								</svg>
							{/each}
							{#if stars.half}
								<svg class="star-sidebar star-half" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
									<defs>
										<linearGradient id="halfStarGradientSidebar">
											<stop offset="50%" stop-color="var(--text-primary)" />
											<stop offset="50%" stop-color="var(--border-subtle)" />
										</linearGradient>
									</defs>
									<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#halfStarGradientSidebar)"/>
								</svg>
							{/if}
							{#each Array(stars.empty) as _, i}
								<svg class="star-sidebar star-empty" viewBox="0 0 24 24" fill="none" stroke="var(--border-subtle)" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
									<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
								</svg>
							{/each}
						</div>
						<div class="sentiment-score-sidebar">
							{((displayResult.score / 10) * 5).toFixed(1)}/5
						</div>
					</div>
				{/if}
			</div>

			<!-- Distribution Chart Card -->
			<div class="sidebar-card distribution-card">
				<div class="sidebar-card-header">
					<h3>Distribution</h3>
					<span class="distribution-subtitle">Total: {totalThemes} thèmes</span>
				</div>
				<div class="donut-chart-container">
					<div class="donut-chart">
						<svg viewBox="0 0 120 120" class="donut-svg">
							<circle cx="60" cy="60" r="50" fill="none" stroke="var(--border-subtle)" stroke-width="20"/>
							{#if positivePercentage > 0}
								<circle 
									cx="60" 
									cy="60" 
									r="50" 
									fill="none" 
									stroke="var(--color-success-subtle)" 
									stroke-width="20"
									stroke-dasharray="{positiveDash} {circumference}"
									stroke-dashoffset="0"
									transform="rotate(-90 60 60)"
									class="donut-segment"
								/>
							{/if}
							{#if negativePercentage > 0}
								<circle 
									cx="60" 
									cy="60" 
									r="50" 
									fill="none" 
									stroke="var(--color-error-subtle)" 
									stroke-width="20"
									stroke-dasharray="{negativeDash} {circumference}"
									stroke-dashoffset="{-positiveDash}"
									transform="rotate(-90 60 60)"
									class="donut-segment"
								/>
							{/if}
						</svg>
						<div class="donut-center">
							<div class="donut-total">{totalThemes}</div>
							<div class="donut-label">Thèmes</div>
						</div>
					</div>
					<div class="donut-legend">
						<div class="legend-item">
							<span class="legend-color" style="background: var(--color-success-subtle);"></span>
							<span class="legend-label">Positifs</span>
							<span class="legend-value">{displayResult.themes.positive.length} ({positivePercentage.toFixed(0)}%)</span>
						</div>
						<div class="legend-item">
							<span class="legend-color" style="background: var(--color-error-subtle);"></span>
							<span class="legend-label">Négatifs</span>
							<span class="legend-value">{displayResult.themes.negative.length} ({negativePercentage.toFixed(0)}%)</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Recent Items -->
			{#if displayResult.bugs.length > 0 || displayResult.featureRequests.length > 0}
				<div class="sidebar-card recent-items-card">
					<div class="sidebar-card-header">
						<h3>Éléments Récents</h3>
						<a href="#bugs" class="see-all-link">Voir tout</a>
					</div>
					<div class="recent-items-list">
						{#each displayResult.bugs.slice(0, 3) as bug}
							<div class="recent-item">
								<div class="recent-item-icon bug-icon">
									<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
										<circle cx="12" cy="12" r="10" stroke="var(--text-primary)" stroke-width="2"/>
										<path d="M12 8v4M12 16h.01" stroke="var(--text-primary)" stroke-width="2" stroke-linecap="round"/>
									</svg>
								</div>
								<div class="recent-item-content">
									<div class="recent-item-title">Bug: {bug.description.substring(0, 40)}{bug.description.length > 40 ? '...' : ''}</div>
									<div class="recent-item-time">{bug.severity}</div>
								</div>
							</div>
						{/each}
						{#each displayResult.featureRequests.slice(0, 3) as feature}
							<div class="recent-item">
								<div class="recent-item-icon feature-icon">
									<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="var(--text-primary)"/>
									</svg>
								</div>
								<div class="recent-item-content">
									<div class="recent-item-title">Feature: {feature.description.substring(0, 40)}{feature.description.length > 40 ? '...' : ''}</div>
									<div class="recent-item-time">{feature.priority}</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</main>
</div>

<style>
	.dashboard-page {
		max-width: 1400px;
		margin: 0 auto;
		padding: 1rem;
		background: var(--bg-page);
		min-height: 100vh;
	}

	/* Header */
	.dashboard-header {
		margin-bottom: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.back-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: var(--bg-widget);
		border: 1px solid var(--border-subtle);
		color: var(--text-secondary);
		cursor: pointer;
		transition: all var(--transition-base);
	}

	.back-button:hover {
		background: var(--bg-sidebar);
		color: var(--text-primary);
		transform: translateX(-2px);
	}

	.dashboard-title {
		font-size: 2rem;
		font-weight: 700;
		color: var(--text-primary);
		margin: 0;
		line-height: 1.2;
	}

	.dashboard-subtitle {
		font-size: 0.875rem;
		color: var(--text-secondary);
		margin: 0.25rem 0 0 0;
	}

	/* Summary Cards Row */
	.summary-cards-row {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.summary-card {
		background: var(--bg-widget);
		border-radius: 0.5rem;
		padding: 0.75rem;
		border: 1px solid var(--border-subtle);
		transition: all var(--transition-base);
		position: relative;
		overflow: hidden;
	}

	.summary-card:hover {
		box-shadow: var(--shadow-medium);
		transform: translateY(-2px);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.card-icon {
		width: 28px;
		height: 28px;
		border-radius: 0.375rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
	}

	.card-icon svg {
		width: 18px;
		height: 18px;
	}

	.card-tag {
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 600;
		background: var(--bg-sidebar);
		color: var(--text-secondary);
		border: 1px solid var(--border-subtle);
	}

	.card-tag.bug-tag {
		background: var(--bg-sidebar);
		color: var(--text-secondary);
		border: 1px solid var(--border-subtle);
	}

	.card-tag.feature-tag {
		background: var(--bg-sidebar);
		color: var(--text-secondary);
		border: 1px solid var(--border-subtle);
	}

	.card-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--text-primary);
		margin-bottom: 0.25rem;
		line-height: 1;
	}

	.card-label {
		font-size: 0.75rem;
		color: var(--text-secondary);
		margin: 0;
	}

	.card-chart {
		margin-top: 0.5rem;
		color: var(--text-muted);
	}

	/* Dashboard Main Layout */
	.dashboard-main {
		display: grid;
		grid-template-columns: 1fr 380px;
		gap: 2rem;
	}

	.dashboard-left {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.dashboard-right {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	/* Expandable Cards */
	.expandable-card {
		background: var(--bg-widget);
		border-radius: 0.5rem;
		border: 1px solid var(--border-subtle);
		overflow: hidden;
		transition: all var(--transition-base);
	}

	.expandable-card-header {
		padding: 0.75rem 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		cursor: pointer;
		user-select: none;
		transition: background var(--transition-fast);
	}

	.expandable-card-header:hover {
		background: var(--bg-sidebar);
	}

	.expandable-card-title {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.expandable-card-title svg {
		width: 18px;
		height: 18px;
		flex-shrink: 0;
	}

	.expand-icon {
		width: 20px;
		height: 20px;
		transition: transform var(--transition-base);
		flex-shrink: 0;
	}

	.expandable-card.expanded .expand-icon {
		transform: rotate(180deg);
	}

	.expandable-card-content {
		padding: 0 1rem 0.75rem 1rem;
		border-top: 1px solid var(--border-subtle);
	}

	/* Sidebar Cards */
	.sidebar-card {
		background: var(--bg-widget);
		border-radius: 1rem;
		padding: 1.5rem;
		border: 1px solid var(--border-subtle);
	}

	.sidebar-card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.sidebar-card-header h3 {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
	}

	.sentiment-badge-sidebar {
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		background: var(--bg-sidebar);
		color: var(--text-primary);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		border: 1px solid var(--border-subtle);
	}
	
	.sentiment-badge-sidebar[data-sentiment="positive"] {
		background: var(--color-success-subtle-light);
		border-color: var(--color-success-subtle);
	}
	
	.sentiment-badge-sidebar[data-sentiment="negative"] {
		background: var(--color-error-subtle-light);
		border-color: var(--color-error-subtle);
	}

	.sentiment-stars-sidebar {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}

	.stars-display-sidebar {
		display: flex;
		gap: 0.25rem;
	}

	.star-sidebar {
		width: 24px;
		height: 24px;
	}

	.sentiment-score-sidebar {
		font-size: 1.5rem;
		font-weight: 700;
	}

	/* Donut Chart */
	.distribution-subtitle {
		font-size: 0.75rem;
		color: var(--text-secondary);
	}

	.donut-chart-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
	}

	.donut-chart {
		position: relative;
		width: 180px;
		height: 180px;
	}

	.donut-svg {
		width: 100%;
		height: 100%;
		transform: rotate(-90deg);
	}

	.donut-segment {
		transition: stroke-dasharray 1s ease;
	}

	.donut-center {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
	}

	.donut-total {
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--text-primary);
		line-height: 1;
	}

	.donut-label {
		font-size: 0.875rem;
		color: var(--text-secondary);
		margin-top: 0.25rem;
	}

	.donut-legend {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.875rem;
	}

	.legend-color {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.legend-label {
		flex: 1;
		color: var(--text-secondary);
	}

	.legend-value {
		font-weight: 600;
		color: var(--text-primary);
	}

	/* Recent Items */
	.see-all-link {
		font-size: 0.875rem;
		color: var(--text-secondary);
		text-decoration: none;
		transition: color var(--transition-fast);
	}

	.see-all-link:hover {
		color: var(--text-primary);
	}

	.recent-items-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.recent-item {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 0.75rem;
		border-radius: 0.75rem;
		transition: background var(--transition-fast);
	}

	.recent-item:hover {
		background: var(--bg-sidebar);
	}

	.recent-item-icon {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.bug-icon {
		background: transparent;
	}

	.feature-icon {
		background: transparent;
	}

	.recent-item-icon svg {
		width: 20px;
		height: 20px;
	}

	.recent-item-content {
		flex: 1;
		min-width: 0;
	}

	.recent-item-title {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-primary);
		margin-bottom: 0.25rem;
		line-height: 1.4;
	}

	.recent-item-time {
		font-size: 0.75rem;
		color: var(--text-secondary);
	}

	/* Responsive Design */
	@media (max-width: 1200px) {
		.dashboard-main {
			grid-template-columns: 1fr;
		}

		.dashboard-right {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 1.5rem;
		}
	}

	@media (max-width: 768px) {
		.dashboard-page {
			padding: 1rem;
		}

		.summary-cards-row {
			grid-template-columns: repeat(2, 1fr);
			gap: 1rem;
		}

		.dashboard-right {
			grid-template-columns: 1fr;
		}

		.dashboard-title {
			font-size: 1.5rem;
		}

		.card-value {
			font-size: 1.5rem;
		}
	}

	@media (max-width: 480px) {
		.summary-cards-row {
			grid-template-columns: 1fr;
		}
	}

	/* Legacy styles - keeping for compatibility */
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

	.back-button {
		display: flex;
		align-items: center;
		gap: var(--spacing-2);
		margin-bottom: var(--spacing-4);
		padding: var(--spacing-2) 0;
		background: none;
		border: none;
		color: var(--text-secondary);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		transition: color var(--transition-base);
	}

	.back-button:hover {
		color: var(--text-primary);
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

	.sentiment-card {
		background: var(--bg-widget);
		padding: var(--spacing-8);
		border-radius: var(--radius-lg);
		border: 1px solid var(--border-subtle);
		margin-bottom: var(--spacing-8);
		transition: all var(--transition-base);
		position: relative;
		overflow: hidden;
	}

	.sentiment-card:hover {
		border-color: var(--border-medium);
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
		background: var(--bg-sidebar);
		color: var(--text-primary);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		font-size: var(--font-size-xs);
		border: 1px solid var(--border-subtle);
	}
	
	.sentiment-badge[data-sentiment="positive"] {
		background: var(--color-success-subtle-light);
		border-color: var(--color-success-subtle);
	}
	
	.sentiment-badge[data-sentiment="negative"] {
		background: var(--color-error-subtle-light);
		border-color: var(--color-error-subtle);
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
		width: 52px;
		height: 52px;
		transition: all var(--transition-base);
		cursor: pointer;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
	}

	.star:hover {
		transform: scale(1.2) rotate(5deg);
		filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
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
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-medium);
		margin-bottom: var(--spacing-8);
		transition: all var(--transition-base);
		border: 1px solid var(--border-subtle);
	}

	.themes-container:hover {
		border-color: var(--border-medium);
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
		height: 48px;
		border-radius: var(--radius-md);
		overflow: hidden;
		border: 1px solid var(--border-subtle);
		background: var(--bg-widget);
	}

	.bar-segment {
		display: flex;
		align-items: center;
		justify-content: center;
		transition: width 1s ease;
		min-width: 60px;
		position: relative;
	}

	.bar-segment.positive {
		background: var(--color-success-subtle-light);
		border-right: 2px solid var(--border-subtle);
	}

	.bar-segment.negative {
		background: var(--color-error-subtle-light);
	}

	.bar-label {
		color: var(--text-primary);
		font-weight: 600;
		font-size: 0.9rem;
		z-index: 1;
	}

	.themes-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.theme-card {
		background: var(--bg-widget);
		padding: 1.5rem;
		border-radius: var(--radius-lg);
		border-left: 4px solid;
		border: 1px solid var(--border-subtle);
		transition: all var(--transition-base);
		position: relative;
		overflow: hidden;
	}

	.theme-card:hover {
		border-color: var(--border-medium);
	}

	.theme-card.positive {
		border-left-color: var(--color-success-subtle);
	}

	.theme-card.negative {
		border-left-color: var(--color-error-subtle);
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
		padding: 0.75rem 1rem;
		background: var(--bg-sidebar);
		border-radius: var(--radius-md);
		margin-bottom: 0.5rem;
		transition: all var(--transition-fast);
		border-left: 2px solid transparent;
	}

	.theme-card li:hover {
		background: var(--bg-page);
		border-left-color: var(--border-medium);
		transform: translateX(4px);
		padding-left: 1.25rem;
	}

	.theme-card .empty {
		color: var(--text-muted);
		font-style: italic;
	}

	.bugs-card {
		background: var(--bg-widget);
		padding: var(--spacing-8);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-medium);
		margin-bottom: var(--spacing-8);
		border: 1px solid var(--border-subtle);
		transition: all var(--transition-base);
	}

	.bugs-card:hover {
		box-shadow: var(--shadow-large);
		border-color: var(--border-medium);
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
		padding: 1.25rem;
		background: var(--bg-widget);
		border-radius: var(--radius-lg);
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		transition: all var(--transition-base);
		cursor: pointer;
		border: 1px solid var(--border-subtle);
	}

	.bug-item:hover {
		border-color: var(--border-medium);
		background: var(--bg-sidebar);
	}

	.severity-badge {
		padding: 0.25rem 0.75rem;
		border-radius: 0.375rem;
		font-size: 0.75rem;
		font-weight: 600;
		flex-shrink: 0;
	}

	.severity-badge.bug-badge {
		background: var(--color-error-subtle-light);
		color: var(--text-primary);
		border: 1px solid var(--color-error-subtle);
	}

	.bug-item p {
		margin: 0;
		flex: 1;
	}

	.features-card {
		background: var(--bg-widget);
		padding: var(--spacing-8);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-medium);
		margin-bottom: var(--spacing-8);
		border: 1px solid var(--border-subtle);
		transition: all var(--transition-base);
	}

	.features-card:hover {
		box-shadow: var(--shadow-large);
		border-color: var(--border-medium);
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
		padding: 1.25rem;
		background: var(--bg-widget);
		border-radius: var(--radius-lg);
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		transition: all var(--transition-base);
		cursor: pointer;
		border: 1px solid var(--border-subtle);
	}

	.feature-item:hover {
		border-color: var(--border-medium);
		background: var(--bg-sidebar);
	}

	.priority-badge {
		padding: 0.25rem 0.75rem;
		border-radius: 0.375rem;
		font-size: 0.75rem;
		font-weight: 600;
		flex-shrink: 0;
	}

	.priority-badge.feature-badge {
		background: var(--color-success-subtle-light);
		color: var(--text-primary);
		border: 1px solid var(--color-success-subtle);
	}

	.feature-item p {
		margin: 0;
		flex: 1;
	}

	.feedback-card {
		background: var(--bg-widget);
		padding: var(--spacing-8);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-medium);
		margin-bottom: var(--spacing-8);
		border: 1px solid var(--border-subtle);
		transition: all var(--transition-base);
	}

	.feedback-card:hover {
		box-shadow: var(--shadow-large);
		border-color: var(--border-medium);
	}

	.feedback-toggle {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		transition: all var(--transition-fast);
		border-radius: var(--radius-md);
		padding: var(--spacing-2);
		margin: calc(var(--spacing-2) * -1);
	}

	.feedback-toggle:hover {
		background: var(--bg-sidebar);
	}

	.feedback-toggle h3 {
		margin: 0;
		font-size: 1.5rem;
		color: var(--text-primary);
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.toggle-icon {
		width: 24px;
		height: 24px;
		color: var(--text-secondary);
		transition: transform var(--transition-base);
	}

	.toggle-icon.rotate-180 {
		transform: rotate(180deg);
	}

	.feedback-content {
		margin-top: var(--spacing-6);
		padding-top: var(--spacing-6);
		border-top: 1px solid var(--border-subtle);
	}

	.feedback-text {
		font-size: var(--font-size-base);
		color: var(--text-secondary);
		line-height: var(--line-height-relaxed);
		white-space: pre-wrap;
	}

	/* Nouveaux styles pour l'analyse avancée */
	.executive-summary-card {
		background: var(--bg-widget);
		padding: var(--spacing-8);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-medium);
		margin-bottom: var(--spacing-8);
		border-top: 4px solid var(--text-primary);
		border: 1px solid var(--border-subtle);
		transition: all var(--transition-base);
		position: relative;
		overflow: hidden;
	}

	.executive-summary-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: linear-gradient(90deg, var(--text-primary), rgba(44, 44, 44, 0.3));
	}

	.executive-summary-card:hover {
		box-shadow: var(--shadow-large);
		transform: translateY(-2px);
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
		padding: 0.75rem;
		border-radius: 0.375rem;
		margin-bottom: 0.75rem;
		border-left: 3px solid var(--text-primary);
		font-size: 0.875rem;
		line-height: 1.5;
		color: var(--text-primary);
	}

	.summary-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 0.75rem;
	}

	.summary-column h4 {
		font-size: 0.875rem;
		margin-bottom: 0.5rem;
		font-weight: 600;
	}

	.priority-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.priority-item {
		background: var(--bg-sidebar);
		border-radius: 0.375rem;
		padding: 0.75rem;
		display: flex;
		gap: 0.75rem;
		border-left: 3px solid;
		border: 1px solid var(--border-subtle);
		transition: all var(--transition-fast);
	}

	.priority-item:hover {
		background: var(--bg-widget);
		border-color: var(--border-medium);
	}

	.priority-item .priority-badge {
		background: var(--text-primary);
		color: var(--bg-widget);
		font-weight: 600;
		font-size: 0.875rem;
		width: 28px;
		height: 28px;
		border-radius: 0.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.friction-item {
		border-left-color: var(--color-error-subtle);
	}

	.friction-item .priority-badge {
		background: var(--color-error-subtle-light);
		color: var(--text-primary);
		border: 1px solid var(--color-error-subtle);
	}

	.strength-item {
		border-left-color: var(--color-success-subtle);
	}

	.strength-item .priority-badge {
		background: var(--color-success-subtle-light);
		color: var(--text-primary);
		border: 1px solid var(--color-success-subtle);
	}

	.priority-content {
		flex: 1;
	}

	.priority-title {
		font-weight: 600;
		font-size: 0.875rem;
		color: var(--text-primary);
		margin-bottom: 0.25rem;
	}

	.priority-detail {
		color: var(--text-secondary);
		margin-bottom: 0.5rem;
		line-height: 1.4;
		font-size: 0.8125rem;
	}

	.priority-stats {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
		font-size: 0.75rem;
	}

	.stat-volume, .stat-impact {
		background: var(--bg-widget);
		padding: 0.25rem 0.75rem;
		border-radius: 6px;
		font-weight: 600;
	}

	.stat-impact.negative-impact {
		color: var(--color-error-subtle);
	}

	.stat-impact.positive-impact {
		color: var(--color-success-subtle);
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
		background: var(--bg-sidebar);
		border: 1px solid var(--border-subtle);
		padding: 1rem;
		border-radius: var(--radius-sm);
		margin-top: 1rem;
		color: var(--text-primary);
		line-height: 1.5;
	}

	.driver-report-card {
		background: var(--bg-widget);
		padding: var(--spacing-8);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-medium);
		margin-bottom: var(--spacing-8);
		border: 1px solid var(--border-subtle);
		transition: all var(--transition-base);
	}

	.driver-report-card:hover {
		box-shadow: var(--shadow-large);
		border-color: var(--border-medium);
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
		padding: 1.25rem;
		border-radius: var(--radius-lg);
		border: 1px solid var(--border-subtle);
		transition: all var(--transition-base);
		cursor: pointer;
	}

	.driver-item:hover {
		transform: translateX(4px);
		box-shadow: var(--shadow-medium);
		border-color: var(--border-medium);
		background: var(--bg-sidebar);
	}

	.driver-rank {
		background: var(--bg-sidebar);
		color: var(--text-primary);
		font-weight: 600;
		font-size: 0.85rem;
		padding: 0.375rem 0.625rem;
		border-radius: var(--radius-md);
		flex-shrink: 0;
		border: 1px solid var(--border-subtle);
		transition: all var(--transition-fast);
		min-width: 32px;
		text-align: center;
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
		background: var(--bg-sidebar);
		border-radius: var(--radius-md);
		transition: width 1s ease;
		border: 1px solid var(--border-subtle);
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
		background: var(--color-success-subtle);
	}

	.sentiment-impact-indicator.negative {
		background: var(--color-error-subtle);
	}

	.sentiment-impact-indicator.neutral {
		background: var(--border-medium);
	}

	.root-cause-card {
		background: var(--bg-widget);
		padding: var(--spacing-8);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-medium);
		margin-bottom: var(--spacing-8);
		border: 1px solid var(--border-subtle);
		transition: all var(--transition-base);
	}

	.root-cause-card:hover {
		box-shadow: var(--shadow-large);
		border-color: var(--border-medium);
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
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-medium);
		margin-bottom: var(--spacing-8);
		border: 1px solid var(--border-subtle);
		transition: all var(--transition-base);
	}

	.actionable-insights-card:hover {
		box-shadow: var(--shadow-large);
		border-color: var(--border-medium);
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
		border-radius: var(--radius-lg);
		border-left: 4px solid;
		border: 1px solid var(--border-subtle);
		transition: all var(--transition-base);
		cursor: pointer;
		position: relative;
		overflow: hidden;
	}

	.insight-item:hover {
		border-color: var(--border-medium);
	}

	.insight-item.high {
		border-left-color: var(--border-medium);
		background: var(--bg-widget);
	}

	.insight-item.medium {
		border-left-color: var(--border-medium);
		background: var(--bg-widget);
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
		padding: 0.375rem 0.875rem;
		border-radius: var(--radius-lg);
		color: var(--text-primary);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		transition: all var(--transition-fast);
		letter-spacing: 0.5px;
	}


	.insight-priority-badge.high {
		background: var(--bg-sidebar);
		color: var(--text-primary);
		border: 1px solid var(--border-subtle);
	}

	.insight-priority-badge.medium {
		background: var(--bg-sidebar);
		color: var(--text-primary);
		border: 1px solid var(--border-subtle);
	}

	.insight-priority-badge.low {
		background: var(--bg-sidebar);
		color: var(--text-primary);
		border: 1px solid var(--border-subtle);
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
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-medium);
		margin-bottom: var(--spacing-8);
		border: 1px solid var(--border-subtle);
		transition: all var(--transition-base);
	}

	.all-themes-card:hover {
		box-shadow: var(--shadow-large);
		border-color: var(--border-medium);
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
		padding: 1.25rem 1.75rem;
		border-radius: var(--radius-lg);
		border-left: 4px solid;
		border: 1px solid var(--border-subtle);
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		transition: all var(--transition-base);
		cursor: pointer;
		position: relative;
		overflow: hidden;
	}

	.theme-hierarchical-item:hover {
		border-color: var(--border-medium);
	}

	.theme-hierarchical-item.positive {
		border-left-color: var(--color-success-subtle);
		background: var(--color-success-subtle-light);
	}

	.theme-hierarchical-item.negative {
		border-left-color: var(--color-error-subtle);
		background: var(--color-error-subtle-light);
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
		background: var(--bg-sidebar);
		padding: 0.375rem 0.625rem;
		border-radius: var(--radius-md);
		font-weight: 600;
		border: 1px solid var(--border-subtle);
		transition: all var(--transition-fast);
	}

	.theme-hierarchical-item:hover .metric-mentions,
	.theme-hierarchical-item:hover .metric-impact {
		background: var(--bg-widget);
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

	.empty {
		color: var(--text-muted);
		font-style: italic;
	}
</style>
