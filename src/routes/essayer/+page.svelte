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
			error = 'Limite de démo atteinte';
			return;
		}

		// Validation améliorée
		if (!feedback.trim()) {
			error = 'Veuillez entrer du feedback à analyser';
			return;
		}

		if (feedback.length < MIN_FEEDBACK_LENGTH) {
			error = `Le feedback est trop court (minimum ${MIN_FEEDBACK_LENGTH} caractères, vous avez ${feedback.length})`;
			return;
		}

		if (feedback.length > MAX_FEEDBACK_LENGTH) {
			error = `Le feedback est trop long (maximum ${MAX_FEEDBACK_LENGTH} caractères, vous avez ${feedback.length})`;
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
			
			// Incrémenter le compteur de démo
			demoCount++;
			localStorage.setItem('demoCount', demoCount.toString());

		} catch (err) {
			console.error('Erreur lors de l\'analyse:', err);
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

	function getSentimentGaugeRotation(score: number): number {
		return ((score + 1) / 2) * 180;
	}

	function getSentimentColor(sentiment: string): string {
		switch (sentiment) {
			case 'positive': return 'var(--color-success)';
			case 'negative': return 'var(--color-error)';
			default: return 'var(--gray-500)';
		}
	}

	function getSeverityColor(severity: string): string {
		switch (severity) {
			case 'high': return 'var(--color-error)';
			case 'medium': return 'var(--color-warning)';
			default: return 'var(--gray-500)';
		}
	}
</script>

<svelte:head>
	<title>Essayer - Analyseur de Feedback</title>
</svelte:head>

<div class="min-h-screen" style="background: var(--bg-page);">
	<div class="max-w-7xl mx-auto px-6 py-8">
		<header class="mb-8">
			<h1 class="text-4xl font-bold mb-2" style="color: var(--text-primary);">Essayer l'Analyseur</h1>
			<p class="text-lg mb-2" style="color: var(--text-secondary);">Mode démo - {remaining} analyse{remaining > 1 ? 's' : ''} restante{remaining > 1 ? 's' : ''} sur {DEMO_LIMIT}</p>
			{#if remaining <= 2 && remaining > 0}
				<p class="text-sm mt-2" style="color: var(--text-secondary);">Plus que {remaining} analyse{remaining > 1 ? 's' : ''} ! <a href="/auth/signup" class="underline font-semibold" style="color: var(--text-primary);">Créez un compte</a> pour profiter d'analyses illimitées.</p>
			{/if}
		</header>

		<main>
			{#if isLimitReached}
			<section class="mb-8">
				<div class="p-12 rounded-lg text-center" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
					<h2 class="text-3xl font-semibold mb-4" style="color: var(--text-primary);">Limite de démo atteinte !</h2>
					<p class="mb-2" style="color: var(--text-secondary);">Vous avez utilisé vos {DEMO_LIMIT} analyses gratuites.</p>
					<p class="mb-8" style="color: var(--text-secondary);">Créez un compte pour continuer à analyser vos feedbacks clients sans limite.</p>
					<div class="flex flex-wrap justify-center gap-4">
						<a href="/auth/signup" class="px-8 py-4 rounded-lg font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5" style="background: var(--text-primary); color: var(--bg-widget);">Créer un compte</a>
						<a href="/auth/signin" class="px-8 py-4 rounded-lg font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5 border-2" style="background: transparent; color: var(--text-primary); border-color: var(--border-subtle);">Se connecter</a>
					</div>
				</div>
			</section>
		{:else}
			<section class="mb-8">
				<div class="p-4 mb-6 rounded-lg text-sm" style="background: var(--bg-sidebar); border: 1px solid var(--border-subtle);">
					<strong style="color: var(--text-primary);">Mode Démo:</strong> Vos analyses ne seront pas sauvegardées. 
					<a href="/auth/signup" class="underline font-semibold" style="color: var(--text-primary);">Créez un compte</a> pour sauvegarder et retrouver votre historique.
				</div>
				
				<div class="p-8 rounded-lg" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
					<div class="mb-6">
						<textarea
							bind:value={feedback}
							placeholder="Collez ici le feedback client à analyser...&#10;&#10;Exemple: 'J'adore votre produit mais j'ai rencontré un bug lors du paiement. Aussi, ce serait génial d'avoir une fonctionnalité d'export en PDF.'"
							rows="8"
							disabled={isAnalyzing}
							class="w-full p-4 rounded-lg border-2 transition-colors resize-y"
							class:border-red-500={isTooLong}
							class:border-yellow-500={isTooShort}
							style="border-color: {isTooLong ? 'var(--color-error)' : isTooShort ? 'var(--color-warning)' : 'var(--border-subtle)'}; background: var(--bg-widget); color: var(--text-primary);"
						></textarea>
						
						<div class="flex items-center justify-between mt-2 text-sm">
							<span class="font-medium" style="color: {isTooLong ? 'var(--color-error)' : isTooShort ? 'var(--color-warning)' : 'var(--text-secondary)'};">{feedbackLength} / {MAX_FEEDBACK_LENGTH}</span>
							{#if isTooLong}
								<span class="font-medium" style="color: var(--color-error);">Trop long ({feedbackLength - MAX_FEEDBACK_LENGTH} caractères en trop)</span>
							{:else if isTooShort}
								<span class="font-medium" style="color: var(--color-warning);">Trop court (minimum {MIN_FEEDBACK_LENGTH} caractères)</span>
							{:else if feedbackLength > 0}
								<span class="font-medium" style="color: var(--color-success);">Longueur valide</span>
							{/if}
						</div>
						
						{#if feedbackLength > 0}
							<div class="h-1 mt-2 rounded-full overflow-hidden" style="background: var(--border-subtle);">
								<div 
									class="h-full transition-all rounded-full"
									style="width: {Math.min(percentageUsed, 100)}%; background: {percentageUsed > 100 ? 'var(--color-error)' : percentageUsed > 80 ? 'var(--color-warning)' : 'var(--color-success)'};"
								></div>
							</div>
						{/if}
					</div>

					<button 
						class="w-full px-8 py-4 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
						style="background: var(--text-primary); color: var(--bg-widget);"
						on:click={analyzeFeedback}
						disabled={isAnalyzing || !feedback.trim() || !isValidLength}
						title={!isValidLength && feedback.trim() ? 'La longueur du feedback n\'est pas valide' : ''}
					>
						{#if isAnalyzing}
							<span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
							Analyse en cours...
						{:else}
							Analyser le Feedback ({remaining} restantes)
						{/if}
					</button>
				</div>
			</section>

			{#if error}
				<section class="mb-8">
					<div class="p-6 rounded-lg border-2" style="background: var(--color-error-light); border-color: var(--color-error);">
						<h3 class="text-xl font-semibold mb-2" style="color: var(--color-error);">Erreur</h3>
						<p style="color: var(--text-primary);">{error}</p>
					</div>
				</section>
			{/if}

			{#if analysisResult}
				{@const displayResult = analysisResult.analysis}
				{@const totalThemes = displayResult.themes.positive.length + displayResult.themes.negative.length}
				{@const positivePercentage = totalThemes > 0 ? (displayResult.themes.positive.length / totalThemes) * 100 : 50}
				{@const negativePercentage = totalThemes > 0 ? (displayResult.themes.negative.length / totalThemes) * 100 : 50}
				<section class="space-y-8">
					<h2 class="text-3xl font-semibold mb-8" style="color: var(--text-primary);">Résultats de l'Analyse</h2>
					
					<!-- Sentiment général -->
					<div class="p-8 rounded-lg border-l-4" style="background: var(--bg-widget); border-left-color: {getSentimentColor(displayResult.sentiment)}; border: 1px solid var(--border-subtle);">
						<div class="flex justify-between items-center mb-6">
							<h3 class="text-2xl font-semibold" style="color: var(--text-primary);">Sentiment Général</h3>
							<span class="px-4 py-2 rounded-full font-semibold text-xs uppercase" style="background: {getSentimentColor(displayResult.sentiment)}; color: var(--text-primary);">
								{displayResult.sentiment}
							</span>
						</div>
						
						<div class="flex flex-col items-center my-8">
							<svg class="mb-4" viewBox="0 0 200 120" width="200" height="120">
								<path 
									d="M 20 100 A 80 80 0 0 1 180 100" 
									fill="none" 
									stroke="var(--border-subtle)" 
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
									<line x1="0" y1="0" x2="70" y2="0" stroke="var(--text-primary)" stroke-width="3" stroke-linecap="round"/>
									<circle cx="0" cy="0" r="5" fill="var(--text-primary)"/>
								</g>
								<text x="15" y="115" font-size="10" fill="var(--text-muted)">-1</text>
								<text x="93" y="30" font-size="10" fill="var(--text-muted)">0</text>
								<text x="178" y="115" font-size="10" fill="var(--text-muted)">+1</text>
							</svg>
							<div class="text-xl font-semibold" style="color: {getSentimentColor(displayResult.sentiment)};">
								Score: {displayResult.score.toFixed(2)}
							</div>
						</div>
						
						<p class="leading-relaxed" style="color: var(--text-secondary);">{displayResult.summary}</p>
					</div>

					<!-- Thèmes avec graphique -->
					<div class="p-8 rounded-lg mb-8" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
						<h3 class="text-2xl font-semibold mb-6" style="color: var(--text-primary);">Distribution des Thèmes</h3>
						
						<div class="mb-8">
							<div class="flex h-[60px] rounded-md overflow-hidden">
								<div class="flex items-center justify-center transition-all min-w-[60px]" style="width: {positivePercentage}%; background: var(--color-success);">
									<span class="text-sm font-semibold text-white">{displayResult.themes.positive.length} positif{displayResult.themes.positive.length > 1 ? 's' : ''}</span>
								</div>
								<div class="flex items-center justify-center transition-all min-w-[60px]" style="width: {negativePercentage}%; background: var(--color-error);">
									<span class="text-sm font-semibold text-white">{displayResult.themes.negative.length} négatif{displayResult.themes.negative.length > 1 ? 's' : ''}</span>
								</div>
							</div>
						</div>
						
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div class="p-6 rounded-md border-l-4" style="background: var(--bg-widget); border-left-color: var(--color-success); border: 1px solid var(--border-subtle);">
								<h4 class="text-lg font-semibold mb-4" style="color: var(--text-primary);">Points Positifs ({displayResult.themes.positive.length})</h4>
								{#if displayResult.themes.positive.length > 0}
									<ul class="list-none p-0 m-0">
										{#each displayResult.themes.positive as theme}
											<li class="p-3 mb-2 rounded-sm" style="background: var(--bg-sidebar); color: var(--text-secondary);">{theme}</li>
										{/each}
									</ul>
								{:else}
									<p class="italic" style="color: var(--text-muted);">Aucun point positif identifié</p>
								{/if}
							</div>

							<div class="p-6 rounded-md border-l-4" style="background: var(--bg-widget); border-left-color: var(--color-error); border: 1px solid var(--border-subtle);">
								<h4 class="text-lg font-semibold mb-4" style="color: var(--text-primary);">Points Négatifs ({displayResult.themes.negative.length})</h4>
								{#if displayResult.themes.negative.length > 0}
									<ul class="list-none p-0 m-0">
										{#each displayResult.themes.negative as theme}
											<li class="p-3 mb-2 rounded-sm" style="background: var(--bg-sidebar); color: var(--text-secondary);">{theme}</li>
										{/each}
									</ul>
								{:else}
									<p class="italic" style="color: var(--text-muted);">Aucun point négatif identifié</p>
								{/if}
							</div>
						</div>
					</div>

					{#if displayResult.bugs.length > 0}
						<div class="p-8 rounded-lg mb-8" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
							<h3 class="text-2xl font-semibold mb-6" style="color: var(--text-primary);">Bugs Identifiés ({displayResult.bugs.length})</h3>
							<div class="flex flex-col gap-4">
								{#each displayResult.bugs as bug}
									<div class="p-4 rounded-md border-l-4 flex items-start gap-4" style="background: var(--color-error-light); border-left-color: {getSeverityColor(bug.severity)};">
										<span class="px-3 py-1 rounded-full text-xs font-semibold uppercase flex-shrink-0" style="background: {getSeverityColor(bug.severity)}; color: var(--text-primary);">{bug.severity}</span>
										<p class="m-0 flex-1 leading-relaxed" style="color: var(--text-secondary);">{bug.description}</p>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					{#if displayResult.featureRequests.length > 0}
						<div class="p-8 rounded-lg mb-8" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
							<h3 class="text-2xl font-semibold mb-6" style="color: var(--text-primary);">Demandes de Fonctionnalités ({displayResult.featureRequests.length})</h3>
							<div class="flex flex-col gap-4">
								{#each displayResult.featureRequests as feature}
									<div class="p-4 rounded-md border-l-4 flex items-start gap-4" style="background: var(--bg-sidebar); border-left-color: {getSeverityColor(feature.priority)};">
										<span class="px-3 py-1 rounded-full text-xs font-semibold uppercase flex-shrink-0" style="background: {getSeverityColor(feature.priority)}; color: var(--text-primary);">{feature.priority}</span>
										<p class="m-0 flex-1 leading-relaxed" style="color: var(--text-secondary);">{feature.description}</p>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- CTA après résultats -->
					<div class="p-12 rounded-lg text-center" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
						<h3 class="text-2xl font-semibold mb-4" style="color: var(--text-primary);">Vous aimez cet outil ?</h3>
						<p class="mb-8 text-lg" style="color: var(--text-secondary);">Créez un compte pour sauvegarder vos analyses et accéder à l'historique complet !</p>
						<a href="/auth/signup" class="inline-block px-8 py-4 rounded-lg font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5" style="background: var(--text-primary); color: var(--bg-widget);">Créer un compte gratuit</a>
					</div>
				</section>
			{/if}
		{/if}
	</main>
	</div>
</div>


