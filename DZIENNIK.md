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

---

## Sesja 20 — NOWY LANDING PAGE (układ kwaterowy + slider z bazy + wyszukiwarka)

Decyzja użytkownika: przebudowa strony głównej na nowoczesny layout podzielony na 4 części:
- czarny pasek u góry: tel. 510 767 076 + kontakt@studiosygnatura.pl,
- lewa górna ćwiartka: kwadrat z logo (sygnet + sygNATURA), pod nim pionowo przyciski menu, pod menu linki social media,
- obok logo wąski pasek: wyszukiwarka po słowach kluczowych + na końcu po prawej koszyk/panel klienta (na razie ikony-linki, bo pełne konta wymagałyby bazy użytkowników),
- okno główne (prawa dolna ćwiartka): slider 3–4 slajdy z przewijaniem prawo/lewo, kropkami wskaźnikowymi i autoplay w pętli co kilka sekund: 1) Nowości, 2) Najczęściej zamawiane, 3) Aktualności (ostatni wpis o realizacji), 4) oferta sezonowa (opcjonalna — jest),
- pod sliderem opis „jak działamy" + CTA „Zarezerwuj termin" / „Złóż zamówienie",
- stopka: Regulamin + © Sygnatura 2026.

Wykonane:
- `v4/index.html` napisany od nowa (self-contained CSS+JS, animacje grają zawsze: puls kwadratu logo, ken-burns na aktywnym slajdzie). Grid: side (sticky, butelkowa zieleń) / head (search+ikony) / main (slider 16:8.6, max 600px) / cta / foot. Responsywne: <980px side na górę z poziomym menu, <640px mini-karty w slajdach 1 kolumna. Slider: autoplay 5 s, loop, strzałki ‹ ›, kropki (aktywna wydłużona), pauza na hover, swipe touchstart/touchend.
- Slajdy ZASILANE Z BAZY: `app.py wczytaj_v4(nazwa, **ctx)` przyjmuje kontekst; `index()` podaje `nowosci` (3 najnowsze produkty sklepu), `top` (licznik zamówień z rezerwacje.pozycje — helper `top_produkty_sklepu`, fallback: pierwsze z katalogu), `realizacja` (ostatnia widoczna). Jinja `{% if %}` z treściami zastępczymi — szablon działa też bez kontekstu (np. Pages).
- Nowa trasa `/szukaj/` + `templates/szukaj.html`: przeszukuje sklep_produkty / personalizacje / pakiety / realizacje (LIKE, min. 2 znaki, wyniki pogrupowane z miniaturkami i ceną; brak wyników → sugestia formularza kontaktowego). Formularz wyszukiwarki na landingu → `/szukaj/?q=`.
- `build.py`: ostrzeżenie na górze — NIE uruchamiać (nadpisze nowy index.html starym layoutem v4); `v4/DZIENNIK-V4.md` opis v5.
- Testy curl: / 200 (topbar z telefonem i mailem, menu-vert 6 pozycji, 4 slajdy z tytułami, dane produktów i realizacji z bazy, brak podwójnych slashy po zamianie assets/); /szukaj/: szopka→1 wynik, litery→2 (sklep+personalizacja), 1 znak→komunikat, brak→komunikat; /assets/hero.jpg 200; JS slidera obecny (setInterval 5000, dots, touch).

Do decyzji / dalej:
- Pełny panel klienta (konta, historia zamówień) — wymaga tabeli użytkowników; teraz ikony prowadzą do kreatora.
- Kopia Pages (docs/index.html) do zsynchronizowania z nowym layoutem (statyczna wersja slajdów, ścieżki assets bez Flaska) — na końcu prac nad landingiem.
- Można iterować treści slajdów, zdjęcia (slajd 4 używa assets/hero.jpg), kolory/kadry — user ocenia w podglądzie.
- UWAGA: user napisał e-mail „kontakt@studiowygnatura.pl" — uznano literówkę, na stronie jest kontakt@studiosygnatura.pl (jak w całym serwisie). Potwierdzić.

---

## Sesja 21 — poprawki: landing na „wersji na komputer" + koszyk sklepu

1) Landing „fatalny na telefonie w trybie wersja na komputer": przyczyną był breakpoint `max-width:980px`, który rozwalał układ kwaterowy dokładnie na szerokości ~980 px zgłaszanej przez telefony w tym trybie. Poprawka: układ kwaterowy zostaje do 760 px — dodany zakres średni `@media (max-width:1100px) and (min-width:761px)` (ciaśniejsza lewa kolumna 200–230 px, mniejsze logo/menu, karty w slajdach 2 kolumny z 3. kartą na całość, ukryta top-note), a pełne zwinięcie „jeden pod drugim" dopiero <760 px (widok mobilny). Lekcja: testować też szerokości 761–1100 px („desktop mode" telefonu = ~980 px).
2) Sklep — przycisk „Dodaj do koszyka" inkrementował licznik. Rozdzielono: widoczny licznik (`.licz-q`, bez name — nie wysyła się) = ilość DO DODANIA; ukryte pole `ile_<id>` = stan koszyka; przycisk przenosi q do koszyka i zeruje licznik (NIE wpływa na licznik w żaden inny sposób). Pod produktem dymek „N w koszyku" (ukryty przy 0, aktualizowany na żywo; przy powrocie w= pokazuje stan z bazy). Pasek koszyka liczy z pól ukrytych. Server-side bez zmian (czyta ile_<id>). Testy: POST ile_1=2&ile_4=1 → redirect do personalizacji; powrót w= → hidden 2/1 + rachunek 587 zł; szkic testowy posprzątany. style.css v=7 (z_sklep_1.html).

---

## Sesja 22 — SYSTEM LEKKI: zdjęcia z zewnętrznych linków (Dysk Google) + odchudzenie

Decyzja użytkownika: system ma być LEKKI na PythonAnywhere (free: 512 MB, 100 CPU-s/dzień). Zdjęcia linkowane z zewnątrz (Dysk Google), żeby nie obciążać serwera.

Wykonane:
- `app.py`: helper `url_obrazu(obraz, typ)` + filtr Jinja `obrazek` — pełny URL (https://…, np. drive.google.com/thumbnail?id=…&sz=w1200) przechodzi BEZ ZMIAN, lokalna nazwa pliku dostaje ścieżkę (`/static/media/sklep/…` lub `/media/…`). Filtr globalny — działa też w `v4/index.html` (render_template_string).
- Wszystkie widoki obrazów przechodzą na filtr: `realizacje.html`, `realizacja_szczegoly.html`, `z_sklep_1.html` (karta produktu), `admin_sklep.html` (miniaturka), `v4/index.html` (karty w slajdach Nowości/Bestsellery), `szukaj` (wyniki — przez helper w Pythonie).
- `admin_realizacje`: nowe pole „Link do zdjęcia (https://…)" w edycji i dodawaniu; link ma PIERWSZEŃSTWO przed plikiem; walidacja startswith http(s). `admin_sklep`: podpowiedź o linkach zewnętrznych.
- Odchudzenie `v4/assets`: hero.jpg 248→52 kB, forest 356→176 kB, hero-alt 248→177 kB (Pillow, max 1600 px) — całość assets 1,2 MB→0,8 MB. Sklepowe jpg ~70–80 kB szt. (OK).
- Testy: tymczasowe linki TEST123/TESTREAL w bazie → poprawnie renderowane w sklepie/landing/realizacjach/szczegółach/wyszukiwarce; lokalne nazwy dalej działają; formularze admin z polem URL; po testach baza przywrócona.
- Sandbox zresetował się W TRAKCIE tury — zmiany uratowane procedurą /tmp (zapis 7 plików → reset → przywrócenie).

USTALENIA TECHNICZNE (ważne dla przyszłych sesji):
- **Obrazy zewnętrzne ładuje PRZEGLĄDARKA klienta, nie serwer** — whitelist PA (outbound) NIE DOTYCZY obrazków w <img>. PA nie zużywa ani CPU, ani transferu, ani dysku.
- Wzór linku z Dysku Google (po udostępnieniu „każdy, kto ma link"): `https://drive.google.com/thumbnail?id=FILE_ID&sz=w1200` (w1200 = szerokość; stabilny dla <img>). Alternatywa: `https://lh3.googleusercontent.com/d/FILE_ID=w1200`.
- Instrukcja dla użytkownika (klikanie na PA) — w ROZMOWIE, nie w plikach md:
  1) odchudzenie repo na PA (sparse-checkout: tylko serwis/ + v4/ — zamiast ~200 MB zostaje ~5 MB; pracownia/uploads/.git-history zostają tylko na GitHubie),
  2) mapowania statyczne w zakładce Web (URL → katalog): /static/ → serwis/static, /assets/ → v4/assets, /media/ → serwis/data/uploads — wtedy PA serwuje statyki BEZ Pythona (0 CPU; trasy Flaska zostają jako fallback),
  3) baza: SQLite lokalnie (lekkie), Dysk Google = zdjęcia + dokumenty (linki), arkusz webhook.gs = raporty.
- Skala: 1000 klientów ≈ 1–2 MB w SQLite; konta klientów (opcjonalne, gość = klient_id NULL) nie obciążą dysku — do wdrożenia gdy user zdecyduje.

---

## Sesja 23 — MAPA ARCHITEKTURY (fundament techniczny, decyzja użytkownika)

Użytkownik: najpierw FUNDAMENT techniczny, dopiero potem wizualizacje/funkcje. Potrzebna kompletna mapa: gdzie aplikacja, gdzie baza zdjęć, gdzie baza użytkowników/kooperantów/zamówień, jak węzły wymieniają dane, kopie zapasowe, spięcie z domeną OVH i pocztą w domenie.

Utworzono `ARCHITEKTURA.md` (repo root) — pełna mapa techniczna:
- 8 węzłów: PA FREE (etap 1) / Oracle Always Free (etap 2) / GitHub / Google Drive (media) / Sheets+Apps Script (raporty) / Gmail SMTP (etap 1) / OVH domena+poczta / lokalny sandbox.
- Przepływ danych (diagram): przeglądarka↔PA (HTTPS), PA↔SQLite (lokalnie), przeglądarka→Drive (obrazki, omija serwer), PA→Gmail SMTP, Sheets przez Apps Script PULL (free PA nie „pchnie" przez whitelistę), git pull = deploy, Oracle: domena A→IP, SMTP OVH, cron backup→Drive.
- Gdzie co zapisane: WSZYSTKIE dane operacyjne w jednym SQLite (rezerwacje, klienci* z gościem=NULL, partnerzy* z indywidualną sygnaturą, wiadomości, katalog, mail_outbox, ustawienia/sekrety, szablony, szkice); media+PDF na Drive (linki w bazie); raporty w Sheets (lustro, nie baza).
- Backup: etap 1 = automat przy starcie aplikacji (mail z .db przez Gmail SMTP, bo na nowych kontach PA NIE MA zadań planowanych) + przycisk w panelu + ręcznie; etap 2 = cron 03:00 → .backup → gzip → Drive (30 dni + snapshoty miesięczne); odtworzenie <1 h (clone + pip + wgrać db).
- Domena OVH: etap 1 redirect na PA (free PA nie obsługuje własnych domen) + MX Plan od razu (poczta w domenie, ~1–2 €/msc), aplikacja wysyła z Gmaila z Reply-To domeny; etap 2: tabela DNS (A→IP Oracle, MX→OVH, SPF, DKIM, DMARC), Let's Encrypt, SMTP OVH z From: kontakt@studiosygnatura.pl.
- Etapy: 1 (PA FREE) → 1.5 (opcjonalnie PA Hacker ~5 $/msc dla domeny) → 2 (Oracle) → 3 (awaryjnie OVH VPS).
- Limity/ryzyka + mitygacje (512 MB, 100 CPU-s, whitelist, wygasanie app co miesiąc, idle reclaim Oracle, publiczne repo → sekrety tylko w bazie).
- Checklist decyzji: MX Plan teraz czy później / czy PA Hacker / Sheets w etapie 1 czy 2 / SQLite vs Autonomous w etapie 2 / nazwy folderów Google.

Fakty z pomiarów (do archiwum): serwis kod+templates+static ≈ 0,7 MB, baza 96 KB, uploads 7 MB, v4/assets 0,8 MB; venv na PA ~50–100 MB (po odchudzeniu repo zostaje ~350 MB wolnego).

NASTĘPNY KROK (wg użytkownika): decyzje z checklisty → dopiero potem wracamy do wizualizacji/funkcji. User chce „fundament solidny, trwały, gotowy do testów i do pracy".

---

## Sesja 24 — ARCHITEKTURA v2: JEDEN SERWER (decyzja użytkownika) + pakiet deploy/

Użytkownik: domena kupiona, poczta w OVH (Zimbra/OVH Mail) działa i jest przetestowana. Minimalizujemy wydatki. Wszystko ma stać na JEDNEJ maszynie (Oracle) pod domeną — nie chce „15 serwisów" (zdjęcia tu, baza tam, app gdzie indziej + github). Priorytet: STABILNOŚĆ + minimalna obsługa (stroną zarządza głównie żona; on nie będzie jej pilnował codziennie). Budżet awaryjny na serwer: do ~100–200 zł/rok. Wspominał rozważanie WordPress/WooCommerce i Odoo — porównanie w dokumencie.

Wykonane:
- `ARCHITEKTURA.md` przepisana na v2 „JEDEN SERWER": 1 maszyna = aplikacja + SQLite + zdjęcia lokalnie (Oracle 200 GB dysku) + backup. OVH = domena (tylko A+CNAME; MX/SPF/DKIM poczty NIETKNIĘTE) + wysyłka SMTP OVH (smtp.mail.ovh.net:587, From: kontakt@domena). GitHub = „szafa z kodem" + aktualizacje (niewidoczny dla żony). Drive/Sheets = OPCJONALNE, nie krytyczne. Sekcja „obsługa codzienna żony" (4 czynności w panelu), ryzyka+mitygacje, porównanie opcji (Oracle 0 zł / VPS EU ~150–220 zł/rok / WP+Woo — wymaga odbudowy wszystkiego + aktualizacje wtyczek / Odoo — free tylko .odoo.com, własna domena 1. rok gratis, nasza logika i tak nie działa), etapy (0 PA=poligon ✅, 1 Oracle+skrypt+DNS, 2 stabilizacja, Plan B VPS), checklist decyzji.
- NOWY PAKIET `deploy/` (składnia sprawdzona): `instalacja.sh` (Ubuntu 22/24: pakiety, użytkownik sygnatura, sparse-clone repo [serwis+v4+deploy], venv, systemd, nginx z aliasami statyk, ufw, cron backup, skrypt aktualizacji), `sygnatura.service` (gunicorn, auto-restart), `nginx-sygnatura.conf`, `backup.sh` + `backup_mail.py` (sqlite .backup → gzip → 30 dni + załącznik na skrzynkę przez SMTP z ustawień), `aktualizuj.sh` (backup→git pull→restart), `README.md` (krok po kroku: Oracle VM + Security List 22/80/443 + Reserved IP, DNS OVH, certbot, SMTP w panelu; migracja <1h).
- Fakty (search): Odoo One App Free = hosting Odoo, własna domena gratis tylko 1. rok, dalej płatne; e-commerce = płatne plany (~$16.90+/user/msc). VPS EU: Hetzner CX22 €3.79/msc (~200 zł/rok), OVH VPS Starter ~€3.50/msc. Budżet 50–100 zł/rok = realnie tylko ultra-tanie VPS USA (ryzyko) → rekomendacja: Oracle start, VPS jako Plan B.

NASTĘPNY KROK: decyzje z checklisty (konto Oracle i karta do weryfikacji? / dane SMTP OVH do ustawień? / arkusz teraz czy w etapie 2? / potwierdzenie zdjęć lokalnie?) → wdrożenie etapu 1.

---

## Sesja 25 — SeoHost jako kandydat (KOREKTA: seohost deklaruje obsługę Pythona)

- User ponownie spytał o seohost.pl (37 zł/rok) i podał ranking rankinghostingow.pl.
- KOREKTA mojej wcześniejszej oceny („tylko PHP"): seohost DEKLARUJE możliwość uruchamiania aplikacji Python (panel DirectAdmin/Passenger) + Node.js + PHP, SSH, cron, backupy 7 dni, SSL. Źródła: recenzje tenodwordpressa.pl, hostingowy.top, rankhost.pl, tophosting.pl, businesshost.pl.
- Rankinghostingow.pl = serwis porównawczy/afiliacyjny — traktować jako punkt startowy, nie dowód; weryfikacja u supportu + okres testowy.
- ARCHITEKTURA.md: tabela opcji uzupełniona o SeoHost SH2 jako KANDYDAT #1 „kup i zapomnij" (jeśli potwierdzi 4 warunki): (1) Python/Flask na pakiecie 37 zł i limity RAM/procesów, (2) cron + SQLite zapis, (3) zewnętrzny SMTP do OVH (smtp.mail.ovh.net:587) — inaczej SPF trzeba dostosować, (4) cena odnowienia (rozbieżność: 37 zł promocja vs 127–217 zł netto standard), (5) git pull + restart aplikacji Python.
- Alternatywa na „kup i zapomnij": MyDevil MD1 (~130 zł/rok 1. rok) — sprawdzony hosting z Pythonem.
- Jeżeli seohost potwierdzi warunki: wdrożenie = wgrać serwis + `passenger_wsgi.py` (adaptacja deploy pod Passenger zamiast systemd/nginx) — przygotować po decyzji.

NASTĘPNY KROK: użytkownik wysyła pytania do supportu seohost (treść w rozmowie) albo decyduje MyDevil/Oracle.

---

## Sesja 26 — PIVOT TECHNOLOGICZNY: przebudowa na HTML + CSS + JS (decyzja właściciela)

Właściciel (ton stanowczy): „To ty wymyśliłeś Pythona, nie ja. Mówiłem cały czas o HTML+CSS+JS."
→ PRZEBUDOWUJEMY cały serwis na HTML + CSS + JavaScript. Zero Flaska, zero Pythona.
- Silnik (zapisy, maile, sygnatury, panel) = Google Apps Script (JavaScript) + arkusz Google jako baza
  (to wraca do pierwotnego pomysłu właściciela „arkusz = jedna baza").
- Hosting: ma być obsługiwany przez kogoś innego („nie będę codziennie pilnował serwera"),
  strona administrowana głównie przez żonę, właściciel pomaga przy utrzymaniu. SeoHost SH2 (37 zł/rok)
  = kandydat #1; kryteria do supportu ustalam SAM (nie właściciel) — w ARCHITEKTURA.md §4.
- DZIENNIK.md = backup rozmowy (wymóg właściciela) — aktualizowany i wypychany co sesję.

WYKONANE W TEJ SESJI:
1. NOWY PROJEKT `www/` (czyste HTML+CSS+JS, bez frameworków, bez builda):
   - index.html — landing kwaterowy przeniesiony 1:1 z v4 (slider, autoplay, swipe; karty slajdów
     renderowane z data/katalog.js; wyszukiwarka → szukaj.html),
   - zamowienia.html — hub 3 kafli (teksty 1:1 ze starego szablonu); wynajem i personalizacja tymczasowo
     przez formularz z tematem (ścieżki A/B do przeniesienia w kolejnych sesjach),
   - sklep.html — krok 1: katalog, licznik −/+, „Dodaj do koszyka", dymek „N w koszyku", sticky pasek
     koszyka z sumą, blokada pustego koszyka (jak w sesji 21, ale w czystym JS),
   - dane.html — krok 2: dane + sygnatura (nowa/istniejąca) + dostawa + zgody (PKE art. 398 + regulamin
     z linkami) + KOMUNIKAT O NIEUZUPEŁNIONYCH POLACH przed przejściem dalej (wymóg sesji 17),
   - podsumowanie.html — krok 3: rachunek (port _kwoty_box: pozycje, personalizacje, rabat 5% od 3 pers.,
     „pomysł własny = wycena osobno", „PODSUMOWANIE (bez kaucji)" + kaucja mniejszym drukiem — gotowe pod
     wynajem) + „Zamawiam z obowiązkiem zapłaty" → API → dziekuje.html z sygnaturą,
   - kontakt.html — tematy + auto-wypełnienie ?temat=&opis= (popup pomysłu) + honeypot antybot + zgoda,
   - szukaj.html — wyszukiwanie katalogu po nazwie/opisie (min. 2 znaki), fallback → formularz,
   - admin.html — panel: zamówienia + zmiana statusów (demo: localStorage; produkcja: klucz w URL),
   - regulamin/jak-pracujemy/pracownia/wspolpraca/realizacje — treści przeniesione ze starych szablonów,
   - assets/: style.css (wspólny motyw), main.js (szkielet: topbar/menu/stopka/banner demo/progres),
     koszyk.js (localStorage), api.js (demo ↔ Apps Script — te same akcje), config.js (SYG.API),
   - data/katalog.js — 4 produkty (szopka 249, szyld 189, LOVE 249, ramka 89; zdjęcia skopiowane).
2. SILNIK `engine/` (Google Apps Script = JavaScript): Konfig.gs (ID arkusza, TOKEN, maile, instaluj()),
   Kod.gs (API: katalog/wiadomosc/zamowienie publiczne; zamowienia-lista/status z kluczem; sygnatury
   z LockService; maile MailApp z Reply-To domeny), Uruchom.gs (nocny backup JSON na Dysk + retencja
   30 dni + alarm), README.md (wdrożenie krok po kroku — robi właściciel, bot nie ma dostępu do Google).
3. tools/serwuj.mjs — podgląd lokalny w czystym JS (Node, port 8001) — bez Pythona nawet do podglądu.
4. README.md (root) — nowy projekt, struktura, testy, wdrożenie, roadmapa. ARCHITEKTURA.md v3 —
   węzły (hosting statyczny + Google silnik + OVH domena/poczta + GitHub), kryteria seohost, ryzyka.
5. Sprzątanie: usunięte testowe uploads (7 MB) z serwis/data/uploads; serwis/ (Flask) ZOSTAJE na razie
   jako referencja do przepisywania logiki (całość w historii gita) — do usunięcia po pełnym przeniesieniu.

DO ZROBIENIA (kolejne sesje): ścieżka A wynajem (kalendarz→pakiet→pers, kaucja w rachunku), ścieżka B
personalizacja + popup „własny projekt" (bez produktu → kontakt?temat=projekt&opis=…), panel: edycja
katalogu/wiadomości, konta klientów i partnerów (PART-XXX), raporty kwartalne, podmiana docs/ (Pages),
wdrożenie (hosting + Apps Script + domena).

---

## Sesja 27 — POTWIERDZENIE ARCHITEKTURY BEZ SERWERA + publikacja na GitHub Pages

Właściciel pyta: (1) czy dobrze rozumie, że serwer nie jest potrzebny — statyka na GitHubie, JS woła bazę w Google; (2) jak rozwiązane są maile (formularz kontaktowy/zgłoszenia); (3) chce PODGLĄD ŻYWY na GitHub Pages (nowa wersja), żeby podesłać link żonie do klikania.

ODPOWIEDZI (potwierdzone):
1. TAK — serwer nie jest potrzebny. GitHub Pages = statyka; JS na stronie woła Apps Script (JavaScript
   u Google); arkusz Google = baza (Zamówienia/Wiadomosci/Katalog/Ustawienia); maile wysyła Gmail
   (MailApp) z Reply-To: kontakt@studiosygnatura.pl. Zero VPS, zero Pythona, zero utrzymania serwera.
2. Maile: formularz/ zamówienie → fetch do silnika → zapis do arkusza + MailApp wysyła maile
   (do Studia + do klienta). Na obecnym Pages działa TRYB DEMO (banner) — maile ruszą po wdrożeniu
   silnika (engine/README.md, 8 kroków, robi właściciel) i wklejeniu URL do www/assets/config.js.
3. PUBLIKACJA: GitHub Pages jest włączony i buduje się z GAŁĘZI arena/01a056f0-sygnatura-v-2, folder
   /docs (sprawdzono API: source.branch=arena/…, path=/docs, status=built). Wykonano: docs/ podmienione
   na nową wersję www/ (rm starej wersji: galeria/warsztat/wynajem/404 → nowe 14 stron + assets/data),
   dodano docs/.nojekyll i 404.html przekierowujący na stronę główną. Commit 3d43974 → Pages zbudował
   się sam (status built). Weryfikacja przez fetch: https://maciejhaufa-dev.github.io/Sygnatura-v.2/
   serwuje NOWĄ wersję (slider, baner demo, menu, sklep). Od teraz: każdy push na arena-branch =
   automatyczna publikacja — żona zawsze widzi najnowsze.
4. Uwaga: sandbox nie łączy się z github.io (ograniczenie sieci sandboxa — curl 000), ale API Pages
   (status built) + fetch zewnętrzny potwierdzają publikację. Link dla żony:
   https://maciejhaufa-dev.github.io/Sygnatura-v.2/ (panel demo: /admin.html).
5. Docelowo: podpięcie własnej domeny studiosygnatura.pl do Pages (Ustawienia → Pages → Custom domain
   + rekord CNAME w OVH) — robi właściciel (bot 403 na ustawieniach Pages); NIE jest to potrzebne
   do testów żony.

---

## Sesja 28 — UJEDNOLICENIE SZATY + splash screen + koszyk jako ikona (uwagi właściciela)

Uwagi właściciela po testach żony: (1) brak splash screen przy pierwszym uruchomieniu, (2) na telefonie
strona się rozjeżdża, (3) menu niespójne — koszyk był osobną zakładką, ma być IKONKĄ w prawym górnym rogu,
(4) pusty koszyk = pusty widok, (5) ogółem szata graficzna „się nie spina". „Popraw zanim wyślę żonie".

Dwa pierwsze warianty poprawki zostały ODRZUCONE. Finalna wersja (zaakceptowany kierunek, commity
a08171d + 2cd3db1 + 9a5ea4a):

- SPLASH DOKŁADNIE jak we wcześniejszej wersji (księga znaku): zdjęcie forest.jpg w tle (center/cover
  + delikatny gradient przyciemniający), kremowy PROSTOKĄT z brązową ramką 2px, sygnet SVG i 9 liter
  PNG (assets/letters/l0–l8.png) spadających po kolei (delay 1,25–2,29 s). Pokazuje się przy KAŻDYM
  wejściu na stronę główną, 3,8 s, potem płynnie znika (bez klikania, bez sessionStorage).
- Naprawa podwójnego menu na stronie głównej: main.js buduje wspólny szkielet WYŁĄCZNIE na podstronach
  (main.wrap); index.html zachowuje swój własny układ kwaterowy — nic się nie dubluje ani nie rozjeżdża.
- UKŁAD WG OPISU WŁAŚCICIELA (obowiązuje na podstronach i na stronie głównej): czarny pasek u góry
  (tel + mail) → pod spodem logo po lewej, WYSZUKIWARKA z ładnym tłem (kremowy gradient w ramce)
  po prawej → NAZWA/TYTUŁ STRONY POD WYSZUKIWARKĄ (górna część, na wysokości logo) → menu pionowe
  po lewej + SOCIALE pod menu → treść podstrony w osobnym bloku → stopka. Breakpointy 761–1100 px
  i <760 px (kolumna).
- Koszyk WYŁĄCZNIE jako ikona w prawym górnym rogu (kropka z licznikiem tylko gdy niepusty); klik
  otwiera PODSTRONĘ koszyk.html (podgląd koszyka: pozycje z miniaturami, ilości −/+, usuń, pozycje
  personalizowane, rabat, RAZEM, „Przejdź do danych" / „Wróć do katalogu"; pusty koszyk = komunikat
  + przycisk do katalogu). Ścieżka: sklep → koszyk → dane → podsumowanie → dziękujemy.
- style.css: wspólna szata (topbar, side z logo/menu/social, head z wyszukiwarką i ikonami, h1 pod
  wyszukiwarką), komponenty formularzy/rachunku/tabeli admina/progresu.
- docs/ zsynchronizowane z www/ (Pages publikuje się sam z brancha arena/…, folder /docs).
- Stopka: „© Sygnatura 2026 · wersja 28.3" — znacznik ułatwia właścicielowi potwierdzenie, że widzi
  NAJNOWSZĄ wersję (GitHub Pages + przeglądarka trzymają kopie do ~10 min; odświeżanie może pokazywać starą).

Testy: składnia JS OK, Pages build OK (gh api), podgląd live przez fetch_page: splash renderuje się
(sygnet + 9 liter), koszyk.html działa, tytuł strony pod wyszukiwarką, brak podwójnego menu.
NASTĘPNY KROK: oględziny właściciela (telefon + komputer); potem ścieżki A/B, panel, wdrożenie engine.
