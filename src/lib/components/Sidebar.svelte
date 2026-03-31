<script lang="ts">
	import { toolsTree } from '$lib/core/tools-tree';
	import CategoryNode from './CategoryNode.svelte';

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
		w-sidebar
		min-w-sidebar
		border-r
		transition-transform
		{visible ? '' : 'hidden'}
		flex flex-col gap-1 overflow-y-auto p-1
		text-xs
		{visible ? 'block' : 'hidden'}
	"
>
	<div>
		{#each toolsTree as category (category.name)}
			<CategoryNode {category} {collapsed} {toggleCategory} />
		{/each}
	</div>
</div>
