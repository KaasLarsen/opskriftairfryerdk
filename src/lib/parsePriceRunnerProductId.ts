/**
 * Uddrager numerisk PriceRunner-produkt-id fra en officiel compare-URL.
 * Fx …/pl/81-3231353404/… eller …/pl/249-3207716893/… (kategoripræfiks varierer).
 */
export function parsePriceRunnerProductId(compareUrl: string): string | null {
	try {
		const u = new URL(compareUrl);
		if (!u.hostname.toLowerCase().endsWith('pricerunner.dk')) return null;
		const m = u.pathname.match(/\/pl\/\d+-(\d+)(?:\/|$)/i);
		return m ? m[1] : null;
	} catch {
		return null;
	}
}
