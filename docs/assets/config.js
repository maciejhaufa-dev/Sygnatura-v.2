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
  }
};

// tryb demo włącza się sam, gdy nie ma wpiętego API
SYG.TRYB_DEMO = !SYG.API;
