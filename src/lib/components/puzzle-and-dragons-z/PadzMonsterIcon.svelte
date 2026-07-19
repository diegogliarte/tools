<script lang="ts">
	import { openModal } from '$lib/states/modal.svelte';
	import { getPadzElementClass, getPadzMonsterIcon, type PadzMonster } from '$lib/utils/puzzle-and-dragons-z.utils';

	interface Props {
		monster: PadzMonster;
		variant?: 'default' | 'viewer';
		openModal?: boolean;
	}

	let { monster, variant = 'default', openModal: canOpenModal = true }: Props = $props();

	async function open() {
		if (!canOpenModal) return;

		const { default: PadzMonsterModal } = await import('$lib/components/puzzle-and-dragons-z/PadzMonsterModal.svelte');

		openModal(PadzMonsterModal, { monster });
	}
</script>

<button
	type="button"
	class="group w-full p-0 {canOpenModal ? 'cursor-pointer' : 'cursor-default'}"
	disabled={!canOpenModal}
	onclick={open}
>
	<img
		src={getPadzMonsterIcon(monster.id)}
		alt={monster.name}
		loading="lazy"
		class="
			pointer-events-none aspect-square h-full w-full border object-cover group-hover:border-accent
			{getPadzElementClass(monster.attribute)}
			{variant === 'viewer' ? 'transition-colors' : ''}
		"
	/>
</button>
