<script lang="ts">
	import Modal from '$lib/components/ui/modal.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import TextInput from '$lib/components/ui/text-input.svelte';
	import CopyButton from '$lib/components/ui/copy-button.svelte';
	import { closeModal } from '$lib/states/modal.svelte';
	import { showToast } from '$lib/utils/toast.utils';
	import {
		createTransferSnapshot,
		describeStorageKey,
		diffTransferStorage,
		restoreTransferStorage,
		type StorageDiff,
		type TransferSnapshot
	} from '$lib/utils/local-storage-transfer.utils';

	let creating = $state(false);
	let loading = $state(false);
	let restoring = $state(false);
	let code = $state('');
	let createdCode = $state('');
	let createdExpiresAt = $state('');
	let importedSnapshot = $state<TransferSnapshot | null>(null);
	let diff = $state<StorageDiff | null>(null);

	const normalizedCode = $derived(code.trim().replace(/\s|-/g, '').toUpperCase());
	const hasImportedChanges = $derived(!!diff && (diff.added.length || diff.changed.length || diff.deleted.length));

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
			diff = diffTransferStorage(snapshot.localStorage);
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
</script>

{#snippet diffList(title: string, items: string[])}
	{#if items.length}
		<div class="flex flex-col gap-1">
			<div class="text-xs uppercase opacity-60">{title} ({items.length})</div>
			<ul class="max-h-32 overflow-y-auto border p-2 text-xs">
				{#each items as item, i (i)}
					<li class="break-all">{describeStorageKey(item)}</li>
				{/each}
			</ul>
		</div>
	{/if}
{/snippet}

<Modal title="Transfer local data">
	<div class="flex flex-col gap-5 text-sm">
		<section class="flex flex-col gap-2">
			<div>
				<h3 class="text-base">Create code</h3>
				<p class="text-xs opacity-70">Uploads this browser's tool progress and creates a code valid for 30 days.</p>
			</div>

			<div class="flex items-center gap-3">
				<Button disabled={creating} onClick={createTransfer}>
					{creating ? 'Creating...' : 'Create transfer code'}
				</Button>

				{#if createdCode}
					<div class="flex items-center gap-2 border px-3 py-2 font-mono text-base">
						<span>{createdCode}</span>
						<CopyButton value={createdCode} />
					</div>
				{/if}
			</div>

			{#if createdExpiresAt}
				<div class="text-xs opacity-60">Expires {formatDate(createdExpiresAt)}</div>
			{/if}
		</section>

		<section class="flex flex-col gap-2 border-t pt-4">
			<div>
				<h3 class="text-base">Restore from code</h3>
				<p class="text-xs opacity-70">Preview the changes before replacing this browser's tool progress.</p>
			</div>

			<div class="flex flex-col gap-2 sm:flex-row sm:items-end">
				<TextInput bind:value={code} label="Transfer code" placeholder="AB12CD34" />
				<div class="shrink-0">
					<Button disabled={!normalizedCode || loading} onClick={loadTransfer}>
						{loading ? 'Loading...' : 'Preview import'}
					</Button>
				</div>
			</div>

			{#if diff}
				<div class="grid grid-cols-3 gap-2 text-center text-xs">
					<div class="border p-2">
						<div class="text-lg">{diff.added.length}</div>
						<div class="opacity-60">Added</div>
					</div>
					<div class="border p-2">
						<div class="text-lg">{diff.changed.length}</div>
						<div class="opacity-60">Changed</div>
					</div>
					<div class="border p-2">
						<div class="text-lg">{diff.deleted.length}</div>
						<div class="opacity-60">Deleted</div>
					</div>
				</div>

				<div class="flex flex-col gap-3">
					{@render diffList('Added', diff.added)}
					{@render diffList('Changed', diff.changed)}
					{@render diffList('Deleted', diff.deleted)}

					{#if !hasImportedChanges}
						<div class="border p-2 text-xs opacity-70">No changes. This browser already matches the transfer.</div>
					{/if}
				</div>

				<div class="flex justify-end">
					<Button disabled={!hasImportedChanges || restoring} onClick={restore}>
						{restoring ? 'Restoring...' : 'Replace local data'}
					</Button>
				</div>
			{/if}
		</section>
	</div>
</Modal>
