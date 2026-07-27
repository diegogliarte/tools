<script lang="ts">
	import Modal from '$lib/components/ui/modal.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import TextInput from '$lib/components/ui/text-input.svelte';
	import CopyButton from '$lib/components/ui/copy-button.svelte';
	import { onMount } from 'svelte';
	import { closeModal } from '$lib/states/modal.svelte';
	import { showToast } from '$lib/utils/toast.utils';
	import { createTransferVisualResolver, type EntityVisual } from '$lib/utils/transfer-visuals.utils';
	import {
		createTransferSnapshot,
		diffTransferStorageDetailed,
		restoreTransferStorage,
		type DetailedStorageDiff,
		type StorageItemDiff,
		type TransferSnapshot,
		type ValueChange
	} from '$lib/utils/local-storage-transfer.utils';

	let creating = $state(false);
	let loading = $state(false);
	let restoring = $state(false);
	let code = $state('');
	let createdCode = $state('');
	let createdExpiresAt = $state('');
	let importedSnapshot = $state<TransferSnapshot | null>(null);
	let diff = $state<DetailedStorageDiff | null>(null);
	let resolveEntityVisual = $state<Awaited<ReturnType<typeof createTransferVisualResolver>> | null>(null);

	const normalizedCode = $derived(code.trim().replace(/\s|-/g, '').toUpperCase());
	const hasImportedChanges = $derived(!!diff && (diff.added || diff.changed || diff.deleted));
	const visibleDiffItems = $derived(diff?.items.filter((item) => item.type !== 'unchanged') ?? []);

	onMount(async () => {
		resolveEntityVisual = await createTransferVisualResolver();
	});

	function formatDate(value: string) {
		return new Intl.DateTimeFormat(undefined, {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(new Date(value));
	}

	async function createTransfer() {
		if (creating) return;

		creating = true;

		try {
			const snapshot = createTransferSnapshot();

			if (!Object.keys(snapshot.localStorage).length) {
				showToast('No transferable data found', { type: 'info', duration: 2500 });
				return;
			}

			const response = await fetch('/api/transfers', {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify(snapshot)
			});

			if (!response.ok) throw new Error('Failed to create transfer');

			const result = (await response.json()) as { code: string; expiresAt: string };
			createdCode = result.code;
			createdExpiresAt = result.expiresAt;
			showToast('Transfer code created', { type: 'success', duration: 2500 });
		} catch {
			showToast('Could not create transfer code', { type: 'error', duration: 3000 });
		} finally {
			creating = false;
		}
	}

	async function loadTransfer() {
		if (!normalizedCode || loading) return;

		loading = true;
		importedSnapshot = null;
		diff = null;

		try {
			const response = await fetch(`/api/transfers/${normalizedCode}`);

			if (!response.ok) throw new Error('Failed to load transfer');

			const snapshot = (await response.json()) as TransferSnapshot;
			importedSnapshot = snapshot;
			diff = diffTransferStorageDetailed(snapshot.localStorage);
		} catch {
			showToast('Could not load transfer code', { type: 'error', duration: 3000 });
		} finally {
			loading = false;
		}
	}

	function restore() {
		if (!importedSnapshot || restoring) return;

		restoring = true;
		restoreTransferStorage(importedSnapshot.localStorage);
		showToast('Transfer restored', { type: 'success', duration: 2500 });
		closeModal();
		location.reload();
	}

	function entityVisualFor(item: StorageItemDiff, change: ValueChange, side: 'before' | 'after'): EntityVisual | null {
		return resolveEntityVisual?.(item, change, side) ?? null;
	}

	function isSameVisual(before: EntityVisual | null, after: EntityVisual | null) {
		return !!before && !!after && before.src === after.src;
	}

	function changeContext(change: ValueChange) {
		return change.pathSegments.slice(0, -1).join(' / ') || change.path;
	}
</script>

{#snippet badge(type: 'added' | 'changed' | 'deleted' | 'unchanged')}
	<span
		class="
			border px-2 py-0.5 text-xxs uppercase
			{type === 'added' ? 'border-green-500 text-green-400' : ''}
			{type === 'changed' ? 'border-yellow-500 text-yellow-300' : ''}
			{type === 'deleted' ? 'border-red-500 text-red-400' : ''}
			{type === 'unchanged' ? 'opacity-50' : ''}
		"
	>
		{type}
	</span>
{/snippet}

{#snippet entityLabel(visual: EntityVisual, context?: string)}
	<span class="flex min-w-0 items-center gap-1">
		<img src={visual.src} alt={visual.alt} title={visual.alt} class="h-7 w-7 shrink-0 object-contain" loading="lazy" />
		<span class="break-all">{visual.alt}</span>
		{#if context}
			<span class="break-all opacity-60">· {context}</span>
		{/if}
	</span>
{/snippet}

{#snippet visualValue(visual: EntityVisual | null, text: string | undefined, tone: 'added' | 'deleted' | 'neutral')}
	<span
		class="
			flex items-center gap-1 break-all
			{tone === 'added' ? 'text-green-400' : ''}
			{tone === 'deleted' ? 'text-red-400' : ''}
		"
	>
		{#if visual}
			<img
				src={visual.src}
				alt={visual.alt}
				title={visual.alt}
				class="h-7 w-7 shrink-0 object-contain"
				loading="lazy"
			/>
			<span>{visual.alt}</span>
			{#if text && text !== visual.alt}
				<span class="opacity-70">({text})</span>
			{/if}
		{:else}
			<span>{text}</span>
		{/if}
	</span>
{/snippet}

<Modal title="Transfer local data">
	<div class="flex flex-col gap-4 text-sm">
		<div class="grid gap-4 sm:grid-cols-2">
			<section class="flex flex-col gap-2 border p-3">
				<h3 class="text-base">Send this browser</h3>
				<Button disabled={creating} onClick={createTransfer}>
					{creating ? 'Creating...' : 'Create code'}
				</Button>

				{#if createdCode}
					<div class="flex items-center gap-2 border px-3 py-2 font-mono text-base">
						<span>{createdCode}</span>
						<CopyButton value={createdCode} />
					</div>
				{/if}

				{#if createdExpiresAt}
					<div class="text-xs opacity-60">Expires {formatDate(createdExpiresAt)}</div>
				{/if}
			</section>

			<section class="flex flex-col gap-2 border p-3">
				<h3 class="text-base">Receive data</h3>
				<TextInput bind:value={code} label="Transfer code" placeholder="AB12CD34" />
				<Button disabled={!normalizedCode || loading} onClick={loadTransfer}>
					{loading ? 'Loading...' : 'Preview'}
				</Button>
			</section>
		</div>

		{#if diff}
			<section class="flex flex-col gap-3 border-t pt-4">
				<div class="grid grid-cols-3 gap-2 text-center text-xs">
					<div class="border p-2">
						<div class="text-lg">{diff.added}</div>
						<div class="opacity-60">Added</div>
					</div>
					<div class="border p-2">
						<div class="text-lg">{diff.changed}</div>
						<div class="opacity-60">Changed</div>
					</div>
					<div class="border p-2">
						<div class="text-lg">{diff.deleted}</div>
						<div class="opacity-60">Deleted</div>
					</div>
				</div>

				{#if visibleDiffItems.length}
					<div class="flex max-h-96 flex-col gap-3 overflow-y-auto">
						{#each visibleDiffItems as item (item.key)}
							<article class="flex flex-col gap-2 border p-2">
								<div class="flex items-start justify-between gap-3">
									<div class="break-all">{item.label}</div>
									{@render badge(item.type)}
								</div>

								<ul class="flex flex-col gap-1 text-xs">
									{#each item.changes as change (`${item.key}:${change.path}`)}
										{@const beforeVisual = entityVisualFor(item, change, 'before')}
										{@const afterVisual = entityVisualFor(item, change, 'after')}
										{@const sameVisual = isSameVisual(beforeVisual, afterVisual)}
										<li class="grid gap-1 border-t border-text/30 pt-1 sm:grid-cols-[1fr_auto_1fr]">
											{#if item.type === 'changed' && sameVisual && beforeVisual}
												<div class="sm:col-span-3">
													<div class="flex flex-wrap items-center gap-x-3 gap-y-1">
														{@render entityLabel(beforeVisual, changeContext(change))}
														<span>
															<span class="text-red-400">{change.before}</span>
															<span class="px-1 opacity-50">→</span>
															<span class="text-green-400">{change.after}</span>
														</span>
													</div>
												</div>
											{:else if item.type === 'added'}
												<span class="break-all opacity-70">{change.path}</span>
												<div class="sm:text-right">
													{@render visualValue(afterVisual, `+ ${change.after}`, 'added')}
												</div>
											{:else if item.type === 'deleted'}
												<span class="break-all opacity-70">{change.path}</span>
												<div class="sm:text-right">
													{@render visualValue(beforeVisual, `- ${change.before}`, 'deleted')}
												</div>
											{:else}
												<span class="break-all opacity-70">{change.path}</span>
												<div class="sm:text-right">
													{@render visualValue(beforeVisual, change.before, 'deleted')}
												</div>
												<span class="hidden opacity-50 sm:block">→</span>
												{@render visualValue(afterVisual, change.after, 'added')}
											{/if}
										</li>
									{/each}
								</ul>
							</article>
						{/each}
					</div>
				{:else}
					<div class="border p-2 text-xs opacity-70">No changes. This browser already matches the transfer.</div>
				{/if}

				<div class="flex justify-end">
					<Button disabled={!hasImportedChanges || restoring} onClick={restore}>
						{restoring ? 'Restoring...' : 'Replace local data'}
					</Button>
				</div>
			</section>
		{/if}
	</div>
</Modal>
