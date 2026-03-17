import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ cookies, params }) => {
	const toolId = params.tool;

	const raw = cookies.get(`tool:${toolId}`);

	let state;

	try {
		state = raw ? JSON.parse(raw) : null;
	} catch {
		state = null;
	}

	return {
		toolId,
		toolState: state
	};
};
