/* ============================================================
   Studio Sygnatura v2 — TRYB EDYCJI NA ŻYWO (klik-w-element)

   Działa na stronie głównej i na KAŻDEJ podstronie:
   - klik w dowolny nagłówek, akapit, listę, kartę, box FAQ -> edycja
     treści z formatowaniem (B, I, link, nowa linia), wyrównaniem i ukryciem,
   - klik w dowolny przycisk / link / pozycję menu -> zmiana tekstu i linku,
   - klik w dowolne zdjęcie -> wgrywanie z urządzenia, biblioteka zdjęć,
     kadrowanie (X/Y) i przybliżenie (zoom),
   - klik w produkt lub realizację -> edycja ceny, kategorii, opisu,
     zdjęcia i widoczności,
   - klik w uchwyt „⚙ Sekcja” -> zmiana tła lub ukrycie sekcji.
   ============================================================ */
(function () {
  'use strict';

  const ADRES_API = window.SYG_API || (location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? (location.port === '8003' ? '' : 'http://' + location.hostname + ':8003')
    : '');

  const Q = new URLSearchParams(location.search);
  const KLUCZ = 'syg-edycja-wlaczona';
  const KLUCZ_TOKENU = 'syg-token';
  const POLA = window.SYG_POLA || {};
  const UI = window.SYG_UI || {};
  const D = window.SYG_DANE || {};

  let panel = null;
  let belka = null;
  let tryb = false;
  let stanSerwera = null;
  let aktywny = null;
  let trybEdycji = null; // 'pole' | 'syg' | 'produkt' | 'realizacja' | 'foto' | 'sekcja'
  let aktywnyKlucz = null;
  let produkt = null;
  let realizacja = null;

  const el = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- sesja (odporna na wycinanie nagłówków przez proxy) ---------- */
  function token() {
    try { const t = localStorage.getItem(KLUCZ_TOKENU); if (t) return t; } catch (_) {}
    try { const s = sessionStorage.getItem(KLUCZ_TOKENU); if (s) return s; } catch (_) {}
    return '';
  }
  function api(droga, opcje) {
    const o = Object.assign({ credentials: 'include' }, opcje || {});
    o.headers = Object.assign({}, o.headers || {});
    const t = token();
    if (t) {
      o.headers.Authorization = 'Bearer ' + t;
      o.headers['X-Syg-Token'] = t;
    }
    return fetch(ADRES_API + droga, o);
  }
  async function pobierzStan() {
    let odp = await api('/api/stan');
    const t = token();
    if (odp.status === 401 && t) {
      odp = await api('/api/stan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: t })
      });
    }
    return odp;
  }
  async function wyslijZapis(cialo) {
    const t = token();
    const payload = Object.assign({}, cialo);
    if (t) payload.token = t;
    const odp = await api('/api/zapisz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!odp.ok) {
      const d = await odp.json().catch(() => ({}));
      throw new Error(d.blad || 'Nie udało się zapisać.');
    }
    return odp.json();
  }

  function obrazDoDataUrl(plik) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onerror = () => reject(new Error('Nie udało się odczytać pliku zdjęcia.'));
      fr.onload = () => {
        if (typeof Image !== 'function') { resolve(String(fr.result)); return; }
        const img = new Image();
        img.onerror = () => resolve(String(fr.result));
        img.onload = () => {
          try {
            const max = 1600;
            const skala = Math.min(1, max / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round((img.naturalWidth || 800) * skala));
            canvas.height = Math.max(1, Math.round((img.naturalHeight || 600) * skala));
            const ctx = canvas.getContext('2d');
            if (!ctx) { resolve(String(fr.result)); return; }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          } catch (_) {
            resolve(String(fr.result));
          }
        };
        img.src = String(fr.result);
      };
      fr.readAsDataURL(plik);
    });
  }

  async function wgrajObraz(plik, nazwa) {
    const dataUrl = await obrazDoDataUrl(plik);
    const t = token();
    const cialo = { nazwa: nazwa || plik.name.replace(/\.[^.]+$/, ''), dataUrl };
    if (t) cialo.token = t;
    const odp = await api('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cialo)
    });
    const d = await odp.json().catch(() => ({}));
    if (!odp.ok || !d.ok) throw new Error(d.blad || 'Nie udało się wgrać zdjęcia.');
    if (stanSerwera) stanSerwera.media = d.media || stanSerwera.media;
    return d.sciezka;
  }

  function listaMediow(wybrana) {
    const mediaUpload = (stanSerwera && Array.isArray(stanSerwera.media)) ? stanSerwera.media : [];
    const obrazyStudia = (stanSerwera && stanSerwera.domyslne && Array.isArray(stanSerwera.domyslne.obrazyStudia))
      ? stanSerwera.domyslne.obrazyStudia : [];
    let html = '<option value="">— wybierz z biblioteki —</option>';
    if (mediaUpload.length) {
      html += '<optgroup label="Wgrane zdjęcia">' +
        mediaUpload.map((m) => `<option value="${esc(m.sciezka)}"${m.sciezka === wybrana ? ' selected' : ''}>${esc(m.nazwa || m.sciezka)}</option>`).join('') +
        '</optgroup>';
    }
    if (obrazyStudia.length) {
      html += '<optgroup label="Zdjęcia pracowni">' +
        obrazyStudia.map((s) => `<option value="${esc(s)}"${s === wybrana ? ' selected' : ''}>${esc(s.replace('assets/img/', ''))}</option>`).join('') +
        '</optgroup>';
    }
    return html;
  }

  function listaStronOpcje(aktualna) {
    const strony = [
      ['index.html', 'Strona główna'],
      ['sklep.html', 'Sklep'],
      ['realizacje.html', 'Realizacje'],
      ['pracownia.html', 'Pracownia i technika'],
      ['wspolpraca.html', 'Współpraca i okazje'],
      ['kontakt.html', 'Kontakt i FAQ'],
      ['kontakt.html#faq', 'Kontakt → sekcja FAQ'],
      ['szukaj.html', 'Wyszukiwarka'],
      ['koszyk.html', 'Koszyk'],
      ['konto.html', 'Moje konto']
    ];
    const wlasne = (stanSerwera && Array.isArray(stanSerwera.podstrony_wlasne)) ? stanSerwera.podstrony_wlasne : [];
    wlasne.forEach((s) => {
      if (s && s.slug) strony.push(['podstrona.html?s=' + encodeURIComponent(s.slug), 'Podstrona: ' + (s.tytul || s.slug)]);
    });
    return '<option value="">— szybki wybór strony —</option>' +
      strony.map(([href, tyt]) => `<option value="${esc(href)}"${href === aktualna ? ' selected' : ''}>${esc(tyt)} (${esc(href)})</option>`).join('');
  }

  function komunikat(tekst, blad) {
    const s = el('#syg-status');
    if (!s) return;
    s.textContent = tekst || '';
    s.style.color = blad ? '#F2A08C' : '#DCC39A';
  }

  function odswiezPoZapisie(wersja) {
    setTimeout(() => {
      const u = new URL(location.href);
      u.searchParams.set('wersja', String(wersja || Date.now()));
      location.href = u.toString();
    }, 380);
  }

  /* ---------- belka górna trybu edycji ---------- */
  function nazwyStron() {
    const mapa = {
      'index.html': 'Strona główna',
      'sklep.html': 'Sklep',
      'produkt.html': 'Karta produktu',
      'realizacje.html': 'Realizacje',
      'pracownia.html': 'Pracownia',
      'wspolpraca.html': 'Współpraca',
      'kontakt.html': 'Kontakt i FAQ',
      'szukaj.html': 'Szukaj',
      'koszyk.html': 'Koszyk',
      'konto.html': 'Moje konto',
      '404.html': 'Strona 404',
      'podstrona.html': 'Własna podstrona'
    };
    const biezaca = UI.biezaca || (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    return { biezaca, tytul: mapa[biezaca] || biezaca };
  }

  function zbudujBelke() {
    if (belka) return belka;
    const info = nazwyStron();
    const stronyLista = [
      ['index.html', 'Strona główna'],
      ['sklep.html', 'Sklep'],
      ['realizacje.html', 'Realizacje'],
      ['pracownia.html', 'Pracownia'],
      ['wspolpraca.html', 'Współpraca'],
      ['kontakt.html', 'Kontakt'],
      ['produkt.html?id=katalog-1', 'Produkt (przykład)'],
      ['koszyk.html', 'Koszyk'],
      ['konto.html', 'Moje konto'],
      ['szukaj.html', 'Szukaj'],
      ['404.html', '404']
    ];
    const wlasne = (stanSerwera && Array.isArray(stanSerwera.podstrony_wlasne)) ? stanSerwera.podstrony_wlasne : [];
    wlasne.forEach((s) => {
      if (s && s.slug) stronyLista.push(['podstrona.html?s=' + encodeURIComponent(s.slug), '📄 ' + (s.tytul || s.slug)]);
    });

    belka = document.createElement('div');
    belka.id = 'syg-belka';
    belka.hidden = true;
    belka.innerHTML = `
      <span class="syg-belka-tytul">✎ Tryb edycji<small>${esc(info.tytul)}</small></span>
      <select class="syg-belka-nav" id="syg-skok-strona" aria-label="Przejdź do innej podstrony w trybie edycji">
        <option value="">Przejdź na podstronę…</option>
        ${stronyLista.map(([u, t]) => `<option value="${esc(u)}">${esc(t)}</option>`).join('')}
      </select>
      <div class="syg-belka-akcje">
        <a class="syg-belka-btn" href="${esc(ADRES_API ? ADRES_API + '/admin/' : 'admin/')}">⚙ Pełny panel</a>
        <button type="button" class="syg-belka-btn zloty" id="syg-belka-koniec">✕ Zakończ</button>
      </div>`;
    document.body.appendChild(belka);

    belka.querySelector('#syg-skok-strona').addEventListener('change', (e) => {
      const cel = e.target.value;
      if (!cel) return;
      const u = new URL(cel, location.href);
      u.searchParams.set('edycja', '1');
      location.href = u.toString();
    });
    belka.querySelector('#syg-belka-koniec').addEventListener('click', () => wlacz(false));
    return belka;
  }

  /* ---------- panel dolny ---------- */
  function zbudujPanel() {
    if (panel) return panel;
    panel = document.createElement('div');
    panel.id = 'syg-panel';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Edycja strony');
    document.body.appendChild(panel);
    return panel;
  }

  function zamknijPanel() {
    if (aktywny) aktywny.classList.remove('syg-edycja-aktywny');
    if (!panel) return;
    panel.hidden = true;
    panel.innerHTML = '';
    aktywny = null;
    trybEdycji = null;
    aktywnyKlucz = null;
    produkt = null;
    realizacja = null;
  }

  function wstawTag(pole, tagOtw, tagZam) {
    const start = pole.selectionStart || 0;
    const end = pole.selectionEnd || 0;
    const val = pole.value;
    const zazn = val.slice(start, end) || 'tekst';
    pole.value = val.slice(0, start) + tagOtw + zazn + tagZam + val.slice(end);
    pole.focus();
    pole.setSelectionRange(start + tagOtw.length, start + tagOtw.length + zazn.length);
  }

  /* ---------- edycja pola [data-pole] ---------- */
  function otworzPole(element, klucz) {
    zamknijPanel();
    aktywny = element;
    aktywny.classList.add('syg-edycja-aktywny');
    trybEdycji = 'pole';
    aktywnyKlucz = klucz;
    const p = POLA[klucz] || { etykieta: klucz, typ: 'krotkie' };

    let wartosc = '';
    if (klucz === 'hero_tytul' || klucz === 'hero_lead') {
      wartosc = element.innerHTML.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
    } else if (klucz === 'hero_przycisk') {
      const klon = element.cloneNode(true);
      klon.querySelectorAll('svg').forEach((s) => s.remove());
      wartosc = klon.textContent.trim();
    } else if (klucz === 'telefon') {
      const b = element.querySelector('b');
      wartosc = (b ? b.textContent : element.textContent).trim();
    } else if (['fb', 'ig', 'pin', 'youtube'].includes(klucz)) {
      wartosc = element.tagName === 'A' ? (element.getAttribute('href') || '') : '';
    } else {
      wartosc = element.textContent.trim();
    }

    const wielo = p.typ === 'wielo';
    const jestPrzycisk = p.typ === 'przycisk';
    const aktLink = element.tagName === 'A' ? (element.getAttribute('href') || 'sklep.html') : '';

    zbudujPanel().innerHTML = `
      <div class="syg-wiersz">
        <span class="syg-etykieta">Edytujesz<b>${esc(p.etykieta)}</b></span>
        <button type="button" class="syg-b poboczny" data-zamknij>Zamknij</button>
      </div>
      ${wielo
        ? `<textarea id="syg-wartosc" rows="3" aria-label="${esc(p.etykieta)}">${esc(wartosc)}</textarea>`
        : `<input id="syg-wartosc" type="text" value="${esc(wartosc)}" aria-label="${esc(p.etykieta)}">`}
      ${jestPrzycisk ? `
        <div class="syg-siatka-2">
          <div>
            <label class="syg-podpowiedz" for="syg-pole-link">Adres docelowy przycisku</label>
            <input id="syg-pole-link" type="text" value="${esc(aktLink)}" placeholder="np. sklep.html">
          </div>
          <div>
            <label class="syg-podpowiedz" for="syg-wybor-strony">Lub wybierz podstronę</label>
            <select id="syg-wybor-strony">${listaStronOpcje(aktLink)}</select>
          </div>
        </div>` : ''}
      ${wielo ? '<p class="syg-podpowiedz">Enter przechodzi do nowej linii — tak będzie łamany tekst na stronie.</p>' : ''}
      <div class="syg-przyciski">
        <button type="button" class="syg-b glowny" data-zapisz>Zapisz</button>
        <button type="button" class="syg-b poboczny" data-zamknij>Anuluj</button>
      </div>
      <div class="syg-status" id="syg-status" role="status" aria-live="polite"></div>`;
    panel.hidden = false;

    const wybor = el('#syg-wybor-strony');
    if (wybor) wybor.addEventListener('change', () => { if (wybor.value) el('#syg-pole-link').value = wybor.value; });

    const pole = el('#syg-wartosc');
    if (wielo) {
      pole.style.height = 'auto';
      pole.style.height = Math.min(200, pole.scrollHeight + 4) + 'px';
    }
    pole.focus();
    if (!wielo) pole.select();
    else pole.setSelectionRange(pole.value.length, pole.value.length);
  }

  /* ---------- edycja dowolnego elementu [data-syg-id] ---------- */
  function otworzElementSyg(element, id) {
    zamknijPanel();
    aktywny = element;
    aktywny.classList.add('syg-edycja-aktywny');
    trybEdycji = 'syg';
    aktywnyKlucz = id;

    const ov = (stanSerwera && stanSerwera.elementy && stanSerwera.elementy[id]) || {};
    const jestLink = element.tagName === 'A';
    const klon = element.cloneNode(true);
    klon.querySelectorAll('svg,.syg-sekcja-uchwyt').forEach((s) => s.remove());
    const wartoscHtml = ov.html != null ? ov.html : klon.innerHTML.replace(/<br\s*\/?>/gi, '\n').trim();
    const aktHref = jestLink ? (element.getAttribute('href') || '') : '';

    zbudujPanel().innerHTML = `
      <div class="syg-wiersz">
        <span class="syg-etykieta">Edytujesz element strony<b>${esc(id)}${jestLink ? ' (przycisk / link)' : ''}</b></span>
        <button type="button" class="syg-b poboczny" data-zamknij>Zamknij</button>
      </div>
      <div class="syg-format" aria-label="Formatowanie tekstu">
        <button type="button" class="syg-fbtn" data-fmt="b" title="Pogrubienie"><b>B</b></button>
        <button type="button" class="syg-fbtn" data-fmt="i" title="Kursywa"><i>I</i></button>
        <button type="button" class="syg-fbtn" data-fmt="link" title="Wstaw link">🔗 Link</button>
        <button type="button" class="syg-fbtn" data-fmt="br" title="Nowa linia">↵ Nowa linia</button>
      </div>
      <textarea id="syg-wartosc" rows="4" aria-label="Treść elementu">${esc(wartoscHtml)}</textarea>
      ${jestLink ? `
        <div class="syg-siatka-2">
          <div>
            <label class="syg-podpowiedz" for="syg-syg-href">Link (dokąd prowadzi)</label>
            <input id="syg-syg-href" type="text" value="${esc(aktHref)}" placeholder="np. kontakt.html">
          </div>
          <div>
            <label class="syg-podpowiedz" for="syg-wybor-strony">Szybki wybór strony</label>
            <select id="syg-wybor-strony">${listaStronOpcje(aktHref)}</select>
          </div>
        </div>` : `
        <div class="syg-siatka-2">
          <div>
            <label class="syg-podpowiedz" for="syg-syg-wyr">Wyrównanie tekstu</label>
            <select id="syg-syg-wyr">
              <option value=""${!ov.wyr ? ' selected' : ''}>Domyślne</option>
              <option value="left"${ov.wyr === 'left' ? ' selected' : ''}>Do lewej</option>
              <option value="center"${ov.wyr === 'center' ? ' selected' : ''}>Wyśrodkuj</option>
              <option value="right"${ov.wyr === 'right' ? ' selected' : ''}>Do prawej</option>
            </select>
          </div>
          <div>
            <label class="syg-podpowiedz" for="syg-syg-skala">Rozmiar pisma (%)</label>
            <input id="syg-syg-skala" type="number" min="75" max="160" step="5" value="${ov.skala || 100}">
          </div>
        </div>`}
      <label class="syg-check">
        <input type="checkbox" id="syg-syg-ukryty"${ov.ukryty ? ' checked' : ''}> Ukryj ten element na stronie
      </label>
      <div class="syg-przyciski">
        <button type="button" class="syg-b glowny" data-zapisz-syg>Zapisz</button>
        <button type="button" class="syg-b poboczny" data-cofnij-syg>Przywróć oryginał</button>
        ${jestLink && aktHref ? `<a class="syg-b poboczny" style="text-decoration:none" href="${esc(aktHref + (aktHref.includes('?') ? '&' : '?') + 'edycja=1')}">Otwórz link →</a>` : ''}
        <button type="button" class="syg-b poboczny" data-zamknij>Anuluj</button>
      </div>
      <div class="syg-status" id="syg-status" role="status" aria-live="polite"></div>`;
    panel.hidden = false;

    const wybor = el('#syg-wybor-strony');
    if (wybor) wybor.addEventListener('change', () => { if (wybor.value) el('#syg-syg-href').value = wybor.value; });
    el('#syg-wartosc').focus();
  }

  /* ---------- edycja zdjęcia (img) ---------- */
  function otworzZdjecie(element, id) {
    zamknijPanel();
    aktywny = element;
    aktywny.classList.add('syg-edycja-aktywny');
    trybEdycji = 'foto';
    aktywnyKlucz = id;

    const ov = (stanSerwera && stanSerwera.elementy && stanSerwera.elementy[id]) || {};
    const jestHeroFoto = (id === 'index.img.0');
    const sg = (stanSerwera && stanSerwera.stronaGlowna) || {};
    const aktSrc = ov.src || (jestHeroFoto && sg.hero_foto) || element.getAttribute('src') || '';
    const aktAlt = ov.alt != null ? ov.alt : (element.getAttribute('alt') || '');
    const zoom = ov.zoom != null ? Number(ov.zoom) : (jestHeroFoto && sg.hero_foto_zoom ? Number(sg.hero_foto_zoom) : 100);
    const x = ov.x != null ? Number(ov.x) : (jestHeroFoto && sg.hero_foto_x != null ? Number(sg.hero_foto_x) : 50);
    const y = ov.y != null ? Number(ov.y) : (jestHeroFoto && sg.hero_foto_y != null ? Number(sg.hero_foto_y) : 50);

    zbudujPanel().innerHTML = `
      <div class="syg-wiersz">
        <span class="syg-etykieta">Edytujesz zdjęcie<b>${esc(id)}</b></span>
        <button type="button" class="syg-b poboczny" data-zamknij>Zamknij</button>
      </div>
      <div class="syg-foto-podglad">
        <img id="syg-foto-mini" src="${esc(aktSrc)}" alt="">
        <div style="flex:1;min-width:0;display:grid;gap:8px">
          <label class="syg-b poboczny" style="display:inline-flex;align-items:center;justify-content:center;width:fit-content">
            + Wgraj zdjęcie z urządzenia
            <input type="file" id="syg-foto-plik" accept="image/*" style="display:none">
          </label>
          <select id="syg-foto-bib" aria-label="Wybierz zdjęcie z biblioteki">${listaMediow(aktSrc)}</select>
        </div>
      </div>
      <div>
        <label class="syg-podpowiedz" for="syg-foto-src">Ścieżka pliku zdjęcia</label>
        <input id="syg-foto-src" type="text" value="${esc(aktSrc)}">
      </div>
      <div>
        <label class="syg-podpowiedz" for="syg-foto-alt">Opis zdjęcia (alt)</label>
        <input id="syg-foto-alt" type="text" value="${esc(aktAlt)}">
      </div>
      <div class="syg-siatka-3">
        <label class="syg-suwak">Powiększenie: <b id="syg-foto-zoom-val">${zoom}%</b>
          <input type="range" id="syg-foto-zoom" min="50" max="200" step="5" value="${zoom}">
        </label>
        <label class="syg-suwak">Kadr poziom (X): <b id="syg-foto-x-val">${x}%</b>
          <input type="range" id="syg-foto-x" min="0" max="100" step="1" value="${x}">
        </label>
        <label class="syg-suwak">Kadr pion (Y): <b id="syg-foto-y-val">${y}%</b>
          <input type="range" id="syg-foto-y" min="0" max="100" step="1" value="${y}">
        </label>
      </div>
      <label class="syg-check">
        <input type="checkbox" id="syg-foto-ukryty"${ov.ukryty ? ' checked' : ''}> Ukryj zdjęcie na stronie
      </label>
      <div class="syg-przyciski">
        <button type="button" class="syg-b glowny" data-zapisz-foto>Zapisz zdjęcie</button>
        <button type="button" class="syg-b poboczny" data-cofnij-syg>Przywróć oryginał</button>
        <button type="button" class="syg-b poboczny" data-zamknij>Anuluj</button>
      </div>
      <div class="syg-status" id="syg-status" role="status" aria-live="polite"></div>`;
    panel.hidden = false;

    const podgladNaZywo = () => {
      const zv = Number(el('#syg-foto-zoom').value) || 100;
      const xv = Number(el('#syg-foto-x').value);
      const yv = Number(el('#syg-foto-y').value);
      el('#syg-foto-zoom-val').textContent = zv + '%';
      el('#syg-foto-x-val').textContent = xv + '%';
      el('#syg-foto-y-val').textContent = yv + '%';
      if (element.parentElement) element.parentElement.style.overflow = 'hidden';
      element.style.objectFit = 'cover';
      element.style.objectPosition = `${xv}% ${yv}%`;
      element.style.transform = zv !== 100 ? `scale(${(zv / 100).toFixed(2)})` : '';
    };
    ['#syg-foto-zoom', '#syg-foto-x', '#syg-foto-y'].forEach((s) => el(s).addEventListener('input', podgladNaZywo));

    el('#syg-foto-bib').addEventListener('change', () => {
      const v = el('#syg-foto-bib').value;
      if (!v) return;
      el('#syg-foto-src').value = v;
      el('#syg-foto-mini').src = v;
      element.src = v;
      element.removeAttribute('srcset');
    });

    el('#syg-foto-plik').addEventListener('change', async (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      komunikat('Wgrywam zdjęcie na serwer…');
      try {
        const sciezka = await wgrajObraz(f, id.replace(/\./g, '-'));
        el('#syg-foto-src').value = sciezka;
        el('#syg-foto-mini').src = sciezka;
        element.src = sciezka;
        element.removeAttribute('srcset');
        el('#syg-foto-bib').innerHTML = listaMediow(sciezka);
        komunikat('Zdjęcie wgrane! Kliknij „Zapisz zdjęcie”, aby zapamiętać je w tej sekcji.');
      } catch (err) {
        komunikat(err.message, true);
      }
    });
  }

  /* ---------- edycja sekcji (tło + widoczność) ---------- */
  function otworzSekcje(element, id) {
    zamknijPanel();
    aktywny = element;
    aktywny.classList.add('syg-edycja-aktywny');
    trybEdycji = 'sekcja';
    aktywnyKlucz = id;

    const ov = (stanSerwera && stanSerwera.elementy && stanSerwera.elementy[id]) || {};
    zbudujPanel().innerHTML = `
      <div class="syg-wiersz">
        <span class="syg-etykieta">Ustawienia sekcji<b>${esc(id)}</b></span>
        <button type="button" class="syg-b poboczny" data-zamknij>Zamknij</button>
      </div>
      <div>
        <label class="syg-podpowiedz" for="syg-sec-tlo">Wariant tła sekcji</label>
        <select id="syg-sec-tlo">
          <option value=""${!ov.tlo ? ' selected' : ''}>Domyślne</option>
          <option value="jasne"${ov.tlo === 'jasne' ? ' selected' : ''}>Jasne (papier)</option>
          <option value="krem"${ov.tlo === 'krem' ? ' selected' : ''}>Kremowe (wyróżnione)</option>
          <option value="ciemne"${ov.tlo === 'ciemne' ? ' selected' : ''}>Ciemna zieleń pracowni</option>
        </select>
      </div>
      <label class="syg-check">
        <input type="checkbox" id="syg-sec-ukryty"${ov.ukryty ? ' checked' : ''}> Ukryj całą sekcję na stronie
      </label>
      <div class="syg-przyciski">
        <button type="button" class="syg-b glowny" data-zapisz-sekcja>Zapisz sekcję</button>
        <button type="button" class="syg-b poboczny" data-cofnij-syg>Przywróć domyślną</button>
        <button type="button" class="syg-b poboczny" data-zamknij>Anuluj</button>
      </div>
      <div class="syg-status" id="syg-status" role="status" aria-live="polite"></div>`;
    panel.hidden = false;
  }

  /* ---------- edycja produktu (karta na stronie) ---------- */
  async function otworzProdukt(element, id) {
    zamknijPanel();
    aktywny = element;
    aktywny.classList.add('syg-edycja-aktywny');
    trybEdycji = 'produkt';
    produkt = { id };
    zbudujPanel().innerHTML = `<div class="syg-status" id="syg-status">Wczytuję produkt…</div>`;
    panel.hidden = false;

    try {
      const odp = await pobierzStan();
      if (odp.ok) stanSerwera = await odp.json();
    } catch (_) {}

    const wgPanelu = (stanSerwera && Array.isArray(stanSerwera.produkty) ? stanSerwera.produkty : []).find((p) => p.id === id);
    const wgBazy = (D.produkty || []).find((p) => p.id === id);
    const d = wgPanelu ? { ...wgBazy, ...wgPanelu } : wgBazy;

    if (!d) {
      panel.innerHTML = `
        <div class="syg-wiersz"><span class="syg-etykieta">Ten produkt<b>nie został odnaleziony</b></span>
        <button type="button" class="syg-b poboczny" data-zamknij>Zamknij</button></div>
        <div class="syg-status" id="syg-status">Otwórz zakładkę „Produkty” w pełnym panelu.</div>`;
      return;
    }
    produkt = d;

    panel.innerHTML = `
      <div class="syg-wiersz">
        <span class="syg-etykieta">Edytujesz produkt<b>${esc(d.nazwa || 'Bez nazwy')}</b></span>
        <button type="button" class="syg-b poboczny" data-zamknij>Zamknij</button>
      </div>
      <label class="syg-podpowiedz" for="syg-prod-nazwa">Nazwa</label>
      <input id="syg-prod-nazwa" type="text" value="${esc(d.nazwa || '')}">
      <div class="syg-siatka-3">
        <div>
          <label class="syg-podpowiedz" for="syg-prod-cena">Cena (zł)</label>
          <input id="syg-prod-cena" type="number" inputmode="decimal" min="0" step="1"
                 value="${d.cena != null ? esc(d.cena) : ''}" placeholder="249">
        </div>
        <div>
          <label class="syg-podpowiedz" for="syg-prod-jedn">Jednostka</label>
          <input id="syg-prod-jedn" type="text" value="${esc(d.jednostka || 'szt.')}" placeholder="szt.">
        </div>
        <div>
          <label class="syg-podpowiedz" for="syg-prod-kat">Kategoria</label>
          <input id="syg-prod-kat" type="text" value="${esc(d.kategoria || '')}">
        </div>
      </div>
      <label class="syg-podpowiedz" for="syg-prod-opis">Opis</label>
      <textarea id="syg-prod-opis" rows="3">${esc(d.opis || '')}</textarea>
      <div class="syg-foto-podglad">
        <img id="syg-prod-mini" src="${esc(d.fotoMala || d.foto || 'assets/img/prod-szopka-420.jpg')}" alt="">
        <div style="flex:1;min-width:0;display:grid;gap:6px">
          <label class="syg-b poboczny" style="display:inline-flex;align-items:center;justify-content:center;width:fit-content">
            + Wgraj zdjęcie produktu
            <input type="file" id="syg-prod-plik" accept="image/*" style="display:none">
          </label>
          <select id="syg-prod-bib" aria-label="Zdjęcie produktu z biblioteki">${listaMediow(d.foto || '')}</select>
          <input id="syg-prod-foto" type="text" value="${esc(d.foto || '')}" placeholder="Ścieżka zdjęcia">
        </div>
      </div>
      <label class="syg-check">
        <input type="checkbox" id="syg-prod-dost"${d.dostepny !== false ? ' checked' : ''}> Widoczny w sklepie
      </label>
      <div class="syg-przyciski">
        <button type="button" class="syg-b glowny" data-zapisz-produkt>Zapisz</button>
        <a class="syg-b poboczny" style="text-decoration:none" href="${esc(ADRES_API ? ADRES_API + '/admin/#produkty' : 'admin/#produkty')}">Więcej opcji w Panelu</a>
        <button type="button" class="syg-b poboczny" data-zamknij>Anuluj</button>
      </div>
      <div class="syg-status" id="syg-status" role="status" aria-live="polite"></div>`;

    el('#syg-prod-bib').addEventListener('change', () => {
      const v = el('#syg-prod-bib').value;
      if (!v) return;
      el('#syg-prod-foto').value = v;
      el('#syg-prod-mini').src = v;
    });
    el('#syg-prod-plik').addEventListener('change', async (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      komunikat('Wgrywam zdjęcie produktu…');
      try {
        const sc = await wgrajObraz(f, 'prod-' + (d.id || 'nowy'));
        el('#syg-prod-foto').value = sc;
        el('#syg-prod-mini').src = sc;
        el('#syg-prod-bib').innerHTML = listaMediow(sc);
        komunikat('Zdjęcie wgrane! Kliknij „Zapisz”, aby przypisać do produktu.');
      } catch (err) {
        komunikat(err.message, true);
      }
    });
    el('#syg-prod-nazwa').focus();
  }

  /* ---------- edycja realizacji (.rcard) ---------- */
  async function otworzRealizacje(element, id) {
    zamknijPanel();
    aktywny = element;
    aktywny.classList.add('syg-edycja-aktywny');
    trybEdycji = 'realizacja';
    const r = (D.realizacje || []).find((x) => String(x.id) === String(id));
    if (!r) return;
    realizacja = r;

    zbudujPanel().innerHTML = `
      <div class="syg-wiersz">
        <span class="syg-etykieta">Edytujesz realizację<b>${esc(r.tytul)}</b></span>
        <button type="button" class="syg-b poboczny" data-zamknij>Zamknij</button>
      </div>
      <label class="syg-podpowiedz" for="syg-real-tytul">Tytuł realizacji</label>
      <input id="syg-real-tytul" type="text" value="${esc(r.tytul || '')}">
      <div class="syg-siatka-2">
        <div>
          <label class="syg-podpowiedz" for="syg-real-kat">Kategoria</label>
          <input id="syg-real-kat" type="text" value="${esc(r.kategoria || '')}">
        </div>
        <div>
          <label class="syg-podpowiedz" for="syg-real-data">Data</label>
          <input id="syg-real-data" type="text" value="${esc(r.data || '')}" placeholder="RRRR-MM-DD">
        </div>
      </div>
      <label class="syg-podpowiedz" for="syg-real-opis">Opis</label>
      <textarea id="syg-real-opis" rows="3">${esc(r.opis || '')}</textarea>
      <div class="syg-foto-podglad">
        <img id="syg-real-mini" src="${esc(r.foto || 'assets/img/real-krzyzowka-620.jpg')}" alt="">
        <div style="flex:1;min-width:0;display:grid;gap:6px">
          <label class="syg-b poboczny" style="display:inline-flex;align-items:center;justify-content:center;width:fit-content">
            + Wgraj zdjęcie realizacji
            <input type="file" id="syg-real-plik" accept="image/*" style="display:none">
          </label>
          <select id="syg-real-bib" aria-label="Zdjęcie realizacji z biblioteki">${listaMediow(r.foto || '')}</select>
          <input id="syg-real-foto" type="text" value="${esc(r.foto || '')}">
        </div>
      </div>
      <label class="syg-check">
        <input type="checkbox" id="syg-real-wid"${r.widoczna !== false ? ' checked' : ''}> Widoczna na stronie „Realizacje”
      </label>
      <div class="syg-przyciski">
        <button type="button" class="syg-b glowny" data-zapisz-real>Zapisz realizację</button>
        <a class="syg-b poboczny" style="text-decoration:none" href="${esc(ADRES_API ? ADRES_API + '/admin/#realizacje' : 'admin/#realizacje')}">Zarządzaj wszystkimi w Panelu</a>
        <button type="button" class="syg-b poboczny" data-zamknij>Anuluj</button>
      </div>
      <div class="syg-status" id="syg-status" role="status" aria-live="polite"></div>`;
    panel.hidden = false;

    el('#syg-real-bib').addEventListener('change', () => {
      const v = el('#syg-real-bib').value;
      if (!v) return;
      el('#syg-real-foto').value = v;
      el('#syg-real-mini').src = v;
    });
    el('#syg-real-plik').addEventListener('change', async (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      komunikat('Wgrywam zdjęcie realizacji…');
      try {
        const sc = await wgrajObraz(f, 'real-' + r.id);
        el('#syg-real-foto').value = sc;
        el('#syg-real-mini').src = sc;
        el('#syg-real-bib').innerHTML = listaMediow(sc);
        komunikat('Zdjęcie wgrane! Kliknij „Zapisz realizację”.');
      } catch (err) {
        komunikat(err.message, true);
      }
    });
  }

  /* ---------- obsługa kliknięć w panelu ---------- */
  document.addEventListener('click', async (e) => {
    if (!panel || panel.hidden) return;
    if (e.target.closest('[data-zamknij]')) { zamknijPanel(); return; }

    const fmtBtn = e.target.closest('[data-fmt]');
    if (fmtBtn) {
      const pole = el('#syg-wartosc');
      if (!pole) return;
      const typ = fmtBtn.getAttribute('data-fmt');
      if (typ === 'b') wstawTag(pole, '<b>', '</b>');
      if (typ === 'i') wstawTag(pole, '<i>', '</i>');
      if (typ === 'br') wstawTag(pole, '<br>', '');
      if (typ === 'link') {
        const adres = prompt('Adres linku (np. sklep.html lub https://...):', 'sklep.html');
        if (adres) wstawTag(pole, `<a href="${esc(adres)}">`, '</a>');
      }
      return;
    }

    if (e.target.closest('[data-zapisz]')) {
      const pole = el('#syg-wartosc');
      if (!pole || !aktywnyKlucz) return;
      const przycisk = e.target.closest('[data-zapisz]');
      przycisk.disabled = true;
      komunikat('Zapisuję…');
      try {
        const val = pole.value.trim();
        const ustawienia = { [aktywnyKlucz]: val };
        const stronaGlowna = {};
        if (['hero_tytul', 'hero_lead', 'hero_przycisk', 'sekcja_tytul'].includes(aktywnyKlucz)) {
          stronaGlowna[aktywnyKlucz] = val;
        }
        const linkEl = el('#syg-pole-link');
        if (linkEl && aktywnyKlucz === 'hero_przycisk') {
          stronaGlowna.hero_link = linkEl.value.trim() || 'sklep.html';
        }
        const payload = { ustawienia, opisZmiany: 'Edycja na stronie: ' + aktywnyKlucz };
        if (Object.keys(stronaGlowna).length) payload.stronaGlowna = stronaGlowna;
        const wynik = await wyslijZapis(payload);
        komunikat('Zapisane ✓ Odświeżam stronę…');
        odswiezPoZapisie(wynik.wersja);
      } catch (err) {
        przycisk.disabled = false;
        komunikat(err.message, true);
      }
      return;
    }

    if (e.target.closest('[data-zapisz-syg]')) {
      const przycisk = e.target.closest('[data-zapisz-syg]');
      przycisk.disabled = true;
      komunikat('Zapisuję element…');
      try {
        const html = el('#syg-wartosc').value.trim();
        const zapis = {
          html,
          ukryty: !!el('#syg-syg-ukryty').checked
        };
        const hrefEl = el('#syg-syg-href');
        if (hrefEl) zapis.href = hrefEl.value.trim();
        const wyrEl = el('#syg-syg-wyr');
        if (wyrEl && wyrEl.value) zapis.wyr = wyrEl.value;
        const skalaEl = el('#syg-syg-skala');
        if (skalaEl && Number(skalaEl.value) !== 100) zapis.skala = Number(skalaEl.value);

        const wynik = await wyslijZapis({
          elementy: { [aktywnyKlucz]: zapis },
          opisZmiany: 'Edycja elementu ' + aktywnyKlucz
        });
        komunikat('Zapisane ✓ Odświeżam stronę…');
        odswiezPoZapisie(wynik.wersja);
      } catch (err) {
        przycisk.disabled = false;
        komunikat(err.message, true);
      }
      return;
    }

    if (e.target.closest('[data-zapisz-foto]')) {
      const przycisk = e.target.closest('[data-zapisz-foto]');
      przycisk.disabled = true;
      komunikat('Zapisuję zdjęcie…');
      try {
        const src = el('#syg-foto-src').value.trim();
        const alt = el('#syg-foto-alt').value.trim();
        const zoom = Number(el('#syg-foto-zoom').value) || 100;
        const x = Number(el('#syg-foto-x').value);
        const y = Number(el('#syg-foto-y').value);
        const ukryty = !!el('#syg-foto-ukryty').checked;
        const payload = {
          elementy: { [aktywnyKlucz]: { src, alt, zoom, x, y, ukryty } },
          opisZmiany: 'Zmiana zdjęcia ' + aktywnyKlucz
        };
        if (aktywnyKlucz === 'index.img.0') {
          payload.stronaGlowna = { hero_foto: src, hero_foto_zoom: zoom, hero_foto_x: x, hero_foto_y: y };
        }
        const wynik = await wyslijZapis(payload);
        komunikat('Zapisane ✓ Odświeżam stronę…');
        odswiezPoZapisie(wynik.wersja);
      } catch (err) {
        przycisk.disabled = false;
        komunikat(err.message, true);
      }
      return;
    }

    if (e.target.closest('[data-zapisz-sekcja]')) {
      const przycisk = e.target.closest('[data-zapisz-sekcja]');
      przycisk.disabled = true;
      komunikat('Zapisuję ustawienia sekcji…');
      try {
        const tlo = el('#syg-sec-tlo').value;
        const ukryty = !!el('#syg-sec-ukryty').checked;
        const wynik = await wyslijZapis({
          elementy: { [aktywnyKlucz]: { tlo, ukryty } },
          opisZmiany: 'Sekcja ' + aktywnyKlucz
        });
        komunikat('Zapisane ✓ Odświeżam stronę…');
        odswiezPoZapisie(wynik.wersja);
      } catch (err) {
        przycisk.disabled = false;
        komunikat(err.message, true);
      }
      return;
    }

    if (e.target.closest('[data-cofnij-syg]')) {
      if (!aktywnyKlucz) return;
      const przycisk = e.target.closest('[data-cofnij-syg]');
      przycisk.disabled = true;
      komunikat('Przywracam oryginał…');
      try {
        const payload = { elementy: { [aktywnyKlucz]: null }, opisZmiany: 'Przywrócenie ' + aktywnyKlucz };
        if (aktywnyKlucz === 'index.img.0') {
          payload.stronaGlowna = {
            hero_foto: 'assets/img/hero-szyld-1600.jpg',
            hero_foto_zoom: 100, hero_foto_x: 50, hero_foto_y: 50
          };
        }
        const wynik = await wyslijZapis(payload);
        komunikat('Przywrócono ✓ Odświeżam stronę…');
        odswiezPoZapisie(wynik.wersja);
      } catch (err) {
        przycisk.disabled = false;
        komunikat(err.message, true);
      }
      return;
    }

    if (e.target.closest('[data-zapisz-produkt]')) {
      const przycisk = e.target.closest('[data-zapisz-produkt]');
      przycisk.disabled = true;
      komunikat('Zapisuję produkt…');
      const cena = el('#syg-prod-cena').value;
      const foto = el('#syg-prod-foto') ? el('#syg-prod-foto').value.trim() : undefined;
      try {
        const zmian = {
          id: produkt.id,
          nazwa: el('#syg-prod-nazwa').value.trim(),
          cena: cena === '' ? null : Number(cena),
          opis: el('#syg-prod-opis').value.trim()
        };
        if (el('#syg-prod-jedn')) zmian.jednostka = el('#syg-prod-jedn').value.trim() || 'szt.';
        if (el('#syg-prod-kat')) zmian.kategoria = el('#syg-prod-kat').value.trim();
        if (el('#syg-prod-dost')) zmian.dostepny = el('#syg-prod-dost').checked;
        if (foto) { zmian.foto = foto; zmian.fotoMala = foto; }
        const wynik = await wyslijZapis({ produkty: [zmian], opisZmiany: 'Edycja produktu ' + zmian.nazwa });
        komunikat('Zapisane ✓ Odświeżam stronę…');
        odswiezPoZapisie(wynik.wersja);
      } catch (err) {
        przycisk.disabled = false;
        komunikat(err.message, true);
      }
      return;
    }

    if (e.target.closest('[data-zapisz-real]')) {
      const przycisk = e.target.closest('[data-zapisz-real]');
      przycisk.disabled = true;
      komunikat('Zapisuję realizację…');
      try {
        const zmian = {
          id: realizacja.id,
          tytul: el('#syg-real-tytul').value.trim(),
          kategoria: el('#syg-real-kat').value.trim(),
          data: el('#syg-real-data').value.trim(),
          opis: el('#syg-real-opis').value.trim(),
          foto: el('#syg-real-foto').value.trim(),
          widoczna: !!el('#syg-real-wid').checked
        };
        const wynik = await wyslijZapis({ realizacje: [zmian], opisZmiany: 'Edycja realizacji ' + zmian.tytul });
        komunikat('Zapisane ✓ Odświeżam stronę…');
        odswiezPoZapisie(wynik.wersja);
      } catch (err) {
        przycisk.disabled = false;
        komunikat(err.message, true);
      }
    }
  });

  /* ---------- klikanie w elementy strony ---------- */
  function oznacz() {
    if (UI.oznaczElementyStrony) UI.oznaczElementyStrony();
    document.querySelectorAll('[data-pole], [data-syg-id]:not(section), .pcard, .rcard').forEach((e) => {
      e.classList.add('syg-edycja');
    });
    document.querySelectorAll('section[data-syg-id]').forEach((sec) => {
      if (sec.querySelector(':scope > .syg-sekcja-uchwyt')) return;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'syg-sekcja-uchwyt';
      b.textContent = '⚙ Sekcja';
      b.setAttribute('data-sec-id', sec.getAttribute('data-syg-id'));
      sec.appendChild(b);
    });
  }
  function odznacz() {
    document.querySelectorAll('.syg-edycja, .syg-edycja-aktywny').forEach((e) => {
      e.classList.remove('syg-edycja', 'syg-edycja-aktywny');
    });
    document.querySelectorAll('.syg-sekcja-uchwyt').forEach((b) => b.remove());
  }

  document.addEventListener('click', (e) => {
    if (!tryb) return;
    if (panel && panel.contains(e.target)) return;
    if (belka && belka.contains(e.target)) return;
    if (e.target.closest('#syg-przycisk')) return;

    const uchwytSekcji = e.target.closest('.syg-sekcja-uchwyt');
    if (uchwytSekcji) {
      e.preventDefault();
      e.stopPropagation();
      const sec = uchwytSekcji.closest('section[data-syg-id]');
      if (sec) otworzSekcje(sec, sec.getAttribute('data-syg-id'));
      return;
    }

    const karta = e.target.closest('.pcard');
    if (karta) {
      e.preventDefault();
      e.stopPropagation();
      const id = karta.getAttribute('data-prod-id') || (() => {
        const link = karta.querySelector('a[href*="produkt.html?id="]');
        return link ? decodeURIComponent(new URL(link.href).searchParams.get('id')) : null;
      })();
      if (id) otworzProdukt(karta, id);
      else komunikat('Ta karta nie prowadzi do produktu w panelu.', true);
      return;
    }

    const rKarta = e.target.closest('.rcard');
    if (rKarta && rKarta.hasAttribute('data-real-id')) {
      e.preventDefault();
      e.stopPropagation();
      otworzRealizacje(rKarta, rKarta.getAttribute('data-real-id'));
      return;
    }

    const poleEl = e.target.closest('[data-pole]');
    if (poleEl) {
      e.preventDefault();
      e.stopPropagation();
      otworzPole(poleEl, poleEl.getAttribute('data-pole'));
      return;
    }

    const sygEl = e.target.closest('[data-syg-id]:not(section)');
    if (sygEl) {
      e.preventDefault();
      e.stopPropagation();
      const sid = sygEl.getAttribute('data-syg-id');
      if (sygEl.tagName === 'IMG') otworzZdjecie(sygEl, sid);
      else otworzElementSyg(sygEl, sid);
    }
  }, true);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel && !panel.hidden) zamknijPanel();
  });

  function przycisk() {
    let b = el('#syg-przycisk');
    if (b) return b;
    b = document.createElement('button');
    b.id = 'syg-przycisk';
    b.type = 'button';
    b.innerHTML = '<b>✎</b> Edytuj stronę';
    b.addEventListener('click', () => wlacz(!tryb));
    document.body.appendChild(b);
    return b;
  }

  function wlacz(stan) {
    tryb = !!stan;
    document.body.classList.toggle('syg-tryb', tryb);
    const b = przycisk();
    b.innerHTML = tryb ? '<b>✕</b> Zakończ edycję' : '<b>✎</b> Edytuj stronę';
    b.setAttribute('aria-pressed', String(tryb));
    const bel = zbudujBelke();
    bel.hidden = !tryb;
    if (tryb) { oznacz(); komunikat(''); }
    else { odznacz(); zamknijPanel(); }
    try { localStorage.setItem(KLUCZ, tryb ? '1' : ''); } catch (_) {}
  }

  async function czyZalogowany() {
    try {
      const odp = await pobierzStan();
      if (!odp.ok) return false;
      const d = await odp.json().catch(() => ({}));
      if (d && d.ok === true) {
        stanSerwera = d;
        return true;
      }
      return false;
    } catch (_) { return false; }
  }

  async function start() {
    if (Q.get('edycja') === '1') {
      try { localStorage.setItem(KLUCZ, '1'); } catch (_) {}
    }
    let zapamietane = '';
    try { zapamietane = localStorage.getItem(KLUCZ) || ''; } catch (_) {}

    const zalogowany = await czyZalogowany();
    if (zalogowany) {
      przycisk();
      if (zapamietane === '1') wlacz(true);
    } else {
      const b = przycisk();
      b.innerHTML = '<b>✎</b> Zaloguj się, by edytować';
      b.addEventListener('click', () => {
        const cel = ADRES_API ? ADRES_API + '/admin/' : '/admin/';
        location.href = cel;
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
