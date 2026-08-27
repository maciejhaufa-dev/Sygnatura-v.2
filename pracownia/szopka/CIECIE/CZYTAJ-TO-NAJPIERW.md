# Pliki cięcia — stan faktyczny

## Uczciwa ocena, zanim cokolwiek potniesz

Zrobiłem cztery podejścia do warstwy ze zwierzętami. **Żadne nie osiągnęło poziomu portfolio** — wół wychodził jak kot, potem jak hipopotam, owce jak żółwie. Nie będę Ci wciskał kolejnej wersji i twierdził, że jest dobra.

**Powód jest techniczny, nie kwestia starania.** Sylwetka zwierzęcia w profilu to krzywa organiczna, którą rysuje się myszą w Inkscape patrząc na kształt — a nie zapisuje jako współrzędne Béziera w kodzie. Każda z moich prób była matematycznie poprawna i wizualnie martwa. To ograniczenie sposobu, w jaki generuję te pliki, i lepiej żebyś o nim wiedział teraz niż po pociętym arkuszu.

---

## Co dostajesz i w jakim stanie

| Plik | Ocena | Do cięcia? |
|---|---|---|
| `L0_niebo.svg` | ✅ **Dobry.** Gwiazda betlejemska, księżyc, gwiazdy 4-ramienne o zróżnicowanej wielkości | tak |
| `L1_stajnia.svg` | ✅ **Dobry.** Czysta architektura — dach, brama łukowa, okna, świetlik | tak |
| `L2_wzgorza_swierki.svg` | ⚠️ **Poprawny, ale bez zwierząt.** Wzgórza + świerki + płot | tak, jako plan B |
| `L3_maryja_jozef.svg` | ✅ **Dobry.** Sylwetki z kapturami, twarze jako wycięcia, laska | tak |
| `L4_zlobek_owce.svg` | ⚠️ **Żłóbek dobry, owce słabe** | żłóbek tak, owce do przerysowania |
| `grzebienie_2szt.svg` | ✅ Konstrukcja, 5 szczelin 3,2 mm | tak |
| `scianki.svg` | ✅ 3 × 196×50 + dolna 202×50 z otworami na wkręty | tak |
| `plecki.svg` | ✅ 202 × 202 mm | tak |

**Wszystkie pliki: czysty outline, jedna warstwa, czarny stroke 0.1 mm, zero grawerów, zero opisów, milimetry, skala 1:1.** Tak jak prosiłeś.

---

## Moja rekomendacja

**Potnij prototyp konstrukcyjny z L0 + L1 + L2(wzgórza) + L3 + żłóbek z L4.** To jest kompozycja, która obroni się bez zwierząt: niebo z gwiazdą, stajnia, wzgórza ze świerkami, Maryja z Józefem, żłóbek na pierwszym planie. Klasyczna, spójna, i **każdy z tych elementów jest geometryczny — czyli mocna strona tych plików.**

Sprawdzisz na niej wszystko, o co Ci chodziło: czy grzebienie trzymają, jaka głębia, jak zachowuje się drut, czy diody nie razą, jaki realny czas montażu.

**Zwierzęta dorysuj sam w Inkscape**, gdy konstrukcja będzie potwierdzona. Zajmie Ci to 40 minut, a wyjdzie lepiej niż wszystko, co tu wygenerowałem — bo widzisz kształt i poprawiasz go w locie. Wstawiasz je do L2 albo robisz szóstą warstwę, obrys i wcięcia zostają te same.

Dobre źródło sylwetek do obrysowania: hasło **„nativity animals silhouette svg"** albo **„ox donkey silhouette side view"** — do podejrzenia proporcji, nie do kopiowania.

---

## Parametry techniczne

- **Warstwy:** 194 × 189 mm, sklejka 3 mm, 5 szt.
- **Grzebienie:** 50 × 196 mm, szczeliny 3,2 mm co 9 mm (głębokości 10/19/28/37/46 mm od tyłu)
- **Ścianki:** 196 × 50 mm (góra, lewa, prawa), dolna 202 × 50 mm z 2 otworami ⌀3,4 mm
- **Plecki:** 202 × 202 mm — pomaluj na biało matowo od wewnątrz
- **Odstęp między warstwami:** 9 mm w osi, czyli 6 mm wolnej przestrzeni

## Przed cięciem — obowiązkowo

1. **Test wpustu na odpadzie.** Wytnij fragment grzebienia i sprawdź, czy sklejka wchodzi na wcisk. Twoja „3 mm" ma realnie 2,8–3,2 mm — skoryguj szerokość szczeliny.
2. **Kerf nie jest skompensowany.** Jeśli laser tnie szeroko, wpusty wyjdą luźne.
3. **Sprawdź detale** — laska Józefa i słupki płotu mają ~4 mm. To bezpieczne, ale nie skaluj plików w dół.
4. Kolejność: **otwory wewnętrzne → obrys zewnętrzny.**
