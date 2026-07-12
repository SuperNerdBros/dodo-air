<script lang="ts">
  import { scale } from 'svelte/transition';
  import { X } from '@lucide/svelte';
  import Box from '../atoms/Box.atom.svelte';
  import Text from '../atoms/Text.atom.svelte';
  import Button from '../atoms/Button.atom.svelte';
  import { dalStore } from '$lib/stores/dal.svelte';
  import { STAMP_CHALLENGES } from '$lib/types';
</script>

{#if dalStore.showMilesModal}
  <Box class="fixed inset-0 bg-[#006094]/40 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
    <Box transition={scale} class="bg-[#FFFCEF] rounded-[36px] border-4 border-[#FFCC00] max-w-2xl w-full p-6 shadow-2xl relative text-[#4A4A4A] my-8">
      <Box class="flex items-center justify-between border-b-2 border-[#E6DFC7] pb-3 mb-4">
        <Box class="flex items-center gap-2">
          <Box class="w-9 h-9 bg-[#FFCC00] rounded-full flex items-center justify-center text-xl shadow-xs">🎟️</Box>
          <Box>
            <Text tag="h3" class="font-system font-black text-base text-[#0084CC] uppercase leading-none">NookPhone Dodo Miles+</Text>
            <Text tag="span" class="text-[8.5px] font-mono font-bold text-slate-400 block uppercase tracking-wider mt-0.5">MILITARY-GRADE COZY STAMP CHARTER</Text>
          </Box>
        </Box>
        <Button onclick={() => { dalStore.playSound('beep'); dalStore.showMilesModal = false; }} class="p-1 rounded-full bg-[#FAF8F2] border border-[#E6DFC7] text-slate-400 hover:bg-slate-100">
          <X class="w-4 h-4" />
        </Button>
      </Box>

      <Box class="bg-[#FAF8F2] border-2 border-[#E6DFC7] rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        <Box>
          <Text tag="span" class="text-[9px] font-mono font-black text-[#85806B] uppercase tracking-wider block">CURRENT MILES BALANCE</Text>
          <Text tag="span" class="text-3xl font-mono font-black text-[#FF9F43] tracking-wider leading-none mt-1 block">
            {(dalStore.passport.miles ?? 2000).toLocaleString()} <Text tag="span" class="text-xs font-sans text-slate-400 font-bold uppercase">Miles</Text>
          </Text>
        </Box>
        <Box class="text-right text-[10px] text-slate-400 font-mono italic max-w-xs leading-normal">
          "Gather Dodo Miles by completing airport milestones! Redeem them for safe flight passage or premium pilot credentials."
        </Box>
      </Box>

      <Box class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[380px] overflow-y-auto pr-1">
        {#each STAMP_CHALLENGES as challenge}
          {@const isAchieved = 
            (challenge.id === 'create' && dalStore.passport.hasCreated) ||
            (challenge.id === 'board' && !!dalStore.passport.hasBoarded) ||
            (challenge.id === 'host' && !!dalStore.passport.hasHosted) ||
            (challenge.id === 'chat' && !!dalStore.passport.hasChatted) ||
            (challenge.id === 'custom' && !!dalStore.passport.hasCustomized) ||
            (challenge.id === 'standby' && !!dalStore.passport.hasRequested)}
          {@const isClaimed = dalStore.passport.claimedStampIds?.includes(challenge.id)}

          <Box class={`p-3.5 rounded-3xl border-2 relative overflow-hidden flex items-start gap-3 transition-all ${
            isClaimed ? 'bg-white border-[#E6DFC7]/40 opacity-75' : isAchieved ? 'bg-amber-50/50 border-[#FFCC00] shadow-sm' : 'bg-[#FDFBF7] border-slate-200/60'
          }`}>
            <Box class="relative flex-shrink-0">
              <Box class={`w-11 h-11 rounded-full flex items-center justify-center text-xl border-2 border-dashed ${
                isClaimed ? 'bg-red-50 border-red-200' : isAchieved ? 'bg-amber-100/60 border-[#FFCC00]' : 'bg-slate-50 border-slate-200'
              }`}>
                {challenge.icon}
              </Box>
              {#if isClaimed}
                <Box class="absolute -inset-1 rounded-full bg-red-600/10 border-2 border-red-600 flex items-center justify-center transform rotate-12 select-none pointer-events-none scale-105">
                  <Text tag="span" class="text-[7.5px] font-system font-black text-red-600 tracking-tighter uppercase leading-none">OK!</Text>
                </Box>
              {/if}
            </Box>

            <Box class="flex-1 min-w-0">
              <Box class="flex items-center justify-between gap-1">
                <Text tag="span" class="font-system font-black text-xs text-slate-700 truncate leading-none">{challenge.title}</Text>
                <Text tag="span" class="font-mono text-[9px] text-[#FF9F43] font-black shrink-0">+{challenge.miles}</Text>
              </Box>
              <Text tag="p" class="text-[10px] text-slate-400 mt-1 leading-normal font-sans">{challenge.desc}</Text>
              
              <Box class="mt-2.5">
                {#if isClaimed}
                  <Text tag="span" class="text-[8.5px] font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                    🏆 STAMPED & CLAIMED
                  </Text>
                {:else if isAchieved}
                  <Button onclick={() => dalStore.claimStampMiles(challenge.id, challenge.miles)} class="bg-red-500 hover:bg-red-600 text-white font-mono font-black text-[9px] px-2.5 py-1 rounded-full shadow-xs uppercase tracking-wider animate-pulse transition-all active:scale-95">
                    🎁 CLAIM {challenge.miles} MILES
                  </Button>
                {:else}
                  <Text tag="span" class="text-[8.5px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase">
                    🔒 Goal: {challenge.condition}
                  </Text>
                {/if}
              </Box>
            </Box>
          </Box>
        {/each}
      </Box>
    </Box>
  </Box>
{/if}
