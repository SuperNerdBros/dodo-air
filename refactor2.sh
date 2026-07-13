#!/bin/bash
set -e

DIR="/home/xopher/www/x/Xophz-COMPASS/apps/dodo-air/src"

# 1. Create appState.ts
cat << 'EOF' > "$DIR/lib/appState.ts"
import { setContext, getContext } from 'svelte';
export function setAppState(state: any) {
    setContext('appState', state);
}
export function getAppState(): any {
    return getContext('appState');
}
EOF

# 2. Extract +page.svelte to +layout.svelte
cp "$DIR/routes/+page.svelte" "$DIR/routes/+layout.svelte"

# 3. Create route folders
mkdir -p "$DIR/routes/passport"
mkdir -p "$DIR/routes/islands"
mkdir -p "$DIR/routes/hub"
mkdir -p "$DIR/routes/directory"

# 4. Create islands/+page.svelte
cat << 'EOF' > "$DIR/routes/islands/+page.svelte"
<script lang="ts">
  import DeparturesTab from '$lib/components/templates/DeparturesTab.svelte';
  import { getAppState } from '$lib/appState';
  let app = getAppState();
</script>

<DeparturesTab
  flights={app.activeFlights}
  bind:selectedFlightId={app.selectedFlightId}
  passport={app.passport}
  profiles={app.profiles}
  openProfileModal={app.openProfileModal}
  requests={app.requests}
  handleRemoveStandbyRequest={app.handleRemoveStandbyRequest}
  setShowStandbyModal={(v) => app.showStandbyModal = v}
  isMuted={app.isMuted}
/>
EOF

# 5. Create hub/+page.svelte
cat << 'EOF' > "$DIR/routes/hub/+page.svelte"
<script lang="ts">
  import CockpitTab from '$lib/components/templates/CockpitTab.svelte';
  import { getAppState } from '$lib/appState';
  let app = getAppState();
</script>

<CockpitTab
  myFlight={app.myFlight}
  passport={app.passport}
  requests={app.requests}
  profiles={app.profiles}
  openProfileModal={app.openProfileModal}
  handleHostFlight={app.handleHostFlight}
  formError={app.formError}
  bind:formDodo={app.formDodo}
  bind:formHemisphere={app.formHemisphere}
  bind:formGate={app.formGate}
  bind:formDesc={app.formDesc}
  bind:formPlaneType={app.formPlaneType}
  isSubmittingHost={app.isSubmittingHost}
  handleUpdateStatus={app.handleUpdateStatus}
  handleLeaveFlight={app.handleLeaveFlight}
  handleGenerateAIReview={app.handleGenerateAIReview}
  loadingReviewId={app.loadingReviewId}
  handleClearForTakeoff={app.handleClearForTakeoff}
  isMuted={app.isMuted}
  mySchedules={app.mySchedules}
  handleAddSchedule={app.handleAddSchedule}
  handleDeleteSchedule={app.handleDeleteSchedule}
/>
EOF

# 6. Create directory/+page.svelte
cat << 'EOF' > "$DIR/routes/directory/+page.svelte"
<script lang="ts">
  import DirectoryTab from '$lib/components/templates/DirectoryTab.svelte';
  import { getAppState } from '$lib/appState';
  let app = getAppState();
</script>

<DirectoryTab
  profiles={app.profiles}
  openProfileModal={app.openProfileModal}
  passport={app.passport}
  isMuted={app.isMuted}
/>
EOF

# 7. Create passport/+page.svelte
cat << 'EOF' > "$DIR/routes/passport/+page.svelte"
<script lang="ts">
  import PassportTab from '$lib/components/templates/PassportTab.svelte';
  import { getAppState } from '$lib/appState';
  let app = getAppState();
</script>

<PassportTab
  passport={app.passport}
  setShowMilesModal={(v) => app.showMilesModal = v}
  setIsEditingPassport={(v) => app.isEditingPassport = v}
  isMuted={app.isMuted}
  playSound={app.playSoundHelper}
/>
EOF

# 8. Create /+page.svelte (Redirects to /passport)
cat << 'EOF' > "$DIR/routes/+page.svelte"
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  onMount(() => {
    goto('/passport', { replaceState: true });
  });
</script>
EOF

echo "Files created successfully."
