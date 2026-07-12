<script lang="ts">
  import { onMount } from 'svelte';
  import Box from '../atoms/Box.atom.svelte';
  import TerminalHeader from '../organisms/TerminalHeader.svelte';
  import TabsNav from '../organisms/TabsNav.svelte';
  import BookTab from '../organisms/BookTab.svelte';
  import HubTab from '../organisms/HubTab.svelte';
  import RadioTab from '../organisms/RadioTab.svelte';
  import PassportOnboarding from '../organisms/PassportOnboarding.svelte';
  import PassportDrawer from '../organisms/PassportDrawer.svelte';
  import PassportEdit from '../organisms/PassportEdit.svelte';
  import StandbyModal from '../organisms/StandbyModal.svelte';
  import BoardingTicket from '../organisms/BoardingTicket.svelte';
  import MilesModal from '../organisms/MilesModal.svelte';
  import OrvilleIntro from '../organisms/OrvilleIntro.svelte';
  import { dalStore } from '$lib/stores/dal.svelte';

  onMount(() => {
    dalStore.fetchState();
    
    // Polling every 5 seconds
    const interval = setInterval(() => dalStore.fetchState(false), 5000);
    
    // Timer for clock
    const clockInterval = setInterval(() => {
      dalStore.liveTime = new Date();
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(clockInterval);
    };
  });
</script>

<Box class="min-h-screen bg-[#0084CC] text-[#4A4A4A] p-2 sm:p-4 lg:p-6 font-sans relative overflow-x-hidden selection:bg-[#FFCC00] selection:text-[#006094]">
  <Box class="absolute inset-0 pointer-events-none opacity-5">
    <Box class="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjIiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')] opacity-50"></Box>
  </Box>

  <TerminalHeader />

  {#if dalStore.passport.hasCreated}
    <TabsNav />

    <Box class="w-full max-w-7xl mx-auto mt-6 relative z-10 pb-20">
      {#if dalStore.currentTab === 'book'}
        <BookTab />
      {:else if dalStore.currentTab === 'hub'}
        <HubTab />
      {:else if dalStore.currentTab === 'radio'}
        <RadioTab />
      {/if}
    </Box>
  {/if}

  <PassportOnboarding />
  <PassportDrawer />
  <PassportEdit />
  <StandbyModal />
  <BoardingTicket />
  <MilesModal />
  <OrvilleIntro />
</Box>

<style>
  :global(body) {
    background-color: #0084CC;
    font-family: 'Nunito', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
</style>
