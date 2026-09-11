/* ============================================================
   Studio Sygnatura — SILNIK KLIENTA (api.js)
   W trybie demo zapisuje do localStorage tej przeglądarki.
   Po wdrożeniu Google Apps Script (config.js → SYG.API) te same
   akcje lecą przez internet do arkusza Google — zero zmian w stronach.
   ============================================================ */
(function () {
  const SYG = window.SYG;

  /* ---------- magazyn demo (localStorage) ---------- */
  const KL = { katalog: 'syg-demo-katalog', wiadomosci: 'syg-demo-wiadomosci',
               zamowienia: 'syg-demo-zamowienia', licznik: 'syg-demo-licznik',
               produkty: 'syg-admin-produkty', dostawa: 'syg-admin-dostawa' };
  function czytaj(klucz) {
    try { return JSON.parse(localStorage.getItem(klucz) || 'null'); } catch (e) { return null; }
  }
  function zapisz(klucz, wart) { localStorage.setItem(klucz, JSON.stringify(wart)); }
  function teraz() { return new Date().toISOString(); }

  /* cennik dostawy: nadpisania z panelu admina albo wartości z config.js */
  SYG.ustawieniaDostawa = function () {
    if (SYG.TRYB_DEMO) {
      const o = czytaj(KL.dostawa);
      if (o && o.paczkomat && o.kurier) return o;
    }
    return SYG.DOSTAWA;
  };

  /* nadpisania produktów z panelu admina (tryb demo) — nanoszone na katalog,
     żeby zmiany od razu było widać w sklepie */
  function naniesNadpisania() {
    const o = czytaj(KL.produkty) || {};
    const kat = window.SYG_KATALOG || [];
    let zmiana = false;
    kat.forEach(function (p) {
      if (o[p.id]) {
        p.cena = Number(o[p.id].cena) || p.cena;
        p.dostepny = o[p.id].dostepny ? 1 : 0;
        zmiana = true;
      }
    });
    return zmiana;
  }
  if (SYG.TRYB_DEMO) naniesNadpisania();

  SYG.demoDb = {
    czytaj: czytaj, zapisz: zapisz,
    wiadomosci: function () { return czytaj(KL.wiadomosci) || []; },
    zamowienia: function () { return czytaj(KL.zamowienia) || []; }
  };

  /* ---------- akcje demo (lustro akcji serwera) ---------- */
  function demo(akcja, d) {
    d = d || {};
    switch (akcja) {
      case 'katalog':
        return { ok: true, katalog: window.SYG_KATALOG || [] };

      case 'wiadomosc': {
        if (!d.imie || !d.email || !d.tresc) return { ok: false, blad: 'Uzupełnij imię, e-mail i treść.' };
        const lista = czytaj(KL.wiadomosci) || [];
        lista.unshift({ id: lista.length + 1, data: teraz(), imie: d.imie, email: d.email,
          telefon: d.telefon || '', temat: d.temat || 'Inne', tresc: d.tresc, zgoda: !!d.zgoda,
          status: 'nowa' });
        zapisz(KL.wiadomosci, lista);
        return { ok: true, id: lista[0].id };
      }

      case 'zamowienie': {
        const klient = d.klient || {};
        if (!klient.imie || !klient.email) return { ok: false, blad: 'Brak imienia lub e-maila.' };
        let licznik = czytaj(KL.licznik) || 0;
        licznik += 1;
        zapisz(KL.licznik, licznik);
        const sygnatura = 'SYG-' + new Date().getFullYear() + '-' + String(licznik).padStart(3, '0');
        const lista = czytaj(KL.zamowienia) || [];
        lista.unshift({ sygnatura: sygnatura, data: teraz(), klient: klient, typ: d.typ || 'sklep',
          pozycje: d.pozycje || [], pers: d.pers || [], kwoty: d.kwoty || {}, pomysl: d.pomysl || '',
          wiadomosc: d.wiadomosc || '', status: 'zapytanie',
          historia: [{ t: teraz(), s: 'zapytanie' }] });
        zapisz(KL.zamowienia, lista);
        return { ok: true, sygnatura: sygnatura };
      }

      case 'zamowienia-lista':
        return { ok: true, zamowienia: czytaj(KL.zamowienia) || [] };

      case 'zamowienie-status': {
        const lista = czytaj(KL.zamowienia) || [];
        const z = lista.find(function (x) { return x.sygnatura === d.sygnatura; });
        if (!z) return { ok: false, blad: 'Nie ma takiej sygnatury.' };
        z.status = d.status;
        z.historia = z.historia || [];
        z.historia.push({ t: teraz(), s: d.status });
        zapisz(KL.zamowienia, lista);
        return { ok: true };
      }

      case 'produkty-zapisz': {
        const o = czytaj(KL.produkty) || {};
        o[d.id] = { cena: Number(d.cena) || 0, dostepny: d.dostepny ? 1 : 0 };
        zapisz(KL.produkty, o);
        naniesNadpisania();
        return { ok: true };
      }

      case 'ustawienia-dostawa-zapisz': {
        if (!d.cennik || !d.cennik.paczkomat || !d.cennik.kurier) return { ok: false, blad: 'Niekompletny cennik.' };
        zapisz(KL.dostawa, d.cennik);
        return { ok: true };
      }

      default:
        return { ok: false, blad: 'Nieznana akcja w trybie demo: ' + akcja };
    }
  }

  /* ---------- jedno wyjście dla całego serwisu ---------- */
  SYG.wezwij = async function (akcja, dane) {
    if (SYG.TRYB_DEMO) return demo(akcja, dane);

    // Google Apps Script: POST z Content-Type text/plain (bez preflight CORS),
    // odpowiedź JSON. Akcja w parametrze URL, dane w treści.
    try {
      const res = await fetch(SYG.API + '?akcja=' + encodeURIComponent(akcja), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(dane || {})
      });
      const txt = await res.text();
      try { return JSON.parse(txt); }
      catch (e) { return { ok: false, blad: 'Zła odpowiedź serwera (kod ' + res.status + ').' }; }
    } catch (e) {
      return { ok: false, blad: 'Brak połączenia z serwerem. Spróbuj ponownie za chwilę.' };
    }
  };

  /* ---------- katalog (demo: plik data/katalog.js) ---------- */
  SYG.katalog = async function () {
    const odp = await SYG.wezwij('katalog', {});
    return (odp && odp.ok && odp.katalog) || window.SYG_KATALOG || [];
  };
})();
