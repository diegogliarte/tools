import { json } from '@sveltejs/kit';
import { env as privateEnv } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

type FeedbackPayload = {
	message?: string;
	contact?: string;
	page?: string;
	userAgent?: string;
};

export const POST: RequestHandler = async ({ request, fetch, getClientAddress }) => {
	const baseUrl = privateEnv.NTFY_BASE_URL;
	const topic = privateEnv.NTFY_TOPIC;
	const token = privateEnv.NTFY_TOKEN;

	if (!baseUrl || !topic || !token) {
		return json({ error: 'Feedback environment variables are missing.' }, { status: 500 });
	}

	const payload = (await request.json()) as FeedbackPayload;
	const message = payload.message?.trim();
	const contact = payload.contact?.trim();
	const page = payload.page?.trim();
	const userAgent = payload.userAgent?.trim();

	if (!message) {
		return json({ error: 'Message is required.' }, { status: 400 });
	}

	if (message.length > 1200) {
		return json({ error: 'Message is too long.' }, { status: 400 });
	}

	let clientIp = 'unknown';

	try {
		clientIp = getClientAddress();
	} catch {
		// Some environments may not expose the client IP.
	}

	const response = await fetch(`${baseUrl.replace(/\/$/, '')}/${encodeURIComponent(topic)}`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'text/plain; charset=utf-8'
		},
		body: [
			`Page: ${page || '-'}`,
			`Contact: ${contact || '-'}`,
			`IP: ${clientIp}`,
			`User-Agent: ${userAgent || '-'}`,
			'',
			message
		].join('\n')
	});

	if (!response.ok) {
		return json({ error: 'Failed to forward feedback.' }, { status: 502 });
	}

	return json({ ok: true });
};
