<script lang="ts">
  import { flip } from 'svelte/animate';
  import { PlusCircle, X, Radar, Ticket } from '@lucide/svelte';
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
    isMuted = false,
    isActive = false
  } = $props<{
    requests: StandbyRequest[];
    passport: Passport;
    profiles: Record<string, UserProfile>;
    openProfileModal: (friendCode: string) => void;
    handleRemoveStandbyRequest: (id: string) => void;
    setShowStandbyModal: (show: boolean) => void;
    isMuted?: boolean;
    isActive?: boolean;
  }>();

  let activeView = $state<'global' | 'mine'>('global');

  let myRequests = $derived(
    requests.filter(req => 
      passport.hasCreated && (
        req.friendCode 
          ? req.friendCode === passport.friendCode 
          : req.name.toLowerCase() === passport.villagerName.toLowerCase()
      )
    )
  );

  let displayedRequests = $derived(activeView === 'global' ? requests : myRequests);

  function getPassengerProfile(name: string, island: string) {
    return (Object.values(profiles) as UserProfile[]).find(
      p => p.villagerName.toLowerCase() === name.toLowerCase() && 
           p.islandName.toLowerCase() === island.toLowerCase()
    );
  }
</script>

<div class="space-y-4 pt-5">

  <!-- Booking Action Area -->
  {#if isActive}
    <AcnhBubble 
      title="Orville"
      dialogText="Tell me where and when you want to fly. I'll add you to the global standby radar so Wilbur can find flights for you!"
    >
      <div class="mt-4 flex justify-center">
        <button
          onclick={() => { playSound('beep', isMuted); setShowStandbyModal(true); }}
          class="bg-[#FFCC00] hover:bg-[#FFD11A] text-[#006094] border-[#CC9900] border-b-4 font-system font-black px-6 py-3 rounded-2xl text-sm uppercase cursor-pointer transition-all shadow active:translate-y-1 active:border-b-0 w-full max-w-sm"
        >
          <span class="flex items-center justify-center gap-2">
            <PlusCircle class="w-5 h-5" />
            Book New Ticket
          </span>
        </button>
      </div>
    </AcnhBubble>
  {/if}

  <!-- Radar Panel -->
  <div class="bg-[#FAF8F2] rounded-[32px] border-4 border-[#E6DFC7] p-5 shadow-sm text-[#4A4A4A] text-left">
    
    <!-- Header and Filter Toggle -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E6DFC7] pb-3 mb-4 gap-3">
      <div class="flex items-center gap-2">
        <span class="text-amber-600 text-2xl">📡</span>
        <div>
          <h3 class="font-system font-black text-sm text-[#0084CC] uppercase leading-none tracking-wide">Standby Radar</h3>
          <span class="text-xs font-system font-bold text-slate-400 uppercase tracking-widest mt-1 block">PASSENGERS SEEKING FLIGHTS</span>
        </div>
      </div>

      <!-- Segmented Control -->
      <div class="bg-[#E6DFC7]/40 p-1 rounded-xl flex gap-1 font-system">
        <button
          onclick={() => { playSound('beep', isMuted); activeView = 'global'; }}
          class="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-black uppercase transition-all border-none cursor-pointer {activeView === 'global' ? 'bg-white text-[#0084CC] shadow-sm' : 'text-slate-500 hover:text-slate-700'}"
        >
          <Radar class="w-3.5 h-3.5" />
          Global ({requests.length})
        </button>
        <button
          onclick={() => { playSound('beep', isMuted); activeView = 'mine'; }}
          class="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-black uppercase transition-all border-none cursor-pointer {activeView === 'mine' ? 'bg-white text-[#0084CC] shadow-sm' : 'text-slate-500 hover:text-slate-700'}"
        >
          <Ticket class="w-3.5 h-3.5" />
          My Tickets ({myRequests.length})
        </button>
      </div>
    </div>

    <!-- Active Standby Passengers List -->
    <div class="space-y-3 pt-6 pb-4">
      {#if displayedRequests.length === 0}
        <div class="text-center py-10 space-y-3">
          <div class="text-4xl opacity-50">🛩️</div>
          <p class="text-sm font-system font-bold text-slate-400">
            {activeView === 'global' ? 'The global radar is empty. Clear skies on all runways!' : 'You have no active standby tickets on the radar.'}
          </p>
        </div>
      {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-8 px-2">
          {#each displayedRequests as req (req.id)}
            {@const isMine = passport.hasCreated && (
              req.friendCode 
                ? req.friendCode === passport.friendCode 
                : req.name.toLowerCase() === passport.villagerName.toLowerCase()
            )}
            
            <div
              animate:flip={{ duration: 300 }}
              class="relative w-full"
            >
              <AcnhBubble 
                title="{isMine ? 'ME' : `${req.name}@${req.island}`}"
                class="w-full !max-w-none"
              >
                {#if isMine}
                  <button
                    onclick={() => handleRemoveStandbyRequest(req.id)}
                    class="absolute -top-4 -right-2 p-1.5 bg-red-50 hover:bg-red-100 rounded-full text-red-400 hover:text-red-600 cursor-pointer border-none transition-colors z-20 shadow-sm"
                    title="Cancel Ticket"
                  >
                    <X class="w-4 h-4" />
                  </button>
                {/if}

                <div class="flex items-start gap-4 mt-2 relative z-10 w-full">
                  <div class="w-12 h-12 bg-slate-50 border-2 border-slate-100 rounded-xl flex items-center justify-center text-3xl shadow-xs shrink-0 cursor-pointer hover:scale-105 transition-transform"
                       onclick={() => {
                         const p = getPassengerProfile(req.name, req.island);
                         openProfileModal(p ? p.friendCode : req.friendCode || `SW-TEMP-${req.name}-${req.island}`);
                       }}
                       title="View passenger trust profile">
                    {req.avatar}
                  </div>

                  <div class="flex-1 min-w-0 pt-1">
                    <p class="text-[15px] font-system font-bold text-slate-700 leading-relaxed mb-3">
                      {req.memo}
                    </p>

                    <p class="text-sm font-system font-bold text-slate-500 leading-relaxed">
                      I'm looking for <span class="text-[#0084CC]">{(dalStore.systemMode === 'DAL' ? GATE_THEMES : DREAM_THEMES)[req.gateType]?.name}</span>.<br/>
                      I can fly <span class="text-amber-600">{req.timePreference}</span>.
                    </p>
                  </div>
                </div>
              </AcnhBubble>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>
