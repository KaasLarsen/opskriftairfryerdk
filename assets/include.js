// ultra-let HTML include: <div data-include="/partials/header.html"></div>
(async function injectIncludes(){
  const nodes = document.querySelectorAll("[data-include]");
  await Promise.all([...nodes].map(async (el) => {
    const url = el.getAttribute("data-include");
    try {
      const res = await fetch(url, {cache:"no-cache"});
      if (!res.ok) throw new Error("http " + res.status);
      el.outerHTML = await res.text();
    } catch (e) {
      console.warn("include fail:", url, e);
    }
  }));

  // mark active nav link
  const path = location.pathname.replace(/\/index\.html$/, "/");
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:')) return;
    const normalized = href.endsWith('/') ? href : href + (href.endsWith('.html') ? '' : '');
    if (path === normalized || path === href) a.classList.add('active');
  });
})();

// simple search placeholder
window.siteSearch = function(){
  const q = (document.getElementById('q')?.value || '').trim();
  if(!q){ alert('skriv hvad du søger 😊'); return; }
  // TODO: skift til rigtig søgning (lunr/elastic/algolia) senere
  location.href = "/soeg.html?q=" + encodeURIComponent(q);
};
