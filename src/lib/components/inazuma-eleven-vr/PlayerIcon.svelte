<script lang="ts">
	import { openModal } from '$lib/states/modal.svelte';
	import { getPlayerElementClass, type Player } from '$lib/utils/inazuma-eleven-vr.utils';

	interface Props {
		player: Player;
		variant?: 'default' | 'viewer';
		openModal?: boolean;
	}

	let { player, variant = 'default', openModal: canOpenModal = true }: Props = $props();

	async function open() {
		if (!canOpenModal) return;

		const { default: PlayerModal } = await import('$lib/components/inazuma-eleven-vr/PlayerModal.svelte');
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
			{getPlayerElementClass(player.Element)}
			{variant === 'viewer' ? 'transform transition group-hover:z-50 group-hover:scale-300' : ''}
		"
	/>
</button>
