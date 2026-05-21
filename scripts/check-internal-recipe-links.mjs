/**
 * Verificer at markdown-links til /opskrifter/<slug> matcher en eksisterende opskriftsfil.
 * Kør: node scripts/check-internal-recipe-links.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const recipeDir = path.join(root, 'src/content/recipes');

const ids = new Set(
	fs.readdirSync(recipeDir).map((f) => {
		if (!f.endsWith('.md')) return null;
		return path.basename(f, '.md');
	}).filter(Boolean),
);

function walkMarkdown(dir, acc = []) {
	for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
		const p = path.join(dir, e.name);
		if (e.isDirectory()) walkMarkdown(p, acc);
		else if (e.name.endsWith('.md')) acc.push(p);
	}
	return acc;
}

const mdFiles = walkMarkdown(path.join(root, 'src/content'));
const linkRe = /\]\(\/opskrifter\/([^)#/]+)\)/g;
const bad = [];

for (const file of mdFiles) {
	const t = fs.readFileSync(file, 'utf8');
	let m;
	while ((m = linkRe.exec(t))) {
		let slug;
		try {
			slug = decodeURIComponent(m[1]);
		} catch {
			slug = m[1];
		}
		if (!ids.has(slug)) {
			bad.push({ file: path.relative(root, file), slug });
		}
	}
}

if (bad.length) {
	console.error('Manglende opskrifts-slug (i forhold til src/content/recipes/*.md):');
	for (const b of bad) console.error(`  ${b.slug}  ←  ${b.file}`);
	process.exit(1);
}
console.log(`OK: alle ${ids.size} opskrifter — interne /opskrifter/-links i markdown matcher.`);
