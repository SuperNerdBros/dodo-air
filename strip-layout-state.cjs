const fs = require('fs');
const path = './src/routes/+layout.svelte';
let content = fs.readFileSync(path, 'utf8');

// The block to remove starts around line 68 and goes until the end of the passport object.
const stateStart = content.indexOf('let showLoginModal = $state(false);');
const stateEnd = content.indexOf('let showOrvilleIntro = $state(true);'); // or find passport object end

if (stateStart !== -1 && stateEnd !== -1) {
  content = content.substring(0, stateStart) + 
  `let showLoginModal = $state(false);
  let showLogoutModal = $state(false);
  let showOrvilleIntro = $state(true);
  
  ` + content.substring(stateEnd + 'let showOrvilleIntro = $state(true);'.length);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Stripped state variables.');
