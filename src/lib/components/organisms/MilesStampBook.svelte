<script lang="ts">
  import { STAMP_CHALLENGES } from '$lib/utils/constants';
  import type { Passport } from '$lib/studio-types';
  import { playSound } from '$lib/utils/audio';
  import { scale, fade } from 'svelte/transition';
  import { backOut, cubicOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';

  let {
    isOpen = false,
    onClose = () => {},
    passport,
    onClaimStamp = () => {},
    isMuted = false
  } = $props<{
    isOpen?: boolean;
    onClose?: () => void;
    passport: Passport;
    onClaimStamp?: (stampId: string, miles: number) => void;
    isMuted?: boolean;
  }>();

  // Handle dynamic plugin URL for WordPress environments
  const baseUrl = (typeof window !== 'undefined' && (window as any).wpApiSettings?.pluginUrl) 
    ? `${(window as any).wpApiSettings.pluginUrl}public`
    : '';

  let selectedChallengeId = $state<string | null>(null);
  let carouselActive = $derived(!!selectedChallengeId);

  let displayedMiles = tweened(passport?.miles ?? 2000, {
    duration: 1200,
    easing: cubicOut
  });

  let prevMiles = $state(passport?.miles ?? 2000);
  let tallyInterval: any = null;

  $effect(() => {
    if (passport?.miles !== undefined && passport.miles !== prevMiles) {
      prevMiles = passport.miles;
      if (tallyInterval) clearInterval(tallyInterval);
      tallyInterval = setInterval(() => {
        playSound('tally', isMuted);
      }, 60);
      setTimeout(() => {
        if (tallyInterval) clearInterval(tallyInterval);
        playSound('chime', isMuted);
      }, 1200);
      displayedMiles.set(passport.miles);
    }
    
    return () => {
      if (tallyInterval) clearInterval(tallyInterval);
    };
  });

  function getProgress(id: string) {
    let count = 0;
    if (id === 'create' && passport?.hasCreated) count = 1;
    if (id === 'board' && passport?.hasBoarded) count = 1;
    if (id === 'host' && passport?.hasHosted) count = 1;
    if (id === 'chat' && passport?.hasChatted) count = 1;
    if (id === 'custom' && passport?.hasCustomized) count = 1;
    if (id === 'standby' && passport?.hasRequested) count = 1;
    return count;
  }

  function isLevelClaimed(challengeId: string, levelIndex: number) {
    return passport?.claimedStampIds?.includes(`${challengeId}_${levelIndex}`) || 
           (levelIndex === 0 && passport?.claimedStampIds?.includes(challengeId));
  }

  function claimLevel(challengeId: string, levelIndex: number, miles: number) {
    playSound('stamp', isMuted);
    onClaimStamp(`${challengeId}_${levelIndex}`, miles);
  }

  const bgMap: Record<string, string> = {
    create: 'event', 
    board: 'communication', 
    host: 'mydesign', 
    chat: 'smartphone', 
    custom: 'diy', 
    standby: 'landmaking' 
  };

  let selectedCardIndex = $derived(selectedChallengeId ? STAMP_CHALLENGES.findIndex(c => c.id === selectedChallengeId) : -1);

  function setCarouselIndex(id: string) {
    playSound('pop', isMuted);
    selectedChallengeId = id;
  }

  function toggleCarousel() {
    playSound('beep', isMuted);
    selectedChallengeId = null;
  }

  function prevCard() {
    if (selectedCardIndex > 0) {
      playSound('thwip', isMuted);
      selectedChallengeId = STAMP_CHALLENGES[selectedCardIndex - 1].id;
    }
  }

  function nextCard() {
    if (selectedCardIndex < STAMP_CHALLENGES.length - 1) {
      playSound('thwip', isMuted);
      selectedChallengeId = STAMP_CHALLENGES[selectedCardIndex + 1].id;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (carouselActive) {
      if (e.key === 'Escape' || e.key === 'b') {
        toggleCarousel();
      } else if (e.key === 'ArrowLeft') {
        prevCard();
      } else if (e.key === 'ArrowRight') {
        nextCard();
      }
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
  <div class="miles-root fixed inset-0 z-50 w-full h-full text-[#4A4A4A] overflow-hidden"
       style="
         --img-paper: url('{baseUrl}/img/paper-bg.png');
         --img-banner: url('{baseUrl}/img/banner-bg-rounded.png');
         --img-nooki: url('{baseUrl}/img/nooki-circle.svg');
         --img-miles-bg: url('{baseUrl}/img/nook-miles-bg.svg');
         
         --img-bg-event: url('{baseUrl}/img/bg-event.png');
         --img-bg-communication: url('{baseUrl}/img/bg-communication.png');
         --img-bg-mydesign: url('{baseUrl}/img/bg-mydesign.png');
         --img-bg-smartphone: url('{baseUrl}/img/bg-smartphone.png');
         --img-bg-diy: url('{baseUrl}/img/bg-diy.png');
         --img-bg-landmaking: url('{baseUrl}/img/bg-landmaking.png');

         --img-bg-event-lg: url('{baseUrl}/img/bg-event-large.png');
         --img-bg-communication-lg: url('{baseUrl}/img/bg-communication-large.png');
         --img-bg-mydesign-lg: url('{baseUrl}/img/bg-mydesign-large.png');
         --img-bg-smartphone-lg: url('{baseUrl}/img/bg-smartphone-large.png');
         --img-bg-diy-lg: url('{baseUrl}/img/bg-diy-large.png');
         --img-bg-landmaking-lg: url('{baseUrl}/img/bg-landmaking-large.png');

         --img-card-desc: url('{baseUrl}/img/card-description-bg.svg');
         --img-nook-face: url('{baseUrl}/img/orville-face.svg');
         --img-btn-bg: url('{baseUrl}/img/btn-bg.png');
       "
  >
    <!-- Header -->
    <header class="header">
      <div class="logo-wrapper">
        <div class="logo" />
      </div>
    </header>

    <!-- Nook Miles -->
    <div class="nook-miles">
      <div class="nook-miles__icon">
        <img src="{baseUrl}/img/icon-nook-mile.png" alt="Nook miles icon" />
      </div>
      <div class="nook-miles__count">{Math.floor($displayedMiles).toLocaleString()}</div>
    </div>

    <!-- Close button -->
    <button class="absolute top-8 left-8 w-16 h-16 rounded-full bg-white border-4 border-slate-200 shadow-md text-slate-500 z-[1000] flex items-center justify-center cursor-pointer font-bold text-xl hover:scale-110 transition-transform active:scale-95" onclick={() => { playSound('beep', isMuted); onClose(); }}>
      X
    </button>

    <!-- Carousel Overlay -->
    {#if carouselActive}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="carousel-overlay absolute inset-0 z-[500] bg-black/40 backdrop-blur-sm flex items-center justify-center" transition:fade={{ duration: 200 }} onclick={(e) => { if(e.target === e.currentTarget) toggleCarousel(); }}>
        
        <div class="carousel" transition:scale={{ duration: 300, start: 0.8, easing: backOut }}>
          {#each STAMP_CHALLENGES as challenge, i}
            {#if i === selectedCardIndex}
              {@const category = bgMap[challenge.id]}
              {@const tiers = challenge.levels.length}
              <div class="card-wrapper" in:fade={{duration: 200}}>
                <div class={`card card--${category}`}>
                  <div class="card__title">{challenge.icon} {challenge.title}</div>
                  <div class="card__description">
                    <div>{challenge.desc}</div>
                    <div class="card__description__nook"></div>
                  </div>
                  
                  <div class={`card-badges card-badges--${tiers}`}>
                    {#each challenge.levels as level, lIdx}
                      {@const isClaimed = isLevelClaimed(challenge.id, lIdx)}
                      {@const progress = getProgress(challenge.id)}
                      {@const canClaim = progress >= level.target && !isClaimed}

                      <div class={`stamp-wrapper stamp-wrapper--${lIdx + 1}`}>
                        {#if canClaim}
                          <button class="absolute -top-16 left-1/2 -translate-x-1/2 bg-[#5C73FF] text-white font-bold px-4 py-2 rounded shadow-lg border-b-4 border-[#3346B0] whitespace-nowrap hover:scale-110 active:scale-95 z-50 animate-bounce" onclick={() => claimLevel(challenge.id, lIdx, level.miles)}>
                            Claim {level.miles}!
                          </button>
                        {/if}
                        {#if isClaimed}
                          <div class={`stamp stamp--${lIdx + 1}`}>
                            <img src="{baseUrl}/img/stamp-{category}.png" class="stamp__image drop-shadow-md" alt="stamped" />
                          </div>
                        {:else if canClaim}
                          <div class="absolute inset-0 bg-yellow-300/50 rounded-full animate-pulse blur-md w-24 h-24 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                        {/if}
                      </div>
                    {/each}
                    <img src="{baseUrl}/img/track-straight-{tiers}{tiers > 1 ? '-connected' : ''}.svg" alt="track" class="card-badges__track" />
                  </div>
                </div>
              </div>
            {/if}
          {/each}

          <button class={`carousel__button carousel__button--prev ${selectedCardIndex === 0 ? 'opacity-0 pointer-events-none' : ''}`} onclick={prevCard}>
            <svg viewBox="0 0 74.8 214.3">
              <path d="M0.1,101.5C0.6,95.1,3.7,89.9,7.3,85C16.1,72.9,25,60.8,33.9,48.8C43,36.4,52.2,23.9,61.3,11.5c2.3-3.2,4.5-6.5,6.8-9.6 c1.6-2.1,2.9-2.3,4.5-1.1c1.5,1.2,1.8,2.1,0.7,3.8c-1.5,2.5-3.1,5-4.9,7.4c-13,17.8-26,35.5-39,53.2c-6,8.2-12.1,16.4-18.2,24.6 c-3.5,4.7-5.8,10.1-6,15.9c-0.3,6.4,2.2,12.2,6,17.4c8.8,12.1,17.6,24.1,26.5,36.2c10.1,13.8,20.3,27.6,30.5,41.3 c1.3,1.8,3.3,4.8,4.6,6.6c2.8,3.8,2.8,3.8-1.1,6.6c-0.9,0.5-1,0.8-1.8,0c-6.9-9.6-13.8-19.2-20.7-28.7 c-7.7-10.6-15.5-21.2-23.2-31.8c-6-8.2-11.9-16.5-18-24.6c-4-5.3-7.3-10.9-7.9-17.7l0.1-5.1L0.1,101.5z" />
            </svg>
          </button>
          
          <button class={`carousel__button carousel__button--next ${selectedCardIndex === STAMP_CHALLENGES.length - 1 ? 'opacity-0 pointer-events-none' : ''}`} onclick={nextCard}>
            <svg viewBox="0 0 74.8 214.3">
              <path d="M0.1,101.5C0.6,95.1,3.7,89.9,7.3,85C16.1,72.9,25,60.8,33.9,48.8C43,36.4,52.2,23.9,61.3,11.5c2.3-3.2,4.5-6.5,6.8-9.6 c1.6-2.1,2.9-2.3,4.5-1.1c1.5,1.2,1.8,2.1,0.7,3.8c-1.5,2.5-3.1,5-4.9,7.4c-13,17.8-26,35.5-39,53.2c-6,8.2-12.1,16.4-18.2,24.6 c-3.5,4.7-5.8,10.1-6,15.9c-0.3,6.4,2.2,12.2,6,17.4c8.8,12.1,17.6,24.1,26.5,36.2c10.1,13.8,20.3,27.6,30.5,41.3 c1.3,1.8,3.3,4.8,4.6,6.6c2.8,3.8,2.8,3.8-1.1,6.6c-0.9,0.5-1,0.8-1.8,0c-6.9-9.6-13.8-19.2-20.7-28.7 c-7.7-10.6-15.5-21.2-23.2-31.8c-6-8.2-11.9-16.5-18-24.6c-4-5.3-7.3-10.9-7.9-17.7l0.1-5.1L0.1,101.5z" />
            </svg>
          </button>
        </div>
      </div>
    {/if}

    <!-- Achievements Grid -->
    <div class="achievements-wrapper h-full w-full overflow-y-auto">
      <div class="achievements">
        {#each STAMP_CHALLENGES as challenge}
          {@const category = bgMap[challenge.id]}
          {@const tiers = challenge.levels.length}
          
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div class={`achievement achievement--${category}`} onclick={() => setCarouselIndex(challenge.id)}>
            <div class="achievement__title">{challenge.icon} {challenge.title}</div>
            
            <div class={`achievement__spaces achievement__spaces--${tiers}`}>
              {#each challenge.levels as level, lIdx}
                {@const isClaimed = isLevelClaimed(challenge.id, lIdx)}
                {@const progress = getProgress(challenge.id)}
                {@const canClaim = progress >= level.target && !isClaimed}

                <div class={`stamp-wrapper stamp-wrapper--${lIdx + 1}`}>
                  {#if isClaimed}
                    <div class="stamp">
                      <img src="{baseUrl}/img/stamp-{category}.png" class="stamp__image drop-shadow-sm" alt="stamped" />
                    </div>
                  {:else if canClaim}
                    <div class="stamp">
                      <div class="w-10 h-10 md:w-16 md:h-16 rounded-full bg-yellow-300 animate-pulse border-2 border-yellow-500 flex items-center justify-center font-bold text-yellow-800 text-xs">
                        !
                      </div>
                    </div>
                  {/if}
                  <div class={`stamp-wrapper__tier stamp-wrapper__tier--${lIdx + 1} stamp-wrapper__tier--${category}`}>
                    {level.miles}
                  </div>
                </div>
              {/each}
              
              <img class="achievement__spaces-svg" alt="track" src="{baseUrl}/img/awards-{tiers}-blank{tiers > 1 ? '-connected' : ''}.svg" />
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  html {
    font-size: 62.5%; /* For rem calculations based on 10px */
  }

  /* ROOT */
  .miles-root {
    background: #c2cff2 var(--img-paper) center repeat;
    font-family: 'FOT-Seurat Pro B', 'FOT-RodinBokutoh Pro EB', sans-serif;
  }

  /* HEADER */
  .header {
    height: 125px;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background: var(--img-banner) center repeat-x;
    background-size: contain;
    z-index: 100;
    pointer-events: none;
  }

  .logo-wrapper {
    width: 750px;
    position: absolute;
    top: 45%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .logo {
    width: 84px;
    height: 84px;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 30px;
    transform: translateY(-50%);
    background: #eae5d0 var(--img-nooki) center bottom no-repeat;
    opacity: 0.5;
  }

  @media (min-width: 562px) {
    .logo-wrapper { width: 1142px; }
    .logo { left: -12px; }
  }

  /* NOOK MILES */
  .nook-miles {
    position: absolute;
    top: 20px;
    right: 34px;
    background: var(--img-miles-bg) center no-repeat;
    width: 190px;
    height: 107px;
    transform: rotate(3deg);
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 200;
  }

  @media (min-width: 768px) {
    .nook-miles { z-index: 1000; }
  }

  .nook-miles__icon {
    width: 66px;
    height: 32px;
    margin-bottom: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 22px 0 0 3px;
  }

  .nook-miles__icon img {
    width: 90%;
    transform: rotate(2deg);
  }

  .nook-miles__count {
    width: 177px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #bfdcfe;
    font-size: 34px;
    padding-top: 5px;
    font-weight: 700;
  }

  /* ACHIEVEMENTS GRID */
  .achievements {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    padding: 150px 0 170px;
    max-width: 1370px;
    margin: 0 auto;
  }

  @media (min-width: 768px) {
    .achievements { padding: 130px 100px 113px 50px; }
  }

  /* ACHIEVEMENT ITEM */
  .achievement {
    width: 362px;
    height: 216px;
    border: 10px solid #fefef2;
    background: #ced6ed;
    margin: 14px;
    box-shadow: 0 2px 5px rgba(0,0,0, 0.1);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    transition: transform 0.2s;
    position: relative;
    cursor: pointer;
  }

  .achievement:before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 100%;
    height: 104%;
    background-size: cover;
    background-position: 0 -8px;
    pointer-events: none;
  }

  @media(hover: hover) {
    .achievement:hover { transform: rotate(-2deg) scale(1.07); }
  }

  .achievement--event:before { background-image: var(--img-bg-event); }
  .achievement--communication:before { background-image: var(--img-bg-communication); }
  .achievement--mydesign:before { background-image: var(--img-bg-mydesign); }
  .achievement--smartphone:before { background-image: var(--img-bg-smartphone); }
  .achievement--diy:before { background-image: var(--img-bg-diy); }
  .achievement--landmaking:before { background-image: var(--img-bg-landmaking); }

  .achievement--event { background: #fbe4d2 var(--img-paper) center repeat; }
  .achievement--communication { background: #f9f5b8 var(--img-paper) center repeat; }
  .achievement--mydesign { background: #fde4e0 var(--img-paper) center repeat; }
  .achievement--smartphone { background: #bfdef0 var(--img-paper) center repeat; }
  .achievement--diy { background: #f9f2c6 var(--img-paper) center repeat; }
  .achievement--landmaking { background: #d7efd0 var(--img-paper) center repeat; }

  .achievement__title {
    font-size: 26px;
    font-weight: 600;
    letter-spacing: 0.5px;
    color: #72631e;
    text-align: center;
    padding-top: 10px;
    margin-bottom: auto;
    z-index: 10;
  }

  .achievement__spaces { position: relative; }
  .achievement__spaces--1 { width: 110px; margin-bottom: 8px; }
  .achievement__spaces--2 { width: 218px; margin-bottom: 8px; }
  .achievement__spaces--3 { width: 310px; margin-bottom: 14px; }
  .achievement__spaces--4 { width: 280px; margin-bottom: 8px; }
  .achievement__spaces--5 { width: 322px; margin-bottom: 8px; }
  .achievement__spaces--6 { width: 334px; margin-bottom: 4px; }
  .achievement__spaces-svg { width: 100%; height: 100%; }

  .stamp-wrapper__tier {
    text-align: center;
    font-weight: 700;
    position: relative;
    z-index: 10;
  }
  
  .achievement__spaces .stamp-wrapper { position: absolute; display: block; }

  .achievement__spaces--1 .stamp-wrapper { width: 116px; top: 50%; left: 50%; transform: translate(-51%, -51%); }
  .achievement--mydesign .achievement__spaces--1 .stamp-wrapper { width: 116px; top: 50%; left: 50%; transform: translate(-48%, -54%) rotate(-13deg); }

  .achievement__spaces--2 .stamp-wrapper { width: 111px; }
  .achievement__spaces--2 .stamp-wrapper--1 { top: 0; left: -1px; }
  .achievement__spaces--2 .stamp-wrapper--2 { top: 0; right: -1px; }

  .achievement__spaces--3 .stamp-wrapper { width: 103px; }
  .achievement__spaces--3 .stamp-wrapper--1 { top: -1px; left: -3px; transform: rotate(12deg); }
  .achievement__spaces--3 .stamp-wrapper--2 { top: 1px; left: 103px; transform: rotate(-5deg); }
  .achievement__spaces--3 .stamp-wrapper--3 { top: -2px; left: 210px; transform: rotate(2deg) }

  .achievement__spaces--4 .stamp-wrapper { width: 72px; }
  .achievement__spaces--4 .stamp-wrapper--1 { top: 56px; left: 2px; transform: rotate(9deg); }
  .achievement__spaces--4 .stamp-wrapper--2 { top: 7px; left: 70px; transform: rotate(-10deg); }
  .achievement__spaces--4 .stamp-wrapper--3 { top: 54px; left: 142px; transform: rotate(3deg); }
  .achievement__spaces--4 .stamp-wrapper--4 { top: 2px; left: 204px; transform: rotate(-3deg); }

  .achievement__spaces--5 .stamp-wrapper { width: 80px; }
  .achievement__spaces--5 .stamp-wrapper--1 { top: 48px; left: -1px; transform: rotate(-9deg); }
  .achievement__spaces--5 .stamp-wrapper--2 { top: 3px; left: 59px; transform: rotate(6deg); }
  .achievement__spaces--5 .stamp-wrapper--3 { top: 48px; left: 123px; transform: rotate(-2deg); }
  .achievement__spaces--5 .stamp-wrapper--4 { top: 0; left: 186px; transform: rotate(9deg); }
  .achievement__spaces--5 .stamp-wrapper--5 { top: 51px; left: 242px; transform: rotate(-8deg); }

  .achievement__spaces--6 .stamp-wrapper { width: 70px; }
  .achievement__spaces--6 .stamp-wrapper--1 { top: 51px; left: -2px; transform: rotate(-9deg); }
  .achievement__spaces--6 .stamp-wrapper--2 { top: 0; left: 51px; transform: rotate(6deg); }
  .achievement__spaces--6 .stamp-wrapper--3 { top: 51px; left: 105px; transform: rotate(-13deg); }
  .achievement__spaces--6 .stamp-wrapper--4 { top: 0; left: 159px; transform: rotate(10deg); }
  .achievement__spaces--6 .stamp-wrapper--5 { top: 51px; left: 211px; transform: rotate(-8deg); }
  .achievement__spaces--6 .stamp-wrapper--6 { top: 0; left: 265px; transform: rotate(8deg); }

  .achievement__spaces .stamp__image { width: 100%; display: block; }

  @media (min-width: 768px) {
    .stamp-wrapper__tier { font-size: 22px; }
    .stamp-wrapper__tier--event { color: #f5a280; text-shadow: -2px -2px 0 #ffe0de, 2px -2px 0 #ffe0de, -2px 2px 0 #ffe0de, 2px 2px 0 #ffe0de; }
    .stamp-wrapper__tier--communication { color: #eda80f; text-shadow: -2px -2px 0 #fbf2b0, 2px -2px 0 #fbf2b0, -2px 2px 0 #fbf2b0, 2px 2px 0 #fbf2b0; }
    .stamp-wrapper__tier--mydesign { color: #ef5e78; text-shadow: -2px -2px 0 #ffe4e2, 2px -2px 0 #ffe4e2, -2px 2px 0 #ffe4e2, 2px 2px 0 #ffe4e2; }
    .stamp-wrapper__tier--smartphone { color: #8982c4; text-shadow: -2px -2px 0 #beddef, 2px -2px 0 #beddef, -2px 2px 0 #beddef, 2px 2px 0 #beddef; }
    .stamp-wrapper__tier--diy { color: #ba9f3e; text-shadow: -2px -2px 0 #fbf2c7, 2px -2px 0 #fbf2c7, -2px 2px 0 #fbf2c7, 2px 2px 0 #fbf2c7; }
    .stamp-wrapper__tier--landmaking { color: #43a18d; text-shadow: -2px -2px 0 #c3ecc2, 2px -2px 0 #c3ecc2, -2px 2px 0 #c3ecc2, 2px 2px 0 #c3ecc2; }
  }

  /* CAROUSEL */
  .carousel {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 1200px;
    margin: 0 auto;
  }

  .card-wrapper {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  .card {
    pointer-events: auto;
    width: 100%;
    height: 100%;
    background-size: cover;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .card::before, .card::after {
    content: '';
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0; left: 0;
    z-index: -2;
  }

  .card::after {
    top: 5px; left: 4px;
    background-size: cover;
    background-repeat: no-repeat;
  }

  .card--event::before { background: #fbe4d4;}
  .card--communication::before { background: #f9f5b8;}
  .card--mydesign::before { background: #fde4e0;}
  .card--smartphone::before { background: #bfdef0;}
  .card--diy::before { background: #f9f2c6;}
  .card--landmaking::before { background: #d7efd0;}

  .card--event::after { background-image: var(--img-bg-event-lg); }
  .card--communication::after { background-image: var(--img-bg-communication-lg); }
  .card--mydesign::after { background-image: var(--img-bg-mydesign-lg); }
  .card--smartphone::after { background-image: var(--img-bg-smartphone-lg); }
  .card--diy::after { background-image: var(--img-bg-diy-lg); }
  .card--landmaking::after { background-image: var(--img-bg-landmaking-lg); }

  .card__title {
    margin-bottom: 10px;
    font-size: 35px;
    display: flex;
    align-items: flex-end;
    color: #5f5228;
    font-weight: 700;
  }

  .card__description {
    position: relative;
    color: #715a3b;
    font-size: 31px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 40px;
    margin-bottom: 140px;
    max-width: 800px;
    text-align: center;
  }

  .card__description::before {
    content: ''; width: 100%; height: 100%; position: absolute; top: 0; left: 0; z-index: -1; opacity: 0.4;
  }

  .card__description__nook {
    width: 81px; height: 76px; position: absolute; bottom: 20px; right: -10px;
    background: var(--img-nook-face) center no-repeat;
    background-size: 100%; transform: rotate(10deg); display: none;
  }

  .card-badges {
    display: flex; align-items: flex-start; position: relative; transform: scale(0.8);
  }

  .card-badges--1 .card-badges__track { height: 147px; }
  .card-badges--2 .card-badges__track { height: 137px; }
  .card-badges--3 .card-badges__track { height: 137px; }
  .card-badges--4 .card-badges__track { height: 137px; }
  .card-badges--5 .card-badges__track { height: 137px; }
  .card-badges--6 .card-badges__track { height: 127px; }

  .card-badges__track { height: 100%; }

  @media (min-width: 768px) {
    .card {
      width: 985px; height: 596px;
      transform: rotate(-1.9deg);
      box-shadow: 0 6px 8px rgba(0,0,0, 0.1);
      border: 18px solid #fefff1;
      padding-top: 0;
      justify-content: flex-start;
    }
    .card::after { background-size: contain; }
    .card__title { height: 70px; margin-bottom: 35px; font-size: 32px; }
    .card__description {
      height: 247px; width: 782px; max-width: none;
      padding: 0 75px; margin-bottom: 0;
    }
    .card__description::before {
      background: var(--img-card-desc) center no-repeat;
      background-size: 100%;
      opacity: 1;
    }
    .card__description__nook { display: block; }
    .card-badges { align-items: center; flex-grow: 1; transform: scale(1); }
  }

  .card-badges .stamp-wrapper {
    height: 145px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10;
  }
  .card-badges .stamp { height: 100%; display: flex; align-items: center; justify-content: center; }

  /* positioning stamps on carousel track */
  .card-badges--1 .stamp-wrapper { height: 155px; }
  .card-badges--6 .stamp-wrapper { height: 130px; }

  .card-badges--1 .stamp-wrapper--1 { transform: translate(-50%, -50%); }
  .card-badges--1 .stamp--1 { transform: translate(-1%, -1%) rotate(0deg); }

  .card-badges--2 .stamp-wrapper--1 { transform: translate(-111%, -50%); }
  .card-badges--2 .stamp-wrapper--2 { transform: translate(11%, -50%); }
  .card-badges--2 .stamp--1 { transform: translate(1%, -2%) rotate(-3deg); }
  .card-badges--2 .stamp--2 { transform: translate(0%, -1%) rotate(0deg); }

  .card-badges--3 .stamp-wrapper--1 { transform: translate(-172%, -50%); }
  .card-badges--3 .stamp-wrapper--2 { transform: translate(-46%, -50%); }
  .card-badges--3 .stamp-wrapper--3 { transform: translate(68%, -50%); }
  .card-badges--3 .stamp--1 { transform: translate(4%, 0%) rotate(13deg); }
  .card-badges--3 .stamp--2 { transform: translate(-5%, 0%) rotate(-8deg); }
  .card-badges--3 .stamp--3 { transform: translate(-2%, 0%) rotate(5deg); }

  .card-badges--4 .stamp-wrapper--1 { transform: translate(-218%, -50%); }
  .card-badges--4 .stamp-wrapper--2 { transform: translate(-106%, -50%); }
  .card-badges--4 .stamp-wrapper--3 { transform: translate(6%, -50%); }
  .card-badges--4 .stamp-wrapper--4 { transform: translate(118%, -50%); }
  .card-badges--4 .stamp--1 { transform: translate(-2%, -2%) rotate(9deg); }
  .card-badges--4 .stamp--2 { transform: translate(1%, 1%) rotate(-7deg); }
  .card-badges--4 .stamp--3 { transform: translate(4%, -2%) rotate(4deg); }
  .card-badges--4 .stamp--4 { transform: translate(-2%, 1%) rotate(-3deg); }

  .card-badges--5 .stamp-wrapper--1 { transform: translate(-260%, -50%); }
  .card-badges--5 .stamp-wrapper--2 { transform: translate(-155%, -50%); }
  .card-badges--5 .stamp-wrapper--3 { transform: translate(-51%, -50%); }
  .card-badges--5 .stamp-wrapper--4 { transform: translate(52%, -50%); }
  .card-badges--5 .stamp-wrapper--5 { transform: translate(159%, -50%); }
  .card-badges--5 .stamp--1 { transform: translate(2%, 0%) rotate(8deg); }
  .card-badges--5 .stamp--2 { transform: translate(-2%, 0%) rotate(-5deg); }
  .card-badges--5 .stamp--3 { transform: translate(-1%, 0%) rotate(3deg); }
  .card-badges--5 .stamp--4 { transform: translate(2%, 0%) rotate(11deg); }
  .card-badges--5 .stamp--5 { transform: translate(0%, 0%) rotate(-9deg); }

  .card-badges--6 .stamp-wrapper--1 { transform: translate(-309%, -50%); }
  .card-badges--6 .stamp-wrapper--2 { transform: translate(-206%, -52%); }
  .card-badges--6 .stamp-wrapper--3 { transform: translate(-104%, -50%); }
  .card-badges--6 .stamp-wrapper--4 { transform: translate(-1%, -52%); }
  .card-badges--6 .stamp-wrapper--5 { transform: translate(101%, -50%); }
  .card-badges--6 .stamp-wrapper--6 { transform: translate(205%, -52%); }
  .card-badges--6 .stamp--1 { transform: translate(-3%, 0%) rotate(10deg); }
  .card-badges--6 .stamp--2 { transform: translate(-2%, 0%) rotate(-6deg); }
  .card-badges--6 .stamp--3 { transform: translate(1%, 0%) rotate(7deg); }
  .card-badges--6 .stamp--4 { transform: translate(-1%, 0%) rotate(-1deg); }
  .card-badges--6 .stamp--5 { transform: translate(3%, 0%) rotate(6deg); }
  .card-badges--6 .stamp--6 { transform: translate(4%, 0%) rotate(-10deg); }

  .card-badges .stamp__image { height: 100%; display: block; }

  /* CAROUSEL BUTTONS */
  .carousel__button {
    width: 142px;
    height: 254px;
    position: absolute;
    top: 50%;
    z-index: 200;
    cursor: pointer;
    padding: 40px;
    display: none;
    background: transparent;
    border: 0;
  }
  @media (min-width: 768px) {
    .carousel__button { display: block; }
  }
  .carousel__button svg {
    width: 100%;
    height: 100%;
    fill: #f5f9d4;
    transition: fill 0.2s;
  }
  @media(hover: hover) {
    .carousel__button:hover svg { fill: #435fa3; }
  }
  .carousel__button--prev { left: 0; animation: bobLeft 2.5s infinite ease-in-out; }
  .carousel__button--next { right: 0; animation: bobRight 2.5s infinite ease-in-out; }
  .carousel__button--next svg { transform: rotate(180deg); }

  @keyframes bobLeft {
    0% { transform: translateX(0) translateY(-50%); }
    50% { transform: translateX(12px) translateY(-50%); }
    100% { transform: translateX(0) translateY(-50%); }
  }
  @keyframes bobRight {
    0% { transform: translateX(0) translateY(-50%); }
    50% { transform: translateX(-12px) translateY(-50%); }
    100% { transform: translateX(0) translateY(-50%); }
  }
</style>
