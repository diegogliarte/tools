import type { Digimon, Skill } from '$lib/utils/digimon-story-ts.utils';
import { createJsonLoader } from '$lib/data/json-loader';
import digimonUrl from './digimon.json?url';
import skillsUrl from './skills.json?url';

export const loadDigimon = createJsonLoader<Digimon[]>(digimonUrl);
export const loadSkills = createJsonLoader<Skill[]>(skillsUrl);
