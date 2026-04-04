/** Udtræk effekt i watt fra danske partner-titler (fx «2.000 W» eller «2000 W»). */
export function parseWattsFromTitle(title: string): number | null {
	const m = title.match(/(\d{1,3}(?:\.\d{3})+|\d{2,5})\s*W\b/i);
	if (!m) return null;
	const n = Number.parseInt(m[1].replace(/\./g, ''), 10);
	return Number.isFinite(n) && n > 0 ? n : null;
}
