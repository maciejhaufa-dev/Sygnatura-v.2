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

/* ---------- sesje w pamięci (gasną po restarcie) ---------- */
const sesje = new Map();
function nowaSesja() {
  const t = randomBytes(24).toString('hex');
  sesje.set(t, Date.now() + 1000 * 60 * 60 * 8); // 8 h
  return t;
}
function sesjaOK(req) {
  const t = (req.headers.cookie || '').match(/(?:^|;\s*)syg_sesja=([a-f0-9]+)/)?.[1];
  if (!t) return false;
  const wygasa = sesje.get(t);
  if (!wygasa || wygasa < Date.now()) { sesje.delete(t); return false; }
  return true;
}

const json = (res, kod, obj) => {
  res.writeHead(kod, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
};

async function cialo(req) {
  let d = '';
  for await (const k of req) { d += k; if (d.length > 5e6) throw new Error('za duże'); }
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

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const p = decodeURIComponent(url.pathname);

  try {
    /* ---------- API ---------- */
    if (p === '/api/logowanie' && req.method === 'POST') {
      const d = await cialo(req);
      const podane = Buffer.from(sha(d.haslo || ''));
      const wzor = Buffer.from(sha(haslo));
      if (podane.length === wzor.length && timingSafeEqual(podane, wzor)) {
        const t = nowaSesja();
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Set-Cookie': `syg_sesja=${t}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800`
        });
        res.end(JSON.stringify({ ok: true }));
      } else {
        // celowa zwłoka — utrudnia zgadywanie hasła
        await new Promise(r => setTimeout(r, 400));
        json(res, 401, { ok: false, blad: 'Nieprawidłowe hasło.' });
      }
      return;
    }

    if (p === '/api/wyloguj' && req.method === 'POST') {
      const t = (req.headers.cookie || '').match(/syg_sesja=([a-f0-9]+)/)?.[1];
      if (t) sesje.delete(t);
      res.writeHead(200, { 'Content-Type': 'application/json', 'Set-Cookie': 'syg_sesja=; Path=/; Max-Age=0' });
      res.end('{"ok":true}');
      return;
    }

    if (p === '/api/stan') {
      if (!sesjaOK(req)) return json(res, 401, { ok: false, blad: 'Zaloguj się.' });
      return json(res, 200, { ok: true, ...(await czytajDane()) });
    }

    if (p === '/api/zapisz' && req.method === 'POST') {
      if (!sesjaOK(req)) return json(res, 401, { ok: false, blad: 'Sesja wygasła — zaloguj się ponownie.' });
      const d = await cialo(req);
      const stan = await czytajDane();
      const kopia = JSON.stringify(stan);
      if (d.produkty) stan.produkty = d.produkty;
      if (d.ustawienia) stan.ustawienia = { ...stan.ustawienia, ...d.ustawienia };
      await zapiszDane(stan);
      return json(res, 200, { ok: true, cofnij: kopia.slice(0, 200000) });
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
