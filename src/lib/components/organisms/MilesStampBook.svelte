<script lang="ts">
  import { 
    X, 
    ChevronLeft, 
    ChevronRight,
    Plane,
    Map as MapIcon,
    Home,
    Radio,
    Palette,
    Sofa
  } from '@lucide/svelte';
  import type { Passport } from '$lib/studio-types';
  import { playSound } from '$lib/utils/audio';
  import { STAMP_CHALLENGES } from '$lib/utils/constants';
  import { scale, fade, fly } from 'svelte/transition';
  import { backOut, cubicOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';

  let {
    isOpen = false,
    onClose,
    passport,
    onClaimStamp,
    isMuted = false
  } = $props<{
    isOpen: boolean;
    onClose: () => void;
    passport: Passport;
    onClaimStamp: (stampId: string, miles: number) => void;
    isMuted?: boolean;
  }>();

  let selectedChallengeId = $state<string | null>(null);
  
  let displayedMiles = tweened(passport.miles ?? 2000, {
    duration: 1200,
    easing: cubicOut
  });

  $effect(() => {
    if (passport.miles !== undefined) {
      displayedMiles.set(passport.miles);
    }
  });

  const iconMap: Record<string, any> = {
    create: Plane,
    board: MapIcon,
    host: Home,
    chat: Radio,
    custom: Palette,
    standby: Sofa
  };

  function handleClose() {
    playSound('beep', isMuted);
    onClose();
  }

  function getProgress(id: string) {
    let count = 0;
    if (id === 'create' && passport.hasCreated) count = 1;
    if (id === 'board' && passport.hasBoarded) count = 1;
    if (id === 'host' && passport.hasHosted) count = 1;
    if (id === 'chat' && passport.hasChatted) count = 1;
    if (id === 'custom' && passport.hasCustomized) count = 1;
    if (id === 'standby' && passport.hasRequested) count = 1;
    return count;
  }

  function isLevelClaimed(challengeId: string, levelIndex: number) {
    // We check if the specific level ID is claimed, e.g., 'board_0'
    // For backwards compatibility, if levelIndex === 0, also check just 'board'
    return passport.claimedStampIds?.includes(`${challengeId}_${levelIndex}`) || 
           (levelIndex === 0 && passport.claimedStampIds?.includes(challengeId));
  }
  
  function claimLevel(challengeId: string, levelIndex: number, miles: number) {
    playSound('success', isMuted);
    onClaimStamp(`${challengeId}_${levelIndex}`, miles);
  }

  let selectedCardIndex = $derived(
    selectedChallengeId ? STAMP_CHALLENGES.findIndex(c => c.id === selectedChallengeId) : -1
  );
  
  let selectedChallenge = $derived(
    selectedCardIndex !== -1 ? STAMP_CHALLENGES[selectedCardIndex] : null
  );

  function prevCard() {
    if (selectedCardIndex > 0) {
      playSound('thwip', isMuted);
      selectedChallengeId = STAMP_CHALLENGES[selectedCardIndex - 1].id;
    }
  }

  function nextCard() {
    if (selectedCardIndex < STAMP_CHALLENGES.length - 1) {
      playSound('thwip', isMuted);
      selectedChallengeId = STAMP_CHALLENGES[selectedCardIndex + 1].id;
    }
  }
</script>

<style>
  .acnh-bg {
    background-color: #E2EEF9;
    background-image: radial-gradient(#C6DDF0 2px, transparent 2px);
    background-size: 32px 32px;
  }
  
  .card-pattern-stripes {
    background: repeating-linear-gradient(
      -45deg,
      rgba(255,255,255,0.4),
      rgba(255,255,255,0.4) 15px,
      rgba(255,255,255,0.1) 15px,
      rgba(255,255,255,0.1) 30px
    );
  }
  .card-pattern-waves {
    background: radial-gradient(circle at 100% 50%, rgba(255,255,255,0.2) 20%, rgba(255,255,255,0.3) 21%, rgba(255,255,255,0.3) 34%, rgba(255,255,255,0.4) 35%, rgba(255,255,255,0.4) 50%, transparent 51%) 0 0 / 40px 40px, radial-gradient(circle at 0 50%, transparent 49%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 64%, rgba(255,255,255,0.3) 65%, rgba(255,255,255,0.3) 79%, rgba(255,255,255,0.4) 80%, rgba(255,255,255,0.4) 100%) 0 0 / 40px 40px;
  }
  .card-pattern-grass {
    background: radial-gradient(circle at top left, rgba(255,255,255,0.3) 20%, transparent 21%), radial-gradient(circle at top right, rgba(255,255,255,0.3) 20%, transparent 21%);
    background-size: 30px 30px;
  }
  .card-pattern-clouds {
    background: radial-gradient(circle, rgba(255,255,255,0.3) 40%, transparent 41%) 0 0 / 40px 40px, radial-gradient(circle, rgba(255,255,255,0.4) 40%, transparent 41%) 20px 20px / 40px 40px;
  }

  .acnh-card {
    box-shadow: 0 8px 16px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.08);
  }
  
  .stamp-slot {
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .stamp-badge {
    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.15));
  }
  
  .acnh-title {
    text-shadow: 0 2px 0 rgba(255,255,255,0.8);
  }
</style>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-hidden"
    transition:fade={{ duration: 200 }}
  >
    <div
      class="acnh-bg rounded-[32px] border-4 border-white max-w-6xl w-full h-[90vh] shadow-2xl relative text-[#4A4A4A] flex flex-col overflow-hidden"
      transition:scale={{ duration: 300, start: 0.95, easing: backOut }}
    >
      <!-- Header / Top Bar -->
      <div class="absolute top-4 left-4 right-4 flex items-center justify-between z-30 pointer-events-none">
        <div class="bg-white/80 backdrop-blur-md px-6 py-2 rounded-full border-2 border-white shadow-sm flex items-center gap-2 pointer-events-auto">
          <span class="text-xl">🎟️</span>
          <h3 class="font-system font-black text-[#5C5541] tracking-wide">Frequent Flyer Miles+</h3>
        </div>
        
        <div class="flex items-center gap-4 pointer-events-auto">
          <div class="bg-[#FF9F43] text-white px-6 py-2 rounded-full border-4 border-white shadow-md flex items-center gap-2">
            <span class="font-system font-black text-2xl tracking-wider leading-none">{Math.floor($displayedMiles).toLocaleString()}</span>
            <span class="text-xs font-system font-bold uppercase opacity-80 pt-1">Miles</span>
          </div>
          <button
            onclick={handleClose}
            class="w-12 h-12 rounded-full bg-white border-2 border-slate-200 text-slate-500 hover:bg-slate-100 flex items-center justify-center cursor-pointer shadow-sm active:scale-95 transition-transform"
          >
            <X class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Main Grid View -->
      <div class="flex-1 overflow-x-auto overflow-y-hidden pt-28 pb-12 px-12 snap-x snap-mandatory">
        <div class="grid grid-rows-2 grid-flow-col gap-6 h-full min-w-max pb-4">
          {#each STAMP_CHALLENGES as challenge, i}
            {@const progress = getProgress(challenge.id)}
            
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <div
              class="acnh-card bg-white rounded-xl border-4 border-white overflow-hidden flex flex-col w-72 md:w-80 h-full snap-center cursor-pointer hover:scale-105 transition-transform duration-300"
              style="transform: rotate({(i % 3 === 0) ? -1 : (i % 3 === 1) ? 2 : -1.5}deg)"
              onclick={() => { playSound('thwip', isMuted); selectedChallengeId = challenge.id; }}
            >
              <div 
                class="flex-1 w-full flex flex-col items-center justify-center p-4 relative"
                style="background-color: {challenge.color};"
              >
                <!-- Pattern overlay -->
                <div class="absolute inset-0 card-pattern-{challenge.pattern} opacity-40"></div>
                
                <h4 class="acnh-title font-system font-black text-[#5C5541] text-lg text-center z-10 mb-4">{challenge.title}</h4>
                
                <div class="flex gap-2 z-10 mt-auto mb-2">
                  {#each challenge.levels as level, lIdx}
                    {@const isClaimed = isLevelClaimed(challenge.id, lIdx)}
                    <div class="relative w-16 h-16">
                      <div class="stamp-slot absolute inset-0 bg-white rounded-full mx-auto"></div>
                      {#if isClaimed || progress >= level.target}
                        <div class="stamp-badge absolute -inset-2 bg-white rounded-lg border-2 border-[#5C5541] flex flex-col items-center justify-center transform rotate-[-8deg] overflow-hidden"
                             style="background-color: {challenge.color}; {isClaimed ? 'opacity: 1;' : 'opacity: 0.6;'}">
                          <span class="text-[#5C5541] drop-shadow-sm">
                            <svelte:component this={iconMap[challenge.id]} class="w-10 h-10" />
                          </span>
                          <div class="absolute bottom-0 w-full bg-black/20 text-center py-0.5">
                             <span class="text-[8px] font-system font-bold text-white uppercase">{isClaimed ? 'STAMPED' : 'READY'}</span>
                          </div>
                        </div>
                      {/if}
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
      
      <!-- Detail Overlay -->
      {#if selectedChallengeId && selectedChallenge}
        <div 
          class="absolute inset-0 z-20 flex items-center justify-center p-8 bg-black/20 backdrop-blur-sm"
          transition:fade={{ duration: 200 }}
          onclick={(e) => { if (e.target === e.currentTarget) selectedChallengeId = null; }}
        >
          <!-- Left Arrow -->
          {#if selectedCardIndex > 0}
            <button onclick={prevCard} class="absolute left-8 w-16 h-16 rounded-full bg-white/80 hover:bg-white text-[#5C5541] flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer border-none z-30">
              <ChevronLeft class="w-10 h-10" />
            </button>
          {/if}

          <!-- Right Arrow -->
          {#if selectedCardIndex < STAMP_CHALLENGES.length - 1}
            <button onclick={nextCard} class="absolute right-8 w-16 h-16 rounded-full bg-white/80 hover:bg-white text-[#5C5541] flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer border-none z-30">
              <ChevronRight class="w-10 h-10" />
            </button>
          {/if}

          <!-- Large Detail Card -->
          <div 
            class="bg-white rounded-2xl border-8 border-white acnh-card flex flex-col w-full max-w-4xl h-[70vh] relative overflow-hidden"
            transition:scale={{ duration: 300, start: 0.9, easing: backOut }}
          >
            <!-- Close Button -->
            <button
              onclick={() => selectedChallengeId = null}
              class="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center cursor-pointer border-none z-50 text-[#5C5541]"
            >
              <X class="w-6 h-6" />
            </button>

            <!-- Card Content with pattern -->
            <div 
              class="flex-1 w-full flex flex-col p-8 relative"
              style="background-color: {selectedChallenge.color};"
            >
              <!-- Pattern overlay -->
              <div class="absolute inset-0 card-pattern-{selectedChallenge.pattern} opacity-40"></div>
              
              <h2 class="acnh-title font-system font-black text-[#5C5541] text-3xl text-center z-10 mb-8">{selectedChallenge.title}</h2>
              
              <div class="bg-white/90 backdrop-blur-sm rounded-2xl p-6 z-10 shadow-sm border-2 border-white/50 mb-auto relative">
                <p class="font-system text-xl text-[#5C5541] leading-relaxed font-bold">
                  {selectedChallenge.desc}
                </p>
                <div class="absolute bottom-2 right-4 opacity-50 pointer-events-none text-4xl">
                  🦤
                </div>
              </div>
              
              <div class="flex items-center justify-center gap-8 z-10 mt-12 relative">
                <!-- Connecting Line behind circles -->
                <div class="absolute top-1/2 left-10 right-10 h-2 bg-white/50 -translate-y-1/2 rounded-full pointer-events-none"></div>

                {#each selectedChallenge.levels as level, lIdx}
                  {@const progress = getProgress(selectedChallenge.id)}
                  {@const isClaimed = isLevelClaimed(selectedChallenge.id, lIdx)}
                  {@const canClaim = progress >= level.target && !isClaimed}
                  
                  <div class="flex flex-col items-center gap-4 relative">
                    <!-- Target Tooltip -->
                    <div class="absolute -top-12 bg-[#5C5541] text-white font-system font-bold text-xs px-3 py-1 rounded-full whitespace-nowrap shadow-md">
                      {progress} / {level.target}
                      <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#5C5541] rotate-45"></div>
                    </div>

                    <div class="relative w-28 h-28 flex-shrink-0 z-10">
                      <div class="stamp-slot absolute inset-0 bg-white rounded-full mx-auto border-4 border-white/50"></div>
                      {#if canClaim}
                        <!-- Empty slot but pulsing/highlighted -->
                        <div class="absolute inset-0 bg-yellow-200/50 rounded-full animate-pulse border-4 border-yellow-400"></div>
                        <!-- Ribbon -->
                        <div class="absolute -top-20 left-1/2 -translate-x-1/2 flex flex-col items-center z-50 cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                             onclick={() => claimLevel(selectedChallenge!.id, lIdx, level.miles)}>
                          <div class="bg-[#5C73FF] text-white font-system font-black text-xl px-6 py-2 shadow-lg border-b-4 border-[#3346B0] whitespace-nowrap relative rounded-sm">
                            Get Miles!
                          </div>
                          <div class="text-[#5C5541] font-system font-bold text-sm mt-2 bg-white/90 px-4 py-0.5 rounded-full shadow-sm">
                            🎯 Claim
                          </div>
                        </div>
                      {/if}
                      
                      {#if isClaimed}
                        <div class="stamp-badge absolute -inset-2 bg-white rounded-xl border-4 border-[#5C5541] flex flex-col items-center justify-center overflow-hidden transition-all"
                             style="background-color: {selectedChallenge.color}; opacity: 1; transform: rotate(-5deg);">
                          <span class="text-[#5C5541] drop-shadow-md">
                            <svelte:component this={iconMap[selectedChallenge.id]} class="w-16 h-16" />
                          </span>
                          <div class="absolute bottom-0 w-full bg-black/20 text-center py-1">
                             <span class="text-xs font-system font-black text-white uppercase">CLAIMED</span>
                          </div>
                        </div>
                      {/if}
                    </div>
                    
                    <div class="bg-white/90 px-4 py-1 rounded-full font-system font-black text-[#5C5541] shadow-sm z-10">
                      +{level.miles} MILES
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}
