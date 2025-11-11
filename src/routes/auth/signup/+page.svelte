<script lang="ts">
	import type { ActionData } from './$types';
	
	export let form: ActionData;
	
	let isLoading = false;
</script>

<svelte:head>
	<title>Créer un compte - Feedback Analyser</title>
</svelte:head>

<div class="auth-page">
	<div class="auth-container">
		<div class="auth-header">
			<h1>Créer un compte</h1>
			<p>Commencez à analyser vos feedbacks gratuitement</p>
		</div>

		{#if form?.error}
			<div class="error-message">
				⚠️ {form.error}
			</div>
		{/if}

		<form method="POST" class="auth-form">
			<div class="form-group">
				<label for="email">Email</label>
				<input
					type="email"
					id="email"
					name="email"
					value={form?.email || ''}
					placeholder="votre@email.com"
					required
					autocomplete="email"
				/>
			</div>

			<div class="form-group">
				<label for="password">Mot de passe</label>
				<input
					type="password"
					id="password"
					name="password"
					placeholder="••••••••"
					required
					autocomplete="new-password"
				/>
				<small class="form-hint">
					Au moins 8 caractères avec une majuscule, une minuscule et un chiffre
				</small>
			</div>

			<div class="form-group">
				<label for="confirmPassword">Confirmer le mot de passe</label>
				<input
					type="password"
					id="confirmPassword"
					name="confirmPassword"
					placeholder="••••••••"
					required
					autocomplete="new-password"
				/>
			</div>

			<button type="submit" class="btn-primary" disabled={isLoading}>
				{isLoading ? '⏳ Création en cours...' : '✨ Créer mon compte'}
			</button>
		</form>

		<div class="auth-footer">
			<p>Vous avez déjà un compte ?</p>
			<a href="/auth/signin" class="link-secondary">Se connecter</a>
		</div>

		<div class="auth-back">
			<a href="/" class="link-back">← Retour à l'accueil</a>
		</div>
	</div>
</div>

<style>
	.auth-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}

	.auth-container {
		background: white;
		border-radius: 16px;
		padding: 3rem;
		max-width: 450px;
		width: 100%;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	}

	.auth-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.auth-header h1 {
		font-size: 2rem;
		margin-bottom: 0.5rem;
		color: #333;
	}

	.auth-header p {
		color: #666;
	}

	.error-message {
		background: #fee;
		border: 1px solid #fcc;
		border-radius: 8px;
		padding: 1rem;
		margin-bottom: 1.5rem;
		color: #c00;
	}

	.auth-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-group label {
		font-weight: 600;
		color: #333;
		font-size: 0.9rem;
	}

	.form-group input {
		padding: 0.75rem 1rem;
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		font-size: 1rem;
		transition: border-color 0.3s ease;
	}

	.form-group input:focus {
		outline: none;
		border-color: #667eea;
	}

	.form-hint {
		font-size: 0.8rem;
		color: #666;
	}

	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 1rem;
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
		opacity: 0.7;
		cursor: not-allowed;
	}

	.auth-footer {
		text-align: center;
		margin-top: 2rem;
		padding-top: 2rem;
		border-top: 1px solid #e0e0e0;
	}

	.auth-footer p {
		color: #666;
		margin-bottom: 0.5rem;
	}

	.link-secondary {
		color: #667eea;
		text-decoration: none;
		font-weight: 600;
		transition: color 0.3s ease;
	}

	.link-secondary:hover {
		color: #764ba2;
	}

	.auth-back {
		text-align: center;
		margin-top: 1.5rem;
	}

	.link-back {
		color: #666;
		text-decoration: none;
		font-size: 0.9rem;
		transition: color 0.3s ease;
	}

	.link-back:hover {
		color: #333;
	}

	@media (max-width: 768px) {
		.auth-container {
			padding: 2rem;
		}

		.auth-header h1 {
			font-size: 1.5rem;
		}
	}
</style>
