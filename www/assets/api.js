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
               produkty: 'syg-admin-produkty', dostawa: 'syg-admin-dostawa',
               blog: 'syg-demo-blog', strony: 'syg-demo-strony', dodane: 'syg-demo-dodane' };
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
     żeby zmiany od razu było widać w sklepie; produkty utworzone z wpisów bloga
     (dodane w demo) są doczepiane do katalogu */
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
    const dodane = czytaj(KL.dodane) || [];
    dodane.forEach(function (p) {
      const ist = kat.find(function (x) { return Number(x.id) === Number(p.id); });
      if (!ist) kat.push(p);
    });
    return zmiana;
  }
  if (SYG.TRYB_DEMO) naniesNadpisania();

  SYG.demoDb = {
    czytaj: czytaj, zapisz: zapisz,
    wiadomosci: function () { return czytaj(KL.wiadomosci) || []; },
    zamowienia: function () { return czytaj(KL.zamowienia) || []; }
  };

  /* ---------- BLOG: wpisy (realizacje) ---------- */
  function seedBlog() {
    const posts = [
      {
        id: 1, data: '2026-08-14', kategoria: 'Dekoracje świąteczne', tytul: 'Szopka warstwowa z podświetleniem',
        zajawka: 'Nasz flagowy produkt: ręcznie cięte warstwy sklejki 20×20 cm, ciepłe światło LED 2700 K, rama z wpustami i listwą sosnową.',
        okladka: 'assets/media/sklep/szopka.jpg', video: '', galeria: [], tresc:
          '<h2>Od deski do podświetlonej szopki</h2>' +
          '<p>Każda szopka zaczyna się od wyboru deski. Tniemy warstwy jedna po drugiej, szlifujemy krawędzie i składamy je z dystansami, żeby światło pracowało między płaszczyznami.</p>' +
          '<ul><li>Materiał: sklejka liściasta 4 mm, rama sosnowa z wpustami</li><li>Wykonanie: cięcie laserowe + ręczny szlif, bejca wodna i olej</li><li>Światło: taśma LED 2700 K (ciepła), włącznik przy ramie</li><li>Czas pracy: ok. 6–8 godzin na egzemplarz</li></ul>',
        produkt: { sklep: true, id: 1, nazwa: 'Szopka bożonarodzeniowa (warstwowa)', cena: 249, gabaryt: '20×20×8 cm' }
      },
      {
        id: 2, data: '2026-08-02', kategoria: 'Szyldy i tablice', tytul: 'Szyld powitalny „Witajcie"',
        zajawka: 'Drewniany szyld z grawerem — wita gości w domu, na weselu i w lokalu.',
        okladka: 'assets/media/sklep/szyld.jpg', video: '', galeria: [], tresc:
          '<h2>Pierwsze wrażenie robi szyld</h2>' +
          '<p>Frezyjemy napis w litym drewnie, barwimy kontrastowo litery i zabezpieczamy całość olejowoskiem.</p>',
        produkt: { sklep: true, id: 2, nazwa: 'Szyld powitalny „Witajcie"', cena: 189, gabaryt: '50×25×2 cm' }
      },
      {
        id: 3, data: '2026-07-21', kategoria: 'Personalizacja', tytul: 'Ramka z sentencją — prezent, który zostaje',
        zajawka: 'Ramka ze sklejki z wybraną sentencją, imionami i datą.',
        okladka: 'assets/media/sklep/ramka.jpg', video: '', galeria: [], tresc:
          '<h2>Sentencja, która nie wyjdzie z mody</h2>' +
          '<p>Ramka z grawerem to najprostszy i najbardziej osobisty prezent — od jubileuszu po dzień ślubu.</p>',
        produkt: { sklep: true, id: 4, nazwa: 'Ramka z sentencją', cena: 89, gabaryt: '20×25×2 cm' }
      }
    ];
    zapisz(KL.blog, posts);
  }
  function blog() { return czytaj(KL.blog) || []; }

  /* ---------- PODSTRONY zarządzane z panelu ---------- */
  function seedStrony() {
    zapisz(KL.strony, [
      {
        slug: 'pracownia', tytul: 'Pracownia', menu: 1, kol: 3,
        tresc: '<h2>Kim jesteśmy</h2>' +
          '<p>Studio Sygnatura to <b>rodzinna manufaktura</b> — w naszych rzeczach spotykają się drewno, światło i detal.</p>' +
          '<h2>Co robimy</h2>' +
          '<ul><li><b>Dekoracje na wydarzenia</b> — tablice powitalne, plany stołów, litery przestrzenne, mozaiki „scrabble".</li>' +
          '<li><b>Personalizowane prezenty</b> — grawerowane wkładki, winietki, ramki z sentencją.</li>' +
          '<li><b>Produkty do domu</b> — szopki warstwowe, szyldy powitalne, podświetlane litery.</li></ul>' +
          '<h2>Nasza zasada</h2>' +
          '<p>Najpierw rozumiemy, po co dana rzecz powstaje — potem projektujemy, a na końcu tniemy, malujemy i podświetlamy.</p>'
      }
    ]);
  }
  function strony() { return czytaj(KL.strony) || []; }

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

      /* ---------- BLOG (realizacje jako wpisy) ---------- */
      case 'blog-lista':
        return { ok: true, wpisy: blog() };

      case 'blog-pobierz': {
        const w = blog().find(function (x) { return Number(x.id) === Number(d.id); });
        if (!w) return { ok: false, blad: 'Nie ma takiego wpisu.' };
        return { ok: true, wpis: w };
      }

      case 'blog-zapisz': {
        const w = d.wpis || {};
        if (!w.tytul) return { ok: false, blad: 'Brak tytułu wpisu.' };
        const lista = blog();
        let wpis;
        if (w.id) {
          const i = lista.findIndex(function (x) { return Number(x.id) === Number(w.id); });
          if (i >= 0) { lista[i] = Object.assign(lista[i], w); wpis = lista[i]; }
          else { wpis = Object.assign({ id: w.id }, w); lista.unshift(wpis); }
        } else {
          wpis = Object.assign({ id: Date.now() % 1000000, data: new Date().toISOString().slice(0, 10) }, w);
          lista.unshift(wpis);
        }
        zapisz(KL.blog, lista);
        /* „dodaj do sklepu" — wpis staje się produktem (nowy albo aktualizacja istniejącego) */
        if (wpis.produkt && wpis.produkt.sklep) syncProdukt(wpis);
        return { ok: true, id: wpis.id };
      }

      case 'produkt-nowy': {
        /* produkt „bez historii" — dodawany wprost w zakładce Produkty */
        const pr = {
          id: Number(d.id) || (Date.now() % 1000000),
          nazwa: d.nazwa || 'Nowy produkt',
          cena: Number(d.cena) || 0,
          opis: d.opis || '',
          obraz: d.obraz || 'szopka.jpg',
          gabaryt: d.gabaryt || '',
          dostepny: 1,
          storyId: Number(d.storyId) || 0
        };
        const kat = window.SYG_KATALOG || [];
        const ist = kat.find(function (x) { return Number(x.id) === Number(pr.id); });
        if (ist) Object.assign(ist, pr); else kat.push(pr);
        const dodane = czytaj(KL.dodane) || [];
        if (!dodane.find(function (x) { return Number(x.id) === Number(pr.id); })) dodane.push(pr);
        zapisz(KL.dodane, dodane);
        return { ok: true, id: pr.id };
      }

      case 'blog-usun': {
        const lista = blog().filter(function (x) { return Number(x.id) !== Number(d.id); });
        zapisz(KL.blog, lista);
        return { ok: true };
      }

      /* ---------- PODSTRONY ---------- */
      case 'strony-lista':
        return { ok: true, strony: strony() };

      case 'strona-zapisz': {
        const s2 = d.strona || {};
        if (!s2.slug) return { ok: false, blad: 'Brak identyfikatora podstrony.' };
        const lista = strony();
        const i = lista.findIndex(function (x) { return x.slug === s2.slug; });
        if (i >= 0) lista[i] = Object.assign(lista[i], s2); else lista.push(s2);
        zapisz(KL.strony, lista);
        return { ok: true };
      }

      case 'strona-usun': {
        zapisz(KL.strony, strony().filter(function (x) { return x.slug !== d.slug; }));
        return { ok: true };
      }

      default:
        return { ok: false, blad: 'Nieznana akcja w trybie demo: ' + akcja };
    }
  }

  /* wpis bloga → produkt w katalogu (aktualizacja istniejącego albo utworzenie nowego) */
  function syncProdukt(wpis) {
    const pr = wpis.produkt || {};
    const kat = window.SYG_KATALOG || [];
    const t = kat.find(function (x) { return Number(x.id) === Number(pr.id); });
    if (t) {
      t.nazwa = pr.nazwa || t.nazwa;
      t.cena = Number(pr.cena) || t.cena;
      t.gabaryt = pr.gabaryt || '';
      t.storyId = wpis.id;
      if (pr.opis) t.opis = pr.opis;
    } else {
      pr.id = Number(pr.id) || (Date.now() % 1000000);
      const nowy = {
        id: pr.id, nazwa: pr.nazwa || wpis.tytul, cena: Number(pr.cena) || 0,
        gabaryt: pr.gabaryt || '', opis: pr.opis || ('Historia tego produktu: „' + wpis.tytul + '" — zobacz na blogu.'),
        obraz: wpis.okladka || 'szopka.jpg', dostepny: 1, storyId: wpis.id
      };
      kat.push(nowy);
      const dodane = czytaj(KL.dodane) || [];
      if (!dodane.find(function (x) { return Number(x.id) === Number(nowy.id); })) dodane.push(nowy);
      zapisz(KL.dodane, dodane);
      pr.id = nowy.id;
    }
  }

  /* zalążki demo — przy pierwszym uruchomieniu */
  if (SYG.TRYB_DEMO) {
    try {
      if (localStorage.getItem(KL.blog) === null) seedBlog();
      if (localStorage.getItem(KL.strony) === null) seedStrony();
    } catch (e) { /* brak localStorage */ }
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
