<script lang="ts">
	import Cell from '$lib/components/ui/cell.svelte';
	import { openModal } from '$lib/states/modal.svelte';
	import { getPokemonIcon, type Pokemon } from '$lib/utils/pmd-blue.utils';

	interface Props {
		pokemon: Pokemon;
	}

	let { pokemon }: Props = $props();

	async function open() {
		const { default: PokemonModal } = await import('$lib/components/pmd-blue/PokemonModal.svelte');
		openModal(PokemonModal, { pokemon });
	}
</script>

<Cell image={getPokemonIcon(pokemon)} imageAlt={pokemon.name} onClick={open}>
	<div>{pokemon.name}</div>
</Cell>
