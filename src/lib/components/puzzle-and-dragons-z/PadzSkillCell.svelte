<script lang="ts">
	import { openModal } from '$lib/states/modal.svelte';
	import {
		formatPadzNumber,
		formatPadzSkillCategory,
		getPadzElementIcon,
		getPadzSkillCost,
		type PadzSkill
	} from '$lib/utils/puzzle-and-dragons-z.utils';

	interface Props {
		skill: PadzSkill;
	}

	let { skill }: Props = $props();

	async function open() {
		const { default: PadzSkillModal } = await import(
			'$lib/components/puzzle-and-dragons-z/PadzSkillModal.svelte'
			);

		openModal(PadzSkillModal, { skill });
	}
</script>

<button
	type="button"
	class="flex w-full cursor-pointer items-center gap-2 text-left hover:text-accent"
	onclick={open}
>
	{#if skill.type}
		<div class="aspect-square h-10 w-10">
			<img
				src={getPadzElementIcon(skill.type)}
				alt={skill.type}
				class="h-full w-full object-contain"
				loading="lazy"
			/>
		</div>
	{/if}

	<div>
		<div class="leading-none">{skill.name}</div>

		<div class="mt-1 text-xs opacity-70">
			{formatPadzSkillCategory(skill.category)}
			{#if getPadzSkillCost(skill) !== null}
				· Cost {formatPadzNumber(getPadzSkillCost(skill))}
			{/if}
		</div>
	</div>
</button>