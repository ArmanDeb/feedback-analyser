<script lang="ts">
	import { page } from '$app/stores';

	// Récupérer le slug pour déterminer quelle page afficher
	$: slug = $page.params.stack;
	$: isSignIn = slug === 'sign-in';
	$: isSignUp = slug === 'sign-up';
</script>

<svelte:head>
	<title>{isSignIn ? 'Connexion' : 'Inscription'} - Feedback Analyser</title>
</svelte:head>

<div class="auth-container">
	<div class="auth-card">
		<h1>{isSignIn ? '🔐 Connexion' : '✨ Inscription'}</h1>
		
		<div class="info-banner">
			<h2>⚠️ Authentification temporairement désactivée</h2>
			<p>
				L'intégration Stack Auth est en cours de configuration. 
				Pour l'instant, l'application fonctionne en <strong>mode développement</strong>.
			</p>
			
			<div class="features">
				<h3>✅ Ce qui fonctionne déjà :</h3>
				<ul>
					<li>📊 Analyse de feedback par IA</li>
					<li>🔐 Dashboard admin (mode dev)</li>
					<li>💾 Sauvegarde en base de données</li>
					<li>💰 Monitoring des coûts</li>
				</ul>
			</div>

			<div class="actions">
				<a href="/dashboard" class="btn-primary">
					Accéder au Dashboard
				</a>
				<a href="/admin" class="btn-secondary">
					Dashboard Admin
				</a>
			</div>

			<div class="note">
				<p><strong>Note pour les développeurs :</strong></p>
				<p>
					Stack Auth est conçu pour Next.js. Pour SvelteKit, nous recommandons 
					d'utiliser <a href="https://authjs.dev/" target="_blank">Auth.js (NextAuth)</a> 
					ou <a href="https://lucia-auth.com/" target="_blank">Lucia Auth</a>.
				</p>
			</div>
		</div>
	</div>
</div>

<style>
	.auth-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 80vh;
		padding: 2rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}

	.auth-card {
		background: white;
		border-radius: 16px;
		padding: 3rem;
		max-width: 600px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	}

	h1 {
		text-align: center;
		color: #333;
		margin-bottom: 2rem;
		font-size: 2rem;
	}

	.info-banner {
		background: #fef3c7;
		border: 2px solid #fbbf24;
		border-radius: 12px;
		padding: 2rem;
	}

	.info-banner h2 {
		color: #92400e;
		margin: 0 0 1rem 0;
		font-size: 1.3rem;
	}

	.info-banner p {
		color: #78350f;
		margin-bottom: 1.5rem;
		line-height: 1.6;
	}

	.features {
		background: white;
		padding: 1.5rem;
		border-radius: 8px;
		margin-bottom: 1.5rem;
	}

	.features h3 {
		color: #059669;
		margin: 0 0 1rem 0;
		font-size: 1.1rem;
	}

	.features ul {
		margin: 0;
		padding-left: 1.5rem;
	}

	.features li {
		color: #555;
		margin-bottom: 0.5rem;
	}

	.actions {
		display: flex;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.btn-primary,
	.btn-secondary {
		flex: 1;
		padding: 1rem;
		border-radius: 8px;
		text-align: center;
		text-decoration: none;
		font-weight: 600;
		transition: all 0.3s ease;
	}

	.btn-primary {
		background: #667eea;
		color: white;
	}

	.btn-primary:hover {
		background: #5568d3;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.btn-secondary {
		background: #e5e7eb;
		color: #333;
	}

	.btn-secondary:hover {
		background: #d1d5db;
		transform: translateY(-2px);
	}

	.note {
		background: white;
		padding: 1rem;
		border-radius: 8px;
		font-size: 0.9rem;
	}

	.note p {
		margin: 0 0 0.5rem 0;
		color: #666;
	}

	.note strong {
		color: #333;
	}

	.note a {
		color: #667eea;
		text-decoration: underline;
	}

	@media (max-width: 640px) {
		.auth-card {
			padding: 2rem;
		}

		.actions {
			flex-direction: column;
		}

		h1 {
			font-size: 1.5rem;
		}
	}
</style>
