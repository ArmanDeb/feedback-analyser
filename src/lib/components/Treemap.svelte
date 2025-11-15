<!-- Treemap Component - Minimal proportion visualization -->
<script lang="ts">
	export let data: Array<{ label: string; value: number; color?: string }>;
	export let width: number = 400;
	export let height: number = 200;
	
	// Squarified treemap algorithm (simplified)
	$: total = data.reduce((sum, item) => sum + item.value, 0);
	$: rectangles = calculateTreemap(data, width, height, total);
	
	function calculateTreemap(
		items: Array<{ label: string; value: number; color?: string }>,
		w: number,
		h: number,
		totalValue: number
	) {
		if (items.length === 0) return [];
		
		const rects: Array<{ x: number; y: number; width: number; height: number; label: string; value: number; color?: string }> = [];
		let x = 0;
		let y = 0;
		let remainingWidth = w;
		let remainingHeight = h;
		
		// Sort by value descending
		const sorted = [...items].sort((a, b) => b.value - a.value);
		
		for (const item of sorted) {
			const ratio = item.value / totalValue;
			const rectWidth = remainingWidth * ratio;
			const rectHeight = remainingHeight * ratio;
			
			// Use whichever dimension fits better
			if (rectWidth <= remainingWidth && rectHeight <= remainingHeight) {
				rects.push({
					x,
					y,
					width: rectWidth,
					height: rectHeight,
					label: item.label,
					value: item.value,
					color: item.color
				});
				
				// Update position for next rectangle
				if (rectWidth <= rectHeight) {
					x += rectWidth;
					remainingWidth -= rectWidth;
				} else {
					y += rectHeight;
					remainingHeight -= rectHeight;
				}
			} else {
				// Fallback: simple row layout
				const wRatio = item.value / totalValue;
				rects.push({
					x: 0,
					y: (y / h) * h,
					width: w * wRatio,
					height: h / sorted.length,
					label: item.label,
					value: item.value,
					color: item.color
				});
				y += h / sorted.length;
			}
		}
		
		return rects;
	}
</script>

<svg width={width} height={height} class="treemap" style="border: 1px solid #e5e7eb;">
	{#each rectangles as rect}
		<rect
			x={rect.x}
			y={rect.y}
			width={rect.width}
			height={rect.height}
			fill={rect.color || '#3b82f6'}
			opacity="0.7"
			stroke="#fff"
			stroke-width="1"
		>
			<title>{rect.label}: {rect.value}</title>
		</rect>
		{#if rect.width > 40 && rect.height > 20}
			<text
				x={rect.x + rect.width / 2}
				y={rect.y + rect.height / 2}
				text-anchor="middle"
				dominant-baseline="middle"
				font-size="10"
				fill="#1f2937"
				font-weight="500"
			>
				{rect.label}
			</text>
		{/if}
	{/each}
</svg>

<style>
	.treemap {
		display: block;
	}
</style>

