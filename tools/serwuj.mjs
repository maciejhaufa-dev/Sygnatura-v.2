/* ============================================================
   Studio Sygnatura — podgląd lokalny (czysty JavaScript, Node)
   Uruchom:  node tools/serwuj.mjs
   Serwuje katalog www/ na http://0.0.0.0:8001 (bez Pythona).
   Na hostingu produkcyjnym te same pliki serwuje seohost/inny
   serwer statyczny — zero konfiguracji poza wgraniem plików.
   ============================================================ */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.PORT || 8001);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'www');

const TYPY = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

http.createServer((req, res) => {
  let url;
  try { url = decodeURIComponent((req.url || '/').split('?')[0]); } catch (e) { url = '/'; }
  if (url.endsWith('/')) url += 'index.html';
  let plik = path.normalize(path.join(ROOT, url));
  if (!plik.startsWith(ROOT) || !fs.existsSync(plik) || fs.statSync(plik).isDirectory()) {
    // brak pliku → strona główna (SPA-lite: ładne adresy nie są wymagane)
    plik = path.join(ROOT, 'index.html');
  }
  const roz = path.extname(plik).toLowerCase();
  res.writeHead(200, {
    'Content-Type': TYPY[roz] || 'application/octet-stream',
    'Cache-Control': 'no-store'
  });
  fs.createReadStream(plik).pipe(res);
}).listen(PORT, '0.0.0.0', () => {
  console.log('Studio Sygnatura — podgląd: http://localhost:' + PORT);
  console.log('katalog: ' + ROOT);
});
