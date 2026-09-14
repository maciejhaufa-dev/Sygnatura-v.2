/* ============================================================
   Studio Sygnatura — KATALOG PRODUKTÓW (dane demo)
   W trybie demo sklep czyta z tego pliku. Po wdrożeniu Google
   Apps Script katalog żyje w arkuszu „Katalog" (edytuje się go
   w panelu /admin/), a ten plik służy tylko jako zalążek.
   Pola: id, nazwa, opis, cena, obraz (nazwa pliku z assets/media/sklep/
   LUB pełny link https:// np. z Dysku Google), dostepny.
   ============================================================ */
window.SYG_KATALOG = [
  {
    id: 1,
    nazwa: 'Szopka bożonarodzeniowa (warstwowa)',
    opis: 'Flagowy produkt pracowni: ręcznie cięta szopka warstwowa 20×20 cm z podświetleniem LED 2700 K. Zamów z wyprzedzeniem — personalizacja wymaga min. 2 tygodni.',
    cena: 249,
    obraz: 'szopka.jpg',
    dostepny: 1,
    gabaryt: '20×20×8 cm',
    storyId: 1
  },
  {
    id: 2,
    nazwa: 'Szyld powitalny „Witajcie"',
    opis: 'Drewniany szyld powitalny z grawerem — do domu, na wesele lub do lokalu.',
    cena: 189,
    obraz: 'szyld.jpg',
    dostepny: 1,
    gabaryt: '50×25×2 cm',
    storyId: 2
  },
  {
    id: 3,
    nazwa: 'Litery podświetlane LOVE',
    opis: 'Drewniane litery przestrzenne z ciepłym podświetleniem.',
    cena: 249,
    obraz: 'love.jpg',
    dostepny: 1
  },
  {
    id: 4,
    nazwa: 'Ramka z sentencją',
    opis: 'Ramka ze sklejki z wybraną sentencją lub imionami i datą.',
    cena: 89,
    obraz: 'ramka.jpg',
    dostepny: 1,
    gabaryt: '20×25×2 cm',
    storyId: 3
  }
];
