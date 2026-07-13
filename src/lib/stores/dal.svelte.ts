import {
	type Flight,
	type ChatterMessage,
	type StandbyRequest,
	type Passport,
	type FlightStatus
} from '../types';

export class DalState {
	currentTab: 'book' | 'hub' | 'radio' = $state('book');
	systemMode: 'DAL' | 'LUNA' = $state('DAL');
	flights: Flight[] = $state([]);
	dreams: Flight[] = $state([]);
	requests: StandbyRequest[] = $state([]);
	chatter: ChatterMessage[] = $state([]);
	selectedFlightId: string | null = $state(null);

	totalIslanders = $state(0);
	onlineIslanders = $state(0);

	// Auth state
	isLoggedIn = $state(false);
	userEmail = $state('');
	isAuthChecking = $state(true);

	isMuted = $state(false);
	isSyncing = $state(false);
	aiFuel = $state({ aiTokens: 15000, maxTokens: 20000 });
	profiles: Record<string, any> = $state({});
	mySchedules: any[] = $state([]);
	views = $state(0);
	visitors = $state(0);
	alltimePilots = $state(0);
	alltimePassengers = $state(0);

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
		hasRequested: false,
		xp: 0
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
	showHubModal = $state(false);
	hubWizardInitialStep = $state(1);
	requestError = $state('');
	isSubmittingRequest = $state(false);

	// Host Form State
	formDodo = $state('');
	formHemisphere: 'Northern' | 'Southern' = $state('Northern');
	formGate = $state(1);
	formDesc = $state('');
	formPlaneType: 'Switch' | 'Switch 2' = $state('Switch');
	formMilesCost = $state(0);
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
			window.fetch = async function (...args: any[]) {
				const url =
					typeof args[0] === 'string' ? args[0] : args[0] && args[0].url ? args[0].url : '';
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
							xp: 0,
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

	private _audioCtx: AudioContext | null = null;

	private getAudioContext() {
		if (typeof window === 'undefined') return null;
		if (!this._audioCtx) {
			const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
			if (AudioCtx) {
				this._audioCtx = new AudioCtx();
			}
		}
		return this._audioCtx;
	}

	playSound(type: 'beep' | 'chatter' | 'success' | 'airplane' | 'bell') {
		if (this.isMuted) return;
		try {
			const ctx = this.getAudioContext();
			if (!ctx) return;

			if (ctx.state === 'suspended') {
				ctx.resume();
			}

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
				gain3.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.27);
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
				gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.01);
				gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
				osc.start();
				osc.stop(ctx.currentTime + 0.06);
			}
		} catch (e) {}
	}

	async earnStampProgress(
		field: 'hasBoarded' | 'hasHosted' | 'hasChatted' | 'hasCustomized' | 'hasRequested'
	) {
		if (!this.passport.hasCreated) return;
		if (this.passport[field]) return;

		this.passport[field] = true;
		if (typeof window !== 'undefined') {
			localStorage.setItem('dal_passport', JSON.stringify(this.passport));
			try {
				const headers: Record<string, string> = { 'Content-Type': 'application/json' };
				if ((window as any).wpApiSettings?.nonce) {
					headers['X-WP-Nonce'] = (window as any).wpApiSettings.nonce;
				}
				await fetch(
					'/wp-json/dodo-air/v1/profiles/' + encodeURIComponent(this.passport.friendCode),
					{
						method: 'POST',
						headers,
						body: JSON.stringify(this.passport)
					}
				);
			} catch (e) {
				console.error('Failed to sync progress with backend', e);
			}
		}
		this.playSound('success');
	}

	async rerollFlightNumber() {
		if (this.passport.miles < 500) {
			throw new Error('Not enough FF Miles! Need 500.');
		}
		
		const headers: Record<string, string> = { 'Content-Type': 'application/json' };
		if ((window as any).wpApiSettings?.nonce) {
			headers['X-WP-Nonce'] = (window as any).wpApiSettings.nonce;
		}

		const res = await fetch('/wp-json/dodo-air/v1/flights/reroll-number', {
			method: 'POST',
			headers
		});
		
		if (!res.ok) {
			const data = await res.json();
			throw new Error(data.message || data.error || 'Failed to re-roll flight number');
		}
		
		const data = await res.json();
		this.passport.flightNumber = data.flightNumber;
		this.passport.miles = data.miles;
		
		if (typeof window !== 'undefined') {
			localStorage.setItem('dal_passport', JSON.stringify(this.passport));
		}
		this.playSound('success');
	}

	async claimStampMiles(stampId: string, amount: number) {
		const currentClaimed = this.passport.claimedStampIds || [];
		if (currentClaimed.includes(stampId)) return;

		this.passport.miles = (this.passport.miles || 0) + amount;
		this.passport.claimedStampIds = [...currentClaimed, stampId];

		if (typeof window !== 'undefined') {
			localStorage.setItem('dal_passport', JSON.stringify(this.passport));

			// Sync GP/Miles with backend
			try {
				const formData = new FormData();
				formData.append('action', 'xp_sync_gp_debt');
				if ((window as any).wpApiSettings?.nonce) {
					formData.append('_ajax_nonce', (window as any).wpApiSettings.nonce);
				}

				await fetch('/wp-admin/admin-ajax.php?action=xp_sync_gp_debt', {
					method: 'POST',
					body: JSON.stringify({ gp: this.passport.miles }),
					headers: {
						'Content-Type': 'application/json'
					}
				});

				const headers: Record<string, string> = { 'Content-Type': 'application/json' };
				if ((window as any).wpApiSettings?.nonce) {
					headers['X-WP-Nonce'] = (window as any).wpApiSettings.nonce;
				}
				await fetch(
					'/wp-json/dodo-air/v1/profiles/' + encodeURIComponent(this.passport.friendCode),
					{
						method: 'POST',
						headers,
						body: JSON.stringify(this.passport)
					}
				);
			} catch (e) {
				console.error('Failed to sync miles with backend', e);
			}
		}

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
				if (data.totalIslanders !== undefined) this.totalIslanders = data.totalIslanders;
				if (data.onlineIslanders !== undefined) this.onlineIslanders = data.onlineIslanders;
				if (data.aiFuel) this.aiFuel = data.aiFuel;
				if (data.profiles) this.profiles = data.profiles;
				if (data.mySchedules) this.mySchedules = data.mySchedules;
				if (data.analytics) {
					this.views = data.analytics.views || 0;
					this.visitors = data.analytics.visitors || 0;
					this.alltimePilots = data.analytics.alltimePilots || 0;
					this.alltimePassengers = data.analytics.alltimePassengers || 0;
				}
				if (data.myPassport && (!this.passport.hasCreated || data.myPassport.hasCreated)) {
					const updatedPassport = { ...this.passport, ...data.myPassport };
					if (JSON.stringify(this.passport) !== JSON.stringify(updatedPassport)) {
						this.passport = updatedPassport;
						if (typeof window !== 'undefined')
							localStorage.setItem('dal_passport', JSON.stringify(this.passport));
					}
				}
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

	async logout() {
		try {
			const headers: Record<string, string> = { 'Content-Type': 'application/json' };
			if (typeof window !== 'undefined' && (window as any).wpApiSettings?.nonce) {
				headers['X-WP-Nonce'] = (window as any).wpApiSettings.nonce;
			}

			const res = await fetch('/wp-json/dodo-air/v1/auth/logout', { method: 'POST', headers });
			if (res.ok) {
				this.isLoggedIn = false;
				this.userEmail = '';
				this.playSound('beep');
				if (typeof window !== 'undefined') {
					localStorage.removeItem('dal_passport');
					window.location.reload();
				}
			}
		} catch (err) {
			console.error('Failed to logout:', err);
			this.playSound('beep');
		}
	}
}

export const dalStore = new DalState();
