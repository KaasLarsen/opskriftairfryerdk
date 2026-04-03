/**
 * Standard PartnerAds product-feeds når PARTNERADS_FEED_URLS ikke er sat.
 * Bruges kun på Vercel/CI (se sync-shop-products.mjs) — ikke hemmelige token-URL'er.
 * Juster listen her eller sæt PARTNERADS_FEED_URLS på host for at overstyre.
 */
export const DEFAULT_SHOP_FEED_URLS = [
	'https://www.partner-ads.com/dk/feed_udlaes.php?partnerid=52794&bannerid=106581&feedid=3324',
	'https://www.partner-ads.com/dk/feed_udlaes.php?partnerid=52794&bannerid=112106&feedid=3794',
	'https://www.partner-ads.com/dk/feed_udlaes.php?partnerid=52794&bannerid=104140&feedid=3157',
	'https://www.partner-ads.com/dk/feed_udlaes.php?partnerid=52794&bannerid=94931&feedid=2573',
	'https://www.partner-ads.com/dk/feed_udlaes.php?partnerid=52794&bannerid=67428&feedid=1383',
	'https://www.partner-ads.com/dk/feed_udlaes.php?partnerid=52794&bannerid=66637&feedid=1348',
	'https://www.partner-ads.com/dk/feed_udlaes.php?partnerid=52794&bannerid=79283&feedid=1862',
	'https://www.partner-ads.com/dk/feed_udlaes.php?partnerid=52794&bannerid=56457&feedid=1000',
];
