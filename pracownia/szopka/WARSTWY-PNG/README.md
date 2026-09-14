# WARSTWY-PNG — czysta konwersja SVG → PNG (1:1)

Źródło: **`uploads/Szopka 3D.svg`** (Inkscape, 200×200 mm, 6 warstw L0–L5).

**Zasady konwersji (bez żadnej interpretacji):**
- każda warstwa SVG → osobny PNG, **2400×2400 px = 200×200 mm** (12 px/mm ≈ 304,8 dpi),
- wspólny układ współrzędnych — warstwy idealnie się na siebie nakładają,
- linie → czarne, tło → białe,
- **pominięte**: wypełnienia (podkłady robocze arkusza 754×378 mm ze skalą 0,26458333), prowadnice Inkscape (28 linii), ukrytych elementów w pliku nie ma.

## Mapowanie (etykieta warstwy w pliku ↔ zawartość wg projektu)

| Plik PNG | Etykieta w SVG | Zawartość (opis użytkownika) |
|---|---|---|
| `L0-niebo-rama.png` | L0 | Rama 200×200 (panel tła — niebo) |
| `L1-pasterze-i-2-owce.png` | L1 | **Pasterze i dwie owce** — z lewej 2 pasterzy (stojący + klęczący) i owca; z drugiej klęczący i leżąca przed nim owca |
| `L2-swieta-rodzina-2-owce-2-anioly.png` | L2 | **Święta Rodzina**, dwie owce po bokach, zarys szopki, nad dachem 2 anioły |
| `L3-owca-koza-2-ploty-zarys-szopki.png` | L3 | **Owca i koza** pośrodku, dwa płoty (prawy i lewy), zarys szopki |
| `L4-krowa-osiol-zarys-szopki-chmury.png` | L4 | **Krowa i osioł**, zarys szopki, nad szopką chmury |
| `L5-rozgwiezdzone-niebo.png` | L5 | **Rozgwieżdżone niebo** (księżyc + 34 gwiazdy) |
| `PRZEGLAD-6-warstw.png` | — | Montaż poglądowy wszystkich 6 warstw |

Generator: `v4/tools/warstwy_png.py` (czysty Python + Pillow).
Ponowna konwersja po zmianie SVG: `python3 v4/tools/warstwy_png.py`
