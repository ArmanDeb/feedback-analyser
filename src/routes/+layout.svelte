<script lang="ts">
	// Layout global de l'application
	import { page } from '$app/stores';
</script>

<div class="app">
	<nav class="navbar">
		<div class="nav-content">
			<a href="/" class="logo">📊 Feedback Analyser</a>
			<div class="nav-links">
				<a href="/" class:active={$page.url.pathname === '/'}>Accueil</a>
				<a href="/dashboard" class:active={$page.url.pathname === '/dashboard'}>Dashboard</a>
				<!-- Stack Auth buttons -->
				<a href="/handler/sign-in" class="btn-auth">Se connecter</a>
			</div>
		</div>
	</nav>

	<main>
		<slot />
	</main>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
		background-color: #f5f7fa;
		color: #333;
	}

	:global(*) {
		box-sizing: border-box;
	}

	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.navbar {
		background: white;
		border-bottom: 1px solid #e0e0e0;
		padding: 1rem 0;
		position: sticky;
		top: 0;
		z-index: 100;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.nav-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.logo {
		font-size: 1.5rem;
		font-weight: 700;
		text-decoration: none;
		color: #667eea;
		transition: color 0.3s ease;
	}

	.logo:hover {
		color: #764ba2;
	}

	.nav-links {
		display: flex;
		gap: 2rem;
		align-items: center;
	}

	.nav-links a {
		text-decoration: none;
		color: #666;
		font-weight: 500;
		transition: color 0.3s ease;
		position: relative;
	}

	.nav-links a:hover {
		color: #667eea;
	}

	.nav-links a.active {
		color: #667eea;
	}

	.nav-links a.active::after {
		content: '';
		position: absolute;
		bottom: -4px;
		left: 0;
		right: 0;
		height: 2px;
		background: #667eea;
	}

	.btn-auth {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white !important;
		padding: 0.5rem 1.25rem;
		border-radius: 8px;
		font-weight: 600;
		transition: all 0.3s ease;
	}

	.btn-auth:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.btn-auth::after {
		display: none;
	}

	main {
		flex: 1;
		width: 100%;
	}

	@media (max-width: 768px) {
		.nav-content {
			flex-direction: column;
			gap: 1rem;
		}

		.nav-links {
			gap: 1rem;
		}
	}
</style>

