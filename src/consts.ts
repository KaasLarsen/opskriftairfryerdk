export const SITE_NAME = 'Opskrift Airfryer';
export const SITE_TAGLINE = 'Nemme airfryer-opskrifter til hverdagen';
export const SITE_URL = 'https://www.opskrift-airfryer.dk';
/** Offentlig kontaktmail (fx /kontakt). */
export const SITE_EMAIL = 'info@opskrift-airfryer.dk';
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
