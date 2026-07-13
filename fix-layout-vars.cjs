const fs = require('fs');
const path = './src/routes/+layout.svelte';
let content = fs.readFileSync(path, 'utf8');

// Replace passport with dalStore.passport in JS expressions
content = content.replace(/\bpassport\.hasCreated\b/g, 'dalStore.passport.hasCreated');
content = content.replace(/\bpassport\.friendCode\b/g, 'dalStore.passport.friendCode');
content = content.replace(/\bpassport\.villagerName\b/g, 'dalStore.passport.villagerName');
content = content.replace(/\bpassport\.islandName\b/g, 'dalStore.passport.islandName');
content = content.replace(/\bpassport\.avatarIcon\b/g, 'dalStore.passport.avatarIcon');
content = content.replace(/\bpassport\.titlePart1\b/g, 'dalStore.passport.titlePart1');
content = content.replace(/\bpassport\.titlePart2\b/g, 'dalStore.passport.titlePart2');

// isMuted 
content = content.replace(/\bisMuted\b(?!\s*=)/g, 'dalStore.isMuted');
content = content.replace(/isMuted\s*=\s*!isMuted/g, 'dalStore.isMuted = !dalStore.isMuted');

// Modals
content = content.replace(/showMilesModal\s*=\s*v/g, 'dalStore.showMilesModal = v');
content = content.replace(/isEditingPassport\s*=\s*v/g, 'dalStore.isEditingPassport = v');
content = content.replace(/isTrafficModalOpen\s*=\s*true/g, 'dalStore.isTrafficModalOpen = true');

// handleSavePassport should update dalStore.passport directly, I added this in my previous script, 
// let's just make sure it's correct.
content = content.replace(/!dalStore\.dalStore\.passport/g, '!dalStore.passport'); // safety cleanup if double prefixed
content = content.replace(/dalStore\.dalStore/g, 'dalStore'); 

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed undefined variables in +layout.svelte');
