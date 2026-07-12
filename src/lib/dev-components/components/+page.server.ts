// @ts-nocheck
import { fail } from '@sveltejs/kit';
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = util.promisify(exec);

export const load = async () => {
	// Fetch list of components from shadcn-svelte registry
	let availableComponents = [];
	try {
		const res = await fetch('https://shadcn-svelte.com/registry/index.json');
		if (res.ok) {
			const data = await res.json();
			availableComponents = data
				.filter((c: any) => c.type === 'registry:ui')
				.map((c: any) => c.name);
		}
	} catch (error) {
		console.error('Failed to fetch shadcn components:', error);
	}

	// Check which components are already installed
	const atomsDir = path.resolve('src/lib/components/atoms');
	let installedComponents: string[] = [];
	if (fs.existsSync(atomsDir)) {
		installedComponents = fs
			.readdirSync(atomsDir, { withFileTypes: true })
			.filter((dirent) => dirent.isDirectory())
			.map((dirent) => dirent.name);
	}

	return {
		availableComponents,
		installedComponents
	};
};

export const actions = {
	install: async ({ request }: any) => {
		const data = await request.formData();
		const components = data.getAll('components');

		if (!components || components.length === 0) {
			return fail(400, { missing: true, message: 'No components selected.' });
		}

		try {
			const compList = components.join(' ');
			// Add `-y` and `--overwrite` to ensure it doesn't prompt in the terminal
			const command = `pnpm dlx shadcn-svelte@latest add -y --overwrite ${compList}`;
			const { stdout, stderr } = await execAsync(command);

			return { success: true, output: stdout, message: 'Components installed successfully!' };
		} catch (error: any) {
			return fail(500, { success: false, message: error.message || 'Installation failed.' });
		}
	}
};
