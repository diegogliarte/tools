export const defaultFavicon = '/favicons/tools.png';

export function faviconUrl(favicon?: string | null) {
	return favicon ?? defaultFavicon;
}

export function faviconType(favicon?: string | null) {
	if (favicon?.endsWith('.svg')) return 'image/svg+xml';
	if (favicon?.endsWith('.png')) return 'image/png';
	if (favicon?.endsWith('.ico')) return 'image/x-icon';

	return 'image/svg+xml';
}
