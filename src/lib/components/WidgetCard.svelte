<script lang="ts">
	export let title: string | undefined = undefined;
	export let subtitle: string | undefined = undefined;
	export let padding: 'sm' | 'md' | 'lg' = 'md';
	export let hover: boolean = true;
</script>

<div class="widget-card" class:no-hover={!hover} class:padding-sm={padding === 'sm'} class:padding-md={padding === 'md'} class:padding-lg={padding === 'lg'}>
	{#if title}
		<div class="widget-header">
			<h3 class="widget-title">{title}</h3>
			{#if subtitle}
				<p class="widget-subtitle">{subtitle}</p>
			{/if}
		</div>
	{/if}
	<div class="widget-content">
		<slot />
	</div>
</div>

<style>
	.widget-card {
		background: var(--bg-widget);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-soft);
		transition: box-shadow var(--transition-base), transform var(--transition-base);
	}

	.widget-card.padding-sm {
		padding: var(--spacing-4);
	}

	.widget-card.padding-md {
		padding: var(--spacing-6);
	}

	.widget-card.padding-lg {
		padding: var(--spacing-8);
	}

	.widget-card:not(.no-hover):hover {
		box-shadow: var(--shadow-medium);
		transform: translateY(-1px);
	}

	.widget-header {
		margin-bottom: var(--spacing-4);
		padding-bottom: var(--spacing-4);
		border-bottom: 1px solid var(--border-subtle);
	}

	.widget-title {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-semibold);
		color: var(--text-primary);
		margin: 0 0 var(--spacing-2) 0;
	}

	.widget-subtitle {
		font-size: var(--font-size-sm);
		color: var(--text-secondary);
		margin: 0;
		line-height: var(--line-height-relaxed);
	}

	.widget-content {
		width: 100%;
	}
</style>



