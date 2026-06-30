<script lang="ts">
	import DataTable, { type Column } from '$lib/components/ui/data-table.svelte';
	import CheckboxChipGroup from '$lib/components/ui/checkbox-chip-group.svelte';
	import NumberInput from '$lib/components/ui/number-input.svelte';
	import { createLocalStorageState } from '$lib/states/local-storage.svelte';

	import pokemonsRaw from '$lib/data/pmd-blue/pokemons.json';

	import { buildEvolvesFromMap, computeRecruitRate, type Pokemon } from '$lib/utils/pmd-blue.utils';
	import PokemonCell from '$lib/components/pmd-blue/PokemonCell.svelte';

	type RecruitRow = Pokemon & {
		effectiveRate: number;
	};

	const _state = createLocalStorageState({
		leaderLevel: 90,
		friendBow: false,
		hideUnrecruitable: false
	});

	const recruitOptions = [
		{ value: 'friendBow', label: 'Friend Bow' },
		{ value: 'hideUnrecruitable', label: 'Hide unrecruitable' }
	];

	let recruitFilter = $state<Record<string, boolean>>({
		friendBow: _state.friendBow,
		hideUnrecruitable: _state.hideUnrecruitable
	});

	$effect(() => {
		_state.friendBow = !!recruitFilter.friendBow;
		_state.hideUnrecruitable = !!recruitFilter.hideUnrecruitable;
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
		let list: RecruitRow[] = pokemons.map((pokemon) => ({
			...pokemon,
			effectiveRate: computeRecruitRate(pokemon, _state.leaderLevel, _state.friendBow)
		}));

		if (_state.hideUnrecruitable) {
			list = list.filter((pokemon) => pokemon.effectiveRate > 0);
		}

		return list;
	});

	const pokemonColumn: Column<RecruitRow> = {
		key: 'name',
		label: 'Pokémon',

		searchValue: (pokemon) => searchIndexByName[pokemon.name] ?? pokemon.name.toLowerCase(),

		renderComponent: (pokemon) => ({
			component: PokemonCell,
			props: { pokemon }
		})
	};

	const baseRateColumn: Column<RecruitRow> = {
		key: 'name',
		label: 'Base Rate',

		sortValue: (pokemon) => pokemon.recruit.rate,

		render: (pokemon) => `${pokemon.recruit.rate}%`
	};

	const effectiveRateColumn: Column<RecruitRow> = {
		key: 'effectiveRate',
		label: 'Effective Rate',

		sortValue: (pokemon) => pokemon.effectiveRate,

		render: (pokemon) => {
			const r = pokemon.effectiveRate;

			const color = r > 10 ? 'text-green-600' : r > 0 ? 'text-yellow-600' : 'text-red-600';

			return `<span class="${color}">${r.toFixed(1)}%</span>`;
		}
	};

	const friendAreaColumn: Column<RecruitRow> = {
		key: 'name',
		label: 'Friend Area',

		sortValue: (pokemon) => pokemon.encounter.friendArea ?? '',

		render: (pokemon) => pokemon.encounter.friendArea ?? '—'
	};

	const locationsColumn: Column<RecruitRow> = {
		key: 'name',
		label: 'Locations',

		render: (pokemon) => {
			if (!pokemon.encounter.locations.length) return '—';

			return pokemon.encounter.locations
				.map((location) => (location.floors ? `${location.dungeon} (${location.floors})` : location.dungeon))
				.join('<br>');
		}
	};

	const evolvesFromColumn: Column<RecruitRow> = {
		key: 'name',
		label: 'Evolves From',

		render: (pokemon) => {
			const sources = evolvesFromMap[pokemon.name];

			if (!sources?.length) return '—';

			return sources.map((e) => `${e.from} (${e.method})`).join('<br>');
		}
	};

	const notesColumn: Column<RecruitRow> = {
		key: 'name',
		label: 'Notes',
		width: '25%',

		render: (pokemon) => pokemon.recruit.note ?? pokemon.encounter.note ?? '—'
	};

	const columns: Column<RecruitRow>[] = [
		pokemonColumn,
		baseRateColumn,
		effectiveRateColumn,
		friendAreaColumn,
		locationsColumn,
		evolvesFromColumn,
		notesColumn
	];
</script>

<div class="flex flex-wrap items-end justify-center gap-6">
	<div class="w-48">
		<NumberInput label="Leader Level" bind:value={_state.leaderLevel} min={0} max={100} step={1} />
	</div>

	<div class="min-w-64">
		<CheckboxChipGroup
			label="Recruit Options"
			options={recruitOptions}
			bind:checked={recruitFilter}
			showActions={false}
		/>
	</div>
</div>

<DataTable {columns} {rows} pageSize={50} />
