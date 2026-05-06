import { toolsTree } from '$lib/core/tools-tree';
import type { ToolCategory, ToolDefinition } from '$lib/tools/types';

export type ToolSearchItem = ToolDefinition & {
	href: string;
	category: string;
	categoryPath: string[];
	searchText: string;
};

function flattenTools(categories: ToolCategory[]): ToolSearchItem[] {
	return categories.flatMap((category) => [
		...category.tools
			.filter((tool): tool is ToolDefinition & { href: string } => Boolean(tool.href))
			.map((tool) => {
				const categoryPath = tool.categoryPath ?? [category.name];
				const categoryLabel = categoryPath.join(' / ');

				return {
					...tool,
					href: tool.href,
					category: categoryLabel,
					categoryPath,
					searchText: [tool.title, tool.description, categoryLabel].join(' ').toLowerCase()
				};
			}),
		...flattenTools(category.subgroups)
	]);
}

export const toolSearchIndex = flattenTools(toolsTree);