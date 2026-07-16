<script lang="ts">
	import { ChevronRight, Plane, Users, MapPin, Clock, Ticket } from '@lucide/svelte';
	import type { Flight, Passport, UserProfile, Passenger } from '$lib/studio-types';
	import { playSound } from '$lib/utils/audio';
	import { GATE_THEMES, DREAM_THEMES, PLANE_COLORS } from '$lib/utils/constants';
	import { slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	let {
		flights,
		selectedFlightId = $bindable(null),
		expandedFlightId = $bindable(null),
		passport,
		profiles,
		openProfileModal,
		systemMode,
		isMuted = false
	}: {
		flights: Flight[];
		selectedFlightId: string | null;
		expandedFlightId: string | null;
		passport: Passport;
		profiles: Record<string, UserProfile>;
		openProfileModal: (id: string | number) => void;
		systemMode: 'DAL' | 'LUNA';
		isMuted?: boolean;
	} = $props();

	function getHostProfile(hostName: string, islandName: string) {
		return (Object.values(profiles) as UserProfile[]).find(
			(p) =>
				p.villagerName.toLowerCase() === hostName.toLowerCase() &&
				p.islandName.toLowerCase() === islandName.toLowerCase()
		);
	}
</script>

{#if flights.length === 0}
	<div
		class="bg-white border-2 border-[#0084CC]/10 rounded-[32px] py-14 text-center font-system text-slate-400"
	>
		{#if systemMode === 'DAL'}
			<Plane class="w-10 h-10 mx-auto mb-2 text-slate-300 animate-bounce" />
		{:else}
			<div class="text-4xl mx-auto mb-2 text-slate-300 animate-pulse">🛌</div>
		{/if}
		<p class="text-xs font-bold uppercase">NO ACTIVE DESTINATIONS REGISTERED</p>
		<p class="text-sm mt-0.5">
			{systemMode === 'DAL'
				? "Switch to 'My Flight Hub' to park your seaplane at the gate!"
				: "Switch to 'My Dream Hub' to share your dream!"}
		</p>
	</div>
{:else}
	<div class="bg-white rounded-[32px] border-2 border-[#0084CC]/10 shadow-sm overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-left border-collapse font-system whitespace-nowrap">
				<thead class="sticky top-0 z-10 bg-white">
					<tr class="bg-slate-50/50 border-b-2 border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
						<th class="px-5 py-3 text-center">{systemMode === 'DAL' ? 'Gate' : 'Theme'}</th>
						<th class="px-5 py-3">{systemMode === 'DAL' ? 'Flight' : 'Dream'}</th>
						<th class="px-5 py-3 text-center">{systemMode === 'DAL' ? 'Passengers' : 'Dreamers'}</th>
						<th class="px-5 py-3 text-center">Host</th>
						<th class="px-5 py-3">{systemMode === 'DAL' ? 'Destination' : 'Dreamscape'}</th>
						<th class="px-5 py-3 text-center">Time</th>
						<th class="px-5 py-3 pr-6 text-right"></th>
						<th class="px-5 py-3 text-center">Status</th>
					</tr>
				</thead>
				{#each flights as flight, i (flight.id ? flight.id + '-' + i : i)}
					{@const isSelected = selectedFlightId === flight.id}
					{@const isExpanded = expandedFlightId === flight.id}
					{@const hasBoarded = flight.passengers.some((p: Passenger) =>
						p.userId
							? String(p.userId) === String(passport.userId)
							: p.friendCode
								? p.friendCode === passport.friendCode
								: p.name.toLowerCase() === passport.villagerName.toLowerCase()
					)}
					{@const activeTheme = systemMode === 'DAL'
						? GATE_THEMES[flight.gate] || GATE_THEMES[1]
						: DREAM_THEMES[flight.gate] || DREAM_THEMES[1]}
					{@const planeColorVal = PLANE_COLORS.find((pc) => pc.id === (flight.planeColor || 'orange')) || PLANE_COLORS[0]}
					{@const hostProfile = getHostProfile(flight.hostName, flight.islandName)}
					<tbody class="divide-y divide-slate-100" animate:flip={{ duration: 300 }}>
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<tr
							class="group transition-all cursor-pointer hover:bg-[#FFFCEF]/60 {isExpanded ? 'bg-sky-50/50 hover:bg-sky-50/50 shadow-[inset_4px_0_0_0_#0084CC]' : ''}"
							style="--hover-color: {planeColorVal.hex}"
							onclick={() => {
								playSound('beep', isMuted);
								expandedFlightId = isExpanded ? null : flight.id;
							}}
						>
							<!-- GATE -->
							<td class="px-5 py-3 text-center">
								<div class="flex items-center justify-center gap-2">
									<div
										class="inline-flex flex-col items-center justify-center w-10 h-10 {systemMode === 'DAL' ? 'bg-[#0084CC]' : 'bg-[#4B0082]'} rounded-xl text-white font-system leading-none shadow-sm"
									>
										<span class="text-[9px] uppercase font-bold {systemMode === 'DAL' ? 'text-sky-200' : 'text-[#DDA0DD]'} mb-0.5">{systemMode === 'DAL' ? 'Gate' : 'Theme'}</span>
										<span class="text-[#FFCC00] font-black text-base">{flight.gate}</span>
									</div>
									<span class="text-xl drop-shadow-sm" title={activeTheme.name}>{activeTheme.icon}</span>
								</div>
							</td>
							<!-- FLIGHT -->
							<td class="px-5 py-3">
								<div class="flex items-center gap-2.5">
									{#if systemMode === 'DAL'}
										<Plane
											class="w-4 h-4 transition-colors"
											style="color: {isSelected ? planeColorVal.hex : 'var(--plane-color, #cbd5e1)'}"
										/>
									{:else}
										<span class="text-sm {isSelected ? '' : 'grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100'} transition-all">🛌</span>
									{/if}
									<div>
										<div class="font-black text-[#0084CC] text-sm flex items-center gap-1.5">
											{flight.flightNumber
												? (systemMode === 'DAL' ? 'DAL-' : 'LUL-') + flight.flightNumber.replace(/^(DAL-|LUL-|LUNA-)/i, '')
												: flight.id}
											<span class="text-[9px] font-bold bg-[#A2D2FF]/25 text-[#006094] px-1.5 py-0.5 rounded-full leading-none">
												{flight.hemisphere === 'Northern' ? 'N' : 'S'}
											</span>
										</div>
										{#if systemMode !== 'DAL'}
											<div class="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Luna Dream</div>
										{/if}
									</div>
								</div>
							</td>

							<!-- PAS -->
							<td class="px-5 py-3 text-center">
								<div class="flex items-center justify-center gap-1 font-system">
									<span class="text-xs font-bold text-[#4A4A4A]">👤 {flight.passengers.length}</span>
									<span class="text-[10px] text-slate-400">/ {flight.capacity || (flight.planeType === 'Switch 2' ? 12 : 8)}</span>
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
								<div class="text-[10px] text-slate-500 max-w-[150px] mt-0.5 truncate" title={flight.description}>
									"{flight.description}"
								</div>
							</td>

							<!-- TIME -->
							<td class="px-5 py-3 text-center">
								<div class="font-black text-[#0084CC] text-sm">
									{#if flight.scheduledTime}
										{flight.scheduledTime}
									{:else}
										{new Date(flight.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
									{/if}
								</div>
								<div class="text-[9px] text-slate-400 mt-0.5 font-bold tracking-wider uppercase">
									{#if flight.scheduledTime}
										Scheduled
									{:else}
										{systemMode === 'DAL' ? 'Listed' : 'Logged'}
									{/if}
								</div>
							</td>

							<!-- ACTION -->
							<td class="px-5 py-3 pr-6 text-right">
								<span class="text-[#0084CC] font-system text-xs font-black inline-flex items-center gap-0.5 group-hover:underline {isExpanded ? 'underline' : ''}">
									Details <ChevronRight class="w-3 h-3 {isExpanded ? 'rotate-90' : ''} transition-transform" />
								</span>
							</td>

							<!-- STATUS -->
							<td class="px-5 py-3 text-center">
								{#if flight.passengers.length >= (flight.capacity || (flight.planeType === 'Switch 2' ? 12 : 8))}
									<span class="text-[10px] font-system font-black bg-amber-100 text-amber-800 border border-amber-200 px-2 py-1 rounded-full uppercase animate-pulse" title="Plane at maximum capacity. Host can board standby passengers.">
										FULL
									</span>
								{:else if hasBoarded}
									<span class="text-[10px] font-system font-black bg-green-100 text-green-700 border border-green-200 px-2 py-1 rounded-full uppercase">
										BOARDED
									</span>
								{:else}
									<span class="text-[10px] font-system font-black px-2 py-1 rounded-full {flight.status === 'Boarding' ? 'bg-[#FFCC00]/20 text-[#006094] border border-[#FFCC00] animate-pulse' : flight.status === 'Closed' || flight.status === 'Departed' ? 'bg-slate-100 text-slate-400 border border-slate-200' : 'bg-green-50 text-green-700 border border-green-200'}">
										{flight.status.toUpperCase()}
									</span>
								{/if}
							</td>
						</tr>
						{#if isExpanded}
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<tr class="flight-preview-row" onclick={(e) => e.stopPropagation()}>
								<td colspan="8" class="p-0">
									<div class="flight-preview-panel" transition:slide={{ duration: 250 }}>
										<div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
											<!-- Gate Theme Card -->
											<div class="flight-info-card">
												<span class="flight-info-label">{systemMode === 'DAL' ? 'Gate Theme' : 'Dreamscape'}</span>
												<span class="text-2xl mt-1">{activeTheme.icon}</span>
												<span class="flight-info-value text-xs">{activeTheme.name}</span>
												<span class="text-[9px] text-slate-400 font-bold mt-0.5 text-center leading-snug">{activeTheme.desc}</span>
											</div>

											<!-- Passengers Card -->
											<div class="flight-info-card">
												<span class="flight-info-label">
													<Users class="w-3 h-3 inline-block mr-0.5" />
													{systemMode === 'DAL' ? 'Passengers' : 'Dreamers'}
												</span>
												<span class="text-2xl font-black mt-1" style="color: {activeTheme.color}">
													{flight.passengers.length}
													<span class="text-sm text-slate-400 font-bold">/ {flight.capacity || (flight.planeType === 'Switch 2' ? 12 : 8)}</span>
												</span>
												<span class="text-[9px] text-slate-400 font-bold mt-0.5">
													{flight.planeType || 'Switch'} ✈️
												</span>
											</div>

											<!-- Destination Card -->
											<div class="flight-info-card">
												<span class="flight-info-label">
													<MapPin class="w-3 h-3 inline-block mr-0.5" />
													Destination
												</span>
												<span class="flight-info-value">{flight.islandName}</span>
												<span class="inline-flex items-center gap-1 text-[9px] font-black mt-1 px-1.5 py-0.5 rounded-full bg-[#A2D2FF]/25 text-[#006094]">
													🌐 {flight.hemisphere === 'Northern' ? 'Northern' : 'Southern'}
												</span>
											</div>

											<!-- Time Card -->
											<div class="flight-info-card">
												<span class="flight-info-label">
													<Clock class="w-3 h-3 inline-block mr-0.5" />
													Schedule
												</span>
												<span class="flight-info-value text-[#0084CC]">
													{#if flight.scheduledTime}
														{flight.scheduledTime}
													{:else}
														{new Date(flight.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
													{/if}
												</span>
												<span class="text-[9px] text-slate-400 font-bold mt-0.5">
													{flight.scheduledTime ? 'Scheduled' : systemMode === 'DAL' ? 'Listed' : 'Logged'}
												</span>
											</div>
										</div>

										<!-- Full Description -->
										<div class="flight-description-box mt-4">
											<h4 class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
												{systemMode === 'DAL' ? '✈️ Flight Description' : '💤 Dream Description'}
											</h4>
											<p class="text-sm text-slate-600 whitespace-normal leading-relaxed font-medium">
												"{flight.description || 'No description provided.'}"
											</p>
										</div>

										<!-- CTA Button -->
										<div class="flex justify-center mt-5">
											<button
												class="boarding-pass-cta group"
												onclick={(e) => {
													e.stopPropagation();
													playSound('success', isMuted);
													selectedFlightId = flight.id;
												}}
											>
												<Ticket class="w-5 h-5 group-hover:rotate-12 transition-transform" />
												{systemMode === 'DAL' ? 'Get Boarding Pass' : 'Obtain Doze Code'}
												<ChevronRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
											</button>
										</div>
									</div>
								</td>
							</tr>
						{/if}
					</tbody>
				{/each}
			</table>
		</div>
	</div>
{/if}

<style>
	tr:hover {
		--plane-color: var(--hover-color) !important;
	}
	.flight-preview-row { background: linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%); border-bottom: 2px solid #e0f2fe; }
	.flight-preview-panel { padding: 1.25rem 1.5rem 1.5rem; }
	.flight-info-card { display: flex; flex-direction: column; align-items: center; padding: 0.75rem 0.5rem; background: white; border: 1.5px solid #e2e8f0; border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04); transition: all 0.2s ease; }
	.flight-info-card:hover { border-color: #0084cc40; box-shadow: 0 2px 8px rgba(0,132,204,0.08); transform: translateY(-1px); }
	.flight-info-label { font-size: 0.6rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; display: flex; align-items: center; }
	.flight-info-value { font-size: 0.875rem; font-weight: 900; color: #334155; margin-top: 0.25rem; text-align: center; }
	.flight-description-box { background: #f8fafc; border: 1.5px solid #e2e8f0; border-left: 4px solid #0084cc; border-radius: 0.75rem; padding: 1rem 1.25rem; }
	.boarding-pass-cta { display: flex; align-items: center; gap: 0.5rem; padding: 0.875rem 2rem; background: linear-gradient(135deg, #0084cc 0%, #006094 100%); color: white; font-size: 0.8rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; border: none; border-radius: 1rem; box-shadow: 0 4px 14px rgba(0,132,204,0.3), 0 1px 3px rgba(0,0,0,0.1); cursor: pointer; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden; }
	.boarding-pass-cta::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.15) 100%); opacity: 0; transition: opacity 0.25s ease; }
	.boarding-pass-cta:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 8px 24px rgba(0,132,204,0.4), 0 2px 6px rgba(0,0,0,0.12); }
	.boarding-pass-cta:hover::before { opacity: 1; }
	.boarding-pass-cta:active { transform: translateY(0) scale(0.98); box-shadow: 0 2px 8px rgba(0,132,204,0.3), 0 1px 2px rgba(0,0,0,0.1); }
</style>
