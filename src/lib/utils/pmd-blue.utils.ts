export type EvolutionLink = {
	to: string;
	method: string;
};

export type EvolvesFromEntry = {
	from: string;
	method: string;
};

export type EncounterLocation = {
	dungeon: string;
	floors?: string;
};

export type Pokemon = {
	id: number;
	game_id: number;
	name: string;
	icon: string;

	recruit: {
		rate: number;
		note: string | null;
	};

	encounter: {
		friendArea: string | null;
		locations: EncounterLocation[];
		note: string | null;
	};

	evolution?: EvolutionLink[];

	ability_1_id: number;
	ability_2_id: number | null;

	// stats
	base_hp: number;
	base_atk: number;
	base_sp_atk: number;
	base_def: number;
	base_sp_def: number;

	stats_growth: {
		hp: number[];
		atk: number[];
		def: number[];
		sp_atk: number[];
		sp_def: number[];
	};
};

// --- STATS HELPERS ---
export function computeStatAtLevel(base: number, growth: number[], level: number): number {
	let total = base;

	for (let i = 1; i < level && i < growth.length; i++) {
		total += growth[i] ?? 0;
	}

	return total;
}

export function computeGrowthAtLevel(growth: number[], level: number): number {
	let total = 0;

	for (let i = 1; i < level && i < growth.length; i++) {
		total += growth[i] ?? 0;
	}

	return total;
}

export function computeLevel100Stats(p: Pokemon) {
	return {
		hp: computeStatAtLevel(p.base_hp, p.stats_growth.hp, 100),
		atk: computeStatAtLevel(p.base_atk, p.stats_growth.atk, 100),
		def: computeStatAtLevel(p.base_def, p.stats_growth.def, 100),
		sp_atk: computeStatAtLevel(p.base_sp_atk, p.stats_growth.sp_atk, 100),
		sp_def: computeStatAtLevel(p.base_sp_def, p.stats_growth.sp_def, 100)
	};
}

// --- EVOLUTION HELPERS ---
export function buildEvolvesFromMap(pokemons: Pokemon[]) {
	const map: Record<string, EvolvesFromEntry[]> = {};

	for (const p of pokemons) {
		if (!p.evolution?.length) continue;

		for (const evo of p.evolution) {
			if (!map[evo.to]) map[evo.to] = [];

			map[evo.to].push({
				from: p.name,
				method: evo.method
			});
		}
	}

	return map;
}

// --- RECRUIT HELPERS ---
export function levelBonus(level: number) {
	if (level >= 90) return 24;
	if (level >= 80) return 17.5;
	if (level >= 70) return 15;
	if (level >= 60) return 12.5;
	if (level >= 50) return 10;
	if (level >= 40) return 7.5;
	if (level >= 30) return 5;
	return 0;
}

export function computeRecruitRate(pokemon: Pokemon, level: number, friendBow: boolean) {
	let rate = pokemon.recruit.rate;

	rate += levelBonus(level);

	if (friendBow) rate += 10;

	return rate;
}
