<script lang="ts">
	import Modal from '$lib/components/ui/modal.svelte';
	import PokemonIcon from '$lib/components/pmd-blue/PokemonIcon.svelte';
	import pokemonsRaw from '$lib/data/pmd-blue/pokemons.json';
	import movesRaw from '$lib/data/pmd-blue/moves.json';
	import pokemonMovesRaw from '$lib/data/pmd-blue/pokemon-moves.json';
	import abilitiesRaw from '$lib/data/pmd-blue/abilities.json';
	import { type Pokemon, computeStatAtLevel, buildEvolvesFromMap } from '$lib/utils/pmd-blue.utils';
	import { openModal } from '$lib/states/modal.svelte';
	import MoveModal from '$lib/components/pmd-blue/MoveModal.svelte';

	interface Props {
		pokemon: Pokemon;
		onClose?: () => void;
	}

	let { pokemon, onClose }: Props = $props();

	const pokemons = pokemonsRaw as Pokemon[];
	const pokemonByName = new Map(pokemons.map((p) => [p.name, p]));
	const evolvesFromMap = buildEvolvesFromMap(pokemons);

	const moveById = new Map(movesRaw.map((m) => [m.id, m]));
	const abilityById = new Map(abilitiesRaw.map((a) => [a.id, a]));
	const moveEntryByPokemonId = new Map(pokemonMovesRaw.map((m) => [m.pokemon_id, m]));

	const evolvesFrom = $derived(evolvesFromMap[pokemon.name] ?? []);
	const evolvesTo = $derived(pokemon.evolution ?? []);

	const ability_1 = $derived(abilityById.get(pokemon.ability_1_id));
	const ability_2 = $derived(pokemon.ability_2_id ? abilityById.get(pokemon.ability_2_id) : null);

	type DisplayMove = {
		id: number;
		name: string;
		level?: number;
		preEvolutionOnly?: boolean;
		sourcePokemonNames?: string[];
	};

	function getPokemonMoveEntry(target: Pokemon) {
		return moveEntryByPokemonId.get(target.game_id);
	}

	function getDirectPreEvolutionPokemons(target: Pokemon): Pokemon[] {
		const entries = evolvesFromMap[target.name] ?? [];
		return entries.map((e) => pokemonByName.get(e.from)).filter((p): p is Pokemon => Boolean(p));
	}

	function getAllPreEvolutionPokemons(target: Pokemon): Pokemon[] {
		const result: Pokemon[] = [];
		const visited = new Set<string>();

		function walk(current: Pokemon) {
			const pres = getDirectPreEvolutionPokemons(current);
			for (const pre of pres) {
				if (visited.has(pre.name)) continue;
				visited.add(pre.name);
				result.push(pre);
				walk(pre);
			}
		}

		walk(target);
		return result;
	}

	function buildMovesForPokemon(target: Pokemon) {
		const entry = getPokemonMoveEntry(target);

		if (!entry) {
			return {
				levelUp: [] as { level: number; id: number; name: string }[],
				tm: [] as { id: number; name: string }[]
			};
		}

		return {
			levelUp: entry.levelup_moves.map((m) => ({
				level: m.level,
				id: m.move_id,
				name: moveById.get(m.move_id)?.name ?? `#${m.move_id}`
			})),
			tm: entry.aux_moves.map((id) => ({
				id,
				name: moveById.get(id)?.name ?? `#${id}`
			}))
		};
	}

	function mergeLevelUpMovesWithPreEvos(target: Pokemon): DisplayMove[] {
		const currentMoves = buildMovesForPokemon(target).levelUp;
		const preEvos = getAllPreEvolutionPokemons(target);

		const currentIds = new Set(currentMoves.map((m) => m.id));
		const merged = new Map<number, DisplayMove>();

		for (const move of currentMoves) {
			merged.set(move.id, {
				id: move.id,
				name: move.name,
				level: move.level,
				preEvolutionOnly: false,
				sourcePokemonNames: []
			});
		}

		for (const pre of preEvos) {
			const preMoves = buildMovesForPokemon(pre).levelUp;

			for (const move of preMoves) {
				const existing = merged.get(move.id);

				if (existing) {
					if (existing.level == null || move.level < existing.level) {
						existing.level = move.level;
					}

					if (!currentIds.has(move.id)) {
						existing.preEvolutionOnly = true;
						existing.sourcePokemonNames = Array.from(new Set([...(existing.sourcePokemonNames ?? []), pre.name]));
					}
				} else {
					merged.set(move.id, {
						id: move.id,
						name: move.name,
						level: move.level,
						preEvolutionOnly: true,
						sourcePokemonNames: [pre.name]
					});
				}
			}
		}

		return Array.from(merged.values()).sort((a, b) => {
			const levelA = a.level ?? 999;
			const levelB = b.level ?? 999;
			if (levelA !== levelB) return levelA - levelB;
			return a.name.localeCompare(b.name);
		});
	}

	function mergeTmMovesWithPreEvos(target: Pokemon): DisplayMove[] {
		const currentMoves = buildMovesForPokemon(target).tm;
		const preEvos = getAllPreEvolutionPokemons(target);

		const currentIds = new Set(currentMoves.map((m) => m.id));
		const merged = new Map<number, DisplayMove>();

		for (const move of currentMoves) {
			merged.set(move.id, {
				id: move.id,
				name: move.name,
				preEvolutionOnly: false,
				sourcePokemonNames: []
			});
		}

		for (const pre of preEvos) {
			const preMoves = buildMovesForPokemon(pre).tm;

			for (const move of preMoves) {
				const existing = merged.get(move.id);

				if (existing) {
					if (!currentIds.has(move.id)) {
						existing.preEvolutionOnly = true;
						existing.sourcePokemonNames = Array.from(new Set([...(existing.sourcePokemonNames ?? []), pre.name]));
					}
				} else {
					merged.set(move.id, {
						id: move.id,
						name: move.name,
						preEvolutionOnly: true,
						sourcePokemonNames: [pre.name]
					});
				}
			}
		}

		return Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name));
	}

	const moves = $derived.by(() => {
		return {
			levelUp: mergeLevelUpMovesWithPreEvos(pokemon),
			tm: mergeTmMovesWithPreEvos(pokemon)
		};
	});

	function statAt(level: number, base: number, growth: number[]) {
		return computeStatAtLevel(base, growth, level);
	}

	function preEvolutionNames(move: DisplayMove) {
		if (!move.preEvolutionOnly || !move.sourcePokemonNames?.length) return '';
		return move.sourcePokemonNames.join(', ');
	}
</script>

<Modal title={pokemon?.name} {onClose}>
	{#if pokemon}
		<div class="mb-4 flex gap-4">
			<div class="w-20">
				<PokemonIcon {pokemon} />
			</div>

			<div class="flex flex-col gap-1 text-xs">
				<div>Recruit: {pokemon.recruit.rate}%</div>

				{#if pokemon.encounter.note}
					<div>Note: {pokemon.encounter.note}</div>
				{/if}

				<div>Friend Area: {pokemon.encounter.friendArea ?? '—'}</div>

				{#if ability_1}
					<div>
						Ability 1:
						<span class="text-accent">{ability_1.name}</span>
					</div>
					{#if ability_1.description}
						<div class="opacity-70">{ability_1.description}</div>
					{/if}
				{/if}

				{#if ability_2}
					<div>
						Ability 2:
						<span class="text-accent">{ability_2.name}</span>
					</div>
					{#if ability_2.description}
						<div class="opacity-70">{ability_2.description}</div>
					{/if}
				{/if}
			</div>
		</div>

		{#if pokemon.encounter.locations?.length}
			<h3 class="mb-1 font-bold">Locations</h3>
			<ul class="mb-4 list-inside list-disc text-xs">
				{#each pokemon.encounter.locations as l (l)}
					<li>{l.dungeon}{l.floors ? ` (${l.floors})` : ''}</li>
				{/each}
			</ul>
		{/if}

		{#if evolvesFrom.length || evolvesTo.length}
			<h3 class="mb-1 font-bold">Evolution</h3>
			<div class="mb-4 flex flex-wrap items-start justify-center gap-4 text-xs">
				{#each evolvesFrom as e (e.from)}
					{@const p = pokemonByName.get(e.from)}
					{#if p}
						<div class="flex w-20 flex-col items-center text-center">
							<PokemonIcon pokemon={p} />
							<div class="mt-1 w-full truncate">{p.name}</div>
							<div class="text-xs opacity-70">{e.method}</div>
						</div>
					{/if}
				{/each}

				<div class="flex w-20 flex-col items-center text-center">
					<PokemonIcon {pokemon} />
					<div class="mt-1 w-full truncate font-bold">{pokemon.name}</div>
				</div>

				{#each evolvesTo as e (e.to)}
					{@const p = pokemonByName.get(e.to)}
					{#if p}
						<div class="flex w-20 flex-col items-center text-center">
							<PokemonIcon pokemon={p} />
							<div class="mt-1 w-full truncate">{p.name}</div>
							<div class="text-xs opacity-70">{e.method}</div>
						</div>
					{/if}
				{/each}
			</div>
		{/if}

		{#if moves.levelUp?.length || moves.tm?.length}
			<h3 class="mb-1 font-bold">Moves</h3>
			<div class="mb-4 grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
				{#if moves.levelUp?.length}
					<div>
						<div class="mb-1 font-semibold">Level Up</div>
						<ul class="list-inside list-disc">
							{#each moves.levelUp as m (m.id)}
								<li>
									Lv {m.level}:
									<button
										type="button"
										class="cursor-pointer hover:text-accent"
										onclick={() => openModal(MoveModal, { move: moveById.get(m.id) })}
									>
										{m.name}
									</button>
									{#if m.preEvolutionOnly}
										<span
											class="ml-1 opacity-70"
											title={`Only available through pre-evolution(s): ${m.sourcePokemonNames?.join(', ') ?? ''}`}
										>
											({preEvolutionNames(m)})
										</span>
									{/if}
								</li>
							{/each}
						</ul>
					</div>
				{/if}

				{#if moves.tm?.length}
					<div>
						<div class="mb-1 font-semibold">TM</div>
						<ul class="list-inside list-disc">
							{#each moves.tm as m (m.id)}
								<li>
									<button
										type="button"
										class="cursor-pointer hover:text-accent"
										onclick={() => openModal(MoveModal, { move: moveById.get(m.id) })}
									>
										{m.name}
									</button>
									{#if m.preEvolutionOnly}
										<span
											class="ml-1 opacity-70"
											title={`Only available through pre-evolution(s): ${m.sourcePokemonNames?.join(', ') ?? ''}`}
										>
											({preEvolutionNames(m)})
										</span>
									{/if}
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		{/if}

		<h3 class="mb-2 font-bold">Stats by Level</h3>
		<div class="max-h-64 overflow-auto border text-xs">
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
							<td class="p-1">
								{statAt(lvl, pokemon.base_sp_atk, pokemon.stats_growth.sp_atk)}
							</td>
							<td class="p-1">
								{statAt(lvl, pokemon.base_sp_def, pokemon.stats_growth.sp_def)}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</Modal>
