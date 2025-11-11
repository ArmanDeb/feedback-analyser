<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	
	let status: 'loading' | 'success' | 'error' = 'loading';
	let message = 'Vérification en cours...';
	
	onMount(async () => {
		try {
			// Récupérer le token depuis l'URL
			const token = $page.url.searchParams.get('token');
			
			if (!token) {
				status = 'error';
				message = 'Lien invalide ou expiré';
				return;
			}
			
			console.log('🔐 Vérification du magic link...');
			
			// Vérifier le token avec Stack Auth
			const response = await fetch('/api/auth/verify-magic-link', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ token })
			});
			
			if (response.ok) {
				status = 'success';
				message = 'Connexion réussie ! Redirection...';
				
				// Rediriger vers le dashboard après 2 secondes
				setTimeout(() => {
					goto('/dashboard');
				}, 2000);
			} else {
				const error = await response.json();
				status = 'error';
				message = error.message || 'Erreur lors de la connexion';
			}
			
		} catch (e) {
			console.error('Erreur callback:', e);
			status = 'error';
			message = 'Une erreur est survenue';
		}
	});
</script>

<svelte:head>
	<title>Connexion en cours... - Feedback Analyser</title>
</svelte:head>

<div class="callback-container">
	<div class="callback-card">
		{#if status === 'loading'}
			<div class="spinner"></div>
			<h1>⏳ {message}</h1>
			<p>Veuillez patienter quelques instants...</p>
		{:else if status === 'success'}
			<div class="success-icon">✅</div>
			<h1>🎉 {message}</h1>
			<p>Vous allez être redirigé vers le dashboard.</p>
		{:else}
			<div class="error-icon">❌</div>
			<h1>{message}</h1>
			<p>Le lien est peut-être expiré ou invalide.</p>
			<a href="/auth/signin" class="btn-retry">Réessayer</a>
		{/if}
	</div>
</div>

<style>
	.callback-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		padding: 2rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}
	
	.callback-card {
		background: white;
		padding: 4rem 3rem;
		border-radius: 16px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		max-width: 500px;
		width: 100%;
		text-align: center;
	}
	
	.spinner {
		width: 60px;
		height: 60px;
		border: 4px solid rgba(102, 126, 234, 0.2);
		border-top-color: #667eea;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		margin: 0 auto 2rem;
	}
	
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	
	.success-icon,
	.error-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
	}
	
	h1 {
		margin-bottom: 1rem;
		color: #333;
		font-size: 1.75rem;
	}
	
	p {
		color: #666;
		margin-bottom: 2rem;
		line-height: 1.6;
	}
	
	.btn-retry {
		display: inline-block;
		padding: 1rem 2rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		text-decoration: none;
		border-radius: 8px;
		font-weight: 600;
		transition: all 0.3s ease;
	}
	
	.btn-retry:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
	}
</style>

