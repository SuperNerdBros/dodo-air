const fs = require('fs');
const path = './src/routes/+layout.svelte';
let content = fs.readFileSync(path, 'utf8');

const appStateStart = content.indexOf('const appState = {');
const appStateEnd = content.indexOf('setAppState(appState);');

if (appStateStart !== -1 && appStateEnd !== -1) {
	content =
		content.substring(0, appStateStart) +
		content.substring(appStateEnd + 'setAppState(appState);'.length);
}

// Also remove setAppState import
content = content.replace(/import \{ setAppState \} from '\$lib\/appState';\n/, '');

fs.writeFileSync(path, content, 'utf8');
console.log('Removed dead appState code');
