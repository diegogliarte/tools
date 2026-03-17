<script lang="ts">
	import { toolsTree } from "$lib/core/tools-tree";
	import CategoryNode from "./CategoryNode.svelte";

	interface Props {
		visible: boolean;
	}

	let { visible = $bindable() }: Props = $props();

	let collapsed: Record<string, boolean> = $state({});

	function toggleCategory(cat: string) {
		collapsed[cat] = !collapsed[cat];
	}

</script>

<div
	class="
		sticky
		top-0
		min-w-sidebar
		w-sidebar
		h-screen
		border-r
		transition-transform
		{visible ? '' : 'hidden'}
		p-1 flex flex-col gap-1 text-xs
		overflow-y-auto
	"
>
	<div>
		{#each toolsTree as category (category.name)}
			<CategoryNode
				{category}
				{collapsed}
				{toggleCategory}
			/>
		{/each}
	</div>

</div>