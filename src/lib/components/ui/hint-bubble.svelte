<script lang="ts">
	interface Props {
		text: string;
		onClick?: () => void;
	}

	let { text, onClick = undefined }: Props = $props();
</script>

<button
	type="button"
	class="group absolute top-[calc(100%+4px)] right-0 z-40 w-40 max-w-[calc(100vw-1rem)] cursor-pointer border border-text bg-bg px-2 py-1.5 text-left text-xxs leading-snug transition-colors hover:border-accent sm:w-52"
	onclick={onClick}
>
	{text}
	<div class="absolute -top-1 right-3 h-2 w-2 rotate-45 border-t border-l border-text bg-bg transition-colors group-hover:border-accent"></div>
</button>
