<script lang="ts">
	import { syncLocalStorageState } from '$lib/states/local-storage.svelte';

	type Option =
		| string
		| {
				value: string;
				label: string;
				disabled?: boolean;
		  };

	type NormalizedOption = {
		value: string;
		label: string;
		disabled: boolean;
	};

	interface Props {
		label?: string;
		options?: readonly Option[];
		checked?: Record<string, boolean>;
		showActions?: boolean;
		class?: string;
		storageKey?: string; // Optional storage scope. If omitted, the component uses the current path + label.
		persist?: boolean; // Set to false if you do not want this group to persist.
	}

	let {
		label = '',
		options = [],
		checked = $bindable({}),
		showActions = true,
		class: className = '',
		storageKey = '',
		persist = true
	}: Props = $props();

	const items = $derived(
		(options.length ? options : Object.keys(checked)).map((option): NormalizedOption => {
			if (typeof option === 'string') {
				return {
					value: option,
					label: option,
					disabled: false
				};
			}

			return {
				value: option.value,
				label: option.label,
				disabled: option.disabled ?? false
			};
		})
	);

	const enabledItems = $derived(items.filter((item) => !item.disabled));
	const selectedCount = $derived(items.filter((item) => checked[item.value]).length);

	function getPersistScope() {
		return `checkbox-chip-group:${storageKey || label || 'unnamed'}`;
	}

	function getPersistedChecked(): Record<string, boolean> {
		return Object.fromEntries(items.map((item) => [item.value, !!checked[item.value]])) as Record<string, boolean>;
	}

	function setPersistedChecked(next: Record<string, boolean>) {
		checked = {
			...checked,
			...next
		};
	}

	function normalizeCheckedState(value: unknown): Record<string, boolean> | null {
		if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

		const saved = value as Record<string, unknown>;
		const normalized = Object.fromEntries(
			Object.entries(saved).filter((entry): entry is [string, boolean] => typeof entry[1] === 'boolean')
		);

		for (const item of items) {
			normalized[item.value] = typeof saved[item.value] === 'boolean' ? saved[item.value] : !!checked[item.value];
		}

		return normalized;
	}

	function setValue(value: string, next: boolean) {
		checked = {
			...checked,
			[value]: next
		};
	}

	function setAll(next: boolean) {
		checked = {
			...checked,
			...Object.fromEntries(enabledItems.map((item) => [item.value, next]))
		};
	}

	syncLocalStorageState(
		getPersistedChecked,
		setPersistedChecked,
		{},
		{
			name: getPersistScope,
			persist: () => persist,
			normalize: normalizeCheckedState
		}
	);
</script>

<div class="flex flex-col gap-1.5 {className || 'w-full'}">
	<div class="flex items-center justify-start gap-3">
		{#if label}
			<div>{label}</div>
		{/if}

		{#if showActions}
			<div class="flex items-center gap-2 text-xs opacity-70">
				<span>{selectedCount}/{enabledItems.length}</span>

				<button type="button" class="cursor-pointer transition hover:text-accent" onclick={() => setAll(true)}>
					All
				</button>

				<button type="button" class="cursor-pointer transition hover:text-accent" onclick={() => setAll(false)}>
					None
				</button>
			</div>
		{/if}
	</div>

	<div class="flex flex-wrap gap-1.5">
		{#each items as item (item.value)}
			{@const selected = !!checked[item.value]}

			<button
				type="button"
				disabled={item.disabled}
				aria-pressed={selected}
				class="
					cursor-pointer border px-2 py-1 text-xs transition-all
					disabled:pointer-events-none disabled:opacity-40
					{selected
					? 'border-accent bg-accent-dark text-accent shadow-sm'
					: 'border-white/15 bg-transparent text-white/60 hover:border-white/35 hover:bg-white/5 hover:text-white/90'}
				"
				onclick={() => setValue(item.value, !selected)}
			>
				{item.label}
			</button>
		{/each}

		{#if items.length === 0}
			<div class="text-xs opacity-50">No options</div>
		{/if}
	</div>
</div>
