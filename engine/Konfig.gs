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
const TOKEN = 'WSTAW_TU_DLUGI_KLUCZ_ADMINA';

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
