<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import pkg from '../../package.json';
  import { slide, fade, fly } from 'svelte/transition';
  import { Plane, Calendar, Clock, Ticket, Radio, RefreshCw, Users, Moon, CloudMoon, BookOpen } from '@lucide/svelte';
  import type { Flight, FlightStatus, Passport, StandbyRequest, UserProfile, FeedbackReview, ChatterMessage } from '$lib/studio-types';
  import { playSound } from '$lib/utils/audio';
  import { STAMP_CHALLENGES, generateRandomFriendCode } from '$lib/utils/constants';
  import { dalStore } from '$lib/stores/dal.svelte';

  import SoundToggle from '$lib/components/atoms/SoundToggle.svelte';
  import TerminalHeader from '$lib/components/organisms/TerminalHeader.svelte';
  import InteractiveWelcome from '$lib/components/organisms/InteractiveWelcome.svelte';
  import PassportEditModal from '$lib/components/organisms/PassportEditModal.svelte';
  import PassportBadgeDropdown from '$lib/components/molecules/PassportBadgeDropdown.svelte';
  import PassportTopsheet from '$lib/components/organisms/PassportTopsheet.svelte';
  import AcnhBubble from '$lib/components/molecules/AcnhBubble.svelte';
  import FuelDepotModal from '$lib/components/organisms/FuelDepotModal.svelte';
  import StandbyTicketModal from '$lib/components/molecules/StandbyTicketModal.svelte';
  import BoardingPassModal from '$lib/components/organisms/BoardingPassModal.svelte';
  import MilesStampBook from '$lib/components/organisms/MilesStampBook.svelte';
  import TrustProfileModal from '$lib/components/organisms/TrustProfileModal.svelte';
  import DeparturesTab from '$lib/components/templates/DeparturesTab.svelte';
  import CockpitTab from '$lib/components/templates/CockpitTab.svelte';
  import RadioTab from '$lib/components/templates/RadioTab.svelte';
  import DirectoryTab from '$lib/components/templates/DirectoryTab.svelte';
  import ScheduledTab from '$lib/components/templates/ScheduledTab.svelte';
  import PassportTab from '$lib/components/templates/PassportTab.svelte';
  import TrafficControlModal from '$lib/components/organisms/TrafficControlModal.svelte';

  // Navigation
  let currentTab = $state<'passport' | 'book' | 'hub' | 'directory'>('passport');
  let isTrafficModalOpen = $state(false);

  // State variables
  let flights = $state<Flight[]>([]);
  let dreams = $state<Flight[]>([]);
  let requests = $state<StandbyRequest[]>([]);
  let chatter = $state<ChatterMessage[]>([]);
  let selectedFlightId = $state<string | null>(null);
  let mySchedules = $state<any[]>([]);

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
        body: JSON.stringify(updated)
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
  let formPlaneType = $state<'Switch' | 'Switch 2'>('Switch');
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
        if (data.mySchedules) {
          mySchedules = data.mySchedules;
        }
        if (data.analytics) {
          views = data.analytics.views || 0;
          visitors = data.analytics.visitors || 0;
        }
        if (data.myPassport && (!passport.hasCreated || data.myPassport.hasCreated)) {
          passport = { ...passport, ...data.myPassport };
          localStorage.setItem('dal_passport', JSON.stringify(passport));
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
    dalStore.initAuth();
    
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

  async function handleAddSchedule(schedule: any) {
    try {
      const res = await fetch('/wp-json/dodo-air/v1/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedule)
      });
      if (res.ok) {
        const data = await res.json();
        mySchedules = [...mySchedules, data];
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
        mySchedules = mySchedules.filter(s => s.id !== id);
      } else {
        throw new Error('Failed to delete schedule');
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

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

    let cleanDodo = '';
    if (formDodo.trim()) {
      cleanDodo = formDodo.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (cleanDodo.length !== 5) {
        formError = 'Dodo Code must be exactly 5 characters (A-Z, 0-9).';
        playSound('beep', isMuted);
        return;
      }
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
          planeType: formPlaneType,
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

  async function handleUpdateStatus(flightId: string, newStatus: FlightStatus, dodoCode?: string) {
    const endpoint = dalStore.systemMode === 'DAL' 
      ? `/wp-json/dodo-air/v1/flights/${flightId}/status`
      : `/wp-json/dodo-air/v1/dreams/${flightId}/status`;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, dodoCode })
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
    f.status !== 'Closed' && (
      f.hostFriendCode 
        ? f.hostFriendCode === passport.friendCode
        : (f.hostName.toLowerCase() === passport.villagerName.toLowerCase() && f.islandName.toLowerCase() === passport.islandName.toLowerCase())
    )
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

<div class="h-screen {dalStore.systemMode === 'DAL' ? 'bg-[#FEF9E7]' : 'bg-[#1a0b2e]'} airport-runway flex selection:bg-[#FFCC00]/40 {dalStore.systemMode === 'DAL' ? 'text-[#4A4A4A]' : 'text-purple-100'} font-sans antialiased relative overflow-hidden transition-colors duration-500">
  
  <!-- Main Left Column -->
  <div class="flex-1 flex flex-col min-w-0 h-full overflow-y-auto p-3 sm:p-4 lg:p-6 pb-28">

    <!-- Dynamic Header & Flight Control Tower -->
    <TerminalHeader>
    <!-- Sound Slider -->
    <SoundToggle {isMuted} onToggle={() => {
      isMuted = !isMuted;
      if (!isMuted) playSound('success', false);
    }} />

    <!-- Traffic Control Button -->
    <button 
      onclick={() => { playSound('beep', isMuted); isTrafficModalOpen = true; }}
      class="w-10 h-10 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/25 transition-all flex items-center justify-center shadow-md cursor-pointer active:scale-95 text-white"
      title="Traffic Control & Radar Center"
    >
      <Radio class="w-5 h-5" />
    </button>
  </TerminalHeader>

  <PassportTopsheet
    {passport}
    bind:showPassportDrawer
    setShowMilesModal={(v: boolean) => showMilesModal = v}
    setIsEditingPassport={(v: boolean) => isEditingPassport = v}
    {isMuted}
    playSound={(id) => playSound(id as any, isMuted)}
  />

  <!-- Onboarding & Login Screen: Interactive typewriter walkthrough and registration dialog -->
  {#if !passport.hasCreated && !dalStore.isAuthChecking}
    <InteractiveWelcome
      onSavePassport={handleSavePassport}
      {isMuted}
    />
  {/if}

  <!-- Main Terminal Grid System -->
  <div class="w-full flex-1 flex flex-col relative mt-2 gap-4">
    <main class="flex-1 flex flex-col gap-4 items-stretch min-w-0">
      
      <!-- Tab Teeth for the Header -->
      <div class="w-full flex justify-between items-start px-4 sm:px-8 lg:px-12 -mt-10 z-40 relative">
        
        <!-- Left: Area Tabs -->
        <div class="flex items-start gap-1 sm:gap-2">
          <button
            onclick={() => { playSound('beep', isMuted); currentTab = 'passport'; }}
            class="px-3 sm:px-5 pt-6 rounded-b-xl border-x-2 border-b-2 transition-all duration-300 font-system font-black tracking-wider text-[10px] sm:text-xs uppercase flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-md origin-top
                   {currentTab === 'passport' 
                     ? (dalStore.systemMode === 'DAL' ? 'bg-[#FFCC00] text-[#006094] border-[#FFCC00] pb-3 scale-y-105' : 'bg-[#DDA0DD] text-[#4B0082] border-[#DDA0DD] pb-3 scale-y-105')
                     : (dalStore.systemMode === 'DAL' ? 'bg-[#0070B0] text-sky-200 border-[#0070B0] hover:bg-[#0084CC] hover:text-white pb-1' : 'bg-[#3A0066] text-purple-200 border-[#3A0066] hover:bg-[#4B0082] hover:text-white pb-1')}"
          >
            <BookOpen class="w-4 h-4 sm:w-5 sm:h-5 {currentTab === 'passport' ? '' : 'opacity-70'}" /> <span class="hidden sm:inline">Passport</span>
          </button>
          
          <button
            onclick={() => { playSound('beep', isMuted); currentTab = 'book'; }}
            class="px-3 sm:px-5 pt-6 rounded-b-xl border-x-2 border-b-2 transition-all duration-300 font-system font-black tracking-wider text-[10px] sm:text-xs uppercase flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-md origin-top
                   {currentTab === 'book' 
                     ? (dalStore.systemMode === 'DAL' ? 'bg-[#FFCC00] text-[#006094] border-[#FFCC00] pb-3 scale-y-105' : 'bg-[#DDA0DD] text-[#4B0082] border-[#DDA0DD] pb-3 scale-y-105')
                     : (dalStore.systemMode === 'DAL' ? 'bg-[#0070B0] text-sky-200 border-[#0070B0] hover:bg-[#0084CC] hover:text-white pb-1' : 'bg-[#3A0066] text-purple-200 border-[#3A0066] hover:bg-[#4B0082] hover:text-white pb-1')}"
          >
            <Ticket class="w-4 h-4 sm:w-5 sm:h-5 {currentTab === 'book' ? '' : 'opacity-70'}" /> <span class="hidden sm:inline">Islands</span>
          </button>
          
          <button
            onclick={() => { playSound('beep', isMuted); currentTab = 'hub'; }}
            class="px-3 sm:px-5 pt-6 rounded-b-xl border-x-2 border-b-2 transition-all duration-300 font-system font-black tracking-wider text-[10px] sm:text-xs uppercase flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-md origin-top relative
                   {currentTab === 'hub' 
                     ? (dalStore.systemMode === 'DAL' ? 'bg-[#FFCC00] text-[#006094] border-[#FFCC00] pb-3 scale-y-105' : 'bg-[#DDA0DD] text-[#4B0082] border-[#DDA0DD] pb-3 scale-y-105')
                     : (dalStore.systemMode === 'DAL' ? 'bg-[#0070B0] text-sky-200 border-[#0070B0] hover:bg-[#0084CC] hover:text-white pb-1' : 'bg-[#3A0066] text-purple-200 border-[#3A0066] hover:bg-[#4B0082] hover:text-white pb-1')}"
          >
            <Plane class="w-4 h-4 sm:w-5 sm:h-5 {currentTab === 'hub' ? '' : 'opacity-70'}" /> <span class="hidden sm:inline">I want visitors!</span>
            {#if myFlight}
              <span class="absolute bottom-1 right-2 w-2 h-2 bg-[#FF4747] rounded-full animate-ping"></span>
              <span class="absolute bottom-1 right-2 w-2 h-2 bg-[#FF4747] rounded-full shadow-xs"></span>
            {/if}
          </button>
          
          <button
            onclick={() => { playSound('beep', isMuted); currentTab = 'directory'; }}
            class="px-3 sm:px-5 pt-6 rounded-b-xl border-x-2 border-b-2 transition-all duration-300 font-system font-black tracking-wider text-[10px] sm:text-xs uppercase flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-md origin-top
                   {currentTab === 'directory' 
                     ? (dalStore.systemMode === 'DAL' ? 'bg-[#FFCC00] text-[#006094] border-[#FFCC00] pb-3 scale-y-105' : 'bg-[#DDA0DD] text-[#4B0082] border-[#DDA0DD] pb-3 scale-y-105')
                     : (dalStore.systemMode === 'DAL' ? 'bg-[#0070B0] text-sky-200 border-[#0070B0] hover:bg-[#0084CC] hover:text-white pb-1' : 'bg-[#3A0066] text-purple-200 border-[#3A0066] hover:bg-[#4B0082] hover:text-white pb-1')}"
          >
            <Users class="w-4 h-4 sm:w-5 sm:h-5 {currentTab === 'directory' ? '' : 'opacity-70'}" /> <span class="hidden sm:inline">Users</span>
          </button>
        </div>

        <!-- Right: Ask Orville -->
        <button
          onclick={() => {
            playSound('beep', isMuted);
            showOrvilleIntro = true;
            localStorage.setItem('dal_orville_intro', 'show');
          }}
          class="px-3 sm:px-6 pt-6 rounded-b-xl border-x-2 border-b-2 transition-all duration-300 font-system font-black tracking-wider text-[10px] sm:text-xs uppercase flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-md origin-top
                 {showOrvilleIntro 
                   ? (dalStore.systemMode === 'DAL' ? 'bg-[#FFCC00] text-[#006094] border-[#FFCC00] pb-3 scale-y-105' : 'bg-[#DDA0DD] text-[#4B0082] border-[#DDA0DD] pb-3 scale-y-105')
                   : (dalStore.systemMode === 'DAL' ? 'bg-[#0070B0] text-[#FFFCEF] border-[#0070B0] hover:bg-[#0084CC] hover:text-white pb-1' : 'bg-[#3A0066] text-[#F3E8FF] border-[#3A0066] hover:bg-[#4B0082] hover:text-white pb-1')}"
        >
          <span class="text-base sm:text-lg {showOrvilleIntro ? '' : 'opacity-80'}">🦤</span> <span class="hidden sm:inline">Ask Orville</span>
        </button>
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
      <div class="fixed inset-0 z-[100] pointer-events-none flex flex-col justify-end p-4 pb-8 sm:p-8">
        <div transition:fly={{ y: 50, duration: 300 }} class="w-full">
          <AcnhBubble 
            title="Orville [Tour Guide]"
            onDismiss={() => {
              playSound('beep', isMuted);
              showOrvilleIntro = false;
              localStorage.setItem('dal_orville_intro', 'hidden');
            }}
          >
            <div class="flex gap-4 items-start relative z-10">
              <!-- Character Icon -->
              <div class="hidden sm:flex shrink-0 w-16 h-16 bg-[#FFFCEF] border-[3px] border-[#D1BFAe] rounded-full items-center justify-center text-4xl shadow-inner transform -rotate-6">🦤</div>
              
              <!-- Text Content -->
              <div class="flex-1 space-y-4">
                <p class="text-xl sm:text-2xl text-[#807256] leading-snug font-medium font-system">
{#if currentTab === 'passport'}
  Hey hey! Welcome to Dodo Airlines! Here is your official Frequent Flyer Passport. Keep your details and custom title up-to-date, and make sure to stamp your Stamp Book for Dodo Miles!
{:else if currentTab === 'book'}
  Hey hey! Welcome to the Departure Gates. Search for open gates or hop on standby so to put you on the radar. Let's get you checked in and set up with a Dodo Code™!
{:else if currentTab === 'hub'}
  Welcome to your Private Flight Hangar! File a Flight Plan and open your gates to the skies. Pick a clear theme, and we'll scan the airwaves to match you with the perfect standby passengers!
{:else if currentTab === 'directory'}
  Welcome to the DAL Flyers Directory! Check out customized passports from all our active flyers. Give a passport a tap to check trust ratings or vouch for a pilot with a Good Apple!
{/if}
                </p>
                
                <!-- Quick actions inside the bubble -->
                <div class="flex flex-wrap gap-3 justify-end pt-2 hidden">
                  <button
                    onclick={() => { playSound('beep', isMuted); showMilesModal = true; }}
                    class="btn-acnh btn-acnh-secondary px-6 py-2 text-sm rounded-full"
                  >
                    🎯 Open Stamp Book
                  </button>
                </div>
              </div>
            </div>
          </AcnhBubble>
        </div>
      </div>
    {/if}

    <!-- Ask Orville Floating Helper Removed (Now a top tab) -->

    <!-- Dynamic Multi-Tab Content View -->
    <div class="w-full">
      {#if currentTab === 'passport'}
        <PassportTab
          {passport}
          setShowMilesModal={(v: boolean) => showMilesModal = v}
          setIsEditingPassport={(v: boolean) => isEditingPassport = v}
          {isMuted}
          playSound={(id) => playSound(id as any, isMuted)}
        />
      {/if}

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
          myFlight={myFlight!}
          {passport}
          {requests}
          {profiles}
          {openProfileModal}
          handleHostFlight={handleHostFlight}
          {formError}
          bind:formDodo
          bind:formHemisphere
          bind:formGate
          bind:formDesc
          bind:formPlaneType
          {isSubmittingHost}
          handleUpdateStatus={handleUpdateStatus}
          handleLeaveFlight={handleLeaveFlight}
          handleGenerateAIReview={handleGenerateAIReview}
          {loadingReviewId}
          handleClearForTakeoff={handleClearForTakeoff}
          {isMuted}
          {mySchedules}
          handleAddSchedule={handleAddSchedule}
          handleDeleteSchedule={handleDeleteSchedule}
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
    <footer class="w-full mt-6 border-t border-[#E6DFC7] pt-4 flex flex-col sm:flex-row items-center justify-between text-sm font-system text-slate-500 gap-3 text-left">
      <div class="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left leading-normal">
        <span>Dodo Airlines Fan Site &copy; 2026. Non-official fan project.</span>
        <span class="hidden sm:inline text-slate-300">|</span>
        <span>Created by <a href="https://xophz.com" target="_blank" rel="noopener noreferrer" class="font-bold underline text-[#0084CC] hover:text-[#006094]">xophz.com</a></span>
        <span class="hidden sm:inline text-slate-300">|</span>
        <span>v{pkg.version}</span>
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
  </div> <!-- End Main Terminal Grid System wrapper -->
  </div> <!-- End Main Left Column -->

  <!-- Permanent Radio Sidebar Right Column -->
  <aside class="hidden xl:block w-full sm:w-[400px] shrink-0 h-full overflow-y-auto custom-scrollbar transition-colors duration-500">
    <div class="py-3 pr-3 pl-0 sm:py-4 sm:pr-4 lg:py-6 lg:pr-6 h-full">
      <RadioTab
        {chatter}
        bind:chatSender
        bind:chatIsland
        bind:chatText
        {handlePostChat}
        {isPostingChat}
        {profiles}
        {openProfileModal}
        setShowFuelModal={(v) => showFuelModal = v}
        {passport}
        {isMuted}
      />
    </div>
  </aside>

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

  <!-- TRAFFIC CONTROL MODAL -->
  <TrafficControlModal
    isOpen={isTrafficModalOpen}
    onClose={() => isTrafficModalOpen = false}
    {totalStandby}
    {totalPassengers}
    {totalPilots}
    {totalPassports}
    {views}
    {visitors}
    setCurrentTab={(t) => currentTab = t}
    setShowPassportDrawer={(v) => showPassportDrawer = v}
    setIsEditingPassport={(v) => isEditingPassport = v}
    {passport}
    {isMuted}
  />

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
