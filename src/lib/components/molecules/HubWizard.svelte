<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { GATE_THEMES } from '$lib/utils/constants';
  import AcnhBubble from '$lib/components/molecules/AcnhBubble.svelte';
  import Button from '$lib/components/atoms/Button.atom.svelte';
  import Input from '$lib/components/atoms/Input.atom.svelte';
  import Select from '$lib/components/atoms/Select.atom.svelte';
  import Textarea from '$lib/components/atoms/Textarea.atom.svelte';
  import { playSound } from '$lib/utils/audio';

  let {
    isOpen = false,
    onClose,
    formDodo = $bindable(''),
    formHemisphere = $bindable('Northern'),
    formGate = $bindable(1),
    formDesc = $bindable(''),
    formPlaneType = $bindable('Switch'),
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
    onSubmit: (e: SubmitEvent | Event) => void;
    formError?: string;
    isSubmittingHost?: boolean;
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
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="fixed inset-0 z-[100] flex flex-col justify-end p-4 pb-8 sm:p-8 bg-[#006094]/60 backdrop-blur-sm" transition:fade={{ duration: 200 }}>
    <div transition:fly={{ y: 50, duration: 300 }} class="w-full">
      {#if step === 1}
        <AcnhBubble
          title="Wilbur"
          dialogText="Roger that! Let's get this seaplane ready for boarding. First, what are the flight details?"
          onDismiss={() => { playSound('beep', isMuted); onClose(); }}
        >
          <div class="mt-4 space-y-4 relative z-10 pr-4 md:pr-10">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-system font-black text-[#0084CC] mb-1.5 uppercase tracking-wider">HEMISPHERE</label>
                <Select bind:value={formHemisphere} class="w-full bg-white border-[#E6DFC7] border-4 rounded-xl px-3 py-2 font-bold outline-none focus:border-[#0084CC] text-[#4A4A4A]">
                  <option value="Northern">Northern</option>
                  <option value="Southern">Southern</option>
                </Select>
              </div>
              <div>
                <label class="block text-xs font-system font-black text-[#0084CC] mb-1.5 uppercase tracking-wider">SEAPLANE MODEL</label>
                <Select bind:value={formPlaneType} class="w-full bg-white border-[#E6DFC7] border-4 rounded-xl px-3 py-2 font-bold outline-none focus:border-[#0084CC] text-[#4A4A4A]">
                  <option value="Switch">🛩️ Switch Model (8 seats)</option>
                  <option value="Switch 2">✈️ Switch 2 Model (12 seats)</option>
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
          title="Wilbur"
          dialogText="Copy that! Now, what kind of visitors are you looking for? Pick a gate theme category!"
          onDismiss={() => { playSound('beep', isMuted); onClose(); }}
        >
          <div class="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3 relative z-10 pr-4 md:pr-10 max-h-60 overflow-y-auto hide-scrollbar">
            {#each Object.entries(GATE_THEMES) as [num, theme]}
              <button
                type="button"
                onclick={() => { formGate = Number(num); nextStep(); }}
                class="py-3 px-2 rounded-2xl border-4 transition-all text-center flex flex-col items-center justify-center cursor-pointer {formGate === Number(num) ? 'bg-[#FFCC00] border-[#0084CC] text-[#006094]' : 'bg-white border-slate-200 text-slate-600 hover:border-[#FFCC00] hover:-translate-y-1'}"
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
          title="Wilbur"
          dialogText="We need a flight plan description so passengers know what to expect! Tell 'em what's going on!"
          onDismiss={() => { playSound('beep', isMuted); onClose(); }}
        >
          <div class="mt-4 space-y-4 relative z-10 pr-4 md:pr-10">
            <Textarea
              bind:value={formDesc}
              placeholder="e.g. Turnips buying for 450! Celeste is near the airport dock. Free DIY card swap on the beach."
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
          title="Wilbur"
          dialogText="Loud and clear! Provide your 5-digit Dodo Code™ to open the gates now, or leave it blank to create a recurring flight plan for later!"
          onDismiss={() => { playSound('beep', isMuted); onClose(); }}
        >
          <div class="mt-4 space-y-4 relative z-10 pr-4 md:pr-10">
            {#if formError}
              <div class="bg-red-50 text-red-600 border border-red-200 p-3 rounded-xl text-sm font-bold font-system">
                {formError}
              </div>
            {/if}
            
            <div class="flex justify-center my-4">
              <Input 
                type="text" 
                bind:value={formDodo} 
                placeholder="e.g. D0D01 (Leave blank to schedule)" 
                class="w-full max-w-[800px] bg-white border-4 border-[#E6DFC7] rounded-2xl px-4 py-3 font-system font-black tracking-widest text-center text-sm sm:text-lg uppercase outline-none focus:border-[#0084CC] text-[#0084CC]" 
                maxlength={5} 
              />
            </div>

            <div class="flex justify-between pt-2">
              <Button variant="secondary" onclick={prevStep}>Make Changes</Button>
              <Button
                variant="primary"
                onclick={submitWizard}
                disabled={isSubmittingHost || (formDodo.length > 0 && formDodo.length !== 5)}
              >
                {#if isSubmittingHost}
                  Dispatching...
                {:else if formDodo.trim().length === 5}
                  Open Gate Now!
                {:else}
                Add Flight Plan

                {/if}
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
