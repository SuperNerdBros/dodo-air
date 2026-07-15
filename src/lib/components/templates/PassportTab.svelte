<script lang="ts">
	import { onMount } from 'svelte';
	import { PASSPORT_COLORS } from '$lib/utils/constants';
	import type { Passport } from '$lib/studio-types';
	import { DIALOGS } from '$lib/constants/dialogs';
	import AcnhBubble from '$lib/components/molecules/AcnhBubble.svelte';
	import { dalStore } from '$lib/stores/dal.svelte';

	let {
		passport,
		setShowMilesModal,
		setIsEditingPassport,
		isMuted = false,
		isActive = false,
		playSound
	} = $props<{
		passport: Passport;
		setShowMilesModal: (v: boolean) => void;
		setIsEditingPassport: (v: boolean) => void;
		isMuted?: boolean;
		isActive?: boolean;
		playSound: (id: string, isMuted?: boolean) => void;
	}>();
	let activeColor = $derived(PASSPORT_COLORS[passport.colorIndex || 0] || PASSPORT_COLORS[0]);
	let isGuest = $derived(!passport.hasCreated || !passport.villagerName);

	onMount(() => {
		const renderTime = performance.now();
		console.log(`[Diagnostic] PassportTab mounted and rendered at ${renderTime.toFixed(2)}ms`);
	});
</script>

<div class="space-y-5 text-left w-100 mx-auto pt-5">
	{#if isActive}
		<AcnhBubble
			title={dalStore.systemMode === 'DAL' ? 'Orville' : 'Luna'}
			dialogText={dalStore.systemMode === 'DAL'
				? DIALOGS.passportTab.active
				: DIALOGS.passportTab.lunaActive}
		/>
	{/if}
	<!-- Tab Header Board -->
	<div
		class="bg-white rounded-3xl border-2 border-[#0084CC]/10 p-4 lg:p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4"
	>
		<div class="flex items-center gap-3">
			<div
				class="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center text-xl shadow-inner text-[#0084CC]"
			>
				📖
			</div>
			<div>
				<h2
					class="text-base font-system font-black tracking-wider text-[#0084CC] uppercase leading-none"
				>
					Frequent Flyer Passport
				</h2>
				<span
					class="text-xs font-system text-slate-400 font-bold uppercase tracking-widest mt-1 block"
				>
					Your official Dodo Airlines credentials and stamp book
				</span>
			</div>
		</div>
	</div>

	<!-- Passport Card -->
	<div class="grid grid-cols-1 gap-6 mt-4 max-w-3xl mx-auto">
		<!-- Passport Switcher -->
		{#if dalStore.myPassports && dalStore.myPassports.length > 0}
			<div class="flex flex-wrap gap-2 items-center mb-2">
				{#each dalStore.myPassports as p, i}
					<button
						class="px-3 py-1.5 rounded-xl font-system text-xs uppercase font-bold border-2 transition-all {dalStore.activePassportIndex ===
						i
							? 'bg-[#0084CC] text-white border-[#006bb3]'
							: 'bg-white text-[#4A4A4A] border-slate-200 hover:bg-slate-50'}"
						onclick={() => {
							playSound('beep', isMuted);
							dalStore.activePassportIndex = i;
						}}
					>
						{p.villagerName || 'New Passport'}
					</button>
				{/each}
				{#if dalStore.isLoggedIn}
					<button
						class="px-3 py-1.5 rounded-xl font-system text-xs uppercase font-bold border-2 border-dashed border-[#0084CC] text-[#0084CC] hover:bg-sky-50 transition-all"
						onclick={() => {
							playSound('beep', isMuted);
							const newPassport = dalStore._defaultPassport();
							dalStore.myPassports = [...dalStore.myPassports, newPassport];
							dalStore.activePassportIndex = dalStore.myPassports.length - 1;
						}}
					>
						+ New Passport
					</button>
				{/if}
			</div>
		{/if}
		<div
			class="bg-[#FAF8F2] rounded-[40px] border-8 border-[#E6DFC7] shadow-xl p-6 text-[#4A4A4A] flex flex-col h-full justify-between"
		>
			<div class="flex flex-col sm:flex-row gap-6 h-full">
				<!-- Left Profile Area -->
				<div class="flex flex-col items-center gap-3 w-full sm:w-1/3">
					<div
						class="w-28 h-28 rounded-[2rem] flex items-center justify-center text-6xl shadow-inner border-4 {activeColor.border} {activeColor.bg} shrink-0"
					>
						{isGuest ? '👤' : passport.avatarIcon}
					</div>
					<div class="text-center w-full">
						<p class="font-system font-black text-xl leading-tight text-[#4A4A4A] truncate">
							{isGuest ? 'Guest Flyer' : passport.villagerName}
						</p>
						<p class="text-xs font-system text-[#85806B] uppercase mt-1">PASSPORT TITLE</p>
						<span
							class="inline-block mt-0.5 bg-[#F5F2E6] border border-[#E6DFC7] rounded px-2 py-0.5 text-xs font-system font-bold text-[#80765A] uppercase"
						>
							{isGuest ? 'Wandering Visitor' : `${passport.titlePart1} ${passport.titlePart2}`}
						</span>
					</div>
				</div>

				<!-- Right Details Area -->
				<div class="flex-1 space-y-4 flex flex-col">
					<!-- Island & Native Fruit -->
					<div class="grid grid-cols-2 gap-4">
						<div class="bg-white p-3 rounded-2xl border border-[#E6DFC7]">
							<p class="text-[10px] font-system font-bold text-[#85806B] uppercase mb-1">ISLAND</p>
							<p class="text-lg font-black text-[#0084CC] truncate leading-none">
								🏝️ {isGuest ? 'Unknown' : passport.islandName}
							</p>
						</div>
						<div class="bg-white p-3 rounded-2xl border border-[#E6DFC7]">
							<p class="text-[10px] font-system font-bold text-[#85806B] uppercase mb-1">
								NATIVE FRUIT
							</p>
							<p class="text-base font-bold text-slate-700 leading-none">
								{#if isGuest}
									❓ Unknown
								{:else}
									{passport.nativeFruit === 'Apple'
										? '🍎'
										: passport.nativeFruit === 'Cherry'
											? '🍒'
											: passport.nativeFruit === 'Orange'
												? '🍊'
												: passport.nativeFruit === 'Peach'
													? '🍑'
													: passport.nativeFruit === 'Pear'
														? '🍐'
														: '🍎'}
									{passport.nativeFruit || 'Apple'}
								{/if}
							</p>
						</div>
					</div>

					<!-- Signature/Comment Bubble -->
					{#if !isGuest && passport.signature}
						<div
							class="relative bg-white border-2 border-[#E6DFC7] p-3 rounded-2xl rounded-tl-none ml-2"
						>
							<!-- Tail for speech bubble -->
							<div
								class="absolute -left-2.5 top-0 w-0 h-0 border-y-8 border-y-transparent border-r-[10px] border-r-white z-10"
							></div>
							<div
								class="absolute -left-3 top-[-2px] w-0 h-0 border-y-[10px] border-y-transparent border-r-[12px] border-r-[#E6DFC7]"
							></div>
							<p class="text-sm font-semibold italic text-slate-600 line-clamp-2">
								"{passport.signature}"
							</p>
						</div>
					{/if}

					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-1">
							<span class="block text-[10px] font-system font-bold text-[#85806B] uppercase"
								>FRIEND CODE</span
							>
							<span
								class="font-system font-black tracking-wide text-slate-600 text-sm block bg-slate-50 p-1.5 rounded-lg text-center border border-slate-200 truncate"
								>{isGuest ? 'Not registered' : passport.friendCode || 'Not set'}</span
							>
						</div>

						<div class="space-y-1">
							<span class="block text-[10px] font-system font-bold text-[#85806B] uppercase"
								>DREAM ADDRESS</span
							>
							<span
								class="font-system font-black tracking-wide text-purple-600 text-sm block bg-purple-50 p-1.5 rounded-lg text-center border border-purple-200 truncate"
								>{isGuest ? 'Not registered' : passport.dreamAddress || 'Not set'}</span
							>
						</div>

						<div class="space-y-1 col-span-1">
							<span class="block text-[10px] font-system font-bold text-[#85806B] uppercase"
								>YOUR LIVERY FLIGHT NUMBER</span
							>
							<div class="flex items-center justify-between gap-2">
								<span
									class="min-w-[150px] font-system font-black tracking-wide text-[#0084CC] text-sm block bg-sky-50 p-1.5 rounded-lg text-center border border-sky-200 flex-1 truncate"
									>{isGuest
										? 'Not registered'
										: passport.flightNumber
											? (dalStore.systemMode === 'DAL' ? 'DAL-' : 'LUL-') + passport.flightNumber.replace(/^(DAL-|LUL-|LUNA-)/i, '')
											: 'Not set'}</span
								>
								{#if !isGuest && passport.flightNumber}
									<button
										class="bg-amber-100 hover:bg-amber-200 text-amber-700 font-system font-black text-[10px] px-2 py-1.5 rounded-lg border border-amber-300 transition-colors uppercase cursor-pointer shrink-0"
										onclick={async () => {
											playSound('beep', isMuted);
											try {
												// @ts-ignore
												const { dalStore } = await import('$lib/stores/dal.svelte');
												await dalStore.rerollFlightNumber();
											} catch (e: any) {
												alert(e.error || e.message || 'Error rerolling');
											}
										}}
										title="Costs 500 FF Miles to re-roll"
									>
										New number (-500 FF Miles)
									</button>
								{/if}
							</div>
						</div>
					</div>

					<div
						class="flex items-center justify-between bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 text-sm font-bold mt-auto"
					>
						<span class="flex items-center gap-2 text-[#FF9F43] font-system font-black uppercase">
							🎟️ FF Miles:
						</span>
						<span class="font-system text-amber-700 text-lg font-black">
							{(passport.miles ?? 2000).toLocaleString()}
						</span>
					</div>

					<!-- Actions -->
					<div class="flex gap-2 mt-4 pt-2 border-t border-[#E6DFC7]">
						{#if isGuest}
							<button
								onclick={() => {
									playSound('beep', isMuted);
									setIsEditingPassport(true);
								}}
								class="w-full btn-acnh btn-acnh-primary py-3 cursor-pointer active:scale-95"
							>
								📝 Create Your Passport
							</button>
						{:else}
							<button
								onclick={() => {
									playSound('beep', isMuted);
									setShowMilesModal(true);
								}}
								class="flex-1 bg-[#FF9F43] hover:bg-[#ff8f24] text-white py-2 rounded-xl font-system font-black text-[10px] sm:text-xs uppercase shadow border-b-4 border-[#cc7a1f] flex items-center justify-center gap-1 cursor-pointer border-none active:scale-95 transition-all"
								title="Stamp Book"
							>
								🎯 Stamps
							</button>

							<button
								onclick={() => {
									playSound('beep', isMuted);
									dalStore.passportForm = { ...passport };
									setIsEditingPassport(true);
								}}
								class="flex-1 btn-acnh btn-acnh-primary text-[10px] sm:text-xs py-2 border-b-4 cursor-pointer active:scale-95"
							>
								✏️ Edit
							</button>

							<button
								onclick={async () => {
									if (confirm('Are you sure you want to delete your passport?')) {
										playSound('beep', isMuted);
										await dalStore.deletePassport();
									}
								}}
								class="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl font-system font-black text-[10px] sm:text-xs uppercase shadow border-b-4 border-red-700 flex items-center justify-center gap-1 cursor-pointer border-none active:scale-95 transition-all"
							>
								🗑️ Delete
							</button>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
