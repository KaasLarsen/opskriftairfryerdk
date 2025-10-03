/*!
 * Global sticky-header height measurer
 * - Finds header after partial includes
 * - Updates CSS var --header-h
 * - Keeps it in sync on resize/orientation
 * - Uses ResizeObserver if available
 */
(function () {
  var RETRY_MS = 60;

  function findHeader() {
    return (
      document.querySelector('header.site-header') ||
      document.querySelector('.site-header') ||
      document.querySelector('header[role="banner"]') ||
      document.querySelector('header')
    );
  }

  function setHeaderHeight(header) {
    if (!header) return;
    var rect = header.getBoundingClientRect();
    var h = Math.max(48, Math.round(rect.height));
    document.documentElement.style.setProperty('--header-h', h + 'px');
    document.body.classList.add('has-fixed-header');
  }

  function init() {
    var header = findHeader();
    if (!header) {
      return void setTimeout(init, RETRY_MS);
    }

    setHeaderHeight(header);

    var update = function () { setHeaderHeight(header); };
    window.addEventListener('resize', update, { passive: true });
    window.addEventListener('orientationchange', update, { passive: true });

    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(update);
      ro.observe(header);
    }

    // If landing on #hash, ensure anchor is visible
    if (location.hash && document.querySelector(location.hash)) {
      setTimeout(function () {
        try { document.querySelector(location.hash).scrollIntoView(); } catch(e) {}
      }, 0);
    }
  }

  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init);
})();

/*!
 * Illustration helper (idempotent)
 * - Inserts hero illustration from <meta name="afo:illustration">
 * - Ensures only ONE image is ever inserted
 * - Adds .has-illu on .hero when loaded
 */
(function(){
  // Undgå dobbel-kørsel hvis filen er inkluderet flere gange
  if (window.__heroIlluDone) return;
  window.__heroIlluDone = true;

  var meta = document.querySelector('meta[name="afo:illustration"]');
  var slot = document.getElementById('hero-illu-slot');
  var src  = meta && meta.getAttribute('content') ? meta.getAttribute('content').trim() : '';
  if (!meta || !slot || !src) return;

  // Fjern tidligere auto-indsatte (hvis hot-reload / tidligere kørsel)
  try {
    slot.querySelectorAll('img.hero-illu').forEach(function(n){ n.remove(); });
  } catch(e) {}

  // Hvis der allerede findes en hero-illu i slottet, stop
  if (slot.querySelector('img.hero-illu')) return;

  var img = new Image();
  img.src = src;
  img.alt = (document.querySelector('h1') && document.querySelector('h1').textContent
            ? document.querySelector('h1').textContent.trim()
            : 'Illustration');
  img.className = 'hero-illu';
  img.loading = 'eager';
  img.decoding = 'async';

  img.onerror = function(){
    // Hvis billedet fejler, fjern slottet så layout ikke “hulker”
    try { slot.remove(); } catch(e) {}
  };

  img.onload = function(){
    var hero = slot.closest('.hero');
    if (hero) hero.classList.add('has-illu');
  };

  slot.appendChild(img);
})();
