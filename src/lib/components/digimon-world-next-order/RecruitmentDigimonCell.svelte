<script lang="ts">
	import Cell from '$lib/components/ui/cell.svelte';
	import { getDigimonIcon, type Digimon } from '$lib/utils/digimon-story-ts.utils';

	interface Props {
		name: string;
		digimon?: Digimon;
		checked?: boolean;
	}

	let { name, digimon, checked = false }: Props = $props();
</script>

<Cell
	image={digimon ? getDigimonIcon(digimon) : undefined}
	imageAlt=""
	fallback={name.slice(0, 2)}
	thumbnailClass={checked ? 'opacity-60' : ''}
>
	<span class={checked ? 'text-green-300 line-through opacity-75' : ''}>{name}</span>
</Cell>
