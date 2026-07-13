<script lang="ts">
  import { onMount } from 'svelte';
  import { AlertCircle, Sparkles, RefreshCw, Compass } from '@lucide/svelte';
  import type { Flight, Passport, StandbyRequest, FlightStatus, UserProfile } from '$lib/studio-types';
  import { playSound } from '$lib/utils/audio';
  import { GATE_THEMES, DREAM_THEMES, PLANE_COLORS } from '$lib/utils/constants';
  import { dalStore } from '$lib/stores/dal.svelte';
  import { DIALOGS } from '$lib/constants/dialogs';
  import AcnhBubble from '$lib/components/molecules/AcnhBubble.svelte';

  let {
    myFlight,
    handleHostFlight,
    formError = '',
    formDodo = $bindable(''),
    formHemisphere = $bindable('Northern'),
    formGate = $bindable(1),
    formDesc = $bindable(''),
    formPlaneType = $bindable<'Switch' | 'Switch 2'>('Switch'),
    isSubmittingHost = false,
    passport,
    handleUpdateStatus,
    handleLeaveFlight,
    handleGenerateAIReview,
    loadingReviewId = null,
    requests,
    handleClearForTakeoff,
    profiles,
    openProfileModal,
    isMuted = false,
    mySchedules = [],
    handleAddSchedule,
    handleDeleteSchedule,
    isActive,
  } = $props<{
    myFlight: Flight | null;
    handleHostFlight: (e: SubmitEvent) => void;
    formError?: string;
    formDodo: string;
    formHemisphere: 'Northern' | 'Southern';
    formGate: number;
    formDesc: string;
    formPlaneType?: 'Switch' | 'Switch 2';
    isSubmittingHost?: boolean;
    passport: Passport;
    handleUpdateStatus: (flightId: string, status: FlightStatus, dodoCode?: string) => void;
    handleLeaveFlight: (flightId: string, passengerId: string) => void;
    handleGenerateAIReview: (flightId: string) => void;
    loadingReviewId?: string | null;
    requests: StandbyRequest[];
    handleClearForTakeoff: (match: StandbyRequest, flightId: string) => void;
    profiles: Record<string, UserProfile>;
    openProfileModal: (friendCode: string) => void;
    isMuted?: boolean;
    mySchedules?: any[];
    handleAddSchedule?: (e: Event, dateStr: string) => void;
    handleDeleteSchedule?: (scheduleId: string) => void;
    isActive?: boolean;
  }>();

  let activeGateTheme = $derived(dalStore.systemMode === 'DAL' ? (GATE_THEMES[formGate] || GATE_THEMES[1]) : (DREAM_THEMES[formGate] || DREAM_THEMES[1]));

  function getPassengerProfile(name: string, island: string) {
    return (Object.values(profiles) as UserProfile[]).find(
      p => p.villagerName.toLowerCase() === name.toLowerCase() && 
           p.islandName.toLowerCase() === island.toLowerCase()
    );
  }

  let pendingDodoCode = $state('');

  function handleProvideDodoCode(code: string) {
    if (!myFlight) return;
    const cleanDodo = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleanDodo.length !== 5) {
      alert('Dodo Code must be exactly 5 characters (A-Z, 0-9).');
      return;
    }
    handleUpdateStatus(myFlight.id, 'Boarding', cleanDodo);
  }

  onMount(() => {
    const renderTime = performance.now();
    console.log(`[Diagnostic] CockpitTab mounted and rendered at ${renderTime.toFixed(2)}ms`);
  });
</script>

<div class="w-100 mx-auto pt-5">
  <!-- Unregistered or not currently hosting seaplane layout -->
  {#if !myFlight}
      <AcnhBubble 
        title={dalStore.systemMode === 'DAL' ? 'Orville & Wilbur' : 'Luna'}
        dialogText={dalStore.systemMode === 'DAL' 
          ? DIALOGS.cockpitTab.dalIntro 
          : DIALOGS.cockpitTab.lunaIntro}
      >
        <div class="mt-4 flex justify-center">
          <button
            onclick={() => { playSound('beep', isMuted); dalStore.hubWizardInitialStep = 1; dalStore.showHubModal = true; }}
            class="w-full max-w-sm {dalStore.systemMode === 'DAL' ? 'bg-[#FFCC00] hover:bg-[#FFD11A] text-[#006094] border-[#CC9900]' : 'bg-[#DDA0DD] hover:bg-[#e8b5e8] text-[#4B0082] border-[#ba80ba]'} font-system font-black py-3 rounded-2xl border-b-4 shadow transition-all uppercase tracking-wide text-xs cursor-pointer active:translate-y-1 active:border-b-0"
          >
            {dalStore.systemMode === 'DAL' ? '📡 Prepare Flight Plan' : '✨ Prepare Dream State'}
          </button>
        </div>
      </AcnhBubble>
    <div class="mt-5 bg-white rounded-[36px] border-4 border-[#0084CC]/10 shadow-[0_8px_0_0_rgba(0,132,204,0.05)] p-6 text-center space-y-6 text-left">
      <!-- Hangar Illustrative Header -->
      <div class="max-w-xs mx-auto">
        <div class="w-20 h-20 {dalStore.systemMode === 'DAL' ? 'bg-[#F0F9FF] border-[#0084CC]' : 'bg-purple-50 border-[#4B0082]'} border-2 rounded-full flex items-center justify-center text-5xl mx-auto shadow relative transform -rotate-12 transition-colors duration-500">
          {dalStore.systemMode === 'DAL' ? '🛩️' : '🛌'}
          <div class="absolute -bottom-1 -right-1 {dalStore.systemMode === 'DAL' ? 'bg-[#FFCC00] text-[#006094]' : 'bg-[#DDA0DD] text-[#4B0082]'} text-xs font-system font-black px-1.5 py-0.5 rounded-full border border-white uppercase transition-colors duration-500">
            {dalStore.systemMode === 'DAL' ? 'DAL-X' : 'LUNA'}
          </div>
        </div>
      </div>

      <div>
        <h2 class="text-xl font-black {dalStore.systemMode === 'DAL' ? 'text-[#0084CC]' : 'text-[#4B0082]'} text-center font-bold">
          {dalStore.systemMode === 'DAL' ? 'Your Private DAL Seaplane Hangar' : 'Your Personal Dream State'}
        </h2>
        <p class="text-xs text-slate-400 font-system mt-1 uppercase tracking-wider font-bold text-center">
          {dalStore.systemMode === 'DAL' ? 'PARKED & FUELED - READY TO WELCOME VISITORS' : 'BED PREPARED - READY TO SHARE YOUR DREAM'}
        </p>
        
        <!-- XP Progression Display -->
        <div class="flex items-center justify-center gap-4 mt-4">
          <div class="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-2.5 text-slate-600 font-system shadow-sm flex items-center gap-3">
            <div class="bg-amber-100 text-amber-500 w-8 h-8 rounded-full flex items-center justify-center shadow-inner text-sm">
              <Sparkles class="w-4 h-4 fill-current" />
            </div>
            <div class="text-left leading-tight">
              <span class="block text-[9px] text-slate-400 uppercase font-black tracking-wider">LIFETIME XP</span>
              <span class="font-bold text-sm text-[#0084CC]">{dalStore.passport.xp?.toLocaleString() || 0} <span class="text-[10px] text-slate-400">XP</span></span>
            </div>
          </div>
        </div>
      </div>


    </div>
  {:else}
      {#if !myFlight.dodoCode && isActive}
        <AcnhBubble 
          title={dalStore.systemMode === 'DAL' ? 'Wilbur' : 'Luna'}
          dialogText={dalStore.systemMode === 'DAL'
            ? DIALOGS.cockpitTab.dalScheduled
            : DIALOGS.cockpitTab.lunaScheduled}
        >
          <div class="flex gap-2 max-w-sm mt-3">
            <input
              type="text"
              bind:value={pendingDodoCode}
              placeholder={dalStore.systemMode === 'DAL' ? 'e.g. D0D01' : 'e.g. DZ123'}
              class="flex-1 bg-white border border-[#E6DFC7] rounded-xl px-3 py-2 text-xs font-system font-black tracking-widest uppercase outline-none focus:border-[#0084CC] text-center"
              maxlength="5"
            />
            <button
              onclick={() => handleProvideDodoCode(pendingDodoCode)}
              class="bg-[#FFCC00] hover:bg-[#FFD11A] text-[#006094] border-[#CC9900] border-b-4 font-system font-black px-4 py-2 rounded-xl text-xs uppercase cursor-pointer"
            >
              {dalStore.systemMode === 'DAL' ? 'Submit' : 'Awaken'}
            </button>
          </div>
        </AcnhBubble>
      {/if}
    <!-- Active hosting cockpit panel -->
    <div class="space-y-5 text-left mt-5">
      <!-- Cockpit Card Header -->
      <div class="{dalStore.systemMode === 'DAL' ? 'bg-[#006094] border-[#FFCC00]' : 'bg-[#4B0082] border-[#DDA0DD]'} text-white rounded-[32px] p-5 shadow border-b-4 relative overflow-hidden transition-colors duration-500">
        <div class="absolute right-0 top-0 opacity-10 text-9xl pointer-events-none select-none">
          {dalStore.systemMode === 'DAL' ? '🛩️' : '🛌'}
        </div>
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div>
            <span class="{dalStore.systemMode === 'DAL' ? 'bg-[#FFCC00] text-[#006094]' : 'bg-[#DDA0DD] text-[#4B0082]'} text-xs font-black tracking-widest px-2.5 py-0.5 rounded-full font-system uppercase font-bold transition-colors">
              {dalStore.systemMode === 'DAL' ? 'ACTIVE PILOT CONSOLE' : 'ACTIVE DREAM STATE'}
            </span>
            <h2 class="text-2xl font-black font-system tracking-normal mt-1 font-bold">
              {dalStore.systemMode === 'DAL' ? 'Flight' : 'Dream'} {myFlight.id} {dalStore.systemMode === 'DAL' ? 'to' : 'at'} '{myFlight.islandName}'
            </h2>
            <p class="text-xs {dalStore.systemMode === 'DAL' ? 'text-sky-200' : 'text-purple-200'} mt-0.5">
              Island host: <strong>{myFlight.hostName}</strong> | {dalStore.systemMode === 'DAL' ? 'Gate' : 'Dream'} Theme: <strong>{(dalStore.systemMode === 'DAL' ? (GATE_THEMES[myFlight.gate] || GATE_THEMES[1]) : (DREAM_THEMES[myFlight.gate] || DREAM_THEMES[1])).name}</strong>
            </p>
          </div>

          <!-- Code security indicator -->
          <div class="bg-black/20 border border-white/10 p-3 rounded-2xl text-center font-system">
            <span class="block text-xs {dalStore.systemMode === 'DAL' ? 'text-sky-200' : 'text-purple-200'} font-bold uppercase">
              {dalStore.systemMode === 'DAL' ? 'My Dodo Code' : 'My Doze Code'}
            </span>
            <span class="text-2xl font-black {dalStore.systemMode === 'DAL' ? 'text-[#FFCC00]' : 'text-[#DDA0DD]'} tracking-widest leading-none mt-0.5 block uppercase font-bold">
              {myFlight.dodoCode || 'TBD'}
            </span>
          </div>
        </div>
      </div>

      <!-- Cockpit controls grid -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        <!-- Left Column: Core Status Control and Passenger Manifest -->
        <div class="md:col-span-7 space-y-4">
          <!-- Gate Controller Status board -->
          <div class="bg-white rounded-[32px] p-5 border-2 {dalStore.systemMode === 'DAL' ? 'border-[#0084CC]/10' : 'border-[#4B0082]/10'} shadow-sm space-y-4 transition-colors">
            <h3 class="font-system font-black text-xs {dalStore.systemMode === 'DAL' ? 'text-[#0084CC]' : 'text-[#4B0082]'} uppercase tracking-wide border-b border-slate-100 pb-2 font-bold transition-colors">
              {dalStore.systemMode === 'DAL' ? '🚦 Seaplane Runway Controllers' : '🛌 Dream State Controllers'}
            </h3>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              {#each ['Scheduled', 'Boarding', 'Departed', 'Delayed'] as FlightStatus[] as status}
                {@const isActive = myFlight.status === status}
                <button
                  onclick={() => {
                    playSound('beep', isMuted);
                    if (!myFlight.dodoCode && (status === 'Boarding' || status === 'Departed')) {
                      alert(dalStore.systemMode === 'DAL' ? 'Please provide a Dodo Code first!' : 'Please provide a Doze Code first!');
                      return;
                    }
                    handleUpdateStatus(myFlight.id, status);
                  }}
                  class="py-2 rounded-xl font-system font-black border transition-all text-sm cursor-pointer font-bold {isActive ? 'bg-[#FFCC00] text-[#006094] border-2 border-[#0084CC] shadow scale-105' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-400'}"
                >
                  {status.toUpperCase()}
                </button>
              {/each}
            </div>
          </div>

          {#if myFlight.status === 'Scheduled'}
            <div class="mt-4">
              <div class="bg-[#FFFCEF] rounded-[32px] border-4 border-[#FFEAA7] p-5 shadow-sm text-left">
                <div class="flex items-start gap-4">
                  <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-inner border-2 border-[#D1BFAe] shrink-0">
                    {dalStore.systemMode === 'DAL' ? '🦤' : '🔮'}
                  </div>
                  <div>
                    <h3 class="font-system font-black text-sm {dalStore.systemMode === 'DAL' ? 'text-[#0084CC]' : 'text-[#4B0082]'} uppercase tracking-wide">
                      {dalStore.systemMode === 'DAL' ? 'Flight Schedule Active' : 'Dream Schedule Active'}
                    </h3>
                    <p class="text-xs text-slate-600 mt-1 mb-3 font-medium leading-relaxed">
                      {#if dalStore.systemMode === 'DAL'}
                        "Roger that! You have {dalStore.mySchedules.length} routine flight times registered. Keep your Dodo Code blank when offline, and we'll automatically notify standby passengers during these hours!"
                      {:else}
                        "Your dream is scheduled... You have {dalStore.mySchedules.length} slumber times registered. Others will be drawn to your island during these peaceful moments."
                      {/if}
                    </p>
                    <button
                      onclick={() => { playSound('beep', isMuted); dalStore.hubWizardInitialStep = 5; dalStore.showHubModal = true; }}
                      class="bg-white hover:bg-slate-50 text-[#4A4A4A] border-2 border-[#FFEAA7] font-system font-black px-4 py-2 rounded-xl text-xs uppercase cursor-pointer transition-all shadow-sm active:translate-y-0.5"
                    >
                      ✏️ Edit Schedule
                    </button>
                  </div>
                </div>
              </div>
            </div>
          {/if}

          <!-- Passenger Manifest Checked-In List -->
          <div class="bg-white rounded-[32px] p-5 border-2 {dalStore.systemMode === 'DAL' ? 'border-[#0084CC]/10' : 'border-[#4B0082]/10'} shadow-sm transition-colors">
            <div class="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <h3 class="font-system font-black text-xs {dalStore.systemMode === 'DAL' ? 'text-[#0084CC]' : 'text-[#4B0082]'} uppercase tracking-wide font-bold transition-colors">
                {dalStore.systemMode === 'DAL' ? '🎟️ Passenger Flight Manifest' : '😴 Dreamer Manifest'}
              </h3>
              <span class="font-system text-sm text-[#0084CC] font-bold">
                BOARDED: {myFlight.passengers.length} SEATS
              </span>
            </div>

            {#if myFlight.passengers.length === 0}
              <div class="py-8 text-center font-system text-slate-400 text-xs">
                No passengers have checked in at Gate {myFlight.gate} yet. Runways are clear!
              </div>
            {:else}
              <div class="space-y-2">
                {#each myFlight.passengers as p (p.id)}
                  <div class="flex items-center justify-between bg-[#FAF8F2] border border-[#E6DFC7]/50 p-2.5 rounded-2xl">
                    <div class="flex items-center gap-2">
                      <span class="text-lg">👤</span>
                      <div class="text-xs text-left">
                        <span class="font-system font-black text-slate-700 block font-bold">{p.name}</span>
                        <span class="text-xs font-system text-slate-400 block">from {p.island}</span>
                      </div>
                    </div>

                    <button
                      onclick={() => { playSound('beep', isMuted); handleLeaveFlight(myFlight.id, p.id); }}
                      class="bg-slate-200 hover:bg-slate-300 text-[#4A4A4A] font-system text-xs font-black px-2 py-1 rounded-full border-b border-slate-400 cursor-pointer font-bold border-none"
                    >
                      Return Home
                    </button>
                  </div>
                {/each}
              </div>
            {/if}
          </div>

          <!-- Loudspeaker Broadcast announcement and AI brochure review -->
          <div class="bg-white rounded-[32px] p-5 border-2 border-[#0084CC]/10 shadow-sm space-y-4">
            <div class="border-b border-slate-100 pb-2">
              <h3 class="font-system font-black text-xs text-[#0084CC] uppercase tracking-wide font-bold">
                📢 Airport Loudspeaker Feed
              </h3>
            </div>

            <div class="bg-[#FAF8F2] p-3 rounded-2xl border border-[#E6DFC7]/50 text-xs text-slate-600 font-system italic leading-relaxed text-left">
              "{myFlight.announcement || "Attention passengers! Hangar seaplane prepares for flight checklist."}"
            </div>

            <!-- AI Review segment -->
            {#if myFlight.review}
              <div class="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200/50 p-4 rounded-[24px] space-y-2">
                <h4 class="font-system font-black text-[#D35400] text-xs flex items-center gap-1 font-bold">
                  <Sparkles class="w-4 h-4 text-amber-500 fill-amber-500" />
                  Orville's Official Island Travel Review
                </h4>
                <p class="text-slate-600 text-xs italic font-sans leading-relaxed text-left font-semibold">
                  "{myFlight.review}"
                </p>
              </div>
            {:else}
              <div class="bg-[#A2D2FF]/10 border border-[#0084CC]/10 p-4 rounded-[24px] text-center">
                <p class="text-sm text-slate-500 mb-2 leading-relaxed font-semibold">
                  Ask Orville to compile Wilbur's flight deck observations and publish an official Travel Review brochure!
                </p>
                <button
                  onclick={() => handleGenerateAIReview(myFlight.id)}
                  disabled={loadingReviewId !== null}
                  class="btn-acnh btn-acnh-primary w-full text-xs"
                >
                  {#if loadingReviewId === myFlight.id}
                    <RefreshCw class="w-3.5 h-3.5 animate-spin" />
                  {:else}
                    <Sparkles class="w-3.5 h-3.5 text-[#FFCC00] fill-[#FFCC00]" />
                  {/if}
                  Draft AI Travel Review Brochure
                </button>
              </div>
            {/if}
          </div>

        </div>

        <!-- Right Column: Dynamic Matchmaker Radar (Orville's Desk matching) -->
        <div class="md:col-span-5 space-y-4">
          <!-- MATCHMAKER COMPONENT -->
          <div class="bg-[#FFFCEF] rounded-[32px] border-4 border-[#FFEAA7] p-4 shadow-sm text-[#4A4A4A]">
            <div class="flex items-center gap-2 border-b border-[#FFEAA7] pb-2 mb-3">
              <span class="text-xl">🦤</span>
              <div>
                <h3 class="font-system font-black text-xs text-[#0084CC] uppercase leading-none font-bold">Smart Flight Matchmaker</h3>
                <span class="text-xs font-system text-slate-400 font-bold uppercase mt-0.5 block">ORVILLE'S MATCH COUNTER</span>
              </div>
            </div>

            <!-- Search standby requests that match host's flight gate -->
            {#if requests.filter((r: StandbyRequest) => r.gateType === myFlight.gate).length === 0}
              <div class="text-center py-8 text-slate-400 font-system text-xs space-y-2">
                <Compass class="w-8 h-8 text-slate-300 mx-auto animate-spin" />
                <p class="uppercase font-bold">Scanning Airwaves...</p>
                <p class="text-sm leading-relaxed">No standby flyers are looking for Gate Category {myFlight.gate} at the moment. Keep radar active!</p>
              </div>
            {:else}
              <div class="space-y-3">
                <div class="bg-white/80 p-2.5 rounded-2xl border border-[#FFEAA7] text-xs text-[#4A4A4A] text-left font-semibold">
                  💡 <strong>Orville:</strong> "Look! We have standby passengers looking to match your flight's category! Clear them for immediate boarding!"
                </div>

                {#each requests.filter((r: StandbyRequest) => r.gateType === myFlight.gate) as match (match.id)}
                  <div class="bg-white p-3 rounded-2xl border-2 border-[#0084CC]/20 shadow-xs space-y-2 text-left">
                    <div class="flex items-start gap-2">
                      <span class="text-xl">{match.avatar}</span>
                      <div class="text-left">
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <span 
                          onclick={() => {
                            const p = getPassengerProfile(match.name, match.island);
                            openProfileModal(p ? p.friendCode : match.friendCode || `SW-TEMP-${match.name}-${match.island}`);
                          }}
                          class="font-system font-black text-xs block text-[#0084CC] hover:underline cursor-pointer font-bold"
                        >
                          {match.name}
                        </span>
                        <span class="text-xs text-slate-400 font-system leading-none">from {match.island}</span>
                      </div>
                    </div>
                    
                    <p class="text-sm text-slate-500 italic">
                      "{match.memo}"
                    </p>

                    <button
                      onclick={() => { playSound('beep', isMuted); handleClearForTakeoff(match, myFlight.id); }}
                      class="w-full bg-[#137333] hover:bg-[#0f5d29] text-white font-system font-black py-2 rounded-xl text-sm uppercase shadow flex items-center justify-center gap-1 cursor-pointer font-bold border-none"
                    >
                      💚 Clear for Takeoff & Board
                    </button>
                  </div>
                {/each}
              </div>
            {/if}
          </div>

          <!-- Close Flight Plan Desk -->
          <button
            onclick={() => { playSound('beep', isMuted); handleUpdateStatus(myFlight.id, 'Closed'); }}
            class="w-full bg-red-50 hover:bg-red-100 text-red-600 font-system font-black py-3 rounded-2xl shadow border border-red-200 text-xs text-center block cursor-pointer font-bold"
          >
            {dalStore.systemMode === 'DAL' ? '⛔ CLOSE GATE & ARCHIVE FLIGHT RUNWAY' : '⛔ WAKE UP & ARCHIVE DREAM'}
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
