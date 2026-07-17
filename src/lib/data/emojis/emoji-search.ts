import { createJsonLoader } from '$lib/data/json-loader';
import emojiSearchUrl from './emoji-search.json?url';

export type EmojiSearchItem = {
	emoji: string;
	name: string;
	group: string;
	subgroup: string;
	variants: readonly string[];
	nameTokens: readonly string[];
	groupTokens: readonly string[];
	subgroupTokens: readonly string[];
	annotationTokens: readonly string[];
	search: string;
};

export const loadEmojiSearchItems = createJsonLoader<EmojiSearchItem[]>(emojiSearchUrl);
