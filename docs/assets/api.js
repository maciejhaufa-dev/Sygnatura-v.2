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
               zamowienia: 'syg-demo-zamowienia', licznik: 'syg-demo-licznik' };
  function czytaj(klucz) {
    try { return JSON.parse(localStorage.getItem(klucz) || 'null'); } catch (e) { return null; }
  }
  function zapisz(klucz, wart) { localStorage.setItem(klucz, JSON.stringify(wart)); }
  function teraz() { return new Date().toISOString(); }

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
