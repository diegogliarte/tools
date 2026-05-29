import type { ToolDefinition } from '$lib/tools/types';

export const tool: ToolDefinition = {
	title: 'Running Calculator',
	description: 'Lock one parameter (time, distance, or pace) and calculate the other two.',
	loadComponent: () => import('./Tool.svelte')
};
