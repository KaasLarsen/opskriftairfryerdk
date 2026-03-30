# Opskrift Airfryer (SEO-first)

Astro-baseret statisk site til **opskriftairfryer.dk** med fokus på hastighed, indeksering og struktureret data (Recipe, FAQ, Article, Breadcrumb).

## Udvikling

```bash
npm install
npm run dev
```

## Byg

```bash
npm run build
npm run preview
```

## Indhold

Opskrifter ligger i [`src/content/recipes/`](src/content/recipes/) som Markdown med Zod-validering i [`src/content.config.ts`](src/content.config.ts).

## Domæne & SEO

- `site` er sat i [`astro.config.mjs`](astro.config.mjs) til `https://opskriftairfryer.dk` (sitemap + kanoniske URL’er).
- [`public/robots.txt`](public/robots.txt) peger på `sitemap-index.xml` efter deploy.
- [`vercel.json`](vercel.json) har 301 fra typiske **`.html`‑URL’er** til rene stier (hjælper ved migrering fra statisk HTML).

## Efter deploy

1. Google Search Console: bekræft ejerskab, indsend sitemap `https://opskriftairfryer.dk/sitemap-index.xml`.
2. Tjek **Sideoplevelse** / CWV og **Dækning** for 404/redirect.
3. Udvid `vercel.json` redirects med konkrete gamle URL’er hvis du har dem fra det tidligere site.
