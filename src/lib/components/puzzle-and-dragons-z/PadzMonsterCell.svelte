<script lang="ts">
	import Cell from '$lib/components/ui/cell.svelte';
	import { openModal } from '$lib/states/modal.svelte';
	import {
		formatPadzType,
		getPadzElementClass,
		getPadzMonsterIcon,
		getPadzTypeIcon,
		type PadzMonster
	} from '$lib/utils/puzzle-and-dragons-z.utils';

	interface Props {
		monster: PadzMonster;
	}

	let { monster }: Props = $props();

	async function open() {
		const { default: PadzMonsterModal } = await import('$lib/components/puzzle-and-dragons-z/PadzMonsterModal.svelte');

		openModal(PadzMonsterModal, { monster });
	}
</script>

<Cell
	image={getPadzMonsterIcon(monster.id)}
	imageAlt={monster.name}
	thumbnailClass={getPadzElementClass(monster.attributes?.[0])}
	onClick={open}
>
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
</Cell>
