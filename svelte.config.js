import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const file = fileURLToPath(new URL('package.json', import.meta.url));
const json = readFileSync(file, 'utf8');
const pkg = JSON.parse(json);

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		version: {
			name: pkg.version,
			pollInterval: 300000 // Poll every 5 minutes
		},
		prerender: {
			handleHttpError: 'warn'
		},
		adapter: adapter({
			fallback: 'index.html',
			pages: '../../wp-content/plugins/super-nerd-bros-dodo-air/public/dist',
			assets: '../../wp-content/plugins/super-nerd-bros-dodo-air/public/dist',
			precompress: false,
			strict: false
		}),

		alias: {
			$lib: 'src/lib',
			'@atoms': 'src/lib/components/atoms',
			'@molecules': 'src/lib/components/molecules',
			'@organisms': 'src/lib/components/organisms',
			'@templates': 'src/lib/components/templates',
			'@views': 'src/lib/components/views',
			'@server': 'src/lib/server',
			'@stores': 'src/lib/stores',
			'@utils': 'src/lib/utils'
		}
	},
	// Svelte 5 runes setup (enabled by default in next versions, but good to ensure compatibility)
	compilerOptions: {
		runes: true
	}
};

export default config;
