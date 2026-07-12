<script lang="ts">
  import type { Passport } from '$lib/studio-types';
  import { playSound } from '$lib/utils/audio';
  import {
    TITLE_PART_1,
    TITLE_PART_2,
    AVATAR_ICONS,
    PASSPORT_COLORS,
    PLANE_COLORS,
    generateRandomFriendCode
  } from '$lib/utils/constants';
  import { scale, fade } from 'svelte/transition';
  import { backOut } from 'svelte/easing';

  let {
    passport,
    onSave,
    onClose,
    isMuted = false
  } = $props<{
    passport: Passport;
    onSave: (updated: Passport) => void;
    onClose: () => void;
    isMuted?: boolean;
  }>();

  let form = $state({ ...passport });
  let activeTab = $state('identity');

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!form.villagerName.trim() || !form.islandName.trim()) {
      activeTab = 'identity';
      return;
    }

    let finalFriendCode = form.friendCode.trim();
    if (!finalFriendCode || finalFriendCode === 'SW-XXXX-XXXX-XXXX' || finalFriendCode === 'SW-') {
      finalFriendCode = generateRandomFriendCode();
    }

    const updated: Passport = {
      ...form,
      friendCode: finalFriendCode,
      hasCreated: true,
      hasCustomized: true
    };
    onSave(updated);
  }

  function updateFriendCode(e: Event) {
    const target = e.target as HTMLInputElement;
    let val = target.value;
    if (!val.toUpperCase().startsWith('SW-')) {
      val = 'SW-' + val.replace(/^SW-?/i, '');
    }
    form.friendCode = val;
  }

  function updateDreamAddress(e: Event) {
    const target = e.target as HTMLInputElement;
    let val = target.value;
    if (val && !val.toUpperCase().startsWith('DA-')) {
      val = 'DA-' + val.replace(/^DA-?/i, '');
    }
    form.dreamAddress = val;
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50" transition:fade={{ duration: 200 }}>
  <div
    class="bg-[#FAF8F2] rounded-[36px] border-4 border-[#E6DFC7] p-5 max-w-sm w-full shadow-2xl relative text-[#4A4A4A] flex flex-col max-h-[90vh]"
    transition:scale={{ duration: 300, start: 0.95, easing: backOut }}
  >
    <div class="flex flex-col gap-3 border-b border-[#E6DFC7] pb-3 mb-3">
      <div class="flex items-center gap-2">
        <span class="text-xl">📖</span>
        <h3 class="font-system font-black text-sm text-[#0084CC] uppercase">Update Passport Credentials</h3>
      </div>
      
      <div class="flex gap-2 p-1 bg-[#E6DFC7]/40 rounded-xl">
        <button type="button" onclick={() => activeTab = 'identity'} class="flex-1 py-1.5 px-1 rounded-lg text-[10px] sm:text-xs font-black uppercase transition-colors {activeTab === 'identity' ? 'bg-white text-[#0084CC] shadow-sm' : 'text-[#85806B] hover:bg-white/50'}">Identity</button>
        <button type="button" onclick={() => activeTab = 'network'} class="flex-1 py-1.5 px-1 rounded-lg text-[10px] sm:text-xs font-black uppercase transition-colors {activeTab === 'network' ? 'bg-white text-[#0084CC] shadow-sm' : 'text-[#85806B] hover:bg-white/50'}">Network</button>
        <button type="button" onclick={() => activeTab = 'customization'} class="flex-1 py-1.5 px-1 rounded-lg text-[10px] sm:text-xs font-black uppercase transition-colors {activeTab === 'customization' ? 'bg-white text-[#0084CC] shadow-sm' : 'text-[#85806B] hover:bg-white/50'}">Style</button>
        <button type="button" onclick={() => activeTab = 'native'} class="flex-1 py-1.5 px-1 rounded-lg text-[10px] sm:text-xs font-black uppercase transition-colors {activeTab === 'native' ? 'bg-white text-[#0084CC] shadow-sm' : 'text-[#85806B] hover:bg-white/50'}">Native</button>
      </div>
    </div>

    <form onsubmit={handleSubmit} class="text-xs flex flex-col flex-1 overflow-hidden">
      <div class="flex-1 overflow-y-auto pr-1 grid grid-cols-1 grid-rows-1 min-h-[300px]">
        {#if activeTab === 'identity'}
          <div class="col-start-1 row-start-1 space-y-3.5" transition:fade={{ duration: 150 }}>
            <div>
              <label class="block text-xs font-system font-black text-[#85806B] mb-0.5 uppercase">VILLAGER ID</label>
              <input
                type="text"
                bind:value={form.villagerName}
                placeholder="e.g. Raymond"
                class="w-full bg-white border border-[#E6DFC7] rounded-xl px-3 py-1.5 font-bold outline-none focus:border-[#0084CC]"
                maxlength="12"
                required
              />
            </div>
            <div>
              <label class="block text-xs font-system font-black text-[#85806B] mb-0.5 uppercase">HOME ISLAND</label>
              <input
                type="text"
                bind:value={form.islandName}
                placeholder="e.g. Peaches Cove"
                class="w-full bg-white border border-[#E6DFC7] rounded-xl px-3 py-1.5 font-bold outline-none focus:border-[#0084CC]"
                maxlength="14"
                required
              />
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-xs font-system font-black text-[#85806B] mb-0.5 uppercase">TITLE PREFIX</label>
                <select
                  bind:value={form.titlePart1}
                  class="w-full bg-white border border-[#E6DFC7] rounded-xl px-2 py-1.5 font-bold outline-none"
                >
                  {#each TITLE_PART_1 as p}
                    <option value={p}>{p}</option>
                  {/each}
                </select>
              </div>
              <div>
                <label class="block text-xs font-system font-black text-[#85806B] mb-0.5 uppercase">TITLE SUFFIX</label>
                <select
                  bind:value={form.titlePart2}
                  class="w-full bg-white border border-[#E6DFC7] rounded-xl px-2 py-1.5 font-bold outline-none"
                >
                  {#each TITLE_PART_2 as s}
                    <option value={s}>{s}</option>
                  {/each}
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-system font-black text-[#85806B] mb-0.5 uppercase">PERSONAL REMARKS / COMMENT</label>
              <input
                type="text"
                bind:value={form.signature}
                placeholder="Wings up, skies clear!"
                class="w-full bg-white border border-[#E6DFC7] rounded-xl px-3 py-1.5 font-bold outline-none"
                maxlength="40"
              />
            </div>
          </div>
        {/if}

        {#if activeTab === 'network'}
          <div class="col-start-1 row-start-1 space-y-3.5" transition:fade={{ duration: 150 }}>
            <div>
              <label class="block text-xs font-system font-black text-[#85806B] mb-0.5 uppercase">SWITCH FRIEND CODE</label>
              <input
                type="text"
                value={form.friendCode}
                oninput={updateFriendCode}
                placeholder="SW-XXXX-XXXX-XXXX"
                class="w-full bg-white border border-[#E6DFC7] rounded-xl px-3 py-1.5 font-system font-bold outline-none focus:border-[#0084CC]"
                maxlength="17"
              />
            </div>

            <div>
              <label class="block text-xs font-system font-black text-[#85806B] mb-0.5 uppercase">DREAM ADDRESS</label>
              <input
                type="text"
                value={form.dreamAddress || ''}
                oninput={updateDreamAddress}
                placeholder="DA-XXXX-XXXX-XXXX"
                class="w-full bg-white border border-[#E6DFC7] rounded-xl px-3 py-1.5 font-system font-bold outline-none focus:border-[#0084CC]"
                maxlength="17"
              />
            </div>
          </div>
        {/if}

        {#if activeTab === 'customization'}
          <div class="col-start-1 row-start-1 space-y-3.5" transition:fade={{ duration: 150 }}>
            <div>
              <label class="block text-xs font-system font-black text-[#85806B] mb-0.5 uppercase">PORTRAIT AVATAR</label>
              <div class="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-white border border-[#E6DFC7] rounded-xl">
                {#each AVATAR_ICONS as icon}
                  <button
                    type="button"
                    onclick={() => form.avatarIcon = icon.char}
                    class="w-10 h-10 rounded-lg flex items-center justify-center text-2xl transition-all cursor-pointer {form.avatarIcon === icon.char ? 'bg-[#FFCC00] border border-[#0084CC] scale-110 shadow-sm' : 'bg-slate-50 hover:bg-slate-100'}"
                    title={icon.label}
                  >
                    {icon.char}
                  </button>
                {/each}
              </div>
            </div>

            <div>
              <label class="block text-xs font-system font-black text-[#85806B] mb-1.5 uppercase">PASSPORT THEME COLOR</label>
              <div class="flex justify-between bg-white p-1.5 border border-[#E6DFC7] rounded-xl">
                {#each PASSPORT_COLORS as c, idx}
                  <button
                    type="button"
                    onclick={() => form.colorIndex = idx}
                    class="w-5 h-5 rounded-full flex items-center justify-center transition-all cursor-pointer {c.bg} {c.border} border {form.colorIndex === idx ? 'scale-125 ring-2 ring-[#0084CC]' : ''}"
                  >
                    <span class="w-1.5 h-1.5 rounded-full {c.dot}"></span>
                  </button>
                {/each}
              </div>
            </div>
          </div>
        {/if}

        {#if activeTab === 'native'}
          <div class="col-start-1 row-start-1 space-y-3.5" transition:fade={{ duration: 150 }}>
            <!-- Seaplane Registration Section -->
            <div class="space-y-3">
              <span class="block text-sm font-system font-black text-[#0084CC] uppercase tracking-wider mb-2">
                🏝️ Native Island Assets
              </span>

              <div class="space-y-3">
                <div>
                  <label class="block text-xs font-system font-black text-[#85806B] mb-1 uppercase">NATIVE FRUIT</label>
                  <select
                    bind:value={form.nativeFruit}
                    class="w-full bg-[#FAF8F2] border border-[#E6DFC7] rounded-xl px-2 py-2 font-bold outline-none focus:border-[#0084CC]"
                  >
                    <option value="Apple">🍎 Apple</option>
                    <option value="Cherry">🍒 Cherry</option>
                    <option value="Orange">🍊 Orange</option>
                    <option value="Peach">🍑 Peach</option>
                    <option value="Pear">🍐 Pear</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-system font-black text-[#85806B] mb-1 uppercase">LIVERY COLOR</label>
                  <div class="flex gap-2 bg-[#FAF8F2] p-2 border border-[#E6DFC7] rounded-xl">
                    {#each PLANE_COLORS as color}
                      <button
                        type="button"
                        onclick={() => form.planeColor = color.id}
                        class="w-10 h-10 rounded-lg flex items-center justify-center transition-all cursor-pointer {color.bg} {color.border} border-2 {(form.planeColor || 'orange') === color.id ? 'scale-110 ring-2 ring-[#0084CC]' : 'opacity-70 hover:opacity-100'}"
                        title={color.name}
                      >
                        <span class="text-xl text-white">✈️</span>
                      </button>
                    {/each}
                  </div>
                </div>
              </div>
            </div>
          </div>
        {/if}
      </div>

      <div class="grid grid-cols-2 gap-3 pt-3 mt-2 border-t border-[#E6DFC7]">
        <button
          type="button"
          onclick={() => { playSound('beep', isMuted); onClose(); }}
          class="btn-acnh btn-acnh-outline"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="btn-acnh btn-acnh-primary py-2"
        >
          Save Details
        </button>
      </div>
    </form>
  </div>
</div>
