<script lang="ts">
  import { fly } from 'svelte/transition';
  import Box from '../atoms/Box.atom.svelte';
  import Text from '../atoms/Text.atom.svelte';
  import Button from '../atoms/Button.atom.svelte';
  import { dalStore } from '$lib/stores/dal.svelte';
</script>

{#if dalStore.showOrvilleIntro}
  <Box class="fixed inset-0 z-[100] pointer-events-none flex flex-col justify-end p-4 pb-8 sm:p-8">
    <Box transition={fly={{ y: 50, duration: 300 }}} class="pointer-events-auto mx-auto w-full max-w-3xl relative">
      <!-- Name badge -->
      <Box class="absolute -top-6 left-8 bg-[#FDF5E6] border-[4px] border-[#D1BFAe] rounded-full px-6 py-1 z-10 shadow-sm transform -rotate-2">
        <Text tag="span" class="text-[#7D6B56] font-black text-xl tracking-wider font-system">Orville</Text>
      </Box>

      <!-- Dialog Bubble -->
      <Box class="bg-[#FFF9E6] border-[4px] border-[#D1BFAe] p-6 sm:p-8 pt-8 shadow-2xl relative" style="border-radius: 40px; border-top-left-radius: 12px;">
        <!-- Inner decorative border line -->
        <Box class="absolute inset-2 border-[2px] border-dashed border-[#D1BFAe]/50 pointer-events-none" style="border-radius: 32px; border-top-left-radius: 6px;"></Box>

        <!-- Wavy Top/Bottom accents via SVG -->
        <Box class="absolute inset-x-8 -top-[14px] h-[14px] bg-repeat-x opacity-70 pointer-events-none" style="background-image: url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2214%22 viewBox=%220 0 40 14%22%3E%3Cpath d=%22M 0 14 Q 10 0 20 14 T 40 14%22 fill=%22%23FDF5E6%22 stroke=%22%23D1BFAe%22 stroke-width=%224%22/%3E%3C/svg%3E'); background-size: 40px 14px; background-position: center bottom;"></Box>
        <Box class="absolute inset-x-8 -bottom-[14px] h-[14px] bg-repeat-x opacity-70 pointer-events-none rotate-180" style="background-image: url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2214%22 viewBox=%220 0 40 14%22%3E%3Cpath d=%22M 0 14 Q 10 0 20 14 T 40 14%22 fill=%22%23FDF5E6%22 stroke=%22%23D1BFAe%22 stroke-width=%224%22/%3E%3C/svg%3E'); background-size: 40px 14px; background-position: center bottom;"></Box>

        <Box class="flex gap-4 items-start relative z-10 mt-2">
          <!-- Character Icon -->
          <Box class="hidden sm:flex shrink-0 w-16 h-16 bg-[#FFFCEF] border-[3px] border-[#D1BFAe] rounded-full items-center justify-center text-4xl shadow-inner transform -rotate-6">🦤</Box>
          
          <!-- Text Content -->
          <Box class="flex-1">
            <Text tag="p" class="text-xl sm:text-2xl text-[#7D6B56] leading-snug font-medium font-system">
              "Right-o! Welcome to the Dodo Airlines online terminal! Here you can check the radar for active flights, broadcast your own Dodo Code, and coordinate island visits with pilots across the globe!"
            </Text>
          </Box>
        </Box>

        <!-- Action Button -->
        <Box class="mt-6 flex justify-end relative z-10">
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
        </Box>
      </Box>
    </Box>
  </Box>
{/if}
