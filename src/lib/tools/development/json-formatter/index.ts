import type { ToolDefinition } from '$lib/tools/types';

export const tool: ToolDefinition = {
	title: 'JSON Formatter',
	description: 'Prettify your JSONs',
	loadComponent: () => import('./Tool.svelte'),
	fullscreen: true
};
