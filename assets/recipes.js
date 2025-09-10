<script>
/* =======================================================================
   /assets/recipes.js  —  Enkel, stabil opskrifts-indeksering
   - Base seed (manuelt)
   - Læser /sitemap.xml (urlset, ikke index)
   - Henter <h1> (+ fallback til <title>) og let kategorigæt
   - Eksporterer: AFO.ready, AFO.getAll, AFO.search, AFO.latest, AFO.byCategory
   ======================================================================= */
window.AFO = window.AFO || {};
(function () {
  // -------- 1) Base seed (ret/udvid frit) --------
  const base = [
    { title:"Flæskesteg I Airfryer – Sprød Svær Og Saftigt Kød", slug:"flaeskesteg-i-airfryer", date:"2025-09-06", categories:["Kød","Svinekød","Hovedret"], icon:"pig",   meta:"45–60 Min · Nemt" },
    { title:"Hasselbagte Kartofler I Airfryer – Sprøde Og Gyldne", slug:"hasselbagte-kartofler-i-airfryer", date:"2025-09-05", categories:["Grønt","Tilbehør"], icon:"leaf", meta:"30 Min · Tilbehør" },
    { title:"Hel Kylling I Airfryer – Sprødt Skind Og Saftig Kerne", slug:"hel-kylling-i-airfryer", date:"2025-09-08", categories:["Kød","Kylling","Hovedret"], icon:"chicken", meta:"60–75 Min · Mellem" },
    { title:"Torskefileter I Airfryer – Saftige Og Smørmøre", slug:"torskefileter-i-airfryer", date:"2025-09-08", categories:["Fisk","Hovedret"], icon:"fish", meta:"10–12 Min · Nemt" },
    { title:"Pulled Pork I Airfryer – Mørt På En Eftermiddag", slug:"pulled-pork-i-airfryer", date:"2025-09-08", categories:["Kød","Svinekød","Hovedret"], icon:"pig", meta:"90–120 Min · Mellem" },
    { title:"Bagt Kartoffel I Airfryer – Fluffy Indre, Sprød Skal", slug:"bagt-kartoffel-i-airfryer", date:"2025-09-08", categories:["Grønt","Tilbehør"], icon:"leaf", meta:"40–55 Min · Nemt" },
    { title:"Majskolber I Airfryer – Smørmøre Og Let Røgede", slug:"majskolber-i-airfryer", date:"2025-09-08", categories:["Grønt","Tilbehør","Sommer"], icon:"leaf", meta:"12–16 Min · Nemt" },
    { title:"Burger I Airfryer – Saftig Og Hurtig", slug:"burger-i-airfryer", date:"2025-09-09", categories:["Oksekød","Aftensmad"], icon:"burger", meta:"20–25 Min · Nemt" },
  ];

  // -------- 2) Hjælpere --------
  const bySlug = (arr) => Object.fromEntries(arr.map(r => [r.slug, r]));
  const map = bySlug(base);

  function sameOriginPath(u){
    try {
      const url = u.startsWith('http') ? new URL(u) : new URL(u, location.origin);
      // tving www/non-www over på current origin
      return url.pathname + url.search;
    } catch { return u; }
  }
  function slugFromPath(p){
    const m = (p||"").match(/\/opskrifter\/([^\/]+)\.html$/i);
    return m ? m[1] : null;
  }
  function capWords(s){ return (s||"").replace(/[^\s]+/g, w => w[0]?.toUpperCase()+w.slice(1)); }

  // forsigtigt gæt på ikon/kategori ud fra titel
  function guessMeta(title){
    const s = (title||"").toLowerCase();
    let icon = "book", cats = ["Opskrift"];
    if (/\bsvin|flæsk|kam|medister|bacon\b/.test(s)) { icon="pig"; cats=["Kød","Svinekød"]; }
    else if (/\bokse|oksekød|bøf|steak\b/.test(s))   { icon="cow"; cats=["Kød","Oksekød"]; }
    else if (/\bkylling|lår|bryst|spyd\b/.test(s))   { icon="chicken"; cats=["Kød","Kylling"]; }
    else if (/\bfisk|laks|torsk|ørred|sej\b/.test(s)){ icon="fish"; cats=["Fisk"]; }
    else if (/\bburger\b/.test(s))                   { icon="burger"; }
    else if (/\bkartoffel|grøntsag|salat|aubergine|gulerod|svampe|champignon\b/.test(s)) { icon="leaf"; cats=["Grønt"]; }
    else if (/\bdessert|kage|brownie|cheesecake\b/.test(s)) { icon="cake"; cats=["Dessert"]; }
    else if (/\btilbehør|pommes|fritter|chips\b/.test(s))   { icon="fries"; cats=["Tilbehør"]; }
    return { icon, categories: cats };
  }

  async function fetchSitemapPaths(){
    try {
      const r = await fetch('/sitemap.xml', { cache: 'no-store' });
      if (!r.ok) return [];
      const xml = await r.text();
      // kun urlset (ikke index) – simpelt parse
      const blocks = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(m=>m[1]);
      const locs = blocks.map(b => (b.match(/<loc>([^<]+)<\/loc>/)||[])[1]).filter(Boolean);
      const recPaths = locs
        .filter(loc => /\/opskrifter\/.+\.html$/i.test(loc))
        .map(sameOriginPath);
      return Array.from(new Set(recPaths)); // unik
    } catch {
      return [];
    }
  }

  async function scrapeMeta(path){
    try{
      const r = await fetch(path, { cache:'no-store' });
      if(!r.ok) return null;
      const html = await r.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const h1 = doc.querySelector('h1')?.textContent?.trim();
      const title = h1 || doc.title || "Airfryer Opskrift";
      const metaCats = doc.querySelector('meta[name="afo:categories"]')?.content;
      const metaIcon = doc.querySelector('meta[name="afo:icon"]')?.content;
      const metaMeta = doc.querySelector('meta[name="afo:meta"]')?.content;
      const guess = guessMeta(title);
      return {
        title: capWords(title),
        categories: metaCats ? metaCats.split(',').map(s=>s.trim()).filter(Boolean) : guess.categories,
        icon: metaIcon || guess.icon,
        meta: metaMeta || ""
      };
    }catch{ return null; }
  }

  // -------- 3) Build --------
  let _resolveReady; AFO.ready = new Promise(r => (_resolveReady = r));

  (async ()=>{
    const paths = await fetchSitemapPaths();         // kandidat-URL’er fra sitemap
    const jobs = [];
    for (const p of paths){
      const slug = slugFromPath(p);
      if (!slug || map[slug]) continue;              // spring eksisterende over
      jobs.push((async ()=>{
        const m = await scrapeMeta(p);
        if(!m) return;
        map[slug] = {
          title: m.title,
          slug,
          date: new Date().toISOString().slice(0,10), // ukendt → i det mindste “ny”
          categories: m.categories,
          icon: m.icon,
          meta: m.meta
        };
      })());
    }
    await Promise.all(jobs);

    // eksporter sorteret liste
    window.RECIPES = Object.values(map)
      .filter(x => x && x.slug)
      .sort((a,b) => (b.date||"").localeCompare(a.date||""));

    _resolveReady();
  })();

  // -------- 4) Public API --------
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
    const s = (cat||'').toLowerCase();
    return AFO.getAll().filter(r => (r.categories||[]).some(c => (c||"").toLowerCase() === s));
  };
})();
</script>
