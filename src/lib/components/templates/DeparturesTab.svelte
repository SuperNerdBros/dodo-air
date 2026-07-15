<script lang="ts">
	import { onMount } from 'svelte';
	import { ChevronRight, Plane, PlusCircle, X } from '@lucide/svelte';
	import type {
		Flight,
		StandbyRequest,
		Passport,
		UserProfile,
		Passenger,
		FlightStatus
	} from '$lib/studio-types';
	import { playSound } from '$lib/utils/audio';
	import { GATE_THEMES, DREAM_THEMES, PLANE_COLORS } from '$lib/utils/constants';
	import { slide, fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { dalStore } from '$lib/stores/dal.svelte';
	import { DIALOGS } from '$lib/constants/dialogs';
	import AcnhBubble from '$lib/components/molecules/AcnhBubble.svelte';

	let {
		flights,
		selectedFlightId = $bindable(null),
		passport,
		profiles,
		openProfileModal,
		isMuted = false,
		isActive = false
	} = $props<{
		flights: Flight[];
		selectedFlightId: string | null;
		passport: Passport;
		profiles: Record<string, UserProfile>;
		openProfileModal: (id: string | number) => void;
		isMuted?: boolean;
		isActive?: boolean;
	}>();

	type FilterValue = 'All' | FlightStatus;
	let activeFilter = $state<FilterValue>('All');

	// Closed flights hidden from "All" — only visible via explicit Closed filter
	const isClosedExcluded = (f: Flight) => f.status !== 'Closed';
	// Helper for chronological sorting
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

	let filteredFlights = $derived.by(() => {
		const base =
			activeFilter === 'All'
				? flights.filter(isClosedExcluded)
				: flights.filter((f: Flight) => f.status === activeFilter);

		const todayIdx = new Date().getDay();
		const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		const todayStr = days[todayIdx];

		return base.sort((a, b) => {
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
	});

	// Count helpers for chip badges
	const countByStatus = (status: FlightStatus) =>
		flights.filter((f: Flight) => f.status === status).length;
	const countAll = $derived(flights.filter(isClosedExcluded).length);

	interface FilterChip {
		value: FilterValue;
		icon: string;
		dalLabel: string;
		lunaLabel: string;
		activeClass: string;
		tooltip: string;
	}

	const FILTER_CHIPS: FilterChip[] = [
		{
			value: 'All',
			icon: '✈️',
			dalLabel: 'All',
			lunaLabel: 'All',
			activeClass: 'bg-[#0084CC] text-white border-[#0084CC]',
			tooltip: 'All active flights (excludes closed)'
		},
		{
			value: 'Scheduled',
			icon: '🟢',
			dalLabel: 'Scheduled',
			lunaLabel: 'Scheduled',
			activeClass: 'bg-green-600 text-white border-green-600',
			tooltip: 'Flight plan registered & active — passengers can browse and book'
		},
		{
			value: 'Boarding',
			icon: '🟡',
			dalLabel: 'Boarding',
			lunaLabel: 'Dreaming',
			activeClass: 'bg-[#FFCC00] text-[#006094] border-[#FFCC00]',
			tooltip: 'Gate open & welcoming visitors — obtain the code and board now'
		},
		{
			value: 'Departed',
			icon: '⬜',
			dalLabel: 'Departed',
			lunaLabel: 'Departed',
			activeClass: 'bg-slate-500 text-white border-slate-500',
			tooltip: 'Seaplane airborne — boarding gates closed, flight in transit'
		},
		{
			value: 'Delayed',
			icon: '🟠',
			dalLabel: 'Delayed',
			lunaLabel: 'Delayed',
			activeClass: 'bg-amber-600 text-white border-amber-600',
			tooltip: 'Boarding paused — host temporarily away or gates congested'
		},
		{
			value: 'Closed',
			icon: '🔴',
			dalLabel: 'Closed',
			lunaLabel: 'Closed',
			activeClass: 'bg-rose-500 text-white border-rose-500',
			tooltip: 'Flight completed — gate permanently closed'
		}
	];

	const getChipCount = (chip: FilterChip): number => {
		return chip.value === 'All' ? countAll : countByStatus(chip.value as FlightStatus);
	};

	const getChipLabel = (chip: FilterChip): string => {
		return dalStore.systemMode === 'DAL' ? chip.dalLabel : chip.lunaLabel;
	};

	function getHostProfile(hostName: string, islandName: string) {
		return (Object.values(profiles) as UserProfile[]).find(
			(p) =>
				p.villagerName.toLowerCase() === hostName.toLowerCase() &&
				p.islandName.toLowerCase() === islandName.toLowerCase()
		);
	}

	function getPassengerProfile(name: string, island: string) {
		return (Object.values(profiles) as UserProfile[]).find(
			(p) =>
				p.villagerName.toLowerCase() === name.toLowerCase() &&
				p.islandName.toLowerCase() === island.toLowerCase()
		);
	}

	onMount(() => {
		const renderTime = performance.now();
		console.log(`[Diagnostic] DeparturesTab mounted and rendered at ${renderTime.toFixed(2)}ms`);
	});
</script>

<div class="space-y-4 pt-5">
	{#if isActive}
		<AcnhBubble
			title={dalStore.systemMode === 'DAL' ? 'Orville' : 'Luna'}
			dialogText={dalStore.systemMode === 'DAL'
				? DIALOGS.departuresTab.active
				: DIALOGS.departuresTab.lunaActive}
		/>
	{/if}
	<!-- Departures Board - Full Width -->
	<div class="space-y-3">
		<!-- Row 1: Title + Count -->
		<div
			id="active-departures-section"
			class="bg-white rounded-3xl border-2 border-[#0084CC]/10 p-4 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-sm"
		>
			<div class="flex items-center gap-2.5">
				<span class="w-2.5 h-2.5 rounded-full bg-[#0084CC] animate-ping shrink-0"></span>
				<div class="text-left">
					<h2
						class="text-base font-system font-black tracking-wider {dalStore.systemMode === 'DAL'
							? 'text-[#0084CC]'
							: 'text-[#4B0082]'} uppercase leading-none transition-colors"
					>
						{dalStore.systemMode === 'DAL' ? 'DAL DEPARTURES FLIGHT BOARD' : 'LUNA DOZE CODE BOARD'}
					</h2>
					<span
						class="text-xs font-system text-slate-400 font-bold uppercase tracking-widest mt-1 block"
					>
						{dalStore.systemMode === 'DAL'
							? 'CHOOSE FLIGHT TO REVEAL BOARDING PASS'
							: 'CHOOSE DREAM TO REVEAL DOZE CODE'}
					</span>
				</div>
			</div>

			<span
				class="{dalStore.systemMode === 'DAL'
					? 'bg-[#A2D2FF]/20 text-[#0084CC] border-[#0084CC]/10'
					: 'bg-[#DDA0DD]/20 text-[#4B0082] border-[#4B0082]/10'} text-sm font-system font-bold px-2.5 py-1 rounded-full border transition-colors"
			>
				{filteredFlights.length}
				{dalStore.systemMode === 'DAL' ? 'SEAPLANES ACTIVE' : 'DREAMS ACTIVE'}
			</span>
		</div>

		<!-- Row 2: Filter Chip Strip -->
		<div class="flex flex-wrap justify-center gap-1.5 px-1">
			{#each FILTER_CHIPS as chip (chip.value)}
				{@const count = getChipCount(chip)}
				{@const isActive = activeFilter === chip.value}
				{@const isClosed = chip.value === 'Closed'}
				<button
					title={chip.tooltip}
					class="filter-chip group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-system font-bold border transition-all cursor-pointer select-none
            {isActive
						? chip.activeClass + ' shadow-md scale-[1.03]'
						: isClosed
							? 'bg-slate-50 text-slate-400 border-slate-200/60 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-300'
							: 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300 shadow-sm'}"
					onclick={() => {
						playSound('beep', isMuted);
						activeFilter = chip.value;
					}}
				>
					<span
						class="text-sm leading-none {isClosed && !isActive
							? 'opacity-50 group-hover:opacity-100'
							: ''} transition-opacity">{chip.icon}</span
					>
					<span>{getChipLabel(chip)}</span>
					{#if count > 0 || isActive}
						<span
							class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black leading-none transition-colors
              {isActive ? 'bg-white/30 text-current' : 'bg-slate-100 text-slate-500'}"
						>
							{count}
						</span>
					{/if}
				</button>
			{/each}
		</div>

		<!-- Flights List Table View -->
		{#if filteredFlights.length === 0}
			<div
				class="bg-white border-2 border-[#0084CC]/10 rounded-[32px] py-14 text-center font-system text-slate-400"
			>
				{#if dalStore.systemMode === 'DAL'}
					<Plane class="w-10 h-10 mx-auto mb-2 text-slate-300 animate-bounce" />
				{:else}
					<div class="text-4xl mx-auto mb-2 text-slate-300 animate-pulse">🛌</div>
				{/if}
				<p class="text-xs font-bold uppercase">NO ACTIVE DESTINATIONS REGISTERED</p>
				<p class="text-sm mt-0.5">
					{dalStore.systemMode === 'DAL'
						? "Switch to 'My Flight Hub' to park your seaplane at the gate!"
						: "Switch to 'My Dream Hub' to share your dream!"}
				</p>
			</div>
		{:else}
			<div class="bg-white rounded-[32px] border-2 border-[#0084CC]/10 shadow-sm overflow-hidden">
				<div class="overflow-x-auto">
					<table class="w-full text-left border-collapse font-system whitespace-nowrap">
						<thead class="sticky top-0 z-10 bg-white">
							<tr
								class="bg-slate-50/50 border-b-2 border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-widest"
							>
								<th class="px-5 py-3 text-center"
									>{dalStore.systemMode === 'DAL' ? 'Gate' : 'Theme'}</th
								>
								<th class="px-5 py-3">{dalStore.systemMode === 'DAL' ? 'Flight' : 'Dream'}</th>
								<th class="px-5 py-3 text-center"
									>{dalStore.systemMode === 'DAL' ? 'Passengers' : 'Dreamers'}</th
								>
								<th class="px-5 py-3 text-center">Host</th>
								<th class="px-5 py-3"
									>{dalStore.systemMode === 'DAL' ? 'Destination' : 'Dreamscape'}</th
								>
								<th class="px-5 py-3 text-center">Time</th>
								<th class="px-5 py-3 pr-6 text-right"></th>
								<th class="px-5 py-3 text-center">Status</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-100">
							{#each filteredFlights as flight (flight.id + '-' + flight.createdAt)}
								{@const isSelected = selectedFlightId === flight.id}
								{@const hasBoarded = flight.passengers.some((p: Passenger) =>
									p.userId
										? String(p.userId) === String(passport.userId)
										: p.friendCode
											? p.friendCode === passport.friendCode
											: p.name.toLowerCase() === passport.villagerName.toLowerCase()
								)}
								{@const activeTheme =
									dalStore.systemMode === 'DAL'
										? GATE_THEMES[flight.gate] || GATE_THEMES[1]
										: DREAM_THEMES[flight.gate] || DREAM_THEMES[1]}
								{@const planeColorVal =
									PLANE_COLORS.find((pc) => pc.id === (flight.planeColor || 'orange')) ||
									PLANE_COLORS[0]}
								{@const hostProfile = getHostProfile(flight.hostName, flight.islandName)}

								<!-- svelte-ignore a11y_click_events_have_key_events -->
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<tr
									animate:flip={{ duration: 300 }}
									class="group transition-all cursor-pointer hover:bg-[#FFFCEF]/60 {isSelected
										? 'bg-sky-50/50 hover:bg-sky-50/50 shadow-[inset_4px_0_0_0_#0084CC]'
										: ''}"
									style="--hover-color: {planeColorVal.hex}"
									onclick={() => {
										playSound('beep', isMuted);
										selectedFlightId = isSelected ? null : flight.id;
									}}
								>
									<!-- GATE -->
									<td class="px-5 py-3 text-center">
										<div class="flex items-center justify-center gap-2">
											<div
												class="inline-flex flex-col items-center justify-center w-10 h-10 {dalStore.systemMode ===
												'DAL'
													? 'bg-[#0084CC]'
													: 'bg-[#4B0082]'} rounded-xl text-white font-system leading-none shadow-sm"
											>
												<span
													class="text-[9px] uppercase font-bold {dalStore.systemMode === 'DAL'
														? 'text-sky-200'
														: 'text-[#DDA0DD]'} mb-0.5"
													>{dalStore.systemMode === 'DAL' ? 'Gate' : 'Theme'}</span
												>
												<span class="text-[#FFCC00] font-black text-base">{flight.gate}</span>
											</div>
											<span class="text-xl drop-shadow-sm" title={activeTheme.name}
												>{activeTheme.icon}</span
											>
										</div>
									</td>
									<!-- FLIGHT -->
									<td class="px-5 py-3">
										<div class="flex items-center gap-2.5">
											{#if dalStore.systemMode === 'DAL'}
												<Plane
													class="w-4 h-4 transition-colors"
													style="color: {isSelected
														? planeColorVal.hex
														: 'var(--plane-color, #cbd5e1)'}"
												/>
											{:else}
												<span
													class="text-sm {isSelected
														? ''
														: 'grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100'} transition-all"
													>🛌</span
												>
											{/if}
											<div>
												<div class="font-black text-[#0084CC] text-sm flex items-center gap-1.5">
													{flight.flightNumber
														? (dalStore.systemMode === 'DAL' ? 'DAL-' : 'LUL-') +
															flight.flightNumber.replace(/^(DAL-|LUL-|LUNA-)/i, '')
														: flight.id}
													<span
														class="text-[9px] font-bold bg-[#A2D2FF]/25 text-[#006094] px-1.5 py-0.5 rounded-full leading-none"
													>
														{flight.hemisphere === 'Northern' ? 'N' : 'S'}
													</span>
												</div>
												{#if dalStore.systemMode !== 'DAL'}
													<div class="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
														Luna Dream
													</div>
												{/if}
											</div>
										</div>
									</td>

									<!-- PAS -->
									<td class="px-5 py-3 text-center">
										<div class="flex items-center justify-center gap-1 font-system">
											<span class="text-xs font-bold text-[#4A4A4A]"
												>👤 {flight.passengers.length}</span
											>
											<span class="text-[10px] text-slate-400"
												>/ {flight.capacity || (flight.planeType === 'Switch 2' ? 12 : 8)}</span
											>
										</div>
									</td>

									<!-- HOST -->
									<td class="px-5 py-3">
										<div class="flex flex-col items-center gap-1 text-center">
											<span
												onclick={(e) => {
													e.stopPropagation();
													openProfileModal(
														hostProfile
															? hostProfile.userId || hostProfile.friendCode || ''
															: `SW-TEMP-${flight.hostName}-${flight.islandName}`
													);
												}}
												class="font-bold text-amber-700 hover:text-amber-900 cursor-pointer text-sm underline-offset-2 hover:underline"
												title="View host trust profile"
											>
												{flight.hostName}
											</span>
											{#if hostProfile}
												<span
													onclick={(e) => {
														e.stopPropagation();
														openProfileModal(hostProfile.userId || hostProfile.friendCode || '');
													}}
													class="inline-flex items-center gap-1 text-[9px] font-system bg-[#E8F8F5] text-[#117A65] border border-[#A3E4D7] rounded-full px-1.5 py-0.5 font-black cursor-pointer hover:bg-[#D1F2EB]"
													title="Good Apples count"
												>
													🍏 {hostProfile.goodApples || 0}
													{#if hostProfile.rottenTurnips > 0}
														<span class="text-rose-700"> | 🧅 {hostProfile.rottenTurnips}</span>
													{/if}
												</span>
											{/if}
										</div>
									</td>

									<!-- DESTINATION -->
									<td class="px-5 py-3">
										<div class="font-black text-[#4A4A4A] text-sm">{flight.islandName}</div>
										<div
											class="text-[10px] text-slate-500 max-w-[150px] mt-0.5 truncate"
											title={flight.description}
										>
											"{flight.description}"
										</div>
									</td>

									<!-- TIME -->
									<td class="px-5 py-3 text-center">
										<div class="font-black text-[#0084CC] text-sm">
											{#if flight.scheduledTime}
												{flight.scheduledTime}
											{:else}
												{new Date(flight.createdAt).toLocaleTimeString([], {
													hour: '2-digit',
													minute: '2-digit'
												})}
											{/if}
										</div>
										<div
											class="text-[9px] text-slate-400 mt-0.5 font-bold tracking-wider uppercase"
										>
											{#if flight.scheduledTime}
												Scheduled
											{:else}
												{dalStore.systemMode === 'DAL' ? 'Listed' : 'Logged'}
											{/if}
										</div>
									</td>

									<!-- ACTION -->
									<td class="px-5 py-3 pr-6 text-right">
										<span
											class="text-[#0084CC] font-system text-xs font-black inline-flex items-center gap-0.5 group-hover:underline {isSelected
												? 'underline'
												: ''}"
										>
											Tickets <ChevronRight class="w-3 h-3" />
										</span>
									</td>

									<!-- STATUS -->
									<td class="px-5 py-3 text-center">
										{#if flight.passengers.length >= (flight.capacity || (flight.planeType === 'Switch 2' ? 12 : 8))}
											<span
												class="text-[10px] font-system font-black bg-amber-100 text-amber-800 border border-amber-200 px-2 py-1 rounded-full uppercase animate-pulse"
												title="Plane at maximum capacity. Host can board standby passengers."
											>
												FULL
											</span>
										{:else if hasBoarded}
											<span
												class="text-[10px] font-system font-black bg-green-100 text-green-700 border border-green-200 px-2 py-1 rounded-full uppercase"
											>
												BOARDED
											</span>
										{:else}
											<span
												class="text-[10px] font-system font-black px-2 py-1 rounded-full {flight.status ===
												'Boarding'
													? 'bg-[#FFCC00]/20 text-[#006094] border border-[#FFCC00] animate-pulse'
													: flight.status === 'Closed' || flight.status === 'Departed'
														? 'bg-slate-100 text-slate-400 border border-slate-200'
														: 'bg-green-50 text-green-700 border border-green-200'}"
											>
												{flight.status.toUpperCase()}
											</span>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	tr:hover {
		--plane-color: var(--hover-color) !important;
	}
</style>
