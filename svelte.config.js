import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-node only
		adapter: adapter(),
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
