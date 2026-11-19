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

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let sciezka = decodeURIComponent(url.pathname);
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
