/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Passenger {
	id: string;
	name: string;
	island: string;
	checkedInAt: string;
	friendCode?: string;
}

export type FlightStatus = 'Scheduled' | 'Boarding' | 'Departed' | 'Delayed' | 'Closed';

export interface Flight {
	id: string;
	hostName: string;
	islandName: string;
	dodoCode: string;
	hemisphere: 'Northern' | 'Southern';
	gate: number;
	description: string;
	status: FlightStatus;
	passengers: Passenger[];
	createdAt: string;
	announcement?: string;
	review?: string;
	isCustomAIReviewGenerating?: boolean;
	planeType?: 'Switch' | 'Switch 2';
	capacity?: number;
	planeColor?: 'blue' | 'green' | 'orange' | 'yellow';
	hostFriendCode?: string;
	milesCost?: number;
}

export interface ChatterMessage {
	id: string;
	sender: string;
	island?: string;
	text: string;
	timestamp: string;
	type: 'user' | 'system' | 'orville' | 'wilbur';
}

export interface ServerState {
	flights: Flight[];
	chatter: ChatterMessage[];
	requests: StandbyRequest[];
}

export interface StandbyRequest {
	id: string;
	name: string;
	island: string;
	title: string;
	avatar: string;
	friendCode: string;
	gateType: number;
	timePreference: string;
	memo: string;
	createdAt: string;
}

export interface Passport {
	villagerName: string;
	islandName: string;
	titlePart1: string;
	titlePart2: string;
	friendCode: string;
	dreamAddress?: string;
	avatarIcon: string;
	signature: string;
	hasCreated: boolean;
	colorIndex: number;
	miles?: number;
	claimedStampIds?: string[];
	hasBoarded?: boolean;
	hasHosted?: boolean;
	hasChatted?: boolean;
	hasCustomized?: boolean;
	hasRequested?: boolean;
	nativeFruit?: string;
	planeType?: 'Switch' | 'Switch 2';
	planeColor?: 'blue' | 'green' | 'orange' | 'yellow';
	flightNumber?: string;
}

export interface FeedbackReview {
	id: string;
	targetFriendCode: string;
	authorName: string;
	authorIsland: string;
	ratingType: 'apple' | 'turnip';
	comment: string;
	createdAt: string;
}

export interface UserProfile {
	userId: number | string;
	friendCode?: string;
	dreamAddress?: string;
	villagerName: string;
	islandName: string;
	avatarIcon: string;
	title: string;
	signature: string;
	colorIndex: number;
	goodApples: number;
	rottenTurnips: number;
	vouchers?: Record<string, 'apple' | 'turnip'>;
	updatedAt: string;
	flightNumber?: string;
}
