/**
 * Skriver recipe-legacy + GSC 301'ere til vercel.json.
 *
 * Kør: node scripts/generate-vercel-redirects.mjs
 * (kør evt. først: node scripts/build-gsc-redirects.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const recipesDir = path.join(root, 'src/content/recipes');
const vercelPath = path.join(root, 'vercel.json');
const overridesPath = path.join(root, 'src/data/recipe-legacy-redirect-overrides.json');
const gscPath = path.join(root, 'src/data/gsc-generated-redirects.json');

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

function readGscRedirects() {
	if (!fs.existsSync(gscPath)) {
		return [];
	}
	const raw = JSON.parse(fs.readFileSync(gscPath, 'utf8'));
	const list = raw.redirects;
	if (!Array.isArray(list)) return [];
	return list.map((row) => ({
		source: row.source,
		destination: row.destination,
		permanent: row.permanent !== false,
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
			console.warn('springer over (forventer airfryer-prefix):', file);
			continue;
		}
		const base = id.slice('airfryer-'.length);
		const legacySlug = base + '-i-airfryer';
		const dest = '/opskrifter/airfryer-' + base;

		for (const source of ['/opskrifter/' + legacySlug + '.html', '/opskrifter/' + legacySlug]) {
			if (seen.has(source)) {
				throw new Error('dublet source: ' + source);
			}
			seen.add(source);
			out.push({ source, destination: dest, permanent: true });
		}
	}

	out.sort((a, b) => a.source.localeCompare(b.source));
	return out;
}

const tailRedirects = [
	{ source: '/opskrifter/:slug.html', destination: '/opskrifter/:slug', permanent: true },
	{ source: '/:page.html', destination: '/:page', permanent: true },
];

const headRedirects = [{ source: '/index.html', destination: '/', permanent: true }];

const bySource = new Map();

function addRows(rows, label) {
	for (const r of rows) {
		if (bySource.has(r.source) && bySource.get(r.source).destination !== r.destination) {
			console.warn('redirect-konflikt for', r.source, ':', bySource.get(r.source).destination, 'vs', r.destination, '(' + label + ')');
		}
		bySource.set(r.source, r);
	}
}

addRows(headRedirects, 'head');
addRows(readOverrides(), 'overrides');
addRows(readGscRedirects(), 'gsc');
addRows(legacyRedirectsFromRecipes(), 'recipe-legacy');
addRows(tailRedirects, 'tail');

const redirects = [...bySource.values()];

const next = {
	trailingSlash: false,
	redirects,
};

fs.writeFileSync(vercelPath, JSON.stringify(next, null, '\t') + '\n', 'utf8');
console.log(
	'vercel.json:',
	redirects.length,
	'total (heraf GSC',
	readGscRedirects().length,
	'+ recipe-legacy',
	legacyRedirectsFromRecipes().length,
	')',
);
