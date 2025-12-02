// ultra-let HTML include: <div data-include="/partials/header.html"></div>
(async function injectIncludes() {
  const nodes = Array.from(document.querySelectorAll("[data-include]"));

  // Hjælper: eksekver <script>-tags fra et fragment
  function executeScriptsFrom(fragment) {
    const scripts = Array.from(fragment.querySelectorAll("script"));

    for (const old of scripts) {
      // Undgå dobbelt-kørsel
      if (old.dataset.executed === "true") continue;

      const s = document.createElement("script");

      // Bevar type/nomodule/defer/async/nonce m.m.
      for (const { name, value } of Array.from(old.attributes)) {
        if (name === "src") continue;
        s.setAttribute(name, value);
      }

      if (old.src) {
        // Eksternt script: kør synkront i rækkefølge (async=false)
        s.src = old.src;
        s.async = false;
      } else {
        s.textContent = old.textContent || "";
      }

      // Markér originalen, så vi ikke eksekverer igen
      old.dataset.executed = "true";

      // Erstat i DOM på samme position for korrekt scope/ordre
      old.replaceWith(s);
    }
  }

  // Hent + indsæt alle includes
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

      // EKSEKVÉR KUN SCRIPTS FRA DET INDLÆSTE FRAGMENT — IKKE HELE DOKUMENTET
      executeScriptsFrom(fragment);

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

// simple search placeholder (uændret)
window.siteSearch = function () {
  const q = (document.getElementById('q')?.value || '').trim();
  if (!q) { alert('skriv hvad du søger 😊'); return; }
  location.href = "/soeg.html?q=" + encodeURIComponent(q);
};

/* ----------------------------------------------------------
   FAVORITES.JS LOADER – LOADER KUN ÉN GANG GLOBALT
---------------------------------------------------------- */
(function () {
  if (window.favScriptLoaded) return; // forhindrer flere load
  window.favScriptLoaded = true;

  const s = document.createElement("script");
  s.src = "/assets/favorites.js?v=1";
  s.async = false;
  document.body.appendChild(s);
})();
