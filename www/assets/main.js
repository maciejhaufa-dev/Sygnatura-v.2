/* ============================================================
   Studio Sygnatura — wspólny szkielet podstron (main.js)
   Układ wg ustaleń właściciela:
   [ czarny pasek: tel + mail ]
   [ logo (lewo) | wyszukiwarka z ładnym tłem + ikony (prawo) ]
   [ menu (lewo) | TYTUŁ STRONY (pod wyszukiwarką)            ]
   [ social     |                                             ]
   [            | TREŚĆ STRONY (osobny blok)                  ]
   [ stopka ]
   Strona deklaruje się atrybutem data-strona="…" na <body>.
   UWAGA: strona główna (index.html) ma własny układ i NIE jest
   dotykana przez ten skrypt (brak main.wrap = pomijamy).
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

  function ikonaSvg(sciezki, widok) {
    return '<svg viewBox="' + (widok || '0 0 24 24') + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + sciezki + '</svg>';
  }
  const SVG_KOSZYK = '<path d="M6 7h12l1.2 13H4.8L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/>';
  const SVG_PANEL = '<circle cx="12" cy="8" r="3.6"/><path d="M5 20c1.4-3.3 3.9-5 7-5s5.6 1.7 7 5"/>';
  const SVG_SZUKAJ = '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>';

  function szkielet(aktywna) {
    let pozycje = '';
    MENU.forEach(function (m) {
      pozycje += '<a href="' + m[0] + '"' + (m[1] === aktywna ? ' class="on"' : '') + '>' + m[1] + '</a>';
    });
    return '' +
      /* czarny pasek: telefon + mail */
      '<div class="topbar"><div class="wrap">' +
      '<span><a href="tel:+48510767076">☎ ' + SYG.TEL + '</a>' +
      '<span style="opacity:.35;margin:0 10px">|</span>' +
      '<a href="mailto:' + SYG.MAIL + '">✉ ' + SYG.MAIL + '</a></span>' +
      '<span class="top-note">odpowiadamy w 1–2 dni robocze</span>' +
      '</div></div>' +
      '<div class="srodek">' +
      /* lewa kolumna: logo, menu, social (wszystko do góry) */
      '<aside class="side">' +
      '<div class="brand-blok">' +
      '<div class="brand-kwadrat"><img src="assets/sygnet.svg" alt="Sygnet Studio Sygnatura"></div>' +
      '<div class="brand-nazwa"><span class="syg">Syg</span><span class="natura">natura</span></div>' +
      '<div class="brand-tag">drewno · światło · detal</div>' +
      '</div>' +
      '<nav class="menu-vert" aria-label="Menu główne">' + pozycje + '</nav>' +
      '<div class="social">' +
      '<a href="#" aria-label="Instagram" title="Instagram — wkrótce"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.15" fill="currentColor" stroke="none"/></svg></a>' +
      '<a href="#" aria-label="Facebook" title="Facebook — wkrótce"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5V11H8.5v3H11v7h2.5z"/></svg></a>' +
      '<a href="#" aria-label="Pinterest" title="Pinterest — wkrótce"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.9 0 1.3.6 1.3 1.4 0 .9-.6 2.2-.9 3.4-.2 1 .5 1.8 1.5 1.8 1.8 0 3.2-1.9 3.2-4.7 0-2.4-1.8-4.1-4.3-4.1-2.9 0-4.6 2.2-4.6 4.4 0 .9.3 1.8.8 2.3l-.3 1.1c-.1.4-.3.5-.6.3-1.1-.5-1.8-2.1-1.8-3.4 0-2.8 2-5.3 5.8-5.3 3 0 5.4 2.2 5.4 5 0 3-1.9 5.4-4.5 5.4-.9 0-1.7-.5-2-1l-.6 2.2c-.2.8-.7 1.7-1 2.3A10 10 0 1 0 12 2z"/></svg></a>' +
      '</div>' +
      '<div class="side-stopka">pracownia: woj. mazowieckie</div>' +
      '</aside>' +
      /* prawa strona: górny blok (wyszukiwarka z tłem + ikony, pod spodem TYTUŁ STRONY) + box treści */
      '<div class="prawa">' +
      '<div class="head">' +
      '<div class="head-gora">' +
      '<form class="szukaj" action="szukaj.html" method="get" role="search">' +
      '<input type="search" name="q" placeholder="Szukaj: szopka, szyld, litery, grawer…" aria-label="Szukaj produktów i realizacji">' +
      '<button type="submit" aria-label="Szukaj">' + ikonaSvg(SVG_SZUKAJ) + '</button>' +
      '</form>' +
      '<div class="head-ikony">' +
      '<a href="koszyk.html" title="Koszyk" aria-label="Koszyk">' +
      '<span class="kropka"></span>' + ikonaSvg(SVG_KOSZYK) + '</a>' +
      '<a href="konto.html" title="Konto — logowanie" aria-label="Konto użytkownika">' + ikonaSvg(SVG_PANEL) + '</a>' +
      '</div>' +
      '</div>' +
      '<h1 class="strona-tytul" id="strona-tytul"></h1>' +
      '</div>' +
      '</div>' +
      '</div>';
  }

  function stopka() {
    return '<span><a href="regulamin.html">Regulamin</a><span class="sep">·</span>' +
      '<a href="jak-pracujemy.html">Jak pracujemy</a></span>' +
      '<span>© Sygnatura 2026 · wersja 28.6</span>';
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
      document.body.classList.add('ma-banner');
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

    /* treść trafia do prawego boxa (pod górnym blokiem) */
    shell.querySelector('.prawa').appendChild(tresc);
    if (stopkaEl) stopkaEl.remove();
    const stopkaNode = document.createElement('footer');
    stopkaNode.className = 'stopka';
    stopkaNode.innerHTML = stopka();
    shell.appendChild(stopkaNode);
    document.body.appendChild(shell);

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
