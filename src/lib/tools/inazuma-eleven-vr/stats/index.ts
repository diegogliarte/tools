import type { ToolDefinition } from '$lib/tools/types';

export const tool: ToolDefinition = {
	title: 'Stats',
	description: 'View all Inazuma Eleven VR stats.',
	loadComponent: () => import('./Tool.svelte'),
	fullscreen: true
};
