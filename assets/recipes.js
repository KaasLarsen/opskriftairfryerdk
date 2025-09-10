/* =========================================================================
   /assets/recipes.js — Hent ALT fra sitemap (index + urlset, robust)
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
  function capWords(s){ return (s||"").replace(/[^\s]+/g, w => w.charAt(0).toUpperCase() + w.slice(1)); }
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
  async function fetchText(url, timeoutMs=9000){
    const ctrl = new AbortController(); const t = setTimeout(()=>ctrl.abort(), timeoutMs);
    try{
      const r = await fetch(url, { cache:'no-store', signal: ctrl.signal });
      if(!r.ok) throw new Error('HTTP '+r.status);
      return await r.text();
    }finally{ clearTimeout(t); }
  }

  // ------------ XML parsere (tolerant) ------------
  function parseXml(xmlStr){
    const doc = new DOMParser().parseFromString(xmlStr, 'application/xml');
    // Tjek for parsererror
    if (doc.getElementsByTagName('parsererror').length) return null;
    return doc;
  }
  // udtræk <loc> fra urlset/sitemapindex med både DOM og regex fallback
  function extractLocsFromUrlset(doc){
    let urls = [];
    // Prøv DOM først
    const urlNodes = doc.getElementsByTagName('url');
    if (urlNodes.length){
      for (const n of urlNodes){
        const loc = (n.getElementsByTagName('loc')[0] || n.getElementsByTagNameNS('*','loc')[0])?.textContent?.trim();
        const last = (n.getElementsByTagName('lastmod')[0] || n.getElementsByTagNameNS('*','lastmod')[0])?.textContent?.trim() || '';
        if (loc) urls.push({ loc, lastmod: last.slice(0,10) });
      }
      return urls;
    }
    // Fallback: regex
    const locs = [...doc.documentElement?.outerHTML.matchAll(/<url>[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?(?:<lastmod>([^<]+)<\/lastmod>)?[\s\S]*?<\/url>/gi)];
    urls = locs.map(m => ({ loc: m[1], lastmod: (m[2]||'').slice(0,10) }));
    return urls;
  }
  function extractSitemapsFromIndex(doc){
    let maps = [];
    const smNodes = doc.getElementsByTagName('sitemap');
    if (smNodes.length){
      for (const n of smNodes){
        const loc = (n.getElementsByTagName('loc')[0] || n.getElementsByTagNameNS('*','loc')[0])?.textContent?.trim();
        if (loc) maps.push(loc);
      }
      return maps;
    }
    // regex fallback
    maps = [...doc.documentElement?.outerHTML.matchAll(/<sitemap>[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?<\/sitemap>/gi)].map(m=>m[1]);
    return maps;
  }

  // ------------ Sitemap læser ------------
  async function readAllRecipePaths(){
    // Prøv sitemap.xml og sitemap_index.xml
    const entryCandidates = ['/sitemap.xml', '/sitemap_index.xml'];
    const seenPaths = new Set();
    const queue = [];

    for (const entry of entryCandidates){
      try{
        const txt = await fetchText(entry);
        const doc = parseXml(txt);
        if (!doc) continue;
        const root = doc.documentElement?.nodeName?.toLowerCase() || '';
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
          // Hent HVER sitemap i index’et
          for (const smUrl of sitemaps){
            try{
              const smTxt = await fetchText(toPath(smUrl)); // same-origin path (kræver at sitemappene også ligger her)
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
        // bare prøv næste kandidat
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
    }catch{ return null; }
  }

  // ------------ Build + eksport ------------
  let _resolve; AFO.ready = new Promise(r => (_resolve = r));

  (async ()=>{
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
        date: (it.lastmod || new Date().toISOString().slice(0,10)),
        categories: m.categories,
        icon: m.icon,
        meta: m.meta
      };
    }));

    window.RECIPES = Object.values(map)
      .sort((a,b)=> (b.date||"").localeCompare(a.date||""));

    _resolve();
  })();

  // Public API
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
