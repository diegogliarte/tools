<script lang="ts">
	import { onMount } from 'svelte';
	import SelectInput from '$lib/components/ui/select-input.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { tooltipAction } from '$lib/actions/tooltip';
	import {
		loadMaterialSpots,
		type MaterialArea,
		type MaterialMap,
		type MaterialSpot,
		type MaterialType
	} from '$lib/data/digimon-world-next-order/data';

	let areas = $state<MaterialArea[]>([]);
	let maps = $state<MaterialMap[]>([]);
	let selectedAreaId = $state('');
	const tileRem = 12;
	const gapRem = 1.25;
	const labelRem = 1.25;
	const boardPaddingRem = 6;
	const areaExitGapRem = 4.25;
	const stepRem = tileRem + gapRem;

	onMount(async () => {
		const data = await loadMaterialSpots();
		areas = data.areas;
		maps = data.maps;
		selectedAreaId = data.areas[0]?.id ?? '';
	});

	const areaOptions = $derived(areas.map((area) => ({ value: area.id, label: area.label })));
	const selectedArea = $derived(areas.find((area) => area.id === selectedAreaId) ?? areas[0]);
	const mapsById = $derived(new Map(maps.map((map) => [map.id, map])));
	const selectedAreaMaps = $derived.by(() => {
		if (!selectedArea) return [];

		return selectedArea.maps.flatMap((item) => {
			const map = mapsById.get(item.mapId);
			return map ? [{ ...item, map }] : [];
		});
	});
	const selectedAreaTransitions = $derived.by(() => {
		if (!selectedArea) return [];

		const positionedMaps = new Map(selectedAreaMaps.map((item) => [item.mapId, item]));
		return selectedArea.transitions.flatMap((transition) => {
			const source = positionedMaps.get(transition.sourceMapId);
			const target = positionedMaps.get(transition.targetMapId);
			if (!source || !target) return [];

			return [
				{
					...transition,
					source,
					target,
					sourcePoint: mapPoint(source, transition.sourcePosition),
					targetPoint: mapPoint(target, transition.targetPosition)
				}
			];
		});
	});
	const selectedAreaExits = $derived.by(() => {
		if (!selectedArea) return [];

		const positionedMaps = new Map(selectedAreaMaps.map((item) => [item.mapId, item]));
		return selectedArea.areaExits.flatMap((exit) => {
			const source = positionedMaps.get(exit.sourceMapId);
			const target = areas.find((area) => area.id === exit.targetAreaId);
			if (!source || !target) return [];

			const nodePoint = mapPoint(source, exit.position);
			return [
				{
					...exit,
					source,
					target,
					nodePoint,
					point: externalExitPoint(source, nodePoint)
				}
			];
		});
	});
	const boardWidthRem = $derived(
		selectedAreaMaps.length
			? (Math.max(...selectedAreaMaps.map((item) => item.x)) + 1) * stepRem - gapRem + boardPaddingRem * 2
			: 1
	);
	const boardHeightRem = $derived(
		selectedAreaMaps.length
			? (Math.max(...selectedAreaMaps.map((item) => item.y)) + 1) * stepRem - gapRem + labelRem + boardPaddingRem * 2
			: 1
	);

	function spotLabel(spot: MaterialSpot) {
		return spot.slots.map((slot) => `${slot.name} ${slot.value}%`).join('\n');
	}

	function spotClass(type: MaterialType) {
		return {
			water: 'bg-blue-400',
			stone: 'bg-yellow-300',
			metal: 'bg-red-500',
			wood: 'bg-green-500'
		}[type];
	}

	function mapImageStyle(map: MaterialMap) {
		const crop = map.imageCropBounds;

		return [
			`width: ${(map.imageSize.width / crop.width) * 100}%`,
			`height: ${(map.imageSize.height / crop.height) * 100}%`,
			`left: ${(-crop.x / crop.width) * 100}%`,
			`top: ${(-crop.y / crop.height) * 100}%`
		].join('; ');
	}

	function spotStyle(map: MaterialMap, spot: MaterialSpot) {
		const crop = map.imageCropBounds;
		const x = (spot.projected.x * map.imageSize.width - crop.x) / crop.width;
		const y = (spot.projected.y * map.imageSize.height - crop.y) / crop.height;

		return `left: ${x * 100}%; top: ${y * 100}%;`;
	}

	function mapPoint(item: (typeof selectedAreaMaps)[number], position: { x: number; y: number }) {
		const crop = item.map.imageCropBounds;
		const x = Math.min(1, Math.max(0, (position.x * item.map.imageSize.width - crop.x) / crop.width));
		const y = Math.min(1, Math.max(0, (position.y * item.map.imageSize.height - crop.y) / crop.height));

		return {
			x: boardPaddingRem + item.x * stepRem + x * tileRem,
			y: boardPaddingRem + item.y * stepRem + labelRem + y * tileRem
		};
	}

	function transitionLabel(transition: (typeof selectedAreaTransitions)[number]) {
		return `${transition.source.map.label} to ${transition.target.map.label}`;
	}

	function externalExitPoint(item: (typeof selectedAreaMaps)[number], nodePoint: { x: number; y: number }) {
		const center = {
			x: boardPaddingRem + item.x * stepRem + tileRem / 2,
			y: boardPaddingRem + item.y * stepRem + labelRem + tileRem / 2
		};
		const localX = nodePoint.x - center.x;
		const localY = nodePoint.y - center.y;
		const length = Math.hypot(localX, localY) || 1;
		const unitX = localX / length;
		const unitY = localY / length;
		const distanceX = unitX === 0 ? Infinity : (tileRem / 2 - Math.abs(localX)) / Math.abs(unitX);
		const distanceY = unitY === 0 ? Infinity : (tileRem / 2 - Math.abs(localY)) / Math.abs(unitY);
		const distance = Math.max(0, Math.min(distanceX, distanceY)) + areaExitGapRem;
		return {
			x: nodePoint.x + unitX * distance,
			y: nodePoint.y + unitY * distance
		};
	}

	function anchorStyle(point: { x: number; y: number }) {
		return `left: ${point.x}rem; top: ${point.y}rem;`;
	}
</script>

{#snippet transitionNode(point: { x: number; y: number }, label: string)}
	<div
		class="absolute z-20 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-[1px] border border-white bg-accent shadow-[0_1px_4px_rgba(0,0,0,0.5)]"
		style={anchorStyle(point)}
		use:tooltipAction={{ text: label, position: 'top' }}
	></div>
{/snippet}

{#if selectedArea}
	<div class="flex flex-col gap-4">
		<div class="mx-auto w-full max-w-xs">
			<SelectInput label="Area" bind:value={selectedAreaId} options={areaOptions} allowEmpty={false} />
		</div>

		<div class="min-w-0">
			<div class="relative min-h-[36rem]" style={`width: ${boardWidthRem}rem; height: ${boardHeightRem}rem;`}>
				<svg
					class="pointer-events-none absolute inset-0 z-[15] overflow-visible"
					width={`${boardWidthRem}rem`}
					height={`${boardHeightRem}rem`}
					viewBox={`0 0 ${boardWidthRem} ${boardHeightRem}`}
					aria-hidden="true"
				>
					{#each selectedAreaTransitions as transition (transition.id)}
						<line
							x1={transition.sourcePoint.x}
							y1={transition.sourcePoint.y}
							x2={transition.targetPoint.x}
							y2={transition.targetPoint.y}
							class="stroke-slate-400/70"
							stroke-width="0.08"
							stroke-linecap="round"
						/>
					{/each}
					{#each selectedAreaExits as exit (`${exit.sourceMapId}-${exit.targetAreaId}-line`)}
						<line
							x1={exit.nodePoint.x}
							y1={exit.nodePoint.y}
							x2={exit.point.x}
							y2={exit.point.y}
							class="stroke-accent"
							stroke-width="0.1"
							stroke-linecap="round"
						/>
					{/each}
				</svg>

				{#each selectedAreaTransitions as transition (`${transition.id}-anchors`)}
					{@const label = transitionLabel(transition)}
					{@render transitionNode(transition.sourcePoint, label)}
					{@render transitionNode(transition.targetPoint, label)}
				{/each}

				{#each selectedAreaExits as exit (`${exit.sourceMapId}-${exit.targetAreaId}`)}
					<div
						class="absolute z-20 -translate-x-1/2 -translate-y-1/2 text-xs whitespace-nowrap"
						style={anchorStyle(exit.point)}
					>
						<Button active onClick={() => (selectedAreaId = exit.targetAreaId)}>
							{exit.target.label}
						</Button>
					</div>
				{/each}

				{#each selectedAreaMaps as item (item.mapId)}
					<section
						class="absolute z-10 w-48"
						style={`left: ${boardPaddingRem + item.x * stepRem}rem; top: ${boardPaddingRem + item.y * stepRem}rem;`}
						aria-label={item.map.label}
					>
						<div class="flex w-48 items-center justify-center" style={`height: ${tileRem + labelRem}rem;`}>
							<div class="w-48">
								<div class="mb-1 h-4 truncate text-xs font-medium">{item.map.label}</div>
								<div class="relative h-48 w-48 overflow-hidden">
									<img
										class="absolute block max-w-none"
										style={mapImageStyle(item.map)}
										src={item.map.image}
										alt={item.map.label}
									/>

									{#each item.map.spots as spot (spot.id)}
										<button
											type="button"
											class="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full {spotClass(
												spot.type
											)} shadow-[0_1px_4px_rgba(0,0,0,0.55)] transition hover:z-30 hover:scale-125"
											style={spotStyle(item.map, spot)}
											use:tooltipAction={{ text: spotLabel(spot), position: 'top' }}
											aria-label={spotLabel(spot)}
										></button>
									{/each}
								</div>
							</div>
						</div>
					</section>
				{/each}
			</div>
		</div>
	</div>
{:else}
	<p class="text-center opacity-60">No areas found.</p>
{/if}
