<script lang="ts">
	interface Props {
		value?: string;
		label?: string;
		placeholder?: string;
		readonly?: boolean;
		displayLines?: boolean;
		minHeightClass?: string;
	}

	let {
		value = $bindable(''),
		label = '',
		placeholder = '',
		readonly = false,
		displayLines = false,
		minHeightClass = 'min-h-64'
	}: Props = $props();

	const uid = $props.id();

	let lineCount = $derived(value.split('\n').length);
</script>

<div class="flex w-full flex-col gap-0.5">
	{#if label}
		<label for={uid}>{label}</label>
	{/if}

	<div class="relative flex w-full border">
		{#if displayLines}
			<!-- Line numbers (same for both modes) -->
			<div class="flex min-w-[2.5rem] flex-col border-r p-2 text-right text-xs select-none">
				{#each Array.from({ length: lineCount }, (_, i) => i + 1) as line (line)}
					<div>
						{line}
					</div>
				{/each}
			</div>
		{/if}

		<textarea
			id={uid}
			bind:value
			{placeholder}
			{readonly}
			class="
				{minHeightClass}
				flex-1 resize-none
				p-2
				font-mono
				text-xs text-wrap
				whitespace-pre outline-none
			"
		></textarea>
	</div>
</div>
