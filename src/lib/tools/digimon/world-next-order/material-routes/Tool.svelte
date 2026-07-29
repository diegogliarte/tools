<script lang="ts">
	import { dev } from '$app/environment';
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
	let boardElement = $state<HTMLDivElement>();
	let editNodes = $state(true);
	let saveState = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');
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
		const storedAreaId = dev ? sessionStorage.getItem('material-routes-area') : null;
		selectedAreaId = data.areas.some((area) => area.id === storedAreaId)
			? (storedAreaId ?? '')
			: (data.areas[0]?.id ?? '');
	});

	$effect(() => {
		if (dev && selectedAreaId) sessionStorage.setItem('material-routes-area', selectedAreaId);
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
	const totalSpots = $derived(selectedAreaMaps.reduce((total, item) => total + item.map.spots.length, 0));
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
	const boardWidthRem = $derived(selectedArea ? selectedArea.layout.width * stepRem - gapRem + boardPaddingRem * 2 : 1);
	const boardHeightRem = $derived(
		selectedArea ? selectedArea.layout.height * stepRem - gapRem + labelRem + boardPaddingRem * 2 : 1
	);

	function spotLabel(map: MaterialMap, spot: MaterialSpot) {
		const slots = spot.slots.map((slot) => `${slot.name} ${slot.value}%`).join(', ');
		return `${map.label}\n${slots}`;
	}

	function spotClass(type: MaterialType) {
		return {
			water: 'bg-blue-400',
			stone: 'bg-yellow-300',
			metal: 'bg-red-500',
			wood: 'bg-green-500'
		}[type];
	}

	function cropFrameStyle(map: MaterialMap) {
		const { width, height } = cropFrameSize(map);

		return `width: ${width}rem; height: ${height}rem;`;
	}

	function cropFrameSize(map: MaterialMap) {
		const crop = map.imageCropBounds;
		const ratio = crop.width / crop.height;
		const width = ratio >= 1 ? tileRem : tileRem * ratio;
		const height = ratio >= 1 ? tileRem / ratio : tileRem;

		return { width, height };
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
		const frame = cropFrameSize(item.map);
		const x = Math.min(1, Math.max(0, (position.x * item.map.imageSize.width - crop.x) / crop.width));
		const y = Math.min(1, Math.max(0, (position.y * item.map.imageSize.height - crop.y) / crop.height));

		return {
			x: boardPaddingRem + item.x * stepRem + (tileRem - frame.width) / 2 + x * frame.width,
			y: boardPaddingRem + item.y * stepRem + labelRem + (tileRem - frame.height) / 2 + y * frame.height
		};
	}

	function transitionLabel(transition: (typeof selectedAreaTransitions)[number]) {
		return `${transition.source.map.label} to ${transition.target.map.label}`;
	}

	function externalExitPoint(item: (typeof selectedAreaMaps)[number], nodePoint: { x: number; y: number }) {
		const frame = cropFrameSize(item.map);
		const center = {
			x: boardPaddingRem + item.x * stepRem + tileRem / 2,
			y: boardPaddingRem + item.y * stepRem + labelRem + tileRem / 2
		};
		const localX = nodePoint.x - center.x;
		const localY = nodePoint.y - center.y;
		const length = Math.hypot(localX, localY) || 1;
		const unitX = localX / length;
		const unitY = localY / length;
		const distanceX = unitX === 0 ? Infinity : (frame.width / 2 - Math.abs(localX)) / Math.abs(unitX);
		const distanceY = unitY === 0 ? Infinity : (frame.height / 2 - Math.abs(localY)) / Math.abs(unitY);
		const distance = Math.max(0, Math.min(distanceX, distanceY)) + areaExitGapRem;
		return {
			x: nodePoint.x + unitX * distance,
			y: nodePoint.y + unitY * distance
		};
	}

	function anchorStyle(point: { x: number; y: number }) {
		return `left: ${point.x}rem; top: ${point.y}rem;`;
	}

	function startNodeDrag(
		event: PointerEvent,
		item: (typeof selectedAreaMaps)[number],
		position: { x: number; y: number },
		target:
			| {
					kind: 'transition';
					transitionId: string;
					sourceMapId: string;
					targetMapId: string;
					endpoint: 'source' | 'target';
			  }
			| { kind: 'areaExit'; sourceMapId: string; targetAreaId: string }
	) {
		if (!editNodes || !boardElement) return;

		event.preventDefault();
		const handle = event.currentTarget as HTMLElement;
		handle.setPointerCapture(event.pointerId);

		const move = (pointerEvent: PointerEvent) => updateNodePosition(pointerEvent, item, position);
		const end = (pointerEvent: PointerEvent) => {
			updateNodePosition(pointerEvent, item, position);
			handle.removeEventListener('pointermove', move);
			handle.removeEventListener('pointerup', end);
			handle.removeEventListener('pointercancel', end);
			void saveNodePosition(target, position);
		};

		updateNodePosition(event, item, position);
		handle.addEventListener('pointermove', move);
		handle.addEventListener('pointerup', end);
		handle.addEventListener('pointercancel', end);
	}

	function startMapDrag(event: PointerEvent, item: (typeof selectedAreaMaps)[number]) {
		if (!editNodes || !boardElement || !selectedArea) return;

		event.preventDefault();
		const handle = event.currentTarget as HTMLElement;
		const boardRect = boardElement.getBoundingClientRect();
		const scale = boardRect.width / boardWidthRem;
		const startPointer = {
			x: (event.clientX - boardRect.left) / scale,
			y: (event.clientY - boardRect.top) / scale
		};
		const startPosition = { x: item.x, y: item.y };
		handle.setPointerCapture(event.pointerId);

		const move = (pointerEvent: PointerEvent) => {
			const currentBoardRect = boardElement?.getBoundingClientRect();
			if (!currentBoardRect) return;
			const currentScale = currentBoardRect.width / boardWidthRem;
			const x = Math.max(
				0,
				Math.round(
					startPosition.x + ((pointerEvent.clientX - currentBoardRect.left) / currentScale - startPointer.x) / stepRem
				)
			);
			const y = Math.max(
				0,
				Math.round(
					startPosition.y + ((pointerEvent.clientY - currentBoardRect.top) / currentScale - startPointer.y) / stepRem
				)
			);
			updateMapPosition(item.mapId, x, y);
		};
		const end = (pointerEvent: PointerEvent) => {
			move(pointerEvent);
			handle.removeEventListener('pointermove', move);
			handle.removeEventListener('pointerup', end);
			handle.removeEventListener('pointercancel', end);
			void saveMapPosition(item.mapId);
		};

		handle.addEventListener('pointermove', move);
		handle.addEventListener('pointerup', end);
		handle.addEventListener('pointercancel', end);
	}

	function updateMapPosition(mapId: string, x: number, y: number) {
		if (!selectedArea) return;

		const item = selectedArea.maps.find((map) => map.mapId === mapId);
		if (!item || (item.x === x && item.y === y)) return;

		item.x = x;
		item.y = y;
		selectedArea.layout.width = Math.max(...selectedArea.maps.map((map) => map.x)) + 1;
		selectedArea.layout.height = Math.max(...selectedArea.maps.map((map) => map.y)) + 1;
	}

	async function saveMapPosition(mapId: string) {
		const item = selectedArea?.maps.find((map) => map.mapId === mapId);
		if (!item) return;

		saveState = 'saving';
		try {
			const response = await fetch('/api/debug/material-routes', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					areaId: selectedAreaId,
					kind: 'map',
					mapId,
					position: { x: item.x, y: item.y }
				})
			});

			saveState = response.ok ? 'saved' : 'error';
		} catch {
			saveState = 'error';
		}
	}

	function updateNodePosition(
		event: PointerEvent,
		item: (typeof selectedAreaMaps)[number],
		position: { x: number; y: number }
	) {
		if (!boardElement) return;

		const boardRect = boardElement.getBoundingClientRect();
		const scale = boardRect.width / boardWidthRem;
		const frame = cropFrameSize(item.map);
		const frameLeft = boardPaddingRem + item.x * stepRem + (tileRem - frame.width) / 2;
		const frameTop = boardPaddingRem + item.y * stepRem + labelRem + (tileRem - frame.height) / 2;
		const cropX = Math.min(1, Math.max(0, ((event.clientX - boardRect.left) / scale - frameLeft) / frame.width));
		const cropY = Math.min(1, Math.max(0, ((event.clientY - boardRect.top) / scale - frameTop) / frame.height));
		const crop = item.map.imageCropBounds;

		position.x = Number(((crop.x + cropX * crop.width) / item.map.imageSize.width).toFixed(6));
		position.y = Number(((crop.y + cropY * crop.height) / item.map.imageSize.height).toFixed(6));
	}

	async function saveNodePosition(
		target:
			| {
					kind: 'transition';
					transitionId: string;
					sourceMapId: string;
					targetMapId: string;
					endpoint: 'source' | 'target';
			  }
			| { kind: 'areaExit'; sourceMapId: string; targetAreaId: string },
		position: { x: number; y: number }
	) {
		saveState = 'saving';

		try {
			const response = await fetch('/api/debug/material-routes', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ areaId: selectedAreaId, ...target, position })
			});

			saveState = response.ok ? 'saved' : 'error';
		} catch {
			saveState = 'error';
		}
	}
</script>

{#if selectedArea}
	<div class="grid gap-4 xl:grid-cols-[16rem_1fr]">
		<div class="flex flex-col gap-4">
			<SelectInput label="Area" bind:value={selectedAreaId} options={areaOptions} allowEmpty={false} />

			<div class="text-sm">
				<div><span class="opacity-60">Maps</span> {selectedAreaMaps.length}</div>
				<div><span class="opacity-60">Spots</span> {totalSpots}</div>
				<div><span class="opacity-60">Area</span> {selectedArea.label}</div>
			</div>

			{#if dev}
				<div class="flex items-center gap-3 text-xs">
					<Button active={editNodes} onClick={() => (editNodes = !editNodes)}>Edit nodes</Button>
					{#if saveState !== 'idle'}
						<span class={saveState === 'error' ? 'text-red-500' : 'opacity-60'}>
							{saveState === 'saving' ? 'Saving' : saveState === 'saved' ? 'Saved' : 'Save failed'}
						</span>
					{/if}
				</div>
			{/if}
		</div>

		<div class="min-w-0">
			<div
				class="relative min-h-[36rem]"
				style={`width: ${boardWidthRem}rem; height: ${boardHeightRem}rem;`}
				bind:this={boardElement}
			>
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
					<div
						class="absolute z-20 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-[1px] border border-white bg-accent shadow-[0_1px_4px_rgba(0,0,0,0.5)] {editNodes
							? 'cursor-move touch-none'
							: ''}"
						style={anchorStyle(transition.sourcePoint)}
						use:tooltipAction={{ text: transitionLabel(transition), position: 'top' }}
						onpointerdown={(event) =>
							startNodeDrag(event, transition.source, transition.sourcePosition, {
								kind: 'transition',
								transitionId: transition.id,
								sourceMapId: transition.sourceMapId,
								targetMapId: transition.targetMapId,
								endpoint: 'source'
							})}
					></div>
					<div
						class="absolute z-20 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-[1px] border border-white bg-accent shadow-[0_1px_4px_rgba(0,0,0,0.5)] {editNodes
							? 'cursor-move touch-none'
							: ''}"
						style={anchorStyle(transition.targetPoint)}
						use:tooltipAction={{ text: transitionLabel(transition), position: 'top' }}
						onpointerdown={(event) =>
							startNodeDrag(event, transition.target, transition.targetPosition, {
								kind: 'transition',
								transitionId: transition.id,
								sourceMapId: transition.sourceMapId,
								targetMapId: transition.targetMapId,
								endpoint: 'target'
							})}
					></div>
				{/each}

				{#each selectedAreaExits as exit (`${exit.sourceMapId}-${exit.targetAreaId}`)}
					{#if editNodes}
						<div
							class="absolute z-20 h-3 w-3 -translate-x-1/2 -translate-y-1/2 cursor-move touch-none rounded-[1px] border border-white bg-accent shadow-[0_1px_4px_rgba(0,0,0,0.5)]"
							style={anchorStyle(exit.nodePoint)}
							use:tooltipAction={{
								text: `${exit.source.map.label} to ${exit.target.label}`,
								position: 'top'
							}}
							onpointerdown={(event) =>
								startNodeDrag(event, exit.source, exit.position, {
									kind: 'areaExit',
									sourceMapId: exit.sourceMapId,
									targetAreaId: exit.targetAreaId
								})}
						></div>
					{/if}
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
							<div style={`width: ${cropFrameSize(item.map).width}rem;`}>
								<div
									class="mb-1 h-4 truncate text-xs font-medium {editNodes ? 'cursor-move touch-none select-none' : ''}"
									onpointerdown={(event) => startMapDrag(event, item)}
								>
									{item.map.label}
								</div>
								<div class="relative overflow-hidden" style={cropFrameStyle(item.map)}>
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
											)} shadow-[0_1px_4px_rgba(0,0,0,0.55)] transition hover:z-10 hover:scale-125"
											style={spotStyle(item.map, spot)}
											use:tooltipAction={{ text: spotLabel(item.map, spot), position: 'top' }}
											aria-label={spotLabel(item.map, spot)}
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
