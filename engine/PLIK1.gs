/* ============================================================
   PLIK 1 z 3: Konfiguracja, instalacja, zamówienia, wiadomości
   ============================================================ */

/**
 * ============================================================
 * Studio Sygnatura — KONFIGURACJA SILNIKA (Google Apps Script)
 * Ten plik edytujesz raz podczas wdrożenia (instrukcja: README.md).
 * ============================================================
 */

// ID arkusza Google (z adresu: docs.google.com/spreadsheets/d/<TEN_FRAGMENT>/edit)
const ARKUSZ_ID = 'WSTAW_TU_ID_ARKUSZA';

// klucz dostępu do panelu (długi, wymyśl własny: litery + cyfry).
// Właściciel otwiera panel pod adresem:  admin.html?klucz=TEN_KLUCZ
// (w trybie z bazą logowanie admin/test z config.js przestaje działać).
const TOKEN = 'f255094c5fe76e5ce8b7c429';

// gdzie mają przychodzić powiadomienia o zamówieniach, wiadomościach,
// zapytaniach o termin i rejestracjach
const MAIL_STUDIO = 'kontakt@studiosygnatura.pl';

// adres, który klient widzi w polu „Odpowiedz do" (poczta w domenie OVH)
const DOMENA_MAIL = 'kontakt@studiosygnatura.pl';

// nazwa nadawcy w stopce maili
const NADAWCA_NAZWA = 'Studio Sygnatura';

// hasło administratora do PIERWSZEGO logowania (zakładka Admini) — po wdrożeniu
// ZMIEŃ je: w zakładce Admini podmień haslo_sha na wynik sha256('twoje nowe hasło')
// (funkcja sha256 jest w tym pliku — wybierz ją z listy funkcji → Uruchom).
const ADMIN_HASLO_STARTOWE = 'sygnatura-2026';

// cennik dostawy startowy (nadpisuje go panel: Ustawienia → cennik)
const DOSTAWA_STARTOWA = {
  odbior: 0,
  paczkomat: { S: 15.99, M: 18.99, L: 21.99 },
  kurier: { S: 18.99, M: 21.99, L: 24.99 }
};

// zakładki arkusza (tworzy je funkcja instaluj(); seedy z pliku SEED.gs)
const ZAKLADKI = ['Ustawienia', 'Katalog', 'Wiadomosci', 'Zamowienia',
  'Wynajem', 'Konta', 'Blog', 'Strony', 'Admini'];

function arkusz(nazwa) {
  const ss = SpreadsheetApp.openById(ARKUSZ_ID);
  let sh = ss.getSheetByName(nazwa);
  if (!sh) sh = ss.insertSheet(nazwa);
  return sh;
}

function ustawienie(klucz) {
  const sh = arkusz('Ustawienia');
  const dane = sh.getDataRange().getValues();
  for (let i = 1; i < dane.length; i++) {
    if (dane[i][0] === klucz) return String(dane[i][1] === null ? '' : dane[i][1]);
  }
  return '';
}

function zapiszUstawienie(klucz, wartosc) {
  const sh = arkusz('Ustawienia');
  const dane = sh.getDataRange().getValues();
  for (let i = 1; i < dane.length; i++) {
    if (dane[i][0] === klucz) { sh.getRange(i + 1, 2).setValue(wartosc); return; }
  }
  sh.getRange(dane.length + 1, 1, 1, 2).setValues([[klucz, wartosc]]);
}

/* SHA-256 (hasła kont i administratora) — do wygenerowania hashu wybierz
   tę funkcję z listy → Uruchom (wpisz hasło w argumencie albo podmień niżej) */
function sha256(t) {
  const b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(t), Utilities.Charset.UTF_8);
  return b.map(function (x) { return ('0' + ((x + 128) % 256).toString(16)).slice(-2); }).join('');
}

/**
 * Uruchom RAZ w edytorze skryptów (wybierz funkcję „instaluj" → Uruchom →
 * zezwól na uprawnienia). Tworzy zakładki, nagłówki, seedy (SEED.gs:
 * katalog + blog + podstrony) i domyślnego administratora.
 */
function instaluj() {
  ZAKLADKI.forEach(function (n) { arkusz(n); });

  const kat = arkusz('Katalog');
  if (kat.getLastRow() === 0) {
    kat.getRange(1, 1, 1, 8).setValues(
      [['id', 'nazwa', 'opis', 'cena', 'obraz', 'dostepny', 'gabaryt', 'storyId']]);
    kat.getRange(2, 1, SEED_KATALOG.length, 8).setValues(SEED_KATALOG);
  }

  const ust = arkusz('Ustawienia');
  if (ust.getLastRow() === 0) {
    ust.getRange('A1:B1').setValues([['klucz', 'wartosc']]);
    ust.appendRow(['licznik', 0]);
    ust.appendRow(['seedy', JSON.stringify(SEED_BLOG_WERSJA)]);
    ust.appendRow(['dostawa', JSON.stringify(DOSTAWA_STARTOWA)]);
    ust.appendRow(['stronaGlowna', '']);
    ust.appendRow(['stronaZamowienia', '']);
  }

  const wia = arkusz('Wiadomosci');
  if (wia.getLastRow() === 0) {
    wia.getRange(1, 1, 1, 9).setValues(
      [['ts', 'data_iso', 'imie', 'email', 'telefon', 'temat', 'tresc', 'zgoda', 'status']]);
  }

  const zam = arkusz('Zamowienia');
  if (zam.getLastRow() === 0) {
    zam.getRange(1, 1, 1, 10).setValues(
      [['sygnatura', 'data', 'typ', 'imie', 'email', 'telefon', 'kwota_razem', 'status', 'dane_json', 'historia_json']]);
  }

  const wyn = arkusz('Wynajem');
  if (wyn.getLastRow() === 0) {
    wyn.getRange(1, 1, 1, 9).setValues(
      [['data_iso', 'imie', 'email', 'telefon', 'ev', 'pakiet_id', 'termin', 'dane_json', 'status']]);
  }

  const kon = arkusz('Konta');
  if (kon.getLastRow() === 0) {
    kon.getRange(1, 1, 1, 8).setValues(
      [['email', 'imie', 'nazwisko', 'telefon', 'adres_json', 'zgody_json', 'haslo_sha', 'rejestracja']]);
  }

  const blog = arkusz('Blog');
  if (blog.getLastRow() === 0) {
    blog.getRange(1, 1, 1, 11).setValues(
      [['id', 'data', 'kategoria', 'tytul', 'zajawka', 'okladka', 'video', 'galeria_json', 'tresc', 'produkt_json', 'widoczny']]);
    SEED_BLOG.forEach(function (w) {
      blog.appendRow([w.id, w.data || '', w.kategoria || '', w.tytul, w.zajawka || '',
        w.okladka || '', w.video || '', JSON.stringify(w.galeria || []),
        w.tresc || '', JSON.stringify(w.produkt || null), w.widoczny === false ? 0 : 1]);
    });
  }

  const str = arkusz('Strony');
  if (str.getLastRow() === 0) {
    str.getRange(1, 1, 1, 5).setValues([['slug', 'tytul', 'menu', 'kol', 'tresc']]);
    SEED_STRONY.forEach(function (s) {
      str.appendRow([s.slug, s.tytul || '', s.menu ? 1 : 0, Number(s.kol || 0), s.tresc || '']);
    });
  }

  const adm = arkusz('Admini');
  if (adm.getLastRow() === 0) {
    adm.getRange(1, 1, 1, 3).setValues([['email', 'haslo_sha', 'aktywny']]);
    adm.appendRow([MAIL_STUDIO, sha256(ADMIN_HASLO_STARTOWE), 1]);
  }

  Logger.log('GOTOWE. Administrator: ' + MAIL_STUDIO +
    ' (hasło startowe: ' + ADMIN_HASLO_STARTOWE + ' — ZMIEŃ je w zakładce Admini).');
  Logger.log('Teraz: Wdróż → Nowe wdrożenie → Aplikacja internetowa ' +
    '(wykonuj jako: ja; dostęp: każdy). URL wklej do www/assets/config.js → SYG.API.');
}


/**
 * ============================================================
 * Studio Sygnatura — SILNIK (Google Apps Script = JavaScript)
 * Pełne lustro akcji demo z www/assets/api.js (wersja 28.39).
 *
 * PUBLICZNE: katalog, wiadomosc, zamowienie, konto-*,
 *   wynajem-zapytanie, terminy-zajete, pakiet-dostepny,
 *   blog-lista, blog-pobierz, strony-lista,
 *   strona-glowna-pobierz, strona-zamowienia-pobierz
 * ADMIN (klucz = TOKEN z Konfig.gs; właściciel otwiera
 *   admin.html?klucz=… i klucz idzie w każdej prośbie):
 *   admin-login, zamowienia-lista, zamowienie-status,
 *   blog-zapisz, blog-widocznosc, blog-usun, produkt-nowy,
 *   produkty-zapisz, strona-glowna-zapisz, strona-zamowienia-zapisz,
 *   strona-zapisz, strona-usun, ustawienia-dostawa-zapisz,
 *   wynajem-zapytania-lista, wiadomosci-lista
 * ============================================================
 */

function doGet(e) {
  const akcja = (e && e.parameter && e.parameter.akcja) || 'katalog';
  try {
    if (akcja === 'katalog') return odpowiedz(katalog());
    return odpowiedz({ ok: false, blad: 'Wysyłaj POST (akcja w URL ?akcja=).' });
  } catch (err) {
    return odpowiedz({ ok: false, blad: 'Błąd: ' + err.message });
  }
}

function doPost(e) {
  let dane = {};
  try {
    dane = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return odpowiedz({ ok: false, blad: 'Błędny format danych.' });
  }
  /* akcja idzie w URL (?akcja=…) — tak dzwoni klient (api.js) */
  const akcja = (e && e.parameter && e.parameter.akcja) || String(dane.akcja || '');
  try {
    switch (akcja) {
      /* ---------------- publiczne ---------------- */
      case 'katalog':                 return odpowiedz(katalog());
      case 'wiadomosc':               return odpowiedz(zapiszWiadomosc(dane));
      case 'zamowienie':              return odpowiedz(zapiszZamowienie(dane));
      case 'konto-rejestracja':       return odpowiedz(kontoRejestracja(dane));
      case 'konto-zaloguj':           return odpowiedz(kontoZaloguj(dane));
      case 'konto-wyloguj':           return odpowiedz({ ok: true });
      case 'konto-pobierz':           return odpowiedz(kontoPobierz(dane));
      case 'konto-zapisz':            return odpowiedz(kontoZapisz(dane));
      case 'konto-zmien-haslo':       return odpowiedz(kontoZmienHaslo(dane));
      case 'konto-zamowienia':        return odpowiedz(kontoZamowienia(dane));
      case 'wynajem-zapytanie':       return odpowiedz(zapiszWynajemZapytanie(dane));
      case 'terminy-zajete':          return odpowiedz(terminyZajete(dane));
      case 'pakiet-dostepny':         return odpowiedz(pakietDostepny(dane));
      case 'blog-lista':              return odpowiedz(blogLista());
      case 'blog-pobierz':            return odpowiedz(blogPobierz(dane));
      case 'strony-lista':            return odpowiedz(stronyLista());
      case 'strona-glowna-pobierz':   return odpowiedz({ ok: true, dane: odczytJsonUstawienia('stronaGlowna') });
      case 'strona-zamowienia-pobierz': return odpowiedz({ ok: true, dane: odczytJsonUstawienia('stronaZamowienia') });
      /* ---------------- admin (klucz) ---------------- */
      case 'admin-login':             return odpowiedz(adminLogin(dane));
      case 'zamowienia-lista':        return odpowiedz(maKlucz(dane) ? zamowieniaLista() : bladKlucza());
      case 'zamowienie-status':       return odpowiedz(maKlucz(dane) ? zmienStatus(dane) : bladKlucza());
      case 'blog-zapisz':             return odpowiedz(maKlucz(dane) ? blogZapisz(dane) : bladKlucza());
      case 'blog-widocznosc':         return odpowiedz(maKlucz(dane) ? blogWidocznosc(dane) : bladKlucza());
      case 'blog-usun':               return odpowiedz(maKlucz(dane) ? blogUsun(dane) : bladKlucza());
      case 'produkt-nowy':            return odpowiedz(maKlucz(dane) ? produktNowy(dane) : bladKlucza());
      case 'produkty-zapisz':         return odpowiedz(maKlucz(dane) ? produktyZapisz(dane) : bladKlucza());
      case 'strona-glowna-zapisz':    return odpowiedz(maKlucz(dane) ? zapiszJsonUstawienia('stronaGlowna', dane) : bladKlucza());
      case 'strona-zamowienia-zapisz': return odpowiedz(maKlucz(dane) ? zapiszJsonUstawienia('stronaZamowienia', dane) : bladKlucza());
      case 'strona-zapisz':           return odpowiedz(maKlucz(dane) ? stronaZapisz(dane) : bladKlucza());
      case 'strona-usun':             return odpowiedz(maKlucz(dane) ? stronaUsun(dane) : bladKlucza());
      case 'ustawienia-dostawa-zapisz': return odpowiedz(maKlucz(dane) ? dostawaZapisz(dane) : bladKlucza());
      case 'wynajem-zapytania-lista': return odpowiedz(maKlucz(dane) ? wynajemZapytaniaLista() : bladKlucza());
      case 'wiadomosci-lista':        return odpowiedz(maKlucz(dane) ? wiadomosciLista() : bladKlucza());
      default:                        return odpowiedz({ ok: false, blad: 'Nieznana akcja: ' + akcja });
    }
  } catch (err) {
    return odpowiedz({ ok: false, blad: 'Błąd: ' + err.message });
  }
}

function odpowiedz(ob) {
  return ContentService.createTextOutput(JSON.stringify(ob))
    .setMimeType(ContentService.MimeType.JSON);
}

function maKlucz(d) {
  const t = String(d.klucz || '');
  return t !== '' && t === TOKEN && String(TOKEN).indexOf('WSTAW_TU') !== 0;
}
function bladKlucza() { return { ok: false, blad: 'Brak dostępu — zły klucz.' }; }

/* te same obliczenia co w demo (api.js) — deterministyczny hash djb2, 32 bity */
function hashDemo(str) {
  let h = 5381;
  for (let i = 0; i < String(str).length; i++) { h = ((h * 33) + String(str).charCodeAt(i)) >>> 0; }
  return h;
}

function czyscObiekt(o) {
  const kopia = {};
  Object.keys(o).forEach(function (k) { if (k !== '_i') kopia[k] = o[k]; });
  return kopia;
}

/* ---------------- katalog ---------------- */
function katalog() {
  const dane = arkusz('Katalog').getDataRange().getValues();
  const lista = [];
  for (let i = 1; i < dane.length; i++) {
    const r = dane[i];
    if (r[0] === '' || r[0] === null) continue;
    lista.push({
      id: Number(r[0]),
      nazwa: String(r[1] || ''),
      opis: String(r[2] || ''),
      cena: Number(r[3] || 0),
      obraz: String(r[4] || ''),
      dostepny: Number(r[5]) === 1,
      gabaryt: String(r[6] || ''),
      storyId: Number(r[7] || 0)
    });
  }
  /* jak demo: zwracamy całość — klient sam filtruje dostepny */
  return { ok: true, katalog: lista };
}

/* ---------------- wiadomość z formularza ---------------- */
function zapiszWiadomosc(d) {
  const imie = String(d.imie || '').trim();
  const email = String(d.email || '').trim();
  const tresc = String(d.tresc || '').trim();
  if (!imie || !email || !tresc) return { ok: false, blad: 'Uzupełnij imię, e-mail i treść.' };
  if (d.bot) return { ok: true };  // bot — udajemy sukces
  const sh = arkusz('Wiadomosci');
  sh.appendRow([Date.now(), new Date().toISOString(), imie, email,
    String(d.telefon || ''), String(d.temat || 'Inne'), tresc, d.zgoda ? 1 : 0, 'nowa']);
  try {
    MailApp.sendEmail({
      to: MAIL_STUDIO,
      replyTo: DOMENA_MAIL,
      subject: 'Nowa wiadomość ze strony: ' + (d.temat || 'Inne'),
      body: 'Od: ' + imie + ' <' + email + '>' + (d.telefon ? ' (tel. ' + d.telefon + ')' : '') +
        '\nTemat: ' + (d.temat || 'Inne') + '\n\n' + tresc
    });
  } catch (err) { Logger.log('mail: ' + err); }
  return { ok: true, id: sh.getLastRow() };
}

/* ---------------- zamówienie ---------------- */
function zapiszZamowienie(d) {
  const klient = d.klient || {};
  const imie = String(klient.imie || '').trim();
  const email = String(klient.email || '').trim();
  if (!imie || !email) return { ok: false, blad: 'Brak imienia lub e-maila.' };

  const sygnatura = nastepnaSygnatura();
  const kwoty = d.kwoty || {};
  const daneZ = {
    pozycje: d.pozycje || [], pers: d.pers || [], pomysl: d.pomysl || '',
    dostawa: d.dostawa || null, adres: klient.adres || null,
    kod: d.kod || '', zgoda: d.zgoda || 0, produkt: d.produkt || '',
    wiadomosc: d.wiadomosc || '', pakiet: d.pakiet || null, termin: d.termin || null,
    kwoty: kwoty
  };
  arkusz('Zamowienia').appendRow([
    sygnatura, new Date().toISOString(), String(d.typ || 'sklep'),
    imie, email, String(klient.telefon || ''),
    Number(kwoty.razem || 0), 'zapytanie',
    JSON.stringify(daneZ), JSON.stringify([{ t: new Date().toISOString(), s: 'zapytanie' }])
  ]);

  /* maile: do Studia i do klienta (nie blokują zapisu przy awarii) */
  const pozycjeTxt = (daneZ.pozycje || []).map(function (p) {
    return '• ' + p.nazwa + (p.ile > 1 ? ' ×' + p.ile : '') + ' — ' + p.cena * p.ile + ' zł';
  }).join('\n');
  const persTxt = (daneZ.pers || []).map(function (p) {
    return '• ' + (p.nazwa || p.tytul || 'personalizacja') + (p.tresc ? ' — „' + p.tresc + '”' : '');
  }).join('\n');
  try {
    MailApp.sendEmail({
      to: MAIL_STUDIO,
      replyTo: DOMENA_MAIL,
      subject: 'Nowe zamówienie ' + sygnatura + ' — ' + imie,
      body: 'SYGNATURA: ' + sygnatura + '\nOD: ' + imie + ' <' + email + '>' +
        (klient.telefon ? ' (tel. ' + klient.telefon + ')' : '') + '\nDOSTAWA: ' + dostawaTekst(d) +
        '\n\nPOZYCJE:\n' + (pozycjeTxt || '—') +
        (persTxt ? '\n\nPERSONALIZACJE:\n' + persTxt : '') +
        (daneZ.kod ? '\n\nKOD RABATOWY: ' + daneZ.kod : '') +
        '\n\nRAZEM: ' + (kwoty.razem || 0) + ' zł' + (kwoty.kaucja ? ' (+ kaucja ' + kwoty.kaucja + ' zł)' : '') +
        '\n\nWIADOMOŚĆ KLIENTA:\n' + (daneZ.wiadomosc || '—')
    });
    MailApp.sendEmail({
      to: email,
      replyTo: DOMENA_MAIL,
      subject: 'Potwierdzenie zamówienia ' + sygnatura + ' — Studio Sygnatura',
      body: 'Dzień dobry,\n\ndziękujemy za zamówienie w Studio Sygnatura.\n\n' +
        'Sygnatura sprawy: ' + sygnatura + '\n' +
        'Prosimy posługiwać się nią w całej korespondencji.\n\n' +
        'W ciągu 1–2 dni roboczych wyślemy potwierdzenie z pełnym podsumowaniem ' +
        'i danymi do przedpłaty.\n\nZ pozdrowieniami, ' + NADAWCA_NAZWA
    });
  } catch (err) { Logger.log('mail: ' + err); }
  return { ok: true, sygnatura: sygnatura };
}

function nastepnaSygnatura() {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    let licznik = parseInt(ustawienie('licznik') || '0', 10) || 0;
    licznik += 1;
    zapiszUstawienie('licznik', licznik);
    return 'SYG-' + new Date().getFullYear() + '-' + String(licznik).padStart(3, '0');
  } finally {
    lock.releaseLock();
  }
}

function dostawaTekst(d) {
  const dst = d.dostawa;
  if (!dst) return 'Odbiór osobisty (Poznań i okolice)';
  if (dst.metoda === 'odbior' || !dst.metoda) return 'Odbiór osobisty (Poznań i okolice)';
  let t = dst.metoda === 'paczkomat'
    ? 'Paczkomat InPost (paczka ' + (dst.rozmiar || '?') + ')'
    : 'Kurier (paczka ' + (dst.rozmiar || '?') + ')';
  if (dst.paczkomat) t += ' — paczkomat: ' + dst.paczkomat;
  if (dst.adres) t += ' — adres: ' + dst.adres;
  return t;
}

/* ---------------- panel admina: zamówienia ---------------- */
function zamowienieZWiersza(r) {
  let dane = {}, historia = [];
  try { dane = JSON.parse(r[8] || '{}'); } catch (e) {}
  try { historia = JSON.parse(r[9] || '[]'); } catch (e) {}
  return {
    sygnatura: String(r[0]),
    data: String(r[1] || ''),
    typ: String(r[2] || 'sklep'),
    klient: { imie: String(r[3] || ''), email: String(r[4] || ''), telefon: String(r[5] || '') },
    pozycje: dane.pozycje || [], pers: dane.pers || [], pomysl: dane.pomysl || '',
    kwoty: dane.kwoty || {},
    dostawa: dane.dostawa || null, kod: dane.kod || '', zgoda: dane.zgoda || 0,
    produkt: dane.produkt || '', wiadomosc: dane.wiadomosc || '',
    pakiet: dane.pakiet || null, termin: dane.termin || null,
    status: String(r[7] || 'zapytanie'),
    historia: historia
  };
}

function zamowieniaLista() {
  const dane = arkusz('Zamowienia').getDataRange().getValues();
  const lista = [];
  for (let i = dane.length - 1; i >= 1; i--) {
    const r = dane[i];
    if (r[0] === '' || r[0] === null) continue;
    lista.push(zamowienieZWiersza(r));
  }
  return { ok: true, zamowienia: lista };
}

function zmienStatus(d) {
  const syg = String(d.sygnatura || '');
  const status = String(d.status || '');
  if (!syg || !status) return { ok: false, blad: 'Brak sygnatury lub statusu.' };
  const sh = arkusz('Zamowienia');
  const dane = sh.getDataRange().getValues();
  for (let i = 1; i < dane.length; i++) {
    if (String(dane[i][0]) === syg) {
      sh.getRange(i + 1, 8).setValue(status);
      let historia = [];
      try { historia = JSON.parse(dane[i][9] || '[]'); } catch (e) {}
      historia.push({ t: new Date().toISOString(), s: status });
      sh.getRange(i + 1, 10).setValue(JSON.stringify(historia));
      return { ok: true };
    }
  }
  return { ok: false, blad: 'Nie ma zamówienia ' + syg + '.' };
}
