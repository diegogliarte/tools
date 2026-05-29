import type { ToolDefinition } from '$lib/tools/types';

export const tool: ToolDefinition = {
	title: 'Base64 Encoder Decoder',
	description: 'Encode and decode text using Base64 encoding scheme.',
	loadComponent: () => import('./Tool.svelte')
};
