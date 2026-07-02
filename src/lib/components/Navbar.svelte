<script lang="ts">
	import type { Component } from 'svelte';

	import MdiGithub from '~icons/mdi/github';
	import MdiHome from '~icons/mdi/home';
	import MdiShape from '~icons/mdi/shape';
	import MdiCoffee from '~icons/mdi/coffee';
	import MdiChevronLeft from '~icons/mdi/chevron-left';
	import MdiChevronRight from '~icons/mdi/chevron-right';
	import MdiMessageTextOutline from '~icons/mdi/message-text-outline';
	import MdiSteam from '~icons/mdi/steam';
	import SteamModal from '$lib/components/SteamModal.svelte';
	import MdiMagnify from '~icons/mdi/magnify';
	import ToolSearchModal from '$lib/components/ToolSearchModal.svelte';
	import UmamiViews from '$lib/components/UmamiViews.svelte';
	import FeedbackModal from '$lib/components/FeedbackModal.svelte';

	import { openModal } from '$lib/states/modal.svelte';

	type IconComponent = Component<any, any, any>;

	export let isSidebarOpen: boolean;

	function openSearch() {
		openModal(ToolSearchModal);
	}

	function handleGlobalKeydown(event: KeyboardEvent) {
		if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
			event.preventDefault();
			openSearch();
		}
	}
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

{#snippet navLink(href: string, label: string, Icon: IconComponent, external = false)}
	<a
		{href}
		aria-label={label}
		class="text-text transition hover:text-accent"
		target={external ? '_blank' : undefined}
		rel={external ? 'noopener noreferrer' : undefined}
	>
		<Icon class="h-5 w-5" />
	</a>
{/snippet}

{#snippet navAction(label: string, Icon: IconComponent, onclick: () => void)}
	<button aria-label={label} class="cursor-pointer text-text transition hover:text-accent" {onclick}>
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

	{@render navAction('Vpetlings (in development)', MdiSteam, () => openModal(SteamModal))}
	{@render navAction('Send feedback', MdiMessageTextOutline, () => openModal(FeedbackModal))}
	{@render navLink('https://ko-fi.com/diegogliarte', 'Go to the ko-fi', MdiCoffee, true)}
	{@render navLink('https://github.com/diegogliarte/tools', 'Go to the GitHub repo', MdiGithub, true)}
</nav>
