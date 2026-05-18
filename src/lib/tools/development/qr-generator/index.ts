import type { ToolDefinition } from '$lib/tools/types';


export const tool: ToolDefinition = {
	title: 'QR Generator',
	description: 'Generate QR codes from text or URLs.',
	loadComponent: () => import('./Tool.svelte')
};
