<script lang="ts">
  import type { Snippet } from 'svelte';
  
  import { dalStore } from '$lib/stores/dal.svelte';
  import { onMount, onDestroy } from 'svelte';

  let { title = 'Orville [DAL Dispatch]', children, onDismiss, dialogText = '' }: { title?: string, children?: Snippet, onDismiss?: () => void, dialogText?: string } = $props();

  const CHARACTER_COLORS: Record<string, { bg: string; text: string }> = {
    Orville: { bg: '#f1d23b', text: '#1b5b7f' },
    Wilbur: { bg: '#f1d23b', text: '#1b5b7f' },
    Luna: { bg: '#8a6bb5', text: '#ffffff' }
  };

  let characterKey = $derived(title.split(/[\s\[]/)[0]?.trim() || '');
  let colors = $derived(CHARACTER_COLORS[characterKey] || { bg: '#dd8530', text: '#482016' });

  let typedText = $state('');
  let textDone = $state(false);
  let textTimer: ReturnType<typeof setInterval> | null = null;

  $effect(() => {
    if (dialogText) {
      startTypewriter(dialogText);
    }
  });

  onMount(() => {
    if (!dialogText) {
      // If no text animation, play chatter once on mount to indicate a dialog popup
      dalStore.playSound('chatter');
    }
  });

  onDestroy(() => {
    if (textTimer) clearInterval(textTimer);
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
        if (!dalStore.isMuted && fullText[idx - 1] !== ' ' && idx % 2 === 0) {
          dalStore.playSound('chatter');
        }
      } else {
        if (textTimer) clearInterval(textTimer);
        textDone = true;
      }
    }, 22);
  }
</script>

<div class="pointer-events-auto mx-auto w-full lg:w-3/4 max-w-none lg:max-w-5xl dialogue" style="--dialogue-font: {title ? 'FOT-RodinBokutoh Pro EB' : 'FOT-Seurat Pro B'};">
  <div class="dialogue-blobs drop-shadow-lg relative">
    <div class="dialogue-blob-top"></div>
    <div class="dialogue-blob-bottom"></div>
    
    <div class="dialogue-text">
      {#if dialogText}
        <div class="flex gap-4 items-start relative z-10">
          <!-- Character Icon -->
          {#if characterKey === 'Orville' || characterKey === 'Wilbur'}
            <div class="hidden sm:flex shrink-0 w-16 h-16 bg-[#FFFCEF] border-[3px] border-[#D1BFAe] rounded-full items-center justify-center text-4xl shadow-inner transform -rotate-6">🦤</div>
          {:else if characterKey === 'Luna'}
            <div class="hidden sm:flex shrink-0 w-16 h-16 bg-[#F4EEFF] border-[3px] border-[#DDA0DD] rounded-full items-center justify-center text-4xl shadow-inner transform -rotate-6">💤</div>
          {/if}
          
          <!-- Animated / Typed Dialogue Text -->
          <div class="flex-1 py-1">
            <p class="text-xl sm:text-2xl {characterKey === 'Luna' ? 'text-[#4B0082]' : 'text-[#807256]'} leading-snug font-medium min-h-[3.6rem]">
              {typedText}
              {#if !textDone}
                <span class="inline-block w-1.5 h-5 bg-current animate-pulse ml-0.5 align-middle"></span>
              {/if}
            </p>
            {@render children?.()}
          </div>
        </div>
      {:else}
        {@render children?.()}
      {/if}
    </div>
  </div>
  
  {#if title}
    <div class="dialogue-character-wrap">
      <div class="dialogue-character" style="background-color: {colors.bg}; color: {colors.text};">{title}</div>
    </div>
  {/if}

  {#if onDismiss}
    <button class="dialogue-arrow group" aria-label="Dismiss Dialog" onclick={onDismiss}>
      <svg
        width="45"
        height="25"
        viewBox="0 0 45 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="transition-transform group-active:scale-95"
      >
        <path
          d="M22.5 25C18.0184 25 7.59473 12.6404 1.55317 4.96431C-0.122281 2.83559 1.72264 -0.179893 4.39835 0.243337C10.2831 1.17415 18.2164 2.28736 22.5 2.28736C26.7836 2.28736 34.7169 1.17415 40.6017 0.243339C43.2774 -0.17989 45.1223 2.83559 43.4468 4.96431C37.4053 12.6404 26.9816 25 22.5 25Z"
          fill="#F1AE04"
        />
      </svg>
    </button>
  {/if}
</div>
