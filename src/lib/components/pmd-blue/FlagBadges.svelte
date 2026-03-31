<script lang="ts">
	import { tooltipAction } from '$lib/actions/tooltip';

	export let flags: number[] = [];
	export let map: Record<number, string> = {};
</script>

{#if !flags?.length}
	<span>—</span>
{:else}
	<div class="flex flex-wrap gap-1">
		{#each flags as id (id)}
			<div
				class="relative cursor-help border px-1.5 py-0.5 text-xs"
				use:tooltipAction={{ text: map[id] ?? 'Unknown flag', position: 'top' }}
			>
				#{id}
			</div>
		{/each}
	</div>
{/if}
