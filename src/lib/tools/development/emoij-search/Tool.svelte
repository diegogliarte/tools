<script lang="ts">
	import { onMount } from 'svelte';
	import TextInput from '$lib/components/ui/text-input.svelte';
	import { loadEmojiSearchItems, type EmojiSearchItem } from '$lib/data/emojis/emoji-search';
	import { copy } from '$lib/utils/clipboard.utils';
	import { messageToast } from '$lib/utils/toast.utils';

	const DEFAULT_LIMIT = 160;
	const SEARCH_LIMIT = 200;

	const STOP_WORDS = new Set(['a', 'an', 'and', 'for', 'in', 'of', 'on', 'the', 'with']);

	const SCORE = {
		emojiExact: 1000,
		variantExact: 1000,

		nameExactTerm: 500,
		nameExactQuery: 300,
		nameStartsWithQuery: 160,
		namePhraseIncludesQuery: 140,
		subgroupExactQuery: 120,

		annotationExact: 70,
		subgroupExact: 55,
		groupExact: 40,
		nameTokenExact: 35,

		annotationPrefix: 30,
		subgroupPrefix: 25,
		namePrefix: 20,

		searchIncludes: 8
	} as const;

	type QueryTerm = {
		raw: string;
		variants: string[];
	};

	let query = $state('');
	let copiedEmoji = $state<string | null>(null);
	let variantIndexes = $state<Record<string, number>>({});
	let emojiSearchItems = $state<EmojiSearchItem[]>([]);
	let loading = $state(true);

	const normalizedQuery = $derived(normalize(query));
	const queryTerms = $derived(tokenizeQuery(normalizedQuery));

	const results = $derived.by(() => {
		if (!normalizedQuery || queryTerms.length === 0) {
			return emojiSearchItems.slice(0, DEFAULT_LIMIT);
		}

		return emojiSearchItems.map((emoji) => ({
			emoji,
			score: scoreEmoji(emoji, queryTerms, normalizedQuery)
		}))
			.filter(({ score }) => score > 0)
			.sort((a, b) => b.score - a.score)
			.slice(0, SEARCH_LIMIT)
			.map(({ emoji }) => emoji);
	});

	function normalize(value: string) {
		return value
			.trim()
			.toLowerCase()
			.normalize('NFKD')
			.replace(/\p{Diacritic}/gu, '')
			.replace(/['’]/g, '');
	}

	onMount(async () => {
		emojiSearchItems = await loadEmojiSearchItems();
		loading = false;
	});

	function tokenizeQuery(value: string): QueryTerm[] {
		return value
			.split(/[^a-z0-9]+/g)
			.map((term) => term.trim())
			.filter((term) => term && !STOP_WORDS.has(term))
			.map((term) => ({
				raw: term,
				variants: expandTerm(term)
			}));
	}

	function expandTerm(term: string) {
		const variants = [term];

		if (term.endsWith('ies') && term.length > 4) {
			variants.push(`${term.slice(0, -3)}y`);
		}

		if (term.endsWith('s') && term.length > 3) {
			variants.push(term.slice(0, -1));
		}

		return variants;
	}

	function scoreEmoji(item: EmojiSearchItem, terms: QueryTerm[], fullQuery: string) {
		let score = 0;

		for (const term of terms) {
			const termScore = scoreExpandedTerm(item, term);

			if (termScore === 0) return 0;

			score += termScore;
		}

		score += scoreFullQuery(item, fullQuery);

		return score;
	}

	function scoreExpandedTerm(item: EmojiSearchItem, term: QueryTerm) {
		let bestScore = 0;

		for (const variant of term.variants) {
			bestScore = Math.max(bestScore, scoreTerm(item, variant));
		}

		return bestScore;
	}

	function scoreFullQuery(item: EmojiSearchItem, fullQuery: string) {
		let score = 0;

		if (item.emoji === fullQuery) score += SCORE.emojiExact;
		if (item.variants.includes(fullQuery)) score += SCORE.variantExact;

		if (item.name === fullQuery) score += SCORE.nameExactQuery;
		if (item.name.startsWith(fullQuery)) score += SCORE.nameStartsWithQuery;

		if (fullQuery.includes(' ') && item.name.includes(fullQuery)) {
			score += SCORE.namePhraseIncludesQuery;
		}

		if (item.subgroup.replaceAll('-', ' ') === fullQuery) {
			score += SCORE.subgroupExactQuery;
		}

		return score;
	}

	function scoreTerm(item: EmojiSearchItem, term: string) {
		if (item.emoji === term) return SCORE.emojiExact;
		if (item.variants.includes(term)) return SCORE.variantExact;

		if (item.name === term) return SCORE.nameExactTerm;

		// CLDR annotations are better semantic search than raw official-name tokens.
		// Example: "love" should prefer hearts/kisses over "love-you gesture".
		if (item.annotationTokens.includes(term)) return SCORE.annotationExact;

		if (item.subgroupTokens.includes(term)) return SCORE.subgroupExact;
		if (item.groupTokens.includes(term)) return SCORE.groupExact;

		// Official names are useful, but single-token hits can be misleading.
		// Full phrase matching is handled separately in scoreFullQuery().
		if (item.nameTokens.includes(term)) return SCORE.nameTokenExact;

		if (startsWithAny(item.annotationTokens, term)) return SCORE.annotationPrefix;
		if (startsWithAny(item.subgroupTokens, term)) return SCORE.subgroupPrefix;
		if (startsWithAny(item.nameTokens, term)) return SCORE.namePrefix;

		if (item.search.includes(term)) return SCORE.searchIncludes;

		return 0;
	}

	function startsWithAny(tokens: readonly string[], term: string) {
		return tokens.some((token) => token.startsWith(term));
	}

	function selectedEmoji(item: EmojiSearchItem) {
		const index = variantIndexes[item.emoji] ?? 0;
		return item.variants[index] ?? item.emoji;
	}

	function cycleVariant(event: WheelEvent, item: EmojiSearchItem) {
		if (item.variants.length <= 1) return;

		event.preventDefault();

		const currentIndex = variantIndexes[item.emoji] ?? 0;
		const direction = event.deltaY > 0 ? 1 : -1;
		const nextIndex = wrapIndex(currentIndex + direction, item.variants.length);

		variantIndexes = {
			...variantIndexes,
			[item.emoji]: nextIndex
		};
	}

	function wrapIndex(index: number, length: number) {
		return (index + length) % length;
	}

	async function copyEmoji(emoji: string) {
		const didCopy = await copy(emoji);

		if (!didCopy) {
			messageToast('error', 'Failed to copy');
			return;
		}

		copiedEmoji = emoji;
		messageToast('success', `Copied ${emoji} to clipboard`);

		setTimeout(() => {
			if (copiedEmoji === emoji) copiedEmoji = null;
		}, 500);
	}
</script>

<TextInput bind:value={query} label="Search emoji" placeholder="Search emoji…" />

{#if loading}
	<p class="text-center opacity-60">Loading emojis…</p>
{:else if results.length > 0}
	<div class="grid grid-cols-[repeat(auto-fill,3rem)] justify-between gap-2">
		{#each results as item (item.emoji)}
			{@const emoji = selectedEmoji(item)}
			{@const variantIndex = variantIndexes[item.emoji] ?? 0}
			{@const hasVariants = item.variants.length > 1}

			<button
				type="button"
				class="
					relative flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center
					overflow-hidden border bg-transparent text-3xl leading-none
					transition hover:border-accent hover:bg-accent-dark
					{copiedEmoji === emoji ? 'border-accent bg-accent-dark' : ''}
				"
				aria-label={`Copy ${item.name}`}
				title={item.name}
				onclick={() => copyEmoji(emoji)}
				onwheel={(event) => cycleVariant(event, item)}
			>
				<span class="block leading-none">{emoji}</span>

				{#if hasVariants}
					<span
						class="
							pointer-events-none absolute bottom-0 left-0
							border-t border-r px-0.5 text-xxs
						"
						aria-hidden="true"
					>
						{variantIndex + 1}/{item.variants.length}
					</span>
				{/if}
			</button>
		{/each}
	</div>
{:else}
	<p class="text-center opacity-60">No emojis found.</p>
{/if}
