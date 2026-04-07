import type { ShopProductJson } from '../data/shop-curation';

/** Felter fra anmeldelse til stub-vare når feed-sync ikke indeholder productUrl (CI, udløbne feeds, klassificering). */
export type ReviewShopLike = {
	id: string;
	shopProductUrl: string;
	title: string;
	brandLabel?: string;
	feedProductId?: string;
};

/**
 * Minimal shop-profil så anmeldelsessider stadig kan bygges uden feed-match.
 * Pris og billede kommer da fra PriceRunner / anmeldelsens heroImage.
 */
export function shopProductFallbackFromReview(r: ReviewShopLike): ShopProductJson {
	return {
		id: (r.feedProductId ?? r.id).trim(),
		title: r.title.trim(),
		brand: (r.brandLabel ?? '').trim() || '—',
		category: 'Airfryer',
		price: null,
		listPrice: null,
		imageUrl: null,
		productUrl: r.shopProductUrl.trim(),
		sourceIndex: -1,
	};
}
