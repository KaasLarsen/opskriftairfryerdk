<!-- /assets/auth.js -->
<script type="module">
/**
 * Opskrift-Airfryer.dk – Supabase Auth (magic link)
 * Drop-in: Indlæs denne fil via /partials/footer.html (allerede gjort).
 * Krav i header/footer:
 *  - #btn-open-auth  (login-knap)
 *  - #btn-logout     (logout-knap)
 *  - #user-email     (vis e-mail)
 *  - #auth-modal     (dialog)
 *  - #auth-form, #auth-email, #auth-send, #auth-close, #auth-note
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// === DINE NØGLER (klientside-ANON er OK) ===
const SUPABASE_URL = 'https://mrcctupzajqetsnalriy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yY2N0dXB6YWpxZXRzbmFscml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1Nzk1ODMsImV4cCI6MjA4MDE1NTU4M30.5znuLOTGoOl2cAQbJVpujdIFsN98kWp2BUVnKa8G3h8';

// === Init klient ===
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// === Små helpers ===
const $ = (s) => document.querySelector(s);

function setLoggedIn(email){
  $('#btn-open-auth')?.style && ($('#btn-open-auth').style.display = 'none');
  $('#btn-logout')?.style && ($('#btn-logout').style.display = 'inline-flex');
  const u = $('#user-email');
  if (u){
    u.textContent = email || '';
    u.style.display = 'inline-flex';
  }
}

function setLoggedOut(){
  $('#btn-open-auth')?.style && ($('#btn-open-auth').style.display = 'inline-flex');
  $('#btn-logout')?.style && ($('#btn-logout').style.display = 'none');
  const u = $('#user-email');
  if (u){
    u.textContent = '';
    u.style.display = 'none';
  }
}

function openModal(){ $('#auth-modal')?.setAttribute('open',''); }
function closeModal(){ $('#auth-modal')?.removeAttribute('open'); }

async function sendMagicLink(email){
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // Sender brugeren tilbage til samme side efter klik
      emailRedirectTo: window.location.href
    }
  });
  if (error) throw error;
  return data;
}

// === Bootstrap ===
function ready(fn){
  if (document.readyState === 'complete' || document.readyState === 'interactive') return fn();
  document.addEventListener('DOMContentLoaded', fn);
}

ready(async function(){
  // Knapper i header
  $('#btn-open-auth')?.addEventListener('click', (e)=>{ e.preventDefault(); openModal(); });
  $('#btn-logout')?.addEventListener('click', async (e)=>{
    e.preventDefault();
    await supabase.auth.signOut();
    setLoggedOut();
  });

  // Modal
  $('#auth-close')?.addEventListener('click', (e)=>{ e.preventDefault(); closeModal(); });

  // Formular
  $('#auth-form')?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const email = /** @type {HTMLInputElement} */($('#auth-email'))?.value?.trim();
    const btn = $('#auth-send');
    const note = $('#auth-note');
    if (!email) return;

    btn.disabled = true;
    note.textContent = 'Sender magic link…';
    try{
      await sendMagicLink(email);
      note.textContent = 'Tjek din e-mail og klik på linket for at logge ind.';
    }catch(err){
      console.error(err);
      note.textContent = 'Kunne ikke sende mail. Prøv igen om lidt.';
    }finally{
      btn.disabled = false;
    }
  });

  // Start med at spørge Supabase om en session
  try{
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email) setLoggedIn(session.user.email); else setLoggedOut();
  }catch(_){ setLoggedOut(); }

  // Lyt på fremtidige auth-ændringer (fx efter magic link redirect)
  supabase.auth.onAuthStateChange((_event, session)=>{
    if (session?.user?.email) setLoggedIn(session.user.email);
    else setLoggedOut();
  });
});
</script>
