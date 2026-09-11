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

## Sesja 28 — korekta 2 po oględzinach (commit 114fd1e, wersja 28.4)

Uwagi właściciela: (1) strona za bardzo rozciągnięta — kolumna z treścią ma się dopasowywać do
zawartości podstrony, a zawartość boxa treści ma być WYJUSTOWANA DO GÓRY (nie do środka);
(2) elementy lewej kolumny (menu, sociale) zawsze u góry; (3) długość przewijania strony dopasowuje
się automatycznie do treści; (4) gdy treści jest więcej, góra i lewe menu zostają NIERUCHOME,
a treść przewija się WEWNĄTRZ swojego boxa po prawej na dole; (5) kliknięcie ikony konta ma otwierać
PANEL LOGOWANIA (konto.html), nie sklep; musi być baza klientów — najpierw panel logowania,
resztę robimy później.

WYKONANE:
- Nowy szkielet układu (style.css + index.html): zamiast siatki z min-height:100vh — kolumna flex
  z max-height:100vh i overflow:hidden. Krótka treść = krótka strona (żadnej pustej przestrzeni);
  długa treść = strona dokładnie na wysokość ekranu, a treść przewija się wewnątrz boxa
  (main.wrap / .main z overflow-y:auto + cienki scrollbar). Góra (topbar + head z wyszukiwarką
  i tytułem) oraz lewa kolumna zostają nieruchome. Struktura: topbar / .srodek[ aside.side |
  .prawa[ .head | main ] ] / .stopka.
- Lewa kolumna: menu i sociale ZAWSZE U GÓRY (usunięte flex:1 z menu i height:100vh z .side);
  .side-stopka przypięta do dołu kolumny (margin-top:auto). Na telefonach (<760 px) powrót do
  normalnego przewijania strony, kolumny jedna pod drugą; 761–1100 px węższa lewa kolumna (230 px).
- IKONA KONTA (w prawym górnym rogu, obok koszyka) prowadzi teraz do NOWEJ podstrony
  www/konto.html — PANEL LOGOWANIA: e-mail + hasło + „Zaloguj się", informacja że konto zakłada się
  przy pierwszym zamówieniu, ręczne odzyskanie hasła przez kontakt@studiosygnatura.pl. Walidacja
  pól; po kliknięciu komunikat, że weryfikacja kont nastąpi z BAZĄ KLIENTÓW (Google Apps Script +
  arkusz) — kolejny etap (ustalenie: „najpierw panel logowania, resztę zrobimy później").
- Baner trybu demo: body.ma-banner pomniejsza max-height układu o wysokość banera, żeby stopka
  nie uciekała poza ekran.
- Znacznik wersji w stopkach: „wersja 28.4".

Testy: wszystkie podstrony 200 na podglądzie lokalnym, HTML zbilansowany, node --check OK,
Pages build OK (gh api: built | 114fd1e), fetch_page potwierdza live: konto.html działa
(formularz logowania), ikony prowadzą do koszyk.html i konto.html.

## Sesja 28 — korekta 4 po oględzinach (commit 08a7651, wersja 28.6)

Uwagi właściciela: (1) splash pojawia się przy KAŻDYM kliknięciu/odświeżeniu strony głównej —
ma być TYLKO przy pierwszym wejściu; (2) podstrony nie dopasowują się do zawartości (u właściciela
widać stare wersje plików); (3) panel klienta dalej otwiera zamówienia; (4) napis logo przy sygnecie
nie zgadza się z ustaleniami/księgą znaku — ma być JEDNOLITY napis „Sygnatura": „Syg" delikatnie
jaśniej (zauważalnie), „natura" w kolorze złotym.

WYKONANE:
- SPLASH: tylko przy pierwszym wejściu — sessionStorage 'syg-splash': pokazuje się raz na sesję
  przeglądarki (odświeżenie strony i powrót z podstron NIE powtarzają go; nowa wizyta = pokazuje
  się znowu). Nadal 3,8 s, płynnie znika, bez klikania.
- WYMUSZONE ODŚWIEŻANIE ZASOBÓW: wszystkie podstrony ładują style.css / main.js / koszyk.js /
  api.js / config.js / data/katalog.js z parametrem ?v=286. Od teraz każdy deploy z nową wersją
  automatycznie wymusza w przeglądarce świeże pliki — koniec z oglądaniem starych kopii z cache
  (to dlatego podstrony „były bez zmian" i ikona konta „prowadziła do zamówień").
- NAPIS LOGO (przy sygnecie, lewa kolumna — strona główna i wszystkie podstrony): jednolity
  „Sygnatura" (ta sama czcionka/wielkość/waga): „Syg" w kolorze kremowym (jaśniejszy), „natura"
  w złotym (var(--zloty)). Usunięty stary zapis „sygNATURA" (małe/duże litery).
- Ikona konta (prawy górny róg) → konto.html (panel logowania) — potwierdzone na live; panel
  logowania gotowy, BAZA KLIENTÓW do zrobienia później (Apps Script + arkusz).
- Znacznik wersji w stopkach: „wersja 28.6".

Testy: HTML zbilansowany (wszystkie 17 stron), node --check OK, podgląd lokalny 17×200 + zasoby
?v=286 OK, Pages build OK (gh api: built | 08a7651), fetch_page: konto.html live (formularz
logowania), ikona konta „Konto — logowanie".

## Sesja 28 — korekta 5 po oględzinach (commit ae5b8be, wersja 28.7)

Uwagi właściciela: (1) splash pokazuje się przy każdym kliknięciu „Strona główna"/odświeżeniu —
ma być TYLKO przy pierwszym wejściu; (2) napis logo przy sygnecie nadal niezgodny — ma być
JEDNOLITY „Sygnatura": „Syg" delikatnie jaśniej (zauważalnie), „natura" w kolorze; (3) strona
nie dopasowuje się do ekranu — „wszystko upchnięte na górze, pod tym dużo pustej przestrzeni";
właściciel podejrzewa przeglądanie telefonu w trybie „wersja na komputer" — jeśli tak, też trzeba
to wyeliminować, bo UX leży.

WYKONANE:
- SPLASH: przełączony z sessionStorage na localStorage (klucz 'syg-splash'): pokazuje się RAZ
  na danym urządzeniu przy pierwszym wejściu; każde kolejne odświeżenie, kliknięcie w „Strona
  główna" i powrót z podstrony go NIE pokazuje (sprawdzenie + natychmiastowe usunięcie, gdy
  już był). Zapis w try/catch (bezpieczny dla trybu prywatnego). Nowe wejście = 3,8 s i płynne
  zniknięcie; żeby zobaczyć go ponownie: tryb incognito.
- TRYB DOTYKOWY (eliminacja problemu „wersja na komputer" na telefonie): na starcie każdej
  strony wykrywamy ekran dotykowy (matchMedia pointer:coarse / hover:none / maxTouchPoints /
  UA Android-iPhone-iPad-Mobile) i dodajemy klasę html.dotyk. Wtedy: układ przechodzi w kolumnę
  dopasowaną do treści (strona ma dokładnie taką wysokość jak zawartość — ZERO pustej
  przestrzeni), przewijanie strony jest zwykłe (bez wewnętrznego boxa), menu jako pigułki.
  Działa zarówno na telefonie w trybie mobilnym, jak i z włączoną „wersją na komputer"
  (viewport ~980 px, gdzie media query szerokości nie łapie).
- NAPIS LOGO: „Syg" w jaśniejszym złotym (#EBD9BE — delikatnie jaśniejszy, zauważalnie),
  „natura" w złotym (--zloty #C4A582); jednolita czcionka/wielkość/waga. Na stronie głównej
  i wszystkich podstronach (lewa kolumna przy sygnecie).
- Wszystkie strony ładują zasoby z ?v=287 (kolejne wymuszenie świeżych plików), stopki:
  „wersja 28.7".

Testy: HTML zbilansowany (16 stron), node --check OK, podgląd lokalny 200, sync docs OK,
Pages build OK (gh api: built | ae5b8be), fetch_page live OK; docs zawierają localStorage,
#EBD9BE i html.dotyk (potwierdzone grepowaniem kopii publikacyjnej).

## Sesja 28 — korekta 6 po oględzinach na komputerze (commit 84ca751, wersja 28.8)

Uwagi właściciela (przy komputerze): (1) strona wygląda jak podgląd dokumentu w WORD, nie
pełnowymiarowa strona — bloki mają WYPEŁNIAĆ CAŁĄ SZEROKOŚĆ niezależnie od urządzenia,
zlikwidować wolne przestrzenie po bokach; ramka dookoła max 20 px (to samo góra i dół);
(2) NIEDOPUSZCZALNE wewnętrzne przewijane okno — okno dopasowuje się do zawartości strony,
a przy scrollowaniu w dół boczne menu/logo i górny pasek (koszyk|panel) jadą RAZEM ze scrollem;
stopka dopiero na samym dole (tam, gdzie kończy się blok treści); (3) czcionki i grafiki
większe o 1–2 rozmiary (osoby słabiej widzące), zachowując proporcje; menu może być szersze,
przyciski większe; (4) strona główna: slider 4 okien jak jest, „Jak działamy" ma zostać pod
sliderem i ładnie wypełniać całą stronę (nie wycentrowane i zmniejszone). Po akceptacji:
baza Google Sheets + uruchomienie skryptów.

WYKONANE (style.css + index.html):
- PEŁNA SZEROKOŚĆ: usunięte max-width:1500px + centrowanie (z .page/.strona-uklad i .topbar .wrap).
  Bloki rozciągają się na całą szerokość okna; ramka zewnętrzna clamp(8px,1.5vw,20px) dookoła
  (max 20 px, góra/dół tak samo). Wewnętrzne odstępy treści: clamp(16px,2.5vw,32px).
- KONIEC Z WEWNĘTRZNYM OKNEM: usunięte max-height:100vh, overflow:hidden i overflow-y:auto
  z kontenerów i z main.wrap/.main (wraz ze scrollbarami). Strona ma naturalną wysokość treści,
  scrolluje się normalnie w przeglądarce, a boczne menu/logo i górny pasek przewijają się razem
  z treścią. Stopka na samym dole strony. Usunięta reguła body.ma-banner (była pod stary układ).
- CZCIONKI +1-2 px (proporcje zachowane): body 17px; topbar 14.5; brand-nazwa 32; menu 16.5
  (padding 13px 16px); h1 clamp(30,4.6vw,46); tytuł strony clamp(28,3.4vw,42); lead/sub/mala/
  powrot +1; .btn 14px (padding 13px 30px); kafle hub 21/15.5; karty 18/14.5/17; licznik 40x42;
  formularze (label 14, input 17, etyk 16.5); rachunek 16 (razem 26); tabela 15.5; stopka 15.5;
  regulamin 16/20; slider h2 clamp(28,3.8vw,50), p +1, sl-btn 13.5, mini-karty 60px; „Jak
  działamy": h2 24, pod 15.5, krok b 17.5, p 15, CTA 14px (padding 15px 32px).
- GRAFIKI większe: sygnet w kwadracie 136px (obraz 88px; w media 104/68), ikony szukaj/koszyk/
  panel 50px (svg 22), social 44px (svg 21), strzałki slidera 52px.
- MENU SZERSZE: lewa kolumna clamp(270px,18vw,340px) (media 761–1100: 250px).
- Wersja 28.8, zasoby ?v=288 (świeże pliki w przeglądarce).

Testy: HTML zbilansowany (16 stron), node --check OK, podgląd lokalny 17×200, sync docs OK,
Pages build OK (gh api: built | 84ca751), fetch_page live OK; docs bez max-height:100vh/
overflow-y:auto, z padding clamp(8px,1.5vw,20px) i side clamp(270px,18vw,340px).

## Sesja 28 — korekta 7: Royal Green + rozświetlony gradient menu (commit 6579d21, wersja 28.9)

Uwagi właściciela (po akceptacji korekty 6 — „zdecydowanie lepiej"): (1) nie podoba się
„złota poświata" pod napisem i logo; (2) butelkową zieleń zamienić na akcent ROYAL GREEN
(referencja: abstrakcyjne zielone tło Canva) — ładne rozświetlenie podkreślające gradient
jako tło lewego słupka MENU (wyróżnik strony); (3) slider z obrazkami na stronie głównej jest
wyjustowany do lewej i nie wypełnia całej szerokości treści.

WYKONANE:
- ROYAL GREEN: zmienna --butelkowa = #0F6B3D (królewska szmaragdowa zieleń) — automatycznie
  przechodzi na przyciski, przycisk szukajki, stopkę, pasek koszyka, nagłówki tabel, focus-ringi
  (rgba(15,107,61,.15)), przyciemnienie splashu i tło slajdu „Aktualności" (gradient
  #0F6B3D→#6B4530).
- TŁO MENU (lewy słupek): rozświetlony gradient w klimacie referencji Canva —
  radialna jasna poświata u góry po lewej (rgba(122,205,158,.30)), drugi radial u góry po prawej
  (rgba(18,96,52,.55)) + pionowy gradient #11753F → #0C5A31 → #073B20 → #052A16. Ta sama
  definicja w index.html i style.css (spójność podstron).
- ZŁOTA POŚWIATA: usunięta pulsująca animacja kwadratu logo (@keyframes kwadrat z złotym
  box-shadowem) — zostaje statyczny, dyskretny cień 0 12px 26px rgba(0,0,0,.28). Napis
  „Sygnatura" (Syg jasniejsze złoto / natura złoto) bez zmian.
- SLIDER PEŁNA SZEROKOŚĆ: usunięte max-width:640px z akapitu slajdu i max-width:760px
  z mini-kart — treść slajdów rozciąga się na całą szerokość okna slajdu (.sl-karty width:100%).
- Wersja 28.9, zasoby ?v=289.

Testy: HTML zbilansowany (16 stron), node --check OK, sync docs OK, Pages build OK
(gh api: built | 6579d21), fetch_page live OK; docs: #0F6B3D, radial gradient w .side,
brak animacji kwadrat i max-width w sliderze (potwierdzone grepowaniem).

## Sesja 28 — korekta 8 (commit 00aa646, wersja 28.10)

Uwagi właściciela: (1) wyszukiwanie działa, ale okno jest ZDUBLOWANE — zostaje tylko górne;
(2) nad wynikami komunikat z poprawną odmianą: „Znaleziono X wyników odpowiadający(ych) hasłu: Y"
(np. „Znaleziono 1 wynik odpowiadający hasłu: Szopka"); (3) admin.html wchodzi do panelu BEZ
logowania — logowanie ma być WYMUSZANE co najmniej po każdym zamknięciu strony; panel zostaje
pod adresem /admin (mniej intuicyjny = bezpieczniejszy niż pod ikoną konta); (4) usunąć
„pracownia: woj. mazowieckie" (jesteśmy z Poznania; zasięg ogólnopolski, wynajem Poznań i okolice);
(5) formularz zakupów: brak opcji dostawy — dodać InPost paczkomat/kurier z cenami wg rozmiarów
paczek (cennik dostawców) + miejsce na wskazanie paczkomatu; (6) Royal Green za jasny — wrócić
do butelkowej z minimalistycznym (nierozświetlającym) gradientem; UJEDNOLICIĆ menu na wszystkich
stronach (część miała stary kolor); (7) logo za małe — ma WYPEŁNIAĆ SZEROKOŚĆ menu (kwadrat);
(8) pasek wyszukiwarki / koszyk / profil klienta — większe.

WYKONANE:
- SZUKANIE: z szukaj.html usunięte drugie okno wyszukiwania (zostało tylko górne w nagłówku).
  Nad wynikami komunikat z odmianą: 1 → „Znaleziono 1 wynik odpowiadający hasłu: X",
  2–4 → „…X wyniki odpowiadające hasłu…", 5+ → „…X wyników odpowiadających hasłu…",
  0 → „Nie znaleziono żadnych wyników odpowiadających hasłu: X" (hasło w oryginalnej pisowni).
- ADMIN: logowanie WYMUSZANE — sesja w sessionStorage ('syg-admin'), więc po zamknięciu
  przeglądarki/karty znów wymagany login+hasło. Tryb demo sprawdza dane z config.js
  (SYG.ADMIN_DEMO_LOGIN='admin', SYG.ADMIN_DEMO_HASLO — do zmiany w config.js; działa tylko
  do wdrożenia API). Po wdrożeniu API logowanie sprawdzi akcja 'admin-login' w Google Apps Script
  (baza administratorów w arkuszu). Przycisk „Wyloguj" czyści sesję. Panel dalej pod /admin
  (zgodnie z decyzją właściciela — bezpieczniej niż pod ikoną konta).
- USUNIĘTE „pracownia: woj. mazowieckie" (lewa kolumna, wszystkie strony). Odbiór osobisty
  opisany jako „Poznań i okolice".
- DOSTAWA W FORMULARZU (dane.html): Odbiór osobisty (0 zł) / Paczkomat InPost / Kurier.
  Cennik wg rozmiarów paczek S/M/L w config.js (SYG.DOSTAWA — stawki startowe:
  paczkomat 15.99/18.99/21.99, kurier 18.99/21.99/24.99; do aktualizacji wg cenników
  dostawców). Domyślny rozmiar sugerowany wg liczby sztuk (1→S, 2–4→M, 5+→L). Pole na
  wskazanie paczkomatu (miasto + oznaczenie) i adres kuriera; walidacja wymaga tych pól.
  Podsumowanie: pozycja „Dostawa" w rachunku (nazwa metody + rozmiar + cena), dostawa wliczona
  do RAZEM i do kwot wysyłanych do zamówienia; dane klienta pokazują paczkomat/adres.
  (Docelowo: widget wyboru paczkomatu InPost zamiast pola tekstowego.)
- KOLORY: powrót butelkowej #1F3A32 (zmienna --butelkowa) + minimalistyczny gradient lewego
  słupka: jedna subtelna poświata u góry (rgba(63,105,85,.34)) + pionowy gradient
  #26493C→#1F3A32→#162B24. Identyczny w index.html i style.css — WSZYSTKIE strony mają teraz
  jednakowe menu (stare różnice wynikały z cache — zasoby z ?v=290 wymuszają świeże pliki).
- LOGO: .brand-kwadrat wypełnia SZEROKOŚĆ kolumny menu (width:100%; aspect-ratio 1/1 —
  kwadrat), sygnet 64% boku. Na telefonach/tabletach logo 200px.
- PASEK HEAD większy: wyszukiwarka (input 18px, padding 14px 18px, przycisk 56px), ikony
  koszyka/konta 56px (svg 24px), tło head-gora z większym paddingiem (16px 18px).
- Wersja 28.10, zasoby ?v=290.

Testy: HTML zbilansowany (16 stron), node --check OK, podgląd lokalny 7×200, sync docs OK,
Pages build OK (gh api: built | 00aa646), fetch_page live: szukaj.html?q=Szopka pokazuje
„Znaleziono 1 wynik odpowiadający hasłu: Szopka" (bez drugiej wyszukiwarki), admin.html zaczyna
się od ekranu logowania.

## Sesja 28 — korekta 9: układ 4 segmentów A/B/C/D (commity 2e70c54 + 349f2a8, wersja 28.11)

Uwagi właściciela (screenshoty): (1) podział okna na 4 segmenty — A: LOGO tylko logo i nazwa
SYGNATURA; B: u góry czarny pasek kontakt (tel+mail większe/czytelniejsze, do lewej; w tej samej
linii do prawej „Znajdź nas na:" + miniatury Pinterest, YouTube, Instagram, Facebook), pod spodem
wyszukiwarka do lewej + po prawej przycisk KOSZYK (podpisany) i PANEL UŻYTKOWNIKA z miniaturką;
C: menu jak było (przyciski jeden pod drugim z animacjami), usunąć wszystko pod przyciskami;
D: main z treściami — slider NIE rozciągnięty do szerokości okna (margines max 20px z obu stron
boxa), reszta wyjustowana do góry i do szerokości strony; stopka bez zmian. (2) Odzyskiwanie
hasła MUSI być automatyczne (niedopuszczalny tekst „napisz do nas"), dodać podgląd hasła (oko).
(3) Panel admina nie ma zakładek do zmiany rzeczy na stronie (jak wcześniej). (4) Kolory OK,
ale brakuje akcentu odcinającego sekcje — pionowy brązowo-złoty pasek oddzielający A+C od B+D,
max 10px, jak drewniana rameczka inkrustowana złotem — zaproponować.

WYKONANE:
- UKŁAD A/B/C/D (index.html + main.js + style.css): lewa kolumna = A (logo+SYGNATURA) + C (menu,
  nic pod przyciskami — sociale usunięte stamtąd). Prawa kolumna = B (head): czarny pasek
  .head-kontakt (tel+mail 15.5px do lewej | „Znajdź nas na:" + 4 mini ikony social do prawej),
  pod nim .head-gora: wyszukiwarka do lewej (pełna dostępna szerokość) + dwa podpisane przyciski:
  KOSZYK (z licznikiem .kropka) i PANEL UŻYTKOWNIKA (ikona osoby) — wys. 56px, do prawej.
  Tytuł strony pod spodem (bez zmian). D = main z paddingiem clamp(12px,1.5vw,20px) — slider
  i treść z marginesem max 20px z obu stron. Stopka bez zmian.
- LISTWA (propozycja właściciela): pionowy pasek 10px między kolumnami — drewniana rameczka
  inkrustowana złotem: poziome słoje (repeating-linear-gradient brązu) + pionowy gradient
   #7A5338→#C4A582→#6B4530→#C4A582→#7A5338 + złota obwódka (inset 1px). Na mobile/dotyku ukryta.
- KONTO (konto.html): przycisk „oko" podglądu hasła (logowanie i nowe hasło); link
  „Nie pamiętasz hasła?" otwiera formularz odzyskiwania: e-mail → SYG.wezwij('haslo-reset')
  (tryb demo: symulacja komunikatu; automat wyśle link po wdrożeniu silnika + Gmaila).
  Wejście z linku konto.html?reset=TOKEN otwiera „Ustaw nowe hasło" (walidacja min. 8 znaków,
  powtórzenie) → SYG.wezwij('haslo-ustaw'). Logowanie → 'konto-login' (sesja klienta syg-konto).
- ADMIN: ZAKŁADKI (jak wcześniej): Zamówienia | Wiadomości | Produkty | Ustawienia.
  Produkty: tabela całego katalogu — edycja ceny + przełącznik „widoczny" + Zapisz
  (demo: localStorage 'syg-admin-produkty', nadpisania nanoszone NA ŻYWO na katalog — od razu
  widać w sklepie; po wdrożeniu: akcja 'produkty-zapisz'). Ustawienia: cennik dostawy
  (paczkomat/kurier S/M/L) z zapisem (demo: 'syg-admin-dostawa' + SYG.ustawieniaDostawa() —
  formularz zamówienia używa nowych stawek od razu; po wdrożeniu: 'ustawienia-dostawa-zapisz').
- api.js: nowe akcje demo 'produkty-zapisz' i 'ustawienia-dostawa-zapisz', SYG.ustawieniaDostawa(),
  nanoszenie nadpisań produktów na SYG_KATALOG. dane.html używa SYG.ustawieniaDostawa().
- Wersja 28.11, zasoby ?v=291.

Testy: HTML zbilansowany (16 stron), node --check OK, podgląd lokalny 7×200, sync docs OK,
Pages build OK (gh api: built | 349f2a8), fetch_page live: konto.html ma oko + automat
odzyskiwania, admin.html ma 4 zakładki, pasek kontakt + „Znajdź nas na:" i podpisane
KOSZYK / PANEL UŻYTKOWNIKA.

## Sesja 28 — korekta 10: ścieżki A/B + koszyk-tabela + slider (commit 1126e46, wersja 28.12)

Uwagi właściciela (5 screenshotów): (1) slider na stronie głównej dalej nie rozciągnięty do
szerokości okna D i nie przewija się sam — „strona musi żyć"; (2) ZAMÓWIENIA: „Zarezerwuj termin"
przekierowuje do formularza kontaktowego — ma być kalendarz z wyborem pakietów + progress bar
1-2-3 jak ustalono; (3) PERSONALIZACJA tak samo — katalog produktów + progress bar (jak było
w wersji PythonAnywhere); (4) KOSZYK: ma być ładna, przejrzysta TABELA z nagłówkami kolumn
(bez nachodzących napisów i okien +/−); opcje dostawy w blokach (ramka + nagłówek), checkboxy
z ceną; kategoryzacja produktów wg wielkości → automatyczny dobór rozmiaru paczki (nie można
kupić 10 szopek i wybrać paczkę S); testowo: S = 1–3 prod., M = 4–6, L = 7–10, powyżej 10 =
tylko kurier; pole paczkomatu + opcja „Znajdź na mapie" (link/nowe okno do wyszukiwarki InPost);
komunikaty przy blokowaniu małych paczek; (5) pionowy pasek OK — taki sam dodać nad footerem
na całą szerokość; (6) symbol przy logowaniu (drugi obok oka = 🙈) mylący — zostawić samo oko;
(7) slider dalej nie powiększony do szerokości okna D.

WYKONANE:
- SLIDER: .main bez bocznych paddingów (slider rozciąga się na CAŁĄ szerokość okna D; margines
  tylko zewnętrzny .page = max 20px — wcześniej był podwójny: page+main, razem ~40px).
  Autoplay przyspieszony do 4,5 s (pauza na hover, strzałki, kropki, swipe — było, działa).
  Spójne paddingi .head/.cta/.head-kontakt: clamp(12px,1.5vw,20px).
- WYNAJEM (nowa strona www/wynajem.html, ścieżka A): krok 1/3 — kalendarz (input date, min.
  jutro — montaż dzień przed) + godzina + rodzaj wydarzenia (select) + PAKIETY (12 pakietów
  ESENCJA/MID/FULL z poprzedniej wersji serwisu: komunijny/weselny/firmowy/jubileuszowy —
  karty radio z nazwą, opisem, składem i ceną „od X zł / doba") + progress bar (Termin i pakiet →
  Dane → Podsumowanie) + walidacja + kaucja 300 zł. Zapis do koszyka: k.typ='wynajem',
  k.pakiet, k.termin → dane.html → podsumowanie (wiersz pakietu z terminem w rachunku,
  kaucja w podsumowaniu) → dziekuje. Kafle w zamowienia.html linkują do wynajem.html.
- PERSONALIZACJA (nowa www/personalizacja.html, ścieżka B): krok 1/3 — katalog produktów
  personalizowanych (7 pozycji z poprzedniej wersji), checkbox + obowiązkowy opis „co ma być
  wygrawerowane", adnotacja min. 2 tygodnie, rabat 5% od 3 pers., progress bar (Personalizacja →
  Dane → Podsumowanie). POMYSŁ WŁASNY (sesja 18): bez wybranego produktu nie przejdzie dalej —
  modal z cytowanym opisem i przyciskami „Chcę wysłać zapytanie" (→ kontakt.html?temat=
  Zapytanie o projekt spersonalizowany&opis=…) oraz „Anuluj". Pers[] dopisywane do koszyka.
- KOSZYK (przebudowa): blok „Koszyk" — czytelna tabela z NAGŁÓWKAMI (Lp. | Produkt ze
  zdjęciem | Cena jedn. | Ilość −/+ | Wartość | usuń), personalizacje, rabat, pomysł, dostawa
  i wiersz RAZEM; blok „Opcje dostawy" — opcje w ramkach (Odbiór osobisty 0 zł / Paczkomat
  InPost / Kurier) z ceną, AUTOMATYCZNY dobór rozmiaru paczki wg liczby produktów
  (S ≤3, M ≤6, L ≤10; >10 → paczkomat zablokowany + komunikat „tylko kurier"), zapisany wybór
  korygowany przy zmianie ilości; pole paczkomatu + przycisk „Znajdź paczkomat na mapie →"
  (link inpost.pl/znajdz-paczkomat, nowe okno); adres przy kurierze; dostawa wliczona w RAZEM
  i zapisana w k.dostawa. Dane dostawy PRZENIESIONE z dane.html do koszyka (dane.html = tylko
  dane osobowe + zgody); podsumowanie czyta k.dostawa; wynajem pomija blok dostawy.
- WSTĄŻKA NAD STOPKĄ: pozioma 10px (te same słoje + gradient brąz→złoto + złota obwódka) na
  całej szerokości — na stronie głównej i wszystkich podstronach (main.js).
- OKO przy haśle: usunięty 🙈 — teraz zawsze 👁, stan „widoczne" = podświetlenie przycisku
  (.btn.aktywne); oko dodane też do hasła w panelu admina.
- Wersja 28.12, zasoby ?v=292 (18 stron).

Testy: HTML zbilansowany (18 stron), node --check OK, podgląd lokalny 9×200, sync docs OK,
Pages build OK (gh api: built | 1126e46), fetch_page live: wynajem.html (kalendarz + 3 pakiety
weselne + progress), personalizacja.html (katalog 7 pozycji + pomysł własny + progress).

## Sesja 28 — korekta 11: BLOG (wpisy-realizacje) + podstrony z panelu (commit cbb0ec9, wersja 28.13)

Uwagi właściciela: (1) NASZE REALIZACJE to tylko kafelki — w menu admina ma być zakładka BLOG
z dodawaniem wpisów jak na blogu; kafelki muszą być ODNOŚNIKAMI do strony wpisu (więcej zdjęć,
zdjęcia z pracowni, opis wykonania/malowania/pracochłonności); (2) edytor tekstu „jak posty na
forach PHP" żeby żona mogła formatować tekst przy wpisywaniu; (3) wgrywanie zdjęć (max 10),
miejsce na film (link YT), znacznik przy zdjęciu głównym; (4) przy produkcie: „Podoba Ci się ten
projekt?" + DODAJ DO KOSZYKA oraz „chcesz otrzymać produkt w wersji spersonalizowanej?" +
ZAMÓW JUŻ DZIŚ! z przekierowaniem do personalizacji z odniesieniem do produktu; (5) wpis =
jednocześnie opis produktu w sklepie (checkbox „dodaj do sklepu" → pozycja w zakładce Produkty
z ceną/gabarytami/technikaliami) — każdy produkt ma historię na bloga/socialmedia/YT;
(6) w panelu opcja definiowania podstron i dodawania podstron z nowym przyciskiem w MENU;
(7) PRACOWNIA („o nas") z prostym edytorem — jak sformatowane w panelu, tak wyświetlane
statycznie; (8) sklep: produkty „bez historii" (np. papierowe winietki); (9) przy produktach
personalizowanych zgoda zamawiającego na wykorzystanie projektu marketingowo (wpis na blogu,
social media) — istotny element; (10) złote paseczki 2–3 px: po lewej i prawej strony pionowej
listwy oraz u góry i u dołu poziomej listwy nad stopką.

WYKONANE:
- ZAKŁADKA BLOG w panelu (admin.html): lista wpisów (data/tytuł/kategoria/sklep + Podgląd,
  Edytuj, Usuń) + formularz wpisu: tytuł, kategoria (datalist), data, zajawka, ZDJĘCIA max 10
  (wgranie plików + podgląd miniatur + radio „główne" + usuwanie), film YouTube, EDYTOR TEKSTU
  (assets/editor.js: B/I/U, H2/H3, listy, cytat, link, wstawianie obrazu z pliku i ze schowka,
  wstawianie filmu YT — contenteditable + ukryte pole HTML, dokładnie jak posty na forach),
  checkbox „dodaj do sklepu" + nazwa/cena/gabaryt + „połącz z produktem" (albo nowy produkt).
  Zapis: akcja demo `blog-zapisz` (api.js) — syncProdukt(): istniejący produkt aktualizowany
  (cena, nazwa, gabaryt, storyId) albo tworzony nowy i doczepiany do katalogu (sklep widzi go
  od razu); wpis ma badge „dostępny w sklepie".
- REALIZACJE = blog: realizacje.html i blog.html renderują kafle-ODNOŚNIKI (blog.js) z filtrem
  kategorii; blog-wpis.html to strona wpisu: okładka + miniatury (lightbox ze strzałkami i
  klawiaturą), film YT, sformatowana treść, blok „Podoba Ci się ten projekt?" z DODAJ DO
  KOSZYKA (dodaje do koszyka i przenosi) i ZAMÓW JUŻ DZIŚ! → personalizacja.html?produkt=…
  (prefill pola pomysłu: „Chcę spersonalizowaną wersję produktu: …").
- PODSTRONY (zakładka w adminie): lista + formularz (slug, tytuł, pokaż w menu, kolejność,
  edytor treści). MENU (lewe, na wszystkich stronach) buduje się dynamicznie: pozycje stałe +
  podstrony z panelu (main.js ladujPozycjeMenu); nowe podstrony dostają własny adres
  podstrona.html?s=slug i przycisk w menu oraz link w stopce. PRACOWNIA edytowalna z panelu
  (seed treści domyślnej; pracownia.html ładuje zapisaną treść).
- SKLEP: produkt „bez historii" — przycisk „+ Produkt bez historii" w zakładce Produkty
  (nazwa, cena, opis, zdjęcie) — akcja demo `produkt-nowy`; produkty z wpisów mają w tabeli
  link „historia →" (blog-wpis.html?id=…).
- ZGODA MARKETINGOWA w personalizacji (checkbox + zapis k.zgoda w zamówieniu i wysyłka do
  panelu; prefill z ?produkt=).
- ZŁOTE PASECZKI 2 px: listwa pionowa (lewa+prawa krawędź #C9AE85) i listwa nad stopką
  (góra+dół) — index.html, style.css (podstrony), main.js (szkielet).
- Wersja 28.13, zasoby ?v=293 (21 stron).
- Uwaga git: po resecie sandboxa lokalna historia zaczynała od starego 2284074 — naprawa
  procedurą fetch+reset do FETCH_HEAD + checkout commit -- www docs; push cbb0ec9 czysty.

Testy: HTML zbilansowany (21 stron), node --check OK, test API w Node (blog-lista 3 wpisy,
blog-pobierz, blog-zapisz nowy → produkt w katalogu ze storyId, aktualizacja szopki cena 269,
produkt-nowy, strona-zapisz/usun) OK, podgląd lokalny 10×200, sync docs, Pages built | cbb0ec9,
fetch_page live: blog.html (3 kafle-odnośniki + filtr + badge), blog-wpis.html?id=1 (okładka,
blok projektu z DODAJ DO KOSZYKA / ZAMÓW JUŻ DZIŚ!, treść z listą), admin.html (6 zakładek:
Zamówienia/Wiadomości/Blog/Produkty/Podstrony/Ustawienia + edytor z paskiem B I U H2 H3 listy
cytat link obraz film), personalizacja.html?produkt=Szopka (blok zgody marketingowej).
## Sesja 28 — korekta 12: WYNAJEM W 5 KROKACH + kafelki personalizacji (commit da721d1, wersja 28.14)

Uwagi właściciela (3 screeny): (1) wynajem miał być w 5 KROKACH, a nie „wszystko w jednym
miejscu": K1 TERMIN — widok KALENDARZA (macierz dni, widok miesiąca, przewijanie przód/tył)
z danymi o wolnych terminach NA ŻYWO — jak na screenie z wersji PythonAnywhere; BEZ godziny
(„kto kazał wstawiać godzinę!?"); K2 wybór PAKIETU — dopiero tu; niedostępne pakiety
wyszarzone z zielonym (butelkowym) napisem „NIEDOSTĘPNY" przez środek + adnotacja nad pakietami
„KTÓRYŚ PAKIET JEST NIEDOSTĘPNY? ZMIEŃ TERMIN ABY SPRAWDZIĆ JEGO DOSTĘPNOŚĆ"; K3
PERSONALIZACJA — opcjonalna, do pominięcia; K4 formularz danych („już to mieliśmy ładnie
ubrane, ale coś rozwaliłeś — napraw!"); K5 podsumowanie + przycisk zamów. (2) Personalizacja:
KLIENT KUPUJE OCZAMI — kafelki 3 w rzędzie (zdjęcie/podpis/cena + checkbox), po zaznaczeniu
pole treści personalizacji (maks. 200 znaków); nic nie wybrano → komunikat „wybierz produkt do
personalizacji"; poniżej 10 znaków w polu → nie można przejść dalej. (3) Usunąć zapis zgód
(checkboxy) — adnotacja, że składając zamówienie klient akceptuje regulamin i wyraża zgodę na
kontakt. (4) Podsumowanie: ZMIEŃ DANE jako duży butelkowy przycisk; usunąć „Krok 3 z 3"
(cyfry nie pasują stylem; jest progress bar); pod podsumowaniem dobrze widoczne „ADNOTACJE DO
ZAMÓWIENIA" (bold) + kursywą treści — wybrzmieć min. 2 tyg. na personalizacje + opcja EXPRESS
płatna z góry po wcześniejszym kontakcie; kolor wyraźny (pomarańczowy); sekcja danych jak
„Etykieta pocztowa" (imię i nazwisko, adres, telefon, paczkomat jeśli wybrano) — większa
czcionka, bo się zlewa.

WYKONANE:
- WYNAJEM = 5 kroków na jednej stronie (wynajem.html, sekcje #krok-1..5 + progress bar
  5 etapów): K1 TERMIN — kalendarz-macierz miesiąca (pon–nie, przewijanie ‹ ›, min. bieżący
  miesiąc, maks. +12 mies.), dni wolne/wybrane/zajęte (przekreślone) + legenda + podsumowanie
  wyboru; zajętości NA ŻYWO: akcja demo `terminy-zajete` (hash deterministyczny ~20% dni +
  terminy z zamówień demo nieodrzuconych). K2 PAKIET — karty pakietów dla wybranego rodzaju
  wydarzenia; dostępność per pakiet+termin (akcja `pakiet-dostepny`; konflikt z zamówieniami
  demo); niedostępne: wyszarzone + grayscale + zielony napis NIEDOSTĘPNY przez środek +
  stała adnotacja nad pakietami; zmiana terminu sprawdza zapisany pakiet (jeśli znika —
  komunikat i wyczyszczenie wyboru). K3 PERSONALIZACJA opcjonalna — kafelki pers.js, „dalej"
  przechodzi też bez wyboru. K4 DANE — imię/nazwisko, e-mail, telefon, sygnatura (bez zgód;
  adnotacja o regulaminie i zgodzie na kontakt pod formularzem). K5 PODSUMOWANIE — rachunek
  (pakiet z terminem, personalizacje, rabat, kaucja, razem), dane klienta, ADNOTACJE DO
  ZAMÓWIENIA (pomarańczowy blok, bold nagłówek, kursywa; min. 2 tyg. + EXPRESS płatny z góry
  po kontakcie; regulamin+zgoda) + duży ZMIEŃ DANE i ZAMÓW → `zamowienie` z pakiet/termin/
  zgoda → dziekuje. Godzina USUNIĘTA z terminu.
- PERSONALIZACJA (personalizacja.html + wspólne assets/pers.js): kafelki 3 w rzędzie (2 na
  tabletach, 1 na telefonie) — zdjęcie, nazwa, opis, cena, checkbox; po zaznaczeniu pole
  treści max 200 znaków z licznikiem; walidacja: brak wyboru → „Wybierz produkt do
  personalizacji", opis < 10 znaków → komunikat; zdjęcia produktów pers-*.jpg wygenerowane.
- KOSZYK/DANE: dane.html bez checkboxów zgód (adnotacja o regulaminie+zgodzie), guard
  wynajmu (wynajem ma własny krok 4), powrót dynamiczny (personalizacja→personalizacja.html).
- PODSUMOWANIE (sklep/personalizacja): bez „Krok 3 z 3"; duże przyciski ZMIEŃ DANE
  (butelkowy) + ZAMÓW Z OBOWIĄZKIEM ZAPŁATY; blok ADNOTACJE DO ZAMÓWIENIA (pomarańczowy
  #C96F1A/#FDF3E4); dane klienta jako etykieta pocztowa (wiersze: Imię i nazwisko / E-mail /
  Telefon / Adres / Paczkomat / Dostawa / Sygnatura, 17 px).
- Wersja 28.14, zasoby ?v=294 (21 stron); CSS: .krok/.krok-nr, .kalendarz-*,
  .pakiet-karta(.niedostepny/.pk-niedostepny), #pers-kafelki/.pers-kafel, .adnotacje,
  .btn.duzy, .etykieta-wiersz.

Testy: HTML zbilansowany (21 stron), node --check OK, test API Node: terminy-zajete
(wrzesień 2026: 5 dni zajętych), pakiet-dostepny (2/12 niedostępne w 2026-09-01; po
zamówieniu demo pakiet i termin blokują się — konflikt), podgląd lokalny 5×200, sync docs,
Pages built | da721d1, fetch_page live: wynajem.html (kalendarz WRZESIEŃ 2026 + 5 kroków +
adnotacja NIEDOSTĘPNY + ADNOTACJE DO ZAMÓWIENIA + ZMIEŃ DANE/ZAMÓW),
personalizacja.html (kafelki ze zdjęciami + pola 0/200).
## Sesja 28 — korekta 13: slider, menu, pasek koszyka, tabela (commity 547d20c + d21039f, wersja 28.15)

Uwagi właściciela: (1) slider na stronie głównej DALEJ „do lewej" — powiększyć na całą
szerokość albo wyśrodkować; (2) „nie wiem co stało się ze starym progress barem — dodałeś
zbędne ozdobniki, o co nikt nie prosił — przywróć poprzednią wersję"; (3) menu: DWA przyciski
PRACOWNIA podświetlone naraz i pod każdym CO INNEGO — naprawić bezwzględnie; (4) cyferka przy
koszyku za mała/nieczytelna; (5) brak przypiętego paska koszyka na dole (koszyk+suma+przejdź
do koszyka), który dawniej pojawiał się automatycznie; (6) koszyk: tabela bez pionowych kresek,
rozjeżdżający się skład, braki nagłówków kolumn, rozciągnięte +/−, X bez podpisu — „TO MA BYĆ
TABELA: pionowe i poziome pasy 1px przecinające się pod kątem prostym"; (7) „klikam przejdź do
danych a otwiera się kalendarz wynajmu" (w koszyku).

WYKONANE:
- SLIDER — przyczyna znaleziona: na stronie głównej data/katalog.js ładował się PO skrypcie
  mini-kart, więc slajdy Nowości/Bestsellery renderowały się BEZ kart produktów (pusto,
  „ściśnięte" do lewej). Kolejność skryptów naprawiona (katalog przed mini-kartami — karty
  wróciły do slajdów). Dodatkowo: .srodek{flex-wrap:nowrap;width:100%},
  .main{width:100%}, .slider{width:100%;max-width:none;margin:0 auto} + karty-placeholdery
  „Wkrótce" (gdy mniej niż 3 produkty — slajd zawsze wygląda na wypełniony).
- PROGRESS BAR: usunięte ozdobniki (kółka z numerami .krok-nr przy nagłówkach kroków
  wynajmu) — nagłówki wróciły do prostego stylu „1. Termin — …"; pasek postępu bez zmian
  (był i jest ten sam).
- MENU: usunięty duplikat PRACOWNIA — podstrony z panelu NIE dublują pozycji z menu stałego
  (wykluczenie slug „pracownia" w menu, stopce i .foot-podstrony); PRACOWNIA pozostaje
  edytowalna z panelu, ale ma jeden przycisk (pracownia.html).
- KROPKA przy koszyku: powiększona (27×27 px, font 15 px) na wszystkich stronach.
- GLOBALNY PASEK KOSZYKA: koszyk.js tworzy przypięty pasek na dole KAŻDEJ strony, gdy koszyk
  niepusty: „W koszyku: N szt. produktów (+ M personalizacja)" + SUMA + „Przejdź do koszyka →"
  (ukrywany tylko na stronie koszyka); pozycje koszyka zapamiętują teraz nazwę i cenę w chwili
  dodania (sklep + blog z metadanymi), więc suma liczy się na każdej stronie; usunięty
  statyczny pasek ze sklepu (był zdublowany).
- TABELA KOSZYKA: prawdziwa krata — brązowe linie 1px pionowe i poziome na wszystkich
  komórkach (th/td), colgroup z szerokościami kolumn, table-layout:fixed, naprzemienne tło
  wierszy, NAGŁÓWEK kolumny „Usuń", tytuł na X („Usuń produkt z koszyka"), zwarty licznik
  +/− (34×36 px, bez rozciągania), zawijanie długich nazw.
- „PRZEJDŹ DO DANYCH" NIE OTWIERA KALENDARZA: guardy dane.html/podsumowanie.html
  przekierowują do wynajmu TYLKO przy czystym wynajmie (bez produktów/personalizacji);
  koszyk przy samym wynajmie pokazuje „Kontynuuj wynajem →" zamiast „Przejdź do danych";
  dodanie produktu do koszyka porzuca niedokończony wynajem (typ=sklep, pakiet=null) —
  ścieżki już się nie mieszają.
- Wersja 28.15, zasoby ?v=295.

Testy: HTML zbilansowany (21 stron), node --check OK, test koszyk.js w Node (dodawanie z
katalogu i z bloga z metadanymi, suma z rabatem pers, reset typu wynajem→sklep), sync docs,
Pages built | d21039f, fetch_page live: strona główna (karty produktów w slajdach Nowości/
Bestsellery WIDOCZNE), koszyk.html (pusty koszyk + opcje dostawy), sklep.html (katalog 4
produktów). Uwaga: sandbox resetuje lokalną historię git — po resecie: fetch + reset do
FETCH_HEAD + checkout commita -- www docs + commit + push.
NASTĘPNY KROK: akceptacja; potem BAZA GOOGLE SHEETS + skrypty Apps Script (akcje demo blog-*,
strona-*, produkt-nowy, terminy-zajete, pakiet-dostepny dostają lustra serwerowe; zamówienia,
maile, hasła/reset, logowania).
