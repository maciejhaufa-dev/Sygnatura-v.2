# GitHub Pages — jak włączyć (1 krok)

Strona v4 jest już wypchnięta do repo w folderze **`docs/`** (gałąź `arena/01a056f0-sygnatura-v-2`).
Wystarczy włączyć publikację:

1. Wejdź na https://github.com/maciejhaufa-dev/Sygnatura-v.2
2. **Settings → Pages**
3. „Build and deployment" → **Source: Deploy from a branch**
4. Branch: **`arena/01a056f0-sygnatura-v-2`** · Folder: **`/docs`** → **Save**
5. Poczekaj 1–2 min → strona staje pod adresem:

**https://maciejhaufa-dev.github.io/Sygnatura-v.2/**

## Uwagi

- Po każdej aktualizacji strony generuję `docs/` na nowo i pushuję — Pages przebudowuje się automatycznie.
- Podgląd roboczy (bez GitHub): **https://8080-iltxoxwpsn9ujvnw2mcr6.e2b.app/** — serwer wysyła nagłówki no-cache, więc zmiany widać od razu (jeśli telefon trzyma starą wersję: odśwież z czyściwem / otwórz w trybie prywatnym).
- Gdy podepniecie własną domenę (studiosygnatura.pl): dodaj plik `CNAME` z domeną do `docs/` i ustaw rekord DNS u rejestratora.
- Dlaczego nie włączyłem Pages sam: konto bota Arena nie ma uprawnienia do zmiany ustawień Pages w Twoim repo (403 z API). Cała zawartość jest gotowa — brakuje tylko tego przełącznika.
