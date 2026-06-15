<script lang="ts">
	import { onMount } from 'svelte';

	type ViewsResponse = {
		pageviews: number;
		visitors: number;
		visits: number;
		previousPageviews: number | null;
		updatedAt: string;
	};

	let stats: ViewsResponse | null = null;
	let failed = false;

	onMount(async () => {
		try {
			const response = await fetch('/api/umami-views');

			if (!response.ok) {
				throw new Error('Failed to load views');
			}

			stats = await response.json();
		} catch {
			failed = true;
		}
	});
</script>

{#if stats}
	<span class="text-text-dim" title={`${stats.visitors.toLocaleString()} visitors in the last 24h`}>
		{stats.pageviews.toLocaleString()} views today
	</span>
{:else if !failed}
	<span class="text-text-dim">Loading views...</span>
{/if}
