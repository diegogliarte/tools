<script lang="ts">
	import DataTable, { type Column } from '$lib/components/ui/data-table.svelte';
	import CheckboxInput from '$lib/components/ui/checkbox-input.svelte';
	import NumberInput from '$lib/components/ui/number-input.svelte';
	import { createCookieState } from '$lib/states/cookies.svelte';

	import pokemonsRaw from '$lib/data/pmd-blue/pokemons.json';

	import { buildEvolvesFromMap, computeRecruitRate, type Pokemon } from '$lib/utils/pmd-blue.utils';
	import PokemonCell from '$lib/components/pmd-blue/PokemonCell.svelte';

	interface Props {
		cookieKey: string;
		cookieState: any;
	}

	let { cookieKey, cookieState }: Props = $props();

	const _state = createCookieState(cookieKey, cookieState, {
		leaderLevel: 90,
		friendBow: false,
		hideUnrecruitable: false
	});

	const pokemons = pokemonsRaw as Pokemon[];

	const pokemonByName = new Map<string, Pokemon>(pokemons.map((p) => [p.name, p]));

	const evolvesFromMap = buildEvolvesFromMap(pokemons);

	function ownSearchParts(pokemon: Pokemon): string[] {
		const parts: string[] = [pokemon.name];

		if (pokemon.encounter.friendArea) {
			parts.push(pokemon.encounter.friendArea);
		}

		if (pokemon.encounter.note) {
			parts.push(pokemon.encounter.note);
		}

		if (pokemon.recruit.note) {
			parts.push(pokemon.recruit.note);
		}

		for (const loc of pokemon.encounter.locations ?? []) {
			if (loc.dungeon) parts.push(loc.dungeon);
			if (loc.floors) parts.push(loc.floors);
		}

		return parts;
	}

	function buildInheritedSearchParts(pokemonName: string, visited = new Set<string>()): string[] {
		if (visited.has(pokemonName)) return [];
		visited.add(pokemonName);

		const parts: string[] = [];
		const sources = evolvesFromMap[pokemonName] ?? [];

		for (const source of sources) {
			parts.push(source.from);
			parts.push(source.method);

			const prevo = pokemonByName.get(source.from);
			if (prevo) {
				parts.push(...ownSearchParts(prevo));
				parts.push(...buildInheritedSearchParts(prevo.name, visited));
			}
		}

		return parts;
	}

	const searchIndexByName: Record<string, string> = (() => {
		const map: Record<string, string> = {};

		for (const pokemon of pokemons) {
			const allParts = [...ownSearchParts(pokemon), ...buildInheritedSearchParts(pokemon.name)];

			map[pokemon.name] = Array.from(new Set(allParts.filter(Boolean).map((s) => String(s).trim().toLowerCase()))).join(
				' '
			);
		}

		return map;
	})();

	const rows = $derived.by(() => {
		let list = pokemons.map((pokemon) => ({
			...pokemon,
			effectiveRate: computeRecruitRate(pokemon, _state.leaderLevel, _state.friendBow)
		}));

		if (_state.hideUnrecruitable) {
			list = list.filter((pokemon) => pokemon.effectiveRate > 0);
		}

		return list;
	});

	const pokemonColumn: Column = {
		key: 'name',
		label: 'Pokémon',

		searchValue: (pokemon) => searchIndexByName[pokemon.name] ?? pokemon.name.toLowerCase(),

		renderComponent: (pokemon) => ({
			component: PokemonCell,
			props: { pokemon }
		})
	};

	const baseRateColumn: Column = {
		key: 'baseRate',
		label: 'Base Rate',

		sortValue: (pokemon) => pokemon.recruit.rate,

		render: (pokemon) => `${pokemon.recruit.rate}%`
	};

	const effectiveRateColumn: Column = {
		key: 'effectiveRate',
		label: 'Effective Rate',

		sortValue: (pokemon) => pokemon.effectiveRate,

		render: (pokemon) => {
			const r = pokemon.effectiveRate;

			const color = r > 10 ? 'text-green-600' : r > 0 ? 'text-yellow-600' : 'text-red-600';

			return `<span class="${color}">${r.toFixed(1)}%</span>`;
		}
	};

	const friendAreaColumn: Column = {
		key: 'friendArea',
		label: 'Friend Area',

		sortValue: (pokemon) => pokemon.encounter.friendArea ?? '',

		render: (pokemon) => pokemon.encounter.friendArea ?? '—'
	};

	const locationsColumn: Column = {
		key: 'locations',
		label: 'Locations',

		render: (pokemon) => {
			if (!pokemon.encounter.locations.length) return '—';

			return pokemon.encounter.locations.map((l) => (l.floors ? `${l.dungeon} (${l.floors})` : l.dungeon)).join('<br>');
		}
	};

	const evolvesFromColumn: Column = {
		key: 'evolvesFrom',
		label: 'Evolves From',

		render: (pokemon) => {
			const sources = evolvesFromMap[pokemon.name];

			if (!sources?.length) return '—';

			return sources.map((e) => `${e.from} (${e.method})`).join('<br>');
		}
	};

	const notesColumn: Column = {
		key: 'notes',
		label: 'Notes',
		width: '25%',

		render: (pokemon) => pokemon.recruit.note ?? pokemon.encounter.note ?? '—'
	};

	const columns = [
		pokemonColumn,
		baseRateColumn,
		effectiveRateColumn,
		friendAreaColumn,
		locationsColumn,
		evolvesFromColumn,
		notesColumn
	];
</script>

<div class="flex items-center justify-center gap-6">
	<div>
		<NumberInput label="Leader Level" bind:value={_state.leaderLevel} min={0} max={100} step={1} />
	</div>

	<CheckboxInput label="Friend Bow" bind:checked={_state.friendBow} />

	<CheckboxInput label="Hide unrecruitable" bind:checked={_state.hideUnrecruitable} />
</div>

<DataTable {columns} {rows} pageSize={50} />
