# Warstwy rastrowe → obrys w Inkscape

## Pliki

| Plik | Zawartość | Uwagi |
|---|---|---|
| `L0_niebo.png` | gwiazda betlejemska z ogonem, księżyc, ~60 gwiazdek | **inwersja!** czarne = drewno, białe = otwory |
| `L1_stajnia.png` | stodoła: dach, brama łukowa, 2 okna, romb w szczycie | ✅ czysta architektura |
| `L2_zwierzeta.png` | wół leżący + osioł stojący + płot | ✅ **wreszcie prawidłowa anatomia** |
| `L3_postacie.png` | Maryja klęcząca, Józef z pastorałem, fałdy szat | ✅ najlepsza z całego zestawu |
| `L4_zlobek.png` | żłóbek z Dzieciątkiem, 4 owce, zaspa | ✅ pierwszy plan |

Folder `upscaled/` — te same pliki **3000 × 3000 px, czysta bitmapa 1-bit** (zero antyaliasingu, zero szarości). **Trace Bitmap na nich daje znacznie czystszy wynik** niż na oryginałach.

---

## Obrys w Inkscape — krok po kroku

1. **Plik → Importuj** → wybierz PNG z folderu `upscaled/` → *Osadź*
2. Zaznacz obrazek → **Ścieżka → Wektoryzuj bitmapę** (`Shift+Alt+B`)
3. Ustawienia:
   - Tryb: **Jednorazowe skanowanie → Odcięcie jasności**
   - Próg: **0,45–0,50**
   - ❌ **Odznacz „Wygładź"** — zaokrągla narożniki, przy laserze niepotrzebne
   - ❌ Odznacz „Ułóż ścieżki w stos"
   - ✅ Zaznacz **„Usuń tło"**
4. **Aktualizuj** → sprawdź podgląd → **OK**
5. Usuń oryginalną bitmapę spod spodu (`Delete` na zaznaczonym obrazku)

## Po obrysie — obowiązkowo

**Uprość ścieżki:** `Ctrl+L` (Ścieżka → Uprość). Raz, maksymalnie dwa razy. Trace generuje setki węzłów; bez tego laser będzie zwalniał na każdym.

**Sprawdź liczbę węzłów:** narzędzie węzłów (`N`), `Ctrl+A`. Rozsądny wynik dla warstwy: 200–800. Jeśli masz 3000+, uprość jeszcze raz.

**Skaluj do 194 × 189 mm:**
- `Ctrl+Shift+M` (Przekształć) albo pole W/H na górnym pasku
- **Zablokuj proporcje** (kłódka)
- Ustaw jednostki na **mm**

**⚠️ L0 wymaga inwersji.** Na obrazku czarne tło = materiał, białe gwiazdy = otwory. Po obrysie Inkscape może zwrócić odwrotnie. Sprawdź: **wypełnij ścieżkę na szaro** — to, co zostanie szare, zostanie z drewna. Jeśli jest odwrotnie, użyj `Ctrl+Shift+K` (rozbij) i popraw, albo prościej — narysuj prostokąt 194×189, zaznacz oba, `Ctrl+*` (Różnica).

**Dodaj obrys warstwy:** prostokąt 194 × 189 mm, zaokrąglenie 2,5 mm, wyśrodkowany na grafice (`Ctrl+Shift+A` → wyśrodkuj w poziomie i pionie).

**Kolory pod laser:** wszystkie ścieżki → wypełnienie **brak**, kontur **czarny 0,1 mm** (albo czerwony `#FF0000`, zależnie od Twojego oprogramowania).

---

## Kontrola przed cięciem

| Sprawdź | Dlaczego |
|---|---|
| **Minimalna grubość detalu ≥ 2 mm** | cieńsze wypadnie lub spali się. Krytyczne: pastorał Józefa, nogi zwierząt, słupki płotu, ogon gwiazdy |
| **Wyspy** — czy żaden element nie jest odcięty od reszty | np. romb w szczycie stodoły wypadnie. Albo zostaw jako otwór, albo dodaj mostek 1,5 mm |
| **Zamknięte ścieżki** | otwarte kontury laser potnie chaotycznie |
| **Brak duplikatów** | Trace czasem tworzy podwójne linie → podwójne przepalenie |

**Test:** wytnij samą warstwę L2 (najwięcej cienkich detali) na odpadzie, zanim potniesz komplet.

---

## Kompozycja i głębia

Kolejność od tyłu: **L0 → L1 → L2 → L3 → L4**

Jeden zabieg, który mocno poprawia efekt: **przeskaluj L1 do ~96%, L2 do ~93%** i wyśrodkuj. Stodoła i zwierzęta staną się optycznie dalsze — perspektywa zbieżna zamiast płaskich plansz. Warstwy L0, L3, L4 zostaw w 100%.

Elementy konstrukcyjne (grzebienie, ścianki, plecki) masz gotowe w SVG w folderze `../CIECIE/` — tam nie było problemu z grafiką, bo to czysta geometria.
