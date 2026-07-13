<script lang="ts">
	import PadzMonsterIcon from '$lib/components/puzzle-and-dragons-z/PadzMonsterIcon.svelte';
	import { openModal } from '$lib/states/modal.svelte';
	import { formatPadzType, getPadzTypeIcon, type PadzMonster } from '$lib/utils/puzzle-and-dragons-z.utils';

	interface Props {
		monster: PadzMonster;
	}

	let { monster }: Props = $props();

	async function open() {
		const { default: PadzMonsterModal } = await import('$lib/components/puzzle-and-dragons-z/PadzMonsterModal.svelte');

		openModal(PadzMonsterModal, { monster });
	}
</script>

<div class="flex w-full cursor-pointer items-center gap-2 text-left hover:text-accent" onclick={open}>
	<div class="aspect-square h-14 w-14">
		<PadzMonsterIcon {monster} openModal={false} />
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
