# Studio Sygnatura — pliki produkcyjne znaku
Wersja finalna · kreskowanie 75 % · sygnet okrągły

## Pliki

| Plik | Szerokość | Zastosowanie |
|---|---|---|
| `LOGO_pelne.svg` | 60 mm | znak główny, brąz `#6B4530` |
| `LOGO_pelne_CZARNY.svg` | 60 mm | pieczątka, grawer, druk jednokolorowy |
| `SYGNET_okrag.svg` | 30 mm | znak produktowy, brąz |
| `SYGNET_okrag_CZARNY.svg` | 30 mm | grawer w wyrobie, naklejki |
| `SYGNET_bez_ramki.svg` | 30 mm | wariant bez okręgu |
| `LOGOTYP.svg` | 60 mm | sam napis |
| `ZNAK_scienny.svg` | 120 mm | sygnet + logotyp, układ pionowy — szyld |
| `*_3000px_BW.png` | — | 1-bit, 400 dpi, do wektoryzacji w Inkscape |

## Zasady

- Wszystko **outline**, `fill-rule="evenodd"`. Zero grawerowania, tekstu i komentarzy w plikach.
- `width` w milimetrach, `viewBox` w pikselach — wymiar fizyczny jest prawidłowy po otwarciu w LightBurn/Inkscape.
- **Kolor znaku: `#6B4530`.** Wersje `_CZARNY` do wszystkiego, co jest jednokolorowe.

## Rozmiary minimalne

- **Logo pełne: nie mniej niż 30 mm szerokości.** Poniżej kreskowanie w SYG zlewa się i napis traci sens.
- **Sygnet okrągły: schodzi do 10 mm.** Poniżej 15 mm zalecany wariant bez cienkich detali gałązki.
- Na wyroby drobne (metki, breloki) — **sam sygnet, bez logotypu**.

## Uwaga wykonawcza

Kreskowanie w SYG to **raster/grawer**, nie ścieżka cięcia. Przy wypalaniu:
- SYG → grawer rastrowy
- NATURA i sygnet → grawer wektorowy lub cięcie

Przy pieczątce 30 mm i mniejszej faktura i tak zniknie pod tuszem — tam używać wariantu pełnego albo samego sygnetu.

## Test wypału

Sklejka 3 mm, 2500–3000 mm/min, moc 25–35 %, gęstość 0,08 mm, 1 przejście.
Zalecenie: trzy rzędy różną mocą na jednej płytce przed pierwszą serią.
