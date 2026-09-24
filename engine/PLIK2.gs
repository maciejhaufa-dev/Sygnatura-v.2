/* ============================================================
   PLIK 2 z 3: Konta użytkowników, wynajem, blog, admin, backup
   ============================================================ */

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

/**
 * ============================================================
 * Studio Sygnatura — AUTOMATY (Google Apps Script)
 * 1) harmonogram: codzienna kopia zapasowa na Dysk Google
 * 2) backup: JSON wszystkich zakładek do folderu SYGNATURA-Backup
 * Uruchom raz funkcję zalozHarmonogram() (po wdrożeniu).
 * ============================================================
 */

function zalozHarmonogram() {
  ScriptApp.getProjectTriggers().forEach(t => {
    try { ScriptApp.deleteTrigger(t); } catch (e) {}
  });
  ScriptApp.newTrigger('backupDzienny').timeBased().everyDays(1).atHour(3).create();
  Logger.log('Harmonogram ustawiony: backup codziennie o 03:00 (czas Google).');
}

function backupDzienny() {
  try {
    const folder = folderBackup();
    const dane = {};
    ZAKLADKI.forEach(n => {
      const sh = arkusz(n);
      dane[n] = sh.getDataRange().getValues();
    });
    const nazwa = 'SYGNATURA-backup-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd') + '.json';
    folder.createFile(nazwa, JSON.stringify(dane), MimeType.JSON);
    // retencja: 30 dni
    const pliki = folder.getFiles();
    while (pliki.hasNext()) {
      const p = pliki.next();
      if (Date.now() - p.getLastUpdated().getTime() > 30 * 24 * 3600 * 1000) p.setTrashed(true);
    }
    Logger.log('backup OK: ' + nazwa);
  } catch (err) {
    Logger.log('backup NIEUDANY: ' + err);
    try {
      MailApp.sendEmail(MAIL_STUDIO, 'SYGNATURA — backup nieudany',
        'Nocny backup nie wykonał się.\nBłąd: ' + err.message);
    } catch (e2) {}
  }
}

function folderBackup() {
  const it = DriveApp.getFoldersByName('SYGNATURA-Backup');
  if (it.hasNext()) return it.next();
  return DriveApp.createFolder('SYGNATURA-Backup');
}

