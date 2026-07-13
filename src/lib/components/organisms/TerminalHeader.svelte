<script lang="ts">
  import { Plane, Calendar, Clock, RefreshCw, VolumeX, Volume2, Moon, CloudMoon, Users, Ticket } from '@lucide/svelte';
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
    (() => {
      const month = String(dalStore.liveTime.getMonth() + 1).padStart(2, '0');
      const date = String(dalStore.liveTime.getDate()).padStart(2, '0');
      const year = String(dalStore.liveTime.getFullYear()).slice(-2);
      return `${month}/${date}/${year}`;
    })()
  );
  let formattedTime = $derived(
    dalStore.liveTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  );
  let timeZone = $derived(
    (() => {
      try {
        const parts = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' }).formatToParts(dalStore.liveTime);
        const tzPart = parts.find(p => p.type === 'timeZoneName');
        return tzPart ? tzPart.value : '';
      } catch (e) {
        return '';
      }
    })()
  );
  let logoUrl = $derived(
    typeof window !== 'undefined' && (window as any).wpApiSettings?.pluginUrl
      ? `${(window as any).wpApiSettings.pluginUrl}public/dal.png`
      : '/dal.png'
  );
</script>

<Box tag="header" class="w-full mb-6 {dalStore.systemMode === 'DAL' ? 'bg-[#0084CC] border-[#FFCC00] shadow-[0_8px_32px_rgba(0,132,204,0.15)]' : 'bg-[#4B0082] border-[#DDA0DD] shadow-[0_8px_32px_rgba(75,0,130,0.15)]'} text-white rounded-[24px] p-3.5 lg:p-4 border-b-4 flex flex-col lg:flex-row items-center justify-between gap-4 relative z-50 transition-all duration-500">
  <!-- Subtle inner background glow -->
  <Box class="absolute inset-0 rounded-[20px] opacity-15 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] {dalStore.systemMode === 'DAL' ? 'from-[#FFCC00] via-sky-500' : 'from-[#DDA0DD] via-purple-600'} to-transparent pointer-events-none transition-colors duration-500" />

  <!-- Left Side: Gateway Status & Controls -->
  <Box class="flex items-center gap-3.5 z-10 w-full lg:w-1/3 lg:justify-start">
    <!-- Interactive Gateway Dial -->
    <button 
      onclick={() => dalStore.toggleSystemMode()}
      class="w-12 h-12 {dalStore.systemMode === 'DAL' ? 'bg-[#FFCC00] border-[#FFD633] text-[#0084CC]' : 'bg-[#DDA0DD] border-[#F3E8FF] text-[#4B0082]'} rounded-full border-3 flex items-center justify-center shadow-lg transform -rotate-12 transition-all duration-300 hover:rotate-12 hover:scale-108 cursor-pointer active:scale-95"
      title="Switch between Dodo Airlines & Luna's Dreamscape"
    >
      {#if dalStore.systemMode === 'DAL'}
        <Plane class="w-6 h-6 fill-current" />
      {:else}
        <Moon class="w-6 h-6 fill-current" />
      {/if}
    </button>

    <Box class="flex flex-col">
      <Box class="flex items-center gap-2">
        <Text tag="span" class="{dalStore.systemMode === 'DAL' ? 'bg-[#FFCC00] text-[#006094]' : 'bg-[#DDA0DD] text-[#4B0082]'} text-[10px] font-black tracking-widest px-2.5 py-0.5 rounded-full font-system shadow-sm transition-colors duration-500">
          {dalStore.systemMode === 'DAL' ? 'DAL GATEWAY' : 'LUNA GATEWAY'}
        </Text>
        {#if dalStore.isSyncing}
          <Text tag="span" class="flex items-center gap-1 text-[11px] {dalStore.systemMode === 'DAL' ? 'text-sky-200' : 'text-purple-200'} animate-pulse font-system">
            <RefreshCw class="w-2.5 h-2.5 animate-spin" /> {dalStore.systemMode === 'DAL' ? 'Radar Active' : 'Dreaming...'}
          </Text>
        {/if}
      </Box>
      <h1 class="text-xl lg:text-2xl font-black tracking-normal text-white drop-shadow-sm mt-0.5 leading-none">
        {#if dalStore.systemMode === 'DAL'}
          <span class="text-[#FFCC00]">Booking Terminal</span>
        {:else}
          Luna's <span class="text-[#DDA0DD]">Dream Library</span>
        {/if}
      </h1>
      <Box class="flex items-center gap-3 mt-1.5 text-[10px] font-medium text-white font-system uppercase tracking-wider opacity-90 drop-shadow-sm">
        <Box class="flex items-center gap-1.5">
          <Users class="w-3 h-3 opacity-80" />
          <span>{dalStore.totalIslanders} Users</span>
        </Box>
        <Box class="flex items-center gap-1.5">
          <span class="relative flex h-2 w-2 ml-0.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span>{dalStore.onlineIslanders} Online</span>
        </Box>
        <Box class="flex items-center gap-1.5">
          <Ticket class="w-3.5 h-3.5 {dalStore.systemMode === 'DAL' ? 'text-[#FFCC00]' : 'text-[#DDA0DD]'}" />
          <span>{dalStore.systemMode === 'DAL' ? 'FF MILES' : 'DREAM DUST'} {dalStore.passport.miles?.toLocaleString() || 0}</span>
        </Box>
      </Box>
    </Box>
  </Box>

  <!-- Center: Logo Image -->
  <Box class="flex items-center justify-center z-10 w-full lg:w-1/3 min-h-[36px]">
    {#if dalStore.systemMode === 'DAL'}
      <img src={logoUrl} alt="Dodo Airlines" class="h-8 lg:h-[125px] object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]" />
    {/if}
  </Box>

  <!-- Right Side: Status Widgets & Action Group -->
  <Box class="flex flex-col sm:flex-row flex-wrap items-center gap-3 z-10 w-full lg:w-1/3 sm:justify-end lg:justify-end">
    <!-- Combined Status Panel: Date + Clock -->
    <Box class="flex items-center gap-3 {dalStore.systemMode === 'DAL' ? 'bg-[#006094]/80' : 'bg-[#290048]/80'} rounded-2xl p-2.5 px-4 border border-white/10 shadow-inner font-system text-sm transition-colors duration-500 w-full sm:w-auto justify-center sm:justify-start">
      <!-- Date -->
      <Box class="flex flex-col leading-tight">
        <Box class="flex items-center gap-1.5">
          <Calendar class="w-3.5 h-3.5 {dalStore.systemMode === 'DAL' ? 'text-[#FFCC00]' : 'text-[#DDA0DD]'}" />
          <Text tag="span" class="{dalStore.systemMode === 'DAL' ? 'text-sky-200' : 'text-purple-200'} uppercase text-[9px] font-black tracking-wider leading-none">DATE</Text>
        </Box>
        <Text tag="span" class="text-white font-bold text-xs whitespace-nowrap mt-0.5 pl-5">{formattedDay} {formattedDate}</Text>
      </Box>

      <Box class="h-6 w-px {dalStore.systemMode === 'DAL' ? 'bg-sky-500/20' : 'bg-purple-500/20'}" />

      <!-- Clock -->
      <Box class="flex flex-col leading-tight">
        <Box class="flex items-center gap-1.5">
          <Clock class="w-3.5 h-3.5 {dalStore.systemMode === 'DAL' ? 'text-[#FFCC00]' : 'text-[#DDA0DD]'}" />
          <Text tag="span" class="{dalStore.systemMode === 'DAL' ? 'text-sky-200' : 'text-purple-200'} uppercase text-[9px] font-black tracking-wider leading-none">CLOCK</Text>
        </Box>
        <Text tag="span" class="text-white font-bold tracking-wider text-xs whitespace-nowrap mt-0.5 pl-5">
          {formattedTime}
          {#if timeZone}
            <span class="opacity-60 text-[10px] ml-1 font-medium">{timeZone}</span>
          {/if}
        </Text>
      </Box>
    </Box>

    <!-- Sleek Toolbar Group -->
    {#if children}
      <Box class="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
        {@render children()}
      </Box>
    {/if}
  </Box>
</Box>
