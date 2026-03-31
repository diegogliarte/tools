<script lang="ts">
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
	}

	let { value = $bindable(''), options, label = '', placeholder = '—', allowEmpty = true }: Props = $props();

	const uid = $props.id();

	function handleChange(event: Event) {
		value = (event.currentTarget as HTMLSelectElement).value;
	}
</script>

<div class="flex flex-col gap-0.5">
	{#if label}
		<label for={uid} class="pointer-events-none">{label}</label>
	{/if}

	<div class="relative cursor-pointer w-fit">
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
