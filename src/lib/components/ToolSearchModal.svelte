<script lang="ts">
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';

	import Modal from '$lib/components/ui/modal.svelte';
	import { closeModal } from '$lib/states/modal.svelte';
	import { faviconUrl } from '$lib/utils/favicon.utils';
	import { toolSearchIndex, type ToolSearchItem } from '$lib/core/tools-tree';

	import MdiMagnify from '~icons/mdi/magnify';
	import MdiKeyboardReturn from '~icons/mdi/keyboard-return';

	const MAX_RESULTS = 6;

	let query = $state('');
	let activeIndex = $state(0);
	let inputEl = $state<HTMLInputElement | null>(null);

	const normalizedQuery = $derived(query.trim().toLowerCase());

	const results = $derived.by(() => {
		if (!normalizedQuery) return toolSearchIndex.slice(0, MAX_RESULTS);

		const terms = normalizedQuery.split(/\s+/).filter(Boolean);

		return toolSearchIndex
			.map((item) => {
				const title = item.title.toLowerCase();
				const category = item.category.toLowerCase();
				const description = item.description.toLowerCase();

				const score = terms.reduce((score, term) => {
					if (title.startsWith(term)) return score + 50;
					if (title.includes(term)) return score + 30;
					if (category.includes(term)) return score + 15;
					if (description.includes(term)) return score + 8;
					if (item.searchText.includes(term)) return score + 1;

					return score - 1000;
				}, 0);

				return { item, score };
			})
			.filter(({ score }) => score >= 0)
			.sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
			.slice(0, MAX_RESULTS)
			.map(({ item }) => item);
	});

	$effect(() => {
		query;
		activeIndex = 0;
	});

	$effect(() => {
		activeIndex = Math.min(activeIndex, Math.max(results.length - 1, 0));
	});

	$effect(() => {
		tick().then(() => inputEl?.focus());
	});

	function closeSearch() {
		document.body.style.overflow = '';
		closeModal();
	}

	async function selectTool(tool: ToolSearchItem) {
		closeSearch();
		await goto(tool.href);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			closeSearch();
			return;
		}

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			activeIndex = Math.min(activeIndex + 1, results.length - 1);
			return;
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault();
			activeIndex = Math.max(activeIndex - 1, 0);
			return;
		}

		if (event.key === 'Enter' && results[activeIndex]) {
			event.preventDefault();
			selectTool(results[activeIndex]);
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<Modal title="Search tools">
	<div class="flex flex-col gap-2">
		<div
			class="flex items-center gap-2 border px-3 py-2 transition focus-within:border-accent focus-within:bg-accent-dark"
		>
			<MdiMagnify class="h-5 w-5 opacity-60" />

			<input
				bind:this={inputEl}
				bind:value={query}
				type="text"
				placeholder="Search tools..."
				aria-label="Search tools"
				aria-controls="tool-search-results"
				aria-activedescendant={results[activeIndex] ? `tool-search-result-${activeIndex}` : undefined}
				class="w-full bg-transparent text-text outline-none placeholder:text-text/50"
			/>

			<kbd class="border px-1 text-xxs opacity-60">Esc</kbd>
		</div>

		<div id="tool-search-results" class="max-h-[50dvh] overflow-y-auto">
			{#if results.length > 0}
				{#each results as result, index (result.href)}
					<button
						id={`tool-search-result-${index}`}
						type="button"
						class="
							flex w-full cursor-pointer items-center gap-2 border border-transparent px-2 py-2 text-left transition
							{index === activeIndex ? 'border-accent bg-accent-dark' : 'hover:border-accent hover:bg-accent-dark'}
						"
						onmouseenter={() => (activeIndex = index)}
						onclick={() => selectTool(result)}
					>
						<img src={faviconUrl(result.favicon)} alt="" class="h-6 w-6 shrink-0 object-contain" loading="lazy" />

						<div class="min-w-0 flex-1">
							<div class="truncate">{result.category} · {result.title}</div>
							<div class="line-clamp-2 text-xs opacity-60">{result.description}</div>
						</div>

						{#if index === activeIndex}
							<MdiKeyboardReturn class="h-4 w-4 shrink-0 opacity-60" />
						{/if}
					</button>
				{/each}
			{:else}
				<div class="p-4 text-xs opacity-70">No tools found.</div>
			{/if}
		</div>

		<div class="flex justify-between text-xxs opacity-60">
			<span>↑↓ navigate</span>
			<span>Enter open</span>
		</div>
	</div>
</Modal>
