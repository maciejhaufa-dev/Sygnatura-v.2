/* ============================================================
   Studio Sygnatura — KOSZYK (koszyk.js)
   Zamówienie w trakcie składania trzyma się w localStorage,
   więc przetrwa przeładowanie strony i powrót na telefonie.
   Struktura: { typ, pozycje:[{id,ile,nazwa,cena}], pers:[{id,opis}], pakiet, pomysl, dane, dostawa }
   Dodatkowo: GLOBALNY pasek koszyka — gdy coś jest w koszyku,
   na dole strony (na każdej podstronie) pojawia się przypięty
   pasek: liczba sztuk, suma i przycisk „Przejdź do koszyka →".
   ============================================================ */
window.KOSZYK = (function () {
  const KLUCZ = 'syg-koszyk-v1';

  function pobierz() {
    try {
      const k = JSON.parse(localStorage.getItem(KLUCZ) || 'null');
      if (k && typeof k === 'object') return k;
    } catch (e) { /* uszkodzony zapis — zaczynamy od nowa */ }
    return { typ: 'sklep', pozycje: [], pers: [], pakiet: null, pomysl: '', dane: null, dostawa: null };
  }
  function zapisz(k) { localStorage.setItem(KLUCZ, JSON.stringify(k)); }
  function wyczysc() { localStorage.removeItem(KLUCZ); }

  function katalog() { return window.SYG_KATALOG || []; }
  function znajdzProdukt(id) {
    return katalog().find(function (p) { return Number(p.id) === Number(id); });
  }

  /* ---- produkty sklepu ---- */
  function dodajProdukt(id, ile, meta) {
    const k = pobierz();
    /* zakupy w sklepie = ścieżka sklepowa (porzucamy niezakończony wynajem) */
    if (k.typ === 'wynajem') { k.typ = 'sklep'; k.pakiet = null; k.termin = null; }
    const pr = znajdzProdukt(id);
    const nazwa = (meta && meta.nazwa) || (pr && pr.nazwa) || ('Produkt #' + id);
    const cena = (meta && Number(meta.cena)) || (pr && Number(pr.cena)) || 0;
    const p = k.pozycje.find(function (x) { return x.id === id; });
    if (p) { p.ile += ile; } else { k.pozycje.push({ id: id, ile: ile, nazwa: nazwa, cena: cena }); }
    if (p && p.ile <= 0) k.pozycje = k.pozycje.filter(function (x) { return x.id !== id; });
    zapisz(k);
    return k;
  }
  function ustawIle(id, ile) {
    const k = pobierz();
    const p = k.pozycje.find(function (x) { return x.id === id; });
    if (p) p.ile = ile;
    if (p && p.ile <= 0) k.pozycje = k.pozycje.filter(function (x) { return x.id !== id; });
    zapisz(k);
    return k;
  }
  function ileProduktu(id) {
    const k = pobierz();
    const p = k.pozycje.find(function (x) { return x.id === id; });
    return p ? p.ile : 0;
  }
  function liczbaSztuk() {
    return pobierz().pozycje.reduce(function (s, x) { return s + x.ile; }, 0);
  }

  /* ---- kwoty (wymagany katalog LUB ceny zapisane w pozycjach) ---- */
  function sumaZl(katalogArg) {
    const k = pobierz();
    let suma = 0;
    k.pozycje.forEach(function (x) {
      let cena = Number(x.cena) || 0;
      if (!cena && katalogArg) {
        const pr = katalogArg.find(function (p) { return Number(p.id) === Number(x.id); });
        if (pr) cena = Number(pr.cena) || 0;
      }
      suma += cena * x.ile;
    });
    k.pers.forEach(function (p) { suma += (Number(p.cena) || 0); });
    if (k.pers.length >= SYG.PERS_RABAT_PROG) {
      const sumaPers = k.pers.reduce(function (s, p) { return s + (Number(p.cena) || 0); }, 0);
      suma -= Math.round((sumaPers * SYG.PERS_RABAT_PROC) / 100);
    }
    return suma;
  }

  /* ---- licznik na stronie (ikona koszyka) + globalny pasek koszyka ---- */
  function czyStronaKoszyka() {
    return /\/koszyk\.html/.test(window.location.pathname || '');
  }

  function odswiez() {
    const k = pobierz();
    const n = liczbaSztuk() + k.pers.length;

    /* kropka przy ikonie koszyka */
    document.querySelectorAll('.kropka').forEach(function (el) {
      el.textContent = n;
      el.classList.toggle('widoczna', n > 0);
    });

    /* globalny pasek koszyka (na wszystkich stronach poza samym koszykiem) */
    const stary = document.getElementById('koszyk-bar-global');
    if (n === 0 || czyStronaKoszyka()) {
      if (stary) stary.remove();
      document.body.classList.remove('ma-koszyk');
      return;
    }
    let bar = stary;
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'koszyk-bar pelny';
      bar.id = 'koszyk-bar-global';
      bar.innerHTML =
        '<span class="ile">W koszyku: 0 szt.</span>' +
        '<span class="suma">0 zł</span>' +
        '<a class="btn" href="koszyk.html">Przejdź do koszyka →</a>';
      document.body.appendChild(bar);
    }
    const szt = liczbaSztuk();
    bar.querySelector('.ile').textContent = 'W koszyku: ' + szt + (szt === 1 ? ' szt. produktu' : ' szt. produktów') +
      (k.pers.length ? ' + ' + k.pers.length + ' personalizacja' : '');
    bar.querySelector('.suma').textContent = SYG.zl(sumaZl(katalog().length ? katalog() : null));
    document.body.classList.add('ma-koszyk');
  }

  return { pobierz, zapisz, wyczysc, dodajProdukt, ustawIle, ileProduktu,
           liczbaSztuk, sumaZl, odswiez };
})();
