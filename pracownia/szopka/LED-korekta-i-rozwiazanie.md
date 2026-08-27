# Drucik LED — korekta i właściwe rozwiązanie

## ⚠️ Sprostowanie

W poprzedniej wiadomości napisałem, żebyś kupił drucik z diodami co 5 cm. **To był błąd — takie produkty praktycznie nie istnieją w sprzedaży detalicznej.**

Sprawdziłem rynek: **standard to bezwyjątkowo 10 cm.** Wszystkie warianty trzymają tę samą gęstość:

| Produkt | Diody | Długość | Rozstaw |
|---|---|---|---|
| 20 LED | 20 | 2 m | 10 cm |
| 50 LED | 50 | 5 m | 10 cm |
| 100 LED | 100 | 10 m | 10 cm |

Miałeś rację, że tego nie znajdujesz. Przepraszam za zmyłkę.

---

## Ale to nie jest problem — zmienia się tylko sposób prowadzenia drutu

**Kluczowa zmiana w myśleniu: nie prowadź drutu „jednym przebiegiem przez szczelinę". Zwijaj go w szczelinie.**

Wcześniej liczyłem tak: 4 szczeliny × 18 cm = 72 cm drutu → przy rozstawie 10 cm to tylko 7 diod. Za mało.

Ale drut ma 2 metry. **Nadmiar nie jest wadą, tylko zasobem.** Rozkładasz go tak:

```
2 m drutu ÷ 4 szczeliny = 50 cm na szczelinę
Wysokość szczeliny = 18 cm
50 cm ÷ 18 cm ≈ 2,5 przebiegu w pionie
→ 5 diod na szczelinę
```

**5 diod na szczelinę to dokładnie tyle, ile trzeba.** W każdej szczelinie prowadzisz drut **w górę, w dół i znowu w górę** (zygzak pionowy przy bocznej ściance), potem przechodzisz otworem w grzebieniu do następnej szczeliny.

### Co kupić
**Drucik 20 LED / 2 m, ciepły biały, 2× lub 3× AA — cena 4,70–7,50 zł.**

Linki do konkretnych ofert (sprawdzone):
- [Lampki druciki 20 LED 2m białe ciepłe — 4,90 zł](https://allegro.pl/oferta/lampki-druciki-20-led-na-baterie-2m-biale-cieple-7623376493) — 3× AA, rozstaw 10 cm, opisane wprost w parametrach
- [Lampki 20 Mikro LED drucik ciepły biały — 4,99 zł](https://allegro.pl/oferta/lampki-20-mikro-led-drucik-na-baterie-cieply-bialy-7708068275) — 2,45 m, 3× AA, 4,5 V
- [AD2 Druciki 20 LED + baterie GRATIS — 7,50 zł](https://allegro.pl/oferta/ad2-druciki-20-led-mikro-lampki-baterie-aa-gratis-7002198171) — 2,5 m, 2× AA, baterie w zestawie
- [Wyszukiwarka: drucik LED 2m z timerem](https://allegro.pl/listing?string=drucik+led+2m+timer) — wersje z timerem 6h/18h, ok. 5–9 zł

⚠️ Zwróć uwagę na zasilanie: część zestawów to **2× AA (3 V)**, część **3× AA (4,5 V)**. Do Twojej konstrukcji lepsze jest **3× AA** — jaśniej i dłużej działa. Ale 2× AA też wystarczy, bo w zamkniętej ramce nie potrzebujesz dużo światła.

---

## Czy robić własne podświetlenie z pojedynczych diod?

**Krótka odpowiedź: nie na tym etapie.** Dłuższa — zależy od tego, co chcesz osiągnąć.

### Argumenty przeciw (mocne)
- **Koszt.** Gotowy drucik: ~5 zł za 20 diod z koszykiem, włącznikiem i okablowaniem. Samodzielnie: diody 3 mm (~0,15 zł/szt.), rezystory, koszyk (~4 zł), przewód, cyna. Wyjdzie podobnie **plus 40–60 minut lutowania na każdą sztukę.**
- **Skala.** Przy 50 ramkach to 40 godzin lutowania. To zabija produkt.
- **Ryzyko.** Zimny lut w zaklejonej ramce = reklamacja i pełna rozbiórka.
- **Problem napięciowy.** Białe LED-y mają Vf ≈ 3,0–3,2 V. **Na 2× AA (3 V) będą świecić słabo i gasnąć w miarę rozładowania baterii.** Musiałbyś iść w 3× AA (4,5 V) z rezystorami ~68 Ω na diodę. Da się, ale to już projekt elektroniczny, nie dekoracja.

### Kiedy DIY ma sens
Gdy chcesz **precyzyjnie sterować, gdzie świeci** — np. jedna dioda punktowo za gwiazdą betlejemską, żeby świeciła mocniej niż reszta. Wtedy **hybryda**: drucik jako oświetlenie ogólne + jedna dioda dolutowana punktowo.

**Ale to robisz dopiero w wersji premium 30 × 30 cm, nie w prototypie.**

### Środek, jeśli chcesz więcej kontroli
Kup **dwa druciki 20 LED zamiast jednego** (10 zł zamiast 5) i podłącz je do wspólnego koszyka. Masz 40 diod, każdy drut obsługuje 2 szczeliny, prowadzenie jest krótsze i prostsze. **To jest lepsze rozwiązanie niż lutowanie od zera.**

---

## Zaktualizowana instrukcja prowadzenia drutu

**Wersja z jednym drucikiem 20 LED / 2 m:**

1. Koszyk baterii w gnieździe w pleckach, drut wychodzi w dolnym rogu
2. **Szczelina 1** (za L0, przy białych pleckach): zygzak pionowy 2,5 przebiegu przy lewej ściance → ~5 diod
3. Przelot otworem ⌀5 mm w grzebieniu
4. **Szczelina 2:** to samo, ale przy prawej ściance *(naprzemiennie — unikasz jasnego pasa po jednej stronie)*
5. **Szczelina 3:** lewa ścianka
6. **Szczelina 4:** prawa ścianka
7. Końcówkę drutu zwiń i schowaj za pleckami

**Wersja z dwoma drucikami (polecam do 30 × 30):**
- Drucik A: szczeliny 1 i 2
- Drucik B: szczeliny 3 i 4
- Oba do jednego koszyka 3× AA, równolegle

---

## Poprawiona lista zakupów

| Pozycja | Ilość | Koszt |
|---|---|---|
| Sklejka 3 mm | arkusz 60×40 | ~16 zł |
| Listwa sosnowa 20×20 | 1 m | ~6 zł |
| **Drucik 20 LED / 2 m, 3× AA, ciepły biały** | 1 szt. | **~5 zł** |
| Baterie AA | 3 | ~5 zł |
| Farba biała matowa | — | z zapasu |
| **RAZEM** | | **~32 zł** |

Kup od razu **3 druciki** (15 zł) — jeden na prototyp, dwa na eksperymenty z zagęszczeniem. Przy tej cenie nie ma sensu oszczędzać.

---

## Jedna rzecz do sprawdzenia na prototypie

Przy rozstawie 10 cm **diody będą widoczne jako pojedyncze punkty, jeśli któraś wypadnie naprzeciw wycięcia w warstwie.** Dlatego:

- Prowadź drut **przy samych ściankach bocznych**, nie w środku
- Po przewleczeniu, **przed zamknięciem, włącz światło i popatrz od frontu** — jeśli któraś dioda razi, przesuń drut o 2–3 cm
- Białe matowe ścianki są tu kluczowe: zamieniają punkt w miękką poświatę

To jest dokładnie ten moment, w którym prototyp zarabia na siebie — takich rzeczy nie da się przewidzieć na ekranie.
