export function getCookie(name: string): string | null {
	if (typeof document === 'undefined') return null;

	const match = document.cookie.match(
		new RegExp('(?:^|; )' + encodeURIComponent(name) + '=([^;]*)')
	);

	return match ? decodeURIComponent(match[1]) : null;
}

export function setCookie(name: string, value: string, maxAge = 60 * 60 * 24 * 365) {
	if (typeof document === 'undefined') return;

	document.cookie = [
		`${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
		'Path=/',
		`Max-Age=${maxAge}`,
		'SameSite=Lax'
	].join('; ');
}

export function getCookies<T>(name: string, fallback: T): T {
	const raw = getCookie(name);
	if (!raw) return fallback;

	try {
		return JSON.parse(raw);
	} catch {
		return fallback;
	}
}

export function setCookies(name: string, value: unknown) {
	setCookie(name, JSON.stringify(value));
}