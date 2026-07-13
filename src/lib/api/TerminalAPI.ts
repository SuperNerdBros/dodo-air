import { dalStore } from '$lib/stores/dal.svelte';
import type { FlightStatus, StandbyRequest } from '$lib/studio-types';

export const TerminalAPI = {
	async hostFlight(payload: any) {
		const endpoint =
			dalStore.systemMode === 'DAL'
				? '/wp-json/dodo-air/v1/flights'
				: '/wp-json/dodo-air/v1/dreams';
		const res = await fetch(endpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
		if (!res.ok) throw await res.json();
		return await res.json();
	},

	async createStandbyRequest(payload: any) {
		const res = await fetch('/wp-json/dodo-air/v1/requests', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
		if (!res.ok) throw await res.json();
		return true;
	},

	async removeStandbyRequest(reqId: string) {
		const res = await fetch(`/wp-json/dodo-air/v1/requests/${reqId}`, { method: 'DELETE' });
		if (!res.ok) throw new Error('Failed to delete');
		return true;
	},

	async boardFlight(flightId: string, payload: any) {
		const endpoint =
			dalStore.systemMode === 'DAL'
				? `/wp-json/dodo-air/v1/flights/${flightId}/board`
				: `/wp-json/dodo-air/v1/dreams/${flightId}/visit`;
		const res = await fetch(endpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
		if (!res.ok) throw await res.json();
		return true;
	},

	async leaveFlight(flightId: string, passengerId: string) {
		const endpoint =
			dalStore.systemMode === 'DAL'
				? `/wp-json/dodo-air/v1/flights/${flightId}/leave`
				: `/wp-json/dodo-air/v1/dreams/${flightId}/leave`;
		const res = await fetch(endpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ passengerId })
		});
		if (!res.ok) throw new Error('Failed');
		return true;
	},

	async updateStatus(flightId: string, newStatus: FlightStatus, dodoCode?: string) {
		const endpoint =
			dalStore.systemMode === 'DAL'
				? `/wp-json/dodo-air/v1/flights/${flightId}/status`
				: `/wp-json/dodo-air/v1/dreams/${flightId}/status`;
		const res = await fetch(endpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ status: newStatus, dodoCode })
		});
		if (!res.ok) throw new Error('Failed');
		return true;
	},

	async postChat(payload: any) {
		const res = await fetch('/wp-json/dodo-air/v1/chatter', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
		if (!res.ok) throw new Error('Failed');
		return true;
	},

	async submitReview(friendCode: string, payload: any) {
		const res = await fetch(
			`/wp-json/dodo-air/v1/profiles/${encodeURIComponent(friendCode)}/rate`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			}
		);
		if (!res.ok) throw await res.json();
		return true;
	},

	async getReviews(friendCode: string) {
		const res = await fetch(
			`/wp-json/dodo-air/v1/profiles/${encodeURIComponent(friendCode)}/reviews`
		);
		if (!res.ok) throw new Error('Failed');
		return await res.json();
	},

	async rerollNumber() {
		const res = await fetch('/wp-json/dodo-air/v1/flights/reroll-number', {
			method: 'POST'
		});
		if (!res.ok) throw await res.json();
		return await res.json();
	},

	async generateAIReview(flightId: string) {
		const res = await fetch('/wp-json/dodo-air/v1/ai/review', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ flightId })
		});
		if (!res.ok) throw new Error('Failed');
		return true;
	}
};
