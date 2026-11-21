/* Renders the current public-home layout from the same admin settings store. */
(function () {
  'use strict';
  var FALLBACK = {
    hero: { title: 'Z miłości do drewna', copy: 'Personalizowane dekoracje na wyjątkowe chwile.', image: 'assets/media/sklep/szyld-czesc-profesjonalne.png?v=sitecream-1' },
    flow: { title: 'Jak działamy', steps: ['Pomysł i kontakt', 'Przygotowanie projektu', 'Wykonanie i odbiór'] },
    points: [
      { title: 'Wykonujemy wszystko sami', copy: 'od projektu po wykończenie' },
      { title: 'Personalizacja', copy: 'stworzona dla Ciebie' },
      { title: 'Wysyłamy w całej Polsce', copy: 'bezpiecznie pod Twoje drzwi' }
    ],
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
      }else if(produkt==='szyld'){
        if(title.indexOf('czesc')>=0)score+=100;
        if(title.indexOf('napis')>=0)score+=20;
        if(title.indexOf('szyld')>=0||category.indexOf('szyld')>=0)score+=18;
        if(product.indexOf('czesc')>=0||product.indexOf('szyld')>=0)score+=12;
        if(title.indexOf('lustro')>=0)score-=80;
      }else if(produkt==='metryczka'){
        if(title.indexOf('metryczk')>=0)score+=120;
        if(product.indexOf('metryczk')>=0)score+=35;
        if(category.indexOf('metryczk')>=0)score+=15;
        if(title.indexOf('krzyzyk')>=0)score-=100;
      }
      return {w:w,score:score};
    }).sort(function(a,b){return b.score-a.score;});
    return ranking.length&&ranking[0].score>0?ranking[0].w:null;
  }
  function ustawZdjecieMetryczki(src) {
    var photo=document.getElementById('metryczka-photo');
    if(!photo||!src)return;
    photo.hidden=true;
    photo.onload=function(){photo.hidden=false;};
    photo.onerror=function(){photo.hidden=true;};
    image('metryczka-photo',src);
    if(photo.complete&&photo.naturalWidth>0)photo.hidden=false;
  }
  function polaczKartyRealizacjami() {
    SYG.wezwij('blog-lista',{}).then(function(r){
      var posts=r&&r.ok&&Array.isArray(r.wpisy)?r.wpisy:[];
      [['szopka','home-card1-link','home-card1-cta'],['szyld','home-card2-link','home-card2-cta'],['metryczka','metryczka-link','home-card3-cta']].forEach(function(item){
        var wpis=dopasujRealizacje(posts,item[0]);if(!wpis)return;
        var href='blog-wpis.html?id='+encodeURIComponent(wpis.id);
        [item[1],item[2]].forEach(function(id){var a=document.getElementById(id);if(a)a.href=href;});
        if(item[0]==='metryczka'){
          var photo=document.getElementById('metryczka-photo');
          if(photo&&photo.dataset.adminOverride!=='true')ustawZdjecieMetryczki(wpis.okladka||(Array.isArray(wpis.galeria)&&wpis.galeria.find(Boolean)));
        }
      });
    }).catch(function(){/* Metryczka pozostaje ukryta zamiast pokazywać fałszywy tekst ładowania. */});
  }
  function revealHeroCopy() {
    ['home-hero-copy','home-process','home-points'].forEach(function(id){
      var node=document.getElementById(id);
      if(node)node.style.visibility='visible';
    });
  }
  function render(data) {
    var defaults = FALLBACK;
    var hero = Object.assign({}, defaults.hero, data && data.hero || {});
    var staleCopy=['Personalizowane drewniane tablice, szopki i dekoracje na wyjątkowe chwile.','Personalizowane drewniane dekoracje na wyjątkowe chwile.'];
    if(staleCopy.indexOf(String(hero.copy||'').trim())>=0)hero.copy=defaults.hero.copy;
    var flow=Object.assign({},defaults.flow,data&&data.flow||{});
    var flowSteps=Array.isArray(flow.steps)?flow.steps:defaults.flow.steps;
    var points=Array.isArray(data&&data.points)?data.points:defaults.points;
    var cards = Array.isArray(data && data.cards) ? data.cards : [];
    text('hero-title', hero.title);
    text('home-hero-copy', hero.copy);
    text('home-process-title',flow.title);
    for(var step=0;step<3;step++)text('home-process-step'+(step+1),flowSteps[step]||defaults.flow.steps[step]);
    for(var point=0;point<3;point++){
      var feature=Object.assign({},defaults.points[point],points[point]||{});
      text('home-point'+(point+1)+'-title',feature.title);
      text('home-point'+(point+1)+'-copy',feature.copy);
    }
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
      var fallbackHref = i === 0 ? 'blog-wpis.html?id=1' : (i === 1 ? 'blog-wpis.html?id=2' : 'realizacje.html');
      var photoLink = document.getElementById(i === 2 ? 'metryczka-link' : 'home-card' + n + '-link');
      var ctaLink = document.getElementById('home-card' + n + '-cta');
      if (photoLink) photoLink.href = fallbackHref;
      if (ctaLink) ctaLink.href = fallbackHref;
      if (i < 2) image('home-card' + n + '-image', c.image);
      if (i === 2) {
        var metricPhoto = document.getElementById('metryczka-photo');
        if (metricPhoto && c.image) {
          metricPhoto.dataset.adminOverride = 'true';
          ustawZdjecieMetryczki(c.image);
        } else if (metricPhoto) {
          delete metricPhoto.dataset.adminOverride;
        }
      }
    }
  }
  if (!window.SYG || typeof window.SYG.wezwij !== 'function') { revealHeroCopy(); return; }
  window.SYG.wezwij('strona-glowna-pobierz', {}).then(function (response) {
    if (response && response.ok && response.dane && response.dane.landing) render(response.dane.landing);
    polaczKartyRealizacjami();
    revealHeroCopy();
  }).catch(function (error) {
    console.warn('Nie udało się pobrać ustawień nowego układu strony głównej.', error);
    polaczKartyRealizacjami();
    revealHeroCopy();
  });
})();
