/* /assets/script.js */

// Hent alle opskrifter
async function loadRecipes() {
  try {
    const res = await fetch('/assets/recipes.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (e) {
    console.error('Kunne ikke indlæse recipes.json', e);
    return [];
  }
}

// Render et kort (tile)
function recipeCard(r) {
  const img = r.image || '/img/recipes/placeholder.jpg';
  return `
    <a class="card" href="${r.url}">
      <div class="thumb" style="background-image:url('${img}'); background-size:cover; background-position:center"></div>
      <div class="card-body">
        <h3>${r.title}</h3>
        <p class="meta">${r.minutes || ''}${r.minutes ? ' · ' : ''}${r.difficulty || ''}</p>
      </div>
    </a>
  `;
}

// Forside: udfyld “Seneste” (ID: latest-list)
async function renderLatest(count = 6) {
  const wrap = document.getElementById('latest-list');
  if (!wrap) return;
  const data = await loadRecipes();
  data.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  wrap.innerHTML = data.slice(0, count).map(recipeCard).join('') || '<p>Ingen opskrifter endnu.</p>';
}

// Kategori-side: /kategori.html?navn=Aftensmad
async function renderCategoryPage() {
  const el = document.getElementById('category-list');
  if (!el) return;
  const params = new URLSearchParams(location.search);
  const navn = params.get('navn') || '';
  const titleEl = document.getElementById('category-title');
  if (titleEl) titleEl.textContent = navn ? `Kategori: ${navn}` : 'Kategori';

  const data = await loadRecipes();
  const filtered = navn ? data.filter(r => (r.categories || []).includes(navn)) : data;
  el.innerHTML = filtered.map(recipeCard).join('') || '<p>Ingen opskrifter i denne kategori endnu.</p>';
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  renderLatest(6);
  renderCategoryPage();
});
