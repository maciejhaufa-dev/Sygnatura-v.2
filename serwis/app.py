# -*- coding: utf-8 -*-
"""Studio Sygnatura — serwis z panelem administracyjnym.

URUCHOMIENIE (lokalnie na swoim komputerze):
    cd serwis
    python app.py
    -> otwórz http://127.0.0.1:8000

Wymagane: pip install flask  (raz)
Baza: data/serwis.db (SQLite, tworzy się sama; usunięcie pliku = reset do danych startowych)

Struktura:
    serwis/app.py        — ta aplikacja (trasy, formularze, API)
    serwis/db.py         — baza danych + dane startowe
    serwis/core.py       — statusy, sygnatury, e-maile, Google Sheets, treści maili
    serwis/templates/    — szablony HTML (Jinja2) — tu edytujesz wygląd
    serwis/static/       — pliki statyczne (style, ikony)
    serwis/data/         — baza + dokumenty (NIE wrzucaj do gita, jest w .gitignore)
"""
import os
import re
import json
import sqlite3
import datetime

from flask import (Flask, g, request, render_template, render_template_string,
                   redirect, url_for, session, send_from_directory, abort, flash)

import db as baza_mod
import core

ROOT = os.path.dirname(os.path.abspath(__file__))
V4 = os.path.normpath(os.path.join(ROOT, '..', 'v4'))
DATA = os.path.join(ROOT, 'data')
os.makedirs(DATA, exist_ok=True)

app = Flask(__name__)

# tajny klucz sesji (trwały, generowany raz)
SECRET = os.path.join(DATA, 'secret.txt')
if not os.path.exists(SECRET):
    with open(SECRET, 'w') as f:
        f.write(os.urandom(24).hex())
app.secret_key = open(SECRET).read()

MIESIACE = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
            'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień']
DZIEN = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd']

EV_GRUPY = {
    'komunijny': ('Pakiet Komunijny', 'komunia / chrzest — esencja, mid i full'),
    'weselny': ('Pakiet Weselny', 'wesele — opcje i.w.'),
    'firmowy': ('Pakiet Firmowy', 'konferencja, gala, event firmowy'),
    'jubileuszowy': ('Pakiet Jubileuszowy', 'urodziny, rocznica, jubileusz'),
    'inne': ('Inne', 'pozostałe pakiety'),
}

# ---------------------------------------------------------------- baza per żądanie
def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(baza_mod.BAZA)
        g.db.row_factory = sqlite3.Row
        g.db.execute('PRAGMA foreign_keys = ON')
    return g.db


@app.teardown_appcontext
def zamknij_db(exc):
    db = g.pop('db', None)
    if db is not None:
        db.close()


def redirect303(cel, **kw):
    """Redirect po formularzu POST - kod 303 wymusza GET (przegladarka nie ponawia POST).
    Przyjmuje GOTOWY adres (wynik url_for), nie endpoint."""
    return redirect(cel, code=303)


def admin_required(fn):
    from functools import wraps
    @wraps(fn)
    def wrap(*a, **kw):
        if not session.get('admin'):
            return redirect303(url_for('admin_login', dalej=request.path))
        return fn(*a, **kw)
    return wrap


# ---------------------------------------------------------------- strony statyczne (kopie z v4)
STATYCZNE = ['index.html', 'warsztat.html', 'galeria.html', 'sklep.html', 'kontakt.html', 'hero-picker.html']

def wczytaj_v4(nazwa):
    """Czyta stronę z folderu v4 i przepisuje ścieżki na trasy Flaska:
    assets/ -> /assets/ oraz wynajem.html -> /wynajem/"""
    sciezka = os.path.join(V4, nazwa)
    if not os.path.exists(sciezka):
        abort(404)
    tresc = open(sciezka, encoding='utf-8').read()
    tresc = tresc.replace('assets/', '/assets/')
    tresc = tresc.replace('wynajem.html', '/wynajem/')
    return render_template_string(tresc)


@app.route('/')
def index():
    return wczytaj_v4('index.html')


@app.route('/warsztat.html')
def warsztat():
    return wczytaj_v4('warsztat.html')


@app.route('/galeria.html')
def galeria():
    return wczytaj_v4('galeria.html')


@app.route('/sklep.html')
def sklep():
    return wczytaj_v4('sklep.html')


@app.route('/kontakt.html')
def kontakt():
    return wczytaj_v4('kontakt.html')


@app.route('/hero-picker.html')
def hero_picker():
    return wczytaj_v4('hero-picker.html')


@app.route('/assets/<path:nazwa>')
def assets(nazwa):
    return send_from_directory(os.path.join(V4, 'assets'), nazwa)


# ---------------------------------------------------------------- strona wynajmu
def stan_dnia(db, pakiet_id, data):
    """(klasa_css, tytul, czy_zablokowany) dla jednego dnia.
    pakiet_id=None -> sprawdza rezerwacje WSZYSTKICH pakietów (zestaw własny = wspólna pula towaru)."""
    if pakiet_id:
        row = db.execute(
            "SELECT status FROM rezerwacje WHERE pakiet_id=? AND status!='odrzucono' AND ? BETWEEN data_od AND data_do "
            "ORDER BY CASE status WHEN 'zarezerwowany' THEN 0 WHEN 'platnosc_w_toku' THEN 1 ELSE 2 END LIMIT 1",
            (pakiet_id, data)).fetchone()
    else:
        row = db.execute(
            "SELECT status FROM rezerwacje WHERE status!='odrzucono' AND ? BETWEEN data_od AND data_do "
            "ORDER BY CASE status WHEN 'zarezerwowany' THEN 0 WHEN 'platnosc_w_toku' THEN 1 ELSE 2 END LIMIT 1",
            (data,)).fetchone()
    if not row:
        return '', '', False
    status = row['status']
    if status == 'zarezerwowany':
        return 'st-zarezerwowany', 'Termin zarezerwowany', True
    if status == 'platnosc_w_toku':
        return 'st-platnosc', 'Płatność w toku — termin wstrzymany', True
    return 'st-zapytanie', 'Wysłano zapytanie — nadal można pytać o ten termin', False


def siatka_miesiaca(db, pakiet_id, rok, mies):
    """Zwraca listę dni miesiąca z klasami statusów (poniedziałek = kolumna 1)."""
    pierwszy = datetime.date(rok, mies, 1)
    przesun = pierwszy.weekday()  # Pn=0
    ile = (datetime.date(rok + (mies // 12), (mies % 12) + 1, 1) - pierwszy).days
    dni = []
    for i in range(przesun):
        dni.append({'nr': '', 'data': '', 'klasa': 'pusty', 'tytul': '', 'zajety': False})
    for nr in range(1, ile + 1):
        data = '%04d-%02d-%02d' % (rok, mies, nr)
        klasa, tytul, zajety = stan_dnia(db, pakiet_id, data)
        if datetime.date(rok, mies, nr) < datetime.date.today():
            klasa, tytul, zajety = 'przeszly', 'Termin minął', True
        dni.append({'nr': nr, 'data': data, 'klasa': klasa, 'tytul': tytul, 'zajety': zajety})
    return dni


def zakres_domyslny(data):
    """Domyślny zakres najmu: dzień przed imprezą (montaż) i dzień po (demontaż) = min. 3 doby."""
    if not data:
        return '', ''
    try:
        d = datetime.date.fromisoformat(data)
    except ValueError:
        return '', ''
    return (d - datetime.timedelta(days=1)).isoformat(), (d + datetime.timedelta(days=1)).isoformat()


def konflikty_zakresu(db, pakiet_id, od, do):
    """Sprawdza cały zakres od–do dzień po dniu.
    Zwraca (konflikty_blokujace, ostrzezenia_zapytania).
    pakiet_id=None -> sprawdza całą pulę (zestaw własny)."""
    blok, pyt = [], []
    dzien = od
    while dzien <= do:
        iso = dzien.isoformat()
        if pakiet_id:
            row = db.execute(
                "SELECT status FROM rezerwacje WHERE pakiet_id=? AND status!='odrzucono' AND ? BETWEEN data_od AND data_do "
                "ORDER BY CASE status WHEN 'zarezerwowany' THEN 0 WHEN 'platnosc_w_toku' THEN 1 ELSE 2 END LIMIT 1",
                (pakiet_id, iso)).fetchone()
        else:
            row = db.execute(
                "SELECT status FROM rezerwacje WHERE status!='odrzucono' AND ? BETWEEN data_od AND data_do "
                "ORDER BY CASE status WHEN 'zarezerwowany' THEN 0 WHEN 'platnosc_w_toku' THEN 1 ELSE 2 END LIMIT 1",
                (iso,)).fetchone()
        if row:
            if row['status'] in ('zarezerwowany', 'platnosc_w_toku'):
                blok.append((iso, row['status']))
            else:
                pyt.append(iso)
        dzien += datetime.timedelta(days=1)
    return blok, pyt


@app.route('/wynajem/')
def wynajem():
    """Strona główna wynajmu: WYBÓR TYPU WYDARZENIA — bez kalendarzy."""
    db = get_db()
    pakiety = db.execute('SELECT * FROM pakiety WHERE dostepny=1 ORDER BY kolejnosc, id').fetchall()
    liczba = {}
    for p in pakiety:
        liczba[p['ev']] = liczba.get(p['ev'], 0) + 1
    grupy = []
    for ev, (nazwa_g, opis_g) in EV_GRUPY.items():
        if liczba.get(ev):
            grupy.append({'ev': ev, 'nazwa': nazwa_g, 'opis': opis_g, 'ile': liczba[ev]})
    kategorie = db.execute('SELECT * FROM kategorie ORDER BY kolejnosc, id').fetchall()
    produkty = db.execute('SELECT * FROM produkty WHERE dostepny=1 ORDER BY kolejnosc, id').fetchall()
    produkty_wg = {}
    for pr in produkty:
        produkty_wg.setdefault(pr['kategoria_id'], []).append(pr)
    return render_template('wynajem.html', grupy=grupy, kategorie=kategorie, produkty_wg=produkty_wg)


@app.route('/wynajem/komponuje/')
def komponuje():
    """Kompozytor własnego zestawu: katalog z kalkulatorem + termin od–do."""
    db = get_db()
    kategorie = db.execute('SELECT * FROM kategorie ORDER BY kolejnosc, id').fetchall()
    produkty = db.execute('SELECT * FROM produkty WHERE dostepny=1 ORDER BY kolejnosc, id').fetchall()
    produkty_wg = {}
    for pr in produkty:
        produkty_wg.setdefault(pr['kategoria_id'], []).append(pr)
    rok = int(request.args.get('rok') or datetime.date.today().year)
    mies = int(request.args.get('mies') or datetime.date.today().month)
    dni = siatka_miesiaca(db, None, rok, mies)  # zajętość z CAŁEJ puli towaru
    poprz = (rok - 1, 12) if mies == 1 else (rok, mies - 1)
    nast = (rok + 1, 1) if mies == 12 else (rok, mies + 1)
    data = request.args.get('data', '')
    data_od = request.args.get('data_od', '')
    data_do = request.args.get('data_do', '')
    if data and not data_od:
        data_od, data_do = zakres_domyslny(data)
    # preselekcja: produkty z katalogu + personalizacje (powrót z /personalizacja/)
    try:
        poz_ids = [int(x) for x in json.loads(request.args.get('pozycje') or '[]')]
    except Exception:
        poz_ids = []
    pers_ids = [int(x) for x in request.args.get('pers', '').split(',') if x.strip().isdigit()]
    personalizacje = []
    for pid3 in pers_ids:
        pr = db.execute('SELECT * FROM personalizacje WHERE id=? AND dostepny=1', (pid3,)).fetchone()
        if pr:
            personalizacje.append(pr)
    return render_template('komponuje.html', kategorie=kategorie, produkty_wg=produkty_wg,
                           liczba=len(produkty), poz_ids=poz_ids, personalizacje=personalizacje, pers_ids=pers_ids,
                           dni=dni, rok=rok, mies=mies, mies_nazwa=MIESIACE[mies - 1],
                           poprz=poprz, nast=nast, data=data, data_od=data_od, data_do=data_do)


@app.route('/personalizacja/')
def personalizacja():
    """Podstrona personalizacji: jednorazówki płatne z góry, bezzwrotne.
    Wybór wraca do formularza (parametr next)."""
    db = get_db()
    pozycje = db.execute('SELECT * FROM personalizacje WHERE dostepny=1 ORDER BY kolejnosc, id').fetchall()
    nastepny = request.args.get('next') or url_for('wynajem')
    if not nastepny.startswith('/'):
        nastepny = url_for('wynajem')
    pers = request.args.get('pers', '')
    return render_template('personalizacja.html', pozycje=pozycje, nastepny=nastepny, pers=pers)


@app.route('/wynajem/<ev>/')
def wynajem_wydarzenie(ev):
    """Wybrany typ wydarzenia: poziomy ESENCJA / MID / FULL — bez kalendarzy."""
    if ev not in EV_GRUPY:
        abort(404)
    db = get_db()
    pakiety = db.execute('SELECT * FROM pakiety WHERE ev=? AND dostepny=1 ORDER BY kolejnosc, id', (ev,)).fetchall()
    if not pakiety:
        abort(404)
    return render_template('wydarzenie.html', ev=ev, nazwa=EV_GRUPY[ev][0], opis=EV_GRUPY[ev][1], pakiety=pakiety)


@app.route('/wynajem/pakiet/<int:pid>/')
def pakiet_szczegoly(pid):
    """Konkretny pakiet: kalendarz dostępności + wejście do rezerwacji od–do."""
    db = get_db()
    p = db.execute('SELECT * FROM pakiety WHERE id=? AND dostepny=1', (pid,)).fetchone()
    if not p:
        abort(404)
    rok = int(request.args.get('rok') or datetime.date.today().year)
    mies = int(request.args.get('mies') or datetime.date.today().month)
    dni = siatka_miesiaca(db, p['id'], rok, mies)
    poprz = (rok - 1, 12) if mies == 1 else (rok, mies - 1)
    nast = (rok + 1, 1) if mies == 12 else (rok, mies + 1)
    return render_template('pakiet.html', p=p, dni=dni, rok=rok, mies=mies, mies_nazwa=MIESIACE[mies - 1],
                           poprz=poprz, nast=nast, ev_nazwa=EV_GRUPY.get(p['ev'], ('Inne', ''))[0])


@app.route('/wynajem/pakiet/<int:pid>/rezerwuj')
def rezerwuj(pid):
    db = get_db()
    p = db.execute('SELECT * FROM pakiety WHERE id=? AND dostepny=1', (pid,)).fetchone()
    if not p:
        abort(404)
    data = request.args.get('data', '')
    data_od = request.args.get('data_od', '')
    data_do = request.args.get('data_do', '')
    if data and not data_od:
        data_od, data_do = zakres_domyslny(data)
    # produkty spersonalizowane wybrane wcześniej na /personalizacja/
    pers_ids = [int(x) for x in request.args.get('pers', '').split(',') if x.strip().isdigit()]
    personalizacje = []
    for pid3 in pers_ids:
        pr = db.execute('SELECT * FROM personalizacje WHERE id=? AND dostepny=1', (pid3,)).fetchone()
        if pr:
            personalizacje.append(pr)
    return render_template('formularz.html', p=p, data=data, data_od=data_od, data_do=data_do,
                           personalizacje=personalizacje, pers_ids=pers_ids)


@app.route('/wynajem/<int:pakiet_id>/rezerwuj')
def rezerwuj_stare(pakiet_id):
    """Stary adres — przekierowanie na nową strukturę."""
    return redirect(url_for('rezerwuj', pid=pakiet_id, data=request.args.get('data', '')), code=301)


@app.route('/api/rezerwuj', methods=['POST'])
def api_rezerwuj():
    db = get_db()
    pakiet_id = int(request.form.get('pakiet_id') or 0)
    p = None
    if pakiet_id:
        p = db.execute('SELECT * FROM pakiety WHERE id=?', (pakiet_id,)).fetchone()
        if not p:
            abort(404)

    def wroc(data='', data_od='', data_do='', pers=''):
        kw = dict(data=data, data_od=data_od, data_do=data_do)
        if pers:
            kw['pers'] = pers
        if pakiet_id:
            return redirect303(url_for('rezerwuj', pid=pakiet_id, **kw))
        return redirect303(url_for('komponuje', **kw))

    data = (request.form.get('data') or '').strip()
    data_od = (request.form.get('data_od') or '').strip()
    data_do = (request.form.get('data_do') or '').strip()
    try:
        d_ev = datetime.date.fromisoformat(data)
        d_od = datetime.date.fromisoformat(data_od)
        d_do = datetime.date.fromisoformat(data_do)
    except ValueError:
        flash('Podaj poprawne daty (RRRR-MM-DD).')
        return wroc(data, data_od, data_do)
    if not (d_od <= d_ev <= d_do):
        flash('Data imprezy musi się mieścić między „od" a „do".')
        return wroc(data, data_od, data_do)
    if d_od < datetime.date.today():
        flash('Termin nie może zaczynać się w przeszłości.')
        return wroc(data, data_od, data_do)
    dni = (d_do - d_od).days + 1

    # konflikt w całym zakresie (dzień po dniu)
    blok, pyt = konflikty_zakresu(db, pakiet_id, d_od, d_do)
    if blok:
        opis = ', '.join('%s (%s)' % (d, core.STATUSY_PL[s]) for d, s in blok[:5])
        flash('Termin niedostępny w dniach: %s. Wybierz inny zakres.' % opis)
        return wroc(data, data_od, data_do)

    # zestaw własny: skład z katalogu
    pozycje = []
    if not pakiet_id:
        try:
            ids = [int(x) for x in json.loads(request.form.get('pozycje') or '[]')]
        except Exception:
            ids = []
        for pid2 in ids:
            pr = db.execute('SELECT * FROM produkty WHERE id=?', (pid2,)).fetchone()
            if pr:
                pozycje.append({'nazwa': pr['nazwa'], 'cena': pr['cena_doba']})
        if not pozycje:
            flash('Zaznacz co najmniej jeden produkt z katalogu.')
            return wroc(data, data_od, data_do)

    # produkty spersonalizowane (jednorazówki) — KAŻDY z własnym opisem
    pers_list = []
    try:
        pers_ids = [int(x) for x in json.loads(request.form.get('pers') or '[]')]
    except Exception:
        pers_ids = []
    for pid3 in pers_ids:
        pr = db.execute('SELECT * FROM personalizacje WHERE id=? AND dostepny=1', (pid3,)).fetchone()
        if pr:
            opis = (request.form.get('pers_opis_%d' % pr['id']) or '').strip()
            if not opis:
                flash('Uzupełnij opis personalizacji: %s (co i jak ma być spersonalizowane).' % pr['nazwa'])
                return wroc(data, data_od, data_do, pers=','.join(str(x) for x in pers_ids))
            pers_list.append({'nazwa': pr['nazwa'], 'cena': pr['cena'], 'opis': opis})

    email = (request.form.get('email') or '').strip()
    if not re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', email):
        flash('Podaj poprawny adres e-mail.')
        return wroc(data, data_od, data_do)

    # checkboxy: value=nowa / value=istniejaca (zaznaczony "istniejaca" ma priorytet)
    tryb = 'istniejaca' if 'istniejaca' in request.form.getlist('tryb_sygnatury') else 'nowa'
    sygnatura = ''
    if tryb == 'istniejaca':
        sygnatura = (request.form.get('sygnatura') or '').strip().upper()
        if not sygnatura:
            flash('Wpisz sygnaturę sprawy albo zaznacz „nadaj nową sygnaturę".')
            return wroc(data, data_od, data_do)
    else:
        sygnatura = core.nowa_sygnatura(db)

    temat = (request.form.get('temat') or 'Rezerwacja terminu').strip()
    imie = (request.form.get('imie') or '').strip()
    telefon = (request.form.get('telefon') or '').strip()
    tresc = (request.form.get('tresc') or '').strip()

    # najem na 1 dobę tylko z uzasadnieniem (montaż/demontaż wymaga min. 3 dób)
    if dni == 1 and len(tresc) < 20:
        flash('Najem na 1 dobę to wyjątek — dekoracje zakładamy dzień przed i ściągamy dzień po imprezie. '
              'Krótko uzasadnij w wiadomości, a rozpatrzymy to ręcznie.')
        return wroc(data, data_od, data_do)

    # PODSUMOWANIE KWOT: najem × doby + kaucja + personalizacja z góry (rabat −5% od 3 szt.)
    if p:
        stawka = p['cena_liczba'] or 0
        stawka_txt = p['cena']
    else:
        stawka = sum(float(x['cena']) for x in pozycje)
        stawka_txt = '%d zł / doba (zestaw własny)' % stawka
    pers_suma = sum(float(x['cena']) for x in pers_list)
    pers_rabat = round(pers_suma * 0.05) if len(pers_list) >= 3 else 0
    pers_netto = pers_suma - pers_rabat
    najem_kwota = round(stawka * dni)
    kwoty = {'najem': najem_kwota, 'stawka_txt': stawka_txt, 'dni': dni,
             'pers_suma': pers_suma, 'pers_rabat': pers_rabat, 'pers_netto': pers_netto,
             'razem': najem_kwota + 300 + pers_netto}

    teraz = core.teraz()
    pakiet_nazwa = p['nazwa'] if p else 'Zestaw własny'
    db.execute(
        'INSERT INTO rezerwacje (sygnatura, data, data_od, data_do, dni, pakiet_id, pakiet_nazwa, temat, imie, email, telefon, tresc, pozycje, personalizacje, '
        'status, utworzono, zmieniono, historia) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        (sygnatura, data, data_od, data_do, dni, p['id'] if p else None, pakiet_nazwa, temat, imie, email, telefon, tresc,
         json.dumps(pozycje, ensure_ascii=False),
         json.dumps(pers_list, ensure_ascii=False),
         'zapytanie', teraz, teraz, json.dumps([{'kiedy': teraz, 'status': 'zapytanie', 'uwaga': 'zgłoszenie przez formularz'}], ensure_ascii=False)))
    db.commit()
    rez = db.execute('SELECT * FROM rezerwacje WHERE sygnatura=?', (sygnatura,)).fetchone()

    # informacja dla Studia o istniejących zapytaniach w zakresie (nie blokują, ale warto wiedzieć)
    if pyt:
        db.execute('UPDATE rezerwacje SET tresc=? WHERE id=?',
                   ((rez['tresc'] + '\n\nUWAGA: w zakresie są dni z istniejącymi zapytaniami: ' + ', '.join(pyt)).strip(), rez['id']))
        db.commit()
        rez = db.execute('SELECT * FROM rezerwacje WHERE id=?', (rez['id'],)).fetchone()

    # kwoty dołączamy do kopii rekordu (maile pokazują pełne podsumowanie)
    rez_z_kwotami = dict(rez)
    rez_z_kwotami['kwoty'] = kwoty

    # 1) e-mail do Studia (powiadomienie)
    core.wyslij_do_studia(db, 'Nowe zapytanie — %s — %s–%s' % (rez['pakiet_nazwa'], data_od, data_do),
                          core.mail_studio_zapytanie(rez_z_kwotami))
    # 2) autoresponder do klienta (podsumowanie + procedura + dokumenty)
    dok = json.loads(db.execute("SELECT wartosc FROM ustawienia WHERE klucz='dokumenty'").fetchone()['wartosc'] or '[]')
    core.wyslij_do_klienta(db, email, 'Twoje zapytanie %s — Studio Sygnatura' % sygnatura,
                           core.mail_klient_zapytanie(rez_z_kwotami, dok))
    # 3) zapytanie do API Google Sheets (skonfigurujemy później — bez URL nic nie wysyła)
    core.push_do_sheets(db, rez)

    return redirect303(url_for('dziekuje', sygnatura=sygnatura))


@app.route('/wynajem/dziekuje')
def dziekuje():
    db = get_db()
    syg = request.args.get('sygnatura', '')
    rez = db.execute('SELECT * FROM rezerwacje WHERE sygnatura=?', (syg,)).fetchone() if syg else None
    pers_n = 0
    if rez:
        try:
            pers_n = len(json.loads(rez['personalizacje'] or '[]'))
        except Exception:
            pers_n = 0
    return render_template('dziekuje.html', rez=rez, sygnatura=syg, pers_n=pers_n)


# ---------------------------------------------------------------- pliki (dokumenty)
@app.route('/pliki/<nazwa>')
def pliki(nazwa):
    return send_from_directory(os.path.join(DATA, 'dokumenty'), nazwa)


# ---------------------------------------------------------------- ADMIN: logowanie
@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    db = get_db()
    if request.method == 'POST':
        from werkzeug.security import check_password_hash
        haslo = (request.form.get('haslo') or '').strip()
        zapisane = db.execute("SELECT wartosc FROM ustawienia WHERE klucz='admin_hash'").fetchone()
        if zapisane and check_password_hash(zapisane['wartosc'], haslo):
            session['admin'] = '1'
            return redirect(request.args.get('dalej') or url_for('admin_dash'))
        flash('Błędne hasło.')
    return render_template('admin_login.html')


@app.route('/admin/logout', methods=['POST'])
def admin_logout():
    session.pop('admin', None)
    return redirect303(url_for('index'))


@app.route('/admin/')
@admin_required
def admin_dash():
    db = get_db()
    licznik = {}
    for status in core.STATUSY:
        licznik[status] = db.execute('SELECT COUNT(*) c FROM rezerwacje WHERE status=?', (status,)).fetchone()['c']
    nadchodzace = db.execute(
        "SELECT * FROM rezerwacje WHERE data>=? AND status!='odrzucono' ORDER BY data LIMIT 8",
        (datetime.date.today().isoformat(),)).fetchall()
    maile = db.execute('SELECT * FROM mail_outbox ORDER BY id DESC LIMIT 6').fetchall()
    smtp_off = not (db.execute("SELECT wartosc FROM ustawienia WHERE klucz='smtp_host'").fetchone()['wartosc'] or '').strip()
    sheets_off = not (db.execute("SELECT wartosc FROM ustawienia WHERE klucz='sheets_url'").fetchone()['wartosc'] or '').strip()
    return render_template('admin.html', licznik=licznik, nadchodzace=nadchodzace,
                           maile=maile, smtp_off=smtp_off, sheets_off=sheets_off,
                           statusy=core.STATUSY_PL)


# ---------------------------------------------------------------- ADMIN: kategorie
@app.route('/admin/kategorie')
@admin_required
def admin_kategorie():
    db = get_db()
    rows = db.execute('SELECT * FROM kategorie ORDER BY kolejnosc, id').fetchall()
    return render_template('admin_kategorie.html', rows=rows)


@app.route('/admin/kategorie/dodaj', methods=['POST'])
@admin_required
def kategorie_dodaj():
    db = get_db()
    nazwa = (request.form.get('nazwa') or '').strip()
    if nazwa:
        db.execute('INSERT INTO kategorie (nazwa, opis) VALUES (?,?)', (nazwa, request.form.get('opis', '').strip()))
        db.commit()
    return redirect303(url_for('admin_kategorie'))


@app.route('/admin/kategorie/<int:kid>/edytuj', methods=['POST'])
@admin_required
def kategorie_edytuj(kid):
    db = get_db()
    db.execute('UPDATE kategorie SET nazwa=?, opis=? WHERE id=?',
               (request.form.get('nazwa', '').strip(), request.form.get('opis', '').strip(), kid))
    db.commit()
    return redirect303(url_for('admin_kategorie'))


@app.route('/admin/kategorie/<int:kid>/usun', methods=['POST'])
@admin_required
def kategorie_usun(kid):
    db = get_db()
    if db.execute('SELECT 1 FROM produkty WHERE kategoria_id=? LIMIT 1', (kid,)).fetchone():
        flash('Nie można usunąć: kategoria ma przypisane produkty.')
    else:
        db.execute('DELETE FROM kategorie WHERE id=?', (kid,))
        db.commit()
    return redirect303(url_for('admin_kategorie'))


# ---------------------------------------------------------------- ADMIN: produkty
@app.route('/admin/produkty')
@admin_required
def admin_produkty():
    db = get_db()
    rows = db.execute('SELECT p.*, k.nazwa AS kategoria FROM produkty p LEFT JOIN kategorie k ON k.id=p.kategoria_id ORDER BY p.kolejnosc, p.id').fetchall()
    kat = db.execute('SELECT * FROM kategorie ORDER BY kolejnosc, id').fetchall()
    return render_template('admin_produkty.html', rows=rows, kat=kat)


@app.route('/admin/produkty/dodaj', methods=['POST'])
@admin_required
def produkty_dodaj():
    db = get_db()
    db.execute('INSERT INTO produkty (nazwa, kategoria_id, opis, cena_doba, dostepny) VALUES (?,?,?,?,?)',
               (request.form.get('nazwa', '').strip(), int(request.form.get('kategoria_id') or 0),
                request.form.get('opis', '').strip(), float(request.form.get('cena_doba') or 0),
                1 if request.form.get('dostepny') else 0))
    db.commit()
    return redirect303(url_for('admin_produkty'))


@app.route('/admin/produkty/<int:pid>/edytuj', methods=['POST'])
@admin_required
def produkty_edytuj(pid):
    db = get_db()
    db.execute('UPDATE produkty SET nazwa=?, kategoria_id=?, opis=?, cena_doba=?, dostepny=? WHERE id=?',
               (request.form.get('nazwa', '').strip(), int(request.form.get('kategoria_id') or 0),
                request.form.get('opis', '').strip(), float(request.form.get('cena_doba') or 0),
                1 if request.form.get('dostepny') else 0, pid))
    db.commit()
    return redirect303(url_for('admin_produkty'))


@app.route('/admin/produkty/<int:pid>/usun', methods=['POST'])
@admin_required
def produkty_usun(pid):
    db = get_db()
    db.execute('DELETE FROM produkty WHERE id=?', (pid,))
    db.commit()
    return redirect303(url_for('admin_produkty'))


# ---------------------------------------------------------------- ADMIN: pakiety
@app.route('/admin/pakiety')
@admin_required
def admin_pakiety():
    db = get_db()
    rows = db.execute('SELECT * FROM pakiety ORDER BY kolejnosc, id').fetchall()
    return render_template('admin_pakiety.html', rows=rows, ev_grupy=EV_GRUPY)


@app.route('/admin/pakiety/dodaj', methods=['POST'])
@admin_required
def pakiety_dodaj():
    db = get_db()
    db.execute('INSERT INTO pakiety (ev, nazwa, opis, cena, tier, pozycje, dostepny) VALUES (?,?,?,?,?,?,?)',
               (request.form.get('ev', 'inne'), request.form.get('nazwa', '').strip(),
                request.form.get('opis', '').strip(), request.form.get('cena', '').strip(),
                request.form.get('tier', '').strip(), request.form.get('pozycje', '').strip(),
                1 if request.form.get('dostepny') else 0))
    db.commit()
    return redirect303(url_for('admin_pakiety'))


@app.route('/admin/pakiety/<int:pid>/edytuj', methods=['POST'])
@admin_required
def pakiety_edytuj(pid):
    db = get_db()
    db.execute('UPDATE pakiety SET ev=?, nazwa=?, opis=?, cena=?, tier=?, pozycje=?, dostepny=? WHERE id=?',
               (request.form.get('ev', 'inne'), request.form.get('nazwa', '').strip(),
                request.form.get('opis', '').strip(), request.form.get('cena', '').strip(),
                request.form.get('tier', '').strip(), request.form.get('pozycje', '').strip(),
                1 if request.form.get('dostepny') else 0, pid))
    db.commit()
    return redirect303(url_for('admin_pakiety'))


@app.route('/admin/pakiety/<int:pid>/usun', methods=['POST'])
@admin_required
def pakiety_usun(pid):
    db = get_db()
    if db.execute('SELECT 1 FROM rezerwacje WHERE pakiet_id=? LIMIT 1', (pid,)).fetchone():
        flash('Nie można usunąć: pakiet ma zgłoszenia. Zamiast tego odznacz „Dostępny na stronie".')
    else:
        db.execute('DELETE FROM pakiety WHERE id=?', (pid,))
        db.commit()
    return redirect303(url_for('admin_pakiety'))


# ---------------------------------------------------------------- ADMIN: personalizacje
@app.route('/admin/personalizacje')
@admin_required
def admin_personalizacje():
    db = get_db()
    rows = db.execute('SELECT * FROM personalizacje ORDER BY kolejnosc, id').fetchall()
    return render_template('admin_personalizacje.html', rows=rows)


@app.route('/admin/personalizacje/dodaj', methods=['POST'])
@admin_required
def personalizacje_dodaj():
    db = get_db()
    db.execute('INSERT INTO personalizacje (nazwa, opis, cena, dostepny) VALUES (?,?,?,?)',
               (request.form.get('nazwa', '').strip(), request.form.get('opis', '').strip(),
                float(request.form.get('cena') or 0), 1 if request.form.get('dostepny') else 0))
    db.commit()
    return redirect303(url_for('admin_personalizacje'))


@app.route('/admin/personalizacje/<int:pid>/edytuj', methods=['POST'])
@admin_required
def personalizacje_edytuj(pid):
    db = get_db()
    db.execute('UPDATE personalizacje SET nazwa=?, opis=?, cena=?, dostepny=? WHERE id=?',
               (request.form.get('nazwa', '').strip(), request.form.get('opis', '').strip(),
                float(request.form.get('cena') or 0), 1 if request.form.get('dostepny') else 0, pid))
    db.commit()
    return redirect303(url_for('admin_personalizacje'))


@app.route('/admin/personalizacje/<int:pid>/usun', methods=['POST'])
@admin_required
def personalizacje_usun(pid):
    db = get_db()
    db.execute('DELETE FROM personalizacje WHERE id=?', (pid,))
    db.commit()
    return redirect303(url_for('admin_personalizacje'))


# ---------------------------------------------------------------- ADMIN: rezerwacje
@app.route('/admin/rezerwacje')
@admin_required
def admin_rezerwacje():
    db = get_db()
    filtr = request.args.get('status', '')
    q = 'SELECT * FROM rezerwacje'
    args = ()
    if filtr in core.STATUSY:
        q += ' WHERE status=?'
        args = (filtr,)
    q += ' ORDER BY data DESC, id DESC'
    rows = db.execute(q, args).fetchall()
    return render_template('admin_rezerwacje.html', rows=rows, filtr=filtr, statusy=core.STATUSY_PL)


@app.route('/admin/rezerwacje/<int:rid>')
@admin_required
def admin_rezerwacja(rid):
    db = get_db()
    r = db.execute('SELECT * FROM rezerwacje WHERE id=?', (rid,)).fetchone()
    if not r:
        abort(404)
    historia = json.loads(r['historia'] or '[]')
    pozycje = json.loads(r['pozycje'] or '[]')
    personalizacje = json.loads(r['personalizacje'] or '[]')
    return render_template('admin_rezerwacja.html', r=r, historia=historia, pozycje=pozycje,
                           personalizacje=personalizacje, statusy=core.STATUSY_PL)


@app.route('/admin/rezerwacje/<int:rid>/status', methods=['POST'])
@admin_required
def rezerwacja_status(rid):
    db = get_db()
    r = db.execute('SELECT * FROM rezerwacje WHERE id=?', (rid,)).fetchone()
    if not r:
        abort(404)
    nowy = request.form.get('status')
    if nowy not in core.STATUSY:
        flash('Nieznany status.')
        return redirect303(url_for('admin_rezerwacja', rid=rid))
    powod = (request.form.get('powod') or '').strip()
    historia = json.loads(r['historia'] or '[]')
    historia.append({'kiedy': core.teraz(), 'status': nowy, 'uwaga': powod or 'zmiana statusu'})
    db.execute('UPDATE rezerwacje SET status=?, zmieniono=?, historia=? WHERE id=?',
               (nowy, core.teraz(), json.dumps(historia, ensure_ascii=False), rid))
    db.commit()
    r = db.execute('SELECT * FROM rezerwacje WHERE id=?', (rid,)).fetchone()

    # autorespondery przy zmianie statusu
    dok = json.loads(db.execute("SELECT wartosc FROM ustawienia WHERE klucz='dokumenty'").fetchone()['wartosc'] or '[]')
    if nowy == 'platnosc_w_toku':
        core.wyslij_do_klienta(db, r['email'], 'Kaucja w drodze — %s' % r['sygnatura'], core.mail_klient_platnosc(r))
    elif nowy == 'zarezerwowany':
        core.wyslij_do_klienta(db, r['email'], 'Termin potwierdzony — %s' % r['sygnatura'], core.mail_klient_rezerwacja(r))
    elif nowy == 'odrzucono':
        core.wyslij_do_klienta(db, r['email'], 'Rezerwacja odrzucona — %s' % r['sygnatura'], core.mail_klient_odrzucono(r, powod))
    # aktualizacja arkusza Google (status leci do API)
    core.push_do_sheets(db, r)
    flash('Status zmieniony na: %s' % core.STATUSY_PL[nowy])
    return redirect303(url_for('admin_rezerwacja', rid=rid))


@app.route('/admin/rezerwacje/<int:rid>/usun', methods=['POST'])
@admin_required
def rezerwacja_usun(rid):
    db = get_db()
    db.execute('DELETE FROM rezerwacje WHERE id=?', (rid,))
    db.commit()
    flash('Zgłoszenie usunięte.')
    return redirect303(url_for('admin_rezerwacje'))


# ---------------------------------------------------------------- ADMIN: maile (outbox)
@app.route('/admin/maile')
@admin_required
def admin_maile():
    db = get_db()
    rows = db.execute('SELECT * FROM mail_outbox ORDER BY id DESC LIMIT 200').fetchall()
    return render_template('admin_maile.html', rows=rows)


@app.route('/admin/maile/<int:mid>/ponow', methods=['POST'])
@admin_required
def mail_ponow(mid):
    db = get_db()
    m = db.execute('SELECT * FROM mail_outbox WHERE id=?', (mid,)).fetchone()
    if m:
        ok, blad = core.wyslij_mail(db, m['do_kogo'], m['temat'], m['tresc'], m['typ'])
        flash('Wysłano ponownie.' if ok else ('Błąd: %s' % blad))
    return redirect303(url_for('admin_maile'))


# ---------------------------------------------------------------- ADMIN: ustawienia
@app.route('/admin/ustawienia', methods=['GET', 'POST'])
@admin_required
def admin_ustawienia():
    db = get_db()
    if request.method == 'POST':
        pola = ['kontakt_email', 'nadawca', 'smtp_host', 'smtp_port', 'smtp_user', 'smtp_haslo', 'sheets_url']
        for p in pola:
            db.execute('UPDATE ustawienia SET wartosc=? WHERE klucz=?', (request.form.get(p, '').strip(), p))
        db.execute("UPDATE ustawienia SET wartosc=? WHERE klucz='smtp_ssl'", ('1' if request.form.get('smtp_ssl') else '0',))
        nowe_haslo = (request.form.get('haslo') or '').strip()
        if nowe_haslo:
            from werkzeug.security import generate_password_hash
            db.execute("UPDATE ustawienia SET wartosc=? WHERE klucz='admin_hash'", (generate_password_hash(nowe_haslo),))
        db.commit()
        flash('Ustawienia zapisane.')
        return redirect303(url_for('admin_ustawienia'))
    u = {r['klucz']: r['wartosc'] for r in db.execute('SELECT klucz, wartosc FROM ustawienia').fetchall()}
    dokumenty = json.loads(u.get('dokumenty') or '[]')
    pliki = sorted(os.listdir(os.path.join(DATA, 'dokumenty'))) if os.path.isdir(os.path.join(DATA, 'dokumenty')) else []
    return render_template('admin_ustawienia.html', u=u, dokumenty=dokumenty, pliki=pliki)


@app.route('/admin/ustawienia/upload-dokument', methods=['POST'])
@admin_required
def upload_dokument():
    db = get_db()
    f = request.files.get('plik')
    if f and f.filename:
        import werkzeug.utils
        nazwa = werkzeug.utils.secure_filename(f.filename)
        kat = os.path.join(DATA, 'dokumenty')
        os.makedirs(kat, exist_ok=True)
        f.save(os.path.join(kat, nazwa))
        u = db.execute("SELECT wartosc FROM ustawienia WHERE klucz='dokumenty'").fetchone()
        dok = json.loads(u['wartosc'] or '[]')
        dok.append({'nazwa': request.form.get('nazwa', nazwa).strip() or nazwa, 'plik': nazwa})
        db.execute("UPDATE ustawienia SET wartosc=? WHERE klucz='dokumenty'", (json.dumps(dok, ensure_ascii=False),))
        db.commit()
        flash('Dokument dodany.')
    return redirect303(url_for('admin_ustawienia'))


@app.route('/admin/ustawienia/dokument-usun/<int:idx>', methods=['POST'])
@admin_required
def dokument_usun(idx):
    db = get_db()
    u = db.execute("SELECT wartosc FROM ustawienia WHERE klucz='dokumenty'").fetchone()
    dok = json.loads(u['wartosc'] or '[]')
    if 0 <= idx < len(dok):
        dok.pop(idx)
        db.execute("UPDATE ustawienia SET wartosc=? WHERE klucz='dokumenty'", (json.dumps(dok, ensure_ascii=False),))
        db.commit()
    return redirect303(url_for('admin_ustawienia'))


@app.errorhandler(404)
def brak_strony(e):
    return render_template('404.html'), 404


if __name__ == '__main__':
    baza_mod.inicjuj()
    print('=' * 60)
    print('Studio Sygnatura — serwis lokalny')
    print('  strona:  http://127.0.0.1:8000')
    print('  panel:   http://127.0.0.1:8000/admin/  (hasło startowe: sygnatura-2026)')
    print('=' * 60)
    app.run(host='0.0.0.0', port=8000, debug=True)
