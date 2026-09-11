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


def teraz_plus(sekundy):
    """Bieżący czas + przesunięcie (do wygasania tokenów)."""
    return (datetime.datetime.now() + datetime.timedelta(seconds=sekundy)).strftime('%Y-%m-%d %H:%M')

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
def sheets_payload(rezerwacja, typ='rezerwacja'):
    """Buduje JSON wysyłany do arkusza (klucz 'typ' mówi skryptowi,
    czy to nowa rezerwacja, zmiana statusu, rozliczenie, czy test)."""
    import json as _json
    kw = rezerwacja.get('kwoty')
    if isinstance(kw, str) and kw:
        try:
            kw = _json.loads(kw)
        except Exception:
            kw = None
    dane = {
        'typ': typ,
        'sygnatura': rezerwacja.get('sygnatura') or '',
        'utworzono': rezerwacja.get('utworzono') or teraz(),
        'status': rezerwacja.get('status') or '',
        'data': rezerwacja.get('data') or '',
        'pakiet': rezerwacja.get('pakiet_nazwa') or '',
        'temat': rezerwacja.get('temat') or '',
        'imie': rezerwacja.get('imie') or '',
        'email': rezerwacja.get('email') or '',
        'telefon': rezerwacja.get('telefon') or '',
        'tresc': rezerwacja.get('tresc') or '',
        'data_od': rezerwacja.get('data_od') or '',
        'data_do': rezerwacja.get('data_do') or '',
        'dni': rezerwacja.get('dni') or 0,
        'pozycje': rezerwacja.get('pozycje') or '[]',
        'personalizacje': rezerwacja.get('personalizacje') or '[]',
        'rozliczenie': rezerwacja.get('rozliczenie') or 'wspolne',
        'kwoty_lacznie': (kw or {}).get('razem_po', (kw or {}).get('razem')) if kw else '',
        'kwoty_najem': (kw or {}).get('najem') if kw else '',
        'kwoty_pers': (kw or {}).get('pers_netto') if kw else '',
        'kwoty_kaucja': (kw or {}).get('kaucja') or '',
        'dostawa': rezerwacja.get('dostawa') or '',
        'adres': rezerwacja.get('adres') or '',
        'kod': rezerwacja.get('kod') or '',
    }
    return json.dumps(dane, ensure_ascii=False).encode('utf-8')


def push_do_sheets(db, rezerwacja, typ='rezerwacja'):
    """Wysyła zgłoszenie do arkusza Google przez webhook Apps Scripta.
    URL ustawisz w adminie: Ustawienia -> URL arkusza.
    Bez URL nic się nie dzieje (status 'brak-url' w logu).
    Zwraca (ok, komunikat). Każda próba jest zapisywana w tabeli sheets_log."""
    import urllib.request
    url = db.execute("SELECT wartosc FROM ustawienia WHERE klucz='sheets_url'").fetchone()
    if not url or not url['wartosc'].strip():
        return False, 'brak URL webhooka (Ustawienia → URL arkusza)'
    if not isinstance(rezerwacja, dict):
        rezerwacja = dict(rezerwacja)   # sqlite3.Row nie ma .get()
    payload = sheets_payload(rezerwacja, typ)
    try:
        req = urllib.request.Request(url['wartosc'].strip(), data=payload,
                                     headers={'Content-Type': 'application/json; charset=utf-8'})
        with urllib.request.urlopen(req, timeout=15) as resp:
            ok = resp.status in (200, 201, 204)
            komunikat = 'HTTP %d' % resp.status
    except Exception as e:
        ok = False
        komunikat = str(e)[:200]
    db.execute('INSERT INTO sheets_log (kiedy, typ, sygnatura, status, odpowiedz) VALUES (?,?,?,?,?)',
               (teraz(), typ, rezerwacja.get('sygnatura') or '',
                'ok' if ok else 'blad', komunikat))
    db.commit()
    return ok, komunikat


# ------------------------------------------------ treści autoresponderów
def procedura_txt(dokumenty):
    if not dokumenty:
        return ''
    out = ['Dokumenty do zapoznania się:']
    for d in dokumenty:
        out.append('• %s' % d.get('nazwa', ''))
    return '\n'.join(out)


def zakres_txt(rez):
    """Czytelny opis terminu: od–do + data imprezy + liczba dób.
    Dla wiadomości bez terminu (np. formularz kontaktowy) zwraca ''."""
    if not (rez.get('data') or rez.get('data_od') or rez.get('data_do')):
        return ''
    od = rez.get('data_od') or rez.get('data') or ''
    do = rez.get('data_do') or rez.get('data') or ''
    dni = rez.get('dni') or 1
    if od and do:
        return '%s – %s  (impreza: %s, %s dn.)' % (od, do, rez.get('data') or '', dni)
    return rez.get('data') or ''


def pozycje_txt(rez):
    """Skład zamówienia: zestaw własny (najem) LUB produkty ze sklepu (ile szt.)."""
    try:
        poz = json.loads(rez.get('pozycje') or '[]')
    except Exception:
        poz = []
    if not poz:
        return ''
    sklep = any('ile' in p for p in poz)
    if sklep:
        suma = sum(float(p.get('cena') or 0) * int(p.get('ile') or 1) for p in poz)
        linie = ['PRODUKTY ZE SKLEPU:']
        for p in poz:
            ile = int(p.get('ile') or 1)
            linie.append('• %s — %.0f zł%s' % (p.get('nazwa', ''), p.get('cena') or 0,
                                               (' × %d szt.' % ile) if ile > 1 else ''))
        linie.append('Suma produktów: %.0f zł (płatne z góry)' % suma)
        return '\n'.join(linie) + '\n'
    suma = sum(float(p.get('cena') or 0) for p in poz)
    dni = rez.get('dni') or 1
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
        pers = json.loads(rez.get('personalizacje') or '[]')
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
    """Podsumowanie kwot — wspólne dla wynajmu / personalizacji / sklepu."""
    kw = rez['kwoty'] if isinstance(rez, dict) and rez.get('kwoty') else None
    if not kw:
        return ''
    linie = ['PODSUMOWANIE KWOT' + ('' if kw.get('rabat_kod') else ' (szacunkowe)') + ':']
    if kw.get('najem'):
        linie.append('Najem: %.0f zł (%s × %s dn.)' % (kw['najem'], kw.get('stawka_txt', ''), kw.get('dni', 0)))
    if kw.get('kaucja'):
        linie.append('Kaucja zwrotna (najem): 300 zł')
    if kw.get('pozycje_suma'):
        linie.append('Produkty ze sklepu: %.0f zł' % kw['pozycje_suma'])
    if kw.get('pers_netto'):
        linie.append('Personalizacja (płatna z góry, bezzwrotna): %.0f zł' % kw['pers_netto'])
        if kw.get('pers_rabat'):
            linie.append('  w tym rabat na personalizację −5%%: −%d zł' % kw['pers_rabat'])
    if kw.get('rabat_kod'):
        linie.append('Rabat z kodu %s: −%d zł' % (kw.get('kod', ''), kw['rabat_kod']))
    razem_po = kw.get('razem_po', kw.get('razem', 0))
    kaucja = kw.get('kaucja', 0)
    if kaucja:
        linie.append('PODSUMOWANIE (bez kaucji): %.0f zł' % (razem_po - kaucja))
        linie.append('RAZEM przy odbiorze: %.0f zł (w tym kaucja zwrotna %.0f zł)' % (razem_po, kaucja))
    else:
        linie.append('RAZEM: %.0f zł' % razem_po)
    return '\n'.join(linie) + '\n'


def kwota_lacznie(rez):
    """Sam RAZEM z podsumowania kwot (do arkusza / rozliczeń)."""
    kw = rez.get('kwoty') if isinstance(rez, dict) else None
    if not kw:
        return ''
    return '%.0f zł' % (kw.get('razem_po', kw.get('razem', 0)))


def rabat_od_kodu(db, kod):
    """Kod rabatowy z ustawień (linie: KOD:procent, np. WESELE5:5).
    Zwraca (procent, opis_bledu). Wielkość liter bez znaczenia."""
    kod = (kod or '').strip()
    if not kod:
        return 0, ''
    row = db.execute("SELECT wartosc FROM ustawienia WHERE klucz='kody_rabatowe'").fetchone()
    for linia in ((row['wartosc'] if row else '') or '').splitlines():
        czesci = [c.strip() for c in linia.split(':')]
        if len(czesci) == 2 and czesci[0].lower() == kod.lower() and czesci[1].isdigit():
            p = int(czesci[1])
            if 1 <= p <= 100:
                return p, ''
    return 0, 'Nie rozpoznano kodu rabatowego — pomijamy go (możesz go dopisać w wiadomości, a my sprawdzimy ręcznie).'


# ------------------------------------------------ autorespondery (szablony z bazy)
def podstawienia(rez):
    """Zmienne dostępne w szablonach autoresponderów: %(sygnatura)s itd."""
    kw = rez.get('kwoty') if isinstance(rez, dict) else None
    telefon = (rez.get('telefon') or '').strip()
    dostawa = (rez.get('dostawa') or '').strip()
    dostawa_txt = ''
    if dostawa:
        dostawa_txt = 'Forma dostawy: %s\n' % dostawa
        if (rez.get('adres') or '').strip():
            dostawa_txt += 'Adres: %s\n' % rez['adres'].strip()
    return {
        'sygnatura': rez.get('sygnatura') or '',
        'imie': (rez.get('imie') or '').strip() or 'Państwo',
        'email': rez.get('email') or '',
        'telefon': ('Telefon: %s\n' % telefon) if telefon else '',
        'dostawa': dostawa_txt,
        'temat': rez.get('temat') or '',
        'tresc': (rez.get('tresc') or '').strip() or '(brak treści)',
        'pakiet': rez.get('pakiet_nazwa') or '',
        'zakres': zakres_txt(rez),
        'dni': str(rez.get('dni') or 1),
        'data': rez.get('data') or '',
        'status': (rez.get('status') or '').strip(),
        'powod': (' — ' + (rez.get('powod') or '').strip()) if (rez.get('powod') or '').strip() else '',
        'pozycje': pozycje_txt(rez),
        'personalizacje': personalizacje_txt(rez),
        'kwoty': kwoty_txt(rez),
        'kwoty_lacznie': kwota_lacznie(rez),
        'kontakt_email': 'kontakt@studiosygnatura.pl',
        'rok': str(datetime.date.today().year),
        'kwartal': 'Q%d' % ((datetime.date.today().month - 1) // 3 + 1),
    }


DOMYSLNE_SZABLONY = {}  # (nieużywane — szablony lecą prosto z bazy lub db.SZABLONY_MAILI)


def render_szablon(db, klucz, rez):
    """Zwraca (temat, tresc) gotowego autorespondera wg szablonu z bazy
    (Ustawienia → Autorespondery). Rezerwacje mają w rez pole 'kwoty'."""
    z = podstawienia(rez)
    kontakt_email = db.execute("SELECT wartosc FROM ustawienia WHERE klucz='kontakt_email'").fetchone()
    z['kontakt_email'] = kontakt_email['wartosc'] if kontakt_email else 'kontakt@studiosygnatura.pl'
    row = db.execute('SELECT temat, tresc, aktywny FROM szablony_maili WHERE klucz=?', (klucz,)).fetchone()
    if row:
        if not row['aktywny']:
            return None, None
        return row['temat'] % z, row['tresc'] % z
    # brak szablonu w bazie (starsza baza bez seeda) — domyślny z kodu
    import db as _db
    for k, nazwa, temat, tresc in _db.SZABLONY_MAILI:
        if k == klucz:
            return temat % z, tresc % z
    return None, None


def wyslij_szablon(db, klucz, rez, do_kogo):
    """Wysyła autoresponder wg szablonu z bazy do klienta. Zwraca (ok, blad).
    Szablon wyłączony (aktywny=0) → nic nie wysyła (tylko informacja)."""
    temat, tresc = render_szablon(db, klucz, rez)
    if temat is None:
        return False, 'autoresponder wyłączony lub brak szablonu'
    host = db.execute("SELECT wartosc FROM ustawienia WHERE klucz='smtp_host'").fetchone()
    if not host or not host['wartosc'].strip():
        # tryb lokalny: kopia ląduje w outboxie (panel: Maile), prawdziwa wysyłka wyłączona
        wyslij_do_klienta(db, do_kogo, temat, tresc)
        return False, 'SMTP nie skonfigurowany — kopia maila jest w panelu (Maile)'
    return wyslij_do_klienta(db, do_kogo, temat, tresc)



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
    typ_txt = {'wynajem': 'WYNAJEM', 'personalizacja': 'PERSONALIZACJA (samodzielna)', 'sklep': 'SKLEP'}.get(
        rez.get('typ') if isinstance(rez, dict) else 'wynajem', 'ZAMÓWIENIE')
    linia_terminu = 'Termin najmu: %(zakres)s\n' if (rez.get('data') or '').strip() else ''
    dostawa_txt = ''
    if (rez.get('dostawa') or '').strip():
        dostawa_txt = 'Forma dostawy: %s\n' % rez['dostawa'].strip()
        if (rez.get('adres') or '').strip():
            dostawa_txt += 'Adres: %s\n' % rez['adres'].strip()
    kod_txt = ''
    if (rez.get('kod') or '').strip():
        kod_txt = 'Kod rabatowy: %s\n' % rez['kod'].strip()
    return (
        'NOWE ZAMÓWIENIE — %(typ)s\n\n'
        'Sygnatura: %(sygnatura)s\n'
        'Data zgłoszenia: %(utworzono)s\n'
        'Status: zapytanie\n'
        '%(linia_terminu)s'
        'Pakiet: %(pakiet)s\n'
        'Imię i nazwisko: %(imie)s\n'
        'E-mail: %(email)s\n'
        '%(telefon)s'
        '%(dostawa)s'
        '%(kod)s'
        '\nTreść:\n%(tresc)s\n'
        '%(pozycje)s'
        '%(personalizacje)s'
        '%(kwoty)s'
        '\nPanel admina: /admin (zmień status po weryfikacji).'
    ) % {
        'typ': typ_txt,
        'linia_terminu': linia_terminu,
        'sygnatura': rez['sygnatura'], 'utworzono': rez['utworzono'], 'zakres': zakres_txt(rez),
        'pakiet': rez['pakiet_nazwa'], 'imie': rez['imie'], 'email': rez['email'],
        'telefon': ('Telefon: %s\n' % rez['telefon']) if rez['telefon'] else '',
        'dostawa': dostawa_txt, 'kod': kod_txt,
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


# ------------------------------------------------ wiadomości kontaktowe (plan minimum)
def mail_kontakt_studio(w):
    """Treść maila do Studia po wysłaniu formularza kontaktowego."""
    return (
        'NOWA WIADOMOŚĆ Z FORMULARZA KONTAKTOWEGO\n\n'
        'Imię i nazwisko: %(imie)s\n'
        'E-mail: %(email)s\n'
        '%(telefon)s'
        'Temat zapytania: %(temat)s\n'
        'Data: %(data)s\n\n'
        'TREŚĆ WIADOMOŚCI\n'
        '%(tresc)s\n\n'
        'Zgoda na kontakt (PKE art. 398): %(zgoda)s\n'
    ) % {
        'imie': w['imie'], 'email': w['email'],
        'telefon': ('Telefon: %s\n' % w['telefon']) if w.get('telefon') else '',
        'temat': w.get('temat') or 'Inny temat',
        'data': w.get('data') or teraz(),
        'tresc': w['tresc'].strip(),
        'zgoda': 'TAK' if w.get('zgoda') else 'BRAK (!!! — sprawdzić przed odpowiedzią)',
    }


def mail_kontakt_potwierdzenie(w):
    """Autoresponder do osoby, która napisała przez formularz."""
    return (
        'Dzień dobry, %(imie)s,\n\n'
        'dziękujemy za wiadomość. Trafiła do nas i odpowiemy najpóźniej '
        'w ciągu 2 dni roboczych (zwykle szybciej).\n\n'
        'W pilnych sprawach prosimy o dopisek „pilne" w temacie.\n\n'
        'Pozdrawiamy,\n'
        'Studio Sygnatura\n'
        'kontakt@studiosygnatura.pl'
    ) % {'imie': w['imie']}
