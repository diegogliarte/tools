<script lang="ts">
	import Modal from '$lib/components/ui/modal.svelte';
	import DigimonIcon from '$lib/components/digimon-story-ts/DigimonIcon.svelte';
	import digimonRaw from '$lib/data/digimon-story-ts/digimon.json';
	import skillsRaw from '$lib/data/digimon-story-ts/skills.json';

	import { type Digimon, getSkillIcon } from '$lib/utils/digimon-story-ts.utils';

	interface Skill {
		slug: string;
		category: 'special' | 'attachment';
		type: string;
		name: string;
		damage_type: string;
		sp_cost: number;
		accuracy: number;
		crit_rate: number;
		power: number;
		hit_count: number;
		description: string;
	}

	interface Props {
		digimon: Digimon;
		onClose?: () => void;
	}

	let { digimon, onClose }: Props = $props();

	const digimonById = new Map<number, Digimon>((digimonRaw as Digimon[]).map((d) => [d.id, d]));

	const preEvolutions = $derived(digimon.pre_evolutions?.map((id) => digimonById.get(id)).filter(Boolean) as Digimon[]);

	const evolutions = $derived(digimon.evolutions?.map((id) => digimonById.get(id)).filter(Boolean) as Digimon[]);

	const skillBySlug = new Map<string, Skill>((skillsRaw as Skill[]).map((s) => [s.slug, s]));

	const specialSkills = $derived(
		digimon.skills.special.map((slug) => skillBySlug.get(slug)).filter(Boolean) as Skill[]
	);

	const attachmentSkills = $derived(
		digimon.skills.attachment.map((slug) => skillBySlug.get(slug)).filter(Boolean) as Skill[]
	);
</script>

{#snippet SkillCard(skill)}
	<div class="flex flex-col gap-2 border p-2">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<img src={getSkillIcon(skill.type)} alt={skill.type} class="h-[1.25em] w-[1.25em] shrink-0" />
				<span class="font-bold">{skill.name}</span>
			</div>

			{#if skill.sp_cost !== undefined}
				<span>SP {skill.sp_cost}</span>
			{/if}
		</div>

		<div>
			{skill.type} · {skill.damage_type}
			· Power {skill.power}{#if skill.hit_count > 1}×{skill.hit_count}{/if}
		</div>

		<div>{skill.description}</div>
	</div>
{/snippet}

<Modal title={digimon?.name} {onClose}>
	{#if digimon}
		<div class="mb-4 flex gap-4">
			<div class="h-26 w-26">
				<DigimonIcon {digimon} openModal={false} />
			</div>

			<div class="flex flex-col justify-between text-xs">
				<div class="font-bold">{digimon.name}</div>
				<div>{digimon.generation}</div>

				<div class="flex items-center gap-1 leading-none">
					<img
						class="h-[1.5em] w-[1.5em]"
						src="/digimon-story-ts/{digimon.attribute.toLowerCase().replace(' ', '-')}.png"
					/>
					<span>{digimon.attribute} · {digimon.type}</span>
				</div>

				<div>
					Base Personality:
					<span class="text-accent">{digimon.base_personality}</span>
				</div>

				{#if digimon.ridable}
					<div class="text-accent">Ridable</div>
				{/if}
			</div>
		</div>

		<h3 class="mb-1 font-bold">Base Stats</h3>
		<div class="mb-4 grid grid-cols-2 gap-1 text-xs sm:grid-cols-4">
			<div>HP: <b>{digimon.base_stats.lv99.HP}</b></div>
			<div>SP: <b>{digimon.base_stats.lv99.SP}</b></div>
			<div>ATK: <b>{digimon.base_stats.lv99.ATK}</b></div>
			<div>DEF: <b>{digimon.base_stats.lv99.DEF}</b></div>
			<div>INT: <b>{digimon.base_stats.lv99.INT}</b></div>
			<div>SPI: <b>{digimon.base_stats.lv99.SPI}</b></div>
			<div>SPD: <b>{digimon.base_stats.lv99.SPD}</b></div>
		</div>

		{#if digimon.evolution_conditions?.length}
			<h3 class="mb-2 font-bold">Evolution Conditions</h3>
			<div class="mb-4 flex flex-col gap-2 text-xs">
				{#each digimon.evolution_conditions as evo}
					<div class="border p-2">
						<div class="mb-1 font-semibold capitalize">{evo.type}</div>
						<ul class="list-inside list-disc">
							{#each Object.entries(evo.requirements) as [k, v]}
								<li>{k}: {v}</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>
		{/if}

		{#if specialSkills.length || attachmentSkills.length}
			<h3 class="mb-2 font-bold">Skills</h3>

			<div class="mb-4 grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
				{#if specialSkills.length}
					<div>
						<div class="mb-1 font-semibold">Special</div>
						<div class="flex flex-col gap-2">
							{#each specialSkills as s (s.slug)}
								{@render SkillCard(s)}
							{/each}
						</div>
					</div>
				{/if}

				{#if attachmentSkills.length}
					<div>
						<div class="mb-1 font-semibold">Attachments</div>
						<div class="flex flex-col gap-2">
							{#each attachmentSkills as s (s.slug)}
								{@render SkillCard(s)}
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/if}

		{#if preEvolutions.length || evolutions.length}
			<h3 class="mb-2 font-bold">Evolution Tree</h3>

			<div class="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
				{#if preEvolutions.length}
					<div>
						<div class="mb-1 font-semibold">Pre-evolutions</div>
						<div class="flex flex-wrap gap-2">
							{#each preEvolutions as d (d.id)}
								<div class="flex w-16 flex-col items-center">
									<DigimonIcon digimon={d} />
									<div class="mt-1 text-center">{d.name}</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				{#if evolutions.length}
					<div>
						<div class="mb-1 font-semibold">Evolutions</div>
						<div class="flex flex-wrap gap-2">
							{#each evolutions as d (d.id)}
								<div class="flex w-16 flex-col items-center">
									<DigimonIcon digimon={d} />
									<div class="mt-1 w-full truncate text-center text-xs">{d.name}</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/if}
	{/if}
</Modal>
