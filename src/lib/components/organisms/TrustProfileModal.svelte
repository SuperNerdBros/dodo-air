<script lang="ts">
  import { X, AlertCircle } from '@lucide/svelte';
  import type { UserProfile, FeedbackReview } from '$lib/studio-types';
  import { playSound } from '$lib/utils/audio';
  import { PASSPORT_COLORS } from '$lib/utils/constants';
  import { scale, fade } from 'svelte/transition';
  import { backOut } from 'svelte/easing';

  let {
    selectedFriendCode,
    onClose,
    profiles,
    selectedProfileReviews,
    onSubmitReview,
    reviewError = '',
    isSubmittingReview = false,
    isMuted = false
  } = $props<{
    selectedFriendCode: string | null;
    onClose: () => void;
    profiles: Record<string, UserProfile>;
    selectedProfileReviews: FeedbackReview[];
    onSubmitReview: (ratingType: 'apple' | 'turnip', comment: string) => Promise<void> | void;
    reviewError?: string;
    isSubmittingReview?: boolean;
    isMuted?: boolean;
  }>();

  let reviewRatingType = $state<'apple' | 'turnip'>('apple');
  let reviewComment = $state('');

  let prof = $derived.by<UserProfile>(() => {
    if (!selectedFriendCode) return {} as UserProfile;
    return profiles[selectedFriendCode] || {
      friendCode: selectedFriendCode,
      villagerName: selectedFriendCode.startsWith('SW-TEMP-') ? selectedFriendCode.split('-')[2] : 'Unregistered Resident',
      islandName: selectedFriendCode.startsWith('SW-TEMP-') ? selectedFriendCode.split('-')[3] : 'Mystery Island',
      avatarIcon: '🦤',
      title: 'Frequent Flyer',
      signature: 'Skies are blue, wings are up!',
      colorIndex: 1,
      goodApples: 0,
      rottenTurnips: 0,
      vouchers: {},
      updatedAt: new Date().toISOString()
    };
  });

  let activeColor = $derived(PASSPORT_COLORS[prof.colorIndex || 0] || PASSPORT_COLORS[1]);

  async function handleFormSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    await onSubmitReview(reviewRatingType, reviewComment);
    reviewComment = '';
  }
</script>

{#if selectedFriendCode}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="fixed inset-0 bg-[#006094]/40 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto" transition:fade={{ duration: 200 }}>
    <div
      class="bg-[#FFFCEF] rounded-[36px] border-4 border-[#E6DFC7] max-w-xl w-full p-6 shadow-2xl relative text-[#4A4A4A] my-8 text-left"
      transition:scale={{ duration: 300, start: 0.95, easing: backOut }}
    >
      <!-- Close Button -->
      <button
        onclick={() => { playSound('beep', isMuted); onClose(); }}
        class="absolute right-5 top-5 p-1.5 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all cursor-pointer border-none"
      >
        <X class="w-4 h-4" />
      </button>

      <!-- Passport Visual header -->
      <div class="p-4 rounded-3xl border-2 shadow-xs mb-5 flex flex-col sm:flex-row gap-4 items-center {activeColor.bg} border-[#E6DFC7]/40">
        <div class="w-16 h-16 bg-white/70 rounded-2xl flex items-center justify-center text-4xl shadow-inner border border-white">
          {prof.avatarIcon || '🦤'}
        </div>
        <div class="text-center sm:text-left space-y-1 flex-1 min-w-0">
          <span class="bg-sky-100 text-sky-800 text-[8px] font-mono font-bold px-2 py-0.5 rounded-full uppercase leading-none border border-sky-200">
            Islander Passport
          </span>
          <h3 class="font-display font-black text-lg text-slate-800 leading-tight truncate font-bold">
            {prof.villagerName}
          </h3>
          <p class="text-xs font-bold text-[#0084CC] truncate">
            🏝️ {prof.islandName}
          </p>
          {#if prof.signature}
            <p class="text-[10px] font-mono italic text-slate-500 truncate mt-0.5">
              "{prof.signature}"
            </p>
          {/if}
        </div>
        <div class="sm:text-right text-[10px] font-mono text-slate-500 border-t sm:border-t-0 sm:border-l border-[#E6DFC7]/40 pt-2 sm:pt-0 sm:pl-3 max-w-[140px] w-full sm:w-auto">
          <span class="block text-[7.5px] uppercase font-bold text-slate-400 leading-none">FRIEND ID</span>
          <span class="font-bold text-slate-700 block mt-1 leading-none">{prof.friendCode.startsWith('SW-TEMP-') ? 'NOT LINKED' : prof.friendCode}</span>
        </div>
      </div>

      <!-- Score Stats Section (Good Apples vs Rotten Turnips) -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <!-- Good Apples -->
        <div class="bg-emerald-50/50 border-2 border-emerald-200 rounded-3xl p-4 text-center shadow-xs">
          <span class="text-3xl block">🍏</span>
          <span class="block font-display font-black text-xs text-[#117A65] uppercase mt-1 leading-none font-bold">Good Apples</span>
          <span class="block font-mono font-black text-[#117A65] text-2xl mt-1.5 leading-none font-black">
            {prof.goodApples || 0}
          </span>
          <p class="text-[9px] font-medium text-slate-500 mt-1 font-sans">Vouched for positive, kind visits!</p>
        </div>

        <!-- Rotten Turnips -->
        <div class="bg-rose-50/50 border-2 border-rose-200 rounded-3xl p-4 text-center shadow-xs">
          <span class="text-3xl block">🧅</span>
          <span class="block font-display font-black text-xs text-rose-800 uppercase mt-1 leading-none font-bold">Rotten Turnips</span>
          <span class="block font-mono font-black text-rose-600 text-2xl mt-1.5 leading-none font-black">
            {prof.rottenTurnips || 0}
          </span>
          <p class="text-[9px] font-medium text-slate-500 mt-1 font-sans">Reported for bad flight behavior.</p>
        </div>
      </div>

      <!-- Form to submit Vouch/Report -->
      <div class="bg-white border border-[#E6DFC7]/60 rounded-3xl p-4 mb-6 text-left">
        <h4 class="font-display font-black text-xs text-[#0084CC] uppercase tracking-wider mb-3 font-bold">
          ✍️ Leave Community Trust Feedback
        </h4>

        {#if reviewError}
          <div class="bg-red-50 text-red-700 p-2.5 rounded-xl text-[10px] font-mono font-bold mb-3 border border-red-200 flex items-center gap-1.5 leading-snug">
            <AlertCircle class="w-3.5 h-3.5" /> {reviewError}
          </div>
        {/if}

        <form onsubmit={handleFormSubmit} class="space-y-3.5 text-xs">
          <div class="flex gap-3 text-center">
            <button
              type="button"
              onclick={() => { playSound('beep', isMuted); reviewRatingType = 'apple'; }}
              class="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold border-2 transition-all cursor-pointer {reviewRatingType === 'apple' ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}"
            >
              🍏 Vouch: Good Apple
            </button>
            <button
              type="button"
              onclick={() => { playSound('beep', isMuted); reviewRatingType = 'turnip'; }}
              class="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold border-2 transition-all cursor-pointer {reviewRatingType === 'turnip' ? 'bg-rose-500 border-rose-600 text-white shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}"
            >
              🧅 Report: Rotten Turnip
            </button>
          </div>

          <div>
            <input
              type="text"
              bind:value={reviewComment}
              placeholder={reviewRatingType === 'apple' ? "e.g. Left lovely tips, watered my hybrid flowers! 🌸" : "e.g. Shook fruit trees and trampled flowers without asking. 😡"}
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold outline-none focus:bg-white"
              maxlength="100"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmittingReview}
            class="w-full font-display font-black text-xs uppercase py-2.5 rounded-xl shadow border-b-2 transition-all cursor-pointer font-bold {reviewRatingType === 'apple' ? 'bg-emerald-500 hover:bg-emerald-600 border-emerald-700 text-white' : 'bg-rose-500 hover:bg-rose-600 border-rose-700 text-white'}"
          >
            {isSubmittingReview ? "submitting feedback..." : `Submit Trust Rating (${reviewRatingType === 'apple' ? '🍏 Vouch' : '🧅 Report'})`}
          </button>
        </form>
      </div>

      <!-- Feedback Review Feed -->
      <div class="space-y-3 text-left">
        <span class="block text-[8px] font-mono font-black text-slate-400 uppercase tracking-wider">
          📋 COMMUNITY FEEDBACK HISTORY ({selectedProfileReviews.length})
        </span>

        <div class="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
          {#if selectedProfileReviews.length === 0}
            <p class="text-[11px] italic font-mono text-slate-400 text-center py-4">
              No community feedback reviews have been registered for this flyer yet. Be the first to vouch or report!
            </p>
          {:else}
            {#each selectedProfileReviews as rev}
              <div class="bg-white border border-[#E6DFC7]/40 rounded-2xl p-3 flex gap-2 items-start text-[11px]">
                <span class="text-lg flex-shrink-0 mt-0.5">
                  {rev.ratingType === 'apple' ? '🍏' : '🧅'}
                </span>
                <div class="flex-1 min-w-0 text-left">
                  <div class="flex items-center justify-between gap-1 mb-1">
                    <span class="font-display font-black text-slate-700 truncate font-bold">
                      {rev.authorName} <span class="font-normal font-sans text-slate-400">from</span> '{rev.authorIsland}'
                    </span>
                    <span class="text-[8px] font-mono text-slate-400 shrink-0">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p class="text-slate-600 leading-relaxed font-sans font-semibold text-left">"{rev.comment}"</p>
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </div>

    </div>
  </div>
{/if}
