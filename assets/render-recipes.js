(function(){
  function byDateDesc(a,b){ return (new Date(b.date)) - (new Date(a.date)); }
  function iconSvg(id){
    return '<div class="thumb-icon"><svg><use href="#'+(id||'star')+'"/></svg></div>';
  }
  function cardHTML(rec){
    return [
      '<a class="card" href="/opskrifter/'+rec.slug+'.html">',
        iconSvg(rec.icon),
        '<div class="card-body">',
          '<h3>'+rec.title+'</h3>',
          rec.meta ? '<p class="meta">'+rec.meta+'</p>' : '',
        '</div>',
      '</a>'
    ].join('');
  }
  function renderLatest(n, mountId){
    var mount = document.getElementById(mountId || 'seneste-grid');
    if(!mount || !window.RECIPES){ return; }
    var html = window.RECIPES.slice().sort(byDateDesc).slice(0, n || 6).map(cardHTML).join('');
    mount.innerHTML = html;
  }
  function renderCategory(catName, mountId){
    var mount = document.getElementById(mountId || 'kategori-grid');
    if(!mount || !window.RECIPES){ return; }
    var q = (catName || '').toLowerCase();
    var list = window.RECIPES.filter(r => (r.categories||[]).some(c => c.toLowerCase()===q))
                             .sort(byDateDesc);
    mount.innerHTML = list.map(cardHTML).join('') || '<p class="meta">Ingen opskrifter i denne kategori endnu.</p>';
  }
  function renderAll(mountId){
    var mount = document.getElementById(mountId || 'alle-grid');
    if(!mount || !window.RECIPES){ return; }
    mount.innerHTML = window.RECIPES.slice().sort(byDateDesc).map(cardHTML).join('');
  }
  window.AFO = { renderLatest, renderCategory, renderAll };
})();
