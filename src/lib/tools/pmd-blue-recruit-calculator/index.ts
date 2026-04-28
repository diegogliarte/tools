import type { ToolDefinition } from '$lib/tools/types';


export const tool: ToolDefinition = {
	title: 'Recruit Calculator',
	description: 'Calculate Pokémon recruitment chances in Mystery Dungeon Blue Rescue Team',
	loadComponent: () => import('./Tool.svelte'),
	fullscreen: true
};
