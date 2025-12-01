// /assets/auth.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/* === KONFIG ===
   Udfyld disse to – resten virker automatisk over hele sitet via partials.
*/
const SUPABASE_URL = 'DIN_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'DIN_PUBLIC_ANON_KEY';

/* Gate: kræv login på bestemte stier (smart gate).
   Tom liste = ingen hård blokering. Eksempel: kun madplaner:
*/
const HARD_GATE_PATHS = [/^\/madplan\/.+\.html$/];

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Hjælpere
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
const show = (el, on=true) => el && (el.style.display = on ? '' : 'none');

async function getSession(){
  try { return (await sb.auth.getSession())?.data?.session || null; }
  catch { return null; }
}

function openModal(){ show($('#auth-modal'), true); }
function closeModal(){ show($('#auth-modal'), false); }

async function refreshHeader(){
  const ses = await getSession();
  const btnOpen = $('#btn-open-auth');
  const mini = $('#account-mini');
  const email = $('#acc-email');

  if (ses?.user){
    show(btnOpen, false);
    show(mini, true);
    if (email) email.textContent = ses.user.email || '';
  } else {
    show(mini, false);
    show(btnOpen, true);
  }
}

function wireHeader(){
  const openBtn = $('#btn-open-auth');
  const logout = $('#btn-logout');
  openBtn && openBtn.addEventListener('click', openModal);
  logout && logout.addEventListener('click', async ()=>{ await sb.auth.signOut(); await refreshHeader(); });
}

function wireModal(){
  const form = $('#auth-form');
  const email = $('#auth-email');
  const msg = $('#auth-msg');
  const cancel = $('#auth-cancel');

  form?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    show(msg, true);
    msg.textContent = 'Sender link…';
    const { error } = await sb.auth.signInWithOtp({
      email: email.value.trim(),
      options: { emailRedirectTo: location.origin + location.pathname }
    });
    msg.textContent = error ? ('Kunne ikke sende link: ' + error.message) : 'Tjek din e-mail og klik på login-linket.';
  });

  cancel?.addEventListener('click', closeModal);
}

/* === “Smart gate”:
   1) Elementer med [data-requires-auth] bliver klik-blokeret og åbner modal.
   2) Hele sider på HARD_GATE_PATHS får modal/lock ved manglende login.
*/
function protectInteractive(){
  $$
  ('[data-requires-auth]').forEach(el=>{
    el.addEventListener('click', async (e)=>{
      const ses = await getSession();
      if (!ses?.user){
        e.preventDefault();
        openModal();
      }
    });
  });
}

async function maybeHardGate(){
  const onHardGatePath = HARD_GATE_PATHS.some(rx => rx.test(location.pathname));
  if (!onHardGatePath) return;

  const ses = await getSession();
  if (!ses?.user){
    // lås siden let – uden at ødelægge SEO helt
    openModal();
    document.body.style.overflow = 'hidden';
  }
}

/* === Init === */
document.addEventListener('DOMContentLoaded', async ()=>{
  wireHeader();
  wireModal();
  await refreshHeader();
  protectInteractive();
  await maybeHardGate();

  // Opdater header på auth state changes
  sb.auth.onAuthStateChange(async ()=>{
    await refreshHeader();
    if ($('#auth-modal')) closeModal();
    document.body.style.overflow = ''; // fjern evt. lås når man er logget ind
  });
});
