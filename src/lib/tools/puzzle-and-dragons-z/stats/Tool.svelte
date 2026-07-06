<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import MonsterStats from './components/monster-stats.svelte';
	import SkillStats from './components/skill-stats.svelte';

	let displayMode = $state<'monster-stats' | 'skill-stats'>('monster-stats');
</script>

<div class="mb-4 flex gap-2">
	<Button active={displayMode === 'monster-stats'} onClick={() => (displayMode = 'monster-stats')}>
		Monster Stats
	</Button>

	<Button active={displayMode === 'skill-stats'} onClick={() => (displayMode = 'skill-stats')}>
		Skill Stats
	</Button>
</div>

{#if displayMode === 'monster-stats'}
	<MonsterStats />
{:else if displayMode === 'skill-stats'}
	<SkillStats />
{/if}