<script lang="ts">
	import SelectInput from '$lib/components/ui/select-input.svelte';
	import PokemonIcon from '$lib/components/pmd-blue/PokemonIcon.svelte';

	import pokemonsRaw from '$lib/data/pmd-blue/pokemons.json';
	import movesRaw from '$lib/data/pmd-blue/moves.json';
	import pokemonMovesRaw from '$lib/data/pmd-blue/pokemon-moves.json';
	import abilitiesRaw from '$lib/data/pmd-blue/abilities.json';

	import type { Pokemon } from '$lib/utils/pmd-blue.utils';

	type Ability = {
		id: number | string;
		name: string;
		description?: string;
	};

	type Move = {
		id: number | string;
		name: string;
		type?: string;
		class?: string;
		power?: number | string;
		maxPP?: number | string;
		targets?: string;
		description?: string;
	};

	type PokemonMoves = {
		pokemon_id: number | string;
		levelup_moves?: { level: number; move_id: number | string }[];
		aux_moves?: Array<number | string>;
	};

	type Option = {
		value: string;
		label: string;
	};

	const pokemons = pokemonsRaw as Pokemon[];
	const moves = movesRaw as Move[];
	const pokemonMoves = pokemonMovesRaw as PokemonMoves[];
	const abilities = abilitiesRaw as Ability[];

	let selectedPokemon = $state('');
	let selectedAbility1 = $state('');
	let selectedAbility2 = $state('');
	let selectedMove1 = $state('');
	let selectedMove2 = $state('');
	let selectedMove3 = $state('');
	let selectedMove4 = $state('');

	const moveById = new Map(moves.map((m) => [String(m.id), m]));
	const abilityById = new Map(abilities.map((a) => [String(a.id), a]));
	const pokemonByName = new Map(pokemons.map((p) => [p.name, p]));
	const pokemonMovesById = new Map(pokemonMoves.map((p) => [String(p.pokemon_id), p]));

	const pokemonMoveIds = new Map<string, Set<string>>(
		pokemons.map((pokemon) => {
			const entry = pokemonMovesById.get(String(pokemon.game_id));
			const ids = new Set<string>();

			for (const move of entry?.levelup_moves ?? []) ids.add(String(move.move_id));
			for (const moveId of entry?.aux_moves ?? []) ids.add(String(moveId));

			return [pokemon.name, ids];
		})
	);

	function sortOptions(options: Option[]) {
		return options.sort((a, b) => a.label.localeCompare(b.label));
	}

	function uniqueOptions(options: Option[]) {
		const seen = new Set<string>();
		return sortOptions(
			options.filter((opt) => {
				if (!opt.value || seen.has(opt.value)) return false;
				seen.add(opt.value);
				return true;
			})
		);
	}

	function selectedMoves(exclude: number | null = null) {
		return [
			exclude === 1 ? '' : selectedMove1,
			exclude === 2 ? '' : selectedMove2,
			exclude === 3 ? '' : selectedMove3,
			exclude === 4 ? '' : selectedMove4
		].filter(Boolean);
	}

	function matchesPokemon(
		pokemon: Pokemon,
		{
			pokemonName = selectedPokemon,
			ability1 = selectedAbility1,
			ability2 = selectedAbility2,
			moveIds = selectedMoves()
		}: {
			pokemonName?: string;
			ability1?: string;
			ability2?: string;
			moveIds?: string[];
		} = {}
	) {
		if (pokemonName && pokemon.name !== pokemonName) return false;

		if (ability1 && String(pokemon.ability_1_id ?? '') !== ability1) return false;
		if (ability2 && String(pokemon.ability_2_id ?? '') !== ability2) return false;

		const moveSet = pokemonMoveIds.get(pokemon.name) ?? new Set<string>();
		return moveIds.every((id) => moveSet.has(id));
	}

	function filteredPokemons(args?: {
		pokemonName?: string;
		ability1?: string;
		ability2?: string;
		moveIds?: string[];
	}) {
		return pokemons.filter((pokemon) => matchesPokemon(pokemon, args));
	}

	const pokemonOptions = $derived.by(() =>
		uniqueOptions(
			filteredPokemons({
				pokemonName: '',
				ability1: selectedAbility1,
				ability2: selectedAbility2,
				moveIds: selectedMoves()
			}).map((p) => ({ value: p.name, label: p.name }))
		)
	);

	const ability1Options = $derived.by(() =>
		uniqueOptions(
			filteredPokemons({
				pokemonName: selectedPokemon,
				ability1: '',
				ability2: selectedAbility2,
				moveIds: selectedMoves()
			})
				.map((p) => {
					const id = String(p.ability_1_id ?? '');
					const ability = abilityById.get(id);
					return ability ? { value: id, label: ability.name } : null;
				})
				.filter(Boolean) as Option[]
		)
	);

	const ability2Options = $derived.by(() =>
		uniqueOptions(
			filteredPokemons({
				pokemonName: selectedPokemon,
				ability1: selectedAbility1,
				ability2: '',
				moveIds: selectedMoves()
			})
				.map((p) => {
					const id = String(p.ability_2_id ?? '');
					const ability = abilityById.get(id);
					return ability ? { value: id, label: ability.name } : null;
				})
				.filter(Boolean) as Option[]
		)
	);

	function includeCurrentOption(
		options: Option[],
		currentValue: string,
		getLabel: (value: string) => string | null
	) {
		if (!currentValue) return options;
		if (options.some((o) => o.value === currentValue)) return options;

		const label = getLabel(currentValue);
		return label ? uniqueOptions([...options, { value: currentValue, label }]) : options;
	}

	function moveOptions(slot: number) {
		const usedElsewhere = new Set(selectedMoves(slot));
		const options: Option[] = [];

		for (const pokemon of filteredPokemons({
			pokemonName: selectedPokemon,
			ability1: selectedAbility1,
			ability2: selectedAbility2,
			moveIds: selectedMoves(slot)
		})) {
			for (const moveId of pokemonMoveIds.get(pokemon.name) ?? []) {
				if (usedElsewhere.has(moveId)) continue;

				const move = moveById.get(moveId);
				if (!move) continue;

				options.push({ value: moveId, label: move.name });
			}
		}

		const currentValue =
			slot === 1 ? selectedMove1 :
				slot === 2 ? selectedMove2 :
					slot === 3 ? selectedMove3 :
						selectedMove4;

		return includeCurrentOption(
			uniqueOptions(options),
			currentValue,
			(value) => moveById.get(value)?.name ?? null
		);
	}

	const move1Options = $derived.by(() => moveOptions(1));
	const move2Options = $derived.by(() => moveOptions(2));
	const move3Options = $derived.by(() => moveOptions(3));
	const move4Options = $derived.by(() => moveOptions(4));

	const selectedPokemonData = $derived.by(() => pokemonByName.get(selectedPokemon));
	const selectedAbility1Data = $derived.by(() => abilityById.get(selectedAbility1));
	const selectedAbility2Data = $derived.by(() => abilityById.get(selectedAbility2));
	const selectedMove1Data = $derived.by(() => moveById.get(selectedMove1));
	const selectedMove2Data = $derived.by(() => moveById.get(selectedMove2));
	const selectedMove3Data = $derived.by(() => moveById.get(selectedMove3));
	const selectedMove4Data = $derived.by(() => moveById.get(selectedMove4));
</script>

{#snippet detailCard(title: string, description?: string)}
	<div class="text-xs opacity-80">
		{description}
	</div>
{/snippet}

{#snippet moveCard(move: Move)}
	<div class="opacity-80 text-xs">
		{move.type ?? '—'} · Power {move.power ?? '—'} · {move.maxPP ?? '—'}PP · {move.targets ?? '—'}
	</div>
{/snippet}

<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
	<div class="flex flex-col gap-4">
		<div class="flex flex-row gap-2 items-center">
			<div class="h-full aspect-square flex items-center justify-center text-center">
				{#if selectedPokemonData}
					<PokemonIcon pokemon={selectedPokemonData} />
				{:else}
					<div class="text-xs">No Data</div>
				{/if}
			</div>

			<div class="w-full">
				<SelectInput
s					options={pokemonOptions}
					placeholder="Pokémon"
					allowEmpty={true}
					bind:value={selectedPokemon}
				/>
			</div>
		</div>

		<div class="flex flex-col gap-1">
			<SelectInput
				options={ability1Options}
				placeholder="Ability 1"
				allowEmpty={true}
				bind:value={selectedAbility1}
			/>

			{#if selectedAbility1Data}
				{@render detailCard(selectedAbility1Data.name, selectedAbility1Data.description)}
			{/if}
		</div>

		<div class="flex flex-col gap-1">
			<SelectInput
				options={ability2Options}
				placeholder="Ability 2"
				allowEmpty={true}
				bind:value={selectedAbility2}
			/>

			{#if selectedAbility2Data}
				{@render detailCard(selectedAbility2Data.name, selectedAbility2Data.description)}
			{/if}
		</div>
	</div>

	<div class="flex flex-col gap-4">
		<div class="flex flex-col gap-2">
			<SelectInput options={move1Options} placeholder="Move 1" allowEmpty={true} bind:value={selectedMove1} />
			{#if selectedMove1Data}
				{@render moveCard(selectedMove1Data)}
			{/if}
		</div>

		<div class="flex flex-col gap-2">
			<SelectInput options={move2Options} placeholder="Move 2" allowEmpty={true} bind:value={selectedMove2} />
			{#if selectedMove2Data}
				{@render moveCard(selectedMove2Data)}
			{/if}
		</div>

		<div class="flex flex-col gap-2">
			<SelectInput options={move3Options} placeholder="Move 3" allowEmpty={true} bind:value={selectedMove3} />
			{#if selectedMove3Data}
				{@render moveCard(selectedMove3Data)}
			{/if}
		</div>

		<div class="flex flex-col gap-2">
			<SelectInput options={move4Options} placeholder="Move 4" allowEmpty={true} bind:value={selectedMove4} />
			{#if selectedMove4Data}
				{@render moveCard(selectedMove4Data)}
			{/if}
		</div>
	</div>
</div>