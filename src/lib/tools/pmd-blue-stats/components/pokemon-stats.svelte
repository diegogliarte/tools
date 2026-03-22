<script lang="ts">
	import DataTable, { type Column } from '$lib/components/ui/data-table.svelte';
	import pokemonsRaw from '$lib/data/pmd-blue/pokemons.json';


	import {
		type Pokemon,
		computeLevel100Stats
	} from '$lib/utils/pmd-blue.utils';
	import PokemonCell from '$lib/components/pmd-blue/PokemonCell.svelte';

	const pokemons = pokemonsRaw as Pokemon[];

	const rows = pokemons.map((p) => {
		const lvl100 = computeLevel100Stats(p);

		return {
			...p,

			lvl1_hp: p.base_hp,
			lvl1_atk: p.base_atk,
			lvl1_def: p.base_def,
			lvl1_sp_atk: p.base_sp_atk,
			lvl1_sp_def: p.base_sp_def,

			lvl100_hp: lvl100.hp,
			lvl100_atk: lvl100.atk,
			lvl100_def: lvl100.def,
			lvl100_sp_atk: lvl100.sp_atk,
			lvl100_sp_def: lvl100.sp_def
		};
	});

	const columns: Column[] = [
		{
			key: "name",
			label: "Name",
			searchValue: (p) => p.name,
			renderComponent: (p) => ({
				component: PokemonCell,
				props: { pokemon: p }
			})
		},

		{ key: "lvl1_hp", label: "HP (1)" },
		{ key: "lvl1_atk", label: "Atk (1)" },
		{ key: "lvl1_def", label: "Def (1)" },
		{ key: "lvl1_sp_atk", label: "SpA (1)" },
		{ key: "lvl1_sp_def", label: "SpD (1)" },

		{ key: "lvl100_hp", label: "HP (100)" },
		{ key: "lvl100_atk", label: "Atk (100)" },
		{ key: "lvl100_def", label: "Def (100)" },
		{ key: "lvl100_sp_atk", label: "SpA (100)" },
		{ key: "lvl100_sp_def", label: "SpD (100)" }
	];
</script>

<DataTable {columns} {rows} pageSize={50} />