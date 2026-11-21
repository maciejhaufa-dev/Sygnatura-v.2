/* Renders the current public-home layout from the same admin settings store. */
(function () {
  'use strict';
  var FALLBACK = {
    hero: { title: 'Z miłości do drewna', copy: 'Personalizowane drewniane tablice, szopki i dekoracje na wyjątkowe chwile.', image: 'assets/media/sklep/szyld-czesc-profesjonalne.jpg' },
    cards: [
      { category: 'Dekoracje świąteczne', title: 'Szopka bożonarodzeniowa (warstwowa)', description: '', price: '319 zł / szt.', cta: 'Zapytaj o produkt →', image: 'assets/media/sklep/szopka.jpg' },
      { category: 'Szyldy i tablice', title: 'Szyld powitalny „Cześć!”', description: 'To wzór pokazowy — nie jest na sprzedaż. Przygotujemy szyld według Twojego projektu.', price: '', cta: 'Prześlij projekt do wyceny →', image: 'assets/media/sklep/szyld-czesc-profesjonalne.jpg' },
      { category: 'Prezenty personalizowane', title: 'Metryczka', description: '', price: '269 zł / szt.', cta: 'Zapytaj o metryczkę →' }
    ]
  };
  function text(id, value) { var e = document.getElementById(id); if (e) e.textContent = String(value == null ? '' : value); }
  function image(id, src) {
    var e = document.getElementById(id);
    src = String(src || '').trim();
    if (src.replace(/^\.\//, '') === 'assets/media/sklep/szyld.jpg') src = 'assets/media/sklep/szyld-czesc-profesjonalne.jpg';
    if (e && (/^https:\/\//i.test(src) || /^(assets|uploads)\/[A-Za-z0-9._/-]+\.(?:jpe?g|png|webp|gif)$/i.test(src))) e.src = src;
  }
  function description(id, value) {
    var e = document.getElementById(id);
    if (!e) return;
    e.textContent = String(value || '');
    e.hidden = !String(value || '').trim();
    e.style.display = e.hidden ? 'none' : '';
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
      if (price) { price.textContent = String(c.price || ''); price.hidden = !String(c.price || '').trim(); price.style.display = price.hidden ? 'none' : ''; }
      text('home-card' + n + '-cta', c.cta);
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
  if (!window.SYG || typeof window.SYG.wezwij !== 'function') return;
  window.SYG.wezwij('strona-glowna-pobierz', {}).then(function (response) {
    if (response && response.ok && response.dane && response.dane.landing) render(response.dane.landing);
  }).catch(function (error) { console.warn('Nie udało się pobrać ustawień nowego układu strony głównej.', error); });
})();
