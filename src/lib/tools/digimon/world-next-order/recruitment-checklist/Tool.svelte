<script lang="ts">
	import { onMount } from 'svelte';
	import CheckboxChipGroup from '$lib/components/ui/checkbox-chip-group.svelte';
	import DataTable, { type Column } from '$lib/components/ui/data-table.svelte';
	import NumberInput from '$lib/components/ui/number-input.svelte';
	import { loadDigimon } from '$lib/data/digimon-story-ts/data';
	import { createLocalStorageState } from '$lib/states/local-storage.svelte';
	import recruitmentData from '$lib/data/digimon-world-next-order/recruitment.json';
	import type { Digimon } from '$lib/utils/digimon-story-ts.utils';
	import RecruitmentDigimonCell from '$lib/components/digimon-world-next-order/RecruitmentDigimonCell.svelte';

	type Facility =
		| 'dojo'
		| 'colosseum'
		| 'lab'
		| 'itemShop'
		| 'fields'
		| 'sender'
		| 'restaurant'
		| 'hospital'
		| 'warehouse';

	type Method =
		| { t: 'battle'; lv?: number; text?: string }
		| { t: 'auto'; text: string }
		| { t: 'give'; text: string }
		| { t: 'buy'; text: string }
		| { t: 'talk'; text: string }
		| { t: 'steps'; lv?: number; levels?: number[]; text: string };

	type RecruitmentEntry = {
		id: string;
		name: string;
		area: string;
		subarea: string;
		floatiaLocation: string;
		service: string;
		method: Method;
		requirements?: string[];
	};

	type Status = 'Recruited' | 'Available' | 'Step' | 'Blocked';

	type Row = RecruitmentEntry & {
		status: Status;
		how: string;
		requirementsText: string;
		requirementLabels: string[];
		blockerLabels: string[];
		blockers: string;
		digimon?: Digimon;
	};

	const entries = recruitmentData as RecruitmentEntry[];
	let timeStrangerDigimon = $state<Digimon[]>([]);

	const facilityLabels: Record<Facility, string> = {
		dojo: 'Dojo',
		colosseum: 'Colosseum',
		lab: 'Lab',
		itemShop: 'Item Shop',
		fields: 'Fields',
		sender: 'Sender',
		restaurant: 'Restaurant',
		hospital: 'Hospital',
		warehouse: 'Warehouse'
	};

	const flagLabels: Record<string, string> = {
		cityUpgrade: 'City upgrade',
		postgame: 'Postgame',
		megaPartner: 'Mega partner',
		hp8000: '8,000+ HP'
	};

	const defaults = {
		recruited: {} as Record<string, boolean>,
		chapter: 1,
		flags: {} as Record<string, boolean>,
		facilities: {
			dojo: 0,
			colosseum: 0,
			lab: 0,
			itemShop: 0,
			fields: 0,
			sender: 0,
			restaurant: 0,
			hospital: 0,
			warehouse: 0
		} as Record<Facility, number>
	};

	const progress = createLocalStorageState(defaults);

	onMount(async () => {
		timeStrangerDigimon = await loadDigimon();
	});

	const digimonByName = $derived(new Map(timeStrangerDigimon.map((digimon) => [digimon.name.toLowerCase(), digimon])));
	const recruitableNames = entries.map((entry) => entry.name).sort((a, b) => b.length - a.length);

	const flags = Array.from(
		new Set(entries.flatMap((entry) => entry.requirements ?? []).filter((req) => req.startsWith('flag:')))
	)
		.map((req) => req.slice('flag:'.length))
		.map((flag) => ({
			value: flag,
			label: flagLabels[flag] ?? flag
		}));

	function isRecruited(id: string) {
		return !!progress.recruited[id];
	}

	function setRecruited(id: string, value: boolean) {
		progress.recruited = {
			...progress.recruited,
			[id]: value
		};
	}

	function parseFacility(req: string): { facility: Facility; level: number } | null {
		const [, facility, level] = req.split(':');
		if (!facility || !level) return null;

		return {
			facility: facility as Facility,
			level: Number(level)
		};
	}

	function requirementMet(req: string): boolean {
		if (req.startsWith('recruit:')) return isRecruited(req.slice('recruit:'.length));
		if (req.startsWith('chapter:'))
			return !!progress.flags.postgame || progress.chapter >= Number(req.slice('chapter:'.length));
		if (req.startsWith('flag:')) return !!progress.flags[req.slice('flag:'.length)];
		if (req.startsWith('facility:')) {
			const parsed = parseFacility(req);
			return parsed ? (progress.facilities[parsed.facility] ?? 0) >= parsed.level : false;
		}

		return false;
	}

	function isManualRequirement(req: string) {
		return req.startsWith('manual:');
	}

	function requirementLabel(req: string) {
		if (req.startsWith('recruit:')) {
			const id = req.slice('recruit:'.length);
			const entry = entries.find((item) => item.id === id);
			return `Recruit ${entry?.name ?? id}`;
		}

		if (req.startsWith('chapter:')) return `Chapter ${req.slice('chapter:'.length)}`;
		if (req.startsWith('manual:')) return req.slice('manual:'.length);
		if (req.startsWith('flag:')) {
			const flag = req.slice('flag:'.length);
			return flagLabels[flag] ?? flag;
		}

		if (req.startsWith('facility:')) {
			const parsed = parseFacility(req);
			if (!parsed) return req;

			return `${facilityLabels[parsed.facility] ?? parsed.facility} Lv ${parsed.level}`;
		}

		return req;
	}

	function hardBlockers(entry: RecruitmentEntry) {
		return (entry.requirements ?? []).filter((req) => !isManualRequirement(req) && !requirementMet(req));
	}

	function manualRequirements(entry: RecruitmentEntry) {
		return (entry.requirements ?? []).filter(isManualRequirement);
	}

	function status(entry: RecruitmentEntry): Status {
		if (isRecruited(entry.id)) return 'Recruited';
		if (hardBlockers(entry).length) return 'Blocked';
		if (manualRequirements(entry).length) return 'Step';
		return 'Available';
	}

	function statusClass(value: Status) {
		if (value === 'Recruited') return 'text-green-300';
		if (value === 'Available') return 'text-accent';
		if (value === 'Step') return 'text-yellow-200';
		return 'text-white/50';
	}

	function escapeHtml(value: string) {
		return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}

	function escapeRegex(value: string) {
		return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}

	function accentEscaped(value: string) {
		return `<span class="text-accent">${value}</span>`;
	}

	function accentKnownDigimonNames(value: string) {
		let rendered = escapeHtml(value);

		for (const name of recruitableNames) {
			const escapedName = escapeHtml(name);
			rendered = rendered.replace(new RegExp(`\\b${escapeRegex(escapedName)}\\b`, 'g'), accentEscaped(escapedName));
		}

		return rendered;
	}

	function accentRecruitmentText(value: string) {
		return accentKnownDigimonNames(value);
	}

	function renderRequirementLabel(label: string) {
		return accentKnownDigimonNames(label);
	}

	function renderRequirements(labels: string[]) {
		if (!labels.length) return '—';

		return labels.map(renderRequirementLabel).join('<span class="opacity-50">, </span>');
	}

	function methodText(entry: RecruitmentEntry) {
		const { method } = entry;

		if (method.t === 'battle') return method.text ?? `Battle Lv ${method.lv ?? '?'}`;
		if (method.t === 'auto') return 'Joins automatically';
		return method.text;
	}

	const rows = $derived.by<Row[]>(() =>
		entries.map((entry) => {
			const req = entry.requirements ?? [];
			const blockers = hardBlockers(entry).map(requirementLabel);
			const requirementLabels = req.map(requirementLabel);

			return {
				...entry,
				status: status(entry),
				how: methodText(entry),
				requirementLabels,
				requirementsText: requirementLabels.join(', '),
				blockerLabels: blockers,
				blockers: blockers.join(', '),
				digimon: digimonByName.get(entry.name.toLowerCase())
			};
		})
	);

	const recruitedCount = $derived(entries.filter((entry) => isRecruited(entry.id)).length);
	const mainEntries = $derived(entries.filter((entry) => !(entry.requirements ?? []).includes('flag:postgame')));
	const mainRecruitedCount = $derived(mainEntries.filter((entry) => isRecruited(entry.id)).length);
	const availableCount = $derived(rows.filter((row) => row.status === 'Available').length);

	const columns: Column<Row>[] = [
		{
			key: 'name',
			label: 'Digimon',
			width: '15%',
			searchValue: (row) => [row.name, row.status, row.requirementsText, row.blockers].join(' '),
			renderComponent: (row) => ({
				component: RecruitmentDigimonCell,
				props: {
					name: row.name,
					digimon: row.digimon,
					checked: isRecruited(row.id)
				}
			})
		},
		{
			key: 'status',
			label: 'Status',
			width: '8%',
			sortValue: (row) => ['Available', 'Step', 'Blocked', 'Recruited'].indexOf(row.status),
			render: (row) => `<span class="${statusClass(row.status)}">${row.status}</span>`
		},
		{
			key: 'area',
			label: 'Area',
			width: '15%',
			sortValue: (row) => `${row.area} ${row.subarea}`,
			render: (row) => `${escapeHtml(row.area)}<div class="text-xs opacity-60">${escapeHtml(row.subarea)}</div>`
		},
		{
			key: 'how',
			label: 'Recruitment',
			width: '30%',
			searchValue: (row) => [row.how, row.requirementsText].join(' '),
			render: (row) => {
				const labels = row.blockerLabels.length ? row.blockerLabels : row.requirementLabels;
				const requirementPrefix = row.blockerLabels.length ? 'Blocked by' : row.status === 'Step' ? 'Do' : 'Needs';

				return [
					accentRecruitmentText(row.how),
					labels.length
						? `<div class="mt-0.5 text-xs"><span class="opacity-60">${requirementPrefix}</span> ${renderRequirements(labels)}</div>`
						: ''
				].join('');
			}
		},
		{
			key: 'floatiaLocation',
			label: 'Floatia',
			width: '25%',
			searchValue: (row) => [row.floatiaLocation, row.service].join(' '),
			render: (row) =>
				`${escapeHtml(row.floatiaLocation)}<div class="mt-0.5 text-xs opacity-70">${escapeHtml(row.service)}</div>`
		}
	];

	function toggleRow(row: Row) {
		if (row.status === 'Blocked') return;

		setRecruited(row.id, !isRecruited(row.id));
	}
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-wrap gap-x-6 gap-y-1 text-sm">
		<div><span class="opacity-60">Total</span> {recruitedCount}/{entries.length}</div>
		<div><span class="opacity-60">Main</span> {mainRecruitedCount}/{mainEntries.length}</div>
		<div><span class="opacity-60">Available</span> {availableCount}</div>
	</div>

	<div class="grid gap-4 lg:grid-cols-[9rem_1fr]">
		<NumberInput label="Chapter" bind:value={progress.chapter} min={1} max={5} step={1} />

		<div class="grid gap-3 xl:grid-cols-[1fr_18rem]">
			<div class="grid grid-cols-3 gap-2 md:grid-cols-5 lg:grid-cols-9">
				{#each Object.entries(facilityLabels) as [facility, label] (facility)}
					<NumberInput {label} bind:value={progress.facilities[facility as Facility]} min={1} max={5} step={1} />
				{/each}
			</div>

			<CheckboxChipGroup
				label="Progress"
				options={flags}
				bind:checked={progress.flags}
				persist={false}
				showActions={false}
			/>
		</div>
	</div>

	<DataTable {columns} {rows} pageSize={50} onRowClick={toggleRow} />
</div>
