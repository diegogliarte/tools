import { error } from '@sveltejs/kit';
import { findTool } from '$lib/core/tools-registry';
import { toolsTree } from '$lib/core/tools-tree';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, data }) => {
	const categoryPath = params.groups.split('/');
	const toolSlug = params.tool;

	const tool = findTool(categoryPath, toolSlug, toolsTree);

	if (!tool) {
		error(404, {
			message: 'Tool not found'
		});
	}

	return {
		...data,
		categoryPath,
		toolSlug
	};
};
