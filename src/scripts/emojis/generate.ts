import fs from 'node:fs';
import path from 'node:path';

const EMOJI_TEST_URL = 'https://www.unicode.org/Public/emoji/latest/emoji-test.txt';
const CLDR_ANNOTATIONS_URL = 'https://raw.githubusercontent.com/unicode-org/cldr/main/common/annotations/en.xml';

const OUT_PATH = path.join('src', 'lib', 'data', 'emojis', 'emoji-search.json');

type ParsedEmoji = {
	emoji: string;
	name: string;
	group: string;
	subgroup: string;
	status: string;
	codePoints: string;
	baseKey: string;
};

type EmojiItem = {
	emoji: string;
	name: string;
	group: string;
	subgroup: string;
	variants: string[];
	nameTokens: string[];
	groupTokens: string[];
	subgroupTokens: string[];
	annotationTokens: string[];
	search: string;
};

const STOP_WORDS = new Set(['a', 'an', 'and', 'for', 'in', 'of', 'on', 'the', 'with']);

const SKIN_TONE_CODE_POINTS = new Set(['1F3FB', '1F3FC', '1F3FD', '1F3FE', '1F3FF']);
const IGNORED_VARIATION_CODE_POINTS = new Set(['FE0F']);

function clean(value = '') {
	return value.replace(/\s+/g, ' ').trim();
}

function normalize(value: string) {
	return clean(value).toLowerCase().normalize('NFKD').replace(/['’]/g, '');
}

function decodeXml(value: string) {
	return value
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'");
}

function addTokenVariants(tokens: Set<string>, token: string) {
	if (!token || STOP_WORDS.has(token)) return;

	tokens.add(token);

	if (token.endsWith('ies') && token.length > 4) {
		tokens.add(`${token.slice(0, -3)}y`);
	}

	if (token.endsWith('s') && token.length > 3) {
		tokens.add(token.slice(0, -1));
	}
}

function tokenize(...values: string[]) {
	const tokens = new Set<string>();

	for (const value of values) {
		const rawTokens = normalize(value)
			.split(/[^a-z0-9]+/g)
			.filter(Boolean);

		for (const token of rawTokens) {
			addTokenVariants(tokens, token);
		}
	}

	return [...tokens].sort();
}

function makeBaseKey(codePoints: string) {
	return codePoints
		.split(/\s+/)
		.map((codePoint) => codePoint.toUpperCase())
		.filter((codePoint) => !SKIN_TONE_CODE_POINTS.has(codePoint))
		.filter((codePoint) => !IGNORED_VARIATION_CODE_POINTS.has(codePoint))
		.join(' ');
}

function isSkinToneVariant(codePoints: string) {
	return codePoints
		.split(/\s+/)
		.map((codePoint) => codePoint.toUpperCase())
		.some((codePoint) => SKIN_TONE_CODE_POINTS.has(codePoint));
}

function statusPriority(status: string) {
	if (status === 'fully-qualified') return 0;
	if (status === 'minimally-qualified') return 1;
	if (status === 'unqualified') return 2;

	return 3;
}

function parseCldrAnnotations(source: string) {
	const annotations = new Map<string, string[]>();

	const annotationRegex = /<annotation\s+cp="([^"]+)"(?![^>]*type="tts")[^>]*>([\s\S]*?)<\/annotation>/g;

	for (const match of source.matchAll(annotationRegex)) {
		const emoji = decodeXml(match[1]);
		const rawKeywords = decodeXml(match[2]);

		const keywords = rawKeywords
			.split('|')
			.map((keyword) => clean(keyword))
			.filter(Boolean);

		annotations.set(emoji, keywords);
	}

	return annotations;
}

function parseEmojiTest(source: string) {
	const parsed: ParsedEmoji[] = [];

	let group = '';
	let subgroup = '';

	for (const rawLine of source.split('\n')) {
		const line = rawLine.trim();

		if (!line) continue;

		if (line.startsWith('# group:')) {
			group = clean(line.replace('# group:', ''));
			continue;
		}

		if (line.startsWith('# subgroup:')) {
			subgroup = clean(line.replace('# subgroup:', ''));
			continue;
		}

		if (line.startsWith('#')) continue;
		if (group === 'Component') continue;

		const match = line.match(/^([0-9A-F ]+)\s*;\s*([^#]+)\s*#\s*(\S+)\s+E[\d.]+\s+(.+)$/i);

		if (!match) continue;

		const [, rawCodePoints, rawStatus, emoji, rawName] = match;

		const codePoints = clean(rawCodePoints).toUpperCase();
		const status = clean(rawStatus);
		const name = clean(rawName);

		parsed.push({
			emoji,
			name,
			group,
			subgroup,
			status,
			codePoints,
			baseKey: makeBaseKey(codePoints)
		});
	}

	return parsed;
}

function buildSearchItems(parsed: ParsedEmoji[], cldrAnnotations: Map<string, string[]>) {
	const groups = new Map<string, ParsedEmoji[]>();

	for (const item of parsed) {
		const existing = groups.get(item.baseKey) ?? [];
		existing.push(item);
		groups.set(item.baseKey, existing);
	}

	const items: EmojiItem[] = [];

	for (const variants of groups.values()) {
		variants.sort((a, b) => {
			const skinToneDelta = Number(isSkinToneVariant(a.codePoints)) - Number(isSkinToneVariant(b.codePoints));

			if (skinToneDelta !== 0) return skinToneDelta;

			const statusDelta = statusPriority(a.status) - statusPriority(b.status);

			if (statusDelta !== 0) return statusDelta;

			return a.codePoints.localeCompare(b.codePoints);
		});

		const base =
			variants.find((variant) => variant.status === 'fully-qualified' && !isSkinToneVariant(variant.codePoints)) ??
			variants.find((variant) => !isSkinToneVariant(variant.codePoints)) ??
			variants[0];

		const uniqueVariants = [...new Set(variants.map((variant) => variant.emoji))];

		const annotationValues = variants.flatMap((variant) => cldrAnnotations.get(variant.emoji) ?? []);
		const nameTokens = tokenize(base.name);
		const groupTokens = tokenize(base.group);
		const subgroupTokens = tokenize(base.subgroup);
		const annotationTokens = tokenize(...annotationValues);

		const search = [
			base.emoji,
			base.name,
			base.group,
			base.subgroup,
			...uniqueVariants,
			...nameTokens,
			...groupTokens,
			...subgroupTokens,
			...annotationTokens
		]
			.join(' ')
			.toLowerCase();

		items.push({
			emoji: base.emoji,
			name: base.name,
			group: base.group,
			subgroup: base.subgroup,
			variants: uniqueVariants,
			nameTokens,
			groupTokens,
			subgroupTokens,
			annotationTokens,
			search
		});
	}

	return items;
}

async function fetchText(url: string) {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
	}

	return response.text();
}

async function loadSources() {
	const localEmojiTestPath = process.argv[2];
	const localCldrPath = process.argv[3];

	const emojiTest = localEmojiTestPath ? fs.readFileSync(localEmojiTestPath, 'utf-8') : await fetchText(EMOJI_TEST_URL);

	const cldrAnnotations = localCldrPath
		? fs.readFileSync(localCldrPath, 'utf-8')
		: await fetchText(CLDR_ANNOTATIONS_URL);

	return {
		emojiTest,
		cldrAnnotations
	};
}

function writeOutput(emojis: EmojiItem[]) {
	const outDir = path.dirname(OUT_PATH);

	fs.mkdirSync(outDir, { recursive: true });

	const file = `${JSON.stringify(emojis, null, '\t')}\n`;

	fs.writeFileSync(OUT_PATH, file);
}

async function run() {
	console.log('Loading Unicode emoji data...');

	const { emojiTest, cldrAnnotations } = await loadSources();

	console.log('Parsing CLDR annotations...');
	const annotations = parseCldrAnnotations(cldrAnnotations);

	console.log('Parsing emoji-test.txt...');
	const parsed = parseEmojiTest(emojiTest);

	console.log('Building search index...');
	const emojis = buildSearchItems(parsed, annotations);

	writeOutput(emojis);

	console.log(`Generated ${emojis.length} searchable emoji entries`);
	console.log(`Saved → ${OUT_PATH}`);

	const loveResults = emojis
		.map((emoji) => ({
			emoji,
			score: Number(emoji.annotationTokens.includes('love')) * 70 + Number(emoji.nameTokens.includes('love')) * 35
		}))
		.filter((result) => result.score > 0)
		.sort((a, b) => b.score - a.score)
		.slice(0, 12)
		.map((result) => `${result.emoji.emoji} ${result.emoji.name}`);

	console.log(`Sample "love" matches: ${loveResults.join(', ')}`);
}

run().catch((error) => {
	console.error(error);
	process.exit(1);
});
