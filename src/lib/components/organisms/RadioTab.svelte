<script lang="ts">
  import { fade, slide } from 'svelte/transition';
  import { Plane, Compass, Ticket, Radio, BookOpen, ChevronRight, X, AlertCircle } from '@lucide/svelte';
  import Box from '../atoms/Box.atom.svelte';
  import Text from '../atoms/Text.atom.svelte';
  import Button from '../atoms/Button.atom.svelte';
  import Input from '../atoms/Input.atom.svelte';
  import Form from '../atoms/Form.atom.svelte';
  import { dalStore } from '$lib/stores/dal.svelte';
  import { GATE_THEMES } from '$lib/types';
  import type { StandbyRequest } from '$lib/types';

  async function handlePostChat(e: Event) {
    e.preventDefault();
    if (!dalStore.chatSender.trim() || !dalStore.chatText.trim()) {
      dalStore.playSound('beep');
      return;
    }

    dalStore.isPostingChat = true;
    try {
      const res = await fetch('/wp-json/dodo-air/v1/chatter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: dalStore.chatSender.trim(),
          island: dalStore.chatIsland.trim() || undefined,
          text: dalStore.chatText.trim()
        })
      });

      if (res.ok) {
        dalStore.playSound('chatter');
        dalStore.chatText = '';
        dalStore.fetchState();
        dalStore.earnStampProgress('hasChatted');
      }
    } catch (err) {
      console.error(err);
    } finally {
      dalStore.isPostingChat = false;
    }
  }
</script>

<Box class="max-w-xl mx-auto bg-white rounded-[36px] border-4 border-[#0084CC]/10 p-5 shadow-sm flex flex-col">
  <Box class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
    <Box class="flex items-center gap-2">
      <Text tag="span" class="text-xl">📻</Text>
      <Box>
        <Text tag="h2" class="text-base font-black text-[#0084CC] font-system">DAL Terminal Tower Radio</Text>
        <Text tag="span" class="text-xs font-system font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">RADIO OVER THE AIRWAVES</Text>
      </Box>
    </Box>
    <Text tag="span" class="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full text-xs font-system font-black uppercase">
      ACTIVE
    </Text>
  </Box>

  <Box class="space-y-3.5 max-h-[380px] overflow-y-auto mb-4 pr-1 flex flex-col">
    {#each dalStore.chatter as msg}
      {#if msg.type === 'system'}
        <Box class="text-sm text-slate-500 bg-[#FAF8F2] border border-[#E6DFC7]/50 p-2 rounded-xl text-center font-system">
          {msg.text}
        </Box>
      {:else if msg.type === 'orville' || msg.type === 'wilbur'}
        <Box class="flex gap-2.5 items-start">
          <Box class="w-8 h-8 rounded-full bg-[#EBF8FF] border border-[#0084CC]/20 flex-shrink-0 flex items-center justify-center text-lg shadow-xs">
            {msg.type === 'orville' ? '🦤' : '🕶️'}
          </Box>
          <Box class="flex-1 bg-[#F0F9FF] border-2 border-[#0084CC]/20 rounded-2xl p-2.5 text-xs text-[#4A4A4A]">
            <Text tag="span" class="font-system font-black text-[#0084CC] text-sm block mb-0.5">
              {msg.sender}
            </Text>
            <Text tag="p" class="font-sans font-semibold leading-relaxed">{msg.text}</Text>
          </Box>
        </Box>
      {:else}
        <Box class="flex gap-2.5 items-start">
          <Box class="w-8 h-8 rounded-full bg-[#FFF9E7] border border-[#FFCC00] text-[#006094] flex-shrink-0 flex items-center justify-center text-xs font-black shadow-xs">
            {msg.sender.substring(0, 2).toUpperCase()}
          </Box>
          <Box class="flex-1 bg-white border-2 border-slate-100 rounded-2xl p-2.5 text-xs text-[#4A4A4A]">
            <Text tag="span" class="font-system font-black text-[#0084CC] text-sm block mb-0.5">
              {msg.sender} {#if msg.island}<Text tag="span" class="text-slate-400 font-system text-xs font-bold">from '{msg.island}'</Text>{/if}
            </Text>
            <Text tag="p" class="font-sans leading-relaxed">{msg.text}</Text>
          </Box>
        </Box>
      {/if}
    {/each}
  </Box>

  <Form onsubmit={handlePostChat} class="border-t border-slate-100 pt-4 text-xs space-y-3">
    <Box class="grid grid-cols-2 gap-2">
      <Box>
        <Text tag="label" class="block text-xs uppercase font-system font-black text-[#0084CC] mb-0.5">VILLAGER CALLSIGN</Text>
        <Input
          type="text"
          bind:value={dalStore.chatSender}
          placeholder="Your Name"
          class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold outline-none"
          maxlength={14}
        />
      </Box>
      <Box>
        <Text tag="label" class="block text-xs uppercase font-system font-black text-[#0084CC] mb-0.5">ISLAND ID</Text>
        <Input
          type="text"
          bind:value={dalStore.chatIsland}
          placeholder="Island Name"
          class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold outline-none"
          maxlength={14}
        />
      </Box>
    </Box>

    <Box class="flex gap-2">
      <Input
        type="text"
        bind:value={dalStore.chatText}
        placeholder={dalStore.chatSender ? "Submit airport chatter dispatch..." : "Register name above to chat"}
        disabled={!dalStore.chatSender.trim()}
        class="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:bg-white"
        maxlength={100}
      />
      <Button
        type="submit"
        disabled={!dalStore.chatSender.trim() || !dalStore.chatText.trim() || dalStore.isPostingChat}
        class="bg-[#0084CC] hover:bg-[#006094] disabled:opacity-40 text-white px-4.5 rounded-xl font-system font-black uppercase text-xs flex items-center justify-center flex-shrink-0"
      >
        Send
      </Button>
    </Box>
  </Form>
</Box>
