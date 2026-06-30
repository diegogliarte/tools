const cache = new Map<string, Promise<unknown>>();

export function loadJson<T>(url: string): Promise<T> {
	let promise = cache.get(url);

	if (!promise) {
		promise = fetch(url).then((response) => {
			if (!response.ok) {
				throw new Error(`Failed to load JSON asset: ${response.status}`);
			}

			return response.json() as Promise<T>;
		});

		cache.set(url, promise);
	}

	return promise as Promise<T>;
}

export function createJsonLoader<T>(url: string) {
	return () => loadJson<T>(url);
}
