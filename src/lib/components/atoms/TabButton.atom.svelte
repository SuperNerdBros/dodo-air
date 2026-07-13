<script lang="ts">
	import { playSound } from '$lib/utils/audio';

	let {
		active = false,
		systemMode = 'DAL',
		isMuted = false,
		onclick,
		children,
		class: className = ''
	} = $props<{
		active?: boolean;
		systemMode?: 'DAL' | 'LUNA';
		isMuted?: boolean;
		onclick?: () => void;
		children?: any;
		class?: string;
	}>();

	function handleClick() {
		playSound('beep', isMuted);
		if (onclick) onclick();
	}
</script>

<button
	onclick={handleClick}
	class="px-3 sm:px-5 pt-4 rounded-b-xl border-x-2 border-b-2 transition-all duration-300 font-system font-black tracking-wider text-[10px] sm:text-xs flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-md origin-top relative
		{active
			? (systemMode === 'DAL' ? 'bg-[#FFCC00] text-[#006094] border-[#FFCC00] pb-3 scale-y-105' : 'bg-[#DDA0DD] text-[#4B0082] border-[#DDA0DD] pb-3 scale-y-105')
			: (systemMode === 'DAL' ? 'bg-[#0070B0] text-sky-200 border-[#0070B0] hover:bg-[#0084CC] hover:text-white pb-1' : 'bg-[#3A0066] text-purple-200 border-[#3A0066] hover:bg-[#4B0082] hover:text-white pb-1')} {className}"
>
	{@render children?.()}
</button>
