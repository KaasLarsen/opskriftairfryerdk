(function () {
  // Hjælpere
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Læs per-side overrides fra meta-tags (valgfrit)
  const meta = (name) => $(`meta[name="${name}"]`)?.getAttribute("content") || null;
  const ratingValueMeta  = meta("afo:ratingValue");
  const ratingCountMeta  = meta("afo:ratingCount");
  const imageMeta        = $('meta[property="og:image"]')?.getAttribute("content") || meta("afo:image");

  const ratingValue = ratingValueMeta ?? (typeof window.AFO_RATING_DEFAULT_VALUE === "number" ? window.AFO_RATING_DEFAULT_VALUE : null);
  const ratingCount = ratingCountMeta ?? (typeof window.AFO_RATING_DEFAULT_COUNT === "number" ? window.AFO_RATING_DEFAULT_COUNT : null);

  // Find eksisterende Recipe JSON-LD
  const recipeScripts = $$('script[type="application/ld+json"]').map(s => {
    try {
      const json = JSON.parse(s.textContent.trim());
      return { node: s, json };
    } catch (e) { return null; }
  }).filter(Boolean);

  const recipeEntry = recipeScripts.find(entry => {
    const j = entry.json;
    if (!j) return false;
    if (Array.isArray(j)) return j.some(x => x && x['@type'] === 'Recipe');
    return j['@type'] === 'Recipe';
  });

  if (!recipeEntry) return; // Ikke en opskriftsside – intet at gøre

  // Hent/normalisér Recipe-objektet (og bevar øvrige scripts urørt)
  let recipe = recipeEntry.json;
  let container = recipeEntry.node;

  if (Array.isArray(recipe)) {
    const idx = recipe.findIndex(x => x && x['@type'] === 'Recipe');
    if (idx === -1) return;
    recipe = recipe[idx];
    // Vi kommer kun til at erstatte hele scriptet, så fold evt. tilbage i array:
    recipeEntry._originalArray = recipeEntry.json;
    recipeEntry._recipeIndex = idx;
  }

  // Udfyld image hvis mangler
  if (!recipe.image) {
    const img =
      imageMeta ||
      $('main img')?.src ||
      window.AFO_IMAGE_FALLBACK ||
      null;
    if (img) recipe.image = img;
  }

  // Tilføj/overskriv aggregateRating hvis vi har tal
  if (ratingValue && ratingCount) {
    recipe.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": String(ratingValue),
      "ratingCount": String(ratingCount)
    };
    // Indsæt synlig stjerneblok så markup stemmer med siden
    injectVisibleStars(ratingValue, ratingCount);
  }

  // Skriv JSON-LD tilbage (bevarer alt andet uændret)
  let finalJSON = recipe;
  if (recipeEntry._originalArray) {
    const arr = recipeEntry._originalArray;
    arr[recipeEntry._recipeIndex] = recipe;
    finalJSON = arr;
  }
  container.textContent = JSON.stringify(finalJSON, null, 2);

  // ————— UI: synlig stjerneblok —————
  function injectVisibleStars(value, count) {
    // Allerhelst under H1 eller meta-linjen i hero
    const target = $('h1')?.parentElement || $('main') || document.body;
    if (!target || $('.afo-stars')) return;

    const wrap = document.createElement('div');
    wrap.className = 'afo-stars';
    const rounded = Math.round((+value + Number.EPSILON) * 10) / 10;

    wrap.innerHTML = `
      <div class="afo-stars-row" aria-label="Bedømmelse ${rounded} ud af 5 baseret på ${count} anmeldelser">
        ${renderStars(rounded)}
        <span class="afo-stars-text"><strong>${rounded}</strong> (${count})</span>
      </div>
    `;

    // Indsæt før første .badges hvis findes, ellers lige under H1-blokken
    const badges = $('.badges', target);
    if (badges) badges.insertAdjacentElement('beforebegin', wrap);
    else target.insertAdjacentElement('beforeend', wrap);
  }

  function renderStars(val) {
    // Viser hele stjerner, runder ned til hele — som ønsket i dine retningslinjer
    const full = Math.max(0, Math.min(5, Math.floor(val)));
    const empty = 5 - full;
    return '★'.repeat(full) + '☆'.repeat(empty);
  }
})();
