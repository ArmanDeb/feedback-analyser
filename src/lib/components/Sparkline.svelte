<!-- Sparkline Component - Minimal trend visualization -->
<script lang="ts">
	export let data: number[]; // Array of values (e.g., daily counts)
	export let width: number = 60;
	export let height: number = 16;
	export let color: string = '#3b82f6'; // Default blue
	
	// Normalize data to fit within height
	$: maxValue = Math.max(...data, 1);
	$: minValue = Math.min(...data, 0);
	$: range = maxValue - minValue || 1;
	
	// Generate path points
	$: points = data.map((value, index) => {
		const x = (index / (data.length - 1 || 1)) * width;
		const y = height - ((value - minValue) / range) * height;
		return `${x},${y}`;
	}).join(' ');
	
	// Generate SVG path
	$: path = `M ${points}`;
</script>

<svg width={width} height={height} class="sparkline" style="stroke: {color}; fill: none; stroke-width: 1.5;">
	<path d={path} vector-effect="non-scaling-stroke" />
</svg>

<style>
	.sparkline {
		display: inline-block;
		vertical-align: middle;
	}
</style>

