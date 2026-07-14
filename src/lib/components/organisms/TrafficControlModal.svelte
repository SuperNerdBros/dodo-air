<script lang="ts">
	import { Compass, Ticket, Plane, BookOpen, Eye, Users, Cloud, X, Radio } from '@lucide/svelte';
	import { playSound } from '$lib/utils/audio';
	import { dalStore } from '$lib/stores/dal.svelte';

	let {
		isOpen,
		onClose,
		totalStandby,
		totalPassengers,
		alltimePassengers = 0,
		totalPilots,
		alltimePilots = 0,
		totalPassports,
		views,
		visitors,
		setCurrentTab,
		setShowPassportDrawer,
		setIsEditingPassport,
		passport,
		isMuted = false
	} = $props<{
		isOpen: boolean;
		onClose: () => void;
		totalStandby: number;
		totalPassengers: number;
		alltimePassengers?: number;
		totalPilots: number;
		alltimePilots?: number;
		totalPassports: number;
		views: number;
		visitors: number;
		setCurrentTab: (tab: 'book' | 'hub') => void;
		setShowPassportDrawer: (show: boolean) => void;
		setIsEditingPassport: (show: boolean) => void;
		passport: any;
		isMuted?: boolean;
	}>();
</script>

{#if isOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
	>
		<div
			class="absolute inset-0"
			onclick={() => {
				playSound('beep', isMuted);
				onClose();
			}}
		></div>

		<div
			class="relative w-full max-w-4xl bg-white border-4 border-[#E6DFC7] rounded-[32px] p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200"
		>
			<!-- Close Button -->
			<button
				onclick={() => {
					playSound('beep', isMuted);
					onClose();
				}}
				class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-full cursor-pointer transition-colors"
			>
				<X class="w-5 h-5" />
			</button>

			<div
				class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-dashed border-[#E6DFC7] pb-3 text-left pr-10"
			>
				<div>
					<h2
						class="font-system font-black text-sm text-[#0084CC] tracking-wide flex items-center gap-1.5 uppercase font-bold"
					>
						<Radio class="w-4 h-4 animate-pulse shrink-0" />Traffic Control Panel
					</h2>
					<p class="text-[10px] text-slate-500 font-mono">
						Real-time network telemetries for all active islanders, hosts, and travelers.
					</p>
				</div>
				<div class="flex items-center gap-1.5 self-start sm:self-center">
					<span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
					<span
						class="text-[9px] font-mono font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 font-bold"
					>
						Lounge Radar Live
					</span>
				</div>
			</div>

			<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 text-left">
				<!-- Stat 1: Page Views -->
				<div
					class="bg-rose-50/40 border-2 border-rose-100 rounded-2xl p-3.5 shadow-xs relative overflow-hidden"
				>
					<div class="absolute right-2 top-2 opacity-5 pointer-events-none">
						<Eye class="w-12 h-12 text-rose-500" />
					</div>
					<div class="flex items-center gap-2 mb-1">
						<span class="text-xl">👀</span>
						<span
							class="font-system font-black text-[11px] text-rose-800 uppercase tracking-wide font-bold"
						>
							Views
						</span>
					</div>
					<div class="flex items-baseline gap-1.5">
						<span class="font-mono font-black text-2xl text-rose-900 leading-none font-bold">
							{views}
						</span>
						<span class="text-[9px] font-mono text-rose-600 font-bold uppercase"> Loads </span>
					</div>
					<p class="text-[9.5px] text-slate-500 leading-snug mt-1 font-sans font-semibold">
						Total airport terminal page loads recorded.
					</p>
				</div>

				<!-- Stat 2: Unique Visitors -->
				<div
					class="bg-violet-50/40 border-2 border-violet-100 rounded-2xl p-3.5 shadow-xs relative overflow-hidden"
				>
					<div class="absolute right-2 top-2 opacity-5 pointer-events-none">
						<Users class="w-12 h-12 text-violet-500" />
					</div>
					<div class="flex items-center gap-2 mb-1">
						<span class="text-xl">👥</span>
						<span
							class="font-system font-black text-[11px] text-violet-800 uppercase tracking-wide font-bold"
						>
							Visitors
						</span>
					</div>
					<div class="flex items-baseline gap-1.5">
						<span class="font-mono font-black text-2xl text-violet-900 leading-none font-bold">
							{visitors}
						</span>
						<span class="text-[9px] font-mono text-violet-600 font-bold uppercase"> Flyers </span>
					</div>
					<p class="text-[9.5px] text-slate-500 leading-snug mt-1 font-sans font-semibold">
						Unique traveler devices connected to terminal.
					</p>
				</div>

				<!-- Stat 3: Villagers (Registered Passports) -->
				<div
					onclick={() => {
						playSound('beep', isMuted);
						onClose();
						if (passport.hasCreated) {
							setShowPassportDrawer(true);
						} else {
							setIsEditingPassport(true);
						}
					}}
					class="bg-[#FFFCEF]/50 hover:bg-[#FFFCEF] border-2 border-[#E6DFC7] hover:border-amber-400 rounded-2xl p-3.5 transition-all cursor-pointer group shadow-xs relative overflow-hidden"
					title="Click to view or edit your flyer passport"
				>
					<div
						class="absolute right-2 top-2 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none"
					>
						<BookOpen class="w-12 h-12 text-amber-600" />
					</div>
					<div class="flex items-center gap-2 mb-1">
						<span class="text-xl">📖</span>
						<span
							class="font-system font-black text-[11px] text-amber-900 uppercase tracking-wide font-bold"
						>
							Villagers
						</span>
					</div>
					<div class="flex items-baseline gap-1.5">
						<span class="font-mono font-black text-2xl text-amber-950 leading-none font-bold">
							{totalPassports}
						</span>
						<span class="text-[9px] font-mono text-amber-700 font-bold uppercase"> Printed </span>
					</div>
					<p class="text-[9.5px] text-slate-500 leading-snug mt-1 font-sans font-semibold">
						Islanders printed in our Dodo passport registry.
					</p>
				</div>

				<!-- Stat 4: Islands (Pilots / Hosts) -->
				<div
					onclick={() => {
						playSound('beep', isMuted);
						setCurrentTab('hub');
						onClose();
					}}
					class="bg-emerald-50/40 hover:bg-emerald-50 border-2 border-emerald-100 hover:border-emerald-300 rounded-2xl p-3.5 transition-all cursor-pointer group shadow-xs relative overflow-hidden"
					title="Click to manage or host flight plans"
				>
					<div
						class="absolute right-2 top-2 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none"
					>
						{#if dalStore.systemMode === 'DAL'}
							<Plane class="w-12 h-12 text-emerald-500" />
						{:else}
							<Cloud class="w-12 h-12 text-emerald-500" />
						{/if}
					</div>
					<div class="flex items-center gap-2 mb-1">
						<span class="text-xl">{dalStore.systemMode === 'DAL' ? '👨‍✈️' : '🔮'}</span>
						<span
							class="font-system font-black text-[11px] text-emerald-800 uppercase tracking-wide font-bold"
						>
							{dalStore.systemMode === 'DAL' ? 'Islands' : 'Dreams'}
						</span>
					</div>
					<div class="flex items-baseline gap-1">
						<span
							class="font-mono font-black text-lg sm:text-xl text-emerald-950 leading-none font-bold"
						>
							{totalPilots}<span class="text-slate-400 font-medium text-xs">/{alltimePilots}</span>
						</span>
						<span class="text-[9px] font-mono text-emerald-600 font-bold uppercase"> Hosts </span>
					</div>
					<p class="text-[9.5px] text-slate-500 leading-snug mt-1 font-sans font-semibold">
						{dalStore.systemMode === 'DAL'
							? 'Active flight plans open now vs all-time.'
							: 'Active dreams open now vs all-time.'}
					</p>
				</div>

				<!-- Stat 5: Checked-In Passengers -->
				<div
					onclick={() => {
						playSound('beep', isMuted);
						setCurrentTab('book');
						onClose();
						setTimeout(() => {
							const element = document.getElementById('active-departures-section');
							if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
						}, 150);
					}}
					class="bg-amber-50/40 hover:bg-amber-50 border-2 border-amber-100 hover:border-amber-300 rounded-2xl p-3.5 transition-all cursor-pointer group shadow-xs relative overflow-hidden"
					title="Click to view active flight departures"
				>
					<div
						class="absolute right-2 top-2 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none"
					>
						{#if dalStore.systemMode === 'DAL'}
							<Ticket class="w-12 h-12 text-amber-500" />
						{:else}
							<Cloud class="w-12 h-12 text-amber-500" />
						{/if}
					</div>
					<div class="flex items-center gap-2 mb-1">
						<span class="text-xl">🎟️</span>
						<span
							class="font-system font-black text-[11px] text-amber-800 uppercase tracking-wide font-bold"
						>
							{dalStore.systemMode === 'DAL' ? 'Passengers' : 'Dreamers'}
						</span>
					</div>
					<div class="flex items-baseline gap-1">
						<span
							class="font-mono font-black text-lg sm:text-xl text-amber-950 leading-none font-bold"
						>
							{totalPassengers}<span class="text-slate-400 font-medium text-xs"
								>/{alltimePassengers}</span
							>
						</span>
						<span class="text-[9px] font-mono text-amber-600 font-bold uppercase">
							{dalStore.systemMode === 'DAL' ? 'Boarded' : 'Dreaming'}
						</span>
					</div>
					<p class="text-[9.5px] text-slate-500 leading-snug mt-1 font-sans font-semibold">
						{dalStore.systemMode === 'DAL'
							? 'Travelers currently checked in vs all-time.'
							: 'Travelers currently dreaming vs all-time.'}
					</p>
				</div>

				<!-- Stat 6: Standby Queue -->
				<div
					onclick={() => {
						playSound('beep', isMuted);
						setCurrentTab('book');
						onClose();
						setTimeout(() => {
							const element = document.getElementById('standby-lounge-section');
							if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
						}, 150);
					}}
					class="bg-sky-50/50 hover:bg-sky-50 border-2 border-sky-100 hover:border-sky-300 rounded-2xl p-3.5 transition-all cursor-pointer group shadow-xs relative overflow-hidden"
					title="Click to view standby lounge passengers"
				>
					<div
						class="absolute right-2 top-2 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none"
					>
						<Compass class="w-12 h-12 text-sky-500" />
					</div>
					<div class="flex items-center gap-2 mb-1">
						<span class="text-xl">🛋️</span>
						<span
							class="font-system font-black text-[11px] text-sky-800 uppercase tracking-wide font-bold"
						>
							Standby
						</span>
					</div>
					<div class="flex items-baseline gap-1.5">
						<span class="font-mono font-black text-2xl text-sky-900 leading-none font-bold">
							{totalStandby}
						</span>
						<span class="text-[9px] font-mono text-sky-600 font-bold uppercase"> Queue </span>
					</div>
					<p class="text-[9.5px] text-slate-500 leading-snug mt-1 font-sans font-semibold">
						Active travelers waiting on the standby list.
					</p>
				</div>
			</div>
		</div>
	</div>
{/if}
