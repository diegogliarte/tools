<script lang="ts">
	import players from '$lib/data/inazuma-eleven-vr/players.json';
	import TextInput from '$lib/components/ui/text-input.svelte';
	import PlayerIcon from '$lib/components/inazuma-eleven-vr/PlayerIcon.svelte';
	import CheckboxChipGroup from '$lib/components/ui/checkbox-chip-group.svelte';
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
			const list = teamMap[team].filter((p) => {
				const position = p.Position ?? '?';
				const element = p.Element ?? 'None';
				const role = p.Role ?? 'None';
				const gender = p.Gender ?? 'None';

				return (
					(allowedPositions.length ? allowedPositions.includes(position) : true) &&
					(allowedElements.length ? allowedElements.includes(element) : true) &&
					(allowedRoles.length ? allowedRoles.includes(role) : true) &&
					(allowedGenders.length ? allowedGenders.includes(gender) : true) &&
					(!q ||
						p.Name.toLowerCase().includes(q) ||
						(p.Nickname ?? '').toLowerCase().includes(q) ||
						team.toLowerCase().includes(q))
				);
			});

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

<div class="flex flex-col gap-4">
	<div class="grid gap-4 lg:grid-cols-2">
		<CheckboxChipGroup label="Position" options={positions} bind:checked={positionFilter} />

		<CheckboxChipGroup label="Element" options={elements} bind:checked={elementFilter} />

		<CheckboxChipGroup label="Role" options={roles} bind:checked={roleFilter} />

		<CheckboxChipGroup label="Gender" options={genders} bind:checked={genderFilter} />
	</div>

	<!-- SEARCH -->
	<div class="w-48">
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
</div>
