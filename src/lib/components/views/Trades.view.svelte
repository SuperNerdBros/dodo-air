<script lang="ts">
	import { onMount } from 'svelte';
	import { tradeStore } from '$lib/stores/trade.svelte.ts';
	import { dalStore } from '$lib/stores/dal.svelte.ts';
	import TradeListingCard from '$lib/components/molecules/TradeListingCard.svelte';
	import TradeCreationModal from '$lib/components/organisms/TradeCreationModal.svelte';
	import InteractiveTradeSession from '$lib/components/organisms/InteractiveTradeSession.svelte';
	import AcnhBubble from '$lib/components/molecules/AcnhBubble.svelte';
	import { DIALOGS } from '$lib/constants/dialogs';
	import { Plus, Filter } from '@lucide/svelte';

	let { isActive = true } = $props<{ isActive?: boolean }>();

	onMount(() => {
		tradeStore.fetchListings();
	});

	let filterType = $state<'ALL' | 'LF' | 'FT' | 'MM'>('ALL');
	
	let filteredListings = $derived(
		tradeStore.listings.filter(l => {
			if (filterType === 'ALL') return true;
			if (filterType === 'MM') return l.travelPreference === 'mm_required';
			if (filterType === 'LF') return l.lfItems.length > 0;
			if (filterType === 'FT') return l.ftItems.length > 0;
			return true;
		})
	);
</script>

<div class="flex h-full flex-col">
	<!-- Tab Bubble Intro -->
	<div class="space-y-4 pt-5 mb-4">
		{#if isActive}
			<AcnhBubble
				title={dalStore.systemMode === 'DAL' ? 'Orville' : 'Luna'}
				dialogText={dalStore.systemMode === 'DAL'
					? "Welcome to the DAL Trading Post! Safely connect with other players to trade items, and request a Verified DAL Flight Marshal for extra secure exchanges!"
					: "Welcome to the Slumber Trading Post! Share dream items and connect with other dreamers securely."}
			/>
		{/if}
	</div>

	<!-- Tab Header Area -->
	<div class="mb-6">
		<div
			class="bg-white rounded-3xl border-2 border-[#0084CC]/10 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
		>
			<div class="flex items-center gap-2.5">
				<span class="w-2.5 h-2.5 rounded-full {dalStore.systemMode === 'DAL' ? 'bg-[#0084CC]' : 'bg-[#4B0082]'} animate-ping shrink-0"></span>
				<div class="text-left">
					<h2
						class="text-base font-system font-black tracking-wider {dalStore.systemMode === 'DAL'
							? 'text-[#0084CC]'
							: 'text-[#4B0082]'} uppercase leading-none transition-colors"
					>
						{dalStore.systemMode === 'DAL' ? 'DAL TRADING POST' : 'LUNA TRADING POST'}
					</h2>
					<span
						class="text-xs font-system text-slate-400 font-bold uppercase tracking-widest mt-1 block"
					>
						{dalStore.systemMode === 'DAL'
							? 'SAFELY TRADE ITEMS WITH THE COMMUNITY'
							: 'SHARE DREAM ITEMS SECURELY'}
					</span>
				</div>
			</div>
			
			<div class="flex items-center gap-3">
				<span
					class="{dalStore.systemMode === 'DAL'
						? 'bg-[#A2D2FF]/20 text-[#0084CC] border-[#0084CC]/10'
						: 'bg-[#DDA0DD]/20 text-[#4B0082] border-[#4B0082]/10'} text-sm font-system font-bold px-2.5 py-1 rounded-full border transition-colors whitespace-nowrap"
				>
					{tradeStore.listings.length}
					{dalStore.systemMode === 'DAL' ? 'ACTIVE LISTINGS' : 'ACTIVE DREAMS'}
				</span>
				
				<button 
					onclick={() => tradeStore.showCreateModal = true}
					class="flex items-center gap-2 rounded-full {dalStore.systemMode === 'DAL' ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-fuchsia-600 hover:bg-fuchsia-500'} px-4 py-1.5 font-system text-sm font-bold text-white shadow-sm transition-transform hover:scale-105"
				>
					<Plus size={16} />
					<span class="uppercase tracking-widest text-[10px]">New Listing</span>
				</button>
			</div>
		</div>
	</div>

	<!-- Filters -->
	<div class="mb-6 flex flex-wrap items-center justify-center gap-1.5 px-1">
		<div class="flex items-center gap-2 pr-2 text-slate-400">
			<Filter size={14} />
			<span class="text-[10px] font-system font-bold uppercase tracking-widest">Filter:</span>
		</div>
		
		{#each ['ALL', 'LF', 'FT', 'MM'] as type}
			{@const isActive = filterType === type}
			<button 
				onclick={() => filterType = type as any}
				class="group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-system font-bold border transition-all cursor-pointer select-none
				{isActive
					? dalStore.systemMode === 'DAL' ? 'bg-[#0084CC] text-white border-[#0084CC] shadow-md scale-[1.03]' : 'bg-[#4B0082] text-white border-[#4B0082] shadow-md scale-[1.03]'
					: 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300 shadow-sm'}"
			>
				<span class="text-sm leading-none">
					{#if type === 'ALL'}📦{:else if type === 'LF'}🔍{:else if type === 'FT'}🤝{:else if type === 'MM'}🛡️{/if}
				</span>
				<span>{type === 'MM' ? 'Middleman Only' : type}</span>
			</button>
		{/each}
	</div>

	<!-- Feed -->
	<div class="flex-1 overflow-y-auto pb-20 pt-2">
		{#if tradeStore.listings.length === 0}
			<div class="flex flex-col items-center justify-center py-20 text-center opacity-60">
				<div class="mb-4 text-6xl">📦</div>
				<h3 class="text-xl font-bold text-slate-800 dark:text-slate-200">No active listings</h3>
				<p class="text-slate-600 dark:text-slate-400">Be the first to post a trade request!</p>
			</div>
		{:else if filteredListings.length === 0}
			<div class="py-12 text-center text-slate-500">
				No listings match this filter.
			</div>
		{:else}
			<div class="grid gap-x-4 gap-y-10 sm:grid-cols-2 pt-6 px-1">
				{#each filteredListings as listing (listing.id)}
					<div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
						<TradeListingCard {listing} />
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<TradeCreationModal />
<InteractiveTradeSession />
