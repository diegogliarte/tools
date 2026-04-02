import type { ToolDefinition } from '$lib/tools/types';
import Tool from './Tool.svelte';

export const tool: ToolDefinition = {
	title: 'Year Days Grid',
	description: 'A grid displaying all days of a given year.',
	component: Tool,
};
