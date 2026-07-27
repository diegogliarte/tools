export type TransferSnapshot = {
	version: 1;
	createdAt: string;
	expiresAt?: string;
	localStorage: Record<string, string>;
};

export type StorageDiff = {
	added: string[];
	changed: string[];
	unchanged: string[];
	deleted: string[];
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

export function diffTransferStorage(imported: Record<string, string>): StorageDiff {
	const current = getCurrentTransferableStorage();
	const currentKeys = new Set(Object.keys(current));
	const importedKeys = new Set(Object.keys(imported).filter(isTransferableStorageKey));

	return {
		added: [...importedKeys].filter((key) => !currentKeys.has(key)).sort(),
		changed: [...importedKeys].filter((key) => currentKeys.has(key) && current[key] !== imported[key]).sort(),
		unchanged: [...importedKeys].filter((key) => currentKeys.has(key) && current[key] === imported[key]).sort(),
		deleted: [...currentKeys].filter((key) => !importedKeys.has(key)).sort()
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
	return key
		.replace(/^tool-state:/, '')
		.replace(/:checkbox-chip-group:/g, ' / filter: ')
		.replace(/:checkbox-input:/g, ' / option: ');
}
