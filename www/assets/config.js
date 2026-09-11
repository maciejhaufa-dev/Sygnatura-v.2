/* ============================================================
   Studio Sygnatura — KONFIGURACJA (jedyny plik, który edytujesz
   po wdrożeniu). Wszystkie inne pliki zostają bez zmian.
   ============================================================ */
window.SYG = {
  // URL aplikacji Google Apps Script („Wdróż → Aplikacja internetowa → URL").
  // Gdy puste — serwis działa w TRYBIE DEMO: zapisuje tylko w tej przeglądarce.
  API: '',

  // dane firmy
  NAZWA: 'Studio Sygnatura',
  MAIL: 'kontakt@studiosygnatura.pl',
  TEL: '510 767 076',

  // kaucja zwrotna przy wynajmie (zł)
  KAUCJA: 300,

  // rabat: 5% przy min. 3 produktach personalizowanych
  PERS_RABAT_PROG: 3,
  PERS_RABAT_PROC: 5,

  // logowanie do panelu administracyjnego w trybie demo (admin.html).
  // Po wdrożeniu Google Apps Script logowanie sprawdza baza administratorów (arkusz),
  // a te dwa pola przestają działać — możesz je wtedy usunąć.
  ADMIN_DEMO_LOGIN: 'admin',
  ADMIN_DEMO_HASLO: 'sygnatura-demo-2026',

  // cennik dostawy (zł) — stawki startowe; zaktualizuj wg aktualnych cenników
  // InPost/kuriera. Rozmiary paczek: S (np. ramki, litery), M (np. szopka, szyld), L (duże zamówienia).
  DOSTAWA: {
    odbior: 0,
    paczkomat: { S: 15.99, M: 18.99, L: 21.99 },
    kurier:    { S: 18.99, M: 21.99, L: 24.99 }
  },

  // reguły dobierania rozmiaru paczki wg liczby produktów (testowe — do dopracowania
  // razem z gabarytami produktów): S = 1–3, M = 4–6, L = 7–10, powyżej 10 = tylko kurier.
  PACZKA_REGULY: { S: 3, M: 6, L: 10 },

  // pakiety na wynajem (z poprzedniej wersji serwisu) — ceny robocze do weryfikacji
  WYNAJEM_PAKIETY: [
    { id: 'kom-esencja', ev: 'komunijny', evNazwa: 'Komunia / chrzest', nazwa: 'Komunijny ESENCJA', opis: 'dla kameralnego przyjęcia', cena: 199, cenaTxt: 'od 199 zł / doba',
      pozycje: 'Tablica z imieniem — 1 szt. · Oznaczenia stołów — 6 szt. · Winietki imienne — 20 szt. · Świeczniki drewniane — 6 szt.' },
    { id: 'kom-mid', ev: 'komunijny', evNazwa: 'Komunia / chrzest', nazwa: 'Komunijny MID', opis: 'najczęściej wybierany', cena: 349, cenaTxt: 'od 349 zł / doba',
      pozycje: 'Wszystko z ESENCJI + szyld powitalny, plan stołów, numery stolików ×10, lampki 10 m + lampiony ×6, mozaika „scrabble"' },
    { id: 'kom-full', ev: 'komunijny', evNazwa: 'Komunia / chrzest', nazwa: 'Komunijny FULL', opis: 'pełna oprawa sali + montaż', cena: 599, cenaTxt: 'od 599 zł / doba',
      pozycje: 'Wszystko z MID + litery podświetlane DUŻE 60 cm, lampki 30 m + lampiony ×12, montaż i demontaż po stronie Studia' },
    { id: 'wes-esencja', ev: 'weselny', evNazwa: 'Wesele', nazwa: 'Weselny ESENCJA', opis: 'małe wesele', cena: 299, cenaTxt: 'od 299 zł / doba',
      pozycje: 'Szyld powitalny, plan stołów, numery stolików ×10, lampki ciepłe 10 m + lampiony ×6' },
    { id: 'wes-mid', ev: 'weselny', evNazwa: 'Wesele', nazwa: 'Weselny MID', opis: 'do 120 gości', cena: 499, cenaTxt: 'od 499 zł / doba',
      pozycje: 'Wszystko z ESENCJI + litery podświetlane MAŁE (inicjały), mozaika „scrabble", skrzynka na życzenia, świeczniki ×12' },
    { id: 'wes-full', ev: 'weselny', evNazwa: 'Wesele', nazwa: 'Weselny FULL', opis: 'pełna oprawa + montaż', cena: 799, cenaTxt: 'od 799 zł / doba',
      pozycje: 'Wszystko z MID + litery DUŻE 60 cm, lampki 30 m + lampiony ×12, winietki i plan dnia, montaż i demontaż po stronie Studia' },
    { id: 'fir-esencja', ev: 'firmowy', evNazwa: 'Event firmowy', nazwa: 'Firmowy ESENCJA', opis: 'spotkanie zespołu', cena: 249, cenaTxt: 'od 249 zł / doba',
      pozycje: 'Tablica powitalna, oznaczenia sal ×4, numeracja stanowisk ×12, znaki kierunkowe ×6' },
    { id: 'fir-mid', ev: 'firmowy', evNazwa: 'Event firmowy', nazwa: 'Firmowy MID', opis: 'konferencja / event do 120 osób', cena: 449, cenaTxt: 'od 449 zł / doba',
      pozycje: 'Wszystko z ESENCJI + litery podświetlane MAŁE 25 cm, lampki 20 m + lampiony ×8, świeczniki ×12' },
    { id: 'fir-full', ev: 'firmowy', evNazwa: 'Event firmowy', nazwa: 'Firmowy FULL', opis: 'gala / duży event + montaż', cena: 749, cenaTxt: 'od 749 zł / doba',
      pozycje: 'Wszystko z MID + litery DUŻE 60 cm, lampki 30 m + lampiony ×12, tablice informacyjne, montaż i demontaż po stronie Studia' },
    { id: 'jub-esencja', ev: 'jubileuszowy', evNazwa: 'Jubileusz / urodziny', nazwa: 'Jubileuszowy ESENCJA', opis: 'urodziny w gronie bliskich', cena: 199, cenaTxt: 'od 199 zł / doba',
      pozycje: 'Szyld powitalny, numery stolików ×6, świeczniki drewniane ×6' },
    { id: 'jub-mid', ev: 'jubileuszowy', evNazwa: 'Jubileusz / urodziny', nazwa: 'Jubileuszowy MID', opis: 'okrągła rocznica', cena: 349, cenaTxt: 'od 349 zł / doba',
      pozycje: 'Wszystko z ESENCJI + litery podświetlane MAŁE 25 cm, mozaika „scrabble", lampki 10 m + lampiony ×6' },
    { id: 'jub-full', ev: 'jubileuszowy', evNazwa: 'Jubileusz / urodziny', nazwa: 'Jubileuszowy FULL', opis: 'duża uroczystość + montaż', cena: 599, cenaTxt: 'od 599 zł / doba',
      pozycje: 'Wszystko z MID + litery DUŻE 60 cm, lampki 30 m + lampiony ×12, montaż i demontaż po stronie Studia' }
  ],

  // katalog produktów personalizowanych (jednorazówki — płatne z góry, zostają u klienta)
  PERSONALIZACJE: [
    { nazwa: 'Wkładka do tablicy powitalnej', opis: 'Imiona i data na wymiennej wkładce — grawer', cena: 39 },
    { nazwa: 'Wkładka do planu stołów', opis: 'Rozpiska stołów z imionami gości', cena: 49 },
    { nazwa: 'Winietki imienne', opis: 'Komplet 20 szt. z imionami gości', cena: 49 },
    { nazwa: 'Kafelki z imionami do mozaiki „scrabble"', opis: 'Imiona gości lub pary — komplet', cena: 35 },
    { nazwa: 'Litery przestrzenne z imionami', opis: 'Para liter z imionami lub nazwiskiem — na pamiątkę', cena: 149 },
    { nazwa: 'Numery stołów z imionami', opis: 'Numer stolika + imiona gości — komplet 10', cena: 35 },
    { nazwa: 'Grawer okolicznościowy', opis: 'Tabliczka z dedykacją — jubileusz, rocznica, pożegnanie', cena: 89 }
  ]
};

// tryb demo włącza się sam, gdy nie ma wpiętego API
SYG.TRYB_DEMO = !SYG.API;
