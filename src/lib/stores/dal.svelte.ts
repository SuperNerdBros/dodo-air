import {
	type Flight,
	type ChatterMessage,
	type StandbyRequest,
	type Passport,
	type FlightStatus
} from '../types';
import { io, Socket } from 'socket.io-client';

export class DalState {
	currentTab: 'book' | 'hub' | 'radio' = $state('book');
	systemMode: 'DAL' | 'LUNA' = $state('DAL');
	flights: Flight[] = $state([]);
	dreams: Flight[] = $state([]);
	requests: StandbyRequest[] = $state([]);
	chatter: ChatterMessage[] = $state([]);
	selectedFlightId: string | null = $state(null);
	selectedUserId: string | number | null = $state(null);

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
	appVersion = $state('0.0.0');

	myPassports: Passport[] = $state([]);
	activePassportIndex: number = $state(0);

	get passport(): Passport {
		if (!this.myPassports || this.myPassports.length === 0) {
			return this._defaultPassport();
		}
		return this.myPassports[this.activePassportIndex] || this.myPassports[0];
	}

	set passport(val: Passport) {
		if (!this.myPassports || this.myPassports.length === 0) {
			this.myPassports = [val];
			this.activePassportIndex = 0;
		} else {
			this.myPassports[this.activePassportIndex] = val;
		}
	}

	_defaultPassport(): Passport {
		return {
			villagerName: '',
			islandName: '',
			titlePart1: 'Freshly Picked',
			titlePart2: 'Islander',
			friendCode: '',
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
		};
	}

	isTrafficModalOpen = $state(false);
	isEditingPassport = $state(false);
	passportForm: Passport = $state({ ...this.passport });
	showPassportDrawer = $state(false);
	showMilesModal = $state(false);
	showFuelModal = $state(false);
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
			// Connect to WebSocket Server
			try {
				const socket = io('https://dodo-chatter.fly.dev', {
					transports: ['websocket']
				});
				socket.on('new_chat', (msg: ChatterMessage) => {
					this.chatter = [msg, ...this.chatter];
					if (this.chatter.length > 50) {
						this.chatter = this.chatter.slice(0, 50);
					}
				});
			} catch (e) {
				console.error('Failed to connect to radio tower socket:', e);
			}

			// Intercept fetch to automatically include X-WP-Nonce for REST API calls
			const originalFetch = window.fetch;
			window.fetch = async function (...args: any[]) {
				const url =
					typeof args[0] === 'string' ? args[0] : args[0] && args[0].url ? args[0].url : '';
				if (url && url.includes('/wp-json/')) {
					const wpApiSettings = (window as any).wpApiSettings;
					if (wpApiSettings && wpApiSettings.nonce) {
						args[1] = args[1] || {};
						args[1].headers = args[1].headers || {};
						args[1].credentials = args[1].credentials || 'include';
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

			// Wait for fetchState to populate passport.
			// No localStorage for passports!


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
		if (typeof window !== 'undefined') {
			import('../utils/audio').then(({ playSound }) => {
				playSound(type, this.isMuted);
			});
		}
	}

	async earnStampProgress(
		field: 'hasBoarded' | 'hasHosted' | 'hasChatted' | 'hasCustomized' | 'hasRequested'
	) {
		if (!this.passport.hasCreated) return;
		if (this.passport[field]) return;

		this.passport[field] = true;
		if (typeof window !== 'undefined') {

			try {
				const headers: Record<string, string> = { 'Content-Type': 'application/json' };
				if ((window as any).wpApiSettings?.nonce) {
					headers['X-WP-Nonce'] = (window as any).wpApiSettings.nonce;
				}
				await fetch(
					'/wp-json/dodo-air/v1/profiles/' + encodeURIComponent(this.passport.userId || this.passport.friendCode),
					{
						method: 'POST',
						headers,
						body: JSON.stringify({ passports: this.myPassports, activePassportIndex: this.activePassportIndex })
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

		}
		this.playSound('success');
	}

	async claimStampMiles(stampId: string, amount: number) {
		const currentClaimed = this.passport.claimedStampIds || [];
		if (currentClaimed.includes(stampId)) return;

		this.passport.miles = (this.passport.miles || 0) + amount;
		this.passport.claimedStampIds = [...currentClaimed, stampId];
		if (!this.passport.stampDates) this.passport.stampDates = {};
		this.passport.stampDates[stampId] = new Date().toISOString();

		if (typeof window !== 'undefined') {


			// Sync GP/Miles with backend using the new Gamification-enabled endpoint
			try {
				const headers: Record<string, string> = { 'Content-Type': 'application/json' };
				if ((window as any).wpApiSettings?.nonce) {
					headers['X-WP-Nonce'] = (window as any).wpApiSettings.nonce;
				}
				
				await fetch('/wp-json/dodo-air/v1/stamps/claim', {
					method: 'POST',
					headers,
					body: JSON.stringify({
						stampId: stampId,
						miles: amount
					})
				});

				// Also sync the passport state for good measure
				await fetch(
					'/wp-json/dodo-air/v1/profiles/' + encodeURIComponent(this.passport.userId || this.passport.friendCode),
					{
						method: 'POST',
						headers,
						body: JSON.stringify({ passports: this.myPassports, activePassportIndex: this.activePassportIndex })
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
			const headers: Record<string, string> = { 
				'Content-Type': 'application/json',
				'Cache-Control': 'no-cache, no-store, must-revalidate',
				'Pragma': 'no-cache',
				'Expires': '0'
			};
			if (typeof window !== 'undefined' && (window as any).wpApiSettings?.nonce) {
				headers['X-WP-Nonce'] = (window as any).wpApiSettings.nonce;
			}

			const res = await fetch(`/wp-json/dodo-air/v1/state?t=${Date.now()}`, { headers });
			if (res.ok) {
				const data = await res.json();
				
				// Chronological sort helper
				const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
				const parseTime = (timeStr: string) => {
					const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
					if (!match) return 0;
					let hours = parseInt(match[1]);
					const mins = parseInt(match[2]);
					const ampm = match[3].toUpperCase();
					if (ampm === 'PM' && hours < 12) hours += 12;
					if (ampm === 'AM' && hours === 12) hours = 0;
					return hours * 60 + mins;
				};

				const sortChronological = (arr: any[]) => {
					if (!arr) return [];
					const todayIdx = new Date().getDay();
					const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
					const todayStr = days[todayIdx];
					
					return arr.sort((a, b) => {
						const extractData = (str: string) => {
							if (!str) return { relDay: -1, time: 0 };
							let dayStr = todayStr;
							let timePart = str;
							const parts = str.split(' ');
							if (days.includes(parts[0])) {
								dayStr = parts[0];
								timePart = parts.slice(1).join(' ');
							}
							const relDay = (dayMap[dayStr] - todayIdx + 7) % 7;
							const time = parseTime(timePart.split('-')[0] || '');
							return { relDay, time };
						};
						const dataA = extractData(a.scheduledTime || '');
						const dataB = extractData(b.scheduledTime || '');
						if (dataA.relDay !== dataB.relDay) return dataA.relDay - dataB.relDay;
						return dataA.time - dataB.time;
					});
				};

				this.flights = sortChronological(data.flights || []);
				this.dreams = sortChronological(data.dreams || []);
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
				if (data.version) {
					this.appVersion = data.version;
				}
				if (data.myPassports) {
					this.myPassports = data.myPassports;
					if (data.activePassportIndex !== undefined) {
						this.activePassportIndex = data.activePassportIndex;
					}
					this.passportForm = { ...this.passport };
				} else if (data.myPassport && (!this.passport.hasCreated || data.myPassport.hasCreated)) {
					const updatedPassport = { ...this.passport, ...data.myPassport };
					if (JSON.stringify(this.passport) !== JSON.stringify(updatedPassport)) {
						this.passport = updatedPassport;
						this.passportForm = { ...this.passport };
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
					window.location.reload();
				}
			}
		} catch (err) {
			console.error('Failed to logout:', err);
			this.playSound('beep');
		}
	}

	async deletePassport() {
		this.passport = {
			villagerName: '',
			islandName: '',
			titlePart1: 'Freshly Picked',
			titlePart2: 'Islander',
			friendCode: '',
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
		};
		this.passportForm = { ...this.passport };
		
		if (typeof window !== 'undefined') {
			try {
				const headers: Record<string, string> = { 'Content-Type': 'application/json' };
				if ((window as any).wpApiSettings?.nonce) {
					headers['X-WP-Nonce'] = (window as any).wpApiSettings.nonce;
				}
				
				await fetch('/wp-json/dodo-air/v1/profiles/me', {
					method: 'POST',
					headers,
					body: JSON.stringify({ passports: this.myPassports, activePassportIndex: this.activePassportIndex })
				});
			} catch (e) {
				console.error('Failed to delete passport on backend', e);
			}
		}
		this.playSound('success');
	}
}

export const dalStore = new DalState();
