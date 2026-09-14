/**
 * ============================================================
 * Studio Sygnatura — SILNIK (Google Apps Script = JavaScript)
 * API aplikacji internetowej: strony (www/) wołają przez fetch.
 * Akcje publiczne: katalog, wiadomosc, zamowienie.
 * Akcje admina (klucz): zamowienia-lista, zamowienie-status.
 * ============================================================
 */

function doGet(e) {
  // np. ?akcja=katalog — przydatne do szybkiego podglądu w przeglądarce
  const akcja = (e && e.parameter && e.parameter.akcja) || 'katalog';
  try {
    switch (akcja) {
      case 'katalog': return odpowiedz(katalog());
      default: return odpowiedz({ ok: false, blad: 'Nieznana akcja: ' + akcja });
    }
  } catch (err) {
    return odpowiedz({ ok: false, blad: 'Błąd: ' + err.message });
  }
}

function doPost(e) {
  let dane;
  try {
    dane = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return odpowiedz({ ok: false, blad: 'Błędny format danych.' });
  }
  const akcja = String(dane.akcja || '');
  try {
    switch (akcja) {
      case 'katalog':             return odpowiedz(katalog());
      case 'wiadomosc':           return odpowiedz(zapiszWiadomosc(dane));
      case 'zamowienie':          return odpowiedz(zapiszZamowienie(dane));
      case 'zamowienia-lista':    return odpowiedz(maKlucz(dane) ? zamowieniaLista() : bladKlucza());
      case 'zamowienie-status':   return odpowiedz(maKlucz(dane) ? zmienStatus(dane) : bladKlucza());
      default:                    return odpowiedz({ ok: false, blad: 'Nieznana akcja: ' + akcja });
    }
  } catch (err) {
    return odpowiedz({ ok: false, blad: 'Błąd: ' + err.message });
  }
}

function odpowiedz(ob) {
  return ContentService.createTextOutput(JSON.stringify(ob))
    .setMimeType(ContentService.MimeType.JSON);
}

function maKlucz(d) { return String(d.klucz || '') === TOKEN; }
function bladKlucza() { return { ok: false, blad: 'Brak dostępu — zły klucz.' }; }

/* ---------------- katalog ---------------- */
function katalog() {
  const dane = arkusz('Katalog').getDataRange().getValues();
  const lista = [];
  for (let i = 1; i < dane.length; i++) {
    const r = dane[i];
    if (!r[0]) continue;
    lista.push({
      id: Number(r[0]),
      nazwa: String(r[1] || ''),
      opis: String(r[2] || ''),
      cena: Number(r[3] || 0),
      obraz: String(r[7] || r[4] || ''),   // link ma pierwszeństwo przed nazwą pliku
      dostepny: Number(r[5] || 0)
    });
  }
  return { ok: true, katalog: lista.filter(p => p.dostepny === 1) };
}

/* ---------------- wiadomość z formularza ---------------- */
function zapiszWiadomosc(d) {
  const imie = String(d.imie || '').trim();
  const email = String(d.email || '').trim();
  const tresc = String(d.tresc || '').trim();
  if (!imie || !email || !tresc) return { ok: false, blad: 'Uzupełnij imię, e-mail i treść.' };
  if (d.bot) return { ok: true };  // bot — udajemy sukces

  arkusz('Wiadomosci').appendRow([
    Date.now(), new Date().toISOString(), imie, email,
    String(d.telefon || ''), String(d.temat || 'Inne'), tresc, 'nowa'
  ]);

  try {
    MailApp.sendEmail({
      to: MAIL_STUDIO,
      replyTo: DOMENA_MAIL,
      subject: 'Nowa wiadomość ze strony: ' + (d.temat || 'Inne'),
      body: 'Od: ' + imie + ' <' + email + '>' + (d.telefon ? ' (tel. ' + d.telefon + ')' : '') +
        '\nTemat: ' + (d.temat || 'Inne') + '\n\n' + tresc
    });
  } catch (err) {
    Logger.log('mail: ' + err);
  }
  return { ok: true };
}

/* ---------------- zamówienie ---------------- */
function zapiszZamowienie(d) {
  const klient = d.klient || {};
  const imie = String(klient.imie || '').trim();
  const email = String(klient.email || '').trim();
  if (!imie || !email) return { ok: false, blad: 'Brak imienia lub e-maila.' };

  const sygnatura = nastepnaSygnatura();
  const pozycje = (d.pozycje || []).map(p => ({
    nazwa: p.nazwa, cena: Number(p.cena || 0), ile: Number(p.ile || 1)
  }));
  const kwoty = d.kwoty || {};
  const status = 'zapytanie';
  const historia = [{ t: new Date().toISOString(), s: status }];

  arkusz('Zamowienia').appendRow([
    sygnatura, new Date().toISOString(), String(d.typ || 'sklep'),
    imie, email, String(klient.telefon || ''),
    JSON.stringify({ pozycje: pozycje, pers: d.pers || [], pomysl: d.pomysl || '',
      dostawa: klient.dostawa, adres: klient.adres, wiadomosc: d.wiadomosc || '' }),
    JSON.stringify(kwoty), status, JSON.stringify(historia)
  ]);

  /* maile: do Studia i do klienta (nie blokują zapisu przy awarii) */
  const pozycjeTxt = pozycje.map(p => '• ' + p.nazwa + (p.ile > 1 ? ' ×' + p.ile : '') + ' — ' + p.cena * p.ile + ' zł').join('\n');
  try {
    MailApp.sendEmail({
      to: MAIL_STUDIO,
      replyTo: DOMENA_MAIL,
      subject: 'Nowe zamówienie ' + sygnatura + ' — ' + imie,
      body: 'SYGNATURA: ' + sygnatura + '\nOD: ' + imie + ' <' + email + '>' +
        (klient.telefon ? ' (tel. ' + klient.telefon + ')' : '') + '\nDOSTAWA: ' + (klient.dostawa || 'odbior') +
        (klient.adres ? ' — ' + klient.adres : '') + '\n\nPOZYCJE:\n' + pozycjeTxt +
        '\n\nRAZEM (szacunkowo): ' + (kwoty.razem || 0) + ' zł' + (kwoty.kaucja ? ' (+ kaucja ' + kwoty.kaucja + ' zł)' : '') +
        '\n\nWIADOMOŚĆ KLIENTA:\n' + (d.wiadomosc || '—')
    });
    MailApp.sendEmail({
      to: email,
      replyTo: DOMENA_MAIL,
      subject: 'Potwierdzenie zamówienia ' + sygnatura + ' — Studio Sygnatura',
      body: 'Dzień dobry,\n\ndziękujemy za zamówienie w Studio Sygnatura.\n\n' +
        'Sygnatura sprawy: ' + sygnatura + '\n' +
        'Prosimy posługiwać się nią w całej korespondencji.\n\n' +
        'W ciągu 1–2 dni roboczych wyślemy potwierdzenie z pełnym podsumowaniem, ' +
        'dokumentami i danymi do przelewu.\n\nZ pozdrowieniami,\n' + NADAWCA_NAZWA
    });
  } catch (err) {
    Logger.log('mail: ' + err);
  }
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

/* ---------------- panel admina ---------------- */
function zamowieniaLista() {
  const dane = arkusz('Zamowienia').getDataRange().getValues();
  const lista = [];
  for (let i = dane.length - 1; i >= 1; i--) {
    const r = dane[i];
    if (!r[0]) continue;
    let pozycje = { pozycje: [], pers: [], pomysl: '' };
    try { pozycje = JSON.parse(r[6] || '{}'); } catch (e) {}
    let kwoty = {};
    try { kwoty = JSON.parse(r[7] || '{}'); } catch (e) {}
    lista.push({
      sygnatura: String(r[0]),
      data: String(r[1] || ''),
      typ: String(r[2] || 'sklep'),
      klient: { imie: String(r[3] || ''), email: String(r[4] || ''), telefon: String(r[5] || '') },
      pozycje: pozycje.pozycje || [],
      kwoty: kwoty,
      status: String(r[8] || 'zapytanie')
    });
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
      sh.getRange(i + 1, 9).setValue(status);
      let historia = [];
      try { historia = JSON.parse(dane[i][9] || '[]'); } catch (e) {}
      historia.push({ t: new Date().toISOString(), s: status });
      sh.getRange(i + 1, 10).setValue(JSON.stringify(historia));
      return { ok: true };
    }
  }
  return { ok: false, blad: 'Nie ma zamówienia ' + syg + '.' };
}
