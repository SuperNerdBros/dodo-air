<script lang="ts">
	import { fade } from 'svelte/transition';
	import { DIALOGS } from '$lib/constants/dialogs';
	import AcnhBubble from '$lib/components/molecules/AcnhBubble.svelte';
	import { dalStore } from '$lib/stores/dal.svelte.ts';
	import { playSound } from '$lib/utils/audio';

	let { onClose }: { onClose: () => void } = $props();
</script>

<div
	transition:fade={{ duration: 200 }}
	class="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 md:p-12 gap-6 bg-slate-900/50 backdrop-blur-md"
>
	<div class="w-full max-w-4xl flex-1 my-10">
		<AcnhBubble
			title={dalStore.systemMode === 'DAL' ? 'Orville' : 'Luna [Dream Guide]'}
			onDismiss={() => {
				playSound('beep', dalStore.isMuted);
				onClose();
			}}
			dialogText={dalStore.systemMode === 'DAL'
				? DIALOGS.logoutModal.prompt
				: DIALOGS.logoutModal.lunaPrompt}
		/>
	</div>

	<div
		class="bg-[#fdf8e3] rounded-[40px] px-6 py-6 shadow-xl flex flex-col gap-1 min-w-[300px] md:mb-24"
	>
		<button
			onclick={() => {
				playSound('success', dalStore.isMuted);
				onClose();
				dalStore.logout();
			}}
			class="group relative flex items-center text-[#807256] font-bold font-system text-2xl py-3 px-6 rounded-[20px] text-left transition-all"
		>
			<span
				class="absolute left-0 -ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-4xl drop-shadow-sm pointer-events-none"
				>👉</span
			>
			<span
				class="group-hover:bg-[#FFD11A] group-hover:text-[#6b5d3a] px-5 py-2 rounded-full transition-colors w-full"
				>Yes, log out.</span
			>
		</button>

		<button
			onclick={() => {
				playSound('beep', dalStore.isMuted);
				onClose();
			}}
			class="group relative flex items-center text-[#807256] font-bold font-system text-2xl py-3 px-6 rounded-[20px] text-left transition-all"
		>
			<span
				class="absolute left-0 -ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-4xl drop-shadow-sm pointer-events-none"
				>👉</span
			>
			<span
				class="group-hover:bg-[#FFD11A] group-hover:text-[#6b5d3a] px-5 py-2 rounded-full transition-colors w-full"
				>No, stay!</span
			>
		</button>
	</div>
</div>
