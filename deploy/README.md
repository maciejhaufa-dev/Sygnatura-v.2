# Wdrożenie serwisu (JEDEN SERWER: Oracle Always Free lub VPS)

Ten folder zawiera komplet skryptów, które stawiają cały system na jednej maszynie
pod domeną `studiosygnatura.pl`. Po instalacji serwis **sam się utrzymuje**:
systemd podnosi aplikację po restarcie, cron robi backup o 03:00, certyfikat SSL
odnawia się automatycznie.

## Postawienie serwera — krok po kroku

### 1. Maszyna (Oracle Always Free — 0 zł)
1. Konto na cloud.oracle.com (weryfikacja kartą, bez opłat).
2. Create a VM instance: obraz **Ubuntu 22.04 lub 24.04** (Canonical Ubuntu), shape **VM.Standard.E2.1.Micro** (Always Free eligible, 1 OCPU / 1 GB RAM / do 200 GB dysku).
3. Pobierz/utwórz klucz SSH (albo wygeneruj w konsoli i pobierz klucz prywatny).
4. **Subnet/VCN → Security List → Add Ingress Rules:** 22/TCP (SSH), 80/TCP, 443/TCP (z 0.0.0.0/0).
5. W „Resources → Reserved public IPs" zarezerwuj i przypisz PUBLICZNY IP do VM (żeby IP się nie zmieniało po restarcie).

### 2. Instalacja (jedna komenda)
```bash
ssh ubuntu@IP_SERWERA            # kluczem z kroku 1
sudo bash                        # potem wklej:
git clone --depth 1 --branch arena/01a056f0-sygnatura-v-2 https://github.com/maciejhaufa-dev/Sygnatura-v.2.git /tmp/syg
bash /tmp/syg/deploy/instalacja.sh studiosygnatura.pl
```

### 3. Domena (OVH — 2 wpisy, poczty NIE ruszamy)
W strefie DNS domeny studiosygnatura.pl dodajesz TYLKO:
| Typ | Nazwa | Wartość |
|-----|-------|---------|
| A | (pusta / @) | IP_SERWERA |
| CNAME | www | studiosygnatura.pl |

Rekordy MX/SPF/DKIM poczty (Zimbra/OVH Mail) zostają dokładnie jak są — poczta działa dalej.

### 4. SSL
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d studiosygnatura.pl -d www.studiosygnatura.pl
```

### 5. Konfiguracja w panelu (robi żona / raz)
- `/admin/` → zmień hasło.
- `/admin/ustawienia` → **SMTP OVH**: host `smtp.mail.ovh.net`, port `587`, user + hasło skrzynki `kontakt@studiosygnatura.pl`, nadawca `kontakt@studiosygnatura.pl`. Od tej pory maile (potwierdzenia, powiadomienia, BACKUP nocny) wychodzą z adresu domeny.

## Codzienna obsługa
- **Żona:** panel `/admin/` — zamówienia (statusy), wiadomości, sklep/realizacje (zdjęcia z telefonu), „Pobierz kopię bazy".
- **Automat:** backup 03:00 (lokalnie 30 dni + załącznik na skrzynkę), systemd (autostart), certbot (SSL), nginx (statyki bez Pythona).
- **Aktualizacje:** `sudo sygnatura-aktualizuj` (backup → git pull → restart). Może to robić też agent/właściciel zdalnie.

## Awaria / migracja na inny serwer (cel: < 1 h)
1. Nowa maszyna → kroki 1–2 powyżej.
2. Wgrać ostatnią kopię: `serwis-XXX.db.gz` → rozpakować → `serwis/data/serwis.db`; wgrać też `serwis/data/uploads/`.
3. `systemctl restart sygnatura` + DNS → nowy IP. Gotowe.

## Pliki
- `instalacja.sh` — pełna instalacja (pakiety, kod, venv, systemd, nginx, firewall, cron)
- `sygnatura.service` — usługa systemd (gunicorn, auto-restart)
- `nginx-sygnatura.conf` — serwowanie statyków + proxy do Flaska
- `backup.sh` + `backup_mail.py` — kopia SQLite (.backup), gzip, retencja 30 dni, wysyłka na skrzynkę
- `aktualizuj.sh` — bezpieczna aktualizacja (backup → git pull → restart)
