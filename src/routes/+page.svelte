<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { slide, fade } from 'svelte/transition';
  import { Plane, Calendar, Clock, Ticket, Radio, RefreshCw, Users, Moon, CloudMoon } from '@lucide/svelte';
  import type { Flight, FlightStatus, Passport, StandbyRequest, UserProfile, FeedbackReview, ChatterMessage } from '$lib/studio-types';
  import { playSound } from '$lib/utils/audio';
  import { STAMP_CHALLENGES, generateRandomFriendCode } from '$lib/utils/constants';
  import { dalStore } from '$lib/stores/dal.svelte';

  import SoundToggle from '$lib/components/atoms/SoundToggle.svelte';
  import TerminalHeader from '$lib/components/organisms/TerminalHeader.svelte';
  import OnboardingOverlay from '$lib/components/organisms/OnboardingOverlay.svelte';
  import PassportEditModal from '$lib/components/organisms/PassportEditModal.svelte';
  import PassportBadgeDropdown from '$lib/components/molecules/PassportBadgeDropdown.svelte';
  import FuelDepotModal from '$lib/components/organisms/FuelDepotModal.svelte';
  import StandbyTicketModal from '$lib/components/molecules/StandbyTicketModal.svelte';
  import BoardingPassModal from '$lib/components/organisms/BoardingPassModal.svelte';
  import MilesStampBook from '$lib/components/organisms/MilesStampBook.svelte';
  import TrustProfileModal from '$lib/components/organisms/TrustProfileModal.svelte';
  import DeparturesTab from '$lib/components/templates/DeparturesTab.svelte';
  import CockpitTab from '$lib/components/templates/CockpitTab.svelte';
  import RadioTab from '$lib/components/templates/RadioTab.svelte';
  import DirectoryTab from '$lib/components/templates/DirectoryTab.svelte';

  // Navigation
  let currentTab = $state<'book' | 'hub' | 'radio' | 'directory'>('book');

  // State variables
  let flights = $state<Flight[]>([]);
  let dreams = $state<Flight[]>([]);
  let requests = $state<StandbyRequest[]>([]);
  let chatter = $state<ChatterMessage[]>([]);
  let selectedFlightId = $state<string | null>(null);

  let isMuted = $state(false);
  let isSyncing = $state(false);

  // Analytics State
  let views = $state<number>(0);
  let visitors = $state<number>(0);

  // Community Trust & Profiles state
  let profiles = $state<Record<string, UserProfile>>({});
  let selectedFriendCode = $state<string | null>(null);
  let selectedProfileReviews = $state<FeedbackReview[]>([]);
  let isSubmittingReview = $state(false);
  let reviewError = $state('');

  // Passport state
  let passport = $state<Passport>({
    villagerName: '',
    islandName: '',
    titlePart1: 'Freshly Picked',
    titlePart2: 'Islander',
    friendCode: generateRandomFriendCode(),
    avatarIcon: '🦤',
    signature: 'Wings up, skies clear!',
    hasCreated: false,
    colorIndex: 1,
    miles: 2000,
    claimedStampIds: [],
    hasBoarded: false,
    hasHosted: false,
    hasChatted: false,
    hasCustomized: false,
    hasRequested: false,
    planeType: 'Switch',
    planeColor: 'orange'
  });

  let isEditingPassport = $state(false);
  let showPassportDrawer = $state(false);
  let showMilesModal = $state(false);
  let showOrvilleIntro = $state(true);

  // Milestone tracking helper
  function earnStampProgress(field: 'hasBoarded' | 'hasHosted' | 'hasChatted' | 'hasCustomized' | 'hasRequested') {
    if (!passport.hasCreated) return;
    if (passport[field]) return; // already earned

    passport = { ...passport, [field]: true };
    localStorage.setItem('dal_passport', JSON.stringify(passport));
    playSound('success', isMuted);
  }

  // Stamp claiming helper
  function claimStampMiles(stampId: string, amount: number) {
    const currentClaimed = passport.claimedStampIds || [];
    if (currentClaimed.includes(stampId)) return;

    passport = {
      ...passport,
      miles: (passport.miles || 0) + amount,
      claimedStampIds: [...currentClaimed, stampId]
    };
    localStorage.setItem('dal_passport', JSON.stringify(passport));
    playSound('success', isMuted);
  }

  async function handleSavePassport(updated: Passport) {
    passport = updated;
    localStorage.setItem('dal_passport', JSON.stringify(updated));
    isEditingPassport = false;
    showPassportDrawer = false;
    playSound('success', isMuted);

    // Sync to persistent server profiles
    try {
      await fetch(`/wp-json/dodo-air/v1/profiles/${encodeURIComponent(updated.friendCode)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          villagerName: updated.villagerName,
          islandName: updated.islandName,
          avatarIcon: updated.avatarIcon,
          title: `${updated.titlePart1} ${updated.titlePart2}`,
          signature: updated.signature,
          colorIndex: updated.colorIndex,
          dreamAddress: updated.dreamAddress
        })
      });
      // Refresh the system state immediately to update the counter
      await fetchState(false);
    } catch (err) {
      console.error("Failed to sync profile to server:", err);
    }
  }

  // Host Form State (My private seaplane DAL-X)
  let formDodo = $state('');
  let formHemisphere = $state<'Northern' | 'Southern'>('Northern');
  let formGate = $state<number>(1);
  let formDesc = $state('');
  let formError = $state('');
  let isSubmittingHost = $state(false);

  // Standby Ticket Request Form state
  let requestGateType = $state<number>(1);
  let requestTime = $state<string>('Online Now');
  let requestMemo = $state<string>('');
  let showStandbyModal = $state(false);
  let requestError = $state('');
  let isSubmittingRequest = $state(false);

  // Passenger Quick Check-In Inputs
  let boardingError = $state('');

  // Terminal chat state
  let chatSender = $state('');
  let chatIsland = $state('');
  let chatText = $state('');
  let isPostingChat = $state(false);

  // Reveal dodo codes tracking
  let revealedCodes = $state<Record<string, boolean>>({});
  let loadingReviewId = $state<string | null>(null);

  // Community AI Fuel coffer state
  let aiFuel = $state<{ aiTokens: number; maxTokens: number }>({ aiTokens: 15000, maxTokens: 20000 });
  let isRefueling = $state(false);
  let showFuelModal = $state(false);

  async function handleRefuel(amount: number) {
    playSound('success', isMuted);
    isRefueling = true;
    try {
      const res = await fetch('/wp-json/dodo-air/v1/ai/refuel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      if (res.ok) {
        const data = await res.json();
        aiFuel = { aiTokens: data.aiTokens, maxTokens: data.maxTokens };
        // Force state reload to fetch system log in radio tab
        await fetchState(true);
      }
    } catch (err) {
      console.error("Failed to refuel:", err);
    } finally {
      isRefueling = false;
    }
  }

  let liveTime = $state(new Date());
  let clockTimer: ReturnType<typeof setInterval>;
  let pollTimer: ReturnType<typeof setInterval>;

  // Fetch airport terminal database
  async function fetchState(showIndicator = false) {
    if (showIndicator) isSyncing = true;
    try {
      const res = await fetch('/wp-json/dodo-air/v1/state');
      if (res.ok) {
        const data = await res.json();
        flights = data.flights || [];
        dreams = data.dreams || [];
        chatter = data.chatter || [];
        requests = data.requests || [];
        profiles = data.profiles || {};
        if (data.aiFuel) {
          aiFuel = data.aiFuel;
        }
        if (data.analytics) {
          views = data.analytics.views || 0;
          visitors = data.analytics.visitors || 0;
        }
      }
    } catch (err) {
      console.error('Failed to sync state:', err);
    } finally {
      if (showIndicator) {
        setTimeout(() => isSyncing = false, 500);
      }
    }
  }

  onMount(() => {
    try {
      const saved = localStorage.getItem('dal_passport');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.villagerName || parsed.hasCreated) {
          passport = {
            miles: 2000,
            claimedStampIds: [],
            hasBoarded: false,
            hasHosted: false,
            hasChatted: false,
            hasCustomized: false,
            hasRequested: false,
            planeType: 'Switch',
            planeColor: 'orange',
            ...parsed
          };
        }
      }
    } catch (e) {
      console.error(e);
    }

    showOrvilleIntro = localStorage.getItem('dal_orville_intro') !== 'hidden';
    chatSender = localStorage.getItem('dal_chat_sender') || (passport.hasCreated ? passport.villagerName : '');
    chatIsland = localStorage.getItem('dal_chat_island') || (passport.hasCreated ? passport.islandName : '');

    let visitorId = localStorage.getItem('dal_visitor_id');
    if (!visitorId) {
      visitorId = `v-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem('dal_visitor_id', visitorId);
    }
    
    fetch('/wp-json/dodo-air/v1/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId })
    })
    .then(res => {
      if (res.ok) return res.json();
    })
    .then(data => {
      if (data) {
        views = data.views || 0;
        visitors = data.visitors || 0;
      }
    })
    .catch(err => console.error('Failed to record visit:', err));

    fetchState(true);

    clockTimer = setInterval(() => {
      liveTime = new Date();
    }, 1000);

    pollTimer = setInterval(() => {
      fetchState(false);
    }, 5000);
  });

  onDestroy(() => {
    if (typeof clearInterval !== 'undefined') {
      clearInterval(clockTimer);
      clearInterval(pollTimer);
    }
  });

  // Sync profile when passport is created or changed
  $effect(() => {
    if (passport.hasCreated && passport.friendCode) {
      fetch(`/wp-json/dodo-air/v1/profiles/${encodeURIComponent(passport.friendCode)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          villagerName: passport.villagerName,
          islandName: passport.islandName,
          avatarIcon: passport.avatarIcon,
          title: `${passport.titlePart1} ${passport.titlePart2}`,
          signature: passport.signature,
          colorIndex: passport.colorIndex,
          dreamAddress: passport.dreamAddress
        })
      }).catch(err => console.error("Error auto-syncing profile:", err));
    }
  });

  $effect(() => {
    localStorage.setItem('dal_chat_sender', chatSender);
    localStorage.setItem('dal_chat_island', chatIsland);
  });

  async function openProfileModal(friendCode: string) {
    playSound('beep', isMuted);
    selectedFriendCode = friendCode;
    reviewError = '';
    
    try {
      const res = await fetch(`/wp-json/dodo-air/v1/profiles/${encodeURIComponent(friendCode)}/reviews`);
      if (res.ok) {
        const data = await res.json();
        selectedProfileReviews = data;
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  }

  async function handleSubmitReview(ratingType: 'apple' | 'turnip', comment: string) {
    if (!selectedFriendCode) return;
    if (!passport.hasCreated) {
      reviewError = "You must print your custom Passport at the dispatch counter before submitting trust feedback!";
      return;
    }
    if (passport.friendCode === selectedFriendCode) {
      reviewError = "You cannot rate your own island profile!";
      return;
    }

    isSubmittingReview = true;
    reviewError = '';
    try {
      const res = await fetch(`/wp-json/dodo-air/v1/profiles/${encodeURIComponent(selectedFriendCode)}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ratingType,
          voterName: passport.villagerName,
          voterIsland: passport.islandName,
          voterFriendCode: passport.friendCode,
          comment
        })
      });

      if (res.ok) {
        playSound('success', isMuted);
        const reviewsRes = await fetch(`/wp-json/dodo-air/v1/profiles/${encodeURIComponent(selectedFriendCode)}/reviews`);
        if (reviewsRes.ok) {
          const revs = await reviewsRes.json();
          selectedProfileReviews = revs;
        }
        await fetchState(false);
      } else {
        const errObj = await res.json();
        reviewError = errObj.error || "Failed to submit rating.";
      }
    } catch (err) {
      reviewError = "Network error while submitting rating.";
    } finally {
      isSubmittingReview = false;
    }
  }

  function handleReveal(flightId: string) {
    playSound('success', isMuted);
    revealedCodes = { ...revealedCodes, [flightId]: true };
  }

  async function handleHostFlight(e: SubmitEvent) {
    e.preventDefault();
    formError = '';

    if (!passport.hasCreated) {
      formError = 'Please save your Frequent Flyer Passport first!';
      playSound('beep', isMuted);
      return;
    }

    if (!formDodo.trim()) {
      formError = 'Please enter a valid 5-character Dodo Code.';
      playSound('beep', isMuted);
      return;
    }

    const cleanDodo = formDodo.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleanDodo.length !== 5) {
      formError = 'Dodo Code must be exactly 5 characters (A-Z, 0-9).';
      playSound('beep', isMuted);
      return;
    }

    isSubmittingHost = true;
    const endpoint = dalStore.systemMode === 'DAL' ? '/wp-json/dodo-air/v1/flights' : '/wp-json/dodo-air/v1/dreams';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostName: passport.villagerName,
          islandName: passport.islandName,
          dodoCode: cleanDodo,
          hemisphere: formHemisphere,
          gate: Number(formGate),
          description: formDesc.trim() || `Welcome to ${passport.islandName}! Come over and relax! 🌴`,
          planeType: passport.planeType || 'Switch',
          planeColor: passport.planeColor || 'orange',
          hostFriendCode: passport.friendCode
        })
      });

      if (res.ok) {
        const newFlight = await res.json();
        if (dalStore.systemMode === 'DAL') {
          playSound('airplane', isMuted);
          flights = [newFlight, ...flights];
        } else {
          playSound('bell', isMuted);
          dreams = [newFlight, ...dreams];
        }
        selectedFlightId = newFlight.id;
        formDodo = '';
        formDesc = '';
        fetchState();
        earnStampProgress('hasHosted');
      } else {
        const data = await res.json();
        formError = data.error || 'Failed to dispatch seaplane.';
        playSound('beep', isMuted);
      }
    } catch (err) {
      formError = 'Connection error. Could not dispatch seaplane.';
      playSound('beep', isMuted);
    } finally {
      isSubmittingHost = false;
    }
  }

  async function handleCreateStandbyRequest(e: SubmitEvent) {
    e.preventDefault();
    requestError = '';

    if (!passport.hasCreated) {
      requestError = 'Please save your Frequent Flyer Passport first!';
      playSound('beep', isMuted);
      return;
    }

    isSubmittingRequest = true;
    try {
      const res = await fetch('/wp-json/dodo-air/v1/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: passport.villagerName,
          island: passport.islandName,
          title: `${passport.titlePart1} ${passport.titlePart2}`,
          avatar: passport.avatarIcon,
          friendCode: passport.friendCode,
          gateType: Number(requestGateType),
          timePreference: requestTime,
          memo: requestMemo.trim() || 'Looking for an open island gate to visit! 🌴'
        })
      });

      if (res.ok) {
        playSound('success', isMuted);
        requestMemo = '';
        showStandbyModal = false;
        fetchState();
        earnStampProgress('hasRequested');
      } else {
        const data = await res.json();
        requestError = data.error || 'Failed to file standby ticket.';
        playSound('beep', isMuted);
      }
    } catch (err) {
      requestError = 'Connection error. Could not register standby.';
      playSound('beep', isMuted);
    } finally {
      isSubmittingRequest = false;
    }
  }

  async function handleRemoveStandbyRequest(reqId: string) {
    try {
      const res = await fetch(`/wp-json/dodo-air/v1/requests/${reqId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        playSound('beep', isMuted);
        fetchState();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleBoardFlight(flightId: string) {
    if (!passport.hasCreated) {
      playSound('beep', isMuted);
      alert('Please fill out your Passport first!');
      return;
    }

    boardingError = '';
    const endpoint = dalStore.systemMode === 'DAL' 
      ? `/wp-json/dodo-air/v1/flights/${flightId}/board`
      : `/wp-json/dodo-air/v1/dreams/${flightId}/visit`;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: passport.villagerName,
          island: passport.islandName,
          friendCode: passport.friendCode
        })
      });

      if (res.ok) {
        playSound('success', isMuted);
        revealedCodes = { ...revealedCodes, [flightId]: true };
        fetchState();
        earnStampProgress('hasBoarded');
      } else {
        const data = await res.json();
        boardingError = data.error || 'Failed to check-in.';
        playSound('beep', isMuted);
      }
    } catch (err) {
      boardingError = 'Connection error during boarding.';
      playSound('beep', isMuted);
    }
  }

  async function handleLeaveFlight(flightId: string, passengerId: string) {
    const endpoint = dalStore.systemMode === 'DAL' 
      ? `/wp-json/dodo-air/v1/flights/${flightId}/leave`
      : `/wp-json/dodo-air/v1/dreams/${flightId}/leave`;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passengerId })
      });
      if (res.ok) {
        playSound('beep', isMuted);
        fetchState();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleUpdateStatus(flightId: string, newStatus: FlightStatus) {
    const endpoint = dalStore.systemMode === 'DAL' 
      ? `/wp-json/dodo-air/v1/flights/${flightId}/status`
      : `/wp-json/dodo-air/v1/dreams/${flightId}/status`;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        playSound('bell', isMuted);
        if (newStatus === 'Closed') {
          if (selectedFlightId === flightId) {
            selectedFlightId = null;
          }
        }
        fetchState();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleClearForTakeoff(request: StandbyRequest, flightId: string) {
    const endpoint = dalStore.systemMode === 'DAL' 
      ? `/wp-json/dodo-air/v1/flights/${flightId}/board`
      : `/wp-json/dodo-air/v1/dreams/${flightId}/visit`;
    try {
      const resBoard = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: request.name,
          island: request.island,
          friendCode: request.friendCode
        })
      });

      if (resBoard.ok) {
        await fetch(`/wp-json/dodo-air/v1/requests/${request.id}`, {
          method: 'DELETE'
        });

        playSound('success', isMuted);
        
        await fetch('/wp-json/dodo-air/v1/chatter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender: 'Orville [AI]',
            text: `🎉 MATCH MADE! Passenger ${request.name} is cleared for immediate takeoff and flying to ${passport.islandName}! Clear skies ahead! 🛩️`
          })
        });

        fetchState();
      }
    } catch (err) {
      console.error('Failed to match passenger:', err);
    }
  }

  async function handlePostChat(e: SubmitEvent) {
    e.preventDefault();
    if (!chatSender.trim() || !chatText.trim()) {
      playSound('beep', isMuted);
      return;
    }

    isPostingChat = true;
    try {
      const res = await fetch('/wp-json/dodo-air/v1/chatter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: chatSender.trim(),
          island: chatIsland.trim() || undefined,
          text: chatText.trim()
        })
      });

      if (res.ok) {
        playSound('chatter', isMuted);
        chatText = '';
        fetchState();
        earnStampProgress('hasChatted');
      }
    } catch (err) {
      console.error(err);
    } finally {
      isPostingChat = false;
    }
  }

  async function handleGenerateAIReview(flightId: string) {
    loadingReviewId = flightId;
    playSound('bell', isMuted);
    try {
      const res = await fetch('/wp-json/dodo-air/v1/ai/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightId })
      });
      if (res.ok) {
        playSound('success', isMuted);
        fetchState();
      }
    } catch (err) {
      console.error('Failed to trigger AI travel review:', err);
    } finally {
      loadingReviewId = null;
    }
  }

  let activeFlights = $derived(dalStore.systemMode === 'DAL' ? flights : dreams);

  let myFlight = $derived(activeFlights.find(f => 
    f.hostFriendCode 
      ? f.hostFriendCode === passport.friendCode
      : (f.hostName.toLowerCase() === passport.villagerName.toLowerCase() && f.islandName.toLowerCase() === passport.islandName.toLowerCase())
  ) || null);

  let selectedFlight = $derived(activeFlights.find(f => f.id === selectedFlightId) || null);

  let totalPassports = $derived(Object.keys(profiles).length);
  let totalPilots = $derived(activeFlights.length);
  let totalPassengers = $derived(activeFlights.reduce((sum, f) => sum + (f.passengers?.length || 0), 0));
  let totalStandby = $derived(requests.length);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let formattedDay = $derived(days[liveTime.getDay()]);
  let formattedDate = $derived(`${months[liveTime.getMonth()]} ${liveTime.getDate()}, ${liveTime.getFullYear()}`);
  let formattedTime = $derived(liveTime.toTimeString().split(' ')[0]);

</script>

<div class="min-h-screen {dalStore.systemMode === 'DAL' ? 'bg-[#FEF9E7]' : 'bg-[#1a0b2e]'} airport-runway p-3 sm:p-4 lg:p-6 flex flex-col justify-between selection:bg-[#FFCC00]/40 {dalStore.systemMode === 'DAL' ? 'text-[#4A4A4A]' : 'text-purple-100'} font-sans antialiased relative overflow-x-hidden transition-colors duration-500">
  
  <!-- Dynamic Header & Flight Control Tower -->
  <TerminalHeader>
    <!-- Sound Slider -->
    <SoundToggle {isMuted} onToggle={() => {
      isMuted = !isMuted;
      if (!isMuted) playSound('success', false);
    }} />

    <!-- Header Passport Quick Access Badge -->
    {#if passport.hasCreated}
      <PassportBadgeDropdown
        {passport}
        bind:showPassportDrawer
        setShowMilesModal={(v: boolean) => showMilesModal = v}
        setIsEditingPassport={(v: boolean) => isEditingPassport = v}
        {isMuted}
      />
    {/if}
  </TerminalHeader>

  <!-- Onboarding Screen: Force Passport setup on clean load -->
  {#if !passport.hasCreated}
    <OnboardingOverlay
      onSavePassport={handleSavePassport}
      {isMuted}
    />
  {/if}

  <!-- Main Terminal Grid System -->
  <main class="w-full max-w-7xl mx-auto flex-1 flex flex-col gap-5 items-stretch">
    
    <!-- Tab Navigation Bar (ACNH Style) -->
    <div class="flex items-center justify-center w-full z-30 px-2 sm:px-0">
      <div class="flex flex-wrap sm:flex-nowrap gap-3 md:gap-5 w-full max-w-4xl justify-center">
        
        <button
          onclick={() => { playSound('beep', isMuted); currentTab = 'book'; }}
          class="flex-1 basis-[45%] sm:basis-auto flex flex-col items-center justify-center gap-1.5 md:gap-2 p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] border-x-4 border-t-4 border-b-8 transition-all font-system font-black tracking-wider shadow-sm active:translate-y-2 active:border-b-0 cursor-pointer {currentTab === 'book' ? 'bg-[#FFCC00] border-x-[#E5B800] border-t-[#E5B800] border-b-[#CC9900] text-[#7A5A00] translate-y-1 !border-b-4' : 'bg-white border-x-[#F2F2F2] border-t-[#F2F2F2] border-b-[#E0E0E0] text-[#8C7A5A] hover:-translate-y-1 hover:bg-[#FFFDF5]'}"
        >
          <Ticket class="w-7 h-7 md:w-9 md:h-9 {currentTab === 'book' ? 'text-[#7A5A00]' : 'text-[#A0937D]'}" />
          <span class="text-sm md:text-sm leading-tight text-center">{dalStore.systemMode === 'DAL' ? 'Book Flight' : 'Visit Dream'}</span>
        </button>

        <button
          onclick={() => { playSound('beep', isMuted); currentTab = 'hub'; }}
          class="flex-1 basis-[45%] sm:basis-auto flex flex-col items-center justify-center gap-1.5 md:gap-2 p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] border-x-4 border-t-4 border-b-8 transition-all font-system font-black tracking-wider shadow-sm active:translate-y-2 active:border-b-0 cursor-pointer relative {currentTab === 'hub' ? 'bg-[#FFCC00] border-x-[#E5B800] border-t-[#E5B800] border-b-[#CC9900] text-[#7A5A00] translate-y-1 !border-b-4' : 'bg-white border-x-[#F2F2F2] border-t-[#F2F2F2] border-b-[#E0E0E0] text-[#8C7A5A] hover:-translate-y-1 hover:bg-[#FFFDF5]'}"
        >
          <Plane class="w-7 h-7 md:w-9 md:h-9 {currentTab === 'hub' ? 'text-[#7A5A00]' : 'text-[#A0937D]'}" />
          <span class="text-sm md:text-sm leading-tight text-center">{dalStore.systemMode === 'DAL' ? 'My Flight Hub' : 'My Dream Hub'}</span>
          {#if myFlight}
            <span class="absolute top-2 right-2 w-3 h-3 md:w-4 md:h-4 bg-[#FF4747] rounded-full animate-bounce shadow-sm border-2 border-white"></span>
          {/if}
        </button>

        <button
          onclick={() => { playSound('beep', isMuted); currentTab = 'radio'; }}
          class="flex-1 basis-[45%] sm:basis-auto flex flex-col items-center justify-center gap-1.5 md:gap-2 p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] border-x-4 border-t-4 border-b-8 transition-all font-system font-black tracking-wider shadow-sm active:translate-y-2 active:border-b-0 cursor-pointer {currentTab === 'radio' ? 'bg-[#FFCC00] border-x-[#E5B800] border-t-[#E5B800] border-b-[#CC9900] text-[#7A5A00] translate-y-1 !border-b-4' : 'bg-white border-x-[#F2F2F2] border-t-[#F2F2F2] border-b-[#E0E0E0] text-[#8C7A5A] hover:-translate-y-1 hover:bg-[#FFFDF5]'}"
        >
          <Radio class="w-7 h-7 md:w-9 md:h-9 {currentTab === 'radio' ? 'text-[#7A5A00]' : 'text-[#A0937D]'}" />
          <span class="text-sm md:text-sm leading-tight text-center">{dalStore.systemMode === 'DAL' ? 'Airport Radio' : 'Dream Radio'}</span>
        </button>

        <button
          onclick={() => { playSound('beep', isMuted); currentTab = 'directory'; }}
          class="flex-1 basis-[45%] sm:basis-auto flex flex-col items-center justify-center gap-1.5 md:gap-2 p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] border-x-4 border-t-4 border-b-8 transition-all font-system font-black tracking-wider shadow-sm active:translate-y-2 active:border-b-0 cursor-pointer {currentTab === 'directory' ? 'bg-[#FFCC00] border-x-[#E5B800] border-t-[#E5B800] border-b-[#CC9900] text-[#7A5A00] translate-y-1 !border-b-4' : 'bg-white border-x-[#F2F2F2] border-t-[#F2F2F2] border-b-[#E0E0E0] text-[#8C7A5A] hover:-translate-y-1 hover:bg-[#FFFDF5]'}"
        >
          <Users class="w-7 h-7 md:w-9 md:h-9 {currentTab === 'directory' ? 'text-[#7A5A00]' : 'text-[#A0937D]'}" />
          <span class="text-sm md:text-sm leading-tight text-center">{dalStore.systemMode === 'DAL' ? 'Flyers Directory' : 'Dreamers Directory'}</span>
        </button>

      </div>
    </div>

    <!-- Passport Edit Overlay Form -->
    {#if isEditingPassport}
      <div transition:fade={{ duration: 200 }} class="fixed inset-0 z-[100] flex items-center justify-center">
        <PassportEditModal
          {passport}
          onSave={handleSavePassport}
          onClose={() => isEditingPassport = false}
          {isMuted}
        />
      </div>
    {/if}

    <!-- ORVILLE'S COZY GUIDANCE SPEECH BALLOON -->
    {#if showOrvilleIntro}
      <div
        transition:slide={{ duration: 300 }}
        class="bg-[#FFFCEF] rounded-[28px] border-4 border-[#FFEAA7] p-4 shadow-sm text-[#4A4A4A] relative overflow-hidden flex flex-col sm:flex-row gap-4 items-start text-left"
      >
        <div class="absolute right-0 bottom-0 opacity-5 text-8xl pointer-events-none select-none">🦤</div>
        
        <!-- Orville Character Avatar -->
        <div class="w-16 h-16 bg-[#0084CC] rounded-full border-2 border-white flex items-center justify-center text-4xl shadow-md shrink-0 self-center sm:self-start">
          🦤
        </div>

        <!-- Speech bubble copy -->
        <div class="flex-1 space-y-1.5 min-w-0">
          <!-- Name Tag -->
          <span class="bg-[#FFCC00] text-[#006094] text-xs font-system font-black px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-wider font-bold">
            Orville [DAL Dispatch]
          </span>
          
          <!-- Message Body -->
          <p class="text-xs font-sans leading-relaxed text-slate-700 font-semibold text-left">
            {#if currentTab === 'book'}
              Welcome to the Departure Gates! Under this tab, you can search for active pilot runways or register as a Standby Passenger so online pilots can spot you on their radar. Booking a flight lets you boarding card check-in and get the Dodo Code™!
            {:else if currentTab === 'hub'}
              This is your Private Flight Hangar control console! File a Flight Plan to register your island as an active destination and open your gate. Correctly categorizing your Gate theme helps passengers find the perfect flight, and we'll scan the airwaves to match you with matching standby passengers!
            {:else if currentTab === 'radio'}
              This is terminal tower radio! Chat with other passengers and pilots, swap turnip prices, or arrange cozy trades in real-time. Drop a friendly callsign message to say hello!
            {:else if currentTab === 'directory'}
              Welcome to the DAL Registered Flyers Directory! Here you can search through all registered travelers' and pilots' customized passports in real-time. You can also click on any passport card to inspect their trust ratings and vouch for them with a Good Apple!
            {/if}
          </p>

          <!-- Quick actions inside the bubble -->
          <div class="pt-1 flex flex-wrap gap-2 text-left">
            <button
              onclick={() => { playSound('beep', isMuted); showMilesModal = true; }}
              class="bg-[#FF9F43] hover:bg-[#ff8f24] text-white font-system font-black text-xs px-2.5 py-0.5 rounded-full uppercase transition-all shadow-xs cursor-pointer font-bold border-none"
            >
              🎯 Open Stamp Book
            </button>
            <button
              onclick={() => {
                playSound('beep', isMuted);
                showOrvilleIntro = false;
                localStorage.setItem('dal_orville_intro', 'hidden');
              }}
              class="bg-[#85806B]/20 hover:bg-[#85806B]/30 text-[#85806B] font-system font-bold text-xs px-2.5 py-0.5 rounded-full uppercase transition-all cursor-pointer font-bold border-none"
            >
              Dismiss Guide
            </button>
          </div>
        </div>
      </div>
    {/if}

    <!-- Ask Orville Floating Helper -->
    {#if !showOrvilleIntro}
      <div class="flex justify-end -mt-3">
        <button
          onclick={() => {
            playSound('beep', isMuted);
            showOrvilleIntro = true;
            localStorage.setItem('dal_orville_intro', 'show');
          }}
          class="flex items-center gap-1.5 bg-[#FFFCEF] hover:bg-[#FFEAA7]/40 border-2 border-[#FFEAA7] text-amber-800 font-system font-bold text-xs px-3 py-1 rounded-full shadow-xs transition-all uppercase cursor-pointer"
        >
          🦤 Ask Orville for Help
        </button>
      </div>
    {/if}

    <!-- Dynamic Multi-Tab Content View -->
    <div class="w-full">
      {#if currentTab === 'book'}
        <DeparturesTab
          flights={activeFlights}
          bind:selectedFlightId
          {passport}
          {profiles}
          {openProfileModal}
          {requests}
          {handleRemoveStandbyRequest}
          setShowStandbyModal={(v: boolean) => showStandbyModal = v}
          {isMuted}
        />
      {/if}

      {#if currentTab === 'hub'}
        <CockpitTab
          {myFlight}
          {handleHostFlight}
          {formError}
          bind:formDodo
          bind:formHemisphere
          bind:formGate
          bind:formDesc
          {isSubmittingHost}
          {passport}
          {handleUpdateStatus}
          {handleLeaveFlight}
          {handleGenerateAIReview}
          {loadingReviewId}
          {requests}
          {handleClearForTakeoff}
          {profiles}
          {openProfileModal}
          {isMuted}
        />
      {/if}

      {#if currentTab === 'radio'}
        <RadioTab
          {totalStandby}
          {totalPassengers}
          {totalPilots}
          {totalPassports}
          {views}
          {visitors}
          {chatter}
          bind:chatSender
          bind:chatIsland
          bind:chatText
          {handlePostChat}
          {isPostingChat}
          {profiles}
          {openProfileModal}
          setCurrentTab={(t: 'book' | 'hub' | 'radio' | 'directory') => currentTab = t}
          setShowPassportDrawer={(v: boolean) => showPassportDrawer = v}
          setIsEditingPassport={(v: boolean) => isEditingPassport = v}
          setShowFuelModal={(v: boolean) => showFuelModal = v}
          {passport}
          {isMuted}
        />
      {/if}

      {#if currentTab === 'directory'}
        <DirectoryTab
          {profiles}
          {openProfileModal}
          {passport}
          {isMuted}
        />
      {/if}
    </div>

  </main>

  <!-- FOOTER -->
  <footer class="w-full max-w-7xl mx-auto mt-8 border-t border-[#E6DFC7] pt-4 flex flex-col sm:flex-row items-center justify-between text-sm font-system text-slate-500 gap-3 text-left">
    <div class="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left leading-normal">
      <span>Dodo Airlines Fan Site &copy; 2026. Non-official fan project.</span>
      <span class="hidden sm:inline text-slate-300">|</span>
      <span>Created by <a href="https://xophz.com" target="_blank" rel="noopener noreferrer" class="font-bold underline text-[#0084CC] hover:text-[#006094]">xophz.com</a></span>
    </div>

    <!-- Sleek integrated Fuel Gauge -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div 
      onclick={() => { playSound('beep', isMuted); showFuelModal = true; }}
      class="flex items-center gap-2 bg-[#FFFCEF] border border-[#FFEAA7] rounded-full px-3 py-1 text-slate-600 hover:bg-[#FFF9D6] hover:border-amber-400 transition-all cursor-pointer select-none group shadow-xs"
    >
      <span class="animate-pulse">⛽</span>
      <span class="font-bold text-amber-800 text-xs uppercase tracking-wider">AI Fuel:</span>
      <div class="w-12 h-1.5 bg-slate-200/80 rounded-full overflow-hidden border border-slate-300/30 relative">
        <div
          class="h-full transition-all duration-500 {(aiFuel.aiTokens / aiFuel.maxTokens) < 0.2 ? 'bg-red-500' : (aiFuel.aiTokens / aiFuel.maxTokens) < 0.5 ? 'bg-amber-500' : 'bg-emerald-500'}"
          style="width: {Math.min(100, (aiFuel.aiTokens / aiFuel.maxTokens) * 100)}%"
        ></div>
      </div>
      <span class="font-black text-[#0084CC] text-xs font-system">
        {aiFuel.aiTokens.toLocaleString()} GAL
      </span>
      <span class="text-xs font-black text-amber-700 underline group-hover:text-[#0084CC] transition-colors ml-0.5">
        [Refuel]
      </span>
    </div>
  </footer>

  <!-- MODAL: AI JET FUEL STATION -->
  <FuelDepotModal
    isOpen={showFuelModal}
    onClose={() => showFuelModal = false}
    {aiFuel}
    onRefuel={handleRefuel}
    {isRefueling}
    {isMuted}
  />

  <!-- MODAL: STANDBY PASSENGER TICKET FORM -->
  <StandbyTicketModal
    isOpen={showStandbyModal}
    onClose={() => showStandbyModal = false}
    bind:requestGateType
    bind:requestTime
    bind:requestMemo
    onSubmit={handleCreateStandbyRequest}
    {isSubmittingRequest}
    {requestError}
  />

  <!-- OVERLAY / DRAWER: BOARDING PASS DETAIL & DODO CODE REVEAL -->
  {#if selectedFlight}
    <div transition:fade={{ duration: 200 }} class="fixed inset-0 z-[100] flex items-center justify-center">
      <BoardingPassModal
        onClose={() => { playSound('beep', isMuted); selectedFlightId = null; }}
        {selectedFlight}
        {passport}
        onBoardFlight={handleBoardFlight}
        onLeaveFlight={handleLeaveFlight}
        {boardingError}
        onRequestStandby={(gate) => { requestGateType = gate; showStandbyModal = true; selectedFlightId = null; }}
        {isMuted}
      />
    </div>
  {/if}

  <!-- MILES STAMP APP DRAWER MODAL -->
  <MilesStampBook
    isOpen={showMilesModal}
    onClose={() => showMilesModal = false}
    {passport}
    onClaimStamp={claimStampMiles}
    {isMuted}
  />

  <!-- COMMUNITY TRUST PROFILE & REVIEWS MODAL -->
  <TrustProfileModal
    {selectedFriendCode}
    onClose={() => selectedFriendCode = null}
    {profiles}
    {selectedProfileReviews}
    onSubmitReview={handleSubmitReview}
    {reviewError}
    {isSubmittingReview}
    {isMuted}
  />

</div>
