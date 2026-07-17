<script lang="ts">
	import Cell from '$lib/components/ui/cell.svelte';
	import { openModal } from '$lib/states/modal.svelte';
	import { getPlayerElementClass, type Player } from '$lib/utils/inazuma-eleven-vr.utils';

	const positionColor = {
		GK: 'bg-yellow-900',
		DF: 'bg-blue-900',
		MF: 'bg-green-900',
		FW: 'bg-red-900',
		'?': 'bg-neutral-700'
	} satisfies Record<Player['Position'], string>;

	interface Props {
		player: Player;
	}

	let { player }: Props = $props();

	async function open() {
		const { default: PlayerModal } = await import('$lib/components/inazuma-eleven-vr/PlayerModal.svelte');
		openModal(PlayerModal, { player });
	}
</script>

<Cell image={player.Image} imageAlt={player.Name} thumbnailClass={getPlayerElementClass(player.Element)} onClick={open}>
	<!-- Name + Position -->
	<div>
		<div class="leading-none">{player.Name}</div>
		<div
			class="inline-block border px-1 text-xs
				{positionColor[player.Position]}"
		>
			{player.Position}
		</div>
	</div>
</Cell>
