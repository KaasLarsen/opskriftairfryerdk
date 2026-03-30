// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://opskriftairfryer.dk',
	trailingSlash: 'never',
	integrations: [sitemap()],
	compressHTML: true,
	build: {
		inlineStylesheets: 'auto',
	},
});
