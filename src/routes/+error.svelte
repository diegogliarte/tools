<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status === 404 ? 'Page Not Found' : 'Error'} | Tools by Diego Gliarte</title>

	{#if page.status === 404}
		<meta name="robots" content="noindex, follow" />
	{/if}
</svelte:head>

<div class="mx-auto mt-8 flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 text-center">
	<h1 class="text-large">
		Status error: {page.status}
	</h1>

	<p class="opacity-70">
		{page.error?.message ?? 'The requested page could not be loaded.'}
	</p>

	<a href="/" class="text-accent hover:underline">Back to tools</a>
</div>
