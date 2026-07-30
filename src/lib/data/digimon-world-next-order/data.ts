import { createJsonLoader } from '$lib/data/json-loader';
import materialSpotsUrl from './material-spots.json?url';
import suggestedRoutesUrl from './suggested-routes.json?url';

export type MaterialType = 'water' | 'stone' | 'metal' | 'wood';

export type MaterialSlot = {
	name: string;
	value: number;
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
	sender?: {
		variant: 'standard' | 'hinterland';
		projected: {
			x: number;
			y: number;
		};
	};
};

export type MaterialArea = {
	id: string;
	label: string;
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

export type SuggestedMaterialRoute = {
	id: string;
	label: string;
	areaId: string;
	segments: {
		mapId: string;
		spotIds: string[];
	}[];
};

export const loadMaterialSpots = createJsonLoader<MaterialSpotsData>(materialSpotsUrl);
export const loadSuggestedMaterialRoutes = createJsonLoader<SuggestedMaterialRoute[]>(suggestedRoutesUrl);
