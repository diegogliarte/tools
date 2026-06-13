import { toolsTree } from '$lib/core/tools-tree';
import type { BuiltToolDefinition, ToolCategory } from '$lib/tools/types';

export type ToolSearchItem = BuiltToolDefinition & {
	category: string;
	searchText: string;
};

function flattenTools(categories: ToolCategory[]): ToolSearchItem[] {
	return categories.flatMap((category) => [
		...category.tools.map((tool) => {
			const categoryPath = tool.categoryPath;
			const categoryLabel = categoryPath.join(' / ');

			return {
				...tool,
				category: categoryLabel,
				searchText: [tool.title, tool.description, categoryLabel].join(' ').toLowerCase()
			};
		}),
		...flattenTools(category.subgroups)
	]);
}

export const toolSearchIndex = flattenTools(toolsTree);
