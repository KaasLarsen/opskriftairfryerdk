import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dist = join(process.cwd(), 'dist');
const indexFile = join(dist, 'sitemap-index.xml');
const aliasFile = join(dist, 'sitemap.xml');

if (!existsSync(indexFile)) {
	console.error('copy-sitemap: mangler dist/sitemap-index.xml – kør astro build først');
	process.exit(1);
}

copyFileSync(indexFile, aliasFile);
console.log('copy-sitemap: dist/sitemap.xml er synlig kopi af sitemap-index.xml');
