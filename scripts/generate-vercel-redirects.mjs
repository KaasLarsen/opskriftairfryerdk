/**
 * Skriver recipe-legacy 301'ere til vercel.json.
 *
 * Gammelt mønster (før slug-prefix): /opskrifter/{base}-i-airfryer(.html)
 * Nyt mønster: /opskrifter/airfryer-{base}
 *
 * Kør efter nye opskrifter: `node scripts/generate-vercel-redirects.mjs`
 * Valgfri one-offs: src/data/recipe-legacy-redirect-overrides.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const recipesDir = path.join(root, 'src/content/recipes');
const vercelPath = path.join(root, 'vercel.json');
const overridesPath = path.join(root, 'src/data/recipe-legacy-redirect-overrides.json');

function readOverrides() {
	if (!fs.existsSync(overridesPath)) {
		return [];
	}
	const raw = JSON.parse(fs.readFileSync(overridesPath, 'utf8'));
	const list = raw.redirects;
	if (!Array.isArray(list)) {
		throw new Error(`${overridesPath}: forventer { "redirects": [ ... ] }`);
	}
	for (const row of list) {
		if (!row.source?.startsWith('/') || !row.destination?.startsWith('/')) {
			throw new Error(`${overridesPath}: hver redirect skal have source og destination med absolut sti`);
		}
	}
	return list.map((row) => ({
		source: row.source,
		destination: row.destination,
		permanent: true,
	}));
}

function legacyRedirectsFromRecipes() {
	const files = fs.readdirSync(recipesDir);
	const md = files.filter((f) => f.endsWith('.md'));
	const out = [];
	const seen = new Set();

	for (const file of md) {
		const id = file.replace(/\.md$/u, '');
		if (!id.startsWith('airfryer-')) {
			console.warn(`springer over (forventer airfryer-prefix): ${file}`);
			continue;
		}
		const base = id.slice('airfryer-'.length);
		const legacySlug = `${base}-i-airfryer`;
		const dest = `/opskrifter/airfryer-${base}`;

		for (const source of [`/opskrifter/${legacySlug}.html`, `/opskrifter/${legacySlug}`]) {
			if (seen.has(source)) {
				throw new Error(`dublet source: ${source}`);
			}
			seen.add(source);
			out.push({ source, destination: dest, permanent: true });
		}
	}

	// Stabil diff: .html først per slug, derefter alfabetisk på source
	out.sort((a, b) => a.source.localeCompare(b.source));
	return out;
}

const tailRedirects = [
	{
		source: '/opskrifter/:slug.html',
		destination: '/opskrifter/:slug',
		permanent: true,
	},
	{
		source: '/:page.html',
		destination: '/:page',
		permanent: true,
	},
];

const headRedirects = [
	{
		source: '/index.html',
		destination: '/',
		permanent: true,
	},
];

const generated = legacyRedirectsFromRecipes();
const overrides = readOverrides();
const redirects = [...headRedirects, ...overrides, ...generated, ...tailRedirects];

const next = {
	trailingSlash: false,
	redirects,
};

fs.writeFileSync(vercelPath, `${JSON.stringify(next, null, '\t')}\n`, 'utf8');
console.log(
	`vercel.json opdateret: ${headRedirects.length} faste forrest, ${overrides.length} overrides, ${generated.length} recipe-legacy, ${tailRedirects.length} fallback-wildcards`,
);
