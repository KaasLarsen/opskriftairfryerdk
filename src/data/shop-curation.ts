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
