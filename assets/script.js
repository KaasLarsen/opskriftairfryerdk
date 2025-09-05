// simpel søgning (placeholder – skift til rigtig søgning når du har data)
window.siteSearch = function(){
  const q = (document.getElementById('q')?.value || '').trim();
  if(!q){ alert('skriv hvad du søger 😊'); return; }
  alert('søger efter: ' + q + '\n(implementér rigtig søgning senere)');
};

// fold-ud kategorier er native <details> – ingen JS nødvendigt
