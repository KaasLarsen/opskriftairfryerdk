import fs from 'node:fs';
import path from 'node:path';
import type { ShopProductJson } from '../data/shop-curation';

const DEFAULT_JSON = path.join(process.cwd(), 'public/data/shop-products.json');

function readShopProductsFile(filePath: string = DEFAULT_JSON): ShopProductJson[] {
	if (!fs.existsSync(filePath)) return [];
	try {
		const raw = fs.readFileSync(filePath, 'utf8');
		const data = JSON.parse(raw) as { products?: ShopProductJson[] };
		return Array.isArray(data.products) ? data.products : [];
	} catch {
		return [];
	}
}

/** Alle produkter fra seneste shop-sync (tom liste hvis fil mangler). */
export function getShopProducts(): ShopProductJson[] {
	return readShopProductsFile();
}

/**
 * Find vare ud fra PartnerAds/shop `productUrl` (eksakt match).
 * Kræver at anmeldelsens frontmatter bruger samme URL-streng som i feedet.
 */
export function findShopProductByProductUrl(
	productUrl: string,
	products?: ShopProductJson[],
): ShopProductJson | undefined {
	const list = products ?? getShopProducts();
	const needle = productUrl.trim();
	return list.find((p) => p.productUrl === needle);
}
