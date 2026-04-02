<script lang="ts">
	import type { LayoutProps } from './$types';

	import './layout.css';
	import '$lib/css/fonts.css';

	import Navbar from '$lib/components/Navbar.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Toast from '$lib/components/ui/toast.svelte';

	import { modalState, closeModal } from '$lib/states/modal.svelte';
	import { setCookies } from '$lib/utils/cookies.utils';

	let { children, data }: LayoutProps = $props();

	const SIDEBAR_KEY = 'layout.sidebar';

	let isSidebarOpen = $state(data.isSidebarOpen ?? false);

	$effect(() => {
		setCookies(SIDEBAR_KEY, isSidebarOpen);
	});

	let showScrollTop = $state(false);

	let mainEl: HTMLElement;

	function handleScroll() {
		if (!mainEl) return;
		showScrollTop = mainEl.scrollTop > 600;
	}

	function scrollToTop() {
		if (!mainEl) return;

		mainEl.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	}

	$effect(() => {
		if (!mainEl) return;

		handleScroll();
		mainEl.addEventListener('scroll', handleScroll);

		return () => mainEl.removeEventListener('scroll', handleScroll);
	});
</script>

<div class="flex h-[100dvh] overflow-y-hidden bg-bg text-text">
	<Sidebar visible={isSidebarOpen} />

	<div class="flex flex-1 flex-col min-w-0">
		<Navbar bind:isSidebarOpen />

		<main bind:this={mainEl} class="flex-1 overflow-y-auto p-2">
			{#if modalState.component}
				{@const ModalComponent = modalState.component}

				<ModalComponent {...modalState.props} onClose={closeModal} />
			{/if}

			{@render children()}

			<Toast />

			{#if showScrollTop}
				<button
					onclick={scrollToTop}
					class="fixed right-4 bottom-10 z-50 aspect-square h-8 w-8 cursor-pointer border bg-bg text-sm"
				>
					↑
				</button>
			{/if}
		</main>

		<Footer />
	</div>
</div>
