<script lang="ts">
	import { fly } from 'svelte/transition';
	import { toastState, removeToast, resetToastTimer, type ToastItem } from '$lib/utils/toast.utils';

	const typeClass = {
		success: 'border-green-500/70 text-green-300',
		error: 'border-red-500/70 text-red-300',
		info: 'border-accent text-white'
	};

	function handleMouseEnter(toast: ToastItem) {
		resetToastTimer(toast.id);
	}
</script>

<div class="text-xs fixed right-4 bottom-4 z-60 flex max-w-[calc(100vw-2rem)] flex-col gap-2 sm:max-w-sm">
	{#each $toastState as toast (toast.id)}
		<button
			type="button"
			aria-label="Dismiss notification"
			class="
				w-full
				border
				bg-bg
				px-3 py-2
				text-left
				cursor-pointer
				transition-colors
				hover:border-accent
				{typeClass[toast.type] || ''}
			"
			onclick={() => removeToast(toast.id)}
			onmouseenter={() => handleMouseEnter(toast)}
			in:fly={{ y: 8, duration: 180 }}
			out:fly={{ y: 8, duration: 140 }}
		>
			<div class="flex items-center gap-2">
				<div class="shrink-0 uppercase">
					{toast.type}
				</div>

				<div class="truncate">
					{toast.message}
				</div>
			</div>
		</button>
	{/each}
</div>