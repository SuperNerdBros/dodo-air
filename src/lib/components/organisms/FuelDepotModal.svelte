<script lang="ts">
  import { X } from '@lucide/svelte';
  import { playSound } from '$lib/utils/audio';
  import { scale, fade } from 'svelte/transition';
  import { backOut } from 'svelte/easing';

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

  function handleRefuelAction(type: 'cash' | 'venmo') {
    if (type === 'cash') {
      window.open('https://cash.app/$XopherDeeP', '_blank', 'noopener,noreferrer');
    } else {
      window.open('https://venmo.com/u/xopherdeep', '_blank', 'noopener,noreferrer');
    }
    onRefuel(5000);
  }

  let fuelPercentage = $derived(Math.min(100, (aiFuel.aiTokens / aiFuel.maxTokens) * 100));
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="fixed inset-0 bg-[#006094]/40 backdrop-blur-md flex items-center justify-center p-4 z-50" transition:fade={{ duration: 200 }}>
    <div
      class="bg-[#FFFCEF] rounded-[32px] border-4 border-[#FFEAA7] max-w-md w-full p-6 shadow-2xl relative text-[#4A4A4A]"
      transition:scale={{ duration: 300, start: 0.95, easing: backOut }}
    >
      <div class="absolute right-4 top-4 opacity-10 text-8xl pointer-events-none select-none">⛽</div>
      
      <div class="flex items-center justify-between border-b border-amber-200/50 pb-3.5 mb-4">
        <div class="flex items-center gap-2">
          <span class="text-2xl">⛽</span>
          <div>
            <h3 class="font-system font-black text-sm text-amber-800 uppercase tracking-normal">AI Aviation Fuel Depot</h3>
            <span class="text-xs font-system font-black text-amber-600 block uppercase tracking-widest">DAL Community Power Station</span>
          </div>
        </div>
        <button
          onclick={() => { playSound('beep', isMuted); onClose(); }}
          class="p-1.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-800 transition-colors cursor-pointer border-none"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <div class="space-y-4 text-xs">
        <p class="leading-relaxed font-semibold text-slate-600">
          Welcome to Orville and Wilbur's AI Aviation Fuel Depot! Our premium seaplane AI algorithms require high-grade jet fuel to calculate flight paths and process passenger reviews.
        </p>

        <div class="bg-white/80 p-3.5 rounded-2xl border border-amber-200/40 space-y-2">
          <span class="block text-xs font-system font-black text-amber-700 uppercase tracking-wider">FUEL DRAIN CONSUMPTION METRICS</span>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="flex items-center gap-2 bg-sky-50/50 p-2 rounded-xl border border-sky-100">
              <span class="text-base">📝</span>
              <div>
                <p class="font-black text-slate-700">AI Travel Review</p>
                <p class="font-system text-amber-700 font-bold">-300 GAL / review</p>
              </div>
            </div>
            <div class="flex items-center gap-2 bg-teal-50/50 p-2 rounded-xl border border-teal-100">
              <span class="text-base">💬</span>
              <div>
                <p class="font-black text-slate-700">Radio Chatter Bot</p>
                <p class="font-system text-amber-700 font-bold">-150 GAL / reply</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Fuel Progress Bar -->
        <div class="bg-white p-4.5 rounded-2xl border-2 border-[#FFEAA7] shadow-inner space-y-3">
          <div class="flex justify-between items-end font-system">
            <span class="text-xs font-black text-[#85806B] uppercase tracking-wider">CURRENT FUEL IN STORAGE TANK:</span>
            <span class="text-xs font-black text-[#0084CC]">
              {aiFuel.aiTokens.toLocaleString()} / {aiFuel.maxTokens.toLocaleString()} GAL
            </span>
          </div>

          <div class="w-full h-5 bg-[#E6DFC7]/40 rounded-full overflow-hidden border border-[#E6DFC7] relative">
            <div
              class="h-full transition-all duration-500 relative {
                fuelPercentage < 20
                  ? 'bg-gradient-to-r from-red-500 to-orange-500'
                  : fuelPercentage < 50
                  ? 'bg-gradient-to-r from-amber-500 to-[#FFCC00]'
                  : 'bg-gradient-to-r from-emerald-500 to-[#00D632]'
              }"
              style="width: {fuelPercentage}%;"
            >
              <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
            <div class="absolute top-0 bottom-0 left-1/4 w-0.5 bg-[#4A4A4A]/10"></div>
            <div class="absolute top-0 bottom-0 left-2/4 w-0.5 bg-[#4A4A4A]/10"></div>
            <div class="absolute top-0 bottom-0 left-3/4 w-0.5 bg-[#4A4A4A]/10"></div>
          </div>

          <p class="text-xs text-slate-500 font-semibold text-center italic">
            When the tank is completely dry, our AI-powered travel reviews and radio chatter bots will temporarily pause until refueled.
          </p>
        </div>

        <div class="space-y-2">
          <label class="block text-xs font-system font-black text-amber-700 uppercase tracking-wider text-center">
            ⚡ CHOOSE A REFUEL METHOD TO INSTANTLY PUMP +5,000 GALLONS
          </label>
          <div class="grid grid-cols-2 gap-3.5">
            <button
              onclick={() => handleRefuelAction('cash')}
              disabled={isRefueling}
              class="bg-[#00D632] hover:bg-[#00b029] active:scale-[0.98] disabled:opacity-50 text-white font-system font-black text-sm py-2.5 px-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 uppercase cursor-pointer border-none font-bold"
            >
              💸 CashApp Refuel
            </button>
            <button
              onclick={() => handleRefuelAction('venmo')}
              disabled={isRefueling}
              class="bg-[#008CFF] hover:bg-[#0070cc] active:scale-[0.98] disabled:opacity-50 text-white font-system font-black text-sm py-2.5 px-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 uppercase cursor-pointer border-none font-bold"
            >
              💙 Venmo Refuel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
