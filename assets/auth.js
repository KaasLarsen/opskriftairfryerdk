<!-- /assets/auth.js (v3) -->
<script>
(function(){
  // Indsæt dine keys her (du har givet dem)
  const SUPABASE_URL = "https://mrcctupzajqetsnalriy.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yY2N0dXB6YWpxZXRzbmFscml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1Nzk1ODMsImV4cCI6MjA4MDE1NTU4M30.5znuLOTGoOl2cAQbJVpujdIFsN98kWp2BUVnKa8G3h8";

  function ready(fn){
    if (document.readyState==='complete' || document.readyState==='interactive') return fn();
    document.addEventListener('DOMContentLoaded', fn);
  }

  // Loader Supabase lib hvis ikke til stede
  function loadSupabase(cb){
    if (window.supabase) return cb();
    const s = document.createElement('script');
    s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js";
    s.defer = true;
    s.onload = cb;
    document.head.appendChild(s);
  }

  function initAuthUI(client){
    const form = document.getElementById('auth-email-form');
    const email = document.getElementById('auth-email');
    const google = document.getElementById('auth-google');
    const msg = document.getElementById('auth-msg');

    if (form){
      form.addEventListener('submit', async function(e){
        e.preventDefault();
        msg.textContent = 'Sender login-link...';
        try{
          const { data, error } = await client.auth.signInWithOtp({
            email: email.value.trim(),
            options: { emailRedirectTo: location.origin + "/profil.html" }
          });
          if (error) throw error;
          msg.textContent = 'Tjek din e-mail for login-link ✔';
        }catch(err){
          msg.textContent = 'Fejl: ' + (err.message || 'Kunne ikke sende link');
        }
      });
    }
    if (google){
      google.addEventListener('click', async function(){
        msg.textContent = 'Åbner Google login...';
        try{
          const { data, error } = await client.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: location.origin + '/profil.html' }
          });
          if (error) throw error;
        }catch(err){
          msg.textContent = 'Fejl: ' + (err.message || 'OAuth mislykkedes');
        }
      });
    }

    // Skift “Log ind” → “Min profil” når vi er logget ind
    client.auth.getUser().then(({ data })=>{
      const link = document.querySelector('[data-auth-open]');
      if (!link) return;
      if (data && data.user){
        link.textContent = 'Min profil';
        link.removeAttribute('data-auth-open');
        link.setAttribute('href', '/profil.html');
      }
    });
  }

  ready(function(){
    loadSupabase(async function(){
      const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      // Vent på at partials er indsat (header + modal)
      const observe = new MutationObserver(function(){
        const modal = document.getElementById('auth-modal');
        if (modal){
          observe.disconnect();
          initAuthUI(client);
          // Åbn modal hvis hash er #login (første load)
          if (location.hash === '#login'){
            modal.classList.add('is-open');
            document.documentElement.style.overflow = 'hidden';
          }
        }
      });
      observe.observe(document.body, { childList:true, subtree:true });

      // fallback 2 sekunder senere
      setTimeout(function(){
        if (document.getElementById('auth-modal')) return;
        initAuthUI(client);
      }, 2000);
    });
  });
})();
</script>
