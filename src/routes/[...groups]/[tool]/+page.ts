import { error } from '@sveltejs/kit';
import { findTool, flatTools } from '$lib/core/tools-tree';

import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () =>
	flatTools.map((tool) => {
		const segments = tool.href.slice(1).split('/');

		return {
			groups: segments.slice(0, -1).join('/'),
			tool: segments.at(-1)!
		};
	});

export const load: PageLoad = ({ params }) => {
	const categoryPath = params.groups.split('/');
	const toolSlug = params.tool;

	const tool = findTool(categoryPath, toolSlug);

	if (!tool) {
		error(404, {
			message: 'Tool not found'
		});
	}

	return {
		tool
	};
};
