<script lang="ts">
	import MdiGithub from '~icons/mdi/github';
	import MdiHome from '~icons/mdi/home';
	import MdiShape from '~icons/mdi/shape';
	import MdiCoffee from '~icons/mdi/coffee';
	import MdiChevronLeft from '~icons/mdi/chevron-left';
	import MdiChevronRight from '~icons/mdi/chevron-right';

	export let isSidebarOpen: boolean;
</script>

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

	<!-- Home -->
	<a href="/" aria-label="Go to Home page" class="transition hover:text-accent">
		<MdiHome class="h-5 w-5" />
	</a>

	<div class="flex-1"></div>

	<a
		href="https://ko-fi.com/diegogliarte"
		aria-label="Go to the ko-fi"
		target="_blank"
		class="text-text transition hover:text-accent"
	>
		<MdiCoffee class="h-5 w-5" />
	</a>
	<a href="/components" aria-label="Go to Components page" class="text-text transition hover:text-accent">
		<MdiShape class="h-5 w-5" />
	</a>
	<a
		href="https://github.com/diegogliarte/tools"
		aria-label="Go to the GitHub repo"
		target="_blank"
		class="text-text transition hover:text-accent"
	>
		<MdiGithub class="h-5 w-5" />
	</a>
</nav>
