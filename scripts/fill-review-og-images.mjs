#!/usr/bin/env node
/**
 * Tilføjer heroImage (og:image fra Boligcenter) til anmeldelser uden billede,
 * ud fra partner-ads shopProductUrl → htmlurl.
 *
 * Kør: node scripts/fill-review-og-images.mjs
 * Kræver netværk. Polite delay mellem forespørgsler.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REVIEW_DIR = path.join(__dirname, '../src/content/airfryer-reviews');
const DELAY_MS = 350;
const UA = 'OpskriftAirfryerOgImageBot/1.0 (+https://www.opskrift-airfryer.dk)';

function sleep(ms) {
	return new Promise((r) => setTimeout(r, ms));
}

/** htmlurl i partner-links kan indeholde ? før & — URL-parser giver korrekt basis + evt. ?utm_id=1 */
function extractBoligcenterProductUrl(shopProductUrl) {
	try {
		const u = new URL(shopProductUrl.trim());
		const raw = u.searchParams.get('htmlurl');
		if (!raw) return null;
		const decoded = decodeURIComponent(raw);
		if (!decoded.includes('boligcenter.dk')) return null;
		const p = new URL(decoded);
		p.search = '';
		p.hash = '';
		return p.toString();
	} catch {
		return null;
	}
}

async function fetchOgImage(productUrl) {
	const res = await fetch(productUrl, {
		redirect: 'follow',
		headers: { 'User-Agent': UA, Accept: 'text/html' },
	});
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	const html = await res.text();
	const m = html.match(/property="og:image"\s+content="([^"]+)"/i);
	if (!m) throw new Error('ingen og:image');
	return m[1].trim();
}

function hasHeroImageBlock(fm) {
	return /^heroImage:\s/m.test(fm);
}

/** Indsæt heroImage + heroAlt efter brandLabel, ellers feedProductId, ellers shopProductUrl. */
function insertHeroFields(fm, { heroImage, heroAlt }) {
	const lines = fm.split('\n');
	let insertAfter = -1;
	for (let i = 0; i < lines.length; i++) {
		if (/^brandLabel:\s/.test(lines[i])) insertAfter = i;
	}
	if (insertAfter === -1) {
		for (let i = 0; i < lines.length; i++) {
			if (/^feedProductId:\s/.test(lines[i])) insertAfter = i;
		}
	}
	if (insertAfter === -1) {
		for (let i = 0; i < lines.length; i++) {
			if (/^shopProductUrl:\s/.test(lines[i])) insertAfter = i;
		}
	}
	if (insertAfter === -1) throw new Error('Kunne ikke finde shopProductUrl/feed/brand i frontmatter');
	const pad = '';
	const hi = `${pad}heroImage: '${heroImage.replace(/'/g, "''")}'`;
	const ha = `${pad}heroAlt: '${heroAlt.replace(/'/g, "''")}'`;
	const out = [...lines.slice(0, insertAfter + 1), hi, ha, ...lines.slice(insertAfter + 1)];
	return out.join('\n');
}

function parseFrontmatter(raw) {
	const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!m) throw new Error('Mangler frontmatter');
	return { fm: m[1], rest: raw.slice(m[0].length), fullMatch: m[0] };
}

async function main() {
	const files = fs
		.readdirSync(REVIEW_DIR)
		.filter((f) => f.endsWith('.md'))
		.sort();

	const results = { ok: [], skip: [], fail: [] };

	for (const file of files) {
		const fp = path.join(REVIEW_DIR, file);
		const raw = fs.readFileSync(fp, 'utf8');
		const { fm, rest } = parseFrontmatter(raw);

		if (hasHeroImageBlock(fm)) {
			results.skip.push(file);
			continue;
		}

		const shopM = fm.match(/^shopProductUrl:\s*['"]([^'"]+)['"]/m);
		if (!shopM) {
			results.fail.push({ file, err: 'mangler shopProductUrl' });
			continue;
		}

		const productUrl = extractBoligcenterProductUrl(shopM[1]);
		if (!productUrl) {
			results.fail.push({ file, err: 'ikke Boligcenter htmlurl' });
			continue;
		}

		const titleM = fm.match(/^title:\s*['"]([^'"]+)['"]/m);
		const title = titleM ? titleM[1] : file;

		try {
			const og = await fetchOgImage(productUrl);
			const newFm = insertHeroFields(fm, {
				heroImage: og,
				heroAlt: title,
			});
			fs.writeFileSync(fp, `---\n${newFm}\n---${rest}`, 'utf8');
			results.ok.push({ file, og: og.slice(0, 72) + '…' });
		} catch (e) {
			results.fail.push({ file, err: String(e?.message ?? e), productUrl });
		}

		await sleep(DELAY_MS);
	}

	console.log(JSON.stringify(results, null, 2));
	console.error(
		`Færdig: ${results.ok.length} opdateret, ${results.skip.length} sprunget over (havde heroImage), ${results.fail.length} fejlede`,
	);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
