const fs = require('fs');
const path = './src/routes/+layout.svelte';
let content = fs.readFileSync(path, 'utf8');

// 1. Add imports
if (!content.includes('import TerminalFooter from')) {
	content = content.replace(
		"import TrafficControlModal from '$lib/components/organisms/TrafficControlModal.svelte';",
		"import TrafficControlModal from '$lib/components/organisms/TrafficControlModal.svelte';\n  import TerminalFooter from '$lib/components/organisms/TerminalFooter.svelte';\n  import LogoutModal from '$lib/components/organisms/LogoutModal.svelte';"
	);
}

// 2. Remove state declarations for aiFuel, isRefueling, showFuelModal
content = content.replace(/let aiFuel = \$state[^\n]*\n/, '');
content = content.replace(/let isRefueling = \$state[^\n]*\n/, '');
content = content.replace(/let showFuelModal = \$state[^\n]*\n/, '');

// 3. Replace Footer and FuelDepotModal
const footerStart = content.indexOf('<!-- FOOTER -->');
const footerEnd = content.indexOf('</div> <!-- End Main Terminal Grid System wrapper -->');
if (footerStart !== -1 && footerEnd !== -1) {
	content =
		content.substring(0, footerStart) + '<TerminalFooter />\n    ' + content.substring(footerEnd);
}

// 4. Remove FuelDepotModal and showLogoutModal HTML blocks
const fuelModalStart = content.indexOf('<!-- Fuel Depot Modal -->');
const loginModalStart = content.indexOf('{#if showLoginModal}');
if (fuelModalStart !== -1 && loginModalStart !== -1) {
	content = content.substring(0, fuelModalStart) + content.substring(loginModalStart);
}

const logoutModalStart = content.indexOf('{#if showLogoutModal}');
const standbyModalStart = content.indexOf('<!-- MODAL: STANDBY PASSENGER TICKET FORM -->');
if (logoutModalStart !== -1 && standbyModalStart !== -1) {
	content =
		content.substring(0, logoutModalStart) +
		`{#if showLogoutModal}\n      <LogoutModal onClose={() => showLogoutModal = false} />\n    {/if}\n\n  ` +
		content.substring(standbyModalStart);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully replaced Footer and Logout modals');
