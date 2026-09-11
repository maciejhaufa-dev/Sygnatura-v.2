/* ============================================================
   Studio Sygnatura — KOSZYK (koszyk.js)
   Zamówienie w trakcie składania trzyma się w localStorage,
   więc przetrwa przeładowanie strony i powrót na telefonie.
   Struktura: { typ, pozycje:[{id,ile}], pers:[{id,opis}], pakiet, pomysl, dane, dostawa }
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

  /* ---- produkty sklepu ---- */
  function dodajProdukt(id, ile) {
    const k = pobierz();
    const p = k.pozycje.find(function (x) { return x.id === id; });
    if (p) p.ile += ile; else k.pozycje.push({ id: id, ile: ile });
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

  /* ---- kwoty (wymagany katalog) ---- */
  function sumaZl(katalog) {
    const k = pobierz();
    let suma = 0;
    k.pozycje.forEach(function (x) {
      const pr = katalog.find(function (p) { return Number(p.id) === Number(x.id); });
      if (pr) suma += (Number(pr.cena) || 0) * x.ile;
    });
    k.pers.forEach(function (p) { suma += (Number(p.cena) || 0); });
    if (k.pers.length >= SYG.PERS_RABAT_PROG) {
      const sumaPers = k.pers.reduce(function (s, p) { return s + (Number(p.cena) || 0); }, 0);
      suma -= Math.round((sumaPers * SYG.PERS_RABAT_PROC) / 100);
    }
    return suma;
  }

  /* ---- licznik na stronie (ikona koszyka, pasek) ---- */
  function odswiez() {
    const n = liczbaSztuk();
    document.querySelectorAll('.kropka').forEach(function (el) {
      el.textContent = n;
      el.classList.toggle('widoczna', n > 0);
    });
    document.querySelectorAll('.koszyk-ile').forEach(function (el) {
      el.textContent = 'W koszyku: ' + n + (n === 1 ? ' szt.' : ' szt.');
    });
  }

  return { pobierz, zapisz, wyczysc, dodajProdukt, ustawIle, ileProduktu,
           liczbaSztuk, sumaZl, odswiez };
})();
