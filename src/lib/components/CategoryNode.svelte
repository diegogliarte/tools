<script lang="ts">
	import type { ToolCategory } from '$lib/tools/types';
	import { page } from '$app/state';

	import MdiChevronDown from '~icons/mdi/chevron-down';
	import MdiChevronRight from '~icons/mdi/chevron-right';

	export let category: ToolCategory;
	export let collapsed: Record<string, boolean>;
	export let toggleCategory: (cat: string) => void;
</script>

<div>
	<button
		class="flex w-full cursor-pointer items-center py-1 text-left hover:text-accent"
		onclick={() => toggleCategory(category.name)}
	>
		{#if collapsed[category.name]}
			<MdiChevronRight />
		{:else}
			<MdiChevronDown />
		{/if}

		<span>{category.name}</span>
	</button>

	{#if !collapsed[category.name]}
		<div class="flex flex-col border-l border-text pl-2">
			<!-- tools -->
			{#each category.tools as tool (tool.href)}
				<a
					href={tool.href}
					class="truncate py-0.5 hover:text-accent {page.url.pathname === tool.href ? 'text-accent' : ''}"
					title={tool.title}
				>
					{tool.title}
				</a>
			{/each}

			<!-- subgroups -->
			{#each category.subgroups as subgroup (subgroup.name)}
				<svelte:self category={subgroup} {collapsed} {toggleCategory} />
			{/each}
		</div>
	{/if}
</div>
