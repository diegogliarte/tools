import { createJsonLoader } from '$lib/data/json-loader';
import materialSpotsUrl from './material-spots.json?url';

export type MaterialType = 'water' | 'stone' | 'metal' | 'wood';

export type MaterialSlot = {
	name: string;
	value: number;
	type: MaterialType;
};

export type MaterialSpot = {
	id: string;
	type: MaterialType;
	slots: MaterialSlot[];
	projected: {
		x: number;
		y: number;
	};
};

export type MaterialMap = {
	id: string;
	zone: string;
	label: string;
	image: string;
	imageSize: {
		width: number;
		height: number;
	};
	imageCropBounds: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
	spots: MaterialSpot[];
};

export type MaterialArea = {
	id: string;
	label: string;
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
		position: {
			x: number;
			y: number;
		};
	}[];
	transitions: {
		id: string;
		sourceMapId: string;
		targetMapId: string;
		sourceDirection: string;
		targetDirection: string;
		sourcePosition: {
			x: number;
			y: number;
		};
		targetPosition: {
			x: number;
			y: number;
		};
	}[];
};

export type MaterialSpotsData = {
	areas: MaterialArea[];
	maps: MaterialMap[];
};

export const loadMaterialSpots = createJsonLoader<MaterialSpotsData>(materialSpotsUrl);
