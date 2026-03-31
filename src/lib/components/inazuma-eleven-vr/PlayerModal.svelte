<script lang="ts">
	import Modal from '$lib/components/ui/modal.svelte';
	import PlayerIcon from '$lib/components/inazuma-eleven-vr/PlayerIcon.svelte';
	import players from '$lib/data/inazuma-eleven-vr/players.json';

	import { calculateATDFStats, type Player, computePlayerTier } from '$lib/utils/inazuma-eleven-vr.utils';

	interface Props {
		player: Player;
		onClose?: () => void;
	}

	let { player, onClose }: Props = $props();

	let tierInfo = $derived(computePlayerTier(player, players as Player[]));

	let atdf = $derived(
		calculateATDFStats({
			kick: player.Kick,
			control: player.Control,
			technique: player.Technique,
			pressure: player.Pressure,
			physical: player.Physical,
			agility: player.Agility,
			intelligence: player.Intelligence,
			total: player.Total
		})
	);
</script>

<Modal title={player?.Name} {onClose}>
	{#if player}
		<div class="mb-4 flex gap-4">
			<div class="h-26 w-26">
				<PlayerIcon {player} openModal={false} />
			</div>

			<div class="flex flex-col justify-between text-xs">
				<div>{player.Name}</div>
				<div>{player.RomajiName}</div>
				<div>{player.Position} · {player.Element}</div>
				<div>Archetype: <span class="text-accent">{player.Archetype}</span></div>
				<div><span class="text-accent">Tier {tierInfo.tier}</span> ({tierInfo.value})</div>
			</div>
		</div>

		<h3 class="mb-1 font-bold">Stats</h3>
		<div class="mb-4 grid grid-cols-2 gap-1 text-xs sm:grid-cols-4">
			<div>Kick: <b>{player.Kick}</b></div>
			<div>Control: <b>{player.Control}</b></div>
			<div>Technique: <b>{player.Technique}</b></div>
			<div>Pressure: <b>{player.Pressure}</b></div>
			<div>Physical: <b>{player.Physical}</b></div>
			<div>Agility: <b>{player.Agility}</b></div>
			<div>Intelligence: <b>{player.Intelligence}</b></div>
			<div>Total: <b>{player.Total}</b></div>
		</div>

		<h3 class="mb-1 font-bold">ATDF Stats</h3>
		<div class="mb-4 grid grid-cols-2 gap-1 text-xs sm:grid-cols-4">
			<div>Shoot AT: <b>{atdf.shootAT}</b></div>
			<div>Focus AT: <b>{atdf.focusAT}</b></div>
			<div>Focus DF: <b>{atdf.focusDF}</b></div>
			<div>Scramble AT: <b>{atdf.scrambleAT}</b></div>
			<div>Scramble DF: <b>{atdf.scrambleDF}</b></div>
			<div>Wall DF: <b>{atdf.wallDF}</b></div>
			<div>KP: <b>{atdf.kp}</b></div>
		</div>

		<h3 class="mb-1 font-bold">Profile</h3>
		<div class="mb-4 grid grid-cols-2 gap-2 text-xs">
			<div>Age Group: {player.AgeGroup}</div>
			<div>School Year: {player.Year}</div>
			<div>Gender: {player.Gender}</div>
			<div>Role: <span class="text-accent">{player.Role}</span></div>
		</div>

		{#if player.Teams?.length}
			<h3 class="mb-1 font-bold">Teams</h3>
			<ul class="mb-4 list-inside list-disc">
				{#each player.Teams as t (t)}
					<li>{t}</li>
				{/each}
			</ul>
		{/if}

		{#if player.HowToObtain?.length}
			<h3 class="mb-2 font-bold">How to Obtain</h3>

			<div class="mb-4 flex flex-col gap-3">
				{#each player.HowToObtain as obtain (obtain)}
					<div class="border p-2">
						<div class="mb-1 font-bold">{obtain.title}</div>

						{#if obtain.entries.length}
							<ul class="mb-2 list-inside list-disc">
								{#each obtain.entries as e (e)}
									<li>{e}</li>
								{/each}
							</ul>
						{/if}

						{#each obtain.subsections as s (s)}
							<div class="mb-2 border-l pl-2">
								<div class="mb-1 font-semibold">{s.title}</div>
								<ul class="list-inside list-disc">
									{#each s.entries as e (e)}
										<li>{e}</li>
									{/each}
								</ul>
							</div>
						{/each}
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</Modal>
