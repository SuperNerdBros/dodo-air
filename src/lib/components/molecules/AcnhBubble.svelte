<script lang="ts">
  import type { Snippet } from 'svelte';
  
  let { title = 'Orville [DAL Dispatch]', children }: { title?: string, children?: Snippet } = $props();
</script>

<div class="pointer-events-auto mx-auto w-full lg:w-3/4 max-w-none lg:max-w-5xl dialogue">
  <div class="dialogue-blobs drop-shadow-lg">
    <div class="dialogue-blob-top"></div>
    <div class="dialogue-blob-bottom"></div>
    
    <div class="dialogue-text">
      {@render children?.()}
    </div>
  </div>
  
  <div class="dialogue-character-wrap">
    <div class="dialogue-character">{title}</div>
  </div>
</div>
