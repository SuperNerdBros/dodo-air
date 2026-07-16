<script lang="ts">
	import { dalStore } from '$lib/stores/dal.svelte.ts';
	import { tradeStore } from '$lib/stores/trade.svelte.ts';
	import { DIALOGS } from '$lib/constants/dialogs';
	import AcnhBubble from '$lib/components/molecules/AcnhBubble.svelte';
	import { ShieldCheck, ShieldAlert, CheckCircle, Plane, X } from '@lucide/svelte';

	let { isMuted = false } = $props<{ isMuted?: boolean }>();

	type Step =
		| 'mmRequest'
		| 'mmAssigned'
		| 'mmAwaitingCode'
		| 'mmInTransit'
		| 'mmDepositing'
		| 'mmVerifying'
		| 'mmDistributing'
		| 'mmCompleted';

	// The dialogue steps dynamically map to the session status if it's an MM trade
	let session = $derived(tradeStore.activeSession);
	
	let currentStep = $derived<Step>(() => {
		if (!session) return 'mmRequest';
		if (!session.middlemanId) return 'mmRequest'; // Fallback if no MM
		
		switch (session.status) {
			case 'awaiting_code':
				return 'mmAwaitingCode';
			case 'in_transit':
				return 'mmInTransit';
			case 'depositing':
				return 'mmDepositing';
			case 'verifying':
				return 'mmVerifying';
			case 'distributing':
				return 'mmDistributing';
			case 'completed':
				return 'mmCompleted';
			default:
				return 'mmAssigned';
		}
	});

	let typedText = $state('');
	let textDone = $state(false);
	let textTimer: ReturnType<typeof setInterval> | null = null;
	
	// Track previous step to trigger re-type
	let previousStep = $state<Step | null>(null);

	let dialogues = $derived<Record<Step, string>>({
		mmRequest: dalStore.systemMode === 'DAL' ? DIALOGS.interactiveTrade.mmRequest : DIALOGS.interactiveTrade.lunaMmRequest,
		mmAssigned: dalStore.systemMode === 'DAL' ? DIALOGS.interactiveTrade.mmAssigned : DIALOGS.interactiveTrade.lunaMmAssigned,
		mmAwaitingCode: dalStore.systemMode === 'DAL' ? DIALOGS.interactiveTrade.mmAwaitingCode : DIALOGS.interactiveTrade.lunaMmAwaitingCode,
		mmInTransit: dalStore.systemMode === 'DAL' ? DIALOGS.interactiveTrade.mmInTransit : DIALOGS.interactiveTrade.lunaMmInTransit,
		mmDepositing: dalStore.systemMode === 'DAL' ? DIALOGS.interactiveTrade.mmDepositing : DIALOGS.interactiveTrade.lunaMmDepositing,
		mmVerifying: dalStore.systemMode === 'DAL' ? DIALOGS.interactiveTrade.mmVerifying : DIALOGS.interactiveTrade.lunaMmVerifying,
		mmDistributing: dalStore.systemMode === 'DAL' ? DIALOGS.interactiveTrade.mmDistributing : DIALOGS.interactiveTrade.lunaMmDistributing,
		mmCompleted: dalStore.systemMode === 'DAL' ? DIALOGS.interactiveTrade.mmCompleted : DIALOGS.interactiveTrade.lunaMmCompleted
	});

	$effect(() => {
		const step = currentStep();
		if (step !== previousStep) {
			previousStep = step;
			startTypewriter(dialogues[step]);
		}
	});

	function startTypewriter(fullText: string) {
		if (textTimer) clearInterval(textTimer);
		typedText = '';
		textDone = false;
		let idx = 0;

		textTimer = setInterval(() => {
			if (idx < fullText.length) {
				typedText += fullText[idx];
				idx++;
				if (!isMuted && fullText[idx - 1] !== ' ' && idx % 2 === 0) {
					dalStore.playSound('chatter');
				}
			} else {
				if (textTimer) clearInterval(textTimer);
				textDone = true;
			}
		}, 22);
	}

	function advanceTypewriter() {
		if (!textDone && previousStep) {
			if (textTimer) clearInterval(textTimer);
			typedText = dialogues[previousStep];
			textDone = true;
			dalStore.playSound('beep');
		}
	}
	
	// MOCK MM ADVANCE
	function mockAdvanceSession() {
		if (!session) return;
		if (session.status === 'awaiting_code') session.status = 'in_transit';
		else if (session.status === 'in_transit') session.status = 'depositing';
		else if (session.status === 'depositing') session.status = 'verifying';
		else if (session.status === 'verifying') session.status = 'distributing';
		else if (session.status === 'distributing') session.status = 'completed';
		else if (session.status === 'completed') tradeStore.closeSession();
	}
</script>

{#if session}
	<div class="fixed inset-0 z-50 flex flex-col items-center justify-start overflow-y-auto bg-slate-900/80 p-4 pt-12 backdrop-blur-sm sm:justify-center sm:p-8">
		
		<!-- Background Elements -->
		<div class="pointer-events-none absolute inset-0 h-full w-full opacity-50"></div>

		<!-- Main Content Area (Floating Above Bubble) -->
		<div class="relative z-10 w-full max-w-4xl pb-48 sm:pb-56">
			<!-- The Status Card -->
			<div class="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-white/20 bg-slate-800/90 shadow-2xl backdrop-blur-md">
				
				<!-- Header -->
				<div class="flex items-center justify-between border-b border-white/10 bg-black/20 px-6 py-4">
					<div class="flex items-center gap-3">
						{#if session.middlemanId}
							<ShieldCheck class="text-amber-500" size={24} />
							<h2 class="text-xl font-bold text-white">Verified MM Session</h2>
						{:else}
							<Plane class="text-sky-400" size={24} />
							<h2 class="text-xl font-bold text-white">Private Trade Session</h2>
						{/if}
					</div>
					<button 
						onclick={() => tradeStore.closeSession()} 
						class="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
					>
						<X size={20} />
					</button>
				</div>

				<!-- Session Status / Progress -->
				<div class="p-6">
					{#if session.middlemanId}
						<div class="rounded-xl border border-white/10 bg-black/20 p-6">
							<div class="mb-6 flex items-center justify-between border-b border-white/10 pb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
								<span>Status: {session.status.replace('_', ' ')}</span>
								<span class="text-sky-400">ID: {session.id}</span>
							</div>
							
							<!-- Mock Next Button to test flow -->
							<div class="flex justify-center">
								<button 
									onclick={mockAdvanceSession}
									class="rounded-xl bg-emerald-600 px-8 py-3 text-lg font-black uppercase tracking-wide text-white shadow-lg transition-all hover:scale-105 hover:bg-emerald-500 active:scale-95"
								>
									{session.status === 'completed' ? 'Finish Exchange' : 'Advance Trade (Demo)'}
								</button>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>

	</div>

	<!-- Fixed Bottom ACNH Bubble (Outside the Modal container to break stacking context) -->
	<div class="pointer-events-none fixed bottom-0 left-0 right-0 p-4 sm:p-8" style="z-index: 110;">
		<div class="pointer-events-auto mx-auto w-full max-w-7xl">
			<AcnhBubble 
				title={dalStore.systemMode === 'DAL' ? 'Orville' : 'Luna'} 
				isIntro={true} 
				onDismiss={advanceTypewriter}
			>
				<div class="relative z-10 flex items-start gap-4">
					<div class="hidden shrink-0 -rotate-6 transform items-center justify-center rounded-full border-[3px] border-[#666] bg-[#333] text-4xl shadow-inner sm:flex sm:h-16 sm:w-16">
						{dalStore.systemMode === 'DAL' ? '🦤' : '🌙'}
					</div>
					<div class="flex-1 py-1">
						<p class="min-h-[3.6rem] text-xl font-medium leading-snug text-[#807256] sm:text-2xl">
							{typedText}
							{#if !textDone}
								<span class="ml-0.5 inline-block h-5 w-1.5 animate-pulse bg-[#807256]"></span>
							{/if}
						</p>
					</div>
				</div>
			</AcnhBubble>
		</div>
	</div>
{/if}
