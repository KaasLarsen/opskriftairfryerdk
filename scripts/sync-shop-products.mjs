#!/usr/bin/env node
/**
 * Hent PartnerAds XML-feeds (PARTNERADS_FEED_URLS kommasepareret) og skriv
 * public/data/shop-products.json til brug på /shop.
 *
 * - Lokalt uden env: tom liste (hurtigt). På Vercel/CI uden env: standard-feeds fra default-shop-feed-urls.mjs.
 * - PARTNERADS_FEED_URLS sat: bruges altid. Fejl på ét feed: logges, øvrige feeds fortsætter.
 */

import { mkdirSync, readFileSync, existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fetchPartnerAdsFeed } from './partnerads-feeds.mjs';
import { isAirfryerShopRelevant } from './shop-airfryer-classify.mjs';
import { DEFAULT_SHOP_FEED_URLS } from './default-shop-feed-urls.mjs';

function loadDotEnv() {
	const p = resolve(process.cwd(), '.env');
	if (!existsSync(p)) return;
	const txt = readFileSync(p, 'utf8');
	for (const line of txt.split(/\r?\n/)) {
		const t = line.trim();
		if (!t || t.startsWith('#')) continue;
		const i = t.indexOf('=');
		if (i === -1) continue;
		const key = t.slice(0, i).trim();
		let val = t.slice(i + 1).trim();
		if (
			(val.startsWith('"') && val.endsWith('"')) ||
			(val.startsWith("'") && val.endsWith("'"))
		) {
			val = val.slice(1, -1);
		}
		if (process.env[key] === undefined) process.env[key] = val;
	}
}

loadDotEnv();

const OUT_DIR = resolve(process.cwd(), 'public/data');
const OUT_FILE = resolve(OUT_DIR, 'shop-products.json');

function parseFeedUrlsFromEnv() {
	const raw = process.env.PARTNERADS_FEED_URLS?.trim() ?? '';
	if (!raw) return [];
	return raw
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
}

/**
 * Lokalt: kun feeds hvis .env / miljø sætter PARTNERADS_FEED_URLS (hurtigere byg uden net).
 * Vercel/CI: brug env hvis sat, ellers de checkede standard-feeds så shop ikke er tom.
 */
function resolveFeedUrls() {
	const fromEnv = parseFeedUrlsFromEnv();
	if (fromEnv.length > 0) return { urls: fromEnv, source: 'env' };

	if (process.env.SKIP_SHOP_DEFAULT_FEEDS === '1') return { urls: [], source: 'none' };

	const onHost =
		process.env.VERCEL === '1' ||
		process.env.CI === 'true' ||
		process.env.CONTINUOUS_INTEGRATION === 'true';
	if (onHost) {
		return { urls: DEFAULT_SHOP_FEED_URLS.slice(), source: 'default' };
	}

	return { urls: [], source: 'none' };
}

function previewUrl(u) {
	try {
		const x = new URL(u);
		return `${x.origin}${x.pathname.slice(0, 48)}`;
	} catch {
		return u.slice(0, 64);
	}
}

async function main() {
	const { urls, source } = resolveFeedUrls();
	mkdirSync(OUT_DIR, { recursive: true });

	if (urls.length === 0) {
		const payload = {
			generatedAt: new Date().toISOString(),
			sources: [],
			products: [],
			message:
				'Ingen feed-URL\'er — tom shop. Lokalt: sæt PARTNERADS_FEED_URLS eller byg på Vercel (standard-feeds).',
		};
		writeFileSync(OUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
		console.warn('sync-shop-products: ingen feeds konfigureret — skriver tom shop-products.json');
		return;
	}

	if (source === 'default') {
		console.warn(
			'sync-shop-products: bruger indbyggede standard-feeds (sæt PARTNERADS_FEED_URLS for at overstyre)',
		);
	}

	/** @type {{ index: number, urlPreview: string, count: number, error?: string }[]} */
	const sources = [];
	/** @type {unknown[]} */
	const all = [];

	for (let i = 0; i < urls.length; i++) {
		const url = urls[i];
		console.log(`sync-shop-products: henter feed ${i + 1}/${urls.length} …`);
		try {
			const rows = await fetchPartnerAdsFeed(url, i);
			sources.push({ index: i, urlPreview: previewUrl(url), count: rows.length });
			for (let j = 0; j < rows.length; j++) all.push(rows[j]);
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			console.error(`sync-shop-products: feed ${i + 1} fejlede — fortsætter uden den (${msg})`);
			sources.push({ index: i, urlPreview: previewUrl(url), count: 0, error: msg });
		}
	}

	const seen = new Set();
	const deduped = all.filter((p) => {
		const u = typeof p.productUrl === 'string' ? p.productUrl : '';
		if (!u || seen.has(u)) return false;
		seen.add(u);
		return true;
	});

	const products = deduped.filter((p) =>
		isAirfryerShopRelevant(
			/** @type {{ title?: string; category?: string; brand?: string }} */ (p),
		),
	);

	const failedFeeds = sources.filter((s) => s.error);
	const payload = {
		generatedAt: new Date().toISOString(),
		feedConfigSource: source,
		sources,
		products,
		filterNote: 'Kun airfryere og relateret tilbehør i dette udvalg.',
		stats: {
			mergedUnique: deduped.length,
			afterAirfryerScope: products.length,
			feedErrors: failedFeeds.length,
		},
	};

	writeFileSync(OUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
	console.log(
		`sync-shop-products: ${deduped.length} unik(e) → ${products.length} airfryer-relevante → public/data/shop-products.json (${sources.length} feed(s))`,
	);
	if (failedFeeds.length > 0) {
		console.warn(
			`sync-shop-products: advarsel — ${failedFeeds.length} feed(s) fejlede (shop kan være delvis/tom). Site bygger stadig.`,
		);
	}
}

main().catch((err) => {
	console.error('sync-shop-products: uventet FEJL', err);
	process.exit(1);
});
