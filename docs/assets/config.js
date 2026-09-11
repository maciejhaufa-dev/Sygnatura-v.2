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
  PERS_RABAT_PROC: 5
};

// tryb demo włącza się sam, gdy nie ma wpiętego API
SYG.TRYB_DEMO = !SYG.API;
