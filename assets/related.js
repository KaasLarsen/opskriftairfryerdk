(async () => {
  const GRID_SELECTOR = '#related-grid';
  const HEADING_SELECTOR = '#related-heading';
  const JSON_URL = '/data/recipes.json';

  const grid = document.querySelector(GRID_SELECTOR);
  const heading = document.querySelector(HEADING_SELECTOR);
  if (!grid || !heading) return; // intet at gøre

  try {
    const res = await fetch(JSON_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('Kunne ikke hente recipes.json');
    const all = await res.json();

    // Find current slug (uden query/hash)
    const currentPath = location.pathname.replace(/\/+$/, '');
    const me = all.find(r => (r.slug || '').replace(/\/+$/, '') === currentPath);
    if (!me) {
      // Hvis ikke i listen, vis bare de seneste 3
      renderCards(all
        .filter(r => r.slug !== currentPath)
        .sort((a,b) => (b.date||'').localeCompare(a.date||''))
        .slice(0,3), grid);
      return;
    }

    // Filtrer samme kategori, ekskluder nuværende
    const related = all
      .filter(r => r.category === me.category && r.slug !== me.slug)
      .sort((a,b) => (b.date||'').localeCompare(a.date||''))
      .slice(0,3);

    // Hvis for få i samme kategori, fyld op med øvrige nyeste
    if (related.length < 3) {
      const filler = all
        .filter(r => r.slug !== me.slug && r.category !== me.category)
        .sort((a,b) => (b.date||'').localeCompare(a.date||''))
        .slice(0, 3 - related.length);
      related.push(...filler);
    }

    // Sæt overskrift (optionelt, hvis du vil vise kategori)
    // heading.textContent = `Relaterede Opskrifter · ${me.category}`;

    renderCards(related, grid);
  } catch (err) {
    console.error(err);
    // Fallback: skjul hele sektionen hvis intet at vise
    const section = grid.closest('section');
    if (section) section.style.display = 'none';
  }

  function renderCards(items, root) {
    root.innerHTML = items.map(cardHTML).join('');
  }

  function cardHTML(r) {
    const icon = (r.icon || 'roast').replace(/[^a-z0-9_-]/gi, '');
    const title = escapeHTML(r.title || 'Opskrift');
    const href = r.slug || '#';
    return `
      <a class="card" href="${href}">
        <div class="thumb-icon"><svg><use href="#${icon}"/></svg></div>
        <div class="card-body"><h3>${title}</h3></div>
      </a>`;
  }

  function escapeHTML(s){
    return String(s)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#039;');
  }
})();
