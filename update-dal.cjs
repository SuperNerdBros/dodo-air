const fs = require('fs');
const path = './src/lib/stores/dal.svelte.ts';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('aiFuel = $state')) {
	content = content.replace(
		'isSyncing = $state(false);',
		'isSyncing = $state(false);\n  aiFuel = $state({ aiTokens: 15000, maxTokens: 20000 });\n  profiles: Record<string, any> = $state({});\n  mySchedules: any[] = $state([]);\n  views = $state(0);\n  visitors = $state(0);'
	);

	// Update fetchState to populate them
	content = content.replace(
		'if (data.onlineIslanders !== undefined) this.onlineIslanders = data.onlineIslanders;',
		'if (data.onlineIslanders !== undefined) this.onlineIslanders = data.onlineIslanders;\n        if (data.aiFuel) this.aiFuel = data.aiFuel;\n        if (data.profiles) this.profiles = data.profiles;\n        if (data.mySchedules) this.mySchedules = data.mySchedules;\n        if (data.analytics) { this.views = data.analytics.views || 0; this.visitors = data.analytics.visitors || 0; }'
	);
	fs.writeFileSync(path, content, 'utf8');
	console.log('Updated dal.svelte.ts');
}
