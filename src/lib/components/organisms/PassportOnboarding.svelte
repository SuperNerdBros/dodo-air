<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import Box from '../atoms/Box.atom.svelte';
  import Text from '../atoms/Text.atom.svelte';
  import Button from '../atoms/Button.atom.svelte';
  import Input from '../atoms/Input.atom.svelte';
  import Select from '../atoms/Select.atom.svelte';
  import Form from '../atoms/Form.atom.svelte';
  import { dalStore } from '$lib/stores/dal.svelte';
  import { TITLE_PART_1, TITLE_PART_2, AVATAR_ICONS } from '$lib/types';

  function handleSavePassport(e: Event) {
    e.preventDefault();
    if (!dalStore.passportForm.villagerName.trim() || !dalStore.passportForm.islandName.trim()) return;
    
    dalStore.passport = {
      ...dalStore.passportForm,
      hasCreated: true,
      hasCustomized: true
    };
    localStorage.setItem('dal_passport', JSON.stringify(dalStore.passport));
    dalStore.isEditingPassport = false;
    dalStore.showPassportDrawer = false;
    dalStore.playSound('success');
  }
</script>

{#if !dalStore.passport.hasCreated}
  <Box class="fixed inset-0 bg-[#006094]/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
    <Box transition={scale} class="bg-white rounded-[36px] border-4 border-[#0084CC] max-w-lg w-full p-6 shadow-2xl relative">
      <Box class="text-center space-y-4">
        <Box class="w-16 h-16 bg-[#FFF9E7] rounded-full border-2 border-[#0084CC] flex items-center justify-center text-4xl mx-auto shadow-inner">
          🦤
        </Box>
        <Box>
          <Text tag="h2" class="text-2xl font-black text-[#0084CC]">Dodo Airlines Front Desk</Text>
          <Text tag="p" class="text-xs text-[#4A4A4A]/70 font-mono mt-1 uppercase tracking-widest font-bold">
            PRINT YOUR FREQUENT FLYER PASSPORT
          </Text>
        </Box>

        <Box class="bg-[#FFFCEF] border border-[#E6DFC7] p-3 rounded-2xl text-left flex gap-3">
          <Text tag="span" class="text-2xl">🗣️</Text>
          <Text tag="p" class="text-xs text-[#4A4A4A] leading-relaxed">
            <Text tag="strong">Orville:</Text> "Right-o! Welcome to Dodo Airlines. Before we can issue boarding passes or clear your seaplane for flight, let's print your official island passport! It'll take just 10 seconds!"
          </Text>
        </Box>

        <Form onsubmit={handleSavePassport} class="space-y-3.5 text-left text-xs">
          <Box class="grid grid-cols-2 gap-3">
            <Box>
              <Text tag="label" class="block text-[9px] font-mono font-black text-[#0084CC] mb-1 uppercase">VILLAGER NAME</Text>
              <Input
                type="text"
                bind:value={dalStore.passportForm.villagerName}
                placeholder="e.g. Raymond"
                class="w-full bg-[#FAF8F2] border border-[#E6DFC7] rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#0084CC] focus:bg-white"
                maxlength={12}
                required
              />
            </Box>
            <Box>
              <Text tag="label" class="block text-[9px] font-mono font-black text-[#0084CC] mb-1 uppercase">HOME ISLAND</Text>
              <Input
                type="text"
                bind:value={dalStore.passportForm.islandName}
                placeholder="e.g. Peaches Cove"
                class="w-full bg-[#FAF8F2] border border-[#E6DFC7] rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#0084CC] focus:bg-white"
                maxlength={14}
                required
              />
            </Box>
          </Box>

          <Box class="grid grid-cols-2 gap-3">
            <Box>
              <Text tag="label" class="block text-[9px] font-mono font-black text-[#0084CC] mb-1 uppercase">TITLE PREFIX</Text>
              <Select
                bind:value={dalStore.passportForm.titlePart1}
                class="w-full bg-[#FAF8F2] border border-[#E6DFC7] rounded-xl px-2 py-2 font-bold outline-none focus:border-[#0084CC] focus:bg-white"
              >
                {#each TITLE_PART_1 as p}
                  <option value={p}>{p}</option>
                {/each}
              </Select>
            </Box>
            <Box>
              <Text tag="label" class="block text-[9px] font-mono font-black text-[#0084CC] mb-1 uppercase">TITLE SUFFIX</Text>
              <Select
                bind:value={dalStore.passportForm.titlePart2}
                class="w-full bg-[#FAF8F2] border border-[#E6DFC7] rounded-xl px-2 py-2 font-bold outline-none focus:border-[#0084CC] focus:bg-white"
              >
                {#each TITLE_PART_2 as s}
                  <option value={s}>{s}</option>
                {/each}
              </Select>
            </Box>
          </Box>

          <Box>
            <Text tag="label" class="block text-[9px] font-mono font-black text-[#0084CC] mb-1 uppercase">SWITCH FRIEND CODE</Text>
            <Input
              type="text"
              value={dalStore.passportForm.friendCode}
              oninput={(e) => {
                let val = (e.target as HTMLInputElement).value;
                if (!val.toUpperCase().startsWith('SW-')) {
                  val = 'SW-' + val.replace(/^SW-?/i, '');
                }
                dalStore.passportForm.friendCode = val;
              }}
              placeholder="SW-1234-5678-9012"
              class="w-full bg-[#FAF8F2] border border-[#E6DFC7] rounded-xl px-3 py-2 font-mono font-bold outline-none focus:border-[#0084CC] focus:bg-white"
              maxlength={17}
            />
          </Box>

          <Box>
            <Text tag="label" class="block text-[9px] font-mono font-black text-[#0084CC] mb-1 uppercase">PORTRAIT PHOTO</Text>
            <Box class="flex gap-2 p-1.5 bg-[#FAF8F2] border border-[#E6DFC7] rounded-xl overflow-x-auto">
              {#each AVATAR_ICONS.slice(0, 10) as icon}
                <Button
                  type="button"
                  onclick={() => dalStore.passportForm.avatarIcon = icon.char}
                  class={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all ${
                    dalStore.passportForm.avatarIcon === icon.char ? 'bg-[#FFCC00] ring-2 ring-[#0084CC] scale-110 shadow-sm' : 'bg-white border hover:bg-slate-50'
                  }`}
                >
                  {icon.char}
                </Button>
              {/each}
            </Box>
          </Box>

          <Button
            type="submit"
            class="w-full bg-[#FFCC00] hover:bg-[#FFD11A] text-[#006094] font-display font-black py-3 rounded-2xl border-b-4 border-[#CC9900] shadow-md transition-all uppercase tracking-wide text-xs mt-2"
          >
            💾 PRINT MY PASSPORT & ENTER COUNTER
          </Button>
        </Form>
      </Box>
    </Box>
  </Box>
{/if}
