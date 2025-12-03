/* ============================================================
   /assets/auth.js
   Login-popup + Supabase + favoritter
   Robust version: popup virker også hvis Supabase fejler
============================================================ */

(function () {

  /* --------- Konstanter --------- */
  const SUPABASE_URL = "https://mrcctupzajqetsnalriy.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yY2N0dXB6YWpxZXRzbmFscml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1Nzk1ODMsImV4cCI6MjA4MDE1NTU4M30.5znuLOTGoOl2cAQbJVpujdIFsN98kWp2BUVnKa8G3h8";

  function injectSupabase(onload) {
    if (window.supabase) return onload();
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js";
    s.async = true;
    s.onload = onload;
    s.onerror = function () {
      console.warn("Supabase script kunne ikke indlæses");
    };
    document.head.appendChild(s);
  }

  function ready(fn) {
    if (document.readyState === "complete" || document.readyState === "interactive") return fn();
    document.addEventListener("DOMContentLoaded", fn);
  }

  /* --------- Små helpers --------- */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  function show(el) { if (el) el.style.display = "block"; }
  function hide(el) { if (el) el.style.display = "none"; }
  function text(el, t) { if (el) el.textContent = t; }

  /* --------- Favoritter (localStorage) --------- */
  const LS_KEY = "oa_favs_v1";

  function getFavs() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); }
    catch { return []; }
  }
  function setFavs(arr) { localStorage.setItem(LS_KEY, JSON.stringify(arr)); }
  function isFav(id) { return getFavs().some(x => x.id === id); }

  function toggleFav(item) {
    const cur = getFavs();
    const ix = cur.findIndex(x => x.id === item.id);
    if (ix >= 0) {
      cur.splice(ix, 1);
      setFavs(cur);
      return false;
    }
    cur.push(item);
    setFavs(cur);
    return true;
  }

  function paintHearts() {
    $$("[data-fav-id]").forEach(btn => {
      const id = btn.getAttribute("data-fav-id");
      btn.setAttribute("aria-pressed", isFav(id) ? "true" : "false");
      btn.classList.toggle("is-active", isFav(id));
    });
  }

  /* --------- Modal (popup) --------- */
  function openModal() {
    show($("#auth-backdrop"));
    show($("#auth-modal"));
    switchTab("login");
    $("#auth-email")?.focus();
  }

  function closeModal() {
    hide($("#auth-backdrop"));
    hide($("#auth-modal"));
  }

  function switchTab(tab) {
    const loginBtn  = $('[data-auth-tab="login"]');
    const signupBtn = $('[data-auth-tab="signup"]');
    if (!loginBtn || !signupBtn) return;

    if (tab === "login") {
      loginBtn.classList.add("primary");
      signupBtn.classList.remove("primary");
      $("#auth-form")?.setAttribute("data-mode", "login");
      text($("#auth-submit"), "Log ind");
    } else {
      signupBtn.classList.add("primary");
      loginBtn.classList.remove("primary");
      $("#auth-form")?.setAttribute("data-mode", "signup");
      text($("#auth-submit"), "Opret bruger");
    }
    text($("#auth-msg"), "");
  }

  // Eksponér debug-funktion hvis vi vil teste fra konsollen
  window.__oaOpenLogin = openModal;

  function setUserLabel(user) {
    const userBtn = document.querySelector(".user-btn");
    if (!userBtn) return;

    if (user) {
      const name =
        (user.user_metadata && (user.user_metadata.full_name || user.user_metadata.name)) ||
        user.email;

      userBtn.innerHTML =
        '<svg class="ico-inline"><use href="#user"></use></svg> ' +
        (name || "Min konto") +
        ' <svg class="chev" width="14" height="14"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
    } else {
      userBtn.innerHTML =
        '<svg class="ico-inline"><use href="#user"></use></svg> Bruger ' +
        '<svg class="chev" width="14" height="14"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
    }
  }

  /* =====================================================
     MAIN
  ===================================================== */
  ready(function () {

    /* 1) BIND LOGIN-POPUP UANSET SUPABASE  */
    document.addEventListener("click", function (e) {
      const a = e.target.closest("a");
      if (!a) return;

      // Log ind link i dropdown
      if (a.matches("[data-login-trigger]")) {
        e.preventDefault();
        e.stopPropagation();
        openModal();
        return;
      }

      // (evt. senere: data-logout-trigger)
    });

    // Luk via X, backdrop og Escape
    $("#auth-close")?.addEventListener("click", closeModal);
    $("#auth-backdrop")?.addEventListener("click", closeModal);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
    });

    // Sørg for at hjerter får korrekt state, også uden login
    paintHearts();

    /* 2) INITIALISÉR SUPABASE (LOGIN + SYNC)  */
    injectSupabase(function () {
      if (!window.supabase) {
        console.warn("Supabase global findes ikke – login virker ikke, men popup gør.");
        return;
      }

      const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      // Tabs
      $('[data-auth-tab="login"]')?.addEventListener("click", () => switchTab("login"));
      $('[data-auth-tab="signup"]')?.addEventListener("click", () => switchTab("signup"));

      // Form submit (login / signup)
      $("#auth-form")?.addEventListener("submit", async function (e) {
        e.preventDefault();

        const mode  = this.getAttribute("data-mode") || "login";
        const email = $("#auth-email")?.value?.trim();
        const pass  = $("#auth-pass")?.value || "";
        const msg   = $("#auth-msg");

        if (!email || !pass) {
          text(msg, "Udfyld e-mail og adgangskode.");
          return;
        }

        text(msg, "Arbejder…");

        try {
          if (mode === "signup") {
            const { error } = await client.auth.signUp({ email, password: pass });
            if (error) throw error;
            text(msg, "Vi har sendt en bekræftelsesmail. Tjek din indbakke.");
          } else {
            const { error } = await client.auth.signInWithPassword({ email, password: pass });
            if (error) throw error;
            text(msg, "Logget ind!");
            setTimeout(closeModal, 350);
          }
        } catch (err) {
          text(msg, err.message || "Noget gik galt.");
        }
      });

      // Session → skift label i header
      client.auth.getSession().then(({ data }) => {
        setUserLabel(data?.session?.user || null);
      });

      client.auth.onAuthStateChange((_evt, session) => {
        setUserLabel(session?.user || null);
      });

      // Favorit-klik → sync til Supabase
      document.addEventListener("click", async function (e) {
        const btn = e.target.closest("[data-fav-id]");
        if (!btn) return;

        e.preventDefault();

        const id = btn.getAttribute("data-fav-id");
        const item = {
          id,
          title: btn.getAttribute("data-fav-title") || document.title,
          url: btn.getAttribute("data-fav-url") || location.pathname,
          type: btn.getAttribute("data-fav-type") || null
        };

        const liked = toggleFav(item);
        paintHearts();

        try {
          const { data } = await client.auth.getUser();
          if (data?.user) {
            await (async () => {
              try {
                await syncFav(client, data.user, item, liked);
              } catch {}
            })();
          }
        } catch {}
      });
    });
  });

})();
