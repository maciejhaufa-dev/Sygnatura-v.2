#!/usr/bin/env node
/* ============================================================
   Studio Sygnatura v2 — serwer podglądu lokalnego (bez zależności)
   Użycie:  node tools/serwuj.mjs [port]
   Domyślnie http://localhost:8002 — serwuje katalog pracownia/www/v2.
   ============================================================ */
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.argv[2] || process.env.PORT || 8002);
const PANEL_PORT = Number(process.env.PANEL_PORT || 8003);
const HOST = process.env.HOST || '0.0.0.0';

const TYPY = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

function przekazDoPanelu(req, res) {
  const naglowki = { ...req.headers };
  delete naglowki.host;
  const proxy = http.request({
    hostname: '127.0.0.1',
    port: PANEL_PORT,
    path: req.url,
    method: req.method,
    headers: naglowki
  }, (odp) => {
    res.writeHead(odp.statusCode || 502, odp.headers);
    odp.pipe(res);
  });
  proxy.on('error', () => {
    res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: false, blad: 'Serwer panelu (port ' + PANEL_PORT + ') nie odpowiada.' }));
  });
  req.pipe(proxy);
}

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let sciezka = decodeURIComponent(url.pathname);
    if (sciezka.startsWith('/api/')) { przekazDoPanelu(req, res); return; }
    if (sciezka === '/admin') { res.writeHead(302, { Location: '/admin/' }); res.end(); return; }
    if (sciezka.endsWith('/')) sciezka += 'index.html';
    const plik = normalize(join(ROOT, sciezka));
    if (!plik.startsWith(ROOT)) { res.writeHead(403).end('403'); return; }
    const info = await stat(plik).catch(() => null);
    if (!info || info.isDirectory()) {
      res.writeHead(404, { 'Content-Type': TYPY['.html'] });
      res.end(await readFile(join(ROOT, '404.html'), 'utf8').catch(() => '404'));
      return;
    }
    res.writeHead(200, {
      'Content-Type': TYPY[extname(plik).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    res.end(await readFile(plik));
  } catch (e) {
    res.writeHead(500).end('500');
  }
}).listen(PORT, HOST, () => {
  console.log(`Podgląd: http://localhost:${PORT}  (katalog: ${ROOT})`);
});
