import { toolsTree } from '$lib/core/tools-tree';
import { siteUrl } from '$lib/utils/seo.utils';

import type { ToolCategory } from '$lib/tools/types';
import type { RequestHandler } from './$types';

type SitemapUrl = {
	loc: string;
	changefreq?: 'daily' | 'weekly' | 'monthly' | 'yearly';
	priority?: number;
};

function escapeXml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');
}

function normalizePath(path: string) {
	if (!path || path === '/') return '/';

	return `/${path.replace(/^\/+/, '').replace(/\/+$/, '')}`;
}

function collectToolUrls(categories: ToolCategory[]): SitemapUrl[] {
	return categories.flatMap((category) => [
		...category.tools.map((tool) => ({
			loc: `${siteUrl}${normalizePath(tool.href)}`,
			changefreq: 'monthly' as const,
			priority: 0.8
		})),
		...collectToolUrls(category.subgroups)
	]);
}

function collectSitemapUrls(): SitemapUrl[] {
	return [
		{
			loc: `${siteUrl}/`,
			changefreq: 'weekly',
			priority: 1
		},
		...collectToolUrls(toolsTree)
	];
}

function renderUrl(url: SitemapUrl) {
	return `	<url>
		<loc>${escapeXml(url.loc)}</loc>
		${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
		${url.priority !== undefined ? `<priority>${url.priority}</priority>` : ''}
	</url>`;
}

export const GET: RequestHandler = () => {
	const urls = collectSitemapUrls();

	const body = `<?xml version="1.0" encoding="UTF-8" ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(renderUrl).join('\n')}
</urlset>`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};