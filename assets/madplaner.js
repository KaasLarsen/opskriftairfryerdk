/*! assets/madplaner.js – data registry for Madplan-hub (safe & non-destructive) */
(function () {
  // 1) Ensure global container
  const arr = Array.isArray(window.MADPLANS) ? window.MADPLANS : [];
  window.MADPLANS = arr;

  // 2) Helper: add/merge unique by URL
  const seen = new Set(arr.map(x => x.url || x.slug || ""));
  function add(item) {
    const key = item.url || item.slug || "";
    if (!key || seen.has(key)) return;
    // lightweight normalisation
    item.title = item.title || "";
    item.icon = item.icon || "star";
    item.tags = Array.isArray(item.tags) ? item.tags : [];
    window.MADPLANS.push(item);
    seen.add(key);
  }

  // 3) Known existing pages (du nævnte dem tidligere)
  const EXISTING = [
    { url: "/madplan/7-dages-airfryer-madplan.html", title: "7 Dages Airfryer Madplan", icon: "bolt", tags: ["hverdag"], kicker: "Nem & sund uge", published: "2025-11-26" },
    { url: "/madplan/madplan-budget.html",            title: "Budgetvenlig Madplan",     icon: "coin", tags: ["budget","hverdag"], kicker: "Billig mad · smarte indkøb", published: "2025-11-26" },
    { url: "/madplan/familievenlig-hverdag.html",     title: "Familievenlig Hverdag",    icon: "family", tags: ["hverdag","familie"], kicker: "Børnevenlige favoritter", published: "2025-11-26" },
    { url: "/madplan/kalorielet-airfryer.html",       title: "Kalorielet Airfryer Plan", icon: "scale", tags: ["vægttab"], kicker: "~1600–1800 kcal/dag", published: "2025-11-26" },
    { url: "/madplan/sund-ugeplan.html",              title: "Sund Madplan – Uge 1",     icon: "leaf", tags: ["vægttab","hverdag"], kicker: "Grønt + protein", published: "2025-11-26" },
    { url: "/madplan/airfryer-v%C3%A6gttab-kvinder.html", title: "Vægttab For Kvinder", icon: "female", tags: ["vægttab"], kicker: "Ca. 1200 kcal/dag", published: "2025-11-26" },

    { url: "/madplan/madplan-jul-airfryer.html",      title: "Julemad i Airfryer",       icon: "gift", tags: ["sæson","jul"], kicker: "Traditioner – nemt", published: "2025-11-27" },
    { url: "/madplan/sommermad-airfryer.html",        title: "Sommermadplan",            icon: "sun", tags: ["sæson","hverdag"], kicker: "Lette, friske retter", published: "2025-11-27" },
    { url: "/madplan/madplan-for-2.html",             title: "Madplan For 2",            icon: "bowl", tags: ["for2","hverdag"], kicker: "Minimal madspild", published: "2025-11-27" }
  ];

  // 4) Nye sider (batch-6)
  const BATCH6 = [
    { url: "/madplan/proteinfokus-lean.html",         title: "Proteinfokus – Lean (Airfryer)", icon: "drumstick", tags: ["hverdag","protein","vægttab"], kicker: "Højt protein · ~1800 kcal", published: "2025-11-28" },
    { url: "/madplan/hurtig-hverdag-uden-prep.html",  title: "Hurtig Hverdag – Uden Prep (20 min)", icon: "timer", tags: ["hverdag","hurtig"], kicker: "Klar på ~20 min", published: "2025-11-28" },
    { url: "/madplan/vegetar-airfryer-uge-2.html",    title: "Vegetar Airfryer – Ugeplan 2", icon: "falafel", tags: ["vegetar","vægttab","hverdag"], kicker: "Vegetarisk · mæthed", published: "2025-11-28" },
    { url: "/madplan/familie-bornevenlig.html",       title: "Familie – Børnevenlig Uge", icon: "family", tags: ["hverdag","familie"], kicker: "Milde smage", published: "2025-11-28" },
    { url: "/madplan/madplan-for-2-uge-2.html",       title: "Madplan For 2 – Uge 2",     icon: "bowl", tags: ["for2","hverdag"], kicker: "Til 2 personer", published: "2025-11-28" },
    { url: "/madplan/budget-400.html",                title: "Budget Uge – Under 400 kr", icon: "coin", tags: ["budget","hverdag"], kicker: "Billigt & planlagt", published: "2025-11-28" }
  ];

  // 5) Merge alt – uden at nulstille eksisterende
  [...EXISTING, ...BATCH6].forEach(add);

  // 6) Sorter pænt (nyeste først, derefter titel)
  window.MADPLANS.sort((a, b) => {
    const da = new Date(a.published || 0), db = new Date(b.published || 0);
    if (db - da) return db - da;
    return (a.title || "").localeCompare(b.title || "", "da");
  });

  // 7) Små helpers og signal til hub-renderen
  window.getMadplans = () => window.MADPLANS.slice(); // read-only copy
  window.MADPLANS_READY = true;
  try {
    document.dispatchEvent(new CustomEvent("madplans:ready", { detail: { count: window.MADPLANS.length } }));
  } catch (_) {}
})();
