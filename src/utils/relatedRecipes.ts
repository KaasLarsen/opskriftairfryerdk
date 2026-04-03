import type { CollectionEntry } from 'astro:content';

function normKeyword(k: string): string {
	return k.trim().toLowerCase();
}

/**
 * Vælg relaterede opskrifter til intern linking: samme kategori og delte keywords
 * vægtes højst; derefter cuisine, featured og til sidst nyeste opdatering.
 */
export function pickRelatedRecipes(
	current: CollectionEntry<'recipes'>,
	all: CollectionEntry<'recipes'>[],
	limit = 3,
): CollectionEntry<'recipes'>[] {
	const cur = current.data;
	const curKeywords = new Set(
		cur.keywords.map(normKeyword).filter(Boolean),
	);

	const scored = all
		.filter((r) => r.id !== current.id)
		.map((r) => {
			const d = r.data;
			let score = 0;

			if (d.category === cur.category) score += 100;

			if (d.cuisine === cur.cuisine) score += 28;

			let keywordHits = 0;
			for (const kw of d.keywords) {
				const n = normKeyword(kw);
				if (n && curKeywords.has(n)) keywordHits++;
			}
			score += Math.min(keywordHits, 10) * 15;

			if (d.featured === true) score += 6;

			const freshness = (d.updatedDate ?? d.pubDate).valueOf();
			return { entry: r, score, freshness };
		});

	scored.sort((a, b) => {
		if (b.score !== a.score) return b.score - a.score;
		return b.freshness - a.freshness;
	});

	return scored.slice(0, limit).map((s) => s.entry);
}
