/* ============================================================
   Studio Sygnatura v2 — TRYB EDYCJI (klik-w-element)

   Do czego to jest: właścicielka otwiera stronę, loguje się raz,
   a potem klika w tekst, który chce zmienić. Panel wysuwa się od dołu,
   pokazuje duże pole, „Zapisz" — i tekst jest już zmieniony.

   Jak włączyć: na końcu adresu strony dopisz  ?edycja=1
   (albo kliknij przycisk „Edytuj stronę", który pojawia się po
   pierwszym wejściu z tym parametrem).

   Bezpieczeństwo: bez zalogowania w panelu tryb się nie włączy —
   strona pyta /api/stan, a serwer odpowiada 401.
   ============================================================ */
(function () {
  'use strict';

  const ADRES_API = window.SYG_API || (location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? (location.port === '8003' ? '' : 'http://' + location.hostname + ':8003')
    : '');

  const Q = new URLSearchParams(location.search);
  const KLUCZ = 'syg-edycja-wlaczona';
  const POLA = window.SYG_POLA || {};

  const KLUCZ_TOKENU = 'syg-token';
  let panel = null;
  let tryb = false;
  let aktywny = null;      // element, który aktualnie edytujemy
  let aktywnyKlucz = null; // nazwa pola
  let produkt = null;      // produkt w edycji (gdy kliknięto kartę)

  /* ---------- narzędzia ---------- */
  const el = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* Sesja: ciasteczko z panelu (ten sam host) albo token z localStorage,
     który panel zapisał przy logowaniu. Token ratuje sytuację, gdy proxy
     podglądu gubi ciasteczka. */
  function token() {
    try { return localStorage.getItem('syg-token') || ''; } catch { return ''; }
  }
  function api(droga, opcje) {
    const o = Object.assign({ credentials: 'include' }, opcje || {});
    o.headers = Object.assign({}, o.headers || {});
    const t = token();
    if (t) o.headers.Authorization = 'Bearer ' + t;
    return fetch(ADRES_API + droga, o);
  }

  function komunikat(tekst, blad) {
    const s = el('#syg-status');
    if (!s) return;
    s.textContent = tekst || '';
    s.style.color = blad ? '#F2A08C' : '#DCC39A';
  }

  /* ---------- pobranie danych produktu do edycji ---------- */
  async function daneProduktu(id) {
    try {
      const odp = await api('/api/stan');
      if (!odp.ok) return null;
      const d = await odp.json();
      return (d.produkty || []).find((p) => p.id === id) || null;
    } catch { return null; }
  }

  /* ---------- zapis jednego pola ---------- */
  async function zapiszPole(klucz, wartosc) {
    const cialo = { ustawienia: {} };
    cialo.ustawienia[klucz] = wartosc;
    const odp = await api('/api/zapisz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cialo)
    });
    if (!odp.ok) {
      const d = await odp.json().catch(() => ({}));
      throw new Error(d.blad || 'Nie udało się zapisać.');
    }
    return odp.json();
  }

  async function zapiszProdukt(zmiany) {
    const odp = await api('/api/zapisz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ produkty: [Object.assign({ id: produkt.id }, zmiany)] })
    });
    if (!odp.ok) {
      const d = await odp.json().catch(() => ({}));
      throw new Error(d.blad || 'Nie udało się zapisać.');
    }
    return odp.json();
  }

  /* ---------- panel ---------- */
  function zbudujPanel() {
    if (panel) return panel;
    panel = document.createElement('div');
    panel.id = 'syg-panel';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Edycja strony');
    document.body.appendChild(panel);
    return panel;
  }

  function zamknijPanel() {
    if (!panel) return;
    panel.hidden = true;
    panel.innerHTML = '';
    aktywny = null;
    aktywnyKlucz = null;
    produkt = null;
  }

  /* ---------- edycja tekstu ---------- */
  function otworzPole(element, klucz) {
    aktywny = element;
    aktywnyKlucz = klucz;
    produkt = null;
    const p = POLA[klucz] || { etykieta: klucz, typ: 'krotkie' };
    const wartosc = klucz === 'hero_tytul' || klucz === 'hero_lead'
      ? element.innerHTML.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim()
      : element.textContent.trim();

    const wielo = p.typ === 'wielo';
    zbudujPanel().innerHTML = `
      <div class="syg-wiersz">
        <span class="syg-etykieta">Edytujesz<b>${esc(p.etykieta)}</b></span>
        <button type="button" class="syg-b poboczny" data-zamknij>Zamknij</button>
      </div>
      ${wielo
        ? `<textarea id="syg-wartosc" rows="3" aria-label="${esc(p.etykieta)}">${esc(wartosc)}</textarea>`
        : `<input id="syg-wartosc" type="text" value="${esc(wartosc)}" aria-label="${esc(p.etykieta)}">`}
      ${wielo ? '<p class="syg-podpowiedz">Enter przechodzi do nowej linii — tak będzie łamany tekst na stronie.</p>' : ''}
      <div class="syg-przyciski">
        <button type="button" class="syg-b glowny" data-zapisz>Zapisz</button>
        <button type="button" class="syg-b poboczny" data-zamknij>Anuluj</button>
      </div>
      <div class="syg-status" id="syg-status" role="status" aria-live="polite"></div>`;
    panel.hidden = false;

    const pole = el('#syg-wartosc');
    if (wielo) {
      pole.style.height = 'auto';
      pole.style.height = Math.min(200, pole.scrollHeight + 4) + 'px';
    }
    pole.focus();
    if (!wielo) pole.select();
    else pole.setSelectionRange(pole.value.length, pole.value.length);
  }

  /* ---------- edycja produktu (karta na stronie) ---------- */
  async function otworzProdukt(element, id) {
    aktywny = element;
    aktywnyKlucz = null;
    produkt = { id };
    zbudujPanel().innerHTML = `<div class="syg-status" id="syg-status">Wczytuję produkt…</div>`;
    panel.hidden = false;

    const d = await daneProduktu(id);
    if (!d) {
      panel.innerHTML = `
        <div class="syg-wiersz"><span class="syg-etykieta">Ten produkt<b>nie jest jeszcze w panelu</b></span>
        <button type="button" class="syg-b poboczny" data-zamknij>Zamknij</button></div>
        <div class="syg-status" id="syg-status">Otwórz go w panelu (zakładka „Produkty") i zapisz — potem będzie klikalny tutaj.</div>`;
      return;
    }
    produkt = d;

    panel.innerHTML = `
      <div class="syg-wiersz">
        <span class="syg-etykieta">Edytujesz produkt<b>${esc(d.nazwa || 'Bez nazwy')}</b></span>
        <button type="button" class="syg-b poboczny" data-zamknij>Zamknij</button>
      </div>
      <label class="syg-podpowiedz" for="syg-prod-nazwa">Nazwa</label>
      <input id="syg-prod-nazwa" type="text" value="${esc(d.nazwa || '')}">
      <div class="syg-wiersz">
        <div>
          <label class="syg-podpowiedz" for="syg-prod-cena">Cena (zł, puste = wycena indywidualna)</label>
          <input id="syg-prod-cena" type="number" inputmode="decimal" min="0" step="1"
                 value="${d.cena != null ? esc(d.cena) : ''}" placeholder="249">
        </div>
      </div>
      <label class="syg-podpowiedz" for="syg-prod-opis">Opis</label>
      <textarea id="syg-prod-opis" rows="3">${esc(d.opis || '')}</textarea>
      <div class="syg-przyciski">
        <button type="button" class="syg-b glowny" data-zapisz-produkt>Zapisz</button>
        <button type="button" class="syg-b poboczny" data-zamknij>Anuluj</button>
      </div>
      <div class="syg-status" id="syg-status" role="status" aria-live="polite"></div>`;
    el('#syg-prod-nazwa').focus();
  }

  /* ---------- obsługa kliknięć w panelu ---------- */
  document.addEventListener('click', async (e) => {
    if (!panel || panel.hidden) return;

    if (e.target.closest('[data-zamknij]')) { zamknijPanel(); return; }

    if (e.target.closest('[data-zapisz]')) {
      const pole = el('#syg-wartosc');
      if (!pole || !aktywnyKlucz) return;
      const przycisk = e.target.closest('[data-zapisz]');
      przycisk.disabled = true;
      komunikat('Zapisuję…');
      try {
        const wynik = await zapiszPole(aktywnyKlucz, pole.value.trim());
        komunikat('Zapisane ✓ Odświeżam stronę…');
        // najprościej i najbezpieczniej: odświeżenie pokazuje dokładnie to,
        // co zobaczą klienci (bez rozjeżdżania układu w połowie edycji)
        setTimeout(() => {
          const u = new URL(location.href);
          u.searchParams.set('wersja', String(wynik.wersja || Date.now()));
          location.href = u.toString();
        }, 450);
      } catch (err) {
        przycisk.disabled = false;
        komunikat(err.message, true);
      }
      return;
    }

    if (e.target.closest('[data-zapisz-produkt]')) {
      const przycisk = e.target.closest('[data-zapisz-produkt]');
      przycisk.disabled = true;
      komunikat('Zapisuję produkt…');
      const cena = el('#syg-prod-cena').value;
      try {
        const wynik = await zapiszProdukt({
          nazwa: el('#syg-prod-nazwa').value.trim(),
          cena: cena === '' ? null : Number(cena),
          opis: el('#syg-prod-opis').value.trim()
        });
        komunikat('Zapisane ✓ Odświeżam stronę…');
        setTimeout(() => {
          const u = new URL(location.href);
          u.searchParams.set('wersja', String(wynik.wersja || Date.now()));
          location.href = u.toString();
        }, 450);
      } catch (err) {
        przycisk.disabled = false;
        komunikat(err.message, true);
      }
    }
  });

  /* ---------- klikanie w stronę ---------- */
  function oznacz() {
    document.querySelectorAll('[data-pole], .pcard').forEach((e) => e.classList.add('syg-edycja'));
  }
  function odznacz() {
    document.querySelectorAll('.syg-edycja').forEach((e) => e.classList.remove('syg-edycja'));
  }

  document.addEventListener('click', (e) => {
    if (!tryb) return;
    // klik w panel edytora nie jest klikiem w stronę
    if (panel && panel.contains(e.target)) return;
    if (e.target.closest('#syg-przycisk')) return;

    const poleEl = e.target.closest('[data-pole]');
    if (poleEl) {
      e.preventDefault();
      e.stopPropagation();
      otworzPole(poleEl, poleEl.getAttribute('data-pole'));
      return;
    }

    const karta = e.target.closest('.pcard');
    if (karta) {
      e.preventDefault();
      e.stopPropagation();
      // id produktu siedzi w linku karty: produkt.html?id=…
      const link = karta.querySelector('a[href*="produkt.html?id="]');
      const id = link ? decodeURIComponent(new URL(link.href).searchParams.get('id')) : null;
      if (id) otworzProdukt(karta, id);
      else komunikat('Ta karta nie prowadzi do produktu w panelu.', true);
    }
  }, true);

  /* Escape zamyka panel */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel && !panel.hidden) zamknijPanel();
  });

  /* ---------- przycisk i włączanie trybu ---------- */
  function przycisk() {
    let b = el('#syg-przycisk');
    if (b) return b;
    b = document.createElement('button');
    b.id = 'syg-przycisk';
    b.type = 'button';
    b.innerHTML = '<b>✎</b> Edytuj stronę';
    b.addEventListener('click', () => wlacz(!tryb));
    document.body.appendChild(b);
    return b;
  }

  function wlacz(stan) {
    tryb = !!stan;
    document.body.classList.toggle('syg-tryb', tryb);
    const b = przycisk();
    b.innerHTML = tryb ? '<b>✕</b> Zakończ edycję' : '<b>✎</b> Edytuj stronę';
    b.setAttribute('aria-pressed', String(tryb));
    if (tryb) { oznacz(); komunikat(''); }
    else { odznacz(); zamknijPanel(); }
    try { localStorage.setItem(KLUCZ, tryb ? '1' : ''); } catch { /* tryb prywatny */ }
  }

  /* Czy jesteśmy zalogowani? Pytamy serwer, ale i sprawdzamy treść
     odpowiedzi — 200 z „ok:false" to jeszcze nie sesja. */
  async function czyZalogowany() {
    try {
      const odp = await api('/api/stan');
      if (!odp.ok) return false;
      const d = await odp.json().catch(() => ({}));
      return d.ok === true;
    } catch { return false; }
  }

  async function start() {
    // ?edycja=1 włącza tryb na stałe (do wyłączenia przyciskiem)
    if (Q.get('edycja') === '1') {
      try { localStorage.setItem(KLUCZ, '1'); } catch { /* ignoruj */ }
    }
    let zapamietane = '';
    try { zapamietane = localStorage.getItem(KLUCZ) || ''; } catch { /* ignoruj */ }

    const zalogowany = await czyZalogowany();

    if (zalogowany) {
      przycisk();
      if (zapamietane === '1') wlacz(true);
    } else {
      // brak sesji: przycisk pokazuje, że trzeba się zalogować w panelu
      const b = przycisk();
      b.innerHTML = '<b>✎</b> Zaloguj się, by edytować';
      b.addEventListener('click', () => {
        // panel stoi na tym samym hoście, na porcie 8003 (albo pod /admin/
        // na docelowym hostingu, gdzie wszystko jest na jednym porcie)
        const cel = ADRES_API ? ADRES_API + '/admin/' : '/admin/';
        location.href = cel;
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
