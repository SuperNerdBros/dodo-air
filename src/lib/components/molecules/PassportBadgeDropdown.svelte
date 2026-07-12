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

  let containerRef: HTMLDivElement;

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

<div class="relative" bind:this={containerRef}>
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

  {#if showPassportDrawer}
    <div
      class="absolute right-0 top-full mt-2 bg-[#FAF8F2] rounded-[32px] border-4 border-[#E6DFC7] shadow-2xl p-4 w-72 z-50 text-[#4A4A4A]"
      transition:scale={{ duration: 200, start: 0.95, easing: backOut }}
    >
      <div class="space-y-3">
        <div class="flex items-center justify-between border-b border-[#E6DFC7] pb-1.5 text-xs font-system font-bold text-[#85806B]">
          <span>📖 DODO AIRLINES PASSPORT</span>
          <span class="text-green-700 bg-green-100 px-1.5 py-0.2 rounded-full uppercase tracking-normal text-xs">VERIFIED</span>
        </div>

        <div class="flex gap-3">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner {activeColor.bg}">
            {passport.avatarIcon}
          </div>
          <div class="space-y-1 flex-1 min-w-0">
            <p class="text-xs font-system text-[#85806B] uppercase leading-none">PASSENGER</p>
            <p class="font-system font-black text-sm leading-none text-[#4A4A4A] truncate">{passport.villagerName}</p>
            <p class="text-xs font-system text-[#85806B] uppercase leading-none mt-1">ISLAND</p>
            <p class="text-sm font-bold text-[#0084CC] leading-none truncate">🏝️ {passport.islandName}</p>
          </div>
        </div>

        <div class="space-y-1 text-xs">
          <span class="block text-xs font-system text-[#85806B] uppercase leading-none">PASSPORT TITLE</span>
          <span class="inline-block bg-[#F5F2E6] border border-[#E6DFC7] rounded px-1.5 py-0.5 text-xs font-system font-bold text-[#80765A] uppercase truncate max-w-full">
            {passport.titlePart1} {passport.titlePart2}
          </span>
        </div>

        <div class="space-y-1 text-xs">
          <span class="block text-xs font-system text-[#85806B] uppercase leading-none">FRIEND CODE</span>
          <span class="font-system font-bold text-slate-600 text-sm">{passport.friendCode}</span>
        </div>

        <!-- Registered Island Plane details -->
        <div class="flex items-center gap-2 bg-sky-50/50 border border-[#0084CC]/15 p-2 rounded-xl text-sm">
          <span class="text-lg">✈️</span>
          <div class="flex-1 min-w-0">
            <span class="block text-xs font-system text-slate-400 uppercase leading-none mb-0.5">REGISTERED SEAPLANE</span>
            <span class="font-bold text-slate-700 block truncate">
              {passport.planeType === 'Switch 2' ? 'Switch 2 Model' : 'Switch Model'} ({passport.planeType === 'Switch 2' ? '12' : '8'} Seats)
            </span>
            <span class="text-xs font-system font-bold uppercase block leading-none mt-0.5" style="color: {activePlaneColor.hex}">
              ● {activePlaneColor.name}
            </span>
          </div>
        </div>

        {#if passport.signature}
          <div class="bg-white/60 border border-[#E6DFC7]/50 p-2 rounded-xl text-sm italic text-slate-500">
            "{passport.signature}"
          </div>
        {/if}

        <!-- Dodo Miles Balance Widget -->
        <div class="flex items-center justify-between bg-amber-50 border border-amber-200/50 rounded-2xl p-2.5 text-xs font-bold text-[#80765A]">
          <span class="flex items-center gap-1.5 text-[#FF9F43] font-system text-xs font-black uppercase">
            🎟️ Dodo Miles:
          </span>
          <span class="font-system text-amber-700 text-sm font-black">
            {(passport.miles ?? 2000).toLocaleString()}
          </span>
        </div>

        <!-- Dodo Miles App Stamp Button -->
        <button
          onclick={() => {
            playSound('beep', isMuted);
            setShowMilesModal(true);
            showPassportDrawer = false;
          }}
          class="w-full bg-[#FF9F43] hover:bg-[#ff8f24] text-white py-1.5 rounded-xl font-system font-black text-sm uppercase shadow border-b-2 border-[#cc7a1f] flex items-center justify-center gap-1 cursor-pointer font-bold"
        >
          🎯 Open Stamp Book
        </button>

        <button
          onclick={() => {
            playSound('beep', isMuted);
            setIsEditingPassport(true);
            showPassportDrawer = false;
          }}
          class="btn-acnh btn-acnh-primary w-full text-sm"
        >
          ✏️ Edit My Passport
        </button>
      </div>
    </div>
  {/if}
</div>
