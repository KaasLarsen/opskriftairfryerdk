/**
 * Google Recipe rich results: `nutrition.calories` skal være et forståeligt energimål
 * (typisk "240 calories"), ikke fri dansk tekst som "Ca. 520 kcal pr. portion …".
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data/recipe
 */
export function recipeCaloriesForSchema(caloriesLabel: string): string | null {
	const s = caloriesLabel.trim();
	if (!s) return null;

	// Intervaller før "kcal": "Ca. 120–160 kcal …"
	const rangeMatch = s.match(/(\d+)\s*[–-]\s*(\d+)\s*kcal/i);
	if (rangeMatch) {
		const a = Number.parseInt(rangeMatch[1], 10);
		const b = Number.parseInt(rangeMatch[2], 10);
		if (Number.isFinite(a) && Number.isFinite(b) && a > 0 && b > 0) {
			const n = Math.round((a + b) / 2);
			if (n >= 1 && n <= 9999) return `${n} calories`;
		}
	}

	// Enkelt tal før "kcal": "Ca. 280 kcal pr. portion"
	const kcalMatch = s.match(/(\d+)\s*kcal/i);
	if (kcalMatch) {
		const n = Number.parseInt(kcalMatch[1], 10);
		if (Number.isFinite(n) && n >= 1 && n <= 9999) return `${n} calories`;
	}

	return null;
}
