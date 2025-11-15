<script lang="ts">
	// Layout global de l'application
	import { page } from '$app/stores';
	import '../app.css';
	import CommandPalette from '$lib/components/CommandPalette.svelte';
	import MinimalHeader from '$lib/components/MinimalHeader.svelte';
	
	// L'utilisateur est disponible via page.data depuis hooks.server.ts
	$: user = $page.data?.user || null;
	$: isAuthenticated = !!user;
	$: isAdmin = user?.role === 'admin';
</script>

{#if isAuthenticated && user}
	<!-- Minimal Layout with Header (No Sidebar) -->
	<div class="minimal-layout">
		<!-- Minimal Header -->
		<MinimalHeader user={user} />
		
		<!-- Main Content -->
		<main class="main-content-minimal">
			<slot />
		</main>
		
		<!-- Global Command Palette -->
		<CommandPalette />
	</div>
	
	<!-- Legacy Sidebar Layout (hidden, kept for reference) -->
	<div class="dashboard-layout" style="display: none;">
		<!-- Sidebar Fixe -->
		<aside class="sidebar">
			<div class="sidebar-header">
				<a href="/" class="logo">
					<span class="logo-text">AppReview Triage</span>
				</a>
			</div>
			
			<nav class="sidebar-nav">
				<a 
					href="/dashboard" 
					class="nav-item"
					class:active={$page.url.pathname === '/dashboard' || $page.url.pathname.startsWith('/dashboard/apps')}
				>
					<svg class="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<defs>
							<linearGradient id="navDashboardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
								<stop offset="0%" style="stop-color:#2C2C2C;stop-opacity:1" />
								<stop offset="100%" style="stop-color:#888888;stop-opacity:1" />
							</linearGradient>
						</defs>
						<path d="M3 3v18h18V3H3zm16 16H5V5h14v14z" fill="url(#navDashboardGradient)"/>
						<path d="M7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z" fill="url(#navDashboardGradient)"/>
					</svg>
					<span class="nav-label">Dashboard</span>
				</a>
				<a 
					href="/dashboard/apps/new" 
					class="nav-item"
					class:active={$page.url.pathname === '/dashboard/apps/new'}
				>
					<svg class="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<defs>
							<linearGradient id="navNewAnalysisGradient" x1="0%" y1="0%" x2="100%" y2="100%">
								<stop offset="0%" style="stop-color:#2C2C2C;stop-opacity:1" />
								<stop offset="100%" style="stop-color:#888888;stop-opacity:1" />
							</linearGradient>
						</defs>
						<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="url(#navNewAnalysisGradient)"/>
					</svg>
					<span class="nav-label">Add App</span>
				</a>
				{#if isAdmin}
					<a 
						href="/dashboard-admin" 
						class="nav-item admin-nav"
						class:active={$page.url.pathname === '/dashboard-admin'}
					>
						<svg class="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<defs>
								<linearGradient id="navAdminGradient" x1="0%" y1="0%" x2="100%" y2="100%">
									<stop offset="0%" style="stop-color:#2C2C2C;stop-opacity:1" />
									<stop offset="100%" style="stop-color:#888888;stop-opacity:1" />
								</linearGradient>
							</defs>
							<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" fill="url(#navAdminGradient)"/>
						</svg>
						<span class="nav-label">Admin</span>
					</a>
				{/if}
			</nav>
			
			<div class="sidebar-footer">
				<div class="user-profile">
					<div class="user-avatar">
						{user?.email?.[0]?.toUpperCase() || 'U'}
					</div>
					<div class="user-info">
						<div class="user-email">{user?.email || 'User'}</div>
						<div class="user-role">{isAdmin ? 'Administrator' : 'User'}</div>
					</div>
				</div>
				<button class="sign-out-button" on:click={handleSignOut}>
					<span class="sign-out-label">Sign Out</span>
				</button>
			</div>
		</aside>
		
		<!-- Zone de Contenu Principale -->
		<main class="main-content">
			<slot />
		</main>
	</div>
{:else}
	<!-- Layout Public avec Navbar -->
	<div class="public-layout">
		<nav class="navbar">
			<div class="nav-content">
				<a href="/" class="logo">AppReview Triage</a>
				<div class="nav-links">
					<a href="/" class:active={$page.url.pathname === '/'}>Home</a>
					<a href="/auth/signup" class="btn-auth-secondary">Get Started</a>
					<a href="/auth/signin" class="btn-auth">Sign In</a>
				</div>
			</div>
		</nav>
		
		<main class="public-main">
			<slot />
		</main>
	</div>
{/if}

<style>
	/* === Dashboard Layout === */
	.dashboard-layout {
		display: flex;
		min-height: 100vh;
		background: var(--bg-page);
	}

	/* === Sidebar === */
	.sidebar {
		width: 280px;
		background: var(--bg-sidebar);
		display: flex;
		flex-direction: column;
		position: fixed;
		height: 100vh;
		left: 0;
		top: 0;
		z-index: var(--z-sidebar);
		box-shadow: var(--shadow-medium);
		border-right: 1px solid var(--border-subtle);
	}

	.sidebar-header {
		padding: var(--spacing-6);
		border-bottom: 1px solid var(--border-subtle);
	}

	.logo {
		display: flex;
		align-items: center;
		gap: var(--spacing-3);
		font-weight: var(--font-weight-bold);
		font-size: var(--font-size-xl);
		color: var(--text-primary);
		text-decoration: none;
		transition: opacity var(--transition-fast);
	}

	.logo:hover {
		opacity: 0.8;
	}

	.logo-text {
		font-weight: var(--font-weight-bold);
	}

	.sidebar-nav {
		flex: 1;
		padding: var(--spacing-4);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2);
		overflow-y: auto;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-3);
		padding: var(--spacing-4) var(--spacing-5);
		border-radius: var(--radius-md);
		color: var(--text-primary);
		font-weight: var(--font-weight-medium);
		font-size: var(--font-size-base);
		transition: all var(--transition-base);
		position: relative;
	}

	.nav-icon {
		width: 20px;
		height: 20px;
		flex-shrink: 0;
	}

	.nav-item:hover {
		background: var(--bg-widget);
		color: var(--text-primary);
	}

	.nav-item.active {
		background: var(--bg-widget);
		color: var(--text-primary);
		font-weight: var(--font-weight-semibold);
		box-shadow: var(--shadow-soft);
		border-left: 3px solid var(--text-primary);
	}

	.nav-item.active::before {
		display: none;
	}

	.nav-label {
		flex: 1;
	}

	.admin-nav {
		margin-top: var(--spacing-4);
		border-top: 1px solid var(--border-subtle);
		padding-top: var(--spacing-4);
	}

	.sidebar-footer {
		padding: var(--spacing-6);
		border-top: 1px solid var(--border-subtle);
		background: var(--bg-widget);
	}

	.user-profile {
		display: flex;
		align-items: center;
		gap: var(--spacing-3);
		margin-bottom: var(--spacing-4);
		padding: var(--spacing-4);
		background: var(--bg-widget);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-soft);
	}

	.user-avatar {
		width: 48px;
		height: 48px;
		border-radius: var(--radius-full);
		background: var(--text-primary);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: var(--font-weight-bold);
		font-size: var(--font-size-lg);
		color: var(--bg-widget);
		border: 2px solid var(--border-subtle);
		flex-shrink: 0;
	}

	.user-info {
		flex: 1;
		min-width: 0;
	}

	.user-email {
		font-weight: var(--font-weight-semibold);
		font-size: var(--font-size-sm);
		color: var(--text-primary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.user-role {
		font-size: var(--font-size-xs);
		color: var(--text-secondary);
		margin-top: var(--spacing-1);
	}

	.sign-out-button {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-2);
		padding: var(--spacing-3) var(--spacing-4);
		background: var(--bg-widget);
		border-radius: var(--radius-md);
		color: var(--text-secondary);
		font-weight: var(--font-weight-medium);
		font-size: var(--font-size-sm);
		transition: all var(--transition-base);
		box-shadow: var(--shadow-soft);
	}

	.sign-out-button:hover {
		background: rgba(239, 68, 68, 0.1);
		color: #ef4444;
		transform: translateY(-1px);
		box-shadow: var(--shadow-medium);
	}


	/* === Main Content Area === */
	.main-content {
		flex: 1;
		margin-left: 280px;
		padding: var(--spacing-8);
		min-height: 100vh;
		overflow-x: hidden;
	}

	/* === Public Layout === */
	.public-layout {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.navbar {
		background: var(--bg-widget);
		border-bottom: 1px solid var(--border-subtle);
		padding: var(--spacing-4) 0;
		position: sticky;
		top: 0;
		z-index: var(--z-sidebar);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
	}

	.nav-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 var(--spacing-8);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.navbar .logo {
		font-size: var(--font-size-2xl);
		font-weight: var(--font-weight-bold);
		color: var(--text-primary);
	}

	.nav-links {
		display: flex;
		gap: var(--spacing-6);
		align-items: center;
	}

	.nav-links a {
		color: var(--text-secondary);
		font-weight: var(--font-weight-medium);
		transition: color var(--transition-base);
		position: relative;
	}

	.nav-links a:hover {
		color: var(--text-primary);
	}

	.nav-links a.active {
		color: var(--text-primary);
		font-weight: var(--font-weight-semibold);
	}

	.nav-links a.active::after {
		content: '';
		position: absolute;
		bottom: -4px;
		left: 0;
		right: 0;
		height: 2px;
		background: var(--text-primary);
		border-radius: var(--radius-full);
	}

	.btn-auth-secondary {
		background: transparent;
		color: var(--text-primary) !important;
		padding: var(--spacing-2) var(--spacing-5);
		border-radius: var(--radius-md);
		border: 2px solid var(--border-subtle);
		font-weight: var(--font-weight-semibold);
		transition: all var(--transition-base);
	}

	.btn-auth-secondary:hover {
		background: var(--bg-sidebar);
		border-color: var(--border-medium);
		transform: translateY(-1px);
	}

	.btn-auth-secondary::after {
		display: none;
	}

	.btn-auth {
		background: var(--text-primary);
		color: var(--bg-widget) !important;
		padding: var(--spacing-2) var(--spacing-5);
		border-radius: var(--radius-md);
		font-weight: var(--font-weight-semibold);
		transition: all var(--transition-base);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.btn-auth:hover {
		background: #2A2824;
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	}

	.btn-auth::after {
		display: none;
	}

	.public-main {
		flex: 1;
		width: 100%;
	}

	/* === Responsive === */
	@media (max-width: 968px) {
		.sidebar {
			transform: translateX(-100%);
			transition: transform var(--transition-base);
		}

		.sidebar.open {
			transform: translateX(0);
		}

		.main-content {
			margin-left: 0;
			padding: var(--spacing-4);
		}

		.nav-content {
			padding: 0 var(--spacing-4);
		}

		.nav-links {
			gap: var(--spacing-3);
			flex-wrap: wrap;
		}
	}
</style>
