import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import fs from 'fs';
import path from 'path';

// Auto-manage the WordPress 'hot' file to trigger local dev mode reliably
function wpHotFileManager() {
	const hotPath = path.resolve(__dirname, '../../wp-content/plugins/super-nerd-bros-dodo-air/admin/hot');
	return {
		name: 'wp-hot-file-manager',
		configureServer(server) {
			const dir = path.dirname(hotPath);
			if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
			
			fs.writeFileSync(hotPath, 'hot');
			
			const cleanup = () => {
				if (fs.existsSync(hotPath)) fs.unlinkSync(hotPath);
				process.exit();
			};
			
			process.on('SIGINT', cleanup);
			process.on('SIGTERM', cleanup);
			process.on('SIGHUP', cleanup);
			
			server.httpServer?.on('close', () => {
				if (fs.existsSync(hotPath)) fs.unlinkSync(hotPath);
			});
		}
	};
}

import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	const devHost = env.VITE_DEV_HOST || 'localhost';

	return {
		plugins: [
			sveltekit(),
			wpHotFileManager()
		],
		server: {
			port: 5173,
			host: '0.0.0.0',
			cors: true,
			allowedHosts: true, // Allow dev server to answer to domain requests
			origin: `http://${devHost}:5173`,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Private-Network': 'true'
			},
			hmr: {
				host: env.VITE_HMR_HOST || devHost,
				port: 5173
			}
		},
		test: {
			include: ['src/**/*.{test,spec}.{js,ts}'],
			environment: 'jsdom'
		}
	};
});
