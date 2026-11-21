#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Studio Sygnatura — wysyła kopię bazy (załącznik .db.gz) na skrzynkę Studia.
Czyta konfigurację SMTP z tabeli ustawienia (wpisaną w panelu /admin/ustawienia).
Wywołanie: backup_mail.py /sciezka/do/serwis-XXX.db.gz
Bez skonfigurowanego SMTP kończy się kodem 1 (backup.sh to toleruje)."""
import sys
import os
import smtplib
import sqlite3
from email.message import EmailMessage
from email.utils import formatdate, make_msgid
import datetime

BAZA = '/opt/sygnatura/repo/serwis/data/serwis.db'


def main():
    if len(sys.argv) < 2 or not os.path.exists(sys.argv[1]):
        print('brak pliku kopii', file=sys.stderr)
        sys.exit(1)
    plik = sys.argv[1]
    db = sqlite3.connect(BAZA)
    db.row_factory = sqlite3.Row
    ust = {r['klucz']: (r['wartosc'] or '') for r in db.execute(
        "SELECT klucz, wartosc FROM ustawienia WHERE klucz IN "
        "('smtp_host','smtp_port','smtp_user','smtp_haslo','smtp_ssl','nadawca','kontakt_email')")}
    db.close()

    host = ust.get('smtp_host', '').strip()
    do_kogo = (ust.get('kontakt_email') or ust.get('nadawca') or '').strip()
    if not host or not do_kogo:
        print('SMTP nie skonfigurowany — pomijam wysyłkę', file=sys.stderr)
        sys.exit(1)

    msg = EmailMessage()
    msg['Subject'] = 'SYGNATURA — kopia bazy %s' % datetime.date.today().isoformat()
    msg['From'] = ust.get('nadawca') or ust.get('smtp_user') or 'backup@studiosygnatura.pl'
    msg['To'] = do_kogo
    msg['Date'] = formatdate(localtime=True)
    msg['Message-ID'] = make_msgid(domain='studiosygnatura.pl')
    msg.set_content('Codzienna kopia bazy serwisu w załączniku.\nRozmiar: %d KB.\n'
                    'Odtworzenie: wgrać plik jako serwis/data/serwis.db i zrestartować usługę sygnatura.'
                    % (os.path.getsize(plik) // 1024))
    with open(plik, 'rb') as f:
        msg.add_attachment(f.read(), maintype='application', subtype='gzip',
                           filename=os.path.basename(plik))

    port = int(ust.get('smtp_port') or 587)
    if ust.get('smtp_ssl') == '1':
        s = smtplib.SMTP_SSL(host, port, timeout=30)
    else:
        s = smtplib.SMTP(host, port, timeout=30)
        try:
            s.starttls()
        except Exception:
            pass
    if ust.get('smtp_user'):
        s.login(ust['smtp_user'], ust.get('smtp_haslo') or '')
    s.send_message(msg)
    s.quit()
    print('kopia wysłana na', do_kogo)


if __name__ == '__main__':
    main()
