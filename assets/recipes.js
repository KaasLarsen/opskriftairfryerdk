/* =========================================================================
   /assets/recipes.js — Hent ALT fra sitemap (index + urlset), robust & NS-safe
   NYT: Læser også datoer fra JSON-LD (Recipe) og meta-tags i HTML.
   Output: window.RECIPES (nyeste først) + AFO API (ready/getAll/search/…)
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
      urlNodes = doc.getElementsByTagNameNS('*','url'); // vigtigt til xmlns=".../sitemap/0.9"
    }
    if (urlNodes && urlNodes.length){
      for (const n of urlNodes){
        const locNode  = n.getElementsByTagName('loc')[0]     || n.getElementsByTagNameNS('*','loc')[0];
        const lastNode = n.getElementsByTagName('lastmod')[0] || n.getElementsByTagNameNS('*','lastmod')[0];
        const loc  = locNode?.textContent?.trim();
        const last = (lastNode?.textContent?.trim() || '').slice(0,10);
        if (loc) urls.push({ loc, lastmod: last || null });
      }
      return urls;
    }
    // Fallback: regex på hele XML
    const xml = new XMLSerializer().serializeToString(doc);
    const locs = [...xml.matchAll(/<url>[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?(?:<lastmod>([^<]+)<\/lastmod>)?[\s\S]*?<\/url>/gi)];
    return locs.map(m => ({ loc: m[1], lastmod: (m[2]||'').slice(0,10) || null }));
  }

  // Udtræk child-sitemaps fra sitemapindex – namespace-aware + regex fallback
  function extractSitemapsFromIndex(doc){
    let maps = [];
    let smNodes = doc.getElementsByTagName('sitemap');
    if (!smNodes || !smNodes.length){
      smNodes = doc.getElementsByTagNameNS('*','sitemap');
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
              const smPath = toPath(smUrl); // same-origin path
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

  // ------------ HTML dato + meta-scrape ------------
  function safeJSONparse(str){
    try{ return JSON.parse(str); }catch{ return null; }
  }
  function pickISO(s){
    if(!s) return null;
    // Normalisér til 'YYYY-MM-DD' hvis muligt
    const d = new Date(s);
    return isNaN(d) ? null : d.toISOString().slice(0,10);
  }

  function extractDatesFromDoc(doc){
    let published = null, modified = null;

    // 1) JSON-LD: find @type Recipe og læs datePublished/dateModified
    const ldNodes = doc.querySelectorAll('script[type="application/ld+json"]');
    for (const node of ldNodes){
      const data = safeJSONparse(node.textContent || '');
      if (!data) continue;
      const flat = Array.isArray(data) ? data : [data];
      for (const entry of flat){
        if (!entry || typeof entry !== 'object') continue;
        // @graph kan indeholde flere nodes
        const graph = Array.isArray(entry['@graph']) ? entry['@graph'] : [entry];
        for (const g of graph){
          const t = (g['@type'] || g.type || '');
          if (t === 'Recipe' || (Array.isArray(t) && t.includes('Recipe'))){
            if (!published) published = pickISO(g.datePublished);
            if (!modified)  modified  = pickISO(g.dateModified);
          }
        }
      }
      if (published || modified) break;
    }

    // 2) Meta tags (Open Graph / Article)
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

      // AFO-meta (frivillige meta tags du kan sætte i opskrifterne)
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

        // Vælg dato: sitemap <lastmod> → JSON-LD published → JSON-LD modified → (ellers null)
        const date = it.lastmod || m.published || m.modified || null;

        map[slug] = {
          title: m.title,
          slug,
          date, // kan være null -> sorteres nederst
          categories: m.categories,
          icon: m.icon,
          meta: m.meta
        };
      }));

      // Udgiv global liste – nyeste først (udaterede til sidst)
      window.RECIPES = Object.values(map)
        .sort((a,b)=>{
          const da = a.date ? a.date : '';
          const db = b.date ? b.date : '';
          if (da && db) return db.localeCompare(da); // begge har dato
          if (db) return 1;  // a mangler dato -> b først
          if (da) return -1; // b mangler dato -> a først
          return (a.title||'').localeCompare(b.title||'', 'da');
        });

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
