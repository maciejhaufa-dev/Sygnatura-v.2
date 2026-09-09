#!/usr/bin/env bash
# Studio Sygnatura — backup nocny (cron 03:00).
# 1) bezpieczna kopia SQLite (działa przy uruchomionej aplikacji)
# 2) gzip + retencja 30 dni w /opt/sygnatura/backup
# 3) kopia bazy na skrzynkę OVH (załącznik) — jeśli SMTP jest skonfigurowany
set -euo pipefail

DATA=/opt/sygnatura/repo/serwis/data
BACKUP=/opt/sygnatura/backup
VENV=/opt/sygnatura/venv/bin/python
TS=$(date +%Y%m%d-%H%M)

mkdir -p "$BACKUP"
sqlite3 "$DATA/serwis.db" ".backup '$BACKUP/serwis-$TS.db'"
gzip -f "$BACKUP/serwis-$TS.db"
find "$BACKUP" -name '*.gz' -mtime +30 -delete

# kopia POZA serwerem — mail ze skrzynki OVH na skrzynkę Studia
"$VENV" /opt/sygnatura/repo/deploy/backup_mail.py "$BACKUP/serwis-$TS.db.gz" || echo "mail z backupem pominiety (SMTP nie skonfigurowany)"

echo "$(date '+%F %T') backup OK: serwis-$TS.db.gz"
