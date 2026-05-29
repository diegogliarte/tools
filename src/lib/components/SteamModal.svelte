<script lang="ts">
	import Modal from '$lib/components/ui/modal.svelte';
	import MdiSteam from '~icons/mdi/steam';
	import MdiTwitter from '~icons/mdi/twitter';
	import MdiChevronLeft from '~icons/mdi/chevron-left';
	import MdiChevronRight from '~icons/mdi/chevron-right';

	const images = ['/steam/img1.jpg', '/steam/img2.jpg', '/steam/img3.jpg', '/steam/img4.jpg'];

	// clones
	const slides = [images[images.length - 1], ...images, images[0]];

	let index = $state(1);
	let isTransitioning = $state(true);

	let interval: ReturnType<typeof setInterval> | null = null;

	// drag
	let startX: number | null = null;
	let currentX = $state(0);
	let isDragging = $state(false);
	let containerWidth = $state(1);
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
		}, 3000);
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

	const steamUrl = 'https://store.steampowered.com/app/3799160/?utm_source=tools.diegogliarte.com';

	const twitterUrl = 'https://x.com/sargantanagames';
</script>

<Modal title="Hello!">
	<div class="flex flex-col items-center justify-center gap-6">
		<!-- Text -->
		<div class="flex flex-col gap-2 text-sm opacity-90">
			<p>
				I'm currently developing <strong>VPetlings</strong>, a game where you raise your own virtual pet right on your
				<strong>desktop</strong>.
			</p>

			<p class="flex flex-wrap items-center gap-1.5">
				<span>If you enjoy my tools, I would highly appreciate following us on</span>

				<a href={twitterUrl} target="_blank" class="flex cursor-pointer items-center gap-1 text-accent hover:underline">
					<MdiTwitter class="h-4 w-4" />
					<span>Twitter</span>
				</a>

				<span> as well as giving us a</span>

				<a href={steamUrl} target="_blank" class="flex cursor-pointer items-center gap-1 text-accent hover:underline">
					<MdiSteam class="h-4 w-4" />
					<span>wishlist on Steam</span>
				</a>
			</p>
		</div>

		<!-- Carousel -->
		<div
			bind:clientWidth={containerWidth}
			class="relative w-3/4 touch-pan-y overflow-hidden border border-text"
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
					<img src={img} alt="Vpetlings screenshot" class="aspect-video w-full flex-shrink-0 object-cover" />
				{/each}
			</div>

			<!-- Controls -->
			<button class="absolute top-1/2 left-2 -translate-y-1/2 cursor-pointer" onclick={prev}>
				<MdiChevronLeft class="h-10 w-10" />
			</button>

			<button class="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer" onclick={next}>
				<MdiChevronRight class="h-10 w-10" />
			</button>

			<!-- Indicators -->
			<div class="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-4">
				{#each images as _, i (i)}
					<button
						type="button"
						aria-label={`Show image ${i + 1}`}
						title={`Show image ${i + 1}`}
						class={`h-3 w-3 rotate-45 cursor-pointer border ${i === index - 1 ? 'bg-accent' : 'bg-text/30'}`}
						onclick={() => go(i)}
					></button>
				{/each}
			</div>
		</div>
	</div>
</Modal>
