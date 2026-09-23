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

/* ---------------- KONTA UŻYTKOWNIKÓW ---------------- */
function kontoZWiersza(i, dane) {
  const r = dane[i];
  let adres = { ulica: '', kod: '', miasto: '' }, zgody = { newsletter: false, telefon: false };
  try { adres = Object.assign(adres, JSON.parse(r[4] || '{}')); } catch (e) {}
  try { zgody = Object.assign(zgody, JSON.parse(r[5] || '{}')); } catch (e) {}
  return { email: String(r[0]).toLowerCase(), imie: String(r[1] || ''), nazwisko: String(r[2] || ''),
    telefon: String(r[3] || ''), adres: adres, zgody: zgody,
    haslo_sha: String(r[6] || ''), rejestracja: String(r[7] || ''), _i: i };
}
function kontoBezHasla(u) {
  return { email: u.email, imie: u.imie, nazwisko: u.nazwisko, telefon: u.telefon,
    adres: u.adres, zgody: u.zgody, rejestracja: u.rejestracja };
}

function kontoRejestracja(d) {
  const email = String(d.email || '').trim().toLowerCase();
  const haslo = String(d.haslo || '');
  if (!d.imie || !email || !haslo) return { ok: false, blad: 'Uzupełnij imię, nazwisko, e-mail i hasło.' };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, blad: 'Podaj poprawny adres e-mail.' };
  if (haslo.length < 8) return { ok: false, blad: 'Hasło musi mieć co najmniej 8 znaków.' };
  const sh = arkusz('Konta');
  const dane = sh.getDataRange().getValues();
  for (let i = 1; i < dane.length; i++) {
    if (String(dane[i][0] || '').toLowerCase() === email) {
      return { ok: false, blad: 'Konto z tym adresem e-mail już istnieje — zaloguj się.' };
    }
  }
  const u = { email: email, imie: String(d.imie).trim(), nazwisko: String(d.nazwisko || '').trim(),
    telefon: '', adres: { ulica: '', kod: '', miasto: '' },
    zgody: { newsletter: true, telefon: false }, rejestracja: new Date().toISOString() };
  sh.appendRow([u.email, u.imie, u.nazwisko, u.telefon,
    JSON.stringify(u.adres), JSON.stringify(u.zgody), sha256(haslo), u.rejestracja]);
  try {
    MailApp.sendEmail({
      to: email, replyTo: DOMENA_MAIL,
      subject: 'Witaj w Studio Sygnatura',
      body: 'Dzień dobry ' + u.imie + ',\n\nzałożyliśmy Twoje konto. Zaloguj się na stronie ' +
        '(ikona konta w prawym górnym rogu) — zapiszesz tam dane do wysyłki i zobaczysz historię zamówień.\n\n' + NADAWCA_NAZWA
    });
  } catch (e) { Logger.log('mail: ' + e); }
  return { ok: true, konto: kontoBezHasla(u) };
}

function kontoZaloguj(d) {
  const email = String(d.email || '').trim().toLowerCase();
  const sh = arkusz('Konta');
  const dane = sh.getDataRange().getValues();
  for (let i = 1; i < dane.length; i++) {
    if (String(dane[i][0] || '').toLowerCase() === email &&
        String(dane[i][6]) === sha256(String(d.haslo || ''))) {
      return { ok: true, konto: kontoBezHasla(kontoZWiersza(i, dane)) };
    }
  }
  return { ok: false, blad: 'Nieprawidłowy e-mail lub hasło.' };
}

function kontoPobierz(d) {
  const email = String(d._email || '').toLowerCase();
  if (!email) return { ok: true, konto: null };
  const dane = arkusz('Konta').getDataRange().getValues();
  for (let i = 1; i < dane.length; i++) {
    if (String(dane[i][0] || '').toLowerCase() === email) {
      return { ok: true, konto: kontoBezHasla(kontoZWiersza(i, dane)) };
    }
  }
  return { ok: true, konto: null };
}

function kontoZapisz(d) {
  const email = String(d._email || '').toLowerCase();
  if (!email) return { ok: false, blad: 'Nie jesteś zalogowany.' };
  const kd = d.dane || {};
  if (!String(kd.imie || '').trim()) return { ok: false, blad: 'Imię nie może być puste.' };
  const sh = arkusz('Konta');
  const dane = sh.getDataRange().getValues();
  for (let i = 1; i < dane.length; i++) {
    if (String(dane[i][0] || '').toLowerCase() === email) {
      const adres = {
        ulica: String((kd.adres && kd.adres.ulica) || '').trim(),
        kod: String((kd.adres && kd.adres.kod) || '').trim(),
        miasto: String((kd.adres && kd.adres.miasto) || '').trim()
      };
      const zgody = { newsletter: !!(kd.zgody && kd.zgody.newsletter),
        telefon: !!(kd.zgody && kd.zgody.telefon) };
      sh.getRange(i + 1, 2, 1, 6).setValues([[
        String(kd.imie).trim(), String(kd.nazwisko || '').trim(),
        String(kd.telefon || '').trim(), JSON.stringify(adres), JSON.stringify(zgody), dane[i][6]
      ]]);
      const dane2 = sh.getDataRange().getValues();
      return { ok: true, konto: kontoBezHasla(kontoZWiersza(i, dane2)) };
    }
  }
  return { ok: false, blad: 'Nie znaleziono konta — zaloguj się ponownie.' };
}

function kontoZmienHaslo(d) {
  const email = String(d._email || '').toLowerCase();
  if (!email) return { ok: false, blad: 'Nie jesteś zalogowany.' };
  const nowe = String(d.nowe || '');
  if (nowe.length < 8) return { ok: false, blad: 'Nowe hasło musi mieć co najmniej 8 znaków.' };
  const sh = arkusz('Konta');
  const dane = sh.getDataRange().getValues();
  for (let i = 1; i < dane.length; i++) {
    if (String(dane[i][0] || '').toLowerCase() === email) {
      if (String(dane[i][6]) !== sha256(String(d.stare || ''))) {
        return { ok: false, blad: 'Obecne hasło jest nieprawidłowe.' };
      }
      sh.getRange(i + 1, 7).setValue(sha256(nowe));
      return { ok: true };
    }
  }
  return { ok: false, blad: 'Nie znaleziono konta — zaloguj się ponownie.' };
}

function kontoZamowienia(d) {
  const email = String(d._email || '').toLowerCase();
  if (!email) return { ok: true, zamowienia: [] };
  const rok = new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString();
  const dane = arkusz('Zamowienia').getDataRange().getValues();
  const lista = [];
  for (let i = dane.length - 1; i >= 1; i--) {
    const r = dane[i];
    if (r[0] === '' || r[0] === null) continue;
    if (String(r[4] || '').toLowerCase() !== email) continue;
    const data = String(r[1] || '');
    if (data && data < rok) continue;  /* maks. 12 miesięcy — jak w demo */
    lista.push(zamowienieZWiersza(r));
  }
  return { ok: true, zamowienia: lista };
}

/* ---------------- WYNAJEM: zapytanie o termin ---------------- */
function zapiszWynajemZapytanie(d) {
  const klientW = d.klient || {};
  const imie = String(klientW.imie || '').trim();
  const email = String(klientW.email || '').trim();
  if (!imie || !email) return { ok: false, blad: 'Brak imienia lub e-maila.' };
  if (!d.pakiet || !(d.termin && d.termin.data)) return { ok: false, blad: 'Wybierz termin i pakiet.' };
  const sh = arkusz('Wynajem');
  sh.appendRow([
    new Date().toISOString(), imie, email, String(klientW.telefon || ''),
    String(d.ev || ''), String((d.pakiet && d.pakiet.id) || ''),
    String(d.termin.data || ''),
    JSON.stringify({ klient: klientW, pakiet: d.pakiet, termin: d.termin,
      pers: d.pers || [], kwoty: d.kwoty || {} }),
    'zapytanie'
  ]);
  const pk = d.pakiet || {};
  try {
    MailApp.sendEmail({
      to: MAIL_STUDIO, replyTo: DOMENA_MAIL,
      subject: 'Zapytanie o termin wynajmu — ' + (pk.nazwa || pk.id || '') + ' (' + d.termin.data + ')',
      body: 'OD: ' + imie + ' <' + email + '>' + (klientW.telefon ? ' (tel. ' + klientW.telefon + ')' : '') +
        '\nEVENEMENT: ' + (d.ev || '—') + '\nPAKIET: ' + (pk.nazwa || '—') + ' — ' + (pk.cenaTxt || '') +
        '\nTERMIN: ' + d.termin.data +
        '\n\nRezerwacja potwierdzana po wpłacie — zmień status w zakładce Wynajem\n' +
        'na „zarezerwowany" po otrzymaniu przelewu (dzień zablokuje się w kalendarzu).'
    });
    MailApp.sendEmail({
      to: email, replyTo: DOMENA_MAIL,
      subject: 'Zapytanie o termin wynajmu — Studio Sygnatura',
      body: 'Dzień dobry ' + imie + ',\n\ndziękujemy za zapytanie o termin ' + d.termin.data +
        ' (pakiet ' + (pk.nazwa || '—') + ').\n\nW ciągu 1–2 dni roboczych potwierdzimy ' +
        'dostępność i wyślemy dane do wpłaty — rezerwacja staje się obowiązująca po wpłacie.\n\nZ pozdrowieniami, ' + NADAWCA_NAZWA
    });
  } catch (err) { Logger.log('mail: ' + err); }
  return { ok: true, id: sh.getLastRow() };
}

function wynajemZapytaniaLista() {
  const dane = arkusz('Wynajem').getDataRange().getValues();
  const lista = [];
  for (let i = dane.length - 1; i >= 1; i--) {
    const r = dane[i];
    if (r[0] === '' || r[0] === null) continue;
    let z = {};
    try { z = JSON.parse(r[7] || '{}'); } catch (e) {}
    lista.push({ data: String(r[0]), imie: String(r[1] || ''), email: String(r[2] || ''),
      telefon: String(r[3] || ''), ev: String(r[4] || ''), pakietId: String(r[5] || ''),
      termin: String(r[6] || ''), szczegoly: z, status: String(r[8] || 'zapytanie') });
  }
  return { ok: true, zapytania: lista };
}

/* ---------------- KALENDARZ WYNAJMU (dostępność na żywo) ---------------- */
function terminyZajete(d) {
  const mies = String(d.miesiac || '');
  const cz = mies.split('-').map(Number);
  if (!cz[0] || !cz[1]) return { ok: false, blad: 'Zły miesiąc.' };
  const zajete = [];
  const dni = new Date(cz[0], cz[1], 0).getDate();
  for (let dz = 1; dz <= dni; dz++) {
    const iso = cz[0] + '-' + String(cz[1]).padStart(2, '0') + '-' + String(dz).padStart(2, '0');
    if (hashDemo(iso) % 5 === 0) zajete.push(iso);
  }
  /* potwierdzone rezerwacje (po wpłacie) blokują dni;
     zapytania NIE blokują — jak w demo */
  const zw = arkusz('Wynajem').getDataRange().getValues();
  for (let i = 1; i < zw.length; i++) {
    if (String(zw[i][8]) === 'zarezerwowany' && String(zw[i][6])) {
      const dstr = String(zw[i][6]);
      if (dstr.indexOf(mies + '-') === 0 && zajete.indexOf(dstr) < 0) zajete.push(dstr);
    }
  }
  return { ok: true, miesiac: mies, zajete: zajete };
}

function pakietDostepny(d) {
  const id = String(d.id || '');
  const data = String(d.data || '');
  if (!id || !data) return { ok: false, blad: 'Brak pakietu lub terminu.' };
  let dostepny = hashDemo(id + '|' + data) % 5 !== 0;
  if (dostepny) {
    const zw = arkusz('Wynajem').getDataRange().getValues();
    for (let i = 1; i < zw.length; i++) {
      if (String(zw[i][5]) === id && String(zw[i][6]) === data &&
          String(zw[i][8]) === 'zarezerwowany') { dostepny = false; break; }
    }
  }
  return { ok: true, dostepny: dostepny };
}

/* ---------------- BLOG (realizacje jako wpisy) ---------------- */
function blogWiersze() {
  const dane = arkusz('Blog').getDataRange().getValues();
  const lista = [];
  for (let i = 1; i < dane.length; i++) {
    const r = dane[i];
    if (r[0] === '' || r[0] === null) continue;
    let galeria = [], produkt = null;
    try { galeria = JSON.parse(r[7] || '[]'); } catch (e) {}
    try { produkt = JSON.parse(r[9] || 'null'); } catch (e) {}
    lista.push({ id: Number(r[0]), data: String(r[1] || ''), kategoria: String(r[2] || ''),
      tytul: String(r[3] || ''), zajawka: String(r[4] || ''), okladka: String(r[5] || ''),
      video: String(r[6] || ''), galeria: galeria, tresc: String(r[8] || ''),
      produkt: produkt, widoczny: Number(r[10]) === 1, _i: i });
  }
  return lista;
}

function blogLista() {
  const lista = blogWiersze().map(czyscObiekt);
  return { ok: true, wpisy: lista };
}

function blogPobierz(d) {
  const w = blogWiersze().find(function (x) { return Number(x.id) === Number(d.id); });
  if (!w) return { ok: false, blad: 'Nie ma takiego wpisu.' };
  return { ok: true, wpis: czyscObiekt(w) };
}

function normalizujObraz(obraz) {
  const s = String(obraz || '');
  const prefix = 'assets/media/sklep/';
  const i = s.indexOf(prefix);
  if (i >= 0) return s.slice(i + prefix.length);
  return s;
}

/* wpis z „dodaj do sklepie" → produkt w arkuszu Katalog (aktualizacja albo nowy) */
function syncProdukt(wpis) {
  const pr = wpis.produkt || {};
  const sh = arkusz('Katalog');
  const dane = sh.getDataRange().getValues();
  const obraz = normalizujObraz(wpis.okladka || pr.obraz || 'szopka.jpg');
  for (let i = 1; i < dane.length; i++) {
    if (Number(dane[i][0]) === Number(pr.id)) {
      sh.getRange(i + 1, 2).setValue(pr.nazwa || dane[i][1]);
      sh.getRange(i + 1, 4).setValue(Number(pr.cena || 0));
      sh.getRange(i + 1, 7).setValue(pr.gabaryt || '');
      sh.getRange(i + 1, 8).setValue(wpis.id);
      return;
    }
  }
  const nowyId = Number(pr.id) || (Date.now() % 1000000);
  sh.appendRow([nowyId, pr.nazwa || wpis.tytul,
    pr.opis || ('Historia tego produktu: „' + wpis.tytul + '” — zobacz na blogu.'),
    Number(pr.cena || 0), obraz, 1, pr.gabaryt || '', wpis.id]);
}

function blogZapisz(d) {
  const w = d.wpis || {};
  if (!w.tytul) return { ok: false, blad: 'Brak tytułu wpisu.' };
  const sh = arkusz('Blog');
  const lista = blogWiersze();
  const i = lista.findIndex(function (x) { return Number(x.id) === Number(w.id); });
  let wpis;
  if (w.id) {
    if (i >= 0) {
      wpis = Object.assign(lista[i], w);
      sh.getRange(wpis._i + 1, 1, 1, 11).setValues([[
        wpis.id, wpis.data || '', wpis.kategoria || '', wpis.tytul, wpis.zajawka || '',
        wpis.okladka || '', wpis.video || '', JSON.stringify(wpis.galeria || []),
        wpis.tresc || '', JSON.stringify(wpis.produkt || null), wpis.widoczny ? 1 : 0
      ]]);
    } else {
      wpis = Object.assign({ id: w.id }, w);
      sh.appendRow([wpis.id, wpis.data || '', wpis.kategoria || '', wpis.tytul, wpis.zajawka || '',
        wpis.okladka || '', wpis.video || '', JSON.stringify(wpis.galeria || []),
        wpis.tresc || '', JSON.stringify(wpis.produkt || null), wpis.widoczny === false ? 0 : 1]);
    }
  } else {
    wpis = Object.assign({ id: Date.now() % 1000000,
      data: new Date().toISOString().slice(0, 10), widoczny: true }, w);
    sh.appendRow([wpis.id, wpis.data, wpis.kategoria || '', wpis.tytul, wpis.zajawka || '',
      wpis.okladka || '', wpis.video || '', JSON.stringify(wpis.galeria || []),
      wpis.tresc || '', JSON.stringify(wpis.produkt || null), 1]);
  }
  if (wpis.produkt && wpis.produkt.sklep) syncProdukt(wpis);
  return { ok: true, id: wpis.id };
}

function blogWidocznosc(d) {
  const lista = blogWiersze();
  const w = lista.find(function (x) { return Number(x.id) === Number(d.id); });
  if (!w) return { ok: false, blad: 'Nie ma takiego wpisu.' };
  arkusz('Blog').getRange(w._i + 1, 11).setValue(d.widoczny ? 1 : 0);
  return { ok: true };
}

function blogUsun(d) {
  const lista = blogWiersze();
  const w = lista.find(function (x) { return Number(x.id) === Number(d.id); });
  if (!w) return { ok: true };
  arkusz('Blog').deleteRow(w._i + 1);
  return { ok: true };
}

/* produkt „bez historii" — wprost z zakładki Produkty */
function produktNowy(d) {
  const sh = arkusz('Katalog');
  const dane = sh.getDataRange().getValues();
  const id = Number(d.id) || (Date.now() % 1000000);
  const wiersz = [id, d.nazwa || 'Nowy produkt', d.opis || '', Number(d.cena || 0),
    normalizujObraz(d.obraz || 'szopka.jpg'), 1, d.gabaryt || '', Number(d.storyId || 0)];
  for (let i = 1; i < dane.length; i++) {
    if (Number(dane[i][0]) === id) { sh.getRange(i + 1, 1, 1, 8).setValues([wiersz]); return { ok: true, id: id }; }
  }
  sh.appendRow(wiersz);
  return { ok: true, id: id };
}

function produktyZapisz(d) {
  const sh = arkusz('Katalog');
  const dane = sh.getDataRange().getValues();
  for (let i = 1; i < dane.length; i++) {
    if (Number(dane[i][0]) === Number(d.id)) {
      sh.getRange(i + 1, 4).setValue(Number(d.cena || 0));
      sh.getRange(i + 1, 6).setValue(d.dostepny ? 1 : 0);
      return { ok: true };
    }
  }
  return { ok: false, blad: 'Nie ma takiego produktu w katalogu.' };
}

/* ---------------- PODSTRONY (menu) ---------------- */
function stronyLista() {
  const dane = arkusz('Strony').getDataRange().getValues();
  const lista = [];
  for (let i = 1; i < dane.length; i++) {
    const r = dane[i];
    if (r[0] === '' || r[0] === null) continue;
    lista.push({ slug: String(r[0]), tytul: String(r[1] || ''), menu: Number(r[2] || 0),
      kol: Number(r[3] || 0), tresc: String(r[4] || '') });
  }
  return { ok: true, strony: lista };
}

function stronaZapisz(d) {
  const s = d.strona || {};
  if (!s.slug) return { ok: false, blad: 'Brak identyfikatora podstrony.' };
  const sh = arkusz('Strony');
  const dane = sh.getDataRange().getValues();
  const wiersz = [s.slug, s.tytul || '', s.menu ? 1 : 0, Number(s.kol || 0), s.tresc || ''];
  for (let i = 1; i < dane.length; i++) {
    if (String(dane[i][0]) === s.slug) { sh.getRange(i + 1, 1, 1, 5).setValues([wiersz]); return { ok: true }; }
  }
  sh.appendRow(wiersz);
  return { ok: true };
}

function stronaUsun(d) {
  const sh = arkusz('Strony');
  const dane = sh.getDataRange().getValues();
  for (let i = 1; i < dane.length; i++) {
    if (String(dane[i][0]) === String(d.slug || '')) { sh.deleteRow(i + 1); return { ok: true }; }
  }
  return { ok: true };
}

/* ---------------- TREŚCI: strona główna / zamówienia ---------------- */
function odczytJsonUstawienia(klucz) {
  const v = ustawienie(klucz);
  if (!v) return null;
  try { return JSON.parse(v); } catch (e) { return null; }
}

function zapiszJsonUstawienia(klucz, d) {
  if (!d.dane || typeof d.dane !== 'object') return { ok: false, blad: 'Brak danych do zapisu.' };
  zapiszUstawienie(klucz, JSON.stringify(d.dane));
  return { ok: true };
}

/* ---------------- ADMIN ---------------- */
function adminLogin(d) {
  if (!maKlucz(d)) return bladKlucza();
  const login = String(d.login || '').trim().toLowerCase();
  const dane = arkusz('Admini').getDataRange().getValues();
  for (let i = 1; i < dane.length; i++) {
    if (String(dane[i][0] || '').toLowerCase() === login &&
        String(dane[i][2]) === '1' &&
        String(dane[i][1]) === sha256(String(d.haslo || ''))) {
      return { ok: true, admin: { email: String(dane[i][0]) } };
    }
  }
  return { ok: false, blad: 'Nieprawidłowy e-mail lub hasło.' };
}

function dostawaZapisz(d) {
  if (!d.cennik || !d.cennik.paczkomat || !d.cennik.kurier) {
    return { ok: false, blad: 'Niekompletny cennik.' };
  }
  zapiszUstawienie('dostawa', JSON.stringify(d.cennik));
  return { ok: true };
}

/* ---------------- lista wiadomości (panel) ---------------- */
function wiadomosciLista() {
  const dane = arkusz('Wiadomosci').getDataRange().getValues();
  const lista = [];
  for (let i = dane.length - 1; i >= 1; i--) {
    const r = dane[i];
    if (r[0] === '' || r[0] === null) continue;
    lista.push({ data: String(r[1] || r[0]), imie: String(r[2] || ''), email: String(r[3] || ''),
      telefon: String(r[4] || ''), temat: String(r[5] || 'Inne'), tresc: String(r[6] || ''),
      zgoda: Number(r[7]) === 1, status: String(r[8] || 'nowa') });
  }
  return { ok: true, wiadomosci: lista };
}
