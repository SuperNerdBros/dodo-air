<script lang="ts">
	import { tradeStore } from '$lib/stores/trade.svelte.ts';
	import { ShieldCheck, Plane, Handshake, PlaneTakeoff, X, PlaneLanding } from '@lucide/svelte';
	import ItemAutocomplete from '$lib/components/molecules/ItemAutocomplete.svelte';
	import AcnhBubble from '$lib/components/molecules/AcnhBubble.svelte';
	import { dalStore } from '$lib/stores/dal.svelte.ts';

	let formLfItems = $derived(tradeStore.formLfItems);
	let formFtItems = $derived(tradeStore.formFtItems);
	let formTravel = $derived(tradeStore.formTravel);
	let isSubmitting = $derived(tradeStore.isSubmitting);

	let textDone = $state(false);

	function handleClose() {
		tradeStore.showCreateModal = false;
	}

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		tradeStore.createListing(
			dalStore.passport?.userId || dalStore.passport?.friendCode || 'u-me',
			dalStore.passport?.villagerName || 'Villager',
			dalStore.passport?.islandName || 'Island',
			'🦤'
		);
	}
</script>

{#if tradeStore.showCreateModal}
	<div
		class="fixed inset-0 z-50 flex flex-col items-center justify-start overflow-y-auto bg-[#004e75]/60 p-4 pt-12 backdrop-blur-md sm:justify-center sm:p-8"
	>
		<!-- Main Content Area -->
		<div class="relative z-10 w-full max-w-lg pb-48 sm:pb-56">
			<div class="overflow-hidden rounded-2xl border-4 border-[#333] bg-white shadow-2xl">
				<div
					class="flex items-center justify-between border-b border-black/10 bg-slate-100 px-6 py-4"
				>
					<h2 class="text-xl font-black uppercase tracking-wide text-slate-800">Create Listing</h2>
					<button
						onclick={handleClose}
						class="rounded-full p-2 text-slate-500 hover:bg-black/5 hover:text-slate-800"
					>
						<X size={20} />
					</button>
				</div>

				<form onsubmit={handleSubmit} class="p-6">
					<div class="flex flex-row gap-3">
						<!-- LF Items -->
						<div class="mb-5">
							<label class="mb-2 block text-sm font-bold text-sky-700 dark:text-sky-400"
								>[LF] Looking For</label
							>
							<ItemAutocomplete
								bind:selectedItems={tradeStore.formLfItems}
								placeholder="Items, villagers, DIYs..."
							/>
						</div>

						<!-- FT Items -->
						<div class="mb-6">
							<label class="mb-2 block text-sm font-bold text-emerald-700 dark:text-emerald-400"
								>[FT] For Trade</label
							>
							<ItemAutocomplete
								bind:selectedItems={tradeStore.formFtItems}
								placeholder="Items, villagers, DIYs..."
							/>
						</div>
					</div>
					<!-- Travel Preference -->
					<div class="mb-8">
						<label class="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300"
							>Travel Preference</label
						>
						<div class="grid grid-cols-2 gap-3">
							<button
								type="button"
								onclick={() => (tradeStore.formTravel = 'will_travel')}
								class="flex items-center gap-2 rounded-lg border-2 p-3 text-left transition-all {formTravel ===
								'will_travel'
									? 'border-sky-500 bg-sky-500/10 text-sky-700 dark:text-sky-400'
									: 'border-black/10 text-slate-600 hover:border-black/20 dark:border-white/10 dark:text-slate-400 dark:hover:border-white/20'}"
							>
								<PlaneTakeoff size={18} />
								<span class="text-sm font-bold">I'll Travel</span>
							</button>
							<button
								type="button"
								onclick={() => (tradeStore.formTravel = 'will_host')}
								class="flex items-center gap-2 rounded-lg border-2 p-3 text-left transition-all {formTravel ===
								'will_host'
									? 'border-sky-500 bg-sky-500/10 text-sky-700 dark:text-sky-400'
									: 'border-black/10 text-slate-600 hover:border-black/20 dark:border-white/10 dark:text-slate-400 dark:hover:border-white/20'}"
							>
								<PlaneLanding size={18} />
								<span class="text-sm font-bold">I'll Host</span>
							</button>
							<button
								type="button"
								onclick={() => (tradeStore.formTravel = 'flexible')}
								class="flex items-center gap-2 rounded-lg border-2 p-3 text-left transition-all {formTravel ===
								'flexible'
									? 'border-sky-500 bg-sky-500/10 text-sky-700 dark:text-sky-400'
									: 'border-black/10 text-slate-600 hover:border-black/20 dark:border-white/10 dark:text-slate-400 dark:hover:border-white/20'}"
							>
								<Handshake size={18} />
								<span class="text-sm font-bold">Flexible</span>
							</button>
							<button
								type="button"
								onclick={() => (tradeStore.formTravel = 'mm_required')}
								class="flex items-center gap-2 rounded-lg border-2 p-3 text-left transition-all {formTravel ===
								'mm_required'
									? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400'
									: 'border-black/10 text-slate-600 hover:border-black/20 dark:border-white/10 dark:text-slate-400 dark:hover:border-white/20'}"
							>
								<ShieldCheck size={18} />
								<span class="text-sm font-bold">MM Required</span>
							</button>
						</div>
					</div>

					{#if tradeStore.error}
						<div
							class="mb-4 rounded-lg bg-red-500/10 p-3 text-sm font-bold text-red-600 dark:text-red-400"
						>
							{tradeStore.error}
						</div>
					{/if}

					<button
						type="submit"
						disabled={isSubmitting || (formLfItems.length === 0 && formFtItems.length === 0)}
						class="w-full rounded-xl bg-emerald-500 py-3.5 text-center font-bold text-white shadow-lg transition-all hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500"
					>
						{isSubmitting ? 'Posting...' : 'Post Listing'}
					</button>
				</form>
			</div>
		</div>
	</div>

	<!-- Fixed Bottom ACNH Bubble -->
	<div class="pointer-events-none fixed bottom-0 left-0 right-0 p-4 sm:p-8" style="z-index: 110;">
		<div class="pointer-events-auto mx-auto w-full max-w-7xl">
			<AcnhBubble
				title={dalStore.systemMode === 'DAL' ? 'Orville' : 'Luna'}
				isIntro={true}
				dialogText="What are you looking to trade today? Need to clear out some storage or hunt for your dreamie?"
				bind:textDone
				onDismiss={() => {}}
			/>
		</div>
	</div>
{/if}
