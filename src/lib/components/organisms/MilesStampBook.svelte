<script lang="ts">
  import { X } from '@lucide/svelte';
  import type { Passport } from '$lib/studio-types';
  import { playSound } from '$lib/utils/audio';
  import { STAMP_CHALLENGES } from '$lib/utils/constants';
  import { scale, fade } from 'svelte/transition';
  import { backOut } from 'svelte/easing';

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

  function handleClose() {
    playSound('beep', isMuted);
    onClose();
  }

  function checkAchieved(id: string) {
    if (id === 'create') return passport.hasCreated;
    if (id === 'board') return !!passport.hasBoarded;
    if (id === 'host') return !!passport.hasHosted;
    if (id === 'chat') return !!passport.hasChatted;
    if (id === 'custom') return !!passport.hasCustomized;
    if (id === 'standby') return !!passport.hasRequested;
    return false;
  }
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 bg-[#006094]/40 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto"
    transition:fade={{ duration: 200 }}
  >
    <div
      class="bg-[#FFFCEF] rounded-[36px] border-4 border-[#FFCC00] max-w-2xl w-full p-6 shadow-2xl relative text-[#4A4A4A] my-8"
      transition:scale={{ duration: 300, start: 0.95, easing: backOut }}
    >
      <!-- Header -->
      <div class="flex items-center justify-between border-b-2 border-[#E6DFC7] pb-3 mb-4">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 bg-[#FFCC00] rounded-full flex items-center justify-center text-xl shadow-xs">
            🎟️
          </div>
          <div>
            <h3 class="font-system font-black text-base text-[#0084CC] uppercase leading-none">Dodo Miles+</h3>
            <span class="text-xs font-system font-bold text-slate-400 block uppercase tracking-wider mt-0.5">MILITARY-GRADE COZY STAMP CHARTER</span>
          </div>
        </div>
        <button
          onclick={handleClose}
          class="p-1 rounded-full bg-[#FAF8F2] border border-[#E6DFC7] text-slate-400 hover:bg-slate-100 cursor-pointer border-none"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Balance Widget -->
      <div class="bg-[#FAF8F2] border-2 border-[#E6DFC7] rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        <div class="text-left">
          <span class="text-xs font-system font-black text-[#85806B] uppercase tracking-wider block font-bold">CURRENT MILES BALANCE</span>
          <span class="text-3xl font-system font-black text-[#FF9F43] tracking-wider leading-none mt-1 block font-black">
            {(passport.miles ?? 2000).toLocaleString()} <span class="text-xs font-sans text-slate-400 font-bold uppercase">Miles</span>
          </span>
        </div>
        <div class="text-right text-sm text-slate-400 font-system italic max-w-xs leading-normal">
          "Gather Dodo Miles by completing airport milestones! Redeem them for safe flight passage or premium pilot credentials."
        </div>
      </div>

      <!-- Stamps grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[380px] overflow-y-auto pr-1">
        {#each STAMP_CHALLENGES as challenge}
          {@const isAchieved = checkAchieved(challenge.id)}
          {@const isClaimed = passport.claimedStampIds?.includes(challenge.id)}
          <div
            class="p-3.5 rounded-3xl border-2 relative overflow-hidden flex items-start gap-3 transition-all {isClaimed ? 'bg-white border-[#E6DFC7]/40 opacity-75' : isAchieved ? 'bg-amber-50/50 border-[#FFCC00] shadow-sm' : 'bg-[#FDFBF7] border-slate-200/60'}"
          >
            <!-- Stamp Circle -->
            <div class="relative flex-shrink-0">
              <div class="w-11 h-11 rounded-full flex items-center justify-center text-xl border-2 border-dashed {isClaimed ? 'bg-red-50 border-red-200' : isAchieved ? 'bg-amber-100/60 border-[#FFCC00]' : 'bg-slate-50 border-slate-200'}">
                {challenge.icon}
              </div>

              <!-- Stamp overlay if claimed -->
              {#if isClaimed}
                <div class="absolute -inset-1 rounded-full bg-red-600/10 border-2 border-red-600 flex items-center justify-center transform rotate-12 select-none pointer-events-none scale-105">
                  <span class="text-xs font-system font-black text-red-600 tracking-normal uppercase leading-none font-bold">OK!</span>
                </div>
              {/if}
            </div>

            <!-- Info and button -->
            <div class="flex-1 min-w-0 text-left">
              <div class="flex items-center justify-between gap-1">
                <span class="font-system font-black text-xs text-slate-700 truncate leading-none font-bold">{challenge.title}</span>
                <span class="font-system text-xs text-[#FF9F43] font-black shrink-0 font-bold">+{challenge.miles}</span>
              </div>
              <p class="text-sm text-slate-400 mt-1 leading-normal font-sans font-semibold">{challenge.desc}</p>
              
              <!-- Interactive state buttons -->
              <div class="mt-2.5">
                {#if isClaimed}
                  <span class="text-xs font-system font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                    🏆 STAMPED & CLAIMED
                  </span>
                {:else if isAchieved}
                  <button
                    onclick={() => onClaimStamp(challenge.id, challenge.miles)}
                    class="bg-red-500 hover:bg-red-600 text-white font-system font-black text-xs px-2.5 py-1 rounded-full shadow-xs uppercase tracking-wider animate-pulse transition-all active:scale-95 cursor-pointer font-bold border-none"
                  >
                    🎁 CLAIM {challenge.miles} MILES
                  </button>
                {:else}
                  <span class="text-xs font-system font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase">
                    🔒 Goal: {challenge.condition}
                  </span>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}
