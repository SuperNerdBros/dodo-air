<script lang="ts">
  import { fly } from 'svelte/transition';
  import Box from '../atoms/Box.atom.svelte';
  import Button from '../atoms/Button.atom.svelte';
  import { dalStore } from '$lib/stores/dal.svelte';
  import AcnhBubble from '../molecules/AcnhBubble.svelte';
</script>

{#if dalStore.showOrvilleIntro}
  <Box class="fixed inset-0 z-[100] pointer-events-none flex flex-col justify-end p-4 pb-8 sm:p-8">
    <div transition:fly={{ y: 50, duration: 300 }} class="w-full">
      <AcnhBubble
        title="Orville [Tour Guide]"
        dialogText="Right-o! Welcome to the Dodo Airlines online terminal! Here you can check the radar for active flights, broadcast your own Dodo Code, and coordinate island visits with pilots across the globe!"
        onDismiss={() => {
          dalStore.playSound('beep');
          dalStore.showOrvilleIntro = false;
          localStorage.setItem('dal_orville_intro', 'hidden');
        }}
      >
        <div class="mt-6 flex justify-end relative z-10">
          <Button
            onclick={() => {
              dalStore.playSound('beep');
              dalStore.showOrvilleIntro = false;
              localStorage.setItem('dal_orville_intro', 'hidden');
            }}
            class="btn-acnh btn-acnh-primary px-8 py-3 text-sm rounded-full transform hover:scale-105 transition-transform"
          >
            🎫 ENTER AIRPORT TERMINAL
          </Button>
        </div>
      </AcnhBubble>
    </div>
  </Box>
{/if}
