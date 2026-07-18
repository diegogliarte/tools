<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import Modal from '$lib/components/ui/modal.svelte';
	import PadzMonsterIcon from '$lib/components/puzzle-and-dragons-z/PadzMonsterIcon.svelte';
	import { loadPadzMonsters, loadPadzSkills } from '$lib/data/puzzle-and-dragons-z/data';
	import { openModal } from '$lib/states/modal.svelte';
	import {
		findPadzSkillByRef,
		formatPadzElement,
		formatPadzNumber,
		formatPadzSkillCategory,
		formatPadzType,
		getPadzElementIcon,
		getPadzMonsterIcon,
		getPadzSkillCost,
		getPadzStatTotal,
		getPadzTypeIcon,
		type PadzMonster,
		type PadzSkill
	} from '$lib/utils/puzzle-and-dragons-z.utils';

	interface Props {
		monster: PadzMonster;
		onClose?: () => void;
	}

	type EvolutionNode = {
		monster: PadzMonster;
		children: EvolutionNode[];
	};

	let { monster, onClose }: Props = $props();

	let monsters = $state<PadzMonster[]>([]);
	let skills = $state<PadzSkill[]>([]);

	onMount(async () => {
		const [loadedMonsters, loadedSkills] = await Promise.all([loadPadzMonsters(), loadPadzSkills()]);

		monsters = loadedMonsters;
		skills = loadedSkills;
	});

	const monsterById = $derived(new Map(monsters.map((m) => [m.id, m])));

	const activeSkill = $derived.by(() => findPadzSkillByRef(skills, monster.skills?.active, 'active'));

	const leaderSkill = $derived.by(() => findPadzSkillByRef(skills, monster.skills?.leader, 'leader'));

	const evolutionRoots = $derived.by(() => {
		if (!monster || !monsters.length) return [];

		const familyIds = getEvolutionFamilyIds(monster);

		const roots = Array.from(familyIds)
			.map((id) => monsterById.get(id))
			.filter((m): m is PadzMonster => Boolean(m))
			.filter((m) => !(m.pre_evolutions ?? []).some((id) => familyIds.has(id)))
			.sort((a, b) => a.id - b.id);

		return (roots.length ? roots : [monster]).map((root) => buildEvolutionNode(root, familyIds));
	});

	function getEvolutionFamilyIds(target: PadzMonster) {
		const visited = new SvelteSet<number>();
		const queue = [target.id];

		while (queue.length) {
			const id = queue.shift();

			if (id == null || visited.has(id)) continue;

			const current = monsterById.get(id);
			if (!current) continue;

			visited.add(id);

			for (const preId of current.pre_evolutions ?? []) {
				if (!visited.has(preId)) queue.push(preId);
			}

			for (const evoId of current.evolutions ?? []) {
				if (!visited.has(evoId)) queue.push(evoId);
			}
		}

		return visited;
	}

	function buildEvolutionNode(current: PadzMonster, familyIds: Set<number>, path: number[] = []): EvolutionNode {
		if (path.includes(current.id)) {
			return {
				monster: current,
				children: []
			};
		}

		const nextPath = [...path, current.id];

		const children = (current.evolutions ?? [])
			.filter((id) => familyIds.has(id))
			.map((id) => monsterById.get(id))
			.filter((m): m is PadzMonster => Boolean(m))
			.sort((a, b) => a.id - b.id)
			.map((child) => buildEvolutionNode(child, familyIds, nextPath));

		return {
			monster: current,
			children
		};
	}

	async function openSkill(skill?: PadzSkill | null) {
		if (!skill) return;

		const { default: PadzSkillModal } = await import('$lib/components/puzzle-and-dragons-z/PadzSkillModal.svelte');

		openModal(PadzSkillModal, { skill });
	}
</script>

{#snippet evolutionMonsterCard(nodeMonster: PadzMonster)}
	<div class="flex w-20 flex-col items-center text-center">
		<div
			class="
				aspect-square h-14 w-14
				{nodeMonster.id === monster.id ? 'border-2 border-accent' : ''}
			"
		>
			{#if nodeMonster.id === monster.id}
				<img src={getPadzMonsterIcon(nodeMonster.id)} alt={nodeMonster.name} class="h-full w-full object-cover" />
			{:else}
				<PadzMonsterIcon monster={nodeMonster} variant="viewer" />
			{/if}
		</div>

		<div class="mt-1 w-full truncate {nodeMonster.id === monster.id ? 'font-bold' : ''}">
			{nodeMonster.name}
		</div>

		<div class="opacity-70">#{nodeMonster.id}</div>
	</div>
{/snippet}

{#snippet evolutionNode(node: EvolutionNode)}
	<div class="flex items-center">
		{@render evolutionMonsterCard(node.monster)}

		{#if node.children.length}
			<div class="mx-3 h-px w-8 shrink-0 bg-neutral-600"></div>

			<div class="flex flex-col gap-3 border-l border-neutral-700 pl-3">
				{#each node.children as child (`${node.monster.id}-${child.monster.id}`)}
					{@render evolutionNode(child)}
				{/each}
			</div>
		{/if}
	</div>
{/snippet}

<Modal title={monster?.name} {onClose}>
	{#if monster}
		<div class="mb-4 flex gap-4">
			<div class="w-20">
				<img src={getPadzMonsterIcon(monster.id)} alt={monster.name} class="aspect-square h-full w-full object-cover" />
			</div>

			<div class="flex flex-col gap-1 text-xs">
				<div>ID: #{monster.id}</div>

				{#if monster.level_cap}
					<div>Level Cap: {monster.level_cap}</div>
				{/if}

				{#if monster.attributes?.length}
					<div class="flex items-center gap-1">
						Element:
						{#each monster.attributes as attribute (attribute)}
							<img
								src={getPadzElementIcon(attribute)}
								alt={formatPadzElement(attribute)}
								title={formatPadzElement(attribute)}
								class="h-[1.4em] w-[1.4em]"
							/>
						{/each}
					</div>
				{/if}

				{#if monster.type}
					<div class="flex items-center gap-1">
						Type:
						<img
							src={getPadzTypeIcon(monster.type)}
							alt={formatPadzType(monster.type)}
							title={formatPadzType(monster.type)}
							class="h-[1.4em] w-[1.4em]"
						/>
						<span class="text-accent">{formatPadzType(monster.type)}</span>
					</div>
				{/if}
			</div>
		</div>

		{#if monster.description}
			<h3 class="mb-1 font-bold">Description</h3>
			<p class="mb-4 text-xs opacity-80">{monster.description}</p>
		{/if}

		{#if activeSkill || leaderSkill}
			<h3 class="mb-2 font-bold">Skills</h3>

			<div class="mb-4 grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
				{#if activeSkill}
					<div>
						<div class="mb-1 font-semibold">Active Skill</div>

						<button
							type="button"
							class="cursor-pointer text-left text-accent hover:underline"
							onclick={() => openSkill(activeSkill)}
						>
							{activeSkill.name}
						</button>

						<div class="opacity-70">
							{formatPadzSkillCategory(activeSkill.category)}
							{#if getPadzSkillCost(activeSkill) !== null}
								· Cost {formatPadzNumber(getPadzSkillCost(activeSkill))}
							{/if}
						</div>

						{#if activeSkill.description}
							<div class="mt-1 opacity-70">{activeSkill.description}</div>
						{/if}
					</div>
				{/if}

				{#if leaderSkill}
					<div>
						<div class="mb-1 font-semibold">Leader Skill</div>

						<button
							type="button"
							class="cursor-pointer text-left text-accent hover:underline"
							onclick={() => openSkill(leaderSkill)}
						>
							{leaderSkill.name}
						</button>

						<div class="opacity-70">{formatPadzSkillCategory(leaderSkill.category)}</div>

						{#if leaderSkill.description}
							<div class="mt-1 opacity-70">{leaderSkill.description}</div>
						{/if}
					</div>
				{/if}
			</div>
		{/if}

		{#if evolutionRoots.length}
			<h3 class="mb-1 font-bold">Evolution Tree</h3>

			<div class="mb-4 overflow-x-auto rounded border border-neutral-700/70 p-3 text-xs">
				<div class="flex min-w-max flex-col gap-4">
					{#each evolutionRoots as root (root.monster.id)}
						{@render evolutionNode(root)}
					{/each}
				</div>
			</div>
		{/if}

		{#if monster.evolution_materials?.length}
			<h3 class="mb-1 font-bold">Evolution Materials</h3>

			<ul class="mb-4 list-inside list-disc text-xs">
				{#each monster.evolution_materials as material (`${material.id}-${material.name}`)}
					<li>{material.name} ×{material.count}</li>
				{/each}
			</ul>
		{/if}

		<h3 class="mb-2 font-bold">Stats</h3>

		<div class="border text-xs">
			<table class="w-full text-left">
				<thead class="bg-neutral-900">
					<tr>
						<th class="p-1">Level</th>
						<th class="p-1">HP</th>
						<th class="p-1">ATK</th>
						<th class="p-1">DEF</th>
						<th class="p-1">Total</th>
					</tr>
				</thead>

				<tbody>
					<tr>
						<td class="p-1">Lv 1</td>
						<td class="p-1">{monster.base_stats.lv1.HP}</td>
						<td class="p-1">{monster.base_stats.lv1.ATK}</td>
						<td class="p-1">{monster.base_stats.lv1.DEF}</td>
						<td class="p-1">{getPadzStatTotal(monster.base_stats.lv1)}</td>
					</tr>

					<tr>
						<td class="p-1">Lv {formatPadzNumber(monster.level_cap ?? 'Max')}</td>
						<td class="p-1">{monster.base_stats.lvmax.HP}</td>
						<td class="p-1">{monster.base_stats.lvmax.ATK}</td>
						<td class="p-1">{monster.base_stats.lvmax.DEF}</td>
						<td class="p-1">{getPadzStatTotal(monster.base_stats.lvmax)}</td>
					</tr>
				</tbody>
			</table>
		</div>
	{/if}
</Modal>
