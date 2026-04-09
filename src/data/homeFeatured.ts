/**
 * Kurateret indhold på forsiden (guides og anmeldelser).
 * Rækkefølge i arrays = visningsrækkefølge.
 */

export type HomeFeaturedGuide = {
	href: string;
	kicker: string;
	title: string;
	description: string;
	image: string;
	imageAlt: string;
};

export const HOME_FEATURED_GUIDES: HomeFeaturedGuide[] = [
	{
		href: '/guides/airfryer-for-begyndere',
		kicker: 'Kom godt i gang',
		title: 'Airfryer for begyndere',
		description:
			'Temperatur, tid, forvarmning, ét lag i kurven og typiske fejl – så du rammer godt resultat fra start.',
		image: '/images/guides/airfryer-for-begyndere.png',
		imageAlt:
			'Sort airfryer med kartoffelbåde i skuffen og friske råvarer på bordet – begynderguide',
	},
	{
		href: '/guides/hvilken-airfryer',
		kicker: 'Køb og valg',
		title: 'Hvilken airfryer skal du vælge?',
		description:
			'Kurvstørrelse, familie, én kurv vs. dobbelt zone og plads på bordet – plus shop-filtre.',
		image: '/images/guides/hvilken-airfryer.png',
		imageAlt: 'Flere airfryere og tallerkener med mad – valg af airfryer',
	},
	{
		href: '/guides/hvad-kan-man-lave-i-en-airfryer',
		kicker: 'Inspiration',
		title: 'Hvad kan man lave i en airfryer?',
		description:
			'Kategorier fra kød og fisk til grønt, vegetar, snacks og bagning – med links til opskrifter.',
		image: '/images/guides/hvad-kan-man-lave-i-en-airfryer.png',
		imageAlt: 'Illustration af madkategorier der egner sig til airfryer',
	},
	{
		href: '/guides/frossen-mad-airfryer',
		kicker: 'Hverdag',
		title: 'Frossen mad i airfryer',
		description:
			'Undgå damp og bløde pommes: ét lag, ryst og tider der matcher frost – med opskriftslinks.',
		image: '/images/guides/frossen-mad-airfryer.png',
		imageAlt: 'Frosne pommes og grøntsager ved airfryer – guide',
	},
];

/** Anmeldelses-id’er (slug) — blandet mærker og typer */
export const HOME_FEATURED_REVIEW_IDS: string[] = [
	'philips-na342-3000-series-airfryer-anmeldelse',
	'ninja-af300eu-dual-zone-anmeldelse',
	'cosori-caf-tf101s-airfryer-anmeldelse',
	'obh-nordica-easy-fry-mega-ag8558-airfryer-anmeldelse',
];
