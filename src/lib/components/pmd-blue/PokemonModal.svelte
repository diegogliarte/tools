<script lang="ts">
	import Modal from '$lib/components/ui/modal.svelte';
	import PokemonIcon from '$lib/components/pmd-blue/PokemonIcon.svelte';

	import pokemonsRaw from '$lib/data/pmd-blue/pokemons.json';
	import movesRaw from '$lib/data/pmd-blue/moves.json';
	import pokemonMovesRaw from '$lib/data/pmd-blue/pokemon-moves.json';
	import abilitiesRaw from '$lib/data/pmd-blue/abilities.json';

	import {
		type Pokemon,
		computeStatAtLevel,
		buildEvolvesFromMap
	} from '$lib/utils/pmd-blue.utils';

	import { openModal } from '$lib/states/modal.svelte';
	import MoveModal from '$lib/components/pmd-blue/MoveModal.svelte';

	interface Props {
		pokemon: Pokemon;
		onClose?: () => void;
	}

	let { pokemon, onClose }: Props = $props();

	const pokemons = pokemonsRaw as Pokemon[];

	const pokemonByName = new Map(pokemons.map(p => [p.name, p]));
	const evolvesFromMap = buildEvolvesFromMap(pokemons);
	const moveById = new Map(movesRaw.map(m => [m.id, m]));
	const abilityById = new Map(abilitiesRaw.map(a => [a.id, a]));

	const evolvesFrom = $derived(evolvesFromMap[pokemon.name] ?? []);
	const evolvesTo = $derived(pokemon.evolution ?? []);

	const ability_1 = $derived(abilityById.get(pokemon.ability_1_id));
	const ability_2 = $derived(pokemon.ability_2_id ? abilityById.get(pokemon.ability_2_id) : null);

	const moveEntry = $derived(
		pokemonMovesRaw.find(m => m.pokemon_id === pokemon.game_id)
	);

	const moves = $derived.by(() => {
		if (!moveEntry) {
			return { levelUp: [], tm: [] };
		}

		return {
			levelUp: moveEntry.levelup_moves.map(m => ({
				level: m.level,
				id: m.move_id,
				name: moveById.get(m.move_id)?.name ?? `#${m.move_id}`
			})),

			tm: moveEntry.aux_moves.map(id => ({
				id,
				name: moveById.get(id)?.name ?? `#${id}`
			}))
		};
	});

	function statAt(level: number, base: number, growth: number[]) {
		return computeStatAtLevel(base, growth, level);
	}
</script>

<Modal title={pokemon?.name} {onClose}>
	{#if pokemon}
		<div class="flex gap-4 mb-4">
			<div class="w-20">
				<PokemonIcon pokemon={pokemon}/>
			</div>

			<div class="text-xs flex flex-col gap-1">
				<div>Recruit: {pokemon.recruit.rate}%</div>
				{#if pokemon.encounter.note}
					Note: {pokemon.encounter.note}
				{/if}
				<div>Friend Area: {pokemon.encounter.friendArea ?? "—"}</div>

				{#if ability_1}
					<div>
						Ability 1: <span class="text-accent">{ability_1.name}</span>
					</div>
					{#if ability_1.description}
						<div class="opacity-70">{ability_1.description}</div>
					{/if}
				{/if}

				{#if ability_2}
					<div>
						Ability 2: <span class="text-accent">{ability_2.name}</span>
					</div>
					{#if ability_2.description}
						<div class="opacity-70">{ability_2.description}</div>
					{/if}
				{/if}
			</div>
		</div>

		{#if pokemon.encounter.locations?.length}
			<h3 class="font-bold mb-1">Locations</h3>
			<ul class="list-disc list-inside text-xs mb-4">
				{#each pokemon.encounter.locations as l (l)}
					<li>{l.dungeon}{l.floors ? ` (${l.floors})` : ""}</li>
				{/each}
			</ul>
		{/if}

		{#if evolvesFrom.length || evolvesTo.length}
			<h3 class="font-bold mb-1">Evolution</h3>

			<div class="flex items-start justify-center gap-4 text-xs mb-4 flex-wrap">
				{#each evolvesFrom as e (e)}
					{@const p = pokemonByName.get(e.from)}
					{#if p}
						<div class="flex flex-col items-center w-20 text-center">
							<PokemonIcon pokemon={p} />
							<div class="mt-1 truncate w-full">{p.name}</div>
							<div class="text-xs opacity-70">{e.method}</div>
						</div>
					{/if}
				{/each}

				<div class="flex flex-col items-center w-20 text-center">
					<PokemonIcon pokemon={pokemon} />
					<div class="mt-1 font-bold truncate w-full">{pokemon.name}</div>
				</div>

				{#each evolvesTo as e (e)}
					{@const p = pokemonByName.get(e.to)}
					{#if p}
						<div class="flex flex-col items-center w-20 text-center">
							<PokemonIcon pokemon={p} />
							<div class="mt-1 truncate w-full">{p.name}</div>
							<div class="text-xs opacity-70">{e.method}</div>
						</div>
					{/if}
				{/each}
			</div>
		{/if}

		{#if moves.levelUp?.length || moves.tm?.length}
			<h3 class="font-bold mb-1">Moves</h3>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-4">
				{#if moves.levelUp?.length}
					<div>
						<div class="font-semibold mb-1">Level Up</div>
						<ul class="list-disc list-inside">
							{#each moves.levelUp as m (m)}
								<li>
									Lv {m.level}:
									<button
										type="button"
										class="hover:text-accent cursor-pointer"
										onclick={() => openModal(MoveModal, { move: moveById.get(m.id) })}
									>
										{m.name}
									</button>
								</li>
							{/each}
						</ul>
					</div>
				{/if}

				{#if moves.tm?.length}
					<div>
						<div class="font-semibold mb-1">TM</div>
						<ul class="list-disc list-inside">
							{#each moves.tm as m (m)}
								<li>
									<button
										type="button"
										class="hover:text-accent cursor-pointer"
										onclick={() => openModal(MoveModal, { move: moveById.get(m.id) })}
									>
										{m.name}
									</button>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		{/if}

		<h3 class="font-bold mb-2">Stats by Level</h3>
		<div class="overflow-auto max-h-64 text-xs border">
			<table class="w-full text-left">
				<thead class="sticky top-0 bg-neutral-900">
				<tr>
					<th class="p-1">Lv</th>
					<th class="p-1">HP</th>
					<th class="p-1">Atk</th>
					<th class="p-1">Def</th>
					<th class="p-1">SpA</th>
					<th class="p-1">SpD</th>
				</tr>
				</thead>
				<tbody>
				{#each Array(100) as _, i}
					{@const lvl = i + 1}
					<tr>
						<td class="p-1">{lvl}</td>
						<td class="p-1">{statAt(lvl, pokemon.base_hp, pokemon.stats_growth.hp)}</td>
						<td class="p-1">{statAt(lvl, pokemon.base_atk, pokemon.stats_growth.atk)}</td>
						<td class="p-1">{statAt(lvl, pokemon.base_def, pokemon.stats_growth.def)}</td>
						<td class="p-1">{statAt(lvl, pokemon.base_sp_atk, pokemon.stats_growth.sp_atk)}</td>
						<td class="p-1">{statAt(lvl, pokemon.base_sp_def, pokemon.stats_growth.sp_def)}</td>
					</tr>
				{/each}
				</tbody>
			</table>
		</div>
	{/if}
</Modal>