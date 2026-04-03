/**
 * PartnerAds / shop: hent XML-feeds og normalisér til ét fælles JSON-format.
 *
 * Normaliseret produkt:
 * - id: partner-id / ean / hash af productUrl
 * - title, brand, category (strings)
 * - price, listPrice: number | null
 * - imageUrl: string | null
 * - productUrl: string (påkrævet)
 * - sourceIndex: hvilket feed i listen (0-baseret)
 *
 * XML strukturer varierer; vi prøver kendte mønstre først, derefter bred scanning.
 */

import { XMLParser } from 'fast-xml-parser';

const xmlParserOptions = {
	ignoreAttributes: false,
	attributeNamePrefix: '@_',
	textNodeName: '#text',
	trimValues: true,
	parseTagValue: true,
	// Store feeds har tusindvis af &amp; / &gt; — standard maxTotalExpansions (1000) fejler.
	processEntities: {
		maxTotalExpansions: 10_000_000,
		maxEntityCount: 500_000,
		maxExpandedLength: 50_000_000,
	},
};

/** Fuld dokument-parse (små/mellemstore feeds). */
const parser = new XMLParser(xmlParserOptions);
/** Én <produkt>-blok ad gangen (PartnerAds produkter-layout — undgår OOM). */
const chunkParser = new XMLParser(xmlParserOptions);

/**
 * @param {string} xmlText
 */
function isProdukterFeed(xmlText) {
	return /<produkter\b/i.test(xmlText.slice(0, 8000));
}

/**
 * @param {string} xmlText
 * @returns {Generator<string>}
 */
function* eachProduktElement(xmlText) {
	const openRe = /<produkt\b[^>]*>/gi;
	let m;
	while ((m = openRe.exec(xmlText)) !== null) {
		const innerStart = m.index + m[0].length;
		const tail = xmlText.slice(innerStart);
		const closeMatch = tail.match(/<\/produkt\s*>/i);
		if (!closeMatch || closeMatch.index == null) break;
		const elEnd = innerStart + closeMatch.index + closeMatch[0].length;
		yield xmlText.slice(m.index, elEnd);
		openRe.lastIndex = elEnd;
	}
}

/**
 * @param {string} xmlText
 * @param {number} sourceIndex
 */
function parseProdukterChunked(xmlText, sourceIndex) {
	/** @type {ReturnType<typeof normalizeOneProduct>[]} */
	const normalized = [];
	const seen = new Set();

	for (const block of eachProduktElement(xmlText)) {
		try {
			const parsed = chunkParser.parse(block);
			const root = /** @type {Record<string, unknown>} */ (parsed);
			const o = root.produkt ?? root.Produkt;
			if (!o || typeof o !== 'object') continue;
			const n = normalizeOneProduct(/** @type {Record<string, unknown>} */ (o), sourceIndex);
			if (!n) continue;
			const u = n.productUrl;
			if (seen.has(u)) continue;
			seen.add(u);
			normalized.push(n);
		} catch {
			// ignorer enkelt defekt blok
		}
	}

	return normalized;
}

/** @param {unknown} v */
function str(v) {
	if (v == null) return '';
	if (typeof v === 'string') return v.trim();
	if (typeof v === 'number' && Number.isFinite(v)) return String(v);
	if (typeof v === 'object' && v !== null && '#text' in v) {
		const t = /** @type {{ '#text'?: string }} */ (v)['#text'];
		return typeof t === 'string' ? t.trim() : '';
	}
	return String(v).trim();
}

/** @param {unknown} v */
function num(v) {
	const s = str(v).replace(/\s/g, '').replace(',', '.');
	if (!s) return null;
	const n = Number.parseFloat(s);
	return Number.isFinite(n) ? n : null;
}

/**
 * @param {string} u
 */
function hashId(u) {
	let h = 0;
	for (let i = 0; i < u.length; i++) {
		h = (Math.imul(31, h) + u.charCodeAt(i)) | 0;
	}
	return `url_${Math.abs(h).toString(36)}`;
}

/**
 * @param {Record<string, unknown>} obj
 * @param {string[]} keys
 */
function firstStr(obj, keys) {
	for (const k of keys) {
		if (Object.prototype.hasOwnProperty.call(obj, k)) {
			const s = str(obj[k]);
			if (s) return s;
		}
	}
	return '';
}

/**
 * @param {Record<string, unknown>} obj
 * @param {string[]} keys
 */
function firstNum(obj, keys) {
	for (const k of keys) {
		if (Object.prototype.hasOwnProperty.call(obj, k)) {
			const n = num(obj[k]);
			if (n != null) return n;
		}
	}
	return null;
}

/**
 * @param {unknown} raw
 * @returns {Record<string, unknown>[]}
 */
function asObjectArray(raw) {
	if (raw == null) return [];
	if (Array.isArray(raw)) {
		return /** @type {Record<string, unknown>[]} */ (
			raw.filter((x) => x != null && typeof x === 'object')
		);
	}
	if (typeof raw === 'object') return [/** @type {Record<string, unknown>} */ (raw)];
	return [];
}

/**
 * @param {Record<string, unknown>} o
 * @param {number} sourceIndex
 */
function normalizeOneProduct(o, sourceIndex) {
	const title = firstStr(o, [
		'produktnavn',
		'Produktnavn',
		'title',
		'Title',
		'name',
		'Name',
		'productname',
		'ProductName',
		'navn',
	]);
	const productUrl = firstStr(o, [
		'VareURL',
		'vareurl',
		'url',
		'URL',
		'link',
		'Link',
		'producturl',
		'ProductUrl',
		'permalink',
	]);
	if (!title || !productUrl) return null;

	const brand = firstStr(o, ['brand', 'Brand', 'mærke', 'Brandname', 'brand_name']);
	const category = firstStr(o, [
		'kategorinavn',
		'Kategorinavn',
		'category',
		'Category',
		'kategori',
		'Kategori',
		'categoryname',
		'CategoryName',
		'breadcrumb',
	]);
	const imageUrl = firstStr(o, [
		'BilledURL',
		'billedurl',
		'imageurl',
		'ImageUrl',
		'image',
		'Image',
		'image_url',
		'picture',
		'imgurl',
	]);
	const price =
		firstNum(o, ['Nypris', 'nypris', 'price', 'Price', 'currentprice', 'saleprice']) ??
		firstNum(o, ['pris', 'Pris']);
	const listPrice = firstNum(o, [
		'glpris',
		'Glpris',
		'oldprice',
		'ListPrice',
		'listprice',
		'originalprice',
		'beforediscount',
	]);
	const id =
		firstStr(o, [
			'produktid',
			'Produktid',
			'id',
			'ID',
			'productid',
			'ProductID',
			'sku',
			'SKU',
			'ean',
			'EAN',
			'gtin',
		]) || hashId(productUrl);

	return {
		id,
		title,
		brand,
		category,
		price,
		listPrice,
		imageUrl: imageUrl || null,
		productUrl,
		sourceIndex,
	};
}

/**
 * @param {Record<string, unknown>[]} rows
 */
function dedupeByUrl(rows) {
	const seen = new Set();
	return rows.filter((r) => {
		const u = str(r.productUrl);
		if (!u || seen.has(u)) return false;
		seen.add(u);
		return true;
	});
}

/**
 * @param {unknown} parsed
 * @param {number} sourceIndex
 */
function extractProducts(parsed, sourceIndex) {
	/** @type {Record<string, unknown>[]} */
	let rawItems = [];

	if (parsed && typeof parsed === 'object') {
		const p = /** @type {Record<string, unknown>} */ (parsed);

		const rss = p.rss ?? p.RSS ?? p.Rss;
		if (rss && typeof rss === 'object') {
			const ch = /** @type {Record<string, unknown>} */ (rss).channel;
			if (ch && typeof ch === 'object' && 'item' in ch) {
				rawItems = asObjectArray(/** @type {Record<string, unknown>} */ (ch).item);
			}
		}

		if (rawItems.length === 0 && 'channel' in p && p.channel && typeof p.channel === 'object') {
			const ch = /** @type {Record<string, unknown>} */ (p.channel);
			if ('item' in ch) rawItems = asObjectArray(ch.item);
		}

		if (rawItems.length === 0) {
			const productsNode =
				p.products ??
				p.Products ??
				p.catalog ??
				p.Catalog ??
				p.store ??
				p.feed;
			if (productsNode && typeof productsNode === 'object') {
				const pn = /** @type {Record<string, unknown>} */ (productsNode);
				const prod = pn.product ?? pn.Product ?? pn.item ?? pn.Item;
				rawItems = asObjectArray(prod);
			}
		}

		if (rawItems.length === 0 && 'product' in p) {
			rawItems = asObjectArray(p.product);
		}

		if (rawItems.length === 0) {
			const produkterNode = p.produkter ?? p.Produkter;
			if (produkterNode && typeof produkterNode === 'object') {
				const pn = /** @type {Record<string, unknown>} */ (produkterNode);
				const prod = pn.produkt ?? pn.Produkt;
				rawItems = asObjectArray(prod);
			}
		}

		if (rawItems.length === 0 && 'produkt' in p) {
			rawItems = asObjectArray(p.produkt);
		}

		if (rawItems.length === 0 && 'item' in p) {
			rawItems = asObjectArray(p.item);
		}

		if (rawItems.length === 0) {
			for (const k of Object.keys(p)) {
				if (k.startsWith('@_')) continue;
				const val = p[k];
				const arr = asObjectArray(val);
				if (
					arr.length >= 2 &&
					arr.some((row) => firstStr(row, ['VareURL', 'vareurl', 'url', 'link']))
				) {
					rawItems = arr;
					break;
				}
			}
		}
	}

	const normalized = rawItems
		.map((row) => normalizeOneProduct(row, sourceIndex))
		.filter((x) => x != null);
	return dedupeByUrl(normalized);
}

/**
 * @param {string} xmlText
 * @param {number} sourceIndex
 */
export function parsePartnerAdsXml(xmlText, sourceIndex) {
	if (isProdukterFeed(xmlText)) {
		return parseProdukterChunked(xmlText, sourceIndex);
	}
	const parsed = parser.parse(xmlText);
	return extractProducts(parsed, sourceIndex);
}

/**
 * @param {string} url
 * @param {number} sourceIndex
 */
export async function fetchPartnerAdsFeed(url, sourceIndex) {
	const res = await fetch(url, {
		headers: {
			'User-Agent': 'OpskriftAirfryerShopBot/1.0 (feed sync)',
			Accept: 'application/xml, text/xml, */*',
		},
	});
	if (!res.ok) {
		throw new Error(`Feed HTTP ${res.status} for index ${sourceIndex}: ${url.slice(0, 96)}`);
	}
	const text = await res.text();
	return parsePartnerAdsXml(text, sourceIndex);
}
