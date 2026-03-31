<script lang="ts">
	import PlayerIcon from '$lib/components/inazuma-eleven-vr/PlayerIcon.svelte';
	import type { Player } from '$lib/utils/inazuma-eleven-vr.utils';

	const positionColor = {
		GK: 'bg-yellow-900',
		DF: 'bg-blue-900',
		MF: 'bg-green-900',
		FW: 'bg-red-900'
	};

	interface Props {
		player: Player;
	}

	let { player }: Props = $props();
</script>

<div class="flex items-center gap-2">
	<!-- Player icon -->
	<div class="aspect-square h-14 w-14">
		<PlayerIcon {player} />
	</div>

	<!-- Name + Position -->
	<div>
		<div class="leading-none">{player.Name}</div>
		<div
			class="inline-block border px-1 text-xs
				{positionColor[player.Position] ?? 'bg-neutral-700'}"
		>
			{player.Position}
		</div>
	</div>
</div>
