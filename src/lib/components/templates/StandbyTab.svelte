<script lang="ts">
  import { flip } from 'svelte/animate';
  import { PlusCircle, X } from '@lucide/svelte';
  import type { StandbyRequest, Passport, UserProfile } from '$lib/studio-types';
  import { playSound } from '$lib/utils/audio';
  import { GATE_THEMES, DREAM_THEMES } from '$lib/utils/constants';
  import { dalStore } from '$lib/stores/dal.svelte';
  import AcnhBubble from '$lib/components/molecules/AcnhBubble.svelte';

  let {
    requests,
    passport,
    profiles,
    openProfileModal,
    handleRemoveStandbyRequest,
    setShowStandbyModal,
    isMuted = false
  } = $props<{
    requests: StandbyRequest[];
    passport: Passport;
    profiles: Record<string, UserProfile>;
    openProfileModal: (friendCode: string) => void;
    handleRemoveStandbyRequest: (id: string) => void;
    setShowStandbyModal: (show: boolean) => void;
    isMuted?: boolean;
  }>();

  function getPassengerProfile(name: string, island: string) {
    return (Object.values(profiles) as UserProfile[]).find(
      p => p.villagerName.toLowerCase() === name.toLowerCase() && 
           p.islandName.toLowerCase() === island.toLowerCase()
    );
  }
</script>

<div class="space-y-4">
  <!-- Standby Card Panel -->
  <div id="standby-lounge-section" class="bg-[#FAF8F2] rounded-[32px] border-4 border-[#E6DFC7] p-5 shadow-sm text-[#4A4A4A] text-left">
    <div class="flex items-center justify-between border-b border-[#E6DFC7] pb-2.5 mb-3">
      <div class="flex items-center gap-1.5">
        <span class="text-amber-600 text-lg">🛋️</span>
        <div>
          <h3 class="font-system font-black text-xs text-[#0084CC] uppercase leading-none font-bold">Standby Lounge Radar</h3>
          <span class="text-xs font-system font-bold text-slate-400 uppercase">PEOPLE SEEKING FLIGHTS</span>
        </div>
      </div>

      <button
        onclick={() => { playSound('beep', isMuted); setShowStandbyModal(true); }}
        class="btn-acnh btn-acnh-primary "
      >
        <PlusCircle class="w-3 h-3" /> Add Request
      </button>
    </div>

    <!-- Active Standby Passengers List -->
    <div class="space-y-3 max-h-[600px] overflow-y-auto pr-1">
      {#if requests.length === 0}
        <p class="text-sm font-system text-center text-slate-400/80 py-8">
          The standby terminal is currently empty. Clear skies on all runways! 🛩️
        </p>
      {:else}
        {#each requests as req (req.id)}
          {@const isMine = passport.hasCreated && (
            req.friendCode 
              ? req.friendCode === passport.friendCode 
              : req.name.toLowerCase() === passport.villagerName.toLowerCase()
          )}
          
          <div
            animate:flip={{ duration: 300 }}
            class="p-3 bg-white rounded-2xl border-2 transition-all relative {isMine ? 'border-[#0084CC] bg-[#F0F9FF]' : 'border-[#E6DFC7]/60'}"
          >
            <!-- Delete/Close request if it is the user's -->
            {#if isMine}
              <button
                onclick={() => handleRemoveStandbyRequest(req.id)}
                class="absolute top-2 right-2 p-1 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer border-none"
                title="Withdraw ticket"
              >
                <X class="w-3 h-3" />
              </button>
            {/if}

            <div class="flex items-start gap-2.5">
              <!-- Avatar -->
              <div class="w-9 h-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-xl shadow-xs">
                {req.avatar}
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center flex-wrap gap-1">
                  <!-- svelte-ignore a11y_click_events_have_key_events -->
                  <!-- svelte-ignore a11y_no_static_element_interactions -->
                  <span 
                    onclick={() => {
                      const p = getPassengerProfile(req.name, req.island);
                      openProfileModal(p ? p.friendCode : req.friendCode || `SW-TEMP-${req.name}-${req.island}`);
                    }}
                    class="font-system font-black text-xs text-[#0084CC] hover:underline cursor-pointer font-bold"
                    title="View passenger trust profile"
                  >
                    {req.name}
                  </span>
                  <span class="text-xs font-system text-slate-400 font-bold">from {req.island}</span>
                  {#if getPassengerProfile(req.name, req.island)}
                    {@const p = getPassengerProfile(req.name, req.island)}
                    <span class="inline-flex items-center gap-0.5 text-xs font-system bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full px-1.5 py-0.1 font-black">
                      🍏 {p?.goodApples || 0}
                      {#if p && p.rottenTurnips > 0}
                        <span class="text-rose-700">|🧅 {p.rottenTurnips}</span>
                      {/if}
                    </span>
                  {/if}
                </div>
                <p class="text-xs font-system text-slate-400 uppercase font-black truncate max-w-full">
                  "{req.title}"
                </p>

                <div class="mt-1.5 flex items-center flex-wrap gap-1.5">
                  <span class="bg-[#A2D2FF]/20 text-[#006094] text-xs font-system font-black px-1.5 py-0.2 rounded-full uppercase">
                    {(dalStore.systemMode === 'DAL' ? GATE_THEMES : DREAM_THEMES)[req.gateType]?.icon} {(dalStore.systemMode === 'DAL' ? GATE_THEMES : DREAM_THEMES)[req.gateType]?.name}
                  </span>
                  <span class="bg-amber-50 text-amber-700 border border-amber-100 text-xs font-system font-bold px-1.5 py-0.2 rounded-full uppercase">
                    ⏱️ {req.timePreference}
                  </span>
                </div>

                <p class="text-sm text-slate-500 italic mt-1.5 leading-snug">
                  "{req.memo}"
                </p>
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>
