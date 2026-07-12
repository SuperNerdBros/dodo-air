/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Plane, Calendar, Clock, Ticket, Radio, RefreshCw, Users } from 'lucide-react';
import { Flight, FlightStatus, Passport, StandbyRequest, UserProfile, FeedbackReview, ChatterMessage } from './types.js';
import { playSound } from './utils/audio.js';
import { STAMP_CHALLENGES, generateRandomFriendCode } from './utils/constants.js';

// Modular Components
import { SoundToggle } from './components/SoundToggle.js';
import { OnboardingOverlay } from './components/OnboardingOverlay.js';
import { PassportEditModal } from './components/PassportEditModal.js';
import { PassportBadgeDropdown } from './components/PassportBadgeDropdown.js';
import { FuelDepotModal } from './components/FuelDepotModal.js';
import { StandbyTicketModal } from './components/StandbyTicketModal.js';
import { BoardingPassModal } from './components/BoardingPassModal.js';
import { MilesStampBook } from './components/MilesStampBook.js';
import { TrustProfileModal } from './components/TrustProfileModal.js';
import { DeparturesTab } from './components/DeparturesTab.js';
import { CockpitTab } from './components/CockpitTab.js';
import { RadioTab } from './components/RadioTab.js';
import { DirectoryTab } from './components/DirectoryTab.js';

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<'book' | 'hub' | 'radio' | 'directory'>('book');

  // State variables
  const [flights, setFlights] = useState<Flight[]>([]);
  const [requests, setRequests] = useState<StandbyRequest[]>([]);
  const [chatter, setChatter] = useState<ChatterMessage[]>([]);
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
  
  const [isMuted, setIsMuted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Analytics State
  const [views, setViews] = useState<number>(0);
  const [visitors, setVisitors] = useState<number>(0);

  // Community Trust & Profiles state
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [selectedFriendCode, setSelectedFriendCode] = useState<string | null>(null);
  const [selectedProfileReviews, setSelectedProfileReviews] = useState<FeedbackReview[]>([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Passport state
  const [passport, setPassport] = useState<Passport>(() => {
    try {
      const saved = localStorage.getItem('dal_passport');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.villagerName || parsed.hasCreated) {
          return {
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
    return {
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
    };
  });

  const [isEditingPassport, setIsEditingPassport] = useState(false);
  const [passportForm, setPassportForm] = useState<Passport>({ ...passport });
  const [showPassportDrawer, setShowPassportDrawer] = useState(false);
  const [showMilesModal, setShowMilesModal] = useState(false);
  const [showOrvilleIntro, setShowOrvilleIntro] = useState(() => {
    return localStorage.getItem('dal_orville_intro') !== 'hidden';
  });

  // Milestone tracking helper
  const earnStampProgress = (field: 'hasBoarded' | 'hasHosted' | 'hasChatted' | 'hasCustomized' | 'hasRequested') => {
    if (!passport.hasCreated) return;
    if (passport[field]) return; // already earned

    setPassport(prev => {
      const updated = {
        ...prev,
        [field]: true
      };
      localStorage.setItem('dal_passport', JSON.stringify(updated));
      return updated;
    });
    playSound('success', isMuted);
  };

  // Stamp claiming helper
  const claimStampMiles = (stampId: string, amount: number) => {
    const currentClaimed = passport.claimedStampIds || [];
    if (currentClaimed.includes(stampId)) return;

    setPassport(prev => {
      const updated = {
        ...prev,
        miles: (prev.miles || 0) + amount,
        claimedStampIds: [...currentClaimed, stampId]
      };
      localStorage.setItem('dal_passport', JSON.stringify(updated));
      return updated;
    });
    playSound('success', isMuted);
  };

  // Synchronization defaults
  useEffect(() => {
    setPassportForm({ ...passport });
  }, [passport]);

  // Update chatter name defaults on load
  useEffect(() => {
    if (passport.hasCreated) {
      setChatSender(passport.villagerName);
      setChatIsland(passport.islandName);
      localStorage.setItem('dal_chat_sender', passport.villagerName);
      localStorage.setItem('dal_chat_island', passport.islandName);
    }
  }, [passport]);

  const handleSavePassport = async (updated: Passport) => {
    setPassport(updated);
    setPassportForm(updated);
    localStorage.setItem('dal_passport', JSON.stringify(updated));
    setIsEditingPassport(false);
    setShowPassportDrawer(false);
    playSound('success', isMuted);

    // Sync to persistent server profiles
    try {
      await fetch(`/api/profiles/${encodeURIComponent(updated.friendCode)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          villagerName: updated.villagerName,
          islandName: updated.islandName,
          avatarIcon: updated.avatarIcon,
          title: `${updated.titlePart1} ${updated.titlePart2}`,
          signature: updated.signature,
          colorIndex: updated.colorIndex
        })
      });
      // Refresh the system state immediately to update the counter
      await fetchState(false);
    } catch (err) {
      console.error("Failed to sync profile to server:", err);
    }
  };

  // Host Form State (My private seaplane DAL-X)
  const [formDodo, setFormDodo] = useState('');
  const [formHemisphere, setFormHemisphere] = useState<'Northern' | 'Southern'>('Northern');
  const [formGate, setFormGate] = useState<number>(1);
  const [formDesc, setFormDesc] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmittingHost, setIsSubmittingHost] = useState(false);

  // Standby Ticket Request Form state
  const [requestGateType, setRequestGateType] = useState<number>(1);
  const [requestTime, setRequestTime] = useState<string>('Online Now');
  const [requestMemo, setRequestMemo] = useState<string>('');
  const [showStandbyModal, setShowStandbyModal] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Passenger Quick Check-In Inputs
  const [boardingError, setBoardingError] = useState('');

  // Terminal chat state
  const [chatSender, setChatSender] = useState(() => localStorage.getItem('dal_chat_sender') || '');
  const [chatIsland, setChatIsland] = useState(() => localStorage.getItem('dal_chat_island') || '');
  const [chatText, setChatText] = useState('');
  const [isPostingChat, setIsPostingChat] = useState(false);

  // Reveal dodo codes tracking
  const [revealedCodes, setRevealedCodes] = useState<Record<string, boolean>>({});
  const [loadingReviewId, setLoadingReviewId] = useState<string | null>(null);

  // Community AI Fuel coffer state
  const [aiFuel, setAiFuel] = useState<{ aiTokens: number; maxTokens: number }>({ aiTokens: 15000, maxTokens: 20000 });
  const [isRefueling, setIsRefueling] = useState(false);
  const [showFuelModal, setShowFuelModal] = useState(false);

  const handleRefuel = async (amount: number) => {
    playSound('success', isMuted);
    setIsRefueling(true);
    try {
      const res = await fetch('/api/ai/refuel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      if (res.ok) {
        const data = await res.json();
        setAiFuel({ aiTokens: data.aiTokens, maxTokens: data.maxTokens });
        // Force state reload to fetch system log in radio tab
        await fetchState(true);
      }
    } catch (err) {
      console.error("Failed to refuel:", err);
    } finally {
      setIsRefueling(false);
    }
  };

  const [liveTime, setLiveTime] = useState(new Date());

  // Fetch airport terminal database
  const fetchState = async (showIndicator = false) => {
    if (showIndicator) setIsSyncing(true);
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        setFlights(data.flights || []);
        setChatter(data.chatter || []);
        setRequests(data.requests || []);
        setProfiles(data.profiles || {});
        if (data.aiFuel) {
          setAiFuel(data.aiFuel);
        }
        if (data.analytics) {
          setViews(data.analytics.views || 0);
          setVisitors(data.analytics.visitors || 0);
        }
      }
    } catch (err) {
      console.error('Failed to sync state:', err);
    } finally {
      if (showIndicator) {
        setTimeout(() => setIsSyncing(false), 500);
      }
    }
  };

  // Record page load visit (one-time on mount)
  useEffect(() => {
    let visitorId = localStorage.getItem('dal_visitor_id');
    if (!visitorId) {
      visitorId = `v-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem('dal_visitor_id', visitorId);
    }
    
    fetch('/api/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId })
    })
    .then(res => {
      if (res.ok) return res.json();
    })
    .then(data => {
      if (data) {
        setViews(data.views || 0);
        setVisitors(data.visitors || 0);
      }
    })
    .catch(err => console.error('Failed to record visit:', err));
  }, []);

  // Sync profile when passport is created or changed
  useEffect(() => {
    if (passport.hasCreated && passport.friendCode) {
      fetch(`/api/profiles/${encodeURIComponent(passport.friendCode)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          villagerName: passport.villagerName,
          islandName: passport.islandName,
          avatarIcon: passport.avatarIcon,
          title: `${passport.titlePart1} ${passport.titlePart2}`,
          signature: passport.signature,
          colorIndex: passport.colorIndex
        })
      }).catch(err => console.error("Error auto-syncing profile:", err));
    }
  }, [passport.hasCreated, passport.friendCode]);

  // Open Islander Trust Profile
  const openProfileModal = async (friendCode: string) => {
    playSound('beep', isMuted);
    setSelectedFriendCode(friendCode);
    setReviewError('');
    
    try {
      const res = await fetch(`/api/profiles/${encodeURIComponent(friendCode)}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setSelectedProfileReviews(data);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  // Submit vouch or report feedback
  const handleSubmitReview = async (ratingType: 'apple' | 'turnip', comment: string) => {
    if (!selectedFriendCode) return;
    if (!passport.hasCreated) {
      setReviewError("You must print your custom Passport at the dispatch counter before submitting trust feedback!");
      return;
    }
    if (passport.friendCode === selectedFriendCode) {
      setReviewError("You cannot rate your own island profile!");
      return;
    }

    setIsSubmittingReview(true);
    setReviewError('');
    try {
      const res = await fetch(`/api/profiles/${encodeURIComponent(selectedFriendCode)}/rate`, {
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
        const reviewsRes = await fetch(`/api/profiles/${encodeURIComponent(selectedFriendCode)}/reviews`);
        if (reviewsRes.ok) {
          const revs = await reviewsRes.json();
          setSelectedProfileReviews(revs);
        }
        await fetchState(false);
      } else {
        const errObj = await res.json();
        setReviewError(errObj.error || "Failed to submit rating.");
      }
    } catch (err) {
      setReviewError("Network error while submitting rating.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Timers and polling
  useEffect(() => {
    fetchState(true);

    const clockTimer = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);

    const pollTimer = setInterval(() => {
      fetchState(false);
    }, 5000);

    return () => {
      clearInterval(clockTimer);
      clearInterval(pollTimer);
    };
  }, []);

  // Persist chat name triggers
  useEffect(() => {
    localStorage.setItem('dal_chat_sender', chatSender);
    localStorage.setItem('dal_chat_island', chatIsland);
  }, [chatSender, chatIsland]);

  const handleReveal = (flightId: string) => {
    playSound('success', isMuted);
    setRevealedCodes(prev => ({ ...prev, [flightId]: true }));
  };

  // File Flight Plan (Hosts opening gate)
  const handleHostFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!passport.hasCreated) {
      setFormError('Please save your Frequent Flyer Passport first!');
      playSound('beep', isMuted);
      return;
    }

    if (!formDodo.trim()) {
      setFormError('Please enter a valid 5-character Dodo Code.');
      playSound('beep', isMuted);
      return;
    }

    const cleanDodo = formDodo.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleanDodo.length !== 5) {
      setFormError('Dodo Code must be exactly 5 characters (A-Z, 0-9).');
      playSound('beep', isMuted);
      return;
    }

    setIsSubmittingHost(true);
    try {
      const res = await fetch('/api/flights', {
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
        playSound('airplane', isMuted);
        setFlights(prev => [newFlight, ...prev]);
        setSelectedFlightId(newFlight.id);
        setFormDodo('');
        setFormDesc('');
        fetchState();
        earnStampProgress('hasHosted');
      } else {
        const data = await res.json();
        setFormError(data.error || 'Failed to dispatch seaplane.');
        playSound('beep', isMuted);
      }
    } catch (err) {
      setFormError('Connection error. Could not dispatch seaplane.');
      playSound('beep', isMuted);
    } finally {
      setIsSubmittingHost(false);
    }
  };

  // File Standby Passenger Request
  const handleCreateStandbyRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError('');

    if (!passport.hasCreated) {
      setRequestError('Please save your Frequent Flyer Passport first!');
      playSound('beep', isMuted);
      return;
    }

    setIsSubmittingRequest(true);
    try {
      const res = await fetch('/api/requests', {
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
        setRequestMemo('');
        setShowStandbyModal(false);
        fetchState();
        earnStampProgress('hasRequested');
      } else {
        const data = await res.json();
        setRequestError(data.error || 'Failed to file standby ticket.');
        playSound('beep', isMuted);
      }
    } catch (err) {
      setRequestError('Connection error. Could not register standby.');
      playSound('beep', isMuted);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  // Remove a Standby Request
  const handleRemoveStandbyRequest = async (reqId: string) => {
    try {
      const res = await fetch(`/api/requests/${reqId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        playSound('beep', isMuted);
        fetchState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Passenger check-in to an active flight
  const handleBoardFlight = async (flightId: string) => {
    if (!passport.hasCreated) {
      playSound('beep', isMuted);
      alert('Please fill out your Passport first!');
      return;
    }

    setBoardingError('');
    try {
      const res = await fetch(`/api/flights/${flightId}/board`, {
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
        setRevealedCodes(prev => ({ ...prev, [flightId]: true }));
        fetchState();
        earnStampProgress('hasBoarded');
      } else {
        const data = await res.json();
        setBoardingError(data.error || 'Failed to check-in.');
        playSound('beep', isMuted);
      }
    } catch (err) {
      setBoardingError('Connection error during boarding.');
      playSound('beep', isMuted);
    }
  };

  // Leave active flight
  const handleLeaveFlight = async (flightId: string, passengerId: string) => {
    try {
      const res = await fetch(`/api/flights/${flightId}/leave`, {
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
  };

  // Host updates status of active flight
  const handleUpdateStatus = async (flightId: string, newStatus: FlightStatus) => {
    try {
      const res = await fetch(`/api/flights/${flightId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        playSound('bell', isMuted);
        if (newStatus === 'Closed') {
          if (selectedFlightId === flightId) {
            setSelectedFlightId(null);
          }
        }
        fetchState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Host Matchmaker Clear Standby Passenger for landing
  const handleClearForTakeoff = async (request: StandbyRequest, flightId: string) => {
    try {
      // 1. Board passenger onto this flight
      const resBoard = await fetch(`/api/flights/${flightId}/board`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: request.name,
          island: request.island,
          friendCode: request.friendCode
        })
      });

      if (resBoard.ok) {
        // 2. Remove from Standby database
        await fetch(`/api/requests/${request.id}`, {
          method: 'DELETE'
        });

        playSound('success', isMuted);
        
        // Add custom greeting in terminal chatter
        await fetch('/api/chatter', {
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
  };

  // Terminal chat post
  const handlePostChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatSender.trim() || !chatText.trim()) {
      playSound('beep', isMuted);
      return;
    }

    setIsPostingChat(true);
    try {
      const res = await fetch('/api/chatter', {
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
        setChatText('');
        fetchState();
        earnStampProgress('hasChatted');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPostingChat(false);
    }
  };

  // Ask Orville for AI travel review brochure
  const handleGenerateAIReview = async (flightId: string) => {
    setLoadingReviewId(flightId);
    playSound('bell', isMuted);
    try {
      const res = await fetch('/api/ai/review', {
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
      setLoadingReviewId(null);
    }
  };

  // Find user's active hosting flight
  const myFlight = flights.find(f => 
    f.hostFriendCode 
      ? f.hostFriendCode === passport.friendCode
      : (f.hostName.toLowerCase() === passport.villagerName.toLowerCase() && f.islandName.toLowerCase() === passport.islandName.toLowerCase())
  );

  const selectedFlight = flights.find(f => f.id === selectedFlightId);

  // Traffic Control Counter Board calculations
  const totalPassports = Object.keys(profiles).length;
  const totalPilots = flights.length;
  const totalPassengers = flights.reduce((sum, f) => sum + (f.passengers?.length || 0), 0);
  const totalStandby = requests.length;

  // Time layout
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedDay = days[liveTime.getDay()];
  const formattedDate = `${months[liveTime.getMonth()]} ${liveTime.getDate()}, ${liveTime.getFullYear()}`;
  const formattedTime = liveTime.toTimeString().split(' ')[0];

  return (
    <div className="min-h-screen bg-[#FEF9E7] airport-runway p-3 sm:p-4 lg:p-6 flex flex-col justify-between selection:bg-[#FFCC00]/40 text-[#4A4A4A] font-sans antialiased">
      
      {/* Dynamic Header & Flight Control Tower */}
      <header className="w-full max-w-7xl mx-auto mb-5 bg-[#0084CC] text-white rounded-[32px] p-4 lg:p-5 shadow-lg border-b-4 border-[#FFCC00] flex flex-col lg:flex-row items-center justify-between gap-4 relative overflow-visible z-40">
        
        {/* Sky glow effect */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#FFCC00] via-sky-500 to-transparent pointer-events-none" />
        
        {/* Logo & Counter Brand */}
        <div className="flex items-center gap-3 z-10 w-full lg:w-auto text-left">
          <div className="w-12 h-12 bg-[#FFCC00] rounded-full border-2 border-white flex items-center justify-center shadow transform -rotate-12">
            <Plane className="w-7 h-7 text-[#0084CC] fill-[#0084CC]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="bg-[#FFCC00] text-[#006094] text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full font-mono shadow-sm font-bold">
                DAL GATEWAY
              </span>
              {isSyncing && (
                <span className="flex items-center gap-1 text-[9px] text-sky-200 animate-pulse font-mono font-semibold">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Radar Active
                </span>
              )}
            </div>
            <h1 className="text-xl lg:text-2xl font-black tracking-tight text-white drop-shadow font-bold">
              Dodo Airlines <span className="text-[#FFCC00]">Booking Terminal</span>
            </h1>
          </div>
        </div>

        {/* Header Right Aligned Group */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 z-20 w-full lg:w-auto justify-end">
          {/* Airport Status Display Board */}
          <div className="flex flex-wrap items-center gap-3 bg-[#006094]/80 rounded-2xl p-2.5 border border-white/10 shadow-inner w-full sm:w-auto justify-around font-mono text-[11px] text-left">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#FFCC00]" />
              <div>
                <span className="text-sky-200 uppercase block text-[8px] font-black leading-none mb-0.5 font-bold">DATE</span>
                <span className="text-white font-bold">{formattedDay}, {formattedDate}</span>
              </div>
            </div>
            
            <div className="h-6 w-px bg-sky-500/30" />

            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#FFCC00]" />
              <div>
                <span className="text-sky-200 uppercase block text-[8px] font-black leading-none mb-0.5 font-bold">CLOCK</span>
                <span className="text-[#FFCC00] font-bold tracking-wider">{formattedTime}</span>
              </div>
            </div>

            <div className="h-6 w-px bg-sky-500/30" />

            {/* Sound Slider */}
            <SoundToggle isMuted={isMuted} onToggle={() => {
              setIsMuted(!isMuted);
              if (isMuted) playSound('success', false);
            }} />
          </div>

          {/* Header Passport Quick Access Badge */}
          {passport.hasCreated && (
            <PassportBadgeDropdown
              passport={passport}
              showPassportDrawer={showPassportDrawer}
              setShowPassportDrawer={setShowPassportDrawer}
              setShowMilesModal={setShowMilesModal}
              setIsEditingPassport={setIsEditingPassport}
              isMuted={isMuted}
            />
          )}
        </div>
      </header>

      {/* Onboarding Screen: Force Passport setup on clean load */}
      {!passport.hasCreated && (
        <OnboardingOverlay
          onSavePassport={handleSavePassport}
          isMuted={isMuted}
        />
      )}

      {/* Main Terminal Grid System */}
      <main className="w-full max-w-7xl mx-auto flex-1 flex flex-col gap-5 items-stretch">
        
        {/* Tab Navigation Bar (Centered Layout) */}
        <div className="flex items-center justify-center bg-white p-3 rounded-3xl border-2 border-[#0084CC]/10 shadow-sm z-30">
          
          {/* Core Navigation Selector Tabs */}
          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-2xl w-full md:w-auto max-w-xl justify-center">
            <button
              onClick={() => { playSound('beep', isMuted); setCurrentTab('book'); }}
              className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-display font-black transition-all cursor-pointer font-bold border-none ${
                currentTab === 'book' ? 'bg-[#0084CC] text-white shadow-sm' : 'hover:bg-slate-200 text-[#4A4A4A]'
              }`}
            >
              <Ticket className="w-4 h-4" />
              Book Flight
            </button>
            <button
              onClick={() => { playSound('beep', isMuted); setCurrentTab('hub'); }}
              className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-display font-black transition-all cursor-pointer font-bold border-none ${
                currentTab === 'hub' ? 'bg-[#0084CC] text-white shadow-sm' : 'hover:bg-slate-200 text-[#4A4A4A]'
              }`}
            >
              <Plane className="w-4 h-4" />
              My Flight Hub
              {myFlight && (
                <span className="w-2 h-2 bg-[#FFCC00] rounded-full animate-ping" />
              )}
            </button>
            <button
              onClick={() => { playSound('beep', isMuted); setCurrentTab('radio'); }}
              className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-display font-black transition-all cursor-pointer font-bold border-none ${
                currentTab === 'radio' ? 'bg-[#0084CC] text-white shadow-sm' : 'hover:bg-slate-200 text-[#4A4A4A]'
              }`}
            >
              <Radio className="w-4 h-4" />
              Airport Radio
            </button>
            <button
              onClick={() => { playSound('beep', isMuted); setCurrentTab('directory'); }}
              className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-display font-black transition-all cursor-pointer font-bold border-none ${
                currentTab === 'directory' ? 'bg-[#0084CC] text-white shadow-sm' : 'hover:bg-slate-200 text-[#4A4A4A]'
              }`}
            >
              <Users className="w-4 h-4" />
              Flyers Directory
            </button>
          </div>
        </div>

        {/* Passport Edit Overlay Form */}
        <AnimatePresence>
          {isEditingPassport && (
            <PassportEditModal
              passport={passport}
              onSave={handleSavePassport}
              onClose={() => setIsEditingPassport(false)}
              isMuted={isMuted}
            />
          )}
        </AnimatePresence>

        {/* ORVILLE'S COZY GUIDANCE SPEECH BALLOON */}
        <AnimatePresence>
          {showOrvilleIntro && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[#FFFCEF] rounded-[28px] border-4 border-[#FFEAA7] p-4 shadow-sm text-[#4A4A4A] relative overflow-hidden flex flex-col sm:flex-row gap-4 items-start text-left"
            >
              <div className="absolute right-0 bottom-0 opacity-5 text-8xl pointer-events-none select-none">🦤</div>
              
              {/* Orville Character Avatar */}
              <div className="w-16 h-16 bg-[#0084CC] rounded-full border-2 border-white flex items-center justify-center text-4xl shadow-md shrink-0 self-center sm:self-start">
                🦤
              </div>

              {/* Speech bubble copy */}
              <div className="flex-1 space-y-1.5 min-w-0">
                {/* Name Tag */}
                <span className="bg-[#FFCC00] text-[#006094] text-[9px] font-display font-black px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-wider font-bold">
                  Orville [DAL Dispatch]
                </span>
                
                {/* Message Body */}
                <p className="text-xs font-sans leading-relaxed text-slate-700 font-semibold text-left">
                  {currentTab === 'book' && "Welcome to the Departure Gates! Under this tab, you can search for active pilot runways or register as a Standby Passenger so online pilots can spot you on their radar. Booking a flight lets you boarding card check-in and get the Dodo Code™!"}
                  {currentTab === 'hub' && "This is your Private Flight Hangar control console! File a Flight Plan to register your island as an active destination and open your gate. Correctly categorizing your Gate theme helps passengers find the perfect flight, and we'll scan the airwaves to match you with matching standby passengers!"}
                  {currentTab === 'radio' && "This is terminal tower radio! Chat with other passengers and pilots, swap turnip prices, or arrange cozy trades in real-time. Drop a friendly callsign message to say hello!"}
                  {currentTab === 'directory' && "Welcome to the DAL Registered Flyers Directory! Here you can search through all registered travelers' and pilots' customized passports in real-time. You can also click on any passport card to inspect their trust ratings and vouch for them with a Good Apple!"}
                </p>

                {/* Quick actions inside the bubble */}
                <div className="pt-1 flex flex-wrap gap-2 text-left">
                  <button
                    onClick={() => { playSound('beep', isMuted); setShowMilesModal(true); }}
                    className="bg-[#FF9F43] hover:bg-[#ff8f24] text-white font-mono font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase transition-all shadow-xs cursor-pointer font-bold border-none"
                  >
                    🎯 Open Stamp Book
                  </button>
                  <button
                    onClick={() => {
                      playSound('beep', isMuted);
                      setShowOrvilleIntro(false);
                      localStorage.setItem('dal_orville_intro', 'hidden');
                    }}
                    className="bg-[#85806B]/20 hover:bg-[#85806B]/30 text-[#85806B] font-mono font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase transition-all cursor-pointer font-bold border-none"
                  >
                    Dismiss Guide
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ask Orville Floating Helper */}
        {!showOrvilleIntro && (
          <div className="flex justify-end -mt-3">
            <button
              onClick={() => {
                playSound('beep', isMuted);
                setShowOrvilleIntro(true);
                localStorage.setItem('dal_orville_intro', 'show');
              }}
              className="flex items-center gap-1.5 bg-[#FFFCEF] hover:bg-[#FFEAA7]/40 border-2 border-[#FFEAA7] text-amber-800 font-mono font-bold text-[9px] px-3 py-1 rounded-full shadow-xs transition-all uppercase cursor-pointer"
            >
              🦤 Ask Orville for Help
            </button>
          </div>
        )}

        {/* Dynamic Multi-Tab Content View */}
        <div className="w-full">
          {currentTab === 'book' && (
            <DeparturesTab
              flights={flights}
              selectedFlightId={selectedFlightId}
              setSelectedFlightId={setSelectedFlightId}
              passport={passport}
              profiles={profiles}
              openProfileModal={openProfileModal}
              requests={requests}
              handleRemoveStandbyRequest={handleRemoveStandbyRequest}
              setShowStandbyModal={setShowStandbyModal}
              isMuted={isMuted}
            />
          )}

          {currentTab === 'hub' && (
            <CockpitTab
              myFlight={myFlight}
              handleHostFlight={handleHostFlight}
              formError={formError}
              formDodo={formDodo}
              setFormDodo={setFormDodo}
              formHemisphere={formHemisphere}
              setFormHemisphere={setFormHemisphere}
              formGate={formGate}
              setFormGate={setFormGate}
              formDesc={formDesc}
              setFormDesc={setFormDesc}
              isSubmittingHost={isSubmittingHost}
              passport={passport}
              handleUpdateStatus={handleUpdateStatus}
              handleLeaveFlight={handleLeaveFlight}
              handleGenerateAIReview={handleGenerateAIReview}
              loadingReviewId={loadingReviewId}
              requests={requests}
              handleClearForTakeoff={handleClearForTakeoff}
              profiles={profiles}
              openProfileModal={openProfileModal}
              isMuted={isMuted}
            />
          )}

          {currentTab === 'radio' && (
            <RadioTab
              totalStandby={totalStandby}
              totalPassengers={totalPassengers}
              totalPilots={totalPilots}
              totalPassports={totalPassports}
              views={views}
              visitors={visitors}
              chatter={chatter}
              chatSender={chatSender}
              setChatSender={setChatSender}
              chatIsland={chatIsland}
              setChatIsland={setChatIsland}
              chatText={chatText}
              setChatText={setChatText}
              handlePostChat={handlePostChat}
              isPostingChat={isPostingChat}
              profiles={profiles}
              openProfileModal={openProfileModal}
              setCurrentTab={setCurrentTab}
              setShowPassportDrawer={setShowPassportDrawer}
              setIsEditingPassport={setIsEditingPassport}
              setShowFuelModal={setShowFuelModal}
              passport={passport}
              isMuted={isMuted}
            />
          )}

          {currentTab === 'directory' && (
            <DirectoryTab
              profiles={profiles}
              openProfileModal={openProfileModal}
              passport={passport}
              isMuted={isMuted}
            />
          )}
        </div>

      </main>

      {/* FOOTER */}
      <footer className="w-full max-w-7xl mx-auto mt-8 border-t border-[#E6DFC7] pt-4 flex flex-col sm:flex-row items-center justify-between text-[10.5px] font-mono text-slate-500 gap-3 text-left">
        <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left leading-normal">
          <span>Dodo Airlines Fan Site &copy; 2026. Non-official fan project.</span>
          <span className="hidden sm:inline text-slate-300">|</span>
          <span>Created by <a href="https://xophz.com" target="_blank" rel="noopener noreferrer" className="font-bold underline text-[#0084CC] hover:text-[#006094]">xophz.com</a></span>
        </div>

        {/* Sleek integrated Fuel Gauge */}
        <div 
          onClick={() => { playSound('beep', isMuted); setShowFuelModal(true); }}
          className="flex items-center gap-2 bg-[#FFFCEF] border border-[#FFEAA7] rounded-full px-3 py-1 text-slate-600 hover:bg-[#FFF9D6] hover:border-amber-400 transition-all cursor-pointer select-none group shadow-xs"
        >
          <span className="animate-pulse">⛽</span>
          <span className="font-bold text-amber-800 text-[9.5px] uppercase tracking-wider">AI Fuel:</span>
          <div className="w-12 h-1.5 bg-slate-200/80 rounded-full overflow-hidden border border-slate-300/30 relative">
            <div
              className={`h-full transition-all duration-500 ${
                (aiFuel.aiTokens / aiFuel.maxTokens) < 0.2
                  ? 'bg-red-500'
                  : (aiFuel.aiTokens / aiFuel.maxTokens) < 0.5
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, (aiFuel.aiTokens / aiFuel.maxTokens) * 100)}%` }}
            />
          </div>
          <span className="font-black text-[#0084CC] text-[9.5px] font-mono">
            {aiFuel.aiTokens.toLocaleString()} GAL
          </span>
          <span className="text-[9px] font-black text-amber-700 underline group-hover:text-[#0084CC] transition-colors ml-0.5">
            [Refuel]
          </span>
        </div>
      </footer>

      {/* MODAL: AI JET FUEL STATION */}
      <FuelDepotModal
        showFuelModal={showFuelModal}
        setShowFuelModal={setShowFuelModal}
        aiFuel={aiFuel}
        handleRefuel={handleRefuel}
        isRefueling={isRefueling}
        isMuted={isMuted}
      />

      {/* MODAL: STANDBY PASSENGER TICKET FORM */}
      <StandbyTicketModal
        showStandbyModal={showStandbyModal}
        setShowStandbyModal={setShowStandbyModal}
        requestGateType={requestGateType}
        setRequestGateType={setRequestGateType}
        requestTime={requestTime}
        setRequestTime={setRequestTime}
        requestMemo={requestMemo}
        setRequestMemo={setRequestMemo}
        handleCreateStandbyRequest={handleCreateStandbyRequest}
        isSubmittingRequest={isSubmittingRequest}
        requestError={requestError}
        isMuted={isMuted}
      />

      {/* OVERLAY / DRAWER: BOARDING PASS DETAIL & DODO CODE REVEAL */}
      <AnimatePresence>
        {selectedFlight && (
          <BoardingPassModal
            selectedFlight={selectedFlight}
            onClose={() => { playSound('beep', isMuted); setSelectedFlightId(null); }}
            passport={passport}
            revealedCodes={revealedCodes}
            handleReveal={handleReveal}
            handleBoardFlight={handleBoardFlight}
            handleLeaveFlight={handleLeaveFlight}
            boardingError={boardingError}
            setBoardingError={setBoardingError}
            isMuted={isMuted}
          />
        )}
      </AnimatePresence>

      {/* MILES STAMP APP DRAWER MODAL */}
      <MilesStampBook
        showMilesModal={showMilesModal}
        onClose={() => setShowMilesModal(false)}
        passport={passport}
        claimStampMiles={claimStampMiles}
        challenges={STAMP_CHALLENGES}
        isMuted={isMuted}
      />

      {/* COMMUNITY TRUST PROFILE & REVIEWS MODAL */}
      <TrustProfileModal
        selectedFriendCode={selectedFriendCode}
        onClose={() => setSelectedFriendCode(null)}
        profiles={profiles}
        selectedProfileReviews={selectedProfileReviews}
        onSubmitReview={handleSubmitReview}
        reviewError={reviewError}
        isSubmittingReview={isSubmittingReview}
        isMuted={isMuted}
      />

    </div>
  );
}
