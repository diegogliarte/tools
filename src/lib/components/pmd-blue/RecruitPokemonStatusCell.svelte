<script lang="ts">
	interface Props {
		status: 'Have' | 'Ready' | 'Pre-evo' | '—';
		canToggleReady?: boolean;
		onToggleReady?: () => void;
	}

	let { status, canToggleReady = false, onToggleReady = undefined }: Props = $props();
</script>

{#if canToggleReady && onToggleReady}
	<button type="button" class="cursor-pointer transition hover:text-accent" onclick={onToggleReady}>
		{status}
	</button>
{:else}
	{status}
{/if}
