<script lang="ts">
	import { syncLocalStorageState } from '$lib/states/local-storage.svelte';
	import MdiChevronDown from '~icons/mdi/chevron-down';

	interface Option {
		value: string | boolean;
		label: string;
	}

	interface Props {
		value?: string | boolean | null;
		options: Option[];
		label?: string;
		placeholder?: string;
		allowEmpty?: boolean;
		storageKey?: string;
		persist?: boolean;
	}

	let {
		value = $bindable(''),
		options,
		label = '',
		placeholder = '—',
		allowEmpty = true,
		storageKey = '',
		persist = true
	}: Props = $props();

	const uid = $props.id();

	function normalizeValue(value: unknown): { value: string | boolean | null } | null {
		if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

		const saved = (value as Record<string, unknown>).value;
		return typeof saved === 'string' || typeof saved === 'boolean' || saved === null ? { value: saved } : null;
	}

	function handleChange(event: Event) {
		value = (event.currentTarget as HTMLSelectElement).value;
	}

	syncLocalStorageState(
		() => ({ value }),
		(next) => {
			value = next.value;
		},
		{ value },
		{
			name: () => `select-input:${storageKey || label || uid}`,
			persist: () => persist,
			normalize: normalizeValue
		}
	);
</script>

<div class="flex flex-col gap-0.5">
	{#if label}
		<label for={uid} class="pointer-events-none">{label}</label>
	{/if}

	<div class="relative w-fit cursor-pointer">
		<select
			id={uid}
			value={String(value ?? '')}
			onchange={handleChange}
			class="
				w-full cursor-pointer appearance-none
				border
				bg-bg
				px-3
				py-2
				pr-8
				transition
				outline-none
				hover:border-accent
				focus:border-accent
			"
		>
			{#if allowEmpty}
				<option value="">
					{placeholder}
				</option>
			{/if}

			{#each options as opt (opt.value)}
				<option value={String(opt.value)}>
					{opt.label}
				</option>
			{/each}
		</select>

		<div
			class="
				pointer-events-none absolute inset-y-0
				right-2 flex
				items-center
			"
		>
			<MdiChevronDown />
		</div>
	</div>
</div>

<style>
	option:checked {
		color: var(--color-accent);
	}
</style>
