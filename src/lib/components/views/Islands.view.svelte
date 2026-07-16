<script lang="ts">
	import { onMount } from 'svelte';
	import type { Flight, Passport, UserProfile, FlightStatus } from '$lib/studio-types';
	import { dalStore } from '$lib/stores/dal.svelte.ts';
	import { DIALOGS } from '$lib/constants/dialogs';
	import AcnhBubble from '$lib/components/molecules/AcnhBubble.svelte';
	
	import BoardLayout from '../templates/BoardLayout.template.svelte';
	import FlightFilterStrip from '../organisms/FlightFilterStrip.organism.svelte';
	import FlightTable from '../organisms/FlightTable.organism.svelte';

	let {
		flights,
		selectedFlightId = $bindable(null),
		passport,
		profiles,
		openProfileModal,
		isMuted = false,
		isActive = false
	}: {
		flights: Flight[];
		selectedFlightId: string | null;
		passport: Passport;
		profiles: Record<string, UserProfile>;
		openProfileModal: (id: string | number) => void;
		isMuted?: boolean;
		isActive?: boolean;
	} = $props();

	type FilterValue = 'All' | FlightStatus;
	let activeFilter = $state<FilterValue>('All');
	let expandedFlightId = $state<string | null>(null);

	const isClosedExcluded = (f: Flight) => f.status !== 'Closed';
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

	const countByStatus = (status: FlightStatus) => flights.filter((f: Flight) => f.status === status).length;
	const countAll = $derived(flights.filter(isClosedExcluded).length);

	const FILTER_CHIPS = [
		{ value: 'All', icon: '✈️', dalLabel: 'All', lunaLabel: 'All', activeClass: 'bg-[#0084CC] text-white border-[#0084CC]', tooltip: 'All active flights (excludes closed)' },
		{ value: 'Scheduled', icon: '🟢', dalLabel: 'Scheduled', lunaLabel: 'Scheduled', activeClass: 'bg-green-600 text-white border-green-600', tooltip: 'Flight plan registered & active — passengers can browse and book' },
		{ value: 'Boarding', icon: '🟡', dalLabel: 'Boarding', lunaLabel: 'Dreaming', activeClass: 'bg-[#FFCC00] text-[#006094] border-[#FFCC00]', tooltip: 'Gate open & welcoming visitors — obtain the code and board now' },
		{ value: 'Departed', icon: '⬜', dalLabel: 'Departed', lunaLabel: 'Departed', activeClass: 'bg-slate-500 text-white border-slate-500', tooltip: 'Seaplane airborne — boarding gates closed, flight in transit' },
		{ value: 'Delayed', icon: '🟠', dalLabel: 'Delayed', lunaLabel: 'Delayed', activeClass: 'bg-amber-600 text-white border-amber-600', tooltip: 'Boarding paused — host temporarily away or gates congested' },
		{ value: 'Closed', icon: '🔴', dalLabel: 'Closed', lunaLabel: 'Closed', activeClass: 'bg-rose-500 text-white border-rose-500', tooltip: 'Flight completed — gate permanently closed' }
	];

	const getChipCount = (chip: any): number => chip.value === 'All' ? countAll : countByStatus(chip.value as FlightStatus);
	const getChipLabel = (chip: any): string => dalStore.systemMode === 'DAL' ? chip.dalLabel : chip.lunaLabel;

</script>

<BoardLayout>
	{#snippet alert()}
		{#if isActive}
			<AcnhBubble
				title={dalStore.systemMode === 'DAL' ? 'Orville' : 'Luna'}
				dialogText={dalStore.systemMode === 'DAL' ? DIALOGS.departuresTab.active : DIALOGS.departuresTab.lunaActive}
			/>
		{/if}
	{/snippet}

	{#snippet header()}
		<div id="active-departures-section" class="bg-white rounded-3xl border-2 border-[#0084CC]/10 p-4 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-sm">
			<div class="flex items-center gap-2.5">
				<span class="w-2.5 h-2.5 rounded-full bg-[#0084CC] animate-ping shrink-0"></span>
				<div class="text-left">
					<h2 class="text-base font-system font-black tracking-wider {dalStore.systemMode === 'DAL' ? 'text-[#0084CC]' : 'text-[#4B0082]'} uppercase leading-none transition-colors">
						{dalStore.systemMode === 'DAL' ? 'DAL DEPARTURES FLIGHT BOARD' : 'LUNA DOZE CODE BOARD'}
					</h2>
					<span class="text-xs font-system text-slate-400 font-bold uppercase tracking-widest mt-1 block">
						{dalStore.systemMode === 'DAL' ? 'CHOOSE FLIGHT TO REVEAL BOARDING PASS' : 'CHOOSE DREAM TO REVEAL DOZE CODE'}
					</span>
				</div>
			</div>
			<span class="{dalStore.systemMode === 'DAL' ? 'bg-[#A2D2FF]/20 text-[#0084CC] border-[#0084CC]/10' : 'bg-[#DDA0DD]/20 text-[#4B0082] border-[#4B0082]/10'} text-sm font-system font-bold px-2.5 py-1 rounded-full border transition-colors">
				{filteredFlights.length} {dalStore.systemMode === 'DAL' ? 'SEAPLANES ACTIVE' : 'DREAMS ACTIVE'}
			</span>
		</div>
	{/snippet}

	{#snippet filters()}
		<FlightFilterStrip
			chips={FILTER_CHIPS}
			bind:activeFilter
			{getChipCount}
			{getChipLabel}
			{isMuted}
		/>
	{/snippet}

	{#snippet content()}
		<FlightTable
			flights={filteredFlights}
			bind:selectedFlightId
			bind:expandedFlightId
			{passport}
			{profiles}
			{openProfileModal}
			systemMode={dalStore.systemMode}
			{isMuted}
		/>
	{/snippet}
</BoardLayout>
