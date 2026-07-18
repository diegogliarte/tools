<script lang="ts">
	import { onMount } from 'svelte';
	import type { Component } from 'svelte';
	import { resolve } from '$app/paths';

	import MdiGithub from '~icons/mdi/github';
	import MdiHome from '~icons/mdi/home';
	import MdiChevronLeft from '~icons/mdi/chevron-left';
	import MdiChevronRight from '~icons/mdi/chevron-right';
	import MdiMessageTextOutline from '~icons/mdi/message-text-outline';
	import MdiSteam from '~icons/mdi/steam';
	import SteamModal from '$lib/components/SteamModal.svelte';
	import MdiMagnify from '~icons/mdi/magnify';
	import ToolSearchModal from '$lib/components/ToolSearchModal.svelte';
	import UmamiViews from '$lib/components/UmamiViews.svelte';
	import FeedbackModal from '$lib/components/FeedbackModal.svelte';

	import { tooltipAction } from '$lib/actions/tooltip';
	import { createLocalStorageState } from '$lib/states/local-storage.svelte';
	import { openModal } from '$lib/states/modal.svelte';

	type IconComponent = Component;

	interface Props {
		isSidebarOpen: boolean;
	}

	let { isSidebarOpen = $bindable() }: Props = $props();

	const feedbackHint = createLocalStorageState(
		{
			lastVisitAt: 0,
			visits: 0,
			shown: false
		},
		{
			key: 'ui:feedback-hint'
		}
	);

	const FEEDBACK_HINT_VISIT_THRESHOLD = 3;
	const FEEDBACK_HINT_VISIT_INTERVAL_MS = 24 * 60 * 60 * 1000;

	let showFeedbackHint = $state(false);

	function openSearch() {
		openModal(ToolSearchModal);
	}

	function dismissFeedbackHint() {
		feedbackHint.shown = true;
		showFeedbackHint = false;
	}

	function openFeedback() {
		dismissFeedbackHint();
		openModal(FeedbackModal);
	}

	function handleGlobalKeydown(event: KeyboardEvent) {
		if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
			event.preventDefault();
			openSearch();
		}
	}

	onMount(() => {
		const now = Date.now();

		if (!feedbackHint.lastVisitAt || now - feedbackHint.lastVisitAt >= FEEDBACK_HINT_VISIT_INTERVAL_MS) {
			feedbackHint.visits += 1;
			feedbackHint.lastVisitAt = now;
		}

		showFeedbackHint = feedbackHint.visits >= FEEDBACK_HINT_VISIT_THRESHOLD && !feedbackHint.shown;

		function handleFeedbackSubmitted() {
			dismissFeedbackHint();
		}

		window.addEventListener('feedback:submitted', handleFeedbackSubmitted);

		return () => window.removeEventListener('feedback:submitted', handleFeedbackSubmitted);
	});
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

{#snippet navLink(href: '/', label: string, Icon: IconComponent)}
	<a href={resolve(href)} aria-label={label} class="relative text-text transition hover:text-accent">
		<Icon class="h-5 w-5" />
	</a>
{/snippet}

{#snippet navAction(label: string, Icon: IconComponent, onclick: () => void)}
	<button
		aria-label={label}
		class="relative cursor-pointer text-text transition hover:text-accent"
		use:tooltipAction={{ text: label, position: 'bottom' }}
		{onclick}
	>
		<Icon class="h-5 w-5" />
	</button>
{/snippet}

<nav class="z-50 flex w-full items-center gap-4 border-b border-text bg-bg px-2 py-1.5 text-text">
	<button
		aria-label="Toggle Sidebar"
		class="cursor-pointer text-text transition hover:text-accent"
		onclick={() => (isSidebarOpen = !isSidebarOpen)}
	>
		{#if isSidebarOpen}
			<MdiChevronLeft class="h-5 w-5" />
		{:else}
			<MdiChevronRight class="h-5 w-5" />
		{/if}
	</button>

	{@render navLink('/', 'Go to Home page', MdiHome)}

	<div class="flex-1"></div>

	<div class="flex w-full items-center justify-center text-xs">
		<button
			type="button"
			aria-label="Search tools"
			class="flex w-full max-w-96 cursor-pointer items-center gap-2 border px-1.5 py-0.5 text-text transition hover:border-accent hover:bg-accent-dark"
			onclick={openSearch}
		>
			<MdiMagnify class="h-3 w-3" />
			<span>Search</span>
			<kbd class="hidden border px-1 text-xxs opacity-60 sm:flex">Ctrl + K</kbd>
		</button>
	</div>

	<div class="hidden shrink-0 text-xxs whitespace-nowrap sm:block">
		<UmamiViews />
	</div>

	{@render navAction('My steam game', MdiSteam, () => openModal(SteamModal))}

	<div class="relative flex h-5 w-5 shrink-0 items-center justify-center self-center">
		<button
			aria-label="Give feedback"
			class={`cursor-pointer transition hover:text-accent ${showFeedbackHint ? 'animate-pulse text-accent' : 'text-text'}`}
			use:tooltipAction={{
				text: showFeedbackHint ? 'Ideas, bugs, or feedback?\nLet me know here.' : 'Give feedback',
				position: 'bottom',
				open: showFeedbackHint,
				interactive: showFeedbackHint,
				onTooltipClick: dismissFeedbackHint
			}}
			onclick={openFeedback}
		>
			<MdiMessageTextOutline class="h-5 w-5" />
		</button>
	</div>

	<!-- <a href="https://ko-fi.com/diegogliarte">Ko-fi</a> -->
	<a
		href="https://github.com/diegogliarte/tools"
		aria-label="Go to GitHub"
		class="relative text-text transition hover:text-accent"
		use:tooltipAction={{ text: 'Go to GitHub', position: 'bottom' }}
		target="_blank"
		rel="noopener noreferrer"
	>
		<MdiGithub class="h-5 w-5" />
	</a>
</nav>
