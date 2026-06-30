<script lang="ts">
	import { openModal } from '$lib/states/modal.svelte';
	import type { Pokemon } from '$lib/utils/pmd-blue.utils';

	interface Props {
		pokemon: Pokemon;
	}

	let { pokemon }: Props = $props();

	function getIcon(pokemon: Pokemon) {
		return `/pokemon-mystery-dungeon/icons/${pokemon.icon}`;
	}

	async function open() {
		const { default: PokemonModal } = await import('$lib/components/pmd-blue/PokemonModal.svelte');
		openModal(PokemonModal, { pokemon });
	}
</script>

<button type="button" class="w-full cursor-pointer border p-0 transition hover:border-accent" onclick={open}>
	<img src={getIcon(pokemon)} alt={pokemon.name} class="aspect-square h-full w-full object-cover" />
</button>
