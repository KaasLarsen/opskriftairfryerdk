<!-- SAVE AS /assets/auth.js (keep ?v=2 in your pages) -->
<script>
(function(){
  // ====== SUPABASE CONFIG – indsæt dine værdier (du har givet dem tidligere) ======
  const SUPABASE_URL = "https://mrcctupzajqetsnalriy.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yY2N0dXB6YWpxZXRzbmFscml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1Nzk1ODMsImV4cCI6MjA4MDE1NTU4M30.5znuLOTGoOl2cAQbJVpujdIFsN98kWp2BUVnKa8G3h8";

  // ====== Lightweight Supabase client (UMD) ======
  // Loader kun én gang
  function loadSupabase(cb){
    if (window.supabase) return cb();
    var s = document.createElement('script');
    s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js";
    s.async = true;
    s.onload = cb;
    document.head.appendChild(s);
  }

  function ready(fn){
    if (document.readyState==='complete' || document.readyState==='interactive') return fn();
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function(){
    const modal = document.getElementById('auth-modal');
    const openers = document.querySelectorAll('[data-auth-open]');
    const closeBtns = document.querySelectorAll('[data-auth-close]');
    const emailForm = document.getElementById('auth-email-form');
    const emailInput = document.getElementById('auth-email');
    const statusEl = document.getElementById('auth-status');
    const userBtn = document.getElementById('auth-user-btn');

    function openModal(){
      if (!modal) return;
      modal.classList.add('is-open');
      document.documentElement.style.overflow='hidden';
      status(""); // reset
    }
    function closeModal(){
      if (!modal) return;
      modal.classList.remove('is-open');
      document.documentElement.style.overflow='';
    }
    function status(msg, ok){
      if (!statusEl) return;
      statusEl.textContent = msg || "";
      statusEl.style.color = ok ? '#16a34a' : 'var(--muted,#475569)';
    }

    openers.forEach(el=>el.addEventListener('click', function(e){ e.preventDefault(); openModal(); }));
    closeBtns.forEach(el=>el.addEventListener('click', function(e){ e.preventDefault(); closeModal(); }));
    modal && modal.addEventListener('click', function(e){ if(e.target===modal) closeModal(); });

    // Init Supabase og bind handlers
    loadSupabase(async function(){
      const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      });

      async function refreshUI(){
        const { data: { user } } = await client.auth.getUser();
        const loginLink = document.querySelector('[data-auth-open]');
        if (user){
          if (userBtn){
            userBtn.textContent = user.email || "Min profil";
            userBtn.style.display = 'inline-block';
          }
          loginLink && (loginLink.style.display='none');
          status("");
          closeModal();
        }else{
          if (userBtn) userBtn.style.display='none';
          loginLink && (loginLink.style.display='inline-block');
        }
      }

      // Email magic link
      emailForm && emailForm.addEventListener('submit', async function(e){
        e.preventDefault();
        const email = (emailInput?.value || "").trim();
        if (!email) return;
        status("Sender link…");
        const { error } = await client.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: window.location.origin + "/profil.html"
          }
        });
        if (error){ status("Kunne ikke sende link: " + error.message); return; }
        status("Tjek din mail for login-link ✅", true);
      });

      // OAuth providers
      document.querySelectorAll('[data-provider]').forEach(btn=>{
        btn.addEventListener('click', async function(){
          const provider = this.getAttribute('data-provider');
          try{
            const { error } = await client.auth.signInWithOAuth({
              provider,
              options: { redirectTo: window.location.origin + "/profil.html" }
            });
            if (error) status("Login fejlede: " + error.message);
          }catch(err){ status("Login fejlede: " + (err?.message||err)); }
        });
      });

      // Lyt på session-ændringer
      client.auth.onAuthStateChange((_event, _session)=>{ refreshUI(); });

      // Første UI-sync
      refreshUI();
    });
  });
})();
</script>
