import type { ToolDefinition } from '$lib/tools/types';


export const tool: ToolDefinition = {
	title: 'Chat Effects',
	description: 'A tool to generate Old School RuneScape chat effect codes with a live preview.',
	loadComponent: () => import('./Tool.svelte')
};
