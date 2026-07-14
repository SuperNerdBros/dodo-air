<script lang="ts">
  import { fade, slide } from 'svelte/transition';
  import { Radio, Send, Wifi } from '@lucide/svelte';
  import Box from '../atoms/Box.atom.svelte';
  import Text from '../atoms/Text.atom.svelte';
  import Button from '../atoms/Button.atom.svelte';
  import Input from '../atoms/Input.atom.svelte';
  import Form from '../atoms/Form.atom.svelte';
  import { dalStore } from '$lib/stores/dal.svelte';

  let chatContainerRef: HTMLDivElement;

  $effect(() => {
    if (dalStore.chatter && chatContainerRef) {
      chatContainerRef.scrollTop = chatContainerRef.scrollHeight;
    }
  });

  async function handlePostChat(e: Event) {
    e.preventDefault();
    if (!dalStore.chatSender.trim() || !dalStore.chatText.trim()) {
      dalStore.playSound('beep');
      return;
    }

    dalStore.isPostingChat = true;
    try {
      const res = await fetch('/wp-json/dodo-air/v1/chatter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: dalStore.chatSender.trim(),
          island: dalStore.chatIsland.trim() || undefined,
          text: dalStore.chatText.trim()
        })
      });

      if (res.ok) {
        dalStore.playSound('chatter');
        dalStore.chatText = '';
        dalStore.fetchState();
        dalStore.earnStampProgress('hasChatted');
      }
    } catch (err) {
      console.error(err);
    } finally {
      dalStore.isPostingChat = false;
    }
  }

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();
</script>

<!-- DAL Tower Radio Panel — ACNH Aesthetic -->
<Box class="radio-panel max-w-xl mx-auto flex flex-col h-full">

  <!-- ═══ Header Bar ═══ -->
  <div class="radio-header">
    <div class="radio-header__left">
      <div class="radio-header__icon">
        <span class="radio-header__icon-emoji">📻</span>
      </div>
      <div>
        <h2 class="radio-header__title font-system">{dalStore.systemMode === 'DAL' ? 'DAL Tower Radio' : 'Luna Dream Radio'}</h2>
        <span class="radio-header__subtitle font-system">{dalStore.systemMode === 'DAL' ? 'AIRWAVE DISPATCH CHANNEL' : 'DREAMWAVE WHISPER CHANNEL'}</span>
      </div>
    </div>
    <div class="radio-header__badge font-system">
      <Wifi class="w-3 h-3" />
      ON AIR
    </div>
        <div class="radio-header__signal">
          <span class="radio-signal-dot"></span>
          <span class="radio-signal-dot radio-signal-dot--delay1"></span>
          <span class="radio-signal-dot radio-signal-dot--delay2"></span>
        </div>
  </div>

  <!-- ═══ Chat Feed ═══ -->
  <div bind:this={chatContainerRef} class="radio-feed custom-scrollbar">
    {#each [...dalStore.chatter].reverse() as msg (msg.id)}
      {@const isOrville = msg.type === 'orville'}
      {@const isWilbur = msg.type === 'wilbur'}
      {@const isSystem = msg.type === 'system'}
      {@const isNpc = isOrville || isWilbur}

      {#if isSystem}
        <div class="radio-msg radio-msg--system font-system" transition:slide={{ duration: 200 }}>
          <div class="radio-msg__system-icon">📢</div>
          {msg.text}
        </div>
      {:else if isNpc}
        <div class="radio-msg radio-msg--npc" transition:slide={{ duration: 200 }}>
          <div class="radio-avatar radio-avatar--npc">
            {isOrville ? '🦤' : '🕶️'}
          </div>
          <div class="radio-bubble radio-bubble--npc">
            <span class="radio-bubble__sender font-system">
              {msg.sender}
              <span class="radio-bubble__npc-tag font-system">{isOrville ? 'TOWER' : 'PILOT'}</span>
            </span>
            <p class="radio-bubble__text">{msg.text}</p>
          </div>
        </div>
      {:else}
        <div class="radio-msg radio-msg--user" transition:slide={{ duration: 200 }}>
          <div class="radio-avatar radio-avatar--user font-system">
            {getInitials(msg.sender)}
          </div>
          <div class="radio-bubble radio-bubble--user">
            <span class="radio-bubble__sender font-system">
              {msg.sender}
              {#if msg.island}
                <span class="radio-bubble__island font-mono">🏝️ {msg.island}</span>
              {/if}
            </span>
            <p class="radio-bubble__text">{msg.text}</p>
          </div>
        </div>
      {/if}
    {/each}

    {#if dalStore.chatter.length === 0}
      <div class="radio-empty">
        <div class="radio-empty__icon">📡</div>
        <p class="radio-empty__text font-system">Scanning frequencies...</p>
        <p class="radio-empty__sub">No chatter on this channel yet. Be the first to transmit!</p>
      </div>
    {/if}
  </div>

  <!-- ═══ Input Dock ═══ -->
  <Form onsubmit={handlePostChat} class="radio-input-dock">
    <div class="radio-input-dock__fields">
      <div class="radio-field">
        <label for="radio-callsign" class="radio-field__label font-system">NAME</label>
        <input
          id="radio-callsign"
          type="text"
          bind:value={dalStore.chatSender}
          placeholder="Your Name"
          class="radio-field__input font-sans"
          maxlength="14"
        />
      </div>
      <div class="radio-field">
        <label for="radio-island" class="radio-field__label font-system">ISLAND</label>
        <input
          id="radio-island"
          type="text"
          bind:value={dalStore.chatIsland}
          placeholder="Island Name"
          class="radio-field__input font-sans"
          maxlength="14"
        />
      </div>
    </div>

    <div class="radio-input-dock__send-row">
      <input
        type="text"
        bind:value={dalStore.chatText}
        placeholder={dalStore.chatSender ? (dalStore.systemMode === 'DAL' ? "Transmit on the airwaves..." : "Whisper into the dream...") : (dalStore.systemMode === 'DAL' ? "Enter callsign to transmit" : "Enter dreamer name to whisper")}
        disabled={!dalStore.chatSender.trim()}
        class="radio-field__input radio-field__input--message font-sans"
        maxlength="100"
      />
      <button
        type="submit"
        disabled={!dalStore.chatSender.trim() || !dalStore.chatText.trim() || dalStore.isPostingChat}
        class="radio-send-btn btn-acnh btn-acnh-primary font-system"
      >
        <Send class="w-4 h-4" />
        Send
      </button>
    </div>
  </Form>
</Box>

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
    border-bottom: 4px solid #005788;
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
    position: absolute;
    bottom: -4px;
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
    max-height: 380px;
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

  .radio-avatar--user {
    background: linear-gradient(135deg, #FFCC00 0%, #FFD633 100%);
    border-color: #E5B800;
    color: #006094;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.05em;
    box-shadow: 0 3px 0 0 rgba(204, 153, 0, 0.2);
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

  .radio-bubble__text {
    margin: 0;
    font-weight: 600;
    word-break: break-word;
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
</style>
