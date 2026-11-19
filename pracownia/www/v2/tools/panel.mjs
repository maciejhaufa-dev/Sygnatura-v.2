#!/usr/bin/env node
/* ============================================================
   Studio Sygnatura v2 — lokalny silnik panelu (TYLKO DO TESTÓW)

   To jest atrapa backendu na czas testów panelu. NIE dotyka produkcji:
   nie łączy się z Apps Script, arkuszem ani /exec. Dane trzyma w pliku
   JSON poza repozytorium (katalog admin/panele/ jest w .gitignore).

   Docelowo ten sam interfejs (te same adresy i te same pola JSON)
   obsłuży prawdziwy Apps Script — wtedy podmieniamy tylko adres w
   admin/silnik.js i nic w panelu nie trzeba przepisywać.

   Użycie:  node tools/panel.mjs [port]
   ============================================================ */
import http from 'node:http';
import { readFile, writeFile, mkdir, stat, readdir, unlink } from 'node:fs/promises';
import { join, dirname, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DANE = join(ROOT, 'admin', 'panele');
const UPLOADY = join(DANE, 'uploady');
const PLIK_DANYCH = join(DANE, 'dane.json');
const PLIK_HASLA = join(DANE, '.haslo');
const PLIK_NAKLADKI = join(DANE, 'dane.js');   // to samo, ale jako skrypt dla strony
const PLIK_SESJI = join(DANE, '.sesje.json');
const PLIK_HISTORII = join(DANE, '.historia.json');
const PLIK_BAZY = join(ROOT, 'data', 'dane.js');
const PORT = Number(process.argv[2] || process.env.PORT || 8003);
const HOST = process.env.HOST || '0.0.0.0';

/* ---------- hasło: generowane, nie zapisane w kodzie ---------- */
const sha = (t) => createHash('sha256').update(String(t)).digest('hex');
let haslo = '';

function pustyStan() {
  return { produkty: [], ustawienia: {}, wiadomosci: [] };
}

async function przygotuj() {
  await mkdir(DANE, { recursive: true });
  await mkdir(UPLOADY, { recursive: true });
  try {
    haslo = (await readFile(PLIK_HASLA, 'utf8')).trim();
  } catch {
    haslo = 'syg-' + randomBytes(6).toString('hex');
    await writeFile(PLIK_HASLA, haslo, { mode: 0o600 });
  }
  try { await stat(PLIK_DANYCH); }
  catch { await writeFile(PLIK_DANYCH, JSON.stringify(pustyStan(), null, 2)); }
  // nakładka dla strony musi istnieć także po sklonowaniu repo / restarcie
  try { await stat(PLIK_NAKLADKI); }
  catch { await zapiszDane(await czytajDane()); }
  return haslo;
}

/* ---------- sesje (pamięć + dysk, żeby restart nie wyrzucał) ---------- */
const sesje = new Map();
async function wczytajSesje() {
  try {
    const lista = JSON.parse(await readFile(PLIK_SESJI, 'utf8'));
    const teraz = Date.now();
    for (const [k, wygasa] of Object.entries(lista || {})) {
      if (typeof wygasa === 'number' && wygasa > teraz) sesje.set(k, wygasa);
    }
  } catch { /* brak pliku sesji przy pierwszym uruchomieniu */ }
}
async function zapiszSesje() {
  const teraz = Date.now();
  const obj = {};
  for (const [k, wygasa] of sesje.entries()) {
    if (wygasa > teraz) obj[k] = wygasa;
    else sesje.delete(k);
  }
  await writeFile(PLIK_SESJI, JSON.stringify(obj), { mode: 0o600 }).catch(() => {});
}
async function nowaSesja() {
  const t = randomBytes(24).toString('hex');
  sesje.set(t, Date.now() + 1000 * 60 * 60 * 8); // 8 h
  await zapiszSesje();
  return t;
}
function wszystkieTokenyZ(req, body) {
  const lista = [];
  const xSyg = String(req.headers['x-syg-token'] || '').match(/^[a-f0-9]+$/i)?.[0];
  if (xSyg) lista.push(xSyg);
  const zNaglowka = String(req.headers.authorization || '').match(/^Bearer\s+([a-f0-9]+)$/i)?.[1];
  if (zNaglowka) lista.push(zNaglowka);
  const zCiala = body && typeof body.token === 'string' ? body.token.match(/^[a-f0-9]+$/i)?.[0] : null;
  if (zCiala) lista.push(zCiala);
  const ciastko = String(req.headers.cookie || '');
  for (const m of ciastko.matchAll(/(?:^|;\s*)syg_sesja=([a-f0-9]+)/g)) {
    if (m[1]) lista.push(m[1]);
  }
  return [...new Set(lista)];
}
function sesjaOK(req, body) {
  const kandydaci = wszystkieTokenyZ(req, body);
  const teraz = Date.now();
  for (const t of kandydaci) {
    const wygasa = sesje.get(t);
    if (wygasa && wygasa >= teraz) return true;
    if (wygasa && wygasa < teraz) sesje.delete(t);
  }
  return false;
}
function skrotNaglowkow(req, body) {
  const c = req.headers.cookie ? 'tak' : 'nie';
  const a = req.headers.authorization ? 'tak' : 'nie';
  const x = req.headers['x-syg-token'] ? 'tak' : 'nie';
  const b = body && body.token ? 'tak' : 'nie';
  return `cookie=${c} auth=${a} xsyg=${x} body=${b}`;
}

const json = (res, kod, obj) => {
  res.writeHead(kod, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
};

function ciasteczkoSesji(req, wartosc, maxAge) {
  const proto = String(req.headers['x-forwarded-proto'] || '').toLowerCase();
  const origin = String(req.headers.origin || req.headers.referer || '').toLowerCase();
  const https = proto === 'https' || origin.startsWith('https://');
  const atrybuty = https ? 'SameSite=None; Secure' : 'SameSite=Lax';
  return `syg_sesja=${wartosc}; HttpOnly; ${atrybuty}; Path=/; Max-Age=${maxAge}`;
}

async function cialo(req, limit = 16e6) {
  let d = '';
  for await (const k of req) { d += k; if (d.length > limit) throw new Error('za duże'); }
  const ct = String(req.headers['content-type'] || '').toLowerCase();
  if (ct.includes('application/x-www-form-urlencoded')) {
    return Object.fromEntries(new URLSearchParams(d));
  }
  try { return JSON.parse(d || '{}'); } catch { return {}; }
}

async function czytajDane() {
  try { return JSON.parse(await readFile(PLIK_DANYCH, 'utf8')); }
  catch { return pustyStan(); }
}
async function zapiszDane(d) {
  await writeFile(PLIK_DANYCH, JSON.stringify(d, null, 2));
  // strona doładowuje ten plik jako zwykły skrypt — JSON podany w <script>
  // wywalałby SyntaxError, więc publikujemy go jako przypisanie do window
  await writeFile(PLIK_NAKLADKI,
    '/* Plik generowany przez panel — nie edytuj ręcznie. */\n' +
    'window.SYG_PANEL = ' + JSON.stringify(d) + ';\n');
}

async function czytajHistorie() {
  try {
    const h = JSON.parse(await readFile(PLIK_HISTORII, 'utf8'));
    return Array.isArray(h) ? h : [];
  } catch { return []; }
}
async function odlozDoHistorii(stan, opis) {
  const h = await czytajHistorie();
  h.unshift({ czas: new Date().toISOString(), opis: opis || 'Zmiana w panelu', stan });
  if (h.length > 15) h.length = 15;
  await writeFile(PLIK_HISTORII, JSON.stringify(h), { mode: 0o600 }).catch(() => {});
}

async function czytajBazeDomyslna() {
  let baza = { firma: {}, produkty: [], realizacje: [], kolejnosc: [], odznaki: {} };
  try {
    const txt = await readFile(PLIK_BAZY, 'utf8');
    const idx = txt.indexOf('window.SYG_DANE = ');
    if (idx >= 0) {
      const jsonStr = txt.slice(idx + 'window.SYG_DANE = '.length).replace(/;\s*$/, '');
      baza = JSON.parse(jsonStr);
    }
  } catch { /* ignoruj */ }

  let obrazyStudia = [];
  try {
    const pliki = await readdir(join(ROOT, 'assets', 'img'));
    obrazyStudia = pliki
      .filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f))
      .sort()
      .map((f) => 'assets/img/' + f);
  } catch { /* ignoruj */ }

  return {
    firma: baza.firma || {},
    produkty: Array.isArray(baza.produkty) ? baza.produkty : [],
    realizacje: Array.isArray(baza.realizacje) ? baza.realizacje : [],
    kolejnosc: Array.isArray(baza.kolejnosc) ? baza.kolejnosc : [],
    odznaki: baza.odznaki || {},
    obrazyStudia
  };
}

function bezpiecznaNazwaPliku(nazwa) {
  const mapa = { 'ą':'a','ć':'c','ę':'e','ł':'l','ń':'n','ó':'o','ś':'s','ź':'z','ż':'z',
                 'Ą':'a','Ć':'c','Ę':'e','Ł':'l','Ń':'n','Ó':'o','Ś':'s','Ź':'z','Ż':'z' };
  return String(nazwa || 'obraz')
    .replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, (c) => mapa[c] || c)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'obraz';
}

const TYPY = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif',
  '.ico': 'image/x-icon', '.json': 'application/json; charset=utf-8'
};

haslo = await przygotuj();
await wczytajSesje();

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const p = decodeURIComponent(url.pathname);

  try {
    /* ---------- API ---------- */
    if (p === '/api/logowanie' && req.method === 'POST') {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      const formularz = String(req.headers['content-type'] || '').toLowerCase().includes('application/x-www-form-urlencoded');
      const d = await cialo(req);
      const podane = Buffer.from(sha(String(d.haslo || '').trim()));
      const wzor = Buffer.from(sha(haslo));
      if (podane.length === wzor.length && timingSafeEqual(podane, wzor)) {
        const t = await nowaSesja();
        console.log('[api] POST /api/logowanie -> 200' + (formularz ? ' (formularz)' : ''));
        if (formularz) {
          res.writeHead(303, {
            Location: '/admin/',
            'Set-Cookie': ciasteczkoSesji(req, t, 28800)
          });
          res.end();
        } else {
          res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store',
            'Set-Cookie': ciasteczkoSesji(req, t, 28800)
          });
          // token w treści — panel zapisze go u siebie i będzie go dosyłał
          res.end(JSON.stringify({ ok: true, token: t }));
        }
      } else {
        // celowa zwłoka — utrudnia zgadywanie hasła
        await new Promise(r => setTimeout(r, 400));
        console.log('[api] POST /api/logowanie -> 401');
        if (formularz) {
          res.writeHead(303, { Location: '/admin/?blad=1' });
          res.end();
        } else {
          json(res, 401, { ok: false, blad: 'Nieprawidłowe hasło.' });
        }
      }
      return;
    }

    if (p === '/api/wyloguj' && req.method === 'POST') {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      const d = await cialo(req);
      for (const t of wszystkieTokenyZ(req, d)) sesje.delete(t);
      await zapiszSesje();
      res.writeHead(200, { 'Content-Type': 'application/json', 'Set-Cookie': ciasteczkoSesji(req, '', 0) });
      res.end('{"ok":true}');
      return;
    }

    if (p === '/api/stan' && (req.method === 'GET' || req.method === 'POST')) {
      // tryb klik-w-element czyta ten adres prosto ze strony (inny port);
      // POST jest zapasem, gdyby proxy wycinało nagłówki i ciasteczka w GET
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      const d = req.method === 'POST' ? await cialo(req) : null;
      const ok = sesjaOK(req, d);
      console.log(`[api] ${req.method} /api/stan -> ${ok ? 200 : 401} (${skrotNaglowkow(req, d)})`);
      if (!ok) return json(res, 401, { ok: false, blad: 'Zaloguj się.' });
      const [dane, domyslne, historia] = await Promise.all([
        czytajDane(),
        czytajBazeDomyslna(),
        czytajHistorie()
      ]);
      return json(res, 200, { ok: true, ...dane, domyslne, historiaIle: historia.length });
    }

    if (req.method === 'OPTIONS' && p.startsWith('/api/')) {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': req.headers.origin || '*',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Syg-Token',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      });
      return res.end();
    }

    if (p === '/api/zapisz' && req.method === 'POST') {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      const d = await cialo(req);
      const ok = sesjaOK(req, d);
      console.log(`[api] POST /api/zapisz -> ${ok ? 200 : 401} (${skrotNaglowkow(req, d)})`);
      if (!ok) return json(res, 401, { ok: false, blad: 'Sesja wygasła — zaloguj się ponownie.' });

      const stan = await czytajDane();
      const kopia = JSON.stringify(stan);
      await odlozDoHistorii(JSON.parse(kopia), d.opisZmiany || 'Zapis z panelu');

      // zwykły zapis z panelu przysyła pełne listy (z flagą pelneProdukty);
      // tryb klik-w-element przysyła jeden produkt — wtedy scal po id
      if (Array.isArray(d.produkty)) {
        if (!d.pelneProdukty && d.produkty.length === 1 && d.produkty[0] && d.produkty[0].id) {
          const z = d.produkty[0];
          const i = (stan.produkty || []).findIndex((x) => x.id === z.id);
          if (i >= 0) stan.produkty[i] = { ...stan.produkty[i], ...z };
          else { stan.produkty = stan.produkty || []; stan.produkty.push(z); }
        } else {
          stan.produkty = d.produkty;
          if (d.pelneProdukty) stan.produktyPelna = true;
        }
      }

      if (Array.isArray(d.realizacje)) {
        if (!d.pelneRealizacje && d.realizacje.length === 1 && d.realizacje[0] && d.realizacje[0].id != null) {
          const r = d.realizacje[0];
          const i = (stan.realizacje || []).findIndex((x) => String(x.id) === String(r.id));
          if (i >= 0) stan.realizacje[i] = { ...stan.realizacje[i], ...r };
          else { stan.realizacje = stan.realizacje || []; stan.realizacje.push(r); }
        } else {
          stan.realizacje = d.realizacje;
          if (d.pelneRealizacje) stan.realizacjePelna = true;
        }
      }

      if (d.stronaGlowna && typeof d.stronaGlowna === 'object') {
        stan.stronaGlowna = d.zastapStroneGlowna
          ? d.stronaGlowna
          : { ...(stan.stronaGlowna || {}), ...d.stronaGlowna };
      }

      if (d.menu !== undefined) {
        if (d.menu === null) delete stan.menu;
        else if (Array.isArray(d.menu)) stan.menu = d.menu;
      }

      if (Array.isArray(d.podstrony_wlasne)) {
        stan.podstrony_wlasne = d.podstrony_wlasne;
      }

      if (d.podstrony_wbudowane && typeof d.podstrony_wbudowane === 'object') {
        stan.podstrony_wbudowane = { ...(stan.podstrony_wbudowane || {}), ...d.podstrony_wbudowane };
      }

      if (d.elementy && typeof d.elementy === 'object') {
        stan.elementy = stan.elementy || {};
        for (const [klucz, wartosc] of Object.entries(d.elementy)) {
          if (wartosc === null) delete stan.elementy[klucz];
          else stan.elementy[klucz] = wartosc;
        }
      }

      if (d.ustawienia && typeof d.ustawienia === 'object') {
        stan.ustawienia = { ...(stan.ustawienia || {}), ...d.ustawienia };
      }

      if (Array.isArray(d.wiadomosci)) {
        stan.wiadomosci = d.wiadomosci;
      }
      if (d.wiadomoscAktualizuj && d.wiadomoscAktualizuj.id) {
        stan.wiadomosci = stan.wiadomosci || [];
        const wi = stan.wiadomosci.findIndex((w) => String(w.id) === String(d.wiadomoscAktualizuj.id));
        if (wi >= 0) stan.wiadomosci[wi] = { ...stan.wiadomosci[wi], ...d.wiadomoscAktualizuj };
      }
      if (d.usunWiadomoscId) {
        stan.wiadomosci = (stan.wiadomosci || []).filter((w) => String(w.id) !== String(d.usunWiadomoscId));
      }

      stan.wersja = Date.now();   // strona po tym poznaje, że są nowe dane
      await zapiszDane(stan);
      const historia = await czytajHistorie();
      return json(res, 200, { ok: true, wersja: stan.wersja, historiaIle: historia.length, cofnij: kopia.slice(0, 200000) });
    }

    if (p === '/api/upload' && req.method === 'POST') {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      const d = await cialo(req);
      const ok = sesjaOK(req, d);
      console.log(`[api] POST /api/upload -> ${ok ? 200 : 401}`);
      if (!ok) return json(res, 401, { ok: false, blad: 'Sesja wygasła — zaloguj się ponownie.' });

      const raw = String(d.dataUrl || d.base64 || '');
      let mime = 'image/jpeg';
      let b64 = raw;
      const m = /^data:(image\/(?:jpeg|jpg|png|webp|gif));base64,([\s\S]+)$/i.exec(raw);
      if (m) {
        mime = m[1].toLowerCase() === 'image/jpg' ? 'image/jpeg' : m[1].toLowerCase();
        b64 = m[2];
      } else if (raw.startsWith('data:')) {
        return json(res, 400, { ok: false, blad: 'Obsługiwane formaty zdjęć: JPG, PNG, WEBP, GIF.' });
      }
      const buf = Buffer.from(b64, 'base64');
      if (!buf.length || buf.length > 10 * 1024 * 1024) {
        return json(res, 400, { ok: false, blad: 'Plik jest pusty albo przekracza 10 MB.' });
      }

      const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : mime === 'image/gif' ? 'gif' : 'jpg';
      const nazwaBazowa = bezpiecznaNazwaPliku(d.nazwa || 'zdjecie');
      const skrot = randomBytes(3).toString('hex');
      const plikNazwa = `${nazwaBazowa}-${skrot}.${ext}`;
      const pelnaSciezka = join(UPLOADY, plikNazwa);
      await writeFile(pelnaSciezka, buf);

      const sciezka = `admin/panele/uploady/${plikNazwa}`;
      const stan = await czytajDane();
      stan.media = Array.isArray(stan.media) ? stan.media : [];
      const wpis = {
        id: 'med-' + Date.now() + '-' + skrot,
        nazwa: String(d.nazwa || nazwaBazowa).trim() || nazwaBazowa,
        sciezka,
        dodano: new Date().toISOString()
      };
      stan.media.unshift(wpis);
      stan.wersja = Date.now();
      await zapiszDane(stan);
      return json(res, 200, { ok: true, sciezka, wpis, media: stan.media, wersja: stan.wersja });
    }

    if (p === '/api/media-zmien' && req.method === 'POST') {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      const d = await cialo(req);
      if (!sesjaOK(req, d)) return json(res, 401, { ok: false, blad: 'Sesja wygasła.' });
      const stan = await czytajDane();
      stan.media = Array.isArray(stan.media) ? stan.media : [];
      const i = stan.media.findIndex((m) => String(m.id) === String(d.id) || m.sciezka === d.sciezka);
      if (i < 0) return json(res, 404, { ok: false, blad: 'Nie znaleziono zdjęcia w bibliotece.' });
      if (d.akcja === 'usun') {
        const usuwane = stan.media.splice(i, 1)[0];
        if (usuwane && usuwane.sciezka && usuwane.sciezka.startsWith('admin/panele/uploady/')) {
          const plik = normalize(join(ROOT, usuwane.sciezka));
          if (plik.startsWith(UPLOADY)) await unlink(plik).catch(() => {});
        }
      } else if (d.akcja === 'zmien' && d.nazwa) {
        stan.media[i].nazwa = String(d.nazwa).trim().slice(0, 80);
      }
      stan.wersja = Date.now();
      await zapiszDane(stan);
      return json(res, 200, { ok: true, media: stan.media, wersja: stan.wersja });
    }

    if (p === '/api/wiadomosc' && req.method === 'POST') {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      const d = await cialo(req, 500000);
      if (d.bot) return json(res, 200, { ok: true }); // honeypot
      const imie = String(d.imie || '').trim();
      const email = String(d.email || '').trim();
      const tresc = String(d.tresc || '').trim();
      if (imie.length < 2 || !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email) || tresc.length < 4) {
        return json(res, 400, { ok: false, blad: 'Podaj imię, poprawny e-mail i treść wiadomości.' });
      }
      const stan = await czytajDane();
      stan.wiadomosci = Array.isArray(stan.wiadomosci) ? stan.wiadomosci : [];
      const wpis = {
        id: 'w-' + Date.now() + '-' + randomBytes(2).toString('hex'),
        sygnatura: 'TEST-' + String(stan.wiadomosci.length + 1).padStart(4, '0'),
        data: new Date().toISOString(),
        temat: String(d.temat || 'inne').slice(0, 60),
        imie: imie.slice(0, 120),
        email: email.slice(0, 160),
        telefon: String(d.telefon || '').slice(0, 40),
        produkt: String(d.produkt || '').slice(0, 160),
        tresc: tresc.slice(0, 4000),
        status: 'nowa',
        notatka: '',
        zrodlo: d.zrodlo === 'panel' ? 'panel' : 'formularz-testowy'
      };
      stan.wiadomosci.unshift(wpis);
      stan.wersja = Date.now();
      await zapiszDane(stan);
      console.log('[api] POST /api/wiadomosc -> 200 (' + wpis.sygnatura + ')');
      return json(res, 200, { ok: true, wpis, sygnatura: wpis.sygnatura, testowy: true });
    }

    if (p === '/api/cofnij' && req.method === 'POST') {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      const d = await cialo(req);
      if (!sesjaOK(req, d)) return json(res, 401, { ok: false, blad: 'Sesja wygasła.' });
      const historia = await czytajHistorie();
      if (!historia.length) return json(res, 400, { ok: false, blad: 'Brak wcześniejszej wersji do cofnięcia.' });
      const ostatni = historia.shift();
      await writeFile(PLIK_HISTORII, JSON.stringify(historia), { mode: 0o600 }).catch(() => {});
      const przywrocony = { ...ostatni.stan, wersja: Date.now() };
      await zapiszDane(przywrocony);
      return json(res, 200, { ok: true, stan: przywrocony, historiaIle: historia.length });
    }

    if (p === '/api/reset' && req.method === 'POST') {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      const d = await cialo(req);
      if (!sesjaOK(req, d)) return json(res, 401, { ok: false, blad: 'Sesja wygasła.' });
      const stan = await czytajDane();
      await odlozDoHistorii(JSON.parse(JSON.stringify(stan)), 'Przed resetem (' + (d.sekcja || 'wszystko') + ')');
      const sekcja = d.sekcja || 'wszystko';
      if (sekcja === 'wszystko') {
        const czysty = { ...pustyStan(), wersja: Date.now() };
        await zapiszDane(czysty);
        return json(res, 200, { ok: true, stan: czysty });
      }
      if (sekcja === 'stronaGlowna') delete stan.stronaGlowna;
      if (sekcja === 'produkty') { stan.produkty = []; delete stan.produktyPelna; }
      if (sekcja === 'realizacje') { delete stan.realizacje; delete stan.realizacjePelna; }
      if (sekcja === 'menu') delete stan.menu;
      if (sekcja === 'podstrony') { delete stan.podstrony_wlasne; delete stan.podstrony_wbudowane; }
      if (sekcja === 'elementy') delete stan.elementy;
      if (sekcja === 'ustawienia') stan.ustawienia = {};
      if (sekcja.startsWith('strona:')) {
        const pref = sekcja.slice(7) + '.';
        if (stan.elementy) {
          for (const k of Object.keys(stan.elementy)) {
            if (k.startsWith(pref)) delete stan.elementy[k];
          }
        }
      }
      stan.wersja = Date.now();
      await zapiszDane(stan);
      return json(res, 200, { ok: true, stan });
    }

    if (p === '/api/haslo' && req.method === 'POST') {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      const d = await cialo(req);
      if (!sesjaOK(req, d)) return json(res, 401, { ok: false, blad: 'Sesja wygasła.' });
      const obecne = Buffer.from(sha(String(d.obecne || '').trim()));
      const wzor = Buffer.from(sha(haslo));
      if (obecne.length !== wzor.length || !timingSafeEqual(obecne, wzor)) {
        return json(res, 400, { ok: false, blad: 'Obecne hasło jest nieprawidłowe.' });
      }
      const nowe = String(d.nowe || '').trim();
      if (nowe.length < 8) {
        return json(res, 400, { ok: false, blad: 'Nowe hasło musi mieć co najmniej 8 znaków.' });
      }
      haslo = nowe;
      await writeFile(PLIK_HASLA, haslo, { mode: 0o600 });
      return json(res, 200, { ok: true });
    }

    /* ---------- pliki ---------- */
    let s = p === '/' ? '/admin/index.html' : p;
    if (s === '/admin/') s = '/admin/index.html';
    const plik = normalize(join(ROOT, s));
    if (!plik.startsWith(ROOT)) return res.writeHead(403).end('403');
    if (p === '/admin') { res.writeHead(302, { Location: '/admin/' }); return res.end(); }
    if (s === '/admin') { res.writeHead(302, { Location: '/admin/' }); return res.end(); }
    const info = await stat(plik).catch(() => null);
    if (!info || info.isDirectory()) return res.writeHead(404).end('404');
    res.writeHead(200, { 'Content-Type': TYPY[extname(plik).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(await readFile(plik));
  } catch (e) {
    json(res, 500, { ok: false, blad: 'Błąd serwera: ' + e.message });
  }
}).listen(PORT, HOST, () => {
  console.log('');
  console.log('  Panel testowy:  http://localhost:' + PORT + '/admin/');
  console.log('  Hasło (tymczasowe, zmieniaj co test):  ' + haslo);
  console.log('  Plik hasła:     admin/panele/.haslo  (w .gitignore, nie idzie do repo)');
  console.log('');
});
