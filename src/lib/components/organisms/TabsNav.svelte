<script lang="ts">
  import { Plane, ChevronRight, BookOpen, Cloud } from '@lucide/svelte';
  import Box from '../atoms/Box.atom.svelte';
  import Text from '../atoms/Text.atom.svelte';
  import Button from '../atoms/Button.atom.svelte';
  import { dalStore } from '$lib/stores/dal.svelte';
  import { GATE_THEMES } from '$lib/types';
</script>

<Box class="w-full max-w-7xl mx-auto flex-1 flex flex-col gap-5 items-stretch mt-4">
  
  <Box class="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-3xl border-2 border-[#0084CC]/10 shadow-sm z-30">
    
    {#if dalStore.passport.hasCreated}
      <Box class="relative">
        <Button
          onclick={() => {
            dalStore.playSound('beep');
            dalStore.showPassportDrawer = !dalStore.showPassportDrawer;
          }}
          class="flex items-center gap-2 bg-[#FFFCEF] hover:bg-[#FFEAA7]/30 border-2 border-[#FFEAA7] px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all text-[#85806B]"
        >
          <BookOpen class="w-4 h-4 text-[#FFCC00]" />
          Frequent Flyer: <Text tag="span" class="text-[#0084CC] font-black">{dalStore.passport.villagerName} ({dalStore.passport.avatarIcon})</Text>
          <ChevronRight class={`w-3.5 h-3.5 transition-transform ${dalStore.showPassportDrawer ? 'rotate-90' : ''}`} />
        </Button>
      </Box>
    {/if}

    <Box class="flex gap-1.5 bg-slate-100 p-1 rounded-2xl w-full md:w-auto">
      <Button
        onclick={() => { dalStore.playSound('beep'); dalStore.currentTab = 'book'; }}
        class={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-system font-black transition-all ${
          dalStore.currentTab === 'book' ? (dalStore.systemMode === 'DAL' ? 'bg-[#0084CC] text-white shadow-sm' : 'bg-[#4B0082] text-white shadow-sm') : 'hover:bg-slate-200 text-[#4A4A4A]'
        }`}
      >
        {#if dalStore.systemMode === 'DAL'}
          <Plane class="w-4 h-4" /> Book Flight
        {:else}
          <Cloud class="w-4 h-4" /> Find Dream
        {/if}
      </Button>
      <Button
        onclick={() => { dalStore.playSound('beep'); dalStore.currentTab = 'hub'; }}
        class={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-system font-black transition-all ${
          dalStore.currentTab === 'hub' ? (dalStore.systemMode === 'DAL' ? 'bg-[#0084CC] text-white shadow-sm' : 'bg-[#4B0082] text-white shadow-sm') : 'hover:bg-slate-200 text-[#4A4A4A]'
        }`}
      >
        {#if dalStore.systemMode === 'DAL'}
          <Plane class="w-4 h-4" /> My Flight Hub
        {:else}
          <Cloud class="w-4 h-4" /> My Dream Hub
        {/if}
        {#if dalStore.flights.some((f: any) => f.hostName.toLowerCase() === dalStore.passport.villagerName.toLowerCase())}
          <Text tag="span" class="w-2 h-2 bg-[#FFCC00] rounded-full animate-ping" />
        {/if}
      </Button>
      <Button
        onclick={() => { dalStore.playSound('beep'); dalStore.currentTab = 'radio'; }}
        class={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-system font-black transition-all ${
          dalStore.currentTab === 'radio' ? (dalStore.systemMode === 'DAL' ? 'bg-[#0084CC] text-white shadow-sm' : 'bg-[#4B0082] text-white shadow-sm') : 'hover:bg-slate-200 text-[#4A4A4A]'
        }`}
      >
        {#if dalStore.systemMode === 'DAL'}
          <Plane class="w-4 h-4" /> Airport Radio
        {:else}
          <Cloud class="w-4 h-4" /> Dream Radio
        {/if}
      </Button>
    </Box>
  </Box>
</Box>
