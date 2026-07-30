import { createJsonLoader } from '$lib/data/json-loader';
import buildingMaterialsUrl from './building-materials.json?url';
import materialSpotsUrl from './material-spots.json?url';
import materialsUrl from './materials.json?url';
import suggestedRoutesUrl from './suggested-routes.json?url';

export type MaterialType = 'liquid' | 'metal' | 'stone' | 'wood';

export type Material = {
	id: string;
	name: string;
	type: MaterialType;
};

export type MaterialSlot = {
	materialId: string;
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
	materials: Material[];
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

export type BuildingMaterial = {
	materialId: string;
	name: string;
	amount: number;
};

export type BuildingUpgrade = {
	toLevel: number;
	materials: BuildingMaterial[];
};

export type Building = {
	id: string;
	name: string;
	maxLevel: number;
	upgrades: BuildingUpgrade[];
};

export type BuildingMaterialsData = {
	materialTypes: {
		id: MaterialType;
		label: string;
		materials: Material[];
	}[];
	buildings: Building[];
};

type MaterialReference = {
	materialId: string;
	value: number;
};

type RawMaterialSpotsData = Omit<MaterialSpotsData, 'materials' | 'maps'> & {
	maps: (Omit<MaterialMap, 'spots'> & {
		spots: (Omit<MaterialSpot, 'type' | 'slots'> & {
			slots: MaterialReference[];
		})[];
	})[];
};

type RawBuildingMaterialsData = {
	buildings: (Omit<Building, 'upgrades'> & {
		upgrades: (Omit<BuildingUpgrade, 'materials'> & {
			materials: {
				materialId: string;
				amount: number;
			}[];
		})[];
	})[];
};

const materialTypeLabels: Record<MaterialType, string> = {
	liquid: 'Liquid',
	metal: 'Metal',
	stone: 'Stone',
	wood: 'Wood'
};
const materialTypeOrder: MaterialType[] = ['liquid', 'metal', 'stone', 'wood'];
const loadMaterialsJson = createJsonLoader<Material[]>(materialsUrl);
const loadRawBuildingMaterials = createJsonLoader<RawBuildingMaterialsData>(buildingMaterialsUrl);
const loadRawMaterialSpots = createJsonLoader<RawMaterialSpotsData>(materialSpotsUrl);

function materialLookup(materials: Material[]) {
	return new Map(materials.map((material) => [material.id, material]));
}

function requireMaterial(materialsById: Map<string, Material>, materialId: string): Material {
	const material = materialsById.get(materialId);
	if (!material) throw new Error(`Unknown material ID: ${materialId}`);
	return material;
}

export const loadMaterials = loadMaterialsJson;

export async function loadBuildingMaterials(): Promise<BuildingMaterialsData> {
	const [data, materials] = await Promise.all([loadRawBuildingMaterials(), loadMaterialsJson()]);
	const materialsById = materialLookup(materials);

	return {
		materialTypes: materialTypeOrder.map((type) => ({
			id: type,
			label: materialTypeLabels[type],
			materials: materials.filter((material) => material.type === type)
		})),
		buildings: data.buildings.map((building) => ({
			...building,
			upgrades: building.upgrades.map((upgrade) => ({
				...upgrade,
				materials: upgrade.materials.map((entry) => ({
					...entry,
					name: requireMaterial(materialsById, entry.materialId).name
				}))
			}))
		}))
	};
}

export async function loadMaterialSpots(): Promise<MaterialSpotsData> {
	const [data, materials] = await Promise.all([loadRawMaterialSpots(), loadMaterialsJson()]);
	const materialsById = materialLookup(materials);

	return {
		...data,
		materials,
		maps: data.maps.map((map) => ({
			...map,
			spots: map.spots.map((spot) => {
				const slots = spot.slots.map((slot) => ({
					...slot,
					name: requireMaterial(materialsById, slot.materialId).name
				}));

				return {
					...spot,
					type: requireMaterial(materialsById, slots[0].materialId).type,
					slots
				};
			})
		}))
	};
}

export const loadSuggestedMaterialRoutes = createJsonLoader<SuggestedMaterialRoute[]>(suggestedRoutesUrl);
