<script lang="ts">
  import { dalStore } from '$lib/stores/dal.svelte';
  import FuelDepotModal from '$lib/components/organisms/FuelDepotModal.svelte';
  import { playSound } from '$lib/utils/audio';
  
  let showFuelModal = $state(false);
  let isRefueling = $state(false);

  async function handleRefuel(amount: number) {
    playSound('success', dalStore.isMuted);
    isRefueling = true;
    try {
      const res = await fetch('/wp-json/dodo-air/v1/ai/refuel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      if (res.ok) {
        const data = await res.json();
        dalStore.aiFuel = { aiTokens: data.aiTokens, maxTokens: data.maxTokens };
      }
    } catch (err) {
      console.error("Failed to refuel:", err);
    } finally {
      isRefueling = false;
    }
  }
</script>

<footer class="w-full mt-6 border-t border-[#E6DFC7] pt-4 flex flex-col sm:flex-row items-center justify-between text-sm font-system text-slate-500 gap-3 text-left">
    <div class="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left leading-normal">
      <span>DAL Online Terminal &copy; 2026 For the XP</span>
      <span class="hidden sm:inline text-slate-300">|</span>
      <span>Created by <a href="https://xophz.com" target="_blank" rel="noopener noreferrer" class="font-bold underline text-[#0084CC] hover:text-[#006094]">xophz.com</a></span>
      <span class="hidden sm:inline text-slate-300">|</span>
      <a href="#/terms" class="font-bold underline text-[#0084CC] hover:text-[#006094]">Terms</a>
      <span class="hidden sm:inline text-slate-300">|</span>
      <a href="#/privacy" class="font-bold underline text-[#0084CC] hover:text-[#006094]">Privacy</a>
      <span class="hidden sm:inline text-slate-300">|</span>
      <span>v{__APP_VERSION__}</span>
    </div>

    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div 
      onclick={() => { playSound('beep', dalStore.isMuted); showFuelModal = true; }}
      class="flex items-center gap-2 bg-[#FFFCEF] border border-[#FFEAA7] rounded-full px-3 py-1 text-slate-600 hover:bg-[#FFF9D6] hover:border-amber-400 transition-all cursor-pointer select-none group shadow-xs"
    >
      <span class="animate-pulse">⛽</span>
      <span class="font-bold text-amber-800 text-xs uppercase tracking-wider">AI Fuel:</span>
      <div class="w-12 h-1.5 bg-slate-200/80 rounded-full overflow-hidden border border-slate-300/30 relative">
        <div
          class="h-full transition-all duration-500 {(dalStore.aiFuel.aiTokens / dalStore.aiFuel.maxTokens) < 0.2 ? 'bg-red-500' : (dalStore.aiFuel.aiTokens / dalStore.aiFuel.maxTokens) < 0.5 ? 'bg-amber-500' : 'bg-emerald-500'}"
          style="width: {Math.min(100, (dalStore.aiFuel.aiTokens / dalStore.aiFuel.maxTokens) * 100)}%"
        ></div>
      </div>
      <span class="font-black text-[#0084CC] text-xs font-system">
        {dalStore.aiFuel.aiTokens.toLocaleString()} GAL
      </span>
      <span class="text-xs font-black text-amber-700 underline group-hover:text-[#0084CC] transition-colors ml-0.5">
        [Refuel]
      </span>
    </div>
</footer>

{#if showFuelModal}
  <FuelDepotModal
    currentFuel={dalStore.aiFuel.aiTokens}
    maxFuel={dalStore.aiFuel.maxTokens}
    onRefuel={handleRefuel}
    onClose={() => showFuelModal = false}
    {isRefueling}
  />
{/if}
