(function () {

  // Favorit-opbevaring i localStorage
  var STORAGE_KEY = "oa_favorites";

  function getFavorites() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveFavorites(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function isFavorite(url) {
    return getFavorites().includes(url);
  }

  function toggleFavorite(url) {
    var list = getFavorites();
    if (list.includes(url)) {
      list = list.filter(x => x !== url);
    } else {
      list.push(url);
    }
    saveFavorites(list);
  }

  // Venter på at alt (inkl. data-include content) er loaded
  function onContentReady(callback) {
    if (document.readyState === "complete") {
      setTimeout(callback, 50);
    } else {
      window.addEventListener("load", function () {
        setTimeout(callback, 50); // vent til include.js er færdig
      });
    }
  }

  onContentReady(function () {

    // Find h1
    var h1 = document.querySelector(".hero h1");
    if (!h1) return;

    var currentUrl = window.location.pathname;

    // Opret hjerteknap
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "fav-toggle";
    btn.textContent = "♥";
    btn.setAttribute("aria-label", "Gem opskrift");

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

    // Tilføj hjertet i h1
    h1.appendChild(btn);
  });

})();
