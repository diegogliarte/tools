export function load({ params, cookies }) {
	const categoryPath = params.groups.split('/');
	const toolSlug = params.tool;

	const key = [...categoryPath, toolSlug].join('.');

	const raw = cookies.get(key) ?? '{}';

	let parsed;
	try {
		parsed = JSON.parse(raw);
	} catch {
		parsed = {};
	}

	return {
		cookieKey: key,
		cookieState: parsed
	};
}