/**
 * Kuratering af shop: fastpinede id'er (når I kender dem fra feed) + søgeord som fallback,
 * fordi PartnerAds-felter varierer mellem annoncører.
 */

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

const AIRFRYER_HINT =
	/airfryer|varmluft|varmlufts|friture|fritös|frituregryde|air fryer|airoven|airovn|dual.?zone|hot air|varmluftsovn/i;

const ACCESSORY_HINT =
	/tilbehør|tilbehor|basket|kurv|form|papir|indsats|rist|riste|bakke|silicone|silikone|måtte|matte|lining|pergament|spyd/i;

export type ShopShelf = 'airfryer' | 'accessory' | 'other';

export function classifyShopProduct(p: Pick<ShopProductJson, 'id' | 'title' | 'category'>): ShopShelf {
	if (PINNED_AIRFRYER_IDS.includes(p.id)) return 'airfryer';
	if (PINNED_ACCESSORY_IDS.includes(p.id)) return 'accessory';

	const hay = `${p.title} ${p.category}`.trim();
	if (!hay) return 'other';
	if (AIRFRYER_HINT.test(hay)) return 'airfryer';
	if (ACCESSORY_HINT.test(hay)) return 'accessory';
	return 'other';
}
