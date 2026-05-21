# GSC → opskrifter: top 50 forespørgsler (mapping)

Kilde: Google Search Console export **Forespørgsler.csv** (mappe `https___www-3`, maj 2026, **sidste 16 måneder**, søgetype Net). Kolonne *GSC*: **Klik / Eksponeringer / CTR / Placering**.

`src/data/gsc-sider.csv` er opdateret med tilhørende **Sider.csv** (til redirect-script: `npm run gsc:redirects`).

Status: **findes** (dedikeret eller tæt slug), **mangler** (ny opskrift), **optimer** (udvid meta/FAQ/indhold/billede), **irrelevant**.

**Hero-billeder:** Ved nye opskrifter eller visuelle opdateringer: egne AI-/genererede PNG under `public/images/recipes/airfryer-<slug>.png` og `heroImage` + `heroAlt` i frontmatter (som på øvrige sider).

| # | Forespørgsel | GSC (klik, exp, CTR, pos) | Status | Slug / handling |
|---|--------------|---------------------------|--------|-----------------|
| 1 | nachos i airfryer | 1715, 6843, 25.06%, 4.44 | findes | `airfryer-nachos-kylling-jalapenos` — FAQ + CTR |
| 2 | ribeye i airfryer | 723, 2147, 33.67%, 3.28 | optimer | `airfryer-okseboef-steak` — ribeye, tykkelse, hviletid |
| 3 | pulled chicken i airfryer | 479, 3123, 15.34%, 4.13 | findes | `airfryer-pulled-chicken` |
| 4 | røræg i airfryer | 414, 2754, 15.03%, 5.28 | optimer | `airfryer-aeg` — dedikeret røræg-sektion |
| 5 | lammekølle i airfryer | 409, 2015, 20.30%, 4.87 | optimer | `airfryer-lammekoelle-skiver` + FAQ hel kølle |
| 6 | mørksej i airfryer | 305, 770, 39.61%, 3.98 | findes | `airfryer-moerksej` |
| 7 | lammekoteletter i airfryer | 304, 1456, 20.88%, 4.71 | findes | `airfryer-koteletter` |
| 8 | hel kylling i airfryer casper sobczyk | 231, 1009, 22.89%, 3.84 | optimer | `airfryer-hel-kylling` — tid/vægt/Casper FAQ |
| 9 | entrecote i airfryer | 213, 1670, 12.75%, 6.45 | findes | `airfryer-okseboef-steak` |
| 10 | hytteost fladbrød i airfryer | 177, 300, 59%, 1.71 | findes | `airfryer-hytteost-broed` |
| 11 | bananpandekager i airfryer | 165, 267, 61.8%, 1.75 | findes | `airfryer-pandekager` FAQ |
| 12 | hytteost brød i airfryer | 164, 307, 53.42%, 1.64 | findes | `airfryer-hytteost-broed` |
| 13 | havregrød i airfryer | 163, 1101, 14.8%, 6.47 | optimer | `airfryer-havregroed` — titel/snippet |
| 14 | tofu i airfryer | 157, 826, 19.01%, 7.72 | findes | `airfryer-tofu` |
| 15 | pulled chicken airfryer | 139, 1012, 13.74%, 8.54 | findes | `airfryer-pulled-chicken` |
| 16 | lammekrone i airfryer | 125, 1410, 8.87%, 5.89 | findes | `airfryer-lammekrone` |
| 17 | flæskesteg i airfryer casper sobczyk | 119, 3913, 3.04%, 9.81 | optimer | `airfryer-flaeskesteg` — Svar på Casper + sprød svær |
| 18 | ribeye airfryer | 115, 571, 20.14%, 12.8 | optimer | `airfryer-okseboef-steak` |
| 19 | soltørrede tomater i airfryer | 111, 602, 18.44%, 4.47 | findes | `airfryer-soltoerrede-tomater` |
| 20 | flæskesteg i airfryer | 109, 11364, 0.96%, 18.81 | optimer | `airfryer-flaeskesteg` — **høj exp, lav CTR** → meta + UD FAQ |
| 21 | tunbøf i airfryer | 105, 225, 46.67%, 2.22 | findes | `airfryer-tunboef-tunsteak` |
| 22 | tunsteak i airfryer | 101, 227, 44.49%, 2.15 | findes | `airfryer-tunboef-tunsteak` |
| 23 | sejfilet i airfryer | 100, 205, 48.78%, 1.78 | findes | `airfryer-moerksej` |
| 24 | osso buco i airfryer | 95, 193, 49.22%, 2.7 | findes | `airfryer-osso-buco` |
| 25 | pandekager i airfryer | 92, 1429, 6.44%, 5.71 | optimer | `airfryer-pandekager` — snippet |
| 26 | gyoza i airfryer | 91, 711, 12.8%, 5.28 | findes | `airfryer-dumplings-gyoza` |
| 27 | onion boil opskrift dansk | 88, 492, 17.89%, 4.95 | irrelevant | ikke airfryer — ignorér eller FAQ-krydshenvis |
| 28 | leverpostej i airfryer | 85, 3235, 2.63%, 6.59 | optimer | `airfryer-leverpostej` — meta, **høj exp** |
| 29 | dumplings i airfryer | 85, 654, 13%, 8.98 | findes | `airfryer-dumplings-gyoza` |
| 30 | laks i airfryer med asparges | 76, 308, 24.68%, 3.05 | findes | `airfryer-laks` + evt. `airfryer-aeggekage-asparges-bacon` |
| 31 | ribeye steg i airfryer | 75, 655, 11.45%, 3.99 | optimer | `airfryer-okseboef-steak` |
| 32 | spidskål i airfryer casper sobczyk | 75, 295, 25.42%, 4.69 | findes | `airfryer-spidskaal` |
| 33 | entrecote airfryer | 74, 421, 17.58%, 17.2 | optimer | `airfryer-okseboef-steak` — placering |
| 34 | blomkål i airfryer med ost | 74, 263, 28.14%, 2.71 | optimer | `airfryer-blomkaal` — ost FAQ |
| 35 | nachos airfryer | 73, 422, 17.3%, 9.42 | findes | `airfryer-nachos-kylling-jalapenos` |
| 36 | entrecote bøf i airfryer | 73, 403, 18.11%, 3.85 | findes | `airfryer-okseboef-steak` |
| 37 | lammekølle med ben i airfryer | 73, 266, 27.44%, 5.87 | optimer | `airfryer-lammekoelle-skiver` FAQ |
| 38 | lammekølle airfryer | 73, 265, 27.55%, 5.3 | optimer | `airfryer-lammekoelle-skiver` |
| 39 | æblechips airfryer | 72, 356, 20.22%, 4.54 | findes | `airfryer-aeblechips` |
| 40 | forloren hare i airfryer | 70, 3349, 2.09%, 9.17 | optimer | `airfryer-forloren-hare` — **lav CTR, høj exp** |
| 41 | popcorn i airfryer | 69, 5260, 1.31%, 7.48 | optimer | `airfryer-popcorn` — titel/fakta vs. myte |
| 42 | nachos air fryer | 69, 597, 11.56%, 4.8 | findes | `airfryer-nachos-kylling-jalapenos` |
| 43 | torsk i airfryer | 68, 1658, 4.1%, 9.2 | optimer | `airfryer-torsk` |
| 44 | mørksejfilet i airfryer | 65, 201, 32.34%, 4.44 | findes | `airfryer-moerksej` |
| 45 | kage i airfryer | 64, 2920, 2.19%, 10.62 | optimer | `airfryer-chokoladekage-lille-form` + landing i `airfryer-pandekager` |
| 46 | pulled kylling i airfryer | 63, 310, 20.32%, 3.31 | findes | `airfryer-pulled-chicken` |
| 47 | casper sobczyk airfryer anmeldelse | 62, 1482, 4.18%, 5.69 | findes | `/anmeldelser` (ikke opskrift) |
| 48 | grønkålschips airfryer | 62, 801, 7.74%, 4.72 | findes | `airfryer-groenkaalschips` |
| 49 | nachos i airfryer casper sobczyk | 61, 207, 29.47%, 2.18 | findes | `airfryer-nachos-kylling-jalapenos` |
| 50 | stegt lever i airfryer | 60, 524, 11.45%, 5.06 | optimer | `airfryer-kyllingelever` / `airfryer-kalvelever` — ordlyd “stegt lever” i titel/FAQ |

---

## Prioritet: hvad vi gør først (indhold + jeres billeder)

1. **Lav CTR, høj eksponering** (hurtigste gevinst): `airfryer-flaeskesteg`, `airfryer-forloren-hare`, `airfryer-popcorn`, `airfryer-leverpostej`, `airfryer-torsk` — skærp **title/description**, 1 tydeligt svar i intro, **FAQ** der matcher søgeord, og et **friskt hero** hvis billedet ikke matcher konkurrenterne. *(2026-05-22: title/description + FAQ/meta justeret på disse samt udvidet ribeye/entrecôte-afsnit på `airfryer-okseboef-steak`.)* **Samme dato, batch 2:** `airfryer-havregroed`, `airfryer-pandekager`, `airfryer-blomkaal`, `airfryer-chokoladekage-lille-form`, `airfryer-lammekoelle-skiver`, `airfryer-hel-kylling` — titel/description, keywords og FAQ til snippets (GSC top‑liste). **2026-05-23, batch 3:** `airfryer-nachos-kylling-jalapenos` — nachos/air fryer-ordformer + FAQ; `airfryer-aeg` — røræg først i titel/description + snippet-FAQ; `airfryer-kyllingelever` + `airfryer-kalvelever` — “stegt lever … tid” og kryds‑FAQ mellem ky/kalv.
2. **Okse/cluster**: `airfryer-okseboef-steak` dækker ribeye/entrecote — ensartet blok “Ribeye vs. entrecote” + samme struktur i FAQ.
3. **Nye opskrifter kun når det mangler** — se `src/data/gsc-missing-recipe-urls.json` (fx brunede kartofler, bagte pærer, kyllingefilet): vurder om de skal laves som egne sider **med** `heroImage`/`heroAlt` og PNG i `public/images/recipes/`.
   - *2026-05-21:* Dedikerede sider findes (`airfryer-brunede-kartofler`, `airfryer-bagte-paerer-honning-noedder`, `airfryer-kyllingebryst`); overrides i `recipe-legacy-redirect-overrides.json` peger `.html`/venlige slugs korrekt. `/kapacitet/8liter` → liter-guide.
4. **klejner** er ude af top 50 i denne periode men stadig stærk side; behold ved næste gennemgang.

---

## Månedlig GSC-rutine

1. Eksporter **effektivitet → forespørgsler** + **sider** for property `https://www.opskrift-airfryer.dk/` (CSV som ovenfor).
2. Erstat `src/data/gsc-sider.csv`, kør `npm run gsc:redirects`, commit med evt. `vercel.json`.
3. Opdatér **øverste 50** i denne fil, eller tilføj nye rækker med dato.
4. Prioritér: **klik > 20** eller **eksponeringer > 500** med **placering ca. 4–15** → `optimer` først (CTR-gevinst).
5. Efter publicering: notér dato ved slug; efter 4–8 uger tjek samme forespørgsel for **CTR** og **placering** i GSC.

---

## Forespørgsler vs. guides (uden for top‑50‑tabellen)

Den **liste med de 50 største forespørgsler** ovenfor kommer fra GSC-export *Forespørgsler* og er overvejende **konkrete retter og ingredienser**. Den dækker derfor ikke “hvordan / brug / teori”-søgning på samme måde.

For **guides** finder du stadig spor i **effektivitet → sider** (fx `src/data/gsc-sider.csv`): tidligere URL’er som `…/guides/airfryer-rengoering.html`, `airfryer-tider.html`, `airfryer-energi.html`, `maden-bliver-ikke-sproed…` m.fl. havde eksponeringer eller klik før de blev samlet eller redirect’et til nuværende guides (`gsc-generated-redirects.json` / `vercel.json`). Det er et godt krydstjek når du **prioriterer nye eller udbyggede guides** (rengøring, tid og strøm, sprødhed og typiske fejl).

**Tip:** Udvid månedligt med et separat ark i GSC eller en kopi af *Forespørgsler* filtreret på tekst som “airfryer hvordan”, “rester”, “temperatur” osv., så guide-arbejde ikke kun styres af opskrifts-top‑50 ovenfor.

**Sidst tilføjet (maj–jun 2026):** også guide om hvornår **ovn/komfur** er bedre end airfryer (`/guides/hvornaar-ovn-eller-komfur-fremfor-airfryer`); tidligere bagepapir/silikone og meal prep/batch samt redirects fra ældre venlige slugs til eksisterende opskrifter hvor dedikerede sider allerede findes (`brunede-kartofler-i-airfryer`, `bagte-paerer-…`, `kyllingefilet-i-airfryer`, `/kapacitet/8liter`).
