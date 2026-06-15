<script lang="ts">
	import DataTable, { type Column } from '$lib/components/ui/data-table.svelte';
	import CheckboxChipGroup from '$lib/components/ui/checkbox-chip-group.svelte';

	import skillsRaw from '$lib/data/digimon-story-ts/skills.json';
	import { makeFilter, unique } from '$lib/utils/filters.utils.svelte.js';
	import {
		type Skill,
		getSkillIcon,
		type SkillCategory,
		parseSkillTarget,
		type SkillTarget,
		formatSkillTarget
	} from '$lib/utils/digimon-story-ts.utils';
	import { capitalize } from '$lib/utils/text.utils';

	const skills: Skill[] = (skillsRaw as any[]).map((s) => ({
		...s,
		category: capitalize(s.category) as SkillCategory,
		damage_type: capitalize(s.damage_type) as 'physical' | 'magic' | undefined,
		type: capitalize(s.type),
		name: capitalize(s.name),
		target: parseSkillTarget(s.description)
	}));

	const categories = unique(skills.map((s) => s.category));
	const types = unique(skills.map((s) => s.type));
	const damageTypes = unique(
		skills.map((s) => s.damage_type).filter((d): d is 'magic' | 'physical' => d !== undefined)
	);
	const targets = unique(skills.map((s) => s.target).filter((t): t is SkillTarget => t !== 'unknown'));

	const targetOptions = targets.map((target) => ({
		value: target,
		label: formatSkillTarget(target)
	}));

	let categoryFilter = $state(makeFilter(categories));
	let typeFilter = $state(makeFilter(types));
	let damageFilter = $state(makeFilter(damageTypes));
	let targetFilter = $state(makeFilter(targets));

	const filteredRows = $derived.by(() => {
		const catSel = Object.keys(categoryFilter).filter((k) => categoryFilter[k]);
		const typeSel = Object.keys(typeFilter).filter((k) => typeFilter[k]);
		const dmgSel = Object.keys(damageFilter).filter((k) => damageFilter[k]);
		const tgtSel = Object.keys(targetFilter).filter((k) => targetFilter[k]);

		return skills.filter(
			(s) =>
				(catSel.length ? catSel.includes(s.category) : true) &&
				(typeSel.length ? typeSel.includes(s.type) : true) &&
				(dmgSel.length ? dmgSel.includes(s.damage_type ?? '') : true) &&
				(tgtSel.length ? tgtSel.includes(s.target) : true)
		);
	});

	const nameColumn: Column<Skill> = {
		key: 'name',
		label: 'Skill',
		width: '260px',
		searchValue: (s) => `${s.name} ${s.type} ${s.category}`,
		render: (s) => `
			<div class="flex items-center gap-2">
				<img
					src="${getSkillIcon(s.type)}"
					alt="${s.type}"
					class="h-[1.5em] w-[1.5em] shrink-0"
				/>
				<span class="font-medium">${s.name}</span>
			</div>
		`
	};

	const categoryColumn: Column<Skill> = {
		key: 'category',
		label: 'Cat',
		sortValue: (s) => s.category
	};

	const damageColumn: Column<Skill> = {
		key: 'damage_type',
		label: 'DMG',
		sortValue: (s) => s.damage_type ?? '',
		render: (s) => s.damage_type ?? '—'
	};

	const powerColumn: Column<Skill> = {
		key: 'power',
		label: 'Power',
		sortValue: (s) => s.power ?? -1,
		render: (s) => (s.power !== undefined ? String(s.power) : '—')
	};

	const spColumn: Column<Skill> = {
		key: 'sp_cost',
		label: 'SP',
		sortValue: (s) => s.sp_cost ?? -1,
		render: (s) => (s.sp_cost !== undefined ? String(s.sp_cost) : '—')
	};

	const accuracyColumn: Column<Skill> = {
		key: 'accuracy',
		label: 'Acc',
		sortValue: (s) => s.accuracy ?? -1,
		render: (s) => (s.accuracy !== undefined ? `${s.accuracy}%` : '—')
	};

	const targetColumn: Column<Skill> = {
		key: 'target',
		label: 'Target',
		sortValue: (s) => s.target,
		render: (s) => formatSkillTarget(s.target)
	};

	const hitCountColumn: Column<Skill> = {
		key: 'hit_count',
		label: 'Hit Count',
		sortValue: (s) => s.hit_count,
		render: (s) => (s.hit_count !== undefined ? s.hit_count : '—')
	};

	const columns = $derived([
		nameColumn,
		categoryColumn,
		targetColumn,
		damageColumn,
		powerColumn,
		hitCountColumn,
		spColumn,
		accuracyColumn
	]);
</script>

<div class="flex flex-col gap-4">
	<div class="grid gap-4 lg:grid-cols-2">
		<CheckboxChipGroup
			label="Categories"
			options={categories}
			bind:checked={categoryFilter}
		/>

		<CheckboxChipGroup label="Types" options={types} bind:checked={typeFilter} />

		<CheckboxChipGroup
			label="Damage Types"
			options={damageTypes}
			bind:checked={damageFilter}
		/>

		<CheckboxChipGroup
			label="Targets"
			options={targetOptions}
			bind:checked={targetFilter}
		/>
	</div>
</div>

<DataTable {columns} rows={filteredRows} pageSize={50} />