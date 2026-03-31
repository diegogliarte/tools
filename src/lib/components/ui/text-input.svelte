<script lang="ts">
	interface Props {
		value?: string | null;
		label?: string;
		placeholder?: string;
	}

	let { value = $bindable(''), label = '', placeholder = '' }: Props = $props();

	const uid = $props.id();
</script>

<div class="flex w-full flex-col gap-0.5">
	{#if label}
		<label for={uid}>{label}</label>
	{/if}

	<input
		id={uid}
		type="text"
		class="
			w-full border bg-transparent
			px-3
			py-2 transition-all outline-none hover:border-accent
			focus:border-accent
			focus:bg-accent-dark
		"
		bind:value
		{placeholder}
	/>
</div>
