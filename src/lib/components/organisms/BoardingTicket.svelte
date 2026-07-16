<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { Ticket, X, AlertCircle } from '@lucide/svelte';
  import Box from '../atoms/Box.atom.svelte';
  import Text from '../atoms/Text.atom.svelte';
  import Button from '../atoms/Button.atom.svelte';
  import { dalStore } from '$lib/stores/dal.svelte.ts';

  let selectedFlight = $derived(dalStore.flights.find(f => f.id === dalStore.selectedFlightId));
  
  async function handleBoardFlight(flightId: string) {
    if (!dalStore.passport.hasCreated) {
      dalStore.playSound('beep');
      alert('Please fill out your Passport first!');
      return;
    }
    dalStore.boardingError = '';
    try {
      const res = await fetch(`/wp-json/dodo-air/v1/flights/${flightId}/board`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: dalStore.passport.villagerName,
          island: dalStore.passport.islandName
        })
      });

      if (res.ok) {
        dalStore.playSound('success');
        dalStore.revealedCodes = { ...dalStore.revealedCodes, [flightId]: true };
        dalStore.fetchState();
        dalStore.earnStampProgress('hasBoarded');
      } else {
        const data = await res.json();
        dalStore.boardingError = data.error || 'Failed to check-in.';
        dalStore.playSound('beep');
      }
    } catch (err) {
      dalStore.boardingError = 'Connection error during boarding.';
      dalStore.playSound('beep');
    }
  }

  async function handleLeaveFlight(flightId: string, passengerId: string) {
    try {
      const res = await fetch(`/wp-json/dodo-air/v1/flights/${flightId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passengerId })
      });
      if (res.ok) {
        dalStore.playSound('beep');
        dalStore.fetchState();
      }
    } catch (err) {
      console.error(err);
    }
  }
</script>

{#if selectedFlight}
  <Box class="fixed inset-0 bg-[#006094]/40 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
    <Box transition={scale} class="bg-white rounded-[36px] border-4 border-[#0084CC] max-w-2xl w-full shadow-2xl relative overflow-hidden text-[#4A4A4A] my-8">
      <Box class="bg-[#0084CC] text-white p-4 font-system font-black flex items-center justify-between border-b-4 border-dashed border-[#006094]">
        <Box class="flex items-center gap-2">
          <Ticket class="w-5 h-5 text-[#FFCC00]" />
          <Text tag="span">UNOFFICIAL DAL BOARDING PASS</Text>
        </Box>
        <Button
          onclick={() => { dalStore.playSound('beep'); dalStore.selectedFlightId = null; }}
          class="p-1 rounded-full bg-[#006094] hover:bg-[#004d75] transition-all"
        >
          <X class="w-4 h-4 text-[#FFCC00]" />
        </Button>
      </Box>

      <Box class="p-5 flex flex-col md:flex-row gap-5 items-stretch text-[#4A4A4A]">
        <Box class="flex-1 space-y-4">
          <Box class="grid grid-cols-2 gap-4">
            <Box>
              <Text tag="span" class="block text-xs font-system text-slate-400 uppercase font-black tracking-wider leading-none">PASSENGER NAME</Text>
              <Text tag="span" class="text-sm font-system font-black text-slate-700 mt-1 block">
                {dalStore.passport.hasCreated ? dalStore.passport.villagerName : "GUEST PASSENGER"}
              </Text>
            </Box>
            <Box>
              <Text tag="span" class="block text-xs font-system text-slate-400 uppercase font-black tracking-wider leading-none">SEAPLANE FLIGHT</Text>
              <Text tag="span" class="text-sm font-system font-black text-[#0084CC] mt-1 block">
                {selectedFlight.id}
              </Text>
            </Box>
          </Box>

          <Box class="grid grid-cols-2 gap-4">
            <Box>
              <Text tag="span" class="block text-xs font-system text-slate-400 uppercase font-black tracking-wider leading-none">DEPARTURE PORT</Text>
              <Text tag="span" class="text-xs font-bold text-slate-700 mt-1 block">
                🏝️ {dalStore.passport.hasCreated ? dalStore.passport.islandName : "HOME PORT"}
              </Text>
            </Box>
            <Box>
              <Text tag="span" class="block text-xs font-system text-slate-400 uppercase font-black tracking-wider leading-none">DESTINATION ISLAND</Text>
              <Text tag="span" class="text-xs font-bold text-[#0084CC] mt-1 block">
                🏝️ {selectedFlight.islandName} (Host {selectedFlight.hostName})
              </Text>
            </Box>
          </Box>

          <Box class="grid grid-cols-3 gap-2 bg-[#FAF8F2] p-2.5 rounded-2xl border border-[#E6DFC7]">
            <Box class="text-center border-r border-[#E6DFC7]/60">
              <Text tag="span" class="block text-xs font-system text-slate-400 font-bold leading-none">GATE</Text>
              <Text tag="span" class="text-sm font-black text-[#0084CC] leading-none mt-1 block">{selectedFlight.gate}</Text>
            </Box>
            <Box class="text-center border-r border-[#E6DFC7]/60">
              <Text tag="span" class="block text-xs font-system text-slate-400 font-bold leading-none">SEAT ASSIGNED</Text>
              <Text tag="span" class="text-sm font-system font-black text-slate-700 leading-none mt-1 block">05A</Text>
            </Box>
            <Box class="text-center">
              <Text tag="span" class="block text-xs font-system text-slate-400 font-bold leading-none">STATUS</Text>
              <Text tag="span" class="text-sm font-system font-black text-amber-600 leading-none mt-1 block uppercase">{selectedFlight.status}</Text>
            </Box>
          </Box>

          <Box class="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
            {#if selectedFlight.passengers.some(p => p.name.toLowerCase() === dalStore.passport.villagerName.toLowerCase())}
              <Box class="w-full space-y-2">
                <Box class="bg-[#E6F4EA] border-2 border-[#137333] p-3 rounded-2xl text-center">
                  <Text tag="span" class="block text-xs font-system text-[#137333] font-black uppercase tracking-wider">BOARDED SEAPLANE - DODO CODE</Text>
                  <Text tag="span" class="text-2xl font-system font-black text-[#137333] tracking-widest mt-0.5 block uppercase">
                    {selectedFlight.dodoCode}
                  </Text>
                </Box>
                <Box class="flex gap-2">
                  <Button
                    onclick={() => {
                      const p = selectedFlight.passengers.find(p => p.name.toLowerCase() === dalStore.passport.villagerName.toLowerCase());
                      if (p) handleLeaveFlight(selectedFlight.id, p.id);
                    }}
                    class="btn-acnh btn-acnh-outline w-full"
                  >
                    👋 Return back home / Clear seat
                  </Button>
                </Box>
              </Box>
            {:else}
              <Box class="w-full space-y-2">
                {#if dalStore.boardingError}
                  <Text tag="p" class="text-xs font-bold text-red-600 flex items-center gap-1 mb-1 font-system">
                    <AlertCircle class="w-3.5 h-3.5" /> {dalStore.boardingError}
                  </Text>
                {/if}
                <Text tag="p" class="text-sm text-[#4A4A4A]/70 leading-relaxed font-sans mb-1 text-center sm:text-left">
                  🦤 <Text tag="strong">Orville:</Text> "Step up to the counter! Book your Boarding Pass on Flight <Text tag="strong">{selectedFlight.id}</Text> to receive the Dodo Code."
                </Text>
                <Button
                  onclick={() => handleBoardFlight(selectedFlight.id)}
                  disabled={selectedFlight.status === 'Closed' || selectedFlight.status === 'Departed'}
                  class="w-full bg-[#FFCC00] hover:bg-[#FFD11A] disabled:opacity-50 text-[#006094] font-system font-black py-3 px-4 rounded-xl shadow border-b-4 border-[#CC9900] text-center text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Ticket class="w-4 h-4" />
                  BOARD SEAPLANE (GET DODO CODE)
                </Button>
              </Box>
            {/if}
          </Box>
        </Box>

        <Box class="md:w-44 border-t md:border-t-0 md:border-l-2 border-slate-100 pt-4 md:pt-0 md:pl-4 flex flex-col justify-between items-center text-center">
          <Box class="space-y-1">
            <Text tag="span" class="text-xs font-system text-slate-400 font-bold block uppercase tracking-wide">BOARDING NUMBER</Text>
            <Text tag="span" class="font-system text-xs font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
              #DAL-{selectedFlight.id.replace('DAL-', '')}05
            </Text>
          </Box>
          <Box class="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-100 my-3 flex flex-col items-center justify-center">
            <Box class="h-10 w-full flex gap-0.5 justify-center items-stretch select-none">
              {#each [1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 1, 4] as width}
                <Box class="bg-slate-700" style={`width: ${width}px;`} />
              {/each}
            </Box>
            <Text tag="span" class="font-system text-xs text-slate-400 mt-1 block">DODO AIRLINES INC</Text>
          </Box>
          <Text tag="span" class="text-sm text-slate-400 font-semibold italic leading-snug">
            *Please leave through airport gates!
          </Text>
        </Box>
      </Box>
    </Box>
  </Box>
{/if}
