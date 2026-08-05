<script lang="ts">
	interface Props {
		src: string;
		alt: string;
		backgroundClass?: string;
	}

	let { src, alt, backgroundClass = '' }: Props = $props();
</script>

<div class="h-26 w-26 shrink-0 overflow-hidden border {backgroundClass}">
	<img {src} {alt} class="aspect-square h-full w-full object-cover" />
</div>
