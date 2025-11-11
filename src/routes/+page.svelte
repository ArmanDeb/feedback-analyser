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

<div class="homepage min-h-screen" style="background: var(--bg-page);">
	<!-- Hero Section -->
	<section class="max-w-7xl mx-auto px-6 py-24 lg:py-32">
		<div class="grid lg:grid-cols-2 gap-16 items-center">
			<div class="space-y-8">
				<h1 class="text-5xl lg:text-6xl font-semibold leading-tight" style="color: var(--text-primary);">
					Transformez vos feedbacks<br />
					en <span style="color: var(--text-primary); font-weight: 600;">insights actionnables</span>
				</h1>
				<p class="text-xl leading-relaxed max-w-xl" style="color: var(--text-secondary);">
					Analysez automatiquement vos feedbacks clients avec l'IA. 
					Identifiez les bugs, les demandes de fonctionnalités et le sentiment général en quelques secondes.
				</p>
				<div class="flex flex-wrap gap-4">
					{#if isAuthenticated}
						<a href="/nouvelle-analyse" class="btn-primary-home px-6 py-3 rounded-lg font-medium transition-colors">
							Nouvelle Analyse
						</a>
						<a href="/tableau-de-bord" class="btn-secondary-home px-6 py-3 rounded-lg font-medium transition-colors">
							Tableau de Bord
						</a>
					{:else}
						<a href="/auth/signup" class="btn-primary-home px-6 py-3 rounded-lg font-medium transition-colors">
							S'inscrire
						</a>
						<a href="/auth/signin" class="btn-secondary-home px-6 py-3 rounded-lg font-medium transition-colors">
							Se connecter
						</a>
					{/if}
				</div>
			</div>
			
			<!-- Stats Cards -->
			<div class="grid grid-cols-3 gap-4">
				<div class="stat-card-home rounded-lg p-6 hover:shadow-sm transition-shadow" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
					<div class="flex justify-between items-center mb-4">
						<span class="text-sm font-medium" style="color: var(--text-secondary);">Analyses</span>
						<span class="text-xs px-2 py-1 bg-[#E8F5E9] text-[#2E7D32] rounded font-medium">+17%</span>
					</div>
					<div class="text-3xl font-semibold mb-2" style="color: var(--text-primary);">5,687</div>
					<svg width="60" height="20" viewBox="0 0 60 20" fill="none" class="mt-2">
						<polyline points="0,15 10,12 20,10 30,8 40,5 50,3 60,2" stroke="#2E7D32" stroke-width="2" fill="none"/>
					</svg>
				</div>
				
				<div class="stat-card-home rounded-lg p-6 hover:shadow-sm transition-shadow" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
					<div class="flex justify-between items-center mb-4">
						<span class="text-sm font-medium" style="color: var(--text-secondary);">Temps moyen</span>
						<span class="text-xs px-2 py-1 bg-[#FFF3E0] text-[#F57C00] rounded font-medium">-23%</span>
					</div>
					<div class="text-3xl font-semibold mb-2" style="color: var(--text-primary);">&lt; 10s</div>
					<svg width="60" height="20" viewBox="0 0 60 20" fill="none" class="mt-2">
						<polyline points="0,5 10,8 20,10 30,12 40,15 50,17 60,18" stroke="#F57C00" stroke-width="2" fill="none"/>
					</svg>
				</div>
				
				<div class="stat-card-home rounded-lg p-6 hover:shadow-sm transition-shadow flex flex-col justify-between" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
					<div>
						<span class="text-sm font-medium" style="color: var(--text-secondary);">Upgrade</span>
					</div>
					<div class="mt-4">
						<p class="text-sm mb-4" style="color: var(--text-secondary);">Obtenez plus d'informations et d'opportunités</p>
						<a href="/auth/signup" class="btn-primary-home inline-block px-4 py-2 text-sm rounded-lg font-medium transition-colors">
							Go Pro
						</a>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Features Section -->
	<section class="py-24" style="background: var(--bg-sidebar);">
		<div class="max-w-6xl mx-auto px-6">
			<h2 class="text-4xl font-semibold text-center mb-16" style="color: var(--text-primary);">
				Tout ce dont vous avez besoin
			</h2>
			<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
				<div class="feature-card-home rounded-lg p-8 hover:shadow-sm transition-shadow" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
					<svg class="w-12 h-12 mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: var(--text-primary);">
						<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
					</svg>
					<h3 class="text-xl font-semibold mb-3" style="color: var(--text-primary);">Analyse IA Avancée</h3>
					<p class="leading-relaxed" style="color: var(--text-secondary);">
						Notre IA analyse en profondeur chaque feedback pour en extraire 
						le sentiment, les thèmes clés, et les points d'amélioration.
					</p>
				</div>

				<div class="feature-card-home rounded-lg p-8 hover:shadow-sm transition-shadow" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
					<svg class="w-12 h-12 mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: var(--text-primary);">
						<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
					</svg>
					<h3 class="text-xl font-semibold mb-3" style="color: var(--text-primary);">Détection de Bugs</h3>
					<p class="leading-relaxed" style="color: var(--text-secondary);">
						Identifiez automatiquement les bugs mentionnés dans les feedbacks 
						avec leur niveau de sévérité (high, medium, low).
					</p>
				</div>

				<div class="feature-card-home rounded-lg p-8 hover:shadow-sm transition-shadow" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
					<svg class="w-12 h-12 mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: var(--text-primary);">
						<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
					</svg>
					<h3 class="text-xl font-semibold mb-3" style="color: var(--text-primary);">Demandes de Fonctionnalités</h3>
					<p class="leading-relaxed" style="color: var(--text-secondary);">
						Extrayez et priorisez les demandes de nouvelles fonctionnalités 
						pour orienter votre roadmap produit.
					</p>
				</div>

				<div class="feature-card-home rounded-lg p-8 hover:shadow-sm transition-shadow" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
					<svg class="w-12 h-12 mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: var(--text-primary);">
						<path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" fill="currentColor"/>
					</svg>
					<h3 class="text-xl font-semibold mb-3" style="color: var(--text-primary);">Analyse de Sentiment</h3>
					<p class="leading-relaxed" style="color: var(--text-secondary);">
						Mesurez le sentiment général (positif, négatif, neutre) avec 
						un score précis de -1 à +1.
					</p>
				</div>

				<div class="feature-card-home rounded-lg p-8 hover:shadow-sm transition-shadow" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
					<svg class="w-12 h-12 mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: var(--text-primary);">
						<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
					</svg>
					<h3 class="text-xl font-semibold mb-3" style="color: var(--text-primary);">Thèmes Identifiés</h3>
					<p class="leading-relaxed" style="color: var(--text-secondary);">
						Classez automatiquement les feedbacks par thèmes positifs et 
						négatifs pour une vision claire.
					</p>
				</div>

				<div class="feature-card-home rounded-lg p-8 hover:shadow-sm transition-shadow" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
					<svg class="w-12 h-12 mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: var(--text-primary);">
						<path d="M3 3v18h18V3H3zm16 16H5V5h14v14z" fill="currentColor"/>
						<path d="M7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z" fill="currentColor"/>
					</svg>
					<h3 class="text-xl font-semibold mb-3" style="color: var(--text-primary);">Historique Complet</h3>
					<p class="leading-relaxed" style="color: var(--text-secondary);">
						Accédez à l'historique de toutes vos analyses et suivez 
						l'évolution des feedbacks dans le temps.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- How It Works Section - Modern Style -->
	<section class="py-32" style="background: var(--bg-page);">
		<div class="max-w-5xl mx-auto px-6">
			<h2 class="text-5xl font-semibold text-center mb-20" style="color: var(--text-primary);">
				Comment ça marche ?
			</h2>
			
			<div class="grid md:grid-cols-3 gap-12 relative">
				<!-- Connecting Line (Desktop) -->
				<div class="hidden md:block absolute top-12 left-1/3 right-1/3 h-0.5 -z-10" style="background: var(--border-subtle);"></div>
				
				<!-- Step 1 -->
				<div class="relative text-center group">
					<div class="mb-6">
						<span class="text-6xl font-light transition-colors" style="color: var(--border-subtle);">01</span>
					</div>
					<h3 class="text-2xl font-semibold mb-4" style="color: var(--text-primary);">Collez votre feedback</h3>
					<p class="leading-relaxed" style="color: var(--text-secondary);">
						Copiez-collez simplement le feedback client que vous souhaitez analyser dans l'interface.
					</p>
				</div>

				<!-- Step 2 -->
				<div class="relative text-center group">
					<div class="mb-6">
						<span class="text-6xl font-light transition-colors" style="color: var(--border-subtle);">02</span>
					</div>
					<h3 class="text-2xl font-semibold mb-4" style="color: var(--text-primary);">L'IA analyse</h3>
					<p class="leading-relaxed" style="color: var(--text-secondary);">
						Notre IA traite le texte et extrait tous les insights pertinents en quelques secondes.
					</p>
				</div>

				<!-- Step 3 -->
				<div class="relative text-center group">
					<div class="mb-6">
						<span class="text-6xl font-light transition-colors" style="color: var(--border-subtle);">03</span>
					</div>
					<h3 class="text-2xl font-semibold mb-4" style="color: var(--text-primary);">Obtenez les résultats</h3>
					<p class="leading-relaxed" style="color: var(--text-secondary);">
						Recevez une analyse complète avec bugs, fonctionnalités et sentiment détaillés.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Stats & CTA Combined Section -->
	<section class="py-32" style="background: var(--bg-sidebar);">
		<div class="max-w-6xl mx-auto px-6">
			<!-- Stats Grid -->
			<div class="grid md:grid-cols-3 gap-6 mb-20">
				<div class="stat-card-home rounded-2xl p-8 text-center transition-all hover:shadow-lg" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
					<div class="text-6xl font-light mb-3" style="color: var(--text-primary);">5</div>
					<div class="text-lg font-medium" style="color: var(--text-secondary);">Analyses gratuites</div>
				</div>
				<div class="stat-card-home rounded-2xl p-8 text-center transition-all hover:shadow-lg" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
					<div class="text-6xl font-light mb-3" style="color: var(--text-primary);">&lt; 10s</div>
					<div class="text-lg font-medium" style="color: var(--text-secondary);">Temps d'analyse</div>
				</div>
				<div class="stat-card-home rounded-2xl p-8 text-center transition-all hover:shadow-lg" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
					<div class="text-6xl font-light mb-3" style="color: var(--text-primary);">100%</div>
					<div class="text-lg font-medium" style="color: var(--text-secondary);">Automatique</div>
				</div>
			</div>

			<!-- CTA Card -->
			<div class="rounded-2xl p-12 md:p-16 text-center" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
				<h2 class="text-4xl md:text-5xl font-semibold mb-6" style="color: var(--text-primary);">
					Prêt à transformer vos feedbacks ?
				</h2>
				<p class="text-xl mb-10 max-w-2xl mx-auto" style="color: var(--text-secondary);">
					Commencez dès maintenant avec 5 analyses gratuites, sans carte bancaire.
				</p>
				<div class="flex flex-wrap justify-center gap-4">
					{#if isAuthenticated}
						<a href="/nouvelle-analyse" class="btn-primary-home px-8 py-4 rounded-lg font-medium transition-colors">
							Commencer l'analyse
						</a>
					{:else}
						<a href="/auth/signup" class="btn-primary-home px-8 py-4 rounded-lg font-medium transition-colors">
							S'inscrire
						</a>
						<a href="/auth/signin" class="btn-secondary-home px-8 py-4 rounded-lg font-medium transition-colors">
							Se connecter
						</a>
					{/if}
				</div>
			</div>
		</div>
	</section>
</div>

<style>
	.homepage {
		font-family: var(--font-family);
	}

	.btn-primary-home {
		background: var(--text-primary);
		color: var(--bg-widget);
	}

	.btn-primary-home:hover {
		background: #2A2824;
		transform: translateY(-1px);
	}

	.btn-secondary-home {
		background: transparent;
		color: var(--text-primary);
		border: 2px solid var(--border-subtle);
	}

	.btn-secondary-home:hover {
		border-color: var(--border-medium);
		background: var(--bg-sidebar);
		transform: translateY(-1px);
	}

	.stat-card-home:hover {
		border-color: var(--border-medium) !important;
	}

	.feature-card-home:hover {
		border-color: var(--border-medium) !important;
	}
</style>
