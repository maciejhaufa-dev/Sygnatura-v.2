# SILNIK — Google Apps Script (arkusz Google = baza)

Silnik serwisu Studio Sygnatura. Strony w `www/` wołają go przez `fetch`
(`SYG.wezwij(...)` z `www/assets/api.js`); on zapisuje dane w **arkuszu Google**
i wysyła maile (Gmail). Całość: HTML + CSS + JS — zero Pythona, zero serwera.

## Pliki silnika
- Do wdrożenia używaj jednego spójnego zestawu: `PLIK1.gs` (konfiguracja, API i zamówienia), `PLIK2.gs` (konta, wynajem, blog, panel i backup), `PLIK3.gs` (seedy).
- `CALOSC.gs` to wariant scalony; `Kod.gs`, `Konfig.gs`, `SEED.gs` i `Uruchom.gs` są starszymi/alternatywnymi plikami. **Nie łącz ich** z zestawem PLIK1–3, bo powielają stałe i funkcje.

## Aktualizacja istniejącego Apps Script (potrzebna po zmianach silnika)

Nie twórz nowego arkusza ani nowego wdrożenia — strona jest już podłączona do bazy. Aktualizujemy istniejący projekt wskazany przez URL `API` w `www/assets/config.js`.

1. Otwórz **istniejący** projekt Apps Script połączony z tym wdrożeniem. Zrób kopię zapasową projektu.
2. W edytorze wyszukaj `ARKUSZ_ID` i zachowaj jego obecną wartość prywatnie — nie twórz nowego arkusza.
3. Zastąp kod serwera aktualnym zestawem z repozytorium: `engine/PLIK1.gs`, `engine/PLIK2.gs`, `engine/PLIK3.gs` (np. jako `Code.gs`, `Admin.gs`, `Seed.gs`). To jeden podzielony na części komplet.
4. W `PLIK1.gs` podmień wyłącznie `WSTAW_TU_ID_ARKUSZA` na zachowany `ARKUSZ_ID`. Klucz w tym pliku jest zgodny z klientem witryny. Nie udostępniaj ID, klucza, haseł ani tokenów na czacie.
5. Usuń albo opróżnij stare pliki `.gs`, które powielają funkcje lub stałe (`Kod.gs`, `Konfig.gs`, `SEED.gs`, `Uruchom.gs`). Zachowaj manifest i właściwości projektu; w skrypcie powinien zostać tylko komplet PLIK1+PLIK2+PLIK3.
6. Kliknij **Zapisz**. Nie uruchamiaj `instaluj()` na istniejącej bazie; samo wdrożenie kodu nie kasuje arkusza ani jego danych.
7. **Wdróż → Zarządzaj wdrożeniami → ołówek przy obecnej aplikacji internetowej → Nowa wersja → Wdróż**. Zostaw dotychczasowe uprawnienia i zachowaj ten sam URL `/exec`.
8. Po wdrożeniu wyloguj się z panelu i zaloguj ponownie, a następnie ponów dodanie produktu. Jeśli dodajesz zdjęcie, zostanie ono najpierw zapisane w `main/uploads/`.

**Dlaczego pojawia się „zły klucz”:** strona i backend muszą używać zgodnego klucza administratora; w repo są też stare, alternatywne warianty silnika, w tym `Kod.gs` + `Konfig.gs`. Nie łącz tych plików z aktualnym zestawem PLIK1–3. Nie wysyłaj mi auth, hasła ani tokenów — nie mam dostępu do Twojego Google i ich nie potrzebuję.

Jeśli pojawi się błąd uploadu zdjęcia o braku `GITHUB_TOKEN`, ustaw go w Apps Script: **Ustawienia projektu → Właściwości skryptu** (wartość tokena GitHub z uprawnieniem Contents: Read and write). Nigdy nie wklejaj tokena na czat.

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
   w PLIK1.gs; wybierz ją z listy funkcji → Uruchom).

## Własne zdjęcia tła — wspólna biblioteka GitHub
W trybie produkcyjnym przycisk „Dodaj do biblioteki” kompresuje zdjęcie do JPG (maks. 1600 px), wysyła je do Apps Script, a Apps Script zapisuje je do `origin/main/uploads/`. Strona używa publicznego adresu pliku z `raw.githubusercontent.com`; ścieżka obrazu jest następnie zapisywana we wspólnych ustawieniach strony głównej w arkuszu. Klucz GitHuba **nie trafia do strony ani do przeglądarki**.

Jednorazowa konfiguracja przez właściciela:
1. GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. Ogranicz dostęp do repozytorium `Sygnatura-v.2` i nadaj **Contents: Read and write**. Nie wklejaj tokenu do czatu ani do pliku `.gs`.
3. Apps Script → otwórz istniejący projekt API → **Project Settings → Script Properties** → dodaj `GITHUB_TOKEN` z wartością tokenu.
4. Wdróż aktualny komplet `PLIK1.gs` + `PLIK2.gs` + `PLIK3.gs`. Zapisz i uruchom `sprawdzKonfiguracjeGitHub`, zatwierdzając wymagane uprawnienie do połączeń zewnętrznych.
5. **Deploy → Manage deployments → Edit → New version → Deploy**. Adres `/exec` pozostaje ten sam. Po wdrożeniu zaloguj się do panelu ponownie — backend wystawia krótką sesję administratora.
6. Po aktualizacji strony właściciel wybiera plik, klika „Dodaj do biblioteki”, a potem **„Zapisz zmiany strony głównej”**. Plik trafia do `main/uploads/`, a slajd zapisuje w bazie pełny publiczny adres obrazu.

Po zmianach akcji w silniku (w tym uploadu lub publicznego odczytu cennika) trzeba wdrożyć nową wersję Apps Script. Sam deploy GitHub Pages nie aktualizuje silnika Google.

## Logowanie administratora
- Sesje są podpisywane po stronie Apps Script i ważne 30 dni; nie opierają się już wyłącznie na krótkotrwałym `CacheService`.
- W panelu **Ustawienia → Dane logowania administratora** można zmienić e-mail/login i/lub hasło, potwierdzając obecne hasło.
- Na ekranie logowania „Nie pamiętam hasła” wysyła 6-cyfrowy kod na e-mail aktywnego administratora; kod wygasa po 10 minutach i ma limit prób.
- `media-upload` i pozostałe akcje są wpisami `case` w `doPost` — nie uruchamia się ich ręcznie z listy funkcji Apps Script. Testuj je z panelu strony po wdrożeniu nowej wersji aplikacji.
- Po zmianie plików `PLIK1.gs` lub `PLIK2.gs` w istniejącym projekcie zapisz i wybierz **Zarządzaj wdrożeniami → Edytuj → Nowa wersja → Wdróż**. Nie uruchamiaj `instaluj()`.

Token ma ograniczone uprawnienia do tego repozytorium i powinien mieć termin ważności. Przy wygaśnięciu wygeneruj nowy i podmień wyłącznie wartość Script Property.

## Zasady stałe
- Panel admina zawsze z `?klucz=` (TOKEN z PLIK1.gs) — linku nie publikujemy.
- Mail: limit Gmaila ~100/dzień (MailApp) — przy tej skali wystarczająco.
- Backup: codziennie 03:00 → Dysk (`SYGNATURA-Backup`), retencja 30 dni; alarm mailem przy błędzie.
- Cennik dostawy, strona główna, podstrony, produkty, blog — edycja w panelu `admin.html`
   (zapisy lądują w arkuszu od razu; nic się nie czyści, nie ma „resetu danych”).
- Hasła kont: SHA-256 w arkuszu (zakładka `Konta`, kolumna `haslo_sha`) — samo hasło nigdzie nie leży.
