type ToolMeta = {
    title?: string;
    description?: string;
    order?: number;
    hidden?: boolean;
};

export type ToolEntry = {
    name: string;
    href: string;
    description?: string;
    order: number;
    category: string;
    component: any;
};

export type CategoryGroup = {
    title: string;
    slug: string;
    tools: ToolEntry[];
};

export function discoverTools(): CategoryGroup[] {
    const modules = import.meta.glob('/src/tools/*/*.astro', { eager: true }) as Record<
        string,
        { tool?: ToolMeta, default: any }
    >;

    const groups: Record<string, CategoryGroup> = {};

    for (const [file, mod] of Object.entries(modules)) {
        if (/\/index\.astro$/i.test(file)) continue; // skip category index pages

        // ["", "src", "tools", "<category>", "<tool>.astro"]
        const parts = file.split('/');
        const category = parts[3];
        const base = parts[4];
        // get clean slugs
        const categorySlug = category.toLowerCase();
        const toolSlug = base.replace(/\.astro$/, '').toLowerCase();

        // href like /OSRS/slayer
        const href = `/${categorySlug}/${toolSlug}`;

        const meta = (mod?.tool ?? {}) as ToolMeta;
        if (meta.hidden) continue;

        const entry: ToolEntry = {
            name: meta.title ?? toTitle(toolSlug),
            description: meta.description,
            order: meta.order ?? 0,
            href,
            category,
            component: mod.default
        };

        if (!groups[category]) groups[category] = { title: toTitle(category), slug: categorySlug, tools: [] };
        groups[category].tools.push(entry);
    }

    // sort tools within groups
    return Object.values(groups).map((g) => ({
        ...g,
        tools: g.tools
            .sort((a, b) => a.name.localeCompare(b.name))
            .sort((a, b) => a.order - b.order),
    }));
}

export function discoverToolsFor(category: string): CategoryGroup | null {
    const all = discoverTools();
    const match = all.find((g) => g.title.toLowerCase() === category.toLowerCase());
    return match ?? null;
}

function toTitle(slug: string) {
    return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function findCategoryTitle(slug: string): string | null {
    const all = discoverTools();
    const found = all.find(
        (c) => c.title.toLowerCase() === slug.toLowerCase()
    );
    return found?.title ?? null;
}

export function findToolTitle(categorySlug: string, toolSlug: string): string | null {
    const all = discoverTools();
    const category = all.find((c) => c.title.toLowerCase() === categorySlug.toLowerCase());
    if (!category) return null;
    const tool = category.tools.find((t) => t.href.toLowerCase().endsWith(`/${toolSlug.toLowerCase()}`));
    return tool?.name ?? null;
}
