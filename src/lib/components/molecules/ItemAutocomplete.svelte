<script lang="ts">
	import { searchNookipedia } from '$lib/api/nookipedia';
	import type { AcnhItem } from '$lib/types';
	import { Search, Loader2, X } from '@lucide/svelte';

	let { 
		selectedItems = $bindable<AcnhItem[]>([]),
		placeholder = "Search items, villagers, or recipes..."
	} = $props();

	let query = $state('');
	let results = $state<AcnhItem[]>([]);
	let isSearching = $state(false);
	let isFocused = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	function handleInput() {
		if (debounceTimer) clearTimeout(debounceTimer);
		
		if (query.trim().length < 2) {
			results = [];
			isSearching = false;
			return;
		}

		isSearching = true;
		debounceTimer = setTimeout(async () => {
			results = await searchNookipedia(query);
			isSearching = false;
		}, 300);
	}

	function handleSelect(item: AcnhItem) {
		if (!selectedItems.find(i => i.name === item.name)) {
			selectedItems = [...selectedItems, item];
		}
		query = '';
		results = [];
		// Keep focus on input could be done here if ref is attached
	}

	function handleRemove(itemToRemove: AcnhItem) {
		selectedItems = selectedItems.filter(i => i.name !== itemToRemove.name);
	}
</script>

<div class="relative w-full">
	<!-- Selected Items Chips -->
	{#if selectedItems.length > 0}
		<div class="mb-2 flex flex-wrap gap-2">
			{#each selectedItems as item}
				<div class="flex items-center gap-1.5 rounded-lg bg-sky-500/10 py-1 pl-1.5 pr-1 shadow-sm ring-1 ring-inset ring-sky-500/20">
					<img src={item.imageUrl} alt={item.name} class="h-6 w-6 object-contain drop-shadow-sm" />
					<span class="text-sm font-medium text-sky-700 dark:text-sky-300">{item.name}</span>
					<button 
						type="button"
						onclick={() => handleRemove(item)}
						class="ml-1 rounded-full p-0.5 text-sky-600 hover:bg-sky-500/20 dark:text-sky-400"
					>
						<X size={14} />
					</button>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Search Input -->
	<div class="relative">
		<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
			{#if isSearching}
				<Loader2 size={18} class="animate-spin text-slate-400" />
			{:else}
				<Search size={18} class="text-slate-400" />
			{/if}
		</div>
		<input 
			type="text" 
			bind:value={query}
			oninput={handleInput}
			onfocus={() => isFocused = true}
			onblur={() => setTimeout(() => isFocused = false, 200)}
			{placeholder}
			class="w-full rounded-xl border border-black/20 bg-white py-3 pl-10 pr-4 text-slate-800 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-white/10 dark:bg-black/40 dark:text-white"
		/>
	</div>

	<!-- Dropdown Results -->
	{#if isFocused && query.length >= 2 && results.length > 0}
		<div class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-white/20 bg-white/95 p-1 shadow-2xl backdrop-blur-md dark:bg-slate-800/95">
			{#each results as item}
				<button 
					type="button"
					onclick={() => handleSelect(item)}
					class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/10"
				>
					<img src={item.imageUrl} alt={item.name} class="h-8 w-8 object-contain drop-shadow-sm" />
					<div class="flex flex-col">
						<span class="font-bold text-slate-800 dark:text-white">{item.name}</span>
						<span class="text-xs uppercase tracking-wider text-slate-500">{item.category}</span>
					</div>
				</button>
			{/each}
		</div>
	{:else if isFocused && query.length >= 2 && !isSearching && results.length === 0}
		<div class="absolute z-10 mt-1 w-full rounded-xl border border-white/20 bg-white/95 p-4 text-center text-sm text-slate-500 shadow-2xl backdrop-blur-md dark:bg-slate-800/95">
			No items found for "{query}"
		</div>
	{/if}
</div>
