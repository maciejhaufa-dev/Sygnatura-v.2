#!/usr/bin/env bash
# Studio Sygnatura — aktualizacja serwisu (jedna komenda: najpierw backup, potem kod, potem restart).
# Uruchamiasz jako root:  sygnatura-aktualizuj
set -euo pipefail

GALAZ=arena/01a056f0-sygnatura-v-2
REPO=/opt/sygnatura/repo

echo "==> 1/3 kopia bezpieczeństwa"
/usr/local/bin/sygnatura-backup || true

echo "==> 2/3 pobranie nowego kodu"
cd "$REPO"
sudo -u sygnatura git pull --ff-only origin "$GALAZ"

echo "==> 3/3 zależności + restart"
/opt/sygnatura/venv/bin/pip install -q -r serwis/requirements.txt
chown -R sygnatura:sygnatura serwis v4
systemctl restart sygnatura
sleep 2
systemctl --no-pager status sygnatura --lines=3 || true
echo "AKTUALIZACJA ZAKOŃCZONA"
