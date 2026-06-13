<script lang="ts">
	import ToolCategorySection from '$lib/components/ToolCategorySection.svelte';
	import { toolsTree } from '$lib/core/tools-tree';
	import { canonicalUrl, defaultOgImage, pageTitle, siteName } from '$lib/utils/seo.utils';

	const canonical = canonicalUrl('/');
	const title = pageTitle('Free Online Tools');
	const description = 'Browse free online tools, generators, calculators, and interactive utilities.';
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />

	<link rel="canonical" href={canonical} />

	<link rel="icon" href="/favicons/default.png" />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={defaultOgImage} />
	<meta property="og:image:alt" content="Tools by diegogliarte" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={defaultOgImage} />
	<meta name="twitter:image:alt" content="Tools by diegogliarte" />
</svelte:head>

<div class="flex flex-col">
	{#each toolsTree as category (category.name)}
		<ToolCategorySection {category} />
	{/each}
</div>
