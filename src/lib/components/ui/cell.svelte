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
		<div
			class="flex aspect-square h-16 w-16 shrink-0 items-center justify-center text-xs {image
				? ''
				: 'bg-accent-dark'} {thumbnailClass}"
		>
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

<svelte:element
	this={onClick ? 'button' : 'div'}
	type={onClick ? 'button' : undefined}
	role={onClick ? 'button' : undefined}
	class="group flex w-full items-center gap-2 text-left hover:text-accent {onClick ? 'cursor-pointer' : ''}"
	onclick={onClick}
>
	{@render thumbnailContent()}
	{@render children()}
</svelte:element>
