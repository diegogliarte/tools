<script lang="ts">
	import { openModal } from '$lib/states/modal.svelte';
	import PlayerModal from '$lib/components/inazuma-eleven-vr/PlayerModal.svelte';
	import type { Player } from '$lib/utils/inazuma-eleven-vr.utils';

	interface Props {
		player: Player;
		variant?: 'default' | 'viewer';
		openModal?: boolean;
	}

	let { player, variant = 'default', openModal: canOpenModal = true }: Props = $props();

	const elementColor: Record<string, string> = {
		Mountain: 'bg-yellow-800/75',
		Fire: 'bg-red-800/75',
		Forest: 'bg-green-800/75',
		Wind: 'bg-sky-800/75'
	};

	function open() {
		if (!canOpenModal) return;
		openModal(PlayerModal, { player });
	}
</script>

<button type="button" class="group w-full cursor-pointer p-0" onclick={open}>
	<img
		src={player.Image}
		alt={player.Name}
		loading="lazy"
		class="
			pointer-events-none aspect-square h-full w-full border object-cover group-hover:border-accent
			{elementColor[player.Element] ?? 'bg-neutral-700'}
			{variant === 'viewer' ? 'transform transition group-hover:z-50 group-hover:scale-300' : ''}
		"
	/>
</button>
