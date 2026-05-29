import type { ToolDefinition } from '$lib/tools/types';

export const tool: ToolDefinition = {
	title: 'Chrono',
	description: 'Simple chronometer.',
	loadComponent: () => import('./Tool.svelte'),
	removeBorder: true
};
