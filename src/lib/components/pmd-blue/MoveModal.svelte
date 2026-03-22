<script lang="ts">
	import Modal from '$lib/components/ui/modal.svelte';
	import FlagBadges from './FlagBadges.svelte';
	import PokemonIcon from '$lib/components/pmd-blue/PokemonIcon.svelte';

	import moveFlags from "$lib/data/pmd-blue/move-flags.json";
	import pokemonsRaw from "$lib/data/pmd-blue/pokemons.json";
	import pokemonMovesRaw from "$lib/data/pmd-blue/pokemon-moves.json";

	interface Move {
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
		min_hits?: number;
		max_hits?: number;
		hit_count_mode?: string;
	}

	interface PokemonMoveEntry {
		pokemon_id: number;
		levelup_moves: { move_id: number; level: number }[];
		aux_moves: number[];
	}

	interface Pokemon {
		id: number;
		game_id: number;
		name: string;
		icon: string;
	}

	interface Props {
		move: Move;
		onClose?: () => void;
	}

	let { move, onClose }: Props = $props();

	const pokemons = pokemonsRaw as Pokemon[];
	const pokemonMoves = pokemonMovesRaw as PokemonMoveEntry[];

	const pokemonById = new Map(pokemons.map(p => [p.game_id, p]));

	const damageMap = Object.fromEntries(moveFlags.damageFlags.map(f => [f.id, f.description]));
	const otherMap = Object.fromEntries(moveFlags.otherFlags.map(f => [f.id, f.description]));

	const typeColor = {
		Fire: "bg-red-700",
		Water: "bg-blue-700",
		Grass: "bg-green-700",
		Electric: "bg-yellow-500",
		Ice: "bg-cyan-400",
		Fighting: "bg-orange-700",
		Poison: "bg-purple-700",
		Ground: "bg-yellow-700",
		Flying: "bg-sky-500",
		Psychic: "bg-pink-600",
		Bug: "bg-lime-600",
		Rock: "bg-yellow-800",
		Ghost: "bg-indigo-700",
		Dragon: "bg-indigo-900",
		Dark: "bg-neutral-800",
		Steel: "bg-gray-400",
		Normal: "bg-neutral-500",
		Typeless: "bg-neutral-400"
	};

	function formatHits(move: Move) {
		const min = move.min_hits;
		const max = move.max_hits;
		const mode = move.hit_count_mode;

		if (min != null && max != null) return min === max ? `${min}` : `${min}-${max}`;
		if (min != null) return `${min}`;
		if (max != null) return `${max}`;
		return '—';
	}

	function formatHitMode(mode?: string) {
		if (!mode) return '—';
		if (mode === 'fixed') return 'Fixed';
		if (mode === 'range') return 'Range';
		return mode;
	}

	// 🔥 Pokemon learning this move
	const learnedBy = $derived.by(() => {
		if (!move.id) return { levelUp: [], tm: [] };

		const levelUp: Pokemon[] = [];
		const tm: Pokemon[] = [];

		for (const entry of pokemonMoves) {
			const p = pokemonById.get(entry.pokemon_id);
			if (!p) continue;

			if (entry.levelup_moves?.some(m => m.move_id === move.id)) {
				levelUp.push(p);
			}

			if (entry.aux_moves?.includes(move.id)) {
				tm.push(p);
			}
		}

		return { levelUp, tm };
	});
</script>

<Modal title={move?.name} {onClose}>
	<div class="flex items-center gap-2 mb-4">
		<div class="w-3 h-3 rounded-sm {typeColor[move.type] ?? 'bg-neutral-500'}"></div>
		<div class="text-sm">{move.type} · {move.class}</div>
	</div>

	<h3 class="font-bold mb-1">Stats</h3>
	<div class="grid grid-cols-2 sm:grid-cols-3 gap-1 mb-4 text-xs">
		<div>Power: <b>{move.power}</b></div>
		<div>PP: <b>{move.maxPP}</b></div>
		<div>Crit: <b>{move.crit}</b></div>
		<div>Acc1: <b>{move.acc1}</b></div>
		<div>Acc2: <b>{move.acc2}</b></div>
		<div>Targets: <b>{move.targets}</b></div>
		<div>Hits: <b>{formatHits(move)}</b></div>
		<div>Hit Mode: <b>{formatHitMode(move.hit_count_mode)}</b></div>
	</div>

	<h3 class="font-bold mb-1">Flags</h3>
	<div class="flex flex-row gap-4 text-xs">
		<div>
			<div class="font-semibold mb-1">Damage Flags</div>
			<FlagBadges flags={move.damageFlags} map={damageMap} variant="damage" />
		</div>

		<div>
			<div class="font-semibold mb-1">Other Flags</div>
			<FlagBadges flags={move.otherFlags} map={otherMap} variant="other" />
		</div>
	</div>

	<h3 class="font-bold mb-2 mt-4">Learned By</h3>

	<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
		{#if learnedBy.levelUp.length}
			<div>
				<div class="font-semibold mb-1">Level Up</div>

				<div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
					{#each learnedBy.levelUp as p (p.id)}
						<PokemonIcon pokemon={p} />
					{/each}
				</div>
			</div>
		{/if}

		{#if learnedBy.tm.length}
			<div>
				<div class="font-semibold mb-1">TM</div>

				<div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
					{#each learnedBy.tm as p (p.id)}
						<PokemonIcon pokemon={p} />
					{/each}
				</div>
			</div>
		{/if}

		{#if !learnedBy.levelUp.length && !learnedBy.tm.length}
			<div class="opacity-70">No Pokémon learn this move</div>
		{/if}
	</div>
</Modal>