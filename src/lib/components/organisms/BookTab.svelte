<script lang="ts">
  import { Plane, ChevronRight, X, AlertCircle, PlusCircle, Compass } from '@lucide/svelte';
  import Box from '../atoms/Box.atom.svelte';
  import Text from '../atoms/Text.atom.svelte';
  import Button from '../atoms/Button.atom.svelte';
  import { dalStore } from '$lib/stores/dal.svelte';
  import { GATE_THEMES } from '$lib/types';
</script>

<Box class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start w-full">
  <Box class="lg:col-span-7 space-y-4">
    <Box class="bg-white rounded-3xl border-2 border-[#0084CC]/10 p-4 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-sm">
      <Box class="flex items-center gap-2.5">
        <Text tag="span" class="w-2.5 h-2.5 rounded-full bg-[#0084CC] animate-ping" />
        <Box>
          <Text tag="h2" class="text-base font-mono font-black tracking-wider text-[#0084CC] uppercase leading-none">
            DAL DEPARTURES FLIGHT BOARD
          </Text>
          <Text tag="span" class="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest mt-0.5 block">
            CHOOSE FLIGHT TO REVEAL BOARDING PASS
          </Text>
        </Box>
      </Box>
      <Text tag="span" class="bg-[#A2D2FF]/20 text-[#0084CC] text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-[#0084CC]/10">
        {dalStore.flights.length} SEAPLANES ACTIVE
      </Text>
    </Box>

    {#if dalStore.flights.length === 0}
      <Box class="bg-white border border-[#0084CC]/10 rounded-[32px] py-14 text-center font-mono text-slate-400">
        <Plane class="w-10 h-10 mx-auto mb-2 text-slate-300 animate-bounce" />
        <Text tag="p" class="text-xs font-bold uppercase">NO ACTIVE DESTINATIONS REGISTERED</Text>
        <Text tag="p" class="text-[10px] mt-0.5">Switch to 'My Flight Hub' to park your seaplane at the gate!</Text>
      </Box>
    {:else}
      <Box class="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
        {#each dalStore.flights as flight}
          {@const isSelected = dalStore.selectedFlightId === flight.id}
          {@const hasBoarded = flight.passengers.some(p => p.name.toLowerCase() === dalStore.passport.villagerName.toLowerCase())}
          
          <Box
            class={`p-4 rounded-3xl border-2 cursor-pointer transition-all ${
              isSelected
                ? 'bg-white border-[#0084CC] shadow-[0_5px_0_0_rgba(0,132,204,0.1)]'
                : 'bg-white hover:bg-[#FFFCEF]/40 border-[#0084CC]/10 shadow-xs'
            }`}
            onclick={() => {
              dalStore.playSound('beep');
              dalStore.selectedFlightId = isSelected ? null : flight.id;
            }}
          >
            <Box class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <Box class="flex items-center gap-3">
                <Box class="w-10 h-10 bg-[#0084CC] rounded-xl flex flex-col items-center justify-center font-mono text-white flex-shrink-0">
                  <Text tag="span" class="text-[6.5px] uppercase font-bold leading-none text-sky-200">GATE</Text>
                  <Text tag="span" class="text-[#FFCC00] font-black text-sm leading-none">{flight.gate}</Text>
                  <Text tag="span" class="text-[9px] leading-none">{GATE_THEMES[flight.gate]?.icon}</Text>
                </Box>
                <Box>
                  <Box class="flex items-center flex-wrap gap-1">
                    <Text tag="span" class="font-mono text-xs font-black text-[#0084CC] tracking-wider">{flight.id}</Text>
                    <Text tag="span" class="text-[8.5px] font-mono font-bold bg-[#A2D2FF]/25 text-[#006094] px-1.5 py-0.2 rounded-full">
                      🌎 {flight.hemisphere}
                    </Text>
                    {#if hasBoarded}
                      <Text tag="span" class="text-[8.5px] font-mono font-black bg-green-100 text-green-700 border border-green-200 px-1.5 py-0.2 rounded-full uppercase">
                        BOARDED
                      </Text>
                    {/if}
                  </Box>
                  <Text tag="h3" class="font-display font-black text-[#4A4A4A] mt-0.5 leading-snug">
                    {flight.islandName}
                  </Text>
                  <Text tag="p" class="text-[11px] text-slate-500 font-medium">
                    Captain {flight.hostName} | <Text tag="span" class="italic">"{flight.description}"</Text>
                  </Text>
                </Box>
              </Box>
              <Box class="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-0 border-slate-100 pt-2.5 sm:pt-0 gap-1">
                <Box class="flex items-center gap-1 font-mono">
                  <Text tag="span" class="text-[9px] text-slate-400">PAS:</Text>
                  <Text tag="span" class="text-xs font-bold text-[#4A4A4A]">👤 {flight.passengers.length}</Text>
                </Box>
                <Box class="flex items-center gap-2">
                  <Text tag="span" class={`text-[9px] font-mono font-black px-2 py-0.5 rounded-full ${
                    flight.status === 'Boarding' ? 'bg-[#FFCC00]/20 text-[#006094] border border-[#FFCC00] animate-pulse' :
                    flight.status === 'Closed' || flight.status === 'Departed' ? 'bg-slate-100 text-slate-400 border border-slate-200' :
                    'bg-green-50 text-green-700 border border-green-200'
                  }`}>
                    {flight.status.toUpperCase()}
                  </Text>
                  <Text tag="span" class="text-[#0084CC] font-mono text-[10px] font-black flex items-center gap-0.5 hover:underline">
                    Tickets <ChevronRight class="w-3 h-3" />
                  </Text>
                </Box>
              </Box>
            </Box>
          </Box>
        {/each}
      </Box>
    {/if}
  </Box>

  <Box class="lg:col-span-5 space-y-4">
    <Box class="bg-[#FAF8F2] rounded-[32px] border-4 border-[#E6DFC7] p-5 shadow-sm text-[#4A4A4A]">
      <Box class="flex items-center justify-between border-b border-[#E6DFC7] pb-2.5 mb-3">
        <Box class="flex items-center gap-1.5">
          <Text tag="span" class="text-amber-600 text-lg">🛋️</Text>
          <Box>
            <Text tag="h3" class="font-display font-black text-xs text-[#0084CC] uppercase leading-none">Standby Lounge Radar</Text>
            <Text tag="span" class="text-[8.5px] font-mono font-bold text-slate-400 uppercase">PEOPLE SEEKING FLIGHTS</Text>
          </Box>
        </Box>
        <Button
          onclick={() => { dalStore.playSound('beep'); dalStore.showStandbyModal = true; }}
          class="bg-[#0084CC] hover:bg-[#006094] text-white font-mono font-black text-[9px] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs"
        >
          <PlusCircle class="w-3 h-3" /> Add Request
        </Button>
      </Box>

      <Box class="space-y-3 max-h-[450px] overflow-y-auto pr-1">
        {#if dalStore.requests.length === 0}
          <Text tag="p" class="text-[11px] font-mono text-center text-slate-400/80 py-8">
            The standby terminal is currently empty. Clear skies on all runways! 🛩️
          </Text>
        {:else}
          {#each dalStore.requests as req}
            {@const isMine = dalStore.passport.hasCreated && req.name.toLowerCase() === dalStore.passport.villagerName.toLowerCase()}
            <Box class={`p-3 bg-white rounded-2xl border-2 transition-all relative ${
              isMine ? 'border-[#0084CC] bg-[#F0F9FF]' : 'border-[#E6DFC7]/60'
            }`}>
              {#if isMine}
                <Button
                  onclick={async () => {
                    try {
                      const res = await fetch(`/api/requests/${req.id}`, { method: 'DELETE' });
                      if (res.ok) { dalStore.playSound('beep'); dalStore.fetchState(); }
                    } catch (err) {}
                  }}
                  class="absolute top-2 right-2 p-1 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600"
                  title="Withdraw ticket"
                >
                  <X class="w-3 h-3" />
                </Button>
              {/if}
              <Box class="flex items-start gap-2.5">
                <Box class="w-9 h-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-xl shadow-xs">
                  {req.avatar}
                </Box>
                <Box class="flex-1 min-w-0">
                  <Box class="flex items-center flex-wrap gap-1">
                    <Text tag="span" class="font-display font-black text-xs text-slate-700">{req.name}</Text>
                    <Text tag="span" class="text-[8px] font-mono text-slate-400">from {req.island}</Text>
                  </Box>
                  <Text tag="p" class="text-[9px] font-mono text-slate-400 uppercase font-black truncate max-w-full">
                    "{req.title}"
                  </Text>
                  <Box class="mt-1.5 flex items-center flex-wrap gap-1.5">
                    <Text tag="span" class="bg-[#A2D2FF]/20 text-[#006094] text-[8.5px] font-mono font-black px-1.5 py-0.2 rounded-full uppercase">
                      {GATE_THEMES[req.gateType]?.icon} {GATE_THEMES[req.gateType]?.name}
                    </Text>
                    <Text tag="span" class="bg-amber-50 text-amber-700 border border-amber-100 text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded-full uppercase">
                      ⏱️ {req.timePreference}
                    </Text>
                  </Box>
                  <Text tag="p" class="text-[10.5px] text-slate-500 italic mt-1.5 leading-snug">
                    "{req.memo}"
                  </Text>
                </Box>
              </Box>
            </Box>
          {/each}
        {/if}
      </Box>
    </Box>

    <Box class="bg-white rounded-[32px] border-2 border-[#0084CC]/10 p-4 flex gap-3">
      <Text tag="span" class="text-3xl">🦤</Text>
      <Box class="text-xs text-[#4A4A4A]/80 leading-relaxed">
        <Text tag="strong">Orville:</Text> "Can't find an open airport gate that matches your travel itinerary? File a Standby Request above to alert online pilots looking to match passenger lists!"
      </Box>
    </Box>
  </Box>
</Box>
