export type PadzStatBlock = {
	HP: number;
	ATK: number;
	DEF: number;
};

export type PadzBaseStats = {
	lv1: PadzStatBlock;
	lvmax: PadzStatBlock;
};

export type PadzEvolutionMaterial = {
	id: number;
	name: string;
	count: number;
};

export type PadzSkillRef = number | string | null | undefined;

export type PadzMonsterSkills = {
	active?: PadzSkillRef;
	leader?: PadzSkillRef;
};

export type PadzMonster = {
	id: number;
	slug: string;
	name: string;
	description?: string;
	attributes: string[];
	type?: string;
	level_cap?: number;
	base_stats: PadzBaseStats;
	skills?: PadzMonsterSkills;
	pre_evolutions?: number[];
	evolutions?: number[];
	evolution_materials?: PadzEvolutionMaterial[];
};

export type PadzSkill = {
	id: number | string;
	slug?: string;
	category: string;
	name: string;
	description?: string;
	type?: string | null;
	damage_type?: string | null;
	cost?: number | null;
	sp_cost?: number | null;
	accuracy?: number | null;
	crit_rate?: number | null;
	power?: number | null;
	hit_count?: number | null;
	target?: string | null;
	[key: string]: unknown;
};

export type PadzStatLevel = 'lv1' | 'lvmax';

const STATIC_BASE = '/puzzle-and-dragons-z';

const TYPE_ICON_MAP: Record<string, string> = {
	'Genuine Dragon': 'true_dragon',
	'True Dragon': 'true_dragon',
	genuine_dragon: 'true_dragon',
	true_dragon: 'true_dragon',

	'Phantom Dragon': 'phantom_dragon',
	phantom_dragon: 'phantom_dragon',
	ghost_dragon: 'phantom_dragon',

	Animal: 'animal',
	animal: 'animal',

	Mutant: 'mutant',
	mutant: 'mutant',

	Deity: 'deity',
	Divine: 'deity',
	deity: 'deity',
	divine: 'deity',

	Dragonoid: 'dragonoid',
	dragonoid: 'dragonoid'
};

const TYPE_LABEL_MAP: Record<string, string> = {
	genuine_dragon: 'Genuine Dragon',
	true_dragon: 'Genuine Dragon',
	phantom_dragon: 'Phantom Dragon',
	ghost_dragon: 'Phantom Dragon',
	animal: 'Animal',
	mutant: 'Mutant',
	deity: 'Deity',
	divine: 'Deity',
	dragonoid: 'Dragonoid'
};

const ELEMENT_LABEL_MAP: Record<string, string> = {
	fire: 'Fire',
	water: 'Water',
	wood: 'Wood',
	light: 'Light',
	dark: 'Dark',
	heart: 'Heart'
};

export function getPadzMonsterIcon(id: number | string) {
	return `${STATIC_BASE}/icons/${id}.png`;
}

export function getPadzElementIcon(element: string) {
	return `${STATIC_BASE}/elements/${normaliseAssetKey(element)}.png`;
}

export function getPadzTypeIcon(type: string) {
	const key = TYPE_ICON_MAP[type] ?? TYPE_ICON_MAP[normaliseAssetKey(type)] ?? normaliseAssetKey(type);
	return `${STATIC_BASE}/types/${key}.png`;
}

export function formatPadzType(type?: string | null) {
	if (!type) return '—';
	return TYPE_LABEL_MAP[type] ?? TYPE_LABEL_MAP[normaliseAssetKey(type)] ?? type;
}

export function formatPadzElement(element?: string | null) {
	if (!element) return '—';
	return ELEMENT_LABEL_MAP[normaliseAssetKey(element)] ?? element;
}

export function formatPadzSkillCategory(category?: string | null) {
	if (!category) return '—';

	return category
		.split(/[_-]+/g)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}

export function formatPadzNumber(value: unknown) {
	if (value === null || value === undefined || value === '') return '—';
	return String(value);
}

export function getPadzSkillCost(skill: PadzSkill) {
	return skill.cost ?? skill.sp_cost ?? null;
}

export function getPadzStatTotal(stats: PadzStatBlock) {
	return stats.HP + stats.ATK + stats.DEF;
}

export function getPadzSkillSearchText(skill: PadzSkill) {
	return [
		skill.id,
		skill.slug,
		skill.name,
		skill.category,
		skill.type,
		skill.damage_type,
		skill.target,
		skill.description
	]
		.filter(Boolean)
		.join(' ');
}

export function getPadzMonsterSearchText(monster: PadzMonster) {
	return [
		monster.id,
		monster.name,
		monster.slug,
		monster.type,
		...(monster.attributes ?? []),
		monster.description
	]
		.filter(Boolean)
		.join(' ');
}

export function normaliseAssetKey(value: string) {
	return value
		.trim()
		.toLowerCase()
		.replace(/&/g, 'and')
		.replace(/[^a-z0-9]+/g, '_')
		.replace(/^_+|_+$/g, '');
}

export function slugifyPadz(value: string) {
	return value
		.trim()
		.toLowerCase()
		.replace(/&/g, 'and')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

export function padzSkillMatchesRef(skill: PadzSkill, ref: PadzSkillRef, preferredCategory?: string) {
	if (ref === null || ref === undefined || ref === '') return false;

	const refText = String(ref);
	const skillId = String(skill.id);
	const skillNameSlug = slugifyPadz(skill.name);
	const skillSlug = skill.slug ? String(skill.slug) : '';

	const category = preferredCategory ?? skill.category;

	const possibleRefs = new Set(
		[
			skillId,
			skillSlug,
			`${skill.category}-${skillId}`,
			`${skill.category}-${skillId}-${skillNameSlug}`,
			category ? `${category}-${skillId}` : '',
			category ? `${category}-${skillId}-${skillNameSlug}` : ''
		].filter(Boolean)
	);

	return possibleRefs.has(refText);
}

export function findPadzSkillByRef(
	skills: PadzSkill[],
	ref: PadzSkillRef,
	preferredCategory: 'active' | 'leader'
) {
	const categoryMatch = skills.find(
		(skill) => skill.category === preferredCategory && padzSkillMatchesRef(skill, ref, preferredCategory)
	);

	if (categoryMatch) return categoryMatch;

	return (
		skills.find((skill) => padzSkillMatchesRef(skill, ref, preferredCategory)) ??
		null
	);
}