import type { ToolCategory } from '$lib/tools/types';
import { slugify } from '$lib/utils/slug.utils';

import { tool as BMICalculator } from '$lib/tools/bmi-calculator';
import { tool as HasherGenerator } from '$lib/tools/hash-generator';
import { tool as ChronoTool } from '$lib/tools/chrono';
import { tool as PasswordGenerator } from '$lib/tools/password-generator';
import { tool as QRGenerator } from '$lib/tools/qr-generator';
import { tool as RunningCalculator } from '$lib/tools/running-calculator';
import { tool as CompoundInterestCalculator } from '$lib/tools/compound-interest-calculator';
import { tool as InazumaElevenVRStats } from '$lib/tools/inazuma-eleven-vr-stats';
import { tool as Base64EncoderDecoder } from '$lib/tools/base64-encoder-decoder';
import { tool as JSONFormatter } from '$lib/tools/json-formatter';
import { tool as InazumaElevenVRVisualizer } from '$lib/tools/inazuma-eleven-vr-visualizer';
import { tool as DigimonStoryTSStats } from '$lib/tools/digimon-story-ts-stats';
import { tool as DigimonStoryTSTeamBuilder } from '$lib/tools/digimon-story-ts-team-builder';
import { tool as DigimonStoryTSShortestRoute } from '$lib/tools/digimon-story-ts-shortest-route';
import { tool as ImageCompressor } from '$lib/tools/image-compressor';
import { tool as YearDaysGrid } from '$lib/tools/year-days-grid';
import { tool as OSRSChatEffects } from '$lib/tools/osrs-chat-effects';
import { tool as PMDBlueRecruitCalculator } from '$lib/tools/pmd-blue-recruit-calculator';
import { tool as PMDBlueStats } from '$lib/tools/pmd-blue-stats';
import { tool as PMDBlueTeamBuilder } from '$lib/tools/pmd-blue-team-builder';
import { tool as PMDBlueJoySeedFarming } from '$lib/tools/pmd-blue-joy-seed-farming';

function enrichTool(
	category: ToolCategory,
	parentPath = '',
	parentFavicon?: string,
	parentCategoryPath: string[] = []
): ToolCategory {
	const categorySlug = slugify(category.name);
	const fullPath = parentPath ? `${parentPath}/${categorySlug}` : categorySlug;
	const favicon = category.favicon ?? parentFavicon;

	const currentCategoryPath = [...parentCategoryPath, category.name];

	category.tools = category.tools.map((tool) => ({
		...tool,
		href: `/${fullPath}/${slugify(tool.title)}`,
		favicon: tool.favicon ?? favicon,
		categoryPath: currentCategoryPath
	}));

	category.subgroups = category.subgroups.map((sub) =>
		enrichTool(sub, fullPath, favicon, currentCategoryPath)
	);

	return category;
}

export const rawTree: ToolCategory[] = [
	{
		name: 'Health',
		tools: [BMICalculator, RunningCalculator],
		subgroups: []
	},
	{
		name: 'Productivity',
		tools: [ChronoTool, CompoundInterestCalculator, YearDaysGrid],
		subgroups: []
	},
	{
		name: 'Image',
		tools: [ImageCompressor],
		subgroups: []
	},
	{
		name: 'Development',
		tools: [HasherGenerator, PasswordGenerator, QRGenerator, Base64EncoderDecoder, JSONFormatter],
		subgroups: []
	},
	{
		name: 'Inazuma Eleven VR',
		favicon: '/favicons/inazuma-eleven.png',
		tools: [InazumaElevenVRStats, InazumaElevenVRVisualizer],
		subgroups: [],
	},
	{
		name: 'Digimon Story TS',
		favicon: '/favicons/digimon.png',
		tools: [DigimonStoryTSStats, DigimonStoryTSTeamBuilder, DigimonStoryTSShortestRoute],
		subgroups: [],
	},
	{
		name: 'OSRS',
		tools: [OSRSChatEffects],
		subgroups: []
	},
	{
		name: 'Pokémon Mystery Dungeon',
		favicon: '/favicons/pokemon.png',
		tools: [],
		subgroups: [
			{
				name: 'Blue Rescue Team',
				tools: [PMDBlueStats, PMDBlueRecruitCalculator, PMDBlueTeamBuilder, PMDBlueJoySeedFarming],
				subgroups: []
			}
		]
	}
];

export const toolsTree = rawTree.map((c) => enrichTool(c));
