<script lang="ts">
	export let variant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'primary';
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let fullWidth: boolean = false;
	export let disabled: boolean = false;
	export let type: 'button' | 'submit' | 'reset' = 'button';
</script>

<button 
	class="btn" 
	class:btn-primary={variant === 'primary'}
	class:btn-secondary={variant === 'secondary'}
	class:btn-ghost={variant === 'ghost'}
	class:btn-danger={variant === 'danger'}
	class:btn-sm={size === 'sm'}
	class:btn-md={size === 'md'}
	class:btn-lg={size === 'lg'}
	class:btn-full={fullWidth}
	{disabled}
	{type}
	on:click
>
	<slot />
</button>

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-2);
		font-weight: var(--font-weight-semibold);
		font-family: var(--font-family);
		border: none;
		cursor: pointer;
		transition: all var(--transition-base);
		border-radius: var(--radius-md);
		line-height: 1;
	}

	/* Sizes */
	.btn-sm {
		padding: var(--spacing-2) var(--spacing-4);
		font-size: var(--font-size-sm);
	}

	.btn-md {
		padding: var(--spacing-3) var(--spacing-6);
		font-size: var(--font-size-base);
	}

	.btn-lg {
		padding: var(--spacing-4) var(--spacing-8);
		font-size: var(--font-size-lg);
	}

	/* Variants */
	.btn-primary {
		background: var(--accent-blue);
		color: var(--text-primary);
		box-shadow: var(--shadow-soft);
	}

	.btn-primary:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: var(--shadow-medium);
		filter: brightness(1.05);
	}

	.btn-secondary {
		background: var(--accent-peach);
		color: var(--text-primary);
		box-shadow: var(--shadow-soft);
	}

	.btn-secondary:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: var(--shadow-medium);
		filter: brightness(1.05);
	}

	.btn-ghost {
		background: transparent;
		color: var(--text-secondary);
		border: 2px solid var(--border-subtle);
	}

	.btn-ghost:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.5);
		color: var(--text-primary);
		border-color: var(--border-medium);
	}

	.btn-danger {
		background: rgba(239, 68, 68, 0.1);
		color: #ef4444;
		border: 2px solid rgba(239, 68, 68, 0.3);
	}

	.btn-danger:hover:not(:disabled) {
		background: rgba(239, 68, 68, 0.2);
		border-color: #ef4444;
		transform: translateY(-1px);
	}

	.btn-full {
		width: 100%;
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none !important;
	}
</style>



