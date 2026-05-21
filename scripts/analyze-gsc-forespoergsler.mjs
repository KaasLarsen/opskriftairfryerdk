/**
 * Læser en GSC-export (Forespørgsler.csv) og sammenholder med eksisterende opskrifter.
 * Finder forespørgsler med lav/nul match → kandidater til **nyt indhold** eller udvidelse.
 *
 * Eksport fra GSC: Effektivitet → Forespørgsler → Eksporter (CSV, UTF‑8).
 * Gem som fx: src/data/gsc-forespoergsler.csv
 *
 * Kør:
 *   node scripts/analyze-gsc-forespoergsler.mjs [sti-til.csv] [--demo] [--mins 80] [--threshold 0.35]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const recipesDir = path.join(root, 'src/content/recipes');

const STOP = new Set([
	'i',
	'og',
	'til',
	'med',
	'hvordan',
	'hvor',
	'en',
	'et',
	'den',
	'det',
	'som',
	'fra',
	'eller',
	'bare',
	'din',
	'dit',
	'jeres',
	'min',
	'man',
	'kan',
	'være',
	'vaere',
]);

function foldDa(s) {
	return s
		.toLowerCase()
		.replaceAll('æ', 'ae')
		.replaceAll('ø', 'oe')
		.replaceAll('å', 'aa')
		.replaceAll('ä', 'ae')
		.replaceAll('ö', 'oe');
}

/** Simpel RFC4180‑lignede CSV-parser (newline = række). */
function parseCsv(text) {
	const rows = [];
	let row = [];
	let cell = '';
	let inQuotes = false;
	for (let i = 0; i < text.length; i++) {
		const c = text[i];
		if (inQuotes) {
			if (c === '"') {
				if (text[i + 1] === '"') {
					cell += '"';
					i++;
				} else {
					inQuotes = false;
				}
			} else {
				cell += c;
			}
			continue;
		}
		if (c === '"') {
			inQuotes = true;
			continue;
		}
		if (c === ',') {
			row.push(cell);
			cell = '';
			continue;
		}
		if (c === '\r') continue;
		if (c === '\n') {
			row.push(cell);
			if (row.some((x) => String(x).trim() !== '')) rows.push(row);
			row = [];
			cell = '';
			continue;
		}
		cell += c;
	}
	if (cell !== '' || row.length) {
		row.push(cell);
		if (row.some((x) => String(x).trim() !== '')) rows.push(row);
	}
	return rows;
}

function parseKeywordsFromFrontmatter(fm) {
	const m = fm.match(/^keywords:\s*\n([\s\S]*?)(?=^[a-zA-Z_]+:)/m);
	if (!m) return [];
	const block = m[1];
	const out = [];
	for (const line of block.split('\n')) {
		const item = line.match(/^\s*-\s+(.+)$/);
		if (item) out.push(item[1].trim());
	}
	return out;
}

function loadRecipes() {
	const files = fs.readdirSync(recipesDir).filter((f) => f.endsWith('.md'));
	const list = [];
	for (const file of files) {
		const id = file.replace(/\.md$/u, '');
		const raw = fs.readFileSync(path.join(recipesDir, file), 'utf8');
		if (!raw.startsWith('---')) continue;
		const end = raw.indexOf('\n---\n', 3);
		if (end === -1) continue;
		const fm = raw.slice(3, end);
		let title = '';
		const tm = fm.match(/^title:\s*['']([^'\n]*)['']/m);
		if (tm) title = tm[1];
		const kms = parseKeywordsFromFrontmatter(fm);
		const hay = foldDa(`${id} ${title} ${kms.join(' ')}`);
		list.push({ id, title, hay, keywords: kms });
	}
	return list;
}

function tokenizeForMatch(s) {
	return foldDa(s)
		.replace(/[^a-z0-9\s-]/gu, ' ')
		.split(/[\s-]+/)
		.filter((w) => w.length > 1 && !STOP.has(w))
		.filter((w) => w !== 'airfryer' && w !== 'air' && w !== 'fryer'); /* stadig slug indeholder kontekst */
}

function scoreQueryAgainstRecipes(queryNorm, hayByRecipe) {
	const qTokens = tokenizeForMatch(queryNorm);
	if (qTokens.length === 0) return { bestScore: 0, bestId: null };
	let bestScore = 0;
	let bestId = null;
	for (const { id, hay } of hayByRecipe) {
		let hit = 0;
		for (const t of qTokens) {
			if (hay.includes(t)) hit++;
		}
		const score = hit / qTokens.length;
		if (score > bestScore) {
			bestScore = score;
			bestId = id;
		}
	}
	return { bestScore, bestId };
}

/** Heltalskolonner fra GSC (kan indeholde mellemrum / ikke‑breaking space). */
function parseImpactCell(cell) {
	if (cell === undefined || cell === null) return 0;
	const digits = String(cell).replace(/\D/gu, '');
	const n = Number(digits || '0');
	return Number.isFinite(n) ? n : 0;
}

function parseCliRows({ demo, csvPathArg }) {
	if (demo) {
		const demoQueries = [
			'nachos i airfryer',
			'ribeye i airfryer',
			'laks i airfryer med asparges',
			'bagte kartofler i airfryer',
			'kyllingeschnitzel luftfriteuse',
			'laksepande i airfryer',
			'rødspætte baby i airfryer',
			'linselasagne vegetar airfryer',
			'couscous bowl airfryer',
			'protein donut airfryer',
		];
		return demoQueries.map((q, i) => ({
			query: q,
			clicks: 50 - i * 3,
			impressions: 5000 - i * 400,
		}));
	}
	const csvPath =
		csvPathArg ??
		path.join(root, 'src/data/gsc-forespoergsler.csv');

	if (!fs.existsSync(csvPath)) {
		console.error(
			'Mangler CSV. Eksporter “Forespørgsler” fra GSC og gem som:\n  src/data/gsc-forespoergsler.csv\n\nEller kør med eksempel:\n  node scripts/analyze-gsc-forespoergsler.mjs --demo\n',
		);
		process.exit(1);
	}

	const txt = fs.readFileSync(csvPath, 'utf8');
	const rows = parseCsv(txt);
	if (rows.length < 2) {
		console.error('CSV indeholder ikke data (forvent header + mindst én række).');
		process.exit(1);
	}
	const header = rows[0].map((h) => foldDa(String(h).trim()));

	let qIdx = header.findIndex((h) =>
		/forespoer|foresporgsel|popular|keyword|top|avg|queries|terms/.test(
			h.replace(/\s+/gu, ''),
		),
	);
	if (qIdx === -1) qIdx = 0;

	let impIdx = header.findIndex((h) => /(ekspon|impress|visning)/.test(h));
	let clkIdx = header.findIndex((h) => /^klik|^click/.test(h));

	const out = [];
	for (let r = 1; r < rows.length; r++) {
		const cols = rows[r];
		const query = cols[qIdx]?.trim();
		if (!query) continue;
		const impressions = impIdx >= 0 ? parseImpactCell(cols[impIdx]) : 0;
		const clicks = clkIdx >= 0 ? parseImpactCell(cols[clkIdx]) : 0;
		out.push({ query, clicks, impressions });
	}
	return out;
}

function main() {
	const args = process.argv.slice(2);
	let minImp = 80;
	let threshold = 0.35;
	let demo = args.includes('--demo');
	let csvPathArg = args.find((a) => !a.startsWith('--') && a.endsWith('.csv'));

	for (const a of args) {
		if (a.startsWith('--mins=')) {
			const v = Number(a.slice('--mins='.length));
			if (Number.isFinite(v)) minImp = v;
		}
		if (a.startsWith('--threshold=')) {
			const v = Number(a.slice('--threshold='.length));
			if (Number.isFinite(v)) threshold = v;
		}
	}

	const rows = parseCliRows({ demo, csvPathArg });

	const recipes = loadRecipes();
	const hayByRecipe = recipes.map((x) => ({ id: x.id, hay: x.hay }));

	const analyzed = [];
	for (const row of rows) {
		const { query, clicks, impressions } = row;
		if (impressions < minImp) continue;
		const { bestScore, bestId } = scoreQueryAgainstRecipes(query, hayByRecipe);
		analyzed.push({
			query,
			clicks,
			impressions,
			score: bestScore,
			bestId,
			isMatch: bestScore >= threshold,
		});
	}
	analyzed.sort((a, b) => b.impressions - a.impressions);

	const lines = [
		'# GSC → nyt indhold (auto‑kladde)',
		'',
		`_Genereret af \`analyze-gsc-forespoergsler.mjs\`. Min ekspon.: **${minImp}**. Match‑tærskel: **${threshold}**._`,
		'',
		'| Forespørgsel | Ekspon. | Klik | Match‑score | Tætteste slug | Triage |',
		'|---|--:|--:|---:|---|---|',
	];
	for (const a of analyzed) {
		const tri = a.isMatch ? 'Udvid/optimer eksisterende' : 'Overvej **ny opskriftside** eller kraftig udvidelse';
		const slugCell = a.bestId ? a.bestId : '–';
		lines.push(
			'| ' +
				a.query.replace(/\|/gu, '\\|') +
				' | ' +
				a.impressions +
				' | ' +
				a.clicks +
				' | ' +
				a.score.toFixed(2) +
				' | ' +
				slugCell +
				' | ' +
				tri +
				' |',
		);
	}
	lines.push(
		'',
		'### Sådan bruger du det',
		'',
		'1. Sorter først på **lav match + høj eksponering**.',
		'2. Slå kolonnen "Tætteste slug" op: dækker eksisterende side søgeordet? → titel/description/FAQ. Ellers → ny Markdown-fil under src/content/recipes/.',
		'3. Tilpas gamle URLs i legacy-url-keyword-routes.json ved behov og kør npm run gsc:redirects + npm run vercel:redirects.',
		'',
	);

	console.log(lines.join('\n'));
}

main();
