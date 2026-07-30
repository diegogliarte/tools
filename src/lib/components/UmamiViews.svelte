<script lang="ts">
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';

	type AnalyticsResponse = {
		visits: number;
		pageviews: number;
		visitors: number;
		updatedAt: string;
	};

	let stats: AnalyticsResponse | null = null;
	let failed = false;
	const baseUrl = env.PUBLIC_UMAMI_BASE_URL;
	const websiteId = env.PUBLIC_UMAMI_WEBSITE_ID;
	const enabled = baseUrl && websiteId;

	onMount(async () => {
		if (!enabled) return;

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

<svelte:head>
	{#if enabled}
		<script defer src={`${baseUrl}/script.js`} data-website-id={websiteId}></script>
	{/if}
</svelte:head>

{#if enabled}
	{#if stats}
		<span>{stats.visits.toLocaleString()} total visits</span>
	{:else if !failed}
		<span>Loading visits...</span>
	{/if}
{/if}
