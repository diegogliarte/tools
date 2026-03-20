<script lang="ts">
	import type { LayoutProps } from './$types';

	import './layout.css';
	import '$lib/css/fonts.css';

	import Navbar from '$lib/components/Navbar.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Footer from '$lib/components/Footer.svelte';

	import { modalState, closeModal } from "$lib/states/modal.svelte";

	let { data, children }: LayoutProps = $props();

	let isSidebarOpen = $state(data.sidebarOpen);

	function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;

		document.cookie = `sidebar-open=${isSidebarOpen}; path=/; max-age=31536000`;
	}
</script>

<div class="flex bg-bg text-text">
	<Sidebar visible={isSidebarOpen} />

	<div class="flex flex-col flex-1">
		<Navbar {toggleSidebar} />

		<main class="p-2 flex-1">
			{#if modalState.component}
				{@const ModalComponent = modalState.component}

				<ModalComponent
					{...modalState.props}
					onClose={closeModal}
				/>
			{/if}
			{@render children()}
		</main>

		<Footer />
	</div>
</div>
