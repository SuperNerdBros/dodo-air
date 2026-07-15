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
  import { dalStore } from '$lib/stores/dal.svelte';

  let {
    profiles,
    openProfileModal,
    passport,
    isMuted = false,
    isActive = false
  } = $props<{
    profiles: Record<string, UserProfile>;
    openProfileModal: (id: string | number) => void;
    passport: Passport;
    isMuted?: boolean;
    isActive?: boolean;
  }>();

  // --- Sort ---
  type SortOption = 'recent' | 'name' | 'apples' | 'dreamRating';
  let searchQuery = $state('');
  let sortBy = $state<SortOption>('recent');

  // --- Quick Filters ---
  type QuickFilter = 'all' | 'vouched' | 'myCard' | 'topRated' | 'newDreams';
  let activeQuickFilter = $state<QuickFilter>('all');

  const isLuna = $derived(dalStore.systemMode === 'LUNA');

  // Helper: has valid dream address
  const hasValidDream = (p: UserProfile) => {
    const da = (p as any).dreamAddress;
    return da && da !== 'Not set' && da.trim() !== '';
  };

  // --- Profile Pipeline ---
  let allProfiles = $derived(Object.values(profiles) as UserProfile[]);

  // Luna pre-filter: only dream address holders
  let modeFilteredProfiles = $derived(
    isLuna ? allProfiles.filter(hasValidDream) : allProfiles
  );

  // Search filter
  let searchFilteredProfiles = $derived(modeFilteredProfiles.filter((p) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      (p.villagerName || '').toLowerCase().includes(query) ||
      (p.islandName || '').toLowerCase().includes(query) ||
      (p.friendCode || '').toLowerCase().includes(query) ||
      ((p as any).dreamAddress || '').toLowerCase().includes(query) ||
      (p.signature || '').toLowerCase().includes(query)
    );
  }));

  // Quick filter
  const isMe = (p: UserProfile) => passport.friendCode && p.friendCode === passport.friendCode;
  let quickFilteredProfiles = $derived(searchFilteredProfiles.filter((p) => {
    if (activeQuickFilter === 'all') return true;
    if (activeQuickFilter === 'vouched') return (p.goodApples || 0) > 0;
    if (activeQuickFilter === 'topRated') return (p.dreamRatingAvg || 0) > 0;
    if (activeQuickFilter === 'myCard') return isMe(p);
    if (activeQuickFilter === 'newDreams') return true; // sort handles this
    return true;
  }));

  // Sort
  let sortedProfiles = $derived([...quickFilteredProfiles].sort((a, b) => {
    // "My Card" quick filter: push current user to top
    if (activeQuickFilter === 'myCard') {
      const aMe = isMe(a);
      const bMe = isMe(b);
      if (aMe && !bMe) return -1;
      if (!aMe && bMe) return 1;
    }

    const effectiveSort = activeQuickFilter === 'topRated' ? 'dreamRating' as SortOption
      : activeQuickFilter === 'newDreams' ? 'recent' as SortOption
      : sortBy;

    if (effectiveSort === 'name') {
      return (a.villagerName || '').localeCompare(b.villagerName || '');
    }
    if (effectiveSort === 'dreamRating') {
      const diff = (b.dreamRatingAvg || 0) - (a.dreamRatingAvg || 0);
      if (diff !== 0) return diff;
    }
    if (effectiveSort === 'apples') {
      const diff = (b.goodApples || 0) - (a.goodApples || 0);
      if (diff !== 0) return diff;
    }
    const aTime = a.updatedAt || '';
    const bTime = b.updatedAt || '';
    return bTime.localeCompare(aTime);
  }));

  // --- Chip Configs ---
  interface SortChip {
    value: SortOption;
    icon: string;
    label: string;
    activeClass: string;
  }

  const dalSortChips: SortChip[] = [
    { value: 'recent', icon: '⏱️', label: 'Recent', activeClass: 'bg-[#0084CC] text-white border-[#0084CC]' },
    { value: 'name', icon: '🔤', label: 'A-Z', activeClass: 'bg-[#0084CC] text-white border-[#0084CC]' },
    { value: 'apples', icon: '🍎', label: 'Vouches', activeClass: 'bg-emerald-600 text-white border-emerald-600' },
  ];

  const lunaSortChips: SortChip[] = [
    { value: 'recent', icon: '⏱️', label: 'Recent', activeClass: 'bg-[#4B0082] text-white border-[#4B0082]' },
    { value: 'name', icon: '🔤', label: 'A-Z', activeClass: 'bg-[#4B0082] text-white border-[#4B0082]' },
    { value: 'dreamRating', icon: '💤', label: 'Top Dreams', activeClass: 'bg-indigo-600 text-white border-indigo-600' },
  ];

  const sortChips = $derived(isLuna ? lunaSortChips : dalSortChips);

  interface QuickFilterChip {
    value: QuickFilter;
    icon: string;
    label: string;
  }

  const dalQuickFilters: QuickFilterChip[] = [
    { value: 'all', icon: '👥', label: 'All Flyers' },
    { value: 'vouched', icon: '🍏', label: 'Vouched' },
    { value: 'myCard', icon: '⭐', label: 'My Card' },
  ];

  const lunaQuickFilters: QuickFilterChip[] = [
    { value: 'all', icon: '🌙', label: 'All Dreams' },
    { value: 'topRated', icon: '💤', label: 'Top Rated' },
    { value: 'newDreams', icon: '🆕', label: 'New Dreams' },
  ];

  const quickFilterChips = $derived(isLuna ? lunaQuickFilters : dalQuickFilters);

  // Z-rating display helper
  const renderZRating = (avg: number): string => {
    const rounded = Math.round(avg);
    return 'Z'.repeat(Math.max(1, Math.min(5, rounded)));
  };

  onMount(() => {
    const renderTime = performance.now();
    console.log(`[Diagnostic] DirectoryTab mounted and rendered at ${renderTime.toFixed(2)}ms`);
  });
</script>

<div class="space-y-5 text-left pt-5">
  {#if isActive}
    <AcnhBubble 
      title={isLuna ? "Luna" : "Orville"}
      dialogText={isLuna ? DIALOGS.directoryTab.lunaActive : DIALOGS.directoryTab.active}
    />
  {/if}

  <!-- Directory Title Board -->
  <div class="bg-white rounded-3xl border-2 {isLuna ? 'border-[#4B0082]/10' : 'border-[#0084CC]/10'} p-4 lg:p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 {isLuna ? 'bg-purple-100 text-[#4B0082]' : 'bg-sky-100 text-[#0084CC]'} rounded-full flex items-center justify-center text-xl shadow-inner">
        {isLuna ? '🌙' : '📇'}
      </div>
      <div>
        <h2 class="text-base font-system font-black tracking-wider {isLuna ? 'text-[#4B0082]' : 'text-[#0084CC]'} uppercase leading-none">
          {isLuna ? 'Luna Dream Address Directory' : 'DAL Registered Flyers Directory'}
        </h2>
        <span class="text-xs font-system text-slate-400 font-bold uppercase tracking-widest mt-1 block">
          {isLuna ? 'Discover and rate dreamscapes from around the world' : 'Discover and vouch for verified islanders in the lounge'}
        </span>
      </div>
    </div>

    <span class="{isLuna ? 'bg-purple-50 text-[#4B0082] border-purple-100' : 'bg-sky-50 text-[#0084CC] border-sky-100'} px-3 py-1 rounded-full font-bold border uppercase font-system text-sm">
      {modeFilteredProfiles.length} {isLuna ? 'dreamscapes' : 'registered flyers'}
    </span>
  </div>

  <!-- Search + Filters Panel -->
  <div class="bg-white rounded-3xl border-2 border-[#E6DFC7] p-4 shadow-xs flex flex-col gap-3">
    <!-- Search -->
    <div class="relative w-full">
      <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <Search class="w-4 h-4 text-slate-400" />
      </span>
      <input
        id="directory-search-input"
        type="text"
        placeholder={isLuna ? "Search by name, island, or dream address..." : "Search by name, island, friend code, or title..."}
        bind:value={searchQuery}
        class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50/70 border border-slate-200 text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-2 {isLuna ? 'focus:ring-[#4B0082]/20 focus:border-[#4B0082]' : 'focus:ring-[#0084CC]/20 focus:border-[#0084CC]'} transition-all"
      />
    </div>

    <!-- Quick Filter Chips -->
    <div class="flex flex-wrap justify-center gap-1.5">
      {#each quickFilterChips as chip (chip.value)}
        {@const isActiveChip = activeQuickFilter === chip.value}
        <button
          class="filter-chip group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-system font-bold border transition-all cursor-pointer select-none
            {isActiveChip
              ? (isLuna ? 'bg-[#4B0082] text-white border-[#4B0082]' : 'bg-[#0084CC] text-white border-[#0084CC]') + ' shadow-md scale-[1.03]'
              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300 shadow-sm'
            }"
          onclick={() => { playSound('beep', isMuted); activeQuickFilter = chip.value; }}
        >
          <span class="text-sm leading-none">{chip.icon}</span>
          <span>{chip.label}</span>
        </button>
      {/each}
    </div>

    <!-- Sort Chips -->
    <div class="flex flex-wrap justify-center gap-1.5 border-t border-slate-100 pt-3">
      <span class="text-xs font-system font-black text-slate-400 flex items-center gap-1 uppercase mr-1">
        <SlidersHorizontal class="w-3 h-3" /> Sort:
      </span>
      {#each sortChips as chip (chip.value)}
        {@const isActiveSort = sortBy === chip.value}
        <button
          class="filter-chip group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-system font-bold border transition-all cursor-pointer select-none
            {isActiveSort
              ? chip.activeClass + ' shadow-md scale-[1.03]'
              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300 shadow-sm'
            }"
          onclick={() => { playSound('beep', isMuted); sortBy = chip.value; }}
        >
          <span class="text-sm leading-none">{chip.icon}</span>
          <span>{chip.label}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Directory Grid -->
  {#if sortedProfiles.length > 0}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {#each sortedProfiles as p (p.userId || p.friendCode)}
        {@const activeColor = PASSPORT_COLORS[p.colorIndex || 0] || PASSPORT_COLORS[1]}
        {@const isMeCard = passport.friendCode && p.friendCode === passport.friendCode}
        
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          onclick={() => openProfileModal(p.userId || p.friendCode)}
          class="relative flex flex-col justify-between {isLuna ? 'bg-[#F5F0FF]' : 'bg-[#FFFCEF]'} rounded-[32px] border-4 {isLuna ? 'border-[#DDA0DD]/40' : 'border-[#E6DFC7]'} p-5 shadow-sm hover:shadow-md cursor-pointer hover:scale-[1.02] transition-all overflow-hidden {isMeCard ? 'ring-4 ring-[#FFCC00] ring-offset-2' : ''}"
        >
          <!-- Me sticker badge -->
          {#if isMeCard}
            <span class="absolute -right-12 top-4 rotate-45 bg-[#FFCC00] text-[#006094] text-xs font-system font-black py-1 px-12 tracking-wider shadow-sm uppercase font-bold text-center z-10">
              You
            </span>
          {/if}

          <div class="space-y-4">
            <!-- Visual Stamp Card -->
            <div class="flex gap-3">
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner border {isLuna ? 'border-[#DDA0DD]/20' : 'border-[#E6DFC7]/10'} shrink-0 {activeColor.bg}">
                {p.avatarIcon || '🦤'}
              </div>
              <div class="space-y-0.5 flex-1 min-w-0">
                {#if isLuna}
                  <span class="bg-purple-100 text-purple-800 text-xs font-system font-bold px-1.5 py-0.5 rounded-full uppercase leading-none border border-purple-200">
                    Dream Sharer
                  </span>
                {:else}
                  <span class="bg-sky-100 text-sky-800 text-xs font-system font-bold px-1.5 py-0.5 rounded-full uppercase leading-none border border-sky-200">
                    Verified Flyer
                  </span>
                {/if}
                <h3 class="font-system font-black text-sm text-slate-800 leading-tight truncate mt-1 font-bold">
                  {p.villagerName}
                </h3>
                <p class="text-sm font-bold {isLuna ? 'text-[#4B0082]' : 'text-[#0084CC]'} truncate">
                  🏝️ {p.islandName}
                </p>
              </div>
            </div>

            <!-- Passport Title -->
            <div class="space-y-1">
              <span class="block text-xs font-system text-[#85806B] uppercase leading-none">PASSPORT TITLE</span>
              <span class="inline-block bg-[#F5F2E6] border border-[#E6DFC7] rounded-sm px-1.5 py-0.5 text-xs font-system font-bold text-[#80765A] uppercase truncate max-w-full">
                {p.titlePart1 || 'Freshly Picked'} {p.titlePart2 || 'Islander'}
              </span>
            </div>

            <!-- Friend Code / Dream Address -->
            <div class="space-y-1">
              <span class="block text-xs font-system text-[#85806B] uppercase leading-none">
                {isLuna ? 'DREAM ADDRESS' : 'FRIEND CODE'}
              </span>
              <span class="font-system font-bold {isLuna ? 'text-purple-600' : 'text-slate-500'} text-sm block">
                {isLuna ? ((p as any).dreamAddress || 'Not set') : p.friendCode}
              </span>
            </div>

            <!-- Signature -->
            {#if p.signature}
              <div class="bg-white/65 border {isLuna ? 'border-[#DDA0DD]/20' : 'border-[#E6DFC7]/40'} p-2.5 rounded-xl text-sm italic text-slate-500 min-h-[44px] flex items-center">
                "{p.signature}"
              </div>
            {/if}
          </div>

          <!-- Rating stats & CTA -->
          <div class="mt-4 pt-3.5 border-t border-dashed {isLuna ? 'border-[#DDA0DD]/30' : 'border-[#E6DFC7]'} flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 text-sm font-system font-black font-bold">
              {#if isLuna}
                <!-- Z-Rating Display -->
                {#if (p.dreamRatingCount || 0) > 0}
                  <span class="bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full px-2.5 py-0.5 flex items-center gap-1 tracking-wider">
                    💤 {renderZRating(p.dreamRatingAvg || 0)}
                  </span>
                  <span class="text-[10px] text-slate-400 font-medium">
                    {p.dreamRatingCount} {p.dreamRatingCount === 1 ? 'rating' : 'ratings'}
                  </span>
                {:else}
                  <span class="text-[10px] text-slate-400 font-medium italic">
                    No dream ratings yet
                  </span>
                {/if}
              {:else}
                <span class="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-2 py-0.5 flex items-center gap-1">
                  🍏 {p.goodApples || 0}
                </span>
                <span class="bg-rose-50 text-rose-700 border border-rose-100 rounded-full px-2 py-0.5 flex items-center gap-1">
                  🧅 {p.rottenTurnips || 0}
                </span>
              {/if}
            </div>

            <span class="btn-acnh btn-acnh-primary">
              {isLuna ? 'View & Rate Dream' : 'View Profile'}
            </span>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div
      in:fade={{ duration: 200 }}
      class="bg-white rounded-[32px] border-2 border-dashed {isLuna ? 'border-[#DDA0DD]/40' : 'border-[#E6DFC7]'} p-12 text-center"
    >
      <div class="text-4xl">{isLuna ? '🌙' : '📇'}</div>
      <h3 class="font-system font-black text-sm text-slate-700 uppercase tracking-wider mt-3 font-bold">
        {isLuna ? 'No dream addresses registered' : 'No passports found'}
      </h3>
      <p class="text-xs text-slate-400 max-w-xs mx-auto mt-1 leading-normal font-medium">
        {isLuna
          ? "No islanders have registered Dream Addresses yet. Encourage dreamers to add their DA-code in their passport!"
          : "We couldn't find any registered flyers matching your search criteria. Try typing something else!"}
      </p>
    </div>
  {/if}
</div>
