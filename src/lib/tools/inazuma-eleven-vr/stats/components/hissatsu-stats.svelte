<script lang="ts">
	import DataTable, { type Column } from '$lib/components/ui/data-table.svelte';
	import CheckboxChipGroup from '$lib/components/ui/checkbox-chip-group.svelte';

	import hissatsu from '$lib/data/inazuma-eleven-vr/hissatsu.json';
	import { makeFilter, sortNoneLast, unique } from '$lib/utils/filters.utils.svelte.js';

	type HissatsuRow = {
		Name: string;
		'Japanese Name': string;
		Power: number | string;
		Tension: number | string;
		Type: string;
		'Sub-Type': string;
		Element: string;
		'Shop 1': string;
		'Shop 2': string;
		Movie?: string | null;
	};

	// Element colors (optional)
	const elementColor = {
		Mountain: 'bg-yellow-800',
		Fire: 'bg-red-800',
		Forest: 'bg-green-800',
		Wind: 'bg-sky-800'
	} as const;

	function getElementColor(element: string) {
		return elementColor[element as keyof typeof elementColor] ?? 'bg-neutral-600';
	}

	// Rows come directly from JSON
	const rows: HissatsuRow[] = hissatsu.map((r) => ({
		...r,
		Type: r.Type?.trim() || 'None',
		'Sub-Type': r['Sub-Type']?.trim() || 'None',
		Element: r.Element?.trim() || 'None'
	}));

	const nameColumn: Column<HissatsuRow> = {
		key: 'Name',
		label: 'Name',
		width: '260px',
		searchValue: (h) => `${h.Name} ${h['Japanese Name']} ${h.Type} ${h.Element}`,
		render: (h) => `
		<div class="relative group flex items-center gap-2 cursor-pointer">
			<div class="w-3 h-3 rounded-sm ${getElementColor(h.Element)}"></div>
			<span>${h.Name}</span>
		</div>
	`
	};

	// ${h.Movie ? `
	// 		<div class="absolute w-96 left-40 z-50 hidden group-hover:block">
	// 			<video
	// 				src="${h.Movie}"
	// 				autoplay
	// 				muted
	// 				loop
	// 				playsinline
	// 				class="w-full h-full border pointer-events-none"
	// 			></video>
	// 		</div>
	// 		` : ""}

	const columns: Column<HissatsuRow>[] = [
		nameColumn,
		{ key: 'Power', label: 'Power' },
		{ key: 'Tension', label: 'Tension' },
		{ key: 'Type', label: 'Type' },
		{ key: 'Sub-Type', label: 'Subtype' },
		{ key: 'Shop 1', label: 'Shop 1' },
		{ key: 'Shop 2', label: 'Shop 2' }
	];

	const types = unique(rows.map((r) => r.Type));
	const subtypes = sortNoneLast(unique(rows.map((r) => r['Sub-Type'])));
	const elements = sortNoneLast(unique(rows.map((r) => r.Element)));
	const powerVals = unique(rows.map((r) => r.Power)).filter(Boolean);
	const powerOptions = powerVals.map(String);

	let typeFilter = $state(makeFilter(types));
	let subtypeFilter = $state(makeFilter(subtypes));
	let elementFilter = $state(makeFilter(elements));
	let powerFilter = $state(makeFilter(powerOptions));

	let filteredRows = $derived.by(() => {
		const allowedTypes = Object.keys(typeFilter).filter((k) => typeFilter[k]);
		const allowedSubtypes = Object.keys(subtypeFilter).filter((k) => subtypeFilter[k]);
		const allowedElements = Object.keys(elementFilter).filter((k) => elementFilter[k]);
		const allowedPowers = Object.keys(powerFilter).filter((k) => powerFilter[k]);

		return rows.filter(
			(r) =>
				(allowedTypes.length ? allowedTypes.includes(r.Type) : true) &&
				(allowedSubtypes.length ? allowedSubtypes.includes(r['Sub-Type']) : true) &&
				(allowedElements.length ? allowedElements.includes(r.Element) : true) &&
				(allowedPowers.length ? allowedPowers.includes(r.Power.toString()) : true)
		);
	});
</script>

<div class="flex flex-col gap-4">
	<div class="grid gap-4 lg:grid-cols-2">
		<CheckboxChipGroup label="Type" options={types} bind:checked={typeFilter} />

		<CheckboxChipGroup label="Subtype" options={subtypes} bind:checked={subtypeFilter} />

		<CheckboxChipGroup label="Element" options={elements} bind:checked={elementFilter} />

		<CheckboxChipGroup label="Power" options={powerOptions} bind:checked={powerFilter} />
	</div>
</div>

<DataTable {columns} rows={filteredRows} pageSize={50} />
