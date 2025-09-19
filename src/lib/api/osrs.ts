export interface SlayerTask {
    name: string;
    weight: number;
    is_boss: boolean;
    slayer_level?: number;
    combat_level?: number;
    quest?: string[];
    unlock?: string[];
}

export type SlayerMasterTasks = Record<string, SlayerTask[]>;

// 🔑 helper: clean CONST_NAME → "Title Case"
function cleanConstName(raw: string): string {
    return raw
        .replace(/^(QUEST_|UNLOCK_)/, "") // remove prefix
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()); // title case
}

function parseRequirements(block: string) {
    const reqMatch = block.match(/requirements\s*=\s*{([\s\S]*?)}/);
    const reqs = reqMatch ? reqMatch[1] : "";

    const slayerLevel = /Slayer\s*=\s*(\d+)/.exec(reqs)?.[1];
    const combatLevel = /Combat\s*=\s*(\d+)/.exec(reqs)?.[1];

    const quests = [
        ...reqs.matchAll(/Quest\s*=\s*SlayerConsts\.(\w+)/g),
    ].map((m) => cleanConstName(m[1]));

    const unlocks = [
        ...reqs.matchAll(/Unlock\s*=\s*SlayerConsts\.(\w+)/g),
    ].map((m) => cleanConstName(m[1]));

    return {
        slayer_level: slayerLevel ? parseInt(slayerLevel, 10) : undefined,
        combat_level: combatLevel ? parseInt(combatLevel, 10) : undefined,
        quest: quests.length ? quests : undefined,
        unlock: unlocks.length ? unlocks : undefined,
    };
}

function formatWeight(value: number): number {
    return Number.isInteger(value) ? value : parseFloat(value.toFixed(2));
}

export async function fetchSlayerTasks(): Promise<SlayerMasterTasks> {
    const url =
        "https://oldschool.runescape.wiki/?title=Module:SlayerConsts/MasterTables&action=raw";

    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch Slayer data");
    const lua = await res.text();

    const masters: SlayerMasterTasks = {};
    const masterRegex = /local\s+(\w+)\s*=\s*{([\s\S]*?)}(?=\s*local|$)/g;

    let masterMatch;
    while ((masterMatch = masterRegex.exec(lua)) !== null) {
        const masterName = masterMatch[1];
        let tableBody = masterMatch[2];
        const tasks: SlayerTask[] = [];

        // --- Handle boss containers first ---
        const bossContainerRegex =
            /name\s*=\s*"\[\[Boss\]\]"[\s\S]*?weight\s*=\s*(\d+)[\s\S]*?subtable\s*=\s*{([\s\S]*?)}\s*}/g;

        tableBody = tableBody.replace(bossContainerRegex, (match, bossWeightStr, subtable) => {
            const bossWeight = parseInt(bossWeightStr, 10);

            const subtaskRegex =
                /name\s*=\s*"\[\[(.*?)\]\](?:.*?)?",([\s\S]*?weight\s*=\s*(\d+))/g;
            const subtasks: { name: string; weight: number; block: string }[] = [];
            let subMatch;
            while ((subMatch = subtaskRegex.exec(subtable)) !== null) {
                subtasks.push({
                    name: subMatch[1].split("|")[0].trim(),
                    weight: formatWeight(parseInt(subMatch[3], 10)),
                    block: subMatch[0],
                });
            }

            const totalSubWeight = subtasks.reduce((a, b) => a + b.weight, 0);

            for (const s of subtasks) {
                const effectiveWeight = (s.weight / totalSubWeight) * bossWeight;
                tasks.push({
                    name: s.name,
                    weight: formatWeight(effectiveWeight),
                    is_boss: true,
                    ...parseRequirements(s.block),
                });
            }

            return ""; // remove boss block
        });

        // --- Handle normal tasks ---
        const taskRegex =
            /name\s*=\s*"\[\[(.*?)\]\](?:.*?)?",([\s\S]*?weight\s*=\s*(\d+))/g;
        let taskMatch;
        while ((taskMatch = taskRegex.exec(tableBody)) !== null) {
            const rawName = taskMatch[1];
            const block = taskMatch[2];
            const weight = parseInt(taskMatch[3], 10);

            const name = rawName.split("|")[0].trim();
            if (/^Boss$/i.test(name)) continue;

            tasks.push({
                name,
                weight,
                is_boss: false,
                ...parseRequirements(block),
            });
        }

        if (tasks.length > 0) {
            masters[masterName] = tasks;
        }
    }

    return masters;
}
