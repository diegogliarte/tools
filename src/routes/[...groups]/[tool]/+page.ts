import { error } from '@sveltejs/kit';
import { findTool } from '$lib/core/tools-tree';

import type { PageLoad } from './$types';

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
