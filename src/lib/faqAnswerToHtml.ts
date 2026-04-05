/** Konverterer kun `[tekst](/sti)` til interne links; resten escapes for tryg `set:html`. */
export function faqAnswerToHtml(text: string): string {
	const esc = text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
	return esc.replace(/\[([^\]]+)\]\((\/[^)\s]+)\)/g, '<a href="$2">$1</a>');
}
