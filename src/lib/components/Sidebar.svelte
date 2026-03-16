<script lang="ts">
	import { toolsTree } from "$lib/core/tools-tree";
	import CategoryNode from "./CategoryNode.svelte";

	let collapsed: Record<string, boolean> = $state({});

	function toggleCategory(cat: string) {
		collapsed[cat] = !collapsed[cat];
	}
</script>

<div class="sticky top-0 min-w-sidebar w-sidebar h-screen border-r p-1 flex flex-col gap-1 text-xs overflow-y-auto">

	{#each toolsTree as category (category.name)}
		<CategoryNode
			{category}
			{collapsed}
			{toggleCategory}
		/>
	{/each}

</div>