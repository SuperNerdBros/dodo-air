<script lang="ts">
  import { Plane, Calendar, Clock, RefreshCw, VolumeX, Volume2, Moon, CloudMoon } from '@lucide/svelte';
  import Box from '../atoms/Box.atom.svelte';
  import Text from '../atoms/Text.atom.svelte';
  import Button from '../atoms/Button.atom.svelte';
  import { dalStore } from '$lib/stores/dal.svelte';
  import type { Snippet } from 'svelte';

  let { children }: { children?: Snippet } = $props();

  let formattedDay = $derived(
    ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dalStore.liveTime.getDay()]
  );
  let formattedDate = $derived(
    `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][dalStore.liveTime.getMonth()]} ${dalStore.liveTime.getDate()}, ${dalStore.liveTime.getFullYear()}`
  );
  let formattedTime = $derived(dalStore.liveTime.toTimeString().split(' ')[0]);

</script>

<Box tag="header" class="w-full max-w-7xl mx-auto mb-5 {dalStore.systemMode === 'DAL' ? 'bg-[#0084CC] border-[#FFCC00]' : 'bg-[#4B0082] border-[#DDA0DD]'} text-white rounded-[32px] p-4 lg:p-5 shadow-lg border-b-4 flex flex-col lg:flex-row items-center justify-between gap-4 relative z-50 transition-colors duration-500">
  <Box class="absolute top-0 left-0 w-full h-full rounded-[32px] opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] {dalStore.systemMode === 'DAL' ? 'from-[#FFCC00] via-sky-500' : 'from-[#DDA0DD] via-purple-600'} to-transparent pointer-events-none transition-colors duration-500" />

  <Box class="flex items-center gap-3 z-10 w-full lg:w-auto">
    <!-- svelte-ignore a11y_consider_explicit_label -->
    <button 
      onclick={() => dalStore.toggleSystemMode()}
      class="w-12 h-12 {dalStore.systemMode === 'DAL' ? 'bg-[#FFCC00]' : 'bg-[#DDA0DD]'} rounded-full border-2 border-white flex items-center justify-center shadow transform -rotate-12 transition-colors duration-500 hover:scale-110 cursor-pointer"
    >
      {#if dalStore.systemMode === 'DAL'}
        <Plane class="w-7 h-7 text-[#0084CC] fill-[#0084CC]" />
      {:else}
        <Moon class="w-7 h-7 text-[#4B0082] fill-[#4B0082]" />
      {/if}
    </button>
    <Box>
      <Box class="flex items-center gap-1.5">
        <Text tag="span" class="{dalStore.systemMode === 'DAL' ? 'bg-[#FFCC00] text-[#006094]' : 'bg-[#DDA0DD] text-[#4B0082]'} text-xs font-black tracking-widest px-2 py-0.5 rounded-full font-system shadow-sm transition-colors duration-500">
          {dalStore.systemMode === 'DAL' ? 'DAL GATEWAY' : 'LUNA GATEWAY'}
        </Text>
        {#if dalStore.isSyncing}
          <Text tag="span" class="flex items-center gap-1 text-xs {dalStore.systemMode === 'DAL' ? 'text-sky-200' : 'text-purple-200'} animate-pulse font-system">
            <RefreshCw class="w-2.5 h-2.5 animate-spin" /> {dalStore.systemMode === 'DAL' ? 'Radar Active' : 'Dreaming...'}
          </Text>
        {/if}
      </Box>
      <h1 class="text-xl lg:text-2xl font-black tracking-normal text-white drop-shadow">
        {#if dalStore.systemMode === 'DAL'}
          Dodo Airlines <span class="text-[#FFCC00]">Booking Terminal</span>
        {:else}
          Luna's <span class="text-[#DDA0DD]">Dream Library</span>
        {/if}
      </h1>
    </Box>
  </Box>

  <Box class="flex flex-wrap items-center gap-3 {dalStore.systemMode === 'DAL' ? 'bg-[#006094]/80' : 'bg-[#290048]/80'} rounded-2xl p-2.5 border border-white/10 shadow-inner z-10 w-full lg:w-auto justify-around font-system text-sm transition-colors duration-500">
    <Box class="flex items-center gap-2">
      <Calendar class="w-3.5 h-3.5 {dalStore.systemMode === 'DAL' ? 'text-[#FFCC00]' : 'text-[#DDA0DD]'}" />
      <Box>
        <Text tag="span" class="{dalStore.systemMode === 'DAL' ? 'text-sky-200' : 'text-purple-200'} uppercase block text-xs font-black leading-none mb-0.5">DATE</Text>
        <Text tag="span" class="text-white font-bold">{formattedDay}, {formattedDate}</Text>
      </Box>
    </Box>
    
    <Box class="h-6 w-px {dalStore.systemMode === 'DAL' ? 'bg-sky-500/30' : 'bg-purple-500/30'}" />

    <Box class="flex items-center gap-2">
      <Clock class="w-3.5 h-3.5 {dalStore.systemMode === 'DAL' ? 'text-[#FFCC00]' : 'text-[#DDA0DD]'}" />
      <Box>
        <Text tag="span" class="{dalStore.systemMode === 'DAL' ? 'text-sky-200' : 'text-purple-200'} uppercase block text-xs font-black leading-none mb-0.5">CLOCK</Text>
        <Text tag="span" class="{dalStore.systemMode === 'DAL' ? 'text-[#FFCC00]' : 'text-[#DDA0DD]'} font-bold tracking-wider">{formattedTime}</Text>
      </Box>
    </Box>

    <Box class="h-6 w-px {dalStore.systemMode === 'DAL' ? 'bg-sky-500/30' : 'bg-purple-500/30'}" />

    <Button 
      onclick={() => dalStore.toggleSystemMode()}
      class="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all {dalStore.systemMode === 'DAL' ? 'text-[#FFCC00]' : 'text-[#DDA0DD]'}"
      title="Toggle System Mode"
    >
      {#if dalStore.systemMode === 'DAL'}
        <Plane class="w-4 h-4" />
      {:else}
        <CloudMoon class="w-4 h-4" />
      {/if}
    </Button>

    {#if children}
      {@render children()}
    {/if}
  </Box>
</Box>
