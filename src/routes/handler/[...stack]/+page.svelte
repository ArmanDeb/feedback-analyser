<script lang="ts">
	// Cette page gère toutes les routes d'authentification Stack Auth
	// /handler/sign-in, /handler/sign-up, /handler/forgot-password, etc.
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let loading = true;
	let error: string | null = null;

	onMount(async () => {
		try {
			// Stack Auth gérera automatiquement l'authentification ici
			// Les composants seront montés dynamiquement
			console.log('Stack Auth handler route:', $page.url.pathname);
			loading = false;
		} catch (e) {
			console.error('Erreur d\'authentification:', e);
			error = 'Une erreur est survenue lors de l\'authentification';
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>Authentification - Analyseur de Feedback</title>
</svelte:head>

<div class="auth-container">
	{#if loading}
		<div class="loading">
			<div class="spinner"></div>
			<p>Chargement...</p>
		</div>
	{:else if error}
		<div class="error">
			<p>{error}</p>
			<a href="/">Retour à l'accueil</a>
		</div>
	{:else}
		<div class="auth-content">
			<!-- Stack Auth va injecter ses composants ici -->
			<div id="stack-auth-handler"></div>
			
			<!-- Fallback si Stack Auth n'est pas encore configuré -->
			<div class="auth-placeholder">
				<h2>Authentification</h2>
				<p>Configuration de Stack Auth en cours...</p>
				<p class="info">
					Pour configurer Stack Auth, ajoutez vos clés dans le fichier <code>.env</code>:
				</p>
				<pre>NEXT_PUBLIC_STACK_PROJECT_ID="..."
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="..."
STACK_SECRET_SERVER_KEY="..."</pre>
				<a href="/" class="btn">Retour à l'accueil</a>
			</div>
		</div>
	{/if}
</div>

<style>
	.auth-container {
		min-height: 80vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.loading {
		text-align: center;
	}

	.spinner {
		width: 50px;
		height: 50px;
		border: 4px solid rgba(102, 126, 234, 0.2);
		border-top-color: #667eea;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		margin: 0 auto 1rem;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.error {
		text-align: center;
		color: #e53e3e;
	}

	.error a {
		color: #667eea;
		text-decoration: none;
		font-weight: 600;
	}

	.auth-content {
		width: 100%;
		max-width: 400px;
	}

	.auth-placeholder {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		text-align: center;
	}

	.auth-placeholder h2 {
		margin-bottom: 1rem;
		color: #333;
	}

	.auth-placeholder .info {
		font-size: 0.9rem;
		color: #666;
		margin: 1rem 0;
	}

	.auth-placeholder pre {
		background: #f8f9fa;
		padding: 1rem;
		border-radius: 8px;
		text-align: left;
		overflow-x: auto;
		font-size: 0.85rem;
		margin: 1rem 0;
	}

	.auth-placeholder code {
		background: #f8f9fa;
		padding: 0.2rem 0.4rem;
		border-radius: 4px;
		font-family: monospace;
		font-size: 0.9rem;
	}

	.btn {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		text-decoration: none;
		border-radius: 8px;
		font-weight: 600;
		margin-top: 1rem;
		transition: transform 0.3s ease;
	}

	.btn:hover {
		transform: translateY(-2px);
	}
</style>

