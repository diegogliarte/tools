export function slugify(str: string): string {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-") // spaces & symbols → dash
        .replace(/^-+|-+$/g, "");   // trim leading/trailing dashes
}
