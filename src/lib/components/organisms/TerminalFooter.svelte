<script lang="ts">
	import { dalStore } from '$lib/stores/dal.svelte';
	import FuelDepotModal from '$lib/components/organisms/FuelDepotModal.svelte';
	import InteractiveAbout from '$lib/components/organisms/InteractiveAbout.svelte';
	import { playSound } from '$lib/utils/audio';

	let showAboutModal = $state(false);
	let isRefueling = $state(false);
	let fuelRatio = $derived(dalStore.aiFuel.aiTokens / dalStore.aiFuel.maxTokens);

	$effect(() => {
		const handleHashChange = () => {
			if (window.location.hash === '#/about') {
				showAboutModal = true;
			}
		};
		handleHashChange();
		window.addEventListener('hashchange', handleHashChange);
		return () => window.removeEventListener('hashchange', handleHashChange);
	});

	async function handleRefuel(amount: number) {
		playSound('success', dalStore.isMuted);
		isRefueling = true;
		try {
			const res = await fetch('/wp-json/dodo-air/v1/ai/refuel', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ amount })
			});
			if (res.ok) {
				const data = await res.json();
				dalStore.aiFuel = { aiTokens: data.aiTokens, maxTokens: data.maxTokens };
			} else {
				// Fallback for when backend endpoint is not available
				dalStore.aiFuel = {
					aiTokens: Math.min(dalStore.aiFuel.maxTokens, dalStore.aiFuel.aiTokens + amount),
					maxTokens: dalStore.aiFuel.maxTokens
				};
			}
		} catch (err) {
			console.error('Failed to refuel:', err);
		} finally {
			isRefueling = false;
		}
	}
</script>

<footer
	class="w-full mt-6 {dalStore.systemMode === 'DAL'
		? 'bg-[#0084CC]/90 border-[#FFCC00]/40 shadow-[0_-4px_24px_rgba(0,132,204,0.12)]'
		: 'bg-[#4B0082]/90 border-[#DDA0DD]/40 shadow-[0_-4px_24px_rgba(75,0,130,0.12)]'} backdrop-blur-xl text-white rounded-[20px] p-3 sm:p-4 border border-t-2 flex flex-col sm:flex-row items-center justify-between gap-3 font-system text-xs relative overflow-hidden transition-all duration-500"
>
	<!-- Inner glow -->
	<div
		class="absolute inset-0 rounded-[20px] opacity-10 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] {dalStore.systemMode ===
		'DAL'
			? 'from-[#FFCC00] via-sky-500'
			: 'from-[#DDA0DD] via-purple-600'} to-transparent pointer-events-none transition-colors duration-500"
	></div>

	<!-- Left: Info Links -->
	<div class="flex flex-wrap items-center gap-x-3 gap-y-1 z-10 justify-center sm:justify-start">
		<span
			class="{dalStore.systemMode === 'DAL'
				? 'bg-[#FFCC00] text-[#006094]'
				: 'bg-[#DDA0DD] text-[#4B0082]'} text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full shadow-sm transition-colors duration-500"
		>
			{dalStore.systemMode === 'DAL' ? 'DAL' : 'LUNA'} GATEWAY
		</span>
		<span
			>Online Terminal &copy; 2026
			<a
				href="https://www.forthexp.com"
				target="_blank"
				rel="noopener noreferrer"
				class="font-bold {dalStore.systemMode === 'DAL'
					? 'text-[#FFCC00] hover:text-white'
					: 'text-[#DDA0DD] hover:text-white'} transition-colors">For the XP</a
			>
		</span>
		<span
			class="{dalStore.systemMode === 'DAL'
				? 'text-sky-300/30'
				: 'text-purple-300/30'} hidden sm:inline">|</span
		>
		<a
			href="https://xophz.com"
			target="_blank"
			rel="noopener noreferrer"
			class="font-bold {dalStore.systemMode === 'DAL'
				? 'text-[#FFCC00] hover:text-white'
				: 'text-[#DDA0DD] hover:text-white'} transition-colors">Created by xophz.com</a
		>
		<span
			class="{dalStore.systemMode === 'DAL'
				? 'text-sky-300/30'
				: 'text-purple-300/30'} hidden sm:inline">|</span
		>
		<a
			href="#/about"
			class="font-semibold text-white/60 hover:text-white transition-colors cursor-pointer">About</a
		>
		<a href="#/terms" class="font-semibold text-white/60 hover:text-white transition-colors"
			>Terms</a
		>
		<a href="#/privacy" class="font-semibold text-white/60 hover:text-white transition-colors"
			>Privacy</a
		>
		<span
			class="{dalStore.systemMode === 'DAL'
				? 'text-sky-300/30'
				: 'text-purple-300/30'} hidden sm:inline">|</span
		>
		<span class="text-white/40 font-mono text-[10px]">v{dalStore.appVersion}</span>
	</div>

	<!-- Right: AI Fuel Gauge -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		onclick={() => {
			playSound('beep', dalStore.isMuted);
			dalStore.showFuelModal = true;
		}}
		class="flex items-center gap-2.5 z-10 {dalStore.systemMode === 'DAL'
			? 'bg-[#006094]/60 border-[#FFCC00]/30 hover:border-[#FFCC00]/60'
			: 'bg-[#290048]/60 border-[#DDA0DD]/30 hover:border-[#DDA0DD]/60'} border rounded-full px-3.5 py-1.5 cursor-pointer select-none group transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
	>
		<span class="text-sm animate-pulse drop-shadow-[0_0_4px_rgba(255,200,0,0.5)]">⛽</span>
		<span
			class="font-black {dalStore.systemMode === 'DAL'
				? 'text-[#FFCC00]'
				: 'text-[#DDA0DD]'} text-[10px] uppercase tracking-widest">Fuel</span
		>
		<div
			class="w-14 h-2 {dalStore.systemMode === 'DAL'
				? 'bg-sky-900/50'
				: 'bg-purple-900/50'} rounded-full overflow-hidden border border-white/10 relative"
		>
			<div
				class="h-full rounded-full transition-all duration-700 ease-out {fuelRatio < 0.2
					? 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]'
					: fuelRatio < 0.5
						? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]'
						: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]'}"
				style="width: {Math.min(100, fuelRatio * 100)}%"
			></div>
		</div>
		<span class="font-black text-white text-[11px] font-mono tabular-nums">
			{dalStore.aiFuel.aiTokens.toLocaleString()}
		</span>
		<span
			class="text-[10px] font-black {dalStore.systemMode === 'DAL'
				? 'text-[#FFCC00]'
				: 'text-[#DDA0DD]'} group-hover:text-white transition-colors tracking-wider"
		>
			GAL
		</span>
	</div>
</footer>

{#if dalStore.showFuelModal}
	<FuelDepotModal
		isOpen={true}
		aiFuel={dalStore.aiFuel}
		onRefuel={handleRefuel}
		onClose={() => (dalStore.showFuelModal = false)}
		{isRefueling}
	/>
{/if}

{#if showAboutModal}
	<InteractiveAbout
		onClose={() => {
			showAboutModal = false;
			if (window.location.hash === '#/about') {
				window.history.pushState(
					'',
					document.title,
					window.location.pathname + window.location.search
				);
			}
		}}
	/>
{/if}
