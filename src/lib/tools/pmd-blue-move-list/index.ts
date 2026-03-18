import type { ToolDefinition } from '$lib/tools/types';
import Tool from './Tool.svelte';

export const tool: ToolDefinition = {
	title: 'Move List',
	description: 'List of all moves in the game, with their stats and effects.',
	component: Tool,
	fullscreen: true
};
