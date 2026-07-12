<script lang="ts">
  import { Compass, Ticket, Plane, BookOpen, Eye, Users, Cloud } from '@lucide/svelte';
  import type { ChatterMessage, Passport, UserProfile } from '$lib/studio-types';
  import { playSound } from '$lib/utils/audio';
  import { dalStore } from '$lib/stores/dal.svelte';
  import { onMount, tick } from 'svelte';

  let {
    totalStandby,
    totalPassengers,
    totalPilots,
    totalPassports,
    views,
    visitors,
    chatter,
    chatSender = $bindable(''),
    chatIsland = $bindable(''),
    chatText = $bindable(''),
    handlePostChat,
    isPostingChat = false,
    profiles,
    openProfileModal,
    setCurrentTab,
    setShowPassportDrawer,
    setIsEditingPassport,
    setShowFuelModal,
    passport,
    isMuted = false
  } = $props<{
    totalStandby: number;
    totalPassengers: number;
    totalPilots: number;
    totalPassports: number;
    views: number;
    visitors: number;
    chatter: ChatterMessage[];
    chatSender: string;
    chatIsland: string;
    chatText: string;
    handlePostChat: (e: SubmitEvent) => void;
    isPostingChat?: boolean;
    profiles: Record<string, UserProfile>;
    openProfileModal: (friendCode: string) => void;
    setCurrentTab: (tab: 'book' | 'hub' | 'radio') => void;
    setShowPassportDrawer: (show: boolean) => void;
    setIsEditingPassport: (show: boolean) => void;
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

<div class="space-y-5">
  <!-- DODO FLIGHT RADAR & TRAFFIC CONTROL BOARD -->
  <div id="dal-traffic-control-panel" class="w-full bg-white border-2 border-[#E6DFC7] rounded-[32px] p-4 lg:p-5 shadow-xs flex flex-col gap-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-dashed border-[#E6DFC7] pb-3 text-left">
      <div>
        <h2 class="font-system font-black text-sm text-[#0084CC] tracking-wide flex items-center gap-1.5 uppercase font-bold">
          <span class="animate-pulse">📡</span> DAL Traffic Control & Radar Center
        </h2>
        <p class="text-[10px] text-slate-500 font-mono">
          Real-time network telemetries for all active islanders, hosts, and travelers.
        </p>
      </div>
      <div class="flex items-center gap-1.5 self-start sm:self-center">
        <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span class="text-[9px] font-mono font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 font-bold">
          Lounge Radar Live
        </span>
      </div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 text-left">
      <!-- Stat 1: Standby Queue -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div 
        id="stat-standbys"
        onclick={() => {
          playSound('beep', isMuted);
          setCurrentTab('book');
          setTimeout(() => {
            const element = document.getElementById('standby-lounge-section');
            if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 150);
        }}
        class="bg-sky-50/50 hover:bg-sky-50 border-2 border-sky-100 hover:border-sky-300 rounded-2xl p-3.5 transition-all cursor-pointer group shadow-xs relative overflow-hidden"
        title="Click to view standby lounge passengers"
      >
        <div class="absolute right-2 top-2 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
          <Compass class="w-12 h-12 text-sky-500" />
        </div>
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xl">🛋️</span>
          <span class="font-system font-black text-[11px] text-sky-800 uppercase tracking-wide font-bold">
            Standby
          </span>
        </div>
        <div class="flex items-baseline gap-1.5">
          <span class="font-mono font-black text-2xl text-sky-900 leading-none font-bold">
            {totalStandby}
          </span>
          <span class="text-[9px] font-mono text-sky-600 font-bold uppercase">
            Queue
          </span>
        </div>
        <p class="text-[9.5px] text-slate-500 leading-snug mt-1 font-sans font-semibold">
          Active travelers waiting on the standby list.
        </p>
      </div>

      <!-- Stat 2: Checked-In Passengers -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div 
        id="stat-passengers"
        onclick={() => {
          playSound('beep', isMuted);
          setCurrentTab('book');
          setTimeout(() => {
            const element = document.getElementById('active-departures-section');
            if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 150);
        }}
        class="bg-amber-50/40 hover:bg-amber-50 border-2 border-amber-100 hover:border-amber-300 rounded-2xl p-3.5 transition-all cursor-pointer group shadow-xs relative overflow-hidden"
        title="Click to view active flight departures"
      >
        <div class="absolute right-2 top-2 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
          {#if dalStore.systemMode === 'DAL'}
            <Ticket class="w-12 h-12 text-amber-500" />
          {:else}
            <Cloud class="w-12 h-12 text-amber-500" />
          {/if}
        </div>
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xl">🎟️</span>
          <span class="font-system font-black text-[11px] text-amber-800 uppercase tracking-wide font-bold">
            {dalStore.systemMode === 'DAL' ? 'Passengers' : 'Dreamers'}
          </span>
        </div>
        <div class="flex items-baseline gap-1.5">
          <span class="font-mono font-black text-2xl text-amber-900 leading-none font-bold">
            {totalPassengers}
          </span>
          <span class="text-[9px] font-mono text-amber-600 font-bold uppercase">
            {dalStore.systemMode === 'DAL' ? 'Boarded' : 'Dreaming'}
          </span>
        </div>
        <p class="text-[9.5px] text-slate-500 leading-snug mt-1 font-sans font-semibold">
          {dalStore.systemMode === 'DAL' ? 'Seaplane passengers boarded on active flights.' : 'Dreamers currently exploring active dreams.'}
        </p>
      </div>

      <!-- Stat 3: Pilots (Hosts) -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div 
        id="stat-pilots"
        onclick={() => {
          playSound('beep', isMuted);
          setCurrentTab('hub');
        }}
        class="bg-emerald-50/40 hover:bg-emerald-50 border-2 border-emerald-100 hover:border-emerald-300 rounded-2xl p-3.5 transition-all cursor-pointer group shadow-xs relative overflow-hidden"
        title="Click to manage or host flight plans"
      >
        <div class="absolute right-2 top-2 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
          {#if dalStore.systemMode === 'DAL'}
            <Plane class="w-12 h-12 text-emerald-500" />
          {:else}
            <Cloud class="w-12 h-12 text-emerald-500" />
          {/if}
        </div>
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xl">{dalStore.systemMode === 'DAL' ? '👨‍✈️' : '🔮'}</span>
          <span class="font-system font-black text-[11px] text-emerald-800 uppercase tracking-wide font-bold">
            {dalStore.systemMode === 'DAL' ? 'Pilots' : 'Hosts'}
          </span>
        </div>
        <div class="flex items-baseline gap-1.5">
          <span class="font-mono font-black text-2xl text-emerald-900 leading-none font-bold">
            {totalPilots}
          </span>
          <span class="text-[9px] font-mono text-emerald-600 font-bold uppercase">
            Hosts
          </span>
        </div>
        <p class="text-[9.5px] text-slate-500 leading-snug mt-1 font-sans font-semibold">
          {dalStore.systemMode === 'DAL' ? 'Islanders hosting active flight plans right now.' : 'Islanders sharing their dreams right now.'}
        </p>
      </div>

      <!-- Stat 4: Registered Passports -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div 
        id="stat-passports"
        onclick={() => {
          playSound('beep', isMuted);
          if (passport.hasCreated) {
            setShowPassportDrawer(true);
          } else {
            setIsEditingPassport(true);
          }
        }}
        class="bg-[#FFFCEF]/50 hover:bg-[#FFFCEF] border-2 border-[#E6DFC7] hover:border-amber-400 rounded-2xl p-3.5 transition-all cursor-pointer group shadow-xs relative overflow-hidden"
        title="Click to view or edit your flyer passport"
      >
        <div class="absolute right-2 top-2 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
          <BookOpen class="w-12 h-12 text-amber-600" />
        </div>
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xl">📖</span>
          <span class="font-system font-black text-[11px] text-amber-900 uppercase tracking-wide font-bold">
            Passports
          </span>
        </div>
        <div class="flex items-baseline gap-1.5">
          <span class="font-mono font-black text-2xl text-amber-950 leading-none font-bold">
            {totalPassports}
          </span>
          <span class="text-[9px] font-mono text-amber-700 font-bold uppercase">
            Printed
          </span>
        </div>
        <p class="text-[9.5px] text-slate-500 leading-snug mt-1 font-sans font-semibold">
          Islanders printed in our Dodo passport registry.
        </p>
      </div>

      <!-- Stat 5: Page Views -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div 
        id="stat-views"
        onclick={() => {
          playSound('beep', isMuted);
        }}
        class="bg-rose-50/40 hover:bg-rose-50 border-2 border-rose-100 hover:border-rose-300 rounded-2xl p-3.5 transition-all cursor-pointer group shadow-xs relative overflow-hidden"
        title="Total airport terminal page views"
      >
        <div class="absolute right-2 top-2 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
          <Eye class="w-12 h-12 text-rose-500" />
        </div>
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xl">👀</span>
          <span class="font-system font-black text-[11px] text-rose-800 uppercase tracking-wide font-bold">
            Views
          </span>
        </div>
        <div class="flex items-baseline gap-1.5">
          <span class="font-mono font-black text-2xl text-rose-900 leading-none font-bold">
            {views}
          </span>
          <span class="text-[9px] font-mono text-rose-600 font-bold uppercase">
            Loads
          </span>
        </div>
        <p class="text-[9.5px] text-slate-500 leading-snug mt-1 font-sans font-semibold">
          Total airport terminal page loads recorded.
        </p>
      </div>

      <!-- Stat 6: Unique Visitors -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div 
        id="stat-visitors"
        onclick={() => {
          playSound('beep', isMuted);
        }}
        class="bg-violet-50/40 hover:bg-violet-50 border-2 border-violet-100 hover:border-violet-300 rounded-2xl p-3.5 transition-all cursor-pointer group shadow-xs relative overflow-hidden"
        title="Unique visitor devices"
      >
        <div class="absolute right-2 top-2 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
          <Users class="w-12 h-12 text-violet-500" />
        </div>
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xl">👥</span>
          <span class="font-system font-black text-[11px] text-violet-800 uppercase tracking-wide font-bold">
            Visitors
          </span>
        </div>
        <div class="flex items-baseline gap-1.5">
          <span class="font-mono font-black text-2xl text-violet-900 leading-none font-bold">
            {visitors}
          </span>
          <span class="text-[9px] font-mono text-violet-600 font-bold uppercase">
            Flyers
          </span>
        </div>
        <p class="text-[9.5px] text-slate-500 leading-snug mt-1 font-sans font-semibold">
          Unique traveler devices connected to terminal.
        </p>
      </div>
    </div>
  </div>

  <!-- Terminal Tower Radio Chat Feed -->
  <div class="max-w-xl mx-auto bg-white rounded-[36px] border-4 border-[#0084CC]/10 p-5 shadow-sm flex flex-col">
    
    <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 text-left">
      <div class="flex items-center gap-2">
        <span class="text-xl">📻</span>
        <div>
          <h2 class="text-base font-black text-[#0084CC] font-system font-bold">DAL Terminal Tower Radio</h2>
          <span class="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">RADIO OVER THE AIRWAVES</span>
        </div>
      </div>
      <span class="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full text-[8.5px] font-mono font-black uppercase font-bold">
        ACTIVE
      </span>
    </div>

    <!-- Chat feed box -->
    <div bind:this={chatContainerRef} class="space-y-3.5 max-h-[380px] overflow-y-auto mb-4 pr-1 text-left">
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
          class="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:bg-white"
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
