import { setCookies } from '$lib/utils/cookies.utils';

export function createCookieState<T>(
	key: string,
	initial: T,
	defaults: T
) {
	let value: T;

	// ARRAY CASE
	if (Array.isArray(defaults)) {
		value = Array.isArray(initial) ? initial : defaults;
	}

	// OBJECT CASE
	else if (typeof defaults === 'object' && defaults !== null) {
		value = {
			...defaults,
			...(initial ?? {})
		};
	}

	// PRIMITIVE CASE (just in case)
	else {
		value = initial ?? defaults;
	}

	const state = $state<T>(value);

	$effect(() => {
		setCookies(key, $state.snapshot(state));
	});

	return state;
}