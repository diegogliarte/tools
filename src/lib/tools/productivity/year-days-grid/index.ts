import type { ToolDefinition } from '$lib/tools/types';


export const tool: ToolDefinition = {
	title: 'Year Days Grid',
	description: 'A grid displaying all days of a given year.',
	loadComponent: () => import('./Tool.svelte'),
};
