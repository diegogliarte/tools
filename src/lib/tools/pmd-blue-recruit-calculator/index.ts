import type { ToolDefinition } from '$lib/tools/types';
import Tool from './Tool.svelte';

export const tool: ToolDefinition = {
	title: 'Recruit Calculator',
	description: 'Calculate Pokémon recruitment chances in Mystery Dungeon Blue Rescue Team',
	component: Tool,
	fullscreen: true
};
