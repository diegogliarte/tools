<script lang="ts">
	import { findTool } from '$lib/core/tools-registry';
	import { toolsTree } from '$lib/core/tools-tree';

	let { params, data } = $props();

	let categoryPath = $derived(params.groups.split('/'));
	let toolSlug = $derived(params.tool);
	let tool = $derived(findTool(categoryPath, toolSlug, toolsTree));

	let componentPromise = $derived(tool?.loadComponent());
</script>

<svelte:head>
	<title>{tool ? `${tool.title} | ${tool.categoryPath?.join(' | ')}` : 'Not Found'}</title>
	<meta name="description" content={`${tool?.title ?? 'Not Found'} - ${tool?.description ?? 'Not Found'}`} />
	<link rel="icon" href={`${tool?.favicon ?? '/favicons/default.png'}?v=${tool?.href}`} />

	<meta property="og:title" content={tool?.title ?? 'Not Found'} />
	<meta property="og:description" content={tool?.description ?? 'Not Found'} />
</svelte:head>

{#if tool && componentPromise}
	<h1 class="text-center text-large">{tool.title}</h1>
	<h2 class="text-center">{tool.description}</h2>

	<div class="mt-12 flex flex-col gap-8 {!tool.fullscreen ? 'mx-auto w-full max-w-3xl' : 'w-fit min-w-full'}">
		{#await componentPromise}
			<p class="text-center opacity-60">Loading tool…</p>
		{:then module}
			{@const Component = module.default}
			<Component cookieKey={data.cookieKey} cookieState={data.cookieState} />
		{:catch}
			<p class="text-center text-red-500">Failed to load tool.</p>
		{/await}
	</div>
{:else}
	<p>Tool not found</p>
{/if}
