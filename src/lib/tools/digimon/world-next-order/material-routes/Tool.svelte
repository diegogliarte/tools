<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/button.svelte';
	import CheckboxChipGroup from '$lib/components/ui/checkbox-chip-group.svelte';
	import CheckboxInput from '$lib/components/ui/checkbox-input.svelte';
	import SelectInput from '$lib/components/ui/select-input.svelte';
	import { tooltipAction } from '$lib/actions/tooltip';
	import {
		loadMaterialSpots,
		loadSuggestedMaterialRoutes,
		type MaterialArea,
		type MaterialMap,
		type Material,
		type MaterialSpot,
		type MaterialType,
		type SuggestedMaterialRoute
	} from '$lib/data/digimon-world-next-order/data';
	import { SvelteMap } from 'svelte/reactivity';

	let areas = $state<MaterialArea[]>([]);
	let maps = $state<MaterialMap[]>([]);
	let materials = $state<Material[]>([]);
	let suggestedRoutes = $state<SuggestedMaterialRoute[]>([]);
	let selectedAreaId = $state('');
	let showRoute = $state(true);
	let materialFilter = $state<Record<string, boolean>>({});
	const tileRem = 12;
	const gapRem = 1.25;
	const labelRem = 1.25;
	const boardPaddingInlineRem = 6;
	const boardPaddingBottomRem = 6;
	const areaExitGapRem = 4.25;
	const routeArrowMinLengthRem = 1.5;
	const stepRem = tileRem + gapRem;
	const materialTypes: Record<MaterialType, { label: string; spotClass: string; filterClass: string }> = {
		liquid: {
			label: 'Liquid',
			spotClass: 'bg-blue-400',
			filterClass: '!bg-blue-400/5 hover:!bg-blue-400/25 aria-pressed:!bg-blue-400/30'
		},
		stone: {
			label: 'Stone',
			spotClass: 'bg-yellow-300',
			filterClass: '!bg-yellow-300/5 hover:!bg-yellow-300/25 aria-pressed:!bg-yellow-300/30'
		},
		metal: {
			label: 'Metal',
			spotClass: 'bg-red-500',
			filterClass: '!bg-red-500/5 hover:!bg-red-500/25 aria-pressed:!bg-red-500/30'
		},
		wood: {
			label: 'Wood',
			spotClass: 'bg-green-500',
			filterClass: '!bg-green-500/5 hover:!bg-green-500/25 aria-pressed:!bg-green-500/30'
		}
	};
	onMount(async () => {
		const [data, routes] = await Promise.all([loadMaterialSpots(), loadSuggestedMaterialRoutes()]);
		areas = data.areas;
		maps = data.maps;
		materials = data.materials;
		suggestedRoutes = routes;
		selectedAreaId = data.areas[0]?.id ?? '';

		for (const material of materials) {
			if (materialFilter[material.name]) materialFilter[material.id] = true;
			delete materialFilter[material.name];
		}
	});

	const materialOptions = $derived.by(() => {
		const spotCounts = new SvelteMap<string, number>();

		for (const map of maps) {
			for (const spot of map.spots) {
				for (const materialId of new Set(spot.slots.map((slot) => slot.materialId))) {
					spotCounts.set(materialId, (spotCounts.get(materialId) ?? 0) + 1);
				}
			}
		}

		return materials.flatMap((material) => {
			const count = spotCounts.get(material.id);
			return count
				? [
						{
							value: material.id,
							label: `${material.name} (${count})`,
							class: materialTypes[material.type].filterClass,
							group: materialTypes[material.type].label
						}
					]
				: [];
		});
	});
	const selectedMaterials = $derived(
		new Set(Object.keys(materialFilter).filter((material) => materialFilter[material]))
	);
	const mapsById = $derived(new Map(maps.map((map) => [map.id, map])));
	const areaOptions = $derived(
		areas.map((area) => ({
			value: area.id,
			label: `${area.label} (${area.maps.reduce(
				(total, item) => total + (mapsById.get(item.mapId)?.spots.filter(matchesMaterialFilter).length ?? 0),
				0
			)})${suggestedRoutes.some((route) => route.areaId === area.id) ? ' · Route' : ''}`
		}))
	);
	const selectedArea = $derived(areas.find((area) => area.id === selectedAreaId) ?? areas[0]);
	const selectedRoutes = $derived(suggestedRoutes.filter((route) => route.areaId === selectedArea?.id));
	const selectedAreaMaps = $derived.by(() => {
		if (!selectedArea) return [];

		return selectedArea.maps.flatMap((item) => {
			const map = mapsById.get(item.mapId);
			return map ? [{ ...item, map }] : [];
		});
	});
	const boardPaddingTopRem = $derived.by(() => {
		if (!selectedArea) return 1.5;

		const positionedMaps = new Map(selectedArea.maps.map((item) => [item.mapId, item]));
		const hasTopExit = selectedArea.areaExits.some((exit) => {
			const source = positionedMaps.get(exit.sourceMapId);
			if (!source || source.y !== 0) return false;

			const offsetX = exit.position.x - 0.5;
			const offsetY = exit.position.y - 0.5;
			return offsetY < 0 && Math.abs(offsetY) >= Math.abs(offsetX);
		});

		return hasTopExit ? areaExitGapRem + 1.5 : 1.5;
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
	const selectedRouteLines = $derived.by(() => {
		if (!showRoute) return [];

		const positionedMaps = new Map(selectedAreaMaps.map((item) => [item.mapId, item]));
		return selectedRoutes.flatMap((route) => {
			const points: { x: number; y: number }[] = [];

			for (const [index, segment] of route.segments.entries()) {
				const item = positionedMaps.get(segment.mapId);
				if (!item) continue;

				if (index === 0 && item.map.sender) {
					points.push(mapPoint(item, item.map.sender.projected));
				} else if (index > 0) {
					const previousMapId = route.segments[index - 1].mapId;
					const transition = selectedAreaTransitions.find(
						(item) =>
							(item.sourceMapId === previousMapId && item.targetMapId === segment.mapId) ||
							(item.targetMapId === previousMapId && item.sourceMapId === segment.mapId)
					);

					if (transition) {
						points.push(
							transition.sourceMapId === previousMapId ? transition.sourcePoint : transition.targetPoint,
							transition.sourceMapId === segment.mapId ? transition.sourcePoint : transition.targetPoint
						);
					}
				}

				const spotsById = new Map(item.map.spots.map((spot) => [spot.id, spot]));
				for (const spotId of segment.spotIds) {
					const spot = spotsById.get(spotId);
					if (spot) points.push(mapPoint(item, spot.projected));
				}
			}

			return points.length > 1 ? [{ id: route.id, points }] : [];
		});
	});
	const boardWidthRem = $derived(
		selectedAreaMaps.length
			? (Math.max(...selectedAreaMaps.map((item) => item.x)) + 1) * stepRem - gapRem + boardPaddingInlineRem * 2
			: 1
	);
	const boardHeightRem = $derived(
		selectedAreaMaps.length
			? (Math.max(...selectedAreaMaps.map((item) => item.y)) + 1) * stepRem -
					gapRem +
					labelRem +
					boardPaddingTopRem +
					boardPaddingBottomRem
			: 1
	);

	function spotLabel(spot: MaterialSpot) {
		const matchingSlots = spot.slots.filter((slot) => selectedMaterials.has(slot.materialId));
		const slots = selectedMaterials.size > 0 && matchingSlots.length > 0 ? matchingSlots : spot.slots;

		return slots.map((slot) => `${slot.name} ${slot.value}%`).join('\n');
	}

	function matchesMaterialFilter(spot: MaterialSpot) {
		return selectedMaterials.size === 0 || spot.slots.some((slot) => selectedMaterials.has(slot.materialId));
	}

	function spotClass(type: MaterialType) {
		return materialTypes[type].spotClass;
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

	function spotStyle(map: MaterialMap, spot: Pick<MaterialSpot, 'projected'>) {
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
			x: boardPaddingInlineRem + item.x * stepRem + x * tileRem,
			y: boardPaddingTopRem + item.y * stepRem + labelRem + y * tileRem
		};
	}

	function transitionLabel(transition: (typeof selectedAreaTransitions)[number]) {
		return `${transition.source.map.label} to ${transition.target.map.label}`;
	}

	function externalExitPoint(item: (typeof selectedAreaMaps)[number], nodePoint: { x: number; y: number }) {
		const center = {
			x: boardPaddingInlineRem + item.x * stepRem + tileRem / 2,
			y: boardPaddingTopRem + item.y * stepRem + labelRem + tileRem / 2
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

	function routeSegmentPoints(start: { x: number; y: number }, end: { x: number; y: number }) {
		return `${start.x},${start.y} ${(start.x + end.x) / 2},${(start.y + end.y) / 2} ${end.x},${end.y}`;
	}

	function showRouteArrow(start: { x: number; y: number }, end: { x: number; y: number }, index: number) {
		return index % 2 === 1 && Math.hypot(end.x - start.x, end.y - start.y) >= routeArrowMinLengthRem;
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
		<div class="mx-auto flex w-full max-w-5xl flex-col gap-3">
			<div class="flex flex-wrap justify-center gap-3">
				<div class="w-full max-w-xs">
					<SelectInput label="Area" bind:value={selectedAreaId} options={areaOptions} allowEmpty={false} />
				</div>
				<div class="flex items-end gap-1 pb-2">
					<CheckboxInput label="Show routes" bind:checked={showRoute} storageKey="digimon-material-route" />
					<span class="text-xs whitespace-nowrap">
						(credit to
						<a
							href="https://www.youtube.com/watch?v=60uC8hlwoUY"
							target="_blank"
							rel="noreferrer"
							class="text-accent hover:underline"
						>
							Shnickerman
						</a>
						)
					</span>
				</div>
			</div>

			<CheckboxChipGroup label="Materials" options={materialOptions} bind:checked={materialFilter} />
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
							class="stroke-slate-400/30"
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
							class="stroke-slate-400/30"
							stroke-width="0.1"
							stroke-linecap="round"
						/>
					{/each}
				</svg>

				{#if selectedRouteLines.length > 0}
					<svg
						class="pointer-events-none absolute inset-0 z-[25] overflow-visible"
						width={`${boardWidthRem}rem`}
						height={`${boardHeightRem}rem`}
						viewBox={`0 0 ${boardWidthRem} ${boardHeightRem}`}
						aria-hidden="true"
					>
						<defs>
							<marker
								id="route-arrow"
								markerWidth="4"
								markerHeight="4"
								refX="4"
								refY="2"
								orient="auto"
								markerUnits="strokeWidth"
							>
								<path d="M 0 0 L 4 2 L 0 4 Z" class="fill-accent" />
							</marker>
						</defs>
						{#each selectedRouteLines as route (route.id)}
							{#each route.points.slice(1) as point, index (`${route.id}-${index}`)}
								<polyline
									points={routeSegmentPoints(route.points[index], point)}
									class="stroke-accent"
									fill="none"
									stroke-width="0.18"
									stroke-linecap="round"
									stroke-linejoin="round"
									marker-mid={showRouteArrow(route.points[index], point, index) ? 'url(#route-arrow)' : undefined}
								/>
							{/each}
						{/each}
					</svg>
				{/if}

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
						class="absolute w-48"
						style={`left: ${boardPaddingInlineRem + item.x * stepRem}rem; top: ${boardPaddingTopRem + item.y * stepRem}rem;`}
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
										{#if matchesMaterialFilter(spot)}
											<button
												type="button"
												class="absolute z-30 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full {spotClass(
													spot.type
												)} shadow-[0_1px_4px_rgba(0,0,0,0.55)] transition hover:scale-125"
												style={spotStyle(item.map, spot)}
												use:tooltipAction={{ text: spotLabel(spot), position: 'top' }}
												aria-label={spotLabel(spot)}
											></button>
										{/if}
									{/each}

									{#if item.map.sender}
										<button
											type="button"
											class="absolute z-[26] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-300 shadow-[0_1px_4px_rgba(0,0,0,0.7)] transition hover:scale-125 dark:bg-zinc-200"
											style={spotStyle(item.map, item.map.sender)}
											use:tooltipAction={{
												text: item.map.sender.variant === 'hinterland' ? 'Sender: Hinterland' : 'Sender',
												position: 'top'
											}}
											aria-label="Sender landing point"
										></button>
									{/if}
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
