<script lang="ts">
	import type { LayoutProps } from './$types';

	import './layout.css';
	import '$lib/css/fonts.css';

	import Navbar from '$lib/components/Navbar.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Toast from '$lib/components/ui/toast.svelte';

	import { modalState, closeModal } from "$lib/states/modal.svelte";

	let { children }: LayoutProps = $props();

	let isSidebarOpen = $state(false);

	function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;
	}

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
			behavior: "smooth"
		});
	}

	$effect(() => {
		if (!mainEl) return;

		handleScroll();
		mainEl.addEventListener("scroll", handleScroll);

		return () => mainEl.removeEventListener("scroll", handleScroll);
	});
</script>

<div class="flex h-screen bg-bg text-text overflow-y-hidden">
	<Sidebar visible={isSidebarOpen} />

	<div class="flex flex-col flex-1">
		<Navbar {toggleSidebar} />

		<main
			bind:this={mainEl}
			class="p-2 flex-1 overflow-y-auto">
			{#if modalState.component}
				{@const ModalComponent = modalState.component}

				<ModalComponent
					{...modalState.props}
					onClose={closeModal}
				/>
			{/if}

			{@render children()}

			<Toast />

			{#if showScrollTop}
				<button
					onclick={scrollToTop}
					class="fixed bottom-10 right-4 z-50 aspect-square w-8 h-8 text-sm border bg-bg cursor-pointer"
				>
					↑
				</button>
			{/if}
		</main>

		<Footer />
	</div>
</div>