<script lang="ts">
  import { Volume2, VolumeX } from '@lucide/svelte';
  import { playSound } from '$lib/utils/audio';
  import { dalStore } from '$lib/stores/dal.svelte.ts';

  let { isMuted = $bindable(false), onToggle } = $props<{
    isMuted: boolean;
    onToggle?: (muted: boolean) => void;
  }>();
</script>

<button
  onclick={() => {
    const wasMuted = isMuted;
    if (onToggle) {
      onToggle(!isMuted);
    } else {
      isMuted = !isMuted;
    }
    if (wasMuted) {
      playSound('success', false);
    }
  }}
  class="w-10 h-10 rounded-2xl flex items-center justify-center border border-white/20 bg-white/10 hover:bg-white/25 transition-all text-white cursor-pointer active:scale-95 shadow-md"
  title={isMuted ? 'Unmute' : 'Mute'}
>
  {#if isMuted}
    <VolumeX class="w-4 h-4 text-red-400" />
  {:else}
    <Volume2 class="w-4 h-4 {dalStore.systemMode === 'DAL' ? 'text-[#FFCC00]' : 'text-[#DDA0DD]'}" />
  {/if}
</button>
