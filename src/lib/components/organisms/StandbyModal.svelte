<script lang="ts">
  import { scale } from 'svelte/transition';
  import { X, AlertCircle } from '@lucide/svelte';
  import Box from '../atoms/Box.atom.svelte';
  import Text from '../atoms/Text.atom.svelte';
  import Button from '../atoms/Button.atom.svelte';
  import Select from '../atoms/Select.atom.svelte';
  import Textarea from '../atoms/Textarea.atom.svelte';
  import Form from '../atoms/Form.atom.svelte';
  import { dalStore } from '$lib/stores/dal.svelte';
  import { GATE_THEMES, DREAM_THEMES } from '$lib/types';

  async function handleCreateStandbyRequest(e: Event) {
    e.preventDefault();
    dalStore.requestError = '';

    if (!dalStore.passport.hasCreated) {
      dalStore.requestError = 'Please save your Frequent Flyer Passport first!';
      dalStore.playSound('beep');
      return;
    }

    dalStore.isSubmittingRequest = true;
    try {
      const res = await fetch('/wp-json/dodo-air/v1/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: dalStore.passport.villagerName,
          island: dalStore.passport.islandName,
          title: `${dalStore.passport.titlePart1} ${dalStore.passport.titlePart2}`,
          avatar: dalStore.passport.avatarIcon,
          friendCode: dalStore.passport.friendCode,
          gateType: Number(dalStore.requestGateType),
          timePreference: dalStore.requestTime,
          memo: dalStore.requestMemo.trim() || 'Looking for an open island gate to visit! 🌴'
        })
      });

      if (res.ok) {
        dalStore.playSound('success');
        dalStore.requestMemo = '';
        dalStore.showStandbyModal = false;
        dalStore.fetchState();
        dalStore.earnStampProgress('hasRequested');
      } else {
        const data = await res.json();
        dalStore.requestError = data.error || 'Failed to file standby ticket.';
        dalStore.playSound('beep');
      }
    } catch (err) {
      dalStore.requestError = 'Connection error. Could not register standby.';
      dalStore.playSound('beep');
    } finally {
      dalStore.isSubmittingRequest = false;
    }
  }
</script>

{#if dalStore.showStandbyModal}
  <Box class="fixed inset-0 bg-[#006094]/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
    <Box transition={scale} class="bg-white rounded-[32px] border-4 border-[#0084CC] max-w-md w-full p-6 shadow-2xl relative text-[#4A4A4A]">
      <Box class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <Box>
          <Text tag="h3" class="font-system font-black text-base text-[#0084CC]">File Standby Flight Ticket</Text>
          <Text tag="span" class="text-xs font-system font-bold text-slate-400 block uppercase">DODO AIRLINES STANDBY REGISTRY</Text>
        </Box>
        <Button onclick={() => dalStore.showStandbyModal = false} class="p-1 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200">
          <X class="w-4 h-4" />
        </Button>
      </Box>

      <Form onsubmit={handleCreateStandbyRequest} class="space-y-4 text-xs">
        {#if dalStore.requestError}
          <Text tag="p" class="text-xs font-bold text-red-600 flex items-center gap-1 font-system">
            <AlertCircle class="w-4 h-4" /> {dalStore.requestError}
          </Text>
        {/if}

        <Box>
          <Text tag="label" class="block text-xs font-system font-black text-[#0084CC] mb-1 uppercase">DESIRED GATE THEME / PURPOSE</Text>
          <Select bind:value={dalStore.requestGateType} class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold outline-none">
            {#each Object.entries(dalStore.systemMode === 'DAL' ? GATE_THEMES : DREAM_THEMES) as [num, theme_val]}
              {@const theme = theme_val as any}
              <option value={num}>
                {theme.icon} {theme.name} ({theme.tag})
              </option>
            {/each}
          </Select>
        </Box>

        <Box>
          <Text tag="label" class="block text-xs font-system font-black text-[#0084CC] mb-1 uppercase">TIME PREFERENCE</Text>
          <Select bind:value={dalStore.requestTime} class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold outline-none">
            <option value="Online Now">⏱️ Online Right Now</option>
            <option value="In 10 Mins">⏱️ Flying in 10 Minutes</option>
            <option value="Stargazing Tonight">⏱️ Stargazing / Night Flights</option>
            <option value="Flexible">⏱️ Flexible / Cozy Travel</option>
          </Select>
        </Box>

        <Box>
          <Text tag="label" class="block text-xs font-system font-black text-[#0084CC] mb-1 uppercase">CUSTOM MEMO / SEEKING DETAILS</Text>
          <Textarea bind:value={dalStore.requestMemo} placeholder="e.g. Looking to swap DIYs, or sell turnips over 300 bells. Will tip gold nugget! 💰" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold h-20 resize-none outline-none focus:bg-white" maxlength={140} />
        </Box>

        <Button type="submit" disabled={dalStore.isSubmittingRequest} class="w-full bg-[#FFCC00] hover:bg-[#FFD11A] text-[#006094] font-system font-black py-3 rounded-2xl border-b-4 border-[#CC9900] shadow transition-all uppercase tracking-wide text-xs">
          📡 SUBMIT STANDBY TICKET & ENTER RADAR
        </Button>
      </Form>
    </Box>
  </Box>
{/if}
