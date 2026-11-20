#!/usr/bin/env node
/* ============================================================
   Eksport bezpiecznego statycznego podglądu GitHub Pages
   z katalogu pracownia/www/v2/ do wskazanego katalogu docelowego
   (np. /tmp/Sygnatura-v2-preview).

   Gwarancje:
   - wyłącznie statyczna strona frontowa (zero docs/, tools/, admin/)
   - brak CNAME, brak .haslo/.sesje/.historia/wiadomosci
   - brak produkcyjnego URL Apps Script oraz lokalnego /api/wiadomosc
   - <meta name="robots" content="noindex, nofollow"> + robots.txt + .nojekyll
   - wszystkie ścieżki względne, działające pod /Sygnatura-v2-preview/
   ============================================================ */
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, '..');
const CEL = resolve(process.argv[2] || '/tmp/Sygnatura-v2-preview');

function zaladujWindowZmienna(kod, nazwa) {
  const sandbox = { window: {} };
  vm.runInNewContext(kod, sandbox);
  return sandbox.window[nazwa];
}

function bezpieczneDanePodgladu(rawPanel) {
  if (!rawPanel || typeof rawPanel !== 'object') return {};
  const kopia = {};
  const polaPubliczne = [
    'produkty', 'produktyPelna',
    'realizacje', 'realizacjePelna',
    'stronaGlowna', 'menu',
    'podstrony_wlasne', 'podstrony_wbudowane', 'elementy'
  ];
  for (const k of polaPubliczne) {
    if (rawPanel[k] !== undefined) kopia[k] = rawPanel[k];
  }
  if (rawPanel.ustawienia && typeof rawPanel.ustawienia === 'object') {
    const u = { ...rawPanel.ustawienia };
    delete u.tryb_testowy_formularza;
    kopia.ustawienia = u;
  }
  return kopia;
}

const STATYCZNY_FORMULARZ_JS = `/* ============================================================
   Studio Sygnatura v2 — formularz w trybie statycznego podglądu
   Wyłącznie walidacja pól po stronie przeglądarki; nie wysyła danych
   do produkcyjnego Apps Script ani do żadnego backendu.
   ============================================================ */
(function () {
  'use strict';
  const D = window.SYG_DANE || {};
  const F = D.firma || {};
  const Q = new URLSearchParams(location.search);

  function ustawBlad(pole, tekst) {
    const g = pole.closest('.pole');
    if (!g) return;
    g.classList.toggle('nie-ok', !!tekst);
    const b = g.querySelector('.blad');
    if (b) b.textContent = tekst || '';
    if (tekst) pole.setAttribute('aria-invalid', 'true'); else pole.removeAttribute('aria-invalid');
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function podepnij(form) {
    if (!form) return;
    const box = document.getElementById(form.getAttribute('data-komunikaty') || 'komunikaty');
    const temat = Q.get('temat');
    const produkt = Q.get('projekt');
    if (temat) {
      const sel = form.querySelector('[name="temat"]');
      if (sel && [...sel.options].some((o) => o.value === temat)) sel.value = temat;
    }
    const opis = form.querySelector('[name="tresc"]');
    if (opis && produkt && !opis.value) {
      opis.value = 'Dzień dobry,\\n\\ninteresuje mnie „' + produkt + '”. Proszę o wycenę i termin realizacji.\\n\\n';
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const dane = {
        temat: (form.querySelector('[name="temat"]') || {}).value || 'inne',
        tresc: ((form.querySelector('[name="tresc"]') || {}).value || '').trim(),
        imie: ((form.querySelector('[name="imie"]') || {}).value || '').trim(),
        email: ((form.querySelector('[name="email"]') || {}).value || '').trim(),
        telefon: (form.querySelector('[name="telefon"]') || {}).value || '',
        zgoda: !!(form.querySelector('[name="zgoda"]') || {}).checked,
        bot: (form.querySelector('[name="strona_www"]') || {}).value || ''
      };
      if (dane.bot) return;

      let bledy = 0;
      const imieOk = dane.imie.length >= 2;
      ustawBlad(form.querySelector('[name="imie"]'), imieOk ? '' : 'Podaj imię i nazwisko.');
      if (!imieOk) bledy++;
      const emailOk = /^[^@\\s]+@[^@\\s]+\\.[^@\\s]{2,}$/.test(dane.email);
      ustawBlad(form.querySelector('[name="email"]'), emailOk ? '' : 'Podaj poprawny adres e-mail.');
      if (!emailOk) bledy++;
      const trescOk = dane.tresc.length >= 10;
      ustawBlad(form.querySelector('[name="tresc"]'), trescOk ? '' : 'Napisz kilka słów o projekcie (min. 10 znaków).');
      if (!trescOk) bledy++;
      if (!dane.zgoda) bledy++;

      if (bledy) {
        box.className = 'form-msg err';
        box.innerHTML = 'Uzupełnij zaznaczone pola' + (dane.zgoda ? '' : ' i zaznacz zgodę na kontakt') + ' — wtedy sprawdzisz działanie formularza.';
        const pierwsze = form.querySelector('.pole.nie-ok input, .pole.nie-ok textarea');
        const zg = form.querySelector('[name="zgoda"]');
        if (pierwsze) pierwsze.focus(); else if (!dane.zgoda && zg) zg.focus();
        return;
      }

      const mailto = 'mailto:' + (F.mail || '') + '?subject=' + encodeURIComponent('Zapytanie: ' + dane.temat)
        + '&body=' + encodeURIComponent(dane.tresc + '\\n\\n' + dane.imie + '\\n' + dane.email + (dane.telefon ? '\\n' + dane.telefon : ''));

      form.hidden = true;
      box.className = 'form-msg ok';
      box.setAttribute('role', 'status');
      box.innerHTML = '<b>Podgląd statyczny — formularz nie wysyła zgłoszeń do pracowni.</b><br>'
        + 'Walidacja pól działa poprawnie. W tym podglądzie połączenie z produkcyjnym systemem pracowni jest wyłączone.<br>'
        + 'Prawdziwy kontakt: <a href="' + escapeHtml(mailto) + '">' + escapeHtml(F.mail) + '</a> lub <a href="' + escapeHtml(F.telHref) + '">' + escapeHtml(F.tel) + '</a>.';
      try { if (box.scrollIntoView) box.scrollIntoView({ block: 'center' }); } catch (_) {}
    });
  }

  function start() { document.querySelectorAll('form[data-zapytanie]').forEach(podepnij); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
`;

async function zweryfikujEksport(cel, plikiHtml) {
  const zakazane = ['CNAME', 'docs', 'tools', 'admin'];
  for (const z of zakazane) {
    try {
      await stat(join(cel, z));
      throw new Error(`Wykryto zakazany element w eksporcie: ${z}`);
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
    }
  }
  const robots = await readFile(join(cel, 'robots.txt'), 'utf8');
  if (!robots.includes('Disallow: /')) throw new Error('robots.txt bez Disallow: /');
  await stat(join(cel, '.nojekyll'));

  async function skan(dir) {
    for (const e of await readdir(dir, { withFileTypes: true })) {
      if (e.name === '.git') continue;
      const p = join(dir, e.name);
      if (e.isDirectory()) await skan(p);
      else if (/\.(html|js|css|txt|md)$/i.test(e.name)) {
        const txt = await readFile(p, 'utf8');
        if (txt.includes('script.google.com') || txt.includes('AKfycby') || txt.includes('/api/wiadomosc')) {
          throw new Error(`Wykryto odwołanie do produkcyjnego API lub backendu w ${p}`);
        }
        if (e.name.endsWith('.html')) {
          if (!/<meta\s+name="robots"\s+content="noindex,\s*nofollow">/i.test(txt)) {
            throw new Error(`Brak meta noindex, nofollow w ${p}`);
          }
          if (/(href|src|action)=["']\//i.test(txt)) {
            throw new Error(`Wykryto bezwzględną ścieżkę root (/...) w ${p}`);
          }
        }
      }
    }
  }
  await skan(cel);
  console.log(`Zweryfikowano bezpieczny eksport: ${plikiHtml.length} stron HTML, brak CNAME/docs/tools/admin/Apps Script.`);
}

async function main() {
  if (CEL === SRC || CEL === resolve(SRC, '..', '..')) {
    throw new Error('Katalog docelowy nie może pokrywać się ze źródłem!');
  }

  await mkdir(CEL, { recursive: true });
  for (const wpis of await readdir(CEL, { withFileTypes: true })) {
    if (wpis.name === '.git') continue;
    await rm(join(CEL, wpis.name), { recursive: true, force: true });
  }

  const plikiHtml = (await readdir(SRC)).filter((f) => f.endsWith('.html')).sort();
  for (const plik of plikiHtml) {
    let html = await readFile(join(SRC, plik), 'utf8');

    if (/<meta\s+name=["']robots["'][^>]*>/i.test(html)) {
      html = html.replace(/<meta\s+name=["']robots["'][^>]*>/i,
        '<meta name="robots" content="noindex, nofollow">');
    } else {
      html = html.replace(/<\/head>/i,
        '<meta name="robots" content="noindex, nofollow">\n</head>');
    }

    html = html.replace(/\s*<script\s+src=["']admin\/panele\/dane\.js["']><\/script>\s*/gi,
      '\n<script src="data/podglad.js"></script>\n');
    html = html.replace(/\s*<script\s+src=["']admin\/edytor\.js["']><\/script>\s*/gi, '\n');

    if (plik === 'podstrona.html') {
      html = html.replace(/Utwórz własną podstronę w panelu admina lub wróć/,
        'Sprawdź adres lub wróć');
    }

    await writeFile(join(CEL, plik), html, 'utf8');
  }

  await cp(join(SRC, 'assets'), join(CEL, 'assets'), { recursive: true });
  await writeFile(join(CEL, 'assets', 'formularz.js'), STATYCZNY_FORMULARZ_JS, 'utf8');

  await mkdir(join(CEL, 'data'), { recursive: true });
  const rawDane = await readFile(join(SRC, 'data', 'dane.js'), 'utf8');
  const daneObj = zaladujWindowZmienna(rawDane, 'SYG_DANE');
  if (!daneObj || typeof daneObj !== 'object') {
    throw new Error('Nie udało się wczytać window.SYG_DANE z data/dane.js');
  }
  daneObj.api = {
    url: '',
    akcjaWiadomosc: 'wiadomosc',
    trybPodgladu: true
  };
  await writeFile(
    join(CEL, 'data', 'dane.js'),
    '/* Statyczny podgląd testowy Studio Sygnatura v2 (bez produkcyjnego API) */\nwindow.SYG_DANE = ' +
      JSON.stringify(daneObj, null, 2) + ';\n',
    'utf8'
  );

  let podgladObj = {};
  try {
    const rawPanelJs = await readFile(join(SRC, 'admin', 'panele', 'dane.js'), 'utf8');
    podgladObj = bezpieczneDanePodgladu(zaladujWindowZmienna(rawPanelJs, 'SYG_PANEL'));
  } catch (_) {
    podgladObj = {};
  }

  let podgladJson = JSON.stringify(podgladObj);
  const uploadDir = join(SRC, 'admin', 'panele', 'uploady');
  try {
    const st = await stat(uploadDir);
    if (st.isDirectory()) {
      const plikiUpload = await readdir(uploadDir);
      const uzyte = plikiUpload.filter((n) => podgladJson.includes('admin/panele/uploady/' + n));
      if (uzyte.length) {
        await mkdir(join(CEL, 'assets', 'img', 'uploady'), { recursive: true });
        for (const n of uzyte) {
          await cp(join(uploadDir, n), join(CEL, 'assets', 'img', 'uploady', n));
        }
        podgladJson = podgladJson.split('admin/panele/uploady/').join('assets/img/uploady/');
      }
    }
  } catch (_) {}

  await writeFile(
    join(CEL, 'data', 'podglad.js'),
    '/* Publiczne ustawienia podglądu (bez panelu i bez danych prywatnych) */\nwindow.SYG_PANEL = ' +
      podgladJson + ';\n',
    'utf8'
  );

  await writeFile(join(CEL, '.nojekyll'), '', 'utf8');
  await writeFile(join(CEL, 'robots.txt'), 'User-agent: *\nDisallow: /\n', 'utf8');
  await writeFile(
    join(CEL, 'README.md'),
    '# Studio Sygnatura v2 — podgląd statyczny\n\n' +
      'To jest automatycznie wyeksportowany, statyczny podgląd frontowy z katalogu ' +
      '`pracownia/www/v2/` repozytorium `maciejhaufa-dev/Sygnatura-v.2`.\n\n' +
      '- Wyłącznie statyczne pliki frontowe (HTML/CSS/JS/obrazy).\n' +
      '- Bez `CNAME`, bez indeksowania (`noindex, nofollow` + `robots.txt`).\n' +
      '- Formularz działa w trybie podglądu i nie wysyła zgłoszeń do produkcyjnego API.\n' +
      '- Produkcja (`studiosygnatura.pl`) pozostaje nietknięta w głównym repozytorium.\n',
    'utf8'
  );

  await zweryfikujEksport(CEL, plikiHtml);
  console.log(`Wyeksportowano statyczny podgląd do: ${CEL}`);
}

main().catch((err) => {
  console.error('BŁĄD EKSPORTU:', err);
  process.exit(1);
});
