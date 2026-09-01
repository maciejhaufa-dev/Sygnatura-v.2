# -*- coding: utf-8 -*-
"""Logika serwisu: statusy, sygnatury, e-maile, Google Sheets, treści autoresponderów."""
import os
import json
import datetime

STATUSY = ['zapytanie', 'platnosc_w_toku', 'zarezerwowany', 'odrzucono']
STATUSY_PL = {
    'zapytanie': 'wysłano zapytanie',
    'platnosc_w_toku': 'płatność w toku',
    'zarezerwowany': 'zarezerwowany',
    'odrzucono': 'odrzucono',
}
# Kolory statusów w kalendarzu (klasy CSS)
STATUS_KLASA = {
    'zapytanie': 'st-zapytanie',
    'platnosc_w_toku': 'st-platnosc',
    'zarezerwowany': 'st-zarezerwowany',
}

def teraz():
    return datetime.datetime.now().strftime('%Y-%m-%d %H:%M')

def nowa_sygnatura(db):
    """Nadaje kolejną sygnaturę sprawy: SYG-2026-001, SYG-2026-002, ..."""
    row = db.execute("SELECT wartosc FROM ustawienia WHERE klucz='licznik_sygnatur'").fetchone()
    n = int(row['wartosc']) if row else 0
    while True:
        n += 1
        syg = 'SYG-%d-%03d' % (datetime.date.today().year, n)
        if not db.execute('SELECT 1 FROM rezerwacje WHERE sygnatura=?', (syg,)).fetchone():
            break
    db.execute("UPDATE ustawienia SET wartosc=? WHERE klucz='licznik_sygnatur'", (str(n),))
    return syg


# ------------------------------------------------ wysyłka e-maili
def wyslij_mail(db, do_kogo, temat, tresc, typ):
    """Wysyła e-mail przez SMTP (jeśli skonfigurowany) i ZAWSZE zapisuje kopię
    w tabeli mail_outbox — kopia jest widoczna w panelu admina.
    Bez SMTP (tryb testowy / localhost) e-mail tylko ląduje w outboxie."""
    import smtplib
    from email.message import EmailMessage
    u = db.execute("SELECT klucz, wartosc FROM ustawienia WHERE klucz IN "
                   "('smtp_host','smtp_port','smtp_user','smtp_haslo','smtp_ssl','nadawca')")
    ustaw = {r['klucz']: r['wartosc'] for r in u.fetchall()}
    host = (ustaw.get('smtp_host') or '').strip()
    wyslany, blad = 0, ''
    if host:
        try:
            msg = EmailMessage()
            msg['From'] = ustaw.get('nadawca') or ustaw.get('kontakt_email') or 'kontakt@studiosygnatura.pl'
            msg['To'] = do_kogo
            msg['Subject'] = temat
            msg.set_content(tresc)
            port = int(ustaw.get('smtp_port') or 587)
            use_ssl = ustaw.get('smtp_ssl') == '1'
            if use_ssl:
                s = smtplib.SMTP_SSL(host, port, timeout=20)
            else:
                s = smtplib.SMTP(host, port, timeout=20)
                s.starttls()
            if ustaw.get('smtp_user'):
                s.login(ustaw['smtp_user'], ustaw.get('smtp_haslo') or '')
            s.send_message(msg)
            s.quit()
            wyslany = 1
        except Exception as e:
            blad = str(e)
    db.execute('INSERT INTO mail_outbox (do_kogo, temat, tresc, typ, utworzono, wyslany, blad) VALUES (?,?,?,?,?,?,?)',
               (do_kogo, temat, tresc, typ, teraz(), wyslany, blad))
    db.commit()
    return wyslany, blad


def wyslij_do_klienta(db, do_kogo, temat, tresc):
    return wyslij_mail(db, do_kogo, temat, tresc, 'autoresponder-klient')


def wyslij_do_studia(db, temat, tresc):
    u = db.execute("SELECT wartosc FROM ustawienia WHERE klucz='kontakt_email'").fetchone()
    adres = u['wartosc'] if u else 'kontakt@studiosygnatura.pl'
    return wyslij_mail(db, adres, temat, tresc, 'zgloszenie-studio')


# ------------------------------------------------ Google Sheets (webhook Apps Script)
def push_do_sheets(db, rezerwacja):
    """Wysyła zgłoszenie do arkusza Google przez webhook Apps Scripta.
    URL ustawisz w adminie: Ustawienia -> URL arkusza (skonfigurujemy później).
    Bez URL nic się nie dzieje — rekord zostaje tylko w bazie."""
    import urllib.request
    url = db.execute("SELECT wartosc FROM ustawienia WHERE klucz='sheets_url'").fetchone()
    if not url or not url['wartosc'].strip():
        return False
    payload = json.dumps({
        'sygnatura': rezerwacja['sygnatura'],
        'utworzono': rezerwacja['utworzono'],
        'status': rezerwacja['status'],
        'data': rezerwacja['data'],
        'pakiet': rezerwacja['pakiet_nazwa'],
        'temat': rezerwacja['temat'],
        'imie': rezerwacja['imie'],
        'email': rezerwacja['email'],
        'telefon': rezerwacja['telefon'],
        'tresc': rezerwacja['tresc'],
        'data_od': rezerwacja['data_od'],
        'data_do': rezerwacja['data_do'],
        'dni': rezerwacja['dni'],
        'pozycje': rezerwacja['pozycje'],
        'personalizacje': rezerwacja['personalizacje'],
    }, ensure_ascii=False).encode('utf-8')
    try:
        req = urllib.request.Request(url['wartosc'].strip(), data=payload, headers={'Content-Type': 'application/json; charset=utf-8'})
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.status in (200, 201, 204)
    except Exception:
        return False


# ------------------------------------------------ treści autoresponderów
def procedura_txt(dokumenty):
    if not dokumenty:
        return ''
    out = ['Dokumenty do zapoznania się:']
    for d in dokumenty:
        out.append('• %s' % d.get('nazwa', ''))
    return '\n'.join(out)


def zakres_txt(rez):
    """Czytelny opis terminu: od–do + data imprezy + liczba dób."""
    od = rez['data_od'] or rez['data']
    do = rez['data_do'] or rez['data']
    dni = rez['dni'] or 1
    return '%s – %s  (impreza: %s, %s dn.)' % (od, do, rez['data'], dni)


def pozycje_txt(rez):
    """Skład zestawu własnego z wyliczeniem (jeśli rezerwacja ma pozycje)."""
    try:
        poz = json.loads(rez['pozycje'] or '[]')
    except Exception:
        poz = []
    if not poz:
        return ''
    suma = sum(float(p.get('cena') or 0) for p in poz)
    dni = rez['dni'] or 1
    rabat = round(suma * 0.05) if len(poz) >= 10 else 0
    linie = ['SKŁAD ZESTAWU (własny):']
    linie += ['• %s — %.0f zł' % (p.get('nazwa', ''), p.get('cena') or 0) for p in poz]
    linie.append('Suma: %.0f zł / doba' % suma)
    if rabat:
        linie.append('Rabat −5%% (od 10 pozycji): −%d zł' % rabat)
    linie.append('Szacunkowo za %d dn.: %.0f zł (kwota do potwierdzenia)' % (dni, (suma - rabat) * dni))
    return '\n'.join(linie) + '\n'


def personalizacje_txt(rez):
    """Produkty spersonalizowane z opisami — płatne z góry, bezzwrotne."""
    try:
        pers = json.loads(rez['personalizacje'] or '[]')
    except Exception:
        pers = []
    if not pers:
        return ''
    suma = sum(float(p.get('cena') or 0) for p in pers)
    rabat = round(suma * 0.05) if len(pers) >= 3 else 0
    linie = ['PRODUKTY SPERSONALIZOWANE (jednorazówki — płatne z góry, nie podlegają zwrotowi):']
    for p in pers:
        linie.append('• %s — %.0f zł' % (p.get('nazwa', ''), p.get('cena') or 0))
        if p.get('opis'):
            linie.append('    opis: %s' % p['opis'])
    linie.append('Suma: %.0f zł' % suma)
    if rabat:
        linie.append('Rabat −5%% (od 3 produktów): −%d zł' % rabat)
        linie.append('Do zapłaty z góry: %.0f zł' % (suma - rabat))
    else:
        linie.append('Do zapłaty z góry: %.0f zł' % suma)
    return '\n'.join(linie) + '\n'


def kwoty_txt(rez):
    """Podsumowanie kwot (najem × doby + kaucja + personalizacja z góry)."""
    kw = rez['kwoty'] if isinstance(rez, dict) and rez.get('kwoty') else None
    if not kw:
        return ''
    linie = ['PODSUMOWANIE KWOT (szacunkowe):',
             'Najem: %.0f zł (%s × %s dn.)' % (kw['najem'], kw['stawka_txt'], kw['dni']),
             'Kaucja zwrotna (najem): 300 zł',
             'Personalizacja (płatna z góry, bezzwrotna): %.0f zł' % kw['pers_netto'],
             'RAZEM: %.0f zł' % kw['razem']]
    if kw.get('pers_rabat'):
        linie.insert(3, 'w tym rabat na personalizację −5%%: −%d zł' % kw['pers_rabat'])
    return '\n'.join(linie) + '\n'


def mail_klient_zapytanie(rez, dokumenty):
    d = rez['data']
    try:
        d_pl = '%s %s %s' % (int(d[8:10]), ['', 'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
                           'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'][int(d[5:7])], d[:4])
    except Exception:
        d_pl = d
    return (
        'Dzień dobry,\n\n'
        'dziękujemy za zapytanie o wynajem w Studio Sygnatura.\n\n'
        'PODSUMOWANIE ZGŁOSZENIA\n'
        'Sygnatura sprawy: %(sygnatura)s\n'
        'Termin najmu: %(zakres)s\n'
        'Pakiet: %(pakiet)s\n'
        'Imię i nazwisko: %(imie)s\n'
        'E-mail kontaktowy: %(email)s\n'
        '%(telefon)s'
        '\nTREŚĆ TWOJEGO PYTANIA\n%(tresc)s\n'
        '%(pozycje)s'
        '%(personalizacje)s'
        '%(kwoty)s'
        '\nJAK DZIAŁAMY\n'
        '1. Twoje zapytanie jest widoczne w naszym kalendarzu jako „wysłano zapytanie" — '
        'termin nie jest zablokowany, dopóki nie wpłynie kaucja.\n'
        '2. Odpowiadamy w ciągu 1 dnia roboczego (priorytet mają nasi stali partnerzy).\n'
        '3. Rezerwacja staje się wiążąca po wpłacie KAUCJI za zestaw w terminie 7 dni. '
        'Po zaksięgowaniu wpłaty status zmienia się na „zarezerwowany" i termin blokujemy na sztywno.\n'
        '4. Zapłacone = zarezerwowane.\n'
        '5. Produkty spersonalizowane są wykonywane na zamówienie: płatne z góry i nie podlegają zwrotowi — po imprezie zostają u Ciebie.\n'
        '6. Doby najmu liczymy od podpisania protokołu zdawczo-odbiorczego (przekazanie dekoracji) do ich odbioru — płatność za każdą rozpoczętą dobę.\n'
        '\n%(procedura)s\n'
        '\nPozdrawiamy,\n'
        'Studio Sygnatura\n'
        'kontakt@studiosygnatura.pl'
    ) % {
        'sygnatura': rez['sygnatura'], 'zakres': zakres_txt(rez), 'pakiet': rez['pakiet_nazwa'],
        'imie': rez['imie'], 'email': rez['email'],
        'telefon': ('Telefon: %s\n' % rez['telefon']) if rez['telefon'] else '',
        'tresc': (rez['tresc'].strip() or '(brak treści)'),
        'pozycje': pozycje_txt(rez),
        'personalizacje': personalizacje_txt(rez),
        'kwoty': kwoty_txt(rez),
        'procedura': procedura_txt(dokumenty),
    }


def mail_studio_zapytanie(rez):
    return (
        'NOWE ZAPYTANIE O WYNAJEM\n\n'
        'Sygnatura: %(sygnatura)s\n'
        'Data zgłoszenia: %(utworzono)s\n'
        'Status: zapytanie\n'
        'Termin najmu: %(zakres)s\n'
        'Pakiet: %(pakiet)s\n'
        'Imię i nazwisko: %(imie)s\n'
        'E-mail: %(email)s\n'
        '%(telefon)s'
        '\nTreść:\n%(tresc)s\n'
        '%(pozycje)s'
        '%(personalizacje)s'
        '%(kwoty)s'
        '\nPanel admina: /admin (zmień status po weryfikacji).'
    ) % {
        'sygnatura': rez['sygnatura'], 'utworzono': rez['utworzono'], 'zakres': zakres_txt(rez),
        'pakiet': rez['pakiet_nazwa'], 'imie': rez['imie'], 'email': rez['email'],
        'telefon': ('Telefon: %s\n' % rez['telefon']) if rez['telefon'] else '',
        'tresc': (rez['tresc'].strip() or '(brak treści)'),
        'pozycje': pozycje_txt(rez),
        'personalizacje': personalizacje_txt(rez),
        'kwoty': kwoty_txt(rez),
    }


def mail_klient_platnosc(rez):
    return (
        'Dzień dobry,\n\n'
        'dziękujemy za wpłatę kaucji. Otrzymaliśmy przelew — gdy zostanie zaksięgowany na naszym koncie, '
        'status Twojej rezerwacji zmienimy na „zarezerwowany" i termin zostanie zablokowany na sztywno.\n\n'
        'Sprawa: %(sygnatura)s\nTermin najmu: %(zakres)s\nPakiet: %(pakiet)s\n\n'
        'Pozdrawiamy,\nStudio Sygnatura\nkontakt@studiosygnatura.pl'
    ) % {'sygnatura': rez['sygnatura'], 'zakres': zakres_txt(rez), 'pakiet': rez['pakiet_nazwa']}


def mail_klient_rezerwacja(rez):
    return (
        'Dzień dobry,\n\n'
        'potwierdzamy: kaucja została zaksięgowana i termin %(zakres)s dla pakietu „%(pakiet)s" '
        'rezerwujemy na sztywno. Do zobaczenia na uroczystości!\n\n'
        'Sprawa: %(sygnatura)s\n\n'
        'Pozdrawiamy,\nStudio Sygnatura\nkontakt@studiosygnatura.pl'
    ) % {'sygnatura': rez['sygnatura'], 'zakres': zakres_txt(rez), 'pakiet': rez['pakiet_nazwa']}


def mail_klient_odrzucono(rez, powod=''):
    return (
        'Dzień dobry,\n\n'
        'dziękujemy za zapytanie. Niestety nie możemy zrealizować tej rezerwacji'
        + ((' — ' + powod) if powod else '') + '.\n\n'
        'Sprawa: %(sygnatura)s\nTermin najmu: %(zakres)s\nPakiet: %(pakiet)s\n\n'
        'Zapraszamy przy innej okazji.\n\n'
        'Pozdrawiamy,\nStudio Sygnatura\nkontakt@studiosygnatura.pl'
    ) % {'sygnatura': rez['sygnatura'], 'zakres': zakres_txt(rez), 'pakiet': rez['pakiet_nazwa']}
