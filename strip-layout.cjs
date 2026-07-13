const fs = require('fs');
const path = './src/routes/+layout.svelte';
let content = fs.readFileSync(path, 'utf8');

// 1. We replace the huge block of API wrappers with an import to TerminalModals and TerminalActions
const wrappersStart = content.indexOf('async function openProfileModal(friendCode: string) {');
const wrappersEnd = content.indexOf('let activeFlights = $derived');

if (wrappersStart !== -1 && wrappersEnd !== -1) {
	content =
		content.substring(0, wrappersStart) +
		`import TerminalModals from '$lib/components/organisms/TerminalModals.svelte';
  import { TerminalActions } from '$lib/stores/TerminalActions';
  
  async function openProfileModal(friendCode: string) {
    playSound('beep', isMuted);
    dalStore.selectedFriendCode = friendCode;
  }
  
  ` +
		content.substring(wrappersEnd);
}

// 2. Remove the modal states from the top
const stateToRemove = [
	'let requestGateType = $state(1);',
	"let requestTime = $state('Online Now');",
	"let requestMemo = $state('');",
	'let showStandbyModal = $state(false);',
	"let requestError = $state('');",
	'let isSubmittingRequest = $state(false);',
	"let formDodo = $state('');",
	"let formHemisphere: 'Northern' | 'Southern' = $state('Northern');",
	'let formGate = $state(1);',
	"let formDesc = $state('');",
	"let formPlaneType: 'Switch' | 'Switch 2' = $state('Switch');",
	"let formError = $state('');",
	'let isSubmittingHost = $state(false);',
	"let boardingError = $state('');",
	"let chatSender = $state('');",
	"let chatIsland = $state('');",
	"let chatText = $state('');",
	'let isPostingChat = $state(false);',
	'let revealedCodes: Record<string, boolean> = $state({});',
	'let loadingReviewId: string | null = $state(null);',
	'let selectedFlightId = $state<string | null>(null);',
	'let isTrafficModalOpen = $state(false);',
	'let selectedFriendCode = $state<string | null>(null);',
	'let selectedProfileReviews = $state<FeedbackReview[]>([]);',
	'let isSubmittingReview = $state(false);',
	"let reviewError = $state('');",
	'let isEditingPassport = $state(false);',
	'let showMilesModal = $state(false);'
];

stateToRemove.forEach((line) => {
	content = content.replace(line + '\n', '');
});

// 3. Update bindings in DeparturesTab
content = content.replace(
	/bind:selectedFlightId/g,
	'bind:selectedFlightId={dalStore.selectedFlightId}'
);
content = content.replace(/\{requestGateType\}/g, 'requestGateType={dalStore.requestGateType}');
content = content.replace(/\{requestTime\}/g, 'requestTime={dalStore.requestTime}');
content = content.replace(/\{requestMemo\}/g, 'requestMemo={dalStore.requestMemo}');
content = content.replace(/setShowStandbyModal=\{\(v\) => showStandbyModal = v\}/g, '');

// 4. Update bindings in CockpitTab
content = content.replace(/bind:formDodo/g, 'bind:formDodo={dalStore.formDodo}');
content = content.replace(/bind:formHemisphere/g, 'bind:formHemisphere={dalStore.formHemisphere}');
content = content.replace(/bind:formGate/g, 'bind:formGate={dalStore.formGate}');
content = content.replace(/bind:formDesc/g, 'bind:formDesc={dalStore.formDesc}');
content = content.replace(/bind:formPlaneType/g, 'bind:formPlaneType={dalStore.formPlaneType}');
content = content.replace(
	/handleHostFlight=\{handleHostFlight\}/g,
	'handleHostFlight={TerminalActions.hostFlight}'
);
content = content.replace(
	/handleUpdateStatus=\{handleUpdateStatus\}/g,
	'handleUpdateStatus={TerminalActions.updateStatus}'
);
content = content.replace(
	/handleLeaveFlight=\{handleLeaveFlight\}/g,
	'handleLeaveFlight={TerminalActions.leaveFlight}'
);
content = content.replace(
	/handleGenerateAIReview=\{handleGenerateAIReview\}/g,
	'handleGenerateAIReview={TerminalActions.generateAIReview}'
);
content = content.replace(
	/handleClearForTakeoff=\{handleClearForTakeoff\}/g,
	'handleClearForTakeoff={TerminalActions.clearForTakeoff}'
);
content = content.replace(/\{loadingReviewId\}/g, 'loadingReviewId={dalStore.loadingReviewId}');
content = content.replace(/\{isSubmittingHost\}/g, 'isSubmittingHost={dalStore.isSubmittingHost}');
content = content.replace(/\{formError\}/g, 'formError={dalStore.formError}');

// 5. Update bindings in RadioTab
content = content.replace(/bind:chatSender/g, 'bind:chatSender={dalStore.chatSender}');
content = content.replace(/bind:chatIsland/g, 'bind:chatIsland={dalStore.chatIsland}');
content = content.replace(/bind:chatText/g, 'bind:chatText={dalStore.chatText}');
content = content.replace(/\{handlePostChat\}/g, 'handlePostChat={TerminalActions.postChat}');
content = content.replace(/\{isPostingChat\}/g, 'isPostingChat={dalStore.isPostingChat}');

// 6. Delete the modals at the bottom
const passportModalStart = content.indexOf('<!-- Passport Edit Overlay Form -->');
const orvilleBubbleStart = content.indexOf("<!-- ORVILLE'S COZY GUIDANCE SPEECH BALLOON -->");
if (passportModalStart !== -1 && orvilleBubbleStart !== -1) {
	content = content.substring(0, passportModalStart) + content.substring(orvilleBubbleStart);
}

const standbyModalStart = content.indexOf('<!-- MODAL: STANDBY PASSENGER TICKET FORM -->');
if (standbyModalStart !== -1) {
	content =
		content.substring(0, standbyModalStart) +
		'\n<TerminalModals {handleSavePassport} {openProfileModal} />\n</div>\n' +
		content.substring(content.indexOf('<svg class="hidden"'));
}

fs.writeFileSync(path, content, 'utf8');
console.log('Stripped +layout.svelte to bare minimum.');
