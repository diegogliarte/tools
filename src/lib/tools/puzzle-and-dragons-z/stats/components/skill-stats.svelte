<script lang="ts">
	import { onMount } from 'svelte';
	import DataTable, { type Column } from '$lib/components/ui/data-table.svelte';
	import CheckboxChipGroup from '$lib/components/ui/checkbox-chip-group.svelte';
	import PadzSkillCell from '$lib/components/puzzle-and-dragons-z/PadzSkillCell.svelte';
	import { loadPadzSkills } from '$lib/data/puzzle-and-dragons-z/data';
	import {
		formatPadzNumber,
		formatPadzSkillCategory,
		getPadzSkillCost,
		getPadzSkillSearchText,
		type PadzSkill
	} from '$lib/utils/puzzle-and-dragons-z.utils';
	import { addMissingFilterOptions, unique } from '$lib/utils/filters.utils.svelte';

	let skills = $state<PadzSkill[]>([]);

	let categoryFilter = $state<Record<string, boolean>>({});

	onMount(async () => {
		skills = await loadPadzSkills();
	});

	const categoryOptions = $derived.by(() =>
		unique(skills.map((skill) => skill.category).filter(Boolean)).sort()
	);

	$effect(() => {
		addMissingFilterOptions(categoryFilter, categoryOptions);
	});

	const rows = $derived.by(() =>
		skills.filter((skill) => {
			const matchesCategory =
				!Object.values(categoryFilter).some(Boolean) || categoryFilter[skill.category];

			return matchesCategory;
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

	const columns: Column<PadzSkill>[] = [
		skillColumn,
		categoryColumn,
		{
			key: 'cost',
			label: 'Cost',
			width: '90px',
			render: (skill) => formatPadzNumber(getPadzSkillCost(skill))
		},
		{
			key: 'description',
			label: 'Description',
			width: '520px',
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
</div>

<DataTable {columns} {rows} pageSize={50} />