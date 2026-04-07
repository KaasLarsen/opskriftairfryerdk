/**
 * Fire udvalgte PriceRunner compare-URL'er til roterende produkt-widget på opskrifter og guides.
 * Guides bruger `pickRecipeAirfryerSpotlight(\`guide:${slug}\`)` for stabil rotation pr. side.
 * Opdatér her ved udgåede varer — valideres ved import (build).
 */
import { parsePriceRunnerProductId } from '../lib/parsePriceRunnerProductId';

export const RECIPE_AIRFRYER_SPOTLIGHT: readonly { label: string; compareUrl: string }[] = [
	{
		label: 'Philips NA120 (kompakt)',
		compareUrl:
			'https://www.pricerunner.dk/pl/81-3314420067/Frituregryder/Philips-NA120-00-Sammenlign-Priser',
	},
	{
		label: 'Ninja Foodi AF300 Dual Zone',
		compareUrl:
			'https://www.pricerunner.dk/pl/81-3434622775/Frituregryder/Ninja-Foodi-AF300-Sammenlign-Priser',
	},
	{
		label: 'Philips 3000 Series NA352 (dobbeltkurv)',
		compareUrl:
			'https://www.pricerunner.dk/pl/81-3231353404/Frituregryder/Philips-3000-Series-NA352-00-Sammenlign-Priser',
	},
	{
		label: 'Severin FR 2445 (5 L)',
		compareUrl:
			'https://www.pricerunner.dk/pl/81-4749482/Frituregryder/Severin-FR-2445-Sammenlign-Priser',
	},
] as const;

function hashRecipeId(id: string): number {
	let h = 0;
	for (let i = 0; i < id.length; i++) {
		h = Math.imul(31, h) + id.charCodeAt(i);
		h |= 0;
	}
	return Math.abs(h);
}

/** Stabilt udvalg pr. opskrift-slug (samme slug ⇒ samme model efter deploy). */
export function pickRecipeAirfryerSpotlight(recipeId: string): { label: string; compareUrl: string } {
	const idx = hashRecipeId(recipeId) % RECIPE_AIRFRYER_SPOTLIGHT.length;
	return RECIPE_AIRFRYER_SPOTLIGHT[idx];
}

for (const row of RECIPE_AIRFRYER_SPOTLIGHT) {
	const id = parsePriceRunnerProductId(row.compareUrl);
	if (!id) {
		throw new Error(
			`recipeAirfryerSpotlight: mangler produkt-id for «${row.label}»: ${row.compareUrl}`,
		);
	}
}
