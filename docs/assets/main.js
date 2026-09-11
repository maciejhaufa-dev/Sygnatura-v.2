/* ============================================================
   Studio Sygnatura — wspólny szkielet podstron (main.js)
   Wstrzykuje: czarny pasek, menu, stopkę, baner trybu demo,
   licznik koszyka i pasek postępu.
   Strona deklaruje się atrybutem data-strona="..." na <body>.
   ============================================================ */
(function () {
  const SYG = window.SYG;

  const MENU = [
    ['index.html', 'Strona główna'],
    ['zamowienia.html', 'Zamówienia'],
    ['pracownia.html', 'Pracownia'],
    ['realizacje.html', 'Nasze realizacje'],
    ['wspolpraca.html', 'Współpraca'],
    ['kontakt.html', 'Kontakt']
  ];

  function naglowek(aktywna) {
    let pozycje = '';
    MENU.forEach(function (m) {
      const [href, nazwa] = m;
      pozycje += '<a href="' + href + '"' + (nazwa === aktywna ? ' class="on"' : '') + '>' + nazwa + '</a>';
    });
    pozycje += '<a class="koszyk-link" href="sklep.html" title="Koszyk">Koszyk' +
      '<span class="koszyk-kropka"></span></a>';
    return '' +
      '<div class="topbar"><div class="wrap">' +
      '<span><a href="tel:+48510767076">☎ ' + SYG.TEL + '</a>' +
      '<span style="opacity:.35;margin:0 10px">|</span>' +
      '<a href="mailto:' + SYG.MAIL + '">✉ ' + SYG.MAIL + '</a></span>' +
      '<span class="top-note">odpowiadamy w 1–2 dni robocze</span>' +
      '</div></div>' +
      '<header class="site-head"><div class="wrap">' +
      '<a class="brand" href="index.html"><img src="assets/sygnet.svg" alt="Sygnet Sygnatury">' +
      '<span class="nazwa">syg<em>NATURA</em></span></a>' +
      '<button class="burger" type="button" aria-label="Menu">☰</button>' +
      '<nav class="site-menu" aria-label="Menu główne">' + pozycje + '</nav>' +
      '</div></header>';
  }

  function stopka() {
    return '<div class="wrap">' +
      '<span><a href="regulamin.html">Regulamin</a><span class="sep">·</span>' +
      '<a href="jak-pracujemy.html">Jak pracujemy</a></span>' +
      '<span>© Sygnatura 2026</span></div>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    const aktywna = document.body.getAttribute('data-strona') || '';
    const n = document.getElementById('naglowek');
    if (n) n.innerHTML = naglowek(aktywna);
    const s = document.getElementById('stopka');
    if (s) s.innerHTML = stopka();

    /* baner trybu demo */
    if (SYG.TRYB_DEMO) {
      const b = document.createElement('div');
      b.className = 'demo-banner';
      b.innerHTML = 'TRYB DEMO — dane zapisują się tylko w tej przeglądarce (do testów). ' +
        'Po wdrożeniu Google Apps Script banner zniknie sam.';
      document.body.insertBefore(b, document.body.firstChild);
    }

    /* menu mobilne */
    const burger = document.querySelector('.burger');
    const menu = document.querySelector('.site-menu');
    if (burger && menu) burger.addEventListener('click', function () {
      menu.classList.toggle('otwarte');
    });

    window.KOSZYK.odswiez();
  });

  /* ============ pasek postępu (kamienie milowe) ============ */
  window.PROGRES = {
    wstaw: function (el, etapy, aktualny) {
      if (!el) return;
      let html = '';
      etapy.forEach(function (e, i) {
        const klasa = i < aktualny - 1 ? 'krok zrob' : (i === aktualny - 1 ? 'krok akt' : 'krok');
        html += '<div class="' + klasa + '">' + e + '</div>';
      });
      el.innerHTML = '<div class="progres">' + html + '</div>';
    }
  };

  /* ============ drobne wspólne pomoce ============ */
  window.SYG.zl = function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' zł'; };
  window.SYG.param = function (nazwa) {
    return new URLSearchParams(window.location.search).get(nazwa) || '';
  };
})();
