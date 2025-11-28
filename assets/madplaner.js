// /assets/madplaner.js
// Registrér alle madplaner til hubben. Bruges af /assets/madplan-hub.js
// Ikoner er synk’et med partials/icons.html

window.MP = [
  // --- Hub-index (vises ikke som kort, men nyttigt til kontrol)
  { url: "/madplan/index.html", title: "Madplaner – Hub", desc: "Oversigt & søgning", icon: "calendar", tags: [] },

  // --- Store samlinger / uger
  { url: "/madplan/7-dages-airfryer-madplan.html", title: "7 Dages Airfryer Madplan", desc: "Komplet ugeplan med opskrifter", icon: "calendar", tags: ["hverdag"] },
  { url: "/madplan/sund-ugeplan.html",             title: "Sund Ugeplan",               desc: "Balanceret hverdag med grønt & protein", icon: "leaf", tags: ["hverdag"] },
  { url: "/madplan/kalorielet-airfryer.html",      title: "Kalorielet Airfryer Plan",    desc: "Let & mættende – perfekt til vægttab", icon: "leaf", tags: ["vægttab"] },
  { url: "/madplan/vegetar-airfryer-uge.html",     title: "Vegetar Airfryer – Ugeplan",  desc: "Grønt fokus uden kød", icon: "broccoli", tags: ["hverdag","vegetar"] },
  { url: "/madplan/vegetar-airfryer-uge-2.html",   title: "Vegetar Airfryer – Uge 2",    desc: "Endnu en grøn uge", icon: "broccoli", tags: ["hverdag","vegetar"] },

  // --- Vægttab – dagsplaner (1–7)
  { url: "/madplan/vaegttab-airfryer-dag1.html", title: "Vægttab: Dag 1", desc: "Ca. 1200–1400 kcal", icon: "leaf", tags: ["vægttab"] },
  { url: "/madplan/vaegttab-airfryer-dag2.html", title: "Vægttab: Dag 2", desc: "Ca. 1200–1400 kcal", icon: "leaf", tags: ["vægttab"] },
  { url: "/madplan/vaegttab-airfryer-dag3.html", title: "Vægttab: Dag 3", desc: "Ca. 1200–1400 kcal", icon: "leaf", tags: ["vægttab"] },
  { url: "/madplan/vaegttab-airfryer-dag4.html", title: "Vægttab: Dag 4", desc: "Ca. 1200–1400 kcal", icon: "leaf", tags: ["vægttab"] },
  { url: "/madplan/vaegttab-airfryer-dag5.html", title: "Vægttab: Dag 5", desc: "Ca. 1200–1400 kcal", icon: "leaf", tags: ["vægttab"] },
  { url: "/madplan/vaegttab-airfryer-dag6.html", title: "Vægttab: Dag 6", desc: "Ca. 1200–1400 kcal", icon: "leaf", tags: ["vægttab"] },
  { url: "/madplan/vaegttab-airfryer-dag7.html", title: "Vægttab: Dag 7", desc: "Ca. 1200–1400 kcal", icon: "leaf", tags: ["vægttab"] },

  // --- Vægttab – målgruppe
  // OBS: du har to filer (æ/ae). Vi registrerer begge, så uanset link-variant virker det.
  { url: "/madplan/airfryer-v%C3%A6gttab-kvinder.html", title: "Airfryer Vægttab – Kvinder", desc: "Struktur omkring 1200 kcal/dag", icon: "leaf", tags: ["vægttab"] },
  { url: "/madplan/airfryer-vaegttab-kvinder.html",     title: "Airfryer Vægttab – Kvinder", desc: "Struktur omkring 1200 kcal/dag", icon: "leaf", tags: ["vægttab"] },

  // --- Hverdag / hurtig / uden prep
  { url: "/madplan/hurtig-hverdag-20min.html",       title: "Hurtig Hverdag – 20 Min", desc: "Retter klar på 20 minutter", icon: "timer", tags: ["hverdag","hurtig"] },
  { url: "/madplan/hurtig-hverdag-uden-prep.html",   title: "Hurtig Hverdag – Uden Prep", desc: "Minimalt forarbejde, maks smag", icon: "sparkles", tags: ["hverdag","hurtig"] },
  { url: "/madplan/familievenlig-hverdag.html",      title: "Familievenlig Hverdag", desc: "Nem mad børn og voksne elsker", icon: "sparkles", tags: ["hverdag"] },

  // --- For 2 personer
  { url: "/madplan/madplan-for-2.html",          title: "Madplan For 2",         desc: "Små mængder, nul madspild", icon: "bowl", tags: ["for2","hverdag"] },
  { url: "/madplan/madplan-for-2-uge-2.html",    title: "Madplan For 2 – Uge 2", desc: "Endnu en uge for to", icon: "bowl", tags: ["for2","hverdag"] },

  // --- Budget
  { url: "/madplan/budget-400.html",      title: "Budget: 400 kr/uge", desc: "Billigt uden at gå på kompromis", icon: "cart", tags: ["hverdag","budget"] },
  { url: "/madplan/madplan-budget.html",  title: "Budgetvenlig Madplan", desc: "Spis godt for mindre", icon: "cart", tags: ["hverdag","budget"] },

  // --- Familie
  { url: "/madplan/familie-bornevenlig.html", title: "Familie – Børnevenlig", desc: "Blide smage & sikre favoritter", icon: "sparkles", tags: ["hverdag"] },

  // --- Sæson
  { url: "/madplan/sommermad-airfryer.html",  title: "Sommermad i Airfryer", desc: "Lette, friske retter", icon: "sparkles", tags: ["hverdag"] },
  { url: "/madplan/madplan-jul-airfryer.html",title: "Julemad i Airfryer",   desc: "Klassikere på nem måde", icon: "star", tags: ["hverdag"] },

  // --- Fokus: protein/lean
  { url: "/madplan/proteinfokus-airfryer.html", title: "Proteinfokus – Airfryer", desc: "Højt proteinindtag til hverdag", icon: "meatball", tags: ["hverdag"] },
  { url: "/madplan/proteinfokus-lean.html",     title: "Proteinfokus – Lean",     desc: "Slank linje med mæthed", icon: "meatball", tags: ["vægttab"] },

  // --- Diverse/legacy navne (fra listen)
  { url: "/madplan/familie-bornevenlig.html", title: "Familie – Børnevenlig", desc: "Nem, genkendelig mad", icon: "sparkles", tags: ["hverdag"] }
];

// Slut: window.MP
