import { json } from '@sveltejs/kit';
import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import type { RequestHandler } from './$types';

type UmamiStats = {
	pageviews: number;
	visitors: number;
	visits: number;
	bounces: number;
	totaltime: number;
};

export const GET: RequestHandler = async ({ fetch }) => {
	const baseUrl = publicEnv.PUBLIC_UMAMI_BASE_URL;
	const websiteId = publicEnv.PUBLIC_UMAMI_WEBSITE_ID;
	const token = privateEnv.UMAMI_TOKEN;

	if (!baseUrl || !websiteId || !token) {
		return json({ error: 'Umami environment variables are missing.' }, { status: 500 });
	}

	const startAt = 0;
	const endAt = Date.now();

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
		return json({ error: 'Failed to fetch Umami stats.' }, { status: response.status });
	}

	const stats = (await response.json()) as UmamiStats;

	return json(
		{
			visits: stats.visits,
			pageviews: stats.pageviews,
			visitors: stats.visitors,
			updatedAt: new Date().toISOString()
		},
		{
			headers: {
				'cache-control': 'public, max-age=120, s-maxage=600, stale-while-revalidate=1200'
			}
		}
	);
};
