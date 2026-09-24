/* ============================================================
   PLIK 3 z 3: Dane początkowe do bazy (SEED)
   ============================================================ */

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

