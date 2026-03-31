<script lang="ts">
	import { openModal } from '$lib/states/modal.svelte';
	import MoveModal from './MoveModal.svelte';

	export let move;

	const typeColor = {
		Fire: 'bg-red-700',
		Water: 'bg-blue-700',
		Grass: 'bg-green-700',
		Electric: 'bg-yellow-500',
		Ice: 'bg-cyan-400',
		Fighting: 'bg-orange-700',
		Poison: 'bg-purple-700',
		Ground: 'bg-yellow-700',
		Flying: 'bg-sky-500',
		Psychic: 'bg-pink-600',
		Bug: 'bg-lime-600',
		Rock: 'bg-yellow-800',
		Ghost: 'bg-indigo-700',
		Dragon: 'bg-indigo-900',
		Dark: 'bg-neutral-800',
		Steel: 'bg-gray-400',
		Normal: 'bg-neutral-500',
		Typeless: 'bg-neutral-400'
	};

	function open() {
		openModal(MoveModal, { move });
	}
</script>

<button type="button" class="flex cursor-pointer items-center gap-2 hover:text-accent" onclick={open}>
	<div class="h-2.5 w-2.5 {typeColor[move.type] ?? 'bg-neutral-500'}"></div>
	<span>{move.name}</span>
</button>
