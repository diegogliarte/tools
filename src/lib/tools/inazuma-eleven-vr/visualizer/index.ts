import type { ToolDefinition } from '$lib/tools/types';

export const tool: ToolDefinition = {
	title: 'Visualizer',
	description: 'View the players by teams, etc...',
	loadComponent: () => import('./Tool.svelte'),
	fullscreen: true
};
