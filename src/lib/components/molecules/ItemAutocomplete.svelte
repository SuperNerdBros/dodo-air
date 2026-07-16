<script lang="ts">
	import { searchNookipedia } from '$lib/api/nookipedia';
	import type { AcnhItem } from '$lib/types';
	import { Search, Loader2, X } from '@lucide/svelte';

	let {
		selectedItems = $bindable<AcnhItem[]>([]),
		placeholder = 'Search items, villagers, or recipes...'
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
		if (!selectedItems.find((i) => i.name === item.name)) {
			selectedItems = [...selectedItems, { ...item, quantity: 1 }];
		}
		query = '';
		results = [];
		// Keep focus on input could be done here if ref is attached
	}

	function addCurrency(type: 'bells' | 'nmt') {
		const name = type === 'bells' ? 'Bells' : 'Nook Miles Tickets';
		const imageUrl =
			type === 'bells'
				? 'https://dodo.ac/np/images/1/1e/99k_Bells_NH_Inv_Icon.png'
				: 'https://dodo.ac/np/images/f/f5/Nook_Miles_Ticket_NH_Icon.png';
		if (!selectedItems.find((i) => i.name === name)) {
			selectedItems = [
				...selectedItems,
				{ name, imageUrl, category: 'currency', quantity: type === 'bells' ? 1000 : 1 }
			];
		}
	}

	function handleRemove(itemToRemove: AcnhItem) {
		selectedItems = selectedItems.filter((i) => i.name !== itemToRemove.name);
	}
</script>

<div class="relative w-full">
	<!-- Selected Items Chips -->
	{#if selectedItems.length > 0}
		<div class="mb-3 flex flex-col gap-2">
			{#each selectedItems as item}
				<div
					class="flex items-center gap-2 rounded-xl bg-sky-500/10 p-2 shadow-sm ring-1 ring-inset ring-sky-500/20"
				>
					<img src={item.imageUrl} alt={item.name} class="h-8 w-8 object-contain drop-shadow-sm" />
					<span class="flex-1 text-sm font-bold text-sky-700 dark:text-sky-300">{item.name}</span>
					<div class="flex items-center gap-1">
						<span class="text-xs font-black text-sky-600/50 uppercase">Qty</span>
						<input
							type="number"
							min="1"
							bind:value={item.quantity}
							class="w-20 rounded-lg bg-white py-1 px-2 text-sm font-bold text-slate-800 shadow-inner outline-none ring-1 ring-black/10 focus:ring-sky-500 dark:bg-slate-800 dark:text-white dark:ring-white/10"
						/>
					</div>
					<button
						type="button"
						onclick={() => handleRemove(item)}
						class="ml-1 rounded-full p-1 text-sky-600 hover:bg-sky-500/20 dark:text-sky-400"
					>
						<X size={16} />
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
			onfocus={() => (isFocused = true)}
			onblur={() => setTimeout(() => (isFocused = false), 200)}
			{placeholder}
			class="w-full rounded-xl border border-black/20 bg-white py-3 pl-10 pr-4 text-slate-800 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-white/10 dark:bg-black/40 dark:text-white"
		/>
	</div>

	<!-- Dropdown Results -->
	{#if isFocused && query.length >= 2 && results.length > 0}
		<div
			class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-white/20 bg-white/95 p-1 shadow-2xl backdrop-blur-md dark:bg-slate-800/95"
		>
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
		<div
			class="absolute z-10 mt-1 w-full rounded-xl border border-white/20 bg-white/95 p-4 text-center text-sm text-slate-500 shadow-2xl backdrop-blur-md dark:bg-slate-800/95"
		>
			No items found for "{query}"
		</div>
	{/if}

	<!-- Quick Add Currency -->
	<div class="mt-2 flex items-center justify-end gap-2 px-1">
		<span class="text-[10px] font-black uppercase text-slate-400">Quick Add:</span>
		<button
			type="button"
			onclick={() => addCurrency('bells')}
			class="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-700 transition-colors hover:bg-amber-500/20 border border-amber-500/20"
		>
			💰 Bells
		</button>
		<button
			type="button"
			onclick={() => addCurrency('nmt')}
			class="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-500/20 border border-emerald-500/20"
		>
			🎫 NMTs
		</button>
	</div>
</div>
