<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		image?: string;
		imageAlt?: string;
		thumbnailClass?: string;
		fallback?: string;
		onClick?: (event: MouseEvent) => void | Promise<void>;
		children: Snippet;
	}

	let {
		image = undefined,
		imageAlt = '',
		thumbnailClass = '',
		fallback = undefined,
		onClick = undefined,
		children
	}: Props = $props();
</script>

{#snippet thumbnailContent()}
	{#if image || fallback}
		<div class="flex aspect-square h-16 w-16 shrink-0 items-center justify-center text-xs {image ? '' : 'bg-accent-dark'} {thumbnailClass}">
			{#if image}
				<img
					src={image}
					alt={imageAlt}
					loading="lazy"
					class="aspect-square h-full w-full border object-cover transition group-hover:border-accent"
				/>
			{:else}
				{fallback}
			{/if}
		</div>
	{/if}
{/snippet}

{#if onClick}
	<button type="button" class="group flex w-full cursor-pointer items-center gap-2 text-left hover:text-accent" onclick={onClick}>
		{@render thumbnailContent()}
		{@render children()}
	</button>
{:else}
	<div class="flex w-full items-center gap-2 text-left">
		{@render thumbnailContent()}
		{@render children()}
	</div>
{/if}
