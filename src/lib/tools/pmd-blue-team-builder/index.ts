import type { ToolDefinition } from '$lib/tools/types';
import Tool from './Tool.svelte';

export const tool: ToolDefinition = {
	title: 'Team Builder',
	description: 'Build your team by picking moves, abilities, pokémons and more.',
	component: Tool,
	fullscreen: true
};
