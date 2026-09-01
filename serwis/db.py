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
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  ev        TEXT DEFAULT 'inne',    -- komunijny / weselny / firmowy / jubileuszowy
  nazwa     TEXT NOT NULL,
  opis      TEXT DEFAULT '',
  cena      TEXT DEFAULT '',
  tier      TEXT DEFAULT '',        -- ESENCJA / MID / FULL
  pozycje   TEXT DEFAULT '',        -- lista pozycji, KAŻDA W OSOBNEJ LINII
  dostepny  INTEGER DEFAULT 1,      -- 1 = pokazuj na stronie, 0 = ukryj (checkbox w adminie)
  kolejnosc INTEGER DEFAULT 0
);
-- Zgłoszenia / rezerwacje klientów
CREATE TABLE IF NOT EXISTS rezerwacje (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  sygnatura    TEXT,                -- np. SYG-2026-001 (nadawana automatycznie)
  data         TEXT,                -- 'RRRR-MM-DD'
  pakiet_id    INTEGER,
  pakiet_nazwa TEXT,
  temat        TEXT DEFAULT 'Rezerwacja terminu',
  imie         TEXT DEFAULT '',
  email        TEXT NOT NULL,
  telefon      TEXT DEFAULT '',
  tresc        TEXT DEFAULT '',     -- indywidualna wiadomość klienta
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
    ('Szyld powitalny', 0, '„Witajcie" z imionami na wymiennej wkładce · 60×40 cm · opcjonalne podświetlenie LED', 49),
    ('Tablica „rozpiska stołów"', 0, 'Plan sali z listą gości · wymienne karty przy stołach · 100×70 cm', 59),
    ('Tablice informacyjne', 0, 'Toaleta · parking · palarnia · plan sali — komplet z podpórkami', 30),
    ('Numery stołów', 1, 'Grawerowane, stojące · komplet 10 szt. · wymienne', 25),
    ('Serwetniki', 1, 'Drewniane obrączki na serwetki · komplet 30 szt.', 20),
    ('Winietki i plan dnia', 1, 'Imienne oznaczenia stołów + tablica harmonogramu imprezy', 30),
    ('Skrzynka na życzenia', 1, 'Drewniana, z grawerem · na koperty i kartki', 25),
    ('Lampki', 2, 'Fairy lights, ciepłe 2700 K · 10 m · z koszykiem baterii', 15),
    ('Lampiony', 2, 'Drewniane, geometryczne · komplet 6 szt. · światło od środka', 35),
    ('Świeczniki', 2, 'Drewniane, stabilne · komplet 12 szt. · świece w zestawie', 30),
    ('Litery podświetlane MAŁE', 3, 'Inicjały lub imiona · 25 cm · LED 2700 K', 45),
    ('Litery podświetlane DUŻE', 3, '„LOVE" / nazwisko · 60 cm · podświetlenie LED', 120),
    ('Mozaika „scrabble"', 3, 'Imiona w drewnianych kafelkach · składamy na ścianie lub stole', 55),
    ('Panel z cytatem', 4, 'Warstwowy panel z sentencją, imionami i datą — do powieszenia na ścianie', 149),
    ('Ramka rzeźbiona', 5, 'Na zdjęcie z uroczystości — rzeźbiona, z datą i okazją na dole', 169),
    ('Grawer okolicznościowy', 5, 'Tabliczka z dedykacją — jubileusz, rocznica albo pożegnanie pracownika', 89),
]

PAKIETY = [
    # KOMUNIJNY (esencja / mid / full)
    ('komunijny', 'Komunijny ESENCJA', 'dla kameralnego przyjęcia', 'od 199 zł / doba', 'ESENCJA',
     'Tablica z imieniem — 1 szt.\nOznaczenia stołów — 6 szt.\nWinietki imienne — 20 szt.\nŚwieczniki drewniane — 6 szt.\nWkładka personalizowana w cenie'),
    ('komunijny', 'Komunijny MID', 'najczęściej wybierany', 'od 349 zł / doba', 'MID',
     'Wszystko z ESENCJI\nSzyld powitalny — 1 szt.\nPlan stołów — 1 szt.\nNumery stolików — 10 szt.\nLampki ciepłe 10 m + lampiony ×6\nMozaika „scrabble" z imionami\nWkładka personalizowana w cenie'),
    ('komunijny', 'Komunijny FULL', 'pełna oprawa sali + montaż', 'od 599 zł / doba', 'FULL',
     'Wszystko z MID\nLitery podświetlane DUŻE — imię, 60 cm\nLampki 30 m + lampiony ×12\nPanel z cytatem na ścianę\nMontaż i demontaż po stronie Studia\nPersonalizacja wszystkich grawerów w cenie'),
    # WESELNY (opcje i.w.)
    ('weselny', 'Weselny ESENCJA', 'i.w. — małe wesele', 'od 299 zł / doba', 'ESENCJA',
     'Szyld powitalny — 1 szt.\nPlan stołów — 1 szt.\nNumery stolików — 10 szt.\nLampki ciepłe 10 m + lampiony ×6\nWkładka personalizowana w cenie'),
    ('weselny', 'Weselny MID', 'i.w. — do 120 gości', 'od 499 zł / doba', 'MID',
     'Wszystko z ESENCJI\nLitery podświetlane MAŁE — inicjały\nMozaika „scrabble" z imionami\nSkrzynka na życzenia\nŚwieczniki — 12 szt.\nWkładka personalizowana w cenie'),
    ('weselny', 'Weselny FULL', 'i.w. — pełna oprawa + montaż', 'od 799 zł / doba', 'FULL',
     'Wszystko z MID\nLitery podświetlane DUŻE — „LOVE" / nazwisko, 60 cm\nLampki 30 m + lampiony ×12\nWinietki i plan dnia\nPanel z cytatem na ścianę\nMontaż i demontaż po stronie Studia\nPersonalizacja wszystkich grawerów w cenie'),
    # FIRMOWY
    ('firmowy', 'Firmowy ESENCJA', 'spotkanie zespołu', 'od 249 zł / doba', 'ESENCJA',
     'Tablica powitalna z logo — 1 szt.\nOznaczenia sal — 4 szt.\nNumeracja stanowisk — 12 szt.\nZnaki kierunkowe — 6 szt.\nWkładki z logo w cenie'),
    ('firmowy', 'Firmowy MID', 'konferencja / event do 120 osób', 'od 449 zł / doba', 'MID',
     'Wszystko z ESENCJI\nLitery podświetlane MAŁE — logo lub inicjały\nLampki 20 m + lampiony ×8\nŚwieczniki — 12 szt.\nWkładki z logo w cenie'),
    ('firmowy', 'Firmowy FULL', 'gala / duży event + montaż', 'od 749 zł / doba', 'FULL',
     'Wszystko z MID\nLitery podświetlane DUŻE — nazwa firmy, 60 cm\nLampki 30 m + lampiony ×12\nTablice informacyjne (toaleta · parking · palarnia)\nMontaż i demontaż po stronie Studia\nPersonalizacja wszystkich grawerów w cenie'),
    # JUBILEUSZOWY / URODZINOWY
    ('jubileuszowy', 'Jubileuszowy ESENCJA', 'urodziny w gronie bliskich', 'od 199 zł / doba', 'ESENCJA',
     'Szyld powitalny — 1 szt.\nNumery stolików — 6 szt.\nŚwieczniki drewniane — 6 szt.\nGrawer okolicznościowy — 1 szt.\nWkładka personalizowana w cenie'),
    ('jubileuszowy', 'Jubileuszowy MID', 'okrągła rocznica', 'od 349 zł / doba', 'MID',
     'Wszystko z ESENCJI\nLitery podświetlane MAŁE — wiek lub inicjały\nMozaika „scrabble" z imionami\nLampki 10 m + lampiony ×6\nPanel z cytatem na ścianę\nWkładka personalizowana w cenie'),
    ('jubileuszowy', 'Jubileuszowy FULL', 'duża uroczystość + montaż', 'od 599 zł / doba', 'FULL',
     'Wszystko z MID\nLitery podświetlane DUŻE — liczba lub nazwisko, 60 cm\nLampki 30 m + lampiony ×12\nRamka rzeźbiona na zdjęcie\nMontaż i demontaż po stronie Studia\nPersonalizacja wszystkich grawerów w cenie'),
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
        db.execute(
            'INSERT INTO rezerwacje (sygnatura, data, pakiet_id, pakiet_nazwa, temat, imie, email, tresc, status, utworzono, zmieniono, historia) '
            'VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
            (syg, data, pakiety[nazwa_pak], nazwa_pak, 'Rezerwacja terminu', imie, email, tresc,
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

    if db.execute('SELECT COUNT(*) FROM kategorie').fetchone()[0] == 0:
        for i, (nazwa, opis) in enumerate(KATEGORIE):
            db.execute('INSERT INTO kategorie (nazwa, opis, kolejnosc) VALUES (?,?,?)', (nazwa, opis, i))
        for nazwa, kat_id, opis, cena in PRODUKTY:
            db.execute('INSERT INTO produkty (nazwa, kategoria_id, opis, cena_doba) VALUES (?,?,?,?)',
                       (nazwa, kat_id + 1, opis, cena))
        for ev, nazwa, opis, cena, tier, pozycje in PAKIETY:
            db.execute('INSERT INTO pakiety (ev, nazwa, opis, cena, tier, pozycje) VALUES (?,?,?,?,?,?)',
                       (ev, nazwa, opis, cena, tier, pozycje))
        for klucz, wartosc in domyslne_ustawienia().items():
            db.execute('INSERT INTO ustawienia (klucz, wartosc) VALUES (?,?)', (klucz, wartosc))
        db.commit()

    # demo ładuje się TYLKO przy pierwszym w historii uruchomieniu (marker na dysku);
    # po skasowaniu bazy demo NIE wraca — baza odtwarza się czysta
    marker = os.path.join(os.path.dirname(baza_plik), '.zainicjowano')
    if not os.path.exists(marker):
        zaladuj_demo(db, datetime.date.today())
        with open(marker, 'w', encoding='utf-8') as f:
            f.write(datetime.date.today().isoformat())

    db.close()
