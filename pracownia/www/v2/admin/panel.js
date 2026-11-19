/* ============================================================
   Studio Sygnatura — panel pracowni (logika)

   Zasady, których pilnuje ten plik:
   1) Zero atrap — jeśli zapis się nie uda, użytkownik to widzi.
   2) Jedno miejsce zapisu (belka na dole), żeby nie trzeba było
      pamiętać, gdzie się klika.
   3) Wszystko działa z telefonu: duże pola, dolna szuflada, brak hover.
   ============================================================ */
(function () {
  'use strict';

  const API = '';                                  // ten sam serwer co panel
  const KLUCZ_TOKENU = 'syg-token';

  /* Sesja działa na dwa sposoby: ciasteczkiem (najlepiej) albo tokenem
     w nagłówku. Token jest zapasem — jeśli przeglądarka albo proxy
     zgubi ciasteczko, panel i tak się zaloguje. */
  function token() {
    try { return localStorage.getItem(KLUCZ_TOKENU) || ''; } catch { return ''; }
  }
  function zapamietajToken(t) {
    try {
      t ? localStorage.setItem(KLUCZ_TOKENU, t) : localStorage.removeItem(KLUCZ_TOKENU);
    } catch { /* tryb prywatny — zostaje samo ciasteczko */ }
  }
  function zapytanie(droga, opcje) {
    const o = Object.assign({ credentials: 'same-origin' }, opcje || {});
    o.headers = Object.assign({}, o.headers || {});
    const t = token();
    if (t) o.headers.Authorization = 'Bearer ' + t;
    return fetch(API + droga, o);
  }
  const el = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- stan ---------- */
  let stan = { produkty: [], ustawienia: {} };
  let brudne = false;
  let edytowany = -1;

  const POOLA_STRONY = [
    ['hero_tytul', 'Nagłówek na stronie głównej', 'textarea',
      'Dwie linie, np. „Osobiste detale,\nktóre zostają na lata”'],
    ['hero_lead', 'Podtytuł pod nagłówkiem', 'textarea',
      'Krótko — jedna, dwie linie.'],
    ['hero_przycisk', 'Napis na przycisku', 'text', 'np. Zobacz kolekcję'],
    ['sekcja_tytul', 'Tytuł sekcji z produktami', 'text', 'np. Wybrane dla Ciebie']
  ];

  const POOLA_KONTAKTU = [
    ['telefon', 'Telefon', 'text', 'np. 538 124 538'],
    ['mail', 'E-mail', 'text', 'np. kontakt@studiosygnatura.pl'],
    ['obszar', 'Obszar działania', 'text', 'np. Poznań i okolice, woj. wielkopolskie'],
    ['youtube', 'Kanał YouTube', 'text', 'Wklej pełny adres kanału — ikona pojawi się w stopce'],
    ['fb', 'Facebook', 'text', 'Pełny adres profilu'],
    ['ig', 'Instagram', 'text', 'Pełny adres profilu'],
    ['pin', 'Pinterest', 'text', 'Pełny adres profilu']
  ];

  /* ---------- komunikaty ---------- */
  function komunikat(tekst, typ) {
    const s = el('#stan-zapisu');
    if (!s) return;
    s.textContent = tekst;
    s.className = 'stan' + (typ === 'ok' ? ' ok' : '');
    if (typ === 'ok') setTimeout(() => { if (s.textContent === tekst) s.textContent = ''; }, 2600);
  }

  /* ---------- logowanie ---------- */
  const formaLogowania = el('#forma-logowania');
  if (formaLogowania) {
    const haslo = el('#haslo');
    const blad = el('#blad-logowania');
    const pokaz = el('#pokaz');

    pokaz.addEventListener('click', () => {
      const widac = haslo.type === 'text';
      haslo.type = widac ? 'password' : 'text';
      pokaz.textContent = widac ? 'Pokaż' : 'Ukryj';
      pokaz.setAttribute('aria-label', widac ? 'Pokaż hasło' : 'Ukryj hasło');
    });

    formaLogowania.addEventListener('submit', async (e) => {
      e.preventDefault();
      blad.textContent = '';
      const przycisk = formaLogowania.querySelector('button[type=submit]');
      przycisk.disabled = true;
      przycisk.textContent = 'Sprawdzam…';
      if (typeof fetch !== 'function') {
        blad.textContent = 'Ta przeglądarka jest za stara dla panelu. Użyj Chrome albo Safari.';
        przycisk.disabled = false;
        przycisk.textContent = 'Wejdź';
        return;
      }
      try {
        const odp = await fetch(API + '/api/logowanie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ haslo: haslo.value })
        });
        const d = await odp.json().catch(() => ({}));
        if (odp.ok && d.ok) {
          if (d.token) zapamietajToken(d.token);
          await start();
        } else {
          blad.textContent = d.blad || 'Nie udało się zalogować.';
          haslo.select();
        }
      } catch (err) {
        blad.textContent = 'Brak połączenia z serwerem panelu. Sprawdź, czy działa.';
      } finally {
        przycisk.disabled = false;
        przycisk.textContent = 'Wejdź';
      }
    });
  }

  /* ---------- start panelu ---------- */
  async function start() {
    let odp;
    try {
      odp = await zapytanie('/api/stan');
    } catch {
      const b = el('#blad-logowania');
      if (b) b.textContent = 'Brak połączenia z serwerem panelu. Odśwież stronę.';
      return;
    }
    if (odp.status === 401) {
      // sesja nie przeszła — mówimy to wprost zamiast milczeć
      const b = el('#blad-logowania');
      if (b) b.textContent = 'Serwer nie przyjął sesji. Spróbuj ponownie — jeśli błąd wraca, odśwież stronę (Ctrl+R).';
      return;
    }
    const d = await odp.json().catch(() => ({}));
    if (!d.ok) {
      const b = el('#blad-logowania');
      if (b) b.textContent = d.blad || 'Nie udało się wczytać danych panelu.';
      return;
    }
    stan = d;
    el('#ekran-logowania').hidden = true;
    el('#panel').hidden = false;
    rysujProdukty();
    rysujPolaStrony();
    rysujPolaKontaktu();
  }

  /* ---------- produkty ---------- */
  function rysujProdukty() {
    const lista = el('#lista-produktow');
    if (!stan.produkty.length) {
      lista.innerHTML = '<li class="podpowiedz">Nie ma jeszcze produktów. Dodaj pierwszy przyciskiem „+ Dodaj”.</li>';
      return;
    }
    lista.innerHTML = stan.produkty.map((p, i) => `
      <li class="produkt" data-i="${i}">
        ${p.foto
          ? `<img src="${esc(p.foto)}" alt="" loading="lazy">`
          : '<img src="../assets/img/prod-szopka-420.jpg" alt="" style="opacity:.18">'}
        <div class="produkt-dane">
          <div class="produkt-nazwa">${esc(p.nazwa || 'Bez nazwy')}</div>
          <div class="produkt-meta"><b>${p.cena ? esc(p.cena) + ' zł' : 'brak ceny'}</b>${p.kategoria ? ' · ' + esc(p.kategoria) : ''}</div>
        </div>
        <div class="strzalki">
          <button type="button" data-gora="${i}" ${i === 0 ? 'disabled' : ''} aria-label="Przesuń wyżej">↑</button>
          <button type="button" data-dol="${i}" ${i === stan.produkty.length - 1 ? 'disabled' : ''} aria-label="Przesuń niżej">↓</button>
        </div>
      </li>`).join('');
  }

  el('#lista-produktow').addEventListener('click', (e) => {
    const g = e.target.closest('[data-gora]');
    const d = e.target.closest('[data-dol]');
    if (g || d) {
      e.stopPropagation();
      const i = Number((g || d).dataset.gora ?? (g || d).dataset.dol);
      const j = g ? i - 1 : i + 1;
      if (j < 0 || j >= stan.produkty.length) return;
      [stan.produkty[i], stan.produkty[j]] = [stan.produkty[j], stan.produkty[i]];
      brudne = true;
      rysujProdukty();
      return;
    }
    const li = e.target.closest('.produkt');
    if (li) otworzProdukt(Number(li.dataset.i));
  });

  /* ---------- arkusz produktu ---------- */
  function otworzProdukt(i) {
    edytowany = i;
    const p = stan.produkty[i] || {};
    el('#arkusz-tytul').textContent = p.nazwa || 'Nowy produkt';
    el('#arkusz-pola').innerHTML = `
      <div class="pole">
        <label for="p-nazwa">Nazwa produktu</label>
        <input id="p-nazwa" value="${esc(p.nazwa || '')}" placeholder="np. Szopka bożonarodzeniowa">
      </div>
      <div class="pole-dwa">
        <div class="pole">
          <label for="p-cena">Cena (zł)</label>
          <input id="p-cena" type="number" inputmode="decimal" min="0" step="1"
                 value="${p.cena != null ? esc(p.cena) : ''}" placeholder="249">
        </div>
        <div class="pole">
          <label for="p-kategoria">Kategoria</label>
          <input id="p-kategoria" value="${esc(p.kategoria || '')}" placeholder="Dekoracje świąteczne">
        </div>
      </div>
      <div class="pole">
        <label for="p-opis">Opis</label>
        <textarea id="p-opis" placeholder="Dwa, trzy zdania — co to jest i z czego.">${esc(p.opis || '')}</textarea>
      </div>
      <div class="pole">
        <label for="p-foto">Zdjęcie (adres pliku)</label>
        <input id="p-foto" value="${esc(p.foto || '')}" placeholder="assets/img/prod-szopka-420.jpg">
        <p class="podpowiedz">Na razie wklejamy nazwę pliku. Wgrywanie zdjęć z telefonu dołączymy w kolejnym kroku.</p>
      </div>`;
    el('#arkusz').hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function zamknijArkusz() {
    const pola = {
      nazwa: el('#p-nazwa'), cena: el('#p-cena'), kategoria: el('#p-kategoria'),
      opis: el('#p-opis'), foto: el('#p-foto')
    };
    if (pola.nazwa && edytowany >= 0) {
      const p = stan.produkty[edytowany];
      p.nazwa = pola.nazwa.value.trim();
      p.cena = pola.cena.value === '' ? null : Number(pola.cena.value);
      p.kategoria = pola.kategoria.value.trim();
      p.opis = pola.opis.value.trim();
      p.foto = pola.foto.value.trim();
      brudne = true;
      rysujProdukty();
    }
    el('#arkusz').hidden = true;
    document.body.style.overflow = '';
    edytowany = -1;
  }

  el('#arkusz').addEventListener('click', (e) => {
    if (e.target.closest('[data-zamknij]')) zamknijArkusz();
  });
  el('#gotowe').addEventListener('click', zamknijArkusz);

  el('#usun-produkt').addEventListener('click', () => {
    if (edytowany < 0) return;
    if (!confirm('Usunąć ten produkt? Tej zmiany nie da się cofnąć.')) return;
    stan.produkty.splice(edytowany, 1);
    brudne = true;
    el('#arkusz').hidden = true;
    document.body.style.overflow = '';
    edytowany = -1;
    rysujProdukty();
  });

  el('#nowy-produkt').addEventListener('click', () => {
    stan.produkty.push({ id: 'nowy-' + Date.now(), nazwa: '', cena: null, kategoria: '', opis: '', foto: '' });
    brudne = true;
    rysujProdukty();
    otworzProdukt(stan.produkty.length - 1);
    el('#arkusz-tytul').textContent = 'Nowy produkt';
  });

  /* ---------- pola tekstowe strony i kontaktu ---------- */
  function rysujPola(kontener, definicje, zrodlo) {
    kontener.innerHTML = definicje.map(([klucz, etykieta, typ, podpowiedz]) => {
      const wartosc = esc((zrodlo || {})[klucz] || '');
      const pole = typ === 'textarea'
        ? `<textarea id="u-${klucz}" rows="3" placeholder="${esc(podpowiedz)}">${wartosc}</textarea>`
        : `<input id="u-${klucz}" value="${wartosc}" placeholder="${esc(podpowiedz)}">`;
      return `<div class="pole">
        <label for="u-${klucz}">${esc(etykieta)}</label>
        ${pole}
        <p class="podpowiedz">${esc(podpowiedz)}</p>
      </div>`;
    }).join('');
  }

  function rysujPolaStrony() { rysujPola(el('#pola-strony'), POOLA_STRONY, stan.ustawienia); }
  function rysujPolaKontaktu() { rysujPola(el('#pola-kontaktu'), POOLA_KONTAKTU, stan.ustawienia); }

  ['#pola-strony', '#pola-kontaktu'].forEach((sel) => {
    el(sel).addEventListener('input', () => { brudne = true; });
  });

  /* ---------- zapis ---------- */
  el('#zapisz').addEventListener('click', async () => {
    const ustawienia = {};
    [...POOLA_STRONY, ...POOLA_KONTAKTU].forEach(([klucz]) => {
      const pole = el('#u-' + klucz);
      if (pole) ustawienia[klucz] = pole.value;
    });

    const przycisk = el('#zapisz');
    przycisk.disabled = true;
    komunikat('Zapisuję…');
    try {
      const odp = await zapytanie('/api/zapisz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produkty: stan.produkty, ustawienia })
      });
      const d = await odp.json().catch(() => ({}));
      if (odp.ok && d.ok) {
        stan.ustawienia = { ...stan.ustawienia, ...ustawienia };
        brudne = false;
        komunikat('Zapisane', 'ok');
      } else {
        komunikat(d.blad || 'Nie udało się zapisać');
      }
    } catch (err) {
      komunikat('Brak połączenia — nic nie zapisano');
    } finally {
      przycisk.disabled = false;
    }
  });

  /* ---------- wylogowanie ---------- */
  el('#przycisk-wyloguj').addEventListener('click', async () => {
    await zapytanie('/api/wyloguj', { method: 'POST' }).catch(() => {});
    zapamietajToken('');
    location.reload();
  });

  /* ---------- ostrzeżenie o niezapisanych zmianach ---------- */
  window.addEventListener('beforeunload', (e) => {
    if (!brudne) return;
    e.preventDefault();
    e.returnValue = '';
  });

  /* ---------- próba wejścia, gdy sesja już jest ---------- */
  if (typeof fetch === 'function') {
    // przy wejściu: jeśli token/ciasteczko wciąż ważne, wchodzimy bez pytania o hasło
    zapytanie('/api/stan').then((o) => { if (o.ok) start(); }).catch(() => {});
  }
})();
