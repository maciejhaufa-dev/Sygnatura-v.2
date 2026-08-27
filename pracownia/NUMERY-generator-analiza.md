# Numery na drzwi i dom + generator projektów
Analiza wykonalności i konwersji · 26.08.2026 · **dokument koncepcyjny, nic nie kodujemy**

---

## 1. Rynek — gdzie są pieniądze

| Segment | Cena | Kto |
|---|---|---|
| Numer PCV / dibond drukowany | 20–45 zł | masówka, Allegro |
| Plexi z folią na dystansach | 42–66 zł | masówka |
| Drewniana tabliczka „loft" | 24–50 zł | masówka |
| Grawer w laminacie | 45–107 zł | zakłady grawerskie |
| **Stal nierdzewna cięta laserem** | **114–390 zł** | premium |
| **Stal corten** | **147–429 zł** | premium |
| **Numer podświetlany solarny (drewno)** | **299 zł** | premium |

**Wniosek: segment premium 150–430 zł istnieje i ma się dobrze.** Nikt w nim nie sprzedaje tego, co wy potraficie — **warstwowego drewna z wzorem**. Corten i stal to estetyka industrialna. Wasza „8" to zupełnie inna półka wizualna i nie konkuruje z nimi ceną, tylko charakterem.

Teza „personalizowanych znaków w Polsce nie ma" jest **w połowie prawdziwa**: personalizacja jest wszędzie (wpisz numer, wybierz rozmiar), ale **projektowania po stronie klienta nie ma nigdzie**. To jest realna luka.

---

## 2. ⚠️ PROBLEM, KTÓRY TRZEBA ROZWIĄZAĆ NAJPIERW

**Sklejka brzozowa 3 mm na zewnątrz w polskim klimacie rozwarstwi się w 1–2 sezony.** Lakier tego nie zatrzyma — woda wchodzi krawędziami i przez mikropęknięcia wokół detalu. Przy wzorze ciętym na wylot powierzchnia narażona rośnie kilkukrotnie.

To nie jest teoretyczne ryzyko. To **gwarantowana reklamacja w drugą wiosnę**, przy produkcie za 200+ zł, od klienta, który mieszka 5 km od was i wie, gdzie pukać.

### Rozwiązanie: rozdzielić na dwa produkty

**A. NUMER NA DRZWI — wnętrze** *(to jest wasza „8")*
- Sklejka 3 mm, warstwy, wzór, wszystko co potraficie
- Odbiorcy: mieszkania w blokach i kamienicach, apartamenty na wynajem, **pokoje w pensjonatach i agroturystyce**, gabinety, numery pokoi w domu
- Zero ryzyka pogodowego
- **Cena 89–149 zł**

**B. NUMER NA DOM — zewnątrz**
- **Lite drewno frezowane na CNC**: dąb, modrzew, robinia. Nie sklejka.
- Albo warstwa dekoracyjna **za plexi** — wzór chroniony szybą
- Olej zewnętrzny, montaż na dystansach (odstęp od ściany = obieg powietrza)
- Uczciwa informacja w opisie: **drewno na zewnątrz wymaga olejowania raz na 2 lata**. Klient premium to rozumie i akceptuje, bo tak samo dba o taras.
- **Cena 189–349 zł**

Wariant B jest trudniejszy i wolniejszy, ale to **jedyna wersja, którą można sprzedawać bez wpisywania sobie reklamacji do kalendarza.**

---

## 3. Ekonomika

**Numer wewnętrzny 15×15 cm, 3 warstwy:**

| | |
|---|---|
| Materiał (sklejka, bejca, dystanse, klej) | 9 zł |
| Laser (tło z wzorem 12 min + cyfra 4 min + rama 5 min) | 21 min |
| Wykończenie i montaż | 20 min |
| **Razem czas** | **~41 min** |
| **Cena** | **119 zł** |
| **Zł/h** | **~160 zł/h** |

**To najlepszy wskaźnik w całej ofercie.** Lepszy niż metryczka (126 zł/h), dwukrotnie lepszy niż szopka (47 zł/h).

Powód jest prosty: produkt jest mały, wzór robi cała maszyna bez waszego udziału, a montaż to trzy warstwy na klej. **Niska pracochłonność ręczna przy wysokiej wartości postrzeganej.**

Dodatkowo: **odpad z większych projektów.** Numer 15×15 mieści się w ścinkach po metryczkach i szopkach. Materiał realnie kosztuje mniej niż 9 zł.

---

## 4. Generator — wykonalność

Rozbijam pomysł na elementy, bo różnią się trudnością o rzędy wielkości.

| Element | Trudność | Uwagi |
|---|---|---|
| Wybór kształtu (koło / kwadrat / owal / heksagon) | 🟢 łatwe | kilka gotowych ścieżek |
| Wpisanie numeru, do 4 znaków | 🟢 łatwe | |
| Wybór czcionki z Google Fonts | 🟡 średnie | `opentype.js` zamienia tekst na ścieżki w przeglądarce. Licencja OFL pozwala na komercyjne użycie wyrobów. **Ale**: ograniczyć do 12–15 sprawdzonych krojów, nie do całej biblioteki — większość nie nadaje się do cięcia (cienkie szeryfy, wiszące elementy) |
| Wybór wzoru tła z biblioteki | 🟢 łatwe | 10–20 waszych wzorów |
| **Wgranie własnego wzoru przez klienta** | 🔴 **trudne i ryzykowne** | patrz niżej |
| Liczba warstw | 🟡 średnie | wpływa na geometrię i cenę |
| Styl ramki | 🟢 łatwe | |
| Kalkulator ceny | 🟡 średnie | liczy długość ścieżek → czas lasera → cena. Da się w JS |
| Podgląd 2D | 🟢 łatwe | zwykły SVG |
| **Podgląd 3D** | 🟡 średnie | `three.js`, wyciągnięcie ścieżek w bryły. Wykonalne, ale **musi wyglądać dobrze, bo inaczej szkodzi** |
| Wysyłka projektu formularzem | 🟢 łatwe | projekt zakodowany w tekście → Formspree |
| **Logowanie i zapis projektu** | 🔴 **łamie model** | patrz niżej |

### Dwa elementy, które odradzam na starcie

**Wgrywanie własnego wzoru.** Klient wrzuci zdjęcie kota z telefonu. Zamiana rastra na ścieżki cięcia w przeglądarce jest zawodna, a wynik trzeba i tak ręcznie sprawdzić przed wypałem. Do tego dochodzą **prawa autorskie** — klient wgra grafikę z internetu, a wy ją wytniecie i sprzedacie. Zamiast tego: **biblioteka 15–20 waszych wzorów** plus pole „masz własny pomysł? napisz do nas". Efekt dla klienta prawie ten sam, ryzyko zerowe.

**Logowanie i zapis projektu.** Wymaga serwera i bazy, czyli **koniec darmowego GitHub Pages** i wejście w RODO z kontami użytkowników. Alternatywa bez backendu: **cały projekt zakodowany w adresie URL**. Klient klika „zapisz", dostaje link, wysyła go sobie mailem albo wam. Działa identycznie z punktu widzenia klienta, kosztuje 0 zł i nie przechowuje żadnych danych osobowych.

---

## 5. Czy to będzie konwertować — uczciwa odpowiedź

### Argumenty za
- **Czas na stronie** rośnie wielokrotnie. Klient, który 4 minuty układa własny numer, jest o rząd wielkości bardziej zaangażowany niż ten, który przewija zdjęcia.
- **Efekt IKEA** — ludzie cenią wyżej to, co sami współtworzyli. To zwiększa gotowość do zapłaty i zmniejsza liczbę zwrotów.
- **Uzasadnia cenę.** Klient widzi, że dodanie warstwy podnosi kwotę. Cena przestaje być „ich widzimisię", staje się wynikiem jego decyzji.
- **Nikt w PL tego nie ma.** Sam generator jest materiałem na treść: film „zaprojektuj swój numer w 60 sekund" chodzi na Pinterest i Instagram lepiej niż zdjęcie produktu.
- **Kwalifikuje leada.** Kto przeszedł konfigurator, ten naprawdę chce kupić.

### Argumenty przeciw — i są poważne
- **Większość ludzi nie chce projektować. Chce wybrać.** Pusty kreator paraliżuje. Standardowo w tego typu produktach **80 % zamówień idzie z gotowców**, a konfigurator obsługuje resztę.
- **Każde dodatkowe pole to utrata części klientów.** Konfigurator z ośmioma decyzjami będzie miał gorszą konwersję niż strona z sześcioma gotowcami i polem „wpisz numer".
- **Koszt wytworzenia jest ogromny w porównaniu z resztą planu.** Pełna wizja — Google Fonts, własne wzory, 3D, konta — to realnie **kilkadziesiąt godzin twojej pracy**. Te same godziny włożone w wykonanie i sfotografowanie 10 gotowych produktów dadzą sprzedaż znacznie wcześniej.
- **Podgląd 3D, który wygląda przeciętnie, obniża wartość postrzeganą.** Klient premium woli jedno świetne zdjęcie prawdziwego wyrobu niż ładny, ale plastikowy render.

### Wniosek
**Pomysł jest dobry, ale kolejność ma go zabić albo uratować.**

Generator zbudowany **przed** pierwszą sprzedażą to klasyczna pułapka: miesiąc kodowania, zero przychodu, zero zdjęć, zero opinii. Generator zbudowany **po** tym, jak sprzedacie pierwsze 20 numerów, opiera się na wiedzy, których wzorów ludzie faktycznie chcą — i wtedy jest wart tych godzin.

---

## 6. Rekomendowana kolejność

**Etap 0 — teraz, przed 21.09**
Nic nie kodować. Zrobić **6 gotowych wzorów numeru wnętrzowego** (kwiaty jak w „8", geometria, las, fala, plaster miodu, minimal) i je sfotografować. Na stronie: galeria + pole „wpisz swój numer" + formularz. **To sprzedaje już w przyszłym tygodniu.**

**Etap 1 — październik, jeśli numery się sprzedają**
Prosty konfigurator 2D, cztery decyzje: kształt → wzór z biblioteki → czcionka z 12 sprawdzonych → numer. Podgląd SVG na żywo, cena przeliczana na bieżąco, wysyłka formularzem, projekt zakodowany w URL. **Bez 3D, bez wgrywania wzorów, bez kont.** To jest weekend pracy, nie miesiąc.

**Etap 2 — zima, jeśli konfigurator jest używany**
Podgląd 3D w `three.js`, więcej warstw, warianty frezowane na CNC, numer zewnętrzny z litego drewna.

**Etap 3 — dopiero gdy jest ruch**
Zapis projektów, konta, katalog wzorów zamawianych indywidualnie.

**Zasada: każdy etap ma sens sprzedażowy sam z siebie.** Jeśli po etapie 0 okaże się, że numery nie idą, oszczędzacie sobie miesiąc pracy nad kreatorem do produktu, którego nikt nie chce.

---

## 7. Osobna kategoria — tak

Zgoda co do struktury. Numery to **inny klient niż metryczki**: kupuje dla siebie, nie na prezent, i szuka konkretnego rozwiązania zamiast się inspirować. Powinny mieć własną zakładkę, własne słowa kluczowe („numer na drzwi", „tabliczka na mieszkanie", „numer domu drewniany") i własne tablice na Pinterest.

**Numer wnętrzowy ma jeszcze jedną zaletę, o której nie wspomniałeś:** to najtańszy sposób, żeby ktoś kupił u was cokolwiek po raz pierwszy. 119 zł to próg, przez który przechodzi się bez zastanowienia — a metryczka za 349 zł wymaga decyzji. **Numer jest produktem wejściowym do marki.**

---

# AKTUALIZACJA 2026-08-27 — zawężenie zakresu (decyzja użytkownika)

Kategoria zostaje rozdzielona ostatecznie i **nie łączymy jej w jeden produkt**:

## A. NUMER NA DRZWI MIESZKANIA — ⭐ produkt główny tej linii
Sklejka **falcata 3 mm**, warstwy, wzór wycinany, cyfra na dystansie, ramka. To jest dokładnie ta „8" ze zdjęcia.

- Klient: mieszkania w blokach i kamienicach, pensjonaty, apartamenty na wynajem, gabinety, biura.
- **Wnętrze = problem trwałości znika.** Brak wody, brak UV, brak cykli zamarzania → sklejka jest tu materiałem właściwym, nie kompromisem.
- Do 4 znaków. Ramki: koło / kwadrat / owal.
- **89–149 zł · ~41 min · ~160 zł/h** — najlepszy wskaźnik w ofercie.
- Mieści się w ścinkach po metryczkach.
- ⭐ **Rynek zbiorowy:** pensjonat lub apartamentowiec zamawia **kilkanaście–kilkadziesiąt sztuk naraz**, jednym wzorem. To jedno zamówienie warte więcej niż dziesięć metryczek, przy ułamku pracy projektowej. **To najmocniejszy argument za tą kategorią** — i kanał B2B bez cold outreachu (wchodzi się przez zapytanie ofertowe od klienta, nie odwrotnie).

## B. NUMER NA DOM — wyłącznie CNC, forma szyldu/emblematu
⛔ **Zero sklejki. Zero warstw. Zero dystansów.**
Drewno lite / **klejonka 18–20 mm**, rzeźbione na frezarce, jako jeden zwarty emblemat: numer + ewentualnie nazwisko, w obrysie tarczy/owalu.

- Materiał: **klejonka dębowa, jesionowa lub modrzewiowa, suszona komorowo.** ⛔ Iglaste żywiczne odpadają — patrz TECH-BOOK §1.3.
- Wykończenie: olej zewnętrzny, odnawianie co ~2 lata (wpisać w kartę produktu jako zaletę, nie wadę).
- **189–349 zł.** Konkurencja: corten 121–429 zł, stal 114–390 zł, wyłącznie estetyka industrialna. **Rzeźbione drewno = pusta półka.**
- **Etap 2 (zima).** Nie przed 21.09 — wymaga rozpoznania dostawcy klejonki, prób frezowania i wykończenia zewnętrznego.

## Konsekwencja dla generatora
Konfigurator budujemy **wyłącznie pod A** (numer na drzwi). Warstwy, wzory, ramki, fonty — to wszystko ma sens tylko w produkcie płaskim i warstwowym. Emblemat CNC jest rzeźbą, nie składanką; sprzedaje się go przez galerię realizacji i indywidualną wycenę, nie przez suwaki.
