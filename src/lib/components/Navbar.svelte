<script lang="ts">
	import MdiGithub from '~icons/mdi/github';
	import MdiHome from '~icons/mdi/home';
	import MdiShape from '~icons/mdi/shape';
	import MdiCoffee from '~icons/mdi/coffee';
	import MdiChevronLeft from '~icons/mdi/chevron-left';
	import MdiChevronRight from '~icons/mdi/chevron-right';
	import MdiSteam from '~icons/mdi/steam';
	import SteamModal from '$lib/components/SteamModal.svelte';
	import { openModal } from '$lib/states/modal.svelte';

	export let isSidebarOpen: boolean;
</script>

{#snippet navLink(href: string, label: string, Icon, external = false)}
	<a
		href={href}
		aria-label={label}
		class="text-text transition hover:text-accent"
		target={external ? '_blank' : undefined}
		rel={external ? 'noopener noreferrer' : undefined}
	>
		<Icon class="h-5 w-5" />
	</a>
{/snippet}

{#snippet navAction(label: string, Icon, onclick: () => void)}
	<button
		aria-label={label}
		class="text-text transition hover:text-accent cursor-pointer"
		onclick={onclick}
	>
		<Icon class="h-5 w-5" />
	</button>
{/snippet}

<nav class="z-50 flex w-full items-center gap-4 border-b border-text bg-bg px-4 py-1.5 text-text">
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

	{@render navAction('Vpetlings (in development)', MdiSteam, () => openModal(SteamModal))}
	{@render navLink('https://ko-fi.com/diegogliarte', 'Go to the ko-fi', MdiCoffee, true)}
	{@render navLink('/components', 'Go to Components page', MdiShape)}
	{@render navLink('https://github.com/diegogliarte/tools', 'Go to the GitHub repo', MdiGithub, true)}
</nav>