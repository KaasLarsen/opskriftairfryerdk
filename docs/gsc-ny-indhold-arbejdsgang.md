# Nyt opskriftsindhold fra GSC (arbejdsgang)

Sitet har først og fremmest fået **flere hundrede SEO‑polerbinger på eksisterende sider**. Når du også vil **vokse antallet af URLs** til nye forespørgsler, er flowet:

## 1) Eksporter data

1. Google Search Console → **Effektivitet** → **Forespørgsler** (netsøgning).
2. Tilpas evt. interval (sidste **16 måneder** eller 3 måneder ved hyppige kørsel).
3. **Eksporter** som **CSV (UTF‑8)**.

**Data i repo:** `src/data/gsc-forespoergsler.csv` (seneste kopi fra GSC-eksport; opdatér ved næste månedlige rutine).

Eksport fra GSC: Effektivitet → **Forespørgsler** (netsøgning) → **Eksporter** som CSV (UTF‑8). Overskriv filen ovenfor eller gem under et andet navn og peg på den i kommandoerne nedenfor.

## 2) Regenerér kandidatliste

Eksempel (samme parametre som seneste kladder i repo):

```bash
node scripts/analyze-gsc-forespoergsler.mjs src/data/gsc-forespoergsler.csv \
  --mins=150 --threshold=0.38 > docs/gsc-ny-indhold-kandidater.generated.md
```

Sidste kørsel (~1000 forespørgsler i CSV): se [`docs/gsc-ny-indhold-kandidater.generated.md`](gsc-ny-indhold-kandidater.generated.md). Filtrér manuelt væk **ikke‑mad** (fx Weber‑grill, planter) — matcheren ser kun ord‑overlap på opskrifter, ikke intensjon.

## 3) Find huller automatisk

Kør analyse (printer markdown‑tabel til stdout — gem til fil hvis ønsket). Tabellen indeholder også **Foreslået ny slug** og om filen findes — brug første kolonne (**Forespørgsel**) til **rigtigt unikt indhold**, ikke kopierede skabeloner på tværs af mange sider.

```bash
npm run gsc:ny-indhold-kandidater -- --threshold=0.32 --mins=120
```

- **`--threshold`**: hvor stor del af forespørgsels‑ord der skal findes i `slug + titel + keywords` før opskriften regnes som *“match”*.
- **`--mins`**: filtrér bort mikro‑forespørgsler lav eksponering.
- **`--demo`**: kør på indbyggede testforespørgsler uden CSV (godt til sanity‑check):

```bash
node scripts/analyze-gsc-forespoergsler.mjs --demo
```

Tolker tabellen groft sådan her:

| Triage i output                             | Handling                                         |
|-------------------------------------------|--------------------------------------------------|
| **Udvid/optimer eksisterende**           | Titler, description, FAQ, evt. tekst‑udvidelse  |
| **Overvej ny opskriftside**              | Opret `src/content/recipes/airfryer-<emne>.md` |

Ny side kræver som minimum gyldigt frontmatter som i `src/content.config.ts`: `title`, `description`, **ingredienser/liste**, **instructions/liste**, m.m. Brug eksisterende sider som skabeloner.

## 4) Gamle WP‑URL’er

Når du laver ny side til en specifik klassisk slug i `legacy-url-keyword-routes.json`, **peg den gamle WP‑sti** til den **nye** `airfryer-…`‑id og kør derefter:

```bash
npm run gsc:redirects
```

(Det regenerer `gsc-generated-redirects.json` og opdaterer `vercel.json` via `scripts/generate-vercel-redirects.mjs`.)

## 5) Publiceringssæt

1. Tilføj `heroImage` + `heroAlt` + PNG i `public/images/recipes/` når billedet er klar [(se note i `docs/gsc-recipe-backlog.md`)](gsc-recipe-backlog.md).
2. `npm run build`
3. Commit + deploy.

---

### Relaterede filer

- Backlog‑noter: [`docs/gsc-recipe-backlog.md`](gsc-recipe-backlog.md)
- Seneste queries‑CSV: [`src/data/gsc-forespoergsler.csv`](../src/data/gsc-forespoergsler.csv)
- Seneste kandidatliste: [`docs/gsc-ny-indhold-kandidater.generated.md`](gsc-ny-indhold-kandidater.generated.md)
- Script: [`scripts/analyze-gsc-forespoergsler.mjs`](../scripts/analyze-gsc-forespoergsler.mjs)
- Mangler‑URL liste (historisk automatisk snapshot): [`src/data/gsc-missing-recipe-urls.json`](../src/data/gsc-missing-recipe-urls.json)
