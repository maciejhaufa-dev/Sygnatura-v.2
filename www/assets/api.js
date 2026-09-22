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
               blog: 'syg-demo-blog', strony: 'syg-demo-strony', dodane: 'syg-demo-dodane',
               zapytaniaWynajem: 'syg-demo-wynajem-zapytania', stronaGlowna: 'syg-demo-strona-glowna', stronaZamowienia: 'syg-demo-strona-zamowienia',
               uzytkownicy: 'syg-demo-uzytkownicy', sesja: 'syg-uzytkownik-sesja-v1' };
  function czytaj(klucz) {
    try { return JSON.parse(localStorage.getItem(klucz) || 'null'); } catch (e) { return null; }
  }
  function zapisz(klucz, wart) { localStorage.setItem(klucz, JSON.stringify(wart)); }
  function teraz() { return new Date().toISOString(); }
  function hashDemo(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) { h = ((h << 5) + h + str.charCodeAt(i)) >>> 0; }
    return h;
  }

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
    zamowienia: function () { return czytaj(KL.zamowienia) || []; },
    wynajemZapytania: function () { return czytaj(KL.zapytaniaWynajem) || []; },
    stronaGlowna: function () { return czytaj(KL.stronaGlowna) || null; },
    stronaZamowienia: function () { return czytaj(KL.stronaZamowienia) || null; },
    uzytkownicy: function () { return czytaj(KL.uzytkownicy) || []; },
    sesja: function () { return czytaj(KL.sesja) || null; },
    zalogowany: function () {
      const s = czytaj(KL.sesja);
      if (!s || !s.email) return null;
      const u = (czytaj(KL.uzytkownicy) || []).find(function (x) { return x.email === s.email; });
      return u ? bezHasla(u) : null;
    }
  };

  /* konto bez hasła (do wysyłki do strony) */
  function bezHasla(u) {
    return { email: u.email, imie: u.imie, nazwisko: u.nazwisko, telefon: u.telefon || '',
      adres: u.adres || { ulica: '', kod: '', miasto: '' }, zgody: u.zgody || { newsletter: false, telefon: false },
      rejestracja: u.rejestracja || '' };
  }
  function rokTemuIso(){ return new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString(); }

  /* konto testowe w trybie demo — przy pierwszym uruchomieniu */
  function seedKonta(){
    if (localStorage.getItem(KL.uzytkownicy) === null){
      zapisz(KL.uzytkownicy, [{
        email: 'klient@demo.pl', imie: 'Anna', nazwisko: 'Nowak', telefon: '600 100 200',
        adres: { ulica: 'ul. Zielona 3', kod: '60-123', miasto: 'Poznań' },
        zgody: { newsletter: true, telefon: false },
        haslo: hashDemo('demo1234'), rejestracja: teraz()
      }]);
    }
    if (localStorage.getItem(KL.zamowienia) === null){
      const dni = 24 * 3600 * 1000;
      zapisz(KL.zamowienia, [
        { sygnatura: 'SYG-2026-015', data: new Date(Date.now() - 5 * dni).toISOString(),
          klient: { imie: 'Anna Nowak', email: 'klient@demo.pl' }, typ: 'sklep',
          pozycje: [{ id: 'szopka', nazwa: 'Szopka bożonarodzeniowa (warstwowa)', cena: 249, ile: 1 }],
          pers: [], kwoty: { razem: 249, pers_rabat: 0, kod_rabat: 0, kaucja: 0, dostawa: 0 },
          status: 'zapytanie', historia: [{ t: teraz(), s: 'zapytanie' }] },
        { sygnatura: 'SYG-2026-006', data: new Date(Date.now() - 120 * dni).toISOString(),
          klient: { imie: 'Anna Nowak', email: 'klient@demo.pl' }, typ: 'sklep',
          pozycje: [{ id: 'szyld', nazwa: 'Szyld powitalny „Witajcie"', cena: 189, ile: 1 }],
          pers: [], kwoty: { razem: 189, pers_rabat: 0, kod_rabat: 0, kaucja: 0, dostawa: 0 },
          status: 'zrobione', historia: [{ t: teraz(), s: 'zapytanie' }] },
        { sygnatura: 'SYG-2024-031', data: new Date(Date.now() - 730 * dni).toISOString(),
          klient: { imie: 'Anna Nowak', email: 'klient@demo.pl' }, typ: 'sklep',
          pozycje: [{ id: 'love', nazwa: 'Litery podświetlane LOVE', cena: 249, ile: 1 }],
          pers: [], kwoty: { razem: 249, pers_rabat: 0, kod_rabat: 0, kaucja: 0, dostawa: 0 },
          status: 'zrobione', historia: [{ t: teraz(), s: 'zapytanie' }] }
      ]);
    }
  }

  /* ---------- BLOG: wpisy (realizacje) ---------- */
  /* WERSJE seedów — podbij liczbę, aby odświeżyć treści startowe
     u WSZYSTKICH (wpisy panelu o innych id/slugach zostają nietknięte) */
  const SEED_BLOG_W = 5;
  const SEED_STRON_W = 2;

  function seedBlog(odswiez) {
    const posts = [
      {
        id: 1, widoczny: true, data: '2026-08-14', kategoria: 'Dekoracje świąteczne', tytul: 'Szopka warstwowa z podświetleniem',
        zajawka: 'Nasz flagowy produkt: ręcznie cięte warstwy sklejki 20×20 cm, ciepłe światło LED 2700 K, rama z wpustami i listwą sosnową.',
        okladka: 'assets/media/sklep/szopka.jpg', video: '', galeria: ['assets/media/sklep/szopka-2.jpg', 'assets/media/sklep/szopka-3.jpg', 'assets/media/sklep/szopka-4.jpg', 'assets/media/sklep/szopka-5.jpg', 'assets/media/sklep/szopka-6.jpg', 'assets/media/sklep/szopka-7.jpg'], tresc:
          '<h2>Od deski do podświetlonej szopki</h2>' +
          '<p>Każda szopka zaczyna się od wyboru deski. Tniemy warstwy jedna po drugiej, szlifujemy krawędzie i składamy je z dystansami, żeby światło pracowało między płaszczyznami.</p>' +
          '<ul><li>Materiał: sklejka liściasta 4 mm, rama sosnowa z wpustami</li><li>Wykonanie: cięcie laserowe + ręczny szlif, bejca wodna i olej</li><li>Światło: taśma LED 2700 K (ciepła), włącznik przy ramie</li><li>Czas pracy: ok. 6–8 godzin na egzemplarz</li></ul>',
        produkt: { sklep: true, id: 1, nazwa: 'Szopka bożonarodzeniowa (warstwowa)', cena: 249, gabaryt: '20×20×8 cm' }
      },
      {
        id: 2, widoczny: true, data: '2026-08-02', kategoria: 'Szyldy i tablice', tytul: 'Napis „Cześć!" w ramie z pleksi',
        zajawka: 'Frezowany drewniany napis na pleksi w podwójnej ramie — wita gości w domu i w lokalu.',
        okladka: 'assets/media/sklep/szyld.jpg', video: '', galeria: ['assets/media/sklep/szyld-2.jpg'], tresc:
          '<h2>Cześć na wejściu</h2>' +
          '<p>Napis frezujemy w drewnie i montujemy na przezroczystej pleksi na dystansach. Za nim ciemna rama, a całość zamyka jasna oprawa z frezowanym wzorem.</p>' +
          '<ul><li>Napis: frezowane drewno, dowolne słowo</li><li>Montaż: pleksi na dystansach — efekt lewitacji napisu</li><li>Oprawa: podwójna rama z frezem</li></ul>',
        produkt: { sklep: true, id: 2, nazwa: 'Szyld powitalny „Witajcie"', cena: 189, gabaryt: '50×25×2 cm' }
      },
      {
        id: 3, widoczny: false, data: '2026-07-21', kategoria: 'Personalizacja', tytul: 'Ramka z sentencją — prezent, który zostaje',
        zajawka: 'Ramka ze sklejki z wybraną sentencją, imionami i datą.',
        okladka: 'assets/media/sklep/ramka.jpg', video: '', galeria: [], tresc:
          '<h2>Sentencja, która nie wyjdzie z mody</h2>' +
          '<p>Ramka z grawerem to najprostszy i najbardziej osobisty prezent — od jubileuszu po dzień ślubu.</p>',
        produkt: { sklep: true, id: 4, nazwa: 'Ramka z sentencją', cena: 89, gabaryt: '20×25×2 cm' }
      },
      {
        id: 4, widoczny: true, data: '2026-08-28', kategoria: 'Prezenty personalizowane', tytul: 'Rodzinka niedźwiadków — puzzle z imionami',
        zajawka: 'Drewniane puzzle rodzinne: misie z wygrawerowanymi imionami i czerwonym sercem.',
        okladka: 'assets/media/sklep/niedzwiadki.jpg', video: '', galeria: ['assets/media/sklep/niedzwiadki-2.jpg'], tresc:
          '<h2>Cała rodzina w jednym sercu</h2>' +
          '<p>Cztery misie — duzi i mali — składają się w jedną całość. Na każdym grawerujemy imię, a pośrodku malujemy serce.</p>' +
          '<ul><li>Materiał: lite drewno, ręczny szlif i olej</li><li>Grawer: imiona domowników na każdej figurce</li><li>Prezent: na rocznicę, Dzień Mamy i Taty, parapetówkę</li></ul>',
        produkt: { sklep: false, id: 0, nazwa: '', cena: 0, gabaryt: '' }
      },
      {
        id: 5, widoczny: true, data: '2026-08-28', kategoria: 'Dekoracje stołu', tytul: 'Serwetnik „Góry"',
        zajawka: 'Drewniany serwetnik z linią gór — na stół w domu i na imprezę w góralskim klimacie.',
        okladka: 'assets/media/sklep/serwetnik.jpg', video: '', galeria: ['assets/media/sklep/serwetnik-2.jpg'], tresc:
          '<h2>Górski akcent na stole</h2>' +
          '<p>Serwetnik wycinany w kształt górskiego łańcucha — z podstawką, stabilny, na zwykłe serwetki stołowe.</p>' +
          '<ul><li>Materiał: drewno, olejowane</li><li>Motyw: linia gór — wytniemy też inny (serce, napis, datę)</li></ul>',
        produkt: { sklep: false, id: 0, nazwa: '', cena: 0, gabaryt: '' }
      },
      {
        id: 6, widoczny: true, data: '2026-08-28', kategoria: 'Krzyżówki z imionami', tytul: 'Rodzinna krzyżówka z imionami',
        zajawka: 'Imiona domowników w krzyżówce na ścianę — z rodzinnymi zdjęciami i słowami: miłość, radość, wdzięczność.',
        okladka: 'assets/media/sklep/krzyzowka.jpg', video: '', galeria: ['assets/media/sklep/krzyzowka-2.jpg'], tresc:
          '<h2>Krzyżówka, która opowiada o rodzinie</h2>' +
          '<p>Klocki z imionami układamy w krzyżówkę na wymiar ściany. Obok wieszamy ramki ze zdjęciami, a całość spinamy słowami ważnymi dla domu.</p>' +
          '<ul><li>Klocki: drewniane, z grawerowanymi literami</li><li>Układ: projektujemy pod Twoją ścianę i listę imion</li><li>Dodatki: ramki na zdjęcia, słowa-relacje (miłość, radość…)</li></ul>',
        produkt: { sklep: false, id: 0, nazwa: '', cena: 0, gabaryt: '' }
      },
      {
        id: 7, widoczny: true, data: '2026-08-12', kategoria: 'Numery i cyfry', tytul: 'Ażurowa ósemka w ramie',
        zajawka: 'Cyfra „8" z ażurowym kwiatowym tłem — od surowego wycięcia po oprawiony obraz.',
        okladka: 'assets/media/sklep/osemka.jpg', video: '', galeria: ['assets/media/sklep/osemka-2.jpg'], tresc:
          '<h2>Od surowego wycięcia do obrazu</h2>' +
          '<p>Najpierw ażur: cyfra i kwiatowe tło wycinane warstwa po warstwie. Potem kolor — ciemna bejca i złoty środek — i oprawa w ramę.</p>' +
          '<ul><li>Technika: warstwowy ażur + bejca i złocenie</li><li>Na zdjęciach: stan przed oprawieniem i gotowy obraz</li><li>Możliwa każda cyfra, litera albo monogram</li></ul>',
        produkt: { sklep: false, id: 0, nazwa: '', cena: 0, gabaryt: '' }
      },
      {
        id: 8, widoczny: true, data: '2026-08-26', kategoria: 'Lustra i ramy', tytul: 'Lustro w ramie do kompletu z „Cześć!"',
        zajawka: 'Lustro w ramie korespondującej z napisem „Cześć!" — ta sama kolorystyka, farba i motywy.',
        okladka: 'assets/media/sklep/lustro.jpg', video: '', galeria: ['assets/media/sklep/lustro-2.jpg'], tresc:
          '<h2>Komplet, nie przypadek</h2>' +
          '<p>Szeroka rama i jasne tło z frezowanym wzorem — lustro gra z napisem „Cześć!" jak komplet: ta sama kolorystyka, ta sama farba, te same motywy.</p>' +
          '<ul><li>Komplet: rama i tło w stylu napisu „Cześć!"</li><li>Tło: jasne, z frezowanym motywem</li><li>Wymiar: na ścianę w przedpokoju albo salonie</li></ul>',
        produkt: { sklep: false, id: 0, nazwa: '', cena: 0, gabaryt: '' }
      },
      {
        id: 9, widoczny: true, data: '2026-08-28', kategoria: 'Makrama i obręcze', tytul: 'Makramowa rodzina na złotej obręczy',
        zajawka: 'Rodzinna makrama na ścianę: obręcz mojej roboty, aniołki żony — wspólna praca.',
        okladka: 'assets/media/sklep/makrama.jpg', video: '', galeria: [], tresc:
          '<h2>Dwie pary rąk</h2>' +
          '<p>Aniołki z makramy na żerdzi, w złotej obręczy. Obręcz robię ja, makramy plotła żona — rodzinna pamiątka na ścianę.</p>' +
          '<ul><li>Obręcz: złota, z żerdzią na figurki</li><li>Figurki: makramowe aniołki — liczba do ustalenia</li><li>Prezent: na chrzest, roczek, nowe mieszkanie</li></ul>',
        produkt: { sklep: false, id: 0, nazwa: '', cena: 0, gabaryt: '' }
      },
      {
        id: 10, widoczny: true, data: '2025-12-03', kategoria: 'Deski do krojenia', tytul: 'Deski do krojenia z grawerem',
        zajawka: 'Grawer na desce: logo klubu, śmieszny napis, dedykacja — deska do krojenia i do ozdoby.',
        okladka: 'assets/media/sklep/deska.jpg', video: '', galeria: ['assets/media/sklep/deska-2.jpg', 'assets/media/sklep/deska-3.jpg', 'assets/media/sklep/deska-4.jpg', 'assets/media/sklep/deska-5.jpg', 'assets/media/sklep/deska-6.jpg'], tresc:
          '<h2>Deska, która mówi</h2>' +
          '<p>Laserowy grawer na desce kuchennej — od logo „Klubu Kąśniwych Smakoszy" po żart dla żołnierza. Do krojenia na co dzień i do powieszenia na ścianie.</p>' +
          '<ul><li>Grawer: logo, napis, dedykacja — Twój projekt albo nasz</li><li>Rozmiary: od śniadaniowej po rodzinny zestaw</li><li>Materiał: deska kuchenna — drewno lub bambus do wyboru</li></ul>',
        produkt: { sklep: false, id: 0, nazwa: '', cena: 0, gabaryt: '' }
      },
      {
        id: 11, widoczny: true, data: '2026-08-28', kategoria: 'Pudełka prezentowe', tytul: 'Pudełka drewniane z grawerem',
        zajawka: 'Na komunię, na zegarek, na pamiątkę — pudełko z wygrawerowaną dedykacją.',
        okladka: 'assets/media/sklep/pudelko.jpg', video: '', galeria: ['assets/media/sklep/pudelko-2.jpg', 'assets/media/sklep/pudelko-3.jpg'], tresc:
          '<h2>Opakowanie też jest prezentem</h2>' +
          '<p>Drewniane pudełko z laserowym grawerem: cytat na komunię, życzenia na zegarek, data i imię. Same pudełko cieszy tak samo jak zawartość.</p>' +
          '<ul><li>Dedykacja: cytat, imię, data — Twój tekst</li><li>Okucia: zameczek, zawiasy</li><li>Środek: na zegarek, biżuterię, pamiątki</li></ul>',
        produkt: { sklep: false, id: 0, nazwa: '', cena: 0, gabaryt: '' }
      },
      {
        id: 12, widoczny: true, data: '2026-01-08', kategoria: 'Kartki okolicznościowe', tytul: 'Kartka „Sto lat!"',
        zajawka: 'Kolorowe świeczki i życzenia — kartka na urodziny.',
        okladka: 'assets/media/sklep/kartka.jpg', video: '', galeria: [], tresc:
          '<h2>Sto lat, sto świeczek</h2>' +
          '<p>Ręcznie zdobiona kartka urodzinowa z tęczowymi świeczkami. Prosta, wesoła, z miejscem na Twoje życzenia.</p>' +
          '<ul><li>Personalizacja: imię solenizanta, liczba świeczek</li><li>Okazje: urodziny, rocznice, jubileusze</li><li>Dodatek: pasuje do pudełka z prezentem</li></ul>',
        produkt: { sklep: false, id: 0, nazwa: '', cena: 0, gabaryt: '' }
      },
      {
        id: 13, widoczny: true, data: '2025-12-08', kategoria: 'Decoupage i DIY', tytul: 'Dębowe puzzle do własnych aranżacji',
        zajawka: 'Laserowo cięte elementy z dębu — do decoupage, scrapbookingu i własnych pomysłów.',
        okladka: 'assets/media/sklep/puzzle.jpg', video: '', galeria: [], tresc:
          '<h2>Półfabrykat z charakterem</h2>' +
          '<p>Elementy cięte laserem w dębie — baza pod decoupage, kartki, zawieszki i dekoracje. Równe krawędzie, czysty detal.</p>' +
          '<ul><li>Materiał: dąb, cięcie laserowe</li><li>Zastosowanie: decoupage, kartki, zawieszki</li><li>Wzory i ilości: do ustalenia</li></ul>',
        produkt: { sklep: false, id: 0, nazwa: '', cena: 0, gabaryt: '' }
      },
      {
        id: 14, widoczny: true, data: '2026-09-02', kategoria: 'Dewocjonalia', tytul: 'Krzyżyk „Zmartwychwstałem dla Ciebie"',
        zajawka: 'Ścienny krzyżyk z postacią Chrystusa i cytatem — pamiątka i dekoracja.',
        okladka: 'assets/media/sklep/krzyzyk.jpg', video: '', galeria: [], tresc:
          '<h2>Zmartwychwstałem dla Ciebie</h2>' +
          '<p>Krzyżyk na ścianę z wygrawerowanym napisem i cytatem. Cięty laserem, z naturalnym rysunkiem drewna.</p>' +
          '<ul><li>Napis: „Zmartwychwstałem dla Ciebie" + cytat</li><li>Wykonanie: cięcie laserowe, grawer</li><li>Na ścianę: do domu, na pamiątkę komunii, bierzmowania</li></ul>',
        produkt: { sklep: false, id: 0, nazwa: '', cena: 0, gabaryt: '' }
      },
      {
        id: 15, widoczny: true, data: '2026-07-01', kategoria: 'Breloki i gadżety', tytul: 'Breloki z logo firmy',
        zajawka: 'Drewniany brelok z wygrawerowanym logo — gadżet dla klientów i pracowników.',
        okladka: 'assets/media/sklep/brelok.jpg', video: '', galeria: ['assets/media/sklep/brelok-2.jpg'], tresc:
          '<h2>Logo zawsze pod ręką</h2>' +
          '<p>Brelok z drewna z laserowym grawerem logo firmy. Lekki, trwały, miły w dotyku — gadżet, którego się nie wyrzuca.</p>' +
          '<ul><li>Grawer: Twoje logo, po jednej lub obu stronach</li><li>Nakład: od kilku sztuk w górę</li><li>Kształt: kwadrat, kółko, na wymiar</li></ul>',
        produkt: { sklep: false, id: 0, nazwa: '', cena: 0, gabaryt: '' }
      },
      {
        id: 16, widoczny: true, data: '2026-08-29', kategoria: 'Kuchnia i stół', tytul: 'Frezowany plater na przekąski',
        zajawka: 'Pięć komór na przekąski — frezowany w drewnie plater na imprezę.',
        okladka: 'assets/media/sklep/plater.jpg', video: '', galeria: [], tresc:
          '<h2>Impreza zaczyna się od deski</h2>' +
          '<p>Plater frezowany w drewnie: pięć komór na dipy, orzeszki, oliwki i co tylko podasz. Stabilny, łatwy do umycia, ładny na stole.</p>' +
          '<ul><li>Komory: 5 — na dipy, przekąski, dodatki</li><li>Materiał: lite drewno, olejowane</li><li>Wymiar: rodzinny, na środek stołu</li></ul>',
        produkt: { sklep: false, id: 0, nazwa: '', cena: 0, gabaryt: '' }
      },
      {
        id: 17, widoczny: true, data: '2026-08-29', kategoria: 'Kuchnia i stół', tytul: 'Frezowana podstawka na jajka',
        zajawka: 'Dziesięć gniazd frezowanych w litym drewnie — na jajka i pisanki.',
        okladka: 'assets/media/sklep/jajka.jpg', video: '', galeria: ['assets/media/sklep/jajka-2.jpg'], tresc:
          '<h2>Porządek w jajkach</h2>' +
          '<p>Podstawka frezowana w litym drewnie: dziesięć gniazd na jajka. Na co dzień do kuchni, od święta na pisanki.</p>' +
          '<ul><li>Gniazda: 10, frezowane w litym drewnie</li><li>Materiał: lite drewno, olejowane</li><li>Okazje: Wielkanoc, śniadania, stół wiejski</li></ul>',
        produkt: { sklep: false, id: 0, nazwa: '', cena: 0, gabaryt: '' }
      }
    ];
    if (odswiez) {
      const ids = {};
      posts.forEach(function (p) { ids[p.id] = 1; });
      const obce = blog().filter(function (w) { return !ids[Number(w.id)]; });
      zapisz(KL.blog, posts.concat(obce));
    } else {
      zapisz(KL.blog, posts);
    }
  }
  function blog() { return czytaj(KL.blog) || []; }

  /* ---------- PODSTRONY zarządzane z panelu ---------- */
  function seedStrony(odswiez) {
    const seedy = [
      {
        slug: 'pracownia', tytul: 'Pracownia', menu: 1, kol: 3,
        tresc: '<h2>Kim jesteśmy</h2>' +
          '<p>Studio Sygnatura to <b>rodzinna manufaktura</b> — w naszych rzeczach spotykają się drewno, światło i detal.</p>' +
          '<h2>Co robimy</h2>' +
          '<ul><li><b>Dekoracje na wydarzenia</b> — tablice powitalne, plany stołów, litery przestrzenne, krzyżówki z imionami.</li>' +
          '<li><b>Personalizowane prezenty</b> — grawerowane wkładki, winietki, ramki z sentencją.</li>' +
          '<li><b>Produkty do domu</b> — szopki warstwowe, szyldy powitalne, podświetlane litery.</li></ul>' +
          '<h2>Nasza zasada</h2>' +
          '<p>Najpierw rozumiemy, po co dana rzecz powstaje — potem projektujemy, a na końcu tniemy, malujemy i podświetlamy.</p>' +
          '<p><a href="realizacje.html" style="color:var(--butelkowa);border-bottom:1px solid var(--zloty)">Zobacz nasze realizacje →</a> · ' +
          '<a href="kontakt.html" style="color:var(--butelkowa);border-bottom:1px solid var(--zloty)">Zapytaj o wycenę →</a></p>'
      }
    ];
    if (odswiez) {
      const slugi = {};
      seedy.forEach(function (x) { slugi[x.slug] = 1; });
      const obce = strony().filter(function (x) { return !slugi[x.slug]; });
      zapisz(KL.strony, seedy.concat(obce));
    } else {
      zapisz(KL.strony, seedy);
    }
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

      case 'strona-glowna-pobierz':
        /* klient renderuje zapisane treści; null = treści domyślne ze strony */
        return { ok: true, dane: czytaj(KL.stronaGlowna) || null };

      case 'strona-glowna-zapisz': {
        if (!d.dane || typeof d.dane !== 'object') return { ok: false, blad: 'Brak danych do zapisu.' };
        zapisz(KL.stronaGlowna, d.dane);
        return { ok: true };
      }

      case 'strona-zamowienia-pobierz':
        /* klient renderuje zapisane treści; null = treści domyślne ze strony */
        return { ok: true, dane: czytaj(KL.stronaZamowienia) || null };

      case 'strona-zamowienia-zapisz': {
        if (!d.dane || typeof d.dane !== 'object') return { ok: false, blad: 'Brak danych do zapisu.' };
        zapisz(KL.stronaZamowienia, d.dane);
        return { ok: true };
      }

      /* ============ KONTA UŻYTKOWNIKÓW (tryb demo: localStorage) ============ */
      case 'konto-rejestracja': {
        const email = String(d.email || '').trim().toLowerCase();
        const haslo = String(d.haslo || '');
        if (!d.imie || !email || !haslo) return { ok: false, blad: 'Uzupełnij imię, nazwisko, e-mail i hasło.' };
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, blad: 'Podaj poprawny adres e-mail.' };
        if (haslo.length < 8) return { ok: false, blad: 'Hasło musi mieć co najmniej 8 znaków.' };
        const lista = czytaj(KL.uzytkownicy) || [];
        if (lista.find(function (x) { return x.email === email; })) return { ok: false, blad: 'Konto z tym adresem e-mail już istnieje — zaloguj się.' };
        const u = { email: email, imie: String(d.imie).trim(), nazwisko: String(d.nazwisko || '').trim(),
          telefon: '', adres: { ulica: '', kod: '', miasto: '' },
          zgody: { newsletter: true, telefon: false }, haslo: hashDemo(haslo), rejestracja: teraz() };
        lista.push(u);
        zapisz(KL.uzytkownicy, lista);
        zapisz(KL.sesja, { email: email });
        return { ok: true, konto: bezHasla(u) };
      }

      case 'konto-zaloguj': {
        const email = String(d.email || '').trim().toLowerCase();
        const u = (czytaj(KL.uzytkownicy) || []).find(function (x) { return x.email === email; });
        if (!u || u.haslo !== hashDemo(String(d.haslo || ''))) return { ok: false, blad: 'Nieprawidłowy e-mail lub hasło.' };
        zapisz(KL.sesja, { email: email });
        return { ok: true, konto: bezHasla(u) };
      }

      case 'konto-wyloguj': {
        localStorage.removeItem(KL.sesja);
        return { ok: true };
      }

      case 'konto-pobierz': {
        const s = czytaj(KL.sesja);
        if (!s || !s.email) return { ok: true, konto: null };
        const u = (czytaj(KL.uzytkownicy) || []).find(function (x) { return x.email === s.email; });
        return { ok: true, konto: u ? bezHasla(u) : null };
      }

      case 'konto-zapisz': {
        const s = czytaj(KL.sesja);
        if (!s || !s.email) return { ok: false, blad: 'Nie jesteś zalogowany.' };
        const lista = czytaj(KL.uzytkownicy) || [];
        const u = lista.find(function (x) { return x.email === s.email; });
        if (!u) return { ok: false, blad: 'Nie znaleziono konta — zaloguj się ponownie.' };
        const dane = d.dane || {};
        if (!String(dane.imie || '').trim()) return { ok: false, blad: 'Imię nie może być puste.' };
        u.imie = String(dane.imie).trim();
        u.nazwisko = String(dane.nazwisko || '').trim();
        u.telefon = String(dane.telefon || '').trim();
        u.adres = { ulica: String((dane.adres && dane.adres.ulica) || '').trim(),
          kod: String((dane.adres && dane.adres.kod) || '').trim(),
          miasto: String((dane.adres && dane.adres.miasto) || '').trim() };
        u.zgody = { newsletter: !!(dane.zgody && dane.zgody.newsletter),
          telefon: !!(dane.zgody && dane.zgody.telefon) };
        zapisz(KL.uzytkownicy, lista);
        return { ok: true, konto: bezHasla(u) };
      }

      case 'konto-zmien-haslo': {
        const s = czytaj(KL.sesja);
        if (!s || !s.email) return { ok: false, blad: 'Nie jesteś zalogowany.' };
        const lista = czytaj(KL.uzytkownicy) || [];
        const u = lista.find(function (x) { return x.email === s.email; });
        if (!u) return { ok: false, blad: 'Nie znaleziono konta — zaloguj się ponownie.' };
        if (u.haslo !== hashDemo(String(d.stare || ''))) return { ok: false, blad: 'Obecne hasło jest nieprawidłowe.' };
        const nowe = String(d.nowe || '');
        if (nowe.length < 8) return { ok: false, blad: 'Nowe hasło musi mieć co najmniej 8 znaków.' };
        u.haslo = hashDemo(nowe);
        zapisz(KL.uzytkownicy, lista);
        return { ok: true };
      }

      case 'konto-zamowienia': {
        const s = czytaj(KL.sesja);
        if (!s || !s.email) return { ok: true, zamowienia: [] };
        const rok = rokTemuIso();
        const lista = (czytaj(KL.zamowienia) || []).filter(function (z) {
          return z.klient && String(z.klient.email || '').toLowerCase() === s.email && (!z.data || z.data >= rok);
        });
        return { ok: true, zamowienia: lista };
      }

      case 'wynajem-zapytanie': {
        /* zapytanie o termin wynajmu — jak wiadomość z formularza kontaktowego.
           Termin NIE jest blokowany: rezerwację potwierdzamy po wpłacie. */
        const klientW = d.klient || {};
        if (!klientW.imie || !klientW.email) return { ok: false, blad: 'Brak imienia lub e-maila.' };
        if (!d.pakiet || !(d.termin && d.termin.data)) return { ok: false, blad: 'Wybierz termin i pakiet.' };
        const listaW = czytaj(KL.zapytaniaWynajem) || [];
        listaW.unshift({ id: listaW.length + 1, data: teraz(), klient: klientW, pakiet: d.pakiet,
          termin: d.termin, pers: d.pers || [], ev: d.ev || '', kwoty: d.kwoty || {},
          status: 'zapytanie' });
        zapisz(KL.zapytaniaWynajem, listaW);
        return { ok: true, id: listaW[0].id };
      }

      case 'wynajem-zapytania-lista':
        return { ok: true, zapytania: czytaj(KL.zapytaniaWynajem) || [] };

      case 'zamowienie': {
        const klient = d.klient || {};
        if (!klient.imie || !klient.email) return { ok: false, blad: 'Brak imienia lub e-maila.' };
        let licznik = czytaj(KL.licznik) || 0;
        licznik += 1;
        zapisz(KL.licznik, licznik);
        const sygnatura = 'SYG-' + new Date().getFullYear() + '-' + String(licznik).padStart(3, '0');
        const rok = rokTemuIso();
        const lista = (czytaj(KL.zamowienia) || []).filter(function (z) { return !z.data || z.data >= rok; });
        lista.unshift({ sygnatura: sygnatura, data: teraz(), klient: klient, typ: d.typ || 'sklep',
          pozycje: d.pozycje || [], pers: d.pers || [], kwoty: d.kwoty || {}, pomysl: d.pomysl || '',
          pakiet: d.pakiet || null, termin: d.termin || null,
          dostawa: d.dostawa || null, kod: d.kod || '',
          zgoda: d.zgoda || 0, produkt: d.produkt || '',
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
          wpis = Object.assign({ id: Date.now() % 1000000, data: new Date().toISOString().slice(0, 10), widoczny: true }, w);
          lista.unshift(wpis);
        }
        zapisz(KL.blog, lista);
        /* „dodaj do sklepu" — wpis staje się produktem (nowy albo aktualizacja istniejącego) */
        if (wpis.produkt && wpis.produkt.sklep) syncProdukt(wpis);
        return { ok: true, id: wpis.id };
      }

      case 'blog-widocznosc': {
        const lista = blog();
        const w = lista.find(function (x) { return Number(x.id) === Number(d.id); });
        if (!w) return { ok: false, blad: 'Nie ma takiego wpisu.' };
        w.widoczny = !!d.widoczny;
        zapisz(KL.blog, lista);
        return { ok: true };
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

      /* ---------- KALENDARZ WYNAJMU (dostępność na żywo) ---------- */
      case 'terminy-zajete': {
        const mies = String(d.miesiac || '');
        const cz = mies.split('-').map(Number);
        if (!cz[0] || !cz[1]) return { ok: false, blad: 'Zły miesiąc.' };
        const zajete = [];
        const dni = new Date(cz[0], cz[1], 0).getDate();
        for (let dz = 1; dz <= dni; dz++) {
          const iso = cz[0] + '-' + String(cz[1]).padStart(2, '0') + '-' + String(dz).padStart(2, '0');
          if (hashDemo(iso) % 5 === 0) zajete.push(iso);
        }
        /* zapytania o wynajem NIE blokują dni — rezerwacja potwierdzana jest po wpłacie */
        return { ok: true, miesiac: mies, zajete: zajete };
      }

      case 'pakiet-dostepny': {
        const id = String(d.id || '');
        const data = String(d.data || '');
        if (!id || !data) return { ok: false, blad: 'Brak pakietu lub terminu.' };
        let dostepny = hashDemo(id + '|' + data) % 5 !== 0;
        if (dostepny) {
          const konflikt = (czytaj(KL.zamowienia) || []).some(function (z) {
            return z.typ === 'wynajem' && z.pakiet && String(z.pakiet.id) === id &&
              z.termin && z.termin.data === data && z.status !== 'odrzucono';
          });
          if (konflikt) dostepny = false;
        }
        return { ok: true, dostepny: dostepny };
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
      let sw = {};
      try { sw = JSON.parse(localStorage.getItem('syg-seed-wersja') || '{}'); } catch (e2) { sw = {}; }
      if (localStorage.getItem(KL.blog) === null) { seedBlog(false); sw.blog = SEED_BLOG_W; }
      else if ((Number(sw.blog) || 0) < SEED_BLOG_W) { seedBlog(true); sw.blog = SEED_BLOG_W; }
      if (localStorage.getItem(KL.strony) === null) { seedStrony(false); sw.strony = SEED_STRON_W; }
      else if ((Number(sw.strony) || 0) < SEED_STRON_W) { seedStrony(true); sw.strony = SEED_STRON_W; }
      try { localStorage.setItem('syg-seed-wersja', JSON.stringify(sw)); } catch (e3) { /* brak zapisu */ }
      seedKonta();
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
