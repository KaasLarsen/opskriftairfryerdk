import type { CollectionEntry } from 'astro:content';
import { AIRFRYER_REVIEW_PRICE_RUNNER_COMPARE_URLS } from '../data/airfryerReviewPriceRunnerCompareUrls';

/** Sammenfald frontmatter med standard-URL fra `airfryerReviewPriceRunnerCompareUrls`. */
export function resolvePriceRunnerCompareUrl(
	review: CollectionEntry<'airfryerReviews'>,
): string {
	const fromFm = review.data.priceRunnerCompareUrl?.trim();
	if (fromFm) return fromFm;
	const fallback = AIRFRYER_REVIEW_PRICE_RUNNER_COMPARE_URLS[review.id]?.trim();
	if (fallback) return fallback;
	throw new Error(
		`Anmeldelse «${review.id}»: mangler PriceRunner-URL. Tilføj priceRunnerCompareUrl i frontmatter eller i airfryerReviewPriceRunnerCompareUrls.`,
	);
}
