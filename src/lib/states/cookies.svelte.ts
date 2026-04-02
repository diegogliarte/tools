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

	console.log(`Initial state for ${key}:`, state);
	console.log(`Defaults for ${key}:`, defaults);
	console.log(`Initial value for ${key}:`, value);

	let initialized = false;
	$effect(() => {
		console.log(`State changed for ${key}:`, state, `initialized: ${initialized}`);

		const snapshot = $state.snapshot(state);

		if (!initialized) {
			initialized = true;
			return;
		}

		setCookies(key, snapshot);
	});

	return state;
}