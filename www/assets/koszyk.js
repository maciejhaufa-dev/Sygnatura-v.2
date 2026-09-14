/* ============================================================
   Studio Sygnatura — KOSZYK (koszyk.js)
   DWA osobne, niezależne magazyny w localStorage:

   1) KOSZYK (syg-koszyk-v1) — TYLKO sklep: produkty z katalogu,
      personalizacje, pomysł własny, dane i dostawa.
   2) WYNAJEM (syg-wynajem-v1) — TYLKO wynajem dekoracji: wybrany
      termin, pakiet, personalizacje i dane. Termin NIE trafia do
      koszyka — po podsumowaniu idzie jako zapytanie o rezerwację
      (rezerwacja potwierdzana jest po wpłacie).

   Dodatkowo: GLOBALNY pasek koszyka — gdy coś jest w koszyku
   SKLEPOWYM, na dole strony pojawia się przypięty pasek:
   liczba sztuk, suma i przycisk „Przejdź do koszyka →".
   ============================================================ */
window.KOSZYK = (function () {
  const KLUCZ = 'syg-koszyk-v1';
  const W_KLUCZ = 'syg-wynajem-v1';

  /* migracja ze starej wersji: wynajem i sklep trzymane w jednym
     obiekcie — rozdzielamy, żeby koszyk nigdy nie pokazywał terminu */
  (function migruj() {
    try {
      const raw = JSON.parse(localStorage.getItem(KLUCZ) || 'null');
      if (raw && typeof raw === 'object' && (raw.typ === 'wynajem' || raw.pakiet || raw.termin)) {
        if (!localStorage.getItem(W_KLUCZ)) {
          localStorage.setItem(W_KLUCZ, JSON.stringify({
            pakiet: raw.pakiet || null,
            termin: raw.termin || null,
            pers: raw.typ === 'wynajem' ? (raw.pers || []) : [],
            ev: (raw.pakiet && raw.pakiet.ev) || '',
            dane: raw.typ === 'wynajem' ? (raw.dane || null) : null
          }));
        }
        localStorage.setItem(KLUCZ, JSON.stringify({
          pozycje: raw.pozycje || [],
          pers: raw.typ === 'wynajem' ? [] : (raw.pers || []),
          pomysl: raw.typ === 'wynajem' ? '' : (raw.pomysl || ''),
          dane: raw.typ === 'wynajem' ? null : (raw.dane || null),
          dostawa: raw.typ === 'wynajem' ? null : (raw.dostawa || null)
        }));
      }
    } catch (e) { /* uszkodzony zapis — zostawiamy */ }
  })();

  function czysty() {
    return { pozycje: [], pers: [], pomysl: '', dane: null, dostawa: null };
  }

  /* ================= KOSZYK SKLEPOWY ================= */
  function pobierz() {
    try {
      const k = JSON.parse(localStorage.getItem(KLUCZ) || 'null');
      if (k && typeof k === 'object' && Array.isArray(k.pozycje)) return k;
    } catch (e) { /* uszkodzony zapis — zaczynamy od nowa */ }
    return czysty();
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

  /* ---- licznik przy ikonie koszyka + globalny pasek koszyka ---- */
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

    /* globalny pasek koszyka (wszystkie strony poza samym koszykiem) */
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

/* ============================================================
   WYNAJEM — osobny magazyn (termin/pakiet NIE wchodzą do koszyka)
   ============================================================ */
window.WYNAJEM = (function () {
  const W_KLUCZ = 'syg-wynajem-v1';

  function pobierz() {
    try {
      const w = JSON.parse(localStorage.getItem(W_KLUCZ) || 'null');
      if (w && typeof w === 'object') return w;
    } catch (e) { /* uszkodzony zapis */ }
    return { pakiet: null, termin: null, pers: [], ev: '', dane: null };
  }
  function zapisz(w) { localStorage.setItem(W_KLUCZ, JSON.stringify(w)); }
  function wyczysc() { localStorage.removeItem(W_KLUCZ); }

  /* suma personalizacji (z rabatem, gdy min. 3 produkty) */
  function sumaPers() {
    const pers = pobierz().pers || [];
    const suma = pers.reduce(function (s, p) { return s + (Number(p.cena) || 0); }, 0);
    const rabat = pers.length >= SYG.PERS_RABAT_PROG ? Math.round(suma * SYG.PERS_RABAT_PROC / 100) : 0;
    return { suma: suma, rabat: rabat, razem: Math.max(0, suma - rabat) };
  }

  return { pobierz, zapisz, wyczysc, sumaPers };
})();
