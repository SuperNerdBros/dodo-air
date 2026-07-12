<script lang="ts">
  import { scale } from 'svelte/transition';
  import Box from '../atoms/Box.atom.svelte';
  import Text from '../atoms/Text.atom.svelte';
  import Button from '../atoms/Button.atom.svelte';
  import { dalStore } from '$lib/stores/dal.svelte';
</script>

{#if dalStore.showOrvilleIntro}
  <Box class="fixed inset-0 bg-[#006094]/40 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
    <Box transition={scale} class="bg-[#FAF8F2] rounded-[36px] border-4 border-[#E6DFC7] max-w-lg w-full p-6 shadow-2xl relative text-[#4A4A4A] my-8">
      <Box class="text-center space-y-4">
        <Box class="w-16 h-16 bg-[#FFFCEF] border-2 border-[#E6DFC7] rounded-full flex items-center justify-center text-4xl mx-auto shadow-inner">🦤</Box>
        <Box>
          <Text tag="h2" class="text-2xl font-black text-[#0084CC] font-system">Welcome to DAL Gateway</Text>
          <Text tag="p" class="text-sm text-slate-400 font-system mt-1 uppercase tracking-widest font-bold">AIRPORT TERMINAL CONNECTED</Text>
        </Box>
        <Box class="bg-white border-2 border-[#E6DFC7] p-4 rounded-2xl text-left flex gap-3 shadow-xs">
          <Text tag="span" class="text-2xl">🗣️</Text>
          <Text tag="p" class="text-xs text-[#4A4A4A] leading-relaxed">
            <Text tag="strong">Orville:</Text> "Right-o! Welcome to the Dodo Airlines online terminal! Here you can check the radar for active flights, broadcast your own Dodo Code, and coordinate island visits with pilots across the globe!"
          </Text>
        </Box>
        <Button
          onclick={() => {
            dalStore.playSound('beep');
            dalStore.showOrvilleIntro = false;
            localStorage.setItem('dal_orville_intro', 'hidden');
          }}
          class="btn-acnh btn-acnh-primary w-full py-3 text-xs"
        >
          🎫 ENTER AIRPORT TERMINAL
        </Button>
      </Box>
    </Box>
  </Box>
{/if}
