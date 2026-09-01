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
    """(klasa_css, tytul, czy_zablokowany) dla jednego dnia w kalendarzu pakietu."""
    row = db.execute(
        "SELECT status FROM rezerwacje WHERE pakiet_id=? AND data=? AND status!='odrzucono' "
        "ORDER BY CASE status WHEN 'zarezerwowany' THEN 0 WHEN 'platnosc_w_toku' THEN 1 ELSE 2 END LIMIT 1",
        (pakiet_id, data)).fetchone()
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


@app.route('/wynajem/')
def wynajem():
    db = get_db()
    rok = int(request.args.get('rok') or datetime.date.today().year)
    mies = int(request.args.get('mies') or datetime.date.today().month)
    wybrany = request.args.get('pakiet', type=int)
    # pakiety aktywne, zgrupowane
    pakiety = db.execute('SELECT * FROM pakiety WHERE dostepny=1 ORDER BY kolejnosc, id').fetchall()
    grupy = []
    for ev, (nazwa_g, opis_g) in EV_GRUPY.items():
        lista = [p for p in pakiety if p['ev'] == ev]
        if lista:
            grupy.append({'ev': ev, 'nazwa': nazwa_g, 'opis': opis_g, 'pakiety': lista})
    kalendarze = {}
    for p in pakiety:
        kalendarze[p['id']] = siatka_miesiaca(db, p['id'], rok, mies)
    kategorie = db.execute('SELECT * FROM kategorie ORDER BY kolejnosc, id').fetchall()
    produkty = db.execute('SELECT * FROM produkty WHERE dostepny=1 ORDER BY kolejnosc, id').fetchall()
    produkty_wg = {}
    for pr in produkty:
        produkty_wg.setdefault(pr['kategoria_id'], []).append(pr)
    poprz = (rok - 1, 12) if mies == 1 else (rok, mies - 1)
    nast = (rok + 1, 1) if mies == 12 else (rok, mies + 1)
    return render_template('wynajem.html', grupy=grupy, kalendarze=kalendarze,
                           rok=rok, mies=mies, mies_nazwa=MIESIACE[mies - 1],
                           poprz=poprz, nast=nast, wybrany=wybrany,
                           kategorie=kategorie, produkty_wg=produkty_wg,
                           statusy=core.STATUSY_PL)


@app.route('/wynajem/<int:pakiet_id>/rezerwuj')
def rezerwuj(pakiet_id):
    db = get_db()
    p = db.execute('SELECT * FROM pakiety WHERE id=? AND dostepny=1', (pakiet_id,)).fetchone()
    if not p:
        abort(404)
    data = request.args.get('data', '')
    klasa = tytul = ''
    if data:
        klasa, tytul, _ = stan_dnia(db, pakiet_id, data)
    return render_template('formularz.html', p=p, data=data, klasa=klasa, tytul=tytul,
                           statusy=core.STATUSY_PL)


@app.route('/api/rezerwuj', methods=['POST'])
def api_rezerwuj():
    db = get_db()
    pakiet_id = int(request.form.get('pakiet_id') or 0)
    p = db.execute('SELECT * FROM pakiety WHERE id=?', (pakiet_id,)).fetchone()
    if not p:
        abort(404)
    data = (request.form.get('data') or '').strip()
    try:
        datetime.date.fromisoformat(data)
    except ValueError:
        flash('Podaj poprawną datę (RRRR-MM-DD).')
        return redirect303(url_for('rezerwuj', pakiet_id=pakiet_id, data=data))
    email = (request.form.get('email') or '').strip()
    if not re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', email):
        flash('Podaj poprawny adres e-mail.')
        return redirect303(url_for('rezerwuj', pakiet_id=pakiet_id, data=data))

    # checkboxy: value=nowa / value=istniejaca (zaznaczony "istniejaca" ma priorytet)
    tryb = 'istniejaca' if 'istniejaca' in request.form.getlist('tryb_sygnatury') else 'nowa'
    sygnatura = ''
    if tryb == 'istniejaca':
        sygnatura = (request.form.get('sygnatura') or '').strip().upper()
        if not sygnatura:
            flash('Wpisz sygnaturę sprawy albo zaznacz „nadaj nową sygnaturę".')
            return redirect303(url_for('rezerwuj', pakiet_id=pakiet_id, data=data))
    else:
        sygnatura = core.nowa_sygnatura(db)

    temat = (request.form.get('temat') or 'Rezerwacja terminu').strip()
    imie = (request.form.get('imie') or '').strip()
    telefon = (request.form.get('telefon') or '').strip()
    tresc = (request.form.get('tresc') or '').strip()
    teraz = core.teraz()
    db.execute(
        'INSERT INTO rezerwacje (sygnatura, data, pakiet_id, pakiet_nazwa, temat, imie, email, telefon, tresc, '
        'status, utworzono, zmieniono, historia) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
        (sygnatura, data, p['id'], p['nazwa'], temat, imie, email, telefon, tresc,
         'zapytanie', teraz, teraz, json.dumps([{'kiedy': teraz, 'status': 'zapytanie', 'uwaga': 'zgłoszenie przez formularz'}], ensure_ascii=False)))
    db.commit()
    rez = db.execute('SELECT * FROM rezerwacje WHERE sygnatura=?', (sygnatura,)).fetchone()

    # 1) e-mail do Studia (powiadomienie)
    core.wyslij_do_studia(db, 'Nowe zapytanie — %s — %s' % (rez['pakiet_nazwa'], data),
                          core.mail_studio_zapytanie(rez))
    # 2) autoresponder do klienta (podsumowanie + procedura + dokumenty)
    dok = json.loads(db.execute("SELECT wartosc FROM ustawienia WHERE klucz='dokumenty'").fetchone()['wartosc'] or '[]')
    core.wyslij_do_klienta(db, email, 'Twoje zapytanie %s — Studio Sygnatura' % sygnatura,
                           core.mail_klient_zapytanie(rez, dok))
    # 3) zapytanie do API Google Sheets (skonfigurujemy później — bez URL nic nie wysyła)
    core.push_do_sheets(db, rez)

    return redirect303(url_for('dziekuje', sygnatura=sygnatura))


@app.route('/wynajem/dziekuje')
def dziekuje():
    db = get_db()
    syg = request.args.get('sygnatura', '')
    rez = db.execute('SELECT * FROM rezerwacje WHERE sygnatura=?', (syg,)).fetchone() if syg else None
    return render_template('dziekuje.html', rez=rez, sygnatura=syg)


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
    return render_template('admin_rezerwacja.html', r=r, historia=historia, statusy=core.STATUSY_PL)


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
