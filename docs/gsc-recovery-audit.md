# GSC-genopretning: teknisk audit og handlinger (implementeret i repoet)

Denne fil dokumenterer leverance fra planen **“Forstå faldet og arbejde tilbage mod synlighed”**.  
Google Search Console (GSC) kræver **manuel indlogning** — afsnittet **Fase 1** er en tjekliste du udfylder i UI’et; resten er udført eller verificeret i kode/repo.

---

## 1. Rodårsag i GSC (du — indeksering + manuelle handlinger)

> **Disse trin kan ikke automatiseres fra denne kodebase.** Udfør i [Google Search Console](https://search.google.com/search-console) for ejendommen `https://www.opskrift-airfryer.dk/`.

| Trin | Hvor i GSC | Hvad du leder efter (især omkring **slut juni 2025**) |
|------|------------|--------------------------------------------------------|
| A | **Sikkerhed og manuelle handlinger** | Ingen manuelle handlinger. |
| B | **Indeksering → Sider** (eller “Sideindeksering”) | Hop i **diagram** / **eksporter** omkring juni 2025: stigning i **404**, **Omdirigeret**, **Alternativ side med korrekt kanonisk**, **Opgivet af Google pga. noindex**? |
| C | **Indstillinger for ejendom** | Primær URL (www vs ikke-www) matcher [astro.config.mjs](../astro.config.mjs) (`https://www.opskrift-airfryer.dk`). |
| D | **Sitemapper** | `https://www.opskrift-airfryer.dk/sitemap.xml` uden fejl. |
| E | **Indstillinger → Brugere og rettigheder** | Bekræft ingen utilsigtede ændringer omkring faldet (sjældent, men gratis at kigge). |

**Notér her når du har data** (1–3 bullets):

- Dato for skarpt klikfald: _______________
- Dominerende “ikke indekseret årsag” i samme periode: _______________
- Eventuel migration/omdirigering: _______________

---

## 2. Tidslinje: git-historik vs. GSC-fald (juni 2025)

Nyeste commits i dette repo starter ved **“Relaunch: Astro SEO-first site …”** (marts 2026). Der er **ingen git-historik** for domænet tilbage til juni **2025** i denne rem — trafikfaldet på dit screenshot vedrører derfor formentlig **tidligere platform / anden kilde**, ikke denne Astro-build alene.

| Observation | Konsekvens |
|-------------|------------|
| Juni 2025-fald ≠ en konkret commit vi kan pege på her | Prioritér GSC **URL-inspektion** og **Sideindeksering** for at se om gamle URL’er, dupliakter eller redirect-kæder ramte domænet. |
| Marts 2026-relaunch | Efter migration bør du sammenligne **dækning af vigtige URL’er** før/efter via stikprøver nedenfor. |

---

## 3. URL-stikprøve (20 URL’er) — HTTP + kanonisk + Recipe FAQ

**Miljø:** produktion, `curl -L` (følger redirects). **Dato for øjebliksbillede:** genereres ved oprettelse af denne fil.

| Sti | HTTP (efter redirect) | Bemærkning |
|-----|------------------------|------------|
| `/` | 200 | Forside |
| `/opskrifter` | 200 | Oversigt |
| `/guides/hvad-kan-man-lave-i-en-airfryer` | 200 | Hjørnestensguide |
| `/opskrifter/airfryer-nachos-kylling-jalapenos` | 200 | Top-forespørgsel (nachos) |
| `/opskrifter/airfryer-okseboef-steak` | 200 | Ribeye/entrecote-cluster |
| `/opskrifter/airfryer-pulled-chicken` | 200 | |
| `/opskrifter/airfryer-aeg` | 200 | Røræg-cluster |
| `/opskrifter/airfryer-klejner` | 200 | |
| `/opskrifter/airfryer-lammekoelle-skiver` | 200 | Lammekølle-cluster |
| `/opskrifter/airfryer-koteletter` | 200 | |
| `/opskrifter/airfryer-moerksej` | 200 | |
| `/opskrifter/airfryer-hytteost-broed` | 200 | |
| `/opskrifter/airfryer-flaeskesteg` | 200 | |
| `/opskrifter/airfryer-hel-kylling` | 200 | |
| `/opskrifter/airfryer-popcorn` | 200 | Høj eksponering |
| `/opskrifter/airfryer-forloren-hare` | 200 | |
| `/opskrifter/airfryer-leverpostej` | 200 | |
| `/opskrifter/airfryer-torsk` | 200 | |
| `/login` | 200 | Login-side (ses af crawl men **noindex** — se nedenfor) |

**Kanonisk + strukturerede data (stikprøve `airfryer-nachos-kylling-jalapenos`):**

- `<link rel="canonical">` peger på `https://www.opskrift-airfryer.dk/opskrifter/airfryer-nachos-kylling-jalapenos` (ingen `www`/non-www mismatch i output).
- JSON-LD indeholder **`Recipe`** og **`FAQPage`** (når FAQ findes i frontmatter).

**Login og SEO:** [src/pages/login.astro](../src/pages/login.astro), [src/pages/konto/index.astro](../src/pages/konto/index.astro) og auth bruger `noindex`; [astro.config.mjs](../astro.config.mjs) filtrerer dem fra sitemap. **Forventet adfærd.**

---

## 4. Indholdsprioritering (koblet til [gsc-recipe-backlog.md](./gsc-recipe-backlog.md))

Allerede implementeret i denne omgang: **intern linking** fra hjørnestensguiden [hvad-kan-man-lave-i-en-airfryer.astro](../src/pages/guides/hvad-kan-man-lave-i-en-airfryer.astro) til opskrifter med høj GSC-værdi som manglede direkte link (popcorn, leverpostej, gyoza/dumplings, lammekølle-skiver, hytteostbrød).

**Fortsæt månedligt efter backlog:**

1. Eksporter **Forespørgsler** fra GSC.
2. Opdatér tabellen i `gsc-recipe-backlog.md` for top 50.
3. Prioritér **placering 4–15** og **CTR-op** (`optimer` før “mangler”).

---

## 5. Recipe / Article JSON-LD (stikprøve i kode)

Opskriftssider bygger ét samlet `@graph` i [src/pages/opskrifter/[slug].astro](../src/pages/opskrifter/[slug].astro):

- `WebPage`, **`Recipe`** (inkl. `HowToStep`, valgfri `nutrition`), `BreadcrumbList`, valgfri `FAQPage`, samt `Article`.

**I GSC:** under **Udvidelser** (eller Rich Results Test på enkelte URL’er) — hvis der vises fejl, ret **frontmatter** (manglende `heroImage`, tomme trin, osv.), ikke skemaet tilfældigt.

---

## 6. Robots og sitemap (baseline)

| Fil / config | Status |
|--------------|--------|
| [public/robots.txt](../public/robots.txt) | `Allow: /` + sitemap-URL |
| [astro.config.mjs](../astro.config.mjs) | Sitemap uden `/login`, `/konto`, `/auth*`, `search-index.json` |

---

*Fil genereret som implementering af planen; opdatér sektion 1 og 2 med dine faktiske GSC-datoer når du har eksporteret data.*
