<script lang="ts">
	import DataTable, { type Column } from '$lib/components/ui/data-table.svelte';
	import CheckboxInput from '$lib/components/ui/checkbox-input.svelte';

	import movesRaw from '$lib/data/pmd-blue/moves.json';
	import moveFlags from '$lib/data/pmd-blue/move-flags.json';

	import { makeFilter, sortNoneLast, unique } from '$lib/utils/filters.utils.svelte.js';
	import MoveCell from '$lib/components/pmd-blue/MoveCell.svelte';
	import FlagBadges from '$lib/components/pmd-blue/FlagBadges.svelte';

	const moves = movesRaw;
	const damageFlags = moveFlags.damageFlags;
	const otherFlags = moveFlags.otherFlags;

	const damageMap = Object.fromEntries(damageFlags.map((f) => [f.id, f.description]));
	const otherMap = Object.fromEntries(otherFlags.map((f) => [f.id, f.description]));

	function formatHits(move: { min_hits?: number; max_hits?: number; hit_count_mode?: string }) {
		const min = move.min_hits;
		const max = move.max_hits;
		const mode = move.hit_count_mode;

		if (min != null && max != null) return min === max ? `${min}` : `${min}-${max}`;
		if (min != null) return `${min}`;
		if (max != null) return `${max}`;
		return '—';
	}

	const rows = moves.map((m) => ({
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

	const columns: Column[] = [
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
					m.class === 'Physical' ? 'text-red-400' : m.class === 'Special' ? 'text-blue-400' : 'text-yellow-400';

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
					map: damageMap,
					variant: 'damage'
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
					map: otherMap,
					variant: 'other'
				}
			})
		},

		{ key: 'targets', label: 'Targets' }
	];

	const filterGroups = [
		{ name: 'Type', list: types, store: typeFilter },
		{ name: 'Class', list: classes, store: classFilter },
		{ name: 'Targets', list: targets, store: targetFilter },
		{ name: 'Hit Mode', list: hitModes, store: hitModeFilter }
	];
</script>

<div class="mb-4 flex flex-col justify-around gap-2 sm:flex-row">
	{#each filterGroups as group (group.name)}
		<div class="flex flex-row items-center gap-4 sm:flex-col sm:items-start sm:gap-1">
			{#each group.list as val (val)}
				<CheckboxInput label={val} bind:checked={group.store[val]} />
			{/each}
		</div>
	{/each}
</div>

<DataTable {columns} rows={filteredRows} pageSize={50} />
