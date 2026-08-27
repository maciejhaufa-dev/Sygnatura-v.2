# SZOPKA WARSTWOWA — dokumentacja techniczna prototypu
### Rozmiar, podświetlenie, dyfuzor, lista zakupów

---

# 1. ROZMIAR — 20 × 20 cm to dobry wybór, ale z jednym zastrzeżeniem

**Tak, 20 × 20 cm jest optymalne na prototyp.** Powody:
- Mieści się na resztkach materiału — tanie testowanie
- Waga poniżej 700 g → **paczka kurierska w najniższym progu cenowym**
- Wygląda dobrze na półce i na biurku, nie wymaga miejsca na ścianie
- Przy 5 warstwach na 20 cm szerokości sylwetki są jeszcze czytelne

**Zastrzeżenie: przy 20 cm trzeba pilnować minimalnej grubości detalu.** Sklejka 3 mm nie utrzyma elementów cieńszych niż **2 mm** — cienkie belki stajni, nogi zwierząt, pastorał Józefa. Przy skali 20 cm łatwo zejść poniżej tego progu i element wypadnie albo złamie się przy montażu.

**Praktycznie:** projektuj w 30 × 30, potem przeskaluj do 20 i **sprawdź, czy nic nie zeszło poniżej 2 mm**. Inkscape: zaznacz najcieńszy element i zmierz.

### Rekomendacja produktowa
| Rozmiar | Zastosowanie | Cena |
|---|---|---|
| **15 × 15 cm** | wersja ekonomiczna, upominek firmowy masowy | 120 zł |
| **20 × 20 cm** | ⭐ podstawowa, prototyp zaczynasz od tej | 180 zł |
| **30 × 30 cm** | premium, więcej detalu, efekt „wow" | 320 zł |

**Głębokość wewnętrzna 40 mm** przy 5 warstwach. To wynika z arytmetyki: 5 warstw × 3 mm = 15 mm materiału + 4 przerwy × 6 mm = 24 mm. Razem 39 mm, plus dyfuzor.

⚠️ **Nie schodź poniżej 5 mm między warstwami** — cienie się zlewają i cały efekt głębi znika. To jest najczęstszy błąd i widać go dopiero po sklejeniu.

---

# 2. PODŚWIETLENIE — masz rację co do 3 V, ale jest lepsze rozwiązanie

## Twoje pytanie o zasilanie — konkretna odpowiedź

**Nie musisz szukać taśm 12 V.** Masz trzy realne opcje:

### ⭐ OPCJA A: drucik LED (fairy lights) na 2× AA lub 3× AAA — **REKOMENDOWANA NA PROTOTYP**
- **Napięcie: 3 V (2× AA) lub 4,5 V (3× AAA)** — dokładnie to, o co pytasz
- To cienki drut miedziany z wtopionymi diodami SMD, sprzedawany w gotowych zestawach z koszykiem baterii i włącznikiem
- Cena: **6–12 zł za sztukę** (10 m, 100 diod), na Allegro/AliExpress masowo
- **Zaleta krytyczna: drut jest giętki** — układasz go swobodnie po obwodzie ramy, wciskasz w rowek, nie potrzebujesz kleju ani lutowania
- Diody są maleńkie (2 mm) → **łatwo je ukryć**, nie widać punktów świetlnych
- Wersje z **timerem 6h/18h** — kosztują 2 zł więcej i to świetny argument sprzedażowy („włącza się codziennie o tej samej porze")

### OPCJA B: taśma LED 5 V (USB) + 3× AAA
- Taśma 5 V zadziała na 4,5 V z trzech paluszków AAA — **będzie nieco ciemniejsza, ale to zaleta**, bo pełna jasność w takiej ramce oślepia
- Możesz dać **podwójne zasilanie: koszyk baterii ORAZ gniazdo USB-C** — klient wybiera
- Taśma daje bardziej równomierne światło niż drucik, ale trudniej ją ukryć (szersza)
- Cena: ~8 zł/m taśmy + 4 zł koszyk

### OPCJA C: taśma 12 V — **odradzam**
Wymaga zasilacza sieciowego, kabel psuje wygląd prezentu, klient musi mieć gniazdko przy półce. Jedyny sens: duże ramki 40 cm+ albo ekspozycja stała.

## Jak rozmieścić światło — to ważniejsze niż wybór taśmy

**Zasada: światło z góry i z dołu, skierowane DO ŚRODKA, nie od tyłu.**

Widziałeś to na przekroju. Powód:
- **Światło od tyłu** = wszystkie warstwy równo prześwietlone, płasko, widać punkty diod przez szpary. Efekt głębi znika
- **Światło z obwodu do środka** = każda warstwa rzuca cień na następną, powstaje realna głębia i „ciepłe wnętrze stajni"

**Wykonanie:**
1. W ramie (10 mm) **wyfrezuj rowek 4 × 4 mm** po wewnętrznym obwodzie, ok. 8 mm od krawędzi frontowej
2. Wciśnij w niego drucik LED — trzyma się sam, ewentualnie kropla kleju co 10 cm
3. Nadmiar drutu zwiń i schowaj za pleckami
4. Koszyk baterii: **wyfrezuj gniazdo w pleckach**, żeby był w licu — nie przyklejaj z tyłu, bo ramka nie stanie prosto

⚠️ **Temperatura barwowa: 2700 K (ciepła biała).** Nie 3000 K, nie „warm white" bez podanej wartości. Zimne światło (4000 K+) zabija drewno — wygląda jak plastik. To jedna z tych rzeczy, które decydują, czy produkt wygląda na 60 zł czy na 180 zł.

**Nie dawaj RGB ani migających.** Obniża postrzeganą wartość.

---

# 3. DYFUZOR — tak, potrzebujesz, i masz rację co do śniegu

Bez dyfuzora zobaczysz **punkty diod** przez wycięte gwiazdy i szpary. To natychmiast zdradza tanią konstrukcję.

## Czym rozproszyć — od najlepszego

| Materiał | Grubość | Cena | Ocena |
|---|---|---|---|
| **Plexi mleczna (opal / satyna)** | 2–3 mm | ~25 zł/A4 | ⭐ najlepsza. Równe światło, sztywna, trwała |
| **Kalka techniczna 180 g** | — | grosze | Bardzo dobra na prototyp. Rozprasza świetnie, ale mięknie z wilgocią |
| **Papier akwarelowy 300 g** | — | grosze | Cieplejsze światło, ładna faktura. **Dobra opcja na „śnieg"** |
| Poliwęglan mleczny | 2 mm | ~20 zł | OK, tańszy od plexi |
| ❌ Zwykły papier biurowy | — | — | Prześwituje nierówno, żółknie |

**Na prototyp weź kalkę techniczną.** Kosztuje grosze, a od razu zobaczysz, czy efekt Ci pasuje. Do wersji sprzedażowej przejdź na plexi opal — wygląda i trzyma się nieporównanie lepiej.

## Twój pomysł ze śniegiem — rozwinięcie

Masz dobrą intuicję. Trzy sposoby, od najprostszego:

**1. Dyfuzor jako śnieżne niebo (najprostszy)**
Kalka/plexi za warstwą L0. Gwiazdy wycięte w L0 świecą punktowo, reszta nieba daje miękką poświatę. **To już wystarczy na dobry efekt.**

**2. Warstwa śniegu na dolnej krawędzi (polecam)**
Dodaj do L4 (front) **falistą listwę imitującą zaspę** — wycięta ze sklejki 3 mm, pomalowana na biało matowo albo z naklejonym białym filcem. Zasłania dolną taśmę LED i jednocześnie tworzy pierwszy plan. **Dwie funkcje, jeden element.**

**3. Grawer rastrowy „mrozu" na dyfuzorze (efektowny)**
Jeśli dyfuzor to plexi — **wygrawéruj na niej delikatny wzór mrozu/płatków rastrem o niskiej mocy**. Powierzchnia matowieje w miejscu graweru i te miejsca świecą jaśniej. Efekt bardzo dobry, kosztuje 2 minuty cięcia.

⚠️ **Przy plexi: grawer i cięcie ZAWSZE z folią ochronną z obu stron**, inaczej powierzchnia zmatowieje nierównomiernie od dymu.

---

# 4. LISTA ZAKUPÓW NA PROTOTYP

| Pozycja | Ilość | Koszt |
|---|---|---|
| Sklejka brzozowa 3 mm (warstwy) | arkusz 30×60 | ~12 zł |
| Sklejka 10 mm (rama) | 30×30 | ~10 zł |
| Sklejka 6 mm (plecki) | 20×20 | ~4 zł |
| **Drucik LED 2 m, 2×AA, ciepły biały 2700 K, timer** | 1 kpl | **~10 zł** |
| Baterie AA | 2 szt. | ~4 zł |
| Kalka techniczna 180 g (prototyp) | 1 ark. | ~2 zł |
| *Plexi opal 2 mm (wersja docelowa)* | *A5* | *~14 zł* |
| Bejca orzech + olejowosk | — | z zapasu |
| **RAZEM prototyp** | | **~42 zł** |

Zrób od razu **materiał na 2 sztuki** — pierwsza pójdzie na naukę, druga będzie ta do zdjęć.

---

# 5. KOLEJNOŚĆ PRACY NAD PROTOTYPEM

1. **Projekt w Inkscape**, 5 warstw jako osobne obiekty, kontrola grubości detalu ≥ 2 mm
2. **Test cięcia na odpadzie** — sam narożnik jednej warstwy, sprawdzenie mocy i przypalenia
3. Cięcie wszystkich warstw
4. **Montaż na sucho, bez kleju** — ustaw warstwy z dystansami i oceń głębię. **Tu jeszcze możesz zmienić odstępy.** Zrób zdjęcie telefonem, na zdjęciu widać płaskie miejsca lepiej niż na żywo
5. Rama + rowek na LED + gniazdo na koszyk baterii
6. Bejcowanie ramy, **osobno** — nie po sklejeniu
7. Wklejenie LED, test świecenia **przed** montażem warstw
8. Klejenie warstw z dystansami, od tyłu do przodu
9. Dyfuzor, plecki, filcowe stopki na spodzie
10. **Zdjęcia: wersja dzienna + wersja świecąca o zmierzchu**

---

# 6. CZEGO SIĘ SPODZIEWAĆ — typowe bolączki

| Problem | Przyczyna | Rozwiązanie |
|---|---|---|
| Efekt płaski, brak głębi | odstępy za małe | minimum 5 mm, najlepiej 6 |
| Widać punkty diod | brak dyfuzora / światło od tyłu | dyfuzor + światło z obwodu |
| Ciemne rogi | drucik tylko na górze | góra **i** dół |
| Cienkie elementy wypadają | detal < 2 mm | pogrub przy projektowaniu |
| Warstwy krzywo | klejenie „na oko" | wytnij **szablon montażowy** z odpadu — ramka pozycjonująca |
| Przypalone krawędzie brudzą | za duża moc / brak odciągu | mniejsza moc + większa prędkość, przetrzyj denaturatem |
| Ramka nie stoi prosto | koszyk baterii wystaje | wyfrezuj gniazdo w pleckach |
| Światło zimne, plastikowe | zła temperatura | wyłącznie 2700 K |

---

## Jedna rada na koniec

**Zrób pierwszą sztukę bez pośpiechu i celowo popełnij na niej błędy** — potnij dwa warianty odstępów (5 mm i 7 mm), sprawdź oba. Ta sztuka nie jest do sprzedaży, jest do nauki. Druga będzie ta, którą sfotografujecie do katalogu.

Jak zdecydujesz się na finalną geometrię — przygotuję pliki SVG z rozrysowanymi wszystkimi pięcioma warstwami, ramą i szablonem montażowym.
