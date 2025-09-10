<script>
/* =========================================================================
   /assets/recipes.js — Hent ALT fra sitemap (kun /opskrifter/*.html)
   - Læser /sitemap.xml via DOMParser (XML, ikke regex)
   - Normaliserer www/non-www til same-origin paths (undgår CORS)
   - Scraper <h1> / <title> for pæn titel, gætter ikon/kategorier
   - Eksporterer: AFO.ready, AFO.getAll(), AFO.search(), AFO.latest(), AFO.byCategory()
   ======================================================================= */
window.AFO = window.AFO || {};

(function () {
  // ---------- Helpers ----------
  function toPath(u){
    // Lav ALT til en same-origin path (/opskrifter/xxx.html)
    try{
      const url = u.startsWith('http') ? new URL(u) : new URL(u, location.origin);
      return url.pathname + url.search;
    }catch{
      return u;
    }
  }
  function slugFromPath(p){
    const m = (p||"").match(/\/opskrifter\/([^\/]+)\.html$/i);
    return m ? m[1] : null;
  }
  function capWords(s){
    return (s||"").replace(/[^\s]+/g, w => w.charAt(0).toUpperCase() + w.slice(1));
  }
  function guessMeta(title){
    const s = (title||"").toLowerCase();
    let icon = "book", cats = ["Opskrift"];
    if (/\bsvin|flæsk|kam|medister|bacon|ribben\b/.test(s)) { icon="pig"; cats=["Kød","Svinekød"]; }
    else if (/\bokse|oksekød|bøf|steak|hakket okse\b/.test(s)) { icon="cow"; cats=["Kød","Oksekød"]; }
    else if (/\bkylling|lår|bryst|spyd|vinger\b/.test(s))       { icon="chicken"; cats=["Kød","Kylling"]; }
    else if (/\bfisk|laks|torsk|sej|ørred|rejer\b/.test(s))     { icon="fish"; cats=["Fisk"]; }
    else if (/\bburger\b/.test(s))                              { icon="burger"; }
    else if (/\bkartoffel|grøntsag|salat|aubergine|gulerod|svampe|champignon\b/.test(s)) { icon="leaf"; cats=["Grønt"]; }
    else if (/\bdessert|kage|brownie|kanelsnegle|cheesecake\b/.test(s)) { icon="cake"; cats=["Dessert"]; }
    else if (/\btilbehør|pommes|fritter|chips|majskolbe\b/.test(s))     { icon="fries"; cats=["Tilbehør"]; }
    return { icon, categories: cats };
  }

  async function fetchText(url, timeoutMs=8000){
    const ctrl = new AbortController(); const t = setTimeout(()=>ctrl.abort(), timeoutMs);
    try{
      const r = await fetch(url, { cache:'no-store', signal: ctrl.signal });
      if(!r.ok) throw new Error('HTTP '+r.status);
      return await r.text();
    }finally{ clearTimeout(t); }
  }

  // ---------- 1) Læs sitemap.xml → paths ----------
  async function readSitemap(){
    try{
      const xmlTxt = await fetchText('/sitemap.xml', 8000);
      const doc = new DOMParser().parseFromString(xmlTxt, 'application/xml');

      // sikring mod parsefejl
      const parserErr = doc.getElementsByTagName('parsererror')[0];
      if (parserErr) throw new Error('XML parse error');

      const urlNodes = Array.from(doc.getElementsByTagName('url')); // håndterer namespaces fint i de fleste browsere
      const items = [];
      for (const node of urlNodes){
        const locNode = node.getElementsByTagName('loc')[0] || node.getElementsByTagNameNS('*','loc')[0];
        if (!locNode) continue;
        const loc = (locNode.textContent || '').trim();
        if (!/\/opskrifter\/[^\/]+\.html$/i.test(loc)) continue; // kun opskrift-sider
        const lastNode = node.getElementsByTagName('lastmod')[0] || node.getElementsByTagNameNS('*','lastmod')[0];
        items.push({
          path: toPath(loc),
          lastmod: (lastNode?.textContent || '').slice(0,10) // YYYY-MM-DD
        });
      }
      // unique på path
      const seen = new Set(); const out = [];
      for (const it of items){
        if (seen.has(it.path)) continue;
        seen.add(it.path); out.push(it);
      }
      return out;
    }catch(e){
      console.error('[AFO] Kunne ikke læse sitemap:', e);
      return []; // ingen fallback – præcis som du ønsker
    }
  }

  // ---------- 2) Hent meta fra hver opskrift ----------
  async function scrapeMeta(path){
    try{
      const html = await fetchText(path, 8000);
      const doc  = new DOMParser().parseFromString(html, 'text/html');
      const h1   = doc.querySelector('h1')?.textContent?.trim();
      const ttl  = capWords(h1 || doc.title || 'Airfryer Opskrift');
      const metaCats = doc.querySelector('meta[name="afo:categories"]')?.content;
      const metaIcon = doc.querySelector('meta[name="afo:icon"]')?.content;
      const metaMeta = doc.querySelector('meta[name="afo:meta"]')?.content;
      const g = guessMeta(ttl);
      return {
        title: ttl,
        categories: metaCats ? metaCats.split(',').map(s=>s.trim()).filter(Boolean) : g.categories,
        icon: metaIcon || g.icon,
        meta: metaMeta || ""
      };
    }catch(e){
      console.warn('[AFO] Meta-scrape fejlede for', path, e);
      return null;
    }
  }

  // ---------- 3) Build + eksport ----------
  let _resolve; AFO.ready = new Promise(r => (_resolve = r));

  (async ()=>{
    const sitemapItems = await readSitemap(); // [{path,lastmod}]
    const map = {};

    const jobs = sitemapItems.map(async (it) => {
      const slug = slugFromPath(it.path);
      if (!slug) return;
      const m = await scrapeMeta(it.path);
      if (!m) return;
      map[slug] = {
        title: m.title,
        slug,
        date: (it.lastmod || new Date().toISOString().slice(0,10)),
        categories: m.categories,
        icon: m.icon,
        meta: m.meta
      };
    });
    await Promise.all(jobs);

    window.RECIPES = Object.values(map)
      .sort((a,b)=> (b.date||"").localeCompare(a.date||""));

    _resolve();
  })();

  // ---------- 4) Public API ----------
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
