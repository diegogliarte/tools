import { setCookies } from '$lib/utils/cookies.utils';

type MaybeGetter<T> = T | (() => T);

function read<T>(value: MaybeGetter<T>): T {
	if (typeof value === 'function') {
		return (value as () => T)();
	}

	return value;
}

export function createCookieState<T>(key: MaybeGetter<string>, initial: MaybeGetter<T>, defaults: T) {
	const initialValue = read(initial);

	let value: T;

	// ARRAY CASE
	if (Array.isArray(defaults)) {
		value = Array.isArray(initialValue) ? initialValue : defaults;
	}

	// OBJECT CASE
	else if (typeof defaults === 'object' && defaults !== null) {
		value = {
			...defaults,
			...(initialValue ?? {})
		};
	}

	// PRIMITIVE CASE (just in case)
	else {
		value = initialValue ?? defaults;
	}

	const state = $state<T>(value);

	let initialized = false;
	$effect(() => {
		const snapshot = $state.snapshot(state);

		if (!initialized) {
			initialized = true;
			return;
		}

		setCookies(read(key), snapshot);
	});

	return state;
}
