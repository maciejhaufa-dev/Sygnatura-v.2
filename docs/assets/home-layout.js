/* Renders the current public-home layout from the same admin settings store. */
(function () {
  'use strict';
  var FALLBACK = {
    hero: { title: 'Z miłości do drewna', copy: 'Personalizowane drewniane tablice, szopki i dekoracje na wyjątkowe chwile.', image: 'assets/media/sklep/szyld-czesc-profesjonalne.png?v=sitecream-1' },
    cards: [
      { category: 'Dekoracje świąteczne', title: 'Szopka bożonarodzeniowa (warstwowa)', description: '', price: '', cta: 'Zobacz realizację →', image: 'assets/media/sklep/szopka.jpg' },
      { category: 'Szyldy i tablice', title: 'Szyld powitalny „Cześć!”', description: 'To wzór pokazowy — nie jest na sprzedaż. Przygotujemy szyld według Twojego projektu.', price: '', cta: 'Zobacz realizację →', image: 'assets/media/sklep/szyld-czesc-profesjonalne.png?v=sitecream-1' },
      { category: 'Prezenty personalizowane', title: 'Metryczka', description: '', price: '', cta: 'Zobacz realizację →' }
    ]
  };
  function text(id, value) { var e = document.getElementById(id); if (e) e.textContent = String(value == null ? '' : value); }
  function image(id, src) {
    var e = document.getElementById(id);
    src = String(src || '').trim();
    var path = src.replace(/^\.\//, ''), pathNoQuery = path.split('?')[0], polished = 'assets/media/sklep/szyld-czesc-profesjonalne.png?v=sitecream-1';
    /* Migrate the previously uploaded angled photo and cache-old local image too,
       so the settings response can never replace the exact-color first paint. */
    if (pathNoQuery === 'assets/media/sklep/szyld.jpg' || pathNoQuery === 'assets/media/sklep/szyld-czesc-profesjonalne.jpg' || /(?:^|\/)uploads\/home-(?:hero|card2)-czesc-[A-Za-z0-9._-]+\.jpg$/i.test(pathNoQuery)) src = polished;
    if (e && (/^https:\/\//i.test(src) || /^(assets|uploads)\/[A-Za-z0-9._/-]+\.(?:jpe?g|png|webp|gif)(?:\?v=[A-Za-z0-9_-]+)?$/i.test(src))) e.src = src;
  }
  function description(id, value) {
    var e = document.getElementById(id);
    if (!e) return;
    e.textContent = String(value || '');
    e.hidden = !String(value || '').trim();
    e.style.display = e.hidden ? 'none' : '';
  }
  function normalizuj(s) { return String(s || '').toLowerCase().replace(/[ąćęłńóśźż]/g,function(c){return {'ą':'a','ć':'c','ę':'e','ł':'l','ń':'n','ó':'o','ś':'s','ź':'z','ż':'z'}[c]||c;}); }
  function dopasujRealizacje(wpisy, produkt) {
    var ranking=(wpisy||[]).filter(function(w){return w&&w.widoczny!==false&&w.id;}).map(function(w){
      var title=normalizuj(w.tytul),category=normalizuj(w.kategoria),product=normalizuj(w.produkt&&w.produkt.nazwa),score=0;
      if(produkt==='szopka'){
        if(title.indexOf('szopk')>=0)score+=100;
        if(product.indexOf('szopk')>=0)score+=25;
        if(category.indexOf('swiatecz')>=0)score+=12;
        if(title.indexOf('warstwow')>=0)score+=8;
      }else{
        if(title.indexOf('czesc')>=0)score+=100;
        if(title.indexOf('napis')>=0)score+=20;
        if(title.indexOf('szyld')>=0||category.indexOf('szyld')>=0)score+=18;
        if(product.indexOf('czesc')>=0||product.indexOf('szyld')>=0)score+=12;
        if(title.indexOf('lustro')>=0)score-=80;
      }
      return {w:w,score:score};
    }).sort(function(a,b){return b.score-a.score;});
    return ranking.length&&ranking[0].score>0?ranking[0].w:null;
  }
  function polaczKartyRealizacjami() {
    SYG.wezwij('blog-lista',{}).then(function(r){
      var posts=r&&r.ok&&Array.isArray(r.wpisy)?r.wpisy:[];
      [['szopka','home-card1-link','home-card1-cta'],['szyld','home-card2-link','home-card2-cta']].forEach(function(item){
        var wpis=dopasujRealizacje(posts,item[0]);if(!wpis)return;
        var href='blog-wpis.html?id='+encodeURIComponent(wpis.id);
        [item[1],item[2]].forEach(function(id){var a=document.getElementById(id);if(a)a.href=href;});
      });
    }).catch(function(){/* realizacje.html pozostaje bezpiecznym fallbackiem */});
  }
  function revealHeroCopy() {
    var copy = document.getElementById('home-hero-copy');
    if (copy) copy.style.visibility = 'visible';
  }
  function render(data) {
    var defaults = FALLBACK;
    var hero = Object.assign({}, defaults.hero, data && data.hero || {});
    var cards = Array.isArray(data && data.cards) ? data.cards : [];
    text('hero-title', hero.title);
    text('home-hero-copy', hero.copy);
    image('home-hero-image', hero.image);
    for (var i = 0; i < 3; i++) {
      var c = Object.assign({}, defaults.cards[i], cards[i] || {}), n = i + 1;
      text('home-card' + n + '-category', c.category);
      text('home-card' + n + '-title', c.title);
      description('home-card' + n + '-description', c.description);
      var price = document.getElementById('home-card' + n + '-price');
      if (price) {
        price.textContent = '';
        price.hidden = true;
        price.style.display = 'none';
      }
      text('home-card' + n + '-cta', 'Zobacz realizację →');
      var fallbackHref = i === 0 ? 'blog-wpis.html?id=1' : (i === 1 ? 'blog-wpis.html?id=2' : 'blog-wpis.html?id=14');
      var photoLink = document.getElementById(i === 2 ? 'metryczka-link' : 'home-card' + n + '-link');
      var ctaLink = document.getElementById('home-card' + n + '-cta');
      if (photoLink) photoLink.href = fallbackHref;
      if (ctaLink) ctaLink.href = fallbackHref;
      if (i < 2) image('home-card' + n + '-image', c.image);
      if (i === 2) {
        var metricPhoto = document.getElementById('metryczka-photo');
        var metricPlaceholder = document.getElementById('metryczka-placeholder');
        if (metricPhoto && c.image) {
          image('metryczka-photo', c.image);
          metricPhoto.dataset.adminOverride = 'true';
          metricPhoto.hidden = false;
          if (metricPlaceholder) metricPlaceholder.hidden = true;
        } else if (metricPhoto) {
          delete metricPhoto.dataset.adminOverride;
        }
      }
    }
  }
  if (!window.SYG || typeof window.SYG.wezwij !== 'function') { revealHeroCopy(); return; }
  polaczKartyRealizacjami();
  window.SYG.wezwij('strona-glowna-pobierz', {}).then(function (response) {
    if (response && response.ok && response.dane && response.dane.landing) render(response.dane.landing);
    revealHeroCopy();
  }).catch(function (error) {
    console.warn('Nie udało się pobrać ustawień nowego układu strony głównej.', error);
    revealHeroCopy();
  });
})();
