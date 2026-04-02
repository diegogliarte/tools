import { setCookies } from '$lib/utils/cookies.utils';

export function createCookieState<T>(
	key: string,
	initial: T,
	defaults: T
) {
	const value = initial ?? defaults;

	const state = $state<T>(value);

	$effect(() => {
		setCookies(key, $state.snapshot(state));
	});

	return state;
}