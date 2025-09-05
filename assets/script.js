
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#newsletter');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]').value.trim();
      if (!email) { alert('skriv din e-mail 🤗'); return; }
      alert('tak! du bliver tilmeldt når vi går live.');
      form.reset();
    });
  }
});
