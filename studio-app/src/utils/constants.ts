/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
  { char: "🍑", label: "Peach" },
  { char: "💰", label: "Bell Bag" },
  { char: "🦖", label: "Fossil" },
  { char: "🌠", label: "Star" },
  { char: "🍃", label: "Leaf" },
  { char: "🍎", label: "Apple" },
  { char: "🌴", label: "Palm Tree" },
  { char: "🎁", label: "Present" },
  { char: "🦋", label: "Butterfly" },
  { char: "🎣", label: "Fishing Rod" },
  { char: "⛺", label: "Tent" },
  { char: "🧸", label: "Plushie" },
  { char: "🦉", label: "Owl" },
  { char: "🍊", label: "Orange" }
];

export const PASSPORT_COLORS = [
  { bg: 'bg-[#FF9A9E]/20', border: 'border-[#FF9A9E]/40', dot: 'bg-[#FF9A9E]', text: 'text-[#FF9A9E]', name: 'Coral Pink' },
  { bg: 'bg-[#A1C4FD]/20', border: 'border-[#A1C4FD]/40', dot: 'bg-[#A1C4FD]', text: 'text-[#A1C4FD]', name: 'Seafoam Blue' },
  { bg: 'bg-[#D4FC79]/20', border: 'border-[#D4FC79]/40', dot: 'bg-[#D4FC79]', text: 'text-[#D4FC79]', name: 'Nook Green' },
  { bg: 'bg-[#FAD0C4]/20', border: 'border-[#FAD0C4]/40', dot: 'bg-[#FAD0C4]', text: 'text-[#FAD0C4]', name: 'Sunset Orange' },
  { bg: 'bg-[#E2D1F9]/20', border: 'border-[#E2D1F9]/40', dot: 'bg-[#E2D1F9]', text: 'text-[#E2D1F9]', name: 'Lavender Mist' }
];

export const PLANE_COLORS = [
  { id: 'orange', name: 'Orange Seaplane', hex: '#FF9F43', bg: 'bg-[#FF9F43]', border: 'border-[#E27A14]', text: 'text-[#FF9F43]' },
  { id: 'blue', name: 'Blue Seaplane', hex: '#0084CC', bg: 'bg-[#0084CC]', border: 'border-[#00659C]', text: 'text-[#0084CC]' },
  { id: 'green', name: 'Green Seaplane', hex: '#2ECC71', bg: 'bg-[#2ECC71]', border: 'border-[#229B53]', text: 'text-[#2ECC71]' },
  { id: 'yellow', name: 'Yellow Seaplane', hex: '#F1C40F', bg: 'bg-[#F1C40F]', border: 'border-[#BCA110]', text: 'text-[#F1C40F]' }
] as const;

export const GATE_THEMES: Record<number, { name: string; icon: string; desc: string; color: string; bg: string; text: string; tag: string }> = {
  1: { name: "Nook's Trading Post", icon: "💰", desc: "Optimal for Turnip Sellers, trading items/Bells, and cataloging items.", color: "#0084CC", bg: "bg-sky-50", text: "text-[#0084CC]", tag: "SKY-1" },
  2: { name: "Meteor Observatory", icon: "🌠", desc: "Optimal for meteor showers, Celeste stargazing, and space DIY hunting.", color: "#FF9F43", bg: "bg-orange-50", text: "text-[#FF9F43]", tag: "STAR-2" },
  3: { name: "Flick & C.J. Safari", icon: "🦋", desc: "Optimal for premium Bug Catching, Fishing tourneys, and bug swaps.", color: "#E05252", bg: "bg-red-50", text: "text-[#E05252]", tag: "BUG-3" },
  4: { name: "Island Explorers", icon: "🏝️", desc: "Optimal for sightseeing, shopping, fruit picking, and custom tours.", color: "#2ECC71", bg: "bg-emerald-50", text: "text-[#2ECC71]", tag: "COAST-4" },
  5: { name: "DIY & Freebie Lounge", icon: "🎁", desc: "Optimal for recipe card swaps, clothing giveaways, and item recycling.", color: "#9B59B6", bg: "bg-purple-50", text: "text-[#9B59B6]", tag: "LOBBY-5" }
};

export interface StampChallenge {
  id: string;
  title: string;
  desc: string;
  miles: number;
  condition: string;
  icon: string;
}

export const STAMP_CHALLENGES: StampChallenge[] = [
  { id: 'create', title: 'Frequent Flyer Stamp', desc: 'Complete and print your official Dodo Airlines Passport', miles: 500, condition: 'Print Passport', icon: '✈️' },
  { id: 'board', title: 'Island Hopper Journey', desc: 'Board any active seaplane flight and travel overseas', miles: 1000, condition: 'Board 1 flight', icon: '🏝️' },
  { id: 'host', title: 'Island Sponsor Hospitality', desc: 'Open your airport gate and list an active flight plan', miles: 1500, condition: 'Host 1 flight', icon: '🏡' },
  { id: 'chat', title: 'Tower Airwaves Chatterbox', desc: 'Broadcast a message over the airport terminal radio', miles: 300, condition: 'Send 1 radio dispatch', icon: '📻' },
  { id: 'custom', title: 'Passport Customizer Extra', desc: 'Update your passport signature or portrait photo', miles: 200, condition: 'Customize signature/avatar', icon: '🎨' },
  { id: 'standby', title: 'Lounge Standby Seeker', desc: 'Register a standby passenger request in the lounge', miles: 500, condition: 'File 1 standby request', icon: '🛋️' }
];

export const generateRandomFriendCode = (): string => {
  const chars = ['X', '0'];
  const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `SW-${segment()}-${segment()}-${segment()}`;
};
