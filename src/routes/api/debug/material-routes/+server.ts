import { dev } from '$app/environment';
import { json } from '@sveltejs/kit';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { RequestHandler } from './$types';

export const prerender = false;

const dataPath = resolve(process.cwd(), 'src/lib/data/digimon-world-next-order/material-spots.json');

type Position = { x: number; y: number };

type UpdatePayload = {
	areaId?: unknown;
	kind?: unknown;
	mapId?: unknown;
	transitionId?: unknown;
	sourceMapId?: unknown;
	targetMapId?: unknown;
	targetAreaId?: unknown;
	endpoint?: unknown;
	position?: unknown;
};

type RouteData = {
	areas: {
		id: string;
		layout: {
			width: number;
			height: number;
		};
		maps: {
			mapId: string;
			x: number;
			y: number;
		}[];
		areaExits: {
			sourceMapId: string;
			targetAreaId: string;
			position: Position;
		}[];
		transitions: {
			id: string;
			sourceMapId: string;
			targetMapId: string;
			sourcePosition: Position;
			targetPosition: Position;
		}[];
	}[];
};

function isString(value: unknown): value is string {
	return typeof value === 'string' && value.length > 0;
}

function isPosition(value: unknown): value is Position {
	if (!value || typeof value !== 'object') return false;

	const { x, y } = value as Partial<Position>;
	return (
		typeof x === 'number' &&
		Number.isFinite(x) &&
		x >= 0 &&
		x <= 1 &&
		typeof y === 'number' &&
		Number.isFinite(y) &&
		y >= 0 &&
		y <= 1
	);
}

function isMapPosition(value: unknown): value is Position {
	if (!value || typeof value !== 'object') return false;

	const { x, y } = value as Partial<Position>;
	return (
		typeof x === 'number' && Number.isInteger(x) && x >= 0 && typeof y === 'number' && Number.isInteger(y) && y >= 0
	);
}

export const POST: RequestHandler = async ({ request }) => {
	if (!dev) return json({ error: 'Not found.' }, { status: 404 });

	const payload = (await request.json()) as UpdatePayload;
	if (!isString(payload.areaId)) {
		return json({ error: 'Invalid node update.' }, { status: 400 });
	}

	const data = JSON.parse(await readFile(dataPath, 'utf8')) as RouteData;
	const area = data.areas.find((candidate) => candidate.id === payload.areaId);
	if (!area) return json({ error: 'Area not found.' }, { status: 404 });

	if (payload.kind === 'map' && isString(payload.mapId) && isMapPosition(payload.position)) {
		const map = area.maps.find((candidate) => candidate.mapId === payload.mapId);
		if (!map) return json({ error: 'Map not found.' }, { status: 404 });

		map.x = payload.position.x;
		map.y = payload.position.y;
		area.layout.width = Math.max(...area.maps.map((candidate) => candidate.x)) + 1;
		area.layout.height = Math.max(...area.maps.map((candidate) => candidate.y)) + 1;
	} else if (
		payload.kind === 'transition' &&
		isString(payload.transitionId) &&
		isString(payload.sourceMapId) &&
		isPosition(payload.position) &&
		isString(payload.targetMapId) &&
		(payload.endpoint === 'source' || payload.endpoint === 'target')
	) {
		const transition = area.transitions.find(
			(candidate) =>
				candidate.id === payload.transitionId &&
				candidate.sourceMapId === payload.sourceMapId &&
				candidate.targetMapId === payload.targetMapId
		);
		if (!transition) return json({ error: 'Transition not found.' }, { status: 404 });

		transition[payload.endpoint === 'source' ? 'sourcePosition' : 'targetPosition'] = payload.position;
	} else if (
		payload.kind === 'areaExit' &&
		isString(payload.sourceMapId) &&
		isPosition(payload.position) &&
		isString(payload.targetAreaId)
	) {
		const exit = area.areaExits.find(
			(candidate) => candidate.sourceMapId === payload.sourceMapId && candidate.targetAreaId === payload.targetAreaId
		);
		if (!exit) return json({ error: 'Area exit not found.' }, { status: 404 });

		exit.position = payload.position;
	} else {
		return json({ error: 'Invalid node target.' }, { status: 400 });
	}

	await writeFile(dataPath, `${JSON.stringify(data, null, 2)}\n`);
	return json({ ok: true });
};
