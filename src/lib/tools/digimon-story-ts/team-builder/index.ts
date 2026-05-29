import type { ToolDefinition } from '$lib/tools/types';

export const tool: ToolDefinition = {
	title: 'Team Builder',
	description: 'Create your own Digimon team.',
	loadComponent: () => import('./Tool.svelte'),
	fullscreen: true
};
