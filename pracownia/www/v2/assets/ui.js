/* ============================================================
   Studio Sygnatura v2 — wspólny układ (nagłówek, stopka, karty)
   Zasady:
   - Wyszukiwarka prowadzi do szukaj.html?q=… (działa bez JS serwera).
   - Kontakt: tel:, mailto: i formularz na kontakt.html — bez atrap.
   - Nie ma koszyka ani konta: te funkcje nie są tu pokazywane.
   - Karty: nowość → bestseller → okolicznościowy; bestseller tylko,
     gdy dane potwierdzają sprzedaż (data/dane.js → odznaki.bestseller).
   ============================================================ */
(function () {
  'use strict';
  const D = window.SYG_DANE || {};
  const F = D.firma || {};
  const Q = new URLSearchParams(location.search);

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const zl = (n) => String(Math.round(Number(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' zł';

  const IKONA = {
    szukaj: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20.5 20.5-4.2-4.2"/></svg>',
    tel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 16.2v2.6a2 2 0 0 1-2.2 2 18.6 18.6 0 0 1-8.1-2.9 18.3 18.3 0 0 1-5.6-5.6A18.6 18.6 0 0 1 1.7 4.1 2 2 0 0 1 3.7 1.9h2.6a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.5 2.1L7.3 9.5a14.8 14.8 0 0 0 6.6 6.6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.6 2.6.7a2 2 0 0 1 1.7 2Z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="15" rx="1.6"/><path d="m3 6.2 9 6.8 9-6.8"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10.2c0 5.5-8 11.8-8 11.8S4 15.7 4 10.2a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.8"/></svg>',
    zegar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/></svg>',
    liscie: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19c8 0 13-5 13-13-8 0-13 5-13 13Z"/><path d="M5 19c2-5 5-8 9-10"/></svg>',
    tarcza: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.8 4.5 6v6c0 4.6 3.2 8 7.5 9.2 4.3-1.2 7.5-4.6 7.5-9.2V6Z"/><path d="m8.7 12 2.2 2.2 4.3-4.4"/></svg>',
    dloni: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 11V4.6a1.6 1.6 0 0 1 3.2 0V10"/><path d="M11.2 10V3.6a1.6 1.6 0 0 1 3.2 0V10"/><path d="M14.4 10.4V5.6a1.6 1.6 0 0 1 3.2 0V14c0 4-2.6 7-6.6 7-2.6 0-4-1.1-5.3-2.9l-2-3a1.7 1.7 0 0 1 2.7-2L8 15"/></svg>',
    strzalka: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    zamknij: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.6" r=".9" fill="currentColor" stroke="none"/></svg>'
  };

  const MENU = [
    ['index.html', 'Start'],
    ['sklep.html', 'Sklep'],
    ['realizacje.html', 'Realizacje'],
    ['pracownia.html', 'Pracownia'],
    ['wspolpraca.html', 'Współpraca'],
    ['kontakt.html', 'Kontakt']
  ];

  const biezaca = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  function naglowek() {
    const menu = MENU.map(([href, etykieta]) =>
      `<a href="${href}"${href === biezaca ? ' aria-current="page"' : ''}>${etykieta}</a>`).join('');
    return `
<a class="skip" href="#tresc">Przejdź do treści</a>
<header class="site-head">
  <div class="head-top">
    <a class="brand" href="index.html" aria-label="Studio Sygnatura — strona główna">
      <img src="assets/logo.svg" alt="Znak Studio Sygnatura" width="44" height="44">
      <span class="brand-text"><b>Sygnatura</b><span>drewno · światło · detal</span></span>
    </a>
    <form class="search" action="szukaj.html" method="get" role="search">
      <label class="sr" for="q-head">Szukaj produktu lub realizacji</label>
      <input id="q-head" type="search" name="q" minlength="2" placeholder="Szukaj: szopka, szyld, grawer…" autocomplete="off">
      <button type="submit" aria-label="Szukaj">${IKONA.szukaj}</button>
    </form>
    <div class="head-contact">
      <span class="hc-lines">
        <a href="${F.telHref || 'tel:+48538124538'}">${IKONA.tel}${esc(F.tel)}</a>
        <span class="hc-hours">${esc(F.odpowiedz || '')}</span>
      </span>
      <a class="btn" href="kontakt.html">Napisz do nas</a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-glowna" aria-label="Menu">${IKONA.menu}</button>
    </div>
  </div>
  <nav class="head-nav" aria-label="Menu główne">
    <div class="nav-inner" id="nav-glowna">${menu}</div>
  </nav>
</header>`;
  }

  function stopka() {
    return `
<footer class="site-foot">
  <div class="foot-main">
    <div>
      <a class="brand" href="index.html">
        <img src="assets/logo-krem.svg" alt="" width="52" height="52">
        <span class="brand-text"><b>Sygnatura</b><span>drewno · światło · detal</span></span>
      </a>
      <p class="foot-about">Pracownia drewna w Poznaniu. Szopki warstwowe, szyldy, numeracja i prezenty z grawerem — robione ręcznie, na zamówienie.</p>
    </div>
    <div>
      <h4>Sklep</h4>
      <ul>
        <li><a href="sklep.html">Wszystkie produkty</a></li>
        <li><a href="produkt.html?id=katalog-1">Szopka bożonarodzeniowa</a></li>
        <li><a href="produkt.html?id=katalog-2">Szyld powitalny</a></li>
        <li><a href="produkt.html?id=pers-grawer">Grawer okolicznościowy</a></li>
        <li><a href="realizacje.html">Realizacje</a></li>
      </ul>
    </div>
    <div>
      <h4>Pracownia</h4>
      <ul>
        <li><a href="pracownia.html">O nas i technika</a></li>
        <li><a href="wspolpraca.html">Współpraca i okazje</a></li>
        <li><a href="szukaj.html">Szukaj w serwisie</a></li>
        <li><a href="kontakt.html">Kontakt</a></li>
      </ul>
    </div>
    <div>
      <h4>Kontakt</h4>
      <ul class="foot-contact">
        <li>${IKONA.tel}<a href="${F.telHref || ''}">${esc(F.tel)}</a></li>
        <li>${IKONA.mail}<a href="mailto:${esc(F.mail)}">${esc(F.mail)}</a></li>
        <li>${IKONA.pin}<span>${esc(F.obszar)}</span></li>
        <li>${IKONA.zegar}<span>${esc(F.odpowiedz)}</span></li>
      </ul>
    </div>
  </div>
  <div class="foot-bottom">
    <div>
      <span>© ${new Date().getFullYear()} Studio Sygnatura · Poznań</span>
      <span>Wszystkie prace powstają w naszej pracowni.</span>
    </div>
  </div>
</footer>`;
  }

  /* ---------- odznaki: tylko to, co potwierdzają dane ---------- */
  function odznakaProduktu(p) {
    const o = D.odznaki || {};
    if (o.bestseller && o.bestseller.produkt === p.id) return ['Bestseller', 'bestseller'];
    if (o.nowosc && o.nowosc.produkt === p.id) return ['Nowość', 'nowosc'];
    if (o.okolicznosciowy && o.okolicznosciowy.produkt === p.id) return ['Okolicznościowy', 'okolicznosciowy'];
    return null;
  }

  function kartaProduktu(p) {
    const od = odznakaProduktu(p);
    const badge = od ? `<span class="badge ${od[1]}">${od[0]}</span>` : '';
    return `
<article class="pcard">
  <a class="pcard-foto" href="produkt.html?id=${encodeURIComponent(p.id)}" aria-label="${esc(p.nazwa)} — szczegóły">
    ${badge}
    <img src="${esc(p.fotoMala)}" srcset="${esc(p.fotoMala)} 420w, ${esc(p.foto)} 700w"
         sizes="(max-width:640px) 92vw, (max-width:900px) 46vw, 30vw"
         alt="${esc(p.nazwa)}" loading="lazy" decoding="async" width="700" height="875">
  </a>
  <div class="pcard-body">
    <span class="pcard-cat">${esc(p.kategoria)}</span>
    <h3><a href="produkt.html?id=${encodeURIComponent(p.id)}">${esc(p.nazwa)}</a></h3>
    <p class="pcard-opis">${esc(p.opis)}</p>
    <div class="pcard-foot">
      <span class="price">${zl(p.cena)}<small>/ ${esc(p.jednostka || 'szt.')}</small></span>
      <a class="link-arrow" href="produkt.html?id=${encodeURIComponent(p.id)}">Zobacz ${IKONA.strzalka}</a>
    </div>
  </div>
</article>`;
  }

  /* Karta realizacji: prowadzi do produktu tylko wtedy, gdy ten istnieje w sklepie.
     Pozostałe prace mają jasne wyjście — zapytanie o podobną realizację. */
  function kartaRealizacji(r) {
    const tresc = `
  <img src="${esc(r.foto)}" alt="${esc(r.tytul)}" loading="lazy" decoding="async" width="620" height="465">
  <div class="rcard-body">
    <span class="rcard-cat">${esc(r.kategoria)}</span>
    <h3>${esc(r.tytul)}</h3>
    <p>${esc(r.opis)}</p>
    <span class="rc-foot">${r.produkt ? '<span>Cena w sklepie</span>' : '<span>Na zamówienie</span>'}
      <span class="link-arrow">${r.produkt ? 'Zobacz produkt' : 'Zapytaj o wycenę'} ${IKONA.strzalka}</span></span>
  </div>`;
    const href = r.produkt
      ? `produkt.html?id=${encodeURIComponent(r.produkt)}`
      : `kontakt.html?temat=projekt&projekt=${encodeURIComponent(r.tytul)}`;
    const kotwica = biezaca === 'realizacje.html' ? ` id="${esc(r.slug || '')}"` : '';
    return `<a class="rcard"${kotwica} href="${href}">${tresc}</a>`;
  }

  /* ---------- montaż ---------- */
  function montuj() {
    const h = document.getElementById('naglowek');
    const f = document.getElementById('stopka');
    if (h) h.outerHTML = naglowek();
    if (f) f.outerHTML = stopka();

    // menu mobilne
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('nav-glowna');
    if (toggle && nav) {
      toggle.addEventListener('click', () => {
        const otwarte = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(otwarte));
        toggle.innerHTML = otwarte ? IKONA.zamknij : IKONA.menu;
        toggle.setAttribute('aria-label', otwarte ? 'Zamknij menu' : 'Menu');
      });
      nav.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { nav.classList.remove('open'); toggle.focus(); }
      });
    }

    // wpisane hasło zostaje w nagłówku na stronie wyników
    const q = Q.get('q');
    if (q && biezaca === 'szukaj.html') {
      const pole = document.getElementById('q-head');
      if (pole) pole.value = q;
    }

    // rok w stopce
    document.querySelectorAll('[data-rok]').forEach(el => { el.textContent = new Date().getFullYear(); });

    // karty produktów, jeśli strona je deklaruje
    document.querySelectorAll('[data-produkty]').forEach(el => {
      const ile = Number(el.getAttribute('data-ile')) || 0; // 0 = wszystkie
      const lista = (D.produkty || [])
        .slice()
        .sort((a, b) => (a.kolejnosc || 0) - (b.kolejnosc || 0))
        .slice(0, ile > 0 ? ile : undefined);
      el.innerHTML = lista.map(kartaProduktu).join('');
    });
    document.querySelectorAll('[data-realizacje]').forEach(el => {
      const ile = Number(el.getAttribute('data-ile')) || 0; // 0 = wszystkie
      const lista = (D.realizacje || []).slice(0, ile > 0 ? ile : undefined);
      el.innerHTML = lista.map(kartaRealizacji).join('');
    });

    document.dispatchEvent(new CustomEvent('sygnatura:gotowe'));
  }

  window.SYG_UI = { esc, zl, IKONA, kartaProduktu, kartaRealizacji, odznakaProduktu, MENU };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montuj);
  else montuj();
})();
