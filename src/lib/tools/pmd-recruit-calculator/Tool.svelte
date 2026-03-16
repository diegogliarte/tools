<script lang="ts">
	import DataTable, { type Column } from "$lib/components/ui/data-table.svelte";
	import CheckboxInput from "$lib/components/ui/checkbox-input.svelte";
	import NumberInput from "$lib/components/ui/number-input.svelte";

	import PokemonCell from "./components/PokemonCell.svelte";

	import pokemonRaw from "$lib/data/pmd-blue/pokemons.json";

	const pokemon = pokemonRaw;

	let leaderLevel = $state(90);
	let friendBow = $state(false);
	let hideUnrecruitable = $state(false);

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

	function computeRate(p) {
		let rate = p.recruit.rate;

		rate += levelBonus(leaderLevel);

		if (friendBow) rate += 10;

		return rate;
	}

	const rows = $derived.by(() => {

		let list = pokemon.map(p => ({
			...p,
			effectiveRate: computeRate(p)
		}));

		if (hideUnrecruitable) {
			list = list.filter(p => p.effectiveRate > 0);
		}

		return list;
	});

	const pokemonColumn: Column = {
		key: "name",
		label: "Pokémon",
		width: "220px",

		searchValue: p => p.name,

		renderComponent: p => ({
			component: PokemonCell,
			props: { pokemon: p }
		})
	};

	const baseRateColumn: Column = {
		key: "baseRate",
		label: "Base Rate",

		sortValue: p => p.recruit.rate,

		render: p => `${p.recruit.rate}%`
	};

	const effectiveRateColumn: Column = {
		key: "effectiveRate",
		label: "Effective Rate",

		sortValue: p => p.effectiveRate,

		render: p => {
			const r = p.effectiveRate;

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

		sortValue: p => p.encounter.friendArea ?? "",

		render: p => p.encounter.friendArea ?? "—"
	};

	const locationsColumn: Column = {
		key: "locations",
		label: "Locations",

		render: p => {

			if (!p.encounter.locations.length) return "—";

			return p.encounter.locations
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

		render: p =>
			p.recruit.note ??
			p.encounter.note ??
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
			bind:value={leaderLevel}
			min={1}
			max={100}
			step={1}
		/>
	</div>

	<CheckboxInput
		label="Friend Bow"
		bind:checked={friendBow}
	/>

	<CheckboxInput
		label="Hide unrecruitable"
		bind:checked={hideUnrecruitable}
	/>

</div>

<DataTable {columns} rows={rows} pageSize={50} />