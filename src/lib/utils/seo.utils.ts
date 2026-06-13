export const siteUrl = 'https://tools.diegogliarte.com';
export const siteName = 'Tools by diegogliarte';

export const defaultOgImage = `${siteUrl}/og/default.png`;

export function canonicalUrl(pathname: string) {
	const cleanPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
	return `${siteUrl}${cleanPath}`;
}

export function pageTitle(title: string) {
	return `${title} | ${siteName}`;
}

export function toolPageTitle(tool: {
	title: string;
	categoryPath?: string[];
}) {
	const category = tool.categoryPath?.at(-1);

	if (category) {
		return `${tool.title} | ${category} | ${siteName}`;
	}

	return pageTitle(tool.title);
}

export function toolPageDescription(tool: {
	title: string;
	description: string;
}) {
	return `${tool.description} Use ${tool.title} directly in your browser.`;
}

export function toolOgImageUrl(tool: { href: string }) {
	return `${siteUrl}/og${tool.href}.png`;
}