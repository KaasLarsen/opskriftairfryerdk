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
| **Overvej ny opskriftside**              | *Kun* hvis kvaliteten nedenfor er i orden — ellers udvid eksisterende side eller lad være |

Ny side kræver som minimum gyldigt frontmatter som i `src/content.config.ts`: `title`, `description`, **ingredienser/liste**, **instructions/liste**, m.m. Brug eksisterende sider som skabeloner — men **kopier ikke** en hel side og skift ét ord; det giver ikke unikt værdi og risikerer tyndt indhold.

### Kvalitet før volumen (obligatorisk tjek før ny opskrift)

Målet er **én reel ret / ét tydeligt emne → én side** som en læser faktisk kan lave succesfuldt i maskinen — ikke flest mulige Markdown‑filer.

- **Ikke matrix:** Samme struktur × mange sider hvor kun ét krydderi eller én protein skifter, er **ude**. Se også advarslen i [`docs/gsc-recipe-backlog.md`](gsc-recipe-backlog.md) om “Matrix‑opskrifter”.
- **Én primær intention:** Én side skal konsekvent svare på *den* forespørgsel (fx “horn­fisk” ≠ generisk “fisk”). Hvis den tætte eksisterende side med en **tydelig udvidelse** (egen sektion + FAQ + billede) kan dække det godt → **ingen ny URL**.
- **Konkret og airfryer‑specifikt:** Tider, temperatur‑spænd, kurv vs. fad, ét lag vs. batches, folie/ikke folie, og **hvad man tjekker** (kerne­temperatur, pindeprøve, sprødhed). Ingen vage “bag til det er færdigt” uden pejlemærker.
- **Troværdig dansk:** Rigtige navne (ikke engelske rester), måleenheder I bruger andre steder, og sætninger der lyder som en kok — ikke fyldord eller generisk AI‑støj. Kør `npm run check:recipe-junk` før commit.
- **Unik vinkel pr. side:** Intro og tips skal forklare *hvorfor* denne ret er særlig i airfryer (fugt, skorpe, små portioner, varmluft). Hvis den sætning kunne stå på fem andre opskrifter uden ændring → omskriv eller stop.
- **Billede matcher:** `heroAlt` og PNG afspejler retten; undgå generiske stock‑lignende motiver der kunne være alt.
- **Når du er i tvivl:** Prioritér **optimering** af en stærk eksisterende slug frem for en ny side med tvivlsom differens.

Hvis et batch‑værktøj eller en assistent foreslår mange filer på én gang: **stop** og gennemgå hver enkelt mod listen ovenfor — ellers “kører man bare derud” uden at bygge noget læserne og søgemaskinen reelt belønner.

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
