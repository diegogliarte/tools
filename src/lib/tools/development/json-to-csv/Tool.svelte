<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import TextArea from '$lib/components/ui/text-area.svelte';
	import TextInput from '$lib/components/ui/text-input.svelte';
	import SelectInput from '$lib/components/ui/select-input.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import LabeledRow from '$lib/components/ui/labeled-row.svelte';
	import CopyButton from '$lib/components/ui/copy-button.svelte';

	type CsvRow = Record<string, string>;
	type JsonRoot = 'array' | 'object';
	type SortDir = 'none' | 'asc' | 'desc';

	interface TableRow {
		id: number;
		values: CsvRow;
	}

	interface ParseSuccess {
		ok: true;
		rows: CsvRow[];
		keys: string[];
		root: JsonRoot;
	}

	interface ParseError {
		ok: false;
		error: string;
	}

	type ParseResult = ParseSuccess | ParseError;

	let input = $state('');
	let delimiter = $state(',');
	let jsonRoot = $state<JsonRoot>('array');

	let rows = $state<TableRow[]>([]);
	let keys = $state<string[]>([]);

	let newColumn = $state('');
	let selectedColumn = $state('');

	let sortColumn = $state('');
	let sortDir = $state<SortDir>('none');

	let nextRowId = 1;

	const delimiterOptions = [
		{ value: ',', label: 'Comma (,)' },
		{ value: ';', label: 'Semicolon (;)' },
		{ value: '\t', label: 'Tab' }
	];

	const rootOptions = [
		{ value: 'array', label: 'Array' },
		{ value: 'object', label: 'Object' }
	];

	const columnOptions = $derived(keys.map((key) => ({ value: key, label: key })));
	const sortOptions = $derived(keys.map((key) => ({ value: key, label: key })));

	function isObject(value: unknown): value is Record<string, unknown> {
		return typeof value === 'object' && value !== null && !Array.isArray(value);
	}

	function stringifyValue(value: unknown): string {
		if (value === null || value === undefined) return '';
		if (typeof value === 'string') return value;
		if (typeof value === 'number') return String(value);
		if (typeof value === 'boolean') return String(value);

		return JSON.stringify(value);
	}

	function flatten(value: unknown, prefix = '', output: CsvRow = {}): CsvRow {
		if (Array.isArray(value)) {
			output[prefix || 'value'] = JSON.stringify(value);
			return output;
		}

		if (isObject(value)) {
			for (const [key, child] of Object.entries(value)) {
				const nextKey = prefix ? `${prefix}.${key}` : key;
				flatten(child, nextKey, output);
			}

			return output;
		}

		output[prefix || 'value'] = stringifyValue(value);
		return output;
	}

	function normalizeRows(value: unknown): CsvRow[] {
		if (Array.isArray(value)) {
			return value.map((item) => flatten(item));
		}

		return [flatten(value)];
	}

	function getKeys(rows: CsvRow[]): string[] {
		const keys = new SvelteSet<string>();

		for (const row of rows) {
			for (const key of Object.keys(row)) {
				keys.add(key);
			}
		}

		return [...keys];
	}

	function makeTableRows(rows: CsvRow[]): TableRow[] {
		return rows.map((row) => ({
			id: nextRowId++,
			values: row
		}));
	}

	function escapeCsvValue(value: string): string {
		const shouldQuote =
			value.includes(delimiter) || value.includes('"') || value.includes('\n') || value.includes('\r');

		if (!shouldQuote) return value;

		return `"${value.replaceAll('"', '""')}"`;
	}

	function buildCsv(rows: TableRow[], keys: string[]): string {
		if (keys.length === 0) return '';

		const header = keys.map(escapeCsvValue).join(delimiter);

		const body = rows.map((row) => keys.map((key) => escapeCsvValue(row.values[key] ?? '')).join(delimiter)).join('\n');

		return [header, body].filter(Boolean).join('\n');
	}

	function parseCellValue(value: string): unknown {
		const trimmed = value.trim();

		if (trimmed === '') return '';
		if (trimmed === 'true') return true;
		if (trimmed === 'false') return false;
		if (trimmed === 'null') return null;

		if (/^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/.test(trimmed)) {
			return Number(trimmed);
		}

		if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
			try {
				return JSON.parse(trimmed);
			} catch {
				return value;
			}
		}

		return value;
	}

	function assignPath(target: Record<string, unknown>, path: string, value: unknown) {
		const parts = path.split('.').filter(Boolean);

		if (parts.length === 0) return;

		let current = target;

		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];

			if (i === parts.length - 1) {
				current[part] = value;
				return;
			}

			if (!isObject(current[part])) {
				current[part] = {};
			}

			current = current[part] as Record<string, unknown>;
		}
	}

	function rowToJson(row: TableRow, keys: string[]): unknown {
		if (keys.length === 1 && keys[0] === 'value') {
			return parseCellValue(row.values.value ?? '');
		}

		const output: Record<string, unknown> = {};

		for (const key of keys) {
			assignPath(output, key, parseCellValue(row.values[key] ?? ''));
		}

		return output;
	}

	function buildJson(rows: TableRow[], keys: string[], root: JsonRoot): string {
		const data = rows.map((row) => rowToJson(row, keys));

		if (root === 'object') {
			return JSON.stringify(data[0] ?? {}, null, 4);
		}

		return JSON.stringify(data, null, 4);
	}

	function getSortValue(row: TableRow, key: string): number | string {
		const raw = row.values[key] ?? '';
		const trimmed = raw.trim();
		const numeric = Number(trimmed);

		if (trimmed !== '' && Number.isFinite(numeric)) {
			return numeric;
		}

		return trimmed.toLowerCase();
	}

	const parsed = $derived.by((): ParseResult => {
		if (!input.trim()) {
			return {
				ok: true,
				rows: [],
				keys: [],
				root: 'array'
			};
		}

		try {
			const value = JSON.parse(input);
			const normalizedRows = normalizeRows(value);

			return {
				ok: true,
				rows: normalizedRows,
				keys: getKeys(normalizedRows),
				root: Array.isArray(value) ? 'array' : 'object'
			};
		} catch {
			return {
				ok: false,
				error: 'Invalid JSON'
			};
		}
	});

	$effect(() => {
		if (!parsed.ok) {
			rows = [];
			keys = [];
			selectedColumn = '';
			sortColumn = '';
			sortDir = 'none';
			return;
		}

		rows = makeTableRows(parsed.rows);
		keys = parsed.keys;
		jsonRoot = parsed.root;
		selectedColumn = parsed.keys[0] ?? '';
		sortColumn = parsed.keys[0] ?? '';
		sortDir = 'none';
	});

	$effect(() => {
		if (keys.length === 0) {
			selectedColumn = '';
			sortColumn = '';
			sortDir = 'none';
			return;
		}

		if (!keys.includes(selectedColumn)) {
			selectedColumn = keys[0];
		}

		if (!keys.includes(sortColumn)) {
			sortColumn = keys[0];
			sortDir = 'none';
		}
	});

	const sortedRows = $derived.by(() => {
		if (!sortColumn || sortDir === 'none') {
			return rows;
		}

		return [...rows].sort((a, b) => {
			const av = getSortValue(a, sortColumn);
			const bv = getSortValue(b, sortColumn);

			if (av < bv) return sortDir === 'asc' ? -1 : 1;
			if (av > bv) return sortDir === 'asc' ? 1 : -1;

			return a.id - b.id;
		});
	});

	const csv = $derived.by(() => buildCsv(sortedRows, keys));
	const json = $derived.by(() => buildJson(sortedRows, keys, jsonRoot));

	const sortLabel = $derived.by(() => {
		if (!sortColumn || sortDir === 'none') return 'Sort';
		if (sortDir === 'asc') return 'Sort Asc';
		return 'Sort Desc';
	});

	const sortStatus = $derived.by(() => {
		if (!sortColumn || sortDir === 'none') return '-';
		return `${sortColumn} ${sortDir}`;
	});

	const status = $derived.by(() => {
		if (!parsed.ok) return 'Invalid JSON';

		if (!input.trim() && rows.length === 0 && keys.length === 0) {
			return '-';
		}

		return `${rows.length} row${rows.length === 1 ? '' : 's'}, ${keys.length} column${keys.length === 1 ? '' : 's'}`;
	});

	const error = $derived.by(() => (parsed.ok ? '-' : parsed.error));

	function updateCell(rowId: number, key: string, value: string) {
		rows = rows.map((row) =>
			row.id === rowId
				? {
						...row,
						values: {
							...row.values,
							[key]: value
						}
					}
				: row
		);
	}

	function addRow() {
		const activeKeys = keys.length ? keys : ['value'];

		if (keys.length === 0) {
			keys = activeKeys;
			selectedColumn = 'value';
			sortColumn = 'value';
		}

		if (jsonRoot === 'object' && rows.length >= 1) {
			jsonRoot = 'array';
		}

		rows = [
			...rows,
			{
				id: nextRowId++,
				values: Object.fromEntries(activeKeys.map((key) => [key, '']))
			}
		];
	}

	function deleteRow(rowId: number) {
		rows = rows.filter((row) => row.id !== rowId);
	}

	function addColumn() {
		const key = newColumn.trim();

		if (!key || keys.includes(key)) return;

		keys = [...keys, key];
		selectedColumn = key;
		sortColumn = key;
		sortDir = 'none';
		newColumn = '';

		rows = rows.map((row) => ({
			...row,
			values: {
				...row.values,
				[key]: ''
			}
		}));
	}

	function deleteColumn() {
		if (!selectedColumn) return;

		const keyToDelete = selectedColumn;
		const nextKeys = keys.filter((key) => key !== keyToDelete);

		keys = nextKeys;

		rows = rows.map((row) => {
			const values = { ...row.values };
			delete values[keyToDelete];

			return {
				...row,
				values
			};
		});

		if (sortColumn === keyToDelete) {
			sortColumn = nextKeys[0] ?? '';
			sortDir = 'none';
		}
	}

	function toggleSort() {
		if (!sortColumn) return;

		if (sortDir === 'none') {
			sortDir = 'asc';
			return;
		}

		if (sortDir === 'asc') {
			sortDir = 'desc';
			return;
		}

		sortDir = 'none';
	}

	function downloadCsv() {
		if (!csv) return;

		const blob = new Blob([csv], {
			type: 'text/csv;charset=utf-8'
		});

		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');

		link.href = url;
		link.download = 'data.csv';
		link.click();

		URL.revokeObjectURL(url);
	}
</script>

<div class="flex flex-col gap-4">
	<TextArea label="JSON Input" bind:value={input} placeholder="Paste JSON…" displayLines />

	<div class="flex flex-wrap items-end gap-2">
		<SelectInput label="Delimiter" bind:value={delimiter} options={delimiterOptions} />

		<SelectInput label="JSON Root" bind:value={jsonRoot} options={rootOptions} />

		<Button onClick={addRow} disabled={!parsed.ok}>Add Row</Button>

		<Button onClick={downloadCsv} disabled={!csv}>Download CSV</Button>

		<div class="flex items-center gap-2 pb-1 text-xs opacity-80">
			<span>Copy CSV</span>
			<CopyButton value={csv} />
		</div>

		<div class="flex items-center gap-2 pb-1 text-xs opacity-80">
			<span>Copy JSON</span>
			<CopyButton value={json} />
		</div>
	</div>

	<div class="flex flex-wrap items-end gap-2">
		<TextInput label="New Column" bind:value={newColumn} placeholder="column_name" />

		<Button onClick={addColumn} disabled={!newColumn.trim() || keys.includes(newColumn.trim())}>Add Column</Button>

		<SelectInput label="Column" bind:value={selectedColumn} options={columnOptions} placeholder="—" allowEmpty={true} />

		<Button onClick={deleteColumn} disabled={!selectedColumn}>Delete Column</Button>
	</div>

	<div class="flex flex-wrap items-end gap-2">
		<SelectInput label="Sort Column" bind:value={sortColumn} options={sortOptions} placeholder="—" allowEmpty={true} />

		<Button onClick={toggleSort} disabled={!sortColumn}>{sortLabel}</Button>
	</div>

	<div class="flex flex-col gap-1">
		<LabeledRow label="Status" value={status} group="json-to-csv" />
		<LabeledRow label="Sort" value={sortStatus} group="json-to-csv" />
		<LabeledRow label="Error" value={error} group="json-to-csv" />
	</div>

	{#if rows.length > 0 || keys.length > 0}
		<div class="overflow-auto">
			<table class="w-full border-collapse text-sm">
				<thead>
					<tr class="border-b border-text/50">
						{#each keys as key (key)}
							<th class="p-1 text-left font-medium">
								{key}
							</th>
						{/each}

						<th class="w-20 p-1 text-left font-medium">Actions</th>
					</tr>
				</thead>

				<tbody>
					{#if sortedRows.length === 0}
						<tr>
							<td colspan={keys.length + 1} class="py-4 text-center opacity-70"> No rows </td>
						</tr>
					{:else}
						{#each sortedRows as row (row.id)}
							<tr class="border-b border-text/25 transition hover:bg-accent-dark/20">
								{#each keys as key (key)}
									<td class="p-1">
										<input
											value={row.values[key] ?? ''}
											oninput={(e) => updateCell(row.id, key, (e.currentTarget as HTMLInputElement).value)}
											class="
												w-full
												min-w-32
												border
												border-transparent
												bg-transparent
												p-1
												transition
												outline-none
												focus:border-accent/50
												focus:bg-accent-dark/10
											"
										/>
									</td>
								{/each}

								<td class="p-1">
									<Button onClick={() => deleteRow(row.id)}>Delete</Button>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	{/if}
</div>
