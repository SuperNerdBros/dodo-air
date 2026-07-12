<script lang="ts">
  import { Plane, Compass, Sparkles, RefreshCw, AlertCircle } from '@lucide/svelte';
  import Box from '../atoms/Box.atom.svelte';
  import Text from '../atoms/Text.atom.svelte';
  import Button from '../atoms/Button.atom.svelte';
  import Input from '../atoms/Input.atom.svelte';
  import Select from '../atoms/Select.atom.svelte';
  import Textarea from '../atoms/Textarea.atom.svelte';
  import Form from '../atoms/Form.atom.svelte';
  import { dalStore } from '$lib/stores/dal.svelte';
  import { GATE_THEMES } from '$lib/types';
  import type { FlightStatus, StandbyRequest } from '$lib/types';

  let myFlight = $derived(dalStore.flights.find(f => f.hostName.toLowerCase() === dalStore.passport.villagerName.toLowerCase() && f.islandName.toLowerCase() === dalStore.passport.islandName.toLowerCase()));

  async function handleHostFlight(e: Event) {
    e.preventDefault();
    dalStore.formError = '';

    if (!dalStore.passport.hasCreated) {
      dalStore.formError = 'Please save your Frequent Flyer Passport first!';
      dalStore.playSound('beep');
      return;
    }

    if (!dalStore.formDodo.trim()) {
      dalStore.formError = 'Please enter a valid 5-character Dodo Code.';
      dalStore.playSound('beep');
      return;
    }

    const cleanDodo = dalStore.formDodo.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleanDodo.length !== 5) {
      dalStore.formError = 'Dodo Code must be exactly 5 characters (A-Z, 0-9).';
      dalStore.playSound('beep');
      return;
    }

    dalStore.isSubmittingHost = true;
    try {
      const res = await fetch('/wp-json/dodo-air/v1/flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostName: dalStore.passport.villagerName,
          islandName: dalStore.passport.islandName,
          dodoCode: cleanDodo,
          hemisphere: dalStore.formHemisphere,
          gate: Number(dalStore.formGate),
          description: dalStore.formDesc.trim() || `Welcome to ${dalStore.passport.islandName}! Come over and relax! 🌴`
        })
      });

      if (res.ok) {
        const newFlight = await res.json();
        dalStore.playSound('airplane');
        dalStore.flights = [newFlight, ...dalStore.flights];
        dalStore.selectedFlightId = newFlight.id;
        dalStore.formDodo = '';
        dalStore.formDesc = '';
        dalStore.fetchState();
        dalStore.earnStampProgress('hasHosted');
      } else {
        const data = await res.json();
        dalStore.formError = data.error || 'Failed to dispatch seaplane.';
        dalStore.playSound('beep');
      }
    } catch (err) {
      dalStore.formError = 'Connection error. Could not dispatch seaplane.';
      dalStore.playSound('beep');
    } finally {
      dalStore.isSubmittingHost = false;
    }
  }

  async function handleUpdateStatus(flightId: string, newStatus: FlightStatus) {
    try {
      const res = await fetch(`/wp-json/dodo-air/v1/flights/${flightId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        dalStore.playSound('bell');
        dalStore.fetchState();
      }
    } catch (err) {
      console.error(err);
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

  async function handleClearForTakeoff(request: StandbyRequest, flightId: string) {
    try {
      const resBoard = await fetch(`/wp-json/dodo-air/v1/flights/${flightId}/board`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: request.name,
          island: request.island
        })
      });

      if (resBoard.ok) {
        await fetch(`/wp-json/dodo-air/v1/requests/${request.id}`, { method: 'DELETE' });
        dalStore.playSound('success');
        
        await fetch('/wp-json/dodo-air/v1/chatter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender: 'Orville [AI]',
            text: `🎉 MATCH MADE! Passenger ${request.name} is cleared for immediate takeoff and flying to ${dalStore.passport.islandName}! Clear skies ahead! 🛩️`
          })
        });
        dalStore.fetchState();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleGenerateAIReview(flightId: string) {
    dalStore.loadingReviewId = flightId;
    dalStore.playSound('bell');
    try {
      const res = await fetch('/wp-json/dodo-air/v1/ai/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightId })
      });
      if (res.ok) {
        dalStore.playSound('success');
        dalStore.fetchState();
      }
    } catch (err) {
      console.error(err);
    } finally {
      dalStore.loadingReviewId = null;
    }
  }
</script>

<Box class="max-w-4xl mx-auto w-full">
  {#if !myFlight}
    <Box class="bg-white rounded-[36px] border-4 border-[#0084CC]/10 shadow-[0_8px_0_0_rgba(0,132,204,0.05)] p-6 text-center space-y-6">
      <Box class="max-w-xs mx-auto">
        <Box class="w-20 h-20 bg-[#F0F9FF] border-2 border-[#0084CC] rounded-full flex items-center justify-center text-5xl mx-auto shadow relative transform -rotate-12">
          🛩️
          <Box class="absolute -bottom-1 -right-1 bg-[#FFCC00] text-[#006094] text-[8px] font-mono font-black px-1.5 py-0.5 rounded-full border border-white uppercase">
            DAL-X
          </Box>
        </Box>
      </Box>
      <Box>
        <Text tag="h2" class="text-xl font-black text-[#0084CC]">Your Private DAL Seaplane Hangar</Text>
        <Text tag="p" class="text-xs text-slate-400 font-mono mt-1 uppercase tracking-wider font-bold">
          PARKED & FUELED - READY TO WELCOME VISITORS
        </Text>
      </Box>
      <Box class="bg-[#FFFCEF] border border-[#E6DFC7] p-3.5 rounded-2xl max-w-xl mx-auto text-left flex gap-3">
        <Text tag="span" class="text-2xl">👷</Text>
        <Text tag="p" class="text-xs text-[#4A4A4A] leading-relaxed">
          <Text tag="strong">Wilbur:</Text> "Roger that! Seaplane engine oil looking steady, props balanced. All we need is your 5-digit Dodo Code™ and we'll connect your airport terminal gateway so other islanders can book tickets!"
        </Text>
      </Box>
      
      <Form onsubmit={handleHostFlight} class="max-w-xl mx-auto text-left space-y-4 border-t border-slate-100 pt-5 text-xs">
        {#if dalStore.formError}
          <Text tag="p" class="text-xs font-bold text-red-600 flex items-center gap-1 font-mono bg-red-50 p-2.5 rounded-xl border border-red-100">
            <AlertCircle class="w-4 h-4" /> {dalStore.formError}
          </Text>
        {/if}
        <Box class="grid grid-cols-2 gap-3">
          <Box>
            <Text tag="label" class="block text-[9px] font-mono font-black text-[#0084CC] mb-1 uppercase tracking-wider">HOST NAME</Text>
            <Input type="text" value={dalStore.passport.villagerName} class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-400 outline-none" disabled />
          </Box>
          <Box>
            <Text tag="label" class="block text-[9px] font-mono font-black text-[#0084CC] mb-1 uppercase tracking-wider">HOME ISLAND</Text>
            <Input type="text" value={dalStore.passport.islandName} class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-400 outline-none" disabled />
          </Box>
        </Box>
        <Box class="grid grid-cols-2 gap-3">
          <Box>
            <Text tag="label" class="block text-[9px] font-mono font-black text-[#0084CC] mb-1.5 uppercase tracking-wider">DODO CODE</Text>
            <Input type="text" bind:value={dalStore.formDodo} placeholder="e.g. D0D01" class="w-full bg-[#FAF8F2] border-[#0084CC]/30 border-2 rounded-xl px-3 py-2 text-xs font-mono font-black tracking-widest text-center uppercase outline-none focus:bg-white text-[#0084CC]" maxlength={5} required />
          </Box>
          <Box>
            <Text tag="label" class="block text-[9px] font-mono font-black text-[#0084CC] mb-1.5 uppercase tracking-wider">HEMISPHERE</Text>
            <Select bind:value={dalStore.formHemisphere} class="w-full bg-[#FAF8F2] border-[#0084CC]/30 border-2 rounded-xl px-3 py-2 font-bold outline-none focus:bg-white text-[#0084CC]">
              <option value="Northern">Northern</option>
              <option value="Southern">Southern</option>
            </Select>
          </Box>
        </Box>
        <Box>
          <Text tag="label" class="block text-[9px] font-mono font-black text-[#0084CC] mb-1.5 uppercase tracking-wider">GATE THEME CATEGORY</Text>
          <Box class="flex flex-col gap-2">
            {#each Object.entries(GATE_THEMES) as [numStr, theme]}
              {@const num = Number(numStr)}
              <Box class="flex items-start gap-2 bg-[#FAF8F2] p-2 border rounded-xl" onclick={() => dalStore.formGate = num} style={dalStore.formGate === num ? `border-color: ${theme.color}; background-color: ${theme.bg};` : 'border-color: #E6DFC7;'}>
                <input type="radio" checked={dalStore.formGate === num} class="mt-1" />
                <Box>
                  <Text tag="span" class="font-bold text-xs" style={dalStore.formGate === num ? `color: ${theme.color};` : 'color: #4A4A4A;'}>{theme.icon} {theme.name}</Text>
                  <Text tag="span" class="text-[10px] text-slate-500 block leading-normal">{theme.desc}</Text>
                </Box>
              </Box>
            {/each}
          </Box>
        </Box>
        <Box>
          <Text tag="label" class="block text-[9px] font-mono font-black text-[#0084CC] mb-1.5 uppercase tracking-wider">FLIGHT PLAN DESCRIPTION</Text>
          <Textarea bind:value={dalStore.formDesc} placeholder="e.g. Turnips buying for 450! Celeste is near the airport dock. Free DIY card swap on the beach." class="w-full bg-[#FAF8F2] border border-[#E6DFC7] rounded-xl px-3 py-2 font-semibold h-16 resize-none outline-none focus:bg-white focus:border-[#0084CC]" maxlength={180} />
        </Box>
        <Button type="submit" disabled={dalStore.isSubmittingHost} class="w-full bg-[#FFCC00] hover:bg-[#FFD11A] text-[#006094] font-system font-black py-3 rounded-2xl border-b-4 border-[#CC9900] shadow transition-all uppercase tracking-wide text-xs">
          {dalStore.isSubmittingHost ? 'Dispatching Hangar...' : '📡 OPEN MY AIRPORT GATE & CONNECT ONLINE'}
        </Button>
      </Form>
    </Box>
  {:else}
    <Box class="space-y-5">
      <Box class="bg-[#006094] text-white rounded-[32px] p-5 shadow border-b-4 border-[#FFCC00] relative overflow-hidden">
        <Box class="absolute right-0 top-0 opacity-10 text-9xl pointer-events-none select-none">🛩️</Box>
        <Box class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <Box>
            <Text tag="span" class="bg-[#FFCC00] text-[#006094] text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded-full font-mono uppercase">
              ACTIVE PILOT CONSOLE
            </Text>
            <Text tag="h2" class="text-2xl font-black font-system tracking-tight mt-1">
              Flight {myFlight.id} to '{myFlight.islandName}'
            </Text>
            <Text tag="p" class="text-xs text-sky-200 mt-0.5">
              Island host: <Text tag="strong">{myFlight.hostName}</Text> | Gate Theme: <Text tag="strong">{GATE_THEMES[myFlight.gate]?.name}</Text>
            </Text>
          </Box>
          <Box class="bg-black/20 border border-white/10 p-3 rounded-2xl text-center font-mono">
            <Text tag="span" class="block text-[8px] text-sky-200 font-bold uppercase">My Dodo Code</Text>
            <Text tag="span" class="text-2xl font-black text-[#FFCC00] tracking-widest leading-none mt-0.5 block uppercase">
              {myFlight.dodoCode}
            </Text>
          </Box>
        </Box>
      </Box>

      <Box class="grid grid-cols-1 md:grid-cols-12 gap-5">
        <Box class="md:col-span-7 space-y-4">
          <Box class="bg-white rounded-[32px] p-5 border-2 border-[#0084CC]/10 shadow-sm space-y-4">
            <Text tag="h3" class="font-system font-black text-xs text-[#0084CC] uppercase tracking-wide border-b border-slate-100 pb-2">
              🚦 Seaplane Runway Controllers
            </Text>
            <Box class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              {#each ['Scheduled', 'Boarding', 'Departed', 'Delayed'] as status}
                <Button
                  onclick={() => handleUpdateStatus(myFlight.id, status as FlightStatus)}
                  class={`py-2 rounded-xl font-mono font-black border transition-all text-[10px] ${
                    myFlight.status === status
                      ? 'bg-[#FFCC00] text-[#006094] border-2 border-[#0084CC] shadow scale-105'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-400'
                  }`}
                >
                  {status.toUpperCase()}
                </Button>
              {/each}
            </Box>
          </Box>

          <Box class="bg-white rounded-[32px] p-5 border-2 border-[#0084CC]/10 shadow-sm">
            <Box class="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <Text tag="h3" class="font-system font-black text-xs text-[#0084CC] uppercase tracking-wide">
                🎟️ Passenger Flight Manifest
              </Text>
              <Text tag="span" class="font-mono text-[10px] text-[#0084CC] font-bold">
                BOARDED: {myFlight.passengers.length} SEATS
              </Text>
            </Box>
            {#if myFlight.passengers.length === 0}
              <Box class="py-8 text-center font-mono text-slate-400 text-xs">
                No passengers have checked in at Gate {myFlight.gate} yet. Runways are clear!
              </Box>
            {:else}
              <Box class="space-y-2">
                {#each myFlight.passengers as p}
                  <Box class="flex items-center justify-between bg-[#FAF8F2] border border-[#E6DFC7]/50 p-2.5 rounded-2xl">
                    <Box class="flex items-center gap-2">
                      <Text tag="span" class="text-lg">👤</Text>
                      <Box class="text-xs">
                        <Text tag="span" class="font-system font-black text-slate-700">{p.name}</Text>
                        <Text tag="span" class="text-[9px] font-mono text-slate-400 block">from {p.island}</Text>
                      </Box>
                    </Box>
                    <Button
                      onclick={() => handleLeaveFlight(myFlight.id, p.id)}
                      class="bg-slate-200 hover:bg-slate-300 text-[#4A4A4A] font-mono text-[9px] font-black px-2 py-1 rounded-full border-b border-slate-400"
                    >
                      Return Home
                    </Button>
                  </Box>
                {/each}
              </Box>
            {/if}
          </Box>

          <Box class="bg-white rounded-[32px] p-5 border-2 border-[#0084CC]/10 shadow-sm space-y-4">
            <Box class="border-b border-slate-100 pb-2">
              <Text tag="h3" class="font-system font-black text-xs text-[#0084CC] uppercase tracking-wide">
                📢 Airport Loudspeaker Feed
              </Text>
            </Box>
            <Box class="bg-[#FAF8F2] p-3 rounded-2xl border border-[#E6DFC7]/50 text-xs text-slate-600 font-mono italic leading-relaxed">
              "{myFlight.announcement || 'Attention passengers! Hangar seaplane prepares for flight checklist.'}"
            </Box>
            {#if myFlight.review}
              <Box class="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200/50 p-4 rounded-[24px] space-y-2">
                <Text tag="h4" class="font-system font-black text-[#D35400] text-xs flex items-center gap-1">
                  <Sparkles class="w-4 h-4 text-amber-500 fill-amber-500" />
                  Orville's Official Island Travel Review
                </Text>
                <Text tag="p" class="text-slate-600 text-xs italic font-sans leading-relaxed">
                  "{myFlight.review}"
                </Text>
              </Box>
            {:else}
              <Box class="bg-[#A2D2FF]/10 border border-[#0084CC]/10 p-4 rounded-[24px] text-center">
                <Text tag="p" class="text-[11px] text-slate-500 mb-2 leading-relaxed">
                  Ask Orville to compile Wilbur's flight deck observations and publish an official Travel Review brochure!
                </Text>
                <Button
                  onclick={() => handleGenerateAIReview(myFlight.id)}
                  disabled={dalStore.loadingReviewId !== null}
                  class="btn-acnh btn-acnh-primary w-full text-xs"
                >
                  {#if dalStore.loadingReviewId === myFlight.id}
                    <RefreshCw class="w-3.5 h-3.5 animate-spin" />
                  {:else}
                    <Sparkles class="w-3.5 h-3.5 text-[#FFCC00] fill-[#FFCC00]" />
                  {/if}
                  Draft AI Travel Review Brochure
                </Button>
              </Box>
            {/if}
          </Box>
        </Box>

        <Box class="md:col-span-5 space-y-4">
          <Box class="bg-[#FFFCEF] rounded-[32px] border-4 border-[#FFEAA7] p-4 shadow-sm text-[#4A4A4A]">
            <Box class="flex items-center gap-2 border-b border-[#FFEAA7] pb-2 mb-3">
              <Text tag="span" class="text-xl">🦤</Text>
              <Box>
                <Text tag="h3" class="font-system font-black text-xs text-[#0084CC] uppercase leading-none">Smart Flight Matchmaker</Text>
                <Text tag="span" class="text-[8.5px] font-mono text-slate-400 font-bold uppercase mt-0.5 block">ORVILLE'S MATCH COUNTER</Text>
              </Box>
            </Box>
            
            {@const matches = dalStore.requests.filter(r => r.gateType === myFlight.gate)}
            {#if matches.length === 0}
              <Box class="text-center py-8 text-slate-400 font-mono text-xs space-y-2">
                <Compass class="w-8 h-8 text-slate-300 mx-auto animate-spin" />
                <Text tag="p" class="uppercase font-bold">Scanning Airwaves...</Text>
                <Text tag="p" class="text-[10px] leading-relaxed">No standby flyers are looking for Gate Category {myFlight.gate} at the moment. Keep radar active!</Text>
              </Box>
            {:else}
              <Box class="space-y-3">
                <Box class="bg-white/80 p-2.5 rounded-2xl border border-[#FFEAA7] text-xs text-[#4A4A4A]">
                  💡 <Text tag="strong">Orville:</Text> "Look! We have standby passengers looking to match your flight's category! Clear them for immediate boarding!"
                </Box>
                {#each matches as match}
                  <Box class="bg-white p-3 rounded-2xl border-2 border-[#0084CC]/20 shadow-xs space-y-2">
                    <Box class="flex items-start gap-2">
                      <Text tag="span" class="text-xl">{match.avatar}</Text>
                      <Box>
                        <Text tag="span" class="font-system font-black text-xs block text-slate-700">{match.name}</Text>
                        <Text tag="span" class="text-[9px] text-slate-400 font-mono leading-none">from {match.island}</Text>
                      </Box>
                    </Box>
                    <Text tag="p" class="text-[10.5px] text-slate-500 italic">"{match.memo}"</Text>
                    <Button
                      onclick={() => handleClearForTakeoff(match, myFlight.id)}
                      class="w-full bg-[#137333] hover:bg-[#0f5d29] text-white font-system font-black py-2 rounded-xl text-[10px] uppercase shadow flex items-center justify-center gap-1"
                    >
                      💚 Clear for Takeoff & Board
                    </Button>
                  </Box>
                {/each}
              </Box>
            {/if}
          </Box>

          <Button
            onclick={() => handleUpdateStatus(myFlight.id, 'Closed')}
            class="w-full bg-red-50 hover:bg-red-100 text-red-600 font-system font-black py-3 rounded-2xl shadow border border-red-200 text-xs text-center block"
          >
            ⛔ CLOSE GATE & ARCHIVE FLIGHT RUNWAY
          </Button>
        </Box>
      </Box>
    </Box>
  {/if}
</Box>
