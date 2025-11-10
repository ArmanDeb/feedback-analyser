<script lang="ts">
	// Landing Page - Page d'accueil
</script>

<svelte:head>
	<title>Analyseur de Feedback Client - Transformez vos retours clients en insights actionnables</title>
	<meta name="description" content="Analysez automatiquement vos feedbacks clients avec l'IA. Identifiez les bugs, les demandes de fonctionnalités et les sentiments en quelques secondes." />
</svelte:head>

<div class="landing-page">
	<header class="hero">
		<h1>Analyseur de Feedback Client</h1>
		<p class="tagline">Transformez vos retours clients en insights actionnables grâce à l'IA</p>
		<div class="cta-buttons">
			<a href="/dashboard" class="btn btn-primary">Commencer gratuitement</a>
		</div>
	</header>

	<section class="features">
		<h2>Pourquoi notre outil ?</h2>
		<div class="features-grid">
			<div class="feature-card">
				<h3>🎯 Analyse Automatique</h3>
				<p>L'IA analyse vos feedbacks et extrait automatiquement les thèmes, sentiments et demandes.</p>
			</div>
			<div class="feature-card">
				<h3>📊 Insights Structurés</h3>
				<p>Obtenez des résultats clairs : bugs, fonctionnalités demandées, points de friction.</p>
			</div>
			<div class="feature-card">
				<h3>⚡ Gain de Temps</h3>
				<p>Plus besoin de lire des heures de feedbacks. L'IA fait le travail pour vous.</p>
			</div>
		</div>
	</section>

	<footer>
		<p>&copy; 2025 Analyseur de Feedback. Tous droits réservés.</p>
	</footer>
</div>

<style>
	.landing-page {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.hero {
		text-align: center;
		padding: 4rem 2rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-radius: 12px;
		margin-bottom: 3rem;
	}

	.hero h1 {
		font-size: 3rem;
		margin-bottom: 1rem;
		font-weight: 700;
	}

	.tagline {
		font-size: 1.25rem;
		margin-bottom: 2rem;
		opacity: 0.95;
	}

	.cta-buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.btn {
		padding: 1rem 2rem;
		border-radius: 8px;
		text-decoration: none;
		font-weight: 600;
		transition: all 0.3s ease;
	}

	.btn-primary {
		background: white;
		color: #667eea;
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
	}

	.features {
		padding: 3rem 0;
	}

	.features h2 {
		text-align: center;
		font-size: 2rem;
		margin-bottom: 2rem;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
	}

	.feature-card {
		padding: 2rem;
		background: #f8f9fa;
		border-radius: 8px;
		transition: transform 0.3s ease;
	}

	.feature-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.feature-card h3 {
		font-size: 1.5rem;
		margin-bottom: 1rem;
	}

	footer {
		text-align: center;
		padding: 2rem 0;
		margin-top: 4rem;
		border-top: 1px solid #e0e0e0;
		color: #666;
	}
</style>

