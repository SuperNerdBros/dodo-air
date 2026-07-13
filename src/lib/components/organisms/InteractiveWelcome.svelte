<script lang="ts">
  import { formatFriendCode } from '$lib/utils/format';
  import type { Passport } from '$lib/studio-types';
  import { dalStore } from '$lib/stores/dal.svelte';
  import AcnhBubble from '$lib/components/molecules/AcnhBubble.svelte';
  import {
    TITLE_PART_1,
    TITLE_PART_2,
    AVATAR_ICONS,
    PLANE_COLORS,
    generateRandomFriendCode
  } from '$lib/utils/constants';
  import { scale, fade, fly } from 'svelte/transition';
  import { backOut } from 'svelte/easing';
  import { Plane, Moon, Ticket, Mail, ShieldAlert, Award } from '@lucide/svelte';

  let {
    onSavePassport,
    isMuted = false
  } = $props<{
    onSavePassport: (p: Passport) => void;
    isMuted?: boolean;
  }>();

  // Dialogue steps
  type Step = 'welcome' | 'intro' | 'modes' | 'walkthrough' | 'auth_choice' | 'verify_code' | 'print_passport';
  let currentStep = $state<Step>('welcome');

  // Interactive modes helper
  let selectedModePreview = $state<'DAL' | 'LUNA'>('DAL');

  // Typewriter state
  let typedText = $state('');
  let textDone = $state(false);
  let textTimer: ReturnType<typeof setInterval> | null = null;

  // Form states
  let email = $state('');
  let verificationCode = $state('');
  let isLoading = $state(false);
  let errorMsg = $state('');

  // Passport creation form state
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

  const dialogues: Record<Step, string> = {
    welcome: "Right-o! Welcome to the front desk at Dodo Airlines. 🦤 I'm Orville, your dispatcher, gate manager, and personal flight coordinator today!",
    intro: "This online terminal is the ultimate community hub! Here, you can search active gates to visit other islands, or broadcast your own Dodo Code™ to host guests!",
    modes: "We support two travel modes depending on your flying preference. We've got standard flight departures and relaxing dream visits! Take a peek at both:",
    walkthrough: "The flight process is simple: If you're hosting, file a flight plan to list your gate. If you're flying, just browse active departures, check in, get the Dodo Code™, and fly!",
    auth_choice: "Before you head to the gate, let's look up your Frequent Flyer Passport! This helps builds trust in our community. Enter your email so we can send your a secure access code.",
    verify_code: "Excellent! I've just sent a 6-digit flight access code to your email. Enter it below to retrieve your passport profile!",
    print_passport: "Wonderful! We've retrieved your credentials. Let's customize your official Frequent Flyer Passport and register your island seaplane!"
  };

  // Run typewriter effect when step changes
  $effect(() => {
    startTypewriter(dialogues[currentStep]);
  });

  function startTypewriter(fullText: string) {
    if (textTimer) clearInterval(textTimer);
    typedText = '';
    textDone = false;
    let idx = 0;

    textTimer = setInterval(() => {
      if (idx < fullText.length) {
        typedText += fullText[idx];
        idx++;
        // Play chatter beep sound for non-space characters occasionally
        if (!isMuted && fullText[idx - 1] !== ' ' && idx % 2 === 0) {
          dalStore.playSound('chatter');
        }
      } else {
        if (textTimer) clearInterval(textTimer);
        textDone = true;
      }
    }, 22);
  }

  function advanceStep() {
    if (!textDone) {
      // Skip typing and show full text immediately
      if (textTimer) clearInterval(textTimer);
      typedText = dialogues[currentStep];
      textDone = true;
      dalStore.playSound('beep');
      return;
    }

    dalStore.playSound('beep');
    errorMsg = '';

    if (currentStep === 'welcome') {
      currentStep = 'intro';
    } else if (currentStep === 'intro') {
      currentStep = 'modes';
    } else if (currentStep === 'modes') {
      currentStep = 'walkthrough';
    } else if (currentStep === 'walkthrough') {
      currentStep = 'auth_choice';
    }
  }

  async function handleEmailSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!email) {
      errorMsg = 'Please enter a valid email address.';
      return;
    }
    errorMsg = '';
    isLoading = true;
    try {
      const res = await fetch('/wp-json/dodo-air/v1/auth/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.dev_code) {
          console.log('%c[DEV] Temporary Access Code: ' + data.dev_code, 'color: #F1AE04; font-weight: bold; font-size: 14px;');
        }
        currentStep = 'verify_code';
        dalStore.playSound('success');
      } else {
        const data = await res.json();
        errorMsg = data.message || 'Failed to request code. Please try again.';
        dalStore.playSound('beep');
      }
    } catch (err) {
      errorMsg = 'A connection error occurred. Please try again.';
      dalStore.playSound('beep');
    } finally {
      isLoading = false;
    }
  }

  async function handleCodeVerify(e: SubmitEvent) {
    e.preventDefault();
    if (!verificationCode) {
      errorMsg = 'Please enter the access code.';
      return;
    }
    errorMsg = '';
    isLoading = true;
    try {
      const res = await fetch('/wp-json/dodo-air/v1/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode })
      });
      if (res.ok) {
        dalStore.playSound('success');
        
        // Fetch current state which will now populate the passport from server-side database
        const stateRes = await fetch('/wp-json/dodo-air/v1/state');
        if (stateRes.ok) {
          const stateData = await stateRes.json();
          if (stateData.myPassport && stateData.myPassport.hasCreated) {
            // Already has a passport! Direct save and exit onboarding.
            onSavePassport({ ...stateData.myPassport, hasCreated: true });
            dalStore.isLoggedIn = true;
            dalStore.userEmail = email;
            return;
          }
        }
        
        // No passport profile found, let them customize one
        currentStep = 'print_passport';
      } else {
        const data = await res.json();
        errorMsg = data.message || 'Invalid access code. Please check it and try again.';
        dalStore.playSound('beep');
      }
    } catch (err) {
      errorMsg = 'Verification failed. A network error occurred.';
      dalStore.playSound('beep');
    } finally {
      isLoading = false;
    }
  }

  function handleBrowseAsGuest() {
    dalStore.playSound('beep');
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

  function handleSaveNewPassport(e: SubmitEvent) {
    e.preventDefault();
    if (!passportForm.villagerName.trim() || !passportForm.islandName.trim()) {
      errorMsg = 'Please enter your villager name and island name.';
      return;
    }
    dalStore.playSound('success');
    
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
    
    // Set stores loggedIn status if we are coming from verified step
    if (email) {
      dalStore.isLoggedIn = true;
      dalStore.userEmail = email;
    }

    onSavePassport(updated);
  }

  function updateFriendCode(e: Event) {
    const target = e.target as HTMLInputElement;
    const formatted = formatFriendCode(target.value);
    passportForm.friendCode = formatted;
    target.value = formatted;
  }
</script>

<div class="fixed inset-0 bg-[#004e75]/60 backdrop-blur-md overflow-y-auto z-50 p-4 sm:p-8 flex flex-col justify-start">
  <div class="mx-auto w-full max-w-4xl flex flex-col items-center gap-6 py-4 min-h-min">
    
    <!-- Orville Dialogue Bubble wrapper (Now at the top) -->
    <div class="w-full relative">
      <AcnhBubble
        title="Orville"
        onDismiss={(currentStep !== 'auth_choice' && currentStep !== 'verify_code' && currentStep !== 'print_passport') ? advanceStep : undefined}
      >
        <div class="flex gap-4 items-start relative z-10">
          <!-- Character Icon -->
          <div class="hidden sm:flex shrink-0 w-16 h-16 bg-[#FFFCEF] border-[3px] border-[#D1BFAe] rounded-full items-center justify-center text-4xl shadow-inner transform -rotate-6">🦤</div>
          
          <!-- Animated / Typed Dialogue Text -->
          <div class="flex-1 py-1">
            <p class="text-xl sm:text-2xl text-[#807256] leading-snug font-medium min-h-[3.6rem]">
              {typedText}
              {#if !textDone}
                <span class="inline-block w-1.5 h-5 bg-[#807256] animate-pulse ml-0.5"></span>
              {/if}
            </p>
          </div>
        </div>
      </AcnhBubble>
    </div>

    <!-- Visual Modes Demo Card Overlay during Modes step (Below the bubble) -->
    {#if currentStep === 'modes'}
      <div in:fade={{ duration: 300 }} class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        <button
          onclick={() => { selectedModePreview = 'DAL'; dalStore.playSound('beep'); }}
          class="flex flex-col items-center p-6 rounded-[28px] border-4 transition-all shadow-lg text-left cursor-pointer {selectedModePreview === 'DAL' ? 'bg-[#FFCC00] border-[#E5B800] scale-105' : 'bg-white/90 hover:bg-white border-[#E0DBC5] scale-98'}"
        >
          <div class="w-16 h-16 bg-[#FFF9E7] border-3 border-[#0084CC] rounded-full flex items-center justify-center text-4xl mb-4 shadow-sm">
            🛩️
          </div>
          <h3 class="text-xl font-black text-[#006094] uppercase tracking-wider mb-2">DAL Multiplayer Mode</h3>
          <p class="text-xs text-[#5D5745] leading-relaxed font-semibold">
            Open your airport gates with custom Dodo Codes. Host multiple standby passengers or fly to active global departures!
          </p>
        </button>

        <button
          onclick={() => { selectedModePreview = 'LUNA'; dalStore.playSound('beep'); }}
          class="flex flex-col items-center p-6 rounded-[28px] border-4 transition-all shadow-lg text-left cursor-pointer {selectedModePreview === 'LUNA' ? 'bg-[#FFCC00] border-[#E5B800] scale-105' : 'bg-white/90 hover:bg-white border-[#E0DBC5] scale-98'}"
        >
          <div class="w-16 h-16 bg-[#FFF9E7] border-3 border-[#9b51e0] rounded-full flex items-center justify-center text-4xl mb-4 shadow-sm">
            💤
          </div>
          <h3 class="text-xl font-black text-[#692aa1] uppercase tracking-wider mb-2">Luna Dream Mode</h3>
          <p class="text-xs text-[#5D5745] leading-relaxed font-semibold">
            Share and visit peaceful dream version islands. Browse cataloged Dream Addresses without waiting for open gates!
          </p>
        </button>
      </div>
    {/if}

    <!-- Visual explanation content during walkthrough/auth steps (Below the bubble) -->
    {#if currentStep === 'walkthrough'}
      <div in:fade={{ duration: 300 }} class="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-2xl font-system">
        <div class="flex-1 bg-white/90 backdrop-blur-sm rounded-[24px] border-3 border-[#E0DBC5] p-5 text-center shadow-sm">
          <Award class="w-10 h-10 mx-auto text-amber-500 mb-2" />
          <h4 class="font-black text-[#006094] uppercase text-sm mb-1">1. File Flight Plan</h4>
          <p class="text-[11px] text-[#6b6553] leading-normal font-semibold">Host guests, earn FF Miles stamps, and show off your island paradise.</p>
        </div>
        <div class="flex-1 bg-white/90 backdrop-blur-sm rounded-[24px] border-3 border-[#E0DBC5] p-5 text-center shadow-sm">
          <Ticket class="w-10 h-10 mx-auto text-sky-500 mb-2" />
          <h4 class="font-black text-[#006094] uppercase text-sm mb-1">2. Board Departures</h4>
          <p class="text-[11px] text-[#6b6553] leading-normal font-semibold">Search gates, request standby seats, and safely verify Dodo codes before flight.</p>
        </div>
        <div class="flex-1 bg-white/90 backdrop-blur-sm rounded-[24px] border-3 border-[#E0DBC5] p-5 text-center shadow-sm">
          <Plane class="w-10 h-10 mx-auto text-teal-500 mb-2" />
          <h4 class="font-black text-[#006094] uppercase text-sm mb-1">3. Clear Skies</h4>
          <p class="text-[11px] text-[#6b6553] leading-normal font-semibold">A beautiful, automated flight terminal with real-time airport radio chat.</p>
        </div>
      </div>
    {/if}

    <!-- Custom Auth Form Cards positioned below dialog during auth flows -->
    {#if currentStep === 'auth_choice'}
      <div in:scale={{ duration: 300, start: 0.95, easing: backOut }} class="w-full max-w-md bg-white rounded-[32px] border-4 border-[#0084CC] p-6 shadow-2xl relative">
        <h3 class="text-lg font-black text-[#006094] uppercase tracking-wide text-center mb-4 flex items-center justify-center gap-2">
          <Mail class="w-5 h-5" /> Access Your Passport
        </h3>
        
        <form onsubmit={handleEmailSubmit} class="space-y-4 text-left">
          <div>
            <label class="block text-xs font-black text-[#0084CC] mb-1.5 uppercase font-system tracking-wider">EMAIL ADDRESS</label>
            <input
              type="email"
              bind:value={email}
              placeholder="e.g. resident@island.com"
              class="w-full bg-[#FAF8F2] border-2 border-[#E6DFC7] rounded-2xl px-4 py-3 text-sm font-bold text-[#0084CC] placeholder-slate-300 outline-none focus:border-[#0084CC] focus:bg-white"
              disabled={isLoading}
              required
            />
          </div>

          {#if errorMsg}
            <div class="text-red-500 font-bold text-xs bg-red-50 p-3 rounded-xl border border-red-200 flex items-start gap-2">
              <ShieldAlert class="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          {/if}

          <div class="flex flex-col gap-2 pt-2">
            <button
              type="submit"
              class="w-full bg-[#FFCC00] hover:bg-[#FFD11A] text-[#006094] font-system font-black py-3.5 rounded-2xl border-b-4 border-[#CC9900] shadow-md transition-all uppercase tracking-wide text-xs cursor-pointer flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {#if isLoading}
                <div class="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-[#006094]"></div>
                <span>Sending Code...</span>
              {:else}
                <span>📩 Send Passport Code</span>
              {/if}
            </button>

            <!-- 

            <div class="relative flex py-1 items-center">
              <div class="flex-grow border-t border-[#E6DFC7]/50"></div>
              <span class="flex-shrink mx-3 text-xs font-black text-slate-400 uppercase tracking-wider">or</span>
              <div class="flex-grow border-t border-[#E6DFC7]/50"></div>
            </div>

            <button
              type="button"
              onclick={handleBrowseAsGuest}
              class="w-full bg-[#FAF8F2] hover:bg-slate-50 border border-slate-300 text-slate-600 font-system font-black py-3 rounded-2xl transition-all uppercase tracking-wide text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              disabled={isLoading}
            >
              🏝️ Just Browse as Guest
            </button> 
            
            -->
          </div>
        </form>
      </div>
    {/if}

    {#if currentStep === 'verify_code'}
      <div in:scale={{ duration: 300, start: 0.95, easing: backOut }} class="w-full max-w-md bg-white rounded-[32px] border-4 border-[#0084CC] p-6 shadow-2xl relative">
        <h3 class="text-lg font-black text-[#006094] uppercase tracking-wide text-center mb-4 flex items-center justify-center gap-2">
          🔑 Verify Security Passcode
        </h3>
        
        <form onsubmit={handleCodeVerify} class="space-y-4 text-left">
          <div>
            <label class="block text-xs font-black text-[#0084CC] mb-1.5 uppercase font-system tracking-wider text-center">
              ENTER 6-DIGIT CODE SENT TO <strong class="text-slate-700">{email}</strong>
            </label>
            <input
              type="text"
              bind:value={verificationCode}
              placeholder="000000"
              class="w-full bg-[#FAF8F2] border-2 border-[#E6DFC7] rounded-2xl px-4 py-3 text-xl tracking-widest text-center font-black text-[#0084CC] placeholder-slate-300 outline-none focus:border-[#0084CC] focus:bg-white"
              maxlength="6"
              disabled={isLoading}
              required
            />
          </div>

          {#if errorMsg}
            <div class="text-red-500 font-bold text-xs bg-red-50 p-3 rounded-xl border border-red-200 flex items-start gap-2">
              <ShieldAlert class="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          {/if}

          <div class="flex gap-3 pt-2">
            <button
              type="button"
              onclick={() => { currentStep = 'auth_choice'; errorMsg = ''; }}
              class="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-system font-black py-3.5 rounded-2xl transition-all uppercase tracking-wide text-xs cursor-pointer"
              disabled={isLoading}
            >
              Back
            </button>
            <button
              type="submit"
              class="flex-1 bg-[#0084CC] hover:bg-[#0099FF] text-white font-system font-black py-3.5 rounded-2xl border-b-4 border-[#006699] shadow-md transition-all uppercase tracking-wide text-xs cursor-pointer flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {#if isLoading}
                <div class="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white"></div>
                <span>Verifying...</span>
              {:else}
                <span>Access Terminal ✈️</span>
              {/if}
            </button>
          </div>
        </form>
      </div>
    {/if}

    {#if currentStep === 'print_passport'}
      <div in:scale={{ duration: 300, start: 0.95, easing: backOut }} class="w-full max-w-lg bg-white rounded-[32px] border-4 border-[#0084CC] p-6 shadow-2xl relative">
        <h3 class="text-lg font-black text-[#0084CC] uppercase tracking-wider text-center mb-4">
          🦤 Dodo Airlines Flight Registry
        </h3>
        
        <form onsubmit={handleSaveNewPassport} class="space-y-4 text-left text-xs font-semibold">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-black text-[#0084CC] mb-1 uppercase font-system">Villager Name</label>
              <input
                type="text"
                bind:value={passportForm.villagerName}
                placeholder="e.g. Isabelle"
                class="w-full bg-[#FAF8F2] border border-[#E6DFC7] rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#0084CC] focus:bg-white"
                maxlength="12"
                required
              />
            </div>
            <div>
              <label class="block text-[10px] font-black text-[#0084CC] mb-1 uppercase font-system">Island Name</label>
              <input
                type="text"
                bind:value={passportForm.islandName}
                placeholder="e.g. Sugar Cove"
                class="w-full bg-[#FAF8F2] border border-[#E6DFC7] rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#0084CC] focus:bg-white"
                maxlength="14"
                required
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-black text-[#0084CC] mb-1 uppercase font-system">Passport Title Prefix</label>
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
              <label class="block text-[10px] font-black text-[#0084CC] mb-1 uppercase font-system">Passport Title Suffix</label>
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
            <label class="block text-[10px] font-black text-[#0084CC] mb-1 uppercase font-system">Switch Friend Code</label>
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
            <label class="block text-[10px] font-black text-[#0084CC] mb-1 uppercase font-system">Portrait Avatar Photo</label>
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

          <div class="border-t border-[#E6DFC7]/60 pt-3 space-y-3">
            <span class="block text-xs font-black text-[#0084CC] uppercase tracking-wider">
              ✈️ Register Your Seaplane livery
            </span>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[10px] font-black text-[#85806B] mb-1 uppercase font-system">PLANE MODEL</label>
                <select
                  bind:value={passportForm.planeType}
                  class="w-full bg-[#FAF8F2] border border-[#E6DFC7] rounded-xl px-2 py-1.5 font-bold outline-none focus:border-[#0084CC]"
                >
                  <option value="Switch">🛩️ Switch Model (8 seats)</option>
                  <option value="Switch 2">✈️ Switch 2 Model (12 seats)</option>
                </select>
              </div>

              <div>
                <label class="block text-[10px] font-black text-[#85806B] mb-1 uppercase font-system">PLANE COLOR</label>
                <div class="flex gap-1.5 bg-[#FAF8F2] p-1 border border-[#E6DFC7] rounded-xl">
                  {#each PLANE_COLORS as color}
                    <button
                      type="button"
                      onclick={() => passportForm.planeColor = color.id}
                      class="w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer {color.bg} {color.border} border-2 {(passportForm.planeColor || 'orange') === color.id ? 'scale-110 ring-2 ring-[#0084CC]' : 'opacity-70 hover:opacity-100'}"
                      title={color.name}
                    >
                      <span class="text-xs text-white">✈️</span>
                    </button>
                  {/each}
                </div>
              </div>
            </div>
          </div>

          {#if errorMsg}
            <div class="text-red-500 font-bold text-xs bg-red-50 p-2.5 rounded-xl border border-red-200">
              {errorMsg}
            </div>
          {/if}

          <button
            type="submit"
            class="w-full bg-[#FFCC00] hover:bg-[#FFD11A] text-[#006094] font-system font-black py-3.5 rounded-2xl border-b-4 border-[#CC9900] shadow-md transition-all uppercase tracking-wide text-xs cursor-pointer mt-2"
          >
            💾 PRINT PASSPORT & ENTER COUNTER
          </button>
        </form>
      </div>
    {/if}
  </div>
</div>
