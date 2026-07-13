const fs = require('fs');
const path = './src/routes/+layout.svelte';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/async function handleAddSchedule[\s\S]*?console\.error\(err\);\n    }\n  }/, '');
content = content.replace(/async function handleDeleteSchedule[\s\S]*?console\.error\(err\);\n    }\n  }/, '');
content = content.replace(/async function openProfileModal[\s\S]*?dalStore\.selectedFriendCode = friendCode;\n  }/, '');

content = content.replace(/handleAddSchedule=\{handleAddSchedule\}/g, 'handleAddSchedule={TerminalActions.addSchedule}');
content = content.replace(/handleDeleteSchedule=\{handleDeleteSchedule\}/g, 'handleDeleteSchedule={TerminalActions.deleteSchedule}');
content = content.replace(/\{openProfileModal\}/g, 'openProfileModal={(code) => { dalStore.playSound(\'beep\'); dalStore.selectedFriendCode = code; }}');

fs.writeFileSync(path, content, 'utf8');
console.log('Removed last 3 functions');
