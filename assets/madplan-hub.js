/*! assets/madplan-hub.js – robust renderer til madplan-hubben */
(function () {
  const byId = (id) => document.getElementById(id);
  const $all = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // Lille helper til sikker tekst
  const esc = (s) => String(s||"").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function cardHTML(it){
    const icon = esc(it.icon || "star");
    const title = esc(it.title || "");
    const url = esc(it.url || "#");
    const meta = esc(it.kicker || "");
    return `
      <a class="card card--guide" href="${url}">
        <div class="thumb-icon"><svg><use href="#${icon}"></use></svg></div>
        <div class="card-body">
          <h3>${title}</h3>
          <p class="meta">${meta}</p>
        </div>
      </a>`;
  }

  function renderSectionGrids(items){
    // data-mp-grid: filtrér på ét tag
    $all('[data-mp-grid]').forEach(el=>{
      const tag = (el.dataset.tag || '').toLowerCase().trim();
      const limit = parseInt(el.dataset.limit||'0',10) || 6;
      const subset = items.filter(it => (it.tags||[]).some(t => String(t).toLowerCase() === tag)).slice(0, limit);
      el.innerHTML = subset.map(cardHTML).join('') || '<p class="meta">Ingen planer endnu.</p>';
    });

    // data-mp-all: vis alle
    $all('[data-mp-all]').forEach(el=>{
      const limit = parseInt(el.dataset.limit||'0',10) || 12;
      el.innerHTML = items.slice(0, limit).map(cardHTML).join('') || '<p class="meta">Ingen planer endnu.</p>';
    });
  }

  function normalise(list){
    const out = (list||[]).map(x => ({
      url: x.url, title: x.title, icon: x.icon || 'star',
      tags: Array.isArray(x.tags) ? x.tags : [],
      kicker: x.kicker || '',
      published: x.published || ''
    }));
    // Nyeste først, så alfabetisk
    out.sort((a,b)=>{
      const da = new Date(a.published||0), db = new Date(b.published||0);
      if (db - da) return db - da;
      return (a.title||'').localeCompare(b.title||'', 'da');
    });
    return out;
  }

  function tryRender(){
    const data = normalise(window.MADPLANS || []);
    if (!data.length) return false;
    renderSectionGrids(data);
    return true;
  }

  // Kør når DOM er klar
  function boot(){
    if (tryRender()) return;

    // Fald tilbage: lyt efter forskellige mulige events/flags og prøv igen
    let retries = 20;
    const timer = setInterval(()=>{
      if (tryRender() || --retries <= 0) clearInterval(timer);
    }, 200);

    // Lyt til flere mulige events (vi sender selv "madplans:ready" fra datafilen)
    ['madplans:ready','madplan:ready','MADPLANS_READY'].forEach(ev=>{
      document.addEventListener(ev, tryRender, { once:false });
    });
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
