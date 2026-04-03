/**
 * Kuratering af shop: fastpinede id'er + regex fra scripts/shop-airfryer-classify.mjs.
 * Kun luftfriture og tilbehør — alt andet filtreres fra ved sync og klassificeres som 'other'.
 */

import { classifyShopProductBase } from '../../scripts/shop-airfryer-classify.mjs';

export type ShopProductJson = {
	id: string;
	title: string;
	brand: string;
	category: string;
	/** PartnerAds `forhandler` — butiksnavn til CTA */
	retailer?: string;
	color?: string;
	sizeLabel?: string;
	/** Udledt fra titel/størrelsesfelt (liter), til kurv-filter */
	capacityLiters?: number | null;
	price: number | null;
	listPrice: number | null;
	imageUrl: string | null;
	productUrl: string;
	sourceIndex: number;
};

/** Sæt konkrete feed-id'er / EAN her når I kender dem — de tvinger kategori. */
export const PINNED_AIRFRYER_IDS: string[] = [];

export const PINNED_ACCESSORY_IDS: string[] = [];

export type ShopShelf = 'airfryer' | 'accessory' | 'other';

export function classifyShopProduct(
	p: Pick<ShopProductJson, 'id' | 'title' | 'category' | 'brand'>,
): ShopShelf {
	if (PINNED_AIRFRYER_IDS.includes(p.id)) return 'airfryer';
	if (PINNED_ACCESSORY_IDS.includes(p.id)) return 'accessory';
	return classifyShopProductBase(p);
}

/** Antal kort i "Udvalgte airfryere" / "Udvalgt tilbehør" på /shop */
export const SHOP_FEATURED_AIRFRYER_LIMIT = 12;
export const SHOP_FEATURED_ACCESSORY_LIMIT = 12;

function hasImage(p: ShopProductJson): boolean {
	return Boolean(p.imageUrl && String(p.imageUrl).trim());
}

function hasPrice(p: ShopProductJson): boolean {
	return p.price != null && Number.isFinite(p.price);
}

/** Inden for samme feed: bedst visuelle/praktiske bud først (stabilt ved samme score). */
function compareWithinFeed(a: ShopProductJson, b: ShopProductJson): number {
	const img = Number(hasImage(b)) - Number(hasImage(a));
	if (img !== 0) return img;
	const pr = Number(hasPrice(b)) - Number(hasPrice(a));
	if (pr !== 0) return pr;
	const pa = a.price ?? 0;
	const pb = b.price ?? 0;
	if (pb !== pa) return pb - pa;
	return a.title.localeCompare(b.title, 'da', { sensitivity: 'base' });
}

/**
 * Round-robin på tværs af feeds (sourceIndex), så udvalget spredes på forskellige partnere/bannere.
 */
function pickRoundRobinAcrossSources(
	candidates: ShopProductJson[],
	limit: number,
	alreadyTaken: Set<string>,
): ShopProductJson[] {
	if (limit <= 0 || candidates.length === 0) return [];

	const bySource = new Map<number, ShopProductJson[]>();
	for (const p of candidates) {
		const idx = Number.isFinite(p.sourceIndex) ? p.sourceIndex : 0;
		let arr = bySource.get(idx);
		if (!arr) {
			arr = [];
			bySource.set(idx, arr);
		}
		arr.push(p);
	}

	const sourceKeys = [...bySource.keys()].sort((a, b) => a - b);
	for (const k of sourceKeys) {
		const list = bySource.get(k);
		if (list) list.sort(compareWithinFeed);
	}

	const queues = sourceKeys.map((k) => bySource.get(k) ?? []);
	const out: ShopProductJson[] = [];
	let guard = 0;
	const maxGuard = limit * (queues.length + 4) + 64;

	while (out.length < limit && guard < maxGuard) {
		guard++;
		let progressed = false;
		for (const q of queues) {
			if (out.length >= limit) break;
			while (q.length > 0) {
				const next = q.shift();
				if (!next) break;
				const url = next.productUrl;
				if (alreadyTaken.has(url)) continue;
				out.push(next);
				alreadyTaken.add(url);
				progressed = true;
				break;
			}
		}
		if (!progressed) break;
	}

	return out;
}

/**
 * Udvalgte produkter til shop-sektioner: fastpin først (rækkefølge i PINNED_*), derefter spredning på feed.
 */
export function pickFeaturedShopProducts(
	allProducts: ShopProductJson[],
	shelf: 'airfryer' | 'accessory',
	limit: number,
): ShopProductJson[] {
	const pinOrder = shelf === 'airfryer' ? PINNED_AIRFRYER_IDS : PINNED_ACCESSORY_IDS;
	const matching = allProducts.filter((p) => classifyShopProduct(p) === shelf);
	const out: ShopProductJson[] = [];
	const seen = new Set<string>();

	for (const id of pinOrder) {
		if (out.length >= limit) break;
		const p = matching.find((x) => x.id === id);
		if (p && !seen.has(p.productUrl)) {
			out.push(p);
			seen.add(p.productUrl);
		}
	}

	const need = limit - out.length;
	if (need <= 0) return out;

	const rest = matching.filter((p) => !seen.has(p.productUrl));
	out.push(...pickRoundRobinAcrossSources(rest, need, seen));
	return out;
}
