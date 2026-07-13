const fs = require('fs');
const path = require('path');

const layoutPath = path.join(__dirname, 'src', 'routes', '+layout.svelte');
let layout = fs.readFileSync(layoutPath, 'utf8');

// 1. Imports and Setup
layout = layout.replace(
	`import { onMount, onDestroy, tick } from 'svelte';`,
	`import { onMount, onDestroy, tick } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { setAppState } from '$lib/appState';
  let { children } = $props();
`
);

// 2. Remove currentTab state variable and make it derived
layout = layout.replace(
	`let currentTab = $state<'passport' | 'book' | 'hub' | 'directory'>('passport');`,
	`let currentTab = $derived(
    $page.url.pathname.includes('islands') ? 'book' :
    $page.url.pathname.includes('hub') ? 'hub' :
    $page.url.pathname.includes('directory') ? 'directory' : 'passport'
  );`
);

// 3. Find where tabs render content
const tabRenderStart = `    <!-- Dynamic Multi-Tab Content View -->
    <div class="w-full">
      {#if currentTab === 'passport'}
        <PassportTab`;

const tabRenderEnd = `        />
      {/if}
    </div>`;

// Replace tab rendering with {@render children()}
const startIdx = layout.indexOf(`<!-- Dynamic Multi-Tab Content View -->`);
const endIdx = layout.indexOf(`    </main>`, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
	layout =
		layout.substring(0, startIdx) +
		`    <!-- Dynamic Multi-Tab Content View -->
    <div class="w-full">
      {@render children()}
    </div>
` +
		layout.substring(endIdx);
} else {
	console.error('Could not find Tab Render area');
}

// 4. Wrap all variables and functions in setAppState()
// We can just dump everything we need into an object and pass to setAppState
const setAppCode = `
  $effect(() => {
    setAppState({
      activeFlights,
      selectedFlightId,
      passport,
      profiles,
      openProfileModal,
      requests,
      handleRemoveStandbyRequest,
      showStandbyModal,
      isMuted,
      myFlight,
      handleHostFlight,
      formError,
      formDodo,
      formHemisphere,
      formGate,
      formDesc,
      formPlaneType,
      isSubmittingHost,
      handleUpdateStatus,
      handleLeaveFlight,
      handleGenerateAIReview,
      loadingReviewId,
      handleClearForTakeoff,
      mySchedules,
      handleAddSchedule,
      handleDeleteSchedule,
      showMilesModal,
      isEditingPassport,
      playSoundHelper: (id) => playSound(id, isMuted)
    });
  });
`;

layout = layout.replace(
	`let formattedTime = $derived(liveTime.toTimeString().split(' ')[0]);`,
	`let formattedTime = $derived(liveTime.toTimeString().split(' ')[0]);\n\n${setAppCode}\n`
);

// 5. Update TabButtons routing
layout = layout.replace(
	/onclick=\{.*?currentTab = 'passport';.*?\}/g,
	`onclick={() => goto('/passport')}`
);
layout = layout.replace(
	/onclick=\{.*?currentTab = 'book';.*?\}/g,
	`onclick={() => goto('/islands')}`
);
layout = layout.replace(/onclick=\{.*?currentTab = 'hub';.*?\}/g, `onclick={() => goto('/hub')}`);
layout = layout.replace(
	/onclick=\{.*?currentTab = 'directory';.*?\}/g,
	`onclick={() => goto('/directory')}`
);

fs.writeFileSync(layoutPath, layout);
console.log('Layout patched successfully.');
