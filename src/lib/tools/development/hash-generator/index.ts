import type { ToolDefinition } from '$lib/tools/types';


export const tool: ToolDefinition = {
	title: 'Hash Generator',
	description: 'Generate hashes for your text using algorithms like MD5, SHA-1, SHA-256, and more.',
	loadComponent: () => import('./Tool.svelte')
};
