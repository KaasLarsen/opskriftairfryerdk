// ultra-let HTML include: <div data-include="/partials/header.html"></div>
(async function injectIncludes(){
  const nodes = Array.from(document.querySelectorAll("[data-include]"));

  // Hjælper: eksekver <script>-tags fra et fragment
  function executeScriptsFrom(fragment){
    const scripts = Array.from(fragment.querySelectorAll("script"));

    for (const old of scripts){
      // Undgå dobbelt-kørsel
      if (old.dataset.executed === "true") continue;

      const s = document.createElement("script");

      // Bevar type/nomodule/defer/async/nonce m.m.
      for (const {name, value} of Array.from(old.attributes)){
        // src håndteres særskilt herunder men vi kopierer øvrige attrs
        if (name === "src") continue;
        s.setAttribute(name, value);
      }

      if (old.src){
        // Eksternt script: kør synkront i rækkefølge (async=false)
        s.src = old.src;
        s.async = false;
      } else {
        // Inline script
        s.textContent = old.textContent || "";
      }

      // Markér originalen, så vi ikke eksekverer igen
      old.dataset.executed = "true";
      // Erstat i DOM på samme position for korrekt scope/ordre
      old.replaceWith(s);
    }
  }

  // Hent + indsæt alle includes (parallel fetch, sekventiel DOM-indsæt for enkelhed)
  await Promise.all(nodes.map(async (el) => {
    const url = el.getAttribute("data-include");
    try {
      const res = await fetch(url, { cache: "no-cache" });
      if (!res.ok) throw new Error("http " + res.status);
      const html = await res.text();

      // Lav fragment af HTML’en
      const range = document.createRange();
      range.selectNode(el);
      const fragment = range.createContextualFragment(html);

      // Erstat placeholder med indholdet
      el.replaceWith(fragment);

      // Eksekver scripts der kom fra include
      executeScriptsFrom(document);
    } catch (e) {
      console.warn("include fail:", url, e);
    }
  }));

  // mark active nav link (uændret)
  const path = location.pathname.replace(/\/index\.html$/, "/");
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:')) return;
    const normalized = href.endsWith('/') ? href : href + (href.endsWith('.html') ? '' : '');
    if (path === normalized || path === href) a.classList.add('active');
  });
})();

// simple search placeholder (uændret)
window.siteSearch = function(){
  const q = (document.getElementById('q')?.value || '').trim();
  if(!q){ alert('skriv hvad du søger 😊'); return; }
  // TODO: skift til rigtig søgning (lunr/elastic/algolia) senere
  location.href = "/soeg.html?q=" + encodeURIComponent(q);
};
