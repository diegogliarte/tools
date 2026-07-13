<script lang="ts">
	import { openModal } from '$lib/states/modal.svelte';
	import { getPadzMonsterIcon, normaliseAssetKey, type PadzMonster } from '$lib/utils/puzzle-and-dragons-z.utils';

	interface Props {
		monster: PadzMonster;
		variant?: 'default' | 'viewer';
		openModal?: boolean;
	}

	let { monster, variant = 'default', openModal: canOpenModal = true }: Props = $props();

	const elementColor: Record<string, string> = {
		fire: 'bg-red-800/75',
		water: 'bg-blue-800/75',
		wood: 'bg-green-800/75',
		light: 'bg-yellow-700/75',
		dark: 'bg-purple-900/75',
		heart: 'bg-pink-800/75'
	};

	const primaryElement = $derived(normaliseAssetKey(monster.attributes?.[0] ?? ''));

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
			{elementColor[primaryElement] ?? 'bg-neutral-700'}
			{variant === 'viewer' ? 'transition-colors' : ''}
		"
	/>
</button>
