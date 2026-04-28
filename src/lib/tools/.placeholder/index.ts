import type { ToolDefinition } from '$lib/tools/types';


export const tool: ToolDefinition = {
	title: 'Title',
	description: 'Description',
	loadComponent: () => import('./Tool.svelte')
};
