/* ============================================================
   Studio Sygnatura v2 — wspólny układ (pasek, nagłówek, stopka, karty)
   Układ wg makiety strony głównej, ale bez elementów, których nie ma:
   - brak konta i koszyka (nie działają) — zamiast nich telefon,
     e-mail i przycisk „Zapytaj o wycenę”,
   - wszystkie dane (telefon, e-mail, produkty, ceny, zdjęcia) pochodzą
     z data/dane.js, czyli z plików produkcyjnych,
   - gdy zdjęcia nie ma w danych, renderuje się szary placeholder,
     nigdy wymyślona grafika.
   ============================================================ */
(function () {
  'use strict';
  const D = window.SYG_DANE || {};
  const F = D.firma || {};
  const Q = new URLSearchParams(location.search);

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const zl = (n) => String(Math.round(Number(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' zł';

  const I = {
    tel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 16.2v2.6a2 2 0 0 1-2.2 2 18.6 18.6 0 0 1-8.1-2.9 18.3 18.3 0 0 1-5.6-5.6A18.6 18.6 0 0 1 1.7 4.1 2 2 0 0 1 3.7 1.9h2.6a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.5 2.1L7.3 9.5a14.8 14.8 0 0 0 6.6 6.6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.6 2.6.7a2 2 0 0 1 1.7 2Z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="15" rx="1.5"/><path d="m3 6.3 9 6.7 9-6.7"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10.2c0 5.5-8 11.8-8 11.8S4 15.7 4 10.2a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.7"/></svg>',
    zegar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7.6V12l3 1.9"/></svg>',
    szukaj: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20.5 20.5-4.2-4.2"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 6.5h17v13h-17z"/><path d="M3.5 6.5 12 12l8.5-5.5"/></svg>',
    kciuk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 10.5h3v9h-3z"/><path d="M6.5 19.5h9.8a2 2 0 0 0 2-1.6l1.2-6a2 2 0 0 0-2-2.4h-4.1l.7-4a1.6 1.6 0 0 0-1.6-1.9h-.6L6.5 10.5"/></svg>',
    liscie: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19c8 0 13-5 13-13-8 0-13 5-13 13Z"/><path d="M5 19c2.4-5 5-8 9-10"/></svg>',
    serce: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20.2S3.6 15 3.6 9.4A4.6 4.6 0 0 1 12 6.8a4.6 4.6 0 0 1 8.4 2.6c0 5.6-8.4 10.8-8.4 10.8Z"/></svg>',
    prezent: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 8.5h17v3.6h-17z"/><path d="M5 12.1h14v8.4H5z"/><path d="M12 8.5v12"/><path d="M12 8.5S10.6 3.8 8.3 3.8a2.4 2.4 0 0 0 0 4.7M12 8.5s1.4-4.7 3.7-4.7a2.4 2.4 0 0 1 0 4.7"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.6" r=".9" fill="currentColor" stroke="none"/></svg>',
    strzalka: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15"/><path d="m13 6 6 6-6 6"/></svg>',
    dalej: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    zamknij: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    dzwonek: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 9.5a5.5 5.5 0 0 1 11 0c0 4 1.5 5.5 1.5 5.5H5s1.5-1.5 1.5-5.5Z"/><path d="M10 18.5a2 2 0 0 0 4 0"/></svg>',
    ramka: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16v16H4z"/><path d="m4 16 5-5 4 4 3-3 4 4"/><circle cx="9" cy="9" r="1.4"/></svg>',
    fb: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5V11H8.5v3H11v7h2.5z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.15" fill="currentColor" stroke="none"/></svg>',
    pin2: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.9 0 1.3.6 1.3 1.4 0 .9-.6 2.2-.9 3.4-.2 1 .5 1.8 1.5 1.8 1.8 0 3.2-1.9 3.2-4.7 0-2.4-1.8-4.1-4.3-4.1-2.9 0-4.6 2.2-4.6 4.4 0 .9.3 1.8.8 2.3l-.3 1.1c-.1.4-.3.5-.6.3-1.1-.5-1.8-2.1-1.8-3.4 0-2.8 2-5.3 5.8-5.3 3 0 5.4 2.2 5.4 5 0 3-1.9 5.4-4.5 5.4-.9 0-1.7-.5-2-1l-.6 2.2c-.2.8-.7 1.7-1 2.3A10 10 0 1 0 12 2z"/></svg>'
  };

  /* Każda pozycja prowadzi do istniejącej strony albo do konkretnej
     sekcji (anchor) — nie tworzymy linków „w pustkę” ani pustych stron. */
  const MENU = [
    ['index.html', 'Start'],
    ['sklep.html', 'Sklep'],
    ['realizacje.html', 'Realizacje'],
    ['wspolpraca.html#okazje', 'Okazje'],
    ['wspolpraca.html#firmy', 'Dla firm'],
    ['pracownia.html', 'Pracownia'],
    ['kontakt.html', 'Kontakt']
  ];

  const biezaca = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const telHref = F.telHref || 'tel:+48538124538';

  /* plaik: szary placeholder, gdy zdjęcia nie ma w danych */
  function foto(klasa, src, alt, szer, wys, atrybuty) {
    if (src) {
      return `<img class="${klasa}" src="${esc(src)}" alt="${esc(alt)}"${szer ? ` width="${szer}" height="${wys}"` : ''} ${atrybuty || 'loading="lazy" decoding="async"'}>`;
    }
    return `<span class="ph-brak ${klasa}" role="img" aria-label="Brak zdjęcia: ${esc(alt)}">${I.ramka}zdjęcie w przygotowaniu</span>`;
  }

  function naglowek() {
    const menu = MENU.map(([href, etykieta], i) => {
      const plik = href.split('#')[0];
      const pierwszy = MENU.findIndex(m => m[0].split('#')[0] === plik);
      const aktywna = plik === biezaca && pierwszy === i;
      return `<a href="${href}"${aktywna ? ' aria-current="page"' : ''}>${etykieta}</a>`;
    }).join('');

    return `
<a class="skip" href="#tresc">Przejdź do treści</a>
<div class="pasek-info">
  <div class="wrap">${I.dzwonek}<span>Wycena i termin realizacji po ustaleniu projektu — <a href="kontakt.html">napisz do nas</a></span></div>
</div>
<header class="site-head">
  <div class="head-top">
    <a class="brand" href="index.html" aria-label="Studio Sygnatura — strona główna">
      <img src="assets/logo-zloty.svg" alt="" width="46" height="46">
      <span class="brand-text"><b>Studio Sygnatura</b><span>drewno · detal · emocje</span></span>
    </a>

    <form class="search" action="szukaj.html" method="get" role="search">
      <label class="sr" for="q-head">Szukaj produktu, kategorii, inspiracji</label>
      <input id="q-head" type="search" name="q" minlength="2" placeholder="Szukaj produktu, kategorii, inspiracji…" autocomplete="off">
      <button type="submit" aria-label="Szukaj">${I.szukaj}</button>
    </form>

    <div class="head-akcje">
      <a class="ha-item tel" href="${esc(telHref)}">
        ${I.tel}<div><b>${esc(F.tel)}</b><span>${esc(F.odpowiedz || '')}</span></div>
      </a>
      <span class="ha-sep" aria-hidden="true"></span>
      <a class="ha-item" href="mailto:${esc(F.mail)}">
        ${I.mail}<div><b>Napisz e-mail</b><span>${esc(F.mail)}</span></div>
      </a>
      <a class="ha-cta" href="kontakt.html">Zapytaj o wycenę ${I.strzalka}</a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-glowna" aria-label="Menu">${I.menu}</button>
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
        <span class="brand-text"><b>Studio Sygnatura</b><span>drewno · detal · emocje</span></span>
      </a>
      <p class="foot-about">Studio Sygnatura to mała pracownia z pasji do drewna i detalu. Tworzymy rzeczy, które mają znaczenie — na zamówienie, ręcznie, w Poznaniu.</p>
    </div>
    <div>
      <h4>Przydatne linki</h4>
      <ul>
        <li><a href="sklep.html">Jak zamawiamy</a></li>
        <li><a href="realizacje.html">Czas realizacji i inspiracje</a></li>
        <li><a href="kontakt.html">Zwroty i reklamacje</a></li>
        <li><a href="kontakt.html">Kontakt i wycena</a></li>
      </ul>
    </div>
    <div>
      <h4>Bądźmy w kontakcie</h4>
      <div class="social">
        <a href="https://www.facebook.com/p/Studio-SygNatura-61595255863642/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Facebook">${I.fb}</a>
        <a href="https://www.instagram.com/studiosygnatura/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram">${I.ig}</a>
        <a href="https://pl.pinterest.com/studiosygnatura/" target="_blank" rel="noopener noreferrer" aria-label="Pinterest" title="Pinterest">${I.pin2}</a>
      </div>
      <form class="newsletter" data-newsletter novalidate>
        <label class="sr" for="news-mail">Adres e-mail do newslettera</label>
        <input id="news-mail" type="email" name="email" placeholder="Twój adres e-mail" autocomplete="email">
        <button type="submit" aria-label="Zapisz się">${I.strzalka}</button>
      </form>
      <p class="newsletter-note" data-newsletter-info>Zapisujemy tylko adres e-mail. Wysyłamy rzadko — nowe rzeczy i terminy.</p>
    </div>
    <div>
      <h4>Kontakt</h4>
      <ul class="foot-contact">
        <li>${I.tel}<a href="${esc(telHref)}">${esc(F.tel)}</a></li>
        <li>${I.mail}<a href="mailto:${esc(F.mail)}">${esc(F.mail)}</a></li>
        <li>${I.pin}<span>${esc(F.obszar)}</span></li>
        <li>${I.zegar}<span>${esc(F.odpowiedz)}</span></li>
      </ul>
      <p class="newsletter-note mt-14">Odbiór osobisty i spotkanie w pracowni — po wcześniejszym uzgodnieniu terminu.</p>
    </div>
  </div>
  <div class="foot-bottom">
    <div>
      <span>© ${new Date().getFullYear()} Studio Sygnatura · Poznań</span>
      <span>Wszystkie prace powstają w naszej pracowni. Podgląd testowy — wersja nieprodukcyjna.</span>
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

  /* karta produktu wg makiety: zdjęcie + kolumna z opisem i ceną */
  function kartaProduktu(p) {
    const od = odznakaProduktu(p);
    const badge = od ? `<span class="badge ${od[1]}">${od[0]}</span>` : '';
    const href = 'produkt.html?id=' + encodeURIComponent(p.id);
    return `
<article class="pcard">
  <a class="pcard-foto" href="${href}" aria-label="${esc(p.nazwa)} — szczegóły">
    ${badge}
    ${p.fotoMala || p.foto
      ? `<img src="${esc(p.fotoMala || p.foto)}" srcset="${esc(p.fotoMala || p.foto)} 420w, ${esc(p.foto || p.fotoMala)} 700w"
             sizes="(max-width:1020px) 40vw, 14vw" alt="${esc(p.nazwa)}" loading="lazy" decoding="async" width="420" height="525">`
      : `<span class="ph-brak" role="img" aria-label="Brak zdjęcia: ${esc(p.nazwa)}">${I.ramka}zdjęcie w przygotowaniu</span>`}
  </a>
  <div class="pcard-body">
    <span class="pcard-cat">${esc(p.kategoria)}</span>
    <h3><a href="${href}">${esc(p.nazwa)}</a></h3>
    <p class="pcard-opis">${esc(p.opis)}</p>
    <span class="pcard-cena">${p.cena ? zl(p.cena) : 'wycena indywidualna'}${p.cena ? `<small>/ ${esc(p.jednostka || 'szt.')}</small>` : ''}</span>
    <div class="pcard-foot">
      <a class="link-arrow" href="${href}">Zobacz produkt ${I.strzalka}</a>
    </div>
  </div>
</article>`;
  }

  function kartaRealizacji(r) {
    const href = r.produkt
      ? `produkt.html?id=${encodeURIComponent(r.produkt)}`
      : `kontakt.html?temat=projekt&projekt=${encodeURIComponent(r.tytul)}`;
    const kotwica = biezaca === 'realizacje.html' ? ` id="${esc(r.slug || '')}"` : '';
    return `
<a class="rcard"${kotwica} href="${href}">
  ${foto('', r.foto, r.tytul, 620, 465)}
  <div class="rcard-body">
    <span class="rcard-cat">${esc(r.kategoria)}</span>
    <h3>${esc(r.tytul)}</h3>
    <p>${esc(r.opis)}</p>
    <span class="rc-foot">${r.produkt ? '<span>Cena w sklepie</span>' : '<span>Na zamówienie</span>'}
      <span class="link-arrow">${r.produkt ? 'Zobacz produkt' : 'Zapytaj o wycenę'} ${I.strzalka}</span></span>
  </div>
</a>`;
  }

  /* ---------- newsletter: bez zmyślonego „zapisano” ---------- */
  function podepnijNewsletter() {
    const f = document.querySelector('[data-newsletter]');
    if (!f) return;
    const info = document.querySelector('[data-newsletter-info]');
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const mail = (f.querySelector('[name="email"]') || {}).value || '';
      const ok = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(mail.trim());
      if (!ok) {
        if (info) info.textContent = 'Podaj poprawny adres e-mail, żeby zapisać się do listy.';
        f.querySelector('[name="email"]').focus();
        return;
      }
      /* Nie mamy jeszcze podłączonej listy mailingowej — mówimy to wprost
         i dajemy działającą drogę: e-mail z prośbą o dopisanie. */
      const href = `mailto:${D.firma.mail}?subject=${encodeURIComponent('Prośba o dopisanie do listy')}`
        + `&body=${encodeURIComponent('Proszę dopisać mnie do listy informacji o nowych rzeczach: ' + mail.trim())}`;
      if (info) {
        info.innerHTML = 'Lista mailingowa nie jest jeszcze podłączona. '
          + `<a class="dopisek-zloty" href="${esc(href)}">Wyślij prośbę e-mailem</a>, `
          + 'a dopiszemy Cię ręcznie.';
      }
    });
  }

  function montuj() {
    const h = document.getElementById('naglowek');
    const f = document.getElementById('stopka');
    if (h) h.outerHTML = naglowek();
    if (f) f.outerHTML = stopka();

    const toggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('nav-glowna');
    if (toggle && nav) {
      toggle.addEventListener('click', () => {
        const otwarte = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(otwarte));
        toggle.innerHTML = otwarte ? I.zamknij : I.menu;
        toggle.setAttribute('aria-label', otwarte ? 'Zamknij menu' : 'Menu');
      });
      nav.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.innerHTML = I.menu; toggle.focus(); }
      });
    }

    const q = Q.get('q');
    if (q && biezaca === 'szukaj.html') {
      const pole = document.getElementById('q-head');
      if (pole) pole.value = q;
    }

    document.querySelectorAll('[data-produkty]').forEach(el => {
      const ile = Number(el.getAttribute('data-ile')) || 0; // 0 = wszystkie
      const lista = (D.produkty || [])
        .slice()
        .sort((a, b) => (a.kolejnosc || 0) - (b.kolejnosc || 0))
        .slice(0, ile > 0 ? ile : undefined);
      el.innerHTML = lista.map(kartaProduktu).join('');
    });

    document.querySelectorAll('[data-realizacje]').forEach(el => {
      const ile = Number(el.getAttribute('data-ile')) || 0;
      const lista = (D.realizacje || []).slice(0, ile > 0 ? ile : undefined);
      el.innerHTML = lista.map(kartaRealizacji).join('');
    });

    podepnijNewsletter();
    document.dispatchEvent(new CustomEvent('sygnatura:gotowe'));
  }

  window.SYG_UI = { esc, zl, I, IKONA: I, kartaProduktu, kartaRealizacji, odznakaProduktu, MENU, foto };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montuj);
  else montuj();
})();
