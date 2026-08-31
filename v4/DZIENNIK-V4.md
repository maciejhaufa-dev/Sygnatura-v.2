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

> **Zmiany z sesji 3 (31.08.2026):**
> 6. **Splash wydłużony do 4,8 s** z wyraźnie widoczną sekwencją: tło-las widoczny cały czas (welon 10%) → karta wyłania się 0,35 s → sygnet unosi się 0,95 s → litery spadają od 1,55 s (każda co 0,16 s, animacja 1 s) → ~2,3 s spokojnej pauzy → fade-out 0,9 s. (Wcześniej 3,0 s — użytkownik: „za krótki, nie widać tła, ładowania, pojawiania się napisów i logo".)
> 7. **SYG = PEŁNY jaśniejszy brąz** (nie kreskowanie, nie obrys): #8B6D5D vs NATURA #6B4530 — jeden ton barwy, różnica minimalna, ale widoczna gołym okiem. Tunowalne: `LIGHT_FACTOR = 0.22` w build.py.
> 8. **Hero = `IMG_20260829_230704.jpg` — DECYZJA UŻYTKOWNIKA** (numer podany wprost). Kadrowanie `55% 45%`.
> 9. **Tło splasha = plik użytkownika** `Green and White Atmospheric Forest Presentation_20260831_103357_0000.png` — build.py **automatycznie go wykrywa** w `../uploads/` i konwertuje PNG→JPEG do `assets/forest.jpg`. Plik na razie **nie dotarł do sandboxa** (działa zamiennik); jak wyląduje w uploads — wystarczy `python3 build.py`.

> **Zmiany z sesji 2 (31.08.2026, uwagi użytkownika po pierwszym teście):**
> 1. **Splash „Ssssss"** — mechanizm sprite+calc zawiódł w przeglądarce (wszystkie litery pokazywały 1. literę). ROZWIĄZANE: litery jako osobne pliki PNG (`assets/letters/l0..l8.png`), kerning przez margin w em (font-size wrappera = wysokość litery). Zero calc na pozycjach.
> 2. **Prostokąty OSTRE** — zero zaokrągleń (border-radius:0 na planszy, splash-card, przyciskach, stubach). „Prostokąt to prostokąt."
> 3. **Hero = napis „Cześć" Z UKOSA, nie całe ujęcie z szafką.** W uploads są zdjęcia z serii 28–29.08 (2 sesje: poranna 05:55 i wieczorna 23:05). Domyślne hero: `IMG_20260829_230633.jpg` (tablica ujęta od krawędzi — z ukosa). **Wybór ujęcia: `hero-picker.html`** — 12 miniatur, klik = podgląd w kadrze hero; użytkownik podaje numer → podmieniamy `assets/hero.jpg` + `background-position`. (UWAGA: WA0000 to ujęcie „z szafką" — wykluczone z pickera.)
> 4. **Plansza 1 kolumna na telefonie** — próg podniesiony: 2 kolumny tylko ≥1024 px; niżej 1 kolumna (wcześniej 860 px).
> 5. **Napisy „Pasją / styl / tradycja" statyczne, widoczne od razu** — żadnych sekwencyjnych wyłonień/ukrywania treści. Animacje = spokojna harmonia: miękki opad liter w splashu (0.9 s, stagger 0.12 s, z widocznością — start opacity .25→1, translateY tylko .7 em) + subtelny „oddech" planszy (3 px / 8 s) + łagodne przejście po splashu. Wszystko wyłączane przy prefers-reduced-motion, treść zawsze widoczna (noscript też).

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

- **Build:** `/v4/build.py` — `python3 build.py` generuje `index.html`, `kontakt.html`, `sklep.html`, `hero-picker.html` (kolorowanie zdjęć, litery logotypu, miniatury pickera). Wymaga: pillow (instalacja w sandboxie: `pip install --break-system-packages pillow`).
- **Logotyp:** litery wycinane z `pracownia/logo/WEKTORY3/LOGOTYP_3000px_BW.png` (dokładne litery z księgi znaku) do **osobnych PNG** `assets/letters/l0..l8.png`, kolor #6B4530. Kerning (przerwy w em = oryginalne odstępy z księgi): `[0.332, 0.322, 0.502, 0.417, 0.241, 0.414, 0.536, 0.370]`. RATIO (sygnet/litera) = 5.0847. Skalowanie: font-size wrappera = `calc(var(--sygW)/RATIO)`, litery `height:1em; width:auto` — proporcje księgi znaku zawsze zachowane, zero sprite/calc na pozycjach (koniec błędu „Ssssss").
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
├── hero-picker.html    # wybór zdjęcia hero (12 miniatur, klik = podgląd w kadrze)
├── DZIENNIK-V4.md      # ten plik
└── assets/
    ├── forest.jpg      # tło splasha — zamglony starodrzew (OBECNIE ZAMENNIK — patrz §5)
    ├── hero.jpg        # hero: IMG_20260829_230633.jpg (domyślne; picker = wybór innego)
    ├── sygnet.svg      # S z listkami w okręgu (kopia z WEKTORY3)
    ├── favicon.svg     # to samo co sygnet
    ├── letters/        # l0..l8.png — litery logotypu SYGNATURA (brąz #6B4530)
    └── thumbs/         # t1..t12.jpg — miniatury kandydatów hero (dla pickera)
```

**Podmiana hero:** ustaw `DEFAULT_HERO` w `build.py` (lista `HERO_CANDIDATES`, numer = picker) → `python3 build.py`. Kadrowanie: `.hero{background:...url('assets/hero.jpg') 62% 42%/cover...}` — dla innych ujęć może wymagać innej pozycji.

---

## 5. ZDJĘCIA — WAŻNE INFORMACJE

1. **LAS (splash):** docelowy plik użytkownika = `Green and White Atmospheric Forest Presentation_20260831_103357_0000.png` (ma leżeć w `../uploads/`). Build wykrywa go automatycznie i konwertuje do `assets/forest.jpg` — jak tylko pojawi się w repo, uruchom `python3 build.py`. **Na dziś działa zamiennik** (wygenerowany, wyraźniejsze drzewa).
2. **HERO — DECYZJA:** `IMG_20260829_230704.jpg` (użytkownik podał numer wprost, 31.08). Kadrowanie CSS: `55% 45%`. Poprzednie: 230633 (domyślne v2). `IMG-20260826-WA0000.jpg` = ujęcie „z szafką" — **wykluczone**. `hero-picker.html` zostaje jako narzędzie (miniatury 1–12).
3. Zdjęcia `IMG_20260828_*` / `IMG_20260829_*` to najpewniej tablica/napis + prawdopodobnie mozaika „scrabble" — bez pewności; picker rozstrzyga.
4. Zrzuty ekranów Pinterest i pozostałe pliki w `../uploads/` — materiały z v3.

---

## 6. NIEDOKOŃCZONE WĄTKI Z V3 (otwarte, nie przepadły)

- **Podświetlane szyldy na wynajem** (reakcja na neonsens.pl, 360 zł/doba): użytkownik chce premium „light up signs", ~500 zł/doba, drewniane multitechniczne — wiadomość urwana w v3, pomysł żywy.
- **Mozaika drewniana „scrabble"** (imiona frezowane CNC + zdjęcia + napisy „Miłość, radość, wdzięczność") — „to też może być hit produktowy".
- Metryczka/numer/szopka/konfigurator — wg dzienników v3, ale **priorytety i ceny do rewizji** (korekty z §1).

---

## 7. TODO / DO USTALENIA

1. ☐ **Las** — użytkownik podeśle oryginalny plik → nadpisz `assets/forest.jpg`.
2. ☐ **Hero** — użytkownik wybiera ujęcie w `hero-picker.html` (1–12) → ustaw `DEFAULT_HERO` + ewentualnie `background-position`.
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

## 10. DEPLOY (stan na 31.08.2026, sesja 4)

- **GitHub Pages:** strona skopiowana do **`/docs`** w repo (gałąź `arena/01a056f0-sygnatura-v-2`, pushnięta). Docelowy adres po włączeniu: `https://maciejhaufa-dev.github.io/Sygnatura-v.2/`. **Włączenie wymaga 1 kliknięcia użytkownika** (Settings → Pages → branch `arena/01a056f0-sygnatura-v-2` → `/docs`) — bot Arena nie ma uprawnień do API Pages (403: createRepository, create-pages-site). Instrukcja: `v4/PAGES-instrukcja.md`.
- **Po każdej zmianie strony:** `python3 build.py` → zaktualizuj `docs/` (index/kontakt/sklep/404 + assets/) → commit + push → Pages przebuduje się samo.
- **Podgląd roboczy:** `python3 serve.py 8080` (serwer **no-cache** — naprawia problem „nie odświeża się": wcześniej telefon dostawał 304 Not Modified). Publiczny adres podglądu sesji: `https://8080-iltxoxwpsn9ujvnw2mcr6.e2b.app/`. Meta `Cache-Control: no-store` dodane też do samych HTML.
- Przypomnienie: w tym repo **pracujemy tylko na gałęzi `arena/01a056f0-sygnatura-v-2`** (zasada sesji).

## 11. STATUS (po sesji 6, 31.08.2026 — po teście użytkownika)

- [x] **Błąd splashu znaleziony i naprawiony:** inline style liter były łączone bez średnika (`margin-left:...emanimation-delay:...` → nieważna deklaracja) — dlatego animowała TYLKO 1. litera (jej style = sam delay, ważny), a pozostałe miały i brak odstępów, i brak opóźnienia. Fix: `";".join(style)`. Dodatkowo `.fall{opacity:0; ... forwards}` — litery niewidoczne do swojej kolejki, spływają jedna po drugiej (delay 1,55 s + 0,16 s × i).
- [x] **Słowa „Pasją / styl / tradycja" — sekwencyjne wyłanianie od lewej do prawej:** animacja wipe (`clip-path: inset(0 100% 0 0) → inset(0)`) z opóźnieniami 4,6 / 5,1 / 5,6 s (start po splashu), potem welcome 6,3 s i przyciski 6,8 s (rise). Treść hidden (opacity 0) tylko do swojej kolejki.
- [x] **„Cześć" widoczne nad planszą:** przebudowa hero — zamiast tła pod planszą jest **pas zdjęcia u góry** (`.hero-photo`, pełna szerokość, wysokość clamp(220px,34vh,400px); mobile clamp(190px,30vh,300px)), tło `center 30% / 100% auto` = pełna szerokość zdjęcia bez przycinania po bokach (napis w regionie x~25–60%, y~18–45% zdjęcia — analiza komponentów). Plansza (prostokąt z treścią) siedzi POD pasem — „pod tym napisem na prostokącie to co ustaliliśmy" ✓. Lekki kremowy welon na pasie (0.30–0.44), napis czytelny.
- [x] Header z absolute → **sticky** w normalnym przepływie (menu naturalnie nad pasem zdjęcia), usunięte animacje veil-in header/footer.
- [x] docs/ zsynchronizowany i pushnięty.

### LEKCJE
- Sklejanie stylów inline: ZAWSZE separator `;` między deklaracjami.
- Pełnoekranowe `cover` na poziomym zdjęciu na pionowym telefonie pokazuje tylko ~35% szerokości — jeśli ma być widoczny cały napis, używaj `100% auto` (pełna szerokość) albo kadruj do kwadratu.
- Testy użytkownika na telefonie > testy w sandboxie (nie mamy przeglądarki headless).

## 12. STATUS (po sesji 5, 31.08.2026)

- [x] **Animacje naprawione:** usunięta reguła `prefers-reduced-motion`, która wyłączała animacje na telefonach z ustawieniem „ogranicz ruch" (stąd „mignie i już jest"). JS chowa splash zawsze po 4,8 s. UWAGA: jedyne, czego nie da się obejść z CSS, to systemowe „Usuń animacje" w Androidzie (skala animatora 0) — wtedy animacje nie zagrają nigdzie.
- [x] **Litery pełne (koniec kreskowania):** źródłem kreskowania był `LOGOTYP_3000px_BW.png` z WEKTORY3 — to wersja z kreskowaniem 75% z decyzji v3. `build.py` wypełnia teraz kreski do pełnych liter (dylatacja+erozja, `_solidify`), dziury liter (A, R) zachowane (zweryfikowane: l4/l7/l8 mają enklawy).
- [x] **Tło splasha = plik użytkownika:** `Green and White Atmospheric Forest Presentation_20260831_103357_0000.png` był w `uploads/` na gałęzi **main** na GitHubie (commit użytkownika b07db61), nie na gałęzi sesji. Pobrany przez `git show origin/main:...` do lokalnych uploads → build.py sam go wykrył i skonwertował do `assets/forest.jpg` (1920×1080).
- [x] `docs/` przebudowany i pushnięty → GitHub Pages aktualizuje się samo (~1–2 min).

### LEKCJE NA PRZYSZŁOŚĆ
- Sprawdzać `origin/main` po nowe pliki użytkownika (`git fetch` + `git ls-tree`), nie tylko lokalne uploads — użytkownik wrzuca pliki też na main przez www.
- Nie zakładać ustawień telefonu użytkownika (reduced-motion) — spec mówi „animacje mają być".
- WEKTORY3/LOGOTYP = kreskowanie 75% (historyczne); strona używa wypełnionych liter z build.py.

## 12. STATUS (po sesji 4, 31.08.2026)

- [x] Serwer podglądu z no-cache (fix 304/„nie odświeża się") + meta no-store w HTML
- [x] `docs/` z kompletną stroną wypchnięty na gałąź sesji
- [x] Instrukcja Pages: `v4/PAGES-instrukcja.md`
- [ ] **Czeka:** użytkownik włącza Pages (1 klik) → test na telefonie → dalsze uwagi
