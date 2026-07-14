<script lang="ts">
  import { onMount } from 'svelte';
  import { PASSPORT_COLORS } from '$lib/utils/constants';
  import type { Passport } from '$lib/studio-types';
  import { DIALOGS } from '$lib/constants/dialogs';
  import AcnhBubble from '$lib/components/molecules/AcnhBubble.svelte';
  import { dalStore } from '$lib/stores/dal.svelte';

  let {
    passport,
    setShowMilesModal,
    setIsEditingPassport,
    isMuted = false,
    isActive = false,
    playSound
  } = $props<{
    passport: Passport;
    setShowMilesModal: (v: boolean) => void;
    setIsEditingPassport: (v: boolean) => void;
    isMuted?: boolean;
    isActive?: boolean;
    playSound: (id: string, isMuted?: boolean) => void;
  }>();

  let passportsList = $derived(dalStore.myPassports && dalStore.myPassports.length > 0 ? dalStore.myPassports : [passport]);

  onMount(() => {
    const renderTime = performance.now();
    console.log(`[Diagnostic] PassportTab mounted and rendered at ${renderTime.toFixed(2)}ms`);
  });
</script>

<div class="space-y-5 text-left w-100 mx-auto pt-5">
  {#if isActive}
    <AcnhBubble 
      title={dalStore.systemMode === 'DAL' ? "Orville" : "Luna"}
      dialogText={dalStore.systemMode === 'DAL' ? DIALOGS.passportTab.active : DIALOGS.passportTab.lunaActive}
    />
  {/if}
  <!-- Tab Header Board -->
  <div class="bg-white rounded-3xl border-2 border-[#0084CC]/10 p-4 lg:p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center text-xl shadow-inner text-[#0084CC]">
        📖
      </div>
      <div>
        <h2 class="text-base font-system font-black tracking-wider text-[#0084CC] uppercase leading-none">
          Frequent Flyer Passport
        </h2>
        <span class="text-xs font-system text-slate-400 font-bold uppercase tracking-widest mt-1 block">
          Your official Dodo Airlines credentials and stamp book
        </span>
      </div>
    </div>
  </div>

  <!-- Passport Cards Grid -->
  <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-4">
    {#each passportsList as p, i}
      {@const activeColor = PASSPORT_COLORS[p.colorIndex || 0] || PASSPORT_COLORS[0]}
      {@const isGuest = !p.hasCreated || !p.villagerName}
      <div class="bg-[#FAF8F2] rounded-[40px] border-8 border-[#E6DFC7] shadow-xl p-6 text-[#4A4A4A] flex flex-col h-full justify-between">
        <div class="flex flex-col sm:flex-row gap-6 h-full">
          <!-- Left Profile Area -->
          <div class="flex flex-col items-center gap-3 w-full sm:w-1/3">
            <div class="w-28 h-28 rounded-[2rem] flex items-center justify-center text-6xl shadow-inner border-4 {activeColor.border} {activeColor.bg} shrink-0">
              {isGuest ? '👤' : p.avatarIcon}
            </div>
            <div class="text-center w-full">
              <p class="font-system font-black text-xl leading-tight text-[#4A4A4A] truncate">{isGuest ? 'Guest Flyer' : p.villagerName}</p>
              <p class="text-xs font-system text-[#85806B] uppercase mt-1">PASSPORT TITLE</p>
              <span class="inline-block mt-0.5 bg-[#F5F2E6] border border-[#E6DFC7] rounded px-2 py-0.5 text-xs font-system font-bold text-[#80765A] uppercase">
                {isGuest ? 'Wandering Visitor' : `${p.titlePart1} ${p.titlePart2}`}
              </span>
            </div>
          </div>
    
          <!-- Right Details Area -->
          <div class="flex-1 space-y-4 flex flex-col">
            <!-- Island & Native Fruit -->
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-white p-3 rounded-2xl border border-[#E6DFC7]">
                <p class="text-[10px] font-system font-bold text-[#85806B] uppercase mb-1">ISLAND</p>
                <p class="text-lg font-black text-[#0084CC] truncate leading-none">🏝️ {isGuest ? 'Unknown' : p.islandName}</p>
              </div>
              <div class="bg-white p-3 rounded-2xl border border-[#E6DFC7]">
                <p class="text-[10px] font-system font-bold text-[#85806B] uppercase mb-1">NATIVE FRUIT</p>
                <p class="text-base font-bold text-slate-700 leading-none">
                  {#if isGuest}
                    ❓ Unknown
                  {:else}
                    {p.nativeFruit === 'Apple' ? '🍎' : p.nativeFruit === 'Cherry' ? '🍒' : p.nativeFruit === 'Orange' ? '🍊' : p.nativeFruit === 'Peach' ? '🍑' : p.nativeFruit === 'Pear' ? '🍐' : '🍎'} {p.nativeFruit || 'Apple'}
                  {/if}
                </p>
              </div>
            </div>
    
            <!-- Signature/Comment Bubble -->
            {#if !isGuest && p.signature}
              <div class="relative bg-white border-2 border-[#E6DFC7] p-3 rounded-2xl rounded-tl-none ml-2">
                <!-- Tail for speech bubble -->
                <div class="absolute -left-2.5 top-0 w-0 h-0 border-y-8 border-y-transparent border-r-[10px] border-r-white z-10"></div>
                <div class="absolute -left-3 top-[-2px] w-0 h-0 border-y-[10px] border-y-transparent border-r-[12px] border-r-[#E6DFC7]"></div>
                <p class="text-sm font-semibold italic text-slate-600 line-clamp-2">
                  "{p.signature}"
                </p>
              </div>
            {/if}
    
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <span class="block text-[10px] font-system font-bold text-[#85806B] uppercase">FRIEND CODE</span>
                <span class="font-system font-black tracking-wide text-slate-600 text-sm block bg-slate-50 p-1.5 rounded-lg text-center border border-slate-200 truncate">{isGuest ? 'Not registered' : p.friendCode}</span>
              </div>
              
              <div class="space-y-1">
                <span class="block text-[10px] font-system font-bold text-[#85806B] uppercase">DREAM ADDRESS</span>
                <span class="font-system font-black tracking-wide text-purple-600 text-sm block bg-purple-50 p-1.5 rounded-lg text-center border border-purple-200 truncate">{isGuest ? 'Not registered' : (p.dreamAddress || 'Not set')}</span>
              </div>
    
              <div class="space-y-1 col-span-2 sm:col-span-1">
                <span class="block text-[10px] font-system font-bold text-[#85806B] uppercase">FLIGHT NUMBER</span>
                <div class="flex items-center gap-2">
                  <span class="font-system font-black tracking-wide text-[#0084CC] text-sm block bg-sky-50 p-1.5 rounded-lg text-center border border-sky-200 flex-1 truncate">{isGuest ? 'Not registered' : (p.flightNumber || 'Not set')}</span>
                  {#if !isGuest && p.flightNumber}
                    <button 
                      class="bg-amber-100 hover:bg-amber-200 text-amber-700 font-system font-black text-[10px] px-2 py-1.5 rounded-lg border border-amber-300 transition-colors uppercase cursor-pointer shrink-0"
                      onclick={async () => {
                        playSound('beep', isMuted);
                        try {
                          // @ts-ignore
                          const { dalStore } = await import('$lib/stores/dal.svelte');
                          await dalStore.rerollFlightNumber();
                        } catch (e: any) {
                          alert(e.error || e.message || 'Error rerolling');
                        }
                      }}
                      title="Costs 500 FF Miles to re-roll"
                    >
                      Re-roll (-500)
                    </button>
                  {/if}
                </div>
              </div>
            </div>
    
            <div class="flex items-center justify-between bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 text-sm font-bold mt-auto">
              <span class="flex items-center gap-2 text-[#FF9F43] font-system font-black uppercase">
                🎟️ FF Miles:
              </span>
              <span class="font-system text-amber-700 text-lg font-black">
                {(p.miles ?? 2000).toLocaleString()}
              </span>
            </div>
    
            <!-- Actions -->
            <div class="flex gap-2 mt-4 pt-2 border-t border-[#E6DFC7]">
              {#if isGuest}
                <button
                  onclick={() => {
                    playSound('beep', isMuted);
                    setIsEditingPassport(true);
                  }}
                  class="w-full btn-acnh btn-acnh-primary py-3 cursor-pointer active:scale-95"
                >
                  📝 Create Your Passport
                </button>
              {:else}
                <button
                  onclick={() => {
                    playSound('beep', isMuted);
                    setShowMilesModal(true);
                  }}
                  class="flex-[0.6] bg-[#FF9F43] hover:bg-[#ff8f24] text-white py-2 rounded-xl font-system font-black text-[10px] sm:text-xs uppercase shadow border-b-4 border-[#cc7a1f] flex items-center justify-center gap-1 cursor-pointer border-none active:scale-95 transition-all"
                  title="Stamp Book"
                >
                  🎯 Stamps
                </button>
    
                <button
                  onclick={() => {
                    playSound('beep', isMuted);
                    // Load this passport into form to edit
                    dalStore.passport = p;
                    dalStore.passportForm = { ...p };
                    setIsEditingPassport(true);
                  }}
                  class="flex-[0.6] btn-acnh btn-acnh-primary text-[10px] sm:text-xs py-2 border-b-4 cursor-pointer active:scale-95"
                >
                  ✏️ Edit
                </button>
                
                <button
                  onclick={() => {
                    playSound('beep', isMuted);
                    dalStore.passport = p;
                    localStorage.setItem('dal_passport', JSON.stringify(p));
                  }}
                  class="flex-1 {dalStore.passport.friendCode === p.friendCode ? 'bg-sky-500 text-white shadow-sky-500/50 border-[#0084CC] pointer-events-none' : 'bg-white hover:bg-sky-50 text-[#0084CC] border-sky-200 cursor-pointer active:scale-95'} py-2 rounded-xl font-system font-black text-[10px] sm:text-xs uppercase shadow border-b-4 flex items-center justify-center gap-1 transition-colors"
                  title="Make this your active passport for flights"
                >
                  {dalStore.passport.friendCode === p.friendCode ? '✓ Active' : 'Set Active'}
                </button>
              {/if}
            </div>
          </div>
        </div>
      </div>
    {/each}

    <!-- Add New Passport Dummy Card -->
    <button 
      onclick={() => {
         playSound('beep', isMuted);
         dalStore.passportForm = {
           villagerName: '',
           islandName: '',
           titlePart1: 'Freshly Picked',
           titlePart2: 'Islander',
           friendCode: 'SW-',
           avatarIcon: '🦤',
           signature: 'Wings up, skies clear!',
           hasCreated: false,
           colorIndex: 1,
           miles: 2000,
           claimedStampIds: [],
           hasBoarded: false,
           hasHosted: false,
           hasChatted: false,
           hasCustomized: false,
           hasRequested: false,
           xp: 0
         };
         setIsEditingPassport(true);
      }}
      class="bg-white/50 border-4 border-dashed border-[#E6DFC7] rounded-[40px] flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-white/80 transition-all min-h-[350px] text-[#85806B] hover:text-[#0084CC] group shadow-inner"
    >
      <div class="text-6xl mb-4 group-hover:scale-110 transition-transform">🛂</div>
      <div class="font-system font-black text-xl uppercase">Add New Passport</div>
      <div class="text-sm font-semibold mt-2 text-center max-w-[200px]">Create an additional passport for another island or Switch console</div>
    </button>
  </div>
</div>
