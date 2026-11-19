/* ============================================================
   Studio Sygnatura v2 — wyszukiwarka
   Szuka w produktach i realizacjach z data/dane.js. Bez backendu:
   strona wyników to szukaj.html?q=…, więc link da się wysłać i dodać
   do zakładek. Normalizacja liter: „krzyzowka” = „krzyżówka”.
   ============================================================ */
(function () {
  'use strict';
  const D = window.SYG_DANE || {};
  const UI = window.SYG_UI || {};
  const esc = UI.esc || (s => String(s == null ? '' : s));
  const zl = UI.zl || (n => n + ' zł');

  const norm = (s) => String(s || '')
    .toLocaleLowerCase('pl-PL')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l').replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ').trim();

  const q = (new URLSearchParams(location.search).get('q') || '').trim();
  const info = document.getElementById('info');
  const box = document.getElementById('wyniki');
  const pusto = document.getElementById('pusto');

  if (q.length < 2) {
    info.textContent = 'Wpisz co najmniej 2 znaki, żeby zobaczyć wyniki.';
    document.getElementById('pusto-tytul').textContent = 'Od czego zacząć?';
    document.getElementById('pusto-opis').textContent =
      'Najczęściej szukacie: szopka, szyld, grawer, krzyżówka, deska, numer. Możesz też przejść od razu do sklepu.';
    pusto.hidden = false;
    return;
  }

  const ql = norm(q);
  const slowa = ql.split(' ').filter(Boolean);

  const trafienia = [];

  (D.produkty || []).forEach(p => {
    const hay = norm([p.nazwa, p.opis, p.kategoria, (p.cechy || []).join(' ')].join(' '));
    if (slowa.every(s => hay.includes(s))) {
      trafienia.push({
        typ: 'Produkt', nazwa: p.nazwa, kategoria: p.kategoria, opis: p.opis,
        foto: p.fotoMala || p.foto, href: 'produkt.html?id=' + encodeURIComponent(p.id),
        cena: p.cena, jednostka: p.jednostka || 'szt.', sklep: true
      });
    }
  });

  (D.realizacje || []).forEach(r => {
    const hay = norm([r.tytul, r.opis, r.kategoria].join(' '));
    if (slowa.every(s => hay.includes(s))) {
      trafienia.push({
        typ: 'Realizacja', nazwa: r.tytul, kategoria: r.kategoria, opis: r.opis,
        foto: r.foto,
        href: r.produkt ? 'produkt.html?id=' + encodeURIComponent(r.produkt)
                        : 'kontakt.html?temat=projekt&projekt=' + encodeURIComponent(r.tytul),
        cena: null, sklep: !!r.produkt
      });
    }
  });

  function odmiana(n) {
    if (n === 0) return 'Nie znaleziono nic dla frazy';
    if (n === 1) return '1 wynik dla frazy';
    if (n < 5) return n + ' wyniki dla frazy';
    return n + ' wyników dla frazy';
  }

  info.innerHTML = `${odmiana(trafienia.length)} <b>„${esc(q)}”</b>`
    + (trafienia.length ? ' — produkty w pierwszej kolejności.' : '.');

  if (!trafienia.length) {
    pusto.hidden = false;
    document.getElementById('pusto-tytul').textContent = `Brak wyników dla „${q}”`;
    document.getElementById('pusto-opis').textContent =
      'Sprawdź pisownię albo spróbuj krótszej frazy. Jeśli szukasz czegoś, czego jeszcze nie robiliśmy — opisz pomysł, przygotujemy wycenę.';
    return;
  }

  box.innerHTML = trafienia.map(w => `
<a class="wynik" href="${esc(w.href)}">
  <img src="${esc(w.foto)}" alt="${esc(w.nazwa)}" loading="lazy" width="200" height="200">
  <div>
    <span class="w-kat">${esc(w.typ)} · ${esc(w.kategoria)}</span>
    <h3>${esc(w.nazwa)}</h3>
    <p>${esc(w.opis)}</p>
  </div>
  <span class="w-cena">${w.cena != null ? zl(w.cena) : (w.sklep ? '' : 'na zamówienie')}</span>
</a>`).join('');
})();
