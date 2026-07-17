<script lang="ts">
	import Cell from '$lib/components/ui/cell.svelte';
	import { openModal } from '$lib/states/modal.svelte';
	import { getDigimonIcon, type Digimon } from '$lib/utils/digimon-story-ts.utils';

	interface Props {
		digimon: Digimon;
	}

	let { digimon }: Props = $props();

	async function open() {
		const { default: DigimonModal } = await import('$lib/components/digimon-story-ts/DigimonModal.svelte');
		openModal(DigimonModal, { digimon });
	}
</script>

<Cell image={getDigimonIcon(digimon)} imageAlt={digimon.name} onClick={open}>
	<div>{digimon.name}</div>
</Cell>
