<script lang="ts">
	import { onMount } from 'svelte';
	import DataTable, { type Column } from '$lib/components/ui/data-table.svelte';
	import CheckboxChipGroup from '$lib/components/ui/checkbox-chip-group.svelte';
	import SelectInput from '$lib/components/ui/select-input.svelte';

	import { loadDigimon } from '$lib/data/digimon-story-ts/data';
	import { addMissingFilterOptions, unique } from '$lib/utils/filters.utils.svelte.js';
	import DigimonCell from '$lib/components/digimon-story-ts/DigimonCell.svelte';
	import type { Digimon } from '$lib/utils/digimon-story-ts.utils';

	let digimon = $state<Digimon[]>([]);

	onMount(async () => {
		digimon = await loadDigimon();
	});

	const generations = $derived(unique(digimon.map((d) => d.generation)));
	const attributes = $derived(unique(digimon.map((d) => d.attribute)));
	const personalities = $derived(unique(digimon.map((d) => d.base_personality)));

	const ridableOptions = [{ value: 'ridable', label: 'Ridable only' }];

	let generationFilter = $state<Record<string, boolean>>({});
	let attributeFilter = $state<Record<string, boolean>>({});
	let personalityFilter = $state<Record<string, boolean>>({});
	let ridableFilter = $state<Record<string, boolean>>({});

	let statLevel = $state<'lv1' | 'lv99'>('lv99');

	$effect(() => {
		addMissingFilterOptions(generationFilter, generations);
		addMissingFilterOptions(attributeFilter, attributes);
		addMissingFilterOptions(personalityFilter, personalities);
		addMissingFilterOptions(
			ridableFilter,
			ridableOptions.map((o) => o.value)
		);
	});

	const filteredRows = $derived.by(() => {
		const genSel = Object.keys(generationFilter).filter((k) => generationFilter[k]);
		const attrSel = Object.keys(attributeFilter).filter((k) => attributeFilter[k]);
		const persSel = Object.keys(personalityFilter).filter((k) => personalityFilter[k]);
		const ridableOnly = !!ridableFilter.ridable;

		return digimon.filter(
			(d) =>
				(genSel.length ? genSel.includes(d.generation) : true) &&
				(attrSel.length ? attrSel.includes(d.attribute) : true) &&
				(persSel.length ? persSel.includes(d.base_personality) : true) &&
				(!ridableOnly || d.ridable)
		);
	});

	const rows = $derived.by(() =>
		filteredRows.map((d) => ({
			...d,
			...d.base_stats[statLevel]
		}))
	);

	const digimonColumn: Column = {
		key: 'name',
		label: 'Digimon',
		width: '260px',
		searchValue: (d) => `${d.name} ${d.generation} ${d.attribute} ${d.type}`,
		renderComponent: (d) => ({
			component: DigimonCell,
			props: { digimon: d }
		})
	};

	const attributeColumn: Column<Digimon> = {
		key: 'attribute',
		label: 'Attr',
		sortValue: (d) => d.attribute,
		render: (d) => `
		<div class="flex items-center gap-1 leading-none">
			<img
				src="/digimon-story-ts/${d.attribute.toLowerCase().replace(' ', '-')}.png"
				alt="${d.attribute}"
				class="h-[1.5em] w-[1.5em] shrink-0"
			/>
			<span>${d.attribute}</span>
		</div>
	`
	};

	const typeColumn: Column<Digimon> = {
		key: 'type',
		label: 'Type',
		sortValue: (d) => d.type
	};

	function totalStats(d: Record<string, unknown>) {
		return ['HP', 'SP', 'ATK', 'DEF', 'INT', 'SPI', 'SPD'].reduce((total, stat) => total + Number(d[stat] ?? 0), 0);
	}

	const totalColumn: Column<Record<string, unknown>> = {
		key: 'TOTAL',
		label: 'Total',

		sortValue: totalStats,

		render: (d) => String(totalStats(d))
	};

	const ridableColumn: Column<Digimon> = {
		key: 'ridable',
		label: 'Ridable',

		sortValue: (d) => (d.ridable ? 1 : 0),
		render: (d) => (d.ridable ? '✓' : '—')
	};

	const columns = $derived([
		digimonColumn,
		attributeColumn,
		typeColumn,

		{ key: 'HP', label: 'HP' },
		{ key: 'SP', label: 'SP' },
		{ key: 'ATK', label: 'ATK' },
		{ key: 'DEF', label: 'DEF' },
		{ key: 'INT', label: 'INT' },
		{ key: 'SPI', label: 'SPI' },
		{ key: 'SPD', label: 'SPD' },

		totalColumn,
		ridableColumn
	]);
</script>

{#if digimon.length}
	<div class="flex flex-col gap-4">
		<div class="grid gap-4 lg:grid-cols-2">
			<CheckboxChipGroup label="Generations" options={generations} bind:checked={generationFilter} />

			<CheckboxChipGroup label="Attributes" options={attributes} bind:checked={attributeFilter} />

			<CheckboxChipGroup label="Personalities" options={personalities} bind:checked={personalityFilter} />

			<CheckboxChipGroup label="Ridable" options={ridableOptions} bind:checked={ridableFilter} showActions={false} />
		</div>

		<div class="w-40">
			<SelectInput
				label="Stats Level"
				bind:value={statLevel}
				options={[
					{ value: 'lv1', label: 'Lv. 1' },
					{ value: 'lv99', label: 'Lv. 99' }
				]}
			/>
		</div>
	</div>

	<DataTable {columns} {rows} pageSize={50} />
{:else}
	<p class="text-center opacity-60">Loading Digimon...</p>
{/if}
