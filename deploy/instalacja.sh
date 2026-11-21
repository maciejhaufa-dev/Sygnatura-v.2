#!/usr/bin/env bash
# Studio Sygnatura — instalacja serwera produkcyjnego (Oracle Cloud / dowolny VPS).
# Uruchom na ŚWIEŻYM Ubuntu 22.04/24.04 jako root:
#   bash instalacja.sh studiosygnatura.pl
set -euo pipefail

DOMENA="${1:-studiosygnatura.pl}"
APLIKACJA=/opt/sygnatura
USERSYS=sygnatura
REPO=https://github.com/maciejhaufa-dev/Sygnatura-v.2.git
GALAZ=arena/01a056f0-sygnatura-v-2

echo "==> pakiety systemowe"
apt-get update -y
apt-get install -y python3-venv python3-pip git nginx sqlite3 ufw

echo "==> użytkownik serwisu (bez roota)"
id -u "$USERSYS" &>/dev/null || useradd -m -s /bin/bash "$USERSYS"
mkdir -p "$APLIKACJA"
chown "$USERSYS":"$USERSYS" "$APLIKACJA"

echo "==> kod (sparse-checkout: tylko serwis/ i v4/ — bez pracowni/uploads)"
if [ ! -d "$APLIKACJA/repo/.git" ]; then
  sudo -u "$USERSYS" git clone --no-checkout --filter=blob:none "$REPO" "$APLIKACJA/repo"
fi
cd "$APLIKACJA/repo"
sudo -u "$USERSYS" git sparse-checkout init --cone || true
sudo -u "$USERSYS" git sparse-checkout set serwis v4 deploy || true
sudo -u "$USERSYS" git checkout "$GALAZ" || sudo -u "$USERSYS" git pull --ff-only origin "$GALAZ"

echo "==> środowisko Pythona"
if [ ! -d "$APLIKACJA/venv" ]; then
  sudo -u "$USERSYS" python3 -m venv "$APLIKACJA/venv"
fi
"$APLIKACJA/venv/bin/pip" install -q -r serwis/requirements.txt

echo "==> katalogi danych (baza, zdjęcia, dokumenty) i backup"
mkdir -p serwis/data/uploads serwis/data/dokumenty
mkdir -p "$APLIKACJA/backup"
chown -R "$USERSYS":"$USERSYS" serwis/data "$APLIKACJA/backup"

echo "==> usługa systemd (sama wstaje po restarcie serwera)"
install -o root -g root -m 644 deploy/sygnatura.service /etc/systemd/system/sygnatura.service
systemctl daemon-reload
systemctl enable --now sygnatura

echo "==> nginx (statyki + proxy)"
sed "s/@@DOMENA@@/$DOMENA/g" deploy/nginx-sygnatura.conf > /etc/nginx/sites-available/sygnatura
ln -sf /etc/nginx/sites-available/sygnatura /etc/nginx/sites-enabled/sygnatura
rm -f /etc/nginx/sites-enabled/default
systemctl reload nginx

echo "==> firewall (SSH + HTTP/HTTPS)"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "==> backup nocny (cron 03:00) + skrypt aktualizacji"
install -o root -g root -m 700 deploy/backup.sh /usr/local/bin/sygnatura-backup
install -o root -g root -m 755 deploy/aktualizuj.sh /usr/local/bin/sygnatura-aktualizuj
( crontab -l 2>/dev/null | grep -v sygnatura-backup || true; echo "0 3 * * * /usr/local/bin/sygnatura-backup >> /var/log/sygnatura-backup.log 2>&1" ) | crontab -

echo ""
echo "=============================================================="
echo " GOTOWE. Teraz:"
echo " 1. U OVH w DNS:  A @ -> IP tego serwera,  CNAME www -> $DOMENA"
echo "    (MX/SPF/DKIM poczty NIE ruszasz)"
echo " 2. W Oracle Console: Security List VM -> otwórz porty 80 i 443 (ingress)"
echo " 3. Certyfikat SSL:  certbot --nginx -d $DOMENA -d www.$DOMENA"
echo "    (jeśli brak certbota: apt install -y certbot python3-certbot-nginx)"
echo " 4. Sprawdź: http://$DOMENA/ (potem https)"
echo " 5. Panel /admin/ — zmień hasło; Ustawienia -> wpisz SMTP OVH"
echo "=============================================================="
