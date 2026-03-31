import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = join(process.cwd(), 'dist');
const locRe = /<loc>\s*([^<]+?)\s*<\/loc>/g;

function escapeXml(s) {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

const chunkFiles = readdirSync(dist).filter((name) => /^sitemap-\d+\.xml$/.test(name));

if (chunkFiles.length === 0) {
	console.error('flatten-sitemap: ingen sitemap-*.xml i dist/ – kør astro build først');
	process.exit(1);
}

const urls = new Set();
for (const name of chunkFiles.sort()) {
	const xml = readFileSync(join(dist, name), 'utf8');
	if (!xml.includes('<urlset')) continue;
	let m;
	locRe.lastIndex = 0;
	while ((m = locRe.exec(xml)) !== null) {
		urls.add(m[1].trim());
	}
}

if (urls.size === 0) {
	console.error('flatten-sitemap: ingen <loc> i urlset-filer');
	process.exit(1);
}

const sorted = [...urls].sort();
const body = sorted.map((u) => `<url><loc>${escapeXml(u)}</loc></url>`).join('');
const out = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;

writeFileSync(join(dist, 'sitemap.xml'), out);
console.log(`flatten-sitemap: dist/sitemap.xml med ${sorted.length} URL(er) (flad urlset)`);
