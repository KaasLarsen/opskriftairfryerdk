/**
 * Klassifikation til shop: kun luftfriture + tilbehør dertil (filtrer alt andet fra).
 * Bruges ved build (sync) og spejles i shop-siden script.
 */

/** @typedef {'airfryer' | 'accessory' | 'other'} ShopShelf */

/** Luftfriture / kendte produktlinjer — ikke ren "varmluft" eller fedtfriture. */
const AIRFRYER_CONTEXT = new RegExp(
	[
		'air[- ]?fry(?:er)?',
		'\\bairfryers?\\b',
		'varmluftsfriture',
		'varmluft\\s+friture',
		'varmluftsovn',
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

const AIR_SIGNAL = new RegExp(
	[
		'\\bair[- ]?fry(?:er)?s?\\b',
		'\\bairfry',
		'\\bvarmluft',
		'hot[- ]air',
		'\\bairovn\\b',
		'\\bfoodi\\b',
		'\\bvortex\\b',
		'dual[- ]?zone',
	].join('|'),
	'i',
);

/** Fedtfriture, ovn/komfur uden airfry, klassisk frituregryde uden luftsignal. */
function excludeFromAirfryerShop(hay) {
	if (/\b(fedtfriture|oliefriture)\b/i.test(hay)) return true;
	if (/\bdeep[- ]fat\b/i.test(hay)) return true;
	if (
		/\b(?:(?:mini|mini[- ])?frituregryde|friture gryde|fritös|friteuse)\b/i.test(hay) &&
		!AIR_SIGNAL.test(hay)
	) {
		return true;
	}
	if (
		/\b(bageovn|stegeovn|induktionsovn|indbygningsovn|pyrolyse|komfur|induktionskomfur)\b/i.test(
			hay,
		) &&
		!AIR_SIGNAL.test(hay)
	) {
		return true;
	}
	if (/\bvarmluftsovn\b/i.test(hay) && !AIR_SIGNAL.test(hay)) return true;
	if (/\bel[- ]?ovn\b/i.test(hay) && !AIR_SIGNAL.test(hay)) return true;
	return false;
}

/** Tydeligt hovedapparat — da ikke under "kun tilbehør" pga. ord som "kurv" i titel. */
const MAIN_UNIT = new RegExp(
	[
		'\\bair[- ]?fry(?:er)?s?\\b',
		'\\bvarmluftsfriture\\b',
		'hot[- ]air',
		'\\bairovn\\b',
		'foodi',
		'vortex',
		'philips.{0,40}(?:air[- ]?fry|airfry|hd9\\d)',
		'ninja.{0,30}(?:air|foodi|dual|max|crisp|grill)',
		'tefal.{0,35}(?:easy|actifry)',
		'\\bcosori\\b',
		'instant.{0,20}vortex',
		'actifry',
		'\\b(?:easy|xl|xxl)[- ]fry',
	].join('|'),
	'i',
);

function strongAccessoryIntent(hay) {
	return /\b(pergament|bagepapir|parchment|reservedel|erstatning|erstatnings|replacement|tilbehørspakke|kurv\s+til|rist\s+til|indsats\s+til|original\s*(?:kurv|del))\b/i.test(
		hay,
	);
}

function tilbehorMedDel(hay) {
	return (
		/\btilbeh[oø]r\b/i.test(hay) &&
		/(kurv|indsats|pergament|bagepapir|rist|liner|basket|dobbeltkurv|snackkurv|grillrist|måtte|spyd|papir)/i.test(
			hay,
		)
	);
}

/** Tilbehør: undgå "matte" (mat sort), brede "rist"-matches m.m. */
const ACCESSORY_MARKER = new RegExp(
	[
		'\\btilbeh[oø]r\\b',
		'pergament',
		'bagepapir',
		'silikone',
		'silicone(?:\\s|$)',
		'\\bindsats\\b',
		'dampindsats',
		'grillrist',
		'\\bkurvrist\\b',
		'(?:^|[^\\p{L}\\p{N}])kurv(?:[^\\p{L}\\p{N}]|$)',
		'kurv\\s+til',
		'\\bbasket\\b',
		'\\bliner\\b',
		'\\bmåtte\\b',
		'silikone[- ]?måtte',
		'bage[- ]?måtte',
		'non[- ]?stick(?:\\s+(?:mat|måtte))?',
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
 * @param {{ title?: string, category?: string, brand?: string }} p
 * @returns {ShopShelf}
 */
export function classifyShopProductBase(p) {
	const hay = _hay(p);
	if (!hay) return 'other';
	if (!AIRFRYER_CONTEXT.test(hay)) return 'other';
	if (excludeFromAirfryerShop(hay)) return 'other';

	if (tilbehorMedDel(hay)) return 'accessory';
	if (MAIN_UNIT.test(hay) && !strongAccessoryIntent(hay)) return 'airfryer';
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
