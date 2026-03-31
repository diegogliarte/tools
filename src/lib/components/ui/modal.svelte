<script lang="ts">
	import type { Snippet } from 'svelte';
	import MdiClose from '~icons/mdi/close';
	import { closeModal } from '$lib/states/modal.svelte';

	interface Props {
		title?: string;
		closable?: boolean;
		onClose?: () => void;
		children: Snippet;
	}

	let { title = '', closable = true, onClose, children }: Props = $props();

	let dialog = $state<HTMLDialogElement | null>(null);

	$effect(() => {
		if (!dialog) return;

		if (!dialog.open) {
			dialog.showModal();

			document.body.style.overflow = 'hidden';
		}
	});

	function close() {
		if (dialog?.open) {
			dialog.close();
		}

		document.body.style.overflow = '';

		closeModal();
		onClose?.();
	}
</script>

<dialog
	bind:this={dialog}
	onclick={(e) => {
		if (e.target === dialog) close();
	}}
	class="
		mx-auto my-auto
		flex h-full
		w-full items-center
		justify-center
		border-none
		bg-transparent p-0 text-text
		backdrop:bg-bg/30 backdrop:backdrop-blur-xs
	"
>
	<div
		class="
			relative max-h-[90vh] w-[min(90vw,800px)]
			overflow-y-auto
			border
			border-text
			bg-bg
			p-4
		"
	>
		{#if title || closable}
			<div class="mb-3 flex items-center justify-between">
				{#if title}
					<h2 class="text-large">{title}</h2>
				{/if}

				{#if closable}
					<button
						type="button"
						class="absolute top-2 right-2 cursor-pointer text-large opacity-50 hover:text-accent hover:opacity-100"
						onclick={close}
					>
						<MdiClose />
					</button>
				{/if}
			</div>
		{/if}

		{@render children()}
	</div>
</dialog>

<style>
	dialog:not([open]) {
		display: none;
	}
</style>
