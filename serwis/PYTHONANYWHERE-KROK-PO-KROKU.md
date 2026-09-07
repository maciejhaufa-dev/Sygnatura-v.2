# URUCHOMIENIE SERWISU W INTERNECIE — PYTHONANYWHERE (krok po kroku)

> Cel: **darmowy, trwały adres** w sieci, na którym serwis (strona + panel admina + baza)
> działa 24/7. Ty zakładasz konto i klikasz — komendy poniżej wklejasz 1:1.
> GitHub Pages tego NIE zrobi (tylko statyczne pliki) — dlatego PythonAnywhere.

## Krok 1 — konto
1. Wejdź na **https://www.pythonanywhere.com** → *Pricing & signup* → plan **Beginner (FREE)**.
2. Załóż konto (login może być np. `studiosygnatura`).
3. Potwierdź e-mail. **Zapisz login i hasło** (przyda się nam w każdej aktualizacji).

## Krok 2 — wgranie kodu (konsola Bash)
W PythonAnywhere kliknij **Consoles** → **Bash** (otworzy się czarny terminal) i wklej:

```bash
git clone https://github.com/maciejhaufa-dev/Sygnatura-v.2.git
cd Sygnatura-v.2
git checkout -b arena/01a056f0-sygnatura-v-2 origin/arena/01a056f0-sygnatura-v-2
pip3 install --user flask pillow
```

## Krok 3 — aplikacja web
1. Kliknij zakładkę **Web** → **Add a new web app** → **Next**.
2. Wybierz **Flask** → **Python 3.10** → Next (ścieżka projektu może zostać domyślna).
3. Wejdziesz do edytora pliku WSGI. **Podmień CAŁĄ zawartość** na:

```python
import sys
path = '/home/TWOJ_LOGIN/Sygnatura-v.2/serwis'   # <-- podmień TWOJ_LOGIN na swój login!
if path not in sys.path:
    sys.path.insert(0, path)
from app import app as application
```

4. Zapisz (Ctrl+S) → wróć na zakładkę **Web** → naciśnij zielony **Reload**.

## Krok 4 — test
Otwórz w przeglądarce (też na telefonie żony):

- **Strona:** `https://TWOJ_LOGIN.pythonanywhere.com/`
- **Panel:** `https://TWOJ_LOGIN.pythonanywhere.com/admin/` — hasło startowe: `sygnatura-2026`

## Krok 5 — po testach (ważne!)
1. **Zmień hasło** panelu: Ustawienia (w panelu).
2. **SMTP** (żeby maile naprawdę wychodziły): w Ustawieniach wpisz dane poczty
   (dostawca domeny daje skrzynkę; dla Gmaila potrzeba „hasła aplikacji").
   Do tego czasu maile lądują w zakładce **Maile** panelu (podgląd).
3. **Backup bazy:** Files → pobierz `Sygnatura-v.2/serwis/data/serwis.db` (raz na jakiś czas).

## Aktualizacja kodu (po naszych zmianach)
Bash → wklej:
```bash
cd ~/Sygnatura-v.2 && git pull && cd serwis && pip3 install --user flask pillow
```
…i na zakładce Web → **Reload**.

> Baza zostaje nienaruszona przy aktualizacjach (plik `data/serwis.db` nie jest
> w repozytorium — migracje db.py podbijają schemat automatycznie przy starcie).

## Ograniczenia planu FREE (akceptowalne na testy)
- adres `TWOJ_LOGIN.pythonanywhere.com` (własna domena wymaga planu płatnego),
- limit mocy obliczeniowej (spokojnie starczy na wizytówkę i panel),
- wymaga zalogowania się na konto raz na ~3 miesiące (inaczej konto może wygasnąć).

## Dalej (produkcja przed sezonem)
OVH VPS + domena studiosygnatura.pl — pełny przepis w `serwis/WDROZENIE.md` (Etap 2).
