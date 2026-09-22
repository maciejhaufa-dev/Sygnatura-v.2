/**
 * ============================================================
 * Studio Sygnatura — KONFIGURACJA SILNIKA (Google Apps Script)
 * Ten plik edytujesz raz podczas wdrożenia (instrukcja: README.md).
 * ============================================================
 */

// ID arkusza Google (z adresu: docs.google.com/spreadsheets/d/<TEN_FRAGMENT>/edit)
const ARKUSZ_ID = 'WSTAW_TU_ID_ARKUSZA';

// klucz dostępu do panelu /admin/ (długi, wymyśl własny: np. litery+cyfry)
const TOKEN = 'WSTAW_TU_DLUGI_KLUCZ_ADMINA';

// gdzie mają przychodzić powiadomienia o zamówieniach i wiadomościach
const MAIL_STUDIO = 'kontakt@studiosygnatura.pl';

// adres, który klient widzi w polu „Odpowiedz do" (poczta w domenie OVH)
const DOMENA_MAIL = 'kontakt@studiosygnatura.pl';

// nazwa nadawcy w stopce maili
const NADAWCA_NAZWA = 'Studio Sygnatura';

// zakładki arkusza (tworzy je funkcja instaluj())
const ZAKLADKI = ['Ustawienia', 'Katalog', 'Wiadomosci', 'Zamowienia'];

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
    if (dane[i][0] === klucz) return String(dane[i][1] || '');
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

/**
 * Uruchom RAZ w edytorze skryptów (wybierz funkcję „instaluj" → Uruchom).
 * Tworzy zakładki, nagłówki i zalążek katalogu (produkty z www/data/katalog.js).
 */
function instaluj() {
  const ss = SpreadsheetApp.openById(ARKUSZ_ID);
  ZAKLADKI.forEach(n => { if (!ss.getSheetByName(n)) ss.insertSheet(n); });

  const kat = arkusz('Katalog');
  if (kat.getLastRow() === 0) {
    kat.getRange('A1:H1').setValues([['id', 'nazwa', 'opis', 'cena', 'obraz', 'dostepny', 'kolejnosc', 'link']]);
    kat.getRange('A2:H5').setValues([
      [1, 'Szopka bożonarodzeniowa (warstwowa)', 'Ręcznie cięta szopka 20×20 cm z podświetleniem LED 2700 K', 249, 'szopka.jpg', 1, 1, ''],
      [2, 'Szyld powitalny „Witajcie"', 'Drewniany szyld powitalny z grawerem', 189, 'szyld.jpg', 1, 2, ''],
      [3, 'Litery podświetlane LOVE', 'Drewniane litery przestrzenne z ciepłym podświetleniem', 249, 'love.jpg', 1, 3, ''],
      [4, 'Ramka z sentencją', 'Ramka ze sklejki z wybraną sentencją', 89, 'ramka.jpg', 1, 4, '']
    ]);
  }

  const ust = arkusz('Ustawienia');
  if (ust.getLastRow() === 0) {
    ust.getRange('A1:B2').setValues([['klucz', 'wartosc'], ['licznik', 0]]);
  }

  const zam = arkusz('Zamowienia');
  if (zam.getLastRow() === 0) {
    zam.getRange('A1:J1').setValues([['sygnatura', 'data', 'typ', 'imie', 'email', 'telefon',
      'pozycje_json', 'kwoty_json', 'status', 'historia_json']]);
  }

  const wia = arkusz('Wiadomosci');
  if (wia.getLastRow() === 0) {
    wia.getRange('A1:H1').setValues([['id', 'data', 'imie', 'email', 'telefon', 'temat', 'tresc', 'status']]);
  }

  Logger.log('GOTOWE. Teraz: Wdróż → Nowe wdrożenie → Aplikacja internetowa ' +
             '(wykonuj jako: ja; dostęp: każdy). URL wklejasz do www/assets/config.js → SYG.API.');
}
