import type { BuiltToolDefinition, ToolCategory } from '$lib/tools/types';
import { slugify } from '$lib/utils/slug.utils';

function getCategorySlug(category: ToolCategory): string {
	return category.slug ?? slugify(category.name);
}

function getToolSlug(tool: BuiltToolDefinition): string {
	return slugify(tool.title);
}

export function findTool(path: string[], toolSlug: string, tree: ToolCategory[]): BuiltToolDefinition | null {
	if (path.length === 0) return null;

	let currentLevel = tree;

	for (let i = 0; i < path.length; i++) {
		const segment = path[i];
		const category = currentLevel.find((cat) => getCategorySlug(cat) === segment);

		if (!category) return null;

		const isLast = i === path.length - 1;

		if (isLast) {
			const tool = category.tools.find((t) => getToolSlug(t) === toolSlug);
			return tool ?? null;
		}

		currentLevel = category.subgroups;
	}

	return null;
}
