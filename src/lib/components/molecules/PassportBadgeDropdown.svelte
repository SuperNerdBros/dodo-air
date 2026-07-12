<script lang="ts">
  import { ChevronRight } from '@lucide/svelte';
  import type { Passport } from '$lib/studio-types';
  import { playSound } from '$lib/utils/audio';
  import { PASSPORT_COLORS, PLANE_COLORS } from '$lib/utils/constants';
  import { scale, fade } from 'svelte/transition';
  import { backOut } from 'svelte/easing';
  import { onMount, onDestroy } from 'svelte';

  let {
    passport,
    showPassportDrawer = $bindable(false),
    isMuted = false,
    setShowMilesModal,
    setIsEditingPassport
  } = $props<{
    passport: Passport;
    showPassportDrawer: boolean;
    isMuted?: boolean;
    setShowMilesModal: (show: boolean) => void;
    setIsEditingPassport: (edit: boolean) => void;
  }>();

  let containerRef: HTMLDivElement | undefined;

  function handleOutsideClick(e: MouseEvent) {
    if (showPassportDrawer && containerRef && !containerRef.contains(e.target as Node)) {
      showPassportDrawer = false;
    }
  }

  onMount(() => {
    document.addEventListener('mousedown', handleOutsideClick);
  });

  onDestroy(() => {
    // Only in browser environment
    if (typeof document !== 'undefined') {
      document.removeEventListener('mousedown', handleOutsideClick);
    }
  });

  let activeColor = $derived(PASSPORT_COLORS[passport.colorIndex || 0] || PASSPORT_COLORS[1]);
  let activePlaneColor = $derived(PLANE_COLORS.find(pc => pc.id === (passport.planeColor || 'orange')) || PLANE_COLORS[0]);
</script>

<button
  onclick={() => {
    playSound('beep', isMuted);
    showPassportDrawer = !showPassportDrawer;
  }}
  class="flex items-center gap-2.5 bg-gradient-to-r from-[#FFFCEF] to-[#FFF9E7] hover:from-[#FFF9E7] hover:to-[#FFEAA7]/30 border-2 border-[#FFCC00] hover:border-[#FF9F43] px-3.5 py-1.5 rounded-2xl text-xs font-bold shadow-md transition-all text-[#85806B] active:scale-98 w-full sm:w-auto cursor-pointer"
>
  <div class="w-7 h-7 rounded-lg flex items-center justify-center text-lg shadow-inner {activeColor.bg}">
    {passport.avatarIcon}
  </div>
  <div class="text-left leading-tight">
    <span class="text-xs font-system font-black text-[#FF9F43] uppercase block tracking-wider">FLYER PASSPORT</span>
    <span class="text-[#0084CC] font-black text-sm block">{passport.villagerName}</span>
  </div>
  <ChevronRight class="w-3.5 h-3.5 text-[#FF9F43] transition-transform ml-auto sm:ml-1 {showPassportDrawer ? 'rotate-90' : ''}" />
</button>
