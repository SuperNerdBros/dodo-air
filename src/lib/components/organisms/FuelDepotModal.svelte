<script lang="ts">
	import { PenLine, MessageSquare, Banknote, Heart } from '@lucide/svelte';
	import { dalStore } from '$lib/stores/dal.svelte.ts';
	import { scale, fade } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import AcnhBubble from '../molecules/AcnhBubble.svelte';
	import { DIALOGS } from '$lib/constants/dialogs';

	let {
		isOpen = false,
		onClose,
		aiFuel,
		isMuted = false,
		isRefueling = false,
		onRefuel
	} = $props<{
		isOpen: boolean;
		onClose: () => void;
		aiFuel: { aiTokens: number; maxTokens: number };
		isMuted?: boolean;
		isRefueling?: boolean;
		onRefuel: (amount: number) => void;
	}>();

	let dialogStep = $state(0);
	let isTextDone = $state(false);
	let showQuickPay = $state(false);

	$effect(() => {
		// Reset step when opened
		if (isOpen) {
			dialogStep = 0;
			showQuickPay = false;
			dalStore.playSound(dalStore.systemMode === 'DAL' ? 'success' : 'bell');
		}
	});

	function handleRefuelAction(type: 'cash' | 'venmo') {
		if (type === 'cash') {
			window.open('https://cash.app/$XopherDeeP', '_blank', 'noopener,noreferrer');
		} else {
			window.open('https://venmo.com/u/xopherdeep', '_blank', 'noopener,noreferrer');
		}
		dalStore.playSound('success');
		onRefuel(5000);
		dialogStep = 3; // Move to Thank You step
	}

	function advanceDialog() {
		dalStore.playSound('beep');
		if (dialogStep === 2 || dialogStep === 3) {
			onClose();
		} else {
			dialogStep++;
		}
	}

	let fuelPercentage = $derived(Math.min(100, (aiFuel.aiTokens / aiFuel.maxTokens) * 100));

	let currentTitle = $derived(dalStore.systemMode === 'DAL' ? 'Wilbur' : 'Luna');

	let currentDialogText = $derived.by(() => {
		if (dalStore.systemMode === 'DAL') {
			if (dialogStep === 0) return DIALOGS.fuelDepot.wilburIntro;
			if (dialogStep === 1) return DIALOGS.fuelDepot.wilburMetrics;
			if (dialogStep === 3) return DIALOGS.fuelDepot.wilburThankYou;
			return DIALOGS.fuelDepot.wilburRefuel;
		} else {
			if (dialogStep === 0) return DIALOGS.fuelDepot.lunaIntro;
			if (dialogStep === 1) return DIALOGS.fuelDepot.lunaMetrics;
			if (dialogStep === 3) return DIALOGS.fuelDepot.lunaThankYou;
			return DIALOGS.fuelDepot.lunaRefuel;
		}
	});
</script>

<svelte:window onclick={() => { showQuickPay = false; }} />

{#if isOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 bg-[#006094]/60 backdrop-blur-md flex flex-col items-center justify-center p-4 z-50"
		transition:fade={{ duration: 200 }}
	>
		<div class="w-full max-w-4xl flex flex-col gap-6 pb-48 sm:pb-56 relative z-10">
			<!-- Fuel Reserve Core -->
			{#if dialogStep >= 0}
				<div
					in:scale={{ duration: 300, start: 0.95, easing: backOut }}
					class="bg-gradient-to-b from-[#FFFCEF]/95 to-[#FFFCEF]/90 p-8 rounded-[32px] border-4 border-[#FFEAA7] shadow-2xl flex flex-col gap-6 pointer-events-auto"
				>
					<!-- Tank Header -->
					<div
						class="flex justify-between items-end font-system border-b-2 border-amber-200/50 pb-3"
					>
						<div class="flex items-center gap-3">
							<span class="text-3xl drop-shadow-sm"
								>{dalStore.systemMode === 'DAL' ? '⛽' : '💨'}</span
							>
							<div>
								<h3 class="text-lg font-black text-amber-900 uppercase tracking-tight">
									{dalStore.systemMode === 'DAL' ? 'MAIN STORAGE TANK' : 'ASTRAL INCENSE RESERVE'}
								</h3>
								<span
									class="text-xs font-bold text-amber-600 block uppercase tracking-widest opacity-90"
								>
									{dalStore.systemMode === 'DAL'
										? 'DAL Community Power Station'
										: 'Collective Unconscious Generator'}
								</span>
							</div>
						</div>
						<div class="text-right">
							<span
								class="text-2xl font-black {dalStore.systemMode === 'DAL'
									? 'text-[#0084CC]'
									: 'text-purple-600'}"
							>
								{aiFuel.aiTokens.toLocaleString()}
							</span>
							<span class="text-base font-bold text-slate-400">
								/ {aiFuel.maxTokens.toLocaleString()}
								{dalStore.systemMode === 'DAL' ? 'GAL' : 'INC'}
							</span>
						</div>
					</div>

					<!-- Tank Wrapper -->
					<div class="relative w-full">
						<!-- The Glass Cylinder Tank -->
						<div
							class="relative w-full h-16 bg-[#E6DFC7]/40 rounded-full overflow-hidden border-[6px] border-white shadow-[inset_0_4px_12px_rgba(0,0,0,0.1)] flex items-center"
						>
							<!-- Active Fill -->
							<div
								class="h-full transition-all duration-1000 ease-out relative shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)] pointer-events-none {fuelPercentage <
								20
									? 'bg-gradient-to-r from-red-500 to-orange-500'
									: fuelPercentage < 50
										? 'bg-gradient-to-r from-amber-500 to-[#FFCC00]'
										: 'bg-gradient-to-r from-emerald-500 to-[#00D632]'}"
								style="width: {fuelPercentage}%;"
							>
								<!-- Liquid shine effect -->
								<div class="absolute inset-0 bg-white/20 animate-pulse"></div>
								<div
									class="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent"
								></div>
							</div>

							<!-- Empty Tank Background Shine -->
							<div
								class="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent pointer-events-none"
							></div>

							<!-- Glass Reflections / Gauge Marks -->
							<div class="absolute top-0 bottom-0 left-1/4 w-1.5 bg-white/60 shadow-sm z-10 pointer-events-none"></div>
							<div class="absolute top-0 bottom-0 left-2/4 w-1.5 bg-white/60 shadow-sm z-10 pointer-events-none"></div>
							<div class="absolute top-0 bottom-0 left-3/4 w-1.5 bg-white/60 shadow-sm z-10 pointer-events-none"></div>

							<!-- Interactive Empty Area -->
							{#if fuelPercentage < 100}
								<button
									class="absolute top-0 bottom-0 right-0 z-20 group flex items-center justify-center cursor-pointer transition-all hover:bg-white/40 active:bg-white/50 focus:outline-none border-none bg-transparent"
									style="width: {100 - fuelPercentage}%; left: {fuelPercentage}%;"
									onclick={(e) => {
										e.stopPropagation();
										showQuickPay = !showQuickPay;
										dalStore.playSound('bell');
									}}
									aria-label="Quick Refuel"
								>
									<!-- Animated diagonal stripes on hover -->
									<div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 20px);"></div>
									
									<span class="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0 font-system font-black text-amber-900/60 text-xs sm:text-sm tracking-widest uppercase drop-shadow-sm flex items-center gap-1.5 sm:gap-2">
										<Heart class="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse text-amber-600/80" />
										<span class="hidden sm:inline">Tap to</span> Refuel
									</span>
								</button>
							{/if}
						</div>

						<!-- Quick Pay Popover -->
						{#if showQuickPay}
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div
								class="absolute z-30 top-[-100px] bg-white/95 backdrop-blur-xl border-[3px] border-amber-200 shadow-2xl rounded-2xl p-3 flex gap-3"
								style="left: {Math.max(20, Math.min(80, fuelPercentage + (100 - fuelPercentage)/2))}%; transform: translateX(-50%);"
								in:scale={{ duration: 400, easing: backOut }}
								out:fade={{ duration: 200 }}
								onclick={(e) => e.stopPropagation()}
							>
								<!-- Arrow -->
								<div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/95 border-r-[3px] border-b-[3px] border-amber-200 rotate-45"></div>
								
								<button
									onclick={() => { handleRefuelAction('venmo'); showQuickPay = false; }}
									class="flex flex-col items-center gap-2 text-[#0070cc] hover:text-[#005a9c] hover:bg-[#0070cc]/10 p-3 rounded-xl transition-all active:scale-95 font-system font-black text-sm uppercase tracking-tight bg-transparent border-none cursor-pointer"
								>
									<div class="bg-blue-50/50 p-2 rounded-full shadow-inner"><Heart class="w-5 h-5" /></div>
									Venmo
								</button>
								<button
									onclick={() => { handleRefuelAction('cash'); showQuickPay = false; }}
									class="flex flex-col items-center gap-2 text-[#00b029] hover:text-[#008f21] hover:bg-[#00b029]/10 p-3 rounded-xl transition-all active:scale-95 font-system font-black text-sm uppercase tracking-tight bg-transparent border-none cursor-pointer"
								>
									<div class="bg-green-50/50 p-2 rounded-full shadow-inner"><Banknote class="w-5 h-5" /></div>
									CashApp
								</button>
							</div>
						{/if}
					</div>

					<!-- Inline Metrics Footer -->
					<div class="flex flex-wrap items-center justify-between gap-4 pt-2">
						<span
							class="text-sm font-system font-black text-amber-700/70 uppercase tracking-widest flex items-center gap-2"
						>
							<div class="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse"></div>
							Active Drain Systems
						</span>

						<div class="flex items-center gap-3">
							<div
								class="flex items-center gap-2 bg-sky-50 text-sky-700 px-4 py-2 rounded-full font-black text-xs uppercase border border-sky-200/60 shadow-sm"
							>
								<PenLine class="w-4 h-4" /> -300 {dalStore.systemMode === 'DAL' ? 'GAL' : 'INC'}
								<span class="opacity-60 font-semibold lowercase">/ review</span>
							</div>
							<div
								class="flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full font-black text-xs uppercase border border-teal-200/60 shadow-sm"
							>
								<MessageSquare class="w-4 h-4" /> -150 {dalStore.systemMode === 'DAL'
									? 'GAL'
									: 'INC'}
								<span class="opacity-60 font-semibold lowercase">/ reply</span>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Character Dialog (Fixed to Bottom) -->
		<div class="fixed bottom-0 left-0 right-0 p-4 sm:p-8 pointer-events-none" style="z-index: 110;">
			<div class="mx-auto w-full max-w-5xl pointer-events-auto">
				<AcnhBubble
					title={currentTitle}
					dialogText={currentDialogText}
					onDismiss={advanceDialog}
					bind:textDone={isTextDone}
				>
					{#if dialogStep === 2 && isTextDone}
						<div class="flex justify-center items-center gap-3 mt-3" in:fade={{ duration: 400 }}>
							<button
								onclick={() => handleRefuelAction('venmo')}
								disabled={isRefueling}
								class="flex items-center gap-1.5 text-[#0070cc] hover:text-[#005a9c] font-system font-bold text-sm sm:text-base transition-colors active:scale-95 cursor-pointer bg-transparent border-none"
							>
								<Heart class="w-4 h-4 sm:w-5 sm:h-5" />
								Venmo {dalStore.systemMode === 'DAL' ? 'Refuel' : 'Reignite'}
							</button>
							<button
								onclick={() => handleRefuelAction('cash')}
								disabled={isRefueling}
								class="flex items-center gap-1.5 text-[#00b029] hover:text-[#008f21] font-system font-bold text-sm sm:text-base transition-colors active:scale-95 cursor-pointer bg-transparent border-none"
							>
								<Banknote class="w-4 h-4 sm:w-5 sm:h-5" />
								CashApp {dalStore.systemMode === 'DAL' ? 'Refuel' : 'Reignite'}
							</button>
						</div>
					{/if}
				</AcnhBubble>
			</div>
		</div>
	</div>
{/if}
