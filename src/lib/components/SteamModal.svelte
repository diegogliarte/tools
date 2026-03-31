<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import MdiSteam from '~icons/mdi/steam';
	import MdiTwitter from '~icons/mdi/twitter';
	import MdiChevronLeft from '~icons/mdi/chevron-left';
	import MdiChevronRight from '~icons/mdi/chevron-right';

	const images = [
		'/steam/img1.jpg',
		'/steam/img2.jpg',
		'/steam/img3.jpg',
		'/steam/img4.jpg'
	];

	// clones
	const slides = [
		images[images.length - 1],
		...images,
		images[0]
	];

	let index = $state(1);
	let isTransitioning = $state(true);

	let interval: ReturnType<typeof setInterval> | null = null;

	// drag
	let startX: number | null = null;
	let currentX = $state(0);
	let isDragging = $state(false);
	let containerWidth = 1;
	let isAnimating = $state(false);

	function next() {
		if (isAnimating) return;
		isAnimating = true;

		index++;
		resetAuto();
	}

	function prev() {
		if (isAnimating) return;
		isAnimating = true;

		index--;
		resetAuto();
	}

	function go(i: number) {
		if (isAnimating) return;
		isAnimating = true;

		index = i + 1;
		resetAuto();
	}
	function startAuto() {
		if (interval) return;

		interval = setInterval(() => {
			index++;
		}, 2500);
	}

	function stopAuto() {
		if (interval) {
			clearInterval(interval);
			interval = null;
		}
	}

	function resetAuto() {
		stopAuto();
		startAuto();
	}

	function handleTransitionEnd() {
		// loop correction
		if (index === 0 || index === images.length + 1) {
			isTransitioning = false;

			if (index === 0) index = images.length;
			if (index === images.length + 1) index = 1;

			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					isTransitioning = true;
					isAnimating = false;
				});
			});
		} else {
			isAnimating = false;
		}
	}

	$effect(() => {
		startAuto();
		return stopAuto;
	});

	const steamUrl =
		'https://store.steampowered.com/app/3799160/?utm_source=tools.diegogliarte.com';

	const twitterUrl = 'https://x.com/sargantanagames';
</script>

<Modal title="Hello!">
	<div class="flex flex-col gap-6">
		<!-- Text -->
		<div class="flex flex-col gap-2 text-sm opacity-90">
			<p>
				I'm currently developing <strong>VPetlings</strong>, a game where you raise your own virtual pet right on your <strong>desktop</strong>.
			</p>

			<p class="flex flex-wrap items-center gap-2">
				<span>If you enjoy my tools, I would highly appreciate following us on</span>

				<a
					href={twitterUrl}
					target="_blank"
					class="flex items-center gap-1 text-accent hover:underline cursor-pointer"
				>
					<MdiTwitter class="h-4 w-4" />
					<span>Twitter</span>
				</a>

				<span> as well as</span>

				<a
					href={steamUrl}
					target="_blank"
					class="flex items-center gap-1 text-accent hover:underline cursor-pointer"
				>
					<MdiSteam class="h-4 w-4" />
					<span>wishlisting it on Steam</span>
				</a>
			</p>
		</div>

		<!-- Carousel -->
		<div
			bind:clientWidth={containerWidth}
			class="relative w-full overflow-hidden border border-text touch-pan-y"
			ontouchstart={(e) => {
				if (isAnimating) return;

				startX = e.touches[0].clientX;
				isDragging = true;
				stopAuto();
			}}
			ontouchmove={(e) => {
				if (startX === null) return;
				currentX = e.touches[0].clientX - startX;
			}}
			ontouchend={() => {
				const threshold = containerWidth * 0.2;

				if (currentX > threshold) prev();
				else if (currentX < -threshold) next();

				currentX = 0;
				startX = null;
				isDragging = false;

				startAuto();
			}}
		>
			<!-- Track -->
			<div
				class="flex"
				ontransitionend={handleTransitionEnd}
				style="
					transform: translateX(calc(-{index * 100}% + {currentX}px));
					transition: {isDragging || !isTransitioning ? 'none' : 'transform 0.3s ease'};
				"
			>
				{#each slides as img}
					<img
						src={img}
						alt="Vpetlings screenshot"
						class="w-full flex-shrink-0 object-cover aspect-video"
					/>
				{/each}
			</div>

			<!-- Controls -->
			<button
				class="absolute left-2 top-1/2 -translate-y-1/2 cursor-pointer"
				onclick={prev}
			>
				<MdiChevronLeft class="h-10 w-10" />
			</button>

			<button
				class="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
				onclick={next}
			>
				<MdiChevronRight class="h-10 w-10" />
			</button>

			<!-- Indicators -->
			<div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-4">
				{#each images as _, i}
					<button
						class={`h-3 w-3 rotate-45 border cursor-pointer ${
							i === index - 1 ? 'bg-accent' : 'bg-text/30'
						}`}
						onclick={() => go(i)}
					/>
				{/each}
			</div>
		</div>
	</div>
</Modal>