# Wdrożenie serwisu — gdzie to ma stać i dlaczego tak

## Odpowiedź na pytania (krótko)

| Pytanie | Odpowiedź |
|---|---|
| GitHub Pages? | **NIE.** Pages to hosting CZYSTO STATYCZNY — nie uruchamia Pythona ani bazy danych. Nie postawimy tam serwisu z panelem. Pages zostaje jako wizytówka (index, galeria itd.). |
| Dysk Google / Sheets jako baza? | **NIE jako baza.** Arkusz to nie baza danych (limity, wolne zapytania, brak transakcji). Arkusz zostaje jako LUSTRo/eksport — webhook już jest w kodzie (każde zgłoszenie i zmiana statusu mogą wpadać do arkusza). |
| OVH — mają hosting? | **TAK, ale:** hosting współdzielony OVH (Perso/Pro) to PHP+MySQL — Flask tam nie ruszy. OVH ma też **Cloud Web** z Pythonem (43,99 zł netto/mc, runtime zarządzany — działa, ale bez pełnej kontroli) oraz **VPS** (~20-30 zł/mc) — pełna kontrola, własny Python. Własna domena zostaje w OVH bez względu na wybór. |
| Baza w chmurze (komputer nie 24/7)? | Rozwiązanie: serwis stoi na **zawsze włączonym serwerze w chmurze** (nie na Twoim PC). Plik SQLite żyje na tym serwerze. To jest „baza w chmurze" — bez żadnych dodatkowych usług. |
| Test na telefonie TERAZ? | **TAK** — podgląd sandboxa: otwórz link z panelu „Serwis Sygnatura (Flask)" (adres: `https://8000-<id-sandboxa>.e2b.app/`). Uwaga: podgląd żyje tylko podczas sesji — to nie jest trwały adres. |

## Plan wdrożenia (krok po kroku)

### Etap 0 — test na telefonie (teraz)
Otwórz podgląd (link wyżej) na telefonie. Sprawdź: /wynajem/, formularz, /admin/ (hasło startowe `sygnatura-2026`).
Poprawki responsywne już weszły (kalendarze, tabele admina przewijane poziomo, przyciski pełnej szerokości).

### Etap 1 — „żywy organizm" do testów: PythonAnywhere (DARMOWY, zalecany)
Dlaczego: trwały dysk (SQLite przeżywa restart), zawsze włączone, konsola w przeglądarce, zero karty kredytowej.

1. Załóż konto na pythonanywhere.com (darmowy plan „Beginner").
2. W konsoli (zakładka **Consoles → Bash**):
   ```bash
   git clone https://github.com/maciejhaufa-dev/Sygnatura-v.2.git
   cd Sygnatura-v.2/serwis
   pip3 install --user flask
   ```
3. Zakładka **Web → Add a new web app → Flask → wybierz Python 3.10**.
4. W edytorze pliku WSGI podmień całość na:
   ```python
   import sys
   sys.path.insert(0, '/home/TWOJLOGIN/Sygnatura-v.2/serwis')
   from app import app as application
   ```
5. **Reload** strony. Serwis działa pod `https://TWOJLOGIN.pythonanywhere.com/`.
6. Hasło panelu zmień w Ustawieniach (baza jest na dysku PA — trwała).
7. SMTP: dane od dostawcy poczty (dhosting/home.pl/Gmail z hasłem aplikacji) w Ustawieniach — wtedy maile wychodzą naprawdę.
8. Google Sheets: utworzyć arkusz + skrypt Apps Script (osobny krok — zrobimy razem).

Ograniczenia darmowego PA: nie podepniemy własnej domeny (wymaga planu Hacker ~5 USD/mc), limit CPU. Do testów — w sam raz.

### Etap 2 — produkcja: OVH VPS (masz już konto i domenę w OVH)
1. Kup VPS (VLE-2 ~20-30 zł/mc, wystarczy).
2. SSH na VPS:
   ```bash
   apt update && apt install -y python3 python3-pip nginx
   git clone https://github.com/maciejhaufa-dev/Sygnatura-v.2.git
   cd Sygnatura-v.2/serwis
   pip3 install -r requirements.txt
   ```
3. Uruchomienie jako usługa (plik `/etc/systemd/system/sygnatura.service`):
   ```ini
   [Unit]
   Description=Studio Sygnatura serwis
   After=network.target

   [Service]
   WorkingDirectory=/root/Sygnatura-v.2/serwis
   ExecStart=/usr/local/bin/gunicorn app:app --bind 127.0.0.1:8001 --workers 2
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```
   ```bash
   systemctl enable --now sygnatura
   ```
4. Nginx jako front + HTTPS (certyfikat Let's Encrypt, darmowy):
   ```nginx
   server {
       listen 80;
       server_name studiosygnatura.pl www.studiosygnatura.pl;
       location / { proxy_pass http://127.0.0.1:8001; proxy_set_header Host $host; }
   }
   ```
   ```bash
   apt install -y certbot python3-certbot-nginx && certbot --nginx
   ```
5. **DNS w OVH:** rekord A dla `studiosygnatura.pl` → IP VPS (i A dla `www`).
6. Backup bazy (codzienny cron, do dysku Google/Dropbox):
   ```bash
   0 3 * * * cp /root/Sygnatura-v.2/serwis/data/serwis.db /root/backup/serwis-$(date +\%F).db
   ```

### Alternatywy
- **Render (darmowy):** deployment z repo (render.yaml jest gotowy), własna domena za darmo — ALE darmowy plan ma dysk efemeryczny (baza kasuje się przy deployu) i usypia po 15 min. Sensowny dopiero na planie płatnym (~7 USD/mc) lub z bazą Turso.
- **OVH Cloud Web (43,99 zł netto/mc):** Python jest, ale runtime zarządzany — mniej kontroli niż VPS przy podobnej cenie. VPS to lepszy stosunek możliwości do kosztu.

## Podsumowanie rekomendacji
1. **Teraz:** test na telefonie przez podgląd sandboxa.
2. **W tym tygodniu:** PythonAnywhere (darmo) — trwały „żywy organizm" pod publicznym adresem, bez kosztów.
3. **Przed startem sezonu:** OVH VPS + domena studiosygnatura.pl + SMTP + Sheets + backup.
4. **GitHub Pages:** zostaje jako wizytówka statyczna — żadnej zmiany.
