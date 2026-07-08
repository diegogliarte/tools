<script lang="ts">
	import DigimonIcon from '$lib/components/digimon-story-ts/DigimonIcon.svelte';
	import { openModal } from '$lib/states/modal.svelte';
	import type { Digimon } from '$lib/utils/digimon-story-ts.utils';

	interface Props {
		digimon: Digimon;
	}

	let { digimon }: Props = $props();

	async function open() {
		const { default: DigimonModal } = await import('$lib/components/digimon-story-ts/DigimonModal.svelte');
		openModal(DigimonModal, { digimon });
	}
</script>

<div
	class="flex w-full cursor-pointer items-center gap-2 text-left hover:text-accent"
	onclick={open}
>
	<div class="aspect-square h-14 w-14">
		<DigimonIcon {digimon} openModal={false} />
	</div>
	<div>{digimon.name}</div>
</div>
