import type { ToolDefinition } from '$lib/tools/types';
import Tool from './Tool.svelte';

export const tool: ToolDefinition = {
	title: 'Chat Effects',
	description: 'A tool to generate Old School RuneScape chat effect codes with a live preview.',
	component: Tool
};
