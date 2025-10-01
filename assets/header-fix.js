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
 * Illustration helper
 * - Inserts hero illustration if <meta name="afo:illustration"> exists
 * - Marks hero with .has-illu so CSS can adjust spacing/layout
 */
(function(){
  var m = document.querySelector('meta[name="afo:illustration"]');
  var slot = document.getElementById('hero-illu-slot');
  if (!m || !slot) return;
  var src = m.getAttribute('content');
  if (!src) return;

  var img = new Image();
  img.src = src;
  img.alt = 'Illustration';
  img.className = 'hero-illu';
  img.loading = 'eager';
  img.decoding = 'async';
  img.onerror = function(){ slot.remove(); };
  img.onload = function(){
    var hero = slot.closest('.hero');
    if (hero) hero.classList.add('has-illu');
  };
  slot.appendChild(img);
})();
