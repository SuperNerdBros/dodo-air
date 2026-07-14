<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { GATE_THEMES } from '$lib/utils/constants';
  import AcnhBubble from '$lib/components/molecules/AcnhBubble.svelte';
  import Button from '$lib/components/atoms/Button.atom.svelte';
  import { DIALOGS } from '$lib/constants/dialogs';
  import { playSound } from '$lib/utils/audio';
  import { dalStore } from '$lib/stores/dal.svelte';

  let {
    isOpen = false,
    onClose,
    requestGateType = $bindable(1),
    requestTime = $bindable('Online Now'),
    requestMemo = $bindable(''),
    onSubmit,
    requestError = '',
    isSubmittingRequest = false,
    isMuted = false
  } = $props<{
    isOpen: boolean;
    onClose: () => void;
    requestGateType?: number;
    requestTime?: string;
    requestMemo?: string;
    onSubmit: (e: SubmitEvent | Event) => void;
    requestError?: string;
    isSubmittingRequest?: boolean;
    isMuted?: boolean;
  }>();

  let step = $state(1);

  let wasOpen = false;
  $effect(() => {
    if (isOpen && !wasOpen) {
      step = 1;
    }
    wasOpen = isOpen;
  });

  const nextStep = () => {
    playSound('beep', isMuted);
    if (step < 4) step++;
  };

  const prevStep = () => {
    playSound('beep', isMuted);
    if (step > 1) step--;
  };

  const submitWizard = (e: Event) => {
    e.preventDefault();
    onSubmit(e);
  };

  // Step 2 specific logic
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let selectedDay = $state(days[new Date().getDay()]);
  
  let currentMinBlock = $derived.by(() => {
    if (selectedDay === days[new Date().getDay()]) {
      const now = new Date();
      return Math.floor((now.getHours() * 60 + now.getMinutes()) / 15);
    }
    return 0;
  });

  let sliderStart = $state(Math.max(40, new Date().getHours() * 4)); // Default to roughly now or 10:00 AM
  let sliderEnd = $state(Math.max(48, new Date().getHours() * 4 + 8)); // Default +2 hours

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

  $effect(() => {
    requestTime = `${selectedDay} ${formStartTime} - ${formEndTime}`;
  });

  $effect(() => {
    if (sliderStart < currentMinBlock) sliderStart = currentMinBlock;
    if (sliderEnd < currentMinBlock) sliderEnd = currentMinBlock;
  });
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="fixed inset-0 z-[100] flex flex-col justify-end p-4 pb-8 sm:p-8 bg-[#006094]/60 backdrop-blur-sm" transition:fade={{ duration: 200 }}>
    <div transition:fly={{ y: 50, duration: 300 }} class="w-full">
      {#if step === 1}
        <AcnhBubble
          title={dalStore.systemMode === 'DAL' ? "Orville [Tour Guide]" : "Luna [Dream Guide]"}
          dialogText={dalStore.systemMode === 'DAL' ? DIALOGS.standbyWizard.step1 : DIALOGS.standbyWizard.lunaStep1}
          onDismiss={() => { playSound('beep', isMuted); onClose(); }}
        >
          <div class="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3 relative z-10 pr-4 md:pr-10">
            {#each Object.entries(GATE_THEMES) as [num, theme]}
              <button
                type="button"
                onclick={() => { requestGateType = Number(num); nextStep(); }}
                class="py-3 px-2 rounded-2xl border-4 transition-all text-center flex flex-col items-center justify-center cursor-pointer {requestGateType === Number(num) ? 'bg-[#FFCC00] border-[#0084CC] text-[#006094]' : 'bg-white border-slate-200 text-slate-600 hover:border-[#FFCC00] hover:-translate-y-1'}"
              >
                <span class="text-3xl mb-2">{theme.icon}</span>
                <span class="text-xs font-bold font-system leading-tight">{theme.name}</span>
              </button>
            {/each}
          </div>
        </AcnhBubble>

      {:else if step === 2}
        <AcnhBubble
          title={dalStore.systemMode === 'DAL' ? "Orville [Tour Guide]" : "Luna [Dream Guide]"}
          dialogText={dalStore.systemMode === 'DAL' ? DIALOGS.standbyWizard.step2(GATE_THEMES[requestGateType]?.name) : DIALOGS.standbyWizard.lunaStep2(GATE_THEMES[requestGateType]?.name)}
          onDismiss={() => { playSound('beep', isMuted); onClose(); }}
        >
          <div class="mt-4 space-y-5 relative z-10 pr-4 md:pr-8">
            <!-- Day Picker -->
            <div class="flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
              {#each days as day}
                <button
                  type="button"
                  onclick={() => { playSound('beep', isMuted); selectedDay = day; }}
                  class="relative flex-shrink-0 px-4 py-2 rounded-xl font-system font-black tracking-wide text-xs transition-all border-b-4 cursor-pointer font-bold select-none
                  {selectedDay === day 
                    ? 'bg-[#FFCC00] text-[#006094] border-[#CC9900] translate-y-0.5 !border-b-2' 
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:-translate-y-0.5'}"
                >
                  {day === days[new Date().getDay()] ? 'Today' : day}
                </button>
              {/each}
            </div>

            <!-- Time Slider -->
            <div class="bg-white border-4 border-[#E6DFC7] rounded-2xl p-4">
              <div class="flex justify-between items-end mb-4">
                <span class="text-xs font-black text-[#0084CC] uppercase font-system tracking-wide">Departure Window</span>
                <span class="text-sm font-black text-[#4A4A4A] font-system">{selectedDay === days[new Date().getDay()] ? 'Today' : selectedDay} - {formStartTime} - {formEndTime}</span>
              </div>
              
              <div class="relative w-full h-8 flex items-center mb-2">
                <!-- Track -->
                <div class="absolute w-full h-3 bg-slate-100 border border-slate-200 rounded-full shadow-inner"></div>
                <!-- Highlight -->
                <div 
                  class="absolute h-3 bg-[#FFCC00] border border-[#CC9900] rounded-full transition-all duration-75" 
                  style="left: {(actualStart / 96) * 100}%; right: {100 - ((actualEnd / 96) * 100)}%;">
                </div>
                
                <!-- Inputs -->
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
              
              <div class="flex justify-between text-[10px] font-bold text-slate-400 font-system px-1">
                <span>12 AM</span>
                <span>12 PM</span>
                <span>12 AM</span>
              </div>
            </div>

            <div class="flex justify-between pt-2">
              <Button variant="secondary" onclick={prevStep}>Back</Button>
              <Button variant="primary" onclick={nextStep}>Next Step</Button>
            </div>
          </div>
        </AcnhBubble>

      {:else if step === 3}
        <AcnhBubble
          title={dalStore.systemMode === 'DAL' ? "Orville [Tour Guide]" : "Luna [Dream Guide]"}
          dialogText={dalStore.systemMode === 'DAL' ? DIALOGS.standbyWizard.step3 : DIALOGS.standbyWizard.lunaStep3}
          onDismiss={() => { playSound('beep', isMuted); onClose(); }}
        >
          <div class="mt-4 space-y-4 relative z-10 pr-4 md:pr-10">
            <textarea
              bind:value={requestMemo}
              placeholder="e.g. Looking to swap DIYs, or sell turnips over 300 bells. Will tip gold nugget! 💰"
              class="w-full bg-white border-4 border-[#E6DFC7] rounded-2xl px-4 py-3 font-system font-semibold text-[#4A4A4A] outline-none focus:border-[#0084CC] h-24 resize-none text-sm"
              maxlength={140}
            ></textarea>
            <div class="flex justify-between pt-2">
              <Button variant="secondary" onclick={prevStep}>Back</Button>
              <Button variant="primary" onclick={nextStep}>Review Ticket</Button>
            </div>
          </div>
        </AcnhBubble>

      {:else if step === 4}
        <AcnhBubble
          title={dalStore.systemMode === 'DAL' ? "Orville [Tour Guide]" : "Luna [Dream Guide]"}
          dialogText={dalStore.systemMode === 'DAL' ? DIALOGS.standbyWizard.step4 : DIALOGS.standbyWizard.lunaStep4}
          onDismiss={() => { playSound('beep', isMuted); onClose(); }}
        >
          <div class="mt-4 space-y-4 relative z-10 pr-4 md:pr-10">
            {#if requestError}
              <div class="bg-red-50 text-red-600 border border-red-200 p-3 rounded-xl text-sm font-bold font-system">
                {requestError}
              </div>
            {/if}

            <div class="bg-[#FAF8F2] p-5 rounded-2xl border-4 border-[#E6DFC7] flex flex-col gap-3 font-system">
              <div class="flex items-center gap-3">
                <span class="text-xs font-black text-[#0084CC] uppercase w-24 tracking-wide">Destination:</span>
                <span class="font-bold text-[#006094] bg-[#FFCC00] px-3 py-1 rounded-full text-xs uppercase tracking-wide border-2 border-[#CC9900]">
                  {GATE_THEMES[requestGateType]?.icon} {GATE_THEMES[requestGateType]?.name}
                </span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-xs font-black text-[#0084CC] uppercase w-24 tracking-wide">Time:</span>
                <span class="font-bold text-[#4A4A4A] text-sm bg-white px-3 py-1 rounded-full border-2 border-slate-200">{requestTime}</span>
              </div>
              <div class="flex items-start gap-3 mt-1">
                <span class="text-xs font-black text-[#0084CC] uppercase w-24 tracking-wide mt-1">Memo:</span>
                <span class="font-medium text-slate-600 text-sm italic flex-1 bg-white p-2 rounded-xl border-2 border-slate-200">"{requestMemo || 'N/A'}"</span>
              </div>
            </div>

            <div class="flex justify-between pt-2">
              <Button variant="secondary" onclick={prevStep}>Make Changes</Button>
              <Button
                variant="primary"
                onclick={submitWizard}
                disabled={isSubmittingRequest}
              >
                {isSubmittingRequest ? 'Printing Ticket...' : 'Yes! Book me.'}
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
    width: 20px;
    height: 20px;
    background-color: white;
    border: 3px solid #0084CC;
    border-radius: 50%;
    cursor: grab;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.1s;
  }
  .multi-range::-webkit-slider-thumb:active {
    cursor: grabbing;
    transform: scale(1.15);
  }
  
  .multi-range::-moz-range-thumb {
    pointer-events: auto;
    appearance: none;
    width: 20px;
    height: 20px;
    background-color: white;
    border: 3px solid #0084CC;
    border-radius: 50%;
    cursor: grab;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.1s;
  }
  .multi-range::-moz-range-thumb:active {
    cursor: grabbing;
    transform: scale(1.15);
  }
</style>
