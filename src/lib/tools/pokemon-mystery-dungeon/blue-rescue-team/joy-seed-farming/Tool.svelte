<script lang="ts">
	import { onMount } from 'svelte';
	import PokemonIcon from '$lib/components/pmd-blue/PokemonIcon.svelte';
	import pokemonsRaw from '$lib/data/pmd-blue/pokemons.json';
	import type { Pokemon } from '$lib/utils/pmd-blue.utils';

	const pokemons = pokemonsRaw as Pokemon[];
	const pokemonByName = new Map(pokemons.map((p) => [p.name, p]));

	function getRequiredPokemon(name: string): Pokemon {
		const pokemon = pokemonByName.get(name);

		if (!pokemon) {
			throw new Error(`Missing Pokémon data for ${name}`);
		}

		return pokemon;
	}

	const plusle = getRequiredPokemon('Plusle');
	const alakazam = getRequiredPokemon('Alakazam');
	const raikou = getRequiredPokemon('Raikou');

	type Token =
		| { type: 'move'; dir: string; count?: number; run?: boolean }
		| { type: 'action'; text: string }
		| { type: 'pickup'; text: string }
		| { type: 'warning'; text: string };

	type Floor = {
		floor: number;
		tokens: Token[];
	};

	const m = (dir: string, count = 1, run = false): Token => ({ type: 'move', dir, count, run });
	const A = (text: string): Token => ({ type: 'action', text });
	const P = (text: string): Token => ({ type: 'pickup', text });

	const floors: Floor[] = [
		{ floor: 1, tokens: [A('Quicksave')] },
		{
			floor: 2,
			tokens: [
				m('↙'),
				A('Teleport'),
				m('↖'),
				A('Attack'),
				A('Y'),
				A('Frustration'),
				m('↖', 1),
				m('↑'),
				P('Max Elixir'),
				m('→', 1)
			]
		},
		{
			floor: 3,
			tokens: [
				A('A×3'),
				A('Teleport'),
				m('→', 2, true),
				m('↓', 1, true),
				m('→', 7, true),
				m('↗', 3),
				m('→', 5),
				m('↘', 15),
				m('↓', 2),
				m('↙'),
				m('←'),
				P('Joy'),
				A('Teleport'),
				m('↑', 1, true),
				m('↗', 1, true),
				m('↑', 1, true),
				m('→', 1, true),
				m('↑', 3, true)
			]
		},
		{ floor: 4, tokens: [m('↓', 2, true), m('←', 1, true), m('↓', 2, true), m('→', 1, true), m('↘', 1, true)] },
		{
			floor: 5,
			tokens: [
				m('←', 3),
				m('↓', 2),
				P('Apple'),
				m('↓', 4, true),
				A('Frustration'),
				m('↓', 3, true),
				m('↙'),
				P('Joy'),
				m('↗'),
				m('↑', 2, true),
				m('↗', 1, true),
				m('→', 2, true),
				m('↑', 1, true),
				m('→', 1, true),
				m('↓', 1, true),
				m('→', 1, true),
				m('←', 1, true),
				m('↑', 1, true),
				m('→', 3, true),
				m('↗', 1, true)
			]
		},
		{
			floor: 6,
			tokens: [
				m('←', 1, true),
				m('↑', 1, true),
				m('→', 1, true),
				m('↑', 1, true),
				A('Teleport'),
				m('↑', 1, true),
				m('←', 1, true),
				m('↙'),
				P('Apple'),
				m('↘', 2, true)
			]
		},
		{ floor: 7, tokens: [m('↓', 1, true), m('↑', 1, true), A('Warp Trap'), m('↖'), m('←')] },
		{
			floor: 8,
			tokens: [
				m('↑', 1, true),
				A('Y'),
				A('Frustration'),
				m('→', 1, true),
				m('↑', 1, true),
				m('↑'),
				P('Joy'),
				m('↖'),
				m('↙', 2),
				m('↓', 1, true),
				m('←', 1, true),
				m('↓', 2, true),
				A('Quick Save'),
				m('↘', 1)
			]
		},
		{
			floor: 9,
			tokens: [
				m('↘', 3, true),
				m('→', 1, true),
				m('↗', 3, true),
				m('↓', 2, true),
				m('→', 6, true),
				m('↗', 1, true),
				m('→', 2, true),
				m('↘', 1, true),
				m('→', 2, true),
				m('↓', 1, true),
				m('→', 2, true),
				m('↗', 2, true),
				m('↗'),
				P('Joy'),
				m('↙'),
				A('Teleport'),
				m('←', 2),
				m('↑', 2, true)
			]
		},
		{ floor: 10, tokens: [A('Eat Apple'), A('Quick Save'), m('←', 2, true)] },
		{ floor: 11, tokens: [m('↗', 9), m('→', 6, true), m('↗', 1, true)] },
		{
			floor: 12,
			tokens: [
				m('↓', 2, true),
				m('↘', 1, true),
				m('↓', 2, true),
				m('↘', 1),
				m('→', 2, true),
				m('↗', 3),
				m('↑', 2),
				m('←', 2),
				P('Joy'),
				A('Teleport'),
				m('←', 1, true),
				A('Quick Save'),
				m('↖', 1)
			]
		},
		{
			floor: 13,
			tokens: [
				m('→', 2, true),
				m('↑', 1, true),
				m('→', 1, true),
				m('↑', 1, true),
				m('→', 2, true),
				m('↗', 1, true),
				m('→', 1, true),
				m('↑', 2, true),
				m('↖', 2, true),
				m('←', 2, true),
				m('↑'),
				P('Joy'),
				A('Teleport'),
				m('↖', 2)
			]
		},
		{ floor: 14, tokens: [m('←', 1), A('Step Apple'), A('Ground Eat Apple'), A('Teleport'), m('↓', 1)] },
		{
			floor: 15,
			tokens: [
				m('↘', 6, true),
				m('→', 1, true),
				m('↗'),
				P('Apple'),
				m('↘', 1, true),
				m('→', 12),
				m('↗'),
				P('Joy'),
				A('A'),
				A('Teleport'),
				m('↘', 1, true),
				m('→', 2, true),
				m('↗', 2, true),
				m('→', 2, true),
				A('Eat Apple'),
				m('→', 1)
			]
		},
		{ floor: 16, tokens: [A('A'), A('Teleport'), m('↙', 2, true), m('↓', 3, true), m('↘', 1, true)] },
		{
			floor: 17,
			tokens: [
				A('Teleport'),
				m('→', 1, true),
				m('↑', 2),
				m('→', 4),
				P('Joy'),
				m('↖', 2),
				m('↑', 1, true),
				m('→', 1, true),
				m('↑', 1, true),
				m('↗', 1),
				m('→', 2, true),
				m('↗', 1, true),
				m('→', 3, true),
				m('↘', 2),
				m('→', 1, true),
				A('Eat Apple'),
				m('↗', 1)
			]
		},
		{ floor: 18, tokens: [m('↘', 1, true), m('↓', 4, true)] },
		{
			floor: 19,
			tokens: [
				m('↖'),
				m('←', 2, true),
				m('↑', 1, true),
				m('↓', 1, true),
				m('←', 3, true),
				m('↖', 2, true),
				m('↑', 1, true)
			]
		},
		{
			floor: 20,
			tokens: [
				m('↓', 1, true),
				m('→', 1, true),
				m('↓', 1, true),
				m('→', 1, true),
				m('↓', 1, true),
				m('↘', 4),
				m('→', 1, true),
				m('↗', 3),
				P('Joy'),
				m('↗'),
				A('Teleport'),
				A('Quick Save'),
				m('↘', 1)
			]
		},
		{ floor: 21, tokens: [m('↘', 2), m('→'), m('↗', 2), m('↑', 3), m('←', 2, true), m('↙', 1, true)] },
		{
			floor: 22,
			tokens: [
				m('←'),
				A('Y'),
				A('Frustration'),
				m('←', 2, true),
				m('↓', 1, true),
				m('↙', 3, true),
				m('↓', 1, true),
				m('↓', 1),
				P('Joy'),
				m('↘'),
				m('→', 5),
				P('Joy'),
				A('Teleport'),
				m('→', 1, true),
				m('↗', 1, true),
				m('↑', 2, true),
				m('←', 2),
				m('↖', 3),
				m('←', 1, true),
				m('↖', 2, true),
				A('Quick Save'),
				m('↖', 1)
			]
		},
		{
			floor: 23,
			tokens: [
				m('↙', 2, true),
				m('↘', 1, true),
				m('↓', 2, true),
				m('→', 3, true),
				m('↓', 1, true),
				m('→', 1, true),
				m('↓', 1, true),
				m('→', 1, true),
				m('↗'),
				m('→', 1, true),
				m('↘'),
				m('→', 6),
				P('Joy'),
				m('↗', 15),
				m('→', 7),
				P('Gummi'),
				A('Teleport'),
				m('↗', 6),
				A('Eat Gummi'),
				A('Drink Elixir'),
				A('Quick Save'),
				m('↑', 1)
			]
		},
		{
			floor: 24,
			tokens: [
				m('↑', 1, true),
				m('←', 1, true),
				m('↑', 4, true),
				A('Y'),
				A('Frustration'),
				m('↗', 1, true),
				m('↑', 1, true),
				m('→', 1, true),
				m('↑', 1, true),
				m('↗', 1, true)
			]
		},
		{
			floor: 25,
			tokens: [
				m('←', 1, true),
				m('↑', 1, true),
				m('←', 4, true),
				m('↙'),
				P('Joy'),
				A('Teleport'),
				A('Teleport'),
				m('↑'),
				P('Joy'),
				m('↓', 3, true),
				m('↘', 3, true),
				m('↓', 1, true),
				m('↘', 1, true),
				A('Quick Save'),
				m('↓', 1)
			]
		},
		{
			floor: 26,
			tokens: [
				A('Frustration'),
				m('↙', 2, true),
				m('←', 1, true),
				m('↓', 1, true),
				m('↓', 2),
				m('↙', 1, true),
				m('←', 1, true),
				m('↖', 2, true)
			]
		},
		{
			floor: 27,
			tokens: [
				m('←', 1, true),
				m('↑', 1, true),
				m('←', 4, true),
				m('↙'),
				P('Joy'),
				A('Teleport'),
				A('Teleport'),
				m('↑'),
				P('Joy'),
				A('Escape Orb if Raikou not recruited'),
				m('↓', 3, true),
				m('↘', 3, true),
				m('↓', 1, true),
				m('↘', 1, true),
				m('↓', 1, true)
			]
		},
		{ floor: 28, tokens: [A('A'), A('A'), A('Teleport'), m('←', 2, true), m('↙', 1, true)] },
		{ floor: 29, tokens: [m('↙', 3), m('↓', 4)] },
		{ floor: 30, tokens: [A('Done')] }
	];

	let current = 0;

	function next() {
		if (current < floors.length - 1) current++;
	}

	function prev() {
		if (current > 0) current--;
	}

	function selectFloor(index: number) {
		current = index;
	}

	function handleKey(e: KeyboardEvent) {
		if (e.code === 'Space') {
			e.preventDefault();
			next();
		}
		if (e.code === 'ArrowLeft') prev();
		if (e.code === 'ArrowRight') next();
	}

	onMount(() => {
		window.addEventListener('keydown', handleKey);
		return () => window.removeEventListener('keydown', handleKey);
	});
</script>

<div class="flex flex-col gap-6 border px-3 py-2">
	<div class="flex items-center gap-2">
		If <div class="aspect-square min-w-8"><PokemonIcon pokemon={plusle} /></div>
		not recruited:
		<div>1?1N F3F? ?8?+ 5R?H 64?6 PK?W</div>
	</div>

	<div class="flex items-center gap-2">
		Items: Surf HM, Mobile Scarf, Cleanse Orb, Escape Orb (If <div class="aspect-square min-w-8">
			<PokemonIcon pokemon={raikou} />
		</div>
		not recruited)
	</div>

	<div class="flex items-center gap-2">
		Use <div class="aspect-square min-w-8"><PokemonIcon pokemon={alakazam} /></div>
		Teleport, Frustration ×3 (linked)
	</div>

	<div class="">
		Credits to
		<a href="https://youtu.be/jImNyd4X-WE" target="_blank" rel="noreferrer" class="text-accent hover:underline">
			Mystaldi
		</a>
	</div>
</div>

<div class="flex flex-col gap-1">
	{#each floors as floor, i (i)}
		<button
			type="button"
			class={`cursor-pointer border px-3 py-2 ${i === current ? 'text-white' : 'opacity-30'}`}
			aria-current={i === current ? 'true' : undefined}
			onclick={() => selectFloor(i)}
		>
			<div class="mb-1 font-bold">{floor.floor}F</div>

			<div class="flex flex-wrap gap-4">
				{#each floor.tokens as t}
					{#if t.type === 'move'}
						<span class={t.run ? 'font-bold text-accent ' : ''}>
							<span class="text-xl">{t.dir}</span><span class="text-lg"
								>{t.count && t.count > 1 ? `${t.count}` : ''}</span
							>
						</span>
					{:else if t.type === 'pickup'}
						<span>[{t.text}]</span>
					{:else if t.type === 'action'}
						<span>({t.text})</span>
					{/if}
				{/each}
			</div>
		</button>
	{/each}
</div>
