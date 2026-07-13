const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'routes');
const pageSveltePath = path.join(srcDir, '+page.svelte');
const layoutSveltePath = path.join(srcDir, '+layout.svelte');

let pageContent = fs.readFileSync(pageSveltePath, 'utf8');

// Replace standard Tab logic in layout
// We will replace currentTab with $page.url.pathname logic

// Create the context store file
const contextCode = `import { setContext, getContext } from 'svelte';
export function setAppState(state) {
    setContext('appState', state);
}
export function getAppState() {
    return getContext('appState');
}
`;
fs.writeFileSync(path.join(__dirname, 'src', 'lib', 'appState.ts'), contextCode);

// We need to inject page to +layout.svelte
// and replace onclick for tabs
console.log('We will do this manually for precision.');
