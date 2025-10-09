/* =========================================================================
   /assets/recipes.js — Robust "Seneste" loader
   - Finder sitemaps via /robots.txt + /sitemap(_index).xml + fallback /recipes-sitemap.xml
   - Namespace-safe XML parsing
   - Hård cache-bust på alle fetches (omgår CDN)
   - Datoer: <lastmod> > JSON-LD Recipe (datePublished / dateModified) > article:published_time
   - Eksporterer window.RECIPES (nyeste først) + AFO API
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
  function withBust(url){
    // Tilføj cb=timestamp for at bryde edge-cache. Respekter eksisterende query.
    try{
      const same = url.startsWith('http') ? new URL(url).origin === location.origin : true;
      const u = url.startsWith('http') ? new URL(url) : new URL(url, location.origin);
      if (same){
        u.searchParams.set('cb', String(Date.now()));
      }
      return same ? (u.pathname + (u.search||'')) : url;
    }catch{ return url; }
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
      const busted = withBust(url);
      const r = await fetch(busted, { cache:'no-store', signal: ctrl.signal });
      if(!r.ok) throw new Error('HTTP '+r.status+' @ '+url);
      return await r.text();
    }finally{ clearTimeout(t); }
  }

  // ------------ XML parsere (namespace-tolerant) ------------
  function parseXml(xmlStr){
    const doc = new DOMParser().parseFromString(xmlStr, 'application/xml');
    if (doc.getElementsByTagName('parsererror').length) return null;
    return doc;
  }
  function extractLocsFromUrlset(doc){
    let urls = [];
    let urlNodes = doc.getElementsByTagName('url');
    if (!urlNodes || !urlNodes.length){ urlNodes = doc.getElementsByTagNameNS('*','url'); }
    if (urlNodes && urlNodes.length){
      for (const n of urlNodes){
        const locNode  = n.getElementsByTagName('loc')[0]     || n.getElementsByTagNameNS('*','loc')[0];
        const lastNode = n.getElementsByTagName('lastmod')[0] || n.getElementsByTagNameNS('*','lastmod')[0];
        const loc  = locNode?.textContent?.trim();
        const last = (lastNode?.textContent?.trim() || '').slice(0,10) || null;
        if (loc) urls.push({ loc, lastmod: last });
      }
      return urls;
    }
    const xml = new XMLSerializer().serializeToString(doc);
    const locs = [...xml.matchAll(/<url>[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?(?:<lastmod>([^<]+)<\/lastmod>)?[\s\S]*?<\/url>/gi)];
    return locs.map(m => ({ loc: m[1], lastmod: (m[2]||'').slice(0,10) || null }));
  }
  function extractSitemapsFromIndex(doc){
    let maps = [];
    let smNodes = doc.getElementsByTagName('sitemap');
    if (!smNodes || !smNodes.length){ smNodes = doc.getElementsByTagNameNS('*','sitemap'); }
    if (smNodes && smNodes.length){
      for (const n of smNodes){
        const locNode = n.getElementsByTagName('loc')[0] || n.getElementsByTagNameNS('*','loc')[0];
        const loc = locNode?.textContent?.trim();
        if (loc) maps.push(loc);
      }
      return maps;
    }
    const xml = new XMLSerializer().serializeToString(doc);
    return [...xml.matchAll(/<sitemap>[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?<\/sitemap>/gi)].map(m=>m[1]);
  }

  // ------------ Find sitemap-kilder ------------
  async function discoverSitemaps(){
    const set = new Set(['/sitemap.xml','/sitemap_index.xml','/recipes-sitemap.xml']);
    try{
      const robots = await fetchText('/robots.txt', 6000);
      robots.split(/\r?\n/).forEach(line=>{
        const m = line.match(/^\s*Sitemap:\s*(\S+)\s*$/i);
        if (m){ try{
          const p = toPath(m[1]); if (p.endsWith('.xml') || p.endsWith('.xml.gz')) set.add(p.replace(/\.gz$/,'')); // gz ikke håndteret her
        }catch{} }
      });
    }catch(_){}
    return Array.from(set);
  }

  // ------------ Sitemap læser ------------
  async function readAllRecipePaths(){
    const candidates = await discoverSitemaps(); // robots + standard
    const seenPaths = new Set();
    const queue = [];

    for (const entry of candidates){
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
              const smPath = toPath(smUrl);
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
            }catch(e){ console.warn('[AFO] undersitemap fejl:', smUrl, e); }
          }
        }
      }catch(e){
        console.warn('[AFO] sitemap fejl:', entry, e?.message||e);
      }
    }
    return queue; // [{path,lastmod}]
  }

  // ------------ HTML dato + meta-scrape ------------
  function safeJSONparse(str){ try{ return JSON.parse(str); }catch{ return null; } }
  function pickISO(s){ if(!s) return null; const d = new Date(s); return isNaN(d) ? null : d.toISOString().slice(0,10); }

  function extractDatesFromDoc(doc){
    let published = null, modified = null;
    const ldNodes = doc.querySelectorAll('script[type="application/ld+json"]');
    outer: for (const node of ldNodes){
      const data = safeJSONparse(node.textContent || '');
      if (!data) continue;
      const bag = Array.isArray(data) ? data : [data];
      for (const entry of bag){
        if (!entry || typeof entry !== 'object') continue;
        const graph = Array.isArray(entry['@graph']) ? entry['@graph'] : [entry];
        for (const g of graph){
          const t = g['@type'] || g.type || '';
          const types = Array.isArray(t) ? t : [t];
          if (types.includes('Recipe') || types.includes('Article')){
            if (!published) published = pickISO(g.datePublished);
            if (!modified)  modified  = pickISO(g.dateModified);
            if (published || modified) break outer;
          }
        }
      }
    }
    const metaPublished =
      doc.querySelector('meta[property="article:published_time"]')?.content ||
      doc.querySelector('meta[name="article:published_time"]')?.content ||
      doc.querySelector('meta[name="date"]')?.content ||
      doc.querySelector('time[datetime]')?.getAttribute('datetime');
    const metaUpdated =
      doc.querySelector('meta[property="article:modified_time"]')?.content ||
      doc.querySelector('meta[property="og:updated_time"]')?.content ||
      doc.querySelector('meta[name="lastmod"]')?.content;

    published = published || pickISO(metaPublished);
    modified  = modified  || pickISO(metaUpdated);
    return { published, modified };
  }

  async function scrapeMeta(path){
    try{
      const html = await fetchText(path, 9000);
      const doc  = new DOMParser().parseFromString(html, 'text/html');
      const h1   = doc.querySelector('h1')?.textContent?.trim();
      const ttl  = capWords(h1 || doc.title || 'Airfryer Opskrift');

      const metaCats = doc.querySelector('meta[name="afo:categories"]')?.content;
      const metaIcon = doc.querySelector('meta[name="afo:icon"]')?.content;
      const metaMeta = doc.querySelector('meta[name="afo:meta"]')?.content;

      const dates = extractDatesFromDoc(doc);
      const g = guessMeta(ttl);
      return {
        title: ttl,
        categories: metaCats ? metaCats.split(',').map(s=>s.trim()).filter(Boolean) : g.categories,
        icon: metaIcon || g.icon,
        meta: metaMeta || "",
        published: dates.published || null,
        modified:  dates.modified  || null
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
        const date = it.lastmod || m.published || m.modified || null;
        map[slug] = {
          title: m.title,
          slug,
          date, // kan være null -> nederst
          categories: m.categories,
          icon: m.icon,
          meta: m.meta
        };
      }));

      window.RECIPES = Object.values(map).sort((a,b)=>{
        const da = a.date || ''; const db = b.date || '';
        if (da && db) return db.localeCompare(da);
        if (db) return 1;
        if (da) return -1;
        return (a.title||'').localeCompare(b.title||'', 'da');
      });

      _resolve();
    }catch(err){
      console.error('[AFO] build-fejl:', err);
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
