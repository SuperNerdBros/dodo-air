<script lang="ts">
  import { onMount } from 'svelte';
  import { ChevronRight, Plane, PlusCircle, X } from '@lucide/svelte';
  import type { Flight, StandbyRequest, Passport, UserProfile, Passenger } from '$lib/studio-types';
  import { playSound } from '$lib/utils/audio';
  import { GATE_THEMES, DREAM_THEMES, PLANE_COLORS } from '$lib/utils/constants';
  import { slide, fade } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { dalStore } from '$lib/stores/dal.svelte';

  let {
    flights,
    selectedFlightId = $bindable(null),
    passport,
    profiles,
    openProfileModal,
    isMuted = false
  } = $props<{
    flights: Flight[];
    selectedFlightId: string | null;
    passport: Passport;
    profiles: Record<string, UserProfile>;
    openProfileModal: (friendCode: string) => void;
    isMuted?: boolean;
  }>();

  let showStatusGuide = $state(false);
  let activeFilter = $state<'All' | 'Scheduled' | 'Boarding'>('All');
  let filteredFlights = $derived(flights.filter(f => activeFilter === 'All' || f.status === activeFilter));

  function getHostProfile(hostName: string, islandName: string) {
    return (Object.values(profiles) as UserProfile[]).find(
      p => p.villagerName.toLowerCase() === hostName.toLowerCase() && 
           p.islandName.toLowerCase() === islandName.toLowerCase()
    );
  }

  function getPassengerProfile(name: string, island: string) {
    return (Object.values(profiles) as UserProfile[]).find(
      p => p.villagerName.toLowerCase() === name.toLowerCase() && 
           p.islandName.toLowerCase() === island.toLowerCase()
    );
  }

  onMount(() => {
    const renderTime = performance.now();
    console.log(`[Diagnostic] DeparturesTab mounted and rendered at ${renderTime.toFixed(2)}ms`);
  });
</script>

<div class="space-y-4">
  <!-- Departures Board - Full Width -->
  <div class="space-y-4">
    <!-- Boarding Desk Heading -->
    <div id="active-departures-section" class="bg-white rounded-3xl border-2 border-[#0084CC]/10 p-4 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-sm">
      <div class="flex items-center gap-2.5">
        <span class="w-2.5 h-2.5 rounded-full bg-[#0084CC] animate-ping shrink-0"></span>
        <div class="text-left">
          <h2 class="text-base font-system font-black tracking-wider {dalStore.systemMode === 'DAL' ? 'text-[#0084CC]' : 'text-[#4B0082]'} uppercase leading-none transition-colors">
            {dalStore.systemMode === 'DAL' ? 'DAL DEPARTURES FLIGHT BOARD' : 'LUNA DOZE CODE BOARD'}
          </h2>
          <span class="text-xs font-system text-slate-400 font-bold uppercase tracking-widest mt-1 block">
            {dalStore.systemMode === 'DAL' ? 'CHOOSE FLIGHT TO REVEAL BOARDING PASS' : 'CHOOSE DREAM TO REVEAL DOZE CODE'}
          </span>
        </div>
      </div>
      
      <div class="flex items-center gap-2 flex-wrap justify-end">
        <div class="flex bg-slate-100/80 border border-slate-200/50 rounded-full p-0.5">
          {#each ['All', 'Scheduled', 'Boarding'] as filterType}
            <button
              class="px-3 py-1 text-xs font-system font-bold rounded-full transition-all {activeFilter === filterType ? 'bg-white shadow-sm text-[#0084CC]' : 'text-slate-500 hover:text-slate-700'}"
              onclick={() => { playSound('beep', isMuted); activeFilter = filterType as any; }}
            >
              {filterType}
            </button>
          {/each}
        </div>

        <button
          onclick={() => { playSound('beep', isMuted); showStatusGuide = !showStatusGuide; }}
          class="bg-[#FFFCEF] hover:bg-[#FFF9D6] border border-[#FFEAA7] rounded-full px-2.5 py-1 text-xs font-system font-black text-amber-800 transition-all flex items-center gap-1 cursor-pointer select-none"
        >
          <span>💡</span>
          <span>Status Guide {showStatusGuide ? '▲' : '▼'}</span>
        </button>

        <span class="{dalStore.systemMode === 'DAL' ? 'bg-[#A2D2FF]/20 text-[#0084CC] border-[#0084CC]/10' : 'bg-[#DDA0DD]/20 text-[#4B0082] border-[#4B0082]/10'} text-sm font-system font-bold px-2.5 py-1 rounded-full border transition-colors">
          {filteredFlights.length} {dalStore.systemMode === 'DAL' ? 'SEAPLANES ACTIVE' : 'DREAMS ACTIVE'}
        </span>
      </div>
    </div>

    <!-- Collapsible Flight Status Guide -->
    {#if showStatusGuide}
      <div
        transition:slide={{ duration: 300 }}
        class="overflow-hidden bg-[#FFFCEF] border-2 border-[#FFEAA7] rounded-3xl p-4 shadow-inner space-y-3 text-left"
      >
        <div class="flex items-center gap-1.5 border-b border-amber-200/50 pb-2">
          <span class="text-sm">🚦</span>
          <h4 class="font-system font-black text-sm text-[#006094] uppercase tracking-wider font-bold">
            {dalStore.systemMode === 'DAL' ? 'DAL Runway Status Board Legend' : 'Luna Dream Status Board Legend'}
          </h4>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600 font-semibold leading-relaxed">
          <div class="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-amber-200/25">
            <span class="bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-md font-system text-xs font-black uppercase shrink-0 mt-0.5 font-bold">
              Scheduled
            </span>
            <div>
              <p class="font-bold text-[#006094]">Flight plan is registered & active!</p>
              <p class="text-slate-500 font-medium">The host has listed their island. Passengers can browse details and book tickets. Gate will open shortly.</p>
            </div>
          </div>

          <div class="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-amber-200/25">
            <span class="bg-[#FFCC00]/20 text-[#006094] border border-[#FFCC00] px-1.5 py-0.5 rounded-md font-system text-xs font-black uppercase shrink-0 mt-0.5 animate-pulse font-bold">
              Boarding
            </span>
            <div>
              <p class="font-bold text-[#006094]">Gate is open & welcoming visitors!</p>
              <p class="text-slate-500 font-medium">Clearance granted. Travelers can obtain the Dodo Code™ and board the seaplane immediately.</p>
            </div>
          </div>

          <div class="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-amber-200/25">
            <span class="bg-slate-100 text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded-md font-system text-xs font-black uppercase shrink-0 mt-0.5 font-bold">
              Departed
            </span>
            <div>
              <p class="font-bold text-[#006094]">Seaplane is currently airborne!</p>
              <p class="text-slate-500 font-medium">Boarding gates are closed. The flight is in transit to the destination island.</p>
            </div>
          </div>

          <div class="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-amber-200/25">
            <span class="bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-md font-system text-xs font-black uppercase shrink-0 mt-0.5 font-bold">
              Delayed
            </span>
            <div>
              <p class="font-bold text-[#006094]">Seaplane boarding is paused!</p>
              <p class="text-slate-500 font-medium">The host is temporarily away or gates are congested. Seaplane is waiting on the standby ramp.</p>
            </div>
          </div>
        </div>

        <div class="pt-2 border-t border-amber-200/30 flex items-center justify-between text-xs text-[#85806B] font-system">
          <span>💡 Click "Status Guide" to hide this explanation legend.</span>
          <span class="font-black text-[#0084CC]">DODO AIRLINES SECURITY DEPT</span>
        </div>
      </div>
    {/if}

    <!-- Flights List Table View -->
    {#if filteredFlights.length === 0}
      <div class="bg-white border-2 border-[#0084CC]/10 rounded-[32px] py-14 text-center font-system text-slate-400">
        {#if dalStore.systemMode === 'DAL'}
          <Plane class="w-10 h-10 mx-auto mb-2 text-slate-300 animate-bounce" />
        {:else}
          <div class="text-4xl mx-auto mb-2 text-slate-300 animate-pulse">🛌</div>
        {/if}
        <p class="text-xs font-bold uppercase">NO ACTIVE DESTINATIONS REGISTERED</p>
        <p class="text-sm mt-0.5">
          {dalStore.systemMode === 'DAL' ? "Switch to 'My Flight Hub' to park your seaplane at the gate!" : "Switch to 'My Dream Hub' to share your dream!"}
        </p>
      </div>
    {:else}
      <div class="bg-white rounded-[32px] border-2 border-[#0084CC]/10 shadow-sm overflow-hidden">
        <div class="overflow-x-auto max-h-[600px]">
          <table class="w-full text-left border-collapse font-system whitespace-nowrap">
            <thead class="sticky top-0 z-10 bg-white">
              <tr class="bg-slate-50/50 border-b-2 border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <th class="px-5 py-3 text-center">Gate</th>
                <th class="px-5 py-3">Flight</th>
                <th class="px-5 py-3 text-center">Passengers</th>
                <th class="px-5 py-3 text-center">Host</th>
                <th class="px-5 py-3">Destination</th>
                <th class="px-5 py-3 pr-6 text-right"></th>
                <th class="px-5 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              {#each filteredFlights as flight (flight.id)}
                {@const isSelected = selectedFlightId === flight.id}
                {@const hasBoarded = flight.passengers.some((p: Passenger) => 
                  p.friendCode 
                    ? p.friendCode === passport.friendCode 
                    : p.name.toLowerCase() === passport.villagerName.toLowerCase()
                )}
                {@const activeTheme = dalStore.systemMode === 'DAL' ? (GATE_THEMES[flight.gate] || GATE_THEMES[1]) : (DREAM_THEMES[flight.gate] || DREAM_THEMES[1])}
                {@const planeColorVal = PLANE_COLORS.find(pc => pc.id === (flight.planeColor || 'orange')) || PLANE_COLORS[0]}
                {@const hostProfile = getHostProfile(flight.hostName, flight.islandName)}

                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <tr 
                  animate:flip={{ duration: 300 }}
                  class="group transition-all cursor-pointer hover:bg-[#FFFCEF]/60 {isSelected ? 'bg-sky-50/50 hover:bg-sky-50/50 shadow-[inset_4px_0_0_0_#0084CC]' : ''}"
                  style="--hover-color: {planeColorVal.hex}"
                  onclick={() => {
                    playSound('beep', isMuted);
                    selectedFlightId = isSelected ? null : flight.id;
                  }}
                >
                  <!-- GATE -->
                  <td class="px-5 py-3text-center">
                    <div class="flex items-center justify-center gap-2">
                      <div class="inline-flex flex-col items-center justify-center w-10 h-10 bg-[#0084CC] rounded-xl text-white font-system leading-none shadow-sm">
                        <span class="text-[9px] uppercase font-bold text-sky-200 mb-0.5">Gate</span>
                        <span class="text-[#FFCC00] font-black text-base">{flight.gate}</span>
                      </div>
                      <span class="text-xl drop-shadow-sm" title={activeTheme.name}>{activeTheme.icon}</span>
                    </div>
                  </td>
                  <!-- FLIGHT -->
                  <td class="px-5 py-3">
                    <div class="flex items-center gap-2.5">
                      {#if dalStore.systemMode === 'DAL'}
                        <Plane 
                          class="w-4 h-4 transition-colors" 
                          style="color: {isSelected ? planeColorVal.hex : 'var(--plane-color, #cbd5e1)'}"
                        />
                      {:else}
                        <span class="text-sm {isSelected ? '' : 'grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100'} transition-all">🛌</span>
                      {/if}
                      <div>
                        <div class="font-black text-[#0084CC] text-sm flex items-center gap-1.5">
                          {flight.id}
                          <span class="text-[9px] font-bold bg-[#A2D2FF]/25 text-[#006094] px-1.5 py-0.5 rounded-full leading-none">
                            {flight.hemisphere === 'Northern' ? 'N' : 'S'}
                          </span>
                        </div>
                        {#if dalStore.systemMode !== 'DAL'}
                          <div class="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                            Luna Dream
                          </div>
                        {/if}
                      </div>
                    </div>
                  </td>


                  <!-- PAS -->
                  <td class="px-5 py-3 text-center">
                    <div class="flex items-center justify-center gap-1 font-system">
                      <span class="text-xs font-bold text-[#4A4A4A]">👤 {flight.passengers.length}</span>
                      <span class="text-[10px] text-slate-400">/ {flight.capacity || (flight.planeType === 'Switch 2' ? 12 : 8)}</span>
                    </div>
                  </td>

                  <!-- HOST -->
                  <td class="px-5 py-3">
                    <div class="flex flex-col items-center gap-1 text-center">
                      <span 
                        onclick={(e) => {
                          e.stopPropagation();
                          openProfileModal(hostProfile ? hostProfile.friendCode : `SW-TEMP-${flight.hostName}-${flight.islandName}`);
                        }}
                        class="font-bold text-amber-700 hover:text-amber-900 cursor-pointer text-sm underline-offset-2 hover:underline"
                        title="View host trust profile"
                      >
                        {flight.hostName}
                      </span>
                      {#if hostProfile}
                        <span 
                          onclick={(e) => {
                            e.stopPropagation();
                            openProfileModal(hostProfile.friendCode);
                          }}
                          class="inline-flex items-center gap-1 text-[9px] font-system bg-[#E8F8F5] text-[#117A65] border border-[#A3E4D7] rounded-full px-1.5 py-0.5 font-black cursor-pointer hover:bg-[#D1F2EB]"
                          title="Good Apples count"
                        >
                          🍏 {hostProfile.goodApples || 0}
                          {#if hostProfile.rottenTurnips > 0}
                            <span class="text-rose-700"> | 🧅 {hostProfile.rottenTurnips}</span>
                          {/if}
                        </span>
                      {/if}
                    </div>
                  </td>

                  <!-- DESTINATION -->
                  <td class="px-5 py-3">
                    <div class="font-black text-[#4A4A4A] text-sm">{flight.islandName}</div>
                    <div class="text-[10px] text-slate-500 max-w-[150px] mt-0.5">"{flight.description}"</div>
                    <div class="text-[9px] text-slate-400 mt-1 font-bold tracking-wider uppercase">
                      DEPARTS: {new Date(flight.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </td>

                  <!-- ACTION -->
                  <td class="px-5 py-3 pr-6 text-right">
                    <span class="text-[#0084CC] font-system text-xs font-black inline-flex items-center gap-0.5 group-hover:underline {isSelected ? 'underline' : ''}">
                      Tickets <ChevronRight class="w-3 h-3" />
                    </span>
                  </td>

                  <!-- STATUS -->
                  <td class="px-5 py-3 text-center">
                    {#if flight.passengers.length >= (flight.capacity || (flight.planeType === 'Switch 2' ? 12 : 8))}
                      <span class="text-[10px] font-system font-black bg-amber-100 text-amber-800 border border-amber-200 px-2 py-1 rounded-full uppercase animate-pulse" title="Plane at maximum capacity. Host can board standby passengers.">
                        FULL
                      </span>
                    {:else if hasBoarded}
                      <span class="text-[10px] font-system font-black bg-green-100 text-green-700 border border-green-200 px-2 py-1 rounded-full uppercase">
                        BOARDED
                      </span>
                    {:else}
                      <span class="text-[10px] font-system font-black px-2 py-1 rounded-full {flight.status === 'Boarding' ? 'bg-[#FFCC00]/20 text-[#006094] border border-[#FFCC00] animate-pulse' : flight.status === 'Closed' || flight.status === 'Departed' ? 'bg-slate-100 text-slate-400 border border-slate-200' : 'bg-green-50 text-green-700 border border-green-200'}">
                        {flight.status.toUpperCase()}
                      </span>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  tr:hover {
    --plane-color: var(--hover-color) !important;
  }
</style>
