import type { ToolDefinition } from '$lib/tools/types';


export const tool: ToolDefinition = {
	title: 'Password Generator',
	description: 'Generate secure and random passwords, all client-side.',
	loadComponent: () => import('./Tool.svelte')
};
