/* /assets/auth.js */
(function(){
  // ===== Supabase init =====
  const SUPABASE_URL = "https://mrcctupzajqetsnalriy.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yY2N0dXB6YWpxZXRzbmFscml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1Nzk1ODMsImV4cCI6MjA4MDE1NTU4M30.5znuLOTGoOl2cAQbJVpujdIFsN98kWp2BUVnKa8G3h8";

  // Tiny supabase client uden ekstern lib (vi bruger REST endpoints for simpelt login via gotrue)
  // Men det er lettere at bruge "@supabase/supabase-js". Hvis du allerede loader den andetsteds,
  // kan du erstatte nedenstående med "const client = supabase.createClient(...)"
  // For at holde det let her, bruger vi den globale scriptmetode:
  function injectSupabase(onload){
    if (window.supabase) return onload();
    const s = document.createElement('script');
    s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js";
    s.async = true;
    s.onload = onload;
    document.head.appendChild(s);
  }

  function ready(fn){
    if (document.readyState === 'complete' || document.readyState === 'interactive') return fn();
    document.addEventListener('DOMContentLoaded', fn);
  }

  // ===== UI helpers =====
  const $ = (sel, root=document)=> root.querySelector(sel);
  const $$ = (sel, root=document)=> Array.from(root.querySelectorAll(sel));
  function show(el){ if(el) el.style.display='block'; }
  function hide(el){ if(el) el.style.display='none'; }
  function text(el, t){ if(el) el.textContent = t; }

  // ===== Favorit util (localStorage + sync) =====
  const LS_KEY = "oa_favs_v1";
  function getFavs(){ try{ return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); }catch(_){ return []; } }
  function setFavs(arr){ localStorage.setItem(LS_KEY, JSON.stringify(arr)); }
  function isFav(id){ return getFavs().some(x => x.id === id); }
  function toggleFav(item){
    const cur = getFavs();
    const ix = cur.findIndex(x => x.id === item.id);
    if (ix >= 0){ cur.splice(ix,1); setFavs(cur); return false; }
    cur.push(item); setFavs(cur); return true;
  }

  // Sync til Supabase (best effort)
  async function syncFav(client, user, item, liked){
    try{
      if (!client || !user) return;
      if (liked){
        await client.from('favorites').upsert({
          user_id: user.id,
          content_id: item.id,
          title: item.title || null,
          url: item.url || location.pathname,
          type: item.type || null
        }, { onConflict: 'user_id,content_id' });
      }else{
        await client.from('favorites').delete().eq('user_id', user.id).eq('content_id', item.id);
      }
    }catch(_){}
  }

  // Marker alle hjerter (data-fav-id) efter state
  function paintHearts(){
    $$('[data-fav-id]').forEach(btn=>{
      const id = btn.getAttribute('data-fav-id');
      btn.setAttribute('aria-pressed', isFav(id) ? 'true' : 'false');
      btn.classList.toggle('is-active', isFav(id));
    });
  }

  // ===== Modal =====
  function openModal(){
    show($('#auth-backdrop')); show($('#auth-modal'));
    // default tab = login
    switchTab('login');
    $('#auth-email')?.focus();
  }
  function closeModal(){
    hide($('#auth-backdrop')); hide($('#auth-modal'));
  }
  function switchTab(tab){
    const loginBtn = $('[data-auth-tab="login"]');
    const signupBtn = $('[data-auth-tab="signup"]');
    if (!loginBtn || !signupBtn) return;
    if (tab === 'login'){
      loginBtn.classList.add('primary'); signupBtn.classList.remove('primary');
      $('#auth-form').setAttribute('data-mode','login');
      text($('#auth-submit'), 'Log ind');
    }else{
      signupBtn.classList.add('primary'); loginBtn.classList.remove('primary');
      $('#auth-form').setAttribute('data-mode','signup');
      text($('#auth-submit'), 'Opret bruger');
    }
    text($('#auth-msg'), '');
  }

  // ===== Header brugerlabel (skifter "Bruger" → fornavn/mail) =====
  function setUserLabel(user){
    const userEntry = document.querySelector('.has-sub > a[href="/#login"]') || document.querySelector('.has-sub > a');
    if (!userEntry) return;
    if (user){
      const name = (user.user_metadata && (user.user_metadata.full_name || user.user_metadata.name)) || user.email;
      userEntry.innerHTML = '<svg class="ico-inline"><use href="#user"></use></svg>' + (name || 'Min konto');
    }else{
      userEntry.innerHTML = '<svg class="ico-inline"><use href="#user"></use></svg>Bruger';
    }
  }

  // ===== Hovedflow =====
  ready(function(){
    injectSupabase(async function(){
      const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      // Intercept "Log ind" links (a[href^="/#login"] og a[href="#login"])
      document.addEventListener('click', function(e){
        const a = e.target.closest('a');
        if (!a) return;
        const href = a.getAttribute('href') || '';
        if (a.matches('[data-login-trigger]')) {
  e.preventDefault();
  e.stopPropagation();
  closeAllMenus();
  openModal();
}
        if (href === '#logout' || href === '/#logout'){
          e.preventDefault(); client.auth.signOut().then(()=>{ setUserLabel(null); });
        }
      });

      // Tabs
      $('[data-auth-tab="login"]')?.addEventListener('click', ()=> switchTab('login'));
      $('[data-auth-tab="signup"]')?.addEventListener('click', ()=> switchTab('signup'));

      // Luk
      $('#auth-close')?.addEventListener('click', closeModal);
      $('#auth-backdrop')?.addEventListener('click', closeModal);
      document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal(); });

      // Form submit
      $('#auth-form')?.addEventListener('submit', async function(e){
        e.preventDefault();
        const mode = this.getAttribute('data-mode') || 'login';
        const email = $('#auth-email')?.value?.trim();
        const pass = $('#auth-pass')?.value || '';
        const msg = $('#auth-msg');

        if (!email || !pass){ text(msg, 'Udfyld e-mail og adgangskode.'); return; }
        text(msg, 'Arbejder…');

        try{
          if (mode === 'signup'){
            const { data, error } = await client.auth.signUp({ email, password: pass });
            if (error) throw error;
            text(msg, 'Vi har sendt en bekræftelsesmail. Tjek din indbakke.');
          }else{
            const { data, error } = await client.auth.signInWithPassword({ email, password: pass });
            if (error) throw error;
            text(msg, 'Logget ind!'); setTimeout(closeModal, 350);
          }
        }catch(err){
          text(msg, err.message || 'Noget gik galt.');
        }
      });

      // Session onload
      client.auth.getSession().then(({ data })=>{
        const user = data?.session?.user || null;
        setUserLabel(user);
      });
      client.auth.onAuthStateChange((_evt, session)=>{
        setUserLabel(session?.user || null);
      });

      // Favorit klik-håndtering (data-fav-id + optional data-fav-title, data-fav-url, data-fav-type)
      document.addEventListener('click', async function(e){
        const btn = e.target.closest('[data-fav-id]');
        if (!btn) return;
        e.preventDefault();
        const id = btn.getAttribute('data-fav-id');
        const item = {
          id,
          title: btn.getAttribute('data-fav-title') || document.title,
          url: btn.getAttribute('data-fav-url') || location.pathname,
          type: btn.getAttribute('data-fav-type') || null
        };
        const liked = toggleFav(item);
        paintHearts();

        // sync hvis logget ind
        const { data } = await client.auth.getUser();
        if (data?.user) syncFav(client, data.user, item, liked);
      });

      // Paint hearts ved load
      paintHearts();
    });
  });
})();
