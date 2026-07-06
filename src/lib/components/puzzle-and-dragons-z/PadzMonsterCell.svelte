<script lang="ts">
	import PadzMonsterIcon from '$lib/components/puzzle-and-dragons-z/PadzMonsterIcon.svelte';
	import {
		formatPadzType,
		getPadzTypeIcon,
		type PadzMonster,
		type PadzSkill
	} from '$lib/utils/puzzle-and-dragons-z.utils';

	interface Props {
		monster: PadzMonster;
	}

	let { monster }: Props = $props();
</script>

<div class="flex items-center gap-2">
	<div class="aspect-square h-14 w-14">
		<PadzMonsterIcon {monster} />
	</div>

	<div>
		<div class="leading-none">{monster.name}</div>

		{#if monster.type}
			<div class="mt-1 inline-flex items-center gap-1 text-xs">
				<img
					src={getPadzTypeIcon(monster.type)}
					alt={formatPadzType(monster.type)}
					class="h-[1.1em] w-[1.1em]"
					loading="lazy"
				/>
				{formatPadzType(monster.type)}
			</div>
		{/if}
	</div>
</div>