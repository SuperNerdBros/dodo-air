<script lang="ts">
	import { tradeStore } from '$lib/stores/trade.svelte.ts';
	import { ShieldCheck, Plane, Handshake, PlaneTakeoff, X, PlaneLanding } from '@lucide/svelte';
	import ItemAutocomplete from '$lib/components/molecules/ItemAutocomplete.svelte';
	import AcnhBubble from '$lib/components/molecules/AcnhBubble.svelte';
	import Button from '$lib/components/atoms/Button.atom.svelte';
	import { dalStore } from '$lib/stores/dal.svelte.ts';
	import { playSound } from '$lib/utils/audio';
	import { fade, fly } from 'svelte/transition';

	let formLfItems = $derived(tradeStore.formLfItems);
	let formFtItems = $derived(tradeStore.formFtItems);
	let formTravel = $derived(tradeStore.formTravel);
	let isSubmitting = $derived(tradeStore.isSubmitting);
	let error = $derived(tradeStore.error);

	let step = $state(1);
	let wasOpen = $state(false);

	$effect(() => {
		if (tradeStore.showCreateModal && !wasOpen) {
			step = 1;
		}
		wasOpen = tradeStore.showCreateModal;
	});

	function handleClose() {
		tradeStore.showCreateModal = false;
	}

	function nextStep() {
		playSound('beep');
		if (step < 4) step++;
	}

	function prevStep() {
		playSound('beep');
		if (step > 1) step--;
	}

	function handleSubmit(e: Event) {
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
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="fixed inset-0 z-[100] flex flex-col justify-end p-4 pb-8 sm:p-8 bg-[#006094]/60 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
	>
		<div transition:fly={{ y: 50, duration: 300 }} class="w-full max-w-4xl mx-auto">
			{#if step === 1}
				<AcnhBubble
					title={dalStore.systemMode === 'DAL' ? 'Orville [Tour Guide]' : 'Luna [Dream Guide]'}
					dialogText="Let's build your shipment manifest. First, what items are you putting up For Trade [FT]?"
					onDismiss={() => { playSound('beep'); handleClose(); }}
				>
					<div class="mt-4 relative z-10 pr-4 md:pr-10">
						<div class="mb-4">
							<ItemAutocomplete
								bind:selectedItems={tradeStore.formFtItems}
								placeholder="Search items, villagers, or DIYs to offer..."
							/>
						</div>
						<div class="flex justify-between pt-2">
							<Button variant="secondary" onclick={handleClose}>Cancel</Button>
							<Button variant="primary" onclick={nextStep}>Next Step</Button>
						</div>
					</div>
				</AcnhBubble>

			{:else if step === 2}
				<AcnhBubble
					title={dalStore.systemMode === 'DAL' ? 'Orville [Tour Guide]' : 'Luna [Dream Guide]'}
					dialogText="Got it! Now, what are you Looking For [LF] in return?"
					onDismiss={() => { playSound('beep'); handleClose(); }}
				>
					<div class="mt-4 relative z-10 pr-4 md:pr-10">
						<div class="mb-4">
							<ItemAutocomplete
								bind:selectedItems={tradeStore.formLfItems}
								placeholder="Search items, villagers, or DIYs you want..."
							/>
						</div>
						<div class="flex justify-between pt-2">
							<Button variant="secondary" onclick={prevStep}>Back</Button>
							<Button variant="primary" onclick={nextStep}>Next Step</Button>
						</div>
					</div>
				</AcnhBubble>

			{:else if step === 3}
				<AcnhBubble
					title={dalStore.systemMode === 'DAL' ? 'Orville [Tour Guide]' : 'Luna [Dream Guide]'}
					dialogText="Almost done! How do you want to handle the travel logistics for this trade?"
					onDismiss={() => { playSound('beep'); handleClose(); }}
				>
					<div class="mt-4 relative z-10 pr-4 md:pr-10">
						<div class="grid grid-cols-2 gap-3 mb-6">
							<button
								type="button"
								onclick={() => { playSound('beep'); tradeStore.formTravel = 'will_travel'; }}
								class="flex items-center gap-2 rounded-xl border-4 p-4 text-left transition-all {formTravel ===
								'will_travel'
									? 'border-[#0084CC] bg-[#FFCC00] text-[#006094]'
									: 'border-[#E6DFC7] bg-white text-slate-600 hover:-translate-y-1 hover:border-[#FFCC00]'}"
							>
								<PlaneTakeoff size={24} />
								<span class="text-sm font-bold font-system">I'll Travel</span>
							</button>
							<button
								type="button"
								onclick={() => { playSound('beep'); tradeStore.formTravel = 'will_host'; }}
								class="flex items-center gap-2 rounded-xl border-4 p-4 text-left transition-all {formTravel ===
								'will_host'
									? 'border-[#0084CC] bg-[#FFCC00] text-[#006094]'
									: 'border-[#E6DFC7] bg-white text-slate-600 hover:-translate-y-1 hover:border-[#FFCC00]'}"
							>
								<PlaneLanding size={24} />
								<span class="text-sm font-bold font-system">I'll Host</span>
							</button>
							<button
								type="button"
								onclick={() => { playSound('beep'); tradeStore.formTravel = 'flexible'; }}
								class="flex items-center gap-2 rounded-xl border-4 p-4 text-left transition-all {formTravel ===
								'flexible'
									? 'border-[#0084CC] bg-[#FFCC00] text-[#006094]'
									: 'border-[#E6DFC7] bg-white text-slate-600 hover:-translate-y-1 hover:border-[#FFCC00]'}"
							>
								<Handshake size={24} />
								<span class="text-sm font-bold font-system">Flexible</span>
							</button>
							<button
								type="button"
								onclick={() => { playSound('beep'); tradeStore.formTravel = 'mm_required'; }}
								class="flex items-center gap-2 rounded-xl border-4 p-4 text-left transition-all {formTravel ===
								'mm_required'
									? 'border-[#CC3300] bg-[#FF9900] text-white'
									: 'border-[#E6DFC7] bg-white text-slate-600 hover:-translate-y-1 hover:border-[#FF9900]'}"
							>
								<ShieldCheck size={24} />
								<span class="text-sm font-bold font-system">MM Required</span>
							</button>
						</div>
						<div class="flex justify-between pt-2">
							<Button variant="secondary" onclick={prevStep}>Back</Button>
							<Button variant="primary" onclick={nextStep}>Review Manifest</Button>
						</div>
					</div>
				</AcnhBubble>

			{:else if step === 4}
				<AcnhBubble
					title={dalStore.systemMode === 'DAL' ? 'Orville [Tour Guide]' : 'Luna [Dream Guide]'}
					dialogText="Here is your shipment manifest! Verify the quantities and items. If everything looks good, we'll clear you for the trading post."
					onDismiss={() => { playSound('beep'); handleClose(); }}
				>
					<div class="mt-4 relative z-10 pr-4 md:pr-10">
						{#if error}
							<div class="bg-red-50 text-red-600 border border-red-200 p-3 mb-4 rounded-xl text-sm font-bold font-system">
								{error}
							</div>
						{/if}

						<div class="bg-[#FAF8F2] p-4 rounded-2xl border-4 border-[#E6DFC7] flex flex-col gap-3 font-system max-h-[30vh] overflow-y-auto hide-scrollbar mb-4">
							{#if formFtItems.length > 0}
								<div>
									<span class="text-xs font-black text-emerald-600 uppercase tracking-wide block mb-1">For Trade [FT]:</span>
									<div class="flex flex-wrap gap-2">
										{#each formFtItems as item}
											<span class="font-bold text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 text-sm">
												{item.quantity && item.quantity != 1 ? `${item.quantity}x ` : ''}{item.name}
											</span>
										{/each}
									</div>
								</div>
							{:else}
								<div>
									<span class="text-xs font-black text-emerald-600 uppercase tracking-wide block mb-1">For Trade [FT]:</span>
									<span class="text-sm font-bold text-slate-400 italic">Nothing offered.</span>
								</div>
							{/if}

							<div class="w-full h-0.5 bg-slate-200 my-1"></div>

							{#if formLfItems.length > 0}
								<div>
									<span class="text-xs font-black text-sky-600 uppercase tracking-wide block mb-1">Looking For [LF]:</span>
									<div class="flex flex-wrap gap-2">
										{#each formLfItems as item}
											<span class="font-bold text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 text-sm">
												{item.quantity && item.quantity != 1 ? `${item.quantity}x ` : ''}{item.name}
											</span>
										{/each}
									</div>
								</div>
							{:else}
								<div>
									<span class="text-xs font-black text-sky-600 uppercase tracking-wide block mb-1">Looking For [LF]:</span>
									<span class="text-sm font-bold text-slate-400 italic">Nothing requested.</span>
								</div>
							{/if}

							<div class="w-full h-0.5 bg-slate-200 my-1"></div>

							<div class="flex items-center gap-3">
								<span class="text-xs font-black text-[#0084CC] uppercase tracking-wide">Logistics:</span>
								<span class="font-bold text-[#006094] bg-[#FFCC00] px-3 py-1 rounded-full text-xs uppercase tracking-wide border-2 border-[#CC9900]">
									{#if formTravel === 'will_travel'} I'll Travel {:else if formTravel === 'will_host'} I'll Host {:else if formTravel === 'flexible'} Flexible {:else} Middleman Required {/if}
								</span>
							</div>
						</div>

						<div class="flex justify-between pt-2">
							<Button variant="secondary" onclick={prevStep}>Make Changes</Button>
							<Button
								variant="primary"
								onclick={handleSubmit}
								disabled={isSubmitting || (formLfItems.length === 0 && formFtItems.length === 0)}
							>
								{isSubmitting ? 'Posting...' : 'Post Listing'}
							</Button>
						</div>
					</div>
				</AcnhBubble>
			{/if}
		</div>
	</div>
{/if}

<style>
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
