<script lang="ts">
	export let pokemon;
</script>

<div class="flex items-center gap-2">
	<img
		src={`/pokemon-mystery-dungeon/icons/${pokemon.icon}`}
		class="w-8 h-8 shrink-0"
	/>

	<span>{pokemon.name}</span>
</div>