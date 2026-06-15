<script lang="ts">
	import DataTable, { type Column } from '$lib/components/ui/data-table.svelte';
	import CheckboxChipGroup from '$lib/components/ui/checkbox-chip-group.svelte';

	import movesRaw from '$lib/data/pmd-blue/moves.json';
	import moveFlags from '$lib/data/pmd-blue/move-flags.json';

	import { makeFilter, sortNoneLast, unique } from '$lib/utils/filters.utils.svelte.js';
	import MoveCell from '$lib/components/pmd-blue/MoveCell.svelte';
	import FlagBadges from '$lib/components/pmd-blue/FlagBadges.svelte';
	import type { Move } from '$lib/components/pmd-blue/MoveModal.svelte';

	type MoveRow = Move & {
		hitModeDisplay: string;
		hitsDisplay: string;
	};

	const moves = movesRaw as Move[];
	const damageFlags = moveFlags.damageFlags;
	const otherFlags = moveFlags.otherFlags;

	const damageMap = Object.fromEntries(damageFlags.map((f) => [f.id, f.description]));
	const otherMap = Object.fromEntries(otherFlags.map((f) => [f.id, f.description]));

	function formatHits(move: {
		min_hits?: number | null;
		max_hits?: number | null;
		hit_count_mode?: string | null;
	}) {
		const min = move.min_hits;
		const max = move.max_hits;

		if (min != null && max != null) return min === max ? `${min}` : `${min}-${max}`;
		if (min != null) return `${min}`;
		if (max != null) return `${max}`;
		return '—';
	}

	const rows: MoveRow[] = moves.map((m) => ({
		...m,
		type: m.type?.trim() || 'None',
		class: m.class?.trim() || 'None',
		targets: m.targets?.trim() || 'None',
		hitModeDisplay: m.hit_count_mode?.trim() || 'None',
		hitsDisplay: formatHits(m)
	}));

	const types = sortNoneLast(unique(rows.map((r) => r.type)));
	const classes = sortNoneLast(unique(rows.map((r) => r.class)));
	const targets = sortNoneLast(unique(rows.map((r) => r.targets)));
	const hitModes = sortNoneLast(unique(rows.map((r) => r.hitModeDisplay)));

	let typeFilter = $state(makeFilter(types));
	let classFilter = $state(makeFilter(classes));
	let targetFilter = $state(makeFilter(targets));
	let hitModeFilter = $state(makeFilter(hitModes));

	let filteredRows = $derived.by(() => {
		const allowedTypes = Object.keys(typeFilter).filter((k) => typeFilter[k]);
		const allowedClasses = Object.keys(classFilter).filter((k) => classFilter[k]);
		const allowedTargets = Object.keys(targetFilter).filter((k) => targetFilter[k]);
		const allowedHitModes = Object.keys(hitModeFilter).filter((k) => hitModeFilter[k]);

		return rows.filter(
			(r) =>
				(allowedTypes.length ? allowedTypes.includes(r.type) : true) &&
				(allowedClasses.length ? allowedClasses.includes(r.class) : true) &&
				(allowedTargets.length ? allowedTargets.includes(r.targets) : true) &&
				(allowedHitModes.length ? allowedHitModes.includes(r.hitModeDisplay) : true)
		);
	});

	const columns: Column<MoveRow>[] = [
		{
			key: 'name',
			label: 'Name',
			width: '200px',
			searchValue: (m) =>
				`${m.name} ${m.type} ${m.class} ${m.hit_count_mode ?? ''} ${m.min_hits ?? ''} ${m.max_hits ?? ''}`,
			renderComponent: (m) => ({
				component: MoveCell,
				props: { move: m }
			})
		},
		{ key: 'type', label: 'Type' },
		{
			key: 'class',
			label: 'Class',
			render: (m) => {
				const color =
					m.class === 'Physical'
						? 'text-red-400'
						: m.class === 'Special'
							? 'text-blue-400'
							: 'text-yellow-400';

				return `<span class="${color}">${m.class}</span>`;
			}
		},
		{ key: 'power', label: 'Power' },
		{ key: 'maxPP', label: 'PP' },
		{ key: 'acc1', label: 'Acc 1' },
		{ key: 'acc2', label: 'Acc 2' },
		{ key: 'crit', label: 'Crit' },
		{ key: 'hitsDisplay', label: 'Hits' },
		{ key: 'hitModeDisplay', label: 'Hit Mode' },

		{
			key: 'damageFlags',
			label: 'Damage Flags',
			renderComponent: (m) => ({
				component: FlagBadges,
				props: {
					flags: m.damageFlags,
					map: damageMap
				}
			})
		},
		{
			key: 'otherFlags',
			label: 'Other Flags',
			renderComponent: (m) => ({
				component: FlagBadges,
				props: {
					flags: m.otherFlags,
					map: otherMap
				}
			})
		},

		{ key: 'targets', label: 'Targets' }
	];
</script>

<div class="flex flex-col gap-4">
	<div class="grid gap-4 lg:grid-cols-2">
		<CheckboxChipGroup label="Type" options={types} bind:checked={typeFilter} />

		<CheckboxChipGroup label="Class" options={classes} bind:checked={classFilter} />

		<CheckboxChipGroup label="Targets" options={targets} bind:checked={targetFilter} />

		<CheckboxChipGroup label="Hit Mode" options={hitModes} bind:checked={hitModeFilter} />
	</div>
</div>

<DataTable {columns} rows={filteredRows} pageSize={50} />