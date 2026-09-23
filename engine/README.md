# SILNIK — Google Apps Script (arkusz Google = baza)

Silnik serwisu Studio Sygnatura. Strony w `www/` wołają go przez `fetch`
(`SYG.wezwij(...)` z `www/assets/api.js`); on zapisuje dane w **arkuszu Google**
i wysyła maile (Gmail). Całość: HTML + CSS + JS — zero Pythona, zero serwera.

## Pliki (wszystkie 4 wklejasz do Apps Script jako osobne pliki)
- `Konfig.gs` — ustawienia (ID arkusza, klucz admina, maile, hasło startowe admina) + `instaluj()`
- `Kod.gs` — API komplet (30 akcji: sklep, zamówienia, konta, wynajem, blog, podstrony, panel)
- `SEED.gs` — SEEDY wygenerowane z klienta (17 wpisów bloga, podstrona, 4 produkty) —
  NIE edytować ręcznie; po zmianie seedy klienta: `node tools/gen_seed_gs.js`
- `Uruchom.gs` — codzienny backup arkusza na Dysk (folder `SYGNATURA-Backup`, retencja 30 dni)

## Wdrożenie (robi WŁAŚCICIEL — bot nie ma dostępu do Google, ~15 min, da się z telefonu)
1. **ARKUSZ**: na koncie Google Studia otwórz https://sheets.new → nazwij **„SYGNATURA-BAZA”**.
   Skopiuj ID z adresu: `docs.google.com/spreadsheets/d/<ID>/edit`.
2. **SKRYPT**: https://script.google.com → **Nowy projekt**. Usuń zawartość `Code.gs`;
   dla każdego pliku: `+` → Skrypt → wklej (Konfig.gs, Kod.gs, SEED.gs, Uruchom.gs). Zapisz.
3. W `Konfig.gs` wstaw: `ARKUSZ_ID` (krok 1) i `TOKEN` — długi ciąg liter + cyfr
   (to „klucz” do panelu, np. 24 znaki; nie podawaj go nikomu).
4. Z listy funkcji wybierz **`instaluj`** → Uruchom → zezwól na uprawnienia
   (komunikat „Google hasn't verified this app” = normalny: Zaawansowane → Przejdź do projektu → zezwól).
5. **Wdróż → Nowe wdrożenie → Aplikacja internetowa**:
   - Wykonuj jako: **ja**
   - Kto ma dostęp: **Każdy** (akcje admina i tak wymagają klucza)
   - Skopiuj **URL aplikacji internetowej** (kończy się `/exec`).
6. URL prześlij na czat — wkleję go do `www/assets/config.js` → `API: …` i wypchnę.
   (Albo wkleisz sam.) Banner „TRYB DEMO” zniknie automatycznie.
7. Z listy funkcji uruchom **`zalozHarmonogram`** (backup nocny 03:00).

## Testy (checklista po wpięciu)
1. **Kontakt**: wyślij formularz → wiersz w zakładce `Wiadomosci` + mail na skrzynkę.
2. **Konto**: rejestracja (ikona konta, prawy górny róg) → logowanie → zapisz adres →
   mail powitalny; w nagłówku „Witaj, {imię}”.
3. **Zamówienie**: sklep → koszyk → dane (autopodpisywanie z konta) → podsumowanie
   (sprawdź kod `POWITANIE5`) → „Zamawiam” → w zakładce `Zamowienia` sygnatura `SYG-2026-001`
   + 2 maile (do Studia i do klienta).
4. **Historia**: panel konta → Historia zamówień → „Paragon” (pełny rachunek).
5. **Wynajem**: kalendarz (dni na żywo) → zapytanie o termin → zakładka `Wynajem`.
   **Po wpłacie** zmień status w arkuszu na `zarezerwowany` — dzień i pakiet
   zablokują się w kalendarzu (zapytania samych zapytań NIE blokują).
6. **Panel**: otwórz `admin.html?klucz=TWOJ_TOKEN` → logowanie
   `kontakt@studiosygnatura.pl` / `sygnatura-2026` → **ZMIEŃ HASŁO** (zakładka `Admini`
   w arkuszu: haslo_sha = wynik `sha256('twoje nowe hasło')` — funkcja `sha256` jest
   w Konfig.gs; wybierz ją z listy funkcji → Uruchom).

## Zasady stałe
- Panel admina zawsze z `?klucz=` (TOKEN z Konfig.gs) — linku nie publikujemy.
- Mail: limit Gmaila ~100/dzień (MailApp) — przy tej skali wystarczająco.
- Backup: codziennie 03:00 → Dysk (`SYGNATURA-Backup`), retencja 30 dni; alarm mailem przy błędzie.
- Cennik dostawy, strona główna, podstrony, produkty, blog — edycja w panelu `admin.html`
   (zapisy lądują w arkuszu od razu; nic się nie czyści, nie ma „resetu danych”).
- Hasła kont: SHA-256 w arkuszu (zakładka `Konta`, kolumna `haslo_sha`) — samo hasło nigdzie nie leży.
