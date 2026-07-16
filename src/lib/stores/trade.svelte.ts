import type { TradeListing, TradeSession, AcnhItem } from '../types';

export class TradeState {
	listings: TradeListing[] = $state([]);
	activeSession: TradeSession | null = $state(null);
	
	// Modals & UI
	showCreateModal = $state(false);
	showSessionModal = $state(false);
	
	// Form State for creating a listing
	formLfItems: AcnhItem[] = $state([]);
	formFtItems: AcnhItem[] = $state([]);
	formTravel: 'will_travel' | 'will_host' | 'flexible' | 'mm_required' = $state('flexible');
	
	isSubmitting = $state(false);
	error = $state('');

	resetForm() {
		this.formLfItems = [];
		this.formFtItems = [];
		this.formTravel = 'flexible';
		this.error = '';
	}
	
	async fetchListings() {
		try {
			const res = await fetch('/wp-json/dodo-air/v1/trades');
			if (res.ok) {
				const data = await res.json();
				this.listings = data;
			}
		} catch (err) {
			console.error('Failed to fetch trades', err);
		}
	}

	async createListing(authorId: string | number, authorName: string, authorIsland: string, authorAvatar: string) {
		this.isSubmitting = true;
		this.error = '';
		
		try {
			const payload = {
				authorId,
				authorName,
				authorIsland,
				authorAvatar,
				lfItems: this.formLfItems,
				ftItems: this.formFtItems,
				travelPreference: this.formTravel
			};

			const res = await fetch('/wp-json/dodo-air/v1/trades', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-WP-Nonce': (window as any).wpApiSettings?.nonce || ''
				},
				body: JSON.stringify(payload)
			});

			if (res.ok) {
				const newListing = await res.json();
				this.listings = [newListing, ...this.listings];
				this.showCreateModal = false;
				this.resetForm();
			} else {
				throw new Error('Failed to create listing');
			}
		} catch (err) {
			this.error = 'Failed to create listing. Please try again.';
		} finally {
			this.isSubmitting = false;
		}
	}
	
	// Start a Trade (or MM Trade)
	startSession(listing: TradeListing, travelerId: string | number, requiresMM = false) {
		this.activeSession = {
			id: `s-${Date.now()}`,
			listingId: listing.id,
			hostId: requiresMM ? 'mm-1' : (listing.travelPreference === 'will_host' ? listing.authorId : travelerId),
			travelerId: listing.travelPreference === 'will_host' ? travelerId : listing.authorId,
			middlemanId: requiresMM ? 'mm-1' : null,
			dodoCode: null,
			status: 'awaiting_code',
			chatLog: [],
			createdAt: new Date().toISOString()
		};
		this.showSessionModal = true;
	}
	
	closeSession() {
		this.activeSession = null;
		this.showSessionModal = false;
	}

	async cancelListing(listingId: string) {
		try {
			const res = await fetch(`/wp-json/dodo-air/v1/trades/${listingId}`, {
				method: 'DELETE',
				headers: {
					'X-WP-Nonce': (window as any).wpApiSettings?.nonce || ''
				}
			});
			if (res.ok) {
				const index = this.listings.findIndex(l => l.id === listingId);
				if (index !== -1) {
					this.listings.splice(index, 1);
				}
			}
		} catch (err) {
			console.error('Failed to cancel listing', err);
		}
	}
}

export const tradeStore = new TradeState();
