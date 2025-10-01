<script>
/*!
 * Global sticky-header height measurer.
 * - Detects header height after partial includes load
 * - Updates CSS var --header-h
 * - Keeps it in sync on resize/orientation changes
 * - Works if header DOM changes (ResizeObserver)
 */
(function () {
  var RETRY_MS = 60;

  function findHeader() {
    // Be permissive: support different header markups/classnames
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
    // Write CSS variable for use in CSS
    document.documentElement.style.setProperty('--header-h', h + 'px');
    document.body.classList.add('has-fixed-header');
  }

  function init() {
    var header = findHeader();
    if (!header) {
      // Header may be injected via includes; try again shortly
      return void setTimeout(init, RETRY_MS);
    }

    setHeaderHeight(header);

    // Keep updated on viewport changes
    var update = function () { setHeaderHeight(header); };
    window.addEventListener('resize', update, { passive: true });
    window.addEventListener('orientationchange', update, { passive: true });

    // If header content changes height (menus open, cookie bars, etc.)
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(update);
      ro.observe(header);
    }

    // Nudge scroll if user lands with a hash (older iOS sometimes needs this)
    if (location.hash && document.querySelector(location.hash)) {
      setTimeout(function () {
        try { document.querySelector(location.hash).scrollIntoView(); } catch(e) {}
      }, 0);
    }
  }

  // Wait until everything is loaded (includes, images, etc.)
  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init);
})();
</script>
