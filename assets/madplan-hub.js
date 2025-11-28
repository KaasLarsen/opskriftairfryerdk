(function(){
  if (!window.MADPLANER) return;
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));

  const icon = id => `<div class="thumb-icon"><svg><use href="#${id||'calendar'}"></use></svg></div>`;
  const badge = (ico, txt) => `<span class="badge"><svg class="ico-inline"><use href="#${ico}"></use></svg> ${txt}</span>`;
  const card = p => `
    <a class="card card--guide" href="/madplan/${p.slug}.html">
      ${icon(p.icon)}
      <div class="card-body">
        <h3>${p.title}</h3>
        <p class="meta">${p.desc||''}</p>
        <div class="badges" style="margin-top:6px">
          ${badge('timer', p.duration || '7 dage')}
          ${badge('bowl', (p.people||4)+' pers.')}
          ${badge('leaf', (p.kcalAvg||'–')+' kcal')}
        </div>
      </div>
    </a>`;

  function list(tag){
    let out = window.MADPLANER.slice();
    if (tag) out = out.filter(p => (p.tags||[]).includes(tag));
    out.sort((a,b)=> (b.published||'').localeCompare(a.published||''));
    return out;
  }

  function renderGrid(el){
    const tag = el.getAttribute('data-tag');
    const limit = +el.getAttribute('data-limit') || 6;
    el.innerHTML = list(tag).slice(0, limit).map(card).join('') || '<p class="meta">Ingen madplaner endnu.</p>';
  }

  // Render all grids
  $$('[data-mp-grid]').forEach(renderGrid);

  // Search
  const q = $('#search-input');
  const target = $('[data-mp-all]'); // a dedicated "all" grid
  if (q && target){
    const on = () => {
      const term = (q.value||'').toLowerCase().trim();
      const base = list(null);
      const items = term
        ? base.filter(p => (p.title||'').toLowerCase().includes(term) ||
                           (p.desc||'').toLowerCase().includes(term)  ||
                           (p.tags||[]).some(t => t.toLowerCase().includes(term)))
        : base;
      target.innerHTML = items.slice(0,12).map(card).join('') || '<p class="meta">Ingen resultater.</p>';
    };
    q.addEventListener('input', on);
    on();
  }

  // SEO ItemList of first 10
  (function(){
    try{
      const items = list(null).slice(0,10).map((p,i)=>({
        "@type":"ListItem",
        "position": i+1,
        "url": location.origin + '/madplan/' + p.slug + '.html',
        "name": p.title
      }));
      const ld = {"@context":"https://schema.org","@type":"ItemList","itemListElement":items};
      const s = document.createElement('script'); s.type='application/ld+json'; s.textContent = JSON.stringify(ld);
      document.head.appendChild(s);
    }catch(_){}
  })();
})();
