<!-- Command Palette Component - Cmd+K navigation -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	
	export let appId: string | null = null; // Optional app context
	
	let open = false;
	let query = '';
	let selectedIndex = 0;
	
	const commands = [
		{
			id: 'bugs',
			label: 'Bugs',
			description: 'View bug clusters',
			action: () => {
				if (appId) {
					goto(`/dashboard/apps/${appId}/archive?category=Bug Report`);
				} else {
					goto('/dashboard');
				}
			}
		},
		{
			id: 'features',
			label: 'Features',
			description: 'View feature requests',
			action: () => {
				if (appId) {
					goto(`/dashboard/apps/${appId}/archive?category=Feature Request`);
				} else {
					goto('/dashboard');
				}
			}
		},
		{
			id: 'archive',
			label: 'Archive',
			description: 'View all clusters',
			action: () => {
				if (appId) {
					goto(`/dashboard/apps/${appId}/archive`);
				} else {
					goto('/dashboard');
				}
			}
		},
		{
			id: 'new-app',
			label: 'New App',
			description: 'Add a new app',
			action: () => goto('/dashboard/apps/new')
		},
		{
			id: 'dashboard',
			label: 'Dashboard',
			description: 'Go to main dashboard',
			action: () => goto('/dashboard')
		}
	];
	
	$: filteredCommands = query
		? commands.filter(cmd =>
				cmd.label.toLowerCase().includes(query.toLowerCase()) ||
				cmd.description.toLowerCase().includes(query.toLowerCase())
		  )
		: commands;
	
	$: selectedIndex = Math.min(selectedIndex, filteredCommands.length - 1);
	
	function handleKeydown(event: KeyboardEvent) {
		// Only handle in browser
		if (!browser) return;
		
		// Cmd+K or Ctrl+K to open
		if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
			event.preventDefault();
			open = !open;
			if (open) {
				query = '';
				selectedIndex = 0;
			}
			return;
		}
		
		if (!open) return;
		
		// Escape to close
		if (event.key === 'Escape') {
			open = false;
			query = '';
			return;
		}
		
		// Arrow keys to navigate
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			selectedIndex = (selectedIndex + 1) % filteredCommands.length;
			return;
		}
		
		if (event.key === 'ArrowUp') {
			event.preventDefault();
			selectedIndex = selectedIndex === 0 ? filteredCommands.length - 1 : selectedIndex - 1;
			return;
		}
		
		// Enter to select
		if (event.key === 'Enter') {
			event.preventDefault();
			if (filteredCommands[selectedIndex]) {
				filteredCommands[selectedIndex].action();
				open = false;
				query = '';
			}
			return;
		}
	}
	
	onMount(() => {
		if (browser) {
			window.addEventListener('keydown', handleKeydown);
		}
	});
	
	onDestroy(() => {
		if (browser) {
			window.removeEventListener('keydown', handleKeydown);
		}
	});
	
	function selectCommand(index: number) {
		if (filteredCommands[index]) {
			filteredCommands[index].action();
			open = false;
			query = '';
		}
	}
</script>

{#if open}
	<div
		class="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-32 z-50"
		onclick={() => {
			open = false;
			query = '';
		}}
		role="dialog"
		aria-modal="true"
		aria-label="Command Palette"
	>
		<div
			class="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4"
			onclick={(e) => e.stopPropagation()}
		>
			<!-- Search Input -->
			<div class="p-4 border-b">
				<input
					type="text"
					placeholder="Type to search commands..."
					bind:value={query}
					class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					autofocus
				/>
			</div>
			
			<!-- Command List -->
			<div class="max-h-96 overflow-y-auto">
				{#if filteredCommands.length === 0}
					<div class="p-4 text-center text-gray-500">No commands found</div>
				{:else}
					{#each filteredCommands as command, index}
						<button
							class="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors {index === selectedIndex
								? 'bg-gray-50'
								: ''}"
							onclick={() => selectCommand(index)}
						>
							<div class="font-medium text-gray-900">{command.label}</div>
							<div class="text-sm text-gray-500">{command.description}</div>
						</button>
					{/each}
				{/if}
			</div>
			
			<!-- Footer -->
			<div class="p-4 border-t text-xs text-gray-500 flex justify-between">
				<span>↑↓ Navigate</span>
				<span>Enter Select</span>
				<span>Esc Close</span>
			</div>
		</div>
	</div>
{/if}

