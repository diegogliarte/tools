import { createJsonLoader } from '$lib/data/json-loader';
import type { PadzMonster, PadzSkill } from '$lib/utils/puzzle-and-dragons-z.utils';

import monstersUrl from './monsters.json?url';
import skillsUrl from './skills.json?url';

export const loadPadzMonsters = createJsonLoader<PadzMonster[]>(monstersUrl);
export const loadPadzSkills = createJsonLoader<PadzSkill[]>(skillsUrl);
