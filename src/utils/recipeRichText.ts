function escapeHtml(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/** Tillad kun relative interne opskrifts-URL'er (ingen javascript:, ingen eksterne links). */
function safeInternalHref(href: string): string | null {
	const t = href.trim();
	if (!t.startsWith('/opskrifter/')) return null;
	if (t.includes('://') || t.includes('//') || /[\s<>"']/.test(t)) return null;
	return t;
}

function parseInlineNoLinks(raw: string): string {
	return raw.split(/(\*\*[^*]+\*\*)/g).map((segment) => {
		const bold = segment.match(/^\*\*([^*]+)\*\*$/);
		if (bold) return `<strong>${escapeHtml(bold[1])}</strong>`;
		return escapeHtml(segment);
	}).join('');
}

/**
 * Gør **fed** og [tekst](/opskrifter/...) om til HTML i korte tekstfelter (intro, tips osv.).
 * Usikre links vises escaped som almindelig tekst.
 */
export function renderRecipeRichText(raw: string): string {
	const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
	let result = '';
	let lastIndex = 0;
	let m: RegExpExecArray | null;
	while ((m = linkRe.exec(raw)) !== null) {
		result += parseInlineNoLinks(raw.slice(lastIndex, m.index));
		const href = safeInternalHref(m[2]);
		if (href) {
			result += `<a href="${escapeHtml(href)}">${parseInlineNoLinks(m[1])}</a>`;
		} else {
			result += escapeHtml(m[0]);
		}
		lastIndex = m.index + m[0].length;
	}
	result += parseInlineNoLinks(raw.slice(lastIndex));
	return result;
}

/** Til JSON-LD / plain snippets: fjern markdown-lignende markup. */
export function recipeSourceToPlainText(raw: string): string {
	return raw
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/\*\*([^*]+)\*\*/g, '$1')
		.replace(/\s+/g, ' ')
		.trim();
}
