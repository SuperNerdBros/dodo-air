<script lang="ts">
  import { PASSPORT_COLORS } from '$lib/utils/constants';
  import type { Passport } from '$lib/studio-types';

  let {
    passport,
    setShowMilesModal,
    setIsEditingPassport,
    isMuted = false,
    playSound
  } = $props<{
    passport: Passport;
    setShowMilesModal: (v: boolean) => void;
    setIsEditingPassport: (v: boolean) => void;
    isMuted?: boolean;
    playSound: (id: string, isMuted?: boolean) => void;
  }>();

  let activeColor = $derived(PASSPORT_COLORS[passport.colorIndex || 0] || PASSPORT_COLORS[0]);
</script>

<div class="space-y-5 text-left max-w-2xl mx-auto">
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

  <!-- Passport Card -->
  <div class="bg-[#FAF8F2] rounded-[40px] border-8 border-[#E6DFC7] shadow-xl p-6 text-[#4A4A4A]">
    <div class="flex flex-col sm:flex-row gap-6 mt-4">
      <!-- Left Profile Area -->
      <div class="flex flex-col items-center gap-3 w-full sm:w-1/3">
        <div class="w-28 h-28 rounded-[2rem] flex items-center justify-center text-6xl shadow-inner border-4 {activeColor.border} {activeColor.bg}">
          {passport.avatarIcon}
        </div>
        <div class="text-center w-full">
          <p class="font-system font-black text-xl leading-tight text-[#4A4A4A] truncate">{passport.villagerName}</p>
          <p class="text-xs font-system text-[#85806B] uppercase mt-1">PASSPORT TITLE</p>
          <span class="inline-block mt-0.5 bg-[#F5F2E6] border border-[#E6DFC7] rounded px-2 py-0.5 text-xs font-system font-bold text-[#80765A] uppercase">
            {passport.titlePart1} {passport.titlePart2}
          </span>
        </div>
      </div>

      <!-- Right Details Area -->
      <div class="flex-1 space-y-4">
        <!-- Island & Native Fruit -->
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-white p-3 rounded-2xl border border-[#E6DFC7]">
            <p class="text-[10px] font-system font-bold text-[#85806B] uppercase mb-1">ISLAND</p>
            <p class="text-lg font-black text-[#0084CC] truncate leading-none">🏝️ {passport.islandName}</p>
          </div>
          <div class="bg-white p-3 rounded-2xl border border-[#E6DFC7]">
            <p class="text-[10px] font-system font-bold text-[#85806B] uppercase mb-1">NATIVE FRUIT</p>
            <p class="text-base font-bold text-slate-700 leading-none">
              {passport.nativeFruit === 'Apple' ? '🍎' : passport.nativeFruit === 'Cherry' ? '🍒' : passport.nativeFruit === 'Orange' ? '🍊' : passport.nativeFruit === 'Peach' ? '🍑' : passport.nativeFruit === 'Pear' ? '🍐' : '🍎'} {passport.nativeFruit || 'Apple'}
            </p>
          </div>
        </div>

        <!-- Signature/Comment Bubble -->
        {#if passport.signature}
          <div class="relative bg-white border-2 border-[#E6DFC7] p-3 rounded-2xl rounded-tl-none ml-2">
            <!-- Tail for speech bubble -->
            <div class="absolute -left-2.5 top-0 w-0 h-0 border-y-8 border-y-transparent border-r-[10px] border-r-white z-10"></div>
            <div class="absolute -left-3 top-[-2px] w-0 h-0 border-y-[10px] border-y-transparent border-r-[12px] border-r-[#E6DFC7]"></div>
            <p class="text-sm font-semibold italic text-slate-600">
              "{passport.signature}"
            </p>
          </div>
        {/if}

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1">
            <span class="block text-[10px] font-system font-bold text-[#85806B] uppercase">FRIEND CODE</span>
            <span class="font-system font-black tracking-wide text-slate-600 text-sm block bg-slate-50 p-1.5 rounded-lg text-center border border-slate-200">{passport.friendCode}</span>
          </div>
          
          <div class="space-y-1">
            <span class="block text-[10px] font-system font-bold text-[#85806B] uppercase">DREAM ADDRESS</span>
            <span class="font-system font-black tracking-wide text-purple-600 text-sm block bg-purple-50 p-1.5 rounded-lg text-center border border-purple-200">{passport.dreamAddress || 'Not set'}</span>
          </div>
        </div>

        <div class="flex items-center justify-between bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 text-sm font-bold mt-2">
          <span class="flex items-center gap-2 text-[#FF9F43] font-system font-black uppercase">
            🎟️ Dodo Miles:
          </span>
          <span class="font-system text-amber-700 text-lg font-black">
            {(passport.miles ?? 2000).toLocaleString()}
          </span>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 mt-4">
          <button
            onclick={() => {
              playSound('beep', isMuted);
              setShowMilesModal(true);
            }}
            class="flex-1 bg-[#FF9F43] hover:bg-[#ff8f24] text-white py-2 rounded-xl font-system font-black text-xs uppercase shadow border-b-4 border-[#cc7a1f] flex items-center justify-center gap-1 cursor-pointer border-none active:scale-95"
          >
            🎯 Stamp Book
          </button>

          <button
            onclick={() => {
              playSound('beep', isMuted);
              setIsEditingPassport(true);
            }}
            class="flex-1 btn-acnh btn-acnh-primary text-xs py-2 border-b-4 cursor-pointer active:scale-95"
          >
            ✏️ Edit Passport
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
