> ⚠️ **NIEAKTUALNE.** Ten katalog zawiera poprzednią wersję znaku (emblemat w prostokątnej ramce, wieniec roślinny).
> Pliki produkcyjne obowiązujące: **`logo/WEKTORY3/`** — sygnet okrągły, logotyp z kreskowaniem 75 %.

---

# Pliki produkcyjne — Studio Sygnatura

## Co jest w folderze

| Plik | Co to | Domyślna szerokość | Ścieżek |
|---|---|---|---|
| `SYGNET_emblemat.svg` | **znak produktowy — tym znakujesz wyroby.** Bez listków. Litera w oryginalnym położeniu, nadal wystaje poniżej ramki; **skrócona została ramka**, nie przesunięta litera. Prześwit = 2,6× grubość kreski | 25 mm | 7 |
| `SYGNET_wieniec.svg` | sam wieniec z literą, bez logotypu (P) | 40 mm | 79 |
| `LOGO_pelne_wieniec.svg` | **logo główne** — wieniec + SYGNATURA | 60 mm | 91 |
| `LOGO_pelne_emblemat.svg` | emblemat + SYGNATURA | 50 mm | 21 |
| `*_3000px_BW.png` | te same znaki, 1-bit, 400 dpi — gdybyś chciał wektoryzować sam | — | — |
| `TEST_rozmiarow_ARKUSZ.svg` | **arkusz do pierwszego wypału**: emblemat 15/25/40 mm + wieniec 20/30/45 mm, pole 160×126 mm | — | — |

Wszystkie SVG: **czysty outline wypełnionych ścieżek, `fill-rule="evenodd"`, zero tekstu, zero grawerowania, zero komentarzy.** Wymiar fizyczny zapisany w mm w nagłówku, więc po imporcie skala jest już poprawna.

## Import do Inkscape

1. `File > Open` → wybierz SVG → **Include** (nie link).
2. Sprawdź w `Object Properties`, że szerokość = wartość z tabeli. Jeśli chcesz inną, skaluj **z Ctrl** (zachowanie proporcji).
3. Nic nie trzeba trace'ować — to już wektor. PNG-i są tylko zapasem.
4. Do lasera: obiekt musi być **wypełnieniem** (fill), nie konturem, jeśli robisz raster/wypał. Do cięcia: `Path > Stroke to Path` odwrotnie — zamień fill na hairline 0,01 mm.

## Test wypału — parametry startowe

Materiał: **odpad sklejki 3 mm**, ten sam, z którego pójdzie produkcja. Nie testuj na innym gatunku, sklejka brzozowa i topolowa palą się zupełnie inaczej.

Wypal `TEST_rozmiarow_ARKUSZ.svg` w trybie **raster / grawer wypełnieniem**:

| Parametr | Start | Uwagi |
|---|---|---|
| Prędkość | 2500–3000 mm/min | wyżej = jaśniej |
| Moc | 25–35 % | dla typowej diody 5 W |
| Gęstość linii | **0,08 mm** (≈ 317 DPI) | poniżej 0,1 mm konieczne przy 15 mm |
| Przejścia | 1 | drugie przejście rozlewa cienką kreskę |
| Rozogniskowanie | 0 | ostro |

Wypal całą płytkę **trzy razy** — 25 %, 30 %, 35 % mocy — obok siebie. Zobaczysz różnicę od razu i wybierzesz.

## Na co patrzeć po wypale

1. **Emblemat 15 mm** — dolna pętla S przecina teraz dolną kreskę ramki z wyraźnym luzem po obu stronach (2,6× grubość kreski ≈ 0,5 mm przy 15 mm, 0,9 mm przy 25 mm). To było wąskie gardło; sprawdź, czy przerwa przetrwała wypał.
2. **Przerwy w bokach ramki** tam, gdzie przecina ją litera — ten sam luz. Jeśli którakolwiek się zlała, minimum produkcyjne to 25 mm.
3. **Wieniec 20 mm** — czy listki nie zlały się w jednolity pierścień. Księga zakłada, że poniżej 25 mm trzeba wariantu uproszczonego. Ten test to potwierdzi albo obali.
4. **Krawędzie** — czy nie ma brązowej aureoli szerszej niż 0,2 mm. Jeśli jest, zbyt duża moc albo zbyt wolny posuw.

Zapisz na odwrocie płytki ołówkiem, który rząd to jaka moc. Zdjęcie tej płytki to zresztą świetny materiał na Pinteresta.

## Znane ograniczenie

`SYGNET_wieniec` ma 79 ścieżek przy bardzo cienkiej kresce — to znak rysunkowy, nie sygnaturowy. Do znakowania wyrobów **używaj emblematu**, wieniec zostaw na etykiety, metki i stronę.
