<script lang="ts">
	import { openModal } from '$lib/states/modal.svelte';
	import type { Pokemon } from '$lib/utils/pmd-blue.utils';

	interface Props {
		pokemon: Pokemon;
		openModal?: boolean;
	}

	let { pokemon, openModal: canOpenModal = true }: Props = $props();

	function getIcon(pokemon: Pokemon) {
		return `/pokemon-mystery-dungeon/icons/${pokemon.icon}`;
	}

	async function open() {
		if (!canOpenModal) return;

		const { default: PokemonModal } = await import('$lib/components/pmd-blue/PokemonModal.svelte');
		openModal(PokemonModal, { pokemon });
	}
</script>

<button
	type="button"
	class="w-full border p-0 transition {canOpenModal ? 'cursor-pointer hover:border-accent' : 'cursor-default'}"
	disabled={!canOpenModal}
	onclick={open}
>
	<img src={getIcon(pokemon)} alt={pokemon.name} class="aspect-square h-full w-full object-cover" />
</button>
