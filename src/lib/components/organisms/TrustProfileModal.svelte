<script lang="ts">
  import { X, AlertCircle } from '@lucide/svelte';
  import type { UserProfile, FeedbackReview } from '$lib/studio-types';
  import { playSound } from '$lib/utils/audio';
  import { PASSPORT_COLORS } from '$lib/utils/constants';
  import { scale, fade } from 'svelte/transition';
  import { backOut } from 'svelte/easing';
  import { dalStore } from '$lib/stores/dal.svelte.ts';

  let {
    selectedUserId,
    onClose,
    profiles,
    selectedProfileReviews,
    onSubmitReview,
    reviewError = '',
    isSubmittingReview = false,
    isMuted = false
  } = $props<{
    selectedUserId: string | null;
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

  // Dream Z-rating state
  let dreamZRating = $state(0);
  let dreamHoverZ = $state(0);
  let dreamComment = $state('');
  let isSubmittingDream = $state(false);
  let dreamError = $state('');

  const isLuna = $derived(dalStore.systemMode === 'LUNA');

  const Z_LABELS = ['', 'Light Nap', 'Dozing Off', 'Sound Sleep', 'Deep Slumber', 'Comatose'];
  const renderZ = (level: number) => 'Z'.repeat(Math.max(1, Math.min(5, level)));

  let prof = $derived.by<UserProfile>(() => {
    if (!selectedUserId) return {} as UserProfile;
    
    // Direct match (if full key like '1_0' was passed)
    if (profiles[selectedUserId]) return profiles[selectedUserId];
    
    // Find by userId or friendCode
    const found = Object.values(profiles).find(
      (p) => String(p.userId) === String(selectedUserId) || p.friendCode === selectedUserId
    );
    if (found) return found;

    // Fallback for unregistered temp residents
    return {
      userId: selectedUserId,
      friendCode: selectedUserId,
      villagerName: String(selectedUserId).startsWith('SW-TEMP-') ? String(selectedUserId).split('-')[2] : 'Unregistered Resident',
      islandName: selectedUserId.startsWith('SW-TEMP-') ? selectedUserId.split('-')[3] : 'Mystery Island',
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

  async function handleDreamRatingSubmit() {
    if (dreamZRating < 1 || dreamZRating > 5) return;
    isSubmittingDream = true;
    dreamError = '';
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (typeof window !== 'undefined' && (window as any).wpApiSettings?.nonce) {
        headers['X-WP-Nonce'] = (window as any).wpApiSettings.nonce;
      }
      const res = await fetch(
        `/wp-json/dodo-air/v1/profiles/${encodeURIComponent(prof.userId)}/rate-dream`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            passportIndex: (prof as any).passportIndex || 0,
            rating: dreamZRating
          })
        }
      );
      if (!res.ok) {
        const data = await res.json();
        dreamError = data.message || 'Failed to submit dream rating';
      } else {
        playSound('success', isMuted);
        dreamZRating = 0;
        dreamComment = '';
        // Refresh state to pick up new averages
        dalStore.fetchState();
      }
    } catch {
      dreamError = 'Network error submitting dream rating';
    } finally {
      isSubmittingDream = false;
    }
  }
</script>

{#if selectedUserId}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="fixed inset-0 bg-[#006094]/40 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto" transition:fade={{ duration: 200 }}>
    <div
      class="bg-[#FFFCEF] rounded-[36px] border-4 border-[#E6DFC7] max-w-xl w-full p-6 shadow-2xl relative text-[#4A4A4A] my-8 text-left max-h-[90vh] overflow-y-auto"
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
          <h3 class="font-system font-black text-lg text-slate-800 leading-tight truncate font-bold">
            {prof.villagerName}
          </h3>
          <p class="text-xs font-bold text-[#0084CC] truncate">
            🏝️ {prof.islandName}
          </p>
          {#if prof.signature}
            <p class="text-sm font-system italic text-slate-500 truncate mt-0.5">
              "{prof.signature}"
            </p>
          {/if}
        </div>
        <div class="sm:text-right text-sm font-system text-slate-500 border-t sm:border-t-0 sm:border-l border-[#E6DFC7]/40 pt-2 sm:pt-0 sm:pl-3 sm:pr-8 min-w-[160px] w-full sm:w-auto">
          <div class="mb-2">
            <span class="block text-xs uppercase font-bold text-slate-400 leading-none">FRIEND ID</span>
            <span class="font-bold text-slate-700 block mt-1 leading-none">{(prof.friendCode || String(prof.userId))?.startsWith('SW-TEMP-') ? 'NOT LINKED' : (prof.friendCode || '')}</span>
          </div>
          {#if (prof as any).dreamAddress}
            <div>
              <span class="block text-[10px] uppercase font-bold text-[#4B0082]/60 leading-none tracking-wider">DREAM ADDRESS</span>
              <span class="font-bold text-[#4B0082] block mt-1 leading-none text-xs">{(prof as any).dreamAddress}</span>
            </div>
          {/if}
        </div>
      </div>

      <!-- Dream Z-Rating Section (Luna mode only) -->
      {#if isLuna && (prof as any).dreamAddress}
        <div class="bg-indigo-50/50 border-2 border-indigo-200 rounded-3xl p-5 mb-6 text-left">
          <h4 class="font-system font-black text-xs text-[#4B0082] uppercase tracking-wider mb-3 font-bold flex items-center gap-1.5">
            🌙 Rate This Dreamscape
          </h4>

          <!-- Current average display -->
          <div class="flex items-center gap-3 mb-4 bg-white/70 rounded-2xl p-3 border border-indigo-100">
            <span class="text-2xl">💤</span>
            <div>
              {#if (prof.dreamRatingCount || 0) > 0}
                <span class="font-system font-black text-lg text-indigo-700 tracking-wider">
                  {renderZ(Math.round(prof.dreamRatingAvg || 0))}
                </span>
                <span class="text-xs text-slate-400 font-system block">
                  {(prof.dreamRatingAvg || 0).toFixed(1)}/5 · {prof.dreamRatingCount} {prof.dreamRatingCount === 1 ? 'rating' : 'ratings'}
                </span>
              {:else}
                <span class="text-xs text-slate-400 font-system italic">No dream ratings yet — be the first!</span>
              {/if}
            </div>
          </div>

          <!-- Z Selector -->
          <div class="flex items-center justify-center gap-2 mb-2">
            {#each [1, 2, 3, 4, 5] as level}
              {@const isSelected = dreamZRating >= level}
              {@const isHovered = dreamHoverZ >= level}
              <button
                class="flex flex-col items-center gap-1 px-3 py-2 rounded-2xl border-2 transition-all cursor-pointer select-none font-system font-black text-xs
                  {isSelected || isHovered
                    ? 'bg-indigo-100 border-indigo-400 text-indigo-700 scale-110 shadow-md'
                    : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-300'
                  }"
                onmouseenter={() => dreamHoverZ = level}
                onmouseleave={() => dreamHoverZ = 0}
                onclick={() => { playSound('beep', isMuted); dreamZRating = level; }}
              >
                <span class="text-lg">{isSelected || isHovered ? '💤' : '·'}</span>
                <span class="tracking-wider">{renderZ(level)}</span>
              </button>
            {/each}
          </div>
          <div class="text-center text-[10px] font-system text-slate-400 mb-4">
            {dreamZRating > 0 ? Z_LABELS[dreamZRating] : dreamHoverZ > 0 ? Z_LABELS[dreamHoverZ] : 'Tap a Z level to rate'}
          </div>

          {#if dreamError}
            <div class="bg-red-50 text-red-700 p-2.5 rounded-xl text-sm font-system font-bold mb-3 border border-red-200 flex items-center gap-1.5 leading-snug">
              <AlertCircle class="w-3.5 h-3.5" /> {dreamError}
            </div>
          {/if}

          <button
            disabled={dreamZRating < 1 || isSubmittingDream}
            onclick={handleDreamRatingSubmit}
            class="w-full font-system font-black text-xs uppercase py-2.5 rounded-xl shadow border-b-2 transition-all cursor-pointer font-bold bg-indigo-500 hover:bg-indigo-600 border-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmittingDream ? 'Submitting...' : `Submit Dream Rating (${dreamZRating > 0 ? renderZ(dreamZRating) : '—'})`}
          </button>
        </div>
      {/if}

      <!-- Player Trust Sections (DAL mode only) -->
      {#if !isLuna}
        <!-- Score Stats Section (Good Apples vs Rotten Turnips) -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <!-- Good Apples -->
          <div class="bg-emerald-50/50 border-2 border-emerald-200 rounded-3xl p-4 text-center shadow-xs">
            <span class="text-3xl block">🍏</span>
            <span class="block font-system font-black text-xs text-[#117A65] uppercase mt-1 leading-none font-bold">Good Apples</span>
            <span class="block font-system font-black text-[#117A65] text-2xl mt-1.5 leading-none font-black">
              {prof.goodApples || 0}
            </span>
            <p class="text-xs font-medium text-slate-500 mt-1 font-sans">Vouched for positive, kind visits!</p>
          </div>

          <!-- Rotten Turnips -->
          <div class="bg-rose-50/50 border-2 border-rose-200 rounded-3xl p-4 text-center shadow-xs">
            <span class="text-3xl block">🧅</span>
            <span class="block font-system font-black text-xs text-rose-800 uppercase mt-1 leading-none font-bold">Rotten Turnips</span>
            <span class="block font-system font-black text-rose-600 text-2xl mt-1.5 leading-none font-black">
              {prof.rottenTurnips || 0}
            </span>
            <p class="text-xs font-medium text-slate-500 mt-1 font-sans">Reported for bad flight behavior.</p>
          </div>
        </div>

        <!-- Form to submit Vouch/Report -->
        <div class="bg-white border border-[#E6DFC7]/60 rounded-3xl p-4 mb-6 text-left">
          <h4 class="font-system font-black text-xs text-[#0084CC] uppercase tracking-wider mb-3 font-bold">
            ✍️ Leave Community Trust Feedback
          </h4>

          {#if reviewError}
            <div class="bg-red-50 text-red-700 p-2.5 rounded-xl text-sm font-system font-bold mb-3 border border-red-200 flex items-center gap-1.5 leading-snug">
              <AlertCircle class="w-3.5 h-3.5" /> {reviewError}
            </div>
          {/if}

          <form onsubmit={handleFormSubmit} class="space-y-3.5 text-xs">
            <div class="flex gap-3 text-center">
              <button
                type="button"
                onclick={() => { playSound('beep', isMuted); reviewRatingType = 'apple'; }}
                class="flex-1 {reviewRatingType === 'apple' ? 'btn-acnh bg-[#10B981] text-white border-x-[#059669] border-t-[#059669] border-b-[#047857]' : 'btn-acnh btn-acnh-outline'}"
              >
                🍏 Vouch: Good Apple
              </button>
              <button
                type="button"
                onclick={() => { playSound('beep', isMuted); reviewRatingType = 'turnip'; }}
                class="flex-1 {reviewRatingType === 'turnip' ? 'btn-acnh btn-acnh-danger' : 'btn-acnh btn-acnh-outline'}"
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
              class="w-full font-system font-black text-xs uppercase py-2.5 rounded-xl shadow border-b-2 transition-all cursor-pointer font-bold {reviewRatingType === 'apple' ? 'bg-emerald-500 hover:bg-emerald-600 border-emerald-700 text-white' : 'bg-rose-500 hover:bg-rose-600 border-rose-700 text-white'}"
            >
              {isSubmittingReview ? "submitting feedback..." : `Submit Trust Rating (${reviewRatingType === 'apple' ? '🍏 Vouch' : '🧅 Report'})`}
            </button>
          </form>
        </div>
      {/if}

      <!-- Feedback Review Feed -->
      <div class="space-y-3 text-left">
        <span class="block text-xs font-system font-black text-slate-400 uppercase tracking-wider">
          📋 COMMUNITY FEEDBACK HISTORY ({selectedProfileReviews.length})
        </span>

        <div class="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
          {#if selectedProfileReviews.length === 0}
            <p class="text-sm italic font-system text-slate-400 text-center py-4">
              No community feedback reviews have been registered for this flyer yet. Be the first to vouch or report!
            </p>
          {:else}
            {#each selectedProfileReviews as rev}
              <div class="bg-white border border-[#E6DFC7]/40 rounded-2xl p-3 flex gap-2 items-start text-sm">
                <span class="text-lg flex-shrink-0 mt-0.5">
                  {rev.ratingType === 'apple' ? '🍏' : '🧅'}
                </span>
                <div class="flex-1 min-w-0 text-left">
                  <div class="flex items-center justify-between gap-1 mb-1">
                    <span class="font-system font-black text-slate-700 truncate font-bold">
                      {rev.authorName} <span class="font-normal font-sans text-slate-400">from</span> '{rev.authorIsland}'
                    </span>
                    <span class="text-xs font-system text-slate-400 shrink-0">
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
