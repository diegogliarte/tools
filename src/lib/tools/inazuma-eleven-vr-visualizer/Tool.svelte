<script lang="ts">
	import players from '$lib/data/inazuma-eleven-vr/players.json';
	import TextInput from '$lib/components/ui/text-input.svelte';
	import PlayerIcon from '$lib/components/inazuma-eleven-vr/PlayerIcon.svelte';
	import CheckboxInput from '$lib/components/ui/checkbox-input.svelte';
	import { makeFilter, sortNoneLast, unique } from '$lib/utils/filters.utils.svelte.js';

	let search = $state('');

	const positions = sortNoneLast(unique(players.map((p) => p.Position ?? '?')));
	const elements = sortNoneLast(unique(players.map((p) => p.Element ?? 'None')));
	const roles = sortNoneLast(unique(players.map((p) => p.Role ?? 'None')));
	const genders = sortNoneLast(unique(players.map((p) => p.Gender ?? 'None')));

	let positionFilter = $state(makeFilter(positions));
	let elementFilter = $state(makeFilter(elements));
	let roleFilter = $state(makeFilter(roles));
	let genderFilter = $state(makeFilter(genders));

	const filterGroups = [
		{ name: 'Position', list: positions, store: positionFilter },
		{ name: 'Element', list: elements, store: elementFilter },
		{ name: 'Role', list: roles, store: roleFilter },
		{ name: 'Gender', list: genders, store: genderFilter }
	];

	const positionOrder = ['FW', 'MF', 'DF', 'GK', '?'] as const;

	const teamMap: Record<string, any[]> = {};

	for (const p of players) {
		const teams = p.Teams?.length ? p.Teams : ['-'];

		for (const t of teams) {
			if (!teamMap[t]) teamMap[t] = [];
			teamMap[t].push(p);
		}
	}

	let teamOrder = Object.keys(teamMap);

	teamOrder = teamOrder.filter((t) => t !== 'Unaffiliated' && t !== '-');

	if (teamMap['Unaffiliated']) teamOrder.push('Unaffiliated');
	if (teamMap['-']) teamOrder.push('-');

	const filteredTeamMap = $derived.by(() => {
		const q = search.trim().toLowerCase();

		const allowedPositions = Object.keys(positionFilter).filter((k) => positionFilter[k]);
		const allowedElements = Object.keys(elementFilter).filter((k) => elementFilter[k]);
		const allowedRoles = Object.keys(roleFilter).filter((k) => roleFilter[k]);
		const allowedGenders = Object.keys(genderFilter).filter((k) => genderFilter[k]);

		const result: Record<string, any[]> = {};

		for (const team of teamOrder) {
			const list = teamMap[team].filter(
				(p) =>
					(allowedPositions.length ? allowedPositions.includes(p.Position) : true) &&
					(allowedElements.length ? allowedElements.includes(p.Element) : true) &&
					(allowedRoles.length ? allowedRoles.includes(p.Role) : true) &&
					(allowedGenders.length ? allowedGenders.includes(p.Gender) : true) &&
					(!q ||
						p.Name.toLowerCase().includes(q) ||
						(p.Nickname ?? '').toLowerCase().includes(q) ||
						team.toLowerCase().includes(q))
			);

			if (list.length) result[team] = list;
		}

		return result;
	});

	const visibleTeams = $derived(Object.keys(filteredTeamMap));

	const playersByTeamAndPosition = $derived.by(() => {
		const map: Record<string, Record<string, any[]>> = {};

		for (const team in filteredTeamMap) {
			map[team] = {};

			for (const p of filteredTeamMap[team]) {
				const pos = p.Position ?? '?';
				(map[team][pos] ??= []).push(p);
			}
		}

		return map;
	});
</script>

<div class="flex flex-col justify-around gap-2 sm:flex-row">
	{#each filterGroups as group (group.name)}
		<div class="flex flex-row gap-1 sm:flex-col">
			{#each group.list as val (val)}
				<CheckboxInput label={val} bind:checked={group.store[val]} />
			{/each}
		</div>
	{/each}
</div>

<!-- SEARCH -->
<div class="mb-4 w-48">
	<TextInput placeholder="Search..." bind:value={search} />
</div>

<div class="flex flex-row flex-wrap gap-8">
	{#each visibleTeams as team (team)}
		<div class="h-fit border px-2 pb-2">
			<h2 class="text-large">{team}</h2>

			<div class="flex flex-col gap-4">
				{#each positionOrder as pos (pos)}
					{#if playersByTeamAndPosition[team]?.[pos]?.length}
						<div class="flex flex-row gap-2">
							<h3>{pos}</h3>

							<div class="flex flex-row flex-wrap gap-0.5">
								{#each playersByTeamAndPosition[team][pos] as p (p.ID)}
									<div class="group h-16 w-16">
										<PlayerIcon player={p} variant="viewer" />
									</div>
								{/each}
							</div>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	{/each}
</div>
