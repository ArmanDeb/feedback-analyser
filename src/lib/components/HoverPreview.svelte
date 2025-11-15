<!-- Hover Preview Component - Shows representative reviews on hover -->
<script lang="ts">
	import { onMount } from 'svelte';
	
	export let reviews: Array<{ body: string; aiSummary: string | null }>;
	export let maxReviews: number = 3;
	
	let show = false;
	let position = { x: 0, y: 0 };
	
	$: previewReviews = reviews.slice(0, maxReviews);
	
	function handleMouseEnter(event: MouseEvent) {
		show = true;
		position = { x: event.clientX, y: event.clientY };
	}
	
	function handleMouseLeave() {
		show = false;
	}
	
	function handleMouseMove(event: MouseEvent) {
		if (show) {
			position = { x: event.clientX, y: event.clientY };
		}
	}
</script>

<div
	class="hover-preview-trigger"
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	onmousemove={handleMouseMove}
>
	<slot />
</div>

{#if show && previewReviews.length > 0}
	<div
		class="hover-preview-popup"
		style="left: {position.x + 10}px; top: {position.y + 10}px;"
	>
		<div class="text-xs font-semibold text-gray-700 mb-2">Sample Reviews:</div>
		{#each previewReviews as review}
			<div class="mb-2 pb-2 border-b border-gray-100 last:border-0">
				<p class="text-xs text-gray-600 line-clamp-2">
					"{review.aiSummary || review.body}"
				</p>
			</div>
		{/each}
	</div>
{/if}

<style>
	.hover-preview-trigger {
		position: relative;
		cursor: pointer;
	}
	
	.hover-preview-popup {
		position: fixed;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
		padding: 0.75rem;
		max-width: 300px;
		z-index: 1000;
		pointer-events: none;
	}
	
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>

