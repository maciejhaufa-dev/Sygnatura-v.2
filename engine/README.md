# SILNIK — Google Apps Script (czysty JavaScript, zero Pythona)

Silnik serwisu Studio Sygnatura. Strony w `www/` wołają go przez `fetch`
(funkcje `SYG.wezwij(...)` z `www/assets/api.js`), a on zapisuje dane w **arkuszu Google**
i wysyła maile (Gmail). Cały system to HTML + CSS + JS — dokładnie tak, jak chciał właściciel.

## Co tu jest
- `Konfig.gs` — ustawienia (ID arkusza, klucz admina, maile) + `instaluj()` (zakłada zakładki i katalog)
- `Kod.gs` — API: `katalog`, `wiadomosc`, `zamowienie` (publiczne) oraz `zamowienia-lista`, `zamowienie-status` (klucz admina)
- `Uruchom.gs` — codzienny backup arkusza na Dysk Google (folder `SYGNATURA-Backup`, retencja 30 dni) + alarm mailowy

## Wdrożenie krok po kroku (robi to WŁAŚCICIEL — bot nie ma dostępu do Google)
1. Otwórz https://sheets.new na koncie Google Studia → utwórz arkusz **„SYGNATURA-BAZA"**.
   Skopiuj jego ID z adresu: `docs.google.com/spreadsheets/d/<ID>/edit`.
2. Otwórz https://script.google.com → **Nowy projekt** → usuń zawartość `Code.gs` i wklej kolejno
   pliki: `Konfig.gs`, `Kod.gs`, `Uruchom.gs` (każdy jako osobny plik: `+` → Skrypt).
3. W `Konfig.gs` wstaw: `ARKUSZ_ID` (z kroku 1) i własny `TOKEN` (długi ciąg liter i cyfr —
   to „hasło" do panelu `/admin/`).
4. Zapisz projekt (Ctrl+S). Z listy funkcji wybierz **`instaluj`** → **Uruchom** → zezwól na uprawnienia
   (komunikat „Google hasn't verified this app" jest normalny: Zaawansowane → Przejdź do projektu).
5. **Wdróż → Nowe wdrożenie → typ: Aplikacja internetowa**:
   - Wykonuj jako: **ja**
   - Dostęp: **Każdy** (endpointy admina i tak wymagają klucza)
   - Skopiuj **URL aplikacji internetowej** (kończy się `/exec`).
6. Wklej ten URL do `www/assets/config.js` → `API: 'https://script.google.com/macros/s/…/exec'`.
   Banner „TRYB DEMO" zniknie sam.
7. Z listy funkcji uruchom **`zalozHarmonogram`** (nocny backup).
8. Test: wyślij wiadomość z formularza na stronie → sprawdź zakładkę `Wiadomosci` w arkuszu i skrzynkę Studia.

## Jak to działa od strony technicznej
- Przeglądarka wysyła POST z `Content-Type: text/plain` (bez preflight CORS) na `URL?akcja=…`,
  treścią jest JSON. Apps Script odpowiada JSON-em.
- Publiczne akcje nie mają klucza — mogą je wywołać tylko formularze strony (walidacja jest po obu stronach).
- Kolejne sygnatury (SYG-2026-001…) są przydzielane z blokadą (`LockService`), więc się nie zdublują.
- Limity darmowego Google: ~100 maili dziennie (MailApp) — w zupełności wystarczy przy tej skali.

## Kolejne wersje silnika (plan)
- `wiadomosci-lista` (lista wiadomości w panelu, klucz),
- edycja katalogu z panelu (aktualnie: bezpośrednio w arkuszu),
- konta klientów i partnerów (osobne zakładki),
- raporty kwartalne mąż/żona (arkusz raportowy).
