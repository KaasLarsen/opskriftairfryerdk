/**
 * Læser src/data/gsc-sider.csv + legacy-url-keyword-routes.json og skriver
 * src/data/gsc-generated-redirects.json (sources uden trailing slash).
 * Kør: node scripts/build-gsc-redirects.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const recipesDir = path.join(root, 'src/content/recipes');
const csvPath = path.join(root, 'src/data/gsc-sider.csv');
const routesPath = path.join(root, 'src/data/legacy-url-keyword-routes.json');
const outPath = path.join(root, 'src/data/gsc-generated-redirects.json');
const missingPath = path.join(root, 'src/data/gsc-missing-recipe-urls.json');

function readRecipes() {
	const recipeIds = fs
		.readdirSync(recipesDir)
		.filter((f) => f.endsWith('.md'))
		.map((f) => f.replace(/\.md$/u, ''));
	const idSet = new Set(recipeIds);
	const bases = recipeIds
		.filter((id) => id.startsWith('airfryer-'))
		.map((id) => id.slice('airfryer-'.length));
	return { recipeIds, idSet, bases };
}

function stripHtml(slug) {
	return slug.replace(/\.html$/iu, '');
}

function normalizeWpSlugFromPath(p) {
	const raw = p.startsWith('/') ? p.slice(1) : p;
	let s = decodeURIComponent(raw).toLowerCase();
	s = s.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, '');
	/* Flag (regional indicators, fx 🇬🇷) */
	s = s.replace(/[\u{1F1E6}-\u{1F1FF}]/gu, '');
	s = s.replace(/\/$/u, '');
	s = s.replace(/^-+|-+$/gu, '');
	return s;
}

function matchIAirfryer(slug, bases) {
	const s = stripHtml(slug);
	const markers = ["-i-airfryer", "-i-airfryeren"];
	let head = null;
	for (const m of markers) {
		const i = s.indexOf(m);
		if (i !== -1) {
			head = s.slice(0, i);
			break;
		}
	}
	if (head === null) return null;
	if (bases.includes(head)) return "airfryer-" + head;
	let best = null;
	let bestLen = -1;
	for (const base of bases) {
		if (head.startsWith(base + "-") || base.startsWith(head + "-")) {
			if (base.length > bestLen) {
				best = base;
				bestLen = base.length;
			}
		}
	}
	if (best) return "airfryer-" + best;
	best = null;
	bestLen = -1;
	for (const base of bases) {
		if (base.endsWith("-" + head) && head.includes("-")) {
			if (base.length > bestLen) {
				best = base;
				bestLen = base.length;
			}
		}
	}
	if (head.includes("-") && best) return "airfryer-" + best;
	best = null;
	bestLen = -1;
	for (const base of bases) {
		if (base.endsWith("-" + head)) {
			if (base.length > bestLen) {
				best = base;
				bestLen = base.length;
			}
		}
	}
	return best ? "airfryer-" + best : null;
}

function isSkippedPath(p) {
	return (
		/^\/(category|tag|anmeldelser|shop|guides|login|auth)(\/|$)/u.test(p) ||
		/^\/\d+(-\d+)?$/u.test(p) ||
		p === '/opskrifter' ||
		p === '/' ||
		p === ''
	);
}

const { idSet, bases } = readRecipes();
const routes = JSON.parse(fs.readFileSync(routesPath, 'utf8'));
const exactSlugs = routes.exactSlugs ?? {};
const keywordRoutes = routes.keywordRoutes ?? [];
const nonRecipeFallbacks = routes.nonRecipeFallbacks ?? { prefixes: [], destination: '/opskrifter' };
const pathPrefixRedirects = routes.pathPrefixRedirects ?? [];
const staticPathRedirects = routes.staticPathRedirects ?? {};
const sortedKeywords = [...keywordRoutes].sort((a, b) => b[0].length - a[0].length);

function resolveExactSlug(slugNorm) {
	if (!slugNorm) return null;
	if (exactSlugs[slugNorm]) return exactSlugs[slugNorm];
	// Efter emoji-fjernelse blev ledende bindestreg trimmet væk; WP-nøgler har ofte "-slug…"
	if (exactSlugs['-' + slugNorm]) return exactSlugs['-' + slugNorm];
	const trimmed = slugNorm.replace(/-+$/gu, '');
	if (trimmed !== slugNorm && exactSlugs[trimmed]) return exactSlugs[trimmed];
	let bestKey = null;
	let bestLen = -1;
	for (const key of Object.keys(exactSlugs)) {
		if (slugNorm === key || slugNorm.startsWith(key + '-') || key.startsWith(slugNorm + '-')) {
			if (key.length > bestLen) {
				bestKey = key;
				bestLen = key.length;
			}
		}
	}
	return bestKey ? exactSlugs[bestKey] : null;
}

function resolvePrefixRedirect(slugNorm) {
	let best = null;
	let bestLen = -1;
	for (const row of pathPrefixRedirects) {
		const pre = row.prefix;
		if (slugNorm.startsWith(pre) && pre.length > bestLen) {
			best = row.destination;
			bestLen = pre.length;
		}
	}
	return best;
}

function keywordToRecipe(wpSlug) {
	for (const [kw, rid] of sortedKeywords) {
		if (wpSlug.includes(kw)) return rid;
	}
	return null;
}

function maybeListFallback(slugNorm) {
	for (const pre of nonRecipeFallbacks.prefixes) {
		if (slugNorm.startsWith(pre)) return nonRecipeFallbacks.destination;
	}
	return null;
}

/** WP-URL kan have emoji/præfiks i pathname; static keys er normaliserede (/slug). */
function resolveStaticRedirect(pathname, slugNorm) {
	const p = pathname.startsWith('/') ? pathname : '/' + pathname;
	const n = slugNorm && slugNorm.startsWith('/') ? slugNorm : slugNorm ? '/' + slugNorm.replace(/^\/+/u, '') : null;
	return (
		staticPathRedirects[p] ??
		staticPathRedirects[p + '/'] ??
		(n ? staticPathRedirects[n] ?? staticPathRedirects[n + '/'] : null)
	);
}

/**
 * Artikeltyper der ikke må ramme keyword→opskrift (fx pizzaovn → pizza).
 * Konservative mønstre: helst underspecifik landing frem for forkert opskrift.
 */
function slugPatternDestination(slugNorm) {
	if (!slugNorm) return null;
	if (/(^|-)(pizzaovn|pizza-oven)|gaspizzaovn/u.test(slugNorm)) return '/anmeldelser';
	if (/spareribs-paa-grill/u.test(slugNorm)) return '/anmeldelser';
	if (/^vare\//u.test(slugNorm) || /^vare-tag\//u.test(slugNorm) || /^varemærke\//u.test(slugNorm)) {
		return '/shop';
	}
	if (/^author\//u.test(slugNorm)) return '/';
	if (slugNorm === 'om-os') return '/om';
	if (slugNorm === 'kurv') return '/shop';
	if (slugNorm === 'seneste.html' || slugNorm === 'kategori.html') return '/opskrifter';
	if (/^page\/\d+$/u.test(slugNorm)) return '/opskrifter';
	if (slugNorm === 'sider/opskrifter.html') return '/opskrifter';
	if (slugNorm === 'guides-sitemap.xml') return '/guides';
	if (/^top\//u.test(slugNorm)) return '/guides/hvad-kan-man-lave-i-en-airfryer';
	if (slugNorm === 'black-friday-airfryer-tilbud.html') return '/guides/hvilken-airfryer';
	if (
		/-shot-naturligt-staerkt|ingefaershot|ingefaer-shot|gulerod-ingefaer-shot|aebleshot|blaabaer-ingefaer-shot|mynteshot|lavendel-citron-drik|chili-ingefaer-tonic|krydret-chaiblanding|citronsirup|appelsin-ingefaer-eliksir|soendag-aeg-og-groent/u.test(
			slugNorm,
		)
	) {
		return '/guides/hvad-kan-man-lave-i-en-airfryer';
	}
	return null;
}

if (!fs.existsSync(csvPath)) {
	console.error('Mangler', csvPath);
	process.exit(1);
}

const text = fs.readFileSync(csvPath, 'utf8');
const lines = text.split(/\r?\n/).slice(2).filter(Boolean);
const redirectsMap = new Map();
const missing = [];

for (const line of lines) {
	const firstComma = line.indexOf(',');
	if (firstComma === -1) continue;
	const urlRaw = line.slice(0, firstComma).trim();
	const clicks = parseInt(line.slice(firstComma + 1), 10) || 0;
	if (!urlRaw.startsWith('https://www.opskrift-airfryer.dk')) continue;
	let u;
	try {
		u = new URL(urlRaw);
	} catch {
		continue;
	}
	let pathname = u.pathname.replace(/\/$/u, '') || '/';
	if (isSkippedPath(pathname)) continue;

	const slugNorm = normalizeWpSlugFromPath(pathname);

	let recipeId = null;
	let destPath =
		resolveStaticRedirect(pathname, slugNorm) ??
		slugPatternDestination(slugNorm) ??
		resolvePrefixRedirect(slugNorm) ??
		null;

	if (!destPath && /(dyrker|mangotrae|avocadotrae|jordbaer|romainesalat|vokser)/u.test(slugNorm)) {
		destPath = '/';
	}

	if (!destPath) {
		recipeId = resolveExactSlug(slugNorm);
		if (recipeId && idSet.has(recipeId)) {
			destPath = '/opskrifter/' + recipeId;
			recipeId = null;
		} else if (recipeId && !idSet.has(recipeId)) {
			missing.push({ url: urlRaw, clicks, reason: 'mapped-to-missing-id', recipeId });
			continue;
		}
	}

	if (!destPath && pathname.startsWith('/opskrifter/')) {
		const slug = pathname.slice('/opskrifter/'.length);
		recipeId = matchIAirfryer(slug, bases);
		const bare = stripHtml(slug);
		if (!recipeId && bare.startsWith('airfryer-') && idSet.has(bare)) {
			recipeId = bare;
		}
	}

	if (!destPath && !recipeId) {
		recipeId = keywordToRecipe(slugNorm);
	}

	if (!destPath && !recipeId) {
		destPath = maybeListFallback(slugNorm);
	}

	if (recipeId) {
		if (!idSet.has(recipeId)) {
			missing.push({ url: urlRaw, clicks, reason: 'mapped-to-missing-id', recipeId });
			continue;
		}
		destPath = '/opskrifter/' + recipeId;
	}

	if (!destPath) {
		missing.push({ url: urlRaw, clicks, path: pathname, slugNorm });
		continue;
	}

	redirectsMap.set(pathname, destPath);
}

const redirects = [...redirectsMap.entries()]
	.sort((a, b) => a[0].localeCompare(b[0]))
	.map(([source, destination]) => ({ source, destination, permanent: true }));

fs.writeFileSync(outPath, JSON.stringify({ description: 'Auto fra GSC + matcher', redirects }, null, '\t') + '\n');
missing.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
fs.writeFileSync(
	missingPath,
	JSON.stringify({ generated: new Date().toISOString(), count: missing.length, items: missing.slice(0, 400) }, null, '\t') + '\n',
);

console.log('skrev', outPath, redirects.length, 'redirects');
console.log('skrev', missingPath, missing.length, 'mangler');
