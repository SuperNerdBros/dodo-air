<script lang="ts">
  import type { Passport } from '$lib/studio-types';
  import { playSound } from '$lib/utils/audio';
  import {
    TITLE_PART_1,
    TITLE_PART_2,
    AVATAR_ICONS,
    PLANE_COLORS,
    generateRandomFriendCode
  } from '$lib/utils/constants';
  import { scale, fade } from 'svelte/transition';
  import { backOut } from 'svelte/easing';

  let {
    onSavePassport,
    isMuted = false
  } = $props<{
    onSavePassport: (p: Passport) => void;
    isMuted?: boolean;
  }>();

  let passportForm = $state<Passport>({
    villagerName: '',
    islandName: '',
    titlePart1: 'Freshly Picked',
    titlePart2: 'Islander',
    friendCode: generateRandomFriendCode(),
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
    planeType: 'Switch',
    planeColor: 'orange'
  });

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!passportForm.villagerName.trim() || !passportForm.islandName.trim()) return;

    let finalFriendCode = passportForm.friendCode.trim();
    if (!finalFriendCode || finalFriendCode === 'SW-XXXX-XXXX-XXXX' || finalFriendCode === 'SW-') {
      finalFriendCode = generateRandomFriendCode();
    }

    const updated: Passport = {
      ...passportForm,
      friendCode: finalFriendCode,
      hasCreated: true,
      hasCustomized: true
    };
    onSavePassport(updated);
  }

  function handleBrowseAsGuest() {
    playSound('beep', isMuted);
    const guestPassport: Passport = {
      villagerName: 'Guest Flyer',
      islandName: 'Nook Island',
      titlePart1: 'Cozy',
      titlePart2: 'Traveler',
      friendCode: generateRandomFriendCode(),
      avatarIcon: '🦤',
      signature: 'Wings up, skies clear!',
      hasCreated: true,
      colorIndex: 1,
      miles: 2000,
      claimedStampIds: [],
      hasBoarded: false,
      hasHosted: false,
      hasChatted: false,
      hasCustomized: false,
      hasRequested: false,
      planeType: 'Switch',
      planeColor: 'orange'
    };
    onSavePassport(guestPassport);
  }

  function updateFriendCode(e: Event) {
    const target = e.target as HTMLInputElement;
    let val = target.value;
    if (!val.toUpperCase().startsWith('SW-')) {
      val = 'SW-' + val.replace(/^SW-?/i, '');
    }
    passportForm.friendCode = val;
  }
</script>

<div class="fixed inset-0 bg-[#006094]/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
  <div
    class="bg-white rounded-[36px] border-4 border-[#0084CC] max-w-lg w-full p-6 shadow-2xl relative"
    in:scale={{ duration: 300, start: 0.9, easing: backOut }}
  >
    <div class="text-center space-y-4">
      <div class="w-16 h-16 bg-[#FFF9E7] rounded-full border-2 border-[#0084CC] flex items-center justify-center text-4xl mx-auto shadow-inner">
        🦤
      </div>
      <div>
        <h2 class="text-2xl font-black text-[#0084CC]">Dodo Airlines Front Desk</h2>
        <p class="text-xs text-[#4A4A4A]/70 font-system mt-1 uppercase tracking-widest font-bold">
          PRINT YOUR FREQUENT FLYER PASSPORT
        </p>
      </div>

      <div class="bg-[#FFFCEF] border border-[#E6DFC7] p-3 rounded-2xl text-left flex gap-3">
        <span class="text-2xl">🗣️</span>
        <p class="text-xs text-[#4A4A4A] leading-relaxed">
          <strong>Orville:</strong> "Right-o! Welcome to Dodo Airlines. Before we can issue boarding passes or clear your seaplane for flight, let's print your official island passport! It'll take just 10 seconds!"
        </p>
      </div>

      <form onsubmit={handleSubmit} class="space-y-3.5 text-left text-xs">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-system font-black text-[#0084CC] mb-1 uppercase">VILLAGER NAME</label>
            <input
              type="text"
              bind:value={passportForm.villagerName}
              placeholder="e.g. Raymond"
              class="w-full bg-[#FAF8F2] border border-[#E6DFC7] rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#0084CC] focus:bg-white"
              maxlength="12"
              required
            />
          </div>
          <div>
            <label class="block text-xs font-system font-black text-[#0084CC] mb-1 uppercase">HOME ISLAND</label>
            <input
              type="text"
              bind:value={passportForm.islandName}
              placeholder="e.g. Peaches Cove"
              class="w-full bg-[#FAF8F2] border border-[#E6DFC7] rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#0084CC] focus:bg-white"
              maxlength="14"
              required
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-system font-black text-[#0084CC] mb-1 uppercase">TITLE PREFIX</label>
            <select
              bind:value={passportForm.titlePart1}
              class="w-full bg-[#FAF8F2] border border-[#E6DFC7] rounded-xl px-2 py-2 font-bold outline-none focus:border-[#0084CC] focus:bg-white"
            >
              {#each TITLE_PART_1 as p}
                <option value={p}>{p}</option>
              {/each}
            </select>
          </div>
          <div>
            <label class="block text-xs font-system font-black text-[#0084CC] mb-1 uppercase">TITLE SUFFIX</label>
            <select
              bind:value={passportForm.titlePart2}
              class="w-full bg-[#FAF8F2] border border-[#E6DFC7] rounded-xl px-2 py-2 font-bold outline-none focus:border-[#0084CC] focus:bg-white"
            >
              {#each TITLE_PART_2 as s}
                <option value={s}>{s}</option>
              {/each}
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-system font-black text-[#0084CC] mb-1 uppercase">SWITCH FRIEND CODE</label>
          <input
            type="text"
            value={passportForm.friendCode}
            oninput={updateFriendCode}
            placeholder="SW-1234-5678-9012"
            class="w-full bg-[#FAF8F2] border border-[#E6DFC7] rounded-xl px-3 py-2 font-system font-bold outline-none focus:border-[#0084CC] focus:bg-white"
            maxlength="17"
          />
        </div>

        <div>
          <label class="block text-xs font-system font-black text-[#0084CC] mb-1 uppercase">PORTRAIT PHOTO</label>
          <div class="flex gap-2 p-1.5 bg-[#FAF8F2] border border-[#E6DFC7] rounded-xl overflow-x-auto">
            {#each AVATAR_ICONS.slice(0, 10) as icon}
              <button
                type="button"
                onclick={() => passportForm.avatarIcon = icon.char}
                class="w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all cursor-pointer {passportForm.avatarIcon === icon.char ? 'bg-[#FFCC00] ring-2 ring-[#0084CC] scale-110 shadow-sm' : 'bg-white border hover:bg-slate-50'}"
              >
                {icon.char}
              </button>
            {/each}
          </div>
        </div>

        <!-- Seaplane Registration Section -->
        <div class="border-t border-[#E6DFC7]/60 pt-3 mt-3 space-y-3">
          <span class="block text-sm font-system font-black text-[#0084CC] uppercase tracking-wider">
            ✈️ Register Your Island Seaplane
          </span>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-system font-black text-[#85806B] mb-1 uppercase">PLANE MODEL</label>
              <select
                bind:value={passportForm.planeType}
                class="w-full bg-[#FAF8F2] border border-[#E6DFC7] rounded-xl px-2 py-1.5 font-bold outline-none focus:border-[#0084CC]"
              >
                <option value="Switch">🛩️ Switch Model (8 seats)</option>
                <option value="Switch 2">✈️ Switch 2 Model (12 seats)</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-system font-black text-[#85806B] mb-1 uppercase">LIVERY COLOR</label>
              <div class="flex gap-1.5 bg-[#FAF8F2] p-1 border border-[#E6DFC7] rounded-xl">
                {#each PLANE_COLORS as color}
                  <button
                    type="button"
                    onclick={() => passportForm.planeColor = color.id}
                    class="w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer {color.bg} {color.border} border-2 {(passportForm.planeColor || 'orange') === color.id ? 'scale-110 ring-2 ring-[#0084CC]' : 'opacity-70 hover:opacity-100'}"
                    title={color.name}
                  >
                    <span class="text-sm text-white">✈️</span>
                  </button>
                {/each}
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-2 mt-2">
          <button
            type="submit"
            class="w-full bg-[#FFCC00] hover:bg-[#FFD11A] text-[#006094] font-system font-black py-3 rounded-2xl border-b-4 border-[#CC9900] shadow-md transition-all uppercase tracking-wide text-xs cursor-pointer"
          >
            💾 PRINT MY PASSPORT & ENTER COUNTER
          </button>

          <div class="relative flex py-1 items-center">
            <div class="flex-grow border-t border-[#E6DFC7]/50"></div>
            <span class="flex-shrink mx-3 text-xs font-system font-black text-slate-400 uppercase tracking-wider">or</span>
            <div class="flex-grow border-t border-[#E6DFC7]/50"></div>
          </div>

          <button
            type="button"
            onclick={handleBrowseAsGuest}
            class="w-full bg-[#FAF8F2] hover:bg-slate-50 border border-slate-300 text-slate-600 font-system font-black py-2.5 rounded-2xl transition-all uppercase tracking-wide text-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-xs font-bold"
          >
            🏝️ Browse as Guest (No Passport)
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
