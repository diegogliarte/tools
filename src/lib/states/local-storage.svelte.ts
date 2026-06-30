import { onMount } from 'svelte';

type MaybeGetter<T> = T | (() => T);

type Options<T> = {
	key?: MaybeGetter<string>;
	name?: MaybeGetter<string>;
	fallbackKeys?: MaybeGetter<string[]>;
	persist?: MaybeGetter<boolean>;
	normalize?: (value: unknown) => T | null;
};

function read<T>(value: MaybeGetter<T>): T {
	if (typeof value === 'function') {
		return (value as () => T)();
	}

	return value;
}

function clone<T extends object>(value: T): T {
	return (Array.isArray(value) ? [...value] : { ...value }) as T;
}

function normalizeValue<T extends object>(value: unknown, defaults: T, normalize?: (value: unknown) => T | null): T {
	if (normalize) {
		return normalize(value) ?? clone(defaults);
	}

	if (Array.isArray(defaults)) {
		return (Array.isArray(value) ? value : clone(defaults)) as T;
	}

	if (value && typeof value === 'object' && !Array.isArray(value)) {
		return {
			...defaults,
			...(value as Record<string, unknown>)
		};
	}

	return clone(defaults);
}

function replaceState<T extends object>(target: T, next: T) {
	if (Array.isArray(target) && Array.isArray(next)) {
		target.splice(0, target.length, ...next);
		return;
	}

	for (const key of Object.keys(target)) {
		delete (target as Record<string, unknown>)[key];
	}

	Object.assign(target, next);
}

function parseJson(raw: string | null): unknown {
	if (!raw) return undefined;

	try {
		return JSON.parse(raw);
	} catch {
		return undefined;
	}
}

function getLocalStorageValue(key: string): unknown {
	try {
		return parseJson(localStorage.getItem(key));
	} catch {
		return undefined;
	}
}

function getStoredValue(storageKey: string, fallbackKeys: string[]) {
	for (const key of [storageKey, ...fallbackKeys]) {
		const value = getLocalStorageValue(key);

		if (value !== undefined) {
			return { key, value };
		}
	}

	return null;
}

function getStorageKey(options: Options<unknown>): string {
	if (options.key) return read(options.key);

	const name = options.name ? `:${read(options.name)}` : '';
	return `tool-state:${window.location.pathname}${name}`;
}

function getFallbackKeys(options: Options<unknown>): string[] {
	return options.fallbackKeys ? read(options.fallbackKeys) : [];
}

function shouldPersist(options: Options<unknown>): boolean {
	return options.persist === undefined || read(options.persist);
}

export function syncLocalStorageState<T extends object>(
	getState: () => T,
	setState: (next: T) => void,
	defaults: T,
	options: Options<T> = {}
) {
	let initialized = false;
	let storageKey = '';

	onMount(() => {
		if (!shouldPersist(options)) return;

		storageKey = getStorageKey(options);
		const stored = getStoredValue(storageKey, getFallbackKeys(options));

		if (stored) {
			const next = normalizeValue(stored.value, defaults, options.normalize);
			setState(next);

			if (stored.key !== storageKey) {
				try {
					localStorage.setItem(storageKey, JSON.stringify(next));
				} catch {
					// Ignore unavailable or full storage; the in-memory state still works.
				}
			}
		}

		initialized = true;
	});

	$effect(() => {
		if (!initialized || !shouldPersist(options)) return;

		try {
			localStorage.setItem(storageKey, JSON.stringify($state.snapshot(getState())));
		} catch {
			// Ignore unavailable or full storage; the in-memory state still works.
		}
	});
}

export function createLocalStorageState<T extends object>(defaults: T, options: Options<T> = {}) {
	const state = $state<T>(clone(defaults));

	syncLocalStorageState(
		() => state,
		(next) => replaceState(state, next),
		defaults,
		options
	);

	return state;
}
