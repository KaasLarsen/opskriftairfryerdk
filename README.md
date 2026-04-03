# Opskrift Airfryer (SEO-first)

Astro-baseret statisk site til **www.opskrift-airfryer.dk** med fokus på hastighed, indeksering og struktureret data (Recipe, FAQ, Article, Breadcrumb).

## Udvikling

```bash
npm install
cp .env.example .env
# Udfyld PUBLIC_SUPABASE_* i .env (se nedenfor)
npm run dev
```

Appen kører typisk på `http://localhost:4321`.

## Byg

```bash
npm run build
npm run preview
```

`npm run build` genererer `dist/sitemap.xml` som **én flad liste** af alle offentlige URL’er (ikke et indeks), så Search Console viser det rigtige antal sider.

## Indhold

Opskrifter ligger i [`src/content/recipes/`](src/content/recipes/) som Markdown med Zod-validering i [`src/content.config.ts`](src/content.config.ts).

## Shop (PartnerAds)

`/shop` viser **kun** luftfriture/airfryere og **tilbehør dertil** — alt andet fra PartnerAds-feeds filtreres fra ved sync (`scripts/shop-airfryer-classify.mjs`). Ved `npm run build` kører [`scripts/sync-shop-products.mjs`](scripts/sync-shop-products.mjs) først og skriver [`public/data/shop-products.json`](public/data/shop-products.json) ud fra `PARTNERADS_FEED_URLS` (kommasepareret) i miljøet. Eksempel-feeds findes i [`.env.example`](.env.example); kopier til `.env` eller sæt variablen hos Vercel.

**Note:** `public/data/shop-products.json` er **gitignoreret** (filen kan blive meget stor efter sync). Uden den lokalt: kør `node scripts/sync-shop-products.mjs` én gang (evt. med tom `PARTNERADS_FEED_URLS` for en tom liste).

For **daglig opdatering uden manuelt deploy**: opret et **Deploy Hook** hos Vercel og sæt GitHub-secret `VERCEL_DEPLOY_HOOK_URL` — se [`/.github/workflows/daily-vercel-deploy.yml`](.github/workflows/daily-vercel-deploy.yml).

## Log ind (Supabase) – hvad du skal gøre

Det repo “fixer” kun koden. **Du** skal knappe tre ting sammen i dashboards (én gang):

1. **Miljøvariabler**  
   Brug [`/.env.example`](.env.example) som skabelon. Du skal have **samme to variabler** både lokalt (`.env`) og hos din host (fx **Vercel → Project → Settings → Environment Variables**):
   - `PUBLIC_SUPABASE_URL` – dit projekts URL fra Supabase → *Project Settings → API*.
   - `PUBLIC_SUPABASE_ANON_KEY` – **anon public** key derfra (ikke `service_role`).

2. **Supabase Auth – hvor må browseren lande**  
   I Supabase: *Authentication → URL Configuration*:
   - **Site URL:** `https://www.opskrift-airfryer.dk`
   - **Redirect URLs** (tilføj begge):  
     `https://www.opskrift-airfryer.dk/auth/callback`  
     `http://localhost:4321/auth/callback`

3. **Google-login (hvis du bruger det)**  
   *Authentication → Providers → Google*: slå til og udfyld OAuth-klient fra Google Cloud Console. Ellers virker email/password som vanligt hvis det er aktiveret.

**Vigtigt:** Commit aldrig rigtige nøgler. Kun `.env` (som er i `.gitignore`) eller host-secrets.

## Domæne & SEO

- `site` er sat i [`astro.config.mjs`](astro.config.mjs) til `https://www.opskrift-airfryer.dk` (sitemap + kanoniske URL’er).
- [`public/robots.txt`](public/robots.txt) peger på `sitemap.xml` (primær). Astro lægger stadig `sitemap-index.xml` / `sitemap-0.xml` i `dist` til intern brug.
- [`vercel.json`](vercel.json) har 301 fra typiske **`.html`‑URL’er** til rene stier (hjælper ved migrering fra statisk HTML).

## Efter deploy

1. **Google Search Console:** bekræft ejerskab for `www.opskrift-airfryer.dk`, indsend sitemap **`https://www.opskrift-airfryer.dk/sitemap.xml`** (evt. også index-URL hvis du bruger den).
2. Tjek **Sideoplevelse** / CWV og **Dækning** for 404/redirect.
3. Udvid `vercel.json` redirects med konkrete gamle URL’er hvis du har dem fra det tidligere site.
