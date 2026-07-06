<script lang="ts">
	import { onMount } from 'svelte';
	import Modal from '$lib/components/ui/modal.svelte';
	import PadzMonsterIcon from '$lib/components/puzzle-and-dragons-z/PadzMonsterIcon.svelte';
	import { loadPadzMonsters } from '$lib/data/puzzle-and-dragons-z/data';
	import {
		formatPadzNumber,
		formatPadzSkillCategory,
		getPadzElementIcon,
		getPadzSkillCost,
		padzSkillMatchesRef,
		type PadzMonster,
		type PadzSkill
	} from '$lib/utils/puzzle-and-dragons-z.utils';

	interface Props {
		skill: PadzSkill;
		onClose?: () => void;
	}

	let { skill, onClose }: Props = $props();

	let monsters = $state<PadzMonster[]>([]);

	onMount(async () => {
		monsters = await loadPadzMonsters();
	});

	const activeUsers = $derived.by(() => {
		if (skill.category !== 'active') return [];

		return monsters
			.filter((monster) => padzSkillMatchesRef(skill, monster.skills?.active, 'active'))
			.sort((a, b) => a.id - b.id);
	});

	const leaderUsers = $derived.by(() => {
		if (skill.category !== 'leader') return [];

		return monsters
			.filter((monster) => padzSkillMatchesRef(skill, monster.skills?.leader, 'leader'))
			.sort((a, b) => a.id - b.id);
	});
</script>

<Modal title={skill?.name} {onClose}>
	{#if skill}
		<div class="mb-4 flex gap-4">
			{#if skill.type}
				<div class="w-16">
					<img
						src={getPadzElementIcon(skill.type)}
						alt={skill.type}
						class="aspect-square h-full w-full object-contain"
					/>
				</div>
			{/if}

			<div class="flex flex-col gap-1 text-xs">
				<div>ID: #{skill.id}</div>
				<div>Category: {formatPadzSkillCategory(skill.category)}</div>

				{#if skill.type}
					<div>Element: {skill.type}</div>
				{/if}

				{#if skill.damage_type}
					<div>Damage Type: {skill.damage_type}</div>
				{/if}

				{#if getPadzSkillCost(skill) !== null}
					<div>Cost: {formatPadzNumber(getPadzSkillCost(skill))}</div>
				{/if}
			</div>
		</div>

		{#if skill.description}
			<h3 class="mb-1 font-bold">Description</h3>
			<p class="mb-4 text-xs opacity-80">{skill.description}</p>
		{/if}

		<h3 class="mb-2 font-bold">Details</h3>

		<div class="mb-4 border text-xs">
			<table class="w-full text-left">
				<tbody>
				<tr>
					<th class="w-32 p-1">Category</th>
					<td class="p-1">{formatPadzSkillCategory(skill.category)}</td>
				</tr>

				<tr>
					<th class="w-32 p-1">Element</th>
					<td class="p-1">{formatPadzNumber(skill.type)}</td>
				</tr>

				<tr>
					<th class="w-32 p-1">Damage Type</th>
					<td class="p-1">{formatPadzNumber(skill.damage_type)}</td>
				</tr>

				<tr>
					<th class="w-32 p-1">Cost</th>
					<td class="p-1">{formatPadzNumber(getPadzSkillCost(skill))}</td>
				</tr>

				<tr>
					<th class="w-32 p-1">Power</th>
					<td class="p-1">{formatPadzNumber(skill.power)}</td>
				</tr>

				<tr>
					<th class="w-32 p-1">Accuracy</th>
					<td class="p-1">{formatPadzNumber(skill.accuracy)}</td>
				</tr>

				<tr>
					<th class="w-32 p-1">Crit Rate</th>
					<td class="p-1">{formatPadzNumber(skill.crit_rate)}</td>
				</tr>

				<tr>
					<th class="w-32 p-1">Hits</th>
					<td class="p-1">{formatPadzNumber(skill.hit_count)}</td>
				</tr>

				{#if skill.target}
					<tr>
						<th class="w-32 p-1">Target</th>
						<td class="p-1">{skill.target}</td>
					</tr>
				{/if}
				</tbody>
			</table>
		</div>

		{#if activeUsers.length || leaderUsers.length}
			<h3 class="mb-2 font-bold">Monsters With This Skill</h3>

			<div class="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
				{#if activeUsers.length}
					<div>
						<div class="mb-2 font-semibold">Active Skill</div>

						<div class="grid grid-cols-3 gap-3 sm:grid-cols-4">
							{#each activeUsers as monster (monster.id)}
								<div class="flex flex-col items-center text-center">
									<div class="aspect-square h-14 w-14">
										<PadzMonsterIcon {monster} variant="viewer" />
									</div>

									<div class="mt-1 w-full truncate">{monster.name}</div>
									<div class="opacity-70">#{monster.id}</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				{#if leaderUsers.length}
					<div>
						<div class="mb-2 font-semibold">Leader Skill</div>

						<div class="grid grid-cols-3 gap-3 sm:grid-cols-4">
							{#each leaderUsers as monster (monster.id)}
								<div class="flex flex-col items-center text-center">
									<div class="aspect-square h-14 w-14">
										<PadzMonsterIcon {monster} variant="viewer" />
									</div>

									<div class="mt-1 w-full truncate">{monster.name}</div>
									<div class="opacity-70">#{monster.id}</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/if}
	{/if}
</Modal>