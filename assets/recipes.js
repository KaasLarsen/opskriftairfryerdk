<script>
/* =======================================================================
   /assets/recipes.js  —  Auto-indexer alle opskrifter fra /sitemap.xml
   ======================================================================= */

window.AFO = window.AFO || {};
(function () {
  // ---- 1) Basis “database” (bevar dem du har i forvejen / tilføj gerne flere) ----
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

    // Eksempler på nyere du nævnte – tilpas/udvid frit:
    { title:"Hel Kylling I Airfryer – Sprødt Skind Og Saftig Kerne", slug:"hel-kylling-i-airfryer", date:"2025-09-08", categories:["Kød","Kylling","Hovedret"], icon:"chicken", meta:"60–75 Min · Mellem" },
    { title:"Torskefileter I Airfryer – Saftige Og Smørmøre",        slug:"torskefileter-i-airfryer", date:"2025-09-08", categories:["Fisk","Hovedret"], icon:"fish", meta:"10–12 Min · Nemt" },
    { title:"Pulled Pork I Airfryer – Mørt På En Eftermiddag",      slug:"pulled-pork-i-airfryer", date:"2025-09-08", categories:["Kød","Svinekød","Hovedret"], icon:"pig", meta:"90–120 Min · Mellem" },
    { title:"Bagt Kartoffel I Airfryer – Fluffy Indre, Sprød Skal", slug:"bagt-kartoffel-i-airfryer", date:"2025-09-08", categories:["Grønt","Tilbehør"], icon:"leaf", meta:"40–55 Min · Nemt" },
    { title:"Majskolber I Airfryer – Smørmøre Og Let Røgede",       slug:"majskolber-i-airfryer", date:"2025-09-08", categories:["Grønt","Tilbehør","Sommer"], icon:"leaf", meta:"12–16 Min · Nemt" },

    // Burger (du har HTML-filen)
    { title:"Burger I Airfryer – Saftig Og Hurtig", slug:"burger-i-airfryer", date:"2025-09-09", categories:["Oksekød","Aftensmad"], icon:"burger", meta:"20–25 Min · Nemt" },
  ];

  // ---- 2) Ikon- og kategori-heuristik (så nye sider får fornuftige defaults) ----
  function guessFromTitle(t) {
    const s = (t||"").toLowerCase();

    // ikon
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

    // kategorier (meget forsigtig default)
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

  // ---- 3) Værktøjer ----
  const bySlug = (arr) => Object.fromEntries(arr.map(r => [r.slug, r]));
  function slugFromUrl(url) {
    const m = url.match(/\/opskrifter\/([^\/]+)\.html$/i);
    return m ? m[1] : null;
  }
  function capitalizeWords(str){
    return (str||"").replace(/[^\s]+/g, w => w.charAt(0).toUpperCase() + w.slice(1));
  }

  // ---- 4) Hent /sitemap.xml og suppler med nye sider ----
  async function fetchSitemapUrls() {
    try {
      const res = await fetch('/sitemap.xml', { cache: 'no-store' });
      if (!res.ok) return [];
      const xml = await res.text();
      const urls = [];
      // simple XML parsing
      const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
      const lastmods = {};
      [...xml.matchAll(/<url>[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?<lastmod>([^<]+)<\/lastmod>[\s\S]*?<\/url>/g)]
        .forEach((m) => { lastmods[m[1]] = m[2]; });

      for (const u of locs) {
        if (u.includes('/opskrifter/') && u.endsWith('.html')) {
          urls.push({ url: u, lastmod: lastmods[u] || null });
        }
      }
      return urls;
    } catch { return []; }
  }

  async function scrapeRecipeMeta(url) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) return null;
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const h1 = doc.querySelector('h1')?.textContent?.trim();
      const title = h1 || doc.title?.trim() || "Airfryer Opskrift";
      const desc = doc.querySelector('meta[name="description"]')?.getAttribute('content') || "";
      const metaCats = doc.querySelector('meta[name="afo:categories"]')?.getAttribute('content');
      const cats = metaCats ? metaCats.split(',').map(s => s.trim()).filter(Boolean) : guessFromTitle(title).categories;
      const icon = doc.querySelector('meta[name="afo:icon"]')?.getAttribute('content') || guessFromTitle(title).icon;
      return { title: capitalizeWords(title), description: desc, categories: cats, icon };
    } catch { return null; }
  }

  // ---- 5) Saml alt: base + sitemap (+ evt. /assets/recipes-extra.json) ----
  async function buildAll() {
    const map = bySlug(base);
    const sitemap = await fetchSitemapUrls();

    // valgfri ekstra manifest (array af slugs) — ignorer hvis ikke findes
    let extra = [];
    try {
      const r = await fetch('/assets/recipes-extra.json', { cache: 'no-store' });
      if (r.ok) extra = await r.json(); // ["slug-1","slug-2",...]
    } catch {}

    // lav samlet liste af unikke candidate URLs
    const candidateSet = new Set(
      sitemap.map(x => x.url).concat(
        extra.map(sl => `${location.origin}/opskrifter/${sl}.html`)
      )
    );

    // fetch meta for kandidater, hvis vi ikke allerede har dem
    const promises = [];
    for (const u of candidateSet) {
      const slug = slugFromUrl(u);
      if (!slug || map[slug]) continue;
      promises.push((async () => {
        const scraped = await scrapeRecipeMeta(u);
        if (!scraped) return;
        const dateIso = (sitemap.find(x => x.url === u)?.lastmod || new Date().toISOString().slice(0,10));
        map[slug] = {
          title: scraped.title,
          slug,
          date: dateIso.slice(0,10),
          categories: scraped.categories,
          icon: scraped.icon,
          meta: "" // ukendt — kan udfyldes fremover via <meta name="afo:meta">
        };
      })());
    }
    await Promise.all(promises);

    // Eksponer samlet liste
    const all = Object.values(map)
      .filter(r => r && r.slug)
      .sort((a,b) => (b.date||"").localeCompare(a.date||""));
    window.RECIPES = all;
  }

  // ---- 6) Offentlige helper-metoder (bruges af render-* filer) ----
  AFO.getAll = () => (window.RECIPES || []);
  AFO.search = (q) => {
    const s = (q||"").toLowerCase();
    if (!s) return AFO.getAll();
    return AFO.getAll().filter(r =>
      (r.title||"").toLowerCase().includes(s) ||
      (r.categories||[]).some(c => (c||"").toLowerCase().includes(s)) ||
      (r.slug||"").includes(s)
    );
  };
  AFO.latest = (n=6) => AFO.getAll().slice(0, n);
  AFO.byCategory = (cat) => {
    if (!cat) return AFO.getAll();
    const s = cat.toLowerCase();
    return AFO.getAll().filter(r => (r.categories||[]).some(c => c.toLowerCase() === s));
  };

  // ---- 7) Boot: byg hele kataloget nu ----
  buildAll();

})();
</script>
