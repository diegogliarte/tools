import { createJsonLoader } from '$lib/data/json-loader';
import type { Pokemon } from '$lib/utils/pmd-blue.utils';

import abilitiesUrl from './abilities.json?url';
import moveFlagsUrl from './move-flags.json?url';
import movesUrl from './moves.json?url';
import pokemonMovesUrl from './pokemon-moves.json?url';
import pokemonsUrl from './pokemons.json?url';

export type Ability = {
	id: number;
	name: string;
	description?: string;
};

export type Move = {
	id?: number;
	name: string;
	type: string;
	class: string;
	power: number;
	maxPP: number;
	acc1: number;
	acc2: number;
	crit: number;
	damageFlags: number[];
	otherFlags: number[];
	targets: string;
	description?: string;
	min_hits?: number | null;
	max_hits?: number | null;
	hit_count_mode?: string | null;
};

export type PokemonMoves = {
	pokemon_id: number;
	levelup_moves?: { level: number; move_id: number }[];
	aux_moves?: number[];
};

export type MoveFlags = {
	damageFlags: { id: number; description: string }[];
	otherFlags: { id: number; description: string }[];
};

const typeColor = {
	Fire: 'bg-red-700',
	Water: 'bg-blue-700',
	Grass: 'bg-green-700',
	Electric: 'bg-yellow-500',
	Ice: 'bg-cyan-400',
	Fighting: 'bg-orange-700',
	Poison: 'bg-purple-700',
	Ground: 'bg-yellow-700',
	Flying: 'bg-sky-500',
	Psychic: 'bg-pink-600',
	Bug: 'bg-lime-600',
	Rock: 'bg-yellow-800',
	Ghost: 'bg-indigo-700',
	Dragon: 'bg-indigo-900',
	Dark: 'bg-neutral-800',
	Steel: 'bg-gray-400',
	Normal: 'bg-neutral-500',
	Typeless: 'bg-neutral-400'
} as const;

export function getMoveTypeColor(type: string) {
	return typeColor[type as keyof typeof typeColor] ?? 'bg-neutral-500';
}

export const loadAbilities = createJsonLoader<Ability[]>(abilitiesUrl);
export const loadMoveFlags = createJsonLoader<MoveFlags>(moveFlagsUrl);
export const loadMoves = createJsonLoader<Move[]>(movesUrl);
export const loadPokemonMoves = createJsonLoader<PokemonMoves[]>(pokemonMovesUrl);
export const loadPokemons = createJsonLoader<Pokemon[]>(pokemonsUrl);

export async function loadPmdCoreData() {
	const [pokemons, moves, pokemonMoves, abilities] = await Promise.all([
		loadPokemons(),
		loadMoves(),
		loadPokemonMoves(),
		loadAbilities()
	]);

	return { pokemons, moves, pokemonMoves, abilities };
}
