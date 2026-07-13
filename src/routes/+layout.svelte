<script lang="ts">
  import '../app.css';
  import { onMount, onDestroy } from 'svelte';
  // Hash routing
    let { children } = $props();

  import { fly } from 'svelte/transition';
  import { Plane, PlaneTakeoff, PlaneLanding, Ticket, Radio, Users, BookOpen, Lock, Clock, CircleQuestionMark, Unlock, Moon } from '@lucide/svelte';
  import { playSound } from '$lib/utils/audio';
  import { dalStore } from '$lib/stores/dal.svelte';
  

  import SoundToggle from '$lib/components/atoms/SoundToggle.svelte';
  import TabButton from '$lib/components/atoms/TabButton.atom.svelte';
  import TerminalHeader from '$lib/components/organisms/TerminalHeader.svelte';
  import InteractiveWelcome from '$lib/components/organisms/InteractiveWelcome.svelte';
  import LoginFlow from '$lib/components/organisms/LoginFlow.svelte';
  import PassportTopsheet from '$lib/components/organisms/PassportTopsheet.svelte';
  import AcnhBubble from '$lib/components/molecules/AcnhBubble.svelte';
  import DeparturesTab from '$lib/components/templates/DeparturesTab.svelte';
  import StandbyTab from '$lib/components/templates/StandbyTab.svelte';
  import CockpitTab from '$lib/components/templates/CockpitTab.svelte';
  import RadioTab from '$lib/components/templates/RadioTab.svelte';
  import DirectoryTab from '$lib/components/templates/DirectoryTab.svelte';
  import PassportTab from '$lib/components/templates/PassportTab.svelte';
  import TerminalFooter from '$lib/components/organisms/TerminalFooter.svelte';
  import LogoutModal from '$lib/components/organisms/LogoutModal.svelte';

  // Navigation
  let hashPath = $state('');
  let currentTab = $derived(
    hashPath.includes('islands') ? 'book' :
    hashPath.includes('standby') ? 'standby' :
    hashPath.includes('hub') ? 'hub' :
    hashPath.includes('directory') ? 'directory' : 'passport'
  );

  // Diagnostics
  let tabChangeStartTime = 0;
  let isTabChanging = $state(false);

  onMount(() => {
    // Initialize hash on load if empty
    if (!window.location.hash || window.location.hash === '#/') {
      window.location.hash = '#/passport';
    }
    hashPath = window.location.hash;

    const onHashChange = () => {
      hashPath = window.location.hash;
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  });

    let showLoginModal = $state(false);
  let showLogoutModal = $state(false);

  let pollTimer: ReturnType<typeof setInterval>;

  onMount(() => {
    dalStore.initAuth();
    dalStore.fetchState(true);

    let visitorId = localStorage.getItem('dal_visitor_id');
    if (!visitorId) {
      visitorId = `v-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem('dal_visitor_id', visitorId);
    }
    
    fetch('/wp-json/dodo-air/v1/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId })
    }).catch(err => console.error('Failed to record visit:', err));

    pollTimer = setInterval(() => {
      dalStore.fetchState(false);
    }, 30000);
  });

  onDestroy(() => {
    if (typeof clearInterval !== 'undefined') {
      
      clearInterval(pollTimer);
    }
  });

  // Sync profile when passport is created or changed (auth & contents guard optimized)
  let lastSyncedData = '';
  $effect(() => {
    if (dalStore.passport.hasCreated && dalStore.passport.friendCode && dalStore.isLoggedIn) {
      const payload = {
        villagerName: dalStore.passport.villagerName,
        islandName: dalStore.passport.islandName,
        avatarIcon: dalStore.passport.avatarIcon,
        title: `${dalStore.passport.titlePart1} ${dalStore.passport.titlePart2}`,
        signature: dalStore.passport.signature,
        colorIndex: dalStore.passport.colorIndex,
        dreamAddress: dalStore.passport.dreamAddress
      };
      const serialized = JSON.stringify(payload);
      if (serialized !== lastSyncedData) {
        lastSyncedData = serialized;
        console.log("[Diagnostic] Auto-syncing profile data changes to server...");
        fetch(`/wp-json/dodo-air/v1/profiles/${encodeURIComponent(dalStore.passport.friendCode)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: serialized
        }).catch(err => console.error("Error auto-syncing profile:", err));
      }
    }
  });


  $effect(() => {
    localStorage.setItem('dal_chat_sender', dalStore.chatSender);
    localStorage.setItem('dal_chat_island', dalStore.chatIsland);
  });

  async function handleAddSchedule(schedule: any) {
    try {
      const res = await fetch('/wp-json/dodo-air/v1/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedule)
      });
      if (res.ok) {
        const data = await res.json();
        dalStore.mySchedules = [...dalStore.mySchedules, data];
      } else {
        throw new Error('Failed to save schedule');
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async function handleDeleteSchedule(id: string) {
    try {
      const res = await fetch(`/wp-json/dodo-air/v1/schedules/${id}`, { method: 'DELETE' });
      if (res.ok) {
        dalStore.mySchedules = dalStore.mySchedules.filter(s => s.id !== id);
      } else {
        throw new Error('Failed to delete schedule');
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  import TerminalModals from '$lib/components/organisms/TerminalModals.svelte';
  import { TerminalActions } from '$lib/stores/TerminalActions';
  
  function handleSavePassport(e?: Event) {
    e?.preventDefault();
    if (!dalStore.passportForm.villagerName.trim() || !dalStore.passportForm.islandName.trim()) return;
    
    dalStore.passport = {
      ...dalStore.passportForm,
      hasCreated: true,
      hasCustomized: true
    };
    localStorage.setItem('dal_passport', JSON.stringify(dalStore.passport));
    dalStore.isEditingPassport = false;
    dalStore.showPassportDrawer = false;
    dalStore.playSound('success');
  }
  
  let activeFlights = $derived(dalStore.systemMode === 'DAL' ? dalStore.flights : dalStore.dreams);

  let myFlight = $derived(activeFlights.find(f => 
    f.status !== 'Closed' && (
      f.hostFriendCode 
        ? f.hostFriendCode === dalStore.passport.friendCode
        : (f.hostName.toLowerCase() === dalStore.passport.villagerName.toLowerCase() && f.islandName.toLowerCase() === dalStore.passport.islandName.toLowerCase())
    )
  ) || null);

  let selectedFlight = $derived(activeFlights.find(f => f.id === dalStore.selectedFlightId) || null);

  let totalPassports = $derived(Object.keys(dalStore.profiles).length);
  let totalPilots = $derived(activeFlights.length);
  let totalPassengers = $derived(activeFlights.reduce((sum, f) => sum + (f.passengers?.length || 0), 0));
  let totalStandby = $derived(dalStore.requests.length);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let formattedDay = $derived(days[liveTime.getDay()]);
  let formattedDate = $derived(`${months[liveTime.getMonth()]} ${liveTime.getDate()}, ${liveTime.getFullYear()}`);
  let formattedTime = $derived(liveTime.toTimeString().split(' ')[0]);

  let orvilleMessage = $derived(
    currentTab === 'book' ? "Hey hey! Welcome to the Departure Gates. Search for open gates or hop on standby so to put you on the radar. Let's get you checked in and set up with a Dodo Code™!" :
    currentTab === 'hub' ? "Welcome to your Private Flight Hangar! File a Flight Plan and open your gates to the skies. Pick a clear theme, and we'll scan the airwaves to match you with the perfect standby passengers!" :
    currentTab === 'directory' ? "Welcome to the DAL Flyers Directory! Check out customized passports from all our active flyers. Give a passport a tap to check trust ratings or vouch for them with a Good Apple!" :
    currentTab === 'standby' ? "Can't find an open airport gate that matches your travel itinerary? File a Standby Request above to alert online pilots looking to match passenger lists!" :
    "Hey hey! Welcome to Dodo Airlines! Here is your official Frequent Flyer Passport. Keep your details and custom title up-to-date, and make sure to stamp your Stamp Book for FF Miles!"
  );

</script>

<div class="h-screen {dalStore.systemMode === 'DAL' ? 'bg-[skyblue]' : 'bg-[#1a0b2e]'} airport-runway flex selection:bg-[#FFCC00]/40 {dalStore.systemMode === 'DAL' ? 'text-[#4A4A4A]' : 'text-purple-100'} font-sans antialiased relative overflow-hidden transition-colors duration-500">
  
  <!-- Main Left Column -->
  <div class="flex-1 flex flex-col min-w-0 h-full overflow-y-auto p-3 sm:p-4 lg:p-6 pb-28">

    <!-- Dynamic Header & Flight Control Tower -->
    <TerminalHeader>
    <!-- Sound Slider -->
    <SoundToggle isMuted={dalStore.isMuted} onToggle={() => {
      dalStore.isMuted = !dalStore.isMuted;
      if (!dalStore.isMuted) playSound('success', false);
    }} />

    <!-- Traffic Control Button -->
    <button 
      onclick={() => { playSound('beep', dalStore.isMuted); dalStore.isTrafficModalOpen = true; }}
      class="w-10 h-10 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/25 transition-all flex items-center justify-center shadow-md cursor-pointer active:scale-95 text-white"
      title="Traffic Control & Radar Center"
    >
      <Radio class="w-5 h-5" />
    </button>
    
    <!-- Mode Toggle Button -->
    <button 
      onclick={() => { playSound('beep', dalStore.isMuted); dalStore.toggleSystemMode(); }}
      class="w-10 h-10 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/25 transition-all flex items-center justify-center shadow-md cursor-pointer active:scale-95 text-white"
      title="Switch between Dodo Airlines & Luna's Dreamscape"
    >
      {#if dalStore.systemMode === 'DAL'}
        <Moon class="w-5 h-5" />
      {:else}
        <Plane class="w-5 h-5" />
      {/if}
    </button>
    
    <!-- Login/Logout Button -->
    <button
      onclick={() => { 
        playSound('beep', dalStore.isMuted); 
        if (dalStore.isLoggedIn) {
          showLogoutModal = true;
        } else {
          showLoginModal = true; 
        }
      }}
      class="w-10 h-10 rounded-2xl border transition-all flex items-center justify-center shadow-md cursor-pointer active:scale-95 text-white {dalStore.isLoggedIn ? 'border-white/10 bg-white/10 shadow-inner hover:bg-white/5' : 'border-white/20 bg-white/10 hover:bg-white/25'}"
      title={dalStore.isLoggedIn ? 'Logout' : 'Login'}
    >
      {#if dalStore.isLoggedIn}
        <Lock class="w-5 h-5 opacity-70" />
      {:else}
        <Unlock class="w-5 h-5" />
      {/if}
    </button>
  </TerminalHeader>

  <PassportTopsheet
    passport={dalStore.passport}
    bind:showPassportDrawer={dalStore.showPassportDrawer}
    setShowMilesModal={(v: boolean) => dalStore.showMilesModal = v}
    setIsEditingPassport={(v: boolean) => dalStore.isEditingPassport = v}
    isMuted={dalStore.isMuted}
    playSound={(id) => playSound(id as any, dalStore.isMuted)}
  />

  <!-- Onboarding & Login Screen: Interactive typewriter walkthrough and registration dialog -->
  {#if !dalStore.passport.hasCreated && !dalStore.isAuthChecking}
    <InteractiveWelcome
      onSavePassport={handleSavePassport}
      isMuted={dalStore.isMuted}
    />
  {/if}

  <!-- Main Terminal Grid System -->
  <div class="w-full flex-1 flex flex-col relative mt-2 gap-4">
    <main class="flex-1 flex flex-col gap-4 items-stretch min-w-0">
      
      <!-- Tab Teeth for the Header -->
      <div class="w-full flex justify-between items-start px-2 sm:px-8 lg:px-6 -mt-10 z-40 relative">
        
        <!-- Left: Area Tabs -->
        <div class="flex items-start gap-1 sm:gap-2">
          
          
          <TabButton
            active={currentTab === 'book'}
            systemMode={dalStore.systemMode}
            isMuted={dalStore.isMuted}
            onclick={() => { window.location.hash = '#/islands'; }}
          >
            <PlaneTakeoff class="w-4 h-4 sm:w-5 sm:h-5 {currentTab === 'book' ? '' : 'opacity-70'}" /> <span class="hidden sm:inline">Departures</span>
          </TabButton>

          <TabButton
            active={currentTab === 'hub'}
            systemMode={dalStore.systemMode}
            isMuted={dalStore.isMuted}
            onclick={() => { window.location.hash = '#/hub'; }}
          >
            <PlaneLanding class="w-4 h-4 sm:w-5 sm:h-5 {currentTab === 'hub' ? '' : 'opacity-70'}" /> <span class="hidden sm:inline">Arrivals</span>
            {#if myFlight}
              <span class="absolute bottom-1 right-2 w-2 h-2 bg-[#FF4747] rounded-full animate-ping"></span>
              <span class="absolute bottom-1 right-2 w-2 h-2 bg-[#FF4747] rounded-full shadow-xs"></span>
            {/if}
          </TabButton>
          
        </div>

        <div class="flex items-start gap-1 sm:gap-2">
          <TabButton
            active={currentTab === 'standby'}
            systemMode={dalStore.systemMode}
            isMuted={dalStore.isMuted}
            onclick={() => { window.location.hash = '#/standby'; }}
          >
            <Ticket class="text-base sm:text-lg {currentTab === 'standby' ? '' : 'opacity-70'}"/> <span class="hidden sm:inline">
            Travel Plan
            </span>
          </TabButton>
          <!-- Right: Ask Orville -->
          <TabButton
            active={dalStore.showOrvilleIntro}
            systemMode={dalStore.systemMode}
            isMuted={dalStore.isMuted}
            onclick={() => {
              dalStore.showOrvilleIntro = true;
              localStorage.setItem('dal_orville_intro', 'show');
            }}
            class={dalStore.showOrvilleIntro ? '' : (dalStore.systemMode === 'DAL' ? 'text-[#FFFCEF]' : 'text-[#F3E8FF]')}
          >
            <CircleQuestionMark class="text-base sm:text-lg {dalStore.showOrvilleIntro ? '' : 'opacity-80'}" /> <span class="hidden sm:inline">Ask Orville</span>
          </TabButton>
        </div>


        <div class="flex items-start gap-1 sm:gap-2">
          <TabButton
            active={currentTab === 'directory'}
            systemMode={dalStore.systemMode}
            isMuted={dalStore.isMuted}
            onclick={() => { window.location.hash = '#/directory'; }}
          >
            <Users class="w-4 h-4 sm:w-5 sm:h-5 {currentTab === 'directory' ? '' : 'opacity-70'}" /> <span class="hidden sm:inline">Directory</span>
          </TabButton>
          
          <TabButton
            active={currentTab === 'passport'}
            systemMode={dalStore.systemMode}
            isMuted={dalStore.isMuted}
            onclick={() => { window.location.hash = '#/passport'; }}
          >
            <BookOpen class="w-4 h-4 sm:w-5 sm:h-5 {currentTab === 'passport' ? '' : 'opacity-70'}" /> <span class="hidden sm:inline">Passport</span>
          </TabButton>
      </div>
      </div>

    <!-- ORVILLE'S COZY GUIDANCE SPEECH BALLOON -->
    {#if dalStore.showOrvilleIntro}
      <div class="fixed inset-0 z-[100] pointer-events-none flex flex-col justify-end p-4 pb-8 sm:p-8">
        <div transition:fly={{ y: 50, duration: 300 }} class="w-full">
          <AcnhBubble 
            title="Orville [Tour Guide]"
            dialogText={orvilleMessage}
            onDismiss={() => {
              playSound('beep', dalStore.isMuted);
              dalStore.showOrvilleIntro = false;
              localStorage.setItem('dal_orville_intro', 'hidden');
            }}
          >
            <!-- Quick actions inside the bubble -->
            <div class="flex flex-wrap gap-3 justify-end pt-2 hidden">
              <button
                onclick={() => { playSound('beep', dalStore.isMuted); dalStore.showMilesModal = true; }}
                class="btn-acnh btn-acnh-secondary px-6 py-2 text-sm rounded-full"
              >
                🎯 Open Stamp Book
              </button>
            </div>
          </AcnhBubble>
        </div>
      </div>
    {/if}

    <!-- Ask Orville Floating Helper Removed (Now a top tab) -->

        <!-- Dynamic Multi-Tab Content View -->
    <div class="w-full relative">
      <div class="{currentTab === 'passport' ? 'block' : 'hidden'}">
        <PassportTab
          passport={dalStore.passport}
          setShowMilesModal={(v) => dalStore.showMilesModal = v}
          setIsEditingPassport={(v) => dalStore.isEditingPassport = v}
          isMuted={dalStore.isMuted}
          playSound={(id) => playSound(id, dalStore.isMuted)}
        />
      </div>

      <div class="{currentTab === 'book' ? 'block' : 'hidden'}">
        <DeparturesTab
          flights={activeFlights}
          bind:selectedFlightId={dalStore.selectedFlightId}
          passport={dalStore.passport}
          profiles={dalStore.profiles}
          openProfileModal={(code) => { dalStore.playSound('beep'); dalStore.selectedFriendCode = code; }}
          isMuted={dalStore.isMuted}
        />
      </div>

      <div class="{currentTab === 'standby' ? 'block' : 'hidden'}">
        <StandbyTab
          requests={dalStore.requests}
          passport={dalStore.passport}
          profiles={dalStore.profiles}
          openProfileModal={(code) => { dalStore.playSound('beep'); dalStore.selectedFriendCode = code; }}
          handleRemoveStandbyRequest={TerminalActions.removeStandbyRequest}
          setShowStandbyModal={(v) => dalStore.showStandbyModal = v}
          isMuted={dalStore.isMuted}
          isActive={currentTab === 'standby'}
        />
      </div>

      <div class="{currentTab === 'hub' ? 'block' : 'hidden'}">
        <CockpitTab
          myFlight={myFlight!}
          passport={dalStore.passport}
          requests={dalStore.requests}
          profiles={dalStore.profiles}
          openProfileModal={(code) => { dalStore.playSound('beep'); dalStore.selectedFriendCode = code; }}
          handleHostFlight={TerminalActions.hostFlight}
          formError={dalStore.formError}
          bind:formDodo={dalStore.formDodo}
          bind:formHemisphere={dalStore.formHemisphere}
          bind:formGate={dalStore.formGate}
          bind:formDesc={dalStore.formDesc}
          bind:formPlaneType={dalStore.formPlaneType}
          isSubmittingHost={dalStore.isSubmittingHost}
          handleUpdateStatus={TerminalActions.updateStatus}
          handleLeaveFlight={TerminalActions.leaveFlight}
          handleGenerateAIReview={TerminalActions.generateAIReview}
          loadingReviewId={dalStore.loadingReviewId}
          handleClearForTakeoff={TerminalActions.clearForTakeoff}
          isMuted={dalStore.isMuted}
          mySchedules={dalStore.mySchedules}
          handleAddSchedule={TerminalActions.addSchedule}
          handleDeleteSchedule={TerminalActions.deleteSchedule}
        />
      </div>

      <div class="{currentTab === 'directory' ? 'block' : 'hidden'}">
        <DirectoryTab
          profiles={dalStore.profiles}
          openProfileModal={(code) => { dalStore.playSound('beep'); dalStore.selectedFriendCode = code; }}
          passport={dalStore.passport}
          isMuted={dalStore.isMuted}
        />
      </div>
    </div>
      {@render children()}
    </main>

    <TerminalFooter />
    </div> <!-- End Main Terminal Grid System wrapper -->
  </div> <!-- End Main Left Column -->

  <!-- Permanent Radio Sidebar Right Column -->
  <aside class="hidden xl:block w-full sm:w-[400px] shrink-0 h-full overflow-y-auto custom-scrollbar transition-colors duration-500">
    <div class="py-2 pr-1 pl-3 sm:py-4 sm:pr-4 lg:py-3 lg:pr-2 h-full">
      <RadioTab
        chatter={dalStore.chatter}
        bind:chatSender={dalStore.chatSender}
        bind:chatIsland={dalStore.chatIsland}
        bind:chatText={dalStore.chatText}
        handlePostChat={TerminalActions.postChat}
        isPostingChat={dalStore.isPostingChat}
        profiles={dalStore.profiles}
        openProfileModal={(code) => { dalStore.playSound('beep'); dalStore.selectedFriendCode = code; }}
        setShowFuelModal={(v) => showFuelModal = v}
        passport={dalStore.passport}
        isMuted={dalStore.isMuted}
      />
    </div>
  </aside>

    {#if showLoginModal}
      <LoginFlow onClose={() => showLoginModal = false} />
    {/if}

    {#if showLogoutModal}
      <LogoutModal onClose={() => showLogoutModal = false} />
    {/if}

  
<TerminalModals {handleSavePassport} openProfileModal={(code) => { dalStore.playSound('beep'); dalStore.selectedFriendCode = code; }} />
</div>
<svg class="hidden" xmlns="http://www.w3.org/2000/svg" version="1.1">
  <defs>
    <filter id="old-goo">
      <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
      <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
      <feBlend in="SourceGraphic" in2="goo" />
    </filter>
    <filter id="fancy-goo">
      <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
      <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
      <feComposite in="SourceGraphic" in2="goo" operator="atop" />
    </filter>
  </defs>
</svg>
