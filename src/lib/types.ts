/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Passenger {
  id: string;
  name: string;
  island: string;
  checkedInAt: string;
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
  travelType?: 'DAL' | 'LUNA';
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
  dreams: Flight[];
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
}

export interface StampChallenge {
  id: string;
  title: string;
  desc: string;
  miles: number;
  condition: string;
  icon: string;
}

export const TITLE_PART_1 = [
  "Freshly Picked", "Easygoing", "Aspiring", "Cozy", "Turnip", "Bell-pinching",
  "Wild", "Pocket-sized", "Over-caffeinated", "Tarantula-hunting", "Deserted",
  "Nook's Favorite", "Flower-watering", "Star-gazing", "Fossil-seeking", "Scurrying",
  "High-flying", "Sleepy", "Bubbly", "Island-hopping", "Campfire"
];

export const TITLE_PART_2 = [
  "Islander", "Native", "Traveler", "Tycoon", "Gardener", "Beetle Buster",
  "Explorer", "Resident Representative", "Dreamer", "DIY Collector", "Fisherman",
  "Bells Hoarder", "Shell Collector", "Pilot", "Backpacker", "Nookling", "Dodo Fanatic"
];

export const AVATAR_ICONS = [
  { char: "🦤", label: "Dodo" },
  { char: "🍎", label: "Apple" },
  { char: "🍒", label: "Cherry" },
  { char: "🍊", label: "Orange" },
  { char: "🍑", label: "Peach" },
  { char: "🍐", label: "Pear" },
  { char: "🥥", label: "Coconut" },
  { char: "🎃", label: "Pumpkin" },
  { char: "🍅", label: "Tomato" },
  { char: "🥔", label: "Potato" },
  { char: "🥕", label: "Carrot" },
  { char: "🌾", label: "Wheat" },
  { char: "🎋", label: "Sugarcane" },
  { char: "🦋", label: "Butterfly" },
  { char: "🪲", label: "Beetle (Bug)" },
  { char: "🐞", label: "Ladybug" },
  { char: "💰", label: "Bell Bag" },
  { char: "🦖", label: "Fossil" },
  { char: "🌠", label: "Star" },
  { char: "🍃", label: "Leaf" },
  { char: "🌴", label: "Palm Tree" },
  { char: "🎁", label: "Present" },
  { char: "🎣", label: "Fishing Rod" },
  { char: "⛺", label: "Tent" },
  { char: "🧸", label: "Plushie" },
  { char: "🦉", label: "Owl" }
];

export const PASSPORT_COLORS = [
  { bg: 'bg-[#FF9A9E]/20', border: 'border-[#FF9A9E]/40', dot: 'bg-[#FF9A9E]', text: 'text-[#FF9A9E]', name: 'Coral Pink' },
  { bg: 'bg-[#A1C4FD]/20', border: 'border-[#A1C4FD]/40', dot: 'bg-[#A1C4FD]', text: 'text-[#A1C4FD]', name: 'Seafoam Blue' },
  { bg: 'bg-[#D4FC79]/20', border: 'border-[#D4FC79]/40', dot: 'bg-[#D4FC79]', text: 'text-[#D4FC79]', name: 'Nook Green' },
  { bg: 'bg-[#FAD0C4]/20', border: 'border-[#FAD0C4]/40', dot: 'bg-[#FAD0C4]', text: 'text-[#FAD0C4]', name: 'Sunset Orange' },
  { bg: 'bg-[#E2D1F9]/20', border: 'border-[#E2D1F9]/40', dot: 'bg-[#E2D1F9]', text: 'text-[#E2D1F9]', name: 'Lavender Mist' }
];

export const GATE_THEMES: Record<number, { name: string; icon: string; desc: string; color: string; bg: string; text: string; tag: string }> = {
  1: { name: "Nook's Trading Post", icon: "💰", desc: "Optimal for Turnip Sellers, trading items/Bells, and cataloging items.", color: "#0084CC", bg: "bg-sky-50", text: "text-[#0084CC]", tag: "SKY-1" },
  2: { name: "Meteor Observatory", icon: "🌠", desc: "Optimal for meteor showers, Celeste stargazing, and space DIY hunting.", color: "#FF9F43", bg: "bg-orange-50", text: "text-[#FF9F43]", tag: "STAR-2" },
  3: { name: "Flick & C.J. Safari", icon: "🦋", desc: "Optimal for premium Bug Catching, Fishing tourneys, and bug swaps.", color: "#E05252", bg: "bg-red-50", text: "text-[#E05252]", tag: "BUG-3" },
  4: { name: "Island Explorers", icon: "🏝️", desc: "Optimal for sightseeing, shopping, fruit picking, and custom tours.", color: "#2ECC71", bg: "bg-emerald-50", text: "text-[#2ECC71]", tag: "COAST-4" },
  5: { name: "DIY & Freebie Lounge", icon: "🎁", desc: "Optimal for recipe card swaps, clothing giveaways, and item recycling.", color: "#9B59B6", bg: "bg-purple-50", text: "text-[#9B59B6]", tag: "LOBBY-5" }
};

export const DREAM_THEMES: Record<number, { name: string; icon: string; desc: string; color: string; bg: string; text: string; tag: string }> = {
  1: { name: "Cottagecore / Fairycore", icon: "🍄", desc: "Aesthetic forests, mushrooms, and whimsical nature vibes.", color: "#8B5A2B", bg: "bg-amber-50", text: "text-[#8B5A2B]", tag: "NATURE-1" },
  2: { name: "Horror / Spooky", icon: "👻", desc: "Haunted towns, creepy stories, and scary island themes.", color: "#4B0082", bg: "bg-purple-50", text: "text-[#4B0082]", tag: "SPOOKY-2" },
  3: { name: "Urban / Citycore", icon: "🏙️", desc: "Bustling streets, crosswalks, shops, and dense city living.", color: "#555555", bg: "bg-gray-50", text: "text-[#555555]", tag: "CITY-3" },
  4: { name: "Tropical Resort", icon: "🏖️", desc: "Relaxing beaches, tiki bars, pools, and island getaways.", color: "#00CED1", bg: "bg-cyan-50", text: "text-[#00CED1]", tag: "RESORT-4" },
  5: { name: "Interactive Puzzle", icon: "🧩", desc: "Maze runs, mysteries, scavenger hunts, and lore islands.", color: "#FF4500", bg: "bg-orange-50", text: "text-[#FF4500]", tag: "PUZZLE-5" }
};

export const STAMP_CHALLENGES: StampChallenge[] = [
  { id: 'create', title: 'Frequent Flyer Stamp', desc: 'Complete and print your official Dodo Airlines Passport', miles: 500, condition: 'Print Passport', icon: '✈️' },
  { id: 'board', title: 'Island Hopper Journey', desc: 'Board any active seaplane flight and travel overseas', miles: 1000, condition: 'Board 1 flight', icon: '🏝️' },
  { id: 'host', title: 'Island Sponsor Hospitality', desc: 'Open your airport gate and list an active flight plan', miles: 1500, condition: 'Host 1 flight', icon: '🏡' },
  { id: 'chat', title: 'Tower Airwaves Chatterbox', desc: 'Broadcast a message over the airport terminal radio', miles: 300, condition: 'Send 1 radio dispatch', icon: '📻' },
  { id: 'custom', title: 'Passport Customizer Extra', desc: 'Update your passport signature or portrait photo', miles: 200, condition: 'Customize signature/avatar', icon: '🎨' },
  { id: 'standby', title: 'Lounge Standby Seeker', desc: 'Register a standby passenger request in the lounge', miles: 500, condition: 'File 1 standby request', icon: '🛋️' }
];
