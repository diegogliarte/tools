<script lang="ts">
	import { onMount } from 'svelte';
	import DataTable, { type Column } from '$lib/components/ui/data-table.svelte';
	import CheckboxChipGroup from '$lib/components/ui/checkbox-chip-group.svelte';
	import PadzSkillCell from '$lib/components/puzzle-and-dragons-z/PadzSkillCell.svelte';
	import { loadPadzSkills } from '$lib/data/puzzle-and-dragons-z/data';
	import {
		formatPadzNumber,
		formatPadzSkillCategory,
		getPadzElementIcon,
		getPadzSkillCost,
		getPadzSkillSearchText,
		type PadzSkill
	} from '$lib/utils/puzzle-and-dragons-z.utils';
	import { addMissingFilterOptions, unique } from '$lib/utils/filters.utils.svelte';

	let skills = $state<PadzSkill[]>([]);

	let categoryFilter = $state<Record<string, boolean>>({});
	let typeFilter = $state<Record<string, boolean>>({});
	let damageTypeFilter = $state<Record<string, boolean>>({});

	onMount(async () => {
		skills = await loadPadzSkills();
	});

	const categoryOptions = $derived.by(() =>
		unique(skills.map((skill) => skill.category).filter(Boolean) as string[]).sort()
	);

	const typeOptions = $derived.by(() =>
		unique(skills.map((skill) => skill.type).filter(Boolean) as string[]).sort()
	);

	const damageTypeOptions = $derived.by(() =>
		unique(skills.map((skill) => skill.damage_type).filter(Boolean) as string[]).sort()
	);

	$effect(() => {
		addMissingFilterOptions(categoryFilter, categoryOptions);
	});

	$effect(() => {
		addMissingFilterOptions(typeFilter, typeOptions);
	});

	$effect(() => {
		addMissingFilterOptions(damageTypeFilter, damageTypeOptions);
	});

	const rows = $derived.by(() =>
		skills.filter((skill) => {
			const matchesCategory =
				!Object.values(categoryFilter).some(Boolean) || categoryFilter[skill.category];

			const matchesType =
				!Object.values(typeFilter).some(Boolean) ||
				(Boolean(skill.type) && typeFilter[skill.type as string]);

			const matchesDamageType =
				!Object.values(damageTypeFilter).some(Boolean) ||
				(Boolean(skill.damage_type) && damageTypeFilter[skill.damage_type as string]);

			return matchesCategory && matchesType && matchesDamageType;
		})
	);

	const skillColumn: Column<PadzSkill> = {
		key: 'name',
		label: 'Skill',
		width: '280px',
		searchValue: getPadzSkillSearchText,
		renderComponent: (skill) => ({
			component: PadzSkillCell,
			props: {
				skill
			}
		})
	};

	const categoryColumn: Column<PadzSkill> = {
		key: 'category',
		label: 'Category',
		width: '120px',
		searchValue: (skill) => formatPadzSkillCategory(skill.category),
		render: (skill) => formatPadzSkillCategory(skill.category)
	};

	const typeColumn: Column<PadzSkill> = {
		key: 'type',
		label: 'Element',
		width: '130px',
		searchValue: (skill) => skill.type ?? '',
		render: (skill) =>
			skill.type
				? `
					<div class="flex items-center gap-2">
						<img
							src="${getPadzElementIcon(skill.type)}"
							alt="${skill.type}"
							title="${skill.type}"
							class="h-[1.5em] w-[1.5em] shrink-0"
						/>
						<span>${skill.type}</span>
					</div>
				`
				: '—'
	};

	const columns: Column<PadzSkill>[] = [
		skillColumn,
		categoryColumn,
		typeColumn,
		{
			key: 'damage_type',
			label: 'Damage',
			width: '120px',
			render: (skill) => formatPadzNumber(skill.damage_type)
		},
		{
			key: 'cost',
			label: 'Cost',
			width: '90px',
			render: (skill) => formatPadzNumber(getPadzSkillCost(skill))
		},
		{
			key: 'power',
			label: 'Power',
			width: '90px',
			render: (skill) => formatPadzNumber(skill.power)
		},
		{
			key: 'accuracy',
			label: 'Acc.',
			width: '90px',
			render: (skill) => formatPadzNumber(skill.accuracy)
		},
		{
			key: 'hit_count',
			label: 'Hits',
			width: '90px',
			render: (skill) => formatPadzNumber(skill.hit_count)
		},
		{
			key: 'description',
			label: 'Description',
			width: '420px',
			searchValue: (skill) => skill.description ?? '',
			render: (skill) => skill.description ?? '—'
		}
	];
</script>

<div class="mb-4 grid gap-4 lg:grid-cols-3">
	<CheckboxChipGroup
		label="Category"
		options={categoryOptions.map((category) => ({
			value: category,
			label: formatPadzSkillCategory(category)
		}))}
		bind:checked={categoryFilter}
	/>

	<CheckboxChipGroup
		label="Element"
		options={typeOptions.map((type) => ({
			value: type,
			label: type
		}))}
		bind:checked={typeFilter}
	/>

	<CheckboxChipGroup
		label="Damage Type"
		options={damageTypeOptions.map((damageType) => ({
			value: damageType,
			label: damageType
				.split(/[_-]+/g)
				.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
				.join(' ')
		}))}
		bind:checked={damageTypeFilter}
	/>
</div>

<DataTable {columns} {rows} pageSize={50} />