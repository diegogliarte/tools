<script lang="ts">
	import { openModal } from '$lib/states/modal.svelte';
	import { getMoveTypeColor, type Move } from '$lib/data/pmd-blue/data';

	interface Props {
		move: Move;
	}

	let { move }: Props = $props();

	async function open() {
		const { default: MoveModal } = await import('./MoveModal.svelte');
		openModal(MoveModal, { move });
	}
</script>

<button type="button" class="flex cursor-pointer items-center gap-2 hover:text-accent" onclick={open}>
	<div class="h-2.5 w-2.5 {getMoveTypeColor(move.type)}"></div>
	<span>{move.name}</span>
</button>
