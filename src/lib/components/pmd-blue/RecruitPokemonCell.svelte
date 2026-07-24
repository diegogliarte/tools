<script lang="ts">
	import Cell from '$lib/components/ui/cell.svelte';
	import { getPokemonIcon, type Pokemon } from '$lib/utils/pmd-blue.utils';

	interface Props {
		pokemon: Pokemon;
		count?: number;
	}

	let { pokemon, count = 0 }: Props = $props();
</script>

<Cell image={getPokemonIcon(pokemon)} imageAlt={pokemon.name} thumbnailClass={count ? 'opacity-60' : ''}>
	<span class={count ? 'text-green-300 line-through opacity-75' : ''}>{pokemon.name}</span>
</Cell>
