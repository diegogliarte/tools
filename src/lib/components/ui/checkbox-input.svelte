<script lang="ts">
	import { syncLocalStorageState } from '$lib/states/local-storage.svelte';

	import MdiCheck from '~icons/mdi/check';

	interface Props {
		label?: string;
		checked?: boolean;
		storageKey?: string;
		persist?: boolean;
	}

	let { label = '', checked = $bindable(false), storageKey = '', persist = true }: Props = $props();

	const uid = $props.id();

	function getPersistScope() {
		return `checkbox-input:${storageKey || label || uid}`;
	}

	function normalizeCheckedState(value: unknown): { checked: boolean } | null {
		if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

		const saved = value as Record<string, unknown>;
		return typeof saved.checked === 'boolean' ? { checked: saved.checked } : null;
	}

	syncLocalStorageState(
		() => ({ checked }),
		(next) => {
			checked = next.checked;
		},
		{ checked },
		{
			name: getPersistScope,
			persist: () => persist,
			normalize: normalizeCheckedState
		}
	);
</script>

<label for={uid} class="group flex h-fit cursor-pointer items-center gap-1 text-xs select-none">
	<span class="relative flex h-3 w-3 items-center justify-center">
		<input
			id={uid}
			type="checkbox"
			bind:checked
			class="
				h-3 w-3
				cursor-pointer
				appearance-none
				border
				transition
				checked:border-accent
				checked:bg-accent-dark
			"
		/>

		<MdiCheck
			class="
				pointer-events-none
				absolute h-2.5
				w-2.5
				text-accent
				transition
				{checked ? 'opacity-100 ' : 'opacity-0'}
			"
		/>
	</span>

	<span class="transition group-hover:text-accent">
		{label}
	</span>
</label>
