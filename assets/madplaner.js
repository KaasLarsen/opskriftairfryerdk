/* === Register new meal plans (batch-6) === */
window.MADPLANS = window.MADPLANS || [];

const _ADD_MP = (item)=>{
  const exists = window.MADPLANS.some(x => (x.url||x.slug) === (item.url||item.slug));
  if (!exists) window.MADPLANS.push(item);
};

/* 1) Proteinfokus – Lean (Airfryer) */
_ADD_MP({
  url: "/madplan/proteinfokus-lean.html",
  title: "Proteinfokus – Lean (Airfryer)",
  icon: "drumstick",
  tags: ["hverdag","protein","vægttab"],
  kicker: "Højt protein · ~1800 kcal/dag",
  published: "2025-11-28"
});

/* 2) Hurtig Hverdag – Uden Prep (20 min) */
_ADD_MP({
  url: "/madplan/hurtig-hverdag-uden-prep.html",
  title: "Hurtig Hverdag – Uden Prep (20 min)",
  icon: "timer",
  tags: ["hverdag","hurtig"],
  kicker: "Klar på ~20 min · ingen forberedelse",
  published: "2025-11-28"
});

/* 3) Vegetar Airfryer – Ugeplan 2 */
_ADD_MP({
  url: "/madplan/vegetar-airfryer-uge-2.html",
  title: "Vegetar Airfryer – Ugeplan 2",
  icon: "falafel",
  tags: ["vegetar","vægttab","hverdag"],
  kicker: "Vegetarisk · mæthed & fuldkorn · ~1650 kcal",
  published: "2025-11-28"
});

/* 4) Familie – Børnevenlig Uge */
_ADD_MP({
  url: "/madplan/familie-bornevenlig.html",
  title: "Familie – Børnevenlig Uge",
  icon: "family",
  tags: ["hverdag","familie"],
  kicker: "Milde smage · bygg-selv-bowls",
  published: "2025-11-28"
});

/* 5) Madplan For 2 – Uge 2 */
_ADD_MP({
  url: "/madplan/madplan-for-2-uge-2.html",
  title: "Madplan For 2 – Uge 2",
  icon: "bowl",
  tags: ["for2","hverdag"],
  kicker: "Minimal madspild · for 2 personer",
  published: "2025-11-28"
});

/* 6) Budget Uge – Under 400 kr */
_ADD_MP({
  url: "/madplan/budget-400.html",
  title: "Budget Uge – Under 400 kr",
  icon: "coin",
  tags: ["budget","hverdag"],
  kicker: "Billige råvarer · sæson & frost",
  published: "2025-11-28"
});

/* Optional: sort newest first (hubben kan selv sortere, men dette hjælper) */
window.MADPLANS.sort((a,b)=>{
  const da = new Date(a.published||0), db = new Date(b.published||0);
  return db - da || (a.title||"").localeCompare(b.title||"", "da");
});
