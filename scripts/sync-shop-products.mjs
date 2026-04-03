#!/usr/bin/env node
/**
 * Hent PartnerAds XML-feeds (PARTNERADS_FEED_URLS kommasepareret) og skriv
 * public/data/shop-products.json til brug på /shop.
 *
 * - Ingen URL'er: skriv tom liste (exit 0) så build kan køre lokalt uden feeds.
 * - URL'er sat: fejl ved fetch/parse → exit 1 (undgå stille tom produktion).
 */

import { mkdirSync, readFileSync, existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fetchPartnerAdsFeed } from './partnerads-feeds.mjs';
import { isAirfryerShopRelevant } from './shop-airfryer-classify.mjs';

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

function parseFeedUrls() {
	const raw = process.env.PARTNERADS_FEED_URLS?.trim() ?? '';
	if (!raw) return [];
	return raw
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
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
	const urls = parseFeedUrls();
	mkdirSync(OUT_DIR, { recursive: true });

	if (urls.length === 0) {
		const payload = {
			generatedAt: new Date().toISOString(),
			sources: [],
			products: [],
			message:
				'Ingen PARTNERADS_FEED_URLS sat — tom produktliste. Sæt feed-URL\'er i miljø for at fylde shop.',
		};
		writeFileSync(OUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
		console.warn('sync-shop-products: PARTNERADS_FEED_URLS er tom — skriver tom shop-products.json');
		return;
	}

	/** @type {{ index: number, urlPreview: string, count: number }[]} */
	const sources = [];
	/** @type {unknown[]} */
	const all = [];

	for (let i = 0; i < urls.length; i++) {
		const url = urls[i];
		console.log(`sync-shop-products: henter feed ${i + 1}/${urls.length} …`);
		const rows = await fetchPartnerAdsFeed(url, i);
		sources.push({ index: i, urlPreview: previewUrl(url), count: rows.length });
		for (let j = 0; j < rows.length; j++) all.push(rows[j]);
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

	const payload = {
		generatedAt: new Date().toISOString(),
		sources,
		products,
		filterNote:
			'Kun produkter med airfryer-/varmluftsfriture-kontekst (apparat eller tilbehør). Se scripts/shop-airfryer-classify.mjs.',
		stats: {
			mergedUnique: deduped.length,
			afterAirfryerScope: products.length,
		},
	};

	writeFileSync(OUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
	console.log(
		`sync-shop-products: ${deduped.length} unik(e) → ${products.length} airfryer-relevante → public/data/shop-products.json (${sources.length} feed(s))`,
	);
}

main().catch((err) => {
	console.error('sync-shop-products: FEJL', err);
	process.exit(1);
});
