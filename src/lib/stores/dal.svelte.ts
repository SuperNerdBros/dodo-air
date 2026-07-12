import { type Flight, type ChatterMessage, type StandbyRequest, type Passport, type FlightStatus } from '../types';

export class DalState {
  currentTab: 'book' | 'hub' | 'radio' = $state('book');
  systemMode: 'DAL' | 'LUNA' = $state('DAL');
  flights: Flight[] = $state([]);
  dreams: Flight[] = $state([]);
  requests: StandbyRequest[] = $state([]);
  chatter: ChatterMessage[] = $state([]);
  selectedFlightId: string | null = $state(null);
  
  // Auth state
  isLoggedIn = $state(false);
  userEmail = $state('');
  isAuthChecking = $state(true);
  
  isMuted = $state(false);
  isSyncing = $state(false);
  
  passport: Passport = $state({
    villagerName: '',
    islandName: '',
    titlePart1: 'Freshly Picked',
    titlePart2: 'Islander',
    friendCode: 'SW-XXXX-XXXX-XXXX',
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
    hasRequested: false
  });

  isEditingPassport = $state(false);
  passportForm: Passport = $state({ ...this.passport });
  showPassportDrawer = $state(false);
  showMilesModal = $state(false);
  showOrvilleIntro = $state(true);

  // Standby Request Form State
  requestGateType = $state(1);
  requestTime = $state('Online Now');
  requestMemo = $state('');
  showStandbyModal = $state(false);
  requestError = $state('');
  isSubmittingRequest = $state(false);

  // Host Form State
  formDodo = $state('');
  formHemisphere: 'Northern' | 'Southern' = $state('Northern');
  formGate = $state(1);
  formDesc = $state('');
  formPlaneType: 'Switch' | 'Switch 2' = $state('Switch');
  formError = $state('');
  isSubmittingHost = $state(false);

  // Passenger check-in
  boardingError = $state('');

  // Terminal chat state
  chatSender = $state('');
  chatIsland = $state('');
  chatText = $state('');
  isPostingChat = $state(false);

  revealedCodes: Record<string, boolean> = $state({});
  loadingReviewId: string | null = $state(null);
  liveTime = $state(new Date());

  constructor() {
    this.init();
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.liveTime = new Date();
      }, 1000);
    }
  }

  init() {
    if (typeof window !== 'undefined') {
      // Intercept fetch to automatically include X-WP-Nonce for REST API calls
      const originalFetch = window.fetch;
      window.fetch = async function(...args: any[]) {
        const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url ? args[0].url : '');
        if (url && url.includes('/wp-json/dodo-air/')) {
          const wpApiSettings = (window as any).wpApiSettings;
          if (wpApiSettings && wpApiSettings.nonce) {
            args[1] = args[1] || {};
            args[1].headers = args[1].headers || {};
            if (args[1].headers instanceof Headers) {
              args[1].headers.set('X-WP-Nonce', wpApiSettings.nonce);
            } else if (Array.isArray(args[1].headers)) {
              args[1].headers.push(['X-WP-Nonce', wpApiSettings.nonce]);
            } else {
              args[1].headers['X-WP-Nonce'] = wpApiSettings.nonce;
            }
          }
        }
        return originalFetch.apply(window, args as any);
      };

      try {
        const saved = localStorage.getItem('dal_passport');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.villagerName || parsed.hasCreated) {
            this.passport = {
              miles: 2000,
              claimedStampIds: [],
              hasBoarded: false,
              hasHosted: false,
              hasChatted: false,
              hasCustomized: false,
              hasRequested: false,
              ...parsed
            };
            this.passportForm = { ...this.passport };
          }
        }
      } catch (e) {
        console.error(e);
      }
      
      this.showOrvilleIntro = localStorage.getItem('dal_orville_intro') !== 'hidden';
      this.chatSender = localStorage.getItem('dal_chat_sender') || '';
      this.chatIsland = localStorage.getItem('dal_chat_island') || '';
      const savedMode = localStorage.getItem('dal_system_mode');
      if (savedMode === 'DAL' || savedMode === 'LUNA') {
        this.systemMode = savedMode;
      }
    }
  }

  toggleSystemMode() {
    this.systemMode = this.systemMode === 'DAL' ? 'LUNA' : 'DAL';
    localStorage.setItem('dal_system_mode', this.systemMode);
    this.playSound('bell');
  }

  playSound(type: 'beep' | 'chatter' | 'success' | 'airplane' | 'bell') {
    if (this.isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'beep') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 0.03);
        
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5
        gain2.gain.setValueAtTime(0.001, ctx.currentTime + 0.12);
        gain2.gain.linearRampToValueAtTime(0.012, ctx.currentTime + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
        osc2.start(ctx.currentTime + 0.12);
        osc2.stop(ctx.currentTime + 0.45);

        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.connect(gain3);
        gain3.connect(ctx.destination);
        osc3.type = 'triangle';
        osc3.frequency.setValueAtTime(783.99, ctx.currentTime + 0.24); // G5
        gain3.gain.setValueAtTime(0.001, ctx.currentTime + 0.24);
        gain3.gain.linearRampToValueAtTime(0.010, ctx.currentTime + 0.27);
        gain3.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.48);
        osc3.start(ctx.currentTime + 0.24);
        osc3.stop(ctx.currentTime + 0.5);

        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'airplane') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(110, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.8);
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.012, ctx.currentTime + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9);
        osc.start();
        osc.stop(ctx.currentTime + 0.95);
      } else if (type === 'bell') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(783.99, ctx.currentTime); // G5
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.012, ctx.currentTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
        
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(987.77, ctx.currentTime + 0.12); // B5
        gain2.gain.setValueAtTime(0.001, ctx.currentTime + 0.12);
        gain2.gain.linearRampToValueAtTime(0.009, ctx.currentTime + 0.16);
        gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.55);
        osc2.start(ctx.currentTime + 0.12);
        osc2.stop(ctx.currentTime + 0.6);
      } else if (type === 'chatter') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500 + Math.random() * 200, ctx.currentTime);
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.010, ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
      }
    } catch (e) {}
  }

  earnStampProgress(field: 'hasBoarded' | 'hasHosted' | 'hasChatted' | 'hasCustomized' | 'hasRequested') {
    if (!this.passport.hasCreated) return;
    if (this.passport[field]) return;

    this.passport[field] = true;
    localStorage.setItem('dal_passport', JSON.stringify(this.passport));
    this.playSound('success');
  }

  claimStampMiles(stampId: string, amount: number) {
    const currentClaimed = this.passport.claimedStampIds || [];
    if (currentClaimed.includes(stampId)) return;

    this.passport.miles = (this.passport.miles || 0) + amount;
    this.passport.claimedStampIds = [...currentClaimed, stampId];
    localStorage.setItem('dal_passport', JSON.stringify(this.passport));
    this.playSound('success');
  }

  async fetchState(showIndicator = false) {
    if (showIndicator) this.isSyncing = true;
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (typeof window !== 'undefined' && (window as any).wpApiSettings?.nonce) {
        headers['X-WP-Nonce'] = (window as any).wpApiSettings.nonce;
      }
      
      const res = await fetch('/wp-json/dodo-air/v1/state', { headers });
      if (res.ok) {
        const data = await res.json();
        this.flights = data.flights || [];
        this.dreams = data.dreams || [];
        this.chatter = data.chatter || [];
        this.requests = data.requests || [];
      }
    } catch (err) {
      console.error('Failed to sync state:', err);
    } finally {
      if (showIndicator) {
        setTimeout(() => (this.isSyncing = false), 500);
      }
    }
  }

  async initAuth() {
    this.isAuthChecking = true;
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (typeof window !== 'undefined' && (window as any).wpApiSettings?.nonce) {
        headers['X-WP-Nonce'] = (window as any).wpApiSettings.nonce;
      }
      
      const res = await fetch('/wp-json/dodo-air/v1/auth/status', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.loggedIn) {
          this.isLoggedIn = true;
          this.userEmail = data.email;
        } else {
          this.isLoggedIn = false;
          this.userEmail = '';
        }
      } else {
        this.isLoggedIn = false;
        this.userEmail = '';
      }
    } catch (err) {
      console.error('Failed to check auth status:', err);
      this.isLoggedIn = false;
      this.userEmail = '';
    } finally {
      this.isAuthChecking = false;
    }
  }
}

export const dalStore = new DalState();
