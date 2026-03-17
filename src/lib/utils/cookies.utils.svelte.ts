export function useToolState<T>(
	initial: T,
	toolId: string
) {
	const state = $state(initial);

	$effect(() => {
		const serialized = JSON.stringify(state);

		document.cookie = `tool:${toolId}=${serialized}; path=/; max-age=31536000`;
	});

	return state;
}