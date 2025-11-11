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
				{form.error}
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
				{isLoading ? 'Création en cours...' : 'Créer mon compte'}
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
		padding: var(--spacing-8);
		background: var(--bg-page);
	}

	.auth-container {
		background: var(--bg-widget);
		border-radius: var(--radius-lg);
		padding: var(--spacing-12);
		max-width: 450px;
		width: 100%;
		box-shadow: var(--shadow-large);
	}

	.auth-header {
		text-align: center;
		margin-bottom: var(--spacing-8);
	}

	.auth-header h1 {
		font-size: var(--font-size-4xl);
		margin-bottom: var(--spacing-2);
		color: var(--text-primary);
	}

	.auth-header p {
		color: var(--text-secondary);
	}

	.error-message {
		background: var(--color-error-light);
		border: 1px solid var(--color-error);
		border-radius: var(--radius-sm);
		padding: var(--spacing-4);
		margin-bottom: var(--spacing-6);
		color: var(--color-error);
	}

	.auth-form {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-6);
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2);
	}

	.form-group label {
		font-weight: var(--font-weight-semibold);
		color: var(--text-primary);
		font-size: var(--font-size-sm);
	}

	.form-group input {
		padding: var(--spacing-3) var(--spacing-4);
		border: 2px solid var(--border-subtle);
		border-radius: var(--radius-sm);
		font-size: var(--font-size-base);
		transition: border-color var(--transition-base);
		color: var(--text-primary);
		background: var(--bg-widget);
	}

	.form-group input:focus {
		outline: none;
		border-color: var(--text-primary);
	}

	.form-hint {
		font-size: var(--font-size-xs);
		color: var(--text-secondary);
	}

	.btn-primary {
		background: var(--text-primary);
		color: var(--bg-widget);
		padding: var(--spacing-4);
		border: none;
		border-radius: var(--radius-sm);
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
		transition: all var(--transition-base);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.btn-primary:hover:not(:disabled) {
		background: #2A2824;
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	}

	.btn-primary:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.auth-footer {
		text-align: center;
		margin-top: var(--spacing-8);
		padding-top: var(--spacing-8);
		border-top: 1px solid var(--border-subtle);
	}

	.auth-footer p {
		color: var(--text-secondary);
		margin-bottom: var(--spacing-2);
	}

	.link-secondary {
		color: var(--text-primary);
		text-decoration: none;
		font-weight: var(--font-weight-semibold);
		transition: color var(--transition-base);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.link-secondary:hover {
		color: #2A2824;
		text-decoration-thickness: 2px;
	}

	.auth-back {
		text-align: center;
		margin-top: var(--spacing-6);
	}

	.link-back {
		color: var(--text-secondary);
		text-decoration: none;
		font-size: var(--font-size-sm);
		transition: color var(--transition-base);
	}

	.link-back:hover {
		color: var(--text-primary);
	}

	@media (max-width: 768px) {
		.auth-container {
			padding: var(--spacing-8);
		}

		.auth-header h1 {
			font-size: var(--font-size-2xl);
		}
	}
</style>
