<script lang="ts">
	import { playSound } from '$lib/utils/audio';
	
	export interface FilterChip {
		value: string;
		icon: string;
		dalLabel: string;
		lunaLabel: string;
		activeClass: string;
		tooltip: string;
	}

	let {
		chips,
		activeFilter = $bindable(),
		getChipCount,
		getChipLabel,
		isMuted = false
	}: {
		chips: FilterChip[];
		activeFilter: string;
		getChipCount: (chip: FilterChip) => number;
		getChipLabel: (chip: FilterChip) => string;
		isMuted?: boolean;
	} = $props();
</script>

{#each chips as chip (chip.value)}
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
