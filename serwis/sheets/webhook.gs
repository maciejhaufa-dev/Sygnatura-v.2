/**
 * STUDIO SYGNATURA — webhook do Google Sheets (v2: rozliczenia + podsumowanie kwartałów)
 * ================================================================================
 * Serwis (Python) wysyła POST z JSON-em; ten skrypt dopisuje wiersz do arkusza
 * „Rezerwacje" i odświeża zakładkę „Podsumowanie kwartałów" (do rozliczeń podatkowych):
 * suma przychodu za kwartał z podziałem: mąż / żona / wspólne.
 *
 * JAK PODPIĄĆ (raz, ~5 minut):
 * 1. sheets.google.com -> nowy arkusz „Sygnatura — rezerwacje".
 * 2. Rozszerzenia -> Apps Script -> wklej CAŁY ten plik -> Zapisz (Ctrl+S).
 * 3. Uruchom raz funkcję `setup` (Run) i zaakceptuj uprawnienia.
 * 4. Deploy -> New deployment -> Web app -> Execute as: Me -> Who has access: Anyone -> Deploy.
 * 5. Skopiuj URL (/exec) -> wklej w panelu: /admin/ -> Ustawienia -> URL arkusza -> Zapisz -> Testuj webhook.
 */

var ARKUSZ = 'Rezerwacje';
var ARKUSZ_PODSUMOWANIE = 'Podsumowanie kwartałów';
var NAGLOWKI = ['Kiedy', 'Typ', 'Sygnatura', 'Utworzono', 'Status', 'Data imprezy',
  'Pakiet', 'Temat', 'Imię i nazwisko', 'E-mail', 'Telefon', 'Treść',
  'Najem od', 'Najem do', 'Doby', 'Pozycje (JSON)', 'Personalizacje (JSON)',
  'Rozliczenie', 'Kwota razem (zł)', 'Najem (zł)', 'Personalizacja (zł)', 'Kaucja (zł)'];

var MAPA_ROZLICZEN = { 'maz': 'Mąż', 'zona': 'Żona', 'wspolne': 'Wspólne' };

function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var arkusz = ss.getSheetByName(ARKUSZ);
  if (!arkusz) arkusz = ss.insertSheet(ARKUSZ);
  if (arkusz.getLastRow() === 0) {
    arkusz.appendRow(NAGLOWKI);
    arkusz.getRange(1, 1, 1, NAGLOWKI.length).setFontWeight('bold').setBackground('#F6EFE1');
    arkusz.setFrozenRows(1);
  }
  var pod = ss.getSheetByName(ARKUSZ_PODSUMOWANIE);
  if (!pod) {
    pod = ss.insertSheet(ARKUSZ_PODSUMOWANIE);
    pod.appendRow(['Podsumowanie kwartałów — kwoty w zł (stan na: ' + new Date().toLocaleString('pl-PL') + ')']);
    pod.appendRow(['Rok', 'Kwartał', 'Mąż', 'Żona', 'Wspólne', 'Razem']);
    pod.getRange(1, 1, 2, 6).setFontWeight('bold').setBackground('#EAF2EE');
    pod.setFrozenRows(2);
  }
}

function doPost(e) {
  var dane;
  try {
    dane = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService.createTextOutput('BAD JSON').setMimeType(ContentService.MimeType.TEXT);
  }
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var arkusz = ss.getSheetByName(ARKUSZ);
  if (!arkusz) setup();
  arkusz = ss.getSheetByName(ARKUSZ);

  if (dane.typ === 'rozliczenie') {
    // zmiana rozliczenia — znajdź wiersz po sygnaturze i popraw kolumnę
    var kolSyg = 3, kolRoz = 19;   // C = sygnatura, S = rozliczenie
    var dane_ = arkusz.getDataRange().getValues();
    for (var i = dane_.length - 1; i >= 1; i--) {
      if (String(dane_[i][kolSyg - 1]) === String(dane.sygnatura)) {
        arkusz.getRange(i + 1, kolRoz).setValue(MAPA_ROZLICZEN[dane.rozliczenie] || 'Wspólne');
        break;
      }
    }
  } else {
    arkusz.appendRow([
      new Date(),
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
      dane.personalizacje || '',
      MAPA_ROZLICZEN[dane.rozliczenie] || 'Wspólne',
      dane.kwoty_lacznie !== undefined ? dane.kwoty_lacznie : '',
      dane.kwoty_najem !== undefined ? dane.kwoty_najem : '',
      dane.kwoty_pers !== undefined ? dane.kwoty_pers : '',
      dane.kwoty_kaucja !== undefined ? dane.kwoty_kaucja : ''
    ]);
  }
  przebudujPodsumowanie(ss);
  return ContentService.createTextOutput('OK');
}

function przebudujPodsumowanie(ss) {
  // wiersz 1: rok, wiersz 2: kwartał, kolumny: 3 mąż, 4 żona, 5 wspólne, 6 razem
  var pod = ss.getSheetByName(ARKUSZ_PODSUMOWANIE);
  if (!pod) return;
  var arkusz = ss.getSheetByName(ARKUSZ);
  var dane_ = arkusz.getDataRange().getValues();
  var kwartaly = {};
  for (var i = 1; i < dane_.length; i++) {
    var wiersz = dane_[i];
    var dataImp = new Date(wiersz[5]);       // F = data imprezy
    if (isNaN(dataImp.getTime())) continue;
    var kwota = Number(wiersz[18]);          // S = kwota razem
    if (!kwota) continue;
    var rok = dataImp.getFullYear();
    var kw = 'Q' + (Math.floor(dataImp.getMonth() / 3) + 1);
    var klucz = rok + '|' + kw;
    if (!kwartaly[klucz]) kwartaly[klucz] = { maz: 0, zona: 0, wspolne: 0 };
    var kto = String(wiersz[17]);            // R = rozliczenie
    if (kto === 'Mąż') kwartaly[klucz].maz += kwota;
    else if (kto === 'Żona') kwartaly[klucz].zona += kwota;
    else kwartaly[klucz].wspolne += kwota;
  }
  var klucze = Object.keys(kwartaly).sort();
  pod.getRange(3, 1, Math.max(pod.getLastRow() - 2, 1), 6).clearContent();
  klucze.forEach(function (klucz, idx) {
    var czesci = klucz.split('|');
    var k = kwartaly[klucz];
    var suma = k.maz + k.zona + k.wspolne;
    pod.getRange(3 + idx, 1, 1, 6).setValues([[
      Number(czesci[0]), czesci[1], k.maz, k.zona, k.wspolne, suma
    ]]);
  });
}

function doGet() {
  return ContentService.createTextOutput('Sygnatura webhook działa. Wysyłaj POST.');
}
