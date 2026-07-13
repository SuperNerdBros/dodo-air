const fs = require('fs');
const path = './src/routes/+layout.svelte';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove duplicate stamp functions
const earnStampStart = content.indexOf('function earnStampProgress(field:');
const claimStampStart = content.indexOf('function claimStampMiles(stampId:');
const savePassportStart = content.indexOf('async function handleSavePassport(updated: Passport)');
const refuelStart = content.indexOf('async function handleRefuel(amount: number)');

// We can simply remove them. We'll find their ends.
content = content.replace(
	/function earnStampProgress[\s\S]*?playSound\('success', isMuted\);\n  }/,
	''
);
content = content.replace(
	/function claimStampMiles[\s\S]*?playSound\('success', isMuted\);\n  }/,
	''
);

content = content.replace(
	/async function handleSavePassport[\s\S]*?isEditingPassport = false;\n  }/,
	`async function handleSavePassport(updated: Passport) {
    dalStore.passport = { ...dalStore.passport, ...updated, hasCreated: true };
    localStorage.setItem('dal_passport', JSON.stringify(dalStore.passport));
    dalStore.playSound('success');
    dalStore.fetchState();
    dalStore.isEditingPassport = false;
  }`
);

content = content.replace(
	/async function handleRefuel[\s\S]*?isRefueling = false;\n    }\n  }/,
	''
);

// 2. Remove giant fetchState
content = content.replace(
	/async function fetchState[\s\S]*?setTimeout\(\(\) => isSyncing = false, 500\);\n      }\n    }\n  }/,
	''
);

// 3. Remove addSchedule / deleteSchedule
content = content.replace(
	/async function handleAddSchedule[\s\S]*?console\.error\(err\);\n    }\n  }/,
	''
);
content = content.replace(
	/async function handleDeleteSchedule[\s\S]*?console\.error\(err\);\n    }\n  }/,
	''
);

// 4. Update HTML bindings
content = content.replace(/\{passport\}/g, 'passport={dalStore.passport}');
content = content.replace(/\{profiles\}/g, 'profiles={dalStore.profiles}');
content = content.replace(/\{requests\}/g, 'requests={dalStore.requests}');
content = content.replace(/\{mySchedules\}/g, 'mySchedules={dalStore.mySchedules}');
content = content.replace(/\{isMuted\}/g, 'isMuted={dalStore.isMuted}');
content = content.replace(
	/bind:showPassportDrawer/g,
	'bind:showPassportDrawer={dalStore.showPassportDrawer}'
);
content = content.replace(/\{flights\}/g, 'flights={dalStore.flights}');

content = content.replace(/fetchState/g, 'dalStore.fetchState');

fs.writeFileSync(path, content, 'utf8');
console.log('Cleaned up duplicate functions in +layout.svelte');
