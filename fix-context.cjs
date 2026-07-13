const fs = require('fs');
const path = require('path');

const layoutPath = path.join(__dirname, 'src', 'routes', '+layout.svelte');
let layout = fs.readFileSync(layoutPath, 'utf8');

const regex = /\$effect\(\(\) => \{\s*setAppState\(\{([\s\S]*?)\}\);\s*\}\);/;
const match = layout.match(regex);

if (match) {
	const propsList = match[1]
		.split(',')
		.map((s) => s.trim())
		.filter((s) => s);
	let appStateObj = '  const appState = {\n';
	propsList.forEach((prop) => {
		if (prop.includes(':')) {
			const [key, value] = prop.split(':').map((s) => s.trim());
			appStateObj += `    get ${key}() { return ${value}; },\n`;
			appStateObj += `    set ${key}(v) { ${value} = v; },\n`;
		} else {
			appStateObj += `    get ${prop}() { return ${prop}; },\n`;
			appStateObj += `    set ${prop}(v) { ${prop} = v; },\n`;
		}
	});
	appStateObj += '  };\n  setAppState(appState);\n';

	layout = layout.replace(regex, appStateObj);
	fs.writeFileSync(layoutPath, layout);
	console.log('Context fixed successfully.');
} else {
	console.error('Could not find the effect block.');
}
