/**
 * @typedef {object} SerializedSitemapEntry
 * @property {string} url
 * @property {Date | undefined} lastmod Astro's sitemap bruger Date; stream serialiseres til ISO
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * Konsekvent Unicode-normalisering — macOS-disk kan bruge NFD i filnavne, mens URL.path bruger NFC.
 * @param {string} s
 */
function unicodeNFC(s) {
	return s.normalize('NFC');
}

/**
 * Normaliser Astro-sitemap-URL til path uden trailing slash ('/' eller '/opskrifter/…').
 * Afkoder også percent-encoding (æøå i slugs).
 * @param {string} canonicalUrl
 * @returns {string}
 */
export function pathnameFromSitemapUrl(canonicalUrl) {
	const u = new URL(canonicalUrl);
	let raw =
		u.pathname.endsWith('/') && u.pathname !== '/' ? u.pathname.slice(0, -1) : u.pathname;
	try {
		raw = decodeURIComponent(raw);
	} catch {
		// sjælden ugyldig %-sekvens — brug rå pathname
	}
	return unicodeNFC(raw === '' ? '/' : raw);
}

/** @param {string} yamlLineValue */
function scalarFromYaml(yamlLineValue) {
	let t = yamlLineValue.trim();
	if (!t.startsWith('|') && !t.startsWith('>')) {
		t = t.replace(/^["']|["']$/g, '');
		const hash = t.search(/\s+#/);
		if (hash >= 0) t = t.slice(0, hash).trim();
	}
	return t;
}

/**
 * @param {string} content
 * @returns {{ pub: Date | null, upd: Date | null }}
 */
function pubAndUpdatedDatesFromMarkdown(content) {
	const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!m) return { pub: null, upd: null };
	const fm = m[1];
	const pubMatch = fm.match(/^\s*pubDate\s*:\s*(.+)$/m);
	const updMatch = fm.match(/^\s*updatedDate\s*:\s*(.+)$/m);
	const pub = pubMatch ? new Date(scalarFromYaml(pubMatch[1])) : null;
	const upd = updMatch ? new Date(scalarFromYaml(updMatch[1])) : null;
	return {
		pub: Number.isFinite(pub?.getTime?.()) ? pub : null,
		upd: Number.isFinite(upd?.getTime?.()) ? upd : null,
	};
}

function effectiveMarkdownDate(content) {
	const { pub, upd } = pubAndUpdatedDatesFromMarkdown(content);
	const d = upd ?? pub;
	return d ?? null;
}

/**
 * Alle .md rekursivt under rootDir.
 * @param {string} dir
 * @returns {Iterable<string>}
 */
function* walkMdFiles(dir) {
	for (const e of readdirSync(dir, { withFileTypes: true })) {
		const fp = join(dir, e.name);
		if (e.isDirectory()) yield* walkMdFiles(fp);
		else if (e.name.endsWith('.md')) yield fp;
	}
}

/**
 * pathname /opskrifter/* og /anmeldelser/*
 * @param {string} repoRoot
 * @returns {Map<string, string>}
 */
function buildMarkdownLastmodISOByPath(repoRoot) {
	const map = new Map();
	const defs = [
		{ folder: join(repoRoot, 'src/content/recipes'), pathnamePrefix: '/opskrifter' },
		{ folder: join(repoRoot, 'src/content/airfryer-reviews'), pathnamePrefix: '/anmeldelser' },
	];
	for (const { folder, pathnamePrefix } of defs) {
		if (!existsSync(folder)) continue;
		for (const fp of walkMdFiles(folder)) {
			const rel = relative(folder, fp).replace(/\\/g, '/').replace(/\.md$/, '');
			let pathname =
				pathnamePrefix === '/' ? `/${rel}` : `${pathnamePrefix}/${rel}`;
			pathname = unicodeNFC(pathname);
			try {
				const content = readFileSync(fp, 'utf8');
				const d = effectiveMarkdownDate(content);
				if (!d) continue;
				map.set(pathname, d.toISOString());
			} catch {
				// ignorer ødelagte filer — sitemap får blot ingen lastmod
			}
		}
	}
	return map;
}

/**
 * Matcher statisk Astro-side til pathname (kun offentlige ruter på sitet).
 * @param {string} repoRoot
 * @param {string} pathname
 * @returns {string | null} filsti hvis den findes
 */
function astroSourcePathForPublicPath(repoRoot, pathname) {
	const p = unicodeNFC(pathname);
	const relSeg = p === '/' ? '' : p.slice(1);
	const tries = [];

	if (!relSeg) tries.push(join(repoRoot, 'src/pages/index.astro'));
	else {
		tries.push(join(repoRoot, 'src/pages', `${relSeg}.astro`));
		tries.push(join(repoRoot, 'src/pages', relSeg, 'index.astro'));
	}

	for (const p of tries) {
		if (existsSync(p)) return p;
	}
	return null;
}

/**
 * Opretter astro.config `serialize`-funktion: udfylder `lastmod` (ISO UTC) ud fra Markdown og sidemtimes.
 *
 * @param {string} repoRoot projektrod (som dirname af astro.config.mjs)
 */
export function createSerializeWithLastmodFromContent(repoRoot) {
	let mdMap = /** @type {Map<string, string> | null} */ (null);

	return /** @returns {Promise<SerializedSitemapEntry | undefined>} */ async (item) => {
		if (!mdMap) mdMap = buildMarkdownLastmodISOByPath(repoRoot);

		const pathname = pathnameFromSitemapUrl(item.url);
		const isoFromMd = mdMap.get(pathname);
		let lastmodISO = isoFromMd;

		if (!lastmodISO) {
			const astroPath = astroSourcePathForPublicPath(repoRoot, pathname);
			if (astroPath)
				lastmodISO = statSync(astroPath).mtime.toISOString().replace(/\.\d{3}Z$/, 'Z');
		}

		if (!lastmodISO) return { ...item, lastmod: undefined };

		/** Astro's Sitemap-stream accepterer Date (fra SitemapStream typetyp). */
		return {
			...item,
			lastmod: new Date(lastmodISO),
		};
	};
}
