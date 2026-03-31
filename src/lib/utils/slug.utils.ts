export function slugify(s: string): string {
	return s
		.toLowerCase()
		.normalize('NFD') // split accented chars (é → e + ́)
		.replace(/[\u0300-\u036f]/g, '') // remove diacritics
		.replace(/[^a-z0-9\s-]/g, '') // remove weird chars
		.trim()
		.replace(/\s+/g, '-') // spaces -> dashes
		.replace(/-+/g, '-'); // collapse multiple dashes
}
