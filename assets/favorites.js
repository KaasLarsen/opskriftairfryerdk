// /assets/favorites.js
(function () {
  // Nøgle i localStorage
  var STORAGE_KEY = "oa_favorites";

  function getFavorites() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function saveFavorites(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      // ignorer
    }
  }

  function isFavorite(url) {
    var list = getFavorites();
    return list.indexOf(url) !== -1;
  }

  function toggleFavorite(url) {
    var list = getFavorites();
    var idx = list.indexOf(url);
    if (idx === -1) {
      list.push(url);
    } else {
      list.splice(idx, 1);
    }
    saveFavorites(list);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var h1 = document.querySelector("main .hero h1");
    if (!h1) return;

    var currentUrl = window.location.pathname;

    // Opret hjerte-knap
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "fav-toggle";
    btn.setAttribute("aria-label", "Gem opskrift");

    // Brug ♥ som ikon
    btn.textContent = "♥";

    // Start-tilstand
    if (isFavorite(currentUrl)) {
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
    } else {
      btn.setAttribute("aria-pressed", "false");
    }

    btn.addEventListener("click", function () {
      var active = btn.classList.toggle("is-active");
      toggleFavorite(currentUrl);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    // Tilføj hjertet efter h1-tekst
    h1.appendChild(btn);
  });
})();
