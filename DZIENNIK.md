# DZIENNIK PRAC — Studio Sygnatura (maciejhaufa-dev/Sygnatura-v.2)

> **Po co ten plik:** pełne podsumowanie wszystkiego, co powstało w projekcie, żeby po utracie sesji
> (reset sandboxa, nowy komputer, nowa osoba) dało się w 15 minut odtworzyć stan prac.
> Szczegóły techniczne: `v4/DZIENNIK-V4.md` (strona), `serwis/README.md` + `serwis/WDROZENIE.md` (serwis).
> Historia rozmów: `PODSUMOWANIE-rozmowy-v1-v3.md`.

---

## 1. NAJWAŻNIEJSZE — stan na 07.09.2026

| Co | Gdzie | Status |
|---|---|---|
| **Serwis z bazą (Flask + SQLite)** — wynajem, personalizacja, panel admina, maile, Sheets | `serwis/` | działa lokalnie (127.0.0.1:8000), gotowy do wdrożenia |
| **Ścieżka zamówienia UX** — kroki 1–4, wybór personalizacji nie ginie, jeden CTA przy kalendarzu | `serwis/templates/_kroki.html`, `_pers_bar.html` | **DZIAŁA** (sesja 15, commit 65b23b8) |
| **Formularz kontaktowy** — naprawiony 500 przy autoresponderze (core.py toleruje braki pól) | `serwis/app.py`, `core.py` | **DZIAŁA** (sesja 15) |
| **Plan minimum = wizytówka/portfolio** — landing, realizacje, kontakt | `serwis/` (trasy `/`, `/realizacje/`, `/kontakt/`) | **DZIAŁA** (sesja 14); sklep/rejestr dołożymy później |
| **Strona statyczna v4** (hero, splash, podstrony) — kopia jako GitHub Pages | `v4/` → `docs/` | gotowa (Pages włącza użytkownik — bot ma 403) |
| **Szopka 3D** — projekt warstwowy, cięcia, LED | `pracownia/szopka/`, `uploads/Szopka 3D.svg` | konwersja warstw SVG→PNG zrobiona; wizualizacje v2/v3 przestarzałe |
| **Logo** — zatwierdzone (sygNATURA + sygnet, #6B4530/#1F3A32/#C4A582/#FBF7F0) | `pracownia/logo/WEKTORY3/` | gotowe |

### Jak uruchomić serwis po resecie (procedura awaryjna)

```bash
cd /home/user/Sygnatura-v.2
# 1. przywróć historię gita (sandbox resetuje HEAD do pierwszego commita):
git fetch origin arena/01a056f0-sygnatura-v-2 && git reset --mixed FETCH_HEAD
# 2. doinstaluj brakujące pakiety (reset kasuje pip):
pip install --break-system-packages flask pillow
# 3. uruchom serwis (baza tworzy się sama; usunięcie data/serwis.db = reset do seeda):
cd serwis && python3 app.py     # -> http://127.0.0.1:8000  (admin: /admin/, hasło startowe sygnatura-2026)
```

Gałąź pracy: **`arena/01a056f0-sygnatura-v-2`** (tylko na niej commitujemy). Remote: `maciejhaufa-dev/Sygnatura-v.2`.

---

## 2. CHRONOLOGIA (skrót)

### Sesje 1–10 (sierpień 2026) — strona v4 + szopka
- Strona v4: hero na `uploads/TŁO NA HERO.png` (100% auto — NIE ucięte), splash 3,8 s, panel kremowy po prawej,
  4 zielone przyciski, Cormorant Garamond, animacje ZAWSZE (bez prefers-reduced-motion), ostre rogi.
- Retusz hero (blur 1.1 + kompresja świateł) — `v4/build.py` (Pillow), kandydaci w pickerze `hero-picker.html`.
- Logo: sygNATURA + sygnet okrągły; litery jako osobne PNG (nie sprite+calc).
- Szopka: projekt warstwowy 20×20 cm (6 warstw L0–L5), `uploads/Szopka 3D.svg` (użytkownik, Inkscape);
  LED: drucik fairy lights 20 LED/2 m, 2700 K, 3×AA, diody „na plecach" warstw, luz 3–4 cm;
  rama: sklejka 3 mm z wpustami + listwa 20×20 mm (rowek 3,2 mm), góra otwarta, spód przykręcany.
- Wizualizacje v2/v3 w `pracownia/szopka/WIZUALIZACJE/` — **PRZESTARZAŁE** (błędne opisy warstw).

### Sesje 11–13 (koniec sierpnia–1.09.2026) — serwis (Flask+SQLite zamiast WordPressa)
- `serwis/`: `app.py` (trasy), `db.py` (SQLite, 7 tabel), `core.py` (sygnatury SYG-rok-numer, maile SMTP/lokalny,
  autorespondery, push do Google Sheets), `templates/` (HTML edytowalny przez żonę), `static/`.
- Wynajem 3 poziomy: `/wynajem/` (wybór wydarzenia, bez kalendarzy) → `/wynajem/<ev>/` (ESENCJA/MID/FULL)
  → `/wynajem/pakiet/<id>/` (kalendarz). Najem od–do (domyślnie dzień przed + dzień po; 1 doba = wyjątek z uzasadnieniem).
  Kompozytor `/wynajem/komponuje/` (−5% od 10 pozycji). Statusy: zapytanie/platnosc_w_toku/zarezerwowany/odrzucono.
- Personalizacja `/personalizacja/` — jednorazówki bezzwrotne, płatne z góry, rabat −5% od 3;
  pakiety i katalog najmu oczyszczone z jednorazówek; opis per produkt w formularzu;
  podsumowanie kwot (najem×doby + kaucja 300 zł + personalizacja) w formularzu i mailach;
  doby liczone od protokołu zdawczo-odbiorczego (płatność za każdą rozpoczętą dobę).
- Admin: kategorie, produkty, pakiety (checkbox dostępny/niedostępny), personalizacje, rezerwacje, maile, ustawienia.

### Sesja 14 (07.09.2026) — warstwy szopki PNG + plan minimum
- **Konwersja warstw szopki SVG→PNG 1:1** (czysto techniczna, bez interpretacji): `v4/tools/warstwy_png.py`
  → `pracownia/szopka/WARSTWY-PNG/` (6 plików 2400×2400 px = 200×200 mm, czarne linie na białym, bez wypełnień,
  bez prowadnic). Nazwy wg ZAWARTOŚCI (numeracja użytkownika ≠ etykiety L0–L5 w pliku!):
  - `L0-niebo-rama` · `L1-pasterze-i-2-owce` · `L2-swieta-rodzina-2-owce-2-anioly`
  - `L3-owca-koza-2-ploty-zarys-szopki` · `L4-krowa-osiol-zarys-szopki-chmury` · `L5-rozgwiezdzone-niebo`
- **Plan minimum (wizytówka/portfolio):** landing (v4 index) + `/realizacje/` + `/kontakt/` w serwisie,
  z panelem admina (CRUD realizacji ze zdjęciami, skrzynka wiadomości). Szczegóły niżej.

---

## 3. PLAN MINIMUM — wizytówka/portfolio (sesja 14 — ZROBIONE)

**Cel:** działający serwis-baza, który można modyfikować i rozszerzać. Znajomi pytają o stronę →
teraz: **landing + nasze realizacje + kontakt**. Sklep i rejestr najmu dochodzą później (kod wynajmu już jest).

> **Stan: wdrożone i przetestowane (commit w sesji 14).** Linki na stronie: „Realizacje" → `/realizacje/`,
> „Kontakt" → `/kontakt/` (podmiany w `wczytaj_v4`). Zdjęcia realizacji wgrywa się w panelu (Realizacje →
> nowa realizacja → wybór pliku); startowo 3 wpisy przykładowe ze zdjęciami z uploads (opisy robocze).

### Zawartość
- `/` — landing (istniejąca strona v4: hero, pasja/styl/tradycja, 4 przyciski)
- `/realizacje/` — portfolio: karty prac z bazy (zdjęcie, tytuł, kategoria, opis), strona szczegółów `/realizacje/<id>/`
- `/kontakt/` — dane kontaktowe + formularz (imię, e-mail, telefon opcjonalny, wiadomość, **checkbox zgody PKE art. 398**)
  → zapis do bazy `wiadomosci` + mail przez `core.wyslij_mail`; honeypot antyspamowy
- `/admin/realizacje` — CRUD + upload zdjęć (data/uploads), `/admin/wiadomosci` — skrzynka ze statusami

### Tabele bazy (nowe)
```sql
realizacje(id, tytul, kategoria, opis, zdjecie, kolejnosc, widoczna, utworzono)
wiadomosci(id, imie, email, telefon, tresc, zgoda, data, status)  -- status: nowa/przeczytana
```

### Zasady
- HTML/CSS w `serwis/templates/` — edytowalne przez użytkownika/żonę; Python tylko w logice.
- Nawigacja statycznych stron v4 w serwisie prowadzi na trasy dynamiczne (podmiana w `wczytaj_v4`).
- GitHub Pages zostaje jako statyczna kopia (docs/) — formularz kontaktowy na Pages = link mailto
  (Pages nie odpala Flaska/bazy; właściwy kontakt działa na serwisie).

---

## 4. DŁUG WOBEC UŻYTKOWNIKA (nie zapomnieć!)

1. **Test usera** serwisu na telefonie (podgląd e2b / localhost) — statusy, maile, formularze.
2. **Wdrożenie** wg `serwis/WDROZENIE.md`: PythonAnywhere FREE (testy) → OVH VPS (produkcja);
   SMTP + Google Sheets (webhook Apps Script) do skonfigurowania.
3. **GitHub Pages** — włącza użytkownik (bot: 403 na ustawieniach Pages).
4. **Szopka** — zamrożona wizualizacja; wrócić tylko na wyraźne życzenie (plik SVG może się zmienić).
5. Ceny personalizacji — robocze, do weryfikacji w adminie.
6. Regulamin serwisu, FAQ, polityka prywatności (linki „wkrótce" w stopce v4).
7. Sklep (rejestr) — dołożyć później na bazie istniejących tabel (kategorie/produkty).

---

## 5. ŚCIEŻKI-PUNKTY ORIENTACYJNE

| Ścieżka | Co to |
|---|---|
| `serwis/app.py` | trasy (strony, wynajem, personalizacja, admin) |
| `serwis/db.py` | schemat SQLite, seed, migracje |
| `serwis/core.py` | sygnatury, maile, Sheets, autorespondery |
| `serwis/templates/` | HTML (Jinja2) — edycja wyglądu bez Pythona |
| `serwis/data/` | baza + uploads (w .gitignore) |
| `v4/build.py` | budowa statycznej v4 (hero, litery logo) + sync `docs/` |
| `v4/tools/svgfill.py` | własny renderer SVG (fill) — szopka |
| `v4/tools/warstwy_png.py` | konwersja warstw SVG→PNG 1:1 (używa svgfill) |
| `v4/tools/grawery.py` | (anulowane) cięcia postaci — usunięto; nie wracać |
| `uploads/` | pliki użytkownika (TŁO NA HERO.png, Szopka 3D.svg, IMG_*) |
| `pracownia/szopka/WARSTWY-PNG/` | 6 warstw PNG 1:1 (czarne linie na białym) |
| `docs/` | kopia statyczna dla GitHub Pages |

## 6. BŁĘDY, KTÓRYCH NIE POWTARZAĆ

- Sandbox resetuje: pip, procesy, historię gita (HEAD → pierwszy commit), bazę data/ (ale NIE pliki robocze).
  Po resecie: procedura z sekcji 1. Praca = natychmiast commit+push.
- `curl -X POST -L` po 303 potrafi dać 405 — testować 303 bez -L.
- Po podmianie bloku tras w app.py sprawdzać grep-em, czy nie nadpisano sąsiedniej trasy (BuildError).
- INSERT-y: liczyć kolumny po dodaniu pola (SQLite: „N values for M columns").
- Regex podmieniający `return` łapie early-return — weryfikować grep-em.
- SVG szopki: etykiety warstw L0–L5 w pliku ≠ numeracja użytkownika — nazywać pliki po ZAWARTOŚCI.
- Nie generować SVG sylwetek kodem; nie interpretować zawartości warstw — czysta konwersja 1:1.
