const fs = require('fs');
const path = './src/routes/+layout.svelte';
let content = fs.readFileSync(path, 'utf8');

// Replace all instances of showOrvilleIntro with dalStore.showOrvilleIntro
// Being careful to only replace variables, not string keys if there were any
content = content.replace(/\bshowOrvilleIntro\b/g, 'dalStore.showOrvilleIntro');

// We also need to define `TerminalModals` or at least make sure it doesn't crash if it doesn't exist.
// Let's first just fix the showOrvilleIntro bug.
fs.writeFileSync(path, content, 'utf8');
console.log('Fixed showOrvilleIntro in +layout.svelte');
