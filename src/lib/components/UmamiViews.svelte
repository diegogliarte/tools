<script lang="ts">
	import { onMount } from 'svelte';

	type AnalyticsResponse = {
		visits: number;
		pageviews: number;
		visitors: number;
		updatedAt: string;
	};

	let stats: AnalyticsResponse | null = null;
	let failed = false;

	onMount(async () => {
		try {
			const response = await fetch('/api/umami-views');

			if (!response.ok) {
				throw new Error('Failed to load analytics');
			}

			stats = await response.json();
		} catch {
			failed = true;
		}
	});
</script>

{#if stats}
	<span>{stats.visits.toLocaleString()} total visits</span>
{:else if !failed}
	<span>Loading visits...</span>
{/if}