/* ============================================================
   Studio Sygnatura v2 — strona produktu
   Czyta produkt z data/dane.js po ?id=. Nie ma koszyka: zamówienie
   idzie przez formularz zapytania (z tematem i nazwą produktu),
   bo tak działa dzisiejsza sprzedaż w pracowni.
   ============================================================ */
(function () {
  'use strict';
  const D = window.SYG_DANE || {};
  const UI = window.SYG_UI || {};
  const esc = UI.esc || (s => String(s == null ? '' : s));
  const zl = UI.zl || (n => n + ' zł');
  const Q = new URLSearchParams(location.search);
  const id = Q.get('id') || '';
  const produkt = (D.produkty || []).find(p => p.id === id);
  const korzen = document.getElementById('produkt');
  const okruszek = document.getElementById('okruszek');

  function brak() {
    document.title = 'Nie ma takiego produktu — Studio Sygnatura';
    korzen.innerHTML = `
<div class="srodek-strony">
  <span class="eyebrow">Sklep</span>
  <h1>Nie znaleźliśmy tego produktu</h1>
  <p>Link jest nieaktualny albo produkt zniknął z oferty. Zobacz, co mamy w tej chwili, albo napisz — zrobimy rzecz na zamówienie.</p>
  <div class="akcje srodek">
    <a class="btn" href="sklep.html">Wróć do sklepu</a>
    <a class="btn ghost" href="kontakt.html">Napisz do nas</a>
  </div>
</div>`;
  }

  function pokaz(p) {
    document.title = p.nazwa + ' — Studio Sygnatura';
    if (okruszek) okruszek.textContent = p.nazwa;

    const galeria = [p.foto].concat(p.galeria || []);
    const mini = galeria.length > 1
      ? `<div class="miniatury" role="group" aria-label="Zdjęcia produktu">` +
        galeria.map((src, i) => `<button type="button" aria-pressed="${i === 0}" data-src="${esc(src)}">
          <img src="${esc(src)}" alt="Zdjęcie ${i + 1} z ${galeria.length}" loading="lazy" width="200" height="200"></button>`).join('') + `</div>`
      : '';

    const cechy = (p.cechy || []).map(c => `<li>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.2 4.2L19 6.9"/></svg>
      <span>${esc(c)}</span></li>`).join('');

    korzen.innerHTML = `
<div class="prod">
  <div class="prod-gal">
    <figure class="glowne">
      <img id="zdjecie-glowne" src="${esc(p.foto)}" alt="${esc(p.nazwa)}" width="700" height="875">
    </figure>
    ${mini}
  </div>
  <div class="prod-info">
    <span class="eyebrow">${esc(p.kategoria)}</span>
    <h1>${esc(p.nazwa)}</h1>
    <div class="prod-cena">
      <span class="price">${zl(p.cena)}</span>
      <span class="muted small">/ ${esc(p.jednostka || 'szt.')} · cena z pracowni</span>
    </div>
    <p class="prod-opis">${esc(p.opis)}</p>
    ${cechy ? `<ul class="cechy">${cechy}</ul>` : ''}
    <div class="prod-actions">
      <a class="btn" href="kontakt.html?temat=projekt&projekt=${encodeURIComponent(p.nazwa)}">Zapytaj o ten produkt</a>
      <a class="btn ghost" href="${esc(D.firma.telHref)}">Zadzwoń: ${esc(D.firma.tel)}</a>
    </div>
    <div class="prod-note">
      <b>Jak to działa:</b> nie mamy koszyka online — po wysłaniu zapytania odpowiadamy z ceną, terminem i danymi do przelewu.
      Personalizację (napis, imiona, datę) ustalamy przed rozpoczęciem pracy. ${esc((D.firma || {}).odpowiedz || '')}
    </div>
    ${p.realizacja ? `<p class="small muted nad-kreska">Ta rzecz jest też opisana w realizacjach:
      <a class="dopisek" href="realizacje.html#realizacja-${p.realizacja}">zobacz zdjęcia z pracowni</a>.</p>` : ''}
  </div>
</div>`;

    // miniatury: podmiana zdjęcia głównego
    const glowne = document.getElementById('zdjecie-glowne');
    korzen.querySelectorAll('.miniatury button').forEach(btn => {
      btn.addEventListener('click', () => {
        glowne.src = btn.getAttribute('data-src');
        korzen.querySelectorAll('.miniatury button').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      });
    });

    // pozostałe produkty
    const inne = (D.produkty || []).filter(x => x.id !== p.id).slice(0, 3);
    const sekcja = document.getElementById('inne');
    if (inne.length && sekcja) {
      sekcja.hidden = false;
      document.getElementById('inne-produkty').innerHTML = inne.map(UI.kartaProduktu).join('');
    }
  }

  if (produkt) pokaz(produkt); else brak();
})();
