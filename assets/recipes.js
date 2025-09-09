// assets/recipes.js
(function () {
  const AFO = (window.AFO = window.AFO || {});
  AFO.RECIPES = [];

  function add(r) {
    // normaliser felter og fallback til url
    r.url = r.url || `/opskrifter/${r.slug}.html`;
    // sikr konsistent meta-felt (brug hvis du allerede viser det i kort)
    if (!r.meta && r.minutes && r.difficulty) {
      r.meta = `${r.minutes} · ${r.difficulty}`;
    }
    AFO.RECIPES.push(r);
  }

  // ======== EKSISTERENDE (som i din liste) ========
  add({
    title: "Flæskesteg I Airfryer – Sprød Svær Og Saftigt Kød",
    slug: "flaeskesteg-i-airfryer",
    date: "2025-09-06",
    categories: ["Kød", "Svinekød", "Hovedret"],
    icon: "pig",
    meta: "45–60 Min · Nemt",
  });

  add({
    title: "Hasselbagte Kartofler I Airfryer – Sprøde Og Gyldne",
    slug: "hasselbagte-kartofler-i-airfryer",
    date: "2025-09-05",
    categories: ["Grønt", "Tilbehør"],
    icon: "leaf",
    meta: "30 Min · Tilbehør",
  });

  // ======== NYE (batch tidligere) – behold hvis filerne findes ========
  add({
    title: "Hel Kylling I Airfryer – Sprødt Skind Og Saftig Kerne",
    slug: "hel-kylling-i-airfryer",
    date: "2025-09-08",
    categories: ["Kød", "Kylling", "Hovedret"],
    icon: "chicken",
    meta: "60–75 Min · Mellem",
  });

  add({
    title: "Torskefileter I Airfryer – Saftige Og Smørmøre",
    slug: "torskefileter-i-airfryer",
    date: "2025-09-08",
    categories: ["Fisk", "Hovedret", "Hurtigt"],
    icon: "fish",
    meta: "10–12 Min · Nemt",
  });

  add({
    title: "Pulled Pork I Airfryer – Mørt På En Eftermiddag",
    slug: "pulled-pork-i-airfryer",
    date: "2025-09-08",
    categories: ["Kød", "Svinekød", "Hovedret"],
    icon: "pig",
    meta: "90–120 Min · Mellem",
  });

  add({
    title: "Bagt Kartoffel I Airfryer – Fluffy Indre, Sprød Skal",
    slug: "bagt-kartoffel-i-airfryer",
    date: "2025-09-08",
    categories: ["Grønt", "Tilbehør", "Basics"],
    icon: "leaf",
    meta: "40–55 Min · Nemt",
  });

  add({
    title: "Majskolber I Airfryer – Smørmøre Og Let Røgede",
    slug: "majskolber-i-airfryer",
    date: "2025-09-08",
    categories: ["Grønt", "Tilbehør", "Sommer"],
    icon: "leaf",
    meta: "12–16 Min · Nemt",
  });

  // ======== 5 POPULÆRE (NYE – som du lige har uploadet) ========
  add({
    title: "Burger I Airfryer – Saftig, Nem Og Hurtig",
    slug: "burger-i-airfryer",
    date: "2025-09-09",
    categories: ["Kød", "Oksekød", "Aftensmad"],
    icon: "steak",
    minutes: "20–25",
    difficulty: "Nemt",
  });

  add({
    title: "Laks I Airfryer – Nemt Og Sundt",
    slug: "laks-i-airfryer",
    date: "2025-09-09",
    categories: ["Fisk", "Hovedret"],
    icon: "fish",
    minutes: "10–14",
    difficulty: "Nemt",
  });

  add({
    title: "Pommes Frites I Airfryer – Sprøde Og Gyldne",
    slug: "pommes-frites-i-airfryer",
    date: "2025-09-09",
    categories: ["Tilbehør", "Kartofler"],
    icon: "fries",
    minutes: "18–25",
    difficulty: "Nemt",
  });

  add({
    title: "Kyllingefilet I Airfryer – Perfekt Til Hverdagen",
    slug: "kyllingefilet-i-airfryer",
    date: "2025-09-09",
    categories: ["Kød", "Kylling", "Hovedret"],
    icon: "chicken",
    minutes: "16–20",
    difficulty: "Nemt",
  });

  add({
    title: "Kanelsnegle I Airfryer – Bløde Og Lækre",
    slug: "kanelsnegle-i-airfryer",
    date: "2025-09-09",
    categories: ["Dessert", "Bagværk"],
    icon: "cake",
    minutes: "10–14",
    difficulty: "Nemt",
  });

  // ======== (VALGFRIT) Andre du har nævnt, hvis filerne findes ========
  // add({ title: "Kyllingespyd I Airfryer – Saftige", slug: "kyllingespyd-i-airfryer", date: "2025-09-07", categories:["Kød","Kylling"], icon:"chicken", minutes:"18–22", difficulty:"Nemt" });
  // add({ title: "Bøffer I Airfryer – Perfekt Stegt", slug: "boeffer-i-airfryer", date: "2025-09-07", categories:["Kød","Oksekød"], icon:"steak", minutes:"10–14", difficulty:"Nemt" });
  // add({ title: "Broccoli I Airfryer – Sprød Og Grøn", slug: "broccoli-i-airfryer", date: "2025-09-07", categories:["Grønt","Tilbehør"], icon:"leaf", minutes:"8–10", difficulty:"Nemt" });
  // add({ title: "Æbletærte I Airfryer – Nem Og Hurtig", slug: "aebletaerte-i-airfryer", date: "2025-09-07", categories:["Dessert","Bagværk"], icon:"cake", minutes:"12–16", difficulty:"Nemt" });
  // add({ title: "Fiskefrikadeller I Airfryer – Sprøde Yderst", slug: "fiskefrikadeller-i-airfryer", date: "2025-09-07", categories:["Fisk","Hovedret"], icon:"fish", minutes:"10–12", difficulty:"Nemt" });

  // Eksportér også som window.RECIPES for sikkerheds skyld
  window.RECIPES = AFO.RECIPES;
})();
