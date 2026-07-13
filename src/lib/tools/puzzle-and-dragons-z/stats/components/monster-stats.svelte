<script lang="ts">
	import { onMount } from 'svelte';
	import DataTable, { type Column } from '$lib/components/ui/data-table.svelte';
	import CheckboxChipGroup from '$lib/components/ui/checkbox-chip-group.svelte';
	import SelectInput from '$lib/components/ui/select-input.svelte';
	import PadzMonsterCell from '$lib/components/puzzle-and-dragons-z/PadzMonsterCell.svelte';
	import { loadPadzMonsters, loadPadzSkills } from '$lib/data/puzzle-and-dragons-z/data';
	import {
		formatPadzElement,
		formatPadzType,
		getPadzElementIcon,
		getPadzMonsterSearchText,
		getPadzStatTotal,
		getPadzTypeIcon,
		type PadzMonster,
		type PadzSkill,
		type PadzStatLevel
	} from '$lib/utils/puzzle-and-dragons-z.utils';
	import { addMissingFilterOptions, unique } from '$lib/utils/filters.utils.svelte';

	type MonsterTableRow = PadzMonster & {
		HP: number;
		ATK: number;
		DEF: number;
		TOTAL: number;
	};

	let monsters = $state<PadzMonster[]>([]);
	let skills = $state<PadzSkill[]>([]);
	let statLevel = $state<PadzStatLevel>('lvmax');

	let attributeFilter = $state<Record<string, boolean>>({});
	let typeFilter = $state<Record<string, boolean>>({});

	onMount(async () => {
		const [loadedMonsters, loadedSkills] = await Promise.all([loadPadzMonsters(), loadPadzSkills()]);

		monsters = loadedMonsters;
		skills = loadedSkills;
	});

	const skillsById = $derived(new Map(skills.map((skill) => [String(skill.id), skill])));

	const attributeOptions = $derived.by(() => unique(monsters.flatMap((monster) => monster.attributes ?? [])).sort());

	const typeOptions = $derived.by(() =>
		unique(monsters.map((monster) => monster.type).filter(Boolean) as string[]).sort()
	);

	$effect(() => {
		addMissingFilterOptions(attributeFilter, attributeOptions);
	});

	$effect(() => {
		addMissingFilterOptions(typeFilter, typeOptions);
	});

	const filteredRows = $derived.by(() =>
		monsters.filter((monster) => {
			const matchesAttribute =
				!Object.values(attributeFilter).some(Boolean) ||
				(monster.attributes ?? []).some((attribute) => attributeFilter[attribute]);

			const matchesType =
				!Object.values(typeFilter).some(Boolean) || (Boolean(monster.type) && typeFilter[monster.type as string]);

			return matchesAttribute && matchesType;
		})
	);

	const rows = $derived.by<MonsterTableRow[]>(() =>
		filteredRows.map((monster) => {
			const stats = monster.base_stats[statLevel];

			return {
				...monster,
				HP: stats.HP,
				ATK: stats.ATK,
				DEF: stats.DEF,
				TOTAL: getPadzStatTotal(stats)
			};
		})
	);

	const monsterColumn: Column<MonsterTableRow> = {
		key: 'name',
		label: 'Monster',
		width: '280px',
		searchValue: getPadzMonsterSearchText,
		renderComponent: (monster) => ({
			component: PadzMonsterCell,
			props: {
				monster,
				skillsById
			}
		})
	};

	const attributeColumn: Column<MonsterTableRow> = {
		key: 'attributes',
		label: 'Element',
		width: '140px',
		searchValue: (monster) => (monster.attributes ?? []).join(' '),
		render: (monster) => `
			<div class="flex items-center gap-1">
				${(monster.attributes ?? [])
					.map(
						(attribute) => `
							<img
								src="${getPadzElementIcon(attribute)}"
								alt="${formatPadzElement(attribute)}"
								title="${formatPadzElement(attribute)}"
								class="h-[1.5em] w-[1.5em] shrink-0"
							/>
						`
					)
					.join('')}
			</div>
		`
	};

	const typeColumn: Column<MonsterTableRow> = {
		key: 'type',
		label: 'Type',
		width: '170px',
		searchValue: (monster) => formatPadzType(monster.type),
		render: (monster) =>
			monster.type
				? `
					<div class="flex items-center gap-2">
						<img
							src="${getPadzTypeIcon(monster.type)}"
							alt="${formatPadzType(monster.type)}"
							title="${formatPadzType(monster.type)}"
							class="h-[1.5em] w-[1.5em] shrink-0"
						/>
						<span>${formatPadzType(monster.type)}</span>
					</div>
				`
				: '—'
	};

	const columns: Column<MonsterTableRow>[] = [
		monsterColumn,
		attributeColumn,
		typeColumn,
		{ key: 'level_cap', label: 'Max Lv', width: '90px' },
		{ key: 'HP', label: 'HP', width: '90px' },
		{ key: 'ATK', label: 'ATK', width: '90px' },
		{ key: 'DEF', label: 'DEF', width: '90px' },
		{ key: 'TOTAL', label: 'Total', width: '90px' }
	];
</script>

<div class="mb-4 grid gap-4 lg:grid-cols-[220px_1fr_1fr]">
	<SelectInput
		label="Stats"
		bind:value={statLevel}
		options={[
			{ value: 'lv1', label: 'Level 1' },
			{ value: 'lvmax', label: 'Max Level' }
		]}
	/>

	<CheckboxChipGroup
		label="Element"
		options={attributeOptions.map((attribute) => ({
			value: attribute,
			label: formatPadzElement(attribute)
		}))}
		bind:checked={attributeFilter}
	/>

	<CheckboxChipGroup
		label="Type"
		options={typeOptions.map((type) => ({
			value: type,
			label: formatPadzType(type)
		}))}
		bind:checked={typeFilter}
	/>
</div>

<DataTable {columns} {rows} pageSize={50} />
