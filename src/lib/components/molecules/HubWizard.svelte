<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { GATE_THEMES, DREAM_THEMES } from '$lib/utils/constants';
	import AcnhBubble from '$lib/components/molecules/AcnhBubble.svelte';
	import Button from '$lib/components/atoms/Button.atom.svelte';
	import Input from '$lib/components/atoms/Input.atom.svelte';
	import Select from '$lib/components/atoms/Select.atom.svelte';
	import Textarea from '$lib/components/atoms/Textarea.atom.svelte';
	import { DIALOGS } from '$lib/constants/dialogs';
	import { playSound } from '$lib/utils/audio';
	import { Calendar, Clock, Plus, Trash2 } from '@lucide/svelte';
	import { dalStore } from '$lib/stores/dal.svelte';

	let {
		isOpen = false,
		onClose,
		formDodo = $bindable(''),
		formHemisphere = $bindable('Northern'),
		formGate = $bindable(1),
		formDesc = $bindable(''),
		formPlaneType = $bindable('Switch'),
		formMilesCost = $bindable(0),
		onSubmit,
		formError = '',
		isSubmittingHost = false,
		isMuted = false
	} = $props<{
		isOpen: boolean;
		onClose: () => void;
		formDodo?: string;
		formHemisphere?: string;
		formGate?: number;
		formDesc?: string;
		formPlaneType?: string;
		formMilesCost?: number;
		onSubmit: (e: SubmitEvent | Event) => void;
		formError?: string;
		isSubmittingHost?: boolean;
		isMuted?: boolean;
	}>();

	let step = $state(1);
	let pendingSchedules = $state<any[]>([]);

	// Scheduler state
	const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	let selectedDay = $state(days[new Date().getDay()]);
	let sliderStart = $state(40);
	let sliderEnd = $state(48);
	let actualStart = $derived(Math.min(sliderStart, sliderEnd));
	let actualEnd = $derived(Math.max(sliderStart, sliderEnd));

	function formatTime(val: number) {
		const h24 = Math.floor(val / 4);
		const m = (val % 4) * 15;
		const period = h24 < 12 || h24 === 24 ? 'AM' : 'PM';
		const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
		return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
	}

	let formStartTime = $derived(formatTime(actualStart));
	let formEndTime = $derived(formatTime(actualEnd));
	let activeSchedules = $derived(pendingSchedules.filter((s: any) => s.day === selectedDay));

	function handleAddScheduleLocal(e: Event) {
		e.preventDefault();
		if (!formStartTime || !formEndTime) return;
		pendingSchedules = [
			...pendingSchedules,
			{
				id: `tmp_${Date.now()}_${Math.random()}`,
				day: selectedDay,
				startTime: formStartTime,
				endTime: formEndTime,
				mode: dalStore.systemMode
			}
		];
		playSound('success', isMuted);
	}

	function handleDeleteScheduleLocal(id: string) {
		pendingSchedules = pendingSchedules.filter((s) => s.id !== id);
		playSound('beep', isMuted);
	}

	let wasOpen = false;
	$effect(() => {
		if (isOpen && !wasOpen) {
			step = dalStore.hubWizardInitialStep;
			pendingSchedules = dalStore.mySchedules || [];
		}
		wasOpen = isOpen;
	});

	const nextStep = () => {
		playSound('beep', isMuted);
		if (step < 5) step++;
	};

	const prevStep = () => {
		playSound('beep', isMuted);
		if (step > 1) step--;
	};

	const submitWizard = (e: Event) => {
		e.preventDefault();
		// Dispatch the custom event data via the event object or a store
		(e as any).pendingSchedules = pendingSchedules;
		onSubmit(e);
	};
</script>

{#if isOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-[100] flex flex-col justify-end p-4 pb-8 sm:p-8 bg-[#006094]/60 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
	>
		<div transition:fly={{ y: 50, duration: 300 }} class="w-full">
			{#if step === 1}
				<AcnhBubble
					title={dalStore.systemMode === 'DAL' ? 'Wilbur' : 'Luna'}
					dialogText={dalStore.systemMode === 'DAL'
						? DIALOGS.hubWizard.step1
						: DIALOGS.hubWizard.lunaStep1}
					onDismiss={() => {
						playSound('beep', isMuted);
						onClose();
					}}
				>
					<div class="mt-4 space-y-4 relative z-10 pr-4 md:pr-10">
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<div>
								<label
									class="block text-xs font-system font-black {dalStore.systemMode === 'DAL'
										? 'text-[#0084CC]'
										: 'text-[#DDA0DD]'} mb-1.5 uppercase tracking-wider">HEMISPHERE</label
								>
								<Select
									bind:value={formHemisphere}
									class="w-full bg-white border-[#E6DFC7] border-4 rounded-xl px-3 py-2 font-bold outline-none focus:border-[#0084CC] text-[#4A4A4A]"
								>
									<option value="Northern">Northern</option>
									<option value="Southern">Southern</option>
								</Select>
							</div>
							<div>
								<label
									class="block text-xs font-system font-black {dalStore.systemMode === 'DAL'
										? 'text-[#0084CC]'
										: 'text-[#DDA0DD]'} mb-1.5 uppercase tracking-wider"
									>{dalStore.systemMode === 'DAL' ? 'SEAPLANE MODEL' : 'DREAM BED MODEL'}</label
								>
								<Select
									bind:value={formPlaneType}
									class="w-full bg-white border-[#E6DFC7] border-4 rounded-xl px-3 py-2 font-bold outline-none focus:border-[#0084CC] text-[#4A4A4A]"
								>
									{#if dalStore.systemMode === 'DAL'}
										<option value="Switch">🛩️ Switch Model (8 seats)</option>
										<option value="Switch 2">✈️ Switch 2 Model (12 seats)</option>
									{:else}
										<option value="Switch">🛏️ Switch Bed (8 dreamers)</option>
										<option value="Switch 2">🛌 Switch 2 Bed (12 dreamers)</option>
									{/if}
								</Select>
							</div>
						</div>

						<div class="flex justify-end pt-2">
							<Button variant="primary" onclick={nextStep}>Next Step</Button>
						</div>
					</div>
				</AcnhBubble>
			{:else if step === 2}
				<AcnhBubble
					title={dalStore.systemMode === 'DAL' ? 'Wilbur' : 'Luna'}
					dialogText={dalStore.systemMode === 'DAL'
						? DIALOGS.hubWizard.step2
						: DIALOGS.hubWizard.lunaStep2}
					onDismiss={() => {
						playSound('beep', isMuted);
						onClose();
					}}
				>
					<div
						class="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3 relative z-10 pr-4 md:pr-10 max-h-60 overflow-y-auto hide-scrollbar"
					>
						{#each Object.entries(dalStore.systemMode === 'DAL' ? GATE_THEMES : DREAM_THEMES) as [num, theme]}
							<button
								type="button"
								onclick={() => {
									formGate = Number(num);
									nextStep();
								}}
								class="py-3 px-2 rounded-2xl border-4 transition-all text-center flex flex-col items-center justify-center cursor-pointer {formGate ===
								Number(num)
									? 'bg-[#FFCC00] border-[#0084CC] text-[#006094]'
									: 'bg-white border-slate-200 text-slate-600 hover:border-[#FFCC00] hover:-translate-y-1'}"
							>
								<span class="text-3xl mb-2">{theme.icon}</span>
								<span class="text-xs font-bold font-system leading-tight">{theme.name}</span>
							</button>
						{/each}
					</div>
					<div class="mt-4 flex justify-between relative z-10 pr-4 md:pr-10">
						<Button variant="secondary" onclick={prevStep}>Back</Button>
					</div>
				</AcnhBubble>
			{:else if step === 3}
				<AcnhBubble
					title={dalStore.systemMode === 'DAL' ? 'Wilbur' : 'Luna'}
					dialogText={dalStore.systemMode === 'DAL'
						? DIALOGS.hubWizard.step3
						: DIALOGS.hubWizard.lunaStep3}
					onDismiss={() => {
						playSound('beep', isMuted);
						onClose();
					}}
				>
					<div class="mt-4 space-y-4 relative z-10 pr-4 md:pr-10">
						<Textarea
							bind:value={formDesc}
							placeholder={dalStore.systemMode === 'DAL'
								? 'e.g. Turnips buying for 450! Celeste is near the airport dock. Free DIY card swap on the beach.'
								: "e.g. Come explore my cottagecore dreamscape! Let's build a new garden area together."}
							class="w-full bg-white border-4 border-[#E6DFC7] rounded-2xl px-4 py-3 font-system font-semibold text-[#4A4A4A] outline-none focus:border-[#0084CC] h-24 resize-none text-sm"
							maxlength={180}
						/>
						<div class="flex justify-between pt-2">
							<Button variant="secondary" onclick={prevStep}>Back</Button>
							<Button variant="primary" onclick={nextStep}>Final Step</Button>
						</div>
					</div>
				</AcnhBubble>
			{:else if step === 4}
				<AcnhBubble
					title={dalStore.systemMode === 'DAL' ? 'Wilbur' : 'Luna'}
					dialogText={dalStore.systemMode === 'DAL'
						? DIALOGS.hubWizard.step4
						: DIALOGS.hubWizard.lunaStep4}
					onDismiss={() => {
						playSound('beep', isMuted);
						onClose();
					}}
				>
					<div class="mt-4 space-y-4 relative z-10 pr-4 md:pr-10">
						{#if formError}
							<div
								class="bg-red-50 text-red-600 border border-red-200 p-3 rounded-xl text-sm font-bold font-system"
							>
								{formError}
							</div>
						{/if}

						<div class="flex flex-col items-center gap-4 my-4">
							<div class="w-full max-w-[800px]">
								<label
									class="block text-xs font-system font-black {dalStore.systemMode === 'DAL'
										? 'text-[#0084CC]'
										: 'text-[#DDA0DD]'} mb-1.5 uppercase tracking-wider text-center"
								>
									{dalStore.systemMode === 'DAL' ? 'DODO CODE' : 'DOZE CODE'}
								</label>
								<Input
									type="text"
									bind:value={formDodo}
									placeholder="e.g. D0D01 (Leave blank to schedule)"
									class="w-full bg-white border-4 border-[#E6DFC7] rounded-2xl px-4 py-3 font-system font-black tracking-widest text-center text-sm sm:text-lg uppercase outline-none focus:border-[#0084CC] text-[#0084CC]"
									maxlength={5}
								/>
							</div>
							<div class="w-full max-w-[800px]">
								<label
									class="block text-xs font-system font-black {dalStore.systemMode === 'DAL'
										? 'text-[#0084CC]'
										: 'text-[#DDA0DD]'} mb-1.5 uppercase tracking-wider text-center"
									>{dalStore.systemMode === 'DAL'
										? 'FF MILES COST TO REVEAL CODE'
										: 'FF MILES COST TO REVEAL DOZE'}</label
								>
								<Input
									type="number"
									bind:value={formMilesCost}
									placeholder="0"
									min="0"
									max="10000"
									class="w-full bg-white border-4 border-[#E6DFC7] rounded-2xl px-4 py-3 font-system font-black tracking-widest text-center text-sm sm:text-lg outline-none focus:border-[#0084CC] text-[#4A4A4A]"
								/>
								<p class="text-xs text-center text-slate-500 mt-2 font-medium">
									{dalStore.systemMode === 'DAL'
										? 'Price your reveal. Passengers must spend these miles to reveal your gate code. You earn the miles they spend! The higher the cost, the higher quality / more trusted vistors.'
										: 'Price your reveal. Dreamers must spend these miles to reveal your DOZE code. You earn the miles they spend!'}
								</p>
							</div>
						</div>

						<div class="flex justify-between pt-2">
							<Button variant="secondary" onclick={prevStep}>Make Changes</Button>
							{#if formDodo.trim().length === 5}
								<Button variant="primary" onclick={submitWizard} disabled={isSubmittingHost}>
									{isSubmittingHost
										? dalStore.systemMode === 'DAL'
											? 'Dispatching...'
											: 'Connecting...'
										: dalStore.systemMode === 'DAL'
											? 'Open Gate Now!'
											: 'Open Dream Now!'}
								</Button>
							{:else}
								<Button variant="primary" onclick={nextStep}>No, let's set a schedule</Button>
							{/if}
						</div>
					</div>
				</AcnhBubble>
			{:else if step === 5}
				<AcnhBubble
					title={dalStore.systemMode === 'DAL' ? 'Wilbur' : 'Luna'}
					dialogText={dalStore.systemMode === 'DAL'
						? DIALOGS.hubWizard.step5
						: DIALOGS.hubWizard.lunaStep5}
					onDismiss={() => {
						playSound('beep', isMuted);
						onClose();
					}}
				>
					<div class="mt-4 space-y-4 relative z-10 pr-4 md:pr-10 text-left">
						<!-- Week Slider -->
						<div class="flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
							{#each days as day}
								{@const hasSchedule = pendingSchedules.some((s: any) => s.day === day)}
								<button
									onclick={() => {
										playSound('beep', isMuted);
										selectedDay = day;
									}}
									class="relative flex-shrink-0 px-3 py-2 rounded-2xl font-system font-black tracking-wide text-[10px] transition-all border-b-4 cursor-pointer font-bold select-none
                  {selectedDay === day
										? dalStore.systemMode === 'DAL'
											? 'bg-[#FFCC00] text-[#006094] border-[#CC9900] translate-y-0.5 !border-b-2'
											: 'bg-[#DDA0DD] text-[#4B0082] border-[#ba80ba] translate-y-0.5 !border-b-2'
										: 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50 hover:-translate-y-0.5'}"
								>
									{day}
									{#if hasSchedule}
										<span
											class="absolute top-1 right-1 w-1.5 h-1.5 rounded-full {selectedDay === day
												? dalStore.systemMode === 'DAL'
													? 'bg-[#006094]'
													: 'bg-[#4B0082]'
												: dalStore.systemMode === 'DAL'
													? 'bg-[#0084CC]'
													: 'bg-[#DDA0DD]'}"
										></span>
									{/if}
								</button>
							{/each}
						</div>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<!-- Add Form -->
							<div class="bg-white rounded-2xl p-3 border-2 border-slate-100 shadow-sm">
								<form onsubmit={handleAddScheduleLocal} class="space-y-4">
									<div
										style="--thumb-color: {dalStore.systemMode === 'DAL' ? '#0084CC' : '#4B0082'};"
									>
										<div class="flex justify-between items-end mb-2">
											<span
												class="text-xs font-black {dalStore.systemMode === 'DAL'
													? 'text-[#0084CC]'
													: 'text-[#4B0082]'}">{formStartTime} - {formEndTime}</span
											>
										</div>
										<div class="relative w-full h-6 flex items-center">
											<div
												class="absolute w-full h-2 bg-slate-100 border border-slate-200 rounded-full shadow-inner"
											></div>
											<div
												class="absolute h-2 {dalStore.systemMode === 'DAL'
													? 'bg-[#FFCC00] border-[#CC9900]'
													: 'bg-[#DDA0DD] border-[#ba80ba]'} border rounded-full transition-all duration-75"
												style="left: {(actualStart / 96) * 100}%; right: {100 -
													(actualEnd / 96) * 100}%;"
											></div>
											<input
												type="range"
												min="0"
												max="96"
												bind:value={sliderStart}
												class="multi-range absolute w-full appearance-none bg-transparent pointer-events-none z-10"
											/>
											<input
												type="range"
												min="0"
												max="96"
												bind:value={sliderEnd}
												class="multi-range absolute w-full appearance-none bg-transparent pointer-events-none z-20"
											/>
										</div>
									</div>
									<button
										type="submit"
										class="w-full {dalStore.systemMode === 'DAL'
											? 'bg-[#FFCC00] hover:bg-[#FFD11A] text-[#006094] border-[#CC9900]'
											: 'bg-[#DDA0DD] hover:bg-[#e8b5e8] text-[#4B0082] border-[#ba80ba]'} font-system font-black py-2 rounded-xl border-b-4 shadow transition-all uppercase tracking-wide text-[10px] cursor-pointer flex items-center justify-center gap-1"
									>
										<Plus class="w-3 h-3" /> Register Hours
									</button>
								</form>
							</div>

							<!-- List -->
							<div
								class="bg-slate-50 rounded-2xl p-3 border-2 border-slate-100 max-h-32 overflow-y-auto hide-scrollbar"
							>
								{#if activeSchedules.length === 0}
									<p class="text-[10px] text-center text-slate-400 font-system font-bold pt-4">
										No hours for {selectedDay}
									</p>
								{:else}
									<div class="space-y-2">
										{#each activeSchedules as schedule}
											<div
												class="flex items-center justify-between bg-white border border-slate-200 p-2 rounded-xl"
											>
												<span class="font-system font-black text-slate-700 text-[10px]"
													>{schedule.startTime} - {schedule.endTime}</span
												>
												<button
													type="button"
													onclick={() => handleDeleteScheduleLocal(schedule.id)}
													class="text-red-500 hover:scale-110 transition-transform cursor-pointer border-none bg-transparent"
													title="Remove"
												>
													<Trash2 class="w-3 h-3" />
												</button>
											</div>
										{/each}
									</div>
								{/if}
							</div>
						</div>

						<div class="flex justify-between pt-2">
							<Button variant="secondary" onclick={prevStep}>Back</Button>
							<Button variant="primary" onclick={submitWizard} disabled={isSubmittingHost}>
								{isSubmittingHost
									? dalStore.systemMode === 'DAL'
										? 'Dispatching...'
										: 'Connecting...'
									: dalStore.systemMode === 'DAL'
										? 'Complete Flight Plan'
										: 'Complete Dream Plan'}
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

	.multi-range::-webkit-slider-thumb {
		pointer-events: auto;
		-webkit-appearance: none;
		appearance: none;
		width: 16px;
		height: 16px;
		background-color: white;
		border: 3px solid var(--thumb-color, #0084cc);
		border-radius: 50%;
		cursor: grab;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition: transform 0.1s;
	}
	.multi-range::-webkit-slider-thumb:active {
		cursor: grabbing;
		transform: scale(1.15);
	}

	.multi-range::-moz-range-thumb {
		pointer-events: auto;
		appearance: none;
		width: 16px;
		height: 16px;
		background-color: white;
		border: 3px solid var(--thumb-color, #0084cc);
		border-radius: 50%;
		cursor: grab;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition: transform 0.1s;
	}
	.multi-range::-moz-range-thumb:active {
		cursor: grabbing;
		transform: scale(1.15);
	}
</style>
