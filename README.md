# Studio Sygnatura — serwis w HTML + CSS + JS (zero Pythona)

Decyzja właściciela (sesja 26): cały serwis zostaje przebudowany na **HTML + CSS + JavaScript**.
Strony to czyste pliki statyczne, a „silnik" (zapisy, maile, sygnatury, panel) to **Google Apps Script —
czyli też JavaScript** — z danymi w arkuszu Google. Python/Flask (folder `serwis/`) zostaje wyłącznie
jako referencja do przepisywania logiki; docelowo zniknie (cała historia jest w gicie).

## Struktura

```
www/                   STRONA — pliki statyczne (wgranie na hosting = wdrożenie strony)
  index.html           strona główna (kwaterowy landing ze sliderem)
  zamowienia.html      hub: 3 ścieżki zamówień
  sklep.html           krok 1: katalog + koszyk (localStorage)
  dane.html            krok 2: dane, dostawa, sygnatura, zgody (walidacja pól)
  podsumowanie.html    krok 3: rachunek + „Zamawiam z obowiązkiem zapłaty"
  dziekuje.html        potwierdzenie z sygnaturą sprawy
  kontakt.html         formularz kontaktowy (obsługuje ?temat=&opis=)
  szukaj.html          wyszukiwarka katalogu
  admin.html           panel (zamówienia + statusy; w demo — dane przeglądarki)
  regulamin.html, jak-pracujemy.html, pracownia.html, wspolpraca.html, realizacje.html
  assets/              style.css, main.js, api.js, koszyk.js, config.js, media/
  data/katalog.js      katalog produktów (demo; po wdrożeniu żyje w arkuszu)

engine/                SILNIK — Google Apps Script (JavaScript + arkusz + maile)
  Konfig.gs, Kod.gs, Uruchom.gs, README.md (wdrożenie krok po kroku)

tools/serwuj.mjs       podgląd lokalny (Node, czysty JS)
serwis/                STARY silnik Flask — tylko referencja do przepisywania (do usunięcia)
v4/, docs/             poprzednie wersje landinga (docs = GitHub Pages — do podmiany na www/)
```

## Jak oglądać i testować (lokalnie)

```bash
node tools/serwuj.mjs        # → http://localhost:8001
```

Tryb **DEMO** (domyślny): formularze, koszyk i zamówienia działają w całości, a dane zapisują się
w localStorage przeglądarki. Testowy przepływ: sklep → dodaj produkty → dane → podsumowanie →
„Zamawiam z obowiązkiem zapłaty" → dziękujemy z sygnaturą. Podgląd demo: `admin.html`.

## Wdrożenie (2 kroki, oba robi właściciel)

1. **Strona** — wgraj zawartość `www/` na hosting (seohost SH2 / GitHub Pages / dowolny statyczny).
   Niczego nie konfigurujesz poza domeną (A/CNAME) i SSL (Let's Encrypt u hostingodawcy).
2. **Silnik** — instrukcja w `engine/README.md`: arkusz Google → wklej 3 pliki .gs → `instaluj()` →
   wdrożenie aplikacji internetowej → wklej URL do `www/assets/config.js` (`SYG.API`).

Po tym: formularze zapisują do arkusza, maile idą z Gmaila (Reply-To: kontakt@studiosygnatura.pl),
nocny backup arkusza leci na Dysk Google, a panel `admin.html?klucz=…` pokazuje prawdziwe zamówienia.

## Stan prac (co już działa, co w kolejce)

Działa (testy w trybie demo):
- landing ze sliderem (karty produktów z katalogu), wyszukiwarka, hub 3 ścieżek,
- ścieżka SKLEP w całości: katalog → koszyk → dane (walidacja + zgody z linkami do regulaminu) →
  rachunek z rabatem na personalizację → wysyłka → sygnatura → dziękujemy,
- formularz kontaktowy z tematami i auto-wypełnieniem (?temat=&opis=),
- panel demo (zamówienia + statusy),
- silnik Apps Script (katalog, wiadomości, zamówienia, statusy, maile, sygnatury, backup na Drive).

W kolejce (kolejne sesje):
- ścieżka A: wynajem (kalendarz → pakiety → personalizacja → dane → podsumowanie) + kaucja w rachunku,
- ścieżka B: personalizacja samodzielna + popup „własny projekt" (bez produktu → formularz z tematem),
- panel: edycja katalogu z poziomu admin.html, lista wiadomości, maile/szablony,
- konta klientów (gość bez rejestracji) i partnerzy z indywidualną sygnaturą (PART-XXX),
- arkusz raportów kwartalnych (mąż/żona),
- podmiana `docs/` (GitHub Pages) na nowy landing z `www/`.

## Zasady
- Bez Pythona, bez frameworków, bez kroków build — każdy plik edytuje się w Notatniku.
- Sekrety (klucz admina, ID arkusza) wyłącznie w `engine/Konfig.gs` i arkuszu — nigdy w `www/`.
- `DZIENNIK.md` = backup rozmowy (aktualizowany po każdej sesji i wypychany na GitHub).
- Zdjęcia: lokalnie w `www/assets/media/…` lub pełny link https:// (np. Dysk Google) — obie formy działają.
