<script lang="ts">
  import StandbyWizard from '$lib/components/molecules/StandbyWizard.svelte';
  import HubWizard from '$lib/components/molecules/HubWizard.svelte';
  import BoardingPassModal from '$lib/components/organisms/BoardingPassModal.svelte';
  import MilesStampBook from '$lib/components/organisms/MilesStampBook.svelte';
  import TrustProfileModal from '$lib/components/organisms/TrustProfileModal.svelte';
  import TrafficControlModal from '$lib/components/organisms/TrafficControlModal.svelte';
  import PassportEditModal from '$lib/components/organisms/PassportEditModal.svelte';
  import { TerminalActions } from '$lib/stores/TerminalActions';
  import { TerminalAPI } from '$lib/api/TerminalAPI';
  import { dalStore } from '$lib/stores/dal.svelte';
  import { fade } from 'svelte/transition';
  
  let { handleSavePassport, openProfileModal } = $props();

  let selectedFlight = $derived(
    dalStore.flights.find(f => f.id === dalStore.selectedFlightId) || 
    dalStore.dreams.find(d => d.id === dalStore.selectedFlightId)
  );

  let selectedProfileReviews = $state([]);
  let isSubmittingReview = $state(false);
  let reviewError = $state('');

  async function handleSubmitReview(ratingType: 'apple' | 'turnip', comment: string) {
    if (!dalStore.selectedFriendCode) return;
    if (!dalStore.passport.hasCreated) {
      reviewError = "You must print your custom Passport at the dispatch counter before submitting trust feedback!";
      return;
    }
    if (dalStore.passport.friendCode === dalStore.selectedFriendCode) {
      reviewError = "You cannot rate your own island profile!";
      return;
    }
    isSubmittingReview = true;
    reviewError = '';
    try {
      await TerminalAPI.submitReview(dalStore.selectedFriendCode, {
          ratingType,
          voterName: dalStore.passport.villagerName,
          voterIsland: dalStore.passport.islandName,
          voterFriendCode: dalStore.passport.friendCode,
          comment
      });
      dalStore.playSound('success');
      selectedProfileReviews = await TerminalAPI.getReviews(dalStore.selectedFriendCode);
      await dalStore.fetchState();
    } catch (err: any) {
      reviewError = err.error || "Failed to submit rating.";
    } finally {
      isSubmittingReview = false;
    }
  }
</script>

{#if dalStore.isEditingPassport}
  <div transition:fade={{ duration: 200 }} class="fixed inset-0 z-[100] flex items-center justify-center">
    <PassportEditModal
      passport={dalStore.passport}
      onSave={handleSavePassport}
      onClose={() => dalStore.isEditingPassport = false}
      isMuted={dalStore.isMuted}
    />
  </div>
{/if}

<StandbyWizard
  isOpen={dalStore.showStandbyModal}
  onClose={() => dalStore.showStandbyModal = false}
  bind:requestGateType={dalStore.requestGateType}
  bind:requestTime={dalStore.requestTime}
  bind:requestMemo={dalStore.requestMemo}
  onSubmit={TerminalActions.createStandbyRequest}
  isSubmittingRequest={dalStore.isSubmittingRequest}
  requestError={dalStore.requestError}
  isMuted={dalStore.isMuted}
/>

<HubWizard
  isOpen={dalStore.showHubModal}
  onClose={() => dalStore.showHubModal = false}
  bind:formDodo={dalStore.formDodo}
  bind:formHemisphere={dalStore.formHemisphere}
  bind:formGate={dalStore.formGate}
  bind:formDesc={dalStore.formDesc}
  bind:formPlaneType={dalStore.formPlaneType}
  bind:formMilesCost={dalStore.formMilesCost}
  onSubmit={(e) => {
    dalStore.showHubModal = false;
    TerminalActions.hostFlight(e);
  }}
  isSubmittingHost={dalStore.isSubmittingHost}
  formError={dalStore.formError}
  isMuted={dalStore.isMuted}
/>

{#if selectedFlight}
  <div transition:fade={{ duration: 200 }} class="fixed inset-0 z-[100] flex items-center justify-center">
    <BoardingPassModal
      onClose={() => { dalStore.playSound('beep'); dalStore.selectedFlightId = null; }}
      {selectedFlight}
      passport={dalStore.passport}
      onBoardFlight={TerminalActions.boardFlight}
      onLeaveFlight={TerminalActions.leaveFlight}
      boardingError={dalStore.boardingError}
      onRequestStandby={(gate) => { dalStore.requestGateType = gate; dalStore.showStandbyModal = true; dalStore.selectedFlightId = null; }}
      isMuted={dalStore.isMuted}
    />
  </div>
{/if}

<MilesStampBook
  isOpen={dalStore.showMilesModal}
  onClose={() => dalStore.showMilesModal = false}
  passport={dalStore.passport}
  onClaimStamp={(id, miles) => {
    dalStore.claimStampMiles(id, miles);
  }}
  isMuted={dalStore.isMuted}
/>

<TrustProfileModal
  selectedFriendCode={dalStore.selectedFriendCode}
  onClose={() => dalStore.selectedFriendCode = null}
  profiles={dalStore.profiles}
  {selectedProfileReviews}
  onSubmitReview={handleSubmitReview}
  {reviewError}
  {isSubmittingReview}
  isMuted={dalStore.isMuted}
/>

<TrafficControlModal
  isOpen={dalStore.isTrafficModalOpen}
  onClose={() => dalStore.isTrafficModalOpen = false}
  totalStandby={dalStore.requests.length}
  totalPassengers={dalStore.flights.reduce((acc, f) => acc + Object.keys(f.passengers || {}).length, 0)}
  alltimePassengers={dalStore.alltimePassengers}
  totalPilots={dalStore.flights.length}
  alltimePilots={dalStore.alltimePilots}
  totalPassports={dalStore.totalIslanders}
  views={dalStore.views}
  visitors={dalStore.visitors}
  setCurrentTab={(t) => { if (t === 'book') window.location.hash = '#/islands'; else if (t === 'hub') window.location.hash = '#/hub'; else if (t === 'directory') window.location.hash = '#/directory'; else window.location.hash = '#/passport'; }}
  setShowPassportDrawer={(v) => dalStore.showPassportDrawer = v}
  setIsEditingPassport={(v) => dalStore.isEditingPassport = v}
  passport={dalStore.passport}
  isMuted={dalStore.isMuted}
/>
