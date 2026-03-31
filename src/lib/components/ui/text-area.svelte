<script lang="ts">
	interface Props {
		value?: string;
		label?: string;
		placeholder?: string;
		readonly?: boolean;
		displayLines?: boolean;
	}

	let { value = $bindable(''), label = '', placeholder = '', readonly = false, displayLines = false }: Props = $props();

	const uid = $props.id();

	let lineCount = $derived(value.split('\n').length);
	let hoveredLine = $state<number | null>(null);

	function handleMouseMove(e: MouseEvent) {
		if (!displayLines) return;

		const textarea = e.currentTarget as HTMLTextAreaElement;
		const style = getComputedStyle(textarea);
		const lineHeight = parseFloat(style.lineHeight || '20');
		const offset = textarea.scrollTop;
		const y = e.offsetY + offset;
		hoveredLine = Math.floor(y / lineHeight) + 1;
	}

	function handleMouseLeave() {
		hoveredLine = null;
	}
</script>

<div class="flex w-full flex-col gap-0.5">
	{#if label}
		<label for={uid}>{label}</label>
	{/if}

	<div class="relative flex w-full border">
		{#if displayLines}
			<!-- Line numbers (same for both modes) -->
			<div class="flex min-w-[2.5rem] flex-col border-r p-2 text-right text-xs select-none">
				{#each Array(lineCount) as _, i (i)}
					<div>
						{i + 1}
					</div>
				{/each}
			</div>
		{/if}

		<textarea
			id={uid}
			bind:value
			{placeholder}
			{readonly}
			onmousemove={handleMouseMove}
			onmouseleave={handleMouseLeave}
			class="
				min-h-64
				flex-1 resize-none
				p-2
				font-mono
				text-xs text-wrap
				whitespace-pre outline-none
			"
		></textarea>
	</div>
</div>
