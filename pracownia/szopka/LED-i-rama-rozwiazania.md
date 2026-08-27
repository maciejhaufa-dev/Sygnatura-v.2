# Drucik LED między warstwami + konstrukcja ramy
### Odpowiedzi na konkretne pytania

---

# 1. RAMA ZE SKLEJKI 3 MM + LISTWA SOSNOWA — bardzo dobry pomysł

**Zatwierdzam bez zastrzeżeń.** To jest tańsze i lepsze niż rama z 10 mm sklejki:
- Korpus (4 ścianki) ze sklejki 3 mm, łączony **na zakładki/palce wycinane laserem** — samopozycjonujący się, klei się sam prosto
- Listwa sosnowa 20×20 mm z **rowkiem 3,2 mm** frezowanym po obwodzie, korpus wchodzi w rowek
- Efekt: lekka konstrukcja, ładne lico z litego drewna, koszt niższy o połowę

**Wymiary rowka:** frez 3 mm da rowek ciasny dla sklejki 3 mm (która realnie ma 2,8–3,1 mm). **Zrób 3,2 mm albo frezuj 3 mm i przejedź drugi raz z minimalnym offsetem.** Sklejka musi wchodzić na lekki wcisk, nie na młotek.

⚠️ **Jedna uwaga:** przy korpusie 3 mm nie wyfrezujesz w nim rowka na LED (jak proponowałem wcześniej przy 10 mm). Dlatego rozwiązanie z drutem jest inne — patrz niżej.

---

# 2. ⚠️ REZYGNACJA Z DYFUZORA — tu jest problem

Piszesz, że nie dasz dyfuzora, skoro obkleisz ramkę lampkami. **To nie zadziała tak, jak myślisz** — i to jest najważniejsza rzecz w tej odpowiedzi.

**Dyfuzor i rozmieszczenie LED rozwiązują dwa różne problemy:**

| Problem | Co go rozwiązuje |
|---|---|
| Widać punktowe źródła światła | **kierunek diody** (nie do widza) — to możesz rozwiązać bez dyfuzora ✔ |
| **Tło (L0) wygląda jak dziura, gwiazdy nie świecą** | **tylko dyfuzor** ✘ |

Bez czegokolwiek za warstwą L0 patrzysz **w ciemną pustkę**. Wycięte gwiazdy nie będą świecić — będą czarnymi dziurami. Cały górny obszar nieba zrobi się martwy.

### Minimalne rozwiązanie, jeśli nie chcesz plexi
**Zamiast osobnego dyfuzora — plecki pomalowane na biało matowo.** Sklejka 3 mm od tyłu, biała farba kredowa albo matowa akrylowa, odległość 8–10 mm za L0. Drut LED puszczony w tej ostatniej szczelinie oświetla białą powierzchnię, ona odbija miękkie światło i gwiazdy w L0 świecą.

**Koszt: farba, którą pewnie masz.** Efekt: 80% tego, co plexi opal.

To jest kompromis, który rekomenduję na prototyp. Kalkę/plexi możesz dodać później i porównać.

---

# 3. GDZIE MAJĄ BYĆ LEDY — nie tylko z tyłu

**Odpowiedź na Twoje pytanie: NIE tylko z tyłu.**

Jeżeli dasz światło wyłącznie za L0, wszystkie warstwy zobaczysz jako **jednolite czarne sylwetki na jasnym tle**. To jest efekt „teatru cieni" — ładny, ale płaski. Warstwy zleją się w jedną.

**Żeby warstwy się rozdzieliły, światło musi wchodzić W KAŻDĄ SZCZELINĘ między nimi.** Wtedy każda warstwa jest podświetlona od tyłu przez własne źródło i widać ją jako osobną płaszczyznę z własnym cieniem.

## Rozwiązanie: drut wężykiem, jeden odcinek w każdej szczelinie

Patrz rysunek A. Drut LED prowadzisz **serpentyną**:
1. wchodzi z koszyka baterii w narożniku
2. biegnie w dół w szczelinie 1 (między L0 a L1)
3. przechodzi przez otwór w grzebieniu bocznym
4. biegnie w górę w szczelinie 2 (między L1 a L2)
5. i tak dalej przez wszystkie 4 szczeliny

Przy 5 warstwach masz **4 szczeliny × ok. 18 cm = 72 cm drutu** plus zapas. Drucik 2 m spokojnie wystarczy, nadmiar zwiniesz za pleckami.

---

# 4. JAK PRZEPROWADZIĆ DRUT MIĘDZY WARSTWAMI — grzebień dystansowy

**To jest kluczowy element konstrukcyjny i rozwiązuje trzy problemy naraz.** Patrz rysunek B.

Zamiast klejonych klocków dystansowych wytnij **dwa boczne grzebienie** ze sklejki 3 mm:
- Pasek szerokości ~25 mm, długość = głębokość wnętrza (40 mm) × wysokość ramki
- **Wpusty 3,2 mm** w miejscach warstw — warstwy wchodzą w nie na wcisk
- **Otwory ⌀ 5 mm** poniżej linii warstw — tędy przechodzi drut z jednej szczeliny do drugiej

**Co zyskujesz:**
1. Odstępy są **idealnie równe** i wynikają z pliku, nie z ręki
2. Montaż na wcisk — **możesz złożyć na sucho i rozebrać**, zanim skleisz
3. Drut ma gotowe kanały, nie plącze się i nie widać go od frontu
4. Warstwy nie muszą być klejone do siebie — trzyma je grzebień

**To jest różnica między prototypem a produktem powtarzalnym.** Przy grzebieniu piąta sztuka wyjdzie identycznie jak pierwsza.

Grzebienie umieść **przy samych bocznych ściankach**, żeby były zasłonięte przez ramę od frontu.

---

# 5. KIERUNEK DIOD — to decyduje o wyglądzie

Patrz rysunek C. Drucik LED ma diody wtopione co ~10 cm, świecące dookoła, ale najsilniej prostopadle do drutu.

**Zasada: żadna dioda nie może patrzeć w stronę widza.**

Praktycznie:
- Prowadź drut **przy bocznych ściankach i przy podłodze**, nie w środku szczeliny
- Diody kieruj **w bok (na ściankę) albo w tył (na poprzednią warstwę)**
- Światło ma **odbić się** od jasnej powierzchni i dopiero wtedy oświetlić warstwę

**Ścianki wewnętrzne pomaluj na biało matowo** — to zamienia je w reflektory i zwielokrotnia efekt. Ta jedna czynność daje więcej niż podwojenie liczby diod.

Jeśli mimo wszystko któraś dioda razi przez wycięcie — **kropla białego silikonu albo kawałek taśmy malarskiej na diodzie** rozprasza ją natychmiast.

---

# 6. ZAGĘSZCZENIE DIOD

Standardowy drucik ma diody co 10 cm. Przy szczelinie 18 cm to **tylko 2 diody na warstwę** — za mało, powstaną jasne plamy i ciemne rogi.

**Dwa wyjścia:**
- **Kup drucik z diodami co 5 cm** (opisywane jako „100 LED / 5 m" lub „50 LED / 2,5 m") — to jest właściwy wybór do tej konstrukcji
- Albo **zwijaj drut wężykiem także w pionie**, zagęszczając go w szczelinie

Do ramki 20 × 20 celuj w **3–4 diody na szczelinę**, czyli 12–16 diod łącznie. Drucik 100 LED / 10 m pocięty nie zadziała (to jeden obwód szeregowy) — **kup krótki, gęsty, nie długi i rzadki.**

---

# 7. ZAKTUALIZOWANA LISTA MATERIAŁÓW

| Pozycja | Ilość | Koszt |
|---|---|---|
| Sklejka 3 mm — warstwy, korpus, grzebienie, plecki | arkusz 60×40 | ~16 zł |
| Listwa sosnowa 20×20 mm | 1 m | ~6 zł |
| **Drucik LED gęsty (diody co 5 cm), 2×AA, 2700 K** | 1 kpl | ~12 zł |
| Baterie AA | 2 | ~4 zł |
| Farba biała matowa (plecki + ścianki) | — | z zapasu |
| **RAZEM** | | **~38 zł** |

Nadal bez dyfuzora. Jeśli po prototypie stwierdzisz, że tło jest za słabe — dołóż plexi opal za 14 zł.

---

# 8. KOLEJNOŚĆ MONTAŻU

1. Wytnij: 5 warstw, 2 grzebienie, 4 ścianki korpusu, plecki
2. **Pomaluj na biało: plecki od strony wnętrza + wewnętrzne strony ścianek** — przed montażem
3. Złóż korpus, wklej w rowek listwy sosnowej
4. **Wsuń grzebienie i warstwy NA SUCHO** — sprawdź głębię, zrób zdjęcie
5. Wyjmij warstwy, **przewlecz drut wężykiem** przez otwory w grzebieniach
6. **Test świecenia przed zamknięciem** — sprawdź, czy nie widać punktów
7. Wsuń warstwy z powrotem, ewentualnie kropla kleju w narożnikach
8. Koszyk baterii w wyciętym gnieździe w pleckach, plecki na wcisk (nie klej — dostęp do baterii!)
9. Filcowe stopki

⚠️ **Plecki muszą być zdejmowane.** Klient wymienia baterie. Zrób je na wcisk albo na 4 małych magnesach neodymowych.

---

## Podsumowanie trzech decyzji

| Twoje pytanie | Odpowiedź |
|---|---|
| Rama 3 mm + listwa z rowkiem? | ✅ **Tak, lepsze niż 10 mm.** Rowek 3,2 mm |
| Bez dyfuzora? | ⚠️ **Zastąp go białymi pleckami matowymi.** Bez czegokolwiek gwiazdy będą czarnymi dziurami |
| Tylko z tyłu? | ❌ **Nie. Drut wężykiem w każdej z 4 szczelin** — inaczej warstwy zleją się w płaską sylwetkę |

Jak potwierdzisz geometrię, przygotuję SVG z warstwami, grzebieniami i korpusem — grzebienie z gotowymi wpustami i otworami na drut.
