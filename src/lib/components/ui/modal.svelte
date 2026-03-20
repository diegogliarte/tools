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

	let {
		title = "",
		closable = true,
		onClose,
		children
	}: Props = $props();

	let dialog = $state<HTMLDialogElement | null>(null);

	$effect(() => {
		if (!dialog) return;

		if (!dialog.open) {
			dialog.showModal();

			document.body.style.overflow = "hidden";
		}
	});

	function close() {
		if (dialog?.open) {
			dialog.close();
		}

		document.body.style.overflow = "";

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
		backdrop:bg-bg/30 backdrop:backdrop-blur-xs
		p-0 border-none
		w-full h-full
		bg-transparent
		text-text
		flex justify-center items-center
		mx-auto my-auto
	"
>
	<div
		class="
			bg-bg border border-text
			p-4
			w-[min(90vw,800px)]
			max-h-[90vh]
			overflow-y-auto
			relative
		"
	>
		{#if title || closable}
			<div class="flex items-center justify-between mb-3">
				{#if title}
					<h2 class="text-large">{title}</h2>
				{/if}

				{#if closable}
					<button
						type="button"
						class="absolute top-2 right-2 text-large opacity-50 hover:opacity-100 hover:text-accent cursor-pointer"
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