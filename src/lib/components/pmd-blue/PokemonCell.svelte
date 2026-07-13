<script lang="ts">
	import PokemonIcon from '$lib/components/pmd-blue/PokemonIcon.svelte';
	import { openModal } from '$lib/states/modal.svelte';
	import type { Pokemon } from '$lib/utils/pmd-blue.utils';

	interface Props {
		pokemon: Pokemon;
	}

	let { pokemon }: Props = $props();

	async function open() {
		const { default: PokemonModal } = await import('$lib/components/pmd-blue/PokemonModal.svelte');
		openModal(PokemonModal, { pokemon });
	}
</script>

<div class="flex w-full cursor-pointer items-center gap-2 text-left hover:text-accent" onclick={open}>
	<div class="aspect-square h-14 w-14">
		<PokemonIcon {pokemon} openModal={false} />
	</div>

	<div>{pokemon.name}</div>
</div>
