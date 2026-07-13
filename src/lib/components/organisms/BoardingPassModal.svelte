<script lang="ts">
  import { Ticket, X, AlertCircle } from '@lucide/svelte';
  import type { Flight, Passport, Passenger } from '$lib/studio-types';
  import { DIALOGS } from '$lib/constants/dialogs';
  import AcnhBubble from '$lib/components/molecules/AcnhBubble.svelte';
  import { playSound } from '$lib/utils/audio';
  import { PLANE_COLORS } from '$lib/utils/constants';
  import { scale, fade } from 'svelte/transition';
  import { backOut } from 'svelte/easing';
  import { dalStore } from '$lib/stores/dal.svelte';

  let {
    selectedFlight,
    onClose,
    passport,
    onBoardFlight,
    onLeaveFlight,
    boardingError = '',
    isMuted = false,
    onRequestStandby
  } = $props<{
    selectedFlight?: Flight;
    onClose: () => void;
    passport: Passport;
    onBoardFlight: (flightId: string) => void;
    onLeaveFlight: (flightId: string, passengerId: string) => void;
    boardingError?: string;
    isMuted?: boolean;
    onRequestStandby: (gate: number) => void;
  }>();

  let passengersList = $derived(selectedFlight?.passengers || []);
  let passengerIndex = $derived(passengersList.findIndex((p: Passenger) => 
    p.friendCode 
      ? p.friendCode === passport.friendCode 
      : p.name.toLowerCase() === passport.villagerName.toLowerCase()
  ));
  let isPassengerCheckedIn = $derived(passengerIndex !== -1);
  
  let seatNum = $derived(isPassengerCheckedIn ? (passengerIndex + 1) : (passengersList.length + 1));
  let seatLetter = $derived(['A', 'B', 'C', 'D'][seatNum % 4]);
  let seatAssigned = $derived(`${String(seatNum).padStart(2, '0')}${seatLetter}`);
  let boardingNumVal = $derived(selectedFlight ? `#${dalStore.systemMode === 'DAL' ? 'DAL' : 'LUNA'}-${selectedFlight.id.replace('DAL-', '')}-${String(seatNum).padStart(2, '0')}` : '');
  
  let planeColorObj = $derived(PLANE_COLORS.find(pc => pc.id === (selectedFlight?.planeColor || 'orange')) || PLANE_COLORS[0]);
  let capacity = $derived(selectedFlight?.capacity || (selectedFlight?.planeType === 'Switch 2' ? 12 : 8));
  let logoUrl = $derived(
    typeof window !== 'undefined' && (window as any).wpApiSettings?.pluginUrl
      ? `${(window as any).wpApiSettings.pluginUrl}public/dal.png`
      : '/dal.png'
  );
</script>

{#if selectedFlight}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="fixed inset-0 bg-[#006094]/40 backdrop-blur-md flex flex-col items-center justify-center p-4 z-50 gap-6 overflow-y-auto" transition:fade={{ duration: 200 }}>
    
    <!-- Dialogue Bubble -->
    <div class="w-full max-w-4xl shrink-0 mt-8 md:mt-0" transition:scale={{ duration: 300, start: 0.95, easing: backOut }}>
      <AcnhBubble 
        title={dalStore.systemMode === 'DAL' ? 'Orville' : 'Luna'}
        onDismiss={() => { playSound('beep', isMuted); onClose(); }}
        dialogText={
          isPassengerCheckedIn
            ? (dalStore.systemMode === 'DAL' ? DIALOGS.boardingPassModal.dalCheckedIn(selectedFlight.id) : DIALOGS.boardingPassModal.lunaCheckedIn(selectedFlight.id))
            : passengersList.length >= capacity
              ? (dalStore.systemMode === 'DAL' ? DIALOGS.boardingPassModal.dalFull(capacity) : DIALOGS.boardingPassModal.lunaFull(capacity))
              : (dalStore.systemMode === 'DAL' ? DIALOGS.boardingPassModal.dalBook(selectedFlight.id) : DIALOGS.boardingPassModal.lunaBook(selectedFlight.id))
        }
      >
      </AcnhBubble>
    </div>

    <!-- ═══════════════════════════════════════════════
         OFFICIAL BOARDING PASS — redesigned layout
         ═══════════════════════════════════════════════ -->
    <div
      class="bp-card max-w-2xl w-full mb-8 shrink-0"
      transition:scale={{ duration: 300, delay: 50, start: 0.95, easing: backOut }}
    >
      <!-- ── AIRLINE HEADER STRIP ── -->
      <div class="bp-header {dalStore.systemMode === 'DAL' ? 'bp-header--dal' : 'bp-header--luna'}">
        <div class="bp-header-logo">
          {#if dalStore.systemMode === 'DAL'}
            <img src={logoUrl} alt="Dodo Air Lines" class="bp-logo-img" />
          {:else}
            <span class="bp-logo-luna">🌙 LUNA DREAM SUITE</span>
          {/if}
        </div>
        <div class="bp-header-meta">
          <span class="bp-header-flight">{selectedFlight.id}</span>
          <span class="bp-header-label">{dalStore.systemMode === 'DAL' ? 'BOARDING PASS' : 'DREAM TICKET'}</span>
        </div>
        <button
          onclick={() => { playSound('beep', isMuted); onClose(); }}
          class="bp-close-btn {dalStore.systemMode === 'DAL' ? 'bp-close-btn--dal' : 'bp-close-btn--luna'}"
          aria-label="Close"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- ── MAIN TICKET BODY ── -->
      <div class="bp-body">

        <!-- ── AIRPORT HERO ROW ── -->
        <div class="bp-airport-hero">
          <div class="bp-airport">
            <span class="bp-airport-code {dalStore.systemMode === 'DAL' ? 'text-[#0084CC]' : 'text-[#4B0082]'}">
              {(passport.hasCreated ? passport.islandName : 'HOME').slice(0,3).toUpperCase()}
            </span>
            <span class="bp-airport-name">
              🏝️ {passport.hasCreated ? passport.islandName : 'Home Port'}
            </span>
            <span class="bp-airport-label">{dalStore.systemMode === 'DAL' ? 'DEPARTURE' : 'WAKING ISLAND'}</span>
          </div>

          <div class="bp-route-arrow">
            <div class="bp-route-line {dalStore.systemMode === 'DAL' ? 'bg-[#0084CC]' : 'bg-[#4B0082]'}"></div>
            <span class="bp-plane-icon">{dalStore.systemMode === 'DAL' ? '✈' : '☁️'}</span>
            <div class="bp-route-line {dalStore.systemMode === 'DAL' ? 'bg-[#0084CC]' : 'bg-[#4B0082]'}"></div>
          </div>

          <div class="bp-airport bp-airport--right">
            <span class="bp-airport-code {dalStore.systemMode === 'DAL' ? 'text-[#0084CC]' : 'text-[#4B0082]'}">
              {selectedFlight.islandName.slice(0,3).toUpperCase()}
            </span>
            <span class="bp-airport-name">
              🏝️ {selectedFlight.islandName}
            </span>
            <span class="bp-airport-label">{dalStore.systemMode === 'DAL' ? 'DESTINATION' : 'DREAM ISLAND'}</span>
          </div>
        </div>

        <!-- ── PASSENGER INFO ROW ── -->
        <div class="bp-info-grid">
          <div class="bp-info-field">
            <span class="bp-field-label">PASSENGER NAME</span>
            <span class="bp-field-value">{passport.hasCreated ? passport.villagerName : 'GUEST PASSENGER'}</span>
          </div>
          <div class="bp-info-field">
            <span class="bp-field-label">HOST</span>
            <span class="bp-field-value">{selectedFlight.hostName}</span>
          </div>
          <div class="bp-info-field">
            <span class="bp-field-label">{dalStore.systemMode === 'DAL' ? 'AIRCRAFT' : 'VESSEL'}</span>
            <span class="bp-field-value" style="color: {planeColorObj.hex}">
              {dalStore.systemMode === 'DAL' ? `${selectedFlight.planeType || 'Switch'} · ${planeColorObj.name}` : 'Slumber Gateway'}
            </span>
          </div>
        </div>

        <!-- ── GATE / SEAT / STATUS STRIP ── -->
        <div class="bp-strip {dalStore.systemMode === 'DAL' ? 'bp-strip--dal' : 'bp-strip--luna'}">
          <div class="bp-strip-cell">
            <span class="bp-strip-label">{dalStore.systemMode === 'DAL' ? 'GATE' : 'ZONE'}</span>
            <span class="bp-strip-value">{selectedFlight.gate}</span>
          </div>
          <div class="bp-strip-divider"></div>
          <div class="bp-strip-cell">
            <span class="bp-strip-label">SEAT</span>
            <span class="bp-strip-value">{seatAssigned}</span>
          </div>
          <div class="bp-strip-divider"></div>
          <div class="bp-strip-cell">
            <span class="bp-strip-label">CLASS</span>
            <span class="bp-strip-value">ECO</span>
          </div>
          <div class="bp-strip-divider"></div>
          <div class="bp-strip-cell">
            <span class="bp-strip-label">STATUS</span>
            <span class="bp-strip-value bp-strip-status">{selectedFlight.status}</span>
          </div>
        </div>

        <!-- ── DODO CODE / ACTION ZONE ── -->
        <div class="bp-action-zone">
          {#if isPassengerCheckedIn}
            <div class="bp-code-reveal">
              <span class="bp-code-label">
                {dalStore.systemMode === 'DAL' ? '🟢 BOARDED — DODO CODE' : '🟢 ENTERING SLUMBER — DOZE CODE'}
              </span>
              <span class="bp-code-value">{selectedFlight.dodoCode}</span>
              <button
                onclick={() => {
                  const p = passengersList.find((pass: Passenger) =>
                    pass.friendCode
                      ? pass.friendCode === passport.friendCode
                      : pass.name.toLowerCase() === passport.villagerName.toLowerCase()
                  );
                  if (p) onLeaveFlight(selectedFlight.id, p.id);
                }}
                class="btn-acnh btn-acnh-outline w-full mt-2"
              >
                👋 {dalStore.systemMode === 'DAL' ? 'Return home / Clear seat' : 'Wake up / Clear bed'}
              </button>
            </div>
          {:else if passengersList.length >= capacity}
            <div class="bp-full-notice">
              <span class="bp-full-icon">⚠️</span>
              <span class="bp-full-label">{dalStore.systemMode === 'DAL' ? 'SEAPLANE FULL' : 'DREAM BED FULL'}</span>
              <button
                type="button"
                onclick={() => onRequestStandby(selectedFlight.gate)}
                class="bp-standby-btn"
              >
                🛋️ FILE STANDBY TICKET
              </button>
            </div>
          {:else}
            <div class="w-full space-y-1.5">
              {#if boardingError}
                <p class="text-xs font-bold text-red-600 flex items-center gap-1 font-system">
                  <AlertCircle class="w-3.5 h-3.5" /> {boardingError}
                </p>
              {/if}
              <button
                onclick={() => onBoardFlight(selectedFlight.id)}
                disabled={selectedFlight.status === 'Closed' || selectedFlight.status === 'Departed'}
                class="bp-board-btn {dalStore.systemMode === 'DAL' ? 'bp-board-btn--dal' : 'bp-board-btn--luna'}"
              >
                <Ticket class="w-4 h-4 shrink-0" />
                {dalStore.systemMode === 'DAL' ? 'BOARD SEAPLANE (GET DODO CODE)' : 'ENTER DREAM (GET DOZE CODE)'}
              </button>
            </div>
          {/if}
        </div>
      </div>

      <!-- ── PERFORATION TEAR LINE ── -->
      <div class="bp-tear-line">
        <div class="bp-tear-circle bp-tear-circle--left"></div>
        <div class="bp-tear-dashes {dalStore.systemMode === 'DAL' ? 'border-[#0084CC]/30' : 'border-[#4B0082]/30'}"></div>
        <div class="bp-tear-circle bp-tear-circle--right"></div>
      </div>

      <!-- ── STUB ── -->
      <div class="bp-stub">
        <div class="bp-stub-info">
          <span class="bp-stub-label">BOARDING №</span>
          <span class="bp-stub-value">{boardingNumVal}</span>
          <span class="bp-stub-label mt-2">{dalStore.systemMode === 'DAL' ? 'GATE' : 'ZONE'}</span>
          <span class="bp-stub-value">{selectedFlight.gate}</span>
          <span class="bp-stub-label mt-2">SEAT</span>
          <span class="bp-stub-value">{seatAssigned}</span>
        </div>

        <!-- Vertical barcode -->
        <div class="bp-barcode">
          {#each [2, 1, 3, 1, 2, 4, 1, 3, 1, 2, 1, 4, 2, 1, 3, 2, 1, 4, 1, 2] as h}
            <div class="bp-barcode-bar" style="height: {h * 8 + 16}px"></div>
          {/each}
        </div>

        <div class="bp-stub-right">
          <span class="bp-stub-airline">
            {dalStore.systemMode === 'DAL' ? 'DODO AIR LINES' : 'LUNA DREAM CO.'}
          </span>
          <span class="bp-stub-note">
            {dalStore.systemMode === 'DAL' ? '✈ Exit via airport gates' : '🌙 Wake up to exit'}
          </span>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  /* ══════════════════════════════════════════════════
     BOARDING PASS — Component Styles
     ══════════════════════════════════════════════════ */

  .bp-card {
    border-radius: 20px;
    overflow: hidden;
    box-shadow:
      0 25px 60px rgba(0, 100, 180, 0.25),
      0 4px 16px rgba(0, 0, 0, 0.15);
    background: #fff;
    font-family: 'system-ui', sans-serif;
  }

  /* ── Header ── */
  .bp-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 18px;
    color: #fff;
  }
  .bp-header--dal  { background: linear-gradient(135deg, #004a7c 0%, #0084CC 60%, #00a8e8 100%); }
  .bp-header--luna { background: linear-gradient(135deg, #1a0033 0%, #4B0082 60%, #7B52AB 100%); }

  .bp-header-logo { flex: 1; display: flex; align-items: center; }
  .bp-logo-img    { height: 38px; width: auto; filter: brightness(0) invert(1); }
  .bp-logo-luna   { font-size: 1rem; font-weight: 900; letter-spacing: 0.05em; }

  .bp-header-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
  }
  .bp-header-flight {
    font-size: 1.1rem;
    font-weight: 900;
    letter-spacing: 0.1em;
    color: #FFCC00;
  }
  .bp-header-label {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    opacity: 0.75;
    text-transform: uppercase;
  }

  .bp-close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    margin-left: 8px;
    transition: opacity 0.15s;
    color: #FFCC00;
  }
  .bp-close-btn--dal  { background: rgba(0,0,0,0.25); }
  .bp-close-btn--luna { background: rgba(0,0,0,0.25); color: #DDA0DD; }
  .bp-close-btn:hover { opacity: 0.75; }

  /* ── Body ── */
  .bp-body {
    padding: 18px 20px 14px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  /* ── Airport Hero ── */
  .bp-airport-hero {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .bp-airport {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-width: 0;
    flex: 1;
  }
  .bp-airport--right { align-items: flex-end; text-align: right; }

  .bp-airport-code {
    font-size: 2.4rem;
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.02em;
  }
  .bp-airport-name {
    font-size: 0.7rem;
    font-weight: 700;
    color: #374151;
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 120px;
  }
  .bp-airport-label {
    font-size: 0.55rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: #9CA3AF;
    margin-top: 2px;
    text-transform: uppercase;
  }

  .bp-route-arrow {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }
  .bp-route-line { flex: 1; height: 2px; width: 30px; }
  .bp-plane-icon { font-size: 1.2rem; }

  /* ── Info Grid ── */
  .bp-info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    padding: 10px 12px;
    background: #F8FAFF;
    border-radius: 12px;
    border: 1px solid #E2E8F0;
  }
  .bp-info-field { display: flex; flex-direction: column; gap: 2px; }
  .bp-field-label {
    font-size: 0.55rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    color: #9CA3AF;
    text-transform: uppercase;
  }
  .bp-field-value {
    font-size: 0.8rem;
    font-weight: 700;
    color: #1E293B;
  }

  /* ── Gate/Seat/Status Strip ── */
  .bp-strip {
    display: flex;
    align-items: stretch;
    border-radius: 12px;
    overflow: hidden;
    border: 2px solid;
  }
  .bp-strip--dal  { border-color: #0084CC; background: #EBF7FF; }
  .bp-strip--luna { border-color: #4B0082; background: #F4EEFF; }

  .bp-strip-cell {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 4px;
    gap: 3px;
  }
  .bp-strip-label {
    font-size: 0.5rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    color: #9CA3AF;
  }
  .bp-strip-value {
    font-size: 1rem;
    font-weight: 900;
    color: #1E293B;
    letter-spacing: 0.02em;
  }
  .bp-strip-status { color: #D97706; }
  .bp-strip-divider {
    width: 1px;
    background: rgba(0,0,0,0.1);
    margin: 6px 0;
  }

  /* ── Action Zone ── */
  .bp-action-zone { display: flex; flex-direction: column; gap: 6px; }

  .bp-code-reveal {
    background: #F0FDF4;
    border: 2px solid #16A34A;
    border-radius: 12px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    text-align: center;
  }
  .bp-code-label {
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    color: #15803D;
    text-transform: uppercase;
  }
  .bp-code-value {
    font-size: 1.8rem;
    font-weight: 900;
    color: #15803D;
    letter-spacing: 0.3em;
    text-transform: uppercase;
  }

  .bp-full-notice {
    background: #FFFBEB;
    border: 1px solid #FDE68A;
    border-radius: 12px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    text-align: center;
  }
  .bp-full-icon  { font-size: 1.2rem; }
  .bp-full-label { font-size: 0.7rem; font-weight: 800; color: #92400E; letter-spacing: 0.1em; }

  .bp-standby-btn {
    width: 100%;
    background: #FF9F43;
    color: #fff;
    font-weight: 800;
    font-size: 0.7rem;
    padding: 8px 12px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    transition: background 0.15s;
  }
  .bp-standby-btn:hover { background: #ff8f24; }

  .bp-board-btn {
    width: 100%;
    font-weight: 900;
    font-size: 0.75rem;
    padding: 12px 16px;
    border-radius: 12px;
    border-bottom-width: 4px;
    border-style: solid;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.15s;
  }
  .bp-board-btn:active { transform: scale(0.97); }
  .bp-board-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .bp-board-btn--dal  { background: #FFCC00; color: #004a7c; border-color: #CC9900; }
  .bp-board-btn--luna { background: #DDA0DD; color: #4B0082; border-color: #ba80ba; }
  .bp-board-btn--dal:hover  { background: #FFD740; }
  .bp-board-btn--luna:hover { background: #e8b5e8; }

  /* ── Tear Line ── */
  .bp-tear-line {
    display: flex;
    align-items: center;
    position: relative;
    padding: 0 -1px;
  }
  .bp-tear-circle {
    width: 20px;
    height: 20px;
    background: #006094;
    border-radius: 50%;
    flex-shrink: 0;
    background: rgba(0, 96, 148, 0.35);
  }
  .bp-tear-circle--left  { margin-left: -10px; }
  .bp-tear-circle--right { margin-right: -10px; }
  .bp-tear-dashes {
    flex: 1;
    border-top: 2px dashed;
    margin: 0 2px;
  }

  /* ── Stub ── */
  .bp-stub {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    gap: 16px;
    background: #F8FAFF;
  }

  .bp-stub-info {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 70px;
  }
  .bp-stub-label {
    font-size: 0.5rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    color: #9CA3AF;
    text-transform: uppercase;
  }
  .bp-stub-value {
    font-size: 0.9rem;
    font-weight: 900;
    color: #1E293B;
    letter-spacing: 0.05em;
  }

  /* Vertical barcode */
  .bp-barcode {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    flex: 1;
    justify-content: center;
    padding: 4px 0;
  }
  .bp-barcode-bar {
    width: 3px;
    background: #1E293B;
    border-radius: 1px;
  }

  .bp-stub-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    text-align: right;
    gap: 4px;
    min-width: 90px;
  }
  .bp-stub-airline {
    font-size: 0.6rem;
    font-weight: 900;
    letter-spacing: 0.1em;
    color: #374151;
    text-transform: uppercase;
  }
  .bp-stub-note {
    font-size: 0.55rem;
    color: #9CA3AF;
    font-style: italic;
  }

  /* Mobile: stack airport codes smaller */
  @media (max-width: 480px) {
    .bp-airport-code { font-size: 1.8rem; }
    .bp-info-grid { grid-template-columns: 1fr 1fr; }
    .bp-barcode { display: none; }
  }
</style>
