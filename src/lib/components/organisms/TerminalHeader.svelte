<script lang="ts">
  import { Plane, Calendar, Clock, RefreshCw, VolumeX, Volume2 } from '@lucide/svelte';
  import Box from '../atoms/Box.atom.svelte';
  import Text from '../atoms/Text.atom.svelte';
  import Button from '../atoms/Button.atom.svelte';
  import { dalStore } from '$lib/stores/dal.svelte';

  let formattedDay = $derived(
    ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dalStore.liveTime.getDay()]
  );
  let formattedDate = $derived(
    `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][dalStore.liveTime.getMonth()]} ${dalStore.liveTime.getDate()}, ${dalStore.liveTime.getFullYear()}`
  );
  let formattedTime = $derived(dalStore.liveTime.toTimeString().split(' ')[0]);

</script>

<Box tag="header" class="w-full max-w-7xl mx-auto mb-5 bg-[#0084CC] text-white rounded-[32px] p-4 lg:p-5 shadow-lg border-b-4 border-[#FFCC00] flex flex-col lg:flex-row items-center justify-between gap-4 relative overflow-hidden">
  <Box class="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#FFCC00] via-sky-500 to-transparent pointer-events-none" />

  <Box class="flex items-center gap-3 z-10 w-full lg:w-auto">
    <Box class="w-12 h-12 bg-[#FFCC00] rounded-full border-2 border-white flex items-center justify-center shadow transform -rotate-12">
      <Plane class="w-7 h-7 text-[#0084CC] fill-[#0084CC]" />
    </Box>
    <Box>
      <Box class="flex items-center gap-1.5">
        <Text tag="span" class="bg-[#FFCC00] text-[#006094] text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full font-mono shadow-sm">
          DAL GATEWAY
        </Text>
        {#if dalStore.isSyncing}
          <Text tag="span" class="flex items-center gap-1 text-[9px] text-sky-200 animate-pulse font-mono">
            <RefreshCw class="w-2.5 h-2.5 animate-spin" /> Radar Active
          </Text>
        {/if}
      </Box>
      <Text tag="h1" class="text-xl lg:text-2xl font-black tracking-tight text-white drop-shadow">
        Dodo Airlines <Text tag="span" class="text-[#FFCC00]">Booking Terminal</Text>
      </Text>
    </Box>
  </Box>

  <Box class="flex flex-wrap items-center gap-3 bg-[#006094]/80 rounded-2xl p-2.5 border border-white/10 shadow-inner z-10 w-full lg:w-auto justify-around font-mono text-[11px]">
    <Box class="flex items-center gap-2">
      <Calendar class="w-3.5 h-3.5 text-[#FFCC00]" />
      <Box>
        <Text tag="span" class="text-sky-200 uppercase block text-[8px] font-black leading-none mb-0.5">DATE</Text>
        <Text tag="span" class="text-white font-bold">{formattedDay}, {formattedDate}</Text>
      </Box>
    </Box>
    
    <Box class="h-6 w-px bg-sky-500/30" />

    <Box class="flex items-center gap-2">
      <Clock class="w-3.5 h-3.5 text-[#FFCC00]" />
      <Box>
        <Text tag="span" class="text-sky-200 uppercase block text-[8px] font-black leading-none mb-0.5">CLOCK</Text>
        <Text tag="span" class="text-[#FFCC00] font-bold tracking-wider">{formattedTime}</Text>
      </Box>
    </Box>

    <Box class="h-6 w-px bg-sky-500/30" />

    <Button 
      onclick={() => {
        dalStore.isMuted = !dalStore.isMuted;
        if (dalStore.isMuted) dalStore.playSound('success');
      }}
      class="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-[#FFCC00]"
      title={dalStore.isMuted ? 'Unmute' : 'Mute'}
    >
      {#if dalStore.isMuted}
        <VolumeX class="w-4 h-4" />
      {:else}
        <Volume2 class="w-4 h-4" />
      {/if}
    </Button>
  </Box>
</Box>
