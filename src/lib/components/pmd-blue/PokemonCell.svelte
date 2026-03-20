<script lang="ts">
	import PokemonIcon from '$lib/components/pmd-blue/PokemonIcon.svelte';
	import type { Pokemon } from '$lib/utils/pmd-blue.utils';

	export let pokemon: Pokemon;
</script>

<div class="flex items-center gap-2">
	<div class="w-14 h-14 aspect-square">
		<PokemonIcon pokemon={pokemon} />
	</div>

	<div>{pokemon.name}</div>
</div>