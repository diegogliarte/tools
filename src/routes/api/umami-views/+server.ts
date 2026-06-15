import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

type UmamiStats = {
	pageviews: number;
	visitors: number;
	visits: number;
	bounces: number;
	totaltime: number;
	comparison?: {
		pageviews: number;
		visitors: number;
		visits: number;
		bounces: number;
		totaltime: number;
	};
};

export const GET: RequestHandler = async ({ fetch }) => {
	const baseUrl = env.UMAMI_BASE_URL;
	const websiteId = env.UMAMI_WEBSITE_ID;
	const token = env.UMAMI_TOKEN;

	if (!baseUrl || !websiteId || !token) {
		return json({ error: 'Umami environment variables are missing.' }, { status: 500 });
	}

	const endAt = Date.now();
	const startAt = endAt - 24 * 60 * 60 * 1000;

	const url = new URL(`/api/websites/${websiteId}/stats`, baseUrl);
	url.searchParams.set('startAt', String(startAt));
	url.searchParams.set('endAt', String(endAt));

	const response = await fetch(url, {
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${token}`
		}
	});

	if (!response.ok) {
		return json({ error: 'Failed to fetch Umami stats.' }, { status: 500 });
	}

	const stats = (await response.json()) as UmamiStats;

	return json(
		{
			pageviews: stats.pageviews,
			visitors: stats.visitors,
			visits: stats.visits,
			previousPageviews: stats.comparison?.pageviews ?? null,
			updatedAt: new Date().toISOString()
		},
		{
			headers: {
				'cache-control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
			}
		}
	);
};
