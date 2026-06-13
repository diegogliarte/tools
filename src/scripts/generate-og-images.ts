import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const BASE_URL = process.env.OG_BASE_URL ?? 'http://localhost:5173';
const OUTPUT_DIR = path.resolve('static/og');

function extractSitemapUrls(xml: string) {
	const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)];

	return matches.map((match) =>
		match[1]
			.replaceAll('&amp;', '&')
			.replaceAll('&lt;', '<')
			.replaceAll('&gt;', '>')
			.replaceAll('&quot;', '"')
			.replaceAll('&apos;', "'")
	);
}

function getPathnameFromUrl(url: string) {
	return new URL(url).pathname.replace(/\/+$/, '') || '/';
}

function outputPathForPathname(pathname: string) {
	const cleanPath = pathname.replace(/^\/+/, '').replace(/\/+$/, '');
	return path.join(OUTPUT_DIR, `${cleanPath}.png`);
}

async function getToolPathnamesFromSitemap() {
	const response = await fetch(`${BASE_URL}/sitemap.xml`);

	if (!response.ok) {
		throw new Error(`Failed to fetch sitemap: ${response.status} ${response.statusText}`);
	}

	const xml = await response.text();
	const urls = extractSitemapUrls(xml);

	return urls
		.map(getPathnameFromUrl)
		.filter((pathname) => pathname !== '/')
		.filter((pathname, index, array) => array.indexOf(pathname) === index);
}

async function generateOgImages() {
	const pathnames = await getToolPathnamesFromSitemap();

	const browser = await chromium.launch();

	const page = await browser.newPage({
		viewport: {
			width: 1200,
			height: 630
		},
		deviceScaleFactor: 1
	});

	for (const pathname of pathnames) {
		const url = `${BASE_URL}${pathname}`;
		const outputPath = outputPathForPathname(pathname);

		console.log(`Generating ${outputPath}`);

		await mkdir(path.dirname(outputPath), { recursive: true });

		await page.goto(url, {
			waitUntil: 'networkidle'
		});

		await page.screenshot({
			path: outputPath,
			fullPage: false
		});
	}

	await browser.close();

	console.log(`Generated ${pathnames.length} OG images.`);
}

generateOgImages().catch((error) => {
	console.error(error);
	process.exit(1);
});