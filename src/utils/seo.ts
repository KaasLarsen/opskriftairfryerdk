export function isoDurationFromMinutes(minutes: number): string {
	const m = Math.max(1, Math.round(minutes));
	return `PT${m}M`;
}

export function toAbsoluteUrl(site: URL | string, pathOrUrl: string): string {
	if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
		return pathOrUrl;
	}
	const base = typeof site === 'string' ? site.replace(/\/$/, '') : site.origin;
	const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
	return `${base}${path}`;
}
