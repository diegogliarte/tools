import { json } from '@sveltejs/kit';
import { randomBytes } from 'node:crypto';
import { getTransferStore } from '$lib/server/transfers';
import { isTransferableStorageKey } from '$lib/utils/local-storage-transfer.utils';
import type { RequestHandler } from './$types';

export const prerender = false;

const CODE_BYTES = 4;
const EXPIRES_IN_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_PAYLOAD_BYTES = 250_000;

type TransferSnapshot = {
	version?: unknown;
	createdAt?: unknown;
	expiresAt?: unknown;
	localStorage?: unknown;
};

function generateCode() {
	return randomBytes(CODE_BYTES).toString('hex').toUpperCase();
}

function normalizeSnapshot(value: TransferSnapshot) {
	if (!value || typeof value !== 'object' || !value.localStorage || typeof value.localStorage !== 'object') {
		return null;
	}

	const localStorage = Object.fromEntries(
		Object.entries(value.localStorage as Record<string, unknown>).filter(
			(entry): entry is [string, string] => isTransferableStorageKey(entry[0]) && typeof entry[1] === 'string'
		)
	);

	if (!Object.keys(localStorage).length) return null;

	const createdAt = typeof value.createdAt === 'string' ? value.createdAt : new Date().toISOString();
	const expiresAt = new Date(Date.now() + EXPIRES_IN_MS).toISOString();

	return {
		version: 1,
		createdAt,
		expiresAt,
		localStorage
	};
}

export const POST: RequestHandler = async ({ request }) => {
	const payload = (await request.json()) as TransferSnapshot;
	const snapshot = normalizeSnapshot(payload);

	if (!snapshot) {
		return json({ error: 'No transferable data found.' }, { status: 400 });
	}

	if (new TextEncoder().encode(JSON.stringify(snapshot)).length > MAX_PAYLOAD_BYTES) {
		return json({ error: 'Transfer data is too large.' }, { status: 413 });
	}

	const store = getTransferStore();
	const code = generateCode();
	const result = await store.set(`code/${code}`, JSON.stringify(snapshot), {
		onlyIfNew: true,
		metadata: {
			expiresAt: snapshot.expiresAt
		}
	});

	if (!result.modified) {
		return json({ error: 'Transfer code collision. Try again.' }, { status: 409 });
	}

	return json({
		code,
		expiresAt: snapshot.expiresAt
	});
};
