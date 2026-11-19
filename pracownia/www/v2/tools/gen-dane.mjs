#!/usr/bin/env node
/* ============================================================
   Studio Sygnatura v2 — generator danych strony
   Czyta WYŁĄCZNIE pliki z gałęzi produkcyjnej GitHub Pages:
     docs/data/katalog.js   (katalog: nazwy, ceny, dostępność)
     docs/assets/config.js  (dane firmy, API, personalizacje)
     docs/assets/api.js     (seed realizacji / bloga)
   i zapisuje data/dane.js. Cen, telefonów ani adresów nie wpisujemy
   ręcznie — zmieniamy źródło i uruchamiamy generator ponownie.

   Użycie:
     node tools/gen-dane.mjs                 # ref domyślny (gałąź Pages)
     node tools/gen-dane.mjs <git-ref>       # np. origin/main
   ============================================================ */
import { execFileSync } from 'node:child_process';
import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const REF = process.argv[2] || 'origin/arena/01a0ca92-sygnatura-v-2';
const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, '..', 'data', 'dane.js');

function zGita(sciezka) {
  try {
    return execFileSync('git', ['show', `${REF}:${sciezka}`], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  } catch (e) {
    console.error(`Nie mogę odczytać ${sciezka} z refu ${REF}.`);
    console.error('Uruchom generator w klonie repozytorium z pobraną gałęzią produkcyjną, np.:');
    console.error('  git fetch origin arena/01a0ca92-sygnatura-v-2');
    process.exit(1);
  }
}

/* --- config.js i katalog.js to zwykłe skrypty przypisujące do window --- */
const ctx = {};
ctx.window = ctx;
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(zGita('docs/assets/config.js'), ctx);
vm.runInContext(zGita('docs/data/katalog.js'), ctx);
const SYG = ctx.SYG;
const KATALOG = ctx.SYG_KATALOG || [];

/* --- sekcja seedBlog z api.js: wyciągamy literał tablicy wpisów --- */
const apiSrc = zGita('docs/assets/api.js');
const startArr = apiSrc.indexOf('const posts = [');
if (startArr < 0) throw new Error('Nie znalazłem seeda wpisów (const posts = [) w api.js');
let i = apiSrc.indexOf('[', startArr), glebokosc = 0, koniec = -1;
for (; i < apiSrc.length; i++) {
  const ch = apiSrc[i];
  if (ch === '[') glebokosc++;
  else if (ch === ']') { glebokosc--; if (glebokosc === 0) { koniec = i; break; } }
}
const posts = vm.runInNewContext('(' + apiSrc.slice(apiSrc.indexOf('[', startArr), koniec + 1) + ')');
const wpisWgId = new Map(posts.map(p => [p.id, p]));

/* Cudzysłowy w źródłach bywają zapisane jako „…\" (prosty cudzysłów zamiast ”).
   Poprawiamy tylko pary „…" — resztę tekstu zostawiamy bez zmian. */
const cudzyslowy = (s) => String(s == null ? '' : s).replace(/„([^„”"]*)"/g, '„$1”');

/* --- opisy realizacji czytane z prawdziwych zdjęć w repo (nazwa pliku) --- */
const FOTO_REAL = {
  14: 'krzyzyk', 16: 'plater', 17: 'jajka', 4: 'niedzwiadki', 5: 'serwetnik',
  6: 'krzyzowka', 9: 'makrama', 11: 'pudelko', 8: 'lustro', 7: 'osemka',
  15: 'brelok', 12: 'kartka', 10: 'deska', 13: 'puzzle'
};
/* produkty sklepu: id katalogu -> zdjęcia (te same pliki co w docs/assets/media/sklep) */
const FOTO_PROD = {
  1: { nazwa: 'szopka', galeria: ['gal-szopka-900.jpg', 'gal-szopka-2-900.jpg', 'gal-szopka-4-900.jpg'] },
  2: { nazwa: 'szyld', galeria: ['gal-szyld-900.jpg'] }
};
/* personalizacja z cennika (config.js → PERSONALIZACJE): grawer okolicznościowy */
const PERS_OKAZJA = (SYG.PERSONALIZACJE || []).find(p => p.nazwa === 'Grawer okolicznościowy');

const produkty = [];

/* 1) produkty z katalogu — tylko dostępne (dostepny === 1) */
KATALOG.filter(p => Number(p.dostepny) === 1).forEach((p, idx) => {
  const f = FOTO_PROD[p.id] || {};
  produkty.push({
    id: 'katalog-' + p.id,
    slug: 'katalog-' + p.id,
    zrodlo: `docs/data/katalog.js (id ${p.id})`,
    kolejnosc: idx + 1,
    nazwa: cudzyslowy(p.nazwa),
    kategoria: (wpisWgId.get(p.storyId) || {}).kategoria || 'Pracownia',
    cena: Number(p.cena),
    jednostka: 'szt.',
    dostepny: true,
    gabaryt: p.gabaryt || '',
    foto: `assets/img/prod-${f.nazwa || 'szopka'}-700.jpg`,
    fotoMala: `assets/img/prod-${f.nazwa || 'szopka'}-420.jpg`,
    galeria: f.galeria || [],
    opis: p.opis,
    cechy: p.gabaryt ? [`Wymiar: ${p.gabaryt}`] : [],
    realizacja: p.storyId || null
  });
});

/* 2) grawer okolicznościowy — z cennika personalizacji (config.js) */
if (PERS_OKAZJA) {
  produkty.push({
    id: 'pers-grawer',
    slug: 'pers-grawer',
    zrodlo: 'docs/assets/config.js → PERSONALIZACJE (Grawer okolicznościowy)',
    kolejnosc: produkty.length + 1,
    nazwa: cudzyslowy(PERS_OKAZJA.nazwa),
    kategoria: 'Prezenty personalizowane',
    cena: Number(PERS_OKAZJA.cena),
    jednostka: 'szt.',
    dostepny: true,
    gabaryt: '',
    foto: 'assets/img/prod-grawer-700.jpg',
    fotoMala: 'assets/img/prod-grawer-420.jpg',
    galeria: [],
    opis: cudzyslowy(PERS_OKAZJA.opis) + '. Treść dedykacji ustalamy przed realizacją.',
    cechy: ['Tekst i układ grawerunku ustalamy przed realizacją'],
    realizacja: null
  });
}

/* 3) realizacje (widoczne wpisy z seeda bloga) */
const realizacje = posts
  .filter(w => w.widoczny !== false && FOTO_REAL[w.id])
  .map(w => ({
    id: w.id,
    slug: 'realizacja-' + w.id,
    tytul: cudzyslowy(w.tytul),
    kategoria: w.kategoria,
    opis: cudzyslowy(w.zajawka || ''),
    foto: `assets/img/real-${FOTO_REAL[w.id]}-620.jpg`,
    data: w.data || '',
    okolicznosciowy: /komuni|jubileusz|rocznic|urodzin|ślub|wesel|chrzest|prezent|okoliczno/i.test(w.kategoria + ' ' + w.tytul),
    produkt: w.produkt && w.produkt.sklep && Number(w.produkt.id) > 0 ? 'katalog-' + w.produkt.id : null
  }))
  .sort((a, b) => String(b.data).localeCompare(String(a.data)));

/* 4) znaczniki kart — wyłącznie to, co wynika z danych */
const nowosc = produkty[0] || null;
const bestseller = null; // brak danych sprzedażowych: nie oznaczamy nikogo

const dane = {
  firma: {
    nazwa: SYG.NAZWA,
    mail: SYG.MAIL,
    tel: SYG.TEL,
    telHref: 'tel:+48' + String(SYG.TEL).replace(/\D/g, ''),
    obszar: 'Poznań i okolice, woj. wielkopolskie',
    odpowiedz: 'Na wiadomości odpowiadamy w ciągu 1–2 dni roboczych.'
  },
  api: { url: SYG.API, akcjaWiadomosc: 'wiadomosc' },
  produkty,
  realizacje,
  kolejnosc: ['nowosc', 'bestseller', 'okolicznosciowy'],
  odznaki: {
    nowosc: nowosc ? { produkt: nowosc.id, tekst: 'Nowość', opis: 'Pierwsza pozycja w naszym katalogu.' } : null,
    bestseller: bestseller,
    okolicznosciowy: { produkt: PERS_OKAZJA ? 'pers-grawer' : null, tekst: 'Okolicznościowy', opis: 'Na komunię, jubileusz, rocznicę.' }
  },
  zrodla: {
    ref: REF,
    wygenerowano: new Date().toISOString().slice(0, 10),
    bestseller: 'Brak potwierdzenia w danych sprzedażowych — odznaka wyłączona.'
  }
};

writeFileSync(OUT, `/* ============================================================
   Studio Sygnatura — dane strony v2 (PLIK GENEROWANY)
   Źródło: ${REF}
   Katalog, ceny, telefon i adres pochodzą z plików produkcyjnych.
   Nie edytuj ręcznie — uruchom: node tools/gen-dane.mjs [ref]
   ============================================================ */
window.SYG_DANE = ${JSON.stringify(dane, null, 2)};
`, 'utf8');

console.log(`Zapisano ${OUT}`);
console.log(`produkty: ${produkty.length}, realizacje: ${realizacje.length}, bestseller: ${bestseller ? 'tak' : 'brak danych'}`);
