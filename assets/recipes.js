// /assets/recipes.js
// Manifest for alle opskrifter der skal vises under "Seneste" og "Kategorier".
// Felter: title, slug, date (YYYY-MM-DD), categories [..], icon (pig/chicken/fish/leaf/fries/cake/steak), meta.

window.RECIPES = [
  // ===== KENDTE / NUVÆRENDE (fra tidligere i projektet) =====
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
    icon: "leaf",
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
    icon: "leaf",
    meta: "40–55 Min · Nemt"
  },
  {
    title: "Majskolber I Airfryer – Smørmøre Og Let Røgede",
    slug: "majskolber-i-airfryer",
    date: "2025-09-08",
    categories: ["Grønt","Tilbehør","Sommer"],
    icon: "leaf",
    meta: "12–16 Min · Nemt"
  },
  {
    title: "Burger I Airfryer – Saftig Og Hurtig",
    slug: "burger-i-airfryer",
    date: "2025-09-09",
    categories: ["Oksekød","Hovedret","Aftensmad"],
    icon: "steak",
    meta: "20–25 Min · Nemt"
  },
  {
    title: "Kyllingelår I Airfryer – Saftige",
    slug: "kyllingelaar-i-airfryer",
    date: "2025-09-09",
    categories: ["Kød","Kylling","Hovedret"],
    icon: "chicken",
    meta: "22–28 Min · Nemt"
  },
  {
    title: "Kyllingespyd I Airfryer – Marinade Og Smag",
    slug: "kyllingespyd-i-airfryer",
    date: "2025-09-07",
    categories: ["Kød","Kylling","Hovedret"],
    icon: "chicken",
    meta: "12–16 Min · Nemt"
  },
  {
    title: "Grøntsagsfrikadeller I Airfryer",
    slug: "groentsagsfrikadeller-i-airfryer",
    date: "2025-09-07",
    categories: ["Vegetar","Grønt","Aftensmad"],
    icon: "leaf",
    meta: "20–25 Min · Nemt"
  },
  // Tilføj evt. flere eksisterende her hvis de mangler ↑

  // ===== 50 NYE (fra zip – dato sat til i dag for at komme øverst under “Seneste”) =====
  { title:"Andebryst I Airfryer – Sprødt Skind, Rosa Kerne", slug:"andebryst-i-airfryer", date:"2025-09-09", categories:["Kød","And","Hovedret"], icon:"steak", meta:"18–24 Min · Mellem" },
  { title:"Andelår Confit (Lyn) I Airfryer", slug:"andelaar-confit-i-airfryer", date:"2025-09-09", categories:["Kød","And","Hovedret"], icon:"steak", meta:"35–45 Min · Mellem" },
  { title:"Kalkunbryst I Airfryer – Saftig Hver Gang", slug:"kalkunbryst-i-airfryer", date:"2025-09-09", categories:["Kød","Kalkun","Hovedret"], icon:"chicken", meta:"28–40 Min · Mellem" },
  { title:"Kalkunfrikadeller I Airfryer – Magre Og Møre", slug:"kalkunfrikadeller-i-airfryer", date:"2025-09-09", categories:["Kød","Kalkun","Aftensmad"], icon:"chicken", meta:"10–12 Min · Nemt" },
  { title:"Kylling Parmigiana I Airfryer", slug:"kylling-parmigiana-i-airfryer", date:"2025-09-09", categories:["Kylling","Hovedret","Italiensk"], icon:"chicken", meta:"14–18 Min · Mellem" },
  { title:"Kylling Tikka Bites I Airfryer", slug:"kylling-tikka-i-airfryer", date:"2025-09-09", categories:["Kylling","Krydret","Hovedret"], icon:"chicken", meta:"10–14 Min · Nemt" },
  { title:"Crispy Kyllingesandwich (Airfryer Filet)", slug:"crispy-kyllingesandwich-i-airfryer", date:"2025-09-09", categories:["Kylling","Sandwich"], icon:"chicken", meta:"12–16 Min · Nemt" },
  { title:"Kyllingefajitas I Airfryer – Paprika & Lime", slug:"kyllingefajitas-i-airfryer", date:"2025-09-09", categories:["Kylling","Tex-Mex"], icon:"chicken", meta:"12–15 Min · Nemt" },
  { title:"Kyllinge Souvlaki På Spyd", slug:"kyllinge-souvlaki-i-airfryer", date:"2025-09-09", categories:["Kylling","Græsk"], icon:"chicken", meta:"10–14 Min · Nemt" },
  { title:"Porchetta-Rul Med Sprød Svær", slug:"porchetta-i-airfryer", date:"2025-09-09", categories:["Kød","Svinekød","Hovedret"], icon:"pig", meta:"45–70 Min · Mellem" },
  { title:"Skinkeschnitzel I Airfryer – Citron & Kapers", slug:"skinkeschnitzel-i-airfryer", date:"2025-09-09", categories:["Svinekød","Hovedret"], icon:"pig", meta:"10–12 Min · Nemt" },
  { title:"Char Siu Svin (Kinesisk BBQ) I Airfryer", slug:"char-siu-svin-i-airfryer", date:"2025-09-09", categories:["Svinekød","Asiatisk"], icon:"pig", meta:"22–28 Min · Mellem" },
  { title:"Flæskesvær Chips – Ultracrunch", slug:"flaeskesvaer-chips-airfryer", date:"2025-09-09", categories:["Svinekød","Snack"], icon:"pig", meta:"10–15 Min · Nemt" },
  { title:"Pølsehorn (Airfryer Version)", slug:"poelsehorn-i-airfryer", date:"2025-09-09", categories:["Bagværk","Snack"], icon:"cake", meta:"8–12 Min · Nemt" },
  { title:"Oksekøds-Empanadas I Airfryer", slug:"empanadas-okse-i-airfryer", date:"2025-09-09", categories:["Oksekød","Snack"], icon:"steak", meta:"10–14 Min · Mellem" },
  { title:"Lammekoteletter Med Rosmarin", slug:"lammekoteletter-i-airfryer", date:"2025-09-09", categories:["Lam","Hovedret"], icon:"steak", meta:"8–12 Min · Nemt" },
  { title:"Lammekøfte På Spyd (Krydret)", slug:"lamme-koefte-i-airfryer", date:"2025-09-09", categories:["Lam","Mellemøsten"], icon:"steak", meta:"10–12 Min · Nemt" },
  { title:"Oksekød Quesadillas (Sprød Skorpe)", slug:"quesadillas-okse-i-airfryer", date:"2025-09-09", categories:["Oksekød","Tex-Mex"], icon:"steak", meta:"6–9 Min · Nemt" },
  { title:"Philly Cheesesteak Sandwich (Airfryer)", slug:"philly-cheesesteak-i-airfryer", date:"2025-09-09", categories:["Oksekød","Sandwich"], icon:"steak", meta:"8–10 Min · Nemt" },
  { title:"Meatloaf Minis I Airfryer (Kødfars I Forme)", slug:"meatloaf-minis-i-airfryer", date:"2025-09-09", categories:["Oksekød","Aftensmad"], icon:"steak", meta:"14–18 Min · Nemt" },
  { title:"Kammuslinger I Airfryer – Smør & Citron", slug:"kammuslinger-i-airfryer", date:"2025-09-09", categories:["Fisk","Skaldyr","Forret"], icon:"fish", meta:"6–9 Min · Nemt" },
  { title:"Sejfilet Med Panko – Sprød Panering", slug:"sejfilet-i-airfryer", date:"2025-09-09", categories:["Fisk","Hovedret"], icon:"fish", meta:"10–12 Min · Nemt" },
  { title:"Rødspætte Paneret (Med Remoulade)", slug:"roedspaette-i-airfryer", date:"2025-09-09", categories:["Fisk","Hovedret"], icon:"fish", meta:"8–12 Min · Nemt" },
  { title:"Tunsteaks Med Sesam & Soja", slug:"tunsteaks-i-airfryer", date:"2025-09-09", categories:["Fisk","Hovedret"], icon:"fish", meta:"6–9 Min · Nemt" },
  { title:"Blæksprutteringe (Calamari) – Panko & Aioli", slug:"calamari-i-airfryer", date:"2025-09-09", categories:["Skaldyr","Snack"], icon:"fish", meta:"6–8 Min · Nemt" },
  { title:"Halloumi Fries – Saltet & Sprød", slug:"halloumi-fries-i-airfryer", date:"2025-09-09", categories:["Vegetar","Snack"], icon:"leaf", meta:"8–10 Min · Nemt" },
  { title:"Bagt Feta Med Tomater & Oliven", slug:"bagt-feta-i-airfryer", date:"2025-09-09", categories:["Vegetar","Forret"], icon:"leaf", meta:"10–12 Min · Nemt" },
  { title:"Fyldte Portobello Med Spinat & Feta", slug:"portobello-fyldte-i-airfryer", date:"2025-09-09", categories:["Vegetar","Aftensmad"], icon:"leaf", meta:"12–15 Min · Nemt" },
  { title:"Aubergine Parmigiana (Airfryer-Lag)", slug:"aubergine-parmigiana-i-airfryer", date:"2025-09-09", categories:["Vegetar","Hovedret","Italiensk"], icon:"leaf", meta:"18–25 Min · Mellem" },
  { title:"Sprøde Tofu Nuggets – ‘Kyllinge’ Crunch", slug:"tofu-nuggets-i-airfryer", date:"2025-09-09", categories:["Vegetar","Vegan","Snack"], icon:"leaf", meta:"12–16 Min · Nemt" },
  { title:"Tempeh Bites BBQ – Røget Glasur", slug:"tempeh-bites-bbq-i-airfryer", date:"2025-09-09", categories:["Vegetar","Vegan","Snack"], icon:"leaf", meta:"10–14 Min · Nemt" },
  { title:"Grønkålschips Med Havsalt", slug:"groenkaalschips-i-airfryer", date:"2025-09-09", categories:["Grønt","Snack"], icon:"leaf", meta:"6–8 Min · Nemt" },
  { title:"Gulerodsfritter Med Dild-Dip", slug:"gulerodsfritter-i-airfryer", date:"2025-09-09", categories:["Grønt","Tilbehør"], icon:"leaf", meta:"12–16 Min · Nemt" },
  { title:"Rødbedebåde Med Timian & Honning", slug:"roedbedeboede-i-airfryer", date:"2025-09-09", categories:["Grønt","Tilbehør"], icon:"leaf", meta:"18–24 Min · Nemt" },
  { title:"Broccolini Med Citron & Parmesan", slug:"broccolini-i-airfryer", date:"2025-09-09", categories:["Grønt","Tilbehør"], icon:"leaf", meta:"7–9 Min · Nemt" },
  { title:"Ratatouille-Bakke (Skiver I Lag)", slug:"ratatouille-i-airfryer", date:"2025-09-09", categories:["Grønt","Aftensmad"], icon:"leaf", meta:"16–22 Min · Mellem" },
  { title:"Fyldte Peberfrugter (Mexi-Ris & Bønner)", slug:"fyldte-peberfrugter-i-airfryer", date:"2025-09-09", categories:["Vegetar","Aftensmad"], icon:"leaf", meta:"18–24 Min · Mellem" },
  { title:"Mac ’N’ Cheese Bites (Sprød Skal)", slug:"mac-and-cheese-bites-i-airfryer", date:"2025-09-09", categories:["Tilbehør","Snack"], icon:"fries", meta:"8–12 Min · Nemt" },
  { title:"Jalapeño Poppers Med Ost", slug:"jalapeno-poppers-i-airfryer", date:"2025-09-09", categories:["Snack","Tex-Mex"], icon:"fries", meta:"7–10 Min · Nemt" },
  { title:"Arancini (Risotto-Kugler) I Airfryer", slug:"arancini-i-airfryer", date:"2025-09-09", categories:["Snack","Italiensk"], icon:"fries", meta:"10–14 Min · Mellem" },
  { title:"Donuts (Bagte) Med Glasur", slug:"donuts-i-airfryer", date:"2025-09-09", categories:["Dessert","Bagværk"], icon:"cake", meta:"6–9 Min · Nemt" },
  { title:"Churros Med Kanel & Sukker", slug:"churros-i-airfryer", date:"2025-09-09", categories:["Dessert","Snack"], icon:"cake", meta:"8–10 Min · Nemt" },
  { title:"Brownie Bites I Forme", slug:"brownie-bites-i-airfryer", date:"2025-09-09", categories:["Dessert","Bagværk"], icon:"cake", meta:"10–12 Min · Nemt" },
  { title:"Chocolate Chip Cookies (Tykkere & Seje)", slug:"cookies-i-airfryer", date:"2025-09-09", categories:["Dessert","Bagværk"], icon:"cake", meta:"6–8 Min · Nemt" },
  { title:"Kanelsnegle (Store) – Snurre-Stil", slug:"kanelsnegle-i-airfryer", date:"2025-09-09", categories:["Dessert","Bagværk"], icon:"cake", meta:"10–14 Min · Mellem" },
  { title:"Scones – Cheddar & Urter (Savory)", slug:"scones-salte-i-airfryer", date:"2025-09-09", categories:["Bagværk","Brunch"], icon:"cake", meta:"10–12 Min · Nemt" },
  { title:"Morgenboller (Lynhævede) I Airfryer", slug:"morgenboller-i-airfryer", date:"2025-09-09", categories:["Bagværk","Morgenmad"], icon:"cake", meta:"12–16 Min · Nemt" },
  { title:"Æbleskiver I Airfryer (Form)", slug:"aebleskiver-i-airfryer", date:"2025-09-09", categories:["Dessert","Jul"], icon:"cake", meta:"7–10 Min · Nemt" },
  { title:"Æggemuffins Med Bacon & Ost", slug:"aeggmuffins-i-airfryer", date:"2025-09-09", categories:["Morgenmad","Protein"], icon:"cake", meta:"10–12 Min · Nemt" },
  { title:"Forårsruller (Hjemmelavede Eller Frosne)", slug:"foraarsruller-i-airfryer", date:"2025-09-09", categories:["Asiatisk","Snack"], icon:"leaf", meta:"10–14 Min · Nemt" }
];

// (Valgfrit) Hvis du vil sikre sortering på ‘Seneste’:
// Render-siden sorterer i forvejen efter date desc, men hvis ikke, så:
// window.RECIPES.sort((a,b)=> (a.date<b.date?1:-1));
