/* =========================================================================
   /assets/recipes.js — Hent ALT fra sitemap (index + urlset), robust & NS-safe
   - Finder opskrifter via sitemap.xml / sitemap_index.xml (+ direkte fallback)
   - Scraper titel + simple meta fra hver opskriftsside
   - Udgiver window.RECIPES (nyeste først) + AFO API (ready/getAll/search/…)
   ======================================================================= */
window.AFO = window.AFO || {};
(function () {
  // ------------ Utils ------------
  function toPath(u){
    try{
      const url = u.startsWith('http') ? new URL(u) : new URL(u, location.origin);
      return url.pathname + url.search;
    }catch{ return u; }
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
    if (/\bsvin|flæsk|kam|medister|bacon|ribben\b/.test(s))                         { icon="pig";     cats=["Kød","Svinekød"]; }
    else if (/\bokse|oksekød|bøf|steak|hakket okse\b/.test(s))                      { icon="cow";     cats=["Kød","Oksekød"]; }
    else if (/\bkylling|lår|bryst|spyd|vinger\b/.test(s))                           { icon="chicken"; cats=["Kød","Kylling"]; }
    else if (/\bfisk|laks|torsk|sej|ørred|rejer\b/.test(s))                         { icon="fish";    cats=["Fisk"]; }
    else if (/\bburger\b/.test(s))                                                  { icon="burger"; }
    else if (/\bkartoffel|grøntsag|salat|aubergine|gulerod|svampe|champignon\b/.test(s)) { icon="leaf"; cats=["Grønt"]; }
    else if (/\bdessert|kage|brownie|kanelsnegle|cheesecake|æble|muffins|cookies\b/.test(s)) { icon="cake"; cats=["Dessert"]; }
    else if (/\btilbehør|pommes|fritter|chips|majskolbe|fries\b/.test(s))           { icon="fries";   cats=["Tilbehør"]; }
    return { icon, categories: cats };
  }

  async function fetchText(url, timeoutMs=9000){
    const ctrl = new AbortController(); const t = setTimeout(()=>ctrl.abort(), timeoutMs);
    try{
      const r = await fetch(url, { cache:'no-store', signal: ctrl.signal });
      if(!r.ok) throw new Error('HTTP '+r.status);
      return await r.text();
    }finally{ clearTimeout(t); }
  }

  // ------------ XML parsere (namespace-tolerant) ------------
  function parseXml(xmlStr){
    const doc = new DOMParser().parseFromString(xmlStr, 'application/xml');
    if (doc.getElementsByTagName('parsererror').length) return null;
    return doc;
  }

  // Udtræk <url>/<loc>/<lastmod> fra urlset – namespace-aware + regex fallback
  function extractLocsFromUrlset(doc){
    let urls = [];
    // Namespace-aware DOM
    let urlNodes = doc.getElementsByTagName('url');
    if (!urlNodes || !urlNodes.length){
      urlNodes = doc.getElementsByTagNameNS('*','url'); // <— vigtig til xmlns=".../sitemap/0.9"
    }
    if (urlNodes && urlNodes.length){
      for (const n of urlNodes){
        const locNode  = n.getElementsByTagName('loc')[0]     || n.getElementsByTagNameNS('*','loc')[0];
        const lastNode = n.getElementsByTagName('lastmod')[0] || n.getElementsByTagNameNS('*','lastmod')[0];
        const loc  = locNode?.textContent?.trim();
        const last = (lastNode?.textContent?.trim() || '').slice(0,10);
        if (loc) urls.push({ loc, lastmod: last });
      }
      return urls;
    }
    // Fallback: regex på hele XML
    const xml = new XMLSerializer().serializeToString(doc);
    const locs = [...xml.matchAll(/<url>[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?(?:<lastmod>([^<]+)<\/lastmod>)?[\s\S]*?<\/url>/gi)];
    return locs.map(m => ({ loc: m[1], lastmod: (m[2]||'').slice(0,10) }));
  }

  // Udtræk child-sitemaps fra sitemapindex – namespace-aware + regex fallback
  function extractSitemapsFromIndex(doc){
    let maps = [];
    let smNodes = doc.getElementsByTagName('sitemap');
    if (!smNodes || !smNodes.length){
      smNodes = doc.getElementsByTagNameNS('*','sitemap'); // <— vigtig!
    }
    if (smNodes && smNodes.length){
      for (const n of smNodes){
        const locNode = n.getElementsByTagName('loc')[0] || n.getElementsByTagNameNS('*','loc')[0];
        const loc = locNode?.textContent?.trim();
        if (loc) maps.push(loc);
      }
      return maps;
    }
    // Fallback: regex
    const xml = new XMLSerializer().serializeToString(doc);
    maps = [...xml.matchAll(/<sitemap>[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?<\/sitemap>/gi)].map(m=>m[1]);
    return maps;
  }

  // ------------ Sitemap læser ------------
  async function readAllRecipePaths(){
    // Primære indgange (index eller enkelt sitemap)
    const entryCandidates  = ['/sitemap.xml', '/sitemap_index.xml'];
    // Direkte fallback til opskrifter (hvis index ikke leder korrekt videre)
    const directCandidates = ['/recipes-sitemap.xml'];

    const seenPaths = new Set();
    const queue = [];

    // 1) Prøv index/entry sitemaps
    for (const entry of entryCandidates){
      try{
        const txt = await fetchText(entry);
        const doc = parseXml(txt);
        if (!doc) continue;
        const root = (doc.documentElement?.nodeName || '').toLowerCase();
        if (root.includes('urlset')){
          const urls = extractLocsFromUrlset(doc);
          urls.forEach(u => {
            if (/\/opskrifter\/[^\/]+\.html$/i.test(u.loc)){
              const p = toPath(u.loc);
              if (!seenPaths.has(p)){ seenPaths.add(p); queue.push({ path:p, lastmod:u.lastmod }); }
            }
          });
        } else if (root.includes('sitemapindex')){
          const sitemaps = extractSitemapsFromIndex(doc);
          for (const smUrl of sitemaps){
            try{
              const smPath = toPath(smUrl); // sikrer same-origin path
              const smTxt = await fetchText(smPath);
              const smDoc = parseXml(smTxt);
              if (!smDoc) continue;
              const urls = extractLocsFromUrlset(smDoc);
              urls.forEach(u => {
                if (/\/opskrifter\/[^\/]+\.html$/i.test(u.loc)){
                  const p = toPath(u.loc);
                  if (!seenPaths.has(p)){ seenPaths.add(p); queue.push({ path:p, lastmod:u.lastmod }); }
                }
              });
            }catch(e){ console.warn('[AFO] kunne ikke hente undersitemap:', smUrl, e); }
          }
        }
      }catch(e){
        // prøv næste kandidat
      }
    }

    // 2) Hvis intet/for lidt fundet endnu – prøv direkte opskrifts-sitemap(s)
    if (!queue.length){
      for (const entry of directCandidates){
        try{
          const txt = await fetchText(entry);
          const doc = parseXml(txt);
          if (!doc) continue;
          const urls = extractLocsFromUrlset(doc);
          urls.forEach(u => {
            if (/\/opskrifter\/[^\/]+\.html$/i.test(u.loc)){
              const p = toPath(u.loc);
              if (!seenPaths.has(p)){ seenPaths.add(p); queue.push({ path:p, lastmod:u.lastmod }); }
            }
          });
        }catch(_){}
      }
    }

    return queue; // [{path,lastmod}]
  }

  // ------------ HTML meta-scrape ------------
  async function scrapeMeta(path){
    try{
      const html = await fetchText(path, 9000);
      const doc  = new DOMParser().parseFromString(html, 'text/html');
      const h1   = doc.querySelector('h1')?.textContent?.trim();
      const ttl  = capWords(h1 || doc.title || 'Airfryer Opskrift');

      // AFO-meta (frivillige meta tags du kan sætte i opskrifterne)
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
    }catch{
      return null;
    }
  }

  // ------------ Build + eksport ------------
  let _resolve; AFO.ready = new Promise(r => (_resolve = r));

  (async ()=>{
    try{
      const items = await readAllRecipePaths(); // [{path,lastmod}]
      const map = {};
      await Promise.all(items.map(async (it)=>{
        const slug = slugFromPath(it.path);
        if (!slug) return;
        const m = await scrapeMeta(it.path);
        if (!m) return;
        map[slug] = {
          title: m.title,
          slug,
          date: (it.lastmod || new Date().toISOString().slice(0,10)), // brug <lastmod> hvis muligt
          categories: m.categories,
          icon: m.icon,
          meta: m.meta
        };
      }));

      // Udgiv global liste – nyeste først
      window.RECIPES = Object.values(map)
        .sort((a,b)=> (b.date||"").localeCompare(a.date||""));

      _resolve();
    }catch(err){
      console.error('[AFO] fejl ved opbygning:', err);
      window.RECIPES = window.RECIPES || [];
      _resolve();
    }
  })();

  // Public API
  AFO.getAll = () => (window.RECIPES || []);
  AFO.latest = (n=6) => AFO.getAll().slice(0, n);
  AFO.search = (q) => {
    const s = (q||"").toLowerCase();
    if (!s) return AFO.getAll();
    return AFO.getAll().filter(r =>
      (r.title||"").toLowerCase().includes(s) ||
      (r.slug||"").includes(s) ||
      (r.categories||[]).some(c => (c||"").toLowerCase().includes(s))
    );
  };
  AFO.byCategory = (cat) => {
    if (!cat) return AFO.getAll();
    const s = (cat||'').toLowerCase();
    return AFO.getAll().filter(r => (r.categories||[]).some(c => (c||"").toLowerCase() === s));
  };
})();
