# GRBL 1.1h – automatyczne zero roboczego po bazowaniu

Patch na oficjalne źródła GRBL v1.1h (tag `v1.1h.20190825`, commit 40eb439).

## Co robi
1. `HOMING_FORCE_SET_ORIGIN` – po bazowaniu pozycja maszyny osi = odsunięcie od krańcówki
   (`homing_pulloff`, kierunek zależny od `$23`), zamiast 0 na krańcówce.
2. `HOMING_SET_WORK_ORIGIN` (nowy define w `config.h`) – po zakończonym bazowaniu zapisuje
   G54 tak, że zero roboczego leży w punkcie odsunięcia. Efekt: po `$H` WPos = 0,0 w rogu.

## Skutki uboczne (świadomie zaakceptowane)
- Ręczne zero ustawione **przed** `$H` jest nadpisywane przez bazowanie.
- Ręczne zero ustawione **po** `$H` (przycisk Zero / `G10 L20`) zostaje do następnego bazowania.
- Zapis G54 do EEPROM odbywa się przy każdym `$H` (zużycie EEPROM minimalne).

## Instalacja (w Twoim projekcie PlatformIO `grbl-plotter`, `src_dir = grbl`)
1. Skopiuj `homing-work-origin.patch` do katalogu projektu.
2. Z katalogu głównego projektu (tam, gdzie leży folder `grbl/`):
   `git apply homing-work-origin.patch` (ścieżki w patchu to `grbl/limits.c` i `grbl/config.h`).
   Jeśli nie masz gita w projekcie, użyj `patch -p1 < homing-work-origin.patch`
   albo wprowadź zmiany ręcznie wg opisu powyżej.
3. Build i upload w VS Code (PlatformIO) – `PlatformIO: Upload`.
4. Po wgraniu: `$$` – sprawdź ustawienia; `$H`; w konsoli `?` → MPos 1.5/1.5, WCO 1.5/1.5 (WPos 0/0).

## Test po wgraniu (bez lasera)
- `$H` → w UGS/LaserGRBL DRO powinno pokazać WPos 0,0.
- Ręczne przesunięcie 100 mm i `$H` ponownie → zero wraca do rogu.
- Przycisk „ZACZNIJ OD 0.0” (`G10 L2 P1 X1.5 Y1.5`) nie jest już potrzebny; możesz go usunąć albo zostawić jako awaryjny.

Uwaga: nie kompilowano w PlatformIO w tej sesji (brak toolchaina AVR w sandboxie).
Składnia funkcji `limits_go_home` sprawdzona kompilatorem hosta na atrapach nagłówków AVR.
