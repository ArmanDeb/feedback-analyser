<script lang="ts">
	// Page d'accueil publique
	import { page } from '$app/stores';
	
	$: user = $page.data.user;
	$: isAuthenticated = !!user;
</script>

<svelte:head>
	<title>Feedback Analyser - Transformez vos feedbacks en insights actionnables</title>
	<meta name="description" content="Analysez automatiquement vos feedbacks clients avec l'IA. Identifiez les bugs, les demandes de fonctionnalités et le sentiment général en quelques secondes." />
</svelte:head>

<div class="homepage">
	<!-- Hero Section -->
	<section class="hero">
		<div class="hero-content">
			<h1 class="hero-title">
				Transformez vos feedbacks <br />
				en <span class="gradient-text">insights actionnables</span>
			</h1>
			<p class="hero-subtitle">
				Analysez automatiquement vos feedbacks clients avec l'IA. 
				Identifiez les bugs, les demandes de fonctionnalités et le sentiment général en quelques secondes.
			</p>
			<div class="hero-actions">
				{#if isAuthenticated}
					<a href="/nouvelle-analyse" class="btn btn-primary">
						Nouvelle Analyse
					</a>
					<a href="/tableau-de-bord" class="btn btn-secondary">
						Tableau de Bord
					</a>
				{:else}
					<a href="/auth/signup" class="btn btn-primary">
						S'inscrire
					</a>
					<a href="/auth/signin" class="btn btn-secondary">
						Se connecter
					</a>
				{/if}
			</div>
		</div>
		<div class="hero-visual">
			<div class="visual-card card-1">
				<div class="visual-icon">📊</div>
				<div class="visual-text">Analyse en temps réel</div>
			</div>
			<div class="visual-card card-2">
				<div class="visual-icon">🎯</div>
				<div class="visual-text">Détection automatique</div>
			</div>
			<div class="visual-card card-3">
				<div class="visual-icon">💡</div>
				<div class="visual-text">Insights actionnables</div>
			</div>
		</div>
	</section>

	<!-- Features Section -->
	<section class="features">
		<h2 class="section-title">Tout ce dont vous avez besoin</h2>
		<div class="features-grid">
			<div class="feature-card">
				<div class="feature-icon">🤖</div>
				<h3>Analyse IA Avancée</h3>
				<p>
					Notre IA analyse en profondeur chaque feedback pour en extraire 
					le sentiment, les thèmes clés, et les points d'amélioration.
				</p>
			</div>

			<div class="feature-card">
				<div class="feature-icon">🐛</div>
				<h3>Détection de Bugs</h3>
				<p>
					Identifiez automatiquement les bugs mentionnés dans les feedbacks 
					avec leur niveau de sévérité (high, medium, low).
				</p>
			</div>

			<div class="feature-card">
				<div class="feature-icon">✨</div>
				<h3>Demandes de Fonctionnalités</h3>
				<p>
					Extrayez et priorisez les demandes de nouvelles fonctionnalités 
					pour orienter votre roadmap produit.
				</p>
			</div>

			<div class="feature-card">
				<div class="feature-icon">📈</div>
				<h3>Analyse de Sentiment</h3>
				<p>
					Mesurez le sentiment général (positif, négatif, neutre) avec 
					un score précis de -1 à +1.
				</p>
			</div>

			<div class="feature-card">
				<div class="feature-icon">🎯</div>
				<h3>Thèmes Identifiés</h3>
				<p>
					Classez automatiquement les feedbacks par thèmes positifs et 
					négatifs pour une vision claire.
				</p>
			</div>

			<div class="feature-card">
				<div class="feature-icon">📊</div>
				<h3>Historique Complet</h3>
				<p>
					Accédez à l'historique de toutes vos analyses et suivez 
					l'évolution des feedbacks dans le temps.
				</p>
			</div>
		</div>
	</section>

	<!-- How It Works Section -->
	<section class="how-it-works">
		<h2 class="section-title">Comment ça marche ?</h2>
		<div class="steps">
			<div class="step">
				<div class="step-number">1</div>
				<h3>Collez votre feedback</h3>
				<p>Copiez-collez simplement le feedback client que vous souhaitez analyser</p>
			</div>

			<div class="step-arrow">→</div>

			<div class="step">
				<div class="step-number">2</div>
				<h3>L'IA analyse</h3>
				<p>Notre IA traite le texte et extrait tous les insights pertinents</p>
			</div>

			<div class="step-arrow">→</div>

			<div class="step">
				<div class="step-number">3</div>
				<h3>Obtenez les résultats</h3>
				<p>Recevez une analyse complète avec bugs, fonctionnalités et sentiment</p>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="cta-section">
		<div class="cta-content">
			<h2>Prêt à transformer vos feedbacks ?</h2>
			<p>Commencez dès maintenant avec 5 analyses gratuites, sans carte bancaire.</p>
			<div class="cta-buttons">
				{#if isAuthenticated}
					<a href="/nouvelle-analyse" class="btn btn-large btn-white">
						Commencer l'analyse
					</a>
				{:else}
					<a href="/auth/signup" class="btn btn-large btn-white">
						S'inscrire
					</a>
					<a href="/auth/signin" class="btn btn-large btn-outline">
						Se connecter
					</a>
				{/if}
			</div>
		</div>
	</section>

	<!-- Stats Section -->
	<section class="stats">
		<div class="stat">
			<div class="stat-number">5</div>
			<div class="stat-label">Analyses gratuites</div>
		</div>
		<div class="stat">
			<div class="stat-number">&lt; 10s</div>
			<div class="stat-label">Temps d'analyse</div>
		</div>
		<div class="stat">
			<div class="stat-number">100%</div>
			<div class="stat-label">Automatique</div>
		</div>
	</section>
</div>

<style>
	.homepage {
		width: 100%;
	}

	/* Hero Section */
	.hero {
		max-width: 1200px;
		margin: 0 auto;
		padding: 4rem 2rem;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4rem;
		align-items: center;
		min-height: calc(100vh - 200px);
	}

	.hero-content {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.hero-title {
		font-size: 3.5rem;
		font-weight: 800;
		line-height: 1.2;
		color: #1a1a1a;
		margin: 0;
	}

	.gradient-text {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.hero-subtitle {
		font-size: 1.25rem;
		line-height: 1.6;
		color: #666;
		margin: 0;
	}

	.hero-actions {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.btn {
		padding: 1rem 2rem;
		border-radius: 12px;
		text-decoration: none;
		font-weight: 600;
		font-size: 1.1rem;
		transition: all 0.3s ease;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border: 2px solid transparent;
		cursor: pointer;
	}

	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.btn-primary:hover {
		transform: translateY(-3px);
		box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
	}

	.btn-secondary {
		background: white;
		color: #667eea;
		border: 2px solid #667eea;
	}

	.btn-secondary:hover {
		background: #f8f9ff;
		transform: translateY(-3px);
		box-shadow: 0 10px 25px rgba(102, 126, 234, 0.2);
	}

	.hero-visual {
		position: relative;
		height: 400px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.visual-card {
		position: absolute;
		background: white;
		padding: 1.5rem;
		border-radius: 16px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
		display: flex;
		align-items: center;
		gap: 1rem;
		animation: float 3s ease-in-out infinite;
	}

	.visual-icon {
		font-size: 2rem;
	}

	.visual-text {
		font-weight: 600;
		color: #333;
	}

	.card-1 {
		top: 20%;
		left: 10%;
		animation-delay: 0s;
	}

	.card-2 {
		top: 50%;
		right: 10%;
		animation-delay: 0.5s;
	}

	.card-3 {
		bottom: 20%;
		left: 20%;
		animation-delay: 1s;
	}

	@keyframes float {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-20px);
		}
	}

	/* Features Section */
	.features {
		background: #f8f9ff;
		padding: 6rem 2rem;
	}

	.section-title {
		text-align: center;
		font-size: 2.5rem;
		font-weight: 700;
		color: #1a1a1a;
		margin: 0 0 3rem 0;
	}

	.features-grid {
		max-width: 1200px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
	}

	.feature-card {
		background: white;
		padding: 2rem;
		border-radius: 16px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		transition: all 0.3s ease;
	}

	.feature-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
	}

	.feature-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.feature-card h3 {
		font-size: 1.5rem;
		font-weight: 700;
		color: #333;
		margin: 0 0 1rem 0;
	}

	.feature-card p {
		color: #666;
		line-height: 1.6;
		margin: 0;
	}

	/* How It Works Section */
	.how-it-works {
		max-width: 1200px;
		margin: 0 auto;
		padding: 6rem 2rem;
	}

	.steps {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 2rem;
		flex-wrap: wrap;
	}

	.step {
		flex: 1;
		min-width: 250px;
		text-align: center;
		padding: 2rem;
	}

	.step-number {
		width: 60px;
		height: 60px;
		margin: 0 auto 1.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		font-weight: 700;
	}

	.step h3 {
		font-size: 1.5rem;
		font-weight: 700;
		color: #333;
		margin: 0 0 1rem 0;
	}

	.step p {
		color: #666;
		line-height: 1.6;
		margin: 0;
	}

	.step-arrow {
		font-size: 2rem;
		color: #667eea;
		font-weight: 700;
	}

	/* CTA Section */
	.cta-section {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 6rem 2rem;
	}

	.cta-content {
		max-width: 800px;
		margin: 0 auto;
		text-align: center;
		color: white;
	}

	.cta-content h2 {
		font-size: 2.5rem;
		font-weight: 700;
		margin: 0 0 1rem 0;
	}

	.cta-content p {
		font-size: 1.25rem;
		margin: 0 0 2rem 0;
		opacity: 0.9;
	}

	.cta-buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.btn-large {
		padding: 1.25rem 2.5rem;
		font-size: 1.2rem;
	}

	.btn-white {
		background: white;
		color: #667eea;
	}

	.btn-white:hover {
		transform: translateY(-3px);
		box-shadow: 0 10px 25px rgba(255, 255, 255, 0.3);
	}

	.btn-outline {
		background: transparent;
		color: white;
		border: 2px solid white;
	}

	.btn-outline:hover {
		background: rgba(255, 255, 255, 0.1);
		transform: translateY(-3px);
	}

	/* Stats Section */
	.stats {
		max-width: 1200px;
		margin: 0 auto;
		padding: 6rem 2rem;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 3rem;
	}

	.stat {
		text-align: center;
	}

	.stat-number {
		font-size: 3rem;
		font-weight: 700;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin-bottom: 0.5rem;
	}

	.stat-label {
		font-size: 1.1rem;
		color: #666;
		font-weight: 500;
	}

	/* Responsive Design */
	@media (max-width: 968px) {
		.hero {
			grid-template-columns: 1fr;
			gap: 3rem;
			min-height: auto;
			padding: 3rem 2rem;
		}

		.hero-title {
			font-size: 2.5rem;
		}

		.hero-visual {
			height: 300px;
		}

		.step-arrow {
			display: none;
		}

		.stats {
			grid-template-columns: 1fr;
			gap: 2rem;
		}
	}

	@media (max-width: 640px) {
		.hero-title {
			font-size: 2rem;
		}

		.hero-subtitle {
			font-size: 1.1rem;
		}

		.section-title {
			font-size: 2rem;
		}

		.cta-content h2 {
			font-size: 2rem;
		}

		.cta-content p {
			font-size: 1.1rem;
		}

		.hero-actions,
		.cta-buttons {
			flex-direction: column;
		}

		.btn {
			width: 100%;
		}
	}
</style>

