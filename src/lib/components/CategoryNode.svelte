<script lang="ts">
	import type { ToolCategory } from '$lib/tools/types';
	import { page } from '$app/state';
	import { faviconUrl } from '$lib/utils/favicon.utils';
	import CategoryNode from './CategoryNode.svelte';

	interface Props {
		category: ToolCategory;
		depth?: number;
	}

	let { category, depth = 0 }: Props = $props();
</script>

<div>
	<div class="flex items-center gap-1 py-1 text-xxs">
		{#if depth === 0}
			<img src={faviconUrl(category.favicon)} alt="" class="h-3 w-3 shrink-0" loading="lazy" />
		{/if}

		<span class="truncat text-accent">{category.name}</span>
	</div>

	<div class="ml-1 flex flex-col">
		<!-- tools -->
		{#each category.tools as tool (tool.href)}
			<a
				href={tool.href}
				class="truncate py-0.5 hover:text-accent {page.url.pathname === tool.href ? 'text-accent' : ''}"
				title={tool.title}
			>
				| {tool.title}
			</a>
		{/each}
	</div>

	<div class="ml-4 flex flex-col">
		<!-- subgroups -->
		{#each category.subgroups as subgroup (subgroup.name)}
			<CategoryNode category={subgroup} depth={depth + 1} />
		{/each}
	</div>
</div>
