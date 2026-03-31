<script lang="ts">
	import type { ToolCategory } from '$lib/tools/types';

	export let category: ToolCategory;
	export let parentPath: string = '';

	const categoryPath = parentPath ? `${parentPath}/${category.name}` : category.name;
</script>

<section class="mb-4 last:mb-0">
	<h3 class="mb-1 text-medium">{category.name}</h3>

	<!-- Tools directly inside this category -->
	{#if category.tools.length > 0}
		<div class="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
			{#each category.tools as tool (tool)}
				<a
					href={tool.href}
					class="
					border px-2 py-1
					transition-colors hover:border-accent
					hover:bg-accent-dark
				"
				>
					<div class="truncate font-medium">{tool.title}</div>
					<div class="line-clamp-2 text-xs">{tool.description}</div>
				</a>
			{/each}
		</div>
	{/if}

	<!-- Recursive subgroups -->
	{#each category.subgroups as subgroup (subgroup)}
		<svelte:self category={subgroup} parentPath={categoryPath} />
	{/each}
</section>
