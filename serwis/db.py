# -*- coding: utf-8 -*-
"""Baza danych serwisu Studio Sygnatura.

Cała baza to JEDEN plik SQLite: serwis/data/serwis.db
Tworzy się sam przy pierwszym uruchomieniu (python app.py).

Jeśli chcesz zacząć od zera: usuń plik data/serwis.db i uruchom app.py ponownie
— baza odtworzy się z danymi startowymi (kategorie, produkty, pakiety, demo).
"""
import os
import json
import datetime

BAZA = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'serwis.db')

SCHEMAT = """
CREATE TABLE IF NOT EXISTS ustawienia (
  klucz   TEXT PRIMARY KEY,
  wartosc TEXT
);
-- Kategorie produktów (widoczne też jako filtry w katalogu)
CREATE TABLE IF NOT EXISTS kategorie (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  nazwa     TEXT NOT NULL,
  opis      TEXT DEFAULT '',
  kolejnosc INTEGER DEFAULT 0
);
-- Produkty (katalog na wynajem + przyszły sklep)
CREATE TABLE IF NOT EXISTS produkty (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  kategoria_id INTEGER,
  nazwa        TEXT NOT NULL,
  opis         TEXT DEFAULT '',
  cena_doba    REAL DEFAULT 0,
  dostepny     INTEGER DEFAULT 1,   -- 1 = widoczny na stronie
  kolejnosc    INTEGER DEFAULT 0,
  FOREIGN KEY(kategoria_id) REFERENCES kategorie(id)
);
-- Pakiety na wynajem (per typ wydarzenia, poziomy ESENCJA/MID/FULL)
CREATE TABLE IF NOT EXISTS pakiety (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  ev          TEXT DEFAULT 'inne',  -- komunijny / weselny / firmowy / jubileuszowy
  nazwa       TEXT NOT NULL,
  opis        TEXT DEFAULT '',
  cena        TEXT DEFAULT '',      -- tekst na stronę, np. 'od 199 zł / doba'
  cena_liczba REAL DEFAULT 0,       -- liczba do kalkulacji (najem × doby)
  tier        TEXT DEFAULT '',      -- ESENCJA / MID / FULL
  pozycje     TEXT DEFAULT '',      -- lista pozycji, KAŻDA W OSOBNEJ LINII
  dostepny    INTEGER DEFAULT 1,    -- 1 = pokazuj na stronie, 0 = ukryj (checkbox w adminie)
  kolejnosc   INTEGER DEFAULT 0
);
-- Produkty spersonalizowane (jednorazówki: płatne z góry, NIE podlegają zwrotowi)
CREATE TABLE IF NOT EXISTS personalizacje (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  nazwa     TEXT NOT NULL,
  opis      TEXT DEFAULT '',
  cena      REAL DEFAULT 0,         -- cena brutto za sztukę / komplet (płatna z góry)
  dostepny  INTEGER DEFAULT 1,      -- 1 = widoczna w katalogu personalizacji
  kolejnosc INTEGER DEFAULT 0
);
-- Zgłoszenia / rezerwacje klientów
CREATE TABLE IF NOT EXISTS rezerwacje (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  sygnatura    TEXT,                -- np. SYG-2026-001 (nadawana automatycznie)
  data         TEXT,                -- 'RRRR-MM-DD' — DATA IMPREZY (środkowy dzień)
  data_od      TEXT,                -- 'RRRR-MM-DD' — początek najmu (domyślnie dzień przed imprezą = montaż)
  data_do      TEXT,                -- 'RRRR-MM-DD' — koniec najmu (domyślnie dzień po imprezie = demontaż)
  dni          INTEGER DEFAULT 1,   -- liczba dób najmu
  pakiet_id    INTEGER,
  pakiet_nazwa TEXT,
  temat        TEXT DEFAULT 'Rezerwacja terminu',
  imie         TEXT DEFAULT '',
  email        TEXT NOT NULL,
  telefon      TEXT DEFAULT '',
  tresc        TEXT DEFAULT '',     -- indywidualna wiadomość klienta
  pozycje      TEXT DEFAULT '[]',   -- JSON: skład zestawu własnego [{nazwa, cena}]
  personalizacje TEXT DEFAULT '[]', -- JSON: produkty spersonalizowane [{nazwa, cena, opis}] — płatne z góry, bezzwrotne
  status       TEXT DEFAULT 'zapytanie',
  -- statusy: zapytanie | platnosc_w_toku | zarezerwowany | odrzucono
  priorytet    INTEGER DEFAULT 0,   -- 1 = stały partner (np. dekoratorka) — pokazujemy w adminie
  utworzono    TEXT,
  zmieniono    TEXT,
  historia     TEXT DEFAULT '[]',   -- JSON: lista zmian statusów (kto/co/kiedy)
  FOREIGN KEY(pakiet_id) REFERENCES pakiety(id)
);
-- Kopia wszystkich e-maili serwisu (podgląd + ponowna wysyłka w adminie)
CREATE TABLE IF NOT EXISTS mail_outbox (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  do_kogo  TEXT,
  temat    TEXT,
  tresc    TEXT,
  typ      TEXT,                    -- np. zapytanie-klient / zapytanie-studio / rezerwacja / odrzucono
  utworzono TEXT,
  wyslany  INTEGER DEFAULT 0,       -- 0 = tryb testowy (SMTP nie skonfigurowany)
  blad     TEXT DEFAULT ''
);
"""

MIESIACE_PL = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
               'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień']

# ------------------------------------------------ dane startowe (seed)
KATEGORIE = [
    ('Powitalne i informacyjne', 'szyldy, plany stołów, tablice'),
    ('Stoły i goście', 'numery stołów, serwetniki, winietki'),
    ('Światło', 'lampki, lampiony, świeczniki'),
    ('Litery i napisy', 'litery podświetlane, mozaiki'),
    ('Detale i dodatki', 'panele dekoracyjne'),
    ('Prezenty i pamiątki', 'ramki, grawery'),
]

# (nazwa, kategoria, opis, cena za dobę)
PRODUKTY = [
    ('Szyld powitalny', 0, '„Witajcie" · 60×40 cm · wkładka wymienna (treść jako personalizacja) · opcjonalne LED', 49),
    ('Tablica „rozpiska stołów"', 0, 'Plan sali z listą gości · wymienne karty przy stołach · 100×70 cm', 59),
    ('Tablice informacyjne', 0, 'Toaleta · parking · palarnia · plan sali — komplet z podpórkami', 30),
    ('Numery stołów', 1, 'Grawerowane, stojące · komplet 10 szt. · wymienne', 25),
    ('Serwetniki', 1, 'Drewniane obrączki na serwetki · komplet 30 szt.', 20),
    ('Plan dnia (tablica)', 1, 'Tablica harmonogramu imprezy · wymienna', 30),
    ('Skrzynka na życzenia', 1, 'Drewniana, z grawerem · na koperty i kartki', 25),
    ('Lampki', 2, 'Fairy lights, ciepłe 2700 K · 10 m · z koszykiem baterii', 15),
    ('Lampiony', 2, 'Drewniane, geometryczne · komplet 6 szt. · światło od środka', 35),
    ('Świeczniki', 2, 'Drewniane, stabilne · komplet 12 szt. · świece w zestawie', 30),
    ('Litery podświetlane MAŁE', 3, 'Litery do ułożenia napisu · 25 cm · LED 2700 K', 45),
    ('Litery podświetlane DUŻE', 3, 'Napis do ułożenia · 60 cm · podświetlenie LED', 120),
    ('Mozaika „scrabble"', 3, 'Drewniane literki do ułożenia napisu · ściana lub stół', 55),
]

PAKIETY = [
    # KOMUNIJNY (esencja / mid / full) — cena_liczba = stawka za dobę do kalkulacji
    ('komunijny', 'Komunijny ESENCJA', 'dla kameralnego przyjęcia', 'od 199 zł / doba', 199, 'ESENCJA',
     'Tablica z imieniem — 1 szt.\nOznaczenia stołów — 6 szt.\nWinietki imienne — 20 szt.\nŚwieczniki drewniane — 6 szt.'),
    ('komunijny', 'Komunijny MID', 'najczęściej wybierany', 'od 349 zł / doba', 349, 'MID',
     'Wszystko z ESENCJI\nSzyld powitalny — 1 szt.\nPlan stołów — 1 szt.\nNumery stolików — 10 szt.\nLampki ciepłe 10 m + lampiony ×6\nMozaika „scrabble" (literki do ułożenia)'),
    ('komunijny', 'Komunijny FULL', 'pełna oprawa sali + montaż', 'od 599 zł / doba', 599, 'FULL',
     'Wszystko z MID\nLitery podświetlane DUŻE — 60 cm\nLampki 30 m + lampiony ×12\nMontaż i demontaż po stronie Studia'),
    # WESELNY (opcje i.w.)
    ('weselny', 'Weselny ESENCJA', 'i.w. — małe wesele', 'od 299 zł / doba', 299, 'ESENCJA',
     'Szyld powitalny — 1 szt.\nPlan stołów — 1 szt.\nNumery stolików — 10 szt.\nLampki ciepłe 10 m + lampiony ×6'),
    ('weselny', 'Weselny MID', 'i.w. — do 120 gości', 'od 499 zł / doba', 499, 'MID',
     'Wszystko z ESENCJI\nLitery podświetlane MAŁE — inicjały\nMozaika „scrabble" (literki do ułożenia)\nSkrzynka na życzenia\nŚwieczniki — 12 szt.'),
    ('weselny', 'Weselny FULL', 'i.w. — pełna oprawa + montaż', 'od 799 zł / doba', 799, 'FULL',
     'Wszystko z MID\nLitery podświetlane DUŻE — 60 cm\nLampki 30 m + lampiony ×12\nWinietki i plan dnia\nMontaż i demontaż po stronie Studia'),
    # FIRMOWY
    ('firmowy', 'Firmowy ESENCJA', 'spotkanie zespołu', 'od 249 zł / doba', 249, 'ESENCJA',
     'Tablica powitalna — 1 szt.\nOznaczenia sal — 4 szt.\nNumeracja stanowisk — 12 szt.\nZnaki kierunkowe — 6 szt.'),
    ('firmowy', 'Firmowy MID', 'konferencja / event do 120 osób', 'od 449 zł / doba', 449, 'MID',
     'Wszystko z ESENCJI\nLitery podświetlane MAŁE — 25 cm\nLampki 20 m + lampiony ×8\nŚwieczniki — 12 szt.'),
    ('firmowy', 'Firmowy FULL', 'gala / duży event + montaż', 'od 749 zł / doba', 749, 'FULL',
     'Wszystko z MID\nLitery podświetlane DUŻE — 60 cm\nLampki 30 m + lampiony ×12\nTablice informacyjne (toaleta · parking · palarnia)\nMontaż i demontaż po stronie Studia'),
    # JUBILEUSZOWY / URODZINOWY
    ('jubileuszowy', 'Jubileuszowy ESENCJA', 'urodziny w gronie bliskich', 'od 199 zł / doba', 199, 'ESENCJA',
     'Szyld powitalny — 1 szt.\nNumery stolików — 6 szt.\nŚwieczniki drewniane — 6 szt.'),
    ('jubileuszowy', 'Jubileuszowy MID', 'okrągła rocznica', 'od 349 zł / doba', 349, 'MID',
     'Wszystko z ESENCJI\nLitery podświetlane MAŁE — 25 cm\nMozaika „scrabble" (literki do ułożenia)\nLampki 10 m + lampiony ×6'),
    ('jubileuszowy', 'Jubileuszowy FULL', 'duża uroczystość + montaż', 'od 599 zł / doba', 599, 'FULL',
     'Wszystko z MID\nLitery podświetlane DUŻE — 60 cm\nLampki 30 m + lampiony ×12\nMontaż i demontaż po stronie Studia'),
]

# Produkty spersonalizowane: JEDNORAZÓWKI — płatne z góry, NIE podlegają zwrotowi (zostają u klienta).
# Ceny robocze — do weryfikacji.
PERSONALIZACJE = [
    ('Wkładka do tablicy powitalnej', 'Imiona i data na wymiennej wkładce — grawer', 39),
    ('Wkładka do planu stołów', 'Rozpiska stołów z imionami gości', 49),
    ('Winietki imienne', 'Komplet 20 szt. z imionami gości', 49),
    ('Kafelki z imionami do mozaiki „scrabble"', 'Imiona gości lub pary — komplet', 35),
    ('Litery przestrzenne z imionami', 'Para liter z imionami lub nazwiskiem — na pamiątkę', 149),
    ('Numery stołów z imionami', 'Numer stolika + imiona gości — komplet 10', 35),
    ('Grawer okolicznościowy', 'Tabliczka z dedykacją — jubileusz, rocznica, pożegnanie', 89),
    ('Panel z cytatem', 'Sentencja, imiona i data — do powieszenia na ścianie', 149),
    ('Ramka rzeźbiona na zdjęcie', 'Data i okazja grawerowane na ramce', 169),
]


def domyslne_ustawienia():
    """Wartości startowe zakładki Ustawienia w panelu admina."""
    from werkzeug.security import generate_password_hash
    return {
        'kontakt_email': 'kontakt@studiosygnatura.pl',
        'nadawca': 'Studio Sygnatura <kontakt@studiosygnatura.pl>',
        'smtp_host': '', 'smtp_port': '587', 'smtp_user': '', 'smtp_haslo': '', 'smtp_ssl': '0',
        'sheets_url': '',  # URL webhooka Google Sheets (Apps Script) — skonfigurujemy później
        'admin_hash': generate_password_hash('sygnatura-2026'),  # HASŁO STARTOWE — ZMIEŃ W USTAWIENIACH
        'licznik_sygnatur': '0',
        'dokumenty': json.dumps([
            {'nazwa': 'Procedura rezerwacji i kaucji', 'plik': ''},
            {'nazwa': 'Regulamin wynajmu', 'plik': ''},
        ], ensure_ascii=False),
    }


def zaladuj_demo(db, dzis):
    """Przykładowe zgłoszenia, żeby kalendarz i panel nie były puste.
    Usuń je w adminie (Rezerwacje) albo skasuj bazę, by zacząć czysto."""
    pakiety = {r['nazwa']: r['id'] for r in db.execute('SELECT id, nazwa FROM pakiety')}
    demo = [
        ('SYG-DEMO-001', 'Komunijny MID', 10, 'zapytanie', 'Anna Nowak', 'anna@przyklad.pl', 'Komunia w maju, sala na 60 osób.'),
        ('SYG-DEMO-002', 'Weselny MID', 17, 'zapytanie', 'Jan Kowalski', 'jan@przyklad.pl', 'Czy w pakiecie można dodać lampiony?'),
        ('SYG-DEMO-003', 'Komunijny FULL', 24, 'platnosc_w_toku', 'Ewa Zawadzka', 'ewa@przyklad.pl', ''),
        ('SYG-DEMO-004', 'Weselny ESENCJA', 31, 'zarezerwowany', 'Piotr Wysocki', 'piotr@przyklad.pl', 'Kaucja wpłacona, potwierdzenie przelewem.'),
    ]
    for syg, nazwa_pak, plus_dni, status, imie, email, tresc in demo:
        data = (dzis + datetime.timedelta(days=plus_dni)).isoformat()
        od = (dzis + datetime.timedelta(days=plus_dni - 1)).isoformat()
        do = (dzis + datetime.timedelta(days=plus_dni + 1)).isoformat()
        db.execute(
            'INSERT INTO rezerwacje (sygnatura, data, data_od, data_do, dni, pakiet_id, pakiet_nazwa, temat, imie, email, tresc, status, utworzono, zmieniono, historia) '
            'VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
            (syg, data, od, do, 3, pakiety[nazwa_pak], nazwa_pak, 'Rezerwacja terminu', imie, email, tresc,
             status, dzis.isoformat() + ' 09:00', dzis.isoformat() + ' 09:00',
             json.dumps([{'kiedy': dzis.isoformat() + ' 09:00', 'status': status, 'uwaga': 'dane demo'}], ensure_ascii=False)))
    db.commit()


def inicjuj(sciezka=None):
    """Tworzy katalog data/, tabele i dane startowe (tylko przy pierwszym uruchomieniu)."""
    import sqlite3
    baza_plik = sciezka or BAZA
    os.makedirs(os.path.dirname(baza_plik), exist_ok=True)
    db = sqlite3.connect(baza_plik)
    db.row_factory = sqlite3.Row
    db.executescript(SCHEMAT)

    # migracja starszych baz: dodaj kolumny najmu od-do (jeśli ich nie ma)
    kolumny = {r[1] for r in db.execute('PRAGMA table_info(rezerwacje)')}
    for kol, typ in [('data_od', 'TEXT'), ('data_do', 'TEXT'), ('dni', 'INTEGER DEFAULT 1'),
                     ('pozycje', "TEXT DEFAULT '[]'"), ('personalizacje', "TEXT DEFAULT '[]'")]:
        if kol not in kolumny:
            db.execute('ALTER TABLE rezerwacje ADD COLUMN %s %s' % (kol, typ))
    # stare rekordy miały tylko datę imprezy — domyślnie najem 3-dniowy (montaż dzień przed, demontaż dzień po)
    db.execute("UPDATE rezerwacje SET data_od=date(data,'-1 day'), data_do=date(data,'+1 day'), dni=3 WHERE data_od IS NULL OR data_od=''")
    db.commit()

    # migracja pakietów: kolumna cena_liczba (do kalkulacji najem × doby)
    kol_pak = {r[1] for r in db.execute('PRAGMA table_info(pakiety)')}
    if 'cena_liczba' not in kol_pak:
        db.execute('ALTER TABLE pakiety ADD COLUMN cena_liczba REAL DEFAULT 0')
    db.commit()
    mapa_cen = {nazwa: cena_liczba for (_, nazwa, _, _, cena_liczba, _, _) in PAKIETY}
    for nazwa, cena_liczba in mapa_cen.items():
        db.execute('UPDATE pakiety SET cena_liczba=? WHERE nazwa=? AND (cena_liczba IS NULL OR cena_liczba=0)',
                   (cena_liczba, nazwa))

    # migracja katalogu najmu: jednorazówki NIE są najmem — przenieś do personalizacji
    db.execute("DELETE FROM produkty WHERE nazwa IN ('Panel z cytatem','Ramka rzeźbiona','Grawer okolicznościowy')")
    for stara, nowa_nazwa, nowy_opis in [
        ('Winietki i plan dnia', 'Plan dnia (tablica)', 'Tablica harmonogramu imprezy · wymienna'),
        ('Szyld powitalny', 'Szyld powitalny', '„Witajcie" · 60×40 cm · wkładka wymienna (treść jako personalizacja) · opcjonalne LED'),
        ('Litery podświetlane MAŁE', 'Litery podświetlane MAŁE', 'Litery do ułożenia napisu · 25 cm · LED 2700 K'),
        ('Litery podświetlane DUŻE', 'Litery podświetlane DUŻE', 'Napis do ułożenia · 60 cm · podświetlenie LED'),
        ('Mozaika „scrabble"', 'Mozaika „scrabble"', 'Drewniane literki do ułożenia napisu · ściana lub stół'),
    ]:
        db.execute('UPDATE produkty SET nazwa=?, opis=? WHERE nazwa=?', (nowa_nazwa, nowy_opis, stara))
    db.commit()

    # migracja pakietów: USUŃ pozycje personalizowane (jednorazówki nie wchodzą do najmu);
    # mozaika scrabble w pakietach zostaje jako literki do ułożenia (imiona = osobna personalizacja)
    def czysc_pozycje(txt):
        out = []
        for linia in (txt or '').splitlines():
            l = linia.strip()
            if not l:
                continue
            low = l.lower()
            if 'personalizowan' in low or 'personalizacj' in low or 'wkładki z logo' in low or low.startswith('wkładka'):
                continue
            if 'mozaika' in low and 'imionami' in low:
                l = 'Mozaika „scrabble" (literki do ułożenia)'
            if 'litery podświetlane' in low and '—' in l:
                # zostaw sam produkt, bez dopisku o treści (treść = personalizacja)
                l = l.split('—')[0].strip()
            if 'panel z cytatem' in low or ('ramka' in low and 'rzeźbion' in low) or 'grawer okolicznościowy' in low:
                continue
            out.append(l)
        return '\n'.join(out)
    for row in db.execute('SELECT id, pozycje FROM pakiety').fetchall():
        nowe = czysc_pozycje(row['pozycje'])
        if nowe != (row['pozycje'] or ''):
            db.execute('UPDATE pakiety SET pozycje=? WHERE id=?', (nowe, row['id']))
    db.commit()

    if db.execute('SELECT COUNT(*) FROM kategorie').fetchone()[0] == 0:
        for i, (nazwa, opis) in enumerate(KATEGORIE):
            db.execute('INSERT INTO kategorie (nazwa, opis, kolejnosc) VALUES (?,?,?)', (nazwa, opis, i))
        for nazwa, kat_id, opis, cena in PRODUKTY:
            db.execute('INSERT INTO produkty (nazwa, kategoria_id, opis, cena_doba) VALUES (?,?,?,?)',
                       (nazwa, kat_id + 1, opis, cena))
        for ev, nazwa, opis, cena, cena_liczba, tier, pozycje in PAKIETY:
            db.execute('INSERT INTO pakiety (ev, nazwa, opis, cena, cena_liczba, tier, pozycje) VALUES (?,?,?,?,?,?,?)',
                       (ev, nazwa, opis, cena, cena_liczba, tier, pozycje))
        for klucz, wartosc in domyslne_ustawienia().items():
            db.execute('INSERT INTO ustawienia (klucz, wartosc) VALUES (?,?)', (klucz, wartosc))
        db.commit()

    # katalog personalizacji (jednorazówki) — seed przy pustej tabeli
    if db.execute('SELECT COUNT(*) FROM personalizacje').fetchone()[0] == 0:
        for i, (nazwa, opis, cena) in enumerate(PERSONALIZACJE):
            db.execute('INSERT INTO personalizacje (nazwa, opis, cena, kolejnosc) VALUES (?,?,?,?)',
                       (nazwa, opis, cena, i))
        db.commit()

    # demo ładuje się TYLKO przy pierwszym w historii uruchomieniu (marker na dysku);
    # po skasowaniu bazy demo NIE wraca — baza odtwarza się czysta
    marker = os.path.join(os.path.dirname(baza_plik), '.zainicjowano')
    if not os.path.exists(marker):
        zaladuj_demo(db, datetime.date.today())
        with open(marker, 'w', encoding='utf-8') as f:
            f.write(datetime.date.today().isoformat())

    db.close()
