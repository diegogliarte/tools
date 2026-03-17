<script lang="ts">
	import DataTable, { type Column } from "$lib/components/ui/data-table.svelte";
	import CheckboxInput from "$lib/components/ui/checkbox-input.svelte";
	import NumberInput from "$lib/components/ui/number-input.svelte";

	import PokemonCell from "./components/PokemonCell.svelte";

	import pokemonsRaw from "$lib/data/pmd-blue/pokemons.json";
	import { useToolState } from '$lib/utils/cookies.utils.svelte';

	const pokemons = pokemonsRaw;

	let { data } = $props();

	const defaults = {
		leaderLevel: 90,
		friendBow: false,
		hideUnrecruitable: false
	};

	let toolState = useToolState(
		{ ...defaults, ...(data?.toolState ?? {}) },
		data.toolId
	);

	function levelBonus(level: number) {
		if (level >= 90) return 24;
		if (level >= 80) return 17.5;
		if (level >= 70) return 15;
		if (level >= 60) return 12.5;
		if (level >= 50) return 10;
		if (level >= 40) return 7.5;
		if (level >= 30) return 5;
		return 0;
	}

	function computeRate(pokemon) {
		let rate = pokemon.recruit.rate;

		rate += levelBonus(toolState.leaderLevel);

		if (toolState.friendBow) rate += 10;

		return rate;
	}

	const rows = $derived.by(() => {

		let list = pokemons.map(pokemon => ({
			...pokemon,
			effectiveRate: computeRate(pokemon)
		}));

		if (toolState.hideUnrecruitable) {
			list = list.filter(pokemon => pokemon.effectiveRate > 0);
		}

		return list;
	});

	const pokemonColumn: Column = {
		key: "name",
		label: "Pokémon",
		width: "220px",

		searchValue: pokemon => pokemon.name,

		renderComponent: pokemon => ({
			component: PokemonCell,
			props: { pokemon: pokemon }
		})
	};

	const baseRateColumn: Column = {
		key: "baseRate",
		label: "Base Rate",

		sortValue: pokemon => pokemon.recruit.rate,

		render: pokemon => `${pokemon.recruit.rate}%`
	};

	const effectiveRateColumn: Column = {
		key: "effectiveRate",
		label: "Effective Rate",

		sortValue: pokemon => pokemon.effectiveRate,

		render: pokemon => {
			const r = pokemon.effectiveRate;

			const color =
				r > 10 ? "text-green-600" :
					r > 0 ? "text-yellow-600" :
						"text-red-600";

			return `<span class="${color}">${r.toFixed(1)}%</span>`;
		}
	};

	const friendAreaColumn: Column = {
		key: "friendArea",
		label: "Friend Area",

		sortValue: pokemon => pokemon.encounter.friendArea ?? "",

		render: pokemon => pokemon.encounter.friendArea ?? "—"
	};

	const locationsColumn: Column = {
		key: "locations",
		label: "Locations",

		render: pokemon => {

			if (!pokemon.encounter.locations.length) return "—";

			return pokemon.encounter.locations
				.map(l =>
					l.floors
						? `${l.dungeon} (${l.floors})`
						: l.dungeon
				)
				.join("<br>");
		}
	};

	const notesColumn: Column = {
		key: "notes",
		label: "Notes",

		render: pokemon =>
			pokemon.recruit.note ??
			pokemon.encounter.note ??
			"—"
	};

	const columns = [
		pokemonColumn,
		baseRateColumn,
		effectiveRateColumn,
		friendAreaColumn,
		locationsColumn,
		notesColumn
	];
</script>

<div class="flex justify-center items-center gap-6">
	<div>
		<NumberInput
			label="Leader Level"
			bind:value={toolState.leaderLevel}
			min={0}
			max={100}
			step={1}
		/>
	</div>

	<CheckboxInput
		label="Friend Bow"
		bind:checked={toolState.friendBow}
	/>

	<CheckboxInput
		label="Hide unrecruitable"
		bind:checked={toolState.hideUnrecruitable}
	/>

</div>

<DataTable {columns} rows={rows} pageSize={50} />