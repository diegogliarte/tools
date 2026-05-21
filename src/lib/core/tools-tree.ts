import type { ToolCategory, ToolCategoryMetadata, ToolDefinition } from '$lib/tools/types';
import { slugify } from '$lib/utils/slug.utils';

type ToolIndexModule = {
	tool?: ToolDefinition;
	category?: ToolCategoryMetadata;
};

type ToolFolderNode = {
	slug: string;
	category?: ToolCategoryMetadata;
	tool?: ToolDefinition;
	children: Map<string, ToolFolderNode>;
};

const indexModules = import.meta.glob('../tools/**/index.ts', {
	eager: true
}) as Record<string, ToolIndexModule>;

const root: ToolFolderNode = {
	slug: '',
	children: new Map()
};

function getPathSegments(path: string): string[] {
	return path
		.replace('../tools/', '')
		.replace('/index.ts', '')
		.split('/')
		.filter(Boolean);
}

function getOrCreateNode(segments: string[]): ToolFolderNode {
	let current = root;

	for (const segment of segments) {
		let child = current.children.get(segment);

		if (!child) {
			child = {
				slug: segment,
				children: new Map()
			};

			current.children.set(segment, child);
		}

		current = child;
	}

	return current;
}

function titleFromSlug(slug: string): string {
	return slug
		.split('-')
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}

function getNodeTitle(node: ToolFolderNode): string {
	return node.tool?.title ?? node.category?.title ?? titleFromSlug(node.slug);
}

function getNodeOrder(node: ToolFolderNode): number {
	return node.tool?.order ?? node.category?.order ?? Number.MAX_SAFE_INTEGER;
}

function sortNodes(a: ToolFolderNode, b: ToolFolderNode): number {
	const orderDiff = getNodeOrder(a) - getNodeOrder(b);

	if (orderDiff !== 0) return orderDiff;

	return getNodeTitle(a).localeCompare(getNodeTitle(b), undefined, {
		sensitivity: 'base'
	});
}

function buildCategory(
	node: ToolFolderNode,
	parentSlugPath: string[] = [],
	parentCategoryPath: string[] = [],
	parentFavicon?: string
): ToolCategory {
	const name = node.category?.title ?? titleFromSlug(node.slug);
	const favicon = node.category?.favicon ?? parentFavicon;
	const slugPath = [...parentSlugPath, node.slug];
	const categoryPath = [...parentCategoryPath, name];
	const children = [...node.children.values()].sort(sortNodes);

	return {
		name,
		slug: node.slug,
		favicon,
		order: node.category?.order,
		tools: children
			.filter((child) => child.tool)
			.map((child) => {
				const tool = child.tool as ToolDefinition;

				return {
					...tool,
					href: `/${[...slugPath, slugify(tool.title)].join('/')}`,
					favicon: tool.favicon ?? favicon,
					categoryPath
				};
			}),
		subgroups: children
			.filter((child) => !child.tool)
			.map((child) => buildCategory(child, slugPath, categoryPath, favicon))
	};
}

for (const [path, module] of Object.entries(indexModules)) {
	const segments = getPathSegments(path);
	const node = getOrCreateNode(segments);

	if (module.category) node.category = module.category;
	if (module.tool) node.tool = module.tool;
}

export const rawTree: ToolCategory[] = [...root.children.values()]
	.filter((node) => !node.tool)
	.sort(sortNodes)
	.map((node) => buildCategory(node));

export const toolsTree = rawTree;
