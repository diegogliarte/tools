<script lang="ts">
	import { openModal } from '$lib/states/modal.svelte';
	import MoveModal, { getMoveTypeColor, type Move } from './MoveModal.svelte';

	interface Props {
		move: Move;
	}

	let { move }: Props = $props();

	function open() {
		openModal(MoveModal, { move });
	}
</script>

<button type="button" class="flex cursor-pointer items-center gap-2 hover:text-accent" onclick={open}>
	<div class="h-2.5 w-2.5 {getMoveTypeColor(move.type)}"></div>
	<span>{move.name}</span>
</button>
