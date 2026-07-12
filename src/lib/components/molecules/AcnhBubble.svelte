<script lang="ts">
  import type { Snippet } from 'svelte';
  
  let { title = 'Orville [DAL Dispatch]', children, onDismiss }: { title?: string, children?: Snippet, onDismiss?: () => void } = $props();
</script>

<div class="pointer-events-auto mx-auto w-full lg:w-3/4 max-w-none lg:max-w-5xl dialogue">
  <div class="dialogue-blobs drop-shadow-lg relative">
    <div class="dialogue-blob-top"></div>
    <div class="dialogue-blob-bottom"></div>
    
    <div class="dialogue-text">
      {@render children?.()}
    </div>
  </div>
  
  <div class="dialogue-character-wrap">
    <div class="dialogue-character">{title}</div>
  </div>

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
