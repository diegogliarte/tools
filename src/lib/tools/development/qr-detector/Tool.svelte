<script lang="ts">
	import { onMount } from 'svelte';
	import jsQR from 'jsqr';
	import CopyButton from '$lib/components/ui/copy-button.svelte';

	let video: HTMLVideoElement;
	let canvas: HTMLCanvasElement;
	let stream: MediaStream | null = null;
	let animationFrame = 0;

	let result = $state('');
	let caption = $state('Requesting camera access…');

	function stopCamera() {
		cancelAnimationFrame(animationFrame);
		stream?.getTracks().forEach((track) => track.stop());
		stream = null;
	}

	function scanFrame() {
		if (!stream || result || video.readyState < 2) {
			if (stream && !result) animationFrame = requestAnimationFrame(scanFrame);
			return;
		}

		const width = Math.min(video.videoWidth, 720);
		const height = Math.round((width / video.videoWidth) * video.videoHeight);
		canvas.width = width;
		canvas.height = height;

		const context = canvas.getContext('2d', { willReadFrequently: true });
		if (!context) return;

		context.drawImage(video, 0, 0, width, height);
		const imageData = context.getImageData(0, 0, width, height);
		const code = jsQR(imageData.data, width, height, { inversionAttempts: 'dontInvert' });

		if (code) {
			result = code.data;
			caption = '';
			stopCamera();
			return;
		}

		animationFrame = requestAnimationFrame(scanFrame);
	}

	async function openCamera() {
		if (!navigator.mediaDevices?.getUserMedia) {
			caption = 'Camera access is not available in this browser.';
			return;
		}

		try {
			stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: { ideal: 'environment' } },
				audio: false
			});

			video.srcObject = stream;
			await video.play();
			caption = 'Point your camera at a QR code';
			animationFrame = requestAnimationFrame(scanFrame);
		} catch (error) {
			caption = error instanceof Error ? error.message : 'Unable to access the camera.';
		}
	}

	async function reset() {
		if (!result) return;

		result = '';
		caption = 'Requesting camera access…';
		await openCamera();
	}

	onMount(() => {
		void openCamera();
		return stopCamera;
	});
</script>

<div class="flex flex-col items-center gap-3">
	<video
		bind:this={video}
		class="aspect-square w-full max-w-sm bg-black object-cover {result ? 'cursor-pointer' : ''}"
		playsinline
		muted
		aria-label={result ? 'Scan another QR code' : 'Camera preview'}
		onclick={reset}
	></video>
	<canvas bind:this={canvas} class="hidden"></canvas>

	{#if result}
		<div class="flex w-full max-w-sm items-start justify-between gap-3 border p-2">
			<p class="text-sm wrap-break-word whitespace-pre-wrap">{result}</p>
			<CopyButton value={result} />
		</div>
	{/if}

	<p class="h-4 text-center text-xs opacity-70">{caption}</p>
</div>
