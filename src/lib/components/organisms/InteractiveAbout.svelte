<script lang="ts">
  import { dalStore } from '$lib/stores/dal.svelte';
  import AcnhBubble from '$lib/components/molecules/AcnhBubble.svelte';
  import { DIALOGS } from '$lib/constants/dialogs';
  import { fade, scale } from 'svelte/transition';
  import { backOut } from 'svelte/easing';
  import { Terminal, Code, Star, HeartHandshake } from '@lucide/svelte';

  let { onClose } = $props<{ onClose: () => void }>();

  type Step = 'intro' | 'project' | 'github' | 'closing';
  let currentStep = $state<Step>('intro');

  let typedText = $state('');
  let textDone = $state(false);
  let textTimer: ReturnType<typeof setInterval> | null = null;

  const dialogues: Record<Step, string> = {
    intro: DIALOGS.interactiveAbout.intro,
    project: DIALOGS.interactiveAbout.project,
    github: DIALOGS.interactiveAbout.github,
    closing: DIALOGS.interactiveAbout.closing
  };

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
        if (!dalStore.isMuted && fullText[idx - 1] !== ' ' && idx % 2 === 0) {
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
      if (textTimer) clearInterval(textTimer);
      typedText = dialogues[currentStep];
      textDone = true;
      dalStore.playSound('beep');
      return;
    }

    dalStore.playSound('beep');

    if (currentStep === 'intro') currentStep = 'project';
    else if (currentStep === 'project') currentStep = 'github';
    else if (currentStep === 'github') currentStep = 'closing';
    else if (currentStep === 'closing') onClose();
  }
</script>

<div class="fixed inset-0 bg-[#004e75]/60 backdrop-blur-md overflow-y-auto p-4 sm:p-8 flex flex-col items-center justify-start sm:justify-center" style="z-index: 100;">
  <!-- Dot Pattern Background -->
  <div class="absolute inset-0 w-full h-full opacity-50 pointer-events-none"></div>
  
  <div class="w-full max-w-4xl flex flex-col items-center justify-center gap-6 py-4 pb-48 sm:pb-56 relative z-10">
    
    {#if currentStep === 'project'}
      <div in:fade={{ duration: 300 }} class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl font-system">
        <div class="flex flex-col items-center p-6 rounded-[28px] border-4 bg-white/90 border-[#E0DBC5] shadow-lg text-center transform hover:scale-[1.02] transition-transform">
          <div class="w-16 h-16 bg-[#FFF9E7] border-3 border-[#0084CC] rounded-full flex items-center justify-center mb-4 shadow-sm">
            <HeartHandshake class="w-8 h-8 text-[#0084CC]" />
          </div>
          <h4 class="text-lg font-black text-[#006094] uppercase tracking-wider mb-2">Community Driven</h4>
          <p class="text-xs text-[#5D5745] leading-relaxed font-semibold">
            Built by a fan, for the fans. A free tool to enhance your island adventures and connect with players globally.
          </p>
        </div>

        <div class="flex flex-col items-center p-6 rounded-[28px] border-4 bg-white/90 border-[#E0DBC5] shadow-lg text-center transform hover:scale-[1.02] transition-transform">
          <div class="w-16 h-16 bg-[#FFF9E7] border-3 border-[#FFCC00] rounded-full flex items-center justify-center mb-4 shadow-sm">
            <Code class="w-8 h-8 text-[#FFCC00]" />
          </div>
          <h4 class="text-lg font-black text-[#006094] uppercase tracking-wider mb-2">Open Source</h4>
          <p class="text-xs text-[#5D5745] leading-relaxed font-semibold">
            The code is completely open! Developers can help improve the terminal, add new features, and squash bugs.
          </p>
        </div>
      </div>
    {/if}

    {#if currentStep === 'github'}
      <div in:scale={{ duration: 300, start: 0.95, easing: backOut }} class="w-full max-w-md bg-white rounded-[32px] border-4 border-[#333] p-6 shadow-2xl relative">
        <h3 class="text-lg font-black text-[#333] uppercase tracking-wide text-center mb-4 flex items-center justify-center gap-2">
          <Terminal class="w-6 h-6" /> GitHub Repository
        </h3>
        
        <div class="flex flex-col gap-4 text-center">
          <p class="text-sm font-semibold text-slate-600">
            Check out the source code, submit issues, or contribute to the project on GitHub!
          </p>
          
          <a
            href="https://github.com/Xophz" 
            target="_blank"
            rel="noopener noreferrer"
            class="w-full bg-[#24292e] hover:bg-[#1b1f23] text-white font-system font-black py-4 rounded-2xl shadow-md transition-all uppercase tracking-wide text-sm flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95"
            onclick={() => dalStore.playSound('success')}
          >
            <Star class="w-5 h-5 text-yellow-400" />
            View on GitHub
          </a>
        </div>
      </div>
    {/if}

  </div>
  
  <div class="fixed bottom-0 left-0 right-0 p-4 sm:p-8 pointer-events-none" style="z-index: 110;">
    <div class="mx-auto w-full max-w-7xl pointer-events-auto">
      <AcnhBubble
        title="Developer X"
        isIntro={true}
        onDismiss={advanceStep}
      >
        <div class="flex gap-4 items-start relative z-10">
          <div class="hidden sm:flex shrink-0 w-16 h-16 bg-[#333] border-[3px] border-[#666] rounded-full items-center justify-center text-4xl shadow-inner transform -rotate-6">
            👨‍💻
          </div>
          
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
  </div>
</div>
