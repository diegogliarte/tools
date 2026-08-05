<script lang="ts">
	import TextInput from '$lib/components/ui/text-input.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import CopyButton from '$lib/components/ui/copy-button.svelte';
	import DigimonIcon from '$lib/components/digimon-story-ts/DigimonIcon.svelte';
	import { tooltipAction } from '$lib/actions/tooltip';
	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';

	import MdiChevronRight from '~icons/mdi/chevron-right';
	import MdiClose from '~icons/mdi/close';
	import MdiDiceMultiple from '~icons/mdi/dice-multiple';
	import MdiChevronUp from '~icons/mdi/chevron-up';
	import MdiChevronDown from '~icons/mdi/chevron-down';
	import MdiLock from '~icons/mdi/lock';
	import MdiLockOpenVariant from '~icons/mdi/lock-open-variant';

	import { loadDigimon } from '$lib/data/digimon-story-ts/data';
	import type { Digimon } from '$lib/utils/digimon-story-ts.utils';
	import { getEvolutions, getPreEvolutions, indexDigimonById } from '$lib/utils/digimon-story-ts.utils';
	import { createLocalStorageState } from '$lib/states/local-storage.svelte';

	type Chain = {
		ids: number[];
		locked: boolean;
	};

	function normalizeChain(value: unknown): Chain | null {
		if (Array.isArray(value) && value.every((id) => typeof id === 'number')) {
			return { ids: value, locked: false };
		}

		if (!value || typeof value !== 'object') return null;

		const chain = value as Partial<Chain>;
		if (!Array.isArray(chain.ids) || !chain.ids.every((id) => typeof id === 'number')) return null;

		const boundaryState = chain as Partial<Chain> & { leftLocked?: boolean; rightLocked?: boolean };
		return {
			ids: chain.ids,
			locked: Boolean(chain.locked || (boundaryState.leftLocked && boundaryState.rightLocked))
		};
	}

	function normalizeTeamState(value: unknown): Chain[] | null {
		let values: unknown[];

		if (Array.isArray(value)) {
			values = value;
		} else if (value && typeof value === 'object') {
			values = Object.values(value);
		} else {
			return null;
		}

		const chains = values.map(normalizeChain);
		if (chains.some((chain) => chain === null)) return null;

		return chains as Chain[];
	}

	const team = createLocalStorageState<Chain[]>([], {
		fallbackKeys: ['tool-state:/digimon-story-ts/team-builder', 'digimon-story-ts:team-builder'],
		normalize: normalizeTeamState
	});

	function setTeam(next: Chain[]) {
		team.length = 0;
		team.push(...next);
	}

	let digimon = $state<Digimon[]>([]);
	const digimonById = $derived(indexDigimonById(digimon));

	let search = $state('');

	onMount(async () => {
		digimon = await loadDigimon();
	});

	function encodeTeam(): string {
		const snapshot = $state.snapshot(team);
		return btoa(JSON.stringify(snapshot)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
	}

	function decodeTeam(raw: string): Chain[] | null {
		try {
			const base64 = raw.replace(/-/g, '+').replace(/_/g, '/');
			return normalizeTeamState(JSON.parse(atob(base64)));
		} catch {
			return null;
		}
	}

	const teamEncoded = $derived(encodeTeam());

	onMount(() => {
		const params = new URLSearchParams(window.location.search);
		let raw = params.get('team');
		if (!raw) return;

		// Remove legacy v2 prefix
		if (raw.startsWith('v2:')) {
			raw = raw.slice(3);
		}
		const decoded = decodeTeam(raw);
		if (!decoded) return;

		setTeam(decoded);

		const url = new URL(window.location.href);
		url.searchParams.delete('team');
		history.replaceState({}, '', url.toString());
	});

	const shareUrl = $derived.by(() => {
		if (typeof window === 'undefined') return '';
		const url = new URL(window.location.href);
		url.searchParams.set('team', teamEncoded);
		return url.toString();
	});

	const filteredDigimon = $derived.by(() => {
		const q = search.trim().toLowerCase();
		if (!q) return [];

		return digimon.filter((d) => d.name.toLowerCase().includes(q) || d.slug.toLowerCase().includes(q));
	});

	function startChain(d: Digimon) {
		setTeam([...team, { ids: [d.id], locked: false }]);
		search = '';
	}

	function updateChain(index: number, next: number[]) {
		if (next.length === 0) {
			setTeam(team.filter((_, i) => i !== index));
			return;
		}

		setTeam(team.map((chain, i) => (i === index ? { ...chain, ids: next } : chain)));
	}

	function extendLeft(index: number, d: Digimon) {
		updateChain(index, [d.id, ...team[index].ids]);
	}

	function extendRight(index: number, d: Digimon) {
		updateChain(index, [...team[index].ids, d.id]);
	}

	function trimChain(chain: Chain, d: Digimon) {
		const index = team.indexOf(chain);
		if (index === -1) return;

		const idx = chain.ids.indexOf(d.id);
		if (idx === -1) return;

		if (idx === 0) {
			updateChain(index, chain.ids.slice(1));
			return;
		}

		if (idx === chain.ids.length - 1) {
			updateChain(index, chain.ids.slice(0, -1));
			return;
		}

		updateChain(index, chain.ids.slice(0, idx));
	}

	function toggleChainLock(index: number) {
		setTeam(team.map((chain, i) => (i === index ? { ...chain, locked: !chain.locked } : chain)));
	}

	function deleteChain(index: number) {
		setTeam(team.filter((_, i) => i !== index));
	}

	function moveChainUp(index: number) {
		if (index <= 0) return;

		const updated = [...team];
		[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
		setTeam(updated);
	}

	function moveChainDown(index: number) {
		if (index >= team.length - 1) return;

		const updated = [...team];
		[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
		setTeam(updated);
	}

	function randomItem<T>(arr: T[]): T {
		return arr[Math.floor(Math.random() * arr.length)];
	}

	function buildRandomChain(start: Digimon, used: Set<number>): number[] {
		const chain: number[] = [start.id];
		let current = start;

		const visited = new SvelteSet<number>([current.id]);
		used.add(current.id);

		while (current.evolutions?.length) {
			const candidates = current.evolutions
				.filter((id) => !visited.has(id) && !used.has(id))
				.map((id) => digimonById.get(id))
				.filter((d): d is Digimon => Boolean(d));

			if (!candidates.length) break;

			const next = randomItem(candidates);

			visited.add(next.id);
			used.add(next.id);
			chain.push(next.id);
			current = next;
		}

		return chain;
	}

	function generateRandomTeam() {
		const starters = digimon.filter((d) => d.generation === 'In-Training I');

		if (!starters.length) return;

		const TEAM_SIZE = 6;
		const used = new Set<number>();
		const chains: Chain[] = [];

		while (chains.length < TEAM_SIZE && starters.length) {
			const availableStarters = starters.filter((d) => !used.has(d.id));
			if (!availableStarters.length) break;

			const start = randomItem(availableStarters);
			const chain = buildRandomChain(start, used);

			chains.push({ ids: chain, locked: false });
		}

		setTeam(chains);
		search = '';
	}
</script>

<div class="flex items-center justify-between gap-2">
	<div class="w-64">
		<TextInput placeholder="Agumon" bind:value={search} />
	</div>

	<div class="flex gap-8">
		<div class="flex items-center gap-2">
			Share your team!
			<CopyButton value={shareUrl} />
		</div>

		<Button onClick={generateRandomTeam}>
			<span class="flex items-center">
				<MdiDiceMultiple />Random Team
			</span>
		</Button>
	</div>
</div>

{#if search && filteredDigimon.length}
	<div class="flex flex-wrap gap-2">
		{#each filteredDigimon as d (d.id)}
			<button type="button" class="w-12 transition hover:scale-110" onclick={() => startChain(d)}>
				<DigimonIcon digimon={d} openModal={false} />
			</button>
		{/each}
	</div>
{:else if search}
	<div class="mb-6 opacity-60">No Digimon found</div>
{/if}

{#if team.length === 0}
	<div class="mx-auto mt-8 w-full text-center">
		No Digimon chains yet. Search a Digimon, generate a random team, or load one from a link.
	</div>
{/if}

{#each team as chain, i (i)}
	{@const c = chain.ids}
	{@const leftEdge = digimonById.get(c[0])}
	{@const rightEdge = digimonById.get(c[c.length - 1])}

	{@const preEvos = leftEdge ? getPreEvolutions(leftEdge, digimonById) : []}
	{@const evos = rightEdge ? getEvolutions(rightEdge, digimonById) : []}

	{@const notInChain = (d: Digimon) => !c.includes(d.id)}
	{@const preEvoOptions = preEvos.filter(notInChain)}
	{@const evoOptions = evos.filter(notInChain)}

	<div class="relative flex border">
		<div class="flex flex-col justify-start px-2 py-2">
			{#if i > 0}
				<button
					type="button"
					class="cursor-pointer opacity-50 transition hover:text-accent hover:opacity-100"
					onclick={() => moveChainUp(i)}
				>
					<MdiChevronUp />
				</button>
			{/if}

			{#if i < team.length - 1}
				<button
					type="button"
					class="cursor-pointer opacity-50 transition hover:text-accent hover:opacity-100"
					onclick={() => moveChainDown(i)}
				>
					<MdiChevronDown />
				</button>
			{/if}
		</div>

		<div class="absolute top-1 right-1 flex gap-1">
			<button
				type="button"
				class="cursor-pointer opacity-100 transition hover:text-accent"
				aria-label={chain.locked ? 'Unlock evolution line' : 'Lock evolution line'}
				use:tooltipAction={{ text: chain.locked ? 'Unlock evolution line' : 'Lock evolution line', position: 'top' }}
				onclick={() => toggleChainLock(i)}
			>
				{#if chain.locked}
					<MdiLock />
				{:else}
					<MdiLockOpenVariant />
				{/if}
			</button>

			<button
				type="button"
				class="cursor-pointer opacity-50 transition hover:text-accent hover:opacity-100"
				aria-label="Delete evolution line"
				title="Delete evolution line"
				onclick={(e) => {
					e.stopPropagation();
					deleteChain(i);
				}}
			>
				<MdiClose />
			</button>
		</div>

		<div class="flex w-full items-center justify-center gap-6 p-2">
			<!-- Pre-evolutions -->
			{#if !chain.locked}
				<div class="flex flex-col gap-2">
					{#each preEvoOptions as d (d.id)}
						<div class="w-14">
							<DigimonIcon digimon={d} variant="viewer" onClick={() => extendLeft(i, d)} />
						</div>
					{/each}
				</div>
			{/if}

			<!-- Chain -->
			<div class="flex items-center gap-4">
				{#each c as id, position (id)}
					{@const d = digimonById.get(id)}
					{#if d}
						<div class="w-14">
							<DigimonIcon
								digimon={d}
								variant="viewer"
								selected
								onClick={chain.locked ? undefined : () => trimChain(chain, d)}
							/>
						</div>
					{/if}

					{#if position < c.length - 1}
						{@const next = digimonById.get(c[position + 1])}

						{@const evoRequirements =
							next?.evolution_conditions
								?.map((e) =>
									Object.entries(e.requirements)
										.map(([k, v]) => `${k}: ${v}`)
										.join('\n')
								)
								.join('\n\n') ?? ''}
						<div class="relative" use:tooltipAction={{ text: evoRequirements, position: 'top' }}>
							<MdiChevronRight class="-mx-2 cursor-help transition hover:text-accent" />
						</div>
					{/if}
				{/each}
			</div>

			<!-- Evolutions -->
			{#if !chain.locked}
				<div class="flex flex-col gap-2">
					{#each evoOptions as d (d.id)}
						<div class="w-14">
							<DigimonIcon digimon={d} variant="viewer" onClick={() => extendRight(i, d)} />
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
{/each}
