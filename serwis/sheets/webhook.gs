/**
 * STUDIO SYGNATURA — webhook do Google Sheets
 * =============================================
 * Ten skrypt dopisuje wiersze do arkusza. Serwis (Python) wysyła na niego
 * zgłoszenia rezerwacji, zmiany statusów i wpisy testowe jako JSON (POST).
 *
 * JAK PODPIĄĆ (raz, w ~5 minut):
 * 1. Otwórz sheets.google.com -> Utwórz nowy arkusz (np. „Sygnatura — rezerwacje").
 * 2. W arkuszu: Rozszerzenia (Extensions) -> Apps Script.
 * 3. Wklej CAŁY ten plik zamiast domyślnego kodu.
 * 4. Zapisz (Ctrl+S). Nazwij projekt np. „Sygnatura webhook".
 * 5. Uruchom raz funkcję `setup` (wybierz ją z listy i kliknij Run) i zaakceptuj uprawnienia.
 *    — utworzy nagłówki kolumn w arkuszu.
 * 6. Kliknij Deploy -> New deployment -> typ: Web app.
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    -> Deploy -> skopiuj URL (kończy się na /exec).
 * 7. Wklej URL w panelu serwisu: /admin/ -> Ustawienia -> „URL arkusza" -> Zapisz -> „Testuj webhook".
 *    W arkuszu powinien pojawić się wiersz TEST.
 *
 * UWAGA przy aktualizacji skryptu: Deploy -> Manage deployments -> ikona ołówka -> New version.
 */

var ARKUSZ = 'Rezerwacje';          // nazwa zakładki w arkuszu (setup utworzy ją automatycznie)
var NAGLOWKI = ['Kiedy', 'Typ', 'Sygnatura', 'Utworzono', 'Status', 'Data imprezy',
  'Pakiet', 'Temat', 'Imię i nazwisko', 'E-mail', 'Telefon', 'Treść',
  'Najem od', 'Najem do', 'Doby', 'Pozycje (JSON)', 'Personalizacje (JSON)'];

function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var arkusz = ss.getSheetByName(ARKUSZ);
  if (!arkusz) {
    arkusz = ss.insertSheet(ARKUSZ);
  }
  if (arkusz.getLastRow() === 0) {
    arkusz.appendRow(NAGLOWKI);
    arkusz.getRange(1, 1, 1, NAGLOWKI.length).setFontWeight('bold').setBackground('#F6EFE1');
    arkusz.setFrozenRows(1);
  }
}

function doPost(e) {
  var dane;
  try {
    dane = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService.createTextOutput('BAD JSON').setMimeType(ContentService.MimeType.TEXT);
  }
  var arkusz = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ARKUSZ);
  if (!arkusz) setup();
  arkusz = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ARKUSZ);
  arkusz.appendRow([
    new Date(),                       // kiedy wpłynęło
    dane.typ || '',
    dane.sygnatura || '',
    dane.utworzono || '',
    dane.status || '',
    dane.data || '',
    dane.pakiet || '',
    dane.temat || '',
    dane.imie || '',
    dane.email || '',
    dane.telefon || '',
    dane.tresc || '',
    dane.data_od || '',
    dane.data_do || '',
    dane.dni || '',
    dane.pozycje || '',
    dane.personalizacje || ''
  ]);
  return ContentService.createTextOutput('OK');
}

function doGet() {
  return ContentService.createTextOutput('Sygnatura webhook działa. Wysyłaj POST.');
}
