<script lang="ts">
  import { slide } from 'svelte/transition';
  import { X } from '@lucide/svelte';
  import Box from '../atoms/Box.atom.svelte';
  import Text from '../atoms/Text.atom.svelte';
  import Button from '../atoms/Button.atom.svelte';
  import { dalStore } from '$lib/stores/dal.svelte';
  import { PASSPORT_COLORS } from '$lib/types';
</script>

{#if dalStore.showPassportDrawer}
  <Box transition={slide} class="absolute left-0 mt-2 bg-[#FAF8F2] rounded-[32px] border-4 border-[#E6DFC7] shadow-xl p-4 w-72 z-50 text-[#4A4A4A]">
    <Box class="space-y-3">
      <Box class="flex items-center justify-between border-b border-[#E6DFC7] pb-1.5 text-[9px] font-mono font-bold text-[#85806B]">
        <Text tag="span">📖 DODO AIRLINES PASSPORT</Text>
        <Text tag="span" class="text-green-700 bg-green-100 px-1.5 py-0.2 rounded-full uppercase tracking-tighter text-[7.5px]">VERIFIED</Text>
      </Box>

      <Box class="flex gap-3">
        <Box class={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${PASSPORT_COLORS[dalStore.passport.colorIndex || 0]?.bg}`}>
          {dalStore.passport.avatarIcon}
        </Box>
        <Box class="space-y-1 flex-1 min-w-0">
          <Text tag="p" class="text-[7.5px] font-mono text-[#85806B] uppercase leading-none">PASSENGER</Text>
          <Text tag="p" class="font-display font-black text-sm leading-none text-[#4A4A4A] truncate">{dalStore.passport.villagerName}</Text>
          <Text tag="p" class="text-[7.5px] font-mono text-[#85806B] uppercase leading-none mt-1">ISLAND</Text>
          <Text tag="p" class="text-[11px] font-bold text-[#0084CC] leading-none truncate">🏝️ {dalStore.passport.islandName}</Text>
        </Box>
      </Box>

      <Box class="space-y-1 text-xs">
        <Text tag="span" class="block text-[7.5px] font-mono text-[#85806B] uppercase leading-none">PASSPORT TITLE</Text>
        <Text tag="span" class="inline-block bg-[#F5F2E6] border border-[#E6DFC7] rounded px-1.5 py-0.5 text-[9px] font-mono font-bold text-[#80765A] uppercase truncate max-w-full">
          {dalStore.passport.titlePart1} {dalStore.passport.titlePart2}
        </Text>
      </Box>

      <Box class="space-y-1 text-xs">
        <Text tag="span" class="block text-[7.5px] font-mono text-[#85806B] uppercase leading-none">FRIEND CODE</Text>
        <Text tag="span" class="font-mono font-bold text-slate-600 text-[10px]">{dalStore.passport.friendCode}</Text>
      </Box>

      {#if dalStore.passport.signature}
        <Box class="bg-white/60 border border-[#E6DFC7]/50 p-2 rounded-xl text-[10px] italic text-slate-500">
          "{dalStore.passport.signature}"
        </Box>
      {/if}

      <Box class="flex items-center justify-between bg-amber-50 border border-amber-200/50 rounded-2xl p-2.5 text-xs font-bold text-[#80765A]">
        <Text tag="span" class="flex items-center gap-1.5 text-[#FF9F43] font-mono text-[9px] font-black uppercase">
          🎟️ Dodo Miles:
        </Text>
        <Text tag="span" class="font-mono text-amber-700 text-sm font-black">
          {(dalStore.passport.miles ?? 2000).toLocaleString()}
        </Text>
      </Box>

      <Button
        onclick={() => {
          dalStore.playSound('beep');
          dalStore.showMilesModal = true;
          dalStore.showPassportDrawer = false;
        }}
        class="w-full bg-[#FF9F43] hover:bg-[#ff8f24] text-white py-1.5 rounded-xl font-display font-black text-[10px] uppercase shadow border-b-2 border-[#cc7a1f] flex items-center justify-center gap-1"
      >
        🎯 Open Stamp Book
      </Button>

      <Button
        onclick={() => {
          dalStore.playSound('beep');
          dalStore.isEditingPassport = true;
          dalStore.showPassportDrawer = false;
        }}
        class="w-full bg-[#0084CC] hover:bg-[#006094] text-white py-1.5 rounded-xl font-display font-black text-[10px] uppercase shadow border-b-2 border-[#006094]"
      >
        ✏️ Edit My Passport
      </Button>
    </Box>
  </Box>
{/if}
