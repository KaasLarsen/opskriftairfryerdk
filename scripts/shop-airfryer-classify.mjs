/**
 * Klassifikation til shop: kun luftfriture + tilbehør dertil (filtrer alt andet fra).
 * Bruges ved build (sync) og spejles i src/data/shop-curation.ts + shop-siden script.
 */

/** @typedef {'airfryer' | 'accessory' | 'other'} ShopShelf */

/** Skal matche titel/kategori — luftfriture-kontekst eller kendte airfryer-linjer. */
const AIRFRYER_CONTEXT = new RegExp(
	[
		'air[- ]?fry(?:er)?',
		'\\bairfryers?\\b',
		'varmluft(?:sfriture|sovn|\\sfriture)',
		'\\bvarmluft\\b',
		'frituregryde',
		'fritös',
		'airovn',
		'airoven',
		'hot[- ]air',
		'dual[- ]?zone',
		'\\b(?:easy|xl|xxl)[- ]fry',
		'(?:crisp|crisper).{0,16}(?:fry|frit)',
		'fry.{0,12}(?:crisp|crisper)',
		'foodi',
		'\\bvortex\\b',
		'\\bcosori\\b',
		'actifry',
		'philips.{0,40}(?:air[- ]?fry|airfry|essential|hd9\\d)',
		'tefal.{0,35}(?:easy[- ]?fry|fry|actifry|ultimate)',
		'moulinex.{0,35}(?:easy|fry|uno)',
		'instant\\s+pot.{0,25}vortex',
		'ninja.{0,30}(?:air|foodi|fry|grill|speedi|dual|max|crisp)',
		'gourmia',
		'emerio.{0,20}(?:aaf|fry|air)',
		'russell\\s+hobbs.{0,30}(?:cyclofry|satisfry|air[- ]?fry)',
		'kenwood.{0,25}(?:hfp|air[- ]?fry)',
	].join('|'),
	'i',
);

/** Tilbehør kun hvis der allerede er airfryer-kontekst (undgå generiske kurve, forme osv.). */
const ACCESSORY_MARKER = new RegExp(
	[
		'\\btilbeh[oø]r\\b',
		'pergament',
		'bagepapir',
		'silikone',
		'silicone(?:\\s|$)',
		'\\bindsats\\b',
		'indsats',
		'dampindsats',
		'grillrist',
		'\\brist(?:e|er)?\\b',
		'(?:^|[^\\p{L}\\p{N}])kurv(?:[^\\p{L}\\p{N}]|$)',
		'kurv\\s+til',
		'\\bbasket\\b',
		'\\bliner\\b',
		'måtte',
		'matte',
		'non[- ]?stick',
		'parchment',
		'spyd',
		'dobbeltkurv',
		'multi[- ]kurv',
		'snackkurv',
		'divider',
		'separator',
		'reservedel',
		'papirkurve',
		'\\bforme\\s+til\\b',
		'oliesprayer',
		'til\\s+(?:din\\s+)?air[- ]?fry',
		'for\\s+air[- ]?fryer',
		'mods?tning',
		'trådkurv',
		'netkurv',
	].join('|'),
	'iu',
);

/**
 * Regex-baseret hylde (uden fastpinede id'er — de håndteres i shop-curation.ts).
 * @param {{ title?: string, category?: string }} p
 * @returns {ShopShelf}
 */
export function classifyShopProductBase(p) {
	const hay = _hay(p);
	if (!hay) return 'other';
	if (!AIRFRYER_CONTEXT.test(hay)) return 'other';
	if (ACCESSORY_MARKER.test(hay)) return 'accessory';
	return 'airfryer';
}

/**
 * @param {{ title?: string, category?: string, brand?: string }} p
 */
function _hay(p) {
	return `${p.title ?? ''} ${p.category ?? ''} ${p.brand ?? ''}`.trim();
}

/**
 * @param {{ title?: string, category?: string, brand?: string }} p
 */
export function isAirfryerShopRelevant(p) {
	return classifyShopProductBase(p) !== 'other';
}
