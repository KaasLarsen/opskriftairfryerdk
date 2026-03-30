export const SITE_NAME = 'Opskrift Airfryer';
export const SITE_TAGLINE = 'Nemme airfryer-opskrifter til hverdagen';
export const SITE_URL = 'https://opskriftairfryer.dk';
export const DEFAULT_DESCRIPTION =
	'Find nemme og hurtige airfryer-opskrifter til hverdagen – med tider, temperatur og trin du kan følge.';
export const ORGANIZATION_JSON = {
	'@type': 'Organization',
	'@id': `${SITE_URL}/#organization`,
	name: SITE_NAME,
	url: SITE_URL,
	logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.svg` },
	sameAs: [] as string[],
};
