<script lang="ts">
	import type { Digimon } from '$lib/utils/digimon-story-ts.utils';
	import { getDigimonIcon } from '$lib/utils/digimon-story-ts.utils';

	interface Props {
		name: string;
		digimon?: Digimon;
		checked?: boolean;
	}

	let { name, digimon, checked = false }: Props = $props();
</script>

<div class="flex items-center gap-2">
	{#if digimon}
		<img
			src={getDigimonIcon(digimon)}
			alt=""
			loading="lazy"
			class="h-9 w-9 object-cover {checked ? 'opacity-60' : ''}"
		/>
	{:else}
		<div
			class="flex h-9 w-9 items-center justify-center bg-accent-dark text-xs {checked ? 'opacity-40' : 'opacity-70'}"
		>
			{name.slice(0, 2)}
		</div>
	{/if}

	<span class={checked ? 'text-green-300 line-through opacity-75' : ''}>{name}</span>
</div>
