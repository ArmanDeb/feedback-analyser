<script lang="ts">
	// Page d'accueil publique
	import { page } from '$app/stores';
	
	$: user = $page.data?.user || null;
	$: isAuthenticated = !!user;
</script>

<svelte:head>
	<title>AppReview Triage - Stop paying $99/mo for ASO suites. Get review triage for $19/mo.</title>
	<meta name="description" content="Triage your app reviews automatically. Get AI-powered bug clustering, feature requests, and prioritized insights. Built for indie and small studio mobile app developers." />
</svelte:head>

<div class="homepage min-h-screen" style="background: var(--bg-page);">
	<!-- Hero Section -->
	<section class="max-w-7xl mx-auto px-6 py-24 lg:py-32">
		<div class="grid lg:grid-cols-2 gap-16 items-center">
			<div class="space-y-8">
				<h1 class="text-5xl lg:text-6xl font-semibold leading-tight" style="color: var(--text-primary);">
					Stop paying $99/mo for ASO suites.<br />
					Get <span style="color: var(--text-primary); font-weight: 600;">review triage for $19/mo</span>
				</h1>
				<p class="text-xl leading-relaxed max-w-xl" style="color: var(--text-secondary);">
					AppReview Triage automatically clusters bug reports, prioritizes feature requests, and delivers actionable insights via alerts. Built for indie and small studio mobile app developers.
				</p>
				<div class="flex flex-wrap gap-4">
					{#if isAuthenticated}
						<a href="/dashboard/apps/new" class="btn-primary-home px-6 py-3 rounded-lg font-medium transition-colors">
							Add Your App
						</a>
						<a href="/dashboard" class="btn-secondary-home px-6 py-3 rounded-lg font-medium transition-colors">
							Dashboard
						</a>
					{:else}
						<a href="/auth/signup" class="btn-primary-home px-6 py-3 rounded-lg font-medium transition-colors">
							Get Started
						</a>
						<a href="/auth/signin" class="btn-secondary-home px-6 py-3 rounded-lg font-medium transition-colors">
							Sign In
						</a>
					{/if}
				</div>
			</div>
			
			<!-- Value Props -->
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div class="stat-card-home rounded-lg p-6 hover:shadow-sm transition-shadow" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
					<div class="text-sm font-medium mb-2" style="color: var(--text-secondary);">Bug Clustering</div>
					<div class="text-lg font-semibold mb-2" style="color: var(--text-primary);">50 reviews → 1 alert</div>
					<p class="text-sm" style="color: var(--text-secondary);">AI clusters duplicate bug reports automatically</p>
				</div>
				
				<div class="stat-card-home rounded-lg p-6 hover:shadow-sm transition-shadow" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
					<div class="text-sm font-medium mb-2" style="color: var(--text-secondary);">1-Click Actions</div>
					<div class="text-lg font-semibold mb-2" style="color: var(--text-primary);">Create Issues</div>
					<p class="text-sm" style="color: var(--text-secondary);">Generate Jira, Trello, or GitHub issues from alerts</p>
				</div>
				
				<div class="stat-card-home rounded-lg p-6 hover:shadow-sm transition-shadow" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
					<div class="text-sm font-medium mb-2" style="color: var(--text-secondary);">Price</div>
					<div class="text-lg font-semibold mb-2" style="color: var(--text-primary);">$19/mo</div>
					<p class="text-sm" style="color: var(--text-secondary);">vs $99/mo for bloated ASO suites</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Features Section -->
	<section class="py-24" style="background: var(--bg-sidebar);">
		<div class="max-w-6xl mx-auto px-6">
			<h2 class="text-4xl font-semibold text-center mb-16" style="color: var(--text-primary);">
				Everything you need, nothing you don't
			</h2>
			<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
				<div class="feature-card-home rounded-lg p-8 hover:shadow-sm transition-shadow" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
					<svg class="w-12 h-12 mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: var(--text-primary);">
						<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
					</svg>
					<h3 class="text-xl font-semibold mb-3" style="color: var(--text-primary);">Bug De-duplication</h3>
					<p class="leading-relaxed" style="color: var(--text-secondary);">
						AI clusters 50 reviews reporting the same crash into one alert: "New Critical Bug: 'Checkout Crash' (50 reports)."
					</p>
				</div>

				<div class="feature-card-home rounded-lg p-8 hover:shadow-sm transition-shadow" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
					<svg class="w-12 h-12 mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: var(--text-primary);">
						<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
					</svg>
					<h3 class="text-xl font-semibold mb-3" style="color: var(--text-primary);">1-Click Issue Creation</h3>
					<p class="leading-relaxed" style="color: var(--text-secondary);">
						Create Jira, Trello, or GitHub issues directly from alerts. Pre-filled with AI summary and review data.
					</p>
				</div>

				<div class="feature-card-home rounded-lg p-8 hover:shadow-sm transition-shadow" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
					<svg class="w-12 h-12 mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: var(--text-primary);">
						<path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" fill="currentColor"/>
					</svg>
					<h3 class="text-xl font-semibold mb-3" style="color: var(--text-primary);">Proactive Prioritization</h3>
					<p class="leading-relaxed" style="color: var(--text-secondary);">
						Weekly "Top 5 Bug Reports" and "Top 5 Feature Requests" lists, prioritized by urgency and frequency.
					</p>
				</div>

				<div class="feature-card-home rounded-lg p-8 hover:shadow-sm transition-shadow" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
					<svg class="w-12 h-12 mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: var(--text-primary);">
						<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
					</svg>
					<h3 class="text-xl font-semibold mb-3" style="color: var(--text-primary);">Zero-Friction Onboarding</h3>
					<p class="leading-relaxed" style="color: var(--text-secondary);">
						Just provide your App Store or Play Store URL. We handle the rest automatically.
					</p>
				</div>

				<div class="feature-card-home rounded-lg p-8 hover:shadow-sm transition-shadow" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
					<svg class="w-12 h-12 mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: var(--text-primary);">
						<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
					</svg>
					<h3 class="text-xl font-semibold mb-3" style="color: var(--text-primary);">Alert-First Design</h3>
					<p class="leading-relaxed" style="color: var(--text-secondary);">
						An "anti-dashboard." 99% of value delivered via Slack/Discord alerts. You rarely need to log in.
					</p>
				</div>

				<div class="feature-card-home rounded-lg p-8 hover:shadow-sm transition-shadow" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
					<svg class="w-12 h-12 mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: var(--text-primary);">
						<path d="M3 3v18h18V3H3zm16 16H5V5h14v14z" fill="currentColor"/>
						<path d="M7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z" fill="currentColor"/>
					</svg>
					<h3 class="text-xl font-semibold mb-3" style="color: var(--text-primary);">AI-Powered Triage</h3>
					<p class="leading-relaxed" style="color: var(--text-secondary);">
						Every review automatically categorized: Bug Report, Feature Request, Praise, or Complaint with urgency levels.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- How It Works Section - Modern Style -->
	<section class="py-32" style="background: var(--bg-page);">
		<div class="max-w-5xl mx-auto px-6">
			<h2 class="text-5xl font-semibold text-center mb-20" style="color: var(--text-primary);">
				How it works
			</h2>
			
			<div class="grid md:grid-cols-3 gap-12 relative">
				<!-- Connecting Line (Desktop) -->
				<div class="hidden md:block absolute top-12 left-1/3 right-1/3 h-0.5 -z-10" style="background: var(--border-subtle);"></div>
				
				<!-- Step 1 -->
				<div class="relative text-center group">
					<div class="mb-6">
						<span class="text-6xl font-light transition-colors" style="color: var(--border-subtle);">01</span>
					</div>
					<h3 class="text-2xl font-semibold mb-4" style="color: var(--text-primary);">Add Your App</h3>
					<p class="leading-relaxed" style="color: var(--text-secondary);">
						Simply paste your App Store or Play Store URL. We'll start tracking reviews automatically.
					</p>
				</div>

				<!-- Step 2 -->
				<div class="relative text-center group">
					<div class="mb-6">
						<span class="text-6xl font-light transition-colors" style="color: var(--border-subtle);">02</span>
					</div>
					<h3 class="text-2xl font-semibold mb-4" style="color: var(--text-primary);">AI Triage & Clustering</h3>
					<p class="leading-relaxed" style="color: var(--text-secondary);">
						Our AI categorizes reviews, clusters duplicate bugs, and prioritizes feature requests automatically.
					</p>
				</div>

				<!-- Step 3 -->
				<div class="relative text-center group">
					<div class="mb-6">
						<span class="text-6xl font-light transition-colors" style="color: var(--border-subtle);">03</span>
					</div>
					<h3 class="text-2xl font-semibold mb-4" style="color: var(--text-primary);">Get Actionable Alerts</h3>
					<p class="leading-relaxed" style="color: var(--text-secondary);">
						Receive prioritized alerts via Slack/Discord. Create issues with one click. Focus on building.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Stats & CTA Combined Section -->
	<section class="py-32" style="background: var(--bg-sidebar);">
		<div class="max-w-6xl mx-auto px-6">
			<!-- Stats Grid -->
			<div class="grid md:grid-cols-3 gap-6 mb-20">
				<div class="stat-card-home rounded-2xl p-8 text-center transition-all hover:shadow-lg" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
					<div class="text-6xl font-light mb-3" style="color: var(--text-primary);">$19</div>
					<div class="text-lg font-medium" style="color: var(--text-secondary);">per month</div>
				</div>
				<div class="stat-card-home rounded-2xl p-8 text-center transition-all hover:shadow-lg" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
					<div class="text-6xl font-light mb-3" style="color: var(--text-primary);">99%</div>
					<div class="text-lg font-medium" style="color: var(--text-secondary);">via alerts</div>
				</div>
				<div class="stat-card-home rounded-2xl p-8 text-center transition-all hover:shadow-lg" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
					<div class="text-6xl font-light mb-3" style="color: var(--text-primary);">1</div>
					<div class="text-lg font-medium" style="color: var(--text-secondary);">URL to start</div>
				</div>
			</div>

			<!-- CTA Card -->
			<div class="rounded-2xl p-12 md:p-16 text-center" style="background: var(--bg-widget); border: 1px solid var(--border-subtle);">
				<h2 class="text-4xl md:text-5xl font-semibold mb-6" style="color: var(--text-primary);">
					Ready to stop overpaying for ASO tools?
				</h2>
				<p class="text-xl mb-10 max-w-2xl mx-auto" style="color: var(--text-secondary);">
					Get review triage for $19/mo. Add your app URL and start receiving prioritized alerts today.
				</p>
				<div class="flex flex-wrap justify-center gap-4">
					{#if isAuthenticated}
						<a href="/dashboard/apps/new" class="btn-primary-home px-8 py-4 rounded-lg font-medium transition-colors">
							Add Your App
						</a>
						<a href="/dashboard" class="btn-secondary-home px-8 py-4 rounded-lg font-medium transition-colors">
							Go to Dashboard
						</a>
					{:else}
						<a href="/auth/signup" class="btn-primary-home px-8 py-4 rounded-lg font-medium transition-colors">
							Get Started
						</a>
						<a href="/auth/signin" class="btn-secondary-home px-8 py-4 rounded-lg font-medium transition-colors">
							Sign In
						</a>
					{/if}
				</div>
			</div>
		</div>
	</section>
</div>

<style>
	.homepage {
		font-family: var(--font-family);
	}

	.btn-primary-home {
		background: var(--text-primary);
		color: var(--bg-widget);
	}

	.btn-primary-home:hover {
		background: #2A2824;
		transform: translateY(-1px);
	}

	.btn-secondary-home {
		background: transparent;
		color: var(--text-primary);
		border: 2px solid var(--border-subtle);
	}

	.btn-secondary-home:hover {
		border-color: var(--border-medium);
		background: var(--bg-sidebar);
		transform: translateY(-1px);
	}

	.stat-card-home:hover {
		border-color: var(--border-medium) !important;
	}

	.feature-card-home:hover {
		border-color: var(--border-medium) !important;
	}
</style>
