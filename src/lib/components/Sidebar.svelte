<script lang="ts">
	import { toolsTree } from '$lib/core/tools-tree';
	import CategoryNode from './CategoryNode.svelte';

	interface Props {
		visible: boolean;
	}

	let { visible = $bindable() }: Props = $props();
</script>

<div
	data-sidebar
	class="
		w-sidebar
		min-w-sidebar
		border-r
		transition-transform
		{visible ? '' : 'hidden'}
		flex flex-col overflow-y-auto p-1
		text-xs
		{visible ? 'block' : 'hidden'}
	"
>
	<nav aria-label="Tool navigation">
		{#each toolsTree as category (category.name)}
			<CategoryNode {category} />
		{/each}
	</nav>
</div>
