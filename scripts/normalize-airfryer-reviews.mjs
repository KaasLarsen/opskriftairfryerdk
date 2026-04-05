/**
 * Ensretter airfryer-anmeldelser: intro, faq, "Vores fokus", "Alternativer", updatedDate.
 * Kør: node scripts/normalize-airfryer-reviews.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.join(process.cwd(), 'src/content/airfryer-reviews');
const UPDATED = '2026-04-08';

function productNameFromTitle(title) {
	const head = title.split(':')[0].trim();
	let n = head.replace(/\s+anmeldelse\s*$/i, '').trim();
	n = n.replace(/\s+airfryer\s*$/i, '').trim();
	return n;
}

function yamlEscapeSingle(s) {
	return String(s).replace(/'/g, "''");
}

function extractTitle(fm) {
	const m = fm.match(/^title:\s*'([^']*)'/m);
	if (m) return m[1];
	const m2 = fm.match(/^title:\s*"([^"]*)"/m);
	if (m2) return m2[1];
	return '';
}

function upsertIntro(fm, introLine) {
	if (/\nintro:\s/m.test(fm)) {
		// Erstat ældre skabelon-intro (dobbelt “airfryer” / generisk form)
		if (/under luppen som praktisk airfryer/.test(fm)) {
			return fm.replace(/\nintro:\s*'(?:[^']|'')*'\r?\n/, `\n${introLine}`);
		}
		return fm;
	}
	return fm.replace(/(\ndescription:\s*.+\n)/, `$1${introLine}`);
}

function upsertFaq(fm, faqBlock) {
	if (/\nfaq:\s/m.test(fm)) return fm;
	return fm.replace(/^(verdict:\s*.+)$/m, `$1\n${faqBlock}`);
}

function upsertUpdatedDate(fm) {
	if (/\nupdatedDate:/.test(fm)) {
		return fm.replace(/\nupdatedDate:\s*[^\n]+/, `\nupdatedDate: ${UPDATED}`);
	}
	return fm.replace(/(\npubDate:\s*.+\n)/, `$1updatedDate: ${UPDATED}\n`);
}

function hasHeading(body, re) {
	return re.test(body);
}

function insertBeforeHeading(body, headingNeedle, insert) {
	const idx = body.indexOf(headingNeedle);
	if (idx === -1) return { body, ok: false };
	return { body: body.slice(0, idx) + insert + '\n\n' + body.slice(idx), ok: true };
}

function enhanceBrugSectionFixed(body) {
	const marker = '## Brug i praksis';
	const start = body.indexOf(marker);
	if (start === -1) return body;
	const after = start + marker.length;
	const nextHead = body.slice(after).search(/\n## /);
	if (nextHead === -1) return body;
	const section = body.slice(after, after + nextHead);
	if (section.trim().length >= 280) return body;
	const extra = `\n\nEt godt udgangspunkt er **ét lag**, **luft mellem stykkerne** og **vending** undervejs ved større stykker. Justér tid efter første gang — især ved frosne varer og tykt kød.\n`;
	return body.slice(0, after + nextHead) + extra + body.slice(after + nextHead);
}

const focusBlock = (name) =>
	`## Vores fokus i denne vurdering

Vi prioriterer **kapacitet**, **effekt** og **hverdagsnytte** for ${name}: hvordan varmluft og kurv typisk opfører sig i praksis, og hvor tydeligt du mærker begrænsninger ved meget fyldt kurv eller lavere effekt.`;

const altBlock = `## Alternativer

Er du i tvivl om størrelse, zoner eller budget, er [guiden om hvilken airfryer](/guides/hvilken-airfryer) et godt næste skridt. Se også [alle anmeldelser](/anmeldelser) og [shop med airfryere](/shop).`;

function patchBody(body, name) {
	let b = body;
	if (!hasHeading(b, /^## Vores fokus/m)) {
		const r = insertBeforeHeading(b, '## Brug i praksis', focusBlock(name));
		if (r.ok) b = r.body;
		else {
			const r2 = insertBeforeHeading(b, '## Pris, sammenligning og videre', `${focusBlock(name)}\n\n`);
			b = r2.ok ? r2.body : `${focusBlock(name)}\n\n${b}`;
		}
	}
	const hasAlt = /^## Alternativer/m.test(b);
	if (!hasAlt) {
		const r = insertBeforeHeading(b, '## Pris, sammenligning og videre', altBlock);
		b = r.ok ? r.body : `${b}\n\n${altBlock}\n`;
	}
	b = enhanceBrugSectionFixed(b);
	return b.trimEnd() + '\n';
}

function buildFaqBlock(productName) {
	const q3 = yamlEscapeSingle(
		`Passer ${productName} til min husholdning — eller skal jeg vælge større/dual zone?`,
	);
	return `faq:
  - question: 'Er denne anmeldelse købt eller bestemt af en producent?'
    answer: 'Nej. Teksten er skrevet af redaktionen ud fra en faglig vurdering af specifikationer, typisk brug og airfryer-praksis. Annonce- og partnerlinks ændrer ikke konklusionen; de hjælper med at finde aktuel pris og forhandlere.'
  - question: 'Hvor stammer prisen på siden fra?'
    answer: 'Den viste pris kommer fra vores produktfeed/partner og kan ændre sig. PriceRunner-widgetten viser prissammenligning fra flere butikker og er et separat samarbejde. Tjek altid den enkelte butik før køb.'
  - question: '${q3}'
    answer: 'Det afhænger af hvor mange I er, portionsstørrelser og om I ofte vil lave to ting med forskellig tid/temperatur (så giver dual zone mening). Læs fordele og ulemper ovenfor — især kapacitet. Ved tvivl: [hvilken airfryer-guiden](/guides/hvilken-airfryer) hjælper med at matche størrelse og budget.'`;
}

function main() {
	const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.md'));
	for (const file of files) {
		const fp = path.join(DIR, file);
		const raw = fs.readFileSync(fp, 'utf8');
		const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
		if (!m) {
			console.error('Ugyldig fil:', file);
			continue;
		}
		let fm = m[1];
		let body = m[2];

		const title = extractTitle(fm);
		const productName = productNameFromTitle(title) || file.replace(/\.md$/, '');

		const intro = `intro: '${yamlEscapeSingle(`Vi tager ${productName} under luppen som praktisk airfryer: hvem modellen typisk passer til, hvordan du får bedre luftcirkulation i kurven, og hvornår det giver mening at skrue op for kapacitet eller vælge dual zone.`)}'\n`;

		fm = upsertUpdatedDate(fm);
		fm = upsertIntro(fm, intro);
		fm = upsertFaq(fm, buildFaqBlock(productName) + '\n');

		body = patchBody(body, productName);

		const out = `---\n${fm}\n---\n${body}`;
		fs.writeFileSync(fp, out, 'utf8');
		console.log('OK', file);
	}
}

main();
