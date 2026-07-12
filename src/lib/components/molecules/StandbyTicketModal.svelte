<script lang="ts">
  import { X, AlertCircle } from '@lucide/svelte';
  import { GATE_THEMES } from '$lib/utils/constants';
  import { scale, fade } from 'svelte/transition';
  import { backOut } from 'svelte/easing';

  let {
    isOpen = false,
    onClose,
    requestGateType = $bindable(1),
    requestTime = $bindable('Online Now'),
    requestMemo = $bindable(''),
    onSubmit,
    requestError = '',
    isSubmittingRequest = false
  } = $props<{
    isOpen: boolean;
    onClose: () => void;
    requestGateType?: number;
    requestTime?: string;
    requestMemo?: string;
    onSubmit: (e: SubmitEvent) => void;
    requestError?: string;
    isSubmittingRequest?: boolean;
  }>();
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 bg-[#006094]/40 backdrop-blur-md flex items-center justify-center p-4 z-50"
    transition:fade={{ duration: 200 }}
  >
    <div
      class="bg-white rounded-[32px] border-4 border-[#0084CC] max-w-md w-full p-6 shadow-2xl relative text-[#4A4A4A]"
      transition:scale={{ duration: 300, start: 0.95, easing: backOut }}
    >
      <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h3 class="font-display font-black text-base text-[#0084CC]">File Standby Flight Ticket</h3>
          <span class="text-[8px] font-mono font-bold text-slate-400 block uppercase">DODO AIRLINES STANDBY REGISTRY</span>
        </div>
        <button
          onclick={onClose}
          class="p-1 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 border-none cursor-pointer"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <form onsubmit={onSubmit} class="space-y-4 text-xs">
        {#if requestError}
          <p class="text-xs font-bold text-red-600 flex items-center gap-1 font-mono">
            <AlertCircle class="w-4 h-4" /> {requestError}
          </p>
        {/if}

        <div>
          <label class="block text-[8px] font-mono font-black text-[#0084CC] mb-1 uppercase">DESIRED GATE THEME / PURPOSE</label>
          <select
            bind:value={requestGateType}
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold outline-none cursor-pointer"
          >
            {#each Object.entries(GATE_THEMES) as [num, theme]}
              <option value={Number(num)}>
                {theme.icon} {theme.name} ({theme.tag})
              </option>
            {/each}
          </select>
        </div>

        <div>
          <label class="block text-[8px] font-mono font-black text-[#0084CC] mb-1 uppercase">TIME PREFERENCE</label>
          <select
            bind:value={requestTime}
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold outline-none cursor-pointer"
          >
            <option value="Online Now">⏱️ Online Right Now</option>
            <option value="In 10 Mins">⏱️ Flying in 10 Minutes</option>
            <option value="Stargazing Tonight">⏱️ Stargazing / Night Flights</option>
            <option value="Flexible">⏱️ Flexible / Cozy Travel</option>
          </select>
        </div>

        <div>
          <label class="block text-[8px] font-mono font-black text-[#0084CC] mb-1 uppercase">CUSTOM MEMO / SEEKING DETAILS</label>
          <textarea
            bind:value={requestMemo}
            placeholder="e.g. Looking to swap DIYs, or sell turnips over 300 bells. Will tip gold nugget! 💰"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold h-20 resize-none outline-none focus:bg-white"
            maxlength={140}
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={isSubmittingRequest}
          class="w-full bg-[#FFCC00] hover:bg-[#FFD11A] text-[#006094] font-display font-black py-3 rounded-2xl border-b-4 border-[#CC9900] shadow transition-all uppercase tracking-wide text-xs cursor-pointer font-bold disabled:opacity-50"
        >
          {isSubmittingRequest ? 'Registering...' : '📡 SUBMIT STANDBY TICKET & ENTER RADAR'}
        </button>
      </form>
    </div>
  </div>
{/if}
