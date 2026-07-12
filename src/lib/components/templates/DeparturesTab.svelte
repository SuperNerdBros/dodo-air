<script lang="ts">
  import { ChevronRight, Plane, PlusCircle, X } from '@lucide/svelte';
  import type { Flight, StandbyRequest, Passport, UserProfile, Passenger } from '$lib/studio-types';
  import { playSound } from '$lib/utils/audio';
  import { GATE_THEMES, PLANE_COLORS } from '$lib/utils/constants';
  import { slide, fade } from 'svelte/transition';
  import { flip } from 'svelte/animate';

  let {
    flights,
    selectedFlightId = $bindable(null),
    passport,
    profiles,
    openProfileModal,
    requests,
    handleRemoveStandbyRequest,
    setShowStandbyModal,
    isMuted = false
  } = $props<{
    flights: Flight[];
    selectedFlightId: string | null;
    passport: Passport;
    profiles: Record<string, UserProfile>;
    openProfileModal: (friendCode: string) => void;
    requests: StandbyRequest[];
    handleRemoveStandbyRequest: (id: string) => void;
    setShowStandbyModal: (show: boolean) => void;
    isMuted?: boolean;
  }>();

  let showStatusGuide = $state(false);

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
</script>

<div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
  <!-- Departures Board - 7 Columns -->
  <div class="lg:col-span-7 space-y-4">
    <!-- Boarding Desk Heading -->
    <div id="active-departures-section" class="bg-white rounded-3xl border-2 border-[#0084CC]/10 p-4 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-sm">
      <div class="flex items-center gap-2.5">
        <span class="w-2.5 h-2.5 rounded-full bg-[#0084CC] animate-ping shrink-0"></span>
        <div class="text-left">
          <h2 class="text-base font-mono font-black tracking-wider text-[#0084CC] uppercase leading-none">
            DAL DEPARTURES FLIGHT BOARD
          </h2>
          <span class="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest mt-1 block">
            CHOOSE FLIGHT TO REVEAL BOARDING PASS
          </span>
        </div>
      </div>
      
      <div class="flex items-center gap-2">
        <button
          onclick={() => { playSound('beep', isMuted); showStatusGuide = !showStatusGuide; }}
          class="bg-[#FFFCEF] hover:bg-[#FFF9D6] border border-[#FFEAA7] rounded-full px-2.5 py-1 text-[9.5px] font-mono font-black text-amber-800 transition-all flex items-center gap-1 cursor-pointer select-none"
        >
          <span>💡</span>
          <span>Status Guide {showStatusGuide ? '▲' : '▼'}</span>
        </button>

        <span class="bg-[#A2D2FF]/20 text-[#0084CC] text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-[#0084CC]/10">
          {flights.length} SEAPLANES ACTIVE
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
          <h4 class="font-system font-black text-[11px] text-[#006094] uppercase tracking-wider font-bold">DAL Runway Status Board Legend</h4>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] text-slate-600 font-semibold leading-relaxed">
          <div class="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-amber-200/25">
            <span class="bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-md font-mono text-[8.5px] font-black uppercase shrink-0 mt-0.5 font-bold">
              Scheduled
            </span>
            <div>
              <p class="font-bold text-[#006094]">Flight plan is registered & active!</p>
              <p class="text-slate-500 font-medium">The host has listed their island. Passengers can browse details and book tickets. Gate will open shortly.</p>
            </div>
          </div>

          <div class="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-amber-200/25">
            <span class="bg-[#FFCC00]/20 text-[#006094] border border-[#FFCC00] px-1.5 py-0.5 rounded-md font-mono text-[8.5px] font-black uppercase shrink-0 mt-0.5 animate-pulse font-bold">
              Boarding
            </span>
            <div>
              <p class="font-bold text-[#006094]">Gate is open & welcoming visitors!</p>
              <p class="text-slate-500 font-medium">Clearance granted. Travelers can obtain the Dodo Code™ and board the seaplane immediately.</p>
            </div>
          </div>

          <div class="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-amber-200/25">
            <span class="bg-slate-100 text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded-md font-mono text-[8.5px] font-black uppercase shrink-0 mt-0.5 font-bold">
              Departed
            </span>
            <div>
              <p class="font-bold text-[#006094]">Seaplane is currently airborne!</p>
              <p class="text-slate-500 font-medium">Boarding gates are closed. The flight is in transit to the destination island.</p>
            </div>
          </div>

          <div class="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-amber-200/25">
            <span class="bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-md font-mono text-[8.5px] font-black uppercase shrink-0 mt-0.5 font-bold">
              Delayed
            </span>
            <div>
              <p class="font-bold text-[#006094]">Seaplane boarding is paused!</p>
              <p class="text-slate-500 font-medium">The host is temporarily away or gates are congested. Seaplane is waiting on the standby ramp.</p>
            </div>
          </div>
        </div>

        <div class="pt-2 border-t border-amber-200/30 flex items-center justify-between text-[9px] text-[#85806B] font-mono">
          <span>💡 Click "Status Guide" to hide this explanation legend.</span>
          <span class="font-black text-[#0084CC]">DODO AIRLINES SECURITY DEPT</span>
        </div>
      </div>
    {/if}

    <!-- Flights List Card Grid -->
    {#if flights.length === 0}
      <div class="bg-white border border-[#0084CC]/10 rounded-[32px] py-14 text-center font-mono text-slate-400">
        <Plane class="w-10 h-10 mx-auto mb-2 text-slate-300 animate-bounce" />
        <p class="text-xs font-bold uppercase">NO ACTIVE DESTINATIONS REGISTERED</p>
        <p class="text-[10px] mt-0.5">Switch to 'My Flight Hub' to park your seaplane at the gate!</p>
      </div>
    {:else}
      <div class="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
        {#each flights as flight (flight.id)}
          {@const isSelected = selectedFlightId === flight.id}
          {@const hasBoarded = flight.passengers.some((p: Passenger) => 
            p.friendCode 
              ? p.friendCode === passport.friendCode 
              : p.name.toLowerCase() === passport.villagerName.toLowerCase()
          )}
          {@const activeTheme = GATE_THEMES[flight.gate] || GATE_THEMES[1]}
          {@const planeColorVal = PLANE_COLORS.find(pc => pc.id === (flight.planeColor || 'orange')) || PLANE_COLORS[0]}
          {@const hostProfile = getHostProfile(flight.hostName, flight.islandName)}

          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            animate:flip={{ duration: 300 }}
            class="p-4 rounded-3xl border-2 cursor-pointer transition-all {isSelected ? 'bg-white border-[#0084CC] shadow-[0_5px_0_0_rgba(0,132,204,0.1)]' : 'bg-white hover:bg-[#FFFCEF]/40 border-[#0084CC]/10 shadow-xs'}"
            onclick={() => {
              playSound('beep', isMuted);
              selectedFlightId = isSelected ? null : flight.id;
            }}
          >
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
              
              <!-- Theme icon and Gate detail -->
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-[#0084CC] rounded-xl flex flex-col items-center justify-center font-mono text-white flex-shrink-0">
                  <span class="text-[6.5px] uppercase font-bold leading-none text-sky-200">GATE</span>
                  <span class="text-[#FFCC00] font-black text-sm leading-none font-bold">{flight.gate}</span>
                  <span class="text-[9px] leading-none">{activeTheme.icon}</span>
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center flex-wrap gap-1">
                    <span class="font-mono text-xs font-black text-[#0084CC] tracking-wider font-bold">{flight.id}</span>
                    <span class="text-[8.5px] font-mono font-bold bg-[#A2D2FF]/25 text-[#006094] px-1.5 py-0.2 rounded-full">
                      🌎 {flight.hemisphere}
                    </span>
                    {#if flight.passengers.length >= (flight.capacity || (flight.planeType === 'Switch 2' ? 12 : 8))}
                      <span class="text-[8px] font-mono font-black bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded-full uppercase animate-pulse font-bold" title="Plane at maximum capacity. Host can board standby passengers.">
                        ⚠️ COCKPIT FULL / STANDBY
                      </span>
                    {:else if hasBoarded}
                      <span class="text-[8.5px] font-mono font-black bg-green-100 text-green-700 border border-green-200 px-1.5 py-0.2 rounded-full uppercase font-bold">
                        BOARDED
                      </span>
                    {/if}
                  </div>
                  <h3 class="font-system font-black text-[#4A4A4A] mt-0.5 leading-snug font-bold">
                    {flight.islandName}
                  </h3>
                  <div class="text-[11px] text-slate-500 font-medium flex items-center flex-wrap gap-1">
                    <span 
                      onclick={(e) => {
                        e.stopPropagation();
                        openProfileModal(hostProfile ? hostProfile.friendCode : `SW-TEMP-${flight.hostName}-${flight.islandName}`);
                      }}
                      class="underline font-bold text-amber-700 hover:text-amber-900 cursor-pointer"
                      title="View host trust profile"
                    >
                      {flight.hostName}
                    </span>
                    <span>|</span>
                    <span class="italic">"{flight.description}"</span>
                    {#if hostProfile}
                      <span 
                        onclick={(e) => {
                          e.stopPropagation();
                          openProfileModal(hostProfile.friendCode);
                        }}
                        class="inline-flex items-center gap-1 ml-1.5 text-[9px] font-mono bg-[#E8F8F5] text-[#117A65] border border-[#A3E4D7] rounded-full px-1.5 py-0.2 font-black cursor-pointer hover:bg-[#D1F2EB]"
                        title="Good Apples count"
                      >
                        🍏 {hostProfile.goodApples || 0}
                        {#if hostProfile.rottenTurnips > 0}
                          <span class="text-rose-700"> | 🧅 {hostProfile.rottenTurnips}</span>
                        {/if}
                      </span>
                    {/if}
                  </div>
                  <div class="flex items-center gap-1.5 mt-1 text-[9.5px] font-mono text-slate-400">
                    <span class="font-bold flex items-center gap-0.5" style="color: {planeColorVal.hex}">
                      ✈️ {(flight.planeColor || 'orange').toUpperCase()} PLANE
                    </span>
                    <span>•</span>
                    <span class="font-bold text-slate-600">{flight.planeType || 'Switch'} ({flight.capacity || 8} seats)</span>
                  </div>
                </div>
              </div>

              <!-- Status & Boarding Trigger Button -->
              <div class="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-0 border-slate-100 pt-2.5 sm:pt-0 gap-1 shrink-0">
                
                <div class="flex items-center gap-1 font-mono">
                  <span class="text-[9px] text-slate-400">PAS:</span>
                  <span class="text-xs font-bold text-[#4A4A4A]">👤 {flight.passengers.length}</span>
                </div>

                <div class="flex items-center gap-2">
                  <span class="text-[9px] font-mono font-black px-2 py-0.5 rounded-full font-bold {flight.status === 'Boarding' ? 'bg-[#FFCC00]/20 text-[#006094] border border-[#FFCC00] animate-pulse' : flight.status === 'Closed' || flight.status === 'Departed' ? 'bg-slate-100 text-slate-400 border border-slate-200' : 'bg-green-50 text-green-700 border border-green-200'}">
                    {flight.status.toUpperCase()}
                  </span>
                  
                  <span class="text-[#0084CC] font-mono text-[10px] font-black flex items-center gap-0.5 hover:underline font-bold">
                    Tickets <ChevronRight class="w-3 h-3" />
                  </span>
                </div>

              </div>

            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Passenger Standby Desk Panel - 5 Columns -->
  <div class="lg:col-span-5 space-y-4">
    <!-- Standby Card Panel -->
    <div id="standby-lounge-section" class="bg-[#FAF8F2] rounded-[32px] border-4 border-[#E6DFC7] p-5 shadow-sm text-[#4A4A4A] text-left">
      <div class="flex items-center justify-between border-b border-[#E6DFC7] pb-2.5 mb-3">
        <div class="flex items-center gap-1.5">
          <span class="text-amber-600 text-lg">🛋️</span>
          <div>
            <h3 class="font-system font-black text-xs text-[#0084CC] uppercase leading-none font-bold">Standby Lounge Radar</h3>
            <span class="text-[8.5px] font-mono font-bold text-slate-400 uppercase">PEOPLE SEEKING FLIGHTS</span>
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
      <div class="space-y-3 max-h-[450px] overflow-y-auto pr-1">
        {#if requests.length === 0}
          <p class="text-[11px] font-mono text-center text-slate-400/80 py-8">
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
                    <span class="text-[8px] font-mono text-slate-400 font-bold">from {req.island}</span>
                    {#if getPassengerProfile(req.name, req.island)}
                      {@const p = getPassengerProfile(req.name, req.island)}
                      <span class="inline-flex items-center gap-0.5 text-[8px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full px-1.5 py-0.1 font-black">
                        🍏 {p?.goodApples || 0}
                        {#if p && p.rottenTurnips > 0}
                          <span class="text-rose-700">|🧅 {p.rottenTurnips}</span>
                        {/if}
                      </span>
                    {/if}
                  </div>
                  <p class="text-[9px] font-mono text-slate-400 uppercase font-black truncate max-w-full">
                    "{req.title}"
                  </p>

                  <div class="mt-1.5 flex items-center flex-wrap gap-1.5">
                    <span class="bg-[#A2D2FF]/20 text-[#006094] text-[8.5px] font-mono font-black px-1.5 py-0.2 rounded-full uppercase">
                      {GATE_THEMES[req.gateType]?.icon} {GATE_THEMES[req.gateType]?.name}
                    </span>
                    <span class="bg-amber-50 text-amber-700 border border-amber-100 text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded-full uppercase">
                      ⏱️ {req.timePreference}
                    </span>
                  </div>

                  <p class="text-[10.5px] text-slate-500 italic mt-1.5 leading-snug">
                    "{req.memo}"
                  </p>
                </div>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>

    <!-- Counter desk helper -->
    <div class="bg-white rounded-[32px] border-2 border-[#0084CC]/10 p-4 flex gap-3 text-left">
      <span class="text-3xl">🦤</span>
      <div class="text-xs text-[#4A4A4A]/80 leading-relaxed font-semibold">
        <strong>Orville:</strong> "Can't find an open airport gate that matches your travel itinerary? File a Standby Request above to alert online pilots looking to match passenger lists!"
      </div>
    </div>
  </div>
</div>
