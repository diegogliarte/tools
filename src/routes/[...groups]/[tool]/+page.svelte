<script lang="ts">
	import { page } from '$app/state';
	import { findTool } from '$lib/core/tools-registry';
	import { toolsTree } from '$lib/core/tools-tree';
	import { canonicalUrl, siteName, toolOgImageUrl, toolPageDescription, toolPageTitle } from '$lib/utils/seo.utils';
	import { faviconType, faviconUrl } from '$lib/utils/favicon.utils';

	let { params, data } = $props();

	let categoryPath = $derived(params.groups.split('/'));
	let toolSlug = $derived(params.tool);
	let tool = $derived.by(() => {
		const found = findTool(categoryPath, toolSlug, toolsTree);

		if (!found) {
			throw new Error('Tool not found');
		}

		return found;
	});
	let componentPromise = $derived(tool.loadComponent());

	let canonical = $derived(canonicalUrl(page.url.pathname));
	let metaTitle = $derived(toolPageTitle(tool));
	let metaDescription = $derived(toolPageDescription(tool));
	let ogImage = $derived(toolOgImageUrl(tool));
	let imageAlt = $derived(`${tool.title} tool preview`);
	let favicon = $derived(faviconUrl(tool.favicon));
	let faviconMime = $derived(faviconType(tool.favicon));
</script>

<svelte:head>
	<title>{metaTitle}</title>
	<meta name="description" content={metaDescription} />
	<meta name="robots" content="index, follow" />

	<link rel="canonical" href={canonical} />

	<link rel="icon" type={faviconMime} href={favicon} />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:title" content={metaTitle} />
	<meta property="og:description" content={metaDescription} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={imageAlt} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={metaTitle} />
	<meta name="twitter:description" content={metaDescription} />
	<meta name="twitter:image" content={ogImage} />
	<meta name="twitter:image:alt" content={imageAlt} />
</svelte:head>

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
