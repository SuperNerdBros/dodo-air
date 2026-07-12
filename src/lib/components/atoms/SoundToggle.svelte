<script lang="ts">
  import { Volume2, VolumeX } from '@lucide/svelte';
  import { playSound } from '$lib/utils/audio';

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
  class="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-[#FFCC00] cursor-pointer"
  title={isMuted ? 'Unmute' : 'Mute'}
>
  {#if isMuted}
    <VolumeX class="w-4 h-4" />
  {:else}
    <Volume2 class="w-4 h-4" />
  {/if}
</button>
