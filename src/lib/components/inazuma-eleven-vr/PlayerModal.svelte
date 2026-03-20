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

	let atdf = $derived(calculateATDFStats({
		kick: player.Kick,
		control: player.Control,
		technique: player.Technique,
		pressure: player.Pressure,
		physical: player.Physical,
		agility: player.Agility,
		intelligence: player.Intelligence,
		total: player.Total
	}));
</script>

<Modal title={player?.Name} {onClose}>
	{#if player}
		<div class="flex gap-4 mb-4">
			<div class="w-26 h-26">
				<PlayerIcon player={player} openModal={false} />
			</div>

			<div class="flex flex-col justify-between text-xs">
				<div>{player.Name}</div>
				<div>{player.RomajiName}</div>
				<div>{player.Position} · {player.Element}</div>
				<div>Archetype: <span class="text-accent">{player.Archetype}</span></div>
				<div><span class="text-accent">Tier {tierInfo.tier}</span> ({tierInfo.value})</div>
			</div>
		</div>

		<h3 class="font-bold mb-1">Stats</h3>
		<div class="grid grid-cols-2 sm:grid-cols-4 gap-1 mb-4 text-xs">
			<div>Kick: <b>{player.Kick}</b></div>
			<div>Control: <b>{player.Control}</b></div>
			<div>Technique: <b>{player.Technique}</b></div>
			<div>Pressure: <b>{player.Pressure}</b></div>
			<div>Physical: <b>{player.Physical}</b></div>
			<div>Agility: <b>{player.Agility}</b></div>
			<div>Intelligence: <b>{player.Intelligence}</b></div>
			<div>Total: <b>{player.Total}</b></div>
		</div>

		<h3 class="font-bold mb-1">ATDF Stats</h3>
		<div class="grid grid-cols-2 sm:grid-cols-4 gap-1 mb-4 text-xs">
			<div>Shoot AT: <b>{atdf.shootAT}</b></div>
			<div>Focus AT: <b>{atdf.focusAT}</b></div>
			<div>Focus DF: <b>{atdf.focusDF}</b></div>
			<div>Scramble AT: <b>{atdf.scrambleAT}</b></div>
			<div>Scramble DF: <b>{atdf.scrambleDF}</b></div>
			<div>Wall DF: <b>{atdf.wallDF}</b></div>
			<div>KP: <b>{atdf.kp}</b></div>
		</div>

		<h3 class="font-bold mb-1">Profile</h3>
		<div class="grid grid-cols-2 gap-2 mb-4 text-xs">
			<div>Age Group: {player.AgeGroup}</div>
			<div>School Year: {player.Year}</div>
			<div>Gender: {player.Gender}</div>
			<div>Role: <span class="text-accent">{player.Role}</span></div>
		</div>

		{#if player.Teams?.length}
			<h3 class="font-bold mb-1">Teams</h3>
			<ul class="list-disc list-inside mb-4">
				{#each player.Teams as t (t)}
					<li>{t}</li>
				{/each}
			</ul>
		{/if}

		{#if player.HowToObtain?.length}
			<h3 class="font-bold mb-2">How to Obtain</h3>

			<div class="flex flex-col gap-3 mb-4">
				{#each player.HowToObtain as obtain (obtain)}
					<div class="border p-2">
						<div class="font-bold mb-1">{obtain.title}</div>

						{#if obtain.entries.length}
							<ul class="list-disc list-inside mb-2">
								{#each obtain.entries as e (e)}
									<li>{e}</li>
								{/each}
							</ul>
						{/if}

						{#each obtain.subsections as s (s)}
							<div class="mb-2 pl-2 border-l">
								<div class="font-semibold mb-1">{s.title}</div>
								<ul class="list-disc list-inside">
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