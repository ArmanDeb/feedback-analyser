<script lang="ts">
	// Layout global de l'application
	import { page } from '$app/stores';
	
	// L'utilisateur est disponible via page.data depuis hooks.server.ts
	$: user = $page.data.user;
	$: isAuthenticated = !!user;
	$: isAdmin = user?.role === 'admin';
	
	let isMenuOpen = false;
	
	function toggleMenu() {
		console.log('🔄 Toggle menu:', !isMenuOpen);
		isMenuOpen = !isMenuOpen;
	}
	
	function closeMenu() {
		console.log('📋 Fermeture du menu');
		isMenuOpen = false;
	}
	
	function handleSignOut(e) {
		e?.preventDefault();
		e?.stopPropagation();
		console.log('🔓 Déconnexion en cours...');
		isMenuOpen = false;
		// Créer un formulaire invisible pour gérer la déconnexion
		const form = document.createElement('form');
		form.method = 'POST';
		form.action = '/auth/logout';
		document.body.appendChild(form);
		form.submit();
	}
</script>

<div class="app">
	<nav class="navbar">
		<div class="nav-content">
			<a href="/" class="logo">📊 Feedback Analyser</a>
			<div class="nav-links">
				{#if !isAuthenticated}
					<!-- Navigation Visiteur -->
					<a href="/" class:active={$page.url.pathname === '/'}>Accueil</a>
					<a href="/essayer" class:active={$page.url.pathname === '/essayer'}>Essayer</a>
					<a href="/auth/signup" class="btn-auth-secondary">S'inscrire</a>
					<a href="/auth/signin" class="btn-auth">Se connecter</a>
				{:else}
					<!-- Navigation Utilisateur Authentifié -->
					<a href="/tableau-de-bord" class:active={$page.url.pathname === '/tableau-de-bord'}>Tableau de Bord</a>
					<a href="/nouvelle-analyse" class:active={$page.url.pathname === '/nouvelle-analyse'}>Nouvelle Analyse</a>
					
					<!-- Menu Profil -->
					<div class="profile-menu">
						<button class="profile-button" on:click={toggleMenu} aria-label="Menu profil">
							<span class="profile-icon">👤</span>
							<span class="profile-email">{user?.email || 'Profil'}</span>
							<span class="dropdown-arrow">▼</span>
						</button>
						
						{#if isMenuOpen}
							<div class="dropdown-menu" on:click|stopPropagation>
								<a 
									href="/compte/utilisation" 
									on:click={(e) => { 
										console.log('📊 Clic sur Mon Utilisation'); 
										closeMenu(); 
									}}
								>
									Mon Utilisation
								</a>
								{#if isAdmin}
									<a 
										href="/dashboard-admin" 
										on:click={(e) => { 
											console.log('👑 Clic sur Admin'); 
											closeMenu(); 
										}}
										class="admin-link"
									>
										Admin
									</a>
								{/if}
								<button 
									class="sign-out-btn" 
									type="button"
									on:click={(e) => {
										console.log('👋 Clic sur Se déconnecter');
										handleSignOut(e);
									}}
								>
									Se déconnecter
								</button>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</nav>

	<main>
		<slot />
	</main>
</div>

<!-- Overlay pour fermer le menu -->
{#if isMenuOpen}
	<div class="overlay" on:click={closeMenu} on:keypress={(e) => e.key === 'Escape' && closeMenu()} role="button" tabindex="-1"></div>
{/if}

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
		z-index: 1002;
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

	.btn-auth-secondary {
		background: transparent;
		color: #667eea !important;
		padding: 0.5rem 1.25rem;
		border-radius: 8px;
		border: 2px solid #667eea;
		font-weight: 600;
		transition: all 0.3s ease;
	}

	.btn-auth-secondary:hover {
		background: #f8f9ff;
		transform: translateY(-2px);
	}

	.btn-auth-secondary::after {
		display: none;
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

	/* Profile Menu */
	.profile-menu {
		position: relative;
	}

	.profile-button {
		background: transparent;
		border: 2px solid #667eea;
		color: #667eea;
		padding: 0.5rem 1rem;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition: all 0.3s ease;
	}

	.profile-button:hover {
		background: #667eea;
		color: white;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.profile-icon {
		font-size: 1.2rem;
	}

	.profile-email {
		max-width: 150px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.dropdown-arrow {
		font-size: 0.7rem;
		transition: transform 0.3s ease;
	}

	.dropdown-menu {
		position: absolute;
		top: calc(100% + 0.5rem);
		right: 0;
		background: white;
		border: 1px solid #e0e0e0;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		min-width: 200px;
		z-index: 1001;
		animation: slideDown 0.2s ease;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.dropdown-menu a,
	.dropdown-menu button {
		display: block;
		width: 100%;
		padding: 0.75rem 1rem;
		text-decoration: none;
		color: #333;
		border: none;
		background: none;
		text-align: left;
		cursor: pointer;
		transition: background 0.2s ease;
		font-weight: 500;
	}

	.dropdown-menu a:hover,
	.dropdown-menu button:hover {
		background: #f5f7fa;
	}

	.dropdown-menu a:first-child {
		border-radius: 8px 8px 0 0;
	}

	.admin-link {
		color: #667eea !important;
		font-weight: 600;
		border-top: 1px solid #e0e0e0;
	}

	.admin-link:hover {
		background: #f8f9ff !important;
	}

	.sign-out-btn {
		color: #ef4444;
		border-top: 1px solid #e0e0e0;
		border-radius: 0 0 8px 8px;
		font-weight: 600;
	}

	.sign-out-btn:hover {
		background: #fee;
	}

	.overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 1000;
		background: transparent;
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
			flex-wrap: wrap;
			justify-content: center;
		}

		.profile-email {
			display: none;
		}
	}
</style>

