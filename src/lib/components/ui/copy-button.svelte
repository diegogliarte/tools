<script lang="ts">
	import { copy } from '$lib/utils/clipboard.utils';
	import { messageToast } from '$lib/utils/toast.utils';
	import MdiContentCopy from '~icons/mdi/content-copy';
	import MdiCheck from '~icons/mdi/check';

	interface Props {
		value: string | number;
	}

	let { value }: Props = $props();

	let copied = $state(false);

	async function handleClick() {
		if (!value) return;

		if (await copy(value.toString())) {
			copied = true;
			messageToast('success', 'Copied to clipboard');
			setTimeout(() => (copied = false), 500);
		} else {
			messageToast('error', 'Failed to copy');
		}
	}
</script>

<button
	type="button"
	class="
		cursor-pointer
		transition-colors
		hover:text-accent
	"
	onclick={handleClick}
>
	{#if copied}
		<MdiCheck class="h-4 w-4 text-accent" />
	{:else}
		<MdiContentCopy class="h-4 w-4" />
	{/if}
</button>
