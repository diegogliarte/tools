<script lang="ts">
	import { labelGroups } from '$lib/states/label-groups.svelte.js';
	import CopyButton from '$lib/components/ui/copy-button.svelte';

	interface Props {
		label?: string;
		value?: string | number | null;
		group?: string | null;
		isCopyable?: boolean;
		valueAlign?: 'left' | 'center' | 'right';
	}

	let { label = '', value = '', group, isCopyable = true, valueAlign = 'left' }: Props = $props();

	const alignmentClass = {
		left: 'text-left',
		center: 'text-center',
		right: 'text-right'
	}[valueAlign];

	let labelEl: HTMLElement | null = $state(null);

	$effect(() => {
		if (!labelEl || group == null) return;

		const width = labelEl.offsetWidth;
		const current = labelGroups[group] ?? 0;

		if (width > current) {
			labelGroups[group] = width;
		}
	});
</script>

<div class="flex w-full items-center">
	{#if label}
		<div bind:this={labelEl} class="border border-r-0 p-1 text-center" style={`min-width:${labelGroups[group] ?? 0}px`}>
			{label}
		</div>
	{/if}

	<div
		class="
			flex-1
			cursor-pointer
			truncate
			border
			p-1
			outline-none hover:border-accent focus:border-accent focus:bg-accent-dark
			{alignmentClass}
		"
		tabindex="-1"
	>
		{value ?? '—'}
	</div>

	{#if isCopyable}
		<div class="ml-2 flex">
			<CopyButton value={value ?? ''} />
		</div>
	{/if}
</div>
