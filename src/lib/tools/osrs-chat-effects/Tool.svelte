<script lang="ts">
	import TextInput from '$lib/components/ui/text-input.svelte';
	import SelectInput from '$lib/components/ui/select-input.svelte';
	import LabeledRow from '$lib/components/ui/labeled-row.svelte';

	let message = $state('Hello Gielinor!');
	let colour = $state('');
	let effect = $state('');
	let patternKey = $state('q3');

	const colourOptions = [
		{ value: '', label: 'Yellow (default)' },
		{ value: 'red', label: 'Red' },
		{ value: 'green', label: 'Green' },
		{ value: 'cyan', label: 'Cyan' },
		{ value: 'purple', label: 'Purple' },
		{ value: 'white', label: 'White' },
		{ value: 'flash1', label: 'Flash 1' },
		{ value: 'flash2', label: 'Flash 2' },
		{ value: 'flash3', label: 'Flash 3' },
		{ value: 'glow1', label: 'Glow 1' },
		{ value: 'glow2', label: 'Glow 2' },
		{ value: 'glow3', label: 'Glow 3' },
		{ value: 'rainbow', label: 'Rainbow' },
		{ value: 'pattern', label: 'Pattern' }
	];

	const effectOptions = [
		{ value: '', label: 'None' },
		{ value: 'wave', label: 'Wave' },
		{ value: 'wave2', label: 'Wave 2' },
		{ value: 'shake', label: 'Shake' },
		{ value: 'slide', label: 'Slide' },
		{ value: 'scroll', label: 'Scroll' }
	];

	const command = $derived.by(() => {
		if (!message) return '';

		let prefix = '';

		if (colour === 'pattern') {
			if (!patternKey) return '';
			prefix = `pattern${patternKey}:`;
		} else if (colour) {
			prefix = `${colour}:`;
		}

		if (effect) prefix += `${effect}:`;

		return `${prefix}${message}`;
	});

	const previewKey = $derived(`${message}|${colour}|${effect}|${patternKey}`);

	const chars = $derived.by(() => message.split(''));
	const isWholeEffect = $derived.by(() => effect === 'slide' || effect === 'scroll');
</script>

<!-- MESSAGE -->
<TextInput label="Message" placeholder="Enter message..." bind:value={message} />

<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
	<SelectInput label="Colour Effect" options={colourOptions} bind:value={colour} />

	<SelectInput label="Text Effect" options={effectOptions} bind:value={effect} />
</div>

{#if colour === 'pattern'}
	<TextInput label="Pattern Key" placeholder="e.g. q3q3" bind:value={patternKey} />
{/if}

<LabeledRow label="Chat Command" value={command || '-'} isCopyable={true} />

{#key previewKey}
	<div class="mx-auto w-fit overflow-hidden">
		{#if isWholeEffect}
			<div class={`whole ${colour} ${effect}`}>
				{message}
			</div>
		{:else}
			<div class="flex flex-wrap gap-[1px]">
				{#each chars as char, i (i)}
					<span class={`char ${colour} ${effect}`} style={`--i:${i}`}>
						{char === ' ' ? '\u00A0' : char}
					</span>
				{/each}
			</div>
		{/if}
	</div>
{/key}

<style>
	.char,
	.whole {
		display: inline-block;
		color: #ffff00;
		white-space: pre;
	}

	.red {
		color: #ff0000;
	}
	.green {
		color: #00ff00;
	}
	.cyan {
		color: #00ffff;
	}
	.purple {
		color: #cc66ff;
	}
	.white {
		color: #ffffff;
	}

	.flash1 {
		animation: flash1 0.8s infinite;
	}
	.flash2 {
		animation: flash2 0.8s infinite;
	}
	.flash3 {
		animation: flash3 0.8s infinite;
	}

	@keyframes flash1 {
		0%,
		100% {
			color: red;
		}
		50% {
			color: yellow;
		}
	}
	@keyframes flash2 {
		0%,
		100% {
			color: cyan;
		}
		50% {
			color: blue;
		}
	}
	@keyframes flash3 {
		0%,
		100% {
			color: lime;
		}
		50% {
			color: green;
		}
	}

	.glow1 {
		animation: glow1 2s linear infinite;
	}
	.glow2 {
		animation: glow2 2s linear infinite;
	}
	.glow3 {
		animation: glow3 2s linear infinite;
	}

	@keyframes glow1 {
		0% {
			color: red;
		}
		25% {
			color: orange;
		}
		50% {
			color: yellow;
		}
		75% {
			color: cyan;
		}
		100% {
			color: red;
		}
	}
	@keyframes glow2 {
		0% {
			color: red;
		}
		50% {
			color: magenta;
		}
		100% {
			color: darkred;
		}
	}
	@keyframes glow3 {
		0% {
			color: white;
		}
		50% {
			color: lime;
		}
		100% {
			color: cyan;
		}
	}

	.rainbow {
		animation: rainbow 3s linear infinite;
		animation-delay: calc(var(--i) * 0.08s);
	}
	@keyframes rainbow {
		0% {
			color: red;
		}
		20% {
			color: orange;
		}
		40% {
			color: yellow;
		}
		60% {
			color: green;
		}
		80% {
			color: blue;
		}
		100% {
			color: violet;
		}
	}

	.wave {
		animation: wave 1.2s ease-in-out infinite;
		animation-delay: calc(var(--i) * 0.1s);
	}
	@keyframes wave {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-6px);
		}
	}

	.wave2 {
		animation: wave2 1.4s ease-in-out infinite;
		animation-delay: calc(var(--i) * 0.08s);
	}
	@keyframes wave2 {
		0%,
		100% {
			transform: translate(0, 0);
		}
		50% {
			transform: translate(4px, -6px);
		}
	}

	.shake {
		animation: shake 0.3s infinite;
	}
	@keyframes shake {
		0% {
			transform: translate(0, 0);
		}
		25% {
			transform: translate(-1px, 1px);
		}
		50% {
			transform: translate(1px, -1px);
		}
		75% {
			transform: translate(-1px, -1px);
		}
		100% {
			transform: translate(0, 0);
		}
	}

	.slide {
		animation: slide 2s infinite;
	}
	@keyframes slide {
		0% {
			transform: translateY(-10px);
			opacity: 0;
		}
		20% {
			opacity: 1;
		}
		80% {
			opacity: 1;
		}
		100% {
			transform: translateY(10px);
			opacity: 0;
		}
	}

	.scroll {
		animation: scroll linear 2s infinite;
	}
	@keyframes scroll {
		from {
			transform: translateX(100%);
		}
		to {
			transform: translateX(-100%);
		}
	}
</style>
