/* /assets/recipes.js
   Central kilde til alle opskrifter på sitet.
   Bruges af render-recipes.js til at bygge “Seneste”, “Kategori” m.m.
*/
(function () {
  // Hjælp: let ikon pr. kategori (kan overskrives pr. opskrift)
  const ICON = {
    "Svinekød": "pig",
    "Kylling": "chicken",
    "Oksekød": "cow",
    "Fisk": "fish",
    "Grønt": "veg",
    "Tilbehør": "fries",
    "Dessert": "cake",
    "Hovedret": "airfryer"
  };

  // === BASE (dine første opskrifter) ===
  const base = [
    {
      title: "Flæskesteg I Airfryer – Sprød Svær Og Saftigt Kød",
      slug: "flaeskesteg-i-airfryer",
      date: "2025-09-06",
      categories: ["Kød","Svinekød","Hovedret"],
      icon: "pig",
      meta: "45–60 Min · Nemt"
    },
    {
      title: "Hasselbagte Kartofler I Airfryer – Sprøde Og Gyldne",
      slug: "hasselbagte-kartofler-i-airfryer",
      date: "2025-09-05",
      categories: ["Grønt","Tilbehør"],
      icon: "veg",
      meta: "30 Min · Tilbehør"
    },
    {
      title: "Hel Kylling I Airfryer – Sprødt Skind Og Saftig Kerne",
      slug: "hel-kylling-i-airfryer",
      date: "2025-09-08",
      categories: ["Kød","Kylling","Hovedret"],
      icon: "chicken",
      meta: "60–75 Min · Mellem"
    },
    {
      title: "Torskefileter I Airfryer – Saftige Og Smørmøre",
      slug: "torskefileter-i-airfryer",
      date: "2025-09-08",
      categories: ["Fisk","Hovedret","Hurtigt"],
      icon: "fish",
      meta: "10–12 Min · Nemt"
    },
    {
      title: "Pulled Pork I Airfryer – Mørt På En Eftermiddag",
      slug: "pulled-pork-i-airfryer",
      date: "2025-09-08",
      categories: ["Kød","Svinekød","Hovedret"],
      icon: "pig",
      meta: "90–120 Min · Mellem"
    },
    {
      title: "Bagt Kartoffel I Airfryer – Fluffy Indre, Sprød Skal",
      slug: "bagt-kartoffel-i-airfryer",
      date: "2025-09-08",
      categories: ["Grønt","Tilbehør","Basics"],
      icon: "veg",
      meta: "40–55 Min · Nemt"
    },
    {
      title: "Majskolber I Airfryer – Smørmøre Og Let Røgede",
      slug: "majskolber-i-airfryer",
      date: "2025-09-08",
      categories: ["Grønt","Tilbehør","Sommer"],
      icon: "veg",
      meta: "12–16 Min · Nemt"
    },
    {
      title: "Burger I Airfryer – Saftig Og Hurtig",
      slug: "burger-i-airfryer",
      date: "2025-09-09",
      categories: ["Oksekød","Hovedret"],
      icon: "cow",
      meta: "20–25 Min · Nemt"
    }
  ];

  // === NYE (batch 2 – 37 kyllinge-opskrifter fra ZIP’en) ===
  const batch2 = [
    ["Kyllingefrikadeller I Airfryer","kyllingefrikadeller-i-airfryer"],
    ["Kyllingeburger I Airfryer","kyllingeburger-i-airfryer"],
    ["Kyllingebryst Med Bacon I Airfryer","kyllingebryst-med-bacon-i-airfryer"],
    ["Kyllingelårfilet I Airfryer","kyllingelaarfilet-i-airfryer"],
    ["Kyllingevinger I Airfryer","kyllingevinger-i-airfryer"],
    ["Spicy Wings I Airfryer","spicy-wings-i-airfryer"],
    ["Hotwings I Airfryer","hotwings-i-airfryer"],
    ["Kyllingetern I Airfryer","kyllingetern-i-airfryer"],
    ["Crispy Chicken I Airfryer","crispy-chicken-i-airfryer"],
    ["Buttermilk Chicken I Airfryer","buttermilk-chicken-i-airfryer"],
    ["Honningmarineret Kylling I Airfryer","honningmarineret-kylling-i-airfryer"],
    ["Barbecue Kylling I Airfryer","barbecue-kylling-i-airfryer"],
    ["Indisk Kylling I Airfryer","indisk-kylling-i-airfryer"],
    ["Kyllingefilet Med Parmesan I Airfryer","kyllingefilet-med-parmesan-i-airfryer"],
    ["Tandoori Kylling I Airfryer","tandoori-kylling-i-airfryer"],
    ["Grillet Kylling I Airfryer","grillet-kylling-i-airfryer"],
    ["Kylling Med Soja I Airfryer","kylling-med-soja-i-airfryer"],
    ["Teriyaki Kylling I Airfryer","teriyaki-kylling-i-airfryer"],
    ["Citronkylling I Airfryer","citronkylling-i-airfryer"],
    ["Appelsinkylling I Airfryer","appelsinkylling-i-airfryer"],
    ["Lime Kylling I Airfryer","lime-kylling-i-airfryer"],
    ["Hvidløgs Kylling I Airfryer","hvidloegs-kylling-i-airfryer"],
    ["Butter Chicken I Airfryer","butter-chicken-i-airfryer"],
    ["Chili Kylling I Airfryer","chili-kylling-i-airfryer"],
    ["Asiatisk Kylling I Airfryer","asiatisk-kylling-i-airfryer"],
    ["Mexicansk Kylling I Airfryer","mexicansk-kylling-i-airfryer"],
    ["Kylling Med Oregano I Airfryer","kylling-med-oregano-i-airfryer"],
    ["Kylling Med Rosmarin I Airfryer","kylling-med-rosmarin-i-airfryer"],
    ["Kylling Med Timian I Airfryer","kylling-med-timian-i-airfryer"],
    ["Kyllingefilet Med Curry I Airfryer","kyllingefilet-med-curry-i-airfryer"],
    ["Kyllingefilet Med Paprika I Airfryer","kyllingefilet-med-paprika-i-airfryer"],
    ["Kyllingefilet Med Krydderurter I Airfryer","kyllingefilet-med-krydderurter-i-airfryer"],
    ["Kyllingefilet Med Sennep I Airfryer","kyllingefilet-med-sennep-i-airfryer"],
    ["Kyllingefilet Med Ingefær I Airfryer","kyllingefilet-med-ingefaer-i-airfryer"],
    ["Kyllingefilet Med Chili I Airfryer","kyllingefilet-med-chili-i-airfryer"],
    ["Kyllingefilet Med Honning I Airfryer","kyllingefilet-med-honning-i-airfryer"],
    ["Kyllingefilet Med Hvidløg I Airfryer","kyllingefilet-med-hvidloeg-i-airfryer"]
  ].map(([title, slug], idx) => ({
    title,
    slug,
    date: "2025-09-09",                 // samme “udgivelsesdato” for batch
    categories: ["Kød","Kylling","Hovedret"],
    icon: "chicken",
    meta: "20–40 Min · Nemt"
  }));

  // Samlet liste
  const RECIPES = [...base, ...batch2];

  // Fallback: hvis icon ikke er sat, prøv at finde et passende ud fra kategori
  RECIPES.forEach(r => {
    if (!r.icon && r.categories && r.categories.length) {
      for (const c of r.categories) {
        if (ICON[c]) { r.icon = ICON[c]; break; }
      }
    }
    if (!r.meta) r.meta = "Nemt";
  });

  // Eksportér globalt
  window.RECIPES = RECIPES;
  window.AFO = window.AFO || {};
})();
