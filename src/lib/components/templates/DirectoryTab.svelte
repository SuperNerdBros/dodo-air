<script lang="ts">
  import { onMount } from 'svelte';
  import { Search, SlidersHorizontal } from '@lucide/svelte';
  import type { UserProfile, Passport } from '$lib/studio-types';
  import { playSound } from '$lib/utils/audio';
  import { PASSPORT_COLORS } from '$lib/utils/constants';
  import { scale, fade } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { DIALOGS } from '$lib/constants/dialogs';
  import AcnhBubble from '$lib/components/molecules/AcnhBubble.svelte';

  let {
    profiles,
    openProfileModal,
    passport,
    isMuted = false,
    isActive = false
  } = $props<{
    profiles: Record<string, UserProfile>;
    openProfileModal: (friendCode: string) => void;
    passport: Passport;
    isMuted?: boolean;
    isActive?: boolean;
  }>();

  type SortOption = 'recent' | 'name' | 'apples';
  
  let searchQuery = $state('');
  let sortBy = $state<SortOption>('recent');

  let profilesList = $derived(Object.values(profiles) as UserProfile[]);

  let filteredProfiles = $derived(profilesList.filter((p) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      p.villagerName.toLowerCase().includes(query) ||
      p.islandName.toLowerCase().includes(query) ||
      p.friendCode.toLowerCase().includes(query) ||
      p.title.toLowerCase().includes(query) ||
      p.signature.toLowerCase().includes(query)
    );
  }));

  let sortedProfiles = $derived([...filteredProfiles].sort((a, b) => {
    if (sortBy === 'name') {
      return (a.villagerName || '').localeCompare(b.villagerName || '');
    }
    const aTime = a.updatedAt || '';
    const bTime = b.updatedAt || '';
    if (sortBy === 'apples') {
      const applesA = a.goodApples || 0;
      const applesB = b.goodApples || 0;
      if (applesB !== applesA) {
        return applesB - applesA;
      }
      return bTime.localeCompare(aTime);
    }
    return bTime.localeCompare(aTime);
  }));

  onMount(() => {
    const renderTime = performance.now();
    console.log(`[Diagnostic] DirectoryTab mounted and rendered at ${renderTime.toFixed(2)}ms`);
  });
</script>

<div class="space-y-5 text-left pt-5">
  {#if isActive}
    <AcnhBubble 
      title="Orville"
      dialogText={DIALOGS.directoryTab.active}
    />
  {/if}
  <!-- Directory Title Board -->
  <div class="bg-white rounded-3xl border-2 border-[#0084CC]/10 p-4 lg:p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center text-xl shadow-inner text-[#0084CC]">
        📇
      </div>
      <div>
        <h2 class="text-base font-system font-black tracking-wider text-[#0084CC] uppercase leading-none">
          DAL Registered Flyers Directory
        </h2>
        <span class="text-xs font-system text-slate-400 font-bold uppercase tracking-widest mt-1 block">
          Discover and vouch for verified islanders in the lounge
        </span>
      </div>
    </div>

    <div class="flex items-center gap-2 font-system text-sm text-slate-500">
      <span class="bg-sky-50 text-[#0084CC] px-3 py-1 rounded-full font-bold border border-sky-100 uppercase">
        {profilesList.length} total registered {profilesList.length === 1 ? 'flyer' : 'flyers'}
      </span>
    </div>
  </div>

  <!-- Search and Filters panel -->
  <div class="bg-white rounded-3xl border-2 border-[#E6DFC7] p-4 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center">
    <!-- Search input field -->
    <div class="relative flex-1">
      <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <Search class="w-4 h-4 text-slate-400" />
      </span>
      <input
        id="directory-search-input"
        type="text"
        placeholder="Search by name, island, friend code, or custom title..."
        bind:value={searchQuery}
        class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50/70 border border-slate-200 text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0084CC]/20 focus:border-[#0084CC] transition-all"
      />
    </div>

    <!-- Sort option toggles -->
    <div class="flex items-center gap-2 self-start md:self-center shrink-0">
      <span class="text-sm font-system font-black text-slate-400 flex items-center gap-1 uppercase">
        <SlidersHorizontal class="w-3 h-3" /> Sort:
      </span>

      <div class="flex gap-1 bg-slate-100 p-0.5 rounded-xl">
        <button
          onclick={() => { playSound('beep', isMuted); sortBy = 'recent'; }}
          class="px-3 py-1.5 rounded-lg text-sm font-bold tracking-wide transition-all border-none cursor-pointer {sortBy === 'recent' ? 'bg-[#0084CC] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/50'}"
        >
          Recent Updates
        </button>
        <button
          onclick={() => { playSound('beep', isMuted); sortBy = 'name'; }}
          class="px-3 py-1.5 rounded-lg text-sm font-bold tracking-wide transition-all border-none cursor-pointer {sortBy === 'name' ? 'bg-[#0084CC] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/50'}"
        >
          Alphabetical
        </button>
        <button
          onclick={() => { playSound('beep', isMuted); sortBy = 'apples'; }}
          class="px-3 py-1.5 rounded-lg text-sm font-bold tracking-wide transition-all border-none cursor-pointer {sortBy === 'apples' ? 'bg-[#0084CC] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/50'}"
        >
          🍎 Vouches
        </button>
      </div>
    </div>
  </div>

  <!-- Directory Grid -->
  {#if sortedProfiles.length > 0}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {#each sortedProfiles as p (p.friendCode)}
        {@const activeColor = PASSPORT_COLORS[p.colorIndex || 0] || PASSPORT_COLORS[1]}
        {@const isMe = passport.friendCode && p.friendCode === passport.friendCode}
        
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          onclick={() => openProfileModal(p.friendCode)}
          class="relative flex flex-col justify-between bg-[#FFFCEF] rounded-[32px] border-4 border-[#E6DFC7] p-5 shadow-sm hover:shadow-md cursor-pointer hover:scale-[1.02] transition-all overflow-hidden {isMe ? 'ring-4 ring-[#FFCC00] ring-offset-2' : ''}"
        >
          <!-- Me sticker badge -->
          {#if isMe}
            <span class="absolute -right-12 top-4 rotate-45 bg-[#FFCC00] text-[#006094] text-xs font-system font-black py-1 px-12 tracking-wider shadow-sm uppercase font-bold text-center z-10">
              You
            </span>
          {/if}

          <div class="space-y-4">
            <!-- Visual Stamp Card -->
            <div class="flex gap-3">
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-[#E6DFC7]/10 shrink-0 {activeColor.bg}">
                {p.avatarIcon || '🦤'}
              </div>
              <div class="space-y-0.5 flex-1 min-w-0">
                <span class="bg-sky-100 text-sky-800 text-xs font-system font-bold px-1.5 py-0.5 rounded-full uppercase leading-none border border-sky-200">
                  Verified Flyer
                </span>
                <h3 class="font-system font-black text-sm text-slate-800 leading-tight truncate mt-1 font-bold">
                  {p.villagerName}
                </h3>
                <p class="text-sm font-bold text-[#0084CC] truncate">
                  🏝️ {p.islandName}
                </p>
              </div>
            </div>

            <!-- Passport Title -->
            <div class="space-y-1">
              <span class="block text-xs font-system text-[#85806B] uppercase leading-none">PASSPORT TITLE</span>
              <span class="inline-block bg-[#F5F2E6] border border-[#E6DFC7] rounded-sm px-1.5 py-0.5 text-xs font-system font-bold text-[#80765A] uppercase truncate max-w-full">
                {p.title || 'Freshly Picked Islander'}
              </span>
            </div>

            <!-- Friend Code -->
            <div class="space-y-1">
              <span class="block text-xs font-system text-[#85806B] uppercase leading-none">FRIEND CODE</span>
              <span class="font-system font-bold text-slate-500 text-sm block">
                {p.friendCode}
              </span>
            </div>

            <!-- Signature -->
            {#if p.signature}
              <div class="bg-white/65 border border-[#E6DFC7]/40 p-2.5 rounded-xl text-sm italic text-slate-500 min-h-[44px] flex items-center">
                "{p.signature}"
              </div>
            {/if}
          </div>

          <!-- Rating / Vouch stats & CTA button -->
          <div class="mt-4 pt-3.5 border-t border-dashed border-[#E6DFC7] flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 text-sm font-system font-black font-bold">
              <span class="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-2 py-0.5 flex items-center gap-1">
                🍏 {p.goodApples || 0}
              </span>
              <span class="bg-rose-50 text-rose-700 border border-rose-100 rounded-full px-2 py-0.5 flex items-center gap-1">
                🧅 {p.rottenTurnips || 0}
              </span>
            </div>

            <span class="btn-acnh btn-acnh-primary ">
              View Profile
            </span>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div
      in:fade={{ duration: 200 }}
      class="bg-white rounded-[32px] border-2 border-dashed border-[#E6DFC7] p-12 text-center"
    >
      <div class="text-4xl">📇</div>
      <h3 class="font-system font-black text-sm text-slate-700 uppercase tracking-wider mt-3 font-bold">No passports found</h3>
      <p class="text-xs text-slate-400 max-w-xs mx-auto mt-1 leading-normal font-medium">
        We couldn't find any registered flyers matching your search criteria. Try typing something else!
      </p>
    </div>
  {/if}
</div>
