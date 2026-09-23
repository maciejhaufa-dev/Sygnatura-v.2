// Wygenerowanie engine/SEED.gs z aktualnych seedy klienta (api.js + data/katalog.js).
// Uruchomienie: node tools/gen_seed_gs.js
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

// --- sandbox przeglądarky ---
const store = {};
const localStorageShim = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
  clear: () => { for (const k in store) delete store[k]; }
};
const windowShim = { SYG: { TRYB_DEMO: true }, SYG_KATALOG: [] };
const nodeRequire = require;

// data/katalog.js — window.SYG_KATALOG
const katSrc = fs.readFileSync(path.join(ROOT, 'www/data/katalog.js'), 'utf8');
const sandboxKat = new Function('window', katSrc);
sandboxKat(windowShim);
const katalog = windowShim.SYG_KATALOG || [];

// api.js — IIFE; zasieje syg-demo-blog / syg-demo-strony w localStorage shimie
const apiSrc = fs.readFileSync(path.join(ROOT, 'www/assets/api.js'), 'utf8');
const sandboxApi = new Function('window', 'localStorage', 'document', apiSrc);
sandboxApi(windowShim, localStorageShim, {});

const blog = JSON.parse(store['syg-demo-blog'] || '[]');
const strony = JSON.parse(store['syg-demo-strony'] || '[]');
const seedyWersja = JSON.parse(store['syg-seed-wersja'] || '{}');

if (!blog.length || !strony.length) {
  console.error('BŁĄD: brak seedy w sandboxie — blog:', blog.length, 'strony:', strony.length);
  process.exit(1);
}

// katalog → wiersze arkusza: id|nazwa|opis|cena|obraz|dostepny|gabaryt|storyId
const katRows = katalog.map((p) => [
  Number(p.id),
  String(p.nazwa || ''),
  String(p.opis || ''),
  Number(p.cena || 0),
  String(p.obraz || ''),
  Number(p.dostepny === undefined ? 1 : p.dostepny),
  String(p.gabaryt || ''),
  Number(p.storyId || 0)
]);

const out = [];
out.push('/**');
out.push(' * ============================================================');
out.push(' * Studio Sygnatura — SEEDY SILNIKA (GENEROWANY PLIK)');
out.push(' * Wygenerowany z www/assets/api.js + www/data/katalog.js.');
out.push(' * NIE edytować ręcznie — po zmianie seedy klienta uruchom:');
out.push(' *   node tools/gen_seed_gs.js');
out.push(' * ============================================================');
out.push(' */');
out.push('');
out.push('var SEED_BLOG_WERSJA = ' + JSON.stringify(seedyWersja) + ';');
out.push('');
out.push('var SEED_KATALOG = ' + JSON.stringify(katRows, null, 2) + ';');
out.push('');
out.push('var SEED_BLOG = ' + JSON.stringify(blog, null, 2) + ';');
out.push('');
out.push('var SEED_STRONY = ' + JSON.stringify(strony, null, 2) + ';');
out.push('');

fs.writeFileSync(path.join(ROOT, 'engine/SEED.gs'), out.join('\n'));
console.log('SEED.gs: blog ' + blog.length + ' wpisów, strony ' + strony.length +
  ', katalog ' + katRows.length + ' produktów, wersje ' + JSON.stringify(seedyWersja));
