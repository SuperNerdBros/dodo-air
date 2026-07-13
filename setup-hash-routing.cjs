const fs = require('fs');
const path = require('path');

const layoutPath = path.join(__dirname, 'src', 'routes', '+layout.svelte');
let layout = fs.readFileSync(layoutPath, 'utf8');

// 1. Update navigation import
layout = layout.replace(
	`import { page } from '$app/stores';\n  import { goto } from '$app/navigation';`,
	`// Hash routing`
);

// 2. Replace currentTab derived logic with hash tracking state
layout = layout.replace(
	`let currentTab = $derived(
    $page.url.pathname.includes('islands') ? 'book' :
    $page.url.pathname.includes('hub') ? 'hub' :
    $page.url.pathname.includes('directory') ? 'directory' : 'passport'
  );`,
	`let hashPath = $state('');
  let currentTab = $derived(
    hashPath.includes('islands') ? 'book' :
    hashPath.includes('hub') ? 'hub' :
    hashPath.includes('directory') ? 'directory' : 'passport'
  );

  onMount(() => {
    // Initialize hash on load if empty
    if (!window.location.hash || window.location.hash === '#/') {
      window.location.hash = '#/passport';
    }
    hashPath = window.location.hash;

    const onHashChange = () => {
      hashPath = window.location.hash;
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  });`
);

// 3. Replace goto with hash assignment in TabButtons and setCurrentTab
layout = layout.replace(
	/onclick=\{\(\) => goto\('\/passport'\)\}/g,
	`onclick={() => { window.location.hash = '#/passport'; }}`
);
layout = layout.replace(
	/onclick=\{\(\) => goto\('\/islands'\)\}/g,
	`onclick={() => { window.location.hash = '#/islands'; }}`
);
layout = layout.replace(
	/onclick=\{\(\) => goto\('\/hub'\)\}/g,
	`onclick={() => { window.location.hash = '#/hub'; }}`
);
layout = layout.replace(
	/onclick=\{\(\) => goto\('\/directory'\)\}/g,
	`onclick={() => { window.location.hash = '#/directory'; }}`
);

layout = layout.replace(
	`setCurrentTab={(t) => { if (t === 'book') goto('/islands'); else if (t === 'hub') goto('/hub'); else if (t === 'directory') goto('/directory'); else goto('/passport'); }}`,
	`setCurrentTab={(t) => { if (t === 'book') window.location.hash = '#/islands'; else if (t === 'hub') window.location.hash = '#/hub'; else if (t === 'directory') window.location.hash = '#/directory'; else window.location.hash = '#/passport'; }}`
);

// 4. Replace {@render children()} with the conditional rendering blocks
const renderChildrenStr = `    <!-- Dynamic Multi-Tab Content View -->
    <div class="w-full">
      {@render children()}
    </div>`;

const conditionalRender = `    <!-- Dynamic Multi-Tab Content View -->
    <div class="w-full">
      {#if currentTab === 'passport'}
        <PassportTab
          {passport}
          setShowMilesModal={(v) => showMilesModal = v}
          setIsEditingPassport={(v) => isEditingPassport = v}
          {isMuted}
          playSound={(id) => playSound(id, isMuted)}
        />
      {/if}

      {#if currentTab === 'book'}
        <DeparturesTab
          flights={activeFlights}
          bind:selectedFlightId
          {passport}
          {profiles}
          {openProfileModal}
          {requests}
          {handleRemoveStandbyRequest}
          setShowStandbyModal={(v) => showStandbyModal = v}
          {isMuted}
        />
      {/if}

      {#if currentTab === 'hub'}
        <CockpitTab
          myFlight={myFlight!}
          {passport}
          {requests}
          {profiles}
          {openProfileModal}
          handleHostFlight={handleHostFlight}
          {formError}
          bind:formDodo
          bind:formHemisphere
          bind:formGate
          bind:formDesc
          bind:formPlaneType
          {isSubmittingHost}
          handleUpdateStatus={handleUpdateStatus}
          handleLeaveFlight={handleLeaveFlight}
          handleGenerateAIReview={handleGenerateAIReview}
          {loadingReviewId}
          handleClearForTakeoff={handleClearForTakeoff}
          {isMuted}
          {mySchedules}
          handleAddSchedule={handleAddSchedule}
          handleDeleteSchedule={handleDeleteSchedule}
        />
      {/if}

      {#if currentTab === 'directory'}
        <DirectoryTab
          {profiles}
          {openProfileModal}
          {passport}
          {isMuted}
        />
      {/if}
    </div>`;

layout = layout.replace(renderChildrenStr, conditionalRender);

fs.writeFileSync(layoutPath, layout);
console.log('Hash routing implemented in +layout.svelte.');
