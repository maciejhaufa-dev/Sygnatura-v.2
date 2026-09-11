/* ============================================================
   Studio Sygnatura — wspólny szkielet podstron (main.js)
   Układ w 4 segmentach wg ustaleń właściciela:
   A = logo + SYGNATURA (lewa góra) | C = menu pionowe (lewa dół)
   B = czarny pasek kontakt (tel+mail) + social „Znajdź nas na:"
       | wyszukiwarka (lewo) + KOSZYK / PANEL UŻYTKOWNIKA (prawo)
   D = treść podstrony (margines max 20px) | stopka na dole.
   A+C oddziela od B+D brązowo-złota wstążka (max 10px).
   Strona deklaruje się atrybutem data-strona="…" na <body>.
   UWAGA: strona główna (index.html) ma własny układ i NIE jest
   dotykana przez ten skrypt (brak main.wrap = pomijamy).
   ============================================================ */
(function () {
  const SYG = window.SYG;

  /* tryb dotykowy (telefon/tablet — także „wersja na komputer"):
     wymuszamy układ dopasowany do treści z normalnym przewijaniem strony */
  (function () {
    let dotyk = false;
    try {
      dotyk = (window.matchMedia('(pointer:coarse)').matches || window.matchMedia('(hover:none)').matches);
    } catch (e) {}
    if (!dotyk) dotyk = (navigator.maxTouchPoints || 0) > 1;
    if (!dotyk) dotyk = /(Android|iPhone|iPad|iPod|Mobile)/i.test(navigator.userAgent || '');
    if (dotyk) document.documentElement.classList.add('dotyk');
  })();

  const MENU = [
    ['index.html', 'Strona główna'],
    ['zamowienia.html', 'Zamówienia'],
    ['pracownia.html', 'Pracownia'],
    ['realizacje.html', 'Nasze realizacje'],
    ['wspolpraca.html', 'Współpraca'],
    ['kontakt.html', 'Kontakt']
  ];

  /* menu = pozycje stałe + podstrony zarządzane z panelu admina (zakładka „Podstrony").
     Podstrony „pracownia" NIE doklejamy — ma już własny przycisk w menu stałym (pracownia.html). */
  let POZYCJE_MENU = MENU.slice();
  let STRONY_MENU = [];
  function widocznePodstrony(){
    return STRONY_MENU.filter(function (s) { return s.menu && s.slug !== 'pracownia'; })
      .sort(function (a, b) { return (a.kol || 10) - (b.kol || 10); });
  }
  async function ladujPozycjeMenu(){
    try {
      const odp = await SYG.wezwij('strony-lista', {});
      STRONY_MENU = (odp.ok && odp.strony) || [];
      POZYCJE_MENU = MENU.concat(
        widocznePodstrony().map(function (s) { return ['podstrona.html?s=' + encodeURIComponent(s.slug), s.tytul]; })
      );
    } catch (e) { /* brak danych — zostaje menu stałe */ }
    document.querySelectorAll('.menu-vert').forEach(function (nav) {
      nav.innerHTML = pozycjeHtml(document.body.getAttribute('data-strona') || '');
    });
    document.querySelectorAll('.foot-podstrony').forEach(function (el) {
      el.innerHTML = widocznePodstrony().map(function (s2) {
        return '<span class="sep">·</span><a href="podstrona.html?s=' + encodeURIComponent(s2.slug) + '">' + s2.tytul + '</a>';
      }).join('');
    });
  }
  function pozycjeHtml(aktywna){
    return POZYCJE_MENU.map(function (m) {
      return '<a href="' + m[0] + '"' + (m[1] === aktywna ? ' class="on"' : '') + '>' + m[1] + '</a>';
    }).join('');
  }

  function ikonaSvg(sciezki, widok) {
    return '<svg viewBox="' + (widok || '0 0 24 24') + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + sciezki + '</svg>';
  }
  const SVG_KOSZYK = '<path d="M6 7h12l1.2 13H4.8L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/>';
  const SVG_PANEL = '<circle cx="12" cy="8" r="3.6"/><path d="M5 20c1.4-3.3 3.9-5 7-5s5.6 1.7 7 5"/>';
  const SVG_SZUKAJ = '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>';
  const SVG_PIN = '<path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.9 0 1.3.6 1.3 1.4 0 .9-.6 2.2-.9 3.4-.2 1 .5 1.8 1.5 1.8 1.8 0 3.2-1.9 3.2-4.7 0-2.4-1.8-4.1-4.3-4.1-2.9 0-4.6 2.2-4.6 4.4 0 .9.3 1.8.8 2.3l-.3 1.1c-.1.4-.3.5-.6.3-1.1-.5-1.8-2.1-1.8-3.4 0-2.8 2-5.3 5.8-5.3 3 0 5.4 2.2 5.4 5 0 3-1.9 5.4-4.5 5.4-.9 0-1.7-.5-2-1l-.6 2.2c-.2.8-.7 1.7-1 2.3A10 10 0 1 0 12 2z"/>';
  const SVG_YT = '<path d="M23 12s0-3.3-.4-4.9c-.2-.9-.9-1.6-1.8-1.8C19.2 4.9 12 4.9 12 4.9s-7.2 0-8.8.4c-.9.2-1.6.9-1.8 1.8C1 8.7 1 12 1 12s0 3.3.4 4.9c.2.9.9 1.6 1.8 1.8 1.6.4 8.8.4 8.8.4s7.2 0 8.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.6.4-4.9.4-4.9zM9.8 15.3V8.7l6 3.3-6 3.3z"/>';
  const SVG_IG = '<rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.15"/>';
  const SVG_FB = '<path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5V11H8.5v3H11v7h2.5z"/>';

  function szkielet(aktywna) {
    return '' +
      '<div class="srodek">' +
      /* A + C: logo i menu */
      '<aside class="side">' +
      '<div class="brand-blok">' +
      '<div class="brand-kwadrat"><img src="assets/sygnet.svg" alt="Sygnet Studio Sygnatura"></div>' +
      '<div class="brand-nazwa"><span class="syg">Syg</span><span class="natura">natura</span></div>' +
      '<div class="brand-tag">drewno · światło · detal</div>' +
      '</div>' +
      '<nav class="menu-vert" aria-label="Menu główne"></nav>' +
      '</aside>' +
      '<div class="listwa" aria-hidden="true"></div>' +
      /* B + D: prawa kolumna */
      '<div class="prawa">' +
      '<div class="head">' +
      '<div class="head-kontakt">' +
      '<span class="hk-lewa">' +
      '<a href="tel:+48510767076">☎ ' + SYG.TEL + '</a>' +
      '<span class="hk-sep">|</span>' +
      '<a href="mailto:' + SYG.MAIL + '">✉ ' + SYG.MAIL + '</a>' +
      '</span>' +
      '<span class="hk-prawa"><span class="hk-napis">Znajdź nas na:</span>' +
      '<a href="#" aria-label="Pinterest" title="Pinterest"><svg viewBox="0 0 24 24" fill="currentColor">' + SVG_PIN + '</svg></a>' +
      '<a href="#" aria-label="YouTube" title="YouTube"><svg viewBox="0 0 24 24" fill="currentColor">' + SVG_YT + '</svg></a>' +
      '<a href="#" aria-label="Instagram" title="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">' + SVG_IG + '</svg></a>' +
      '<a href="#" aria-label="Facebook" title="Facebook"><svg viewBox="0 0 24 24" fill="currentColor">' + SVG_FB + '</svg></a>' +
      '</span>' +
      '</div>' +
      '<div class="head-gora">' +
      '<form class="szukaj" action="szukaj.html" method="get" role="search">' +
      '<input type="search" name="q" placeholder="Szukaj: szopka, szyld, litery, grawer…" aria-label="Szukaj produktów i realizacji">' +
      '<button type="submit" aria-label="Szukaj">' + ikonaSvg(SVG_SZUKAJ) + '</button>' +
      '</form>' +
      '<div class="head-przyciski">' +
      '<a class="head-przycisk" href="koszyk.html" title="Koszyk" aria-label="Koszyk">' +
      '<span class="kropka"></span>' + ikonaSvg(SVG_KOSZYK) + '<span class="hp-etyk">Koszyk</span></a>' +
      '<a class="head-przycisk" href="konto.html" title="Konto — logowanie" aria-label="Panel użytkownika">' +
      ikonaSvg(SVG_PANEL) + '<span class="hp-etyk">Panel użytkownika</span></a>' +
      '</div>' +
      '</div>' +
      '<h1 class="strona-tytul" id="strona-tytul"></h1>' +
      '</div>' +
      '</div>' +
      '</div>';
  }

  function stopka() {
    const czesci = ['<a href="regulamin.html">Regulamin</a>', '<a href="jak-pracujemy.html">Jak pracujemy</a>'];
    STRONY_MENU.filter(function (s) { return s.menu && s.slug !== 'pracownia'; }).forEach(function (s) {
      czesci.push('<a href="podstrona.html?s=' + encodeURIComponent(s.slug) + '">' + s.tytul + '</a>');
    });
    return '<span>' + czesci.join('<span class="sep">·</span>') + '</span>' +
      '<span>© Sygnatura 2026 · wersja 28.15</span>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    const aktywna = document.body.getAttribute('data-strona') || '';

    /* baner trybu demo — na samej górze */
    if (SYG.TRYB_DEMO) {
      const b = document.createElement('div');
      b.className = 'demo-banner';
      b.innerHTML = 'TRYB DEMO — dane zapisują się tylko w tej przeglądarce (do testów). ' +
        'Po wdrożeniu Google Apps Script banner zniknie sam.';
      document.body.insertBefore(b, document.body.firstChild);
    }

    /* szkielet budujemy TYLKO dla podstron (main.wrap).
       Strona główna ma własny układ — zostawiamy ją nietkniętą. */
    const tresc = document.querySelector('main.wrap');
    if (!tresc) { window.KOSZYK.odswiez(); return; }

    const stopkaEl = document.getElementById('stopka');
    const stary = document.getElementById('naglowek');
    if (stary) stary.remove();
    const shell = document.createElement('div');
    shell.className = 'strona-uklad';
    shell.innerHTML = szkielet(aktywna);

    /* tytuł strony przenosimy POD wyszukiwarkę (górny blok, na wysokości logo) */
    const h1 = tresc.querySelector('h1');
    const tytulEl = shell.querySelector('#strona-tytul');
    if (h1 && tytulEl) tytulEl.appendChild(h1);

    /* treść trafia do prawego boxa (segment D) */
    shell.querySelector('.prawa').appendChild(tresc);
    if (stopkaEl) stopkaEl.remove();
    const listwaNode = document.createElement('div');
    listwaNode.className = 'listwa-poziom';
    listwaNode.setAttribute('aria-hidden', 'true');
    shell.appendChild(listwaNode);
    const stopkaNode = document.createElement('footer');
    stopkaNode.className = 'stopka';
    stopkaNode.innerHTML = stopka();
    shell.appendChild(stopkaNode);
    document.body.appendChild(shell);

    window.KOSZYK.odswiez();
  });

  /* wypełnienie menu (stałe + podstrony z panelu) — na wszystkich stronach z .menu-vert */
  document.addEventListener('DOMContentLoaded', ladujPozycjeMenu);

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
