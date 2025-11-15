<!-- Minimal Header - No Sidebar -->
<script lang="ts">
	import { page } from '$app/stores';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	
	export let user: { email: string; role?: string } | null = null;
	
	let showUserMenu = false;
	let userMenuButton: HTMLButtonElement;
	let userMenuDropdown: HTMLDivElement;
	
	// Safe pathname access
	$: pathname = browser ? ($page.url?.pathname || '') : '';
	
	function handleSignOut() {
		const form = document.createElement('form');
		form.method = 'POST';
		form.action = '/auth/logout';
		document.body.appendChild(form);
		form.submit();
	}
	
	function toggleUserMenu() {
		showUserMenu = !showUserMenu;
	}
	
	function handleClickOutside(event: MouseEvent) {
		if (
			browser &&
			showUserMenu &&
			userMenuButton &&
			userMenuDropdown &&
			!userMenuButton.contains(event.target as Node) &&
			!userMenuDropdown.contains(event.target as Node)
		) {
			showUserMenu = false;
		}
	}
	
	onMount(() => {
		if (browser) {
			document.addEventListener('click', handleClickOutside);
		}
	});
	
	onDestroy(() => {
		if (browser) {
			document.removeEventListener('click', handleClickOutside);
		}
	});
</script>

<header class="minimal-header">
	<div class="header-content">
		<!-- Logo -->
		<a href="/" class="logo">
			<span class="logo-text">AppReview Triage</span>
		</a>
		
		<!-- Navigation Links -->
		<nav class="header-nav">
			<a 
				href="/dashboard" 
				class="nav-link"
				class:active={pathname === '/dashboard' || (pathname.startsWith('/dashboard/apps') && !pathname.includes('/archive'))}
			>
				Dashboard
			</a>
			{#if pathname.startsWith('/dashboard/apps/')}
				{@const appId = pathname.split('/')[3]}
				{#if appId}
					<a 
						href="/dashboard/apps/{appId}/archive"
						class="nav-link"
						class:active={pathname.includes('/archive')}
					>
						Archive
					</a>
				{/if}
			{/if}
			<a 
				href="/dashboard/apps/new"
				class="nav-link"
				class:active={pathname === '/dashboard/apps/new'}
			>
				Add App
			</a>
		</nav>
		
		<!-- User Menu -->
		<div class="user-menu-container">
			<button 
				bind:this={userMenuButton}
				class="user-menu-button"
				onclick={toggleUserMenu}
				aria-label="User menu"
			>
				<div class="user-avatar">
					{user?.email?.[0]?.toUpperCase() || 'U'}
				</div>
				<span class="user-email">{user?.email || 'User'}</span>
			</button>
			
			{#if showUserMenu}
				<div bind:this={userMenuDropdown} class="user-menu-dropdown">
					<div class="user-menu-header">
						<div class="user-menu-email">{user?.email || 'User'}</div>
						<div class="user-menu-role">{user?.role === 'admin' ? 'Administrator' : 'User'}</div>
					</div>
					<button 
						class="user-menu-item"
						onclick={handleSignOut}
					>
						Sign Out
					</button>
				</div>
			{/if}
		</div>
	</div>
</header>

<style>
	.minimal-header {
		position: sticky;
		top: 0;
		z-index: 100;
		background: white;
		border-bottom: 1px solid #e5e7eb;
		box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
	}
	
	.header-content {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 16px; /* 8pt grid: 2 * 8px */
		height: 56px; /* 8pt grid: 7 * 8px */
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24px; /* 8pt grid: 3 * 8px */
	}
	
	.logo {
		display: flex;
		align-items: center;
		text-decoration: none;
		font-weight: 600;
		font-size: 16px; /* 8pt grid: 2 * 8px */
		color: #111827; /* Black */
		white-space: nowrap;
	}
	
	.logo:hover {
		opacity: 0.8;
	}
	
	.header-nav {
		display: flex;
		align-items: center;
		gap: 8px; /* 8pt grid: 1 * 8px */
		flex: 1;
		justify-content: center;
	}
	
	.nav-link {
		padding: 8px 16px; /* 8pt grid: 1 * 8px, 2 * 8px */
		font-size: 14px; /* 8pt grid: 1.75 * 8px */
		color: #6b7280; /* Gray-500 */
		text-decoration: none;
		border-radius: 4px; /* 8pt grid: 0.5 * 8px */
		transition: all 0.15s;
		font-weight: 500;
	}
	
	.nav-link:hover {
		color: #111827; /* Black */
		background: #f9fafb; /* Gray-50 */
	}
	
	.nav-link.active {
		color: #111827; /* Black */
		font-weight: 600;
	}
	
	.user-menu-container {
		position: relative;
	}
	
	.user-menu-button {
		display: flex;
		align-items: center;
		gap: 8px; /* 8pt grid: 1 * 8px */
		padding: 4px 8px; /* 8pt grid: 0.5 * 8px, 1 * 8px */
		border-radius: 4px; /* 8pt grid: 0.5 * 8px */
		border: none;
		background: transparent;
		cursor: pointer;
		transition: background 0.15s;
	}
	
	.user-menu-button:hover {
		background: #f9fafb; /* Gray-50 */
	}
	
	.user-avatar {
		width: 32px; /* 8pt grid: 4 * 8px */
		height: 32px; /* 8pt grid: 4 * 8px */
		border-radius: 50%;
		background: #111827; /* Black */
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 14px; /* 8pt grid: 1.75 * 8px */
	}
	
	.user-email {
		font-size: 14px; /* 8pt grid: 1.75 * 8px */
		color: #111827; /* Black */
		font-weight: 500;
	}
	
	.user-menu-dropdown {
		position: absolute;
		top: calc(100% + 8px); /* 8pt grid: 1 * 8px */
		right: 0;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 4px; /* 8pt grid: 0.5 * 8px */
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		min-width: 200px; /* 8pt grid: 25 * 8px */
		overflow: hidden;
	}
	
	.user-menu-header {
		padding: 12px 16px; /* 8pt grid: 1.5 * 8px, 2 * 8px */
		border-bottom: 1px solid #e5e7eb;
	}
	
	.user-menu-email {
		font-size: 14px; /* 8pt grid: 1.75 * 8px */
		font-weight: 600;
		color: #111827; /* Black */
		margin-bottom: 4px; /* 8pt grid: 0.5 * 8px */
	}
	
	.user-menu-role {
		font-size: 12px; /* 8pt grid: 1.5 * 8px */
		color: #6b7280; /* Gray-500 */
	}
	
	.user-menu-item {
		width: 100%;
		padding: 12px 16px; /* 8pt grid: 1.5 * 8px, 2 * 8px */
		text-align: left;
		border: none;
		background: transparent;
		font-size: 14px; /* 8pt grid: 1.75 * 8px */
		color: #111827; /* Black */
		cursor: pointer;
		transition: background 0.15s;
	}
	
	.user-menu-item:hover {
		background: #f9fafb; /* Gray-50 */
	}
</style>

