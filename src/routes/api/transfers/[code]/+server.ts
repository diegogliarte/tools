import { error, json } from '@sveltejs/kit';
import { getTransferStore } from '$lib/server/transfers';
import type { RequestHandler } from './$types';

export const prerender = false;

const CODE_PATTERN = /^[A-F0-9]{8}$/;

export const GET: RequestHandler = async ({ params }) => {
	const code = params.code.toUpperCase();

	if (!CODE_PATTERN.test(code)) {
		error(400, 'Invalid transfer code.');
	}

	const store = getTransferStore();
	const key = `code/${code}`;
	const entry = await store.getWithMetadata(key, { type: 'json' });

	if (!entry) {
		error(404, 'Transfer code not found.');
	}

	const expiresAt = typeof entry.metadata.expiresAt === 'string' ? entry.metadata.expiresAt : undefined;

	if (expiresAt && Date.parse(expiresAt) <= Date.now()) {
		await store.delete(key);
		error(410, 'Transfer code has expired.');
	}

	return json(entry.data);
};
