<script lang="ts">
  import { Compass, Ticket, Plane, BookOpen, Eye, Users, Cloud } from '@lucide/svelte';
  import type { ChatterMessage, Passport, UserProfile } from '$lib/studio-types';
  import { playSound } from '$lib/utils/audio';
  import { dalStore } from '$lib/stores/dal.svelte';
  import { onMount, tick } from 'svelte';

  let {
    chatter,
    chatSender = $bindable(''),
    chatIsland = $bindable(''),
    chatText = $bindable(''),
    handlePostChat,
    isPostingChat = false,
    profiles,
    openProfileModal,
    setShowFuelModal,
    passport,
    isMuted = false
  } = $props<{
    chatter: ChatterMessage[];
    chatSender: string;
    chatIsland: string;
    chatText: string;
    handlePostChat: (e: SubmitEvent) => void;
    isPostingChat?: boolean;
    profiles: Record<string, UserProfile>;
    openProfileModal: (friendCode: string) => void;
    setShowFuelModal: (show: boolean) => void;
    passport: Passport;
    isMuted?: boolean;
  }>();

  let chatContainerRef: HTMLDivElement;

  $effect(() => {
    if (chatter && chatContainerRef) {
      chatContainerRef.scrollTop = chatContainerRef.scrollHeight;
    }
  });

  function getProfile(villagerName: string, islandName: string | undefined): UserProfile | undefined {
    return (Object.values(profiles) as UserProfile[]).find(
      prof => prof.villagerName.toLowerCase() === villagerName.toLowerCase() && 
              (islandName ? prof.islandName.toLowerCase() === islandName.toLowerCase() : true)
    );
  }
</script>

<div class="h-full flex flex-col">

  <!-- Terminal Tower Radio Chat Feed -->
  <div class="w-full flex flex-col h-full">
    
    <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 text-left">
      <div class="flex items-center gap-2">
        <span class="text-xl">📻</span>
        <div>
          <h2 class="text-base font-black text-[#0084CC] font-system font-bold">DAL Tower Radio</h2>
          <span class="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">RADIO OVER THE AIRWAVES</span>
        </div>
      </div>
      <span class="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full text-[8.5px] font-mono font-black uppercase font-bold">
        ACTIVE
      </span>
    </div>

    <!-- Chat feed box -->
    <div bind:this={chatContainerRef} class="flex-1 overflow-y-auto mb-4 pr-1 text-left custom-scrollbar space-y-3.5">
      {#each chatter as msg (msg.id)}
        {@const isOrville = msg.type === 'orville'}
        {@const isWilbur = msg.type === 'wilbur'}
        {@const isSystem = msg.type === 'system'}

        {#if isSystem}
          <div class="text-[10px] text-slate-500 bg-[#FAF8F2] border border-[#E6DFC7]/50 p-2 rounded-xl text-center font-mono font-bold leading-normal">
            {msg.text}
          </div>
        {:else if isOrville || isWilbur}
          <div class="flex gap-2.5 items-start">
            <div class="w-8 h-8 rounded-full bg-[#EBF8FF] border border-[#0084CC]/20 flex-shrink-0 flex items-center justify-center text-lg shadow-xs">
              {isOrville ? '🦤' : '🕶️'}
            </div>
            <div class="flex-1 bg-[#F0F9FF] border-2 border-[#0084CC]/20 rounded-2xl p-2.5 text-xs text-[#4A4A4A]">
              <span class="font-system font-black text-[#0084CC] text-[10px] block mb-0.5 font-bold">
                {msg.sender}
              </span>
              <p class="font-sans font-semibold leading-relaxed text-left">{msg.text}</p>
            </div>
          </div>
        {:else}
          <div class="flex gap-2.5 items-start">
            <div class="w-8 h-8 rounded-full bg-[#FFF9E7] border border-[#FFCC00] text-[#006094] flex-shrink-0 flex items-center justify-center text-xs font-black shadow-xs font-bold">
              {msg.sender.substring(0, 2).toUpperCase()}
            </div>
            <div class="flex-1 bg-white border-2 border-slate-100 rounded-2xl p-2.5 text-xs text-[#4A4A4A]">
              <span class="font-system font-black text-[#0084CC] text-[10px] block mb-0.5">
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <span 
                  onclick={() => {
                    const p = getProfile(msg.sender, msg.island);
                    if (p) {
                      openProfileModal(p.friendCode);
                    } else {
                      openProfileModal(`SW-TEMP-${msg.sender}-${msg.island || 'Home'}`);
                    }
                  }}
                  class="hover:underline cursor-pointer font-black text-[#0084CC] font-bold"
                  title="View chat user profile"
                >
                  {msg.sender}
                </span>
                {#if msg.island}
                  <span class="text-slate-400 font-mono text-[8.5px] font-bold"> from '{msg.island}'</span>
                {/if}
                {#if getProfile(msg.sender, msg.island)}
                  {@const p = getProfile(msg.sender, msg.island)}
                  <span class="inline-flex items-center gap-0.5 text-[8px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full px-1.5 py-0.1 font-black ml-1.5 font-bold">
                    🍏 {p?.goodApples || 0}
                    {#if p && p.rottenTurnips > 0}
                      <span class="text-rose-700 font-bold">|🧅 {p.rottenTurnips}</span>
                    {/if}
                  </span>
                {/if}
              </span>
              <p class="font-sans leading-relaxed text-left font-semibold">{msg.text}</p>
            </div>
          </div>
        {/if}
      {/each}
    </div>

    <!-- Chat Input form -->
    <form onsubmit={handlePostChat} class="border-t border-slate-100 pt-4 text-xs space-y-3 text-left">
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label for="villager-callsign" class="block text-[8px] uppercase font-mono font-black text-[#0084CC] mb-0.5 font-bold">VILLAGER CALLSIGN</label>
          <input
            id="villager-callsign"
            type="text"
            bind:value={chatSender}
            placeholder="Your Name"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold outline-none"
            maxlength="14"
          />
        </div>
        <div>
          <label for="island-id" class="block text-[8px] uppercase font-mono font-black text-[#0084CC] mb-0.5 font-bold">ISLAND ID</label>
          <input
            id="island-id"
            type="text"
            bind:value={chatIsland}
            placeholder="Island Name"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold outline-none"
            maxlength="14"
          />
        </div>
      </div>

      <div class="flex gap-2">
        <input
          type="text"
          bind:value={chatText}
          placeholder={chatSender ? "Submit airport chatter dispatch..." : "Register name above to chat"}
          disabled={!chatSender.trim()}
          class="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:bg-white"
          maxlength="100"
        />
        <button
          type="submit"
          disabled={!chatSender.trim() || !chatText.trim() || isPostingChat}
          class="bg-[#0084CC] hover:bg-[#006094] disabled:opacity-40 text-white px-4.5 rounded-xl font-system font-black uppercase text-xs flex items-center justify-center flex-shrink-0 cursor-pointer font-bold border-none"
        >
          Send
        </button>
      </div>
    </form>

  </div>
</div>
