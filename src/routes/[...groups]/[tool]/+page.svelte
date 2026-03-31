<script lang="ts">
	import { findTool } from '$lib/core/tools-registry';
	import { toolsTree } from '$lib/core/tools-tree';

	let { params } = $props();

	let categoryPath = $derived(params.groups.split('/'));
	let toolSlug = $derived(params.tool);
	let tool = $derived(findTool(categoryPath, toolSlug, toolsTree));

</script>

<svelte:head>
	<title>{tool ? `${tool.title} | ${tool?.categoryPath.join(' | ')}` : 'Not Found'}</title>
	<meta name="description" content={`${tool?.title ?? 'Not Found'} - ${tool?.description ?? 'Not Found'}`} />
	<link rel="icon" href={`${tool?.favicon ?? '/favicons/default.png	'}?v=${tool?.href}`} />

	<meta property="og:title" content={tool?.title ?? 'Not Found'} />
	<meta property="og:description" content={tool?.description ?? 'Not Found'} />
</svelte:head>

{#if tool}
	<h1 class="text-center text-large">{tool.title}</h1>
	<h2 class="text-center">{tool.description}</h2>

	{@const Component = tool.component}

	<div
		class="flex flex-col {!tool.fullscreen ? 'mx-auto max-w-3xl' : ''} {!tool.removeBorder
			? 'border-0'
			: ''} m-4 mt-8 gap-8 border-text w-fit"
	>
		<Component />
	</div>
{:else}
	<p>Tool not found</p>
{/if}
