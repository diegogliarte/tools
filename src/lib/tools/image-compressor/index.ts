import type { ToolDefinition } from '$lib/tools/types';


export const tool: ToolDefinition = {
	title: 'Image Compressor',
	description: 'Convert any image to WEBP/JPG/PNG and change its quality.',
	loadComponent: () => import('./Tool.svelte')
};
