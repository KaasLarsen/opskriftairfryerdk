#!/usr/bin/env python3
"""
Generér 100 marinadede airfryer-opskrifter (25 baser × 4 marinadeslag).
Springer eksisterende filnavne over. Kør fra repo-roden:
  python3 scripts/generate-100-marinated-airfryer-recipes.py
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RECIPES = ROOT / "src" / "content" / "recipes"
PUB = "2026-05-21"

MARINADES: list[dict] = [
    {
        "slug": "tikka",
        "name": "Yoghurt-tikka",
        "marine_desc": (
            "2 spsk græsk yoghurt, 2 tsk garam masala, 1 tsk paprika, "
            "½ tsk spidskommen, salt og hvidløgspulver efter behov."
        ),
        "temp_bonus": 2,
        "cuisine_hint": "Indisk inspireret",
        "tips_extra": (
            "Kød må gerne lugte krydret før bagning — for meget yoghurt i fadet dampes let bort før karamellisering."
        ),
    },
    {
        "slug": "gyros",
        "name": "Gyrosmarinade",
        "marine_desc": (
            "3 spsk olivenolie, saft af ½ citron, 1 spsk oregano (tørret), "
            "2 fed hvidløg groft hakket og frisk kværnet peber."
        ),
        "temp_bonus": 0,
        "cuisine_hint": "Græsk inspireret",
        "tips_extra": "Citron og oregano falder mest af smagen i første minutter — før endelig krydring før servering.",
    },
    {
        "slug": "teriyaki",
        "name": "Honning-soja (teriyakistil)",
        "marine_desc": (
            "3 spsk japansk sojasauce eller tamari, 2 spsk honning, "
            "1 spsk sesamolie og ½ tsk frisk revet ingefær."
        ),
        "temp_bonus": 0,
        "cuisine_hint": "Japan inspireret",
        "tips_extra": (
            "Honning kan mørkne hurtigt: steg først til næsten færdig og pensl eller dryp tynd soja‑honning de sidste 2–3 minutter på eget ansvar."
        ),
    },
    {
        "slug": "parmesan-rosmarin",
        "name": "Parmesan og rosmarin",
        "marine_desc": (
            "35 g friskrevet parmesan blandet med ½ tsk tørret rosmarin "
            "(eller 1 spsk finthakket frisk rosmarin) og hvidløgspulver efter behov."
        ),
        "temp_bonus": 3,
        "cuisine_hint": "Italiensk inspireret",
        "tips_extra": "Parmesan binder bedst på let oliesmurte overflader — ikke for tykt lag første gang du prøver maskinen.",
    },
]

BASES: list[tuple[str, str, str, str, str, str, str, str, dict]] = [
    # id, dansk_navn_fragment, ingredient_hovedlinje, type_key, category, servings, calories, cuisine, range_meta
    (
        "kyllingetern",
        "kyllingetern",
        "500 g kyllingetern eller indrefilet i tern",
        "poultry",
        "Hovedret",
        "4 portioner",
        "Ca. 295 kcal pr. portion",
        "International",
        {"prep": 20, "c_lo": 14, "c_hi": 22, "temp": 182},
    ),
    (
        "kyllingebryst-slice",
        "skiver af kyllingebryst",
        "Ca. 600 g kyllingebryst i skiver eller butterflied fileter",
        "poultry",
        "Hovedret",
        "4 portioner",
        "Ca. 265 kcal pr. portion",
        "International",
        {"prep": 18, "c_lo": 12, "c_hi": 20, "temp": 180},
    ),
    (
        "kyllingetern-spyd",
        "kylling på små spyd",
        "350 g små stykker kylling på træ‑ eller metalspyd (blødt træ først lagt i vand)",
        "poultry",
        "Snack eller let måltid",
        "Ca. 4 små måltider",
        "Ca. 240 kcal pr. måltid",
        "Mellemøsten inspireret",
        {"prep": 25, "c_lo": 15, "c_hi": 22, "temp": 184},
    ),
    (
        "laksefilet",
        "laksefilet",
        "450–500 g laksefilet skåret i portioner eller tern alt efter ønsket stegeskorpe",
        "fish",
        "Hovedret",
        "3 portioner",
        "Ca. 320 kcal pr. portion",
        "Skandinavisk",
        {"prep": 15, "c_lo": 8, "c_hi": 14, "temp": 175},
    ),
    (
        "torskefilet",
        "torskefileter",
        "500 g torskefilet (frisk eller optøet, godt tørret med køkkenrulle)",
        "fish",
        "Hovedret",
        "4 portioner",
        "Ca. 185 kcal pr. portion",
        "Dansk",
        {"prep": 15, "c_lo": 9, "c_hi": 15, "temp": 176},
    ),
    (
        "rejer-haand",
        "store rejer uden skal",
        "350 g optøede eller friske tigerrejer eller jomfruhummerhaler uden skal",
        "fish",
        "Hovedret",
        "3 portioner",
        "Ca. 160 kcal pr. portion",
        "International",
        {"prep": 12, "c_lo": 6, "c_hi": 10, "temp": 178},
    ),
    (
        "oksestroelse",
        "strimler af oksekød",
        "450 g okse inderlår eller bøffelår skåret i strimler",
        "beef",
        "Hovedret",
        "4 portioner",
        "Ca. 310 kcal pr. portion",
        "International",
        {"prep": 20, "c_lo": 8, "c_hi": 14, "temp": 190},
    ),
    (
        "hakkeboef-pandesteg",
        "smalle hakkebøffer",
        "500–550 g blandet hakkekød eller rent oksehak formet til fire flade bøffer",
        "beef",
        "Hovedret",
        "4 bøffer",
        "Ca. 360 kcal pr. bøf",
        "Dansk",
        {"prep": 15, "c_lo": 10, "c_hi": 15, "temp": 188},
    ),
    (
        "nakkekoteletter",
        "nakkekoteletter",
        "Ca. 650 g svina‑ eller kalvenakkekoteletter på knogle",
        "pork",
        "Hovedret",
        "4 portioner",
        "Ca. 390 kcal pr. portion",
        "Dansk",
        {"prep": 18, "c_lo": 18, "c_hi": 28, "temp": 186},
    ),
    (
        "svinekam-skiver",
        "skiver af svinekam",
        "600 g kam uden svær skåret i skiver eller medaljoner på ca. 2 cm tykkelse",
        "pork",
        "Hovedret",
        "4 portioner",
        "Ca. 325 kcal pr. portion",
        "Dansk",
        {"prep": 18, "c_lo": 16, "c_hi": 26, "temp": 184},
    ),
    (
        "lammestroelse",
        "strimler af lammekød",
        "450 g lammeskulder eller lår uden fedtkant skåret i strimler",
        "lamb",
        "Hovedret",
        "3 portioner",
        "Ca. 295 kcal pr. portion",
        "International",
        {"prep": 22, "c_lo": 10, "c_hi": 17, "temp": 182},
    ),
    (
        "tofu-rost",
        "tern af tofu",
        "400 g ekstra fast tofu, presses tør og skæres i tern eller skiver på ca. 1,5 cm",
        "veg",
        "Hovedret",
        "3 portioner",
        "Ca. 195 kcal pr. portion",
        "Plantebaseret",
        {"prep": 20, "c_lo": 14, "c_hi": 22, "temp": 188},
    ),
    (
        "tempeh-skiver",
        "tempeh i skiver",
        "250 g tempeh i skiver på ca. 5 mm",
        "veg",
        "Hovedret",
        "3 portioner",
        "Ca. 245 kcal pr. portion",
        "Plantebaseret",
        {"prep": 15, "c_lo": 10, "c_hi": 16, "temp": 184},
    ),
    (
        "halloumi-staenger",
        "halloumistænger",
        "250 g halloumi skåret til stænger eller wedges",
        "cheese",
        "Snack eller tilbehør",
        "4 små måltider",
        "Ca. 230 kcal pr. måltid",
        "Cyprisk inspireret",
        {"prep": 10, "c_lo": 7, "c_hi": 11, "temp": 175},
    ),
    (
        "portobello",
        "porte bello‑hatte",
        "Fire store champignon‑porte bello, stilke fjernet og underside skrabet lidt ud",
        "veg",
        "Hovedret",
        "Fire hatte eller 2 måltider",
        "Ca. 85 kcal pr. hat fyld ikke medregnet",
        "Vegetar",
        {"prep": 15, "c_lo": 10, "c_hi": 16, "temp": 178},
    ),
    (
        "zucchini-baade",
        "zucchini i halve skrog",
        "To mellemstore zucchini skåret på langs med kerner skrabet ud let",
        "veg",
        "Tilbehør",
        "4 halve eller 2 måltider",
        "Ca. 55 kcal pr. halvdel før fyld/top",
        "Middelhav",
        {"prep": 12, "c_lo": 10, "c_hi": 16, "temp": 180},
    ),
    (
        "kartoffel-roesteterm",
        "små kartoffel‑tern til ovnstegning",
        "600 g kartofler i tern eller både, skyllet tør og let oliesmurte før krydderi",
        "veg",
        "Tilbehør",
        "4 portioner som tilbehør",
        "Ca. 210 kcal pr. portion",
        "International",
        {"prep": 12, "c_lo": 20, "c_hi": 30, "temp": 190},
    ),
    (
        "blomkaal-mini",
        "små blomkålsbuketter",
        "1 mellemstor blomkål brudt i middelstore buketter",
        "veg",
        "Tilbehør",
        "4 portioner tilbehør",
        "Ca. 95 kcal pr. portion før dip",
        "International",
        {"prep": 12, "c_lo": 12, "c_hi": 18, "temp": 186},
    ),
    (
        "selleri-roedfrugter",
        "selleri med små kartoffelbåde",
        "3 selleristænger i skiver eller stave plus 250 g små kartoffelbåde",
        "veg",
        "Tilbehør",
        "4 portioner blandet tilbehør",
        "Ca. 165 kcal pr. portion",
        "Skandinavisk",
        {"prep": 14, "c_lo": 16, "c_hi": 24, "temp": 184},
    ),
    (
        "asparges-baacon-baand",
        "grønne asparges med baconbånd",
        "320 g grønne asparges samt cirka 100 g bacon i tynde skiver eller små pakker rundt om bundter",
        "mixed",
        "Tilbehør eller let ret",
        "4 små måltider",
        "Ca. 185 kcal pr. måltid",
        "Dansk",
        {"prep": 18, "c_lo": 9, "c_hi": 13, "temp": 180},
    ),
    (
        "haricots-bundt",
        "grønne bønner",
        "300 g haricots verts eller almindelige grønne bønter, enderne snittet af",
        "veg",
        "Tilbehør",
        "4 tilbehør",
        "Ca. 45 kcal pr. portion før toppings",
        "International",
        {"prep": 8, "c_lo": 7, "c_hi": 11, "temp": 182},
    ),
    (
        "tortilla-minipizza",
        "mini‑pizza på tortilla",
        "Fire små fuldkornstortillas eller hvedetortillas, hver med 1½ spsk tomatsauce eller pestobund",
        "bake",
        "Snack eller hurtigt måltid",
        "Fire mini pizzas",
        "Ca. 255 kcal pr. mini før ekstra toppings",
        "Familievenlig",
        {"prep": 12, "c_lo": 6, "c_hi": 10, "temp": 192},
    ),
    (
        "chorizo-kartofler",
        "kartofler og chorizo i skiver",
        "550 g kartofler i mundrette skiver eller både plus 140 g chorizo i skiver uden pap",
        "porkveg",
        "Hovedret",
        "3 portioner",
        "Ca. 410 kcal pr. portion",
        "Spansk inspireret",
        {"prep": 16, "c_lo": 24, "c_hi": 34, "temp": 188},
    ),
    (
        "andebrystfileter",
        "andebryst fileter uden hud",
        "500 g optøede eller friske andebryst i fileter eller mindre medalloner",
        "poultry",
        "Hovedret",
        "3 portioner",
        "Ca. 340 kcal pr. portion skind og sauce ikke medregnet",
        "Dansk",
        {"prep": 20, "c_lo": 12, "c_hi": 18, "temp": 180},
    ),
    (
        "vildtsteg-tern",
        "tern af vildt",
        "400 g hjort eller rådyr eller andet magert vildt i tern eller strimler uden senefedt",
        "game",
        "Hovedret",
        "3 portioner",
        "Ca. 290 kcal pr. portion",
        "Vild mad",
        {"prep": 25, "c_lo": 8, "c_hi": 13, "temp": 178},
    ),
]


def yaml_sq(s: str) -> str:
    return s.replace("'", "''")


def build_instructions(
    tkey: str,
    temp: int,
    c_lo: int,
    c_hi: int,
) -> list[str]:
    range_txt = f"{c_lo}–{c_hi} minutter"
    if tkey == "bake":
        return [
            "Smør tortillas let eller brug sprayskum så sauce og ost **ikke samler sig i dybe søer** i bunden før du starter.",
            f"Forvarm airfryeren til cirka **{temp} °C**.",
            f"Bag i typisk **{range_txt}** ét lag — hold øje sidste minutter så topping med **honning/soja eller ost** ikke skyder over ønsket mørkhed.",
            "Lad hvile på rist eller tallerken i et minuts tid så toppings sætter sig.",
        ]

    outs = [
        "Dup råvare tør før marinering eller rub — for meget fugt hindrer krydderi i at sidde på overfladen.",
        "Vend jævnt så marinade eller ost/rub ikke ligger i klumper — **ét lag** eller to kørsler hvis din kurv ikke rummer ét lag.",
        f"Forvarm airfryeren til cirka **{temp} °C** før du lukker låget.",
        f"Steg i typisk **{range_txt}** — halvvejs ryst fadet forsigtigt eller vend med tongs for jævn farve på begge sider ved kød og grønt.",
    ]

    if tkey == "fish":
        outs.append(
            "Fisk må gerne stadig ligne **lakserosa** eller være mat hvid ved torsk — prøv gaffeln i tykkeste lag første gang du tester maskinen."
        )
    elif tkey in ("veg", "porkveg", "mixed"):
        outs.append(
            "Grøntsager skal være møre ved gaffelpres — uden bitter **kulsmag** langs kanterne — før du giver ét ekstra minut."
        )
    elif tkey == "cheese":
        outs.append(
            "Halloumi er færdig når den er lun i midten med **gyldne kanter uden bitter smag** — den smelter ikke som mozzarella."
        )
    elif tkey == "poultry":
        outs.append(
            "Kylling og kalkun skal være gennemstegte ved **mindst cirka 74 °C midtstykket** før servering — mål med stegetermometer første gang."
        )
    elif tkey == "pork":
        outs.append(
            "Svinekød uden stor fedtkant bør måle **mindst cirka 71 °C midtstykket** før servering — tilføj gerne ét minut første gang hvis apparat fylder rolig."
        )
    elif tkey == "beef":
        outs.append(
            "Oksekød kan stege rosastegt eller gennem — mål første gang i tykkeste del eller skær et lille split."
        )
    elif tkey == "lamb":
        outs.append(
            "Lam kan stadig ligne **rosa** i midten hvis tykkelsen passer — mål i tykkeste strimmel første gang."
        )
    elif tkey == "game":
        outs.append(
            "Magert vildt må gerne stadig have **rosa kerne** — mål første gang så luftsteg ikke tørrer små bidder ud."
        )
    else:
        outs.append(
            "Tjek at retten er tilberedt som ønsket — mål første gang i tykkeste lag hvis du er i tvivl."
        )
    return outs


def fm_line_scalar(key: str, value: str) -> list[str]:
    return [f"{key}: '{yaml_sq(value)}'"]


def fm_block_scalar(key: str, text: str) -> list[str]:
    lines = [f"{key}: |"]
    blocks = [b.strip() for b in text.strip().split("\n\n")]
    for i, blk in enumerate(blocks):
        for pl in blk.splitlines():
            lines.append(f"  {pl.rstrip()}")
        if i < len(blocks) - 1:
            lines.append("  ")
    return lines


def build_body(file_id: str, marinade: dict, base: tuple) -> str:
    (
        _bid,
        human,
        amt,
        tkey,
        category,
        servings,
        calories,
        cuis_base,
        rm,
    ) = base

    mb = marinade["marine_desc"]
    mname = marinade["name"]

    prep = rm["prep"]
    c_lo, c_hi = rm["c_lo"], rm["c_hi"]
    temp = rm["temp"] + marinade["temp_bonus"]
    temp = max(172, min(198, temp))
    cook_mid = (c_lo + c_hi + 1) // 2

    title = f"{mname} på {human} i airfryer"
    if tkey == "bake":
        description = (
            f"Små tortillas med **{mname.lower()}** som smagsbund før ost eller grøntsagstopping i airfryer. "
            f"Som udgangspunkt **{c_lo}–{c_hi} minutter** ved **{temp} °C** til bunden har farve og osten bobler lettere."
        )
    else:
        description = (
            f"**{mname}** giver krydderi og fugt til **{human}** før du lukker kurven og lader luften arbejde. "
            f"Retten tager normalt **{c_lo}–{c_hi} minutter** ved **{temp} °C** i **ét fadlag** — justér første forsøgsdag ud fra hvor tynde stykkerne er."
        )

    cuisine_out = (
        cuis_base
        if cuis_base in ("Plantebaseret", "Vegetar")
        else marinade["cuisine_hint"]
    )

    intro = (
        f"Varm luft rundt marinade giver **hurtig smagsfang** på **{human}** og mindre fedt end på en almindelig pande.\n\n"
        f"Læg i **ét fadlag**, ryst fadet eller vend halvvejs, og notér dine egne minutter til næste gang."
    )
    conclusion = (
        "**Server med** kartoffelbåde, salat eller kold yoghurtsauce afhængigt af marinade.\n\n"
        "**Rester** i lufttæt beholder op til cirka **2 døgn** ved køl — **genvarm** kort før servering eller spis kolde på salat."
    )

    ingredients_lines: list[str] = []
    ingredients_lines.extend(
        [
            amt,
            "Salt og friskkværnet peber efter smag",
            "1–2 spsk neutral olivenolie eller sprayskum uden at der står væske i bunden af fadet ved start",
            f"Marinade eller rub — {mb}",
        ]
    )
    if tkey == "fish" and marinade["slug"] == "tikka":
        ingredients_lines.append(
            "Tip til **fisk**: brug **tynd yoghurtfilm** eller primært **krydderblanding** så yoghurt ikke blot simrer i bund af fadet de første minutter."
        )
    if tkey == "bake":
        ingredients_lines.append(
            "80–100 g revet mozzarella eller blandet ost til topping plus valgfrie skiver champignon eller peberfrugt på hver tortilla."
        )
    if marinade["slug"] == "parmesan-rosmarin" and tkey == "bake":
        ingredients_lines.append(
            "Ved parmesan/rosmarin som topping: drys den revne blanding **efter de første minutter** eller bland den i fyld så den ikke bruner alene for tidligt."
        )

    instructions_raw = build_instructions(tkey, temp, c_lo, c_hi)

    tips = [
        "Notér dine egne minutter første gang — watt og form på fad ændrer bruning og tid sidste minutter.",
        marinade["tips_extra"],
        "Overfyld ikke kurven: luft skal kunne cirkulere frit omkring ét lag.",
    ]

    faq_qa = [
        (
            "Lukker låget ikke over fad?",
            "Del portionen eller brug bredere lavt fad — eller steg på to hold uden overlap.",
        ),
        (
            "Skal marinade trække i køleskab først?",
            "15–30 minutter giver dybere smag ved kød, men er ikke et krav — du kan også **marinere** kort ved stuetemperatur.",
        ),
    ]

    keywords = [
        f"airfryer {marinade['slug']}",
        f"{human} airfryer",
        f"{category.lower()} airfryer",
        file_id.replace("-", " "),
    ]

    fm: list[str] = ["---"]
    fm.append(f"title: '{yaml_sq(title)}'")
    fm.append(f"description: '{yaml_sq(description)}'")
    fm.append(f"pubDate: {PUB}")
    fm.append(f"prepMinutes: {prep}")
    fm.append(f"cookMinutes: {cook_mid}")
    fm.extend(fm_line_scalar("servings", servings))
    fm.extend(fm_line_scalar("calories", calories))
    fm.extend(fm_line_scalar("category", category))
    fm.extend(fm_line_scalar("cuisine", cuisine_out))
    fm.append(f"temperatureC: {temp}")
    fm.append("featured: false")
    fm.append("keywords:")
    for kw in keywords:
        fm.append(f"  - {kw}")
    fm.extend(fm_block_scalar("intro", intro))
    fm.extend(fm_block_scalar("conclusion", conclusion))
    fm.append("ingredients:")
    for line in ingredients_lines:
        fm.append(f"  - text: '{yaml_sq(line)}'")
    fm.append("instructions:")
    for step in instructions_raw:
        fm.append(f"  - text: '{yaml_sq(step)}'")
    fm.append("tips:")
    for t in tips:
        fm.append(f"  - '{yaml_sq(t)}'")
    fm.append("faq:")
    for q, a in faq_qa:
        fm.append(f"  - question: '{yaml_sq(q)}'")
        fm.append(f"    answer: '{yaml_sq(a)}'")
    fm.append("---")

    md_tail = (
        "\n\n### Ét lag ad gangen\n\n"
        "Marinade og honning bruner hurtigere end nøgen kød — hold **ét lag** og ryst halvvejs for jævn farve.\n"
    )
    return "\n".join(fm) + md_tail


def main() -> None:
    existing = {p.stem for p in RECIPES.glob("*.md")}
    written = skipped = 0
    for base in BASES:
        for m in MARINADES:
            fid = f"airfryer-{m['slug']}-{base[0]}"
            if fid in existing:
                skipped += 1
                continue
            body = build_body(fid, m, base)
            (RECIPES / f"{fid}.md").write_text(body, encoding="utf-8")
            existing.add(fid)
            written += 1
    print(
        json.dumps(
            {
                "written": written,
                "skipped": skipped,
                "expected": len(BASES) * len(MARINADES),
            }
        )
    )


if __name__ == "__main__":
    main()
