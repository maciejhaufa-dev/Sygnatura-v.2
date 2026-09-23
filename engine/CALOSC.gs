/* ============================================================
   Studio Sygnatura — CAŁY SILNIK W JEDNYM PLIKU (Google Apps Script)
   Wklej tę zawartość do jednego pliku (np. CODE.gs) w Apps Script.
   
   JEDYNA RZECZ DO WPISANIA:
   W linijce 12 poniżej wpisz ID swojego arkusza Google Sheets!
   ============================================================ */

/**
 * ============================================================
 * Studio Sygnatura — KONFIGURACJA SILNIKA (Google Apps Script)
 * Ten plik edytujesz raz podczas wdrożenia (instrukcja: README.md).
 * ============================================================
 */

// ID arkusza Google (z adresu: docs.google.com/spreadsheets/d/<TEN_FRAGMENT>/edit)
const ARKUSZ_ID = 'WSTAW_TU_ID_ARKUSZA';

// klucz dostępu do panelu (długi, wymyśl własny: litery + cyfry).
// Właściciel otwiera panel pod adresem:  admin.html?klucz=TEN_KLUCZ
// (w trybie z bazą logowanie admin/test z config.js przestaje działać).
const TOKEN = 'f255094c5fe76e5ce8b7c429';

// gdzie mają przychodzić powiadomienia o zamówieniach, wiadomościach,
// zapytaniach o termin i rejestracjach
const MAIL_STUDIO = 'kontakt@studiosygnatura.pl';

// adres, który klient widzi w polu „Odpowiedz do" (poczta w domenie OVH)
const DOMENA_MAIL = 'kontakt@studiosygnatura.pl';

// nazwa nadawcy w stopce maili
const NADAWCA_NAZWA = 'Studio Sygnatura';

// hasło administratora do PIERWSZEGO logowania (zakładka Admini) — po wdrożeniu
// ZMIEŃ je: w zakładce Admini podmień haslo_sha na wynik sha256('twoje nowe hasło')
// (funkcja sha256 jest w tym pliku — wybierz ją z listy funkcji → Uruchom).
const ADMIN_HASLO_STARTOWE = 'sygnatura-2026';

// cennik dostawy startowy (nadpisuje go panel: Ustawienia → cennik)
const DOSTAWA_STARTOWA = {
  odbior: 0,
  paczkomat: { S: 15.99, M: 18.99, L: 21.99 },
  kurier: { S: 18.99, M: 21.99, L: 24.99 }
};

// zakładki arkusza (tworzy je funkcja instaluj(); seedy z pliku SEED.gs)
const ZAKLADKI = ['Ustawienia', 'Katalog', 'Wiadomosci', 'Zamowienia',
  'Wynajem', 'Konta', 'Blog', 'Strony', 'Admini'];

function arkusz(nazwa) {
  const ss = SpreadsheetApp.openById(ARKUSZ_ID);
  let sh = ss.getSheetByName(nazwa);
  if (!sh) sh = ss.insertSheet(nazwa);
  return sh;
}

function ustawienie(klucz) {
  const sh = arkusz('Ustawienia');
  const dane = sh.getDataRange().getValues();
  for (let i = 1; i < dane.length; i++) {
    if (dane[i][0] === klucz) return String(dane[i][1] === null ? '' : dane[i][1]);
  }
  return '';
}

function zapiszUstawienie(klucz, wartosc) {
  const sh = arkusz('Ustawienia');
  const dane = sh.getDataRange().getValues();
  for (let i = 1; i < dane.length; i++) {
    if (dane[i][0] === klucz) { sh.getRange(i + 1, 2).setValue(wartosc); return; }
  }
  sh.getRange(dane.length + 1, 1, 1, 2).setValues([[klucz, wartosc]]);
}

/* SHA-256 (hasła kont i administratora) — do wygenerowania hashu wybierz
   tę funkcję z listy → Uruchom (wpisz hasło w argumencie albo podmień niżej) */
function sha256(t) {
  const b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(t), Utilities.Charset.UTF_8);
  return b.map(function (x) { return ('0' + ((x + 128) % 256).toString(16)).slice(-2); }).join('');
}

/**
 * Uruchom RAZ w edytorze skryptów (wybierz funkcję „instaluj" → Uruchom →
 * zezwól na uprawnienia). Tworzy zakładki, nagłówki, seedy (SEED.gs:
 * katalog + blog + podstrony) i domyślnego administratora.
 */
function instaluj() {
  ZAKLADKI.forEach(function (n) { arkusz(n); });

  const kat = arkusz('Katalog');
  if (kat.getLastRow() === 0) {
    kat.getRange(1, 1, 1, 8).setValues(
      [['id', 'nazwa', 'opis', 'cena', 'obraz', 'dostepny', 'gabaryt', 'storyId']]);
    kat.getRange(2, 1, SEED_KATALOG.length, 8).setValues(SEED_KATALOG);
  }

  const ust = arkusz('Ustawienia');
  if (ust.getLastRow() === 0) {
    ust.getRange('A1:B1').setValues([['klucz', 'wartosc']]);
    ust.appendRow(['licznik', 0]);
    ust.appendRow(['seedy', JSON.stringify(SEED_BLOG_WERSJA)]);
    ust.appendRow(['dostawa', JSON.stringify(DOSTAWA_STARTOWA)]);
    ust.appendRow(['stronaGlowna', '']);
    ust.appendRow(['stronaZamowienia', '']);
  }

  const wia = arkusz('Wiadomosci');
  if (wia.getLastRow() === 0) {
    wia.getRange(1, 1, 1, 9).setValues(
      [['ts', 'data_iso', 'imie', 'email', 'telefon', 'temat', 'tresc', 'zgoda', 'status']]);
  }

  const zam = arkusz('Zamowienia');
  if (zam.getLastRow() === 0) {
    zam.getRange(1, 1, 1, 10).setValues(
      [['sygnatura', 'data', 'typ', 'imie', 'email', 'telefon', 'kwota_razem', 'status', 'dane_json', 'historia_json']]);
  }

  const wyn = arkusz('Wynajem');
  if (wyn.getLastRow() === 0) {
    wyn.getRange(1, 1, 1, 9).setValues(
      [['data_iso', 'imie', 'email', 'telefon', 'ev', 'pakiet_id', 'termin', 'dane_json', 'status']]);
  }

  const kon = arkusz('Konta');
  if (kon.getLastRow() === 0) {
    kon.getRange(1, 1, 1, 8).setValues(
      [['email', 'imie', 'nazwisko', 'telefon', 'adres_json', 'zgody_json', 'haslo_sha', 'rejestracja']]);
  }

  const blog = arkusz('Blog');
  if (blog.getLastRow() === 0) {
    blog.getRange(1, 1, 1, 11).setValues(
      [['id', 'data', 'kategoria', 'tytul', 'zajawka', 'okladka', 'video', 'galeria_json', 'tresc', 'produkt_json', 'widoczny']]);
    SEED_BLOG.forEach(function (w) {
      blog.appendRow([w.id, w.data || '', w.kategoria || '', w.tytul, w.zajawka || '',
        w.okladka || '', w.video || '', JSON.stringify(w.galeria || []),
        w.tresc || '', JSON.stringify(w.produkt || null), w.widoczny === false ? 0 : 1]);
    });
  }

  const str = arkusz('Strony');
  if (str.getLastRow() === 0) {
    str.getRange(1, 1, 1, 5).setValues([['slug', 'tytul', 'menu', 'kol', 'tresc']]);
    SEED_STRONY.forEach(function (s) {
      str.appendRow([s.slug, s.tytul || '', s.menu ? 1 : 0, Number(s.kol || 0), s.tresc || '']);
    });
  }

  const adm = arkusz('Admini');
  if (adm.getLastRow() === 0) {
    adm.getRange(1, 1, 1, 3).setValues([['email', 'haslo_sha', 'aktywny']]);
    adm.appendRow([MAIL_STUDIO, sha256(ADMIN_HASLO_STARTOWE), 1]);
  }

  Logger.log('GOTOWE. Administrator: ' + MAIL_STUDIO +
    ' (hasło startowe: ' + ADMIN_HASLO_STARTOWE + ' — ZMIEŃ je w zakładce Admini).');
  Logger.log('Teraz: Wdróż → Nowe wdrożenie → Aplikacja internetowa ' +
    '(wykonuj jako: ja; dostęp: każdy). URL wklej do www/assets/config.js → SYG.API.');
}


/**
 * ============================================================
 * Studio Sygnatura — SEEDY SILNIKA (GENEROWANY PLIK)
 * Wygenerowany z www/assets/api.js + www/data/katalog.js.
 * NIE edytować ręcznie — po zmianie seedy klienta uruchom:
 *   node tools/gen_seed_gs.js
 * ============================================================
 */

var SEED_BLOG_WERSJA = {"blog":5,"strony":2};

var SEED_KATALOG = [
  [
    1,
    "Szopka bożonarodzeniowa (warstwowa)",
    "Flagowy produkt pracowni: ręcznie cięta szopka warstwowa 20×20 cm z podświetleniem LED 2700 K. Zamów z wyprzedzeniem — personalizacja wymaga min. 2 tygodni.",
    249,
    "szopka.jpg",
    1,
    "20×20×8 cm",
    1
  ],
  [
    2,
    "Szyld powitalny „Witajcie\"",
    "Drewniany szyld powitalny z grawerem — do domu, na wesele lub do lokalu.",
    189,
    "szyld.jpg",
    1,
    "50×25×2 cm",
    2
  ],
  [
    3,
    "Litery podświetlane LOVE",
    "Drewniane litery przestrzenne z ciepłym podświetleniem.",
    249,
    "love.jpg",
    0,
    "",
    0
  ],
  [
    4,
    "Ramka z sentencją",
    "Ramka ze sklejki z wybraną sentencją lub imionami i datą.",
    89,
    "ramka.jpg",
    0,
    "20×25×2 cm",
    3
  ]
];

var SEED_BLOG = [
  {
    "id": 1,
    "widoczny": true,
    "data": "2026-08-14",
    "kategoria": "Dekoracje świąteczne",
    "tytul": "Szopka warstwowa z podświetleniem",
    "zajawka": "Nasz flagowy produkt: ręcznie cięte warstwy sklejki 20×20 cm, ciepłe światło LED 2700 K, rama z wpustami i listwą sosnową.",
    "okladka": "assets/media/sklep/szopka.jpg",
    "video": "",
    "galeria": [
      "assets/media/sklep/szopka-2.jpg",
      "assets/media/sklep/szopka-3.jpg",
      "assets/media/sklep/szopka-4.jpg",
      "assets/media/sklep/szopka-5.jpg",
      "assets/media/sklep/szopka-6.jpg",
      "assets/media/sklep/szopka-7.jpg"
    ],
    "tresc": "<h2>Od deski do podświetlonej szopki</h2><p>Każda szopka zaczyna się od wyboru deski. Tniemy warstwy jedna po drugiej, szlifujemy krawędzie i składamy je z dystansami, żeby światło pracowało między płaszczyznami.</p><ul><li>Materiał: sklejka liściasta 4 mm, rama sosnowa z wpustami</li><li>Wykonanie: cięcie laserowe + ręczny szlif, bejca wodna i olej</li><li>Światło: taśma LED 2700 K (ciepła), włącznik przy ramie</li><li>Czas pracy: ok. 6–8 godzin na egzemplarz</li></ul>",
    "produkt": {
      "sklep": true,
      "id": 1,
      "nazwa": "Szopka bożonarodzeniowa (warstwowa)",
      "cena": 249,
      "gabaryt": "20×20×8 cm"
    }
  },
  {
    "id": 2,
    "widoczny": true,
    "data": "2026-08-02",
    "kategoria": "Szyldy i tablice",
    "tytul": "Napis „Cześć!\" w ramie z pleksi",
    "zajawka": "Frezowany drewniany napis na pleksi w podwójnej ramie — wita gości w domu i w lokalu.",
    "okladka": "assets/media/sklep/szyld.jpg",
    "video": "",
    "galeria": [
      "assets/media/sklep/szyld-2.jpg"
    ],
    "tresc": "<h2>Cześć na wejściu</h2><p>Napis frezujemy w drewnie i montujemy na przezroczystej pleksi na dystansach. Za nim ciemna rama, a całość zamyka jasna oprawa z frezowanym wzorem.</p><ul><li>Napis: frezowane drewno, dowolne słowo</li><li>Montaż: pleksi na dystansach — efekt lewitacji napisu</li><li>Oprawa: podwójna rama z frezem</li></ul>",
    "produkt": {
      "sklep": true,
      "id": 2,
      "nazwa": "Szyld powitalny „Witajcie\"",
      "cena": 189,
      "gabaryt": "50×25×2 cm"
    }
  },
  {
    "id": 3,
    "widoczny": false,
    "data": "2026-07-21",
    "kategoria": "Personalizacja",
    "tytul": "Ramka z sentencją — prezent, który zostaje",
    "zajawka": "Ramka ze sklejki z wybraną sentencją, imionami i datą.",
    "okladka": "assets/media/sklep/ramka.jpg",
    "video": "",
    "galeria": [],
    "tresc": "<h2>Sentencja, która nie wyjdzie z mody</h2><p>Ramka z grawerem to najprostszy i najbardziej osobisty prezent — od jubileuszu po dzień ślubu.</p>",
    "produkt": {
      "sklep": true,
      "id": 4,
      "nazwa": "Ramka z sentencją",
      "cena": 89,
      "gabaryt": "20×25×2 cm"
    }
  },
  {
    "id": 4,
    "widoczny": true,
    "data": "2026-08-28",
    "kategoria": "Prezenty personalizowane",
    "tytul": "Rodzinka niedźwiadków — puzzle z imionami",
    "zajawka": "Drewniane puzzle rodzinne: misie z wygrawerowanymi imionami i czerwonym sercem.",
    "okladka": "assets/media/sklep/niedzwiadki.jpg",
    "video": "",
    "galeria": [
      "assets/media/sklep/niedzwiadki-2.jpg"
    ],
    "tresc": "<h2>Cała rodzina w jednym sercu</h2><p>Cztery misie — duzi i mali — składają się w jedną całość. Na każdym grawerujemy imię, a pośrodku malujemy serce.</p><ul><li>Materiał: lite drewno, ręczny szlif i olej</li><li>Grawer: imiona domowników na każdej figurce</li><li>Prezent: na rocznicę, Dzień Mamy i Taty, parapetówkę</li></ul>",
    "produkt": {
      "sklep": false,
      "id": 0,
      "nazwa": "",
      "cena": 0,
      "gabaryt": ""
    }
  },
  {
    "id": 5,
    "widoczny": true,
    "data": "2026-08-28",
    "kategoria": "Dekoracje stołu",
    "tytul": "Serwetnik „Góry\"",
    "zajawka": "Drewniany serwetnik z linią gór — na stół w domu i na imprezę w góralskim klimacie.",
    "okladka": "assets/media/sklep/serwetnik.jpg",
    "video": "",
    "galeria": [
      "assets/media/sklep/serwetnik-2.jpg"
    ],
    "tresc": "<h2>Górski akcent na stole</h2><p>Serwetnik wycinany w kształt górskiego łańcucha — z podstawką, stabilny, na zwykłe serwetki stołowe.</p><ul><li>Materiał: drewno, olejowane</li><li>Motyw: linia gór — wytniemy też inny (serce, napis, datę)</li></ul>",
    "produkt": {
      "sklep": false,
      "id": 0,
      "nazwa": "",
      "cena": 0,
      "gabaryt": ""
    }
  },
  {
    "id": 6,
    "widoczny": true,
    "data": "2026-08-28",
    "kategoria": "Krzyżówki z imionami",
    "tytul": "Rodzinna krzyżówka z imionami",
    "zajawka": "Imiona domowników w krzyżówce na ścianę — z rodzinnymi zdjęciami i słowami: miłość, radość, wdzięczność.",
    "okladka": "assets/media/sklep/krzyzowka.jpg",
    "video": "",
    "galeria": [
      "assets/media/sklep/krzyzowka-2.jpg"
    ],
    "tresc": "<h2>Krzyżówka, która opowiada o rodzinie</h2><p>Klocki z imionami układamy w krzyżówkę na wymiar ściany. Obok wieszamy ramki ze zdjęciami, a całość spinamy słowami ważnymi dla domu.</p><ul><li>Klocki: drewniane, z grawerowanymi literami</li><li>Układ: projektujemy pod Twoją ścianę i listę imion</li><li>Dodatki: ramki na zdjęcia, słowa-relacje (miłość, radość…)</li></ul>",
    "produkt": {
      "sklep": false,
      "id": 0,
      "nazwa": "",
      "cena": 0,
      "gabaryt": ""
    }
  },
  {
    "id": 7,
    "widoczny": true,
    "data": "2026-08-12",
    "kategoria": "Numery i cyfry",
    "tytul": "Ażurowa ósemka w ramie",
    "zajawka": "Cyfra „8\" z ażurowym kwiatowym tłem — od surowego wycięcia po oprawiony obraz.",
    "okladka": "assets/media/sklep/osemka.jpg",
    "video": "",
    "galeria": [
      "assets/media/sklep/osemka-2.jpg"
    ],
    "tresc": "<h2>Od surowego wycięcia do obrazu</h2><p>Najpierw ażur: cyfra i kwiatowe tło wycinane warstwa po warstwie. Potem kolor — ciemna bejca i złoty środek — i oprawa w ramę.</p><ul><li>Technika: warstwowy ażur + bejca i złocenie</li><li>Na zdjęciach: stan przed oprawieniem i gotowy obraz</li><li>Możliwa każda cyfra, litera albo monogram</li></ul>",
    "produkt": {
      "sklep": false,
      "id": 0,
      "nazwa": "",
      "cena": 0,
      "gabaryt": ""
    }
  },
  {
    "id": 8,
    "widoczny": true,
    "data": "2026-08-26",
    "kategoria": "Lustra i ramy",
    "tytul": "Lustro w ramie do kompletu z „Cześć!\"",
    "zajawka": "Lustro w ramie korespondującej z napisem „Cześć!\" — ta sama kolorystyka, farba i motywy.",
    "okladka": "assets/media/sklep/lustro.jpg",
    "video": "",
    "galeria": [
      "assets/media/sklep/lustro-2.jpg"
    ],
    "tresc": "<h2>Komplet, nie przypadek</h2><p>Szeroka rama i jasne tło z frezowanym wzorem — lustro gra z napisem „Cześć!\" jak komplet: ta sama kolorystyka, ta sama farba, te same motywy.</p><ul><li>Komplet: rama i tło w stylu napisu „Cześć!\"</li><li>Tło: jasne, z frezowanym motywem</li><li>Wymiar: na ścianę w przedpokoju albo salonie</li></ul>",
    "produkt": {
      "sklep": false,
      "id": 0,
      "nazwa": "",
      "cena": 0,
      "gabaryt": ""
    }
  },
  {
    "id": 9,
    "widoczny": true,
    "data": "2026-08-28",
    "kategoria": "Makrama i obręcze",
    "tytul": "Makramowa rodzina na złotej obręczy",
    "zajawka": "Rodzinna makrama na ścianę: obręcz mojej roboty, aniołki żony — wspólna praca.",
    "okladka": "assets/media/sklep/makrama.jpg",
    "video": "",
    "galeria": [],
    "tresc": "<h2>Dwie pary rąk</h2><p>Aniołki z makramy na żerdzi, w złotej obręczy. Obręcz robię ja, makramy plotła żona — rodzinna pamiątka na ścianę.</p><ul><li>Obręcz: złota, z żerdzią na figurki</li><li>Figurki: makramowe aniołki — liczba do ustalenia</li><li>Prezent: na chrzest, roczek, nowe mieszkanie</li></ul>",
    "produkt": {
      "sklep": false,
      "id": 0,
      "nazwa": "",
      "cena": 0,
      "gabaryt": ""
    }
  },
  {
    "id": 10,
    "widoczny": true,
    "data": "2025-12-03",
    "kategoria": "Deski do krojenia",
    "tytul": "Deski do krojenia z grawerem",
    "zajawka": "Grawer na desce: logo klubu, śmieszny napis, dedykacja — deska do krojenia i do ozdoby.",
    "okladka": "assets/media/sklep/deska.jpg",
    "video": "",
    "galeria": [
      "assets/media/sklep/deska-2.jpg",
      "assets/media/sklep/deska-3.jpg",
      "assets/media/sklep/deska-4.jpg",
      "assets/media/sklep/deska-5.jpg",
      "assets/media/sklep/deska-6.jpg"
    ],
    "tresc": "<h2>Deska, która mówi</h2><p>Laserowy grawer na desce kuchennej — od logo „Klubu Kąśniwych Smakoszy\" po żart dla żołnierza. Do krojenia na co dzień i do powieszenia na ścianie.</p><ul><li>Grawer: logo, napis, dedykacja — Twój projekt albo nasz</li><li>Rozmiary: od śniadaniowej po rodzinny zestaw</li><li>Materiał: deska kuchenna — drewno lub bambus do wyboru</li></ul>",
    "produkt": {
      "sklep": false,
      "id": 0,
      "nazwa": "",
      "cena": 0,
      "gabaryt": ""
    }
  },
  {
    "id": 11,
    "widoczny": true,
    "data": "2026-08-28",
    "kategoria": "Pudełka prezentowe",
    "tytul": "Pudełka drewniane z grawerem",
    "zajawka": "Na komunię, na zegarek, na pamiątkę — pudełko z wygrawerowaną dedykacją.",
    "okladka": "assets/media/sklep/pudelko.jpg",
    "video": "",
    "galeria": [
      "assets/media/sklep/pudelko-2.jpg",
      "assets/media/sklep/pudelko-3.jpg"
    ],
    "tresc": "<h2>Opakowanie też jest prezentem</h2><p>Drewniane pudełko z laserowym grawerem: cytat na komunię, życzenia na zegarek, data i imię. Same pudełko cieszy tak samo jak zawartość.</p><ul><li>Dedykacja: cytat, imię, data — Twój tekst</li><li>Okucia: zameczek, zawiasy</li><li>Środek: na zegarek, biżuterię, pamiątki</li></ul>",
    "produkt": {
      "sklep": false,
      "id": 0,
      "nazwa": "",
      "cena": 0,
      "gabaryt": ""
    }
  },
  {
    "id": 12,
    "widoczny": true,
    "data": "2026-01-08",
    "kategoria": "Kartki okolicznościowe",
    "tytul": "Kartka „Sto lat!\"",
    "zajawka": "Kolorowe świeczki i życzenia — kartka na urodziny.",
    "okladka": "assets/media/sklep/kartka.jpg",
    "video": "",
    "galeria": [],
    "tresc": "<h2>Sto lat, sto świeczek</h2><p>Ręcznie zdobiona kartka urodzinowa z tęczowymi świeczkami. Prosta, wesoła, z miejscem na Twoje życzenia.</p><ul><li>Personalizacja: imię solenizanta, liczba świeczek</li><li>Okazje: urodziny, rocznice, jubileusze</li><li>Dodatek: pasuje do pudełka z prezentem</li></ul>",
    "produkt": {
      "sklep": false,
      "id": 0,
      "nazwa": "",
      "cena": 0,
      "gabaryt": ""
    }
  },
  {
    "id": 13,
    "widoczny": true,
    "data": "2025-12-08",
    "kategoria": "Decoupage i DIY",
    "tytul": "Dębowe puzzle do własnych aranżacji",
    "zajawka": "Laserowo cięte elementy z dębu — do decoupage, scrapbookingu i własnych pomysłów.",
    "okladka": "assets/media/sklep/puzzle.jpg",
    "video": "",
    "galeria": [],
    "tresc": "<h2>Półfabrykat z charakterem</h2><p>Elementy cięte laserem w dębie — baza pod decoupage, kartki, zawieszki i dekoracje. Równe krawędzie, czysty detal.</p><ul><li>Materiał: dąb, cięcie laserowe</li><li>Zastosowanie: decoupage, kartki, zawieszki</li><li>Wzory i ilości: do ustalenia</li></ul>",
    "produkt": {
      "sklep": false,
      "id": 0,
      "nazwa": "",
      "cena": 0,
      "gabaryt": ""
    }
  },
  {
    "id": 14,
    "widoczny": true,
    "data": "2026-09-02",
    "kategoria": "Dewocjonalia",
    "tytul": "Krzyżyk „Zmartwychwstałem dla Ciebie\"",
    "zajawka": "Ścienny krzyżyk z postacią Chrystusa i cytatem — pamiątka i dekoracja.",
    "okladka": "assets/media/sklep/krzyzyk.jpg",
    "video": "",
    "galeria": [],
    "tresc": "<h2>Zmartwychwstałem dla Ciebie</h2><p>Krzyżyk na ścianę z wygrawerowanym napisem i cytatem. Cięty laserem, z naturalnym rysunkiem drewna.</p><ul><li>Napis: „Zmartwychwstałem dla Ciebie\" + cytat</li><li>Wykonanie: cięcie laserowe, grawer</li><li>Na ścianę: do domu, na pamiątkę komunii, bierzmowania</li></ul>",
    "produkt": {
      "sklep": false,
      "id": 0,
      "nazwa": "",
      "cena": 0,
      "gabaryt": ""
    }
  },
  {
    "id": 15,
    "widoczny": true,
    "data": "2026-07-01",
    "kategoria": "Breloki i gadżety",
    "tytul": "Breloki z logo firmy",
    "zajawka": "Drewniany brelok z wygrawerowanym logo — gadżet dla klientów i pracowników.",
    "okladka": "assets/media/sklep/brelok.jpg",
    "video": "",
    "galeria": [
      "assets/media/sklep/brelok-2.jpg"
    ],
    "tresc": "<h2>Logo zawsze pod ręką</h2><p>Brelok z drewna z laserowym grawerem logo firmy. Lekki, trwały, miły w dotyku — gadżet, którego się nie wyrzuca.</p><ul><li>Grawer: Twoje logo, po jednej lub obu stronach</li><li>Nakład: od kilku sztuk w górę</li><li>Kształt: kwadrat, kółko, na wymiar</li></ul>",
    "produkt": {
      "sklep": false,
      "id": 0,
      "nazwa": "",
      "cena": 0,
      "gabaryt": ""
    }
  },
  {
    "id": 16,
    "widoczny": true,
    "data": "2026-08-29",
    "kategoria": "Kuchnia i stół",
    "tytul": "Frezowany plater na przekąski",
    "zajawka": "Pięć komór na przekąski — frezowany w drewnie plater na imprezę.",
    "okladka": "assets/media/sklep/plater.jpg",
    "video": "",
    "galeria": [],
    "tresc": "<h2>Impreza zaczyna się od deski</h2><p>Plater frezowany w drewnie: pięć komór na dipy, orzeszki, oliwki i co tylko podasz. Stabilny, łatwy do umycia, ładny na stole.</p><ul><li>Komory: 5 — na dipy, przekąski, dodatki</li><li>Materiał: lite drewno, olejowane</li><li>Wymiar: rodzinny, na środek stołu</li></ul>",
    "produkt": {
      "sklep": false,
      "id": 0,
      "nazwa": "",
      "cena": 0,
      "gabaryt": ""
    }
  },
  {
    "id": 17,
    "widoczny": true,
    "data": "2026-08-29",
    "kategoria": "Kuchnia i stół",
    "tytul": "Frezowana podstawka na jajka",
    "zajawka": "Dziesięć gniazd frezowanych w litym drewnie — na jajka i pisanki.",
    "okladka": "assets/media/sklep/jajka.jpg",
    "video": "",
    "galeria": [
      "assets/media/sklep/jajka-2.jpg"
    ],
    "tresc": "<h2>Porządek w jajkach</h2><p>Podstawka frezowana w litym drewnie: dziesięć gniazd na jajka. Na co dzień do kuchni, od święta na pisanki.</p><ul><li>Gniazda: 10, frezowane w litym drewnie</li><li>Materiał: lite drewno, olejowane</li><li>Okazje: Wielkanoc, śniadania, stół wiejski</li></ul>",
    "produkt": {
      "sklep": false,
      "id": 0,
      "nazwa": "",
      "cena": 0,
      "gabaryt": ""
    }
  }
];

var SEED_STRONY = [
  {
    "slug": "pracownia",
    "tytul": "Pracownia",
    "menu": 1,
    "kol": 3,
    "tresc": "<h2>Kim jesteśmy</h2><p>Studio Sygnatura to <b>rodzinna manufaktura</b> — w naszych rzeczach spotykają się drewno, światło i detal.</p><h2>Co robimy</h2><ul><li><b>Dekoracje na wydarzenia</b> — tablice powitalne, plany stołów, litery przestrzenne, krzyżówki z imionami.</li><li><b>Personalizowane prezenty</b> — grawerowane wkładki, winietki, ramki z sentencją.</li><li><b>Produkty do domu</b> — szopki warstwowe, szyldy powitalne, podświetlane litery.</li></ul><h2>Nasza zasada</h2><p>Najpierw rozumiemy, po co dana rzecz powstaje — potem projektujemy, a na końcu tniemy, malujemy i podświetlamy.</p><p><a href=\"realizacje.html\" style=\"color:var(--butelkowa);border-bottom:1px solid var(--zloty)\">Zobacz nasze realizacje →</a> · <a href=\"kontakt.html\" style=\"color:var(--butelkowa);border-bottom:1px solid var(--zloty)\">Zapytaj o wycenę →</a></p>"
  }
];


/**
 * ============================================================
 * Studio Sygnatura — SILNIK (Google Apps Script = JavaScript)
 * Pełne lustro akcji demo z www/assets/api.js (wersja 28.39).
 *
 * PUBLICZNE: katalog, wiadomosc, zamowienie, konto-*,
 *   wynajem-zapytanie, terminy-zajete, pakiet-dostepny,
 *   blog-lista, blog-pobierz, strony-lista,
 *   strona-glowna-pobierz, strona-zamowienia-pobierz
 * ADMIN (klucz = TOKEN z Konfig.gs; właściciel otwiera
 *   admin.html?klucz=… i klucz idzie w każdej prośbie):
 *   admin-login, zamowienia-lista, zamowienie-status,
 *   blog-zapisz, blog-widocznosc, blog-usun, produkt-nowy,
 *   produkty-zapisz, strona-glowna-zapisz, strona-zamowienia-zapisz,
 *   strona-zapisz, strona-usun, ustawienia-dostawa-zapisz,
 *   wynajem-zapytania-lista, wiadomosci-lista
 * ============================================================
 */

function doGet(e) {
  const akcja = (e && e.parameter && e.parameter.akcja) || 'katalog';
  try {
    if (akcja === 'katalog') return odpowiedz(katalog());
    return odpowiedz({ ok: false, blad: 'Wysyłaj POST (akcja w URL ?akcja=).' });
  } catch (err) {
    return odpowiedz({ ok: false, blad: 'Błąd: ' + err.message });
  }
}

function doPost(e) {
  let dane = {};
  try {
    dane = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return odpowiedz({ ok: false, blad: 'Błędny format danych.' });
  }
  /* akcja idzie w URL (?akcja=…) — tak dzwoni klient (api.js) */
  const akcja = (e && e.parameter && e.parameter.akcja) || String(dane.akcja || '');
  try {
    switch (akcja) {
      /* ---------------- publiczne ---------------- */
      case 'katalog':                 return odpowiedz(katalog());
      case 'wiadomosc':               return odpowiedz(zapiszWiadomosc(dane));
      case 'zamowienie':              return odpowiedz(zapiszZamowienie(dane));
      case 'konto-rejestracja':       return odpowiedz(kontoRejestracja(dane));
      case 'konto-zaloguj':           return odpowiedz(kontoZaloguj(dane));
      case 'konto-wyloguj':           return odpowiedz({ ok: true });
      case 'konto-pobierz':           return odpowiedz(kontoPobierz(dane));
      case 'konto-zapisz':            return odpowiedz(kontoZapisz(dane));
      case 'konto-zmien-haslo':       return odpowiedz(kontoZmienHaslo(dane));
      case 'konto-zamowienia':        return odpowiedz(kontoZamowienia(dane));
      case 'wynajem-zapytanie':       return odpowiedz(zapiszWynajemZapytanie(dane));
      case 'terminy-zajete':          return odpowiedz(terminyZajete(dane));
      case 'pakiet-dostepny':         return odpowiedz(pakietDostepny(dane));
      case 'blog-lista':              return odpowiedz(blogLista());
      case 'blog-pobierz':            return odpowiedz(blogPobierz(dane));
      case 'strony-lista':            return odpowiedz(stronyLista());
      case 'strona-glowna-pobierz':   return odpowiedz({ ok: true, dane: odczytJsonUstawienia('stronaGlowna') });
      case 'strona-zamowienia-pobierz': return odpowiedz({ ok: true, dane: odczytJsonUstawienia('stronaZamowienia') });
      /* ---------------- admin (klucz) ---------------- */
      case 'admin-login':             return odpowiedz(adminLogin(dane));
      case 'zamowienia-lista':        return odpowiedz(maKlucz(dane) ? zamowieniaLista() : bladKlucza());
      case 'zamowienie-status':       return odpowiedz(maKlucz(dane) ? zmienStatus(dane) : bladKlucza());
      case 'blog-zapisz':             return odpowiedz(maKlucz(dane) ? blogZapisz(dane) : bladKlucza());
      case 'blog-widocznosc':         return odpowiedz(maKlucz(dane) ? blogWidocznosc(dane) : bladKlucza());
      case 'blog-usun':               return odpowiedz(maKlucz(dane) ? blogUsun(dane) : bladKlucza());
      case 'produkt-nowy':            return odpowiedz(maKlucz(dane) ? produktNowy(dane) : bladKlucza());
      case 'produkty-zapisz':         return odpowiedz(maKlucz(dane) ? produktyZapisz(dane) : bladKlucza());
      case 'strona-glowna-zapisz':    return odpowiedz(maKlucz(dane) ? zapiszJsonUstawienia('stronaGlowna', dane) : bladKlucza());
      case 'strona-zamowienia-zapisz': return odpowiedz(maKlucz(dane) ? zapiszJsonUstawienia('stronaZamowienia', dane) : bladKlucza());
      case 'strona-zapisz':           return odpowiedz(maKlucz(dane) ? stronaZapisz(dane) : bladKlucza());
      case 'strona-usun':             return odpowiedz(maKlucz(dane) ? stronaUsun(dane) : bladKlucza());
      case 'ustawienia-dostawa-zapisz': return odpowiedz(maKlucz(dane) ? dostawaZapisz(dane) : bladKlucza());
      case 'wynajem-zapytania-lista': return odpowiedz(maKlucz(dane) ? wynajemZapytaniaLista() : bladKlucza());
      case 'wiadomosci-lista':        return odpowiedz(maKlucz(dane) ? wiadomosciLista() : bladKlucza());
      default:                        return odpowiedz({ ok: false, blad: 'Nieznana akcja: ' + akcja });
    }
  } catch (err) {
    return odpowiedz({ ok: false, blad: 'Błąd: ' + err.message });
  }
}

function odpowiedz(ob) {
  return ContentService.createTextOutput(JSON.stringify(ob))
    .setMimeType(ContentService.MimeType.JSON);
}

function maKlucz(d) {
  const t = String(d.klucz || '');
  return t !== '' && t === TOKEN && String(TOKEN).indexOf('WSTAW_TU') !== 0;
}
function bladKlucza() { return { ok: false, blad: 'Brak dostępu — zły klucz.' }; }

/* te same obliczenia co w demo (api.js) — deterministyczny hash djb2, 32 bity */
function hashDemo(str) {
  let h = 5381;
  for (let i = 0; i < String(str).length; i++) { h = ((h * 33) + String(str).charCodeAt(i)) >>> 0; }
  return h;
}

function czyscObiekt(o) {
  const kopia = {};
  Object.keys(o).forEach(function (k) { if (k !== '_i') kopia[k] = o[k]; });
  return kopia;
}

/* ---------------- katalog ---------------- */
function katalog() {
  const dane = arkusz('Katalog').getDataRange().getValues();
  const lista = [];
  for (let i = 1; i < dane.length; i++) {
    const r = dane[i];
    if (r[0] === '' || r[0] === null) continue;
    lista.push({
      id: Number(r[0]),
      nazwa: String(r[1] || ''),
      opis: String(r[2] || ''),
      cena: Number(r[3] || 0),
      obraz: String(r[4] || ''),
      dostepny: Number(r[5]) === 1,
      gabaryt: String(r[6] || ''),
      storyId: Number(r[7] || 0)
    });
  }
  /* jak demo: zwracamy całość — klient sam filtruje dostepny */
  return { ok: true, katalog: lista };
}

/* ---------------- wiadomość z formularza ---------------- */
function zapiszWiadomosc(d) {
  const imie = String(d.imie || '').trim();
  const email = String(d.email || '').trim();
  const tresc = String(d.tresc || '').trim();
  if (!imie || !email || !tresc) return { ok: false, blad: 'Uzupełnij imię, e-mail i treść.' };
  if (d.bot) return { ok: true };  // bot — udajemy sukces
  const sh = arkusz('Wiadomosci');
  sh.appendRow([Date.now(), new Date().toISOString(), imie, email,
    String(d.telefon || ''), String(d.temat || 'Inne'), tresc, d.zgoda ? 1 : 0, 'nowa']);
  try {
    MailApp.sendEmail({
      to: MAIL_STUDIO,
      replyTo: DOMENA_MAIL,
      subject: 'Nowa wiadomość ze strony: ' + (d.temat || 'Inne'),
      body: 'Od: ' + imie + ' <' + email + '>' + (d.telefon ? ' (tel. ' + d.telefon + ')' : '') +
        '\nTemat: ' + (d.temat || 'Inne') + '\n\n' + tresc
    });
  } catch (err) { Logger.log('mail: ' + err); }
  return { ok: true, id: sh.getLastRow() };
}

/* ---------------- zamówienie ---------------- */
function zapiszZamowienie(d) {
  const klient = d.klient || {};
  const imie = String(klient.imie || '').trim();
  const email = String(klient.email || '').trim();
  if (!imie || !email) return { ok: false, blad: 'Brak imienia lub e-maila.' };

  const sygnatura = nastepnaSygnatura();
  const kwoty = d.kwoty || {};
  const daneZ = {
    pozycje: d.pozycje || [], pers: d.pers || [], pomysl: d.pomysl || '',
    dostawa: d.dostawa || null, adres: klient.adres || null,
    kod: d.kod || '', zgoda: d.zgoda || 0, produkt: d.produkt || '',
    wiadomosc: d.wiadomosc || '', pakiet: d.pakiet || null, termin: d.termin || null,
    kwoty: kwoty
  };
  arkusz('Zamowienia').appendRow([
    sygnatura, new Date().toISOString(), String(d.typ || 'sklep'),
    imie, email, String(klient.telefon || ''),
    Number(kwoty.razem || 0), 'zapytanie',
    JSON.stringify(daneZ), JSON.stringify([{ t: new Date().toISOString(), s: 'zapytanie' }])
  ]);

  /* maile: do Studia i do klienta (nie blokują zapisu przy awarii) */
  const pozycjeTxt = (daneZ.pozycje || []).map(function (p) {
    return '• ' + p.nazwa + (p.ile > 1 ? ' ×' + p.ile : '') + ' — ' + p.cena * p.ile + ' zł';
  }).join('\n');
  const persTxt = (daneZ.pers || []).map(function (p) {
    return '• ' + (p.nazwa || p.tytul || 'personalizacja') + (p.tresc ? ' — „' + p.tresc + '”' : '');
  }).join('\n');
  try {
    MailApp.sendEmail({
      to: MAIL_STUDIO,
      replyTo: DOMENA_MAIL,
      subject: 'Nowe zamówienie ' + sygnatura + ' — ' + imie,
      body: 'SYGNATURA: ' + sygnatura + '\nOD: ' + imie + ' <' + email + '>' +
        (klient.telefon ? ' (tel. ' + klient.telefon + ')' : '') + '\nDOSTAWA: ' + dostawaTekst(d) +
        '\n\nPOZYCJE:\n' + (pozycjeTxt || '—') +
        (persTxt ? '\n\nPERSONALIZACJE:\n' + persTxt : '') +
        (daneZ.kod ? '\n\nKOD RABATOWY: ' + daneZ.kod : '') +
        '\n\nRAZEM: ' + (kwoty.razem || 0) + ' zł' + (kwoty.kaucja ? ' (+ kaucja ' + kwoty.kaucja + ' zł)' : '') +
        '\n\nWIADOMOŚĆ KLIENTA:\n' + (daneZ.wiadomosc || '—')
    });
    MailApp.sendEmail({
      to: email,
      replyTo: DOMENA_MAIL,
      subject: 'Potwierdzenie zamówienia ' + sygnatura + ' — Studio Sygnatura',
      body: 'Dzień dobry,\n\ndziękujemy za zamówienie w Studio Sygnatura.\n\n' +
        'Sygnatura sprawy: ' + sygnatura + '\n' +
        'Prosimy posługiwać się nią w całej korespondencji.\n\n' +
        'W ciągu 1–2 dni roboczych wyślemy potwierdzenie z pełnym podsumowaniem ' +
        'i danymi do przedpłaty.\n\nZ pozdrowieniami, ' + NADAWCA_NAZWA
    });
  } catch (err) { Logger.log('mail: ' + err); }
  return { ok: true, sygnatura: sygnatura };
}

function nastepnaSygnatura() {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    let licznik = parseInt(ustawienie('licznik') || '0', 10) || 0;
    licznik += 1;
    zapiszUstawienie('licznik', licznik);
    return 'SYG-' + new Date().getFullYear() + '-' + String(licznik).padStart(3, '0');
  } finally {
    lock.releaseLock();
  }
}

function dostawaTekst(d) {
  const dst = d.dostawa;
  if (!dst) return 'Odbiór osobisty (Poznań i okolice)';
  if (dst.metoda === 'odbior' || !dst.metoda) return 'Odbiór osobisty (Poznań i okolice)';
  let t = dst.metoda === 'paczkomat'
    ? 'Paczkomat InPost (paczka ' + (dst.rozmiar || '?') + ')'
    : 'Kurier (paczka ' + (dst.rozmiar || '?') + ')';
  if (dst.paczkomat) t += ' — paczkomat: ' + dst.paczkomat;
  if (dst.adres) t += ' — adres: ' + dst.adres;
  return t;
}

/* ---------------- panel admina: zamówienia ---------------- */
function zamowienieZWiersza(r) {
  let dane = {}, historia = [];
  try { dane = JSON.parse(r[8] || '{}'); } catch (e) {}
  try { historia = JSON.parse(r[9] || '[]'); } catch (e) {}
  return {
    sygnatura: String(r[0]),
    data: String(r[1] || ''),
    typ: String(r[2] || 'sklep'),
    klient: { imie: String(r[3] || ''), email: String(r[4] || ''), telefon: String(r[5] || '') },
    pozycje: dane.pozycje || [], pers: dane.pers || [], pomysl: dane.pomysl || '',
    kwoty: dane.kwoty || {},
    dostawa: dane.dostawa || null, kod: dane.kod || '', zgoda: dane.zgoda || 0,
    produkt: dane.produkt || '', wiadomosc: dane.wiadomosc || '',
    pakiet: dane.pakiet || null, termin: dane.termin || null,
    status: String(r[7] || 'zapytanie'),
    historia: historia
  };
}

function zamowieniaLista() {
  const dane = arkusz('Zamowienia').getDataRange().getValues();
  const lista = [];
  for (let i = dane.length - 1; i >= 1; i--) {
    const r = dane[i];
    if (r[0] === '' || r[0] === null) continue;
    lista.push(zamowienieZWiersza(r));
  }
  return { ok: true, zamowienia: lista };
}

function zmienStatus(d) {
  const syg = String(d.sygnatura || '');
  const status = String(d.status || '');
  if (!syg || !status) return { ok: false, blad: 'Brak sygnatury lub statusu.' };
  const sh = arkusz('Zamowienia');
  const dane = sh.getDataRange().getValues();
  for (let i = 1; i < dane.length; i++) {
    if (String(dane[i][0]) === syg) {
      sh.getRange(i + 1, 8).setValue(status);
      let historia = [];
      try { historia = JSON.parse(dane[i][9] || '[]'); } catch (e) {}
      historia.push({ t: new Date().toISOString(), s: status });
      sh.getRange(i + 1, 10).setValue(JSON.stringify(historia));
      return { ok: true };
    }
  }
  return { ok: false, blad: 'Nie ma zamówienia ' + syg + '.' };
}

/* ---------------- KONTA UŻYTKOWNIKÓW ---------------- */
function kontoZWiersza(i, dane) {
  const r = dane[i];
  let adres = { ulica: '', kod: '', miasto: '' }, zgody = { newsletter: false, telefon: false };
  try { adres = Object.assign(adres, JSON.parse(r[4] || '{}')); } catch (e) {}
  try { zgody = Object.assign(zgody, JSON.parse(r[5] || '{}')); } catch (e) {}
  return { email: String(r[0]).toLowerCase(), imie: String(r[1] || ''), nazwisko: String(r[2] || ''),
    telefon: String(r[3] || ''), adres: adres, zgody: zgody,
    haslo_sha: String(r[6] || ''), rejestracja: String(r[7] || ''), _i: i };
}
function kontoBezHasla(u) {
  return { email: u.email, imie: u.imie, nazwisko: u.nazwisko, telefon: u.telefon,
    adres: u.adres, zgody: u.zgody, rejestracja: u.rejestracja };
}

function kontoRejestracja(d) {
  const email = String(d.email || '').trim().toLowerCase();
  const haslo = String(d.haslo || '');
  if (!d.imie || !email || !haslo) return { ok: false, blad: 'Uzupełnij imię, nazwisko, e-mail i hasło.' };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, blad: 'Podaj poprawny adres e-mail.' };
  if (haslo.length < 8) return { ok: false, blad: 'Hasło musi mieć co najmniej 8 znaków.' };
  const sh = arkusz('Konta');
  const dane = sh.getDataRange().getValues();
  for (let i = 1; i < dane.length; i++) {
    if (String(dane[i][0] || '').toLowerCase() === email) {
      return { ok: false, blad: 'Konto z tym adresem e-mail już istnieje — zaloguj się.' };
    }
  }
  const u = { email: email, imie: String(d.imie).trim(), nazwisko: String(d.nazwisko || '').trim(),
    telefon: '', adres: { ulica: '', kod: '', miasto: '' },
    zgody: { newsletter: true, telefon: false }, rejestracja: new Date().toISOString() };
  sh.appendRow([u.email, u.imie, u.nazwisko, u.telefon,
    JSON.stringify(u.adres), JSON.stringify(u.zgody), sha256(haslo), u.rejestracja]);
  try {
    MailApp.sendEmail({
      to: email, replyTo: DOMENA_MAIL,
      subject: 'Witaj w Studio Sygnatura',
      body: 'Dzień dobry ' + u.imie + ',\n\nzałożyliśmy Twoje konto. Zaloguj się na stronie ' +
        '(ikona konta w prawym górnym rogu) — zapiszesz tam dane do wysyłki i zobaczysz historię zamówień.\n\n' + NADAWCA_NAZWA
    });
  } catch (e) { Logger.log('mail: ' + e); }
  return { ok: true, konto: kontoBezHasla(u) };
}

function kontoZaloguj(d) {
  const email = String(d.email || '').trim().toLowerCase();
  const sh = arkusz('Konta');
  const dane = sh.getDataRange().getValues();
  for (let i = 1; i < dane.length; i++) {
    if (String(dane[i][0] || '').toLowerCase() === email &&
        String(dane[i][6]) === sha256(String(d.haslo || ''))) {
      return { ok: true, konto: kontoBezHasla(kontoZWiersza(i, dane)) };
    }
  }
  return { ok: false, blad: 'Nieprawidłowy e-mail lub hasło.' };
}

function kontoPobierz(d) {
  const email = String(d._email || '').toLowerCase();
  if (!email) return { ok: true, konto: null };
  const dane = arkusz('Konta').getDataRange().getValues();
  for (let i = 1; i < dane.length; i++) {
    if (String(dane[i][0] || '').toLowerCase() === email) {
      return { ok: true, konto: kontoBezHasla(kontoZWiersza(i, dane)) };
    }
  }
  return { ok: true, konto: null };
}

function kontoZapisz(d) {
  const email = String(d._email || '').toLowerCase();
  if (!email) return { ok: false, blad: 'Nie jesteś zalogowany.' };
  const kd = d.dane || {};
  if (!String(kd.imie || '').trim()) return { ok: false, blad: 'Imię nie może być puste.' };
  const sh = arkusz('Konta');
  const dane = sh.getDataRange().getValues();
  for (let i = 1; i < dane.length; i++) {
    if (String(dane[i][0] || '').toLowerCase() === email) {
      const adres = {
        ulica: String((kd.adres && kd.adres.ulica) || '').trim(),
        kod: String((kd.adres && kd.adres.kod) || '').trim(),
        miasto: String((kd.adres && kd.adres.miasto) || '').trim()
      };
      const zgody = { newsletter: !!(kd.zgody && kd.zgody.newsletter),
        telefon: !!(kd.zgody && kd.zgody.telefon) };
      sh.getRange(i + 1, 2, 1, 6).setValues([[
        String(kd.imie).trim(), String(kd.nazwisko || '').trim(),
        String(kd.telefon || '').trim(), JSON.stringify(adres), JSON.stringify(zgody), dane[i][6]
      ]]);
      const dane2 = sh.getDataRange().getValues();
      return { ok: true, konto: kontoBezHasla(kontoZWiersza(i, dane2)) };
    }
  }
  return { ok: false, blad: 'Nie znaleziono konta — zaloguj się ponownie.' };
}

function kontoZmienHaslo(d) {
  const email = String(d._email || '').toLowerCase();
  if (!email) return { ok: false, blad: 'Nie jesteś zalogowany.' };
  const nowe = String(d.nowe || '');
  if (nowe.length < 8) return { ok: false, blad: 'Nowe hasło musi mieć co najmniej 8 znaków.' };
  const sh = arkusz('Konta');
  const dane = sh.getDataRange().getValues();
  for (let i = 1; i < dane.length; i++) {
    if (String(dane[i][0] || '').toLowerCase() === email) {
      if (String(dane[i][6]) !== sha256(String(d.stare || ''))) {
        return { ok: false, blad: 'Obecne hasło jest nieprawidłowe.' };
      }
      sh.getRange(i + 1, 7).setValue(sha256(nowe));
      return { ok: true };
    }
  }
  return { ok: false, blad: 'Nie znaleziono konta — zaloguj się ponownie.' };
}

function kontoZamowienia(d) {
  const email = String(d._email || '').toLowerCase();
  if (!email) return { ok: true, zamowienia: [] };
  const rok = new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString();
  const dane = arkusz('Zamowienia').getDataRange().getValues();
  const lista = [];
  for (let i = dane.length - 1; i >= 1; i--) {
    const r = dane[i];
    if (r[0] === '' || r[0] === null) continue;
    if (String(r[4] || '').toLowerCase() !== email) continue;
    const data = String(r[1] || '');
    if (data && data < rok) continue;  /* maks. 12 miesięcy — jak w demo */
    lista.push(zamowienieZWiersza(r));
  }
  return { ok: true, zamowienia: lista };
}

/* ---------------- WYNAJEM: zapytanie o termin ---------------- */
function zapiszWynajemZapytanie(d) {
  const klientW = d.klient || {};
  const imie = String(klientW.imie || '').trim();
  const email = String(klientW.email || '').trim();
  if (!imie || !email) return { ok: false, blad: 'Brak imienia lub e-maila.' };
  if (!d.pakiet || !(d.termin && d.termin.data)) return { ok: false, blad: 'Wybierz termin i pakiet.' };
  const sh = arkusz('Wynajem');
  sh.appendRow([
    new Date().toISOString(), imie, email, String(klientW.telefon || ''),
    String(d.ev || ''), String((d.pakiet && d.pakiet.id) || ''),
    String(d.termin.data || ''),
    JSON.stringify({ klient: klientW, pakiet: d.pakiet, termin: d.termin,
      pers: d.pers || [], kwoty: d.kwoty || {} }),
    'zapytanie'
  ]);
  const pk = d.pakiet || {};
  try {
    MailApp.sendEmail({
      to: MAIL_STUDIO, replyTo: DOMENA_MAIL,
      subject: 'Zapytanie o termin wynajmu — ' + (pk.nazwa || pk.id || '') + ' (' + d.termin.data + ')',
      body: 'OD: ' + imie + ' <' + email + '>' + (klientW.telefon ? ' (tel. ' + klientW.telefon + ')' : '') +
        '\nEVENEMENT: ' + (d.ev || '—') + '\nPAKIET: ' + (pk.nazwa || '—') + ' — ' + (pk.cenaTxt || '') +
        '\nTERMIN: ' + d.termin.data +
        '\n\nRezerwacja potwierdzana po wpłacie — zmień status w zakładce Wynajem\n' +
        'na „zarezerwowany" po otrzymaniu przelewu (dzień zablokuje się w kalendarzu).'
    });
    MailApp.sendEmail({
      to: email, replyTo: DOMENA_MAIL,
      subject: 'Zapytanie o termin wynajmu — Studio Sygnatura',
      body: 'Dzień dobry ' + imie + ',\n\ndziękujemy za zapytanie o termin ' + d.termin.data +
        ' (pakiet ' + (pk.nazwa || '—') + ').\n\nW ciągu 1–2 dni roboczych potwierdzimy ' +
        'dostępność i wyślemy dane do wpłaty — rezerwacja staje się obowiązująca po wpłacie.\n\nZ pozdrowieniami, ' + NADAWCA_NAZWA
    });
  } catch (err) { Logger.log('mail: ' + err); }
  return { ok: true, id: sh.getLastRow() };
}

function wynajemZapytaniaLista() {
  const dane = arkusz('Wynajem').getDataRange().getValues();
  const lista = [];
  for (let i = dane.length - 1; i >= 1; i--) {
    const r = dane[i];
    if (r[0] === '' || r[0] === null) continue;
    let z = {};
    try { z = JSON.parse(r[7] || '{}'); } catch (e) {}
    lista.push({ data: String(r[0]), imie: String(r[1] || ''), email: String(r[2] || ''),
      telefon: String(r[3] || ''), ev: String(r[4] || ''), pakietId: String(r[5] || ''),
      termin: String(r[6] || ''), szczegoly: z, status: String(r[8] || 'zapytanie') });
  }
  return { ok: true, zapytania: lista };
}

/* ---------------- KALENDARZ WYNAJMU (dostępność na żywo) ---------------- */
function terminyZajete(d) {
  const mies = String(d.miesiac || '');
  const cz = mies.split('-').map(Number);
  if (!cz[0] || !cz[1]) return { ok: false, blad: 'Zły miesiąc.' };
  const zajete = [];
  const dni = new Date(cz[0], cz[1], 0).getDate();
  for (let dz = 1; dz <= dni; dz++) {
    const iso = cz[0] + '-' + String(cz[1]).padStart(2, '0') + '-' + String(dz).padStart(2, '0');
    if (hashDemo(iso) % 5 === 0) zajete.push(iso);
  }
  /* potwierdzone rezerwacje (po wpłacie) blokują dni;
     zapytania NIE blokują — jak w demo */
  const zw = arkusz('Wynajem').getDataRange().getValues();
  for (let i = 1; i < zw.length; i++) {
    if (String(zw[i][8]) === 'zarezerwowany' && String(zw[i][6])) {
      const dstr = String(zw[i][6]);
      if (dstr.indexOf(mies + '-') === 0 && zajete.indexOf(dstr) < 0) zajete.push(dstr);
    }
  }
  return { ok: true, miesiac: mies, zajete: zajete };
}

function pakietDostepny(d) {
  const id = String(d.id || '');
  const data = String(d.data || '');
  if (!id || !data) return { ok: false, blad: 'Brak pakietu lub terminu.' };
  let dostepny = hashDemo(id + '|' + data) % 5 !== 0;
  if (dostepny) {
    const zw = arkusz('Wynajem').getDataRange().getValues();
    for (let i = 1; i < zw.length; i++) {
      if (String(zw[i][5]) === id && String(zw[i][6]) === data &&
          String(zw[i][8]) === 'zarezerwowany') { dostepny = false; break; }
    }
  }
  return { ok: true, dostepny: dostepny };
}

/* ---------------- BLOG (realizacje jako wpisy) ---------------- */
function blogWiersze() {
  const dane = arkusz('Blog').getDataRange().getValues();
  const lista = [];
  for (let i = 1; i < dane.length; i++) {
    const r = dane[i];
    if (r[0] === '' || r[0] === null) continue;
    let galeria = [], produkt = null;
    try { galeria = JSON.parse(r[7] || '[]'); } catch (e) {}
    try { produkt = JSON.parse(r[9] || 'null'); } catch (e) {}
    lista.push({ id: Number(r[0]), data: String(r[1] || ''), kategoria: String(r[2] || ''),
      tytul: String(r[3] || ''), zajawka: String(r[4] || ''), okladka: String(r[5] || ''),
      video: String(r[6] || ''), galeria: galeria, tresc: String(r[8] || ''),
      produkt: produkt, widoczny: Number(r[10]) === 1, _i: i });
  }
  return lista;
}

function blogLista() {
  const lista = blogWiersze().map(czyscObiekt);
  return { ok: true, wpisy: lista };
}

function blogPobierz(d) {
  const w = blogWiersze().find(function (x) { return Number(x.id) === Number(d.id); });
  if (!w) return { ok: false, blad: 'Nie ma takiego wpisu.' };
  return { ok: true, wpis: czyscObiekt(w) };
}

function normalizujObraz(obraz) {
  const s = String(obraz || '');
  const prefix = 'assets/media/sklep/';
  const i = s.indexOf(prefix);
  if (i >= 0) return s.slice(i + prefix.length);
  return s;
}

/* wpis z „dodaj do sklepie" → produkt w arkuszu Katalog (aktualizacja albo nowy) */
function syncProdukt(wpis) {
  const pr = wpis.produkt || {};
  const sh = arkusz('Katalog');
  const dane = sh.getDataRange().getValues();
  const obraz = normalizujObraz(wpis.okladka || pr.obraz || 'szopka.jpg');
  for (let i = 1; i < dane.length; i++) {
    if (Number(dane[i][0]) === Number(pr.id)) {
      sh.getRange(i + 1, 2).setValue(pr.nazwa || dane[i][1]);
      sh.getRange(i + 1, 4).setValue(Number(pr.cena || 0));
      sh.getRange(i + 1, 7).setValue(pr.gabaryt || '');
      sh.getRange(i + 1, 8).setValue(wpis.id);
      return;
    }
  }
  const nowyId = Number(pr.id) || (Date.now() % 1000000);
  sh.appendRow([nowyId, pr.nazwa || wpis.tytul,
    pr.opis || ('Historia tego produktu: „' + wpis.tytul + '” — zobacz na blogu.'),
    Number(pr.cena || 0), obraz, 1, pr.gabaryt || '', wpis.id]);
}

function blogZapisz(d) {
  const w = d.wpis || {};
  if (!w.tytul) return { ok: false, blad: 'Brak tytułu wpisu.' };
  const sh = arkusz('Blog');
  const lista = blogWiersze();
  const i = lista.findIndex(function (x) { return Number(x.id) === Number(w.id); });
  let wpis;
  if (w.id) {
    if (i >= 0) {
      wpis = Object.assign(lista[i], w);
      sh.getRange(wpis._i + 1, 1, 1, 11).setValues([[
        wpis.id, wpis.data || '', wpis.kategoria || '', wpis.tytul, wpis.zajawka || '',
        wpis.okladka || '', wpis.video || '', JSON.stringify(wpis.galeria || []),
        wpis.tresc || '', JSON.stringify(wpis.produkt || null), wpis.widoczny ? 1 : 0
      ]]);
    } else {
      wpis = Object.assign({ id: w.id }, w);
      sh.appendRow([wpis.id, wpis.data || '', wpis.kategoria || '', wpis.tytul, wpis.zajawka || '',
        wpis.okladka || '', wpis.video || '', JSON.stringify(wpis.galeria || []),
        wpis.tresc || '', JSON.stringify(wpis.produkt || null), wpis.widoczny === false ? 0 : 1]);
    }
  } else {
    wpis = Object.assign({ id: Date.now() % 1000000,
      data: new Date().toISOString().slice(0, 10), widoczny: true }, w);
    sh.appendRow([wpis.id, wpis.data, wpis.kategoria || '', wpis.tytul, wpis.zajawka || '',
      wpis.okladka || '', wpis.video || '', JSON.stringify(wpis.galeria || []),
      wpis.tresc || '', JSON.stringify(wpis.produkt || null), 1]);
  }
  if (wpis.produkt && wpis.produkt.sklep) syncProdukt(wpis);
  return { ok: true, id: wpis.id };
}

function blogWidocznosc(d) {
  const lista = blogWiersze();
  const w = lista.find(function (x) { return Number(x.id) === Number(d.id); });
  if (!w) return { ok: false, blad: 'Nie ma takiego wpisu.' };
  arkusz('Blog').getRange(w._i + 1, 11).setValue(d.widoczny ? 1 : 0);
  return { ok: true };
}

function blogUsun(d) {
  const lista = blogWiersze();
  const w = lista.find(function (x) { return Number(x.id) === Number(d.id); });
  if (!w) return { ok: true };
  arkusz('Blog').deleteRow(w._i + 1);
  return { ok: true };
}

/* produkt „bez historii" — wprost z zakładki Produkty */
function produktNowy(d) {
  const sh = arkusz('Katalog');
  const dane = sh.getDataRange().getValues();
  const id = Number(d.id) || (Date.now() % 1000000);
  const wiersz = [id, d.nazwa || 'Nowy produkt', d.opis || '', Number(d.cena || 0),
    normalizujObraz(d.obraz || 'szopka.jpg'), 1, d.gabaryt || '', Number(d.storyId || 0)];
  for (let i = 1; i < dane.length; i++) {
    if (Number(dane[i][0]) === id) { sh.getRange(i + 1, 1, 1, 8).setValues([wiersz]); return { ok: true, id: id }; }
  }
  sh.appendRow(wiersz);
  return { ok: true, id: id };
}

function produktyZapisz(d) {
  const sh = arkusz('Katalog');
  const dane = sh.getDataRange().getValues();
  for (let i = 1; i < dane.length; i++) {
    if (Number(dane[i][0]) === Number(d.id)) {
      sh.getRange(i + 1, 4).setValue(Number(d.cena || 0));
      sh.getRange(i + 1, 6).setValue(d.dostepny ? 1 : 0);
      return { ok: true };
    }
  }
  return { ok: false, blad: 'Nie ma takiego produktu w katalogu.' };
}

/* ---------------- PODSTRONY (menu) ---------------- */
function stronyLista() {
  const dane = arkusz('Strony').getDataRange().getValues();
  const lista = [];
  for (let i = 1; i < dane.length; i++) {
    const r = dane[i];
    if (r[0] === '' || r[0] === null) continue;
    lista.push({ slug: String(r[0]), tytul: String(r[1] || ''), menu: Number(r[2] || 0),
      kol: Number(r[3] || 0), tresc: String(r[4] || '') });
  }
  return { ok: true, strony: lista };
}

function stronaZapisz(d) {
  const s = d.strona || {};
  if (!s.slug) return { ok: false, blad: 'Brak identyfikatora podstrony.' };
  const sh = arkusz('Strony');
  const dane = sh.getDataRange().getValues();
  const wiersz = [s.slug, s.tytul || '', s.menu ? 1 : 0, Number(s.kol || 0), s.tresc || ''];
  for (let i = 1; i < dane.length; i++) {
    if (String(dane[i][0]) === s.slug) { sh.getRange(i + 1, 1, 1, 5).setValues([wiersz]); return { ok: true }; }
  }
  sh.appendRow(wiersz);
  return { ok: true };
}

function stronaUsun(d) {
  const sh = arkusz('Strony');
  const dane = sh.getDataRange().getValues();
  for (let i = 1; i < dane.length; i++) {
    if (String(dane[i][0]) === String(d.slug || '')) { sh.deleteRow(i + 1); return { ok: true }; }
  }
  return { ok: true };
}

/* ---------------- TREŚCI: strona główna / zamówienia ---------------- */
function odczytJsonUstawienia(klucz) {
  const v = ustawienie(klucz);
  if (!v) return null;
  try { return JSON.parse(v); } catch (e) { return null; }
}

function zapiszJsonUstawienia(klucz, d) {
  if (!d.dane || typeof d.dane !== 'object') return { ok: false, blad: 'Brak danych do zapisu.' };
  zapiszUstawienie(klucz, JSON.stringify(d.dane));
  return { ok: true };
}

/* ---------------- ADMIN ---------------- */
function adminLogin(d) {
  if (!maKlucz(d)) return bladKlucza();
  const login = String(d.login || '').trim().toLowerCase();
  const dane = arkusz('Admini').getDataRange().getValues();
  for (let i = 1; i < dane.length; i++) {
    if (String(dane[i][0] || '').toLowerCase() === login &&
        String(dane[i][2]) === '1' &&
        String(dane[i][1]) === sha256(String(d.haslo || ''))) {
      return { ok: true, admin: { email: String(dane[i][0]) } };
    }
  }
  return { ok: false, blad: 'Nieprawidłowy e-mail lub hasło.' };
}

function dostawaZapisz(d) {
  if (!d.cennik || !d.cennik.paczkomat || !d.cennik.kurier) {
    return { ok: false, blad: 'Niekompletny cennik.' };
  }
  zapiszUstawienie('dostawa', JSON.stringify(d.cennik));
  return { ok: true };
}

/* ---------------- lista wiadomości (panel) ---------------- */
function wiadomosciLista() {
  const dane = arkusz('Wiadomosci').getDataRange().getValues();
  const lista = [];
  for (let i = dane.length - 1; i >= 1; i--) {
    const r = dane[i];
    if (r[0] === '' || r[0] === null) continue;
    lista.push({ data: String(r[1] || r[0]), imie: String(r[2] || ''), email: String(r[3] || ''),
      telefon: String(r[4] || ''), temat: String(r[5] || 'Inne'), tresc: String(r[6] || ''),
      zgoda: Number(r[7]) === 1, status: String(r[8] || 'nowa') });
  }
  return { ok: true, wiadomosci: lista };
}


/**
 * ============================================================
 * Studio Sygnatura — AUTOMATY (Google Apps Script)
 * 1) harmonogram: codzienna kopia zapasowa na Dysk Google
 * 2) backup: JSON wszystkich zakładek do folderu SYGNATURA-Backup
 * Uruchom raz funkcję zalozHarmonogram() (po wdrożeniu).
 * ============================================================
 */

function zalozHarmonogram() {
  ScriptApp.getProjectTriggers().forEach(t => {
    try { ScriptApp.deleteTrigger(t); } catch (e) {}
  });
  ScriptApp.newTrigger('backupDzienny').timeBased().everyDays(1).atHour(3).create();
  Logger.log('Harmonogram ustawiony: backup codziennie o 03:00 (czas Google).');
}

function backupDzienny() {
  try {
    const folder = folderBackup();
    const dane = {};
    ZAKLADKI.forEach(n => {
      const sh = arkusz(n);
      dane[n] = sh.getDataRange().getValues();
    });
    const nazwa = 'SYGNATURA-backup-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd') + '.json';
    folder.createFile(nazwa, JSON.stringify(dane), MimeType.JSON);
    // retencja: 30 dni
    const pliki = folder.getFiles();
    while (pliki.hasNext()) {
      const p = pliki.next();
      if (Date.now() - p.getLastUpdated().getTime() > 30 * 24 * 3600 * 1000) p.setTrashed(true);
    }
    Logger.log('backup OK: ' + nazwa);
  } catch (err) {
    Logger.log('backup NIEUDANY: ' + err);
    try {
      MailApp.sendEmail(MAIL_STUDIO, 'SYGNATURA — backup nieudany',
        'Nocny backup nie wykonał się.\nBłąd: ' + err.message);
    } catch (e2) {}
  }
}

function folderBackup() {
  const it = DriveApp.getFoldersByName('SYGNATURA-Backup');
  if (it.hasNext()) return it.next();
  return DriveApp.createFolder('SYGNATURA-Backup');
}

