# Dziennik v.3 — Sygnatura
**Start sesji:** 2026-08-30  
**Gałąź:** `arena/01a0539a-sygnatura-v-2`  
**Repo:** `maciejhaufa-dev/Sygnatura-v.2`  
**Ludzie:** Maciej (produkcja: laser, CNC, 3D) + żona (front: projekt, zdjęcie, klient). Poznań.  
**Domeny (kupione):** `studiosygnatura.pl` (kanon) + `studio-sygnatura.pl` (ma iść 301).

Ten plik jest pamięcią sesji. Kolejny agent **czyta go od deski do deski** zanim cokolwiek zmieni. Kontekst v.1 i v.2 jest tu skrócony, bo bez niego v.3 wygląda na kaprys.

---

## 0. Kim jesteście i skąd ten projekt

Żona 8 lat w domu z dziećmi, najmłodsze idzie do przedszkola, nie wraca na pełen etat. Umie Canvę, składanie wideo, zdjęcia z telefonu. Maciej na etacie, w garażu buduje maszyny i robi rzeczy z drewna (szyldy mieszane techniki, ozdoby). Budżet domowy się nie spina. Wkład własny ma być minimalny. Forma: **działalność nierejestrowana**, limit 2026 = **10 813,50 zł przychodu / kwartał / osobę**. Dwa limity, jeśli karencja 60 mies. u Macieja jest czysta. Sprzedają **towar**, nie usługę (na rachunku rzeczowniki). Cold mailing/calling w PL od PKE art. 398 — **zakazane także w B2B**.

### v.1 (plan biznesu)
Nie montażystka wideo. Ona = front, on = produkcja. Nisze: (1) ślub/event, (2) prezenty Q4, (3) szyldy dla firm. Potem korekta rynkowa: **nie sprzedawać parze młodej, wynajmować dekoratorce**; B2B świąteczne do 15.10; bombka płaska za 32 zł zabita przez rynek 2,50 zł. Flagowiec: **metryczka warstwowa 349 zł**.

### v.2 (strona, którą właśnie zabijamy)
Pełny serwis 9 podstron w `pracownia/www/site/` (Python `pages.py` + `build.py`, CSS inline). Ton: literacki warsztat („Sny z drewna”), IA usługowa (wynajem, współpraca, dla firm, metryczki, numery, szyldy). Ciemny hero, Georgia, uppercase nav, szare placeholdery. Paczka do GitHub Pages. Logo finalne: **S z gałązką + SYGNATURA**, brąz `#6B4530`, pliki w `pracownia/logo/WEKTORY3/`.

**30.08 użytkownik: „Stop. Coś niedobrego stało się z tą stroną i poszliśmy w totalnie złym kierunku. Tę stronę dezaktywujemy.”**

Nowa ramka, cytat z briefu v.3:

> Stworzyć stronę, która będzie trochę sklepem, trochę blogiem, trochę portfolio. Para zapaleńców, przedmioty użytkowe i ozdoby, sumienność, detal, jakość. Nowoczesne style × tradycja × ciepło domowego ogniska. Standard premium. Szyld: **Sygnatura** (nie „Studio Sygnatura” jako pierwszy plan).

---

## 1. Co zrobiono w tej sesji (v.3)

### Deaktywacja v.2
- Pliki v.2 **zostawione** (wiedza produktowa, cennik, umowy). Oznaczone: `pracownia/www/ARCHIWUM-v2.md`.
- `docs/index.html` — zaślepka „wersja poprzednia wyłączona”.
- **GitHub Pages NIE udało się wyłączyć przez API (403).** Aktualna publikacja:
  - URL: `https://maciejhaufa-dev.github.io/Sygnatura-v.2/`
  - source: gałąź **`arena/01a044f6-sygnatura-v-2`**, path **`/docs`**
  - Ta sesja ma zakaz pushowania na inną gałąź.
- **Człowiek musi:** GitHub → Settings → Pages → Disable, **albo** Source = bieżąca gałąź `arena/01a0539a-sygnatura-v-2` / `docs` (zaślepka).

### Nowy folder
Wszystko nowe żyje w **`/sygnatura/`** — to jest serwis v.3.

```
sygnatura/
  index.html          strona główna (hybryda 3 natur)
  sklep.html          kolekcja — mało SKU, nie 36 pozycji
  produkt.html        PDP metryczki
  dziennik.html       journal
  o-nas.html
  kontakt.html
  css/sygnatura.css
  img/                zdjęcia kierunkowe + logo
  layout/             plansze AI (nastrój, asortyment bywa zmyślony)
  README.md
dziennik-v.3.md       ← ten plik
docs/index.html       zaślepka Pages
```

### Wizualizacje
Wygenerowane zdjęcia nastroju (nie są zdjęciami prawdziwych wyrobów — sesja 5.09):
- `img/hero-metryczka.jpg` — warstwowy obiekt na lnie, światło okna
- `img/warsztat-dlonie.jpg` — dwie pary rąk, najlepsze zdjęcie marki
- `img/dom-numer.jpg` — przedpokój
- `img/ogien-domu.jpg` — stół, herbata, ogień (ognisko)
- `img/para-stol.jpg` — para od tyłu
- `img/szyld-drewno.jpg` — rzeźbiony napis HOME (angielski — tylko nastrój)
- `img/warstwy-detal.jpg` — makro warstw ze światłem
- `img/paczka-kraft.jpg` — kraft, juta, pieczęć

Plansze UI AI (`layout/01-home-board.jpg`, `02-sklep-board.jpg`): **nastrojowo trafione, asortymentowo kłamliwe** (wieszak, tacka, lampa cube, „36 produktów”, śpiące niemowlę w metryczce). Nie brać ich za katalog. Prawdziwy layout = HTML.

Logo: `img/logo-brown.png` (transparent, `#6B4530`) z `pracownia/logo/WEKTORY3/LOGO_pelne_3000px_BW.png`.

---

## 2. Decyzje projektowe v.3 (nie ruszać bez rozmowy z człowiekiem)

### Nazwa na stronie
**Sygnatura**, nie „Studio Sygnatura”. Studio zostaje w domenie i mailu (`studiosygnatura.pl`, `kontakt@studiosygnatura.pl`). W UI szyld jest jednym słowem.

### Trzy natury w jednej IA
| Nav | Co to jest | Czego to NIE jest |
|---|---|---|
| Sklep | 6 pozycji, ceny widać, flaga = metryczka 349 zł | Allegro-grid, filtry jak w 36 SKU |
| Realizacje | portfolio w domu, nie w showroomie | case studies B2B |
| Dziennik | notatki z robienia | lifestyle blog, „nasza pasja” |
| O nas | para, podział ról | „pracownia artystyczna” |

**Wynajem, współpraca, dla firm — nie ma ich w nav.** To był grzech v.2: strona wyglądała jak katalog usług dla dekoratorki i hotelu, zanim ktokolwiek zobaczył przedmiot. B2B może wrócić do stopki / osobnej podstrony **po** akceptacji kierunku, nie teraz.

### Ton
Pokazać zapał obrazem (dłonie, ogień, stół), nie hasłem „z pasją”. Unikać: artystyczna, kreatywna, unikalne, magia, handmade z serca. Zostawić: we dwoje, detal, warstwa, zostaje, ognisko.

### Wizualnie — „papier i ognisko”
- Tło `#F4EFE6` (papier), atrament `#1E1914`, znak `#6B4530`, ogień `#A24B2C` (tylko cena i CTA), stopka sosna `#2A3C33`
- Fonty: **Fraunces** (nagłówki, kursywa) + **Outfit** (UI/body)
- Hero **jasny**, bez ciemnego welonu v.2
- Karta editorial nachodzi na zdjęcie (dół-lewo) — to podpis layoutu
- Dużo powietrza, mało kafelków, fotografia jest interfejsem

### Sklep vs. koszyk
Layout **udaje** sklep (ceny, 0 w koszyku, CTA). Nie ma płatności. Zamówienie idzie przez rozmowę (`kontakt.html`). Koszyk prawdziwy dopiero po zdjęciach z 5.09 i decyzji „sprzedajemy z półki / na zamówienie”.

### Co zachować z v.2 (merytoryka, nie wygląd)
- Flagowiec: metryczka 349 / 249 / 229
- Numer od 119, szyld od 229
- Materiał: falcata na masówkę, brzoza na metryczkę; sklejka marketowa odrzucona
- Projekt w cenie wykonania
- PKE: zgoda na formularzu, zero cold maila
- Księga znaku i wektory

---

## 3. Dlaczego v.2 była złym kierunkiem (żeby nie wracać)

1. **IA usługowa** — wynajem i B2B na równi z przedmiotem. Wyglądało to jak oferta dla firm, nie jak dom, z którego można coś kupić.
2. **Ciemny hero + Georgia + uppercase nav** — szablon „luxury craftsman 2018”, nie 2026, nie ognisko.
3. **Brak sklepu i braku dziennika** — brief v.3 nazywa te dwie rzeczy wprost.
4. **Szare placeholdery** na 9 podstronach = strona wyglądała na niedokończony wireframe.
5. **Za dużo kategorii naraz** — metryczki, numery, szyldy, wynajem, współpraca, hotele. Premium w rzemiośle = mało rzeczy.

Nie znaczy to, że wynajem i B2B umarły jako biznes. Znaczy, że **nie są twarzą strony**.

---

## 4. Terminarz (nie zgubić przy redesignie)

- **5.09.2026 sobota — sesja zdjęciowa.** Wąskie gardło. Layout bez prawdziwych zdjęć nie idzie na domenę publicznie.
- Do piątku 4.09 fizycznie: metryczka rodzinna na prawdziwych danych.
- 21.09 i 15.10 (mailing / zamknięcie B2B świąteczne) — w mocy jako biznes, **nie** jako zimny mailing.
- Domena kupiona, poczta `kontakt@` jeszcze do postawienia (Zoho).

---

## 5. Co ma zrobić kolejny agent

Po akceptacji layoutu przez człowieka, w tej kolejności:

1. Poprawki kierunku (kolor, IA, copy) — **nie** dopisywać wynajmu z powrotem bez pytania.
2. Podmienić zdjęcia AI na sesję 5.09 (`data` analogiczna do starych `data-ph`).
3. Formularz naprawdę wysyła (Formspree) + klauzula PKE.
4. Favicon/OG już są w zalążku; dodać `og:image` z prawdziwego hero.
5. Koszyk: na start wystarczy „napisz / zamów”, nie Shopify.
6. Podpięcie `studiosygnatura.pl` **dopiero** gdy zdjęcia są prawdziwe.
7. Pages: człowiek wyłącza stare source. Nowe Pages = folder `sygnatura/` (root albo `/docs` po kopiowaniu).

### Czego nie robić
- Nie wracać do `pages.py` v.2 jako bazy wyglądu.
- Nie publikować plansz `layout/01-home-board.jpg` jako oferty — zły towar.
- Nie dodawać 36 SKU, filtrów ceny, konta klienta.
- Nie pisać „z pasją” w hero.
- Nie pushować na inną gałąź niż `arena/01a0539a-sygnatura-v-2`.

---

## 6. Log rozmowy v.3

**Użytkownik 1:** kontekst z GitHuba, domeny kupione, „zreferuj kolejne kroki”. Agent zreferował tory A/B/C (DNS, detale strony, sesja 5.09) i ostrzegł, że wąskim gardłem jest produkt na zdjęcie, nie CSS.

**Użytkownik 2:** STOP. Dezaktywacja v.2. Nowa wersja: sklep + blog + portfolio, para, detal, ognisko, premium, szyld Sygnatura. Folder w repo, dziennik md, wizualizacja + uzasadnienie.

**Agent:** Pages 403, folder `sygnatura/`, zdjęcia nastroju, HTML layout, ten dziennik, zaślepka `docs/`.

---

*Ostatnia aktualizacja: 2026-08-30, po pierwszym layoutcie v.3. Czekamy na opinię człowieka.*
