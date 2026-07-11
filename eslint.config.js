import eslintPluginSvelte from 'eslint-plugin-svelte';
import * as svelteParser from 'svelte-eslint-parser';
import typescriptEslintParser from '@typescript-eslint/parser';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';

export default [
	{
		files: ['**/*.js', '**/*.ts', '**/*.svelte'],
		ignores: ['.svelte-kit/**/*', 'build/**/*', 'node_modules/**/*'],
		languageOptions: {
			parser: typescriptEslintParser,
			parserOptions: {
				ecmaVersion: 2020,
				sourceType: 'module',
				extraFileExtensions: ['.svelte']
			}
		},
		plugins: {
			'@typescript-eslint': typescriptEslintPlugin
		},
		rules: {
			...typescriptEslintPlugin.configs.recommended.rules
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: typescriptEslintParser
			}
		},
		plugins: {
			svelte: eslintPluginSvelte
		},
		rules: {
			...eslintPluginSvelte.configs.recommended.rules
		}
	}
];
