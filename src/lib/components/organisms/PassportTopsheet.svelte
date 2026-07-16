<script lang="ts">
  import { slide, fade } from 'svelte/transition';
  import { X } from '@lucide/svelte';
  import Box from '../atoms/Box.atom.svelte';
  import Text from '../atoms/Text.atom.svelte';
  import Button from '../atoms/Button.atom.svelte';
  import { PASSPORT_COLORS } from '$lib/types';
  import type { Passport } from '$lib/studio-types';

  let {
    passport,
    showPassportDrawer = $bindable(false),
    setShowMilesModal,
    setIsEditingPassport,
    isMuted = false,
    playSound
  }: {
    passport: Passport;
    showPassportDrawer: boolean;
    setShowMilesModal: (v: boolean) => void;
    setIsEditingPassport: (v: boolean) => void;
    isMuted?: boolean;
    playSound: (id: string, isMuted?: boolean) => void;
  } = $props();

  let activeColor = $derived(PASSPORT_COLORS[passport.colorIndex || 0] || PASSPORT_COLORS[0]);

  // import dalStore so we can use its properties for switching
  import { dalStore } from '$lib/stores/dal.svelte.ts';
</script>

{#if showPassportDrawer}
  <!-- Overlay Backdrop -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    transition:fade={{ duration: 200 }}
    class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
    onclick={() => showPassportDrawer = false}
  ></div>

  <!-- Topsheet Container (just below header) -->
  <div
    transition:slide={{ duration: 300 }}
    class="absolute left-0 right-0 top-0 mt-4 mx-4 md:mx-auto max-w-2xl bg-[#FAF8F2] rounded-b-[40px] rounded-t-3xl border-b-8 border-x-4 border-t-4 border-[#E6DFC7] shadow-2xl p-6 z-50 text-[#4A4A4A]"
  >
    <!-- Close button -->
    <button
      onclick={() => {
        playSound('beep', isMuted);
        showPassportDrawer = false;
      }}
      class="absolute right-4 top-4 w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 transition-colors cursor-pointer border-none"
    >
      <X class="w-6 h-6" />
    </button>

    <!-- Passport Switcher -->
    {#if dalStore.myPassports && dalStore.myPassports.length > 0}
      <div class="flex flex-wrap gap-2 items-center w-full mt-4 mb-2">
        {#each dalStore.myPassports as p, i}
          <button
            class="px-3 py-1.5 rounded-xl font-system text-xs uppercase font-bold border-2 transition-all {dalStore.activePassportIndex === i ? 'bg-[#0084CC] text-white border-[#006bb3]' : 'bg-white text-[#4A4A4A] border-slate-200 hover:bg-slate-50'}"
            onclick={() => { playSound('beep', isMuted); dalStore.activePassportIndex = i; }}
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

    <Box class="flex flex-col sm:flex-row gap-6 mt-4">
      <!-- Left Profile Area -->
      <Box class="flex flex-col items-center gap-3 w-full sm:w-1/3">
        <Box class={`w-28 h-28 rounded-[2rem] flex items-center justify-center text-6xl shadow-inner border-4 ${activeColor.border} ${activeColor.bg}`}>
          {passport.avatarIcon}
        </Box>
        <Box class="text-center w-full">
          <Text tag="p" class="font-system font-black text-xl leading-tight text-[#4A4A4A] truncate">{passport.villagerName}</Text>
          <Text tag="p" class="text-xs font-system text-[#85806B] uppercase mt-1">PASSPORT TITLE</Text>
          <Text tag="span" class="inline-block mt-0.5 bg-[#F5F2E6] border border-[#E6DFC7] rounded px-2 py-0.5 text-xs font-system font-bold text-[#80765A] uppercase">
            {passport.titlePart1} {passport.titlePart2}
          </Text>
        </Box>
      </Box>

      <!-- Right Details Area -->
      <Box class="flex-1 space-y-4">
        <!-- Island & Native Fruit -->
        <Box class="grid grid-cols-2 gap-4">
          <Box class="bg-white p-3 rounded-2xl border border-[#E6DFC7]">
            <Text tag="p" class="text-[10px] font-system font-bold text-[#85806B] uppercase mb-1">ISLAND</Text>
            <Text tag="p" class="text-lg font-black text-[#0084CC] truncate leading-none">🏝️ {passport.islandName}</Text>
          </Box>
          <Box class="bg-white p-3 rounded-2xl border border-[#E6DFC7]">
            <Text tag="p" class="text-[10px] font-system font-bold text-[#85806B] uppercase mb-1">NATIVE FRUIT</Text>
            <Text tag="p" class="text-base font-bold text-slate-700 leading-none">
              {passport.nativeFruit === 'Apple' ? '🍎' : passport.nativeFruit === 'Cherry' ? '🍒' : passport.nativeFruit === 'Orange' ? '🍊' : passport.nativeFruit === 'Peach' ? '🍑' : passport.nativeFruit === 'Pear' ? '🍐' : '🍎'} {passport.nativeFruit || 'Apple'}
            </Text>
          </Box>
        </Box>

        <!-- Signature/Comment Bubble -->
        {#if passport.signature}
          <Box class="relative bg-white border-2 border-[#E6DFC7] p-3 rounded-2xl rounded-tl-none ml-2">
            <!-- Tail for speech bubble -->
            <Box class="absolute -left-2.5 top-0 w-0 h-0 border-y-8 border-y-transparent border-r-[10px] border-r-white z-10" />
            <Box class="absolute -left-3 top-[-2px] w-0 h-0 border-y-[10px] border-y-transparent border-r-[12px] border-r-[#E6DFC7]" />
            <Text tag="p" class="text-sm font-semibold italic text-slate-600">
              "{passport.signature}"
            </Text>
          </Box>
        {/if}

        <Box class="grid grid-cols-2 gap-4">
          <Box class="space-y-1">
            <Text tag="span" class="block text-[10px] font-system font-bold text-[#85806B] uppercase">FRIEND CODE</Text>
            <Text tag="span" class="font-system font-black tracking-wide text-slate-600 text-sm block bg-slate-50 p-1.5 rounded-lg text-center border border-slate-200">{passport.friendCode || 'Not set'}</Text>
          </Box>
          
          <Box class="space-y-1">
            <Text tag="span" class="block text-[10px] font-system font-bold text-[#85806B] uppercase">DREAM ADDRESS</Text>
            <Text tag="span" class="font-system font-black tracking-wide text-purple-600 text-sm block bg-purple-50 p-1.5 rounded-lg text-center border border-purple-200">{passport.dreamAddress || 'Not set'}</Text>
          </Box>
        </Box>

        <Box class="flex items-center justify-between bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 text-sm font-bold mt-2">
          <Text tag="span" class="flex items-center gap-2 text-[#FF9F43] font-system font-black uppercase">
            🎟️ Dodo Miles:
          </Text>
          <Text tag="span" class="font-system text-amber-700 text-lg font-black">
            {(passport.miles ?? 2000).toLocaleString()}
          </Text>
        </Box>

        <!-- Actions -->
        <Box class="flex gap-3 mt-4">
          <Button
            onclick={() => {
              playSound('beep', isMuted);
              setShowMilesModal(true);
              showPassportDrawer = false;
            }}
            class="flex-1 bg-[#FF9F43] hover:bg-[#ff8f24] text-white py-2 rounded-xl font-system font-black text-xs uppercase shadow border-b-4 border-[#cc7a1f] flex items-center justify-center gap-1 cursor-pointer"
          >
            🎯 Stamp Book
          </Button>

          <Button
            onclick={() => {
              playSound('beep', isMuted);
              setIsEditingPassport(true);
              showPassportDrawer = false;
            }}
            class="flex-1 btn-acnh btn-acnh-primary text-xs py-2 border-b-4 cursor-pointer"
          >
            ✏️ Edit Passport
          </Button>
        </Box>
      </Box>
    </Box>
  </div>
{/if}
