<script lang="ts">
	import { page } from '$app/state';

	import Modal from '$lib/components/ui/modal.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import TextArea from '$lib/components/ui/text-area.svelte';
	import TextInput from '$lib/components/ui/text-input.svelte';
	import { closeModal } from '$lib/states/modal.svelte';
	import { showToast } from '$lib/utils/toast.utils';

	let message = $state('');
	let contact = $state('');
	let sending = $state(false);

	const trimmedMessage = $derived(message.trim());
	const remainingChars = $derived(1200 - message.length);

	async function submit() {
		if (!trimmedMessage || sending) return;

		sending = true;

		try {
			const response = await fetch('/api/feedback', {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					message: trimmedMessage,
					contact: contact.trim(),
					page: page.url.toString(),
					userAgent: navigator.userAgent
				})
			});

			if (!response.ok) {
				throw new Error('Failed to send feedback');
			}

			window.dispatchEvent(new CustomEvent('feedback:submitted'));
			showToast('Feedback sent', { type: 'success', duration: 2500 });
			closeModal();
		} catch {
			showToast('Could not send feedback', { type: 'error', duration: 3000 });
		} finally {
			sending = false;
		}
	}
</script>

<Modal title="Send feedback">
	<div class="flex flex-col gap-3 text-sm">
		<p class="opacity-80">Send a quick suggestion, issue, or idea. It goes straight to me.</p>

		<div class="flex flex-col gap-1">
			<TextArea bind:value={message} label="Message" placeholder="What would you like to tell me?" minHeightClass="min-h-40" />
			<div class="text-right text-xxs opacity-60">{remainingChars} characters left</div>
		</div>

		<TextInput bind:value={contact} label="Contact (optional)" placeholder="Email, Discord, or whatever works" />

		<div class="flex justify-end">
			<Button disabled={!trimmedMessage || sending} onClick={submit}>
				{sending ? 'Sending...' : 'Send'}
			</Button>
		</div>
	</div>
</Modal>
