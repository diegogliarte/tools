<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		active?: boolean;
		disabled?: boolean;
		onClick?: () => void;
		children: Snippet;
	}

	let { active = false, disabled = false, onClick = undefined, children }: Props = $props();

	function handleClick() {
		if (!disabled && onClick) onClick();
	}
</script>

<button
	class="
        cursor-pointer border px-3 py-2 transition
        not-disabled:hover:border-accent
        disabled:cursor-not-allowed disabled:opacity-50
        {active ? 'border-accent bg-accent' : ''}
    "
	onclick={handleClick}
	{disabled}
>
	{@render children()}
</button>
