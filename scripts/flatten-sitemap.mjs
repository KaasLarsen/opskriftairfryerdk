import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = join(process.cwd(), 'dist');

const chunkFiles = readdirSync(dist).filter((name) => /^sitemap-\d+\.xml$/.test(name));

if (chunkFiles.length === 0) {
	console.error('flatten-sitemap: ingen sitemap-*.xml i dist/ – kør astro build først');
	process.exit(1);
}

const urlBlockRe = /<url\b[^>]*>([\s\S]*?)<\/url>/gi;
const locRe = /<loc>\s*([^<]+?)<\/loc>/;
const lmRe = /<lastmod>\s*([^<]+?)<\/lastmod>/i;

/** @typedef {{ loc: string; lastmod?: string }} Entry */

/** @returns {Iterable<Entry>} */
function entriesFromChunkXml(xml) {
	/** @type {Entry[]} */
	const out = [];
	urlBlockRe.lastIndex = 0;
	let bm;
	while ((bm = urlBlockRe.exec(xml)) !== null) {
		const inner = bm[1];
		const locM = locRe.exec(inner);
		const locRaw = locM?.[1]?.trim();
		if (!locRaw) continue;
		const lmM = lmRe.exec(inner);
		const lastmod = lmM?.[1]?.trim();
		out.push(lastmod ? { loc: locRaw, lastmod } : { loc: locRaw });
	}
	return out;
}

/**
 * Til W3C / Google: dato-strenge uden timezone behandles mest robust som UTC middag,
 * mens fulde ISO-instanser forbliver som parse → toISOString.
 * @param {string | undefined} raw
 */
function normalizeLastmodW3c(raw) {
	if (!raw) return undefined;
	const t = raw.trim().replace(/^["']|["']$/g, '');
	if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return `${t}T12:00:00.000Z`;
	const d = new Date(t);
	if (!Number.isFinite(d.getTime())) return undefined;
	return d.toISOString();
}

/**
 * @param {string | undefined} aISO
 * @param {string | undefined} bISO
 */
function newerLastmodISO(aISO, bISO) {
	if (!aISO) return bISO;
	if (!bISO) return aISO;
	return Date.parse(bISO) >= Date.parse(aISO) ? bISO : aISO;
}

/** @type {Map<string, Entry>} */
const byLoc = new Map();

for (const name of chunkFiles.sort()) {
	const xml = readFileSync(join(dist, name), 'utf8');
	if (!xml.includes('<url')) continue;
	for (const e of entriesFromChunkXml(xml)) {
		const lm = normalizeLastmodW3c(e.lastmod);
		const prev = byLoc.get(e.loc);

		if (!prev) {
			lm ? byLoc.set(e.loc, { loc: e.loc, lastmod: lm }) : byLoc.set(e.loc, { loc: e.loc });
			continue;
		}


		const best = newerLastmodISO(prev.lastmod, lm);


		byLoc.set(e.loc, best ? { loc: e.loc, lastmod: best } : { loc: e.loc });


	}
}

if (byLoc.size === 0) {
	console.error('flatten-sitemap: ingen <loc> i urlset-filer');
	process.exit(1);
}

function escapeXmlText(s) {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

const sortedLoc = [...byLoc.keys()].sort((a, b) =>
	a.localeCompare(b, 'en', { numeric: true }),
);

const body = sortedLoc
	.map((loc) => {

		const meta = byLoc.get(loc);
		let inner = `<loc>${escapeXmlText(loc)}</loc>`;
		if (meta?.lastmod) inner += `<lastmod>${escapeXmlText(meta.lastmod)}</lastmod>`;

		return `<url>${inner}</url>`;
	})
	.join('');

const out = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;

writeFileSync(join(dist, 'sitemap.xml'), out);

const lastmodCount = sortedLoc.filter((l) => byLoc.get(l)?.lastmod).length;
console.log(
	`flatten-sitemap: dist/sitemap.xml med ${sortedLoc.length} URL(er) (${lastmodCount} med lastmod).`,
);
