<script>
/* =======================================================================
   /assets/recipes.js  —  Auto-indexer opskrifter fra /sitemap.xml
   - Normaliserer host (undgår CORS på www vs. non-www)
   - Eksporterer AFO.ready (Promise)
   ======================================================================= */
window.AFO = window.AFO || {};
(function () {
  // -------- 1) Basis (manuelt seed) --------
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
      icon: "leaf",
      meta: "30 Min · Tilbehør"
    },
    { title:"Hel Kylling I Airfryer – Sprødt Skind Og Saftig Kerne", slug:"hel-kylling-i-airfryer", date:"2025-09-08", categories:["Kød","Kylling","Hovedret"], icon:"chicken", meta:"60–75 Min · Mellem" },
    { title:"Torskefileter I Airfryer – Saftige Og Smørmøre",        slug:"torskefileter-i-airfryer", date:"2025-09-08", categories:["Fisk","Hovedret"], icon:"fish", meta:"10–12 Min · Nemt" },
    { title:"Pulled Pork I Airfryer – Mørt På En Eftermiddag",      slug:"pulled-pork-i-airfryer", date:"2025-09-08", categories:["Kød","Svinekød","Hovedret"], icon:"pig", meta:"90–120 Min · Mellem" },
    { title:"Bagt Kartoffel I Airfryer – Fluffy Indre, Sprød Skal", slug:"bagt-kartoffel-i-airfryer", date:"2025-09-08", categories:["Grønt","Tilbehør"], icon:"leaf", meta:"40–55 Min · Nemt" },
    { title:"Majskolber I Airfryer – Smørmøre Og Let Røgede",       slug:"majskolber-i-airfryer", date:"2025-09-08", categories:["Grønt","Tilbehør","Sommer"], icon:"leaf", meta:"12–16 Min · Nemt" },
    { title:"Burger I Airfryer – Saftig Og Hurtig", slug:"burger-i-airfryer", date:"2025-09-09", categories:["Oksekød","Aftensmad"], icon:"burger", meta:"20–25 Min · Nemt" },
  ];

  // -------- 2) Hjælpere --------
  const bySlug = (arr) => Object.fromEntries(arr.map(r => [r.slug, r]));
  const map = bySlug(base);

  function slugFromUrlish(u) {
    // accepter både absolutte URLs og paths – returnér slug eller null
    try {
      const url = u.startsWith('http') ? new URL(u) : new URL(u, location.origin);
      const m = url.pathname.match(/\/opskrifter\/([^\/]+)\.html$/i);
      return m ? m[1] : null;
    } catch { return null; }
  }

  function toSameOriginPath(u) {
    // returner altid kun pathname+search (samme origin)
    try {
      const url = u.startsWith('http') ? new URL(u) : new URL(u, location.origin);
      return url.pathname + url.search;
    } catch { return u; }
  }

  function capitalizeWords(str){
    return (str||"").replace(/[^\s]+/g, w => w.charAt(0).toUpperCase() + w.slice(1));
  }

  function guessFromTitle(t) {
    const s = (t||"").toLowerCase();
    let icon = "book";
    if (/\bflæsk|svin|ribbensteg|kam|medister|bacon\b/.test(s)) icon = "pig";
    else if (/\bokse|oksekød|bøf|steak|hakket okse\b/.test(s))   icon = "cow";
    else if (/\bkylling|chicken|lår|bryst|spyd\b/.test(s))       icon = "chicken";
    else if (/\bfisk|laks|torsk|sej|ørred\b/.test(s))            icon = "fish";
    else if (/\band\b/.test(s))                                  icon = "duck";
    else if (/\bkalkun\b/.test(s))                               icon = "turkey";
    else if (/\bburger\b/.test(s))                               icon = "burger";
    else if (/\bkartoffel|kartofler|grøntsag|salat|aubergine|gulerod|svampe|champignon|veg\b/.test(s)) icon = "leaf";
    else if (/\bkage|dessert|cupcake|brownie|cheesecake\b/.test(s)) icon = "cake";
    else if (/\bpommes|fritter|tilbehør|chips\b/.test(s))        icon = "fries";

    let cats = ["Opskrift"];
    if (/\bsvin|flæsk|ribben|kam|medister\b/.test(s)) cats = ["Kød","Svinekød"];
    else if (/\bokse|bøf\b/.test(s))                  cats = ["Kød","Oksekød"];
    else if (/\bkylling\b/.test(s))                   cats = ["Kød","Kylling"];
    else if (/\bfisk|laks|torsk\b/.test(s))           cats = ["Fisk"];
    else if (/\band\b/.test(s))                       cats = ["Kød","Fjerkræ","And"];
    else if (/\bkalkun\b/.test(s))                    cats = ["Kød","Fjerkræ","Kalkun"];
    else if (/\bkartoffel|grøntsag|salat|aubergine|gulerod|svampe|champignon|veg\b/.test(s)) cats = ["Grønt"];
    else if (/\bdessert|kage|brownie\b/.test(s))      cats = ["Dessert"];
    else if (/\btilbehør|fritter|chips\b/.test(s))    cats = ["Tilbehør"];
    return { icon, categories: cats };
  }

  // -------- 3) Hent sitemap og lav kandidat-liste --------
  async function fetchSitemapUrls() {
    try {
      const res = await fetch('/sitemap.xml', { cache: 'no-store' });
      if (!res.ok) return [];
      const xml = await res.text();

      // parse <url> blokke med loc + (evt) lastmod
      const blocks = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(m => m[1]);
      const out = [];
      for (const b of blocks) {
        const loc = (b.match(/<loc>([^<]+)<\/loc>/) || [])[1];
        if (!loc) continue;
        if (!/\/opskrifter\/.+\.html$/i.test(loc)) continue;

        const last = (b.match(/<lastmod>([^<]+)<\/lastmod>/) || [])[1] || "";
        const path = toSameOriginPath(loc); // **kritisk**: gør same-origin
        out.push({ path, url: path, lastmod: last });
      }
      return out;
    } catch {
      return [];
    }
  }

  // -------- 4) Scrape meta fra HTML (same-origin) --------
  async function scrapeRecipeMeta(path) {
    try {
      const res = await fetch(path, { cache: 'no-store' });
      if (!res.ok) return null;
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const h1 = doc.querySelector('h1')?.textContent?.trim();
      const title = h1 || doc.title?.trim() || "Airfryer Opskrift";
      const desc  = doc.querySelector('meta[name="description"]')?.getAttribute('content') || "";
      const metaCats = doc.querySelector('meta[name="afo:categories"]')?.getAttribute('content');
      const metaIcon = doc.querySelector('meta[name="afo:icon"]')?.getAttribute('content');
      const metaMeta = doc.querySelector('meta[name="afo:meta"]')?.getAttribute('content');

      const guessed = guessFromTitle(title);
      return {
        title: capitalizeWords(title),
        description: desc,
        categories: metaCats ? metaCats.split(',').map(s => s.trim()).filter(Boolean) : guessed.categories,
        icon: metaIcon || guessed.icon,
        meta: metaMeta || ""
      };
    } catch { return null; }
  }

  // -------- 5) Byg katalog --------
  async function buildAll() {
    const sitemap = await fetchSitemapUrls();

    // valgfri whitelist (slugs) – hvis du vil tvinge ekstra med
    let extra = [];
    try {
      const r = await fetch('/assets/recipes-extra.json', { cache: 'no-store' });
      if (r.ok) extra = await r.json(); // ["slug1","slug2"]
    } catch {}

    const candidatePaths = new Set(
      sitemap.map(x => x.path).concat(
        extra.map(sl => `/opskrifter/${sl}.html`)
      )
    );

    // Scrape kandidater vi ikke har i base
    const jobs = [];
    for (const p of candidatePaths) {
      const slug = slugFromUrlish(p);
      if (!slug || map[slug]) continue;
      jobs.push((async () => {
        const meta = await scrapeRecipeMeta(p);
        if (!meta) return;
        const last = sitemap.find(x => x.path === p)?.lastmod || new Date().toISOString();
        map[slug] = {
          title: meta.title,
          slug,
          date: last.slice(0,10),
          categories: meta.categories,
          icon: meta.icon,
          meta: meta.meta || ""
        };
      })());
    }
    await Promise.all(jobs);

    // Eksponer sorteret liste (nyeste først)
    window.RECIPES = Object.values(map)
      .filter(r => r && r.slug)
      .sort((a,b) => (b.date||"").localeCompare(a.date||""));
  }

  // -------- 6) Public API + Ready --------
  let _resolveReady; AFO.ready = new Promise(r => (_resolveReady = r));
  AFO.getAll = () => (window.RECIPES || []);
  AFO.search = (q) => {
    const s = (q||"").toLowerCase();
    if (!s) return AFO.getAll();
    return AFO.getAll().filter(r =>
      (r.title||"").toLowerCase().includes(s) ||
      (r.slug||"").includes(s) ||
      (r.categories||[]).some(c => (c||"").toLowerCase().includes(s))
    );
  };
  AFO.latest = (n=6) => AFO.getAll().slice(0, n);
  AFO.byCategory = (cat) => {
    if (!cat) return AFO.getAll();
    const s = cat.toLowerCase();
    return AFO.getAll().filter(r => (r.categories||[]).some(c => (c||"").toLowerCase() === s));
  };

  // -------- 7) Boot --------
  (async ()=>{ await buildAll(); _resolveReady(); })();

})();
</script>
