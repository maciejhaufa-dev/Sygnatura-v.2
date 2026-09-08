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
| **Kreator ZAMÓWIENIA (wynajem)** — hub 3 kafle + 5 kroków z progres barem: Termin → Pakiet → Personalizacja (pomiń) → Dane/zgody/dostawa/kod → Podsumowanie → „Zamawiam z obowiązkiem zapłaty" | `serwis/templates/z_*.html`, `_progress.html`, trasy `/zamowienia/*` | **DZIAŁA** (sesja 16) |
| **3 sekcje zamówień A/B/C** — wspólne bloki 3/4/5/6: A wynajem 1→2→3→4→5→6 · B personalizacja 3→4→5→6 · C sklep 7→3→4→5→6 | trasy `/zamowienia/personalizacja/`, `/zamowienia/sklep/`, wspólne `/zamowienia/dane/`, `/podsumowanie/`, `/zamow/`, `/dziekuje/`; `z_dane.html`, `z_podsumowanie.html`, `_kwoty_box.html` | **DZIAŁA** (sesja 17) |
| **Sklep** — tabela `sklep_produkty` (4 produkty startowe, ceny robocze), CRUD w panelu (Sklep), katalog z ilościami w kreatorze C | `admin_sklep.html`, trasy `/admin/sklep*` | **DZIAŁA** |
| **Menu główne** — Start / Realizacje / Zamówienia / Kontakt | `_nav.html`, `v4/`, `docs/` | **DZIAŁA** |
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

---

## Sesja 18 — rachunek w podsumowaniu, sklep z koszykiem, nowe menu (strona główna / zamówienia / pracownia / nasze realizacje / współpraca / kontakt)

Uwagi użytkownika z rozmowy:
1. Podsumowanie ma odzwierciedlać RACHUNEK: lp. | pozycja (co) | ile szt. | cena jedn. (personalizacja w drugiej linii) + pod listą suma kosztów i policzona kaucja (wynajem). Kaucja jako osobna, transparentna pozycja rachunku.
2. Sklep: zdjęcia + ceny produktów, licznik „− cyfra +" zamiast pola, „dodaj do zamówienia" pod każdym produktem → wirtualny koszyk widoczny w podsumowaniu. Personalizacja po sklepie ma być widoczna.
3. Finalny układ menu: strona główna / zamówienia / pracownia / nasze realizacje / współpraca / kontakt.
4. Pracownia = „o nas"; Współpraca = podstrona dla dekoratorów, hoteli, kwiaciarni, firm eventowych i imprez firmowych — stały partner dostaje indywidualną sygnaturę (priorytet, rabaty).
5. Kontakt: zwykły formularz z tematem do wyboru + dane + wysyłka zapytania.

Wykonane:
- `_kwoty_box.html` przepisany na RACHUNEK (kolumny Lp./Pozycja/Ilość/Cena jedn./Wartość, mobilnie zwijane). Wiersze: najem (stawka × doby) + KAUCJA jako osobna pozycja (wynajem), produkty sklepu (ile × cena), personalizacje (opis w drugiej linii), rabat pers −5%, rabat z kodu; pod spodem PODSUMOWANIE (bez kaucji) / RAZEM + „razem przy odbiorze". Defensywny (kwoty.get) — działa też dla starych rekordów.
- `z_podsumowanie.html`: rachunek PRZENIESIONY NA GÓRĘ (nad sekcje szczegółów); `zamowienie_dziekuje.html` też pokazuje rachunek (pseudo-szkic budowany w `zamowienia_dziekuje`; fix: `sqlite3.Row` → `dict(rez)`).
- Sklep (`z_sklep_1.html`): karty produktów ze ZDJĘCIEM (static/media/sklep/), ceną, licznikiem −/+, „Dodaj do zamówienia" i STICKY KOSZYKIEM („Koszyk: N szt. · X zł" + „Dalej: personalizacja →"); JS blokuje pusty koszyk. Wyraźny callout, że po katalogu jest krok personalizacji. Server-side bez zmian (ile_<id>).
- `sklep_produkty.obraz` (kolumna + migracja + seed + CRUD w `/admin/sklep` z podglądem miniaturki); zdjęcia: szopka = PRAWDZIWA wizualizacja usera (WIZ3_foto_noc), szyld/litery/ramka = makiety AI do podmiany na realne fotki.
- Menu `_nav.html` + landing v4 (index.html + źródło w build.py) + kopia Pages (docs/index.html): strona główna / zamówienia / pracownia / nasze realizacje / współpraca / kontakt. CTA hero na stronie głównej → żywe trasy (/jak-pracujemy/, /realizacje/, /zamowienia/sklep/, /kontakt/).
- Nowe podstrony `/pracownia/` (o nas — treść ROBOCZA) i `/wspolpraca/` (B2B: dekoratorzy/hotele/kwiaciarnie/eventy/imprezy firmowe, indywidualna sygnatura partnera, priorytet, rabaty — treść ROBOCZA) + trasy w app.py.
- Kontakt: select TEMATU (TEMATY_KONTAKT: wynajem/personalizacja/sklep/współpraca/inne), preselekcja przez ?temat=wspolpraca (link z podstrony Współpraca), kolumna `wiadomosci.temat` + migracja, temat w mailu do Studia i w panelu (lista + podgląd).
- Autoresponder 'zamowienie': neutralny tekst (sklep + personalizacja) + migracja istniejącego szablonu w bazie.
- Testy curl: przepływ C (2×szopka+ramka → 587 zł rachunek → SYG-2026-001 → dziekuje z rachunkiem), A (199×3 doby + kaucja 300 + pers 39 → 636 bez kaucji / 936 przy odbiorze), B (3 pers → rabat −7 → 130 zł), kontakt z tematem (zapis + mail). Dane testowe posprzątane.

Do decyzji użytkownika:
- Kaucja w rachunku jest zapisana jako „za najem (1 komplet) — 300 zł". Gdy wynajem zacznie składać się z POJEDYNCZYCH produktów (każdy z własną kaucją), rachunek wypisze każdą kaucję osobno — na razie dane mają jeden pakiet.
- Zdjęcia szyldu/liter/ramki to makiety — podmień na prawdziwe fotki (wgraj do serwis/static/media/sklep/ i podaj nazwę pliku w /admin/sklep).
- Treści /pracownia/ i /wspolpraca/ są robocze — do przejrzenia w templates/pracownia.html i templates/wspolpraca.html.

---

## Sesja 19 — popup „własny projekt" w personalizacji B (bez produktu → zapytanie przez formularz kontaktowy)

Uwaga użytkownika: w sekcji B ktoś może nie wybrać produktu, tylko opisać własny pomysł. Taki przypadek nie może iść do zamówienia — ma być monit (popup): „Widzimy, że nie znalazłeś w naszym asortymencie tego, czego szukasz. Czy chciałbyś wysłać zapytanie dot. Twojego spersonalizowanego projektu? Informacja zwrotna dot. wyceny zostanie przesłana w wiadomości zwrotnej w terminie 2 dni roboczych" + 2 przyciski:
- „Chcę wysłać zapytanie" → formularz kontaktowy z wklejonym opisem i tematem ustawionym automatycznie na „Zapytanie o projekt spersonalizowany" (klient uzupełnia tylko dane kontaktowe i klika wyślij; dalej wszystko jak przy zwykłym zapytaniu z formularza),
- „Anuluj" → powrót do katalogu produktów personalizacji.

Wykonane:
- `z_pers_1.html` (krok B): checkbox „Mój własny projekt — chcę zrealizować coś spoza asortymentu (zapytanie o wycenę zamiast zamówienia)" + modal `#modal-projekt` z treścią wg uwagi i przyciskami (formularz `f-projekt` z hidden `projekt_wlasny=on` + `pomysl`; „Anuluj" czyści checkbox i zamyka popup). JS: „Dalej" przy braku produktów + zaznaczony projekt + opis ≥10 znaków → popup zamiast wysyłki formularza zamówienia.
- `app.py z_pers_samodzielna`: POST z `projekt_wlasny=on` bez produktów i opisem ≥10 znaków → redirect 303 na `/kontakt/?temat=projekt&opis=<opis>`; zapisuje `projekt_wlasny` w szkicu (przydatne przy edycji).
- `app.py TEMATY_KONTAKT`: nowy temat `projekt` = „Zapytanie o projekt spersonalizowany"; `kontakt_form` (GET) przyjmuje `?opis=` i wkleja go do treści wiadomości, preselekcja tematu przez `?temat=`.
- Testy curl: popup w HTML, redirect z wklejonym opisem, select `projekt selected`, wysyłka zapytania (wiadomość zapisana z tematem „Zapytanie o projekt spersonalizowany"), przepływ z produktem + projekt → normalnie do bloku Dane, opis <10 znaków → błąd walidacji bez redirectu. Dane testowe posprzątane.

Uwagi techniczne:
- Sandbox resetował się 2× w tej sesji (git → 2284074, .venv usunięty). Procedura odtworzenia: zapis edytowanych plików do /tmp → `git fetch origin arena/01a056f0-sygnatura-v-2` + `git reset --hard` → przywrócenie plików → `python3 -m venv .venv && .venv/bin/pip install flask` → start procesu.
- Popup działa też przy powrocie z kroku Dane (w= w formularzach).

---

# ⛳ PUNKT KONTROLNY (koniec sesji 19) — pełny snapshot stanu pracy

**Data:** 2026-09-08 · **Gałąź:** `arena/01a056f0-sygnatura-v-2` · **HEAD:** `f211ebc` (wypchnięty; origin = HEAD, tree czysty)
**PR:** #1 OPEN (base main, head arena/01a056f0-sygnatura-v-2, 41 commitów, ~170 plików, +18k linii — obejmuje całą historię, bo main = „Add files via upload").
**Serwis lokalnie:** Flask 127.0.0.1:8000 (start: `cd serwis && /home/user/Sygnatura-v.2/.venv/bin/python app.py`), admin `/admin/` hasło `sygnatura-2026`.

## ⚠️ PROCEDURA ODTWORZENIA PO RESECIE SANDBOXA (zdarzył się 2× w sesji 19 — bez paniki, wszystko jest w repo)
Sandbox resetuje: git cofa HEAD do `2284074`, usuwa `.venv`, czasem zabija proces Flask. PLIKI W KATALOGU ROBOCZYM ZOSTAJĄ.
1. Zapisz niezcommitowane zmiany: `cp` edytowanych plików do /tmp (NAJPIERW to, zanim git reset).
2. `git fetch origin arena/01a056f0-sygnatura-v-2:refs/remotes/origin/arena/01a056f0-sygnatura-v-2` + `git reset --hard origin/arena/01a056f0-sygnatura-v-2`.
3. Przywróć pliki z /tmp (jeśli były niezcommitowane zmiany).
4. `cd /home/user/Sygnatura-v.2 && python3 -m venv .venv && .venv/bin/pip install -q flask` (pip systemowy blokuje PEP 668; ewentualnie pillow do obróbki zdjęć).
5. Start serwisu przez start_process: cwd=`/home/user/Sygnatura-v.2/serwis`, komenda `/home/user/Sygnatura-v.2/.venv/bin/python app.py`, name „Serwis Sygnatura".
6. Baza `serwis/data/serwis.db` przeżywa reset (nie jest w gicie — .gitignore); przy starcie `db.inicjuj()` robi migracje (kolumny: sklep_produkty.obraz, wiadomosci.temat, rezerwacje.*, pakiety.cena_liczba).

## 🗺️ MAPA REPOZYTORIUM
- `serwis/` — Flask+SQLite (silnik): `app.py` (trasy+logika), `db.py` (schemat+seed+migracje), `core.py` (maile/sygnatury/rabaty/sheets), `templates/`, `static/style.css` (v=6), `static/media/sklep/*.jpg` (zdjęcia produktów), `sheets/webhook.gs` (arkusz).
- `v4/` — STRONA GŁÓWNA (landing): `index.html` (serwowany przez Flask na `/`, przez `wczytaj_v4()`), `build.py` (generator HTML z szablonów + Pillow), `assets/` (hero, litery logotypu), `DZIENNIK-V4.md`.
- `docs/` — kopia GitHub Pages (statyczna wizytówka; menu zsynchronizowane, ale Pages nie odpala Flaska).
- `pracownia/` — materiały usera: `szopka/WARSTWY-PNG/` (konwersja 1:1 do cięcia), `szopka/WIZUALIZACJE/v3/` (wizualizacje — `WIZ3_foto_noc.png` = zdjęcie szopki w sklepie), `szopka/CIECIE-user/` (pliki usera).
- `DZIENNIK.md` (ten plik), `PODSUMOWANIE-rozmowy-v1-v3.md`, `serwis/README.md`, `serwis/WDROZENIE.md`, `serwis/PYTHONANYWHERE-KROK-PO-KROKU.md`.

## ✅ STAN FUNKCJONALNY (co działa i jest przetestowane)
- **Kreator /zamowienia/**: hub 3 kafle; A wynajem (Kalendarz→Pakiet→Personalizacja→Dane→Podsumowanie→Dziękujemy), B personalizacja (3→4→5→6), C sklep (Katalog→3→4→5→6); bloki 4/5/6 wspólne (`/zamowienia/dane|podsumowanie|zamow|dziekuje/`); szkice bez cookies (`w=` w URL, cleanup >48h); powroty aktualizują szkic.
- **Rachunek** (`_kwoty_box.html`): Lp.|Pozycja|Ilość|Cena jedn.|Wartość; kaucja jako osobna pozycja (wynajem); PODSUMOWANIE (bez kaucji) / RAZEM; w podsumowaniu NA GÓRZE, w bloku Dane i na stronie Dziękujemy (pseudo-szkic z rezerwacji).
- **Sklep**: karty ze zdjęciem+ceny, licznik −/+, „Dodaj do zamówienia", sticky koszyk, JS blokuje pusty koszyk; personalizacja po katalogu wyraźnie oznaczona.
- **Personalizacja B**: checkbox „Mój własny projekt" + popup (bez produktu + opis ≥10 zn.) → `/kontakt/?temat=projekt&opis=...` z tematem „Zapytanie o projekt spersonalizowany" i wklejonym opisem; „Anuluj" = powrót do katalogu; walidacja też po stronie serwera.
- **Menu** (wszędzie): Strona główna / Zamówienia / Pracownia / Nasze realizacje / Współpraca / Kontakt. Podstrony: `/pracownia/` (o nas, treść ROBOCZA), `/wspolpraca/` (B2B + indywidualna sygnatura partnera, treść ROBOCZA), `/regulamin/`, `/jak-pracujemy/`, `/realizacje/`, `/kontakt/` (select tematu: wynajem/personalizacja/projekt/sklep/współpraca/inne).
- **Maile**: do Studia „NOWE ZAMÓWIENIE — TYP" + autorespondery z szablonów bazy; bez SMTP kopia w `mail_outbox` (panel → Maile). Na PythonAnywhere FREE tylko smtp.gmail.com:587 + hasło aplikacji.
- **Admin**: rezerwacje (statusy: zapytanie/platnosc_w_toku/zarezerwowany/odrzucono; zmiana statusu wysyła szablony kaucja/potwierdzenie/odrzucono), sklep (CRUD + obraz + miniaturka), personalizacje, pakiety, produkty, realizacje, wiadomości (z tematem), maile, ustawienia (SMTP/sheets/kody rabatowe `KOD:procent`), szablony, rozliczenia mąż/żona/wspólne.
- **Kwoty**: wynajem=stawka×doby+kaucja 300+pers; personalizacja=pers przedpłata; sklep=produkty×szt.+pers; rabat pers −5% od 3; kod rabatowy od całości bez kaucji; klucz `razem_po`.

## 📋 OTWARTE DECYZJE / TO-DO (nic nie ucieknie)
1. **Landing page — NASTĘPNY KROK (decyzja usera):** nowa forma strony głównej. Prace w `v4/index.html` (+ `build.py` jako źródło) — serwowany przez Flask na `/`; kopia Pages w `docs/index.html` do synchronizacji na końcu.
2. Kaucja jednostkowa per produkt najmu — gdy wynajem rozbije się na pojedyncze produkty (teraz: „za najem, 1 komplet, 300 zł").
3. Zdjęcia produktów sklepu: szopka = prawdziwa wizualizacja; szyld/love/ramka = makiety AI do podmiany (`serwis/static/media/sklep/` + pole „Obraz" w `/admin/sklep`).
4. Treści ROBOCZE do przejrzenia przez Studio: `templates/pracownia.html`, `templates/wspolpraca.html`, `templates/regulamin.html`, `templates/jak_pracujemy.html`; ceny sklepu i pakietów.
5. Instrukcja webhook.gs (arkusz Google) dla usera — w ROZMOWIE, nie w plikach md.
6. Koszt wysyłki kuriera (teraz „potwierdzimy w odpowiedzi") — do decyzji.
7. Etap 2: Oracle Cloud Always Free + domena; PythonAnywhere: `git pull` + Reload przy aktualizacjach.

## 🧭 USTALENIA STAŁE (nie zmieniać bez zgody usera)
Menu 6 pozycji w tej kolejności; kolory #6B4530/#1F3A32/#C4A582/#FBF7F0; logo sygNATURA+sygnet; hero bez cięcia + animacje grają ZAWSZE + menu responsywne; „Zamawiam z obowiązkiem zapłaty"; doby od protokołu zdawczo-odbiorczego; kaucja+przedpłata; rabat 5% od 3 pers; „min. 2 tygodnie" przy personalizacji; wycena pomysłu własnego 2 dni robocze pod tą samą sygnaturą; PKE art. 398 (zgoda wymagana); GitHub Pages = tylko statyczna wizytówka; silnik (Python) / look (HTML+CSS+JS) rozdzielone; produkty BOŻONARODZENIOWE priorytetem (szopka warstwowa = flagowiec); nie generować SVG (PNG/JPG sylwetki, obrys robi user); pliki pod cięcie = sam outline.
