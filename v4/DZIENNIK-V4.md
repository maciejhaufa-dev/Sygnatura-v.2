# DZIENNIK V4 — Studio Sygnatura

**Data:** 31.08.2026 (chat v4, sesja 1) · **Repo:** Sygnatura-v.2 · **Folder roboczy:** `/v4/`

> **Dla kolejnego chata:** przeczytaj najpierw TEN plik, potem `../PODSUMOWANIE-rozmowy-v1-v3.md` (kontekst historyczny), potem `../pracownia/` (dzienniki v1–v3). Historia pełnej rozmowy: `../Rozmowa Sygnatura v.1 - kontekst.docx`.

---

## 1. KOREKTY UŻYTKOWNIKA NA START V4 (nadpisują stare ustalenia!)

1. **Metryczki NIE są flagowcem.**
2. **Ceny są „z czapy"** — do ponownej weryfikacji z rynkiem (zadanie po stronie).
3. **Fokus teraz:** realizacja zadań z listy. **Bieżące zadanie = strona internetowa** (wizytówka firmy).
4. **Stan formalny:** domena wykupiona · poczta skonfigurowana · telefon wykupiony, **jeszcze NIEAKTYWNY** (nie publikować numeru!).
5. ⚠️ **Adres e-mail:** w wiadomości użytkownik napisał `kontakt@stufiosygnstura.pl` (literówka). Przyjęto `kontakt@studiosygnatura.pl` zgodnie z ustaloną w v3 domeną. **DO POTWIERDZENIA.**
6. **Nowa wersja strony = v4**, osobny folder `/v4/` w repo. `pracownia/www` (v3) to archiwum — nie ruszamy.
7. **Zasada:** materiały robocze = zdjęcia w `../uploads/`, logo = `../pracownia/logo/WEKTORY3/`, księga znaku = `../pracownia/logo/` (HTML z sekcjami).

---

## 2. SPECYFIKACJA STRONY V4 (uzgodniona z użytkownikiem)

### 2.1. Splash screen (3 sekundy, po wejściu w link)
- **Tło:** zamglony starodrzew (zdjęcie użytkownika — patrz §5!), pod delikatnym welonem butelkowej zieleni **10%** (rgba(31,58,50,.10)) + lekka winieta.
- **Centralnie wyłania się prostokąt:** kremowe tło, **wyraźna brązowa obwódka** 2 px (#6B4530), pojawia się ~0,25 s (scale+fade).
- **Logo:** sygnet z księgi znaku — „S" z listkami w okręgu (`SYGNET_okrag.svg`), unosi się ~0,5 s.
- **Pod spodem litery spadają pojedynczo** (stagger 0,07 s od ~0,8 s): napis **SYGNATURA** (litery z księgi znaku, kapitaliki). **„SYG" minimalnie, ale zauważalnie jaśniejsze** (opacity 0.6), **„NATURA" pełny brąz #6B4530**.
- Po 3,0 s fade-out 0,65 s → odsłania się strona. Splash gra **przy każdym wejściu** (per spec; opcjonalnie sessionStorage — §7 p.9).

### 2.2. Strona główna `index.html`
- **Góra:** kremowy pasek z ikonami **koszyk · konto · hamburger** (placeholdery „wkrótce"), POD nim menu na tle **butelkowej zieleni #1F3A32** ze **złotymi (#C4A582) wyboldowanymi napisami**: Start · Rzemiosło · Metryczki · Numery i szyldy · Wynajem · Współpraca · Dla firm · Kontakt. (Tylko Start i Kontakt mają cel; reszta `#` — do podpięcia podstron.)
- **Hero:** realne zdjęcie „Cześć" z ukosa, bez ramki — **za delikatnym kremowym woalem** (gradient rgba krem 0,80–0,86), wypełnia całą stronę (`min-height:100svh`, cover, center 42%). Obróbka łagodzi refleksy i brud ściany.
- **Plansza centralna** (prostokątna, półprzezroczysta kremowa, backdrop-blur 7 px, cienka brązowa obwódka) — **2 kolumny**:
  - **LEWA:** sygnet + pod nim logotyp **na szerokość logo** (zachowane proporcje księgi; SUM_AR = 10,19661) z podziałem intensywności Syg/Natura jw.
  - **PRAWA:** napisy wyłaniające się w **odstępach sekundowych** (3,5 / 4,5 / 5,5 s): **„Pasją" / „styl" / „tradycja"** — złote, ozdobna (kursywa szeryfowa) czcionka w rustykalnym klimacie. Potem **zdanie powitalne** (6,3 s) zachęcające do wejścia w świat i sprawdzenia oferty, a pod nim **dwa przyciski obok siebie na szerokość kolumny** (6,9 s): **[Zadaj pytanie]** → formularz kontaktowy (`kontakt.html`, stub z mailto), **[Nasze realizacje]** → zakładka sklepu (`sklep.html`, stub).
- **Footer** (butelkowa zieleń 94%, na dole pod hero): LEWO ikony social mediów + „Śledź nasze działania" · ŚRODEK „© Studio Sygnatura" + mały przycisk **„Regulamin serwisu"** · PRAWO **Kontakt / FAQ**.
- **Responsywność:** breakpointy 920 / 860 / 520 px; hamburger rozwija menu (mobile); jednostki `svh` z fallbackiem `vh`; `viewport-fit=cover`; obsługa `prefers-reduced-motion`.
- **DRAFT tekstów do akceptacji:** zdanie powitalne — „Zajrzyj do naszego świata, w którym drewno, światło i detal opowiadają Twoją historię — i zobacz, co możemy dla Ciebie stworzyć."
- **Uwaga typograficzna:** użytkownik zapisał napis jako „SYGnatura" (splash) / „Sygnatura" (hero), mieszana wielkość. **Przyjęto kapitaliki z księgi znaku (SYGNATURA)** + podział kolorów Syg/Natura — DO POTWIERDZENIA.

---

## 3. TECHNIKA

- **Build:** `/v4/build.py` — `python3 build.py` generuje `index.html`, `kontakt.html`, `sklep.html` (kolorowanie zdjęć, sprite logotypu, podmiana tokenów). Wymaga: pillow (instalacja w sandboxie: `pip install --break-system-packages pillow`).
- **Logotyp jako sprite:** litery wycinane z `pracownia/logo/WEKTORY3/LOGOTYP_3000px_BW.png` (dokładne litery z księgi znaku, zachowany oryginalny odstęp między literami), kolor #6B4530. Sprite: `assets/wordmark.png` (1632×160, 9 liter). Litery skalowane przez `calc(var(--lh) * --ar)` — spójne proporcje w każdym rozmiarze.
- **Czcionki:** **systemowe szeryfowe** (sandbox nie ma internetu → brak Google Fonts). Stack zaczyna się od `"Playfair Display","Cormorant Garamond"` — gdy będzie sieć, wystarczy dodać `<link>` Google Fonts (latin-ext) i nic więcej się nie zmienia.
- **Ikony:** inline SVG (koszyk, konto, hamburger, IG, FB, Pinterest).
- **Podgląd:** `python3 -m http.server 8080 --bind 0.0.0.0` w katalogu `/v4` (live preview sesji).
- **Walidacja w sesji:** tag balance ✓, brak tokenów @@ ✓, JS `node --check` ✓, 9+9 liter ✓, wszystkie zasoby HTTP 200 ✓.

### Kolory (z księgi znaku / ustaleń v3)
| Rola | Kolor |
|---|---|
| butelkowa zieleń | `#1F3A32` |
| brąz | `#6B4530` |
| złoto/kraft | `#C4A582` |
| krem | `#FBF7F0` |

---

## 4. STRUKTURA `/v4/`

```
v4/
├── build.py            # generator całej strony (uruchamiaj po każdej zmianie)
├── index.html          # strona główna: splash + hero + menu + footer (zbudowana)
├── kontakt.html        # stub formularza (mailto)
├── sklep.html          # stub sklepu/realizacji
├── DZIENNIK-V4.md      # ten plik
└── assets/
    ├── forest.jpg      # tło splasha — zamglony starodrzew (OBECNIE ZAMENNIK — patrz §5)
    ├── hero.jpg        # hero „Cześć" (obrobione IMG-20260826-WA0000.jpg)
    ├── hero-alt.jpg    # wariant (IMG_20260829_231012.jpg) do szybkiej podmiany
    ├── sygnet.svg      # S z listkami w okręgu (kopia z WEKTORY3)
    ├── favicon.svg     # to samo co sygnet
    └── wordmark.png    # sprite logotypu SYGNATURA (generowany przez build.py)
```

**Podmiana hero:** w `build.py` zamień ścieżkę w `process_photo(...)` (lub zamień plik `assets/hero.jpg`) → `python3 build.py`. W CSS tło hero to `.hero{background:...url('assets/hero.jpg')...}`.

---

## 5. ZDJĘCIA — WAŻNE INFORMACJE

1. **LAS (splash):** załącznik użytkownika `Green and White Atmospheric Forest Presentation_20260831_103357_0000.png` **NIE dotarł do sandboxa** (przeszukano cały dysk — pliku nie ma). **Wygenerowano zamiennik** `assets/forest.jpg` (1376×768, zamglony starodrzew, zielono-biały klimat). **Gdy użytkownik podeśle oryginał: nadpisz `assets/forest.jpg`** (najlepiej poziomy kadr, ~1920 px szer.) — nic więcej nie trzeba zmieniać.
2. **HERO („Cześć"):** użyto `../uploads/IMG-20260826-WA0000.jpg` (jedyne pewne zdjęcie szyldu „Cześć" w repo, 1600×1200; wg v3: szyld bez ramy, z odbiciem okna w rogu). Obróbka: balans bieli, miękka krzywa tonów, wygładzenie refleksów, kremowy woal w CSS maskuje tło/ścianę. **Wariant** `IMG_20260829_231012.jpg` obrobiony jako `assets/hero-alt.jpg`. **DO POTWIERDZENIA: które ujęcie to „Cześć z ukosa, bez ramki".**
3. Zdjęcia `IMG_20260828_*` i `IMG_20260829_*` (12 szt.) to najpewniej **mozaika „scrabble"** z wątku v3 — nie użyte w stronie.
4. Zrzuty ekranów Pinterest i pozostałe pliki w `../uploads/` — materiały z v3.

---

## 6. NIEDOKOŃCZONE WĄTKI Z V3 (otwarte, nie przepadły)

- **Podświetlane szyldy na wynajem** (reakcja na neonsens.pl, 360 zł/doba): użytkownik chce premium „light up signs", ~500 zł/doba, drewniane multitechniczne — wiadomość urwana w v3, pomysł żywy.
- **Mozaika drewniana „scrabble"** (imiona frezowane CNC + zdjęcia + napisy „Miłość, radość, wdzięczność") — „to też może być hit produktowy".
- Metryczka/numer/szopka/konfigurator — wg dzienników v3, ale **priorytety i ceny do rewizji** (korekty z §1).

---

## 7. TODO / DO USTALENIA

1. ☐ **Las** — użytkownik podeśle oryginalny plik → nadpisz `assets/forest.jpg`.
2. ☐ **Hero** — potwierdzić ujęcie (WA0000 vs 231012 vs inne).
3. ☐ **E-mail** — potwierdzić `kontakt@studiosygnatura.pl` (literówka w wiadomości).
4. ☐ **Menu** — podpiąć docelowe podstrony (Rzemiosło, Metryczki, Numery i szyldy, Wynajem, Współpraca, Dla firm).
5. ☐ **Przyciski** — „Zadaj pytanie" → docelowo formularz z klauzulą PKE (Formspree?), „Nasze realizacje" → sklep.
6. ☐ **Social media** — podać URL-e IG/FB/Pinterest.
7. ☐ **Koszyk / Konto / Regulamin / FAQ** — placeholdery do uzupełnienia.
8. ☐ **Telefon** — opublikować dopiero po aktywacji numeru.
9. ☐ **Splash** — czy grać przy każdym wejściu (obecnie TAK, per spec), czy raz na sesję (sessionStorage).
10. ☐ **Czcionki webowe** — Playfair Display + Cormorant Garamond (latin-ext) po uzyskaniu sieci.
11. ☐ **Ceny produktów** — pełna rewizja („z czapy").
12. ☐ **Wątki z §6** — szyldy świetlne na wynajem, mozaika scrabble.

---

## 8. ZASADY WSPÓŁPRACY (utrwalone)

- Wizualizacje AI = **koncepty**, nie pliki produkcyjne. Pliki produkcyjne = czyste wektory, zero tekstu/opisów/komentarzy.
- Zmiany strony: edytuj `build.py` → `python3 build.py` → odśwież podgląd.
- Po każdej sesji aktualizuj ten dziennik (statusy, decyzje, nowe ustalenia).
- Pilnuj rozmiaru workspace (limit ~128 MB) — sprzątaj odrzucone warianty.
- Użytkownik testuje na **telefonie (iPhone)** — responsywność i Safari to priorytet testów.

---

## 9. STATUS PO SESJI 1 (31.08.2026)

- [x] Struktura `/v4`, build.py, `index.html` (splash + hero + menu + footer), stuby `kontakt.html` i `sklep.html`
- [x] Sprite logotypu z księgi znaku (9 liter, podział Syg/Natura)
- [x] Obróbka hero „Cześć" + wariant alternatywny
- [x] Zamiennik lasu (oryginał nie dotarł)
- [x] Serwer podglądu (port 8080, live preview)
- [ ] **Czeka:** test użytkownika na telefonie → akceptacja / uwagi żony → iteracja
