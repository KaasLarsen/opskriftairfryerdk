// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSerializeWithLastmodFromContent } from './scripts/sitemap-content-lastmod.mjs';

const repoRoot = dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
	site: 'https://www.opskrift-airfryer.dk',
	trailingSlash: 'never',
	integrations: [
		sitemap({
			filter: (url) => {
				try {
					const p = new URL(url).pathname.replace(/\/$/, '') || '/';
					if (p === '/login' || p === '/konto' || p.startsWith('/auth')) return false;
					if (p.endsWith('search-index.json')) return false;
					return true;
				} catch {
					return true;
				}
			},
			serialize: createSerializeWithLastmodFromContent(repoRoot),
		}),
	],
	compressHTML: true,
	build: {
		inlineStylesheets: 'auto',
	},
});
