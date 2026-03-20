<script lang="ts">
	import { openModal } from "$lib/states/modal.svelte";
	import PokemonModal from "$lib/components/pmd-blue/PokemonModal.svelte";
	import type { Pokemon } from '$lib/utils/pmd-blue.utils';

	interface Props {
		pokemon: Pokemon;
	}

	let { pokemon }: Props = $props();

	function getIcon(pokemon: Pokemon) {
		return `/pokemon-mystery-dungeon/icons/${pokemon.icon}`;
	}
</script>

<button
	type="button"
	class="w-full cursor-pointer p-0 border hover:border-accent transition"
	onclick={() => openModal(PokemonModal, { pokemon })}
>
	<img
		src={getIcon(pokemon)}
		alt={pokemon.name}
		class="w-full h-full object-cover aspect-square"
	/>
</button>