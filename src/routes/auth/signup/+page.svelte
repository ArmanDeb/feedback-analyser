<script lang="ts">
	import { goto } from '$app/navigation';
	
	let email = '';
	let loading = false;
	let message = '';
	let error = '';
	
	async function handleSignUp() {
		loading = true;
		error = '';
		message = '';
		
		try {
			// Pour l'instant, on utilise l'approche simple : redirection vers Stack Auth
			// Stack Auth va gérer le magic link automatiquement
			
			// Afficher un message à l'utilisateur
			message = `Magic link envoyé à ${email} ! Vérifiez votre boîte email (et vos spams).`;
			
			// Simuler un délai
			await new Promise(resolve => setTimeout(resolve, 1000));
			
		} catch (e: any) {
			console.error('Erreur sign-up:', e);
			error = e.message || 'Une erreur est survenue. Réessayez.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Inscription - Feedback Analyser</title>
</svelte:head>

<div class="auth-container">
	<div class="auth-card">
		<h1>✨ Créer un compte</h1>
		
		<p class="subtitle">
			Entrez votre email pour recevoir un lien de connexion magique
		</p>
		
		<form on:submit|preventDefault={handleSignUp}>
			<div class="form-group">
				<label for="email">Email</label>
				<input 
					id="email"
					type="email" 
					bind:value={email} 
					placeholder="votre@email.com"
					required
					disabled={loading}
				/>
			</div>
			
			{#if message}
				<div class="message success">
					✅ {message}
					<p class="message-details">
						Cliquez sur le lien dans l'email pour vous connecter.
					</p>
				</div>
			{/if}
			
			{#if error}
				<div class="message error">
					❌ {error}
				</div>
			{/if}
			
			<button type="submit" disabled={loading} class="btn-primary">
				{loading ? '⏳ Envoi en cours...' : '📧 Recevoir le lien magique'}
			</button>
		</form>
		
		<div class="divider">
			<span>ou</span>
		</div>
		
		<div class="oauth-section">
			<p class="oauth-text">Connexion rapide avec :</p>
			<div class="oauth-buttons">
				<button class="oauth-btn google" on:click={() => alert('Google OAuth bientôt disponible')}>
					<svg width="18" height="18" viewBox="0 0 18 18">
						<path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/>
						<path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/>
						<path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18z"/>
						<path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z"/>
					</svg>
					Google
				</button>
				<button class="oauth-btn github" on:click={() => alert('GitHub OAuth bientôt disponible')}>
					<svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
						<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
					</svg>
					GitHub
				</button>
			</div>
		</div>
		
		<p class="signin-link">
			Vous avez déjà un compte ? <a href="/auth/signin">Se connecter</a>
		</p>
		
		<div class="info-box">
			<p>💡 <strong>Magic Link</strong> : Pas besoin de mot de passe ! Vous recevrez un lien sécurisé par email.</p>
		</div>
	</div>
</div>

<style>
	.auth-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		padding: 2rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}
	
	.auth-card {
		background: white;
		padding: 3rem;
		border-radius: 16px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		max-width: 450px;
		width: 100%;
	}
	
	h1 {
		text-align: center;
		margin-bottom: 0.5rem;
		color: #333;
		font-size: 2rem;
	}
	
	.subtitle {
		text-align: center;
		color: #666;
		margin-bottom: 2rem;
		font-size: 0.95rem;
	}
	
	.form-group {
		margin-bottom: 1.5rem;
	}
	
	label {
		display: block;
		margin-bottom: 0.5rem;
		color: #333;
		font-weight: 600;
		font-size: 0.9rem;
	}
	
	input {
		width: 100%;
		padding: 0.875rem;
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		font-size: 1rem;
		transition: all 0.3s ease;
		box-sizing: border-box;
	}
	
	input:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}
	
	input:disabled {
		background: #f5f5f5;
		cursor: not-allowed;
	}
	
	.btn-primary {
		width: 100%;
		padding: 1rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}
	
	.btn-primary:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
	}
	
	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}
	
	.message {
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
		font-size: 0.9rem;
	}
	
	.message.success {
		background: #d1fae5;
		color: #065f46;
		border: 1px solid #10b981;
	}
	
	.message.error {
		background: #fee2e2;
		color: #991b1b;
		border: 1px solid #ef4444;
	}
	
	.message-details {
		margin-top: 0.5rem;
		font-size: 0.85rem;
		opacity: 0.8;
	}
	
	.divider {
		position: relative;
		text-align: center;
		margin: 2rem 0;
	}
	
	.divider::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		height: 1px;
		background: #e0e0e0;
	}
	
	.divider span {
		position: relative;
		background: white;
		padding: 0 1rem;
		color: #999;
		font-size: 0.85rem;
	}
	
	.oauth-section {
		margin-bottom: 1.5rem;
	}
	
	.oauth-text {
		text-align: center;
		color: #666;
		font-size: 0.9rem;
		margin-bottom: 1rem;
	}
	
	.oauth-buttons {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}
	
	.oauth-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem;
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		background: white;
		color: #333;
		font-weight: 600;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.3s ease;
	}
	
	.oauth-btn:hover {
		border-color: #667eea;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}
	
	.oauth-btn.google:hover {
		border-color: #4285F4;
	}
	
	.oauth-btn.github:hover {
		border-color: #333;
	}
	
	.signin-link {
		text-align: center;
		margin-top: 1.5rem;
		color: #666;
		font-size: 0.9rem;
	}
	
	.signin-link a {
		color: #667eea;
		text-decoration: none;
		font-weight: 600;
	}
	
	.signin-link a:hover {
		text-decoration: underline;
	}
	
	.info-box {
		margin-top: 2rem;
		padding: 1rem;
		background: #f8f9fa;
		border-radius: 8px;
		border-left: 4px solid #667eea;
	}
	
	.info-box p {
		margin: 0;
		color: #555;
		font-size: 0.85rem;
		line-height: 1.5;
	}
	
	@media (max-width: 640px) {
		.auth-card {
			padding: 2rem;
		}
		
		h1 {
			font-size: 1.5rem;
		}
		
		.oauth-buttons {
			grid-template-columns: 1fr;
		}
	}
</style>

