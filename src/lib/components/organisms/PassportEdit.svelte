<script lang="ts">
  import { formatFriendCode } from '$lib/utils/format';
  import { scale } from 'svelte/transition';
  import Box from '../atoms/Box.atom.svelte';
  import Text from '../atoms/Text.atom.svelte';
  import Button from '../atoms/Button.atom.svelte';
  import Input from '../atoms/Input.atom.svelte';
  import Select from '../atoms/Select.atom.svelte';
  import Form from '../atoms/Form.atom.svelte';
  import { dalStore } from '$lib/stores/dal.svelte';
  import { TITLE_PART_1, TITLE_PART_2, AVATAR_ICONS, PASSPORT_COLORS } from '$lib/types';

  function updateFriendCode(e: Event) {
    const target = e.target as HTMLInputElement;
    const formatted = formatFriendCode(target.value);
    dalStore.passportForm.friendCode = formatted;
    target.value = formatted;
  }

  function handleSavePassport(e: Event) {
    e.preventDefault();
    if (!dalStore.passportForm.villagerName.trim() || !dalStore.passportForm.islandName.trim()) return;
    
    dalStore.passport = {
      ...dalStore.passportForm,
      hasCreated: true,
      hasCustomized: true
    };
    // Sync logic is handled automatically via reactivity in +layout.svelte 
    // when dalStore.passport.hasCreated and dalStore.isLoggedIn is true.
    dalStore.isEditingPassport = false;
    dalStore.showPassportDrawer = false;
    dalStore.playSound('success');
  }
</script>

{#if dalStore.isEditingPassport}
  <Box class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <Box transition={scale} class="bg-[#FAF8F2] rounded-[36px] border-4 border-[#E6DFC7] p-5 max-w-sm w-full shadow-2xl relative text-[#4A4A4A]">
      <Box class="flex items-center gap-2 border-b border-[#E6DFC7] pb-2 mb-3">
        <Text tag="span" class="text-xl">📖</Text>
        <Text tag="h3" class="font-system font-black text-sm text-[#0084CC] uppercase">Update Passport Credentials</Text>
      </Box>

      <Form onsubmit={handleSavePassport} class="space-y-3.5 text-xs">
        <Box>
          <Text tag="label" class="block text-xs font-system font-black text-[#85806B] mb-0.5 uppercase">VILLAGER ID</Text>
          <Input type="text" bind:value={dalStore.passportForm.villagerName} placeholder="e.g. Raymond" class="w-full bg-white border border-[#E6DFC7] rounded-xl px-3 py-1.5 font-bold outline-none focus:border-[#0084CC]" maxlength={12} required />
        </Box>
        <Box>
          <Text tag="label" class="block text-xs font-system font-black text-[#85806B] mb-0.5 uppercase">HOME ISLAND</Text>
          <Input type="text" bind:value={dalStore.passportForm.islandName} placeholder="e.g. Peaches Cove" class="w-full bg-white border border-[#E6DFC7] rounded-xl px-3 py-1.5 font-bold outline-none focus:border-[#0084CC]" maxlength={14} required />
        </Box>

        <Box class="grid grid-cols-2 gap-2">
          <Box>
            <Text tag="label" class="block text-xs font-system font-black text-[#85806B] mb-0.5 uppercase">TITLE PREFIX</Text>
            <Select bind:value={dalStore.passportForm.titlePart1} class="w-full bg-white border border-[#E6DFC7] rounded-xl px-2 py-1.5 font-bold outline-none">
              {#each TITLE_PART_1 as p}
                <option value={p}>{p}</option>
              {/each}
            </Select>
          </Box>
          <Box>
            <Text tag="label" class="block text-xs font-system font-black text-[#85806B] mb-0.5 uppercase">TITLE SUFFIX</Text>
            <Select bind:value={dalStore.passportForm.titlePart2} class="w-full bg-white border border-[#E6DFC7] rounded-xl px-2 py-1.5 font-bold outline-none">
              {#each TITLE_PART_2 as s}
                <option value={s}>{s}</option>
              {/each}
            </Select>
          </Box>
        </Box>

        <Box>
          <Text tag="label" class="block text-xs font-system font-black text-[#85806B] mb-0.5 uppercase">SWITCH FRIEND CODE</Text>
          <Input type="text" value={dalStore.passportForm.friendCode} oninput={updateFriendCode} class="w-full bg-white border border-[#E6DFC7] rounded-xl px-3 py-1.5 font-system font-bold outline-none focus:border-[#0084CC]" maxlength={17} />
        </Box>

        <Box>
          <Text tag="label" class="block text-xs font-system font-black text-[#85806B] mb-0.5 uppercase">PORTRAIT AVATAR</Text>
          <Box class="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto p-1 bg-white border border-[#E6DFC7] rounded-xl">
            {#each AVATAR_ICONS as icon}
              <Button type="button" onclick={() => dalStore.passportForm.avatarIcon = icon.char} class={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all ${dalStore.passportForm.avatarIcon === icon.char ? 'bg-[#FFCC00] border border-[#0084CC] scale-110 shadow-xs' : 'bg-slate-50 hover:bg-slate-100'}`}>
                {icon.char}
              </Button>
            {/each}
          </Box>
        </Box>

        <Box>
          <Text tag="label" class="block text-xs font-system font-black text-[#85806B] mb-1.5 uppercase">PASSPORT THEME COLOR</Text>
          <Box class="flex justify-between bg-white p-1.5 border border-[#E6DFC7] rounded-xl">
            {#each PASSPORT_COLORS as c, idx}
              <Button type="button" onclick={() => dalStore.passportForm.colorIndex = idx} class={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${c.bg} ${c.border} border ${dalStore.passportForm.colorIndex === idx ? 'scale-125 ring-2 ring-[#0084CC]' : ''}`}>
                <Text tag="span" class={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
              </Button>
            {/each}
          </Box>
        </Box>

        <Box>
          <Text tag="label" class="block text-xs font-system font-black text-[#85806B] mb-0.5 uppercase">PERSONAL REMARKS / COMMENT</Text>
          <Input type="text" bind:value={dalStore.passportForm.signature} placeholder="Wings up, skies clear!" class="w-full bg-white border border-[#E6DFC7] rounded-xl px-3 py-1.5 font-bold outline-none" maxlength={40} />
        </Box>

        <Box class="flex gap-2 pt-1.5">
          <Button type="submit" class="btn-acnh btn-acnh-primary flex-1">
            💾 UPDATE PASSPORT
          </Button>
          <Button type="button" onclick={() => dalStore.isEditingPassport = false} class="bg-slate-100 hover:bg-slate-200 border border-slate-200 px-4 py-2 rounded-xl">
            Cancel
          </Button>
        </Box>
      </Form>
    </Box>
  </Box>
{/if}
