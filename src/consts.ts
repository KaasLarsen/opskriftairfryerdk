export const SITE_NAME = 'Opskrift Airfryer';
export const SITE_TAGLINE = 'Nemme airfryer-opskrifter til hverdagen';
export const SITE_URL = 'https://www.opskrift-airfryer.dk';
/** Offentlig kontaktmail (fx /kontakt). */
export const SITE_EMAIL = 'info@opskrift-airfryer.dk';

/**
 * PriceRunner publisher / AdRunner partner-id til produkt-widgets på anmeldelser.
 * Må ikke ændres uden aftale med PriceRunner – alle widget-script-URL'er skal bruge denne værdi.
 */
export const PRICE_RUNNER_PARTNER_ID = 'adrunner_dk_opskrift-airfryer';
export const DEFAULT_DESCRIPTION =
	'Find nemme og hurtige airfryer-opskrifter til hverdagen – med tider, temperatur og trin du kan følge.';

/** Bruges i opskrift-hero `<img>` og i OG/schema — hold synligt billede og meta konsistent. */
export const RECIPE_OG_IMAGE_WIDTH = 1200;
export const RECIPE_OG_IMAGE_HEIGHT = 900;

/**
 * Offentlige profil-URL'er til Schema.org `sameAs` (Facebook, Instagram, YouTube, …).
 * Tom som standard — tilføj fulde https-URL'er når I har profiler.
 */
export const ORGANIZATION_SAME_AS: string[] = [];

export const ORGANIZATION_JSON = {
	'@type': 'Organization',
	'@id': `${SITE_URL}/#organization`,
	name: SITE_NAME,
	url: SITE_URL,
	logo: {
		'@type': 'ImageObject',
		url: `${SITE_URL}/favicon.svg`,
	},
	sameAs: ORGANIZATION_SAME_AS,
};

/** Vises på produktanmeldelser — gennemsigtighed for læser og søgemaskiner. */
export const REVIEW_METHODOLOGY_TITLE = 'Sådan skriver vi anmeldelser';

export const REVIEW_METHODOLOGY_PARAGRAPHS: string[] = [
	'Anmeldelserne er skrevet af redaktionen som vejledende vurderinger: typisk ud fra specifikationer, kendte egenskaber ved mærket, og praktisk erfaring med airfryere i køkkenet (varmluft, kurve, rengøring og hverdagsbrug). Vi tester ikke altid hver eneste model fysisk i ugevis — men vi er konkrete om, hvad der taler for og imod modellen i typisk brug.',
	'Priser og varelink kan være reklamelinks (partner). De kan ændre sig og kan afvige fra priser hos andre forhandlere. Vores tekst er uafhængig i den forstand, at ingen producent kan “købe” en bedre skrevet vurdering; annoncering påvirker ikke selve anmeldelsens konklusion.',
];
