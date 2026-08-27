# TECH-BOOK — Studio Sygnatura
**Księga techniczna produkcji.** Materiały · dostawcy · parametry maszyn · defekty · wnioski z testów.

> **Zasada prowadzenia:** ten plik jest *dziennikiem*, nie instrukcją napisaną raz. Każdy test, każda nowa partia materiału, każda nieudana próba — wpis. Za pół roku to jest najcenniejszy plik w całej pracowni, bo odtwarza parametry bez zgadywania.
> **Format wpisu:** data · materiał (producent, klasa, grubość) · parametry · wynik · wniosek.

Ostatnia aktualizacja: **2026-08-27**

---

# CZĘŚĆ I — MATERIAŁY

## 1.1 Tabela decyzyjna: co na co

| Produkt | Materiał | Klasa | Grubość | Dlaczego |
|---|---|---|---|---|
| **Metryczka** (flagowiec 349 zł) | brzoza | **1/2** | 3 mm | widać krawędzie 6 warstw i wnętrze przez podświetlenie — najczystszy przekrój |
| **Numer wnętrzowy** (mieszkania) | **falcata** | 1/2 | 3 mm | szybkie cięcie, jasna, lekka; klejona na dystansach |
| Szopka, kartki, bombki, świeczniki | falcata | 2/2 | 3 mm | masówka, widoczna jedna strona |
| **Arkusze testowe** | falcata | **2/2, najtańsza** | 3 mm | ⛔ nigdy nie testować na brzozie |
| Szyld/emblemat adresowy na dom | **drewno lite / klejonka** | — | 18–20 mm | CNC, patrz §1.5 |
| Rama metryczki | listwa sosna A/AB lub lipa | bez sęków | 20×20 | wpust pod sklejkę 3 mm |

**Reguła klasy:** 1/2 = jedna strona bez wad. **W 90 % produktów widać tylko jedną stronę** → klasa 1/1 to wyrzucone pieniądze wszędzie poza metryczką.

---

## 1.2 ⭐ FALCATA — materiał podstawowy

**Falcata = albizja (Albizia falcataria), „azjatycka topola".** Gęstość ~390 kg/m³, 35 % lżejsza od brzozy.

**Status: ZATWIERDZONA jako materiał bazowy.** Potwierdzone własnym testem — tnie się czysto w 3–4 przejściach.

**Zalety:**
- cięcie **~40 % szybciej** niż brzoza → realne skrócenie kolejki na jedynym laserze
- ~40 % taniej
- jasna, jednorodna powierzchnia, mało żywicy → mało sadzy, mniej mycia
- lekka — istotne przy wysyłce i przy wiszących wielowarstwowcach

**Wady / na co uważać:**
- ⚠️ **sęki i defekty wewnętrzne** — losowo nie dotnie w jednym miejscu. Stąd 3–4 przejścia „dla pewności" zamiast teoretycznych 2. To nie jest błąd parametrów, to zmienność materiału.
- miękka i włóknista → **grawer rastrowy może się rozmywać** (do zweryfikowania, patrz TEST-01)
- nie nadaje się na zewnątrz

## 1.3 ⛔ CZARNA LISTA — materiały odrzucone

### Sklejka marketowa (Bricoman i pochodne), 4 mm
**Test własny: 10 przejść i nie docięło. ODRZUCONA BEZWZGLĘDNIE.**

Twoja diagnoza jest trafna i warto ją tu zapisać, bo tłumaczy całą klasę materiałów:

Sklejka marketowa to produkt **budowlany**, nie ozdobny. Trzy powody, dla których laser sobie z nią nie radzi:
1. **Klej.** Marketowa idzie zwykle na klejach fenolowych/melaminowych (EXT) w grubej warstwie. Klej ma zupełnie inną temperaturę rozkładu niż drewno — laser tnie drewno, dochodzi do spoiny i **staje**. Każde kolejne przejście tylko poszerza rzaz i zwęgla ścianki, zamiast schodzić głębiej.
2. **Liczba i grubość warstw.** 4 mm marketowa to często 3 grube warstwy z pustkami i zakładkami. **Pustka w środku = rozprasza wiązkę**, ognisko się rozjeżdża.
3. **Wilgotność i gęstość.** Materiał budowlany bywa wilgotniejszy i gęstszy — energia idzie w odparowanie wody.

**Wniosek generalny:** ⛔ **nie kupować sklejki tam, gdzie nie jest opisana jako „do lasera / CNC".** Dopisek „suchotrwała" nie wystarcza. Szukać: klej **MR / mocznikowy (INT)**, cienkie warstwy, deklarowana klasa 1/2 lub 2/2, opis „do cięcia laserowego".

### Tarcica konstrukcyjna prosto z tartaku
**Test własny (Tartak u Michała, Komorniki): odrzucona do wyrobów.**

Powody potwierdzone w praktyce:
- **niewysezonowana** — świerk/sosna o wysokiej wilgotności
- **żywiczna** — po pierwszym słońcu żywica wychodzi na powierzchnię („miód"). To dyskwalifikuje produkt portfolio-grade: klient dostaje lepiącą się tabliczkę pół roku po zakupie
- **niedoskonałości** — sęki, pęknięcia, sinizna
- tania, ale **oszczędność pozorna** — sortowanie i odpad zjadają różnicę

**Ale nie skreślać całkiem:** tartak zostaje jako źródło **zrzynów** na prototypy, podstawki warsztatowe i przymiarki. **Nigdy na produkt sprzedawany.**

⚠️ **Zasada dla drewna litego:** kupować wyłącznie **suszone komorowo do 8–12 %** i **gatunki bezżywiczne** (liściaste: lipa, dąb, jesion, buk). Iglaste odpadają z zasady — żywica.

### Creative Deco i sklepy kreatywne
Nie wada techniczna, tylko cenowa: A4 topola **4,00 zł** vs **1,69 zł** u dostawcy branżowego. Gatunek B, bez deklaracji klasy. ⛔ Skreślone.

---

## 1.4 DOSTAWCY — sklejka pod laser

### ⭐ A. sklejka-krakow.pl (Betulla) — dostawca główny, zakupy hurtowe
Wysyłkowo, bez DG. **Kluczowa przewaga: darmowe cięcie arkusza na formatki.**

| Produkt | Cena | zł/m² |
|---|---|---|
| FALCATA 3 mm kl. 1/2, formatka 500×300 | ~4,00–4,53 zł | ~28 |
| **FALCATA 3 mm kl. 1/2, arkusz 2440×1220 + cięcie 5–8 formatek GRATIS** | — | **~16–20** |
| Sklejka do lasera 3 mm kl. 2/2, arkusz 1525×1525 | 66,42 zł | ~29 |
| Topola 3 mm formatka 400×300 kl. 2/3 | 4,05 zł | ~34 |
| Topola 3 mm formatka 600×400 kl. 2/3 | 7,38 zł | ~31 |

- https://sklejka-krakow.pl/pl/p/FALCATA-3mm-kl.-12-formatka-500x300mm/1265
- https://sklejka-krakow.pl/pl/p/FALCATA-3mm-12-2440x1220/1210
- https://sklejka-krakow.pl/sklejka-topolowa

**⭐ ZAMÓWIENIE WZORCOWE:** arkusz falcaty 2440×1220 kl. 1/2, **cięcie na formatki 305×330 mm** (= pole robocze lasera). Wychodzi **~29 szt.** Ustalić transport telefonicznie.

### B. sklejka-hdf.pl — dokupywanie, małe formatki
| Format | Cena |
|---|---|
| Falcata 3 mm A4 | **1,69–1,99 zł** |
| Falcata 3 mm 400×300 | 2,99–3,45 zł |
| Falcata 3 mm 500×300 | 3,99 zł |
| Falcata 3 mm 600×400 | 5,49–6,30 zł |
| Falcata 3 mm 900×600 | 12,99–17,95 zł |

https://sklejka-hdf.pl/kategoria-produktu/sklejka-falcata-3mm/

### C. askonet.pl — brzoza na metryczki
| Produkt | Brutto |
|---|---|
| Brzoza 3 mm kl. 2/2 | 2,95 zł |
| **Brzoza 3 mm kl. 1/2** | **3,60 zł** |
| Brzoza klasa „Laser Premium" | zapytać |

https://sklep.askonet.pl/sklejka-c-55_59.html

### D. sklejkadolasera.com.pl — jakość 1/1, deklarowana okładzina
Jedyny dostawca podający **grubość okładziny** (0,25 / 0,3 / 0,5 mm). Ma znaczenie przy grawerze — cienka okładzina przepala się do warstwy klejowej i robi brudny brąz.
Topola 100 % jakość 1/1, okładzina 0,3 mm: **44 zł/m²**. Formaty 700×500, 200×300.
https://sklejkadolasera.com.pl/

---

## 1.5 DOSTAWCY — drewno lite (szyldy/emblematy CNC na dom)

⚠️ Nie kupować w tartaku kubikami. Szukać **klejonki** i **detalu**.

### ⭐ drewno-klejone.com.pl — Poznań, priorytet do sprawdzenia
Tartak + suszenie + produkcja płyt klejonych, od 1994. Ma **sprzedaż detaliczną** i **usługowe cięcie CNC**. Specjalizacja: **tarcica lipowa**, płyty i kantówki klejone.
📞 502 616 054 · mp@klejone.pl · https://drewno-klejone.com.pl/sprzedaz-detaliczna/

**Dlaczego to właściwy adres pod emblemat na dom:**
- **klejonka nie wichruje się** jak lita deska 20×20 cm — jedyny sensowny materiał na fasadę
- **lipa** = klasyczne drewno snycerskie, miękka, jednorodna, **bezżywiczna** → idealna pod frez i laser
- mają CNC, rozumieją zapytanie

**Zapytanie do wysłania:**
> Dzień dobry. Wykonuję drobną galanterię drzewną — tabliczki adresowe i emblematy rzeźbione na CNC. Poszukuję płyty klejonej gr. 18–20 mm, formatki ok. 200×200 mm, do zastosowań zewnętrznych. Interesuje mnie dąb, jesion lub modrzew, suszone komorowo. Czy sprzedają Państwo detalicznie ilości rzędu 10–20 sztuk i czy możliwe jest docięcie na wymiar? Proszę o cennik i dostępne gatunki.

### CMD Centrum Materiałów Drzewnych — tarcica liściasta, hurt i detal
ul. Akacjowa 19, Dąbrowa · 601 611 262 · https://www.cmd.poznan.pl/

### Tartak u Michała, Komorniki — ⚠️ tylko zrzyny na prototypy
ul. Poznańska 176 · 503 074 600 · https://tartakumichala.pl/
**Sprawdzone: tarcica konstrukcyjna nie nadaje się do wyrobów** (patrz czarna lista §1.3).

### Listwy 20×20 — market lokalnie
Castorama / OBI / Leroy, sosna 20×20×2400 ≈ 8–14 zł. **Klasa A/AB, przebierać ręcznie** — jeden sęk na widocznej krawędzi psuje produkt za 349 zł. Lepsza opcja: listwa lipowa/jesionowa klejona z drewno-klejone.

---

# CZĘŚĆ II — PARAMETRY MASZYN

## 2.1 Park maszynowy

| Maszyna | Pole robocze | Uwagi |
|---|---|---|
| **Laser GRBL** (konstrukcja własna) | **307 × 330 mm** | air assist · moc: **[UZUPEŁNIĆ: W]** · typ diody: **[UZUPEŁNIĆ]** |
| **Frezarka CNC** | 307 × 330 mm | wrzeciono: **[UZUPEŁNIĆ]** |
| **Druk 3D** | 200 × 200 × 250 mm | |

⚠️ **Formatki materiału zamawiać w 305×330 mm** — pod pole robocze, zero docinania w domu.

## 2.2 Parametry cięcia — tabela robocza

> ⚠️ **To są parametry wyjściowe do testu, nie gotowa recepta.** Każda nowa partia materiału = przymiarka na ścinku.

| Materiał | Prędkość | Moc | Przejść | Status |
|---|---|---|---|---|
| **Falcata 3 mm** | — | — | **3–4** | ✅ sprawdzone w praktyce, tnie czysto |
| Brzoza 3 mm | — | — | ~4–6 (szac.) | ⬜ do zmierzenia |
| Topola 3 mm | — | — | ~3–4 (szac.) | ⬜ do zmierzenia |
| ⛔ Sklejka marketowa 4 mm | — | — | **10+ i nie dotnie** | ⛔ odrzucona |

**[UZUPEŁNIĆ prędkości i moce z LightBurn/kontrolera — bez tego tabela jest niepełna.]**

**Dlaczego 3–4 przejścia zamiast 2:** margines na sęk lub defekt wewnętrzny. **Świadoma decyzja, nie błąd** — jedno nieprzecięte miejsce w 6-warstwowej metryczce niszczy komplet, a dodatkowe przejście kosztuje minuty.

## 2.3 Wypał / grawer rastrowy
Punkt wyjścia (sklejka 3 mm): **2500–3000 mm/min · moc 25–35 % · gęstość 0,08 mm · 1 przejście.**
Zastosowanie: kreskowanie SYG w sygnecie, tła wzorzyste w numerach.

## 2.4 Czasy cięcia (3 przejścia @ 300 mm/min)

| Produkt | Czas |
|---|---|
| Szopka | 184 min |
| Kalendarz | ~150 min |
| Metryczka (6 warstw) | ~85 min |
| Numer wnętrzowy 15×15 | ~21 min |
| Świecznik | 15 min |
| Bombka | 9 min |
| Kartka | 7 min |

⚠️ **Do przeliczenia po przejściu na falcatę** — deklarowane +40 % prędkości. Jeśli się potwierdzi, szopka spada do ~110–130 min. **To najważniejsza optymalizacja w całej pracowni**, bo laser jest wąskim gardłem.

---

# CZĘŚĆ III — KONSTRUKCJA

## 3.1 Metryczka (flagowiec)
6 pierścieni sklejki 3 mm · tunel zwężający się w głąb · odstępy **5 mm** → wnętrze 43 mm · gabaryt 250×250, głęb. 50 mm · zdjęcie na dnie · teksty po łuku · gradacja: im głębiej, tym więcej wypełnienia. Rama: sklejka 3 mm we wpustach listwy sosnowej 20×20. Montaż przez otwartą ściankę, dolna na wkręty.

## 3.2 Podświetlenie — standard zakładowy
- **drucik LED, nie taśma** · **bez dyfuzora** · rozstaw diod **10 cm** (jedyny dostępny)
- 20 LED / 2 m, 2700 K, ok. 4,70–7,50 zł
- zasilanie **wyłącznie 3×AA**. ⛔ 12 V odrzucone
- diody **na plecach warstw**, światło z góry i boków. ⛔ nie od dołu
- ⛔ **bez warstwy rozświetlającej**

## 3.3 Zasady plików produkcyjnych
- ⛔ **wyłącznie outline. ZERO grawerowania, tekstu, komentarzy** — także w arkuszach testowych
- SVG: `fill-rule="evenodd"`, wymiary w **mm** + viewBox
- **kreskowanie SYG = grawer rastrowy, nie ścieżka cięcia**
- znak: logo pełne **≥30 mm**, sygnet okrągły do **10 mm**, na metki sam sygnet
- pliki finalne: `logo/WEKTORY3/`

## 3.4 Doktryna detalu
Wzorzec: tabliczka „Cześć!". **Jedna powierzchnia gęsty detal, reszta cicha.** Mniej produktów, bardziej złożonych, z dużą liczbą detali, za wyższe stawki.

---

# CZĘŚĆ IV — DZIENNIK TESTÓW

## ⬜ TEST-01 — falcata vs brzoza, grawer rastrowy · PRIORYTET
**Cel:** czy falcata (miękka, włóknista) nadaje się pod grawer rastrowy, czy rozmywa krawędzie.
**Metoda:** ten sam plik na obu materiałach, jeden arkusz, ten sam przejazd. Kreskowanie SYG mod 10 / wid 4 + fragment tła kwiatowego.
**Koszt:** ~15 min. **Rozstrzyga wybór materiału na cały sezon.**
**Wynik:** ⬜ *(wypełnić)*

## ⬜ TEST-02 — kalibracja parametrów falcaty
Zmierzyć i zapisać realną prędkość/moc/liczbę przejść. Uzupełnić §2.2.
**Wynik:** ⬜

## ⬜ TEST-03 — weryfikacja grubości nowej partii
Suwmiarka na 3 losowych formatkach. Sklejka „3 mm" bywa 2,7–3,3 mm — przy 6 warstwach i wpustach to różnica między „pasuje" a „do wyrzucenia".
**Wynik:** ⬜

## ✅ TEST-00 — sklejka marketowa Bricoman 4 mm
**Wynik: PORAŻKA.** 10 przejść, nie docięło. Przyczyna: klej fenolowy/melaminowy w grubej warstwie + grube warstwy z pustkami. **Materiał odrzucony bezwzględnie.**

## ✅ TEST-00b — tarcica konstrukcyjna, Tartak u Michała
**Wynik: ODRZUCONA do wyrobów.** Niewysezonowana, żywiczna — żywica wychodzi na powierzchnię po pierwszym słońcu. Zostaje jako źródło zrzynów na prototypy.

---

# CZĘŚĆ V — ZAKUPY

## 5.1 Cztery zasady
1. **Arkusz, nie formatki** — 28 zł/m² → 16 zł/m². Darmowe cięcie u dostawcy znosi jedyny argument za formatkami.
2. **Cięcie pod pole robocze: 305×330 mm.** Nie A4, nie A3.
3. **Konsolidować zamówienia** — trzy po 80 zł to 45 zł na kurierach; jedno za 240 zł to często dostawa gratis.
4. **Nie płacić za klasę 1/1** poza metryczką.

## 5.2 Lista startowa
| Poz. | Co | Gdzie | Szacunek |
|---|---|---|---|
| 1 | Falcata 3 mm kl. 1/2, arkusz 2440×1220 + cięcie na 305×330 | sklejka-krakow.pl | ~130–180 zł + transport |
| 2 | Brzoza 3 mm kl. 1/2, 20 formatek | askonet.pl | ~72 zł |
| 3 | Falcata 3 mm 500×300 ×10 (testy) | sklejka-hdf.pl | ~40 zł |
| 4 | Listwa sosnowa 20×20 ×5 | market | ~60 zł |
| 5 | Zapytanie o klejonkę 200×200×18 | drewno-klejone.com.pl | 0 zł |

**Razem ~320–370 zł.** Mieści się w budżecie startowym 680 zł.

## 5.3 Pytania do każdego nowego dostawcy
- Jaki **klej** — MR/mocznikowy (INT) czy fenolowy (EXT)? *Do wnętrz MR, lepiej się tnie.*
- **Rzeczywista grubość** i tolerancja?
- Ile **warstw** w 3 mm i jaka okładzina?
- Czy tną **na wymiar** i czy to płatne?
- **Zapisywać producenta i klasę udanych partii** — powtarzalność materiału to przy produkcie portfolio-grade połowa sukcesu.
