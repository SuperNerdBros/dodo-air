<script lang="ts">
	import type { TradeListing } from '$lib/types';
	import { tradeStore } from '$lib/stores/trade.svelte.ts';
	import { dalStore } from '$lib/stores/dal.svelte.ts';
	import AcnhBubble from '$lib/components/molecules/AcnhBubble.svelte';
	import { Plane, Handshake, PlaneTakeoff, ShieldCheck } from '@lucide/svelte';

	let { listing }: { listing: TradeListing } = $props();

	let isOwner = $derived(listing.authorId === (dalStore.passport?.userId || dalStore.passport?.friendCode || 'u-me'));

	let timeAgo = $state('');

	$effect(() => {
		const updateTime = () => {
			const ms = Date.now() - new Date(listing.createdAt).getTime();
			const mins = Math.floor(ms / 60000);
			if (mins < 1) timeAgo = 'Just now';
			else if (mins < 60) timeAgo = `${mins}m`;
			else if (mins < 1440) timeAgo = `${Math.floor(mins / 60)}h`;
			else timeAgo = `${Math.floor(mins / 1440)}d`;
		};
		updateTime();
		const interval = setInterval(updateTime, 60000);
		return () => clearInterval(interval);
	});

	function handleMakeOffer() {
		const travelerId = dalStore.passport?.userId || dalStore.passport?.friendCode || 'current_user_id'; 
		const requiresMM = listing.travelPreference === 'mm_required';
		tradeStore.startSession(listing, travelerId, requiresMM);
	}
</script>

<AcnhBubble 
	title="{listing.authorName} @ {listing.authorIsland}"
	class="w-full !max-w-none mt-6"
>
	<div class="flex items-start gap-4 mt-2 relative z-10 w-full">
		<div class="w-12 h-12 bg-slate-50 border-2 border-slate-100 rounded-xl flex items-center justify-center text-3xl shadow-xs shrink-0 hover:scale-105 transition-transform">
			{listing.authorAvatar}
		</div>
		<div class="flex-1 min-w-0 pt-1">
			<div class="flex items-center justify-between mb-2">
				<div class="text-[17px] font-bold text-[#807256] leading-snug">
					{#if listing.lfItems.length > 0 && listing.ftItems.length > 0}
						I'm looking to trade! 🤝
					{:else if listing.lfItems.length > 0}
						Looking for items! 🔍
					{:else}
						Giving away items! 🎁
					{/if}
				</div>
				<div class="flex items-center gap-2">
					{#if listing.status === 'open'}
						<span class="rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200 shadow-sm">Open</span>
					{:else}
						<span class="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700 border border-amber-200 shadow-sm">Negotiating</span>
					{/if}
					{#if timeAgo}
						<span class="text-xs font-bold text-slate-400">{timeAgo}</span>
					{/if}
				</div>
			</div>

			<div class="space-y-1.5 text-[15px] font-medium text-[#807256]/90">
				{#if listing.lfItems.length > 0}
					<div class="flex flex-wrap items-center gap-1.5">
						<span>I'm looking for</span>
						{#each listing.lfItems as item}
							<span class="font-bold text-sky-700">{item.name}</span>
						{/each}.
					</div>
				{/if}
				{#if listing.ftItems.length > 0}
					<div class="flex flex-wrap items-center gap-1.5">
						<span>I have</span>
						{#each listing.ftItems as item}
							<span class="font-bold text-emerald-700">{item.name}</span>
						{/each}
						<span>to trade.</span>
					</div>
				{/if}
				<div class="flex items-center gap-1.5 font-bold text-amber-700 mt-1">
					{#if listing.travelPreference === 'will_travel'}
						<PlaneTakeoff size={16} /> I can fly to you.
					{:else if listing.travelPreference === 'will_host'}
						<Plane size={16} /> I can host the trade.
					{:else if listing.travelPreference === 'mm_required'}
						<ShieldCheck size={16} /> I require a Middleman.
					{:else}
						<Handshake size={16} /> My travel plans are flexible.
					{/if}
				</div>
			</div>

			<div class="mt-4 flex justify-end gap-3">
				{#if isOwner}
					<button 
						onclick={() => tradeStore.cancelListing(listing.id)}
						class="rounded-full bg-rose-500 px-5 py-2 text-sm font-bold text-white shadow-md transition-transform hover:scale-105"
					>
						Cancel Listing
					</button>
				{:else}
					<button 
						onclick={handleMakeOffer}
						disabled={listing.status !== 'open'}
						class="rounded-full bg-[#0084CC] px-5 py-2 text-sm font-bold text-white shadow-md transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
					>
						Make Offer
					</button>
				{/if}
			</div>
		</div>
	</div>
</AcnhBubble>
