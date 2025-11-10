<script lang="ts">
	// Dashboard - Interface principale de l'utilisateur
	let feedback = '';
	let isAnalyzing = false;
	let analysisResult: any = null;

	async function analyzeFeedback() {
		if (!feedback.trim()) {
			alert('Veuillez entrer du feedback à analyser');
			return;
		}

		isAnalyzing = true;
		analysisResult = null;

		try {
			// TODO: Implémenter l'appel API (Épopée S2)
			console.log('Analyse du feedback:', feedback);
			// Simulation temporaire
			await new Promise(resolve => setTimeout(resolve, 1000));
			analysisResult = {
				message: "L'API d'analyse sera implémentée dans l'Épopée S2"
			};
		} catch (error) {
			console.error('Erreur lors de l\'analyse:', error);
			alert('Une erreur est survenue lors de l\'analyse');
		} finally {
			isAnalyzing = false;
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

		{#if analysisResult}
			<section class="results-section">
				<h2>Résultats de l'Analyse</h2>
				<div class="results-card">
					<pre>{JSON.stringify(analysisResult, null, 2)}</pre>
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

	.results-card {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.results-card pre {
		background: #f8f9fa;
		padding: 1rem;
		border-radius: 8px;
		overflow-x: auto;
		font-size: 0.9rem;
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
</style>

