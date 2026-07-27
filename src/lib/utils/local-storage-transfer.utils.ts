export type TransferSnapshot = {
	version: 1;
	createdAt: string;
	expiresAt?: string;
	localStorage: Record<string, string>;
};

export type ValueChange = {
	path: string;
	pathSegments: string[];
	before?: string;
	after?: string;
	beforeValue?: unknown;
	afterValue?: unknown;
};

export type StorageItemDiff = {
	key: string;
	label: string;
	type: 'added' | 'changed' | 'deleted' | 'unchanged';
	changes: ValueChange[];
};

export type DetailedStorageDiff = {
	added: number;
	changed: number;
	deleted: number;
	unchanged: number;
	items: StorageItemDiff[];
};

export const TRANSFERABLE_STORAGE_PREFIX = 'tool-state:';
export const EXCLUDED_TRANSFER_STORAGE_PREFIXES = ['tool-state:/components'];

export function isTransferableStorageKey(key: string) {
	return (
		key.startsWith(TRANSFERABLE_STORAGE_PREFIX) &&
		!EXCLUDED_TRANSFER_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix))
	);
}

export function getCurrentTransferableStorage() {
	const current: Record<string, string> = {};

	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i);
		if (!key || !isTransferableStorageKey(key)) continue;

		const value = localStorage.getItem(key);
		if (value !== null) current[key] = value;
	}

	return current;
}

export function createTransferSnapshot(): TransferSnapshot {
	return {
		version: 1,
		createdAt: new Date().toISOString(),
		localStorage: getCurrentTransferableStorage()
	};
}

function parseStoredValue(value: string): unknown {
	try {
		return JSON.parse(value);
	} catch {
		return value;
	}
}

function formatValue(value: unknown): string {
	if (value === undefined) return 'missing';
	if (value === null) return 'null';
	if (typeof value === 'boolean') return value ? 'yes' : 'no';
	if (typeof value === 'string') return value || 'empty';
	if (typeof value === 'number') return value.toString();

	return JSON.stringify(value);
}

function formatPath(path: string[]) {
	return path.length ? path.join(' / ') : 'value';
}

function flattenValue(value: unknown, path: string[] = []): Map<string, unknown> {
	const result = new Map<string, unknown>();

	if (Array.isArray(value)) {
		if (!value.length) {
			result.set(formatPath(path), []);
			return result;
		}

		value.forEach((item, index) => {
			for (const entry of flattenValue(item, [...path, String(index)])) {
				result.set(entry[0], entry[1]);
			}
		});

		return result;
	}

	if (value && typeof value === 'object') {
		const entries = Object.entries(value as Record<string, unknown>);

		if (!entries.length) {
			result.set(formatPath(path), {});
			return result;
		}

		for (const [key, item] of entries) {
			for (const entry of flattenValue(item, [...path, key])) {
				result.set(entry[0], entry[1]);
			}
		}

		return result;
	}

	result.set(formatPath(path), value);
	return result;
}

function diffStoredValue(before: string | undefined, after: string | undefined): ValueChange[] {
	const beforeValues = before === undefined ? new Map<string, unknown>() : flattenValue(parseStoredValue(before));
	const afterValues = after === undefined ? new Map<string, unknown>() : flattenValue(parseStoredValue(after));
	const paths = new Set([...beforeValues.keys(), ...afterValues.keys()]);

	return [...paths].sort().flatMap((path) => {
		const beforeValue = beforeValues.get(path);
		const afterValue = afterValues.get(path);

		if (JSON.stringify(beforeValue) === JSON.stringify(afterValue)) return [];

		return {
			path,
			pathSegments: path.split(' / '),
			before: beforeValues.has(path) ? formatValue(beforeValue) : undefined,
			after: afterValues.has(path) ? formatValue(afterValue) : undefined,
			beforeValue,
			afterValue
		};
	});
}

export function diffTransferStorageDetailed(imported: Record<string, string>): DetailedStorageDiff {
	const current = getCurrentTransferableStorage();
	const currentKeys = new Set(Object.keys(current));
	const importedKeys = new Set(Object.keys(imported).filter(isTransferableStorageKey));
	const keys = [...new Set([...currentKeys, ...importedKeys])].sort();

	const items = keys.map((key): StorageItemDiff => {
		if (!currentKeys.has(key)) {
			return {
				key,
				label: describeStorageKey(key),
				type: 'added',
				changes: diffStoredValue(undefined, imported[key])
			};
		}

		if (!importedKeys.has(key)) {
			return {
				key,
				label: describeStorageKey(key),
				type: 'deleted',
				changes: diffStoredValue(current[key], undefined)
			};
		}

		if (current[key] !== imported[key]) {
			return {
				key,
				label: describeStorageKey(key),
				type: 'changed',
				changes: diffStoredValue(current[key], imported[key])
			};
		}

		return {
			key,
			label: describeStorageKey(key),
			type: 'unchanged',
			changes: []
		};
	});

	return {
		added: items.filter((item) => item.type === 'added').length,
		changed: items.filter((item) => item.type === 'changed').length,
		deleted: items.filter((item) => item.type === 'deleted').length,
		unchanged: items.filter((item) => item.type === 'unchanged').length,
		items
	};
}

export function restoreTransferStorage(imported: Record<string, string>) {
	const current = getCurrentTransferableStorage();

	for (const key of Object.keys(current)) {
		if (!(key in imported)) {
			localStorage.removeItem(key);
		}
	}

	for (const [key, value] of Object.entries(imported)) {
		if (isTransferableStorageKey(key)) {
			localStorage.setItem(key, value);
		}
	}
}

export function describeStorageKey(key: string) {
	const withoutPrefix = key.replace(/^tool-state:/, '');
	const [route, ...scope] = withoutPrefix.split(':');

	if (!scope.length) return route;

	return `${route} · ${scope
		.join(' · ')
		.replace(/^checkbox-chip-group · /, 'filter · ')
		.replace(/^checkbox-input · /, 'option · ')}`;
}
