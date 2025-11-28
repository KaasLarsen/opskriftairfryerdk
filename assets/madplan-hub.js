/* Madplan hub – bygger kort + søgning
   Kræver: /assets/madplaner.js der eksporterer window.MP (array af objekter)
   Struktur pr. item i MP:
   { url, title, desc, icon, tags: ['hverdag','vægttab','for2', ...], lastmod }
*/
(function () {
  // ===== helpers =====
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // Registrér
  const REG = Array.isArray(window.MP) ? window.MP.slice() : [];

  // Fallback: hent fra sitemap hvis REG er tomt
  async function loadFromSitemapIfEmpty(){
    if (REG.length) return REG;
    try{
      const res = await fetch('/madplan-sitemap.xml', {cache:'no-store'});
      if(!res.ok) throw 1;
      const xml = await res.text();
      const urls = [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)]
        .map(m=>m[1])
        .filter(u => u.includes('/madplan/'));
      urls.forEach(u=>{
        const p = new URL(u, location.origin).pathname;
        const slug = p.split('/').pop().replace(/\.html$/,'');
        REG.push({
          url: p,
          title: slug.replace(/-/g,' ').replace(/\b\w/g,m=>m.toUpperCase()),
          desc: 'Madplan',
          icon: 'calendar',
          tags: []
        });
      });
    }catch(_){}
    return REG;
  }

  // Kort
  function card(item){
    const icon = item.icon || 'calendar';
    const desc = item.desc || 'Madplan';
    return `
      <a class="card card--guide" href="${item.url}">
        <div class="thumb-icon"><svg><use href="#${icon}"></use></svg></div>
        <div class="card-body">
          <h3>${item.title}</h3>
          <p class="meta">${desc}</p>
        </div>
      </a>
    `;
  }

  // Render et grid ud fra tag + limit
  function renderTaggedGrids(list){
    $$('[data-mp-grid]').forEach(grid=>{
      const tag = grid.getAttribute('data-tag') || '';
      const cap = parseInt(grid.getAttribute('data-limit') || '6', 10);
      const items = list.filter(x => (x.tags||[]).includes(tag)).slice(0, cap);
      grid.innerHTML = items.length ? items.map(card).join('') : '<p class="meta">Ingen madplaner endnu.</p>';
    });
  }

  // Render “Alle planer”
  function renderAll(list){
    const mount = $('[data-mp-all]');
    if (!mount) return;
    const byTitle = list.slice().sort((a,b)=> (a.title||'').localeCompare(b.title||'', 'da'));
    mount.innerHTML = byTitle.map(card).join('');
  }

  // Søgning: filtrér i REG og skriv ind i [data-mp-all]
  function initSearch(list){
    const input = $('#search-input');
    const mount = $('[data-mp-all]');
    if (!input || !mount) return;

    const norm = s => (s||'').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'');
    let ALL = list.slice();

    function run(){
      const q = norm(input.value.trim());
      if (!q){ renderAll(ALL); return; }
      const out = ALL.filter(x=>{
        const hay = [x.title, x.desc, (x.tags||[]).join(' ')].map(norm).join(' ');
        return hay.includes(q) || hay.split(' ').some(w => w.startsWith(q));
      });
      mount.innerHTML = out.length ? out.map(card).join('') : '<p class="meta">Ingen madplaner matchede din søgning.</p>';
    }

    // bind
    input.addEventListener('input', run);
    const form = input.closest('form');
    if (form) form.addEventListener('submit', e=>{ e.preventDefault(); run(); });
  }

  // Diagnostic: log manglende filer (404) i konsollen
  async function checkMissing(list){
    try{
      const checks = await Promise.all(list.map(async it=>{
        try{
          const r = await fetch(it.url, {method:'HEAD', cache:'no-store'});
          return {url: it.url, ok: r.ok};
        }catch(_){ return {url: it.url, ok:false}; }
      }));
      const missing = checks.filter(c=>!c.ok);
      if (missing.length){
        console.warn('[Madplan HUB] Mangler filer:', missing.map(m=>m.url));
      }
    }catch(_){}
  }

  // Boot
  (async function(){
    const data = await loadFromSitemapIfEmpty(); // bruger MP hvis den findes
    renderTaggedGrids(data);
    renderAll(data);
    initSearch(data);
    // valgfrit: tjek for 404 i baggrunden (hjælper debug)
    setTimeout(()=>checkMissing(data), 50);
  })();
})();
