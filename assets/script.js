// Indlæs partials (hvis du bruger include.js, behold den også)
document.addEventListener('DOMContentLoaded', () => {
  // "Seneste" på forsiden – kræver /assets/recipes.json (kan være tom til at starte med)
  const latestWrap = document.getElementById('latest-list');
  if (latestWrap) {
    fetch('/assets/recipes.json', { cache: 'no-cache' })
      .then(r => r.ok ? r.json() : [])
      .then(list => {
        list.sort((a,b)=>(b.date||'').localeCompare(a.date||''));
        const items = list.slice(0,6).map(r => `
          <a class="card" href="${r.url}">
            <div class="thumb"></div>
            <div class="card-body">
              <h3>${r.title}</h3>
              <p class="meta">${r.minutes||''}${r.minutes?' · ':''}${r.difficulty||''}</p>
            </div>
          </a>
        `).join('');
        latestWrap.innerHTML = items || '<p>Ingen opskrifter endnu.</p>';
      }).catch(()=>{});
  }

  // Kategori-side
  const catWrap = document.getElementById('category-list');
  if (catWrap) {
    const q = new URLSearchParams(location.search).get('navn') || '';
    const t = document.getElementById('category-title');
    if (t) t.textContent = q ? `Kategori: ${q}` : 'Alle Opskrifter';
    fetch('/assets/recipes.json', { cache: 'no-cache' })
      .then(r => r.ok ? r.json() : [])
      .then(list => {
        const data = q ? list.filter(r => (r.categories||[]).includes(q)) : list;
        catWrap.innerHTML = data.map(r => `
          <a class="card" href="${r.url}">
            <div class="thumb"></div>
            <div class="card-body"><h3>${r.title}</h3></div>
          </a>
        `).join('') || '<p>Ingen opskrifter i denne kategori endnu.</p>';
      }).catch(()=>{});
  }
});
