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
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { join, dirname, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DANE = join(ROOT, 'admin', 'panele');
const PLIK_DANYCH = join(DANE, 'dane.json');
const PLIK_HASLA = join(DANE, '.haslo');
const PLIK_NAKLADKI = join(DANE, 'dane.js');   // to samo, ale jako skrypt dla strony
const PLIK_SESJI = join(DANE, '.sesje.json');
const PORT = Number(process.argv[2] || process.env.PORT || 8003);
const HOST = process.env.HOST || '0.0.0.0';

/* ---------- hasło: generowane, nie zapisane w kodzie ---------- */
const sha = (t) => createHash('sha256').update(String(t)).digest('hex');

async function przygotuj() {
  await mkdir(DANE, { recursive: true });
  let haslo;
  try {
    haslo = (await readFile(PLIK_HASLA, 'utf8')).trim();
  } catch {
    haslo = 'syg-' + randomBytes(6).toString('hex');
    await writeFile(PLIK_HASLA, haslo, { mode: 0o600 });
  }
  try { await stat(PLIK_DANYCH); }
  catch { await writeFile(PLIK_DANYCH, JSON.stringify({ produkty: [], ustawienia: {}, wiadomosci: [] }, null, 2)); }
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

async function cialo(req) {
  let d = '';
  for await (const k of req) { d += k; if (d.length > 5e6) throw new Error('za duże'); }
  const ct = String(req.headers['content-type'] || '').toLowerCase();
  if (ct.includes('application/x-www-form-urlencoded')) {
    return Object.fromEntries(new URLSearchParams(d));
  }
  try { return JSON.parse(d || '{}'); } catch { return {}; }
}

async function czytajDane() {
  try { return JSON.parse(await readFile(PLIK_DANYCH, 'utf8')); }
  catch { return { produkty: [], ustawienia: {}, wiadomosci: [] }; }
}
async function zapiszDane(d) {
  await writeFile(PLIK_DANYCH, JSON.stringify(d, null, 2));
  // strona doładowuje ten plik jako zwykły skrypt — JSON podany w <script>
  // wywalałby SyntaxError, więc publikujemy go jako przypisanie do window
  await writeFile(PLIK_NAKLADKI,
    '/* Plik generowany przez panel — nie edytuj ręcznie. */\n' +
    'window.SYG_PANEL = ' + JSON.stringify(d) + ';\n');
}

const TYPY = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.json': 'application/json; charset=utf-8'
};

const haslo = await przygotuj();
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
      return json(res, 200, { ok: true, ...(await czytajDane()) });
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
      // zwykły zapis z panelu przysyła całe listy; tryb klik-w-element
      // przysyła jedno pole — wtedy tylko je podmieniamy
      if (d.produkty) {
        if (d.produkty.length === 1 && d.produkty[0].id) {
          const z = d.produkty[0];
          const i = (stan.produkty || []).findIndex((p) => p.id === z.id);
          if (i >= 0) stan.produkty[i] = { ...stan.produkty[i], ...z };
          else { stan.produkty = stan.produkty || []; stan.produkty.push(z); }
        } else {
          stan.produkty = d.produkty;
        }
      }
      if (d.ustawienia) stan.ustawienia = { ...stan.ustawienia, ...d.ustawienia };
      stan.wersja = Date.now();   // strona po tym poznaje, że są nowe dane
      await zapiszDane(stan);
      return json(res, 200, { ok: true, wersja: stan.wersja, cofnij: kopia.slice(0, 200000) });
    }

    /* ---------- pliki ---------- */
    let s = p === '/' ? '/admin/index.html' : p;
    if (s === '/admin/') s = '/admin/index.html';
    const plik = normalize(join(ROOT, s));
    if (!plik.startsWith(ROOT)) return res.writeHead(403).end('403');
    if (p === '/admin') { res.writeHead(302, { Location: '/admin/' }); return res.end(); }
    // „/admin” bez ukośnika → przekierowanie na „/admin/”, inaczej 404
    if (s === '/admin') { res.writeHead(302, { Location: '/admin/' }); return res.end(); }
    const info = await stat(plik).catch(() => null);
    if (!info || info.isDirectory()) return res.writeHead(404).end('404');
    res.writeHead(200, { 'Content-Type': TYPY[extname(plik)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
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
