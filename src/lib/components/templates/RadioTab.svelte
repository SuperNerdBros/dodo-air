<script lang="ts">
  import { Compass, Ticket, Plane, BookOpen, Eye, Users, Cloud, Send, Wifi } from '@lucide/svelte';
  import type { ChatterMessage, Passport, UserProfile } from '$lib/studio-types';
  import { playSound } from '$lib/utils/audio';
  import { dalStore } from '$lib/stores/dal.svelte.ts';
  import { onMount, tick } from 'svelte';
  import { slide } from 'svelte/transition';

  let {
    chatter,
    chatSender = $bindable(''),
    chatIsland = $bindable(''),
    chatText = $bindable(''),
    handlePostChat,
    isPostingChat = false,
    profiles,
    openProfileModal,
    passport,
    isMuted = false,
    onClose
  } = $props<{
    chatter: ChatterMessage[];
    chatSender: string;
    chatIsland: string;
    chatText: string;
    handlePostChat: (e: SubmitEvent) => void;
    isPostingChat?: boolean;
    profiles: Record<string, UserProfile>;
    openProfileModal: (id: string | number) => void;
    passport: Passport;
    isMuted?: boolean;
    onClose?: () => void;
  }>();

  let chatContainerRef: HTMLDivElement;
  let durationHours = $state(1);

  let filteredChatter = $derived(
    chatter.filter((msg: ChatterMessage) => {
      if (!msg.timestamp) return true;
      const msgTime = new Date(msg.timestamp).getTime();
      const cutoff = Date.now() - (durationHours * 60 * 60 * 1000);
      return msgTime >= cutoff;
    })
  );

  $effect(() => {
    if (chatter && chatContainerRef) {
      chatContainerRef.scrollTop = chatContainerRef.scrollHeight;
    }
  });

  function getProfile(villagerName: string, islandName: string | undefined): UserProfile | undefined {
    return (Object.values(profiles) as UserProfile[]).find(
      prof => prof.villagerName.toLowerCase() === villagerName.toLowerCase() && 
              (islandName ? prof.islandName.toLowerCase() === islandName.toLowerCase() : true)
    );
  }

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();
</script>

<!-- DAL Tower Radio Panel — ACNH Aesthetic -->
<div class="radio-panel h-full flex flex-col {dalStore.systemMode === 'LUNA' ? 'luna-radio' : ''}">

  <!-- ═══ Header Bar ═══ -->
  <div class="radio-header">
    <div class="radio-header__left">
      <div class="radio-header__icon">
        <span class="radio-header__icon-emoji">📻</span>
      </div>
      <div>
    <div class="flex flex-col justify-center gap-2 items-center">
        <h2 class="radio-header__title font-system">{dalStore.systemMode === 'DAL' ? 'DAL Tower Radio' : 'Luna Dream Radio'}</h2>
            <div class="radio-header__signal shrink ">
              <span class="radio-signal-dot"></span>
              <span class="radio-signal-dot radio-signal-dot--delay1"></span>
              <span class="radio-signal-dot radio-signal-dot--delay2"></span>
            </div>
    </div>
      </div>
    </div>


        <button 
          onclick={() => onClose?.()}
          class="radio-header__badge font-system cursor-pointer hover:scale-105 transition-transform z-10"
          title="Hide Radio Tower"
        >
          <Wifi class="w-3 h-3" />
          ON AIR
        </button>

  </div>

  <div class="px-4 py-1.5 flex justify-between items-center border-b-2 gap-1 {dalStore.systemMode === 'LUNA' ? 'bg-[#3b2866] border-[#2a1b4d]' : 'bg-[#005788] border-[#003B5C]'}">
        <span class="radio-header__subtitle font-system">{dalStore.systemMode === 'DAL' ? 'AIRWAVE DISPATCH CHANNEL' : 'DREAMWAVE WHISPER CHANNEL'}</span>
    <div class="flex items-center gap-2 text-[10px] font-system text-white/90 bg-black/25 rounded-full px-2.5 py-0.5 shadow-inner">
      <button 
        type="button"
        class="hover:text-[#FFCC00] text-white cursor-pointer font-black text-[11px] px-1 transition-colors"
        onclick={() => durationHours = Math.max(1, durationHours - 1)}
      >-</button>
      <span class="font-bold tracking-widest">{durationHours} HR</span>
      <button 
        type="button"
        class="hover:text-[#FFCC00] text-white cursor-pointer font-black text-[11px] px-1 transition-colors"
        onclick={() => durationHours++}
      >+</button>
    </div>
  </div>

  <!-- ═══ Chat Feed ═══ -->
  <div bind:this={chatContainerRef} class="radio-feed custom-scrollbar">
    {#each [...filteredChatter].reverse() as msg, i (msg.id ? msg.id + '-' + i : i)}
      {@const isLuna = msg.type === 'orville' && msg.sender?.toLowerCase().includes('luna')}
      {@const isOrville = msg.type === 'orville' && !isLuna}
      {@const isWilbur = msg.type === 'wilbur'}
      {@const isSystem = msg.type === 'system'}
      {@const isNpc = isOrville || isLuna || isWilbur}

      {#if isSystem}
        <div class="radio-msg radio-msg--system font-system" transition:slide={{ duration: 200 }}>
          <div class="radio-msg__system-icon">📢</div>
          {msg.text}
        </div>
      {:else if isNpc}
        <div class="radio-msg radio-msg--npc" transition:slide={{ duration: 200 }}>
          <div class="flex flex-col items-center gap-1">
            <div class="radio-avatar radio-avatar--npc">
              {isLuna ? '💤' : isOrville ? '🦤' : '🕶️'}
            </div>
            {#if msg.timestamp}
              <span class="text-[8px] font-bold text-[#0084CC]/60 font-system text-center" style="letter-spacing:-0.5px">
                {new Date(msg.timestamp).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}
              </span>
            {/if}
          </div>
          <div class="radio-bubble radio-bubble--npc">
            <span class="radio-bubble__sender font-system">
              {msg.sender}
              <span class="radio-bubble__npc-tag font-system">{isLuna ? 'GUIDE' : isOrville ? 'TOWER' : (dalStore.systemMode === 'DAL' ? 'PILOT' : 'DREAMER')}</span>
            </span>
            <p class="radio-bubble__text">{msg.text}</p>
          </div>
        </div>
      {:else}
        {@const p = getProfile(msg.sender, msg.island)}
        <div class="radio-msg radio-msg--user" transition:slide={{ duration: 200 }}>
          <div class="flex flex-col items-center gap-1">
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div 
              class="radio-avatar radio-avatar--user font-system"
              onclick={() => {
                if (p) {
                  openProfileModal(p.userId || p.friendCode || '');
                } else {
                  openProfileModal(`SW-TEMP-${msg.sender}-${msg.island || 'Home'}`);
                }
              }}
              title="View profile"
            >
              {getInitials(msg.sender)}
            </div>
            {#if p}
              <span class="radio-bubble__trust-badge font-system">
                🍏 {p.goodApples || 0}
                {#if p.rottenTurnips > 0}
                  <span class="radio-bubble__trust-bad">|🧅 {p.rottenTurnips}</span>
                {/if}
              </span>
            {/if}
            {#if msg.timestamp}
              <span class="text-[8px] font-bold text-[#8C7A5A]/60 font-system text-center" style="letter-spacing:-0.5px">
                {new Date(msg.timestamp).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}
              </span>
            {/if}
          </div>
          <div class="radio-bubble radio-bubble--user">
            <span class="radio-bubble__sender font-system">
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <span 
                onclick={() => {
                  if (p) {
                    openProfileModal(p.userId || p.friendCode || '');
                  } else {
                    openProfileModal(`SW-TEMP-${msg.sender}-${msg.island || 'Home'}`);
                  }
                }}
                class="hover:underline cursor-pointer text-[#8C7A5A]"
                title="View chat user profile"
              >
                <strong class="text-[#0084CC]">{msg.sender}</strong>@{msg.island || p?.islandName || 'island'}
              </span>
            </span>
            <p class="radio-bubble__text">{msg.text}</p>
          </div>
        </div>
      {/if}
    {/each}

    {#if chatter.length === 0}
      <div class="radio-empty">
        <div class="radio-empty__icon">📡</div>
        <p class="radio-empty__text font-system">{dalStore.systemMode === 'DAL' ? 'Scanning frequencies...' : 'Tuning into dreams...'}</p>
        <p class="radio-empty__sub">{dalStore.systemMode === 'DAL' ? 'No chatter on this channel yet. Be the first to transmit!' : 'No whispers in the dreamscape yet. Be the first to share a dream!'}</p>
      </div>
    {/if}
  </div>

  <!-- ═══ Input Dock ═══ -->
  <div class="radio-input-dock">
    {#if dalStore.isLoggedIn}
      <form onsubmit={handlePostChat} class="radio-input-dock__send-row">
        <input
          type="text"
          bind:value={chatText}
          placeholder={dalStore.systemMode === 'DAL' ? "Transmit on the airwaves..." : "Whisper into the dream..."}
          class="radio-field__input radio-field__input--message font-sans"
          maxlength="100"
        />
        <button
          type="submit"
          disabled={!chatText.trim() || isPostingChat}
          class="radio-send-btn btn-acnh btn-acnh-primary font-system"
        >
          <Send class="w-4 h-4" />
          Send
        </button>
      </form>
    {:else}
      <div class="text-center p-2">
        <p class="text-sm font-system font-bold text-[#0084CC]">Please log in to transmit</p>
      </div>
    {/if}
  </div>
</div>

<style>
  /* ─── Panel Container ─── */
  .radio-panel {
    background: #FDF8E3;
    border: 3px solid #E6DFC7;
    border-bottom-width: 5px;
    border-radius: 28px;
    overflow: hidden;
    box-shadow:
      0 6px 0 0 #D4CDB5,
      0 8px 24px rgba(0, 0, 0, 0.08);
  }

  /* ─── Header ─── */
  .radio-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    background: linear-gradient(135deg, #0084CC 0%, #0095E8 100%);
    position: relative;
    overflow: hidden;
  }

  .radio-header::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 30% 20%, rgba(255, 204, 0, 0.15) 0%, transparent 60%);
    pointer-events: none;
  }

  .radio-header__left {
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 1;
  }

  .radio-header__icon {
    position: relative;
    width: 44px;
    height: 44px;
    background: #FFCC00;
    border: 3px solid #E5B800;
    border-bottom-width: 4px;
    border-bottom-color: #CC9900;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 3px 0 0 #CC9900;
    flex-shrink: 0;
  }

  .radio-header__icon-emoji {
    font-size: 22px;
    filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.1));
  }

  .radio-header__signal {
    /* position: absolute; */
    top: -4px;
    right: -4px;
    display: flex;
    gap: 2px;
  }

  .radio-signal-dot {
    width: 5px;
    height: 5px;
    background: #43b581;
    border-radius: 50%;
    animation: signal-pulse 1.5s ease-in-out infinite;
    box-shadow: 0 0 6px rgba(67, 181, 129, 0.6);
  }

  .radio-signal-dot--delay1 {
    animation-delay: 0.3s;
  }

  .radio-signal-dot--delay2 {
    animation-delay: 0.6s;
  }

  @keyframes signal-pulse {
    0%, 100% { opacity: 0.3; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.2); }
  }

  .radio-header__title {
    font-size: 16px;
    font-weight: 900;
    color: white;
    text-shadow: 0 2px 0 rgba(0, 0, 0, 0.15);
    margin: 0;
    line-height: 1.2;
    letter-spacing: 0.02em;
  }

  .radio-header__subtitle {
    font-size: 8px;
    font-weight: 900;
    color: rgba(255, 255, 255, 0.7);
    letter-spacing: 0.2em;
    text-transform: uppercase;
    display: block;
    margin-top: 2px;
  }

  .radio-header__badge {
    display: flex;
    align-items: center;
    gap: 5px;
    background: #43b581;
    color: white;
    font-size: 9px;
    font-weight: 900;
    letter-spacing: 0.15em;
    padding: 5px 12px;
    border-radius: 20px;
    border: 2px solid #3ca374;
    border-bottom-width: 3px;
    border-bottom-color: #2d8c5e;
    box-shadow: 0 2px 0 0 #2d8c5e;
    z-index: 1;
    text-transform: uppercase;
    animation: badge-glow 2s ease-in-out infinite alternate;
  }

  @keyframes badge-glow {
    0% { box-shadow: 0 2px 0 0 #2d8c5e, 0 0 8px rgba(67, 181, 129, 0.2); }
    100% { box-shadow: 0 2px 0 0 #2d8c5e, 0 0 16px rgba(67, 181, 129, 0.5); }
  }

  /* ─── Chat Feed ─── */
  .radio-feed {
    flex: 1;
    overflow-y: auto;
    padding: 16px 16px 8px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 200px;
    text-align: left;
    background:
      linear-gradient(180deg, rgba(253, 248, 227, 0) 0%, rgba(240, 235, 210, 0.3) 100%),
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 39px,
        rgba(200, 190, 160, 0.08) 39px,
        rgba(200, 190, 160, 0.08) 40px
      );
  }

  /* ─── Message Styles ─── */
  .radio-msg {
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }

  .radio-msg--system {
    justify-content: center;
    gap: 6px;
    align-items: center;
    background: rgba(230, 223, 199, 0.35);
    border: 1.5px dashed rgba(200, 190, 160, 0.5);
    border-radius: 16px;
    padding: 8px 14px;
    font-size: 10px;
    font-weight: 800;
    color: #8C7A5A;
    text-align: center;
    letter-spacing: 0.03em;
  }

  .radio-msg__system-icon {
    font-size: 12px;
    flex-shrink: 0;
  }

  /* ─── Avatars ─── */
  .radio-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 18px;
    border-width: 2.5px;
    border-style: solid;
    box-shadow: 0 3px 0 0 rgba(0, 0, 0, 0.08);
  }

  .radio-avatar--npc {
    background: linear-gradient(135deg, #EBF8FF 0%, #D6F0FF 100%);
    border-color: #0084CC;
    box-shadow: 0 3px 0 0 rgba(0, 132, 204, 0.15);
  }

  .radio-msg--user {
    flex-direction: row-reverse;
  }

  .radio-avatar--user {
    background: linear-gradient(135deg, #FFCC00 0%, #FFD633 100%);
    border-color: #E5B800;
    color: #006094;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.05em;
    box-shadow: 0 3px 0 0 rgba(204, 153, 0, 0.2);
    cursor: pointer;
    transition: transform 0.15s ease;
  }

  .radio-avatar--user:hover {
    transform: scale(1.1);
  }

  /* ─── Bubbles ─── */
  .radio-bubble {
    flex: 1;
    border-radius: 18px;
    padding: 10px 14px;
    font-size: 12px;
    line-height: 1.55;
    color: #4A4A4A;
    border-width: 2px;
    border-style: solid;
    border-bottom-width: 3px;
    position: relative;
  }

  .radio-bubble--npc {
    background: linear-gradient(135deg, #F0F9FF 0%, #E8F4FD 100%);
    border-color: rgba(0, 132, 204, 0.2);
    border-bottom-color: rgba(0, 132, 204, 0.25);
  }

  .radio-bubble--user {
    background: white;
    border-color: #E8E4D8;
    border-bottom-color: #D4CDB5;
  }

  .radio-bubble__sender {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 900;
    color: #0084CC;
    margin-bottom: 3px;
    flex-wrap: wrap;
  }

  .radio-bubble__npc-tag {
    font-size: 8px;
    font-weight: 900;
    background: #0084CC;
    color: white;
    padding: 1px 7px;
    border-radius: 8px;
    letter-spacing: 0.1em;
  }

  .radio-bubble__island {
    font-size: 9px;
    font-weight: 700;
    color: #8C7A5A;
    background: rgba(230, 223, 199, 0.5);
    padding: 1px 7px;
    border-radius: 8px;
  }

  .radio-bubble__trust-badge {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 8px;
    font-weight: 900;
    background: #ecfdf5;
    color: #166534;
    border: 1px solid #bbf7d0;
    border-radius: 10px;
    padding: 1px 7px;
  }

  .radio-bubble__trust-bad {
    color: #be123c;
    font-weight: 900;
  }

  .radio-bubble__text {
    margin: 0;
    font-weight: 600;
    word-break: break-word;
    text-align: left;
  }

  /* ─── Empty State ─── */
  .radio-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    text-align: center;
    gap: 6px;
  }

  .radio-empty__icon {
    font-size: 40px;
    animation: scan-rotate 3s ease-in-out infinite;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }

  @keyframes scan-rotate {
    0%, 100% { transform: rotate(-15deg); }
    50% { transform: rotate(15deg); }
  }

  .radio-empty__text {
    font-size: 14px;
    font-weight: 900;
    color: #0084CC;
    margin: 0;
  }

  .radio-empty__sub {
    font-size: 11px;
    color: #8C7A5A;
    margin: 0;
    font-weight: 600;
  }

  /* ─── Input Dock ─── */
  .radio-input-dock {
    padding: 14px 16px 16px;
    border-top: 3px solid #E6DFC7;
    background: linear-gradient(180deg, #FAF5E0 0%, #F5F0D8 100%);
    display: flex;
    flex-direction: column;
    gap: 10px;
    text-align: left;
  }

  .radio-input-dock__fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .radio-input-dock__send-row {
    display: flex;
    gap: 8px;
  }

  /* ─── Field Styles ─── */
  .radio-field {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .radio-field__label {
    font-size: 8px;
    font-weight: 900;
    color: #0084CC;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .radio-field__input {
    width: 100%;
    background: white;
    border: 2px solid #E8E4D8;
    border-bottom-width: 3px;
    border-bottom-color: #D4CDB5;
    border-radius: 14px;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 700;
    color: #4A4A4A;
    outline: none;
    transition: all 0.2s ease;
    box-shadow: 0 2px 0 0 rgba(0, 0, 0, 0.03);
  }

  .radio-field__input:focus {
    border-color: #0084CC;
    border-bottom-color: #005788;
    background: #FAFEFF;
    box-shadow: 0 2px 0 0 rgba(0, 132, 204, 0.1), 0 0 0 3px rgba(0, 132, 204, 0.08);
  }

  .radio-field__input::placeholder {
    color: #C0B89E;
    font-weight: 600;
  }

  .radio-field__input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .radio-field__input--message {
    flex: 1;
    min-width: 0;
  }

  /* ─── Send Button ─── */
  .radio-send-btn {
    padding: 8px 18px;
    font-size: 12px;
    gap: 6px;
    flex-shrink: 0;
    white-space: nowrap;
  }

  /* ─── Luna Mode Overrides ─── */
  :global(.luna-radio.radio-panel) {
    background: #1a103c;
    border-color: #3b2866;
    box-shadow: 0 6px 0 0 #2a1b4d, 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  :global(.luna-radio) .radio-header {
    background: linear-gradient(135deg, #4B0082 0%, #2a1b4d 100%);
  }
  
  :global(.luna-radio) .radio-header::before {
    background: radial-gradient(ellipse at 30% 20%, rgba(221, 160, 221, 0.15) 0%, transparent 60%);
  }

  :global(.luna-radio) .radio-header__icon {
    background: #DDA0DD;
    border-color: #BA80BA;
    border-bottom-color: #9A609A;
    box-shadow: 0 3px 0 0 #9A609A;
  }
  
  :global(.luna-radio) .radio-header__badge {
    background: #BA80BA;
    color: white;
    border-color: #9A609A;
    border-bottom-color: #7A407A;
    box-shadow: 0 2px 0 0 #7A407A;
  }
  
  :global(.luna-radio) .radio-feed {
    background:
      linear-gradient(180deg, rgba(26, 16, 60, 0) 0%, rgba(42, 27, 77, 0.5) 100%),
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 39px,
        rgba(186, 128, 186, 0.08) 39px,
        rgba(186, 128, 186, 0.08) 40px
      );
  }

  :global(.luna-radio) .radio-msg--system {
    background: rgba(75, 0, 130, 0.35);
    border-color: rgba(186, 128, 186, 0.5);
    color: #DDA0DD;
  }

  :global(.luna-radio) .radio-avatar--npc {
    background: linear-gradient(135deg, #3b2866 0%, #2a1b4d 100%);
    border-color: #BA80BA;
    box-shadow: 0 3px 0 0 rgba(186, 128, 186, 0.2);
    color: white;
  }

  :global(.luna-radio) .radio-avatar--user {
    background: linear-gradient(135deg, #DDA0DD 0%, #BA80BA 100%);
    border-color: #9A609A;
    color: #4B0082;
    box-shadow: 0 3px 0 0 rgba(154, 96, 154, 0.2);
  }

  :global(.luna-radio) .radio-bubble--npc {
    background: linear-gradient(135deg, #2a1b4d 0%, #1a103c 100%);
    border-color: rgba(186, 128, 186, 0.3);
    border-bottom-color: rgba(186, 128, 186, 0.4);
    color: #e2d8f0;
  }
  
  :global(.luna-radio) .radio-bubble__sender {
    color: #DDA0DD;
  }

  :global(.luna-radio) .radio-bubble__npc-tag {
    background: #4B0082;
  }

  :global(.luna-radio) .radio-bubble--user {
    background: #2a1b4d;
    border-color: #4b387a;
    border-bottom-color: #3b2866;
    color: #e2d8f0;
  }
  
  :global(.luna-radio) .radio-empty__text {
    color: #DDA0DD;
  }
  
  :global(.luna-radio) .radio-empty__sub {
    color: #BA80BA;
  }
  
  :global(.luna-radio) .radio-input-dock {
    border-top-color: #3b2866;
    background: linear-gradient(180deg, #1a103c 0%, #0b071a 100%);
  }
  
  :global(.luna-radio) .radio-field__label {
    color: #DDA0DD;
  }
  
  :global(.luna-radio) .radio-field__input {
    background: #2a1b4d;
    border-color: #4b387a;
    border-bottom-color: #3b2866;
    color: #e2d8f0;
  }
  
  :global(.luna-radio) .radio-field__input:focus {
    border-color: #BA80BA;
    border-bottom-color: #9A609A;
    background: #3b2866;
    box-shadow: 0 2px 0 0 rgba(186, 128, 186, 0.1), 0 0 0 3px rgba(186, 128, 186, 0.08);
  }
  
  :global(.luna-radio) .radio-send-btn {
    background: #4B0082;
    color: white;
    border-color: #BA80BA;
  }
</style>
