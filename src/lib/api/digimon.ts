import raw from "@lib/data/digimon_master.json";

export interface Digimon {
    id: number;
    name: string;
    stage: string;
    type: string;
    requirements: string[];
    portrait: string;
    pre_evolutions: number[];
    evolutions: number[];
}

export type DigimonMap = Record<number, Digimon>;

let cache: DigimonMap | null = null;

export async function fetchDigimons(): Promise<DigimonMap> {
    if (cache) return cache;

    const list: Digimon[] = raw as Digimon[];
    cache = {};
    for (const d of list) {
        cache[d.id] = d;
    }

    return cache;
}
