/* ============================================================
   Studio Sygnatura — odświeżony panel pracowni (logika)
   Obsługuje: Podsumowanie, Stronę główną, Produkty, Realizacje,
   Podstrony i Menu (w tym własne podstrony WYSIWYG i edycję
   elementów wszystkich podstron), Zdjęcia (Media), Wiadomości
   oraz Ustawienia (dane firmy, stopka, hasło, cofnij/reset).
   ============================================================ */
(function () {
  'use strict';

  const API = '';
  const KLUCZ_TOKENU = 'syg-token';
  let pamiecToken = '';

  /* ---------- sesja (ciasteczko + Bearer + X-Syg-Token + body fallback) ---------- */
  function token() {
    if (pamiecToken) return pamiecToken;
    try { const t = localStorage.getItem(KLUCZ_TOKENU); if (t) return t; } catch (_) {}
    try { const s = sessionStorage.getItem(KLUCZ_TOKENU); if (s) return s; } catch (_) {}
    return '';
  }
  function zapamietajToken(t) {
    pamiecToken = t || '';
    try { t ? localStorage.setItem(KLUCZ_TOKENU, t) : localStorage.removeItem(KLUCZ_TOKENU); } catch (_) {}
    try { t ? sessionStorage.setItem(KLUCZ_TOKENU, t) : sessionStorage.removeItem(KLUCZ_TOKENU); } catch (_) {}
  }
  function zapytanie(droga, opcje) {
    const o = Object.assign({ credentials: 'same-origin' }, opcje || {});
    o.headers = Object.assign({}, o.headers || {});
    const t = token();
    if (t) {
      o.headers.Authorization = 'Bearer ' + t;
      o.headers['X-Syg-Token'] = t;
    }
    return fetch(API + droga, o);
  }
  async function pobierzStan() {
    let odp = await zapytanie('/api/stan');
    const t = token();
    if (odp.status === 401 && t) {
      odp = await zapytanie('/api/stan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: t })
      });
    }
    return odp;
  }

  const el = (s, ctx) => (ctx || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- domyślne dane i stan ---------- */
  const DOMYSLNE_MENU = [
    { id: 'produkty', href: 'sklep.html', etykieta: 'Produkty', rozwijane: true, widoczne: true },
    { id: 'szopki', href: 'realizacje.html', etykieta: 'Szopki', rozwijane: false, widoczne: true },
    { id: 'okazje', href: 'wspolpraca.html#okazje', etykieta: 'Dekoracje okolicznościowe', rozwijane: false, widoczne: true },
    { id: 'firmy', href: 'wspolpraca.html#firmy', etykieta: 'Dla firm', rozwijane: false, widoczne: true },
    { id: 'inspiracje', href: 'realizacje.html', etykieta: 'Inspiracje', rozwijane: false, widoczne: true },
    { id: 'onas', href: 'pracownia.html', etykieta: 'O nas', rozwijane: false, widoczne: true },
    { id: 'kontakt', href: 'kontakt.html', etykieta: 'Kontakt', rozwijane: false, widoczne: true }
  ];

  const DOMYSLNE_ATUTY = [
    { tytul: 'Polskie drewno', opis: 'z certyfikowanych źródeł' },
    { tytul: 'Ręczna praca', opis: 'z dbałością o detal' },
    { tytul: 'Personalizacja', opis: 'stworzona dla Ciebie' }
  ];

  const DOMYSLNY_PASEK = [
    { tytul: 'Szybka realizacja', opis: '1–2 dni robocze na odpowiedź\nz wyceną i terminem' },
    { tytul: 'Gwarancja jakości', opis: 'sprawdzone drewno i ręczne\nwykończenie' },
    { tytul: 'Pomoc i doradztwo', opis: 'napisz lub zadzwoń pod\n538 124 538' },
    { tytul: 'Zamów indywidualnie', opis: 'wyślij zapytanie o wycenę\nwiększych projektów' },
    { tytul: 'Tworzymy z sercem', opis: 'dla Ciebie i Twoich bliskich.' }
  ];

  const DOMYSLNE_STOPKA_LINKI = [
    { tekst: 'Jak zamawiać', href: 'sklep.html' },
    { tekst: 'Czas realizacji i dostawa', href: 'pracownia.html' },
    { tekst: 'Zwroty i reklamacje', href: 'kontakt.html' },
    { tekst: 'FAQ', href: 'kontakt.html#faq' }
  ];

  const PODSTRONY_SERWISU = [
    ['index.html', 'Strona główna'],
    ['sklep.html', 'Sklep'],
    ['realizacje.html', 'Realizacje'],
    ['pracownia.html', 'Pracownia i technika'],
    ['wspolpraca.html', 'Współpraca i okazje'],
    ['kontakt.html', 'Kontakt i FAQ'],
    ['produkt.html?id=katalog-1', 'Karta produktu'],
    ['szukaj.html', 'Wyszukiwarka'],
    ['koszyk.html', 'Koszyk'],
    ['konto.html', 'Moje konto'],
    ['404.html', 'Strona 404']
  ];

  let suroweDane = {};
  let domyslne = { firma: {}, produkty: [], realizacje: [], odznaki: {}, obrazyStudia: [] };
  let stan = {
    produkty: [],
    realizacje: [],
    stronaGlowna: {},
    menu: [],
    podstrony_wlasne: [],
    podstrony_wbudowane: {},
    elementy: {},
    ustawienia: {},
    media: [],
    wiadomosci: []
  };
  let brudne = false;
  let trybArkusza = null; // 'produkt' | 'realizacja' | 'sekcja' | 'strona' | 'wiadomosc'
  let edytowanyIdx = -1;
  let aktywnaPodstronaEdycji = 'sklep.html';

  const POOLA_STRONY = [
    ['hero_tytul', 'Nagłówek na stronie głównej', 'textarea',
      'Dwie linie, np. „Osobiste detale,\nktóre zostają na lata”'],
    ['hero_lead', 'Podtytuł pod nagłówkiem', 'textarea',
      'Krótko — jedna, dwie linie.'],
    ['hero_przycisk', 'Napis na przycisku', 'text', 'np. Zobacz kolekcję'],
    ['sekcja_tytul', 'Tytuł sekcji z produktami', 'text', 'np. Wybrane dla Ciebie']
  ];

  const POOLA_KONTAKTU = [
    ['nazwa_firmy', 'Nazwa pracowni', 'text', 'np. Studio Sygnatura'],
    ['telefon', 'Telefon', 'text', 'np. 538 124 538'],
    ['mail', 'E-mail', 'text', 'np. kontakt@studiosygnatura.pl'],
    ['obszar', 'Obszar działania', 'text', 'np. Poznań i okolice, woj. wielkopolskie'],
    ['odpowiedz', 'Informacja o czasie odpowiedzi', 'text', 'np. Na wiadomości odpowiadamy w ciągu 1–2 dni roboczych.'],
    ['youtube', 'Kanał YouTube', 'text', 'Wklej pełny adres kanału — ikona pojawi się w stopce'],
    ['fb', 'Facebook', 'text', 'Pełny adres profilu'],
    ['ig', 'Instagram', 'text', 'Pełny adres profilu'],
    ['pin', 'Pinterest', 'text', 'Pełny adres profilu']
  ];

  /* ---------- komunikaty i stan niezapisany ---------- */
  function komunikat(tekst, typ) {
    const s = el('#stan-zapisu');
    if (!s) return;
    s.textContent = tekst;
    s.className = 'stan' + (typ === 'ok' ? ' ok' : '');
    if (typ === 'ok') setTimeout(() => { if (s.textContent === tekst) s.textContent = ''; }, 2800);
  }
  function ustawBrudne(v) {
    brudne = !!v;
    const pb = el('#pasek-brudny');
    if (pb) pb.hidden = !brudne;
  }

  /* ---------- budowanie stanu roboczego ---------- */
  function scalProdukty(zapisane, bazowe, pelna) {
    if (pelna) return (zapisane || []).map((p) => ({ ...p }));
    const kopia = (bazowe || []).map((p) => ({ ...p }));
    const mapa = new Map(kopia.map((p, i) => [p.id, i]));
    (zapisane || []).forEach((z) => {
      if (mapa.has(z.id)) {
        const i = mapa.get(z.id);
        kopia[i] = { ...kopia[i], ...z };
      } else {
        kopia.push({ ...z });
      }
    });
    return kopia;
  }

  function scalRealizacje(zapisane, bazowe, pelna) {
    if (pelna) return (zapisane || []).map((r) => ({ ...r }));
    const kopia = (bazowe || []).map((r) => ({ ...r }));
    const mapa = new Map(kopia.map((r, i) => [String(r.id), i]));
    (zapisane || []).forEach((z) => {
      if (mapa.has(String(z.id))) {
        const i = mapa.get(String(z.id));
        kopia[i] = { ...kopia[i], ...z };
      } else {
        kopia.unshift({ ...z });
      }
    });
    return kopia;
  }

  function wczytajDoStanu(d) {
    suroweDane = d || {};
    domyslne = d.domyslne || { firma: {}, produkty: [], realizacje: [], odznaki: {}, obrazyStudia: [] };

    const u = Object.assign({
      nazwa_firmy: domyslne.firma.nazwa || 'Studio Sygnatura',
      telefon: domyslne.firma.tel || '538 124 538',
      mail: domyslne.firma.mail || 'kontakt@studiosygnatura.pl',
      obszar: domyslne.firma.obszar || 'Poznań i okolice, woj. wielkopolskie',
      odpowiedz: domyslne.firma.odpowiedz || 'Na wiadomości odpowiadamy w ciągu 1–2 dni roboczych.',
      fb: 'https://www.facebook.com/p/Studio-SygNatura-61595255863642/',
      ig: 'https://www.instagram.com/studiosygnatura/',
      pin: 'https://pl.pinterest.com/studiosygnatura/',
      youtube: '',
      stopka_o_nas: 'Studio Sygnatura to mała pracownia z pasji do drewna i detalu.\nTworzymy rzeczy, które mają znaczenie.',
      stopka_linki: DOMYSLNE_STOPKA_LINKI.map((l) => ({ ...l })),
      tryb_testowy_formularza: false
    }, d.ustawienia || {});

    const sg = Object.assign({
      hero_tytul: u.hero_tytul || 'Osobiste detale,\nktóre zostają na lata',
      hero_lead: u.hero_lead || 'Personalizowane drewniane tablice, szopki\ni dekoracje na wyjątkowe chwile.',
      hero_przycisk: u.hero_przycisk || 'Zobacz kolekcję',
      hero_link: 'sklep.html',
      hero_foto: 'assets/img/hero-szyld-1600.jpg',
      hero_foto_zoom: 100,
      hero_foto_x: 50,
      hero_foto_y: 50,
      hero_widoczne: true,
      hero_atuty: DOMYSLNE_ATUTY.map((a) => ({ ...a })),
      sekcja_tytul: u.sekcja_tytul || 'Wybrane dla Ciebie',
      sekcja_widoczna: true,
      produkty_ile: 3,
      produkty_kolejnosc: [],
      odznaki: JSON.parse(JSON.stringify(domyslne.odznaki || {})),
      pasek_widoczny: true,
      pasek_elementy: DOMYSLNY_PASEK.map((x) => ({ ...x })),
      dodatkowe_sekcje: []
    }, d.stronaGlowna || {});

    // Synchronizuj ewentualne wartości hero zapisane wcześniej w ustawieniach
    if (d.ustawienia) {
      ['hero_tytul', 'hero_lead', 'hero_przycisk', 'sekcja_tytul'].forEach((k) => {
        if (d.ustawienia[k] && !(d.stronaGlowna && d.stronaGlowna[k])) sg[k] = d.ustawienia[k];
      });
    }

    const produkty = scalProdukty(d.produkty, domyslne.produkty, !!d.produktyPelna);
    if (!sg.produkty_kolejnosc || !sg.produkty_kolejnosc.length) {
      sg.produkty_kolejnosc = produkty.map((p) => p.id);
    }

    stan = {
      produkty,
      realizacje: scalRealizacje(d.realizacje, domyslne.realizacje, !!d.realizacjePelna),
      stronaGlowna: sg,
      menu: Array.isArray(d.menu) && d.menu.length ? d.menu.map((m) => ({ ...m })) : DOMYSLNE_MENU.map((m) => ({ ...m })),
      podstrony_wlasne: Array.isArray(d.podstrony_wlasne) ? JSON.parse(JSON.stringify(d.podstrony_wlasne)) : [],
      podstrony_wbudowane: d.podstrony_wbudowane ? JSON.parse(JSON.stringify(d.podstrony_wbudowane)) : {},
      elementy: d.elementy ? JSON.parse(JSON.stringify(d.elementy)) : {},
      ustawienia: u,
      media: Array.isArray(d.media) ? d.media.slice() : [],
      wiadomosci: Array.isArray(d.wiadomosci) ? d.wiadomosci.slice() : []
    };

    const btnCofnij = el('#przycisk-cofnij');
    if (btnCofnij) btnCofnij.disabled = !(Number(d.historiaIle) > 0);
    ustawBrudne(false);
  }

  /* ---------- upload zdjęcia (kompresja + /api/upload) ---------- */
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
          } catch (_) { resolve(String(fr.result)); }
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
    const odp = await zapytanie('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cialo)
    });
    const d = await odp.json().catch(() => ({}));
    if (!odp.ok || !d.ok) throw new Error(d.blad || 'Nie udało się wgrać zdjęcia.');
    stan.media = d.media || stan.media;
    rysujMedia();
    return d.sciezka;
  }

  function opcjeMediow(wybrana) {
    let html = '<option value="">— wybierz zdjęcie z biblioteki —</option>';
    if (stan.media.length) {
      html += '<optgroup label="Wgrane zdjęcia">' +
        stan.media.map((m) => `<option value="${esc(m.sciezka)}"${m.sciezka === wybrana ? ' selected' : ''}>${esc(m.nazwa || m.sciezka)}</option>`).join('') +
        '</optgroup>';
    }
    if (domyslne.obrazyStudia && domyslne.obrazyStudia.length) {
      html += '<optgroup label="Zdjęcia pracowni">' +
        domyslne.obrazyStudia.map((s) => `<option value="${esc(s)}"${s === wybrana ? ' selected' : ''}>${esc(s.replace('assets/img/', ''))}</option>`).join('') +
        '</optgroup>';
    }
    return html;
  }

  function opcjePodstron(wybrana) {
    const lista = PODSTRONY_SERWISU.slice();
    (stan.podstrony_wlasne || []).forEach((s) => {
      if (s && s.slug) lista.push(['podstrona.html?s=' + encodeURIComponent(s.slug), 'Podstrona: ' + (s.tytul || s.slug)]);
    });
    return '<option value="">— wybierz stronę —</option>' +
      lista.map(([u, t]) => `<option value="${esc(u)}"${u === wybrana ? ' selected' : ''}>${esc(t)}</option>`).join('');
  }

  function odswiezSciezkeObrazka(src) {
    if (!src) return '../assets/img/prod-szopka-420.jpg';
    if (/^(https?:\/\/|\.\.\/|data:)/i.test(src)) return src;
    return '../' + src.replace(/^\//, '');
  }

  /* ---------- logowanie ---------- */
  const formaLogowania = el('#forma-logowania');
  if (formaLogowania) {
    const haslo = el('#haslo');
    const blad = el('#blad-logowania');
    const pokaz = el('#pokaz');

    pokaz.addEventListener('click', () => {
      const widac = haslo.type === 'text';
      haslo.type = widac ? 'password' : 'text';
      pokaz.textContent = widac ? 'Pokaż' : 'Ukryj';
      pokaz.setAttribute('aria-label', widac ? 'Pokaż hasło' : 'Ukryj hasło');
    });

    formaLogowania.addEventListener('submit', async (e) => {
      e.preventDefault();
      blad.textContent = '';
      const przycisk = formaLogowania.querySelector('button[type=submit]');
      przycisk.disabled = true;
      przycisk.textContent = 'Sprawdzam…';
      if (typeof fetch !== 'function') {
        blad.textContent = 'Ta przeglądarka jest za stara dla panelu. Użyj Chrome albo Safari.';
        przycisk.disabled = false;
        przycisk.textContent = 'Wejdź';
        return;
      }
      try {
        const odp = await fetch(API + '/api/logowanie', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ haslo: haslo.value.trim() })
        });
        const d = await odp.json().catch(() => ({}));
        if (odp.ok && d.ok) {
          if (d.token) zapamietajToken(d.token);
          await start();
        } else {
          blad.textContent = d.blad || 'Nie udało się zalogować.';
          haslo.select();
        }
      } catch (err) {
        blad.textContent = 'Brak połączenia z serwerem panelu. Sprawdź, czy działa.';
      } finally {
        przycisk.disabled = false;
        przycisk.textContent = 'Wejdź';
      }
    });
    if (location.search.indexOf('blad=1') >= 0) {
      blad.textContent = 'Nieprawidłowe hasło.';
    }
  }

  /* ---------- zakładki ---------- */
  function otworzZakladke(nazwa) {
    document.querySelectorAll('.zakladka').forEach((b) => {
      b.classList.toggle('aktywna', b.getAttribute('data-tab') === nazwa);
    });
    document.querySelectorAll('.tab-panel').forEach((s) => {
      s.hidden = (s.id !== 'tab-' + nazwa);
    });
    if (nazwa === 'strony' && !el('#edytor-podstrony-elementy').innerHTML) {
      wczytajPodstroneDoEdycji(aktywnaPodstronaEdycji);
    }
  }
  el('#zakladki').addEventListener('click', (e) => {
    const b = e.target.closest('.zakladka');
    if (!b) return;
    otworzZakladke(b.getAttribute('data-tab'));
  });

  /* ---------- start panelu ---------- */
  async function start() {
    let odp;
    try {
      odp = await pobierzStan();
    } catch (_) {
      const b = el('#blad-logowania');
      if (b) b.textContent = 'Brak połączenia z serwerem panelu. Odśwież stronę.';
      return;
    }
    if (odp.status === 401) {
      const b = el('#blad-logowania');
      if (b) b.textContent = 'Serwer nie przyjął sesji. Spróbuj ponownie — jeśli błąd wraca, odśwież stronę (Ctrl+R).';
      return;
    }
    const d = await odp.json().catch(() => ({}));
    if (!d.ok) {
      const b = el('#blad-logowania');
      if (b) b.textContent = d.blad || 'Nie udało się wczytać danych panelu.';
      return;
    }

    wczytajDoStanu(d);
    const bladEl = el('#blad-logowania');
    if (bladEl) bladEl.textContent = '';
    const hasloEl = el('#haslo');
    if (hasloEl) hasloEl.value = '';
    el('#ekran-logowania').hidden = true;
    el('#panel').hidden = false;
    window.scrollTo(0, 0);

    rysujWszystko();
    const hash = (location.hash || '').replace('#', '');
    if (hash && el('#tab-' + hash)) otworzZakladke(hash);
  }

  function rysujWszystko() {
    rysujPodsumowanie();
    rysujStroneGlowna();
    rysujProdukty();
    rysujRealizacje();
    rysujMenu();
    rysujWyborPodstron();
    rysujWlasnePodstrony();
    rysujMedia();
    rysujWiadomosci();
    rysujUstawienia();
  }

  /* ---------- 1. PODSUMOWANIE ---------- */
  function rysujPodsumowanie() {
    const prodWid = stan.produkty.filter((p) => p.dostepny !== false).length;
    el('#st-produkty').textContent = `${prodWid} / ${stan.produkty.length}`;
    el('#st-produkty-opis').textContent = 'widocznych w sklepie';

    const realWid = stan.realizacje.filter((r) => r.widoczna !== false).length;
    el('#st-realizacje').textContent = `${realWid} / ${stan.realizacje.length}`;
    el('#st-realizacje-opis').textContent = 'opublikowanych realizacji';

    const menuWid = stan.menu.filter((m) => m.widoczne !== false).length;
    el('#st-strony').textContent = `${menuWid} + ${stan.podstrony_wlasne.length}`;
    el('#st-strony-opis').textContent = 'pozycji menu + własne podstrony';

    const noweWiad = stan.wiadomosci.filter((w) => w.status === 'nowa').length;
    el('#st-wiadomosci').textContent = String(stan.wiadomosci.length);
    el('#st-wiadomosci-opis').textContent = noweWiad ? `${noweWiad} nowych zapytań` : 'brak nieprzeczytanych';

    const lista = PODSTRONY_SERWISU.concat(
      stan.podstrony_wlasne.filter((s) => s.slug).map((s) => ['podstrona.html?s=' + encodeURIComponent(s.slug), '📄 ' + (s.tytul || s.slug)])
    );
    el('#skroty-strony').innerHTML = lista.map(([href, tyt]) =>
      `<a class="skrot-strona" href="../${esc(href + (href.includes('?') ? '&' : '?') + 'edycja=1')}">
        <b>${esc(tyt)}</b><span>Edytuj ✎</span>
      </a>`
    ).join('');
  }

  el('#tab-podsumowanie').addEventListener('click', (e) => {
    const b = e.target.closest('[data-skok-tab]');
    if (!b) return;
    otworzZakladke(b.getAttribute('data-skok-tab'));
    const akcja = b.getAttribute('data-akcja');
    if (akcja === 'nowy-produkt') el('#nowy-produkt').click();
    if (akcja === 'nowa-realizacja') el('#nowa-realizacja').click();
    if (akcja === 'nowa-strona') el('#nowa-wlasna-strona').click();
  });

  el('#eksport-json').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(stan, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'sygnatura-kopia-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
  });

  /* ---------- 2. STRONA GŁÓWNA ---------- */
  function rysujPola(kontener, definicje, zrodlo) {
    kontener.innerHTML = definicje.map(([klucz, etykieta, typ, podpowiedz]) => {
      const wartosc = esc((zrodlo || {})[klucz] || '');
      const pole = typ === 'textarea'
        ? `<textarea id="u-${klucz}" rows="3" placeholder="${esc(podpowiedz)}">${wartosc}</textarea>`
        : `<input id="u-${klucz}" value="${wartosc}" placeholder="${esc(podpowiedz)}">`;
      return `<div class="pole">
        <label for="u-${klucz}">${esc(etykieta)}</label>
        ${pole}
        <p class="podpowiedz">${esc(podpowiedz)}</p>
      </div>`;
    }).join('');
  }

  function aktualizujPodgladKadruHero() {
    const sg = stan.stronaGlowna;
    const img = el('#sg-hero-img');
    if (!img) return;
    img.src = odswiezSciezkeObrazka(sg.hero_foto || 'assets/img/hero-szyld-1600.jpg');
    const zoom = Number(sg.hero_foto_zoom) || 100;
    const x = sg.hero_foto_x != null ? Number(sg.hero_foto_x) : 50;
    const y = sg.hero_foto_y != null ? Number(sg.hero_foto_y) : 50;
    img.style.objectPosition = `${x}% ${y}%`;
    img.style.transform = `scale(${(zoom / 100).toFixed(2)})`;
    el('#sg-zoom-val').textContent = zoom + '%';
    el('#sg-x-val').textContent = x + '%';
    el('#sg-y-val').textContent = y + '%';
    el('#sg-hero-zoom').value = zoom;
    el('#sg-hero-x').value = x;
    el('#sg-hero-y').value = y;
  }

  function rysujStroneGlowna() {
    const sg = stan.stronaGlowna;
    rysujPola(el('#pola-strony'), POOLA_STRONY, sg);
    el('#sg-hero-wid').checked = sg.hero_widoczne !== false;
    el('#sg-hero-link').value = sg.hero_link || 'sklep.html';
    el('#sg-hero-link-wybor').innerHTML = opcjePodstron(sg.hero_link || 'sklep.html');
    el('#sg-hero-bib').innerHTML = opcjeMediow(sg.hero_foto || 'assets/img/hero-szyld-1600.jpg');
    aktualizujPodgladKadruHero();

    // 3 atuty
    const atuty = Array.isArray(sg.hero_atuty) && sg.hero_atuty.length ? sg.hero_atuty : DOMYSLNE_ATUTY;
    el('#sg-atuty').innerHTML = atuty.map((a, i) => `
      <div class="mini-kafelek" data-atut="${i}">
        <b>Atut ${i + 1}</b>
        <input type="text" class="atut-tytul" value="${esc(a.tytul || '')}" placeholder="Tytuł">
        <input type="text" class="atut-opis" value="${esc(a.opis || '')}" placeholder="Krótki podpis">
      </div>`).join('');

    // Sekcja produktów i odznaki
    el('#sg-sekcja-wid').checked = sg.sekcja_widoczna !== false;
    el('#sg-ile-kart').value = sg.produkty_ile || 3;

    const opcjeProd = (wybr) => '<option value="">— wyłączona —</option>' +
      stan.produkty.map((p) => `<option value="${esc(p.id)}"${p.id === wybr ? ' selected' : ''}>${esc(p.nazwa)}</option>`).join('');
    const od = sg.odznaki || {};
    el('#sg-odznaka-nowosc').innerHTML = opcjeProd(od.nowosc ? od.nowosc.produkt : '');
    el('#sg-odznaka-bestseller').innerHTML = opcjeProd(od.bestseller ? od.bestseller.produkt : '');
    el('#sg-odznaka-okolicznosciowy').innerHTML = opcjeProd(od.okolicznosciowy ? od.okolicznosciowy.produkt : '');

    // Kolejność produktów na głównej
    const kol = (sg.produkty_kolejnosc || []).slice();
    stan.produkty.forEach((p) => { if (kol.indexOf(p.id) < 0) kol.push(p.id); });
    sg.produkty_kolejnosc = kol.filter((id) => stan.produkty.some((p) => p.id === id));
    el('#sg-kolejnosc-produktow').innerHTML = sg.produkty_kolejnosc.map((id, i) => {
      const p = stan.produkty.find((x) => x.id === id);
      if (!p) return '';
      return `<li class="wiersz-prosty" data-sg-prod="${esc(id)}">
        <span><b>${i + 1}. ${esc(p.nazwa)}</b> <small class="podpowiedz">(${p.cena ? esc(p.cena) + ' zł' : 'wycena'}${p.dostepny === false ? ' · UKRYTY' : ''})</small></span>
        <div class="akcje-rzad">
          <button type="button" class="btn btn-sm" data-sg-gora="${i}" ${i === 0 ? 'disabled' : ''}>↑</button>
          <button type="button" class="btn btn-sm" data-sg-dol="${i}" ${i === sg.produkty_kolejnosc.length - 1 ? 'disabled' : ''}>↓</button>
        </div>
      </li>`;
    }).join('');

    // Pasek zaufania
    el('#sg-pasek-wid').checked = sg.pasek_widoczny !== false;
    const pasek = Array.isArray(sg.pasek_elementy) && sg.pasek_elementy.length ? sg.pasek_elementy : DOMYSLNY_PASEK;
    el('#sg-pasek-elementy').innerHTML = pasek.map((x, i) => `
      <div class="mini-kafelek" data-pasek="${i}">
        <b>Kafel ${i + 1}${i === 4 ? ' (złoty)' : ''}</b>
        <input type="text" class="pasek-tytul" value="${esc(x.tytul || '')}" placeholder="Tytuł">
        <textarea rows="2" class="pasek-opis" placeholder="Opis">${esc(x.opis || '')}</textarea>
      </div>`).join('');

    // Dodatkowe bloki
    const dod = sg.dodatkowe_sekcje || [];
    el('#sg-dodatkowe-sekcje').innerHTML = dod.length
      ? dod.map((s, i) => `
        <li class="wiersz-prosty">
          <div>
            <b>${esc(s.tytul || '(Sekcja bez tytułu)')}</b>
            <span class="podpowiedz">Tło: ${esc(s.tlo || 'jasne')}${s.widoczna === false ? ' · UKRYTA' : ''}</span>
          </div>
          <div class="akcje-rzad">
            <button type="button" class="btn btn-sm" data-edit-sekcja="${i}">Edytuj</button>
            <button type="button" class="btn btn-sm btn-niebezpieczny" data-usun-sekcja="${i}">Usuń</button>
          </div>
        </li>`).join('')
      : '<li class="podpowiedz">Brak dodatkowych bloków. Kliknij „+ Dodaj blok”, aby wstawić nową sekcję na stronie głównej.</li>';
  }

  // Zdarzenia Strony Głównej
  el('#pola-strony').addEventListener('input', (e) => {
    const k = e.target.id.replace('u-', '');
    stan.stronaGlowna[k] = e.target.value;
    ustawBrudne(true);
  });
  el('#sg-hero-wid').addEventListener('change', (e) => { stan.stronaGlowna.hero_widoczne = e.target.checked; ustawBrudne(true); });
  el('#sg-hero-link').addEventListener('input', (e) => { stan.stronaGlowna.hero_link = e.target.value; ustawBrudne(true); });
  el('#sg-hero-link-wybor').addEventListener('change', (e) => {
    if (!e.target.value) return;
    el('#sg-hero-link').value = e.target.value;
    stan.stronaGlowna.hero_link = e.target.value;
    ustawBrudne(true);
  });
  el('#sg-hero-bib').addEventListener('change', (e) => {
    if (!e.target.value) return;
    stan.stronaGlowna.hero_foto = e.target.value;
    aktualizujPodgladKadruHero();
    ustawBrudne(true);
  });
  el('#sg-hero-plik').addEventListener('change', async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    komunikat('Wgrywam zdjęcie hero…');
    try {
      const sc = await wgrajObraz(f, 'hero-' + f.name.replace(/\.[^.]+$/, ''));
      stan.stronaGlowna.hero_foto = sc;
      el('#sg-hero-bib').innerHTML = opcjeMediow(sc);
      aktualizujPodgladKadruHero();
      ustawBrudne(true);
      komunikat('Zdjęcie wgrane', 'ok');
    } catch (err) { komunikat(err.message); }
  });
  ['#sg-hero-zoom', '#sg-hero-x', '#sg-hero-y'].forEach((sel) => {
    el(sel).addEventListener('input', () => {
      stan.stronaGlowna.hero_foto_zoom = Number(el('#sg-hero-zoom').value) || 100;
      stan.stronaGlowna.hero_foto_x = Number(el('#sg-hero-x').value);
      stan.stronaGlowna.hero_foto_y = Number(el('#sg-hero-y').value);
      aktualizujPodgladKadruHero();
      ustawBrudne(true);
    });
  });
  el('#sg-hero-kadr-reset').addEventListener('click', () => {
    stan.stronaGlowna.hero_foto_zoom = 100;
    stan.stronaGlowna.hero_foto_x = 50;
    stan.stronaGlowna.hero_foto_y = 50;
    aktualizujPodgladKadruHero();
    ustawBrudne(true);
  });
  // Przeciąganie kadru myszką/palcem
  (function () {
    const box = el('#sg-kadr-podglad');
    if (!box) return;
    let drag = null;
    box.addEventListener('pointerdown', (e) => {
      drag = { x: e.clientX, y: e.clientY, sx: stan.stronaGlowna.hero_foto_x ?? 50, sy: stan.stronaGlowna.hero_foto_y ?? 50 };
      try { box.setPointerCapture(e.pointerId); } catch (_) {}
    });
    box.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const dx = (e.clientX - drag.x) / Math.max(1, box.clientWidth) * 100;
      const dy = (e.clientY - drag.y) / Math.max(1, box.clientHeight) * 100;
      stan.stronaGlowna.hero_foto_x = Math.max(0, Math.min(100, Math.round(drag.sx - dx)));
      stan.stronaGlowna.hero_foto_y = Math.max(0, Math.min(100, Math.round(drag.sy - dy)));
      aktualizujPodgladKadruHero();
      ustawBrudne(true);
    });
    box.addEventListener('pointerup', () => { drag = null; });
    box.addEventListener('pointercancel', () => { drag = null; });
  })();

  el('#sg-atuty').addEventListener('input', () => {
    stan.stronaGlowna.hero_atuty = Array.from(el('#sg-atuty').querySelectorAll('[data-atut]')).map((k) => ({
      tytul: k.querySelector('.atut-tytul').value,
      opis: k.querySelector('.atut-opis').value
    }));
    ustawBrudne(true);
  });
  el('#sg-sekcja-wid').addEventListener('change', (e) => { stan.stronaGlowna.sekcja_widoczna = e.target.checked; ustawBrudne(true); });
  el('#sg-ile-kart').addEventListener('input', (e) => { stan.stronaGlowna.produkty_ile = Math.max(1, Number(e.target.value) || 3); ustawBrudne(true); });
  [['#sg-odznaka-nowosc', 'nowosc', 'Nowość'],
   ['#sg-odznaka-bestseller', 'bestseller', 'Bestseller'],
   ['#sg-odznaka-okolicznosciowy', 'okolicznosciowy', 'Okolicznościowy']].forEach(([sel, klucz, tekst]) => {
    el(sel).addEventListener('change', (e) => {
      stan.stronaGlowna.odznaki = stan.stronaGlowna.odznaki || {};
      stan.stronaGlowna.odznaki[klucz] = e.target.value ? { produkt: e.target.value, tekst } : null;
      ustawBrudne(true);
    });
  });
  el('#sg-kolejnosc-produktow').addEventListener('click', (e) => {
    const g = e.target.closest('[data-sg-gora]');
    const d = e.target.closest('[data-sg-dol]');
    if (!g && !d) return;
    const i = Number((g || d).getAttribute(g ? 'data-sg-gora' : 'data-sg-dol'));
    const j = g ? i - 1 : i + 1;
    const k = stan.stronaGlowna.produkty_kolejnosc;
    if (j < 0 || j >= k.length) return;
    [k[i], k[j]] = [k[j], k[i]];
    ustawBrudne(true);
    rysujStroneGlowna();
  });
  el('#sg-pasek-wid').addEventListener('change', (e) => { stan.stronaGlowna.pasek_widoczny = e.target.checked; ustawBrudne(true); });
  el('#sg-pasek-elementy').addEventListener('input', () => {
    stan.stronaGlowna.pasek_elementy = Array.from(el('#sg-pasek-elementy').querySelectorAll('[data-pasek]')).map((k) => ({
      tytul: k.querySelector('.pasek-tytul').value,
      opis: k.querySelector('.pasek-opis').value
    }));
    ustawBrudne(true);
  });
  el('#sg-dodaj-sekcje').addEventListener('click', () => {
    stan.stronaGlowna.dodatkowe_sekcje = stan.stronaGlowna.dodatkowe_sekcje || [];
    stan.stronaGlowna.dodatkowe_sekcje.push({
      id: 'sek-' + Date.now(), eyebrow: 'Z pracowni', tytul: 'Nowy blok informacyjny',
      tresc: '<p>Opis oferty, promocji albo aktualności z pracowni.</p>',
      foto: '', przyciskTekst: 'Dowiedz się więcej', przyciskLink: 'kontakt.html', tlo: 'krem', widoczna: true
    });
    ustawBrudne(true);
    rysujStroneGlowna();
    otworzDodatkowaSekcje(stan.stronaGlowna.dodatkowe_sekcje.length - 1);
  });
  el('#sg-dodatkowe-sekcje').addEventListener('click', (e) => {
    const ed = e.target.closest('[data-edit-sekcja]');
    if (ed) otworzDodatkowaSekcje(Number(ed.getAttribute('data-edit-sekcja')));
    const us = e.target.closest('[data-usun-sekcja]');
    if (us) {
      stan.stronaGlowna.dodatkowe_sekcje.splice(Number(us.getAttribute('data-usun-sekcja')), 1);
      ustawBrudne(true);
      rysujStroneGlowna();
    }
  });

  /* ---------- 3. PRODUKTY ---------- */
  function rysujProdukty() {
    const lista = el('#lista-produktow');
    const q = (el('#filtr-produkty') ? el('#filtr-produkty').value : '').trim().toLowerCase();
    const przefiltrowane = stan.produkty.map((p, i) => ({ p, i })).filter(({ p }) =>
      !q || String(p.nazwa || '').toLowerCase().includes(q) ||
      String(p.kategoria || '').toLowerCase().includes(q) ||
      String(p.tagi || '').toLowerCase().includes(q)
    );
    if (!przefiltrowane.length) {
      lista.innerHTML = '<li class="podpowiedz">Brak produktów pasujących do kryteriów. Kliknij „+ Dodaj produkt”.</li>';
      return;
    }
    lista.innerHTML = przefiltrowane.map(({ p, i }) => {
      const ukryty = p.dostepny === false;
      return `<li class="produkt${ukryty ? ' ukryty-wiersz' : ''}" data-i="${i}">
        <img src="${esc(odswiezSciezkeObrazka(p.fotoMala || p.foto))}" alt="" loading="lazy">
        <div class="produkt-dane">
          <div class="produkt-nazwa">${esc(p.nazwa || 'Bez nazwy')}</div>
          <div class="produkt-meta">
            <b>${p.cena ? esc(p.cena) + ' zł' : 'wycena indywidualna'}</b>
            ${p.kategoria ? '<span>· ' + esc(p.kategoria) + '</span>' : ''}
            ${ukryty ? '<span class="znacznik-ukryty">Ukryty w sklepie</span>' : ''}
          </div>
        </div>
        <div class="wiersz-prawa">
          <a class="btn btn-sm btn-ghost" href="../produkt.html?id=${encodeURIComponent(p.id)}&edycja=1" onclick="event.stopPropagation()">Podgląd</a>
          <div class="strzalki">
            <button type="button" data-gora="${i}" ${i === 0 ? 'disabled' : ''} aria-label="Przesuń wyżej">↑</button>
            <button type="button" data-dol="${i}" ${i === stan.produkty.length - 1 ? 'disabled' : ''} aria-label="Przesuń niżej">↓</button>
          </div>
        </div>
      </li>`;
    }).join('');
  }

  if (el('#filtr-produkty')) el('#filtr-produkty').addEventListener('input', rysujProdukty);

  el('#lista-produktow').addEventListener('click', (e) => {
    const g = e.target.closest('[data-gora]');
    const d = e.target.closest('[data-dol]');
    if (g || d) {
      e.stopPropagation();
      const ds = (g || d).dataset;
      const i = Number(ds.gora !== undefined ? ds.gora : ds.dol);
      const j = g ? i - 1 : i + 1;
      if (j < 0 || j >= stan.produkty.length) return;
      [stan.produkty[i], stan.produkty[j]] = [stan.produkty[j], stan.produkty[i]];
      stan.produkty.forEach((x, idx) => { x.kolejnosc = idx + 1; });
      ustawBrudne(true);
      rysujProdukty();
      rysujStroneGlowna();
      return;
    }
    const li = e.target.closest('.produkt');
    if (li) otworzProdukt(Number(li.dataset.i));
  });

  el('#nowy-produkt').addEventListener('click', () => {
    const nowy = {
      id: 'nowy-' + Date.now(), slug: 'nowy-' + Date.now(), kolejnosc: stan.produkty.length + 1,
      nazwa: '', kategoria: '', cena: null, jednostka: 'szt.', dostepny: true,
      gabaryt: '', tagi: '', foto: '', fotoMala: '', galeria: [], opis: '', cechy: [], realizacja: null
    };
    stan.produkty.push(nowy);
    ustawBrudne(true);
    rysujProdukty();
    otworzProdukt(stan.produkty.length - 1);
    el('#arkusz-tytul').textContent = 'Nowy produkt';
  });

  /* ---------- 4. REALIZACJE ---------- */
  function rysujRealizacje() {
    const lista = el('#lista-realizacji');
    const q = (el('#filtr-realizacje') ? el('#filtr-realizacje').value : '').trim().toLowerCase();
    const przefiltrowane = stan.realizacje.map((r, i) => ({ r, i })).filter(({ r }) =>
      !q || String(r.tytul || '').toLowerCase().includes(q) || String(r.kategoria || '').toLowerCase().includes(q)
    );
    if (!przefiltrowane.length) {
      lista.innerHTML = '<li class="podpowiedz">Brak realizacji. Kliknij „+ Dodaj realizację”.</li>';
      return;
    }
    lista.innerHTML = przefiltrowane.map(({ r, i }) => {
      const ukryta = r.widoczna === false;
      return `<li class="produkt${ukryta ? ' ukryty-wiersz' : ''}" data-real-i="${i}">
        <img src="${esc(odswiezSciezkeObrazka(r.foto))}" alt="" loading="lazy">
        <div class="produkt-dane">
          <div class="produkt-nazwa">${esc(r.tytul || 'Bez tytułu')}</div>
          <div class="produkt-meta">
            <span>${esc(r.kategoria || 'Realizacje')}</span>
            <span>· ${esc(r.data || '')}</span>
            ${r.produkt ? '<span class="znacznik-odznaka">W sklepie</span>' : ''}
            ${ukryta ? '<span class="znacznik-ukryty">Ukryta</span>' : ''}
          </div>
        </div>
        <div class="strzalki">
          <button type="button" data-rgora="${i}" ${i === 0 ? 'disabled' : ''} aria-label="Przesuń wyżej">↑</button>
          <button type="button" data-rdol="${i}" ${i === stan.realizacje.length - 1 ? 'disabled' : ''} aria-label="Przesuń niżej">↓</button>
        </div>
      </li>`;
    }).join('');
  }

  if (el('#filtr-realizacje')) el('#filtr-realizacje').addEventListener('input', rysujRealizacje);

  el('#lista-realizacji').addEventListener('click', (e) => {
    const g = e.target.closest('[data-rgora]');
    const d = e.target.closest('[data-rdol]');
    if (g || d) {
      e.stopPropagation();
      const i = Number((g || d).getAttribute(g ? 'data-rgora' : 'data-rdol'));
      const j = g ? i - 1 : i + 1;
      if (j < 0 || j >= stan.realizacje.length) return;
      [stan.realizacje[i], stan.realizacje[j]] = [stan.realizacje[j], stan.realizacje[i]];
      ustawBrudne(true);
      rysujRealizacje();
      return;
    }
    const li = e.target.closest('[data-real-i]');
    if (li) otworzRealizacje(Number(li.getAttribute('data-real-i')));
  });

  el('#nowa-realizacja').addEventListener('click', () => {
    const id = Date.now();
    stan.realizacje.unshift({
      id, slug: 'realizacja-' + id, tytul: 'Nowa realizacja', kategoria: 'Z pracowni',
      opis: '', foto: 'assets/img/real-krzyzowka-620.jpg', data: new Date().toISOString().slice(0, 10),
      okolicznosciowy: false, produkt: null, widoczna: true
    });
    ustawBrudne(true);
    rysujRealizacje();
    otworzRealizacje(0);
  });

  /* ---------- 5. PODSTRONY I MENU ---------- */
  function rysujMenu() {
    el('#lista-menu').innerHTML = stan.menu.map((m, i) => `
      <li class="wiersz-menu" data-menu-i="${i}">
        <label class="przelacznik"><input type="checkbox" class="m-wid"${m.widoczne !== false ? ' checked' : ''}> Widoczne</label>
        <input type="text" class="m-etyk" value="${esc(m.etykieta || '')}" placeholder="Nazwa w menu" aria-label="Nazwa pozycji menu">
        <input type="text" class="m-href" value="${esc(m.href || '')}" placeholder="Adres np. sklep.html" aria-label="Link pozycji menu">
        <div class="akcje-rzad">
          <button type="button" class="btn btn-sm" data-mgora="${i}" ${i === 0 ? 'disabled' : ''}>↑</button>
          <button type="button" class="btn btn-sm" data-mdol="${i}" ${i === stan.menu.length - 1 ? 'disabled' : ''}>↓</button>
        </div>
        <button type="button" class="btn btn-sm btn-niebezpieczny" data-musun="${i}">✕</button>
      </li>`).join('');
  }
  el('#lista-menu').addEventListener('input', (e) => {
    const row = e.target.closest('[data-menu-i]');
    if (!row) return;
    const i = Number(row.getAttribute('data-menu-i'));
    stan.menu[i].etykieta = row.querySelector('.m-etyk').value;
    stan.menu[i].href = row.querySelector('.m-href').value;
    stan.menu[i].widoczne = row.querySelector('.m-wid').checked;
    ustawBrudne(true);
  });
  el('#lista-menu').addEventListener('click', (e) => {
    const g = e.target.closest('[data-mgora]');
    const d = e.target.closest('[data-mdol]');
    const u = e.target.closest('[data-musun]');
    if (g || d) {
      const i = Number((g || d).getAttribute(g ? 'data-mgora' : 'data-mdol'));
      const j = g ? i - 1 : i + 1;
      if (j < 0 || j >= stan.menu.length) return;
      [stan.menu[i], stan.menu[j]] = [stan.menu[j], stan.menu[i]];
      ustawBrudne(true);
      rysujMenu();
    } else if (u) {
      stan.menu.splice(Number(u.getAttribute('data-musun')), 1);
      ustawBrudne(true);
      rysujMenu();
    }
  });
  el('#menu-dodaj').addEventListener('click', () => {
    stan.menu.push({ id: 'm-' + Date.now(), etykieta: 'Nowy link', href: 'kontakt.html', rozwijane: false, widoczne: true });
    ustawBrudne(true);
    rysujMenu();
  });
  el('#menu-reset').addEventListener('click', () => {
    stan.menu = DOMYSLNE_MENU.map((m) => ({ ...m }));
    ustawBrudne(true);
    rysujMenu();
  });

  /* ---------- skaner i edytor wbudowanych podstron ---------- */
  function rysujWyborPodstron() {
    const strony = PODSTRONY_SERWISU.filter(([u]) => u !== 'index.html');
    el('#wybor-podstron').innerHTML = strony.map(([href, tyt]) =>
      `<button type="button" class="p-wybor${href === aktywnaPodstronaEdycji ? ' aktywna' : ''}" data-pod-href="${esc(href)}">${esc(tyt)}</button>`
    ).join('');
  }
  el('#wybor-podstron').addEventListener('click', (e) => {
    const b = e.target.closest('[data-pod-href]');
    if (!b) return;
    aktywnaPodstronaEdycji = b.getAttribute('data-pod-href');
    rysujWyborPodstron();
    wczytajPodstroneDoEdycji(aktywnaPodstronaEdycji);
  });

  async function wczytajPodstroneDoEdycji(href) {
    const kont = el('#edytor-podstrony-elementy');
    const plik = href.split('?')[0];
    const strona = plik.replace(/\.html$/, '');
    const btnEd = el('#podstrona-otworz-edycje');
    if (btnEd) btnEd.href = '../' + href + (href.includes('?') ? '&' : '?') + 'edycja=1';

    kont.innerHTML = '<p class="podpowiedz">Wczytuję strukturę podstrony…</p>';
    try {
      const odp = await fetch('../' + plik, { cache: 'no-store' });
      const html = await odp.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const main = doc.getElementById('tresc');
      if (!main) { kont.innerHTML = '<p class="podpowiedz">Brak treści do edycji.</p>'; return; }

      const reg = [
        ['eyebrow', '.page-head .eyebrow, .sec-head .eyebrow', 'Etykieta nad nagłówkiem'],
        ['h1', 'h1', 'Główny tytuł strony (H1)'],
        ['lead', '.lead', 'Wstęp / podtytuł'],
        ['h2', 'h2', 'Nagłówek sekcji (H2)'],
        ['h3', 'h3:not(.pcard h3):not(.rcard h3)', 'Nagłówek kafelka / pytania (H3)'],
        ['p', 'p:not(.lead):not(.eyebrow):not(.blad):not(.pcard-opis):not(.rcard p):not(.small.muted):not(.form-msg)', 'Akapit tekstu'],
        ['li', '.o-nas ul li, .cechy li', 'Punkt listy'],
        ['btn', 'a.btn, .cta-box a', 'Przycisk (tekst + link)'],
        ['img', 'img:not(.pcard img):not(.rcard img):not(.miniatury img)', 'Zdjęcie'],
        ['sec', 'section', 'Ustawienia sekcji (tło / ukrycie)']
      ];

      const elementyListy = [];
      reg.forEach(([typ, sel, opisTypu]) => {
        let i = 0;
        main.querySelectorAll(sel).forEach((node) => {
          if (node.hasAttribute('data-pole')) return;
          const sid = `${strona}.${typ}.${i++}`;
          elementyListy.push({ sid, typ, opisTypu, node });
        });
      });

      let outHtml = elementyListy.map(({ sid, typ, opisTypu, node }) => {
        const ov = stan.elementy[sid] || {};
        if (typ === 'sec') {
          return `<div class="el-karta" data-el-id="${esc(sid)}">
            <div class="el-naglowek">
              <span class="el-id">${esc(opisTypu)} · <code>${esc(sid)}</code></span>
              <label class="przelacznik"><input type="checkbox" class="el-ukryty"${ov.ukryty ? ' checked' : ''}> Ukryj całą sekcję</label>
            </div>
            <div class="pole">
              <label>Wariant tła</label>
              <select class="el-tlo">
                <option value=""${!ov.tlo ? ' selected' : ''}>Domyślne</option>
                <option value="jasne"${ov.tlo === 'jasne' ? ' selected' : ''}>Jasne</option>
                <option value="krem"${ov.tlo === 'krem' ? ' selected' : ''}>Kremowe</option>
                <option value="ciemne"${ov.tlo === 'ciemne' ? ' selected' : ''}>Ciemna zieleń</option>
              </select>
            </div>
          </div>`;
        }
        if (typ === 'img') {
          const domSrc = node.getAttribute('src') || '';
          const aktSrc = ov.src || domSrc;
          return `<div class="el-karta" data-el-id="${esc(sid)}">
            <div class="el-naglowek">
              <span class="el-id">${esc(opisTypu)} · <code>${esc(sid)}</code></span>
              <label class="przelacznik"><input type="checkbox" class="el-ukryty"${ov.ukryty ? ' checked' : ''}> Ukryj</label>
            </div>
            <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
              <img class="el-img-mini" src="${esc(odswiezSciezkeObrazka(aktSrc))}" alt="" style="width:72px;height:54px;object-fit:cover;border-radius:6px;background:#EFE8DC">
              <select class="el-src" style="flex:1 1 200px;min-height:40px;padding:0 10px;border:1px solid var(--ramka);border-radius:8px;background:#fff">${opcjeMediow(aktSrc)}</select>
              <label class="btn btn-sm">+ Wgraj<input type="file" class="el-plik" accept="image/*" hidden></label>
            </div>
            <div class="pole mt-8">
              <label>Opis alt</label>
              <input type="text" class="el-alt" value="${esc(ov.alt != null ? ov.alt : (node.getAttribute('alt') || ''))}">
            </div>
          </div>`;
        }

        const klon = node.cloneNode(true);
        klon.querySelectorAll('svg').forEach((s) => s.remove());
        const domTekst = klon.innerHTML.replace(/\s+/g, ' ').trim();
        const aktVal = ov.html != null ? ov.html : domTekst;
        const aktHref = node.tagName === 'A' ? (ov.href != null ? ov.href : (node.getAttribute('href') || '')) : null;

        return `<div class="el-karta" data-el-id="${esc(sid)}">
          <div class="el-naglowek">
            <span class="el-id">${esc(opisTypu)} · <code>${esc(sid)}</code></span>
            <div class="akcje-rzad">
              <label class="przelacznik"><input type="checkbox" class="el-ukryty"${ov.ukryty ? ' checked' : ''}> Ukryj</label>
              ${stan.elementy[sid] ? '<button type="button" class="btn btn-sm btn-ghost el-cofnij">Przywróć</button>' : ''}
            </div>
          </div>
          <div class="el-domyslny">Domyślnie: ${esc(klon.textContent.trim().slice(0, 110))}</div>
          <div class="pole">
            <textarea rows="2" class="el-html">${esc(aktVal)}</textarea>
          </div>
          ${aktHref !== null ? `<div class="pole mt-8"><label>Link docelowy (href)</label><input type="text" class="el-href" value="${esc(aktHref)}"></div>` : ''}
        </div>`;
      }).join('');

      if (strona === 'kontakt') {
        outHtml += `<div class="karta mt-14">
          <div class="karta-naglowek">
            <h3>Dodatkowe pytania FAQ na stronie Kontakt</h3>
            <button type="button" class="btn btn-sm" id="faq-dodaj">+ Dodaj pytanie FAQ</button>
          </div>
          <div id="faq-dodane-lista" class="pola mt-12"></div>
        </div>`;
      }

      kont.innerHTML = outHtml;
      if (strona === 'kontakt') rysujFaqKontakt();
    } catch (err) {
      kont.innerHTML = `<p class="podpowiedz">Nie udało się wczytać struktury podstrony (${esc(err.message)}). Nadal możesz kliknąć „Edytuj na żywo ✎” obok.</p>`;
    }
  }

  function rysujFaqKontakt() {
    const lista = el('#faq-dodane-lista');
    if (!lista) return;
    const faqDod = (stan.podstrony_wbudowane.kontakt && stan.podstrony_wbudowane.kontakt.faqDodane) || [];
    lista.innerHTML = faqDod.map((f, i) => `
      <div class="el-karta" data-faq-i="${i}">
        <div class="pole"><label>Pytanie</label><input type="text" class="faq-pyt" value="${esc(f.pytanie || '')}"></div>
        <div class="pole mt-8"><label>Odpowiedź</label><textarea rows="2" class="faq-odp">${esc(f.odpowiedz || '')}</textarea></div>
        <button type="button" class="btn btn-sm btn-niebezpieczny mt-8" data-faq-usun="${i}">Usuń pytanie</button>
      </div>`).join('') || '<p class="podpowiedz">Brak dodatkowych pytań FAQ (podstawowe 5 pytań możesz edytować powyżej).</p>';
  }

  el('#edytor-podstrony-elementy').addEventListener('input', (e) => {
    const faqRow = e.target.closest('[data-faq-i]');
    if (faqRow) {
      const i = Number(faqRow.getAttribute('data-faq-i'));
      stan.podstrony_wbudowane.kontakt = stan.podstrony_wbudowane.kontakt || {};
      stan.podstrony_wbudowane.kontakt.faqDodane = stan.podstrony_wbudowane.kontakt.faqDodane || [];
      stan.podstrony_wbudowane.kontakt.faqDodane[i] = {
        pytanie: faqRow.querySelector('.faq-pyt').value,
        odpowiedz: faqRow.querySelector('.faq-odp').value
      };
      ustawBrudne(true);
      return;
    }
    const card = e.target.closest('[data-el-id]');
    if (!card) return;
    const sid = card.getAttribute('data-el-id');
    const ov = stan.elementy[sid] || {};
    const htmlEl = card.querySelector('.el-html');
    const hrefEl = card.querySelector('.el-href');
    const srcEl = card.querySelector('.el-src');
    const altEl = card.querySelector('.el-alt');
    const tloEl = card.querySelector('.el-tlo');
    const ukrEl = card.querySelector('.el-ukryty');
    if (htmlEl) ov.html = htmlEl.value;
    if (hrefEl) ov.href = hrefEl.value;
    if (srcEl && srcEl.value) {
      ov.src = srcEl.value;
      const mini = card.querySelector('.el-img-mini');
      if (mini) mini.src = odswiezSciezkeObrazka(srcEl.value);
    }
    if (altEl) ov.alt = altEl.value;
    if (tloEl) ov.tlo = tloEl.value;
    if (ukrEl) ov.ukryty = ukrEl.checked;
    stan.elementy[sid] = ov;
    ustawBrudne(true);
  });

  el('#edytor-podstrony-elementy').addEventListener('change', async (e) => {
    if (e.target.classList.contains('el-plik')) {
      const f = e.target.files && e.target.files[0];
      const card = e.target.closest('[data-el-id]');
      if (!f || !card) return;
      const sid = card.getAttribute('data-el-id');
      try {
        const sc = await wgrajObraz(f, sid.replace(/\./g, '-'));
        stan.elementy[sid] = Object.assign(stan.elementy[sid] || {}, { src: sc });
        card.querySelector('.el-src').innerHTML = opcjeMediow(sc);
        card.querySelector('.el-img-mini').src = odswiezSciezkeObrazka(sc);
        ustawBrudne(true);
        komunikat('Zdjęcie wgrane', 'ok');
      } catch (err) { komunikat(err.message); }
      return;
    }
    // Obsługa checkboxów / selectów
    el('#edytor-podstrony-elementy').dispatchEvent(new Event('input', { bubbles: true }));
  });

  el('#edytor-podstrony-elementy').addEventListener('click', (e) => {
    const cof = e.target.closest('.el-cofnij');
    if (cof) {
      const sid = cof.closest('[data-el-id]').getAttribute('data-el-id');
      delete stan.elementy[sid];
      ustawBrudne(true);
      wczytajPodstroneDoEdycji(aktywnaPodstronaEdycji);
      return;
    }
    if (e.target.id === 'faq-dodaj') {
      stan.podstrony_wbudowane.kontakt = stan.podstrony_wbudowane.kontakt || {};
      stan.podstrony_wbudowane.kontakt.faqDodane = stan.podstrony_wbudowane.kontakt.faqDodane || [];
      stan.podstrony_wbudowane.kontakt.faqDodane.push({ pytanie: 'Nowe pytanie', odpowiedz: 'Treść odpowiedzi…' });
      ustawBrudne(true);
      rysujFaqKontakt();
      return;
    }
    const fUsun = e.target.closest('[data-faq-usun]');
    if (fUsun) {
      stan.podstrony_wbudowane.kontakt.faqDodane.splice(Number(fUsun.getAttribute('data-faq-usun')), 1);
      ustawBrudne(true);
      rysujFaqKontakt();
    }
  });

  el('#podstrona-reset').addEventListener('click', () => {
    const strona = aktywnaPodstronaEdycji.split('?')[0].replace(/\.html$/, '');
    if (!confirm('Przywrócić wszystkie elementy tej podstrony do oryginału?')) return;
    Object.keys(stan.elementy).forEach((k) => { if (k.startsWith(strona + '.')) delete stan.elementy[k]; });
    ustawBrudne(true);
    wczytajPodstroneDoEdycji(aktywnaPodstronaEdycji);
  });

  /* ---------- własne podstrony ---------- */
  function rysujWlasnePodstrony() {
    const lista = el('#lista-wlasnych-stron');
    if (!stan.podstrony_wlasne.length) {
      lista.innerHTML = '<li class="podpowiedz">Brak własnych podstron. Kliknij „+ Nowa podstrona”, żeby utworzyć dowolną stronę z własnym tekstem i zdjęciami.</li>';
      return;
    }
    lista.innerHTML = stan.podstrony_wlasne.map((s, i) => `
      <li class="wiersz-prosty">
        <div>
          <b>${esc(s.tytul || 'Bez tytułu')}</b>
          <span class="podpowiedz">· <code>podstrona.html?s=${esc(s.slug)}</code> ${s.menu !== false ? '· w menu' : ''} ${s.widoczna === false ? '· UKRYTA' : ''}</span>
        </div>
        <div class="akcje-rzad">
          <a class="btn btn-sm btn-ghost" href="../podstrona.html?s=${encodeURIComponent(s.slug)}&edycja=1">Podgląd</a>
          <button type="button" class="btn btn-sm" data-edit-wlasna="${i}">Edytuj</button>
        </div>
      </li>`).join('');
  }
  el('#lista-wlasnych-stron').addEventListener('click', (e) => {
    const b = e.target.closest('[data-edit-wlasna]');
    if (b) otworzWlasnaStrone(Number(b.getAttribute('data-edit-wlasna')));
  });
  el('#nowa-wlasna-strona').addEventListener('click', () => {
    stan.podstrony_wlasne.push({
      slug: 'podstrona-' + (stan.podstrony_wlasne.length + 1),
      tytul: 'Nowa podstrona',
      eyebrow: 'Z pracowni',
      lead: '',
      kol: 10,
      menu: true,
      stopka: false,
      widoczna: true,
      tresc: '<h2>Nagłówek sekcji</h2><p>Tu wpisz treść nowej podstrony — możesz dodać zdjęcia, pogrubienia, listy i przyciski.</p>'
    });
    ustawBrudne(true);
    rysujWlasnePodstrony();
    otworzWlasnaStrone(stan.podstrony_wlasne.length - 1);
  });

  /* ---------- 6. ZDJĘCIA (MEDIA) ---------- */
  function rysujMedia() {
    const wgrane = el('#media-wgrane');
    wgrane.innerHTML = stan.media.length
      ? stan.media.map((m) => `
        <div class="media-karta" data-media-id="${esc(m.id)}">
          <img src="${esc(odswiezSciezkeObrazka(m.sciezka))}" alt="${esc(m.nazwa)}" loading="lazy">
          <div class="media-opis">
            <b title="${esc(m.nazwa)}">${esc(m.nazwa)}</b>
            <div class="media-akcje">
              <button type="button" class="btn btn-sm" data-media-zmien="${esc(m.id)}">Nazwa</button>
              <button type="button" class="btn btn-sm btn-niebezpieczny" data-media-usun="${esc(m.id)}">Usuń</button>
            </div>
          </div>
        </div>`).join('')
      : '<p class="podpowiedz">Nie wgrano jeszcze żadnych własnych zdjęć.</p>';

    el('#media-studio').innerHTML = (domyslne.obrazyStudia || []).map((s) => `
      <div class="media-karta">
        <img src="../${esc(s)}" alt="" loading="lazy">
        <div class="media-opis"><b title="${esc(s)}">${esc(s.replace('assets/img/', ''))}</b><code>${esc(s)}</code></div>
      </div>`).join('');
  }

  el('#media-plik').addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    if (f && !el('#media-nazwa').value.trim()) {
      el('#media-nazwa').value = f.name.replace(/\.[^.]+$/, '');
    }
  });
  el('#media-wgraj-btn').addEventListener('click', async () => {
    const inp = el('#media-plik');
    const f = inp.files && inp.files[0];
    if (!f) { el('#media-status').textContent = 'Najpierw wybierz plik zdjęcia.'; return; }
    const btn = el('#media-wgraj-btn');
    btn.disabled = true;
    el('#media-status').textContent = 'Wgrywam zdjęcie…';
    try {
      const sc = await wgrajObraz(f, el('#media-nazwa').value.trim());
      inp.value = '';
      el('#media-nazwa').value = '';
      el('#media-status').textContent = 'Dodano do biblioteki: ' + sc;
    } catch (err) {
      el('#media-status').textContent = 'Błąd: ' + err.message;
    } finally { btn.disabled = false; }
  });
  el('#media-wgrane').addEventListener('click', async (e) => {
    const zm = e.target.closest('[data-media-zmien]');
    const us = e.target.closest('[data-media-usun]');
    if (!zm && !us) return;
    const id = (zm || us).getAttribute(zm ? 'data-media-zmien' : 'data-media-usun');
    const t = token();
    if (zm) {
      const m = stan.media.find((x) => String(x.id) === String(id));
      const nowa = prompt('Nowa nazwa zdjęcia:', m ? m.nazwa : '');
      if (!nowa) return;
      const odp = await zapytanie('/api/media-zmien', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, akcja: 'zmien', nazwa: nowa, token: t || undefined })
      });
      const d = await odp.json().catch(() => ({}));
      if (odp.ok && d.ok) { stan.media = d.media; rysujMedia(); }
    } else if (us) {
      if (!confirm('Usunąć to zdjęcie z biblioteki i z dysku?')) return;
      const odp = await zapytanie('/api/media-zmien', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, akcja: 'usun', token: t || undefined })
      });
      const d = await odp.json().catch(() => ({}));
      if (odp.ok && d.ok) { stan.media = d.media; rysujMedia(); }
    }
  });

  /* ---------- 7. WIADOMOŚCI ---------- */
  function rysujWiadomosci() {
    el('#u-tryb-testowy-form').checked = !!stan.ustawienia.tryb_testowy_formularza;
    const kont = el('#lista-wiadomosci');
    if (!stan.wiadomosci.length) {
      kont.innerHTML = '<p class="podpowiedz">Brak wiadomości w skrzynce testowej. Zaznacz opcję powyżej i wyślij formularz na <code>kontakt.html</code> albo kliknij „+ Dodaj zapytanie testowe”.</p>';
      return;
    }
    kont.innerHTML = stan.wiadomosci.map((w, i) => `
      <div class="wiadomosc-karta" data-wiad-i="${i}">
        <div class="wiadomosc-gora">
          <div>
            <b>${esc(w.sygnatura || 'TEST')}</b> · <b>${esc(w.imie)}</b> (${esc(w.email)}${w.telefon ? ' · ' + esc(w.telefon) : ''})
          </div>
          <span class="podpowiedz">${esc((w.data || '').slice(0, 16).replace('T', ' '))} · temat: ${esc(w.temat || 'inne')}${w.produkt ? ' · ' + esc(w.produkt) : ''}</span>
        </div>
        <div class="wiadomosc-tresc">${esc(w.tresc)}</div>
        <div class="wiadomosc-dol">
          <select class="w-status" aria-label="Status wiadomości">
            <option value="nowa"${w.status === 'nowa' ? ' selected' : ''}>Nowa</option>
            <option value="w_trakcie"${w.status === 'w_trakcie' ? ' selected' : ''}>W trakcie</option>
            <option value="odpowiedziana"${w.status === 'odpowiedziana' ? ' selected' : ''}>Odpowiedziana</option>
            <option value="archiwum"${w.status === 'archiwum' ? ' selected' : ''}>Archiwum</option>
          </select>
          <input type="text" class="w-notatka" value="${esc(w.notatka || '')}" placeholder="Notatka wewnętrzna pracowni…">
          <button type="button" class="btn btn-sm btn-niebezpieczny" data-wiad-usun="${i}">Usuń</button>
        </div>
      </div>`).join('');
  }
  el('#u-tryb-testowy-form').addEventListener('change', (e) => {
    stan.ustawienia.tryb_testowy_formularza = e.target.checked;
    ustawBrudne(true);
  });
  el('#lista-wiadomosci').addEventListener('input', (e) => {
    const karta = e.target.closest('[data-wiad-i]');
    if (!karta) return;
    const i = Number(karta.getAttribute('data-wiad-i'));
    stan.wiadomosci[i].status = karta.querySelector('.w-status').value;
    stan.wiadomosci[i].notatka = karta.querySelector('.w-notatka').value;
    ustawBrudne(true);
  });
  el('#lista-wiadomosci').addEventListener('change', (e) => {
    if (e.target.classList.contains('w-status')) {
      el('#lista-wiadomosci').dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  el('#lista-wiadomosci').addEventListener('click', (e) => {
    const b = e.target.closest('[data-wiad-usun]');
    if (!b) return;
    stan.wiadomosci.splice(Number(b.getAttribute('data-wiad-usun')), 1);
    ustawBrudne(true);
    rysujWiadomosci();
    rysujPodsumowanie();
  });
  el('#nowa-wiadomosc').addEventListener('click', () => {
    trybArkusza = 'wiadomosc';
    el('#arkusz-tytul').textContent = 'Nowe zapytanie testowe';
    el('#usun-produkt').hidden = true;
    el('#gotowe').textContent = 'Dodaj wiadomość';
    el('#arkusz-pola').innerHTML = `
      <div class="pole"><label for="nw-imie">Imię i nazwisko *</label><input id="nw-imie" placeholder="np. Anna Kowalska"></div>
      <div class="pole-dwa">
        <div class="pole"><label for="nw-email">E-mail *</label><input id="nw-email" type="email" placeholder="anna@poczta.pl"></div>
        <div class="pole"><label for="nw-tel">Telefon</label><input id="nw-tel" placeholder="600 000 000"></div>
      </div>
      <div class="pole"><label for="nw-tresc">Treść zapytania *</label><textarea id="nw-tresc" rows="3" placeholder="Opis projektu…"></textarea></div>`;
    otworzArkusz();
  });

  /* ---------- 8. USTAWIENIA ---------- */
  function rysujUstawienia() {
    rysujPola(el('#pola-kontaktu'), POOLA_KONTAKTU, stan.ustawienia);
    el('#u-stopka_o_nas').value = stan.ustawienia.stopka_o_nas || '';
    const linki = Array.isArray(stan.ustawienia.stopka_linki) ? stan.ustawienia.stopka_linki : DOMYSLNE_STOPKA_LINKI;
    el('#lista-stopka-linki').innerHTML = linki.map((l, i) => `
      <li class="wiersz-menu" data-slink="${i}">
        <span>Link ${i + 1}</span>
        <input type="text" class="sl-tekst" value="${esc(l.tekst || '')}" placeholder="Tekst linku">
        <input type="text" class="sl-href" value="${esc(l.href || '')}" placeholder="Adres np. sklep.html">
        <div class="akcje-rzad">
          <button type="button" class="btn btn-sm" data-sl-gora="${i}" ${i === 0 ? 'disabled' : ''}>↑</button>
          <button type="button" class="btn btn-sm" data-sl-dol="${i}" ${i === linki.length - 1 ? 'disabled' : ''}>↓</button>
        </div>
        <button type="button" class="btn btn-sm btn-niebezpieczny" data-sl-usun="${i}">✕</button>
      </li>`).join('');
  }
  el('#pola-kontaktu').addEventListener('input', (e) => {
    const k = e.target.id.replace('u-', '');
    stan.ustawienia[k] = e.target.value;
    ustawBrudne(true);
  });
  el('#u-stopka_o_nas').addEventListener('input', (e) => {
    stan.ustawienia.stopka_o_nas = e.target.value;
    ustawBrudne(true);
  });
  el('#lista-stopka-linki').addEventListener('input', (e) => {
    const row = e.target.closest('[data-slink]');
    if (!row) return;
    const i = Number(row.getAttribute('data-slink'));
    stan.ustawienia.stopka_linki[i] = {
      tekst: row.querySelector('.sl-tekst').value,
      href: row.querySelector('.sl-href').value
    };
    ustawBrudne(true);
  });
  el('#lista-stopka-linki').addEventListener('click', (e) => {
    const g = e.target.closest('[data-sl-gora]');
    const d = e.target.closest('[data-sl-dol]');
    const u = e.target.closest('[data-sl-usun]');
    const list = stan.ustawienia.stopka_linki;
    if (g || d) {
      const i = Number((g || d).getAttribute(g ? 'data-sl-gora' : 'data-sl-dol'));
      const j = g ? i - 1 : i + 1;
      if (j < 0 || j >= list.length) return;
      [list[i], list[j]] = [list[j], list[i]];
      ustawBrudne(true);
      rysujUstawienia();
    } else if (u) {
      list.splice(Number(u.getAttribute('data-sl-usun')), 1);
      ustawBrudne(true);
      rysujUstawienia();
    }
  });
  el('#stopka-link-dodaj').addEventListener('click', () => {
    stan.ustawienia.stopka_linki = stan.ustawienia.stopka_linki || DOMYSLNE_STOPKA_LINKI.map((l) => ({ ...l }));
    stan.ustawienia.stopka_linki.push({ tekst: 'Nowy link', href: 'kontakt.html' });
    ustawBrudne(true);
    rysujUstawienia();
  });

  el('#zmien-haslo').addEventListener('click', async () => {
    const ob = el('#h-obecne').value;
    const nw = el('#h-nowe').value;
    const pw = el('#h-powtorz').value;
    const st = el('#haslo-status');
    if (nw.length < 8) { st.textContent = 'Nowe hasło musi mieć min. 8 znaków.'; return; }
    if (nw !== pw) { st.textContent = 'Nowe hasła nie są takie same.'; return; }
    const t = token();
    const odp = await zapytanie('/api/haslo', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ obecne: ob, nowe: nw, token: t || undefined })
    });
    const d = await odp.json().catch(() => ({}));
    if (odp.ok && d.ok) {
      el('#h-obecne').value = ''; el('#h-nowe').value = ''; el('#h-powtorz').value = '';
      st.textContent = 'Hasło zmienione!';
    } else {
      st.textContent = d.blad || 'Nie udało się zmienić hasła.';
    }
  });

  el('#tab-ustawienia').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-reset]');
    if (!b) return;
    const sekcja = b.getAttribute('data-reset');
    if (!confirm('Przywrócić domyślne dane dla sekcji: ' + sekcja + '?')) return;
    const t = token();
    const odp = await zapytanie('/api/reset', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sekcja, token: t || undefined })
    });
    if (odp.ok) {
      const s = await (await pobierzStan()).json();
      wczytajDoStanu(s);
      rysujWszystko();
      komunikat('Przywrócono ustawienia domyślne', 'ok');
    }
  });

  /* ---------- ARKUSZE EDYCJI (modal / szuflada) ---------- */
  function otworzArkusz() {
    el('#arkusz').hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function podlaczWysiwyg(barSel, poleSel) {
    const bar = el(barSel);
    const pole = el(poleSel);
    if (!bar || !pole) return;
    bar.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-cmd]');
      if (!b) return;
      const cmd = b.getAttribute('data-cmd');
      pole.focus();
      if (cmd === 'link') {
        const u = prompt('Adres linku (np. sklep.html lub https://…):', 'sklep.html');
        if (u) document.execCommand('createLink', false, u);
      } else if (cmd === 'btn') {
        const txt = prompt('Tekst przycisku:', 'Zobacz ofertę');
        const u = txt ? prompt('Dokąd prowadzi przycisk:', 'kontakt.html') : '';
        if (txt && u) {
          document.execCommand('insertHTML', false, `<p><a class="btn" href="${esc(u)}">${esc(txt)}</a></p>`);
        }
      } else if (cmd === 'foto') {
        const inp = document.createElement('input');
        inp.type = 'file'; inp.accept = 'image/*';
        inp.addEventListener('change', async () => {
          const f = inp.files && inp.files[0];
          if (!f) return;
          try {
            const sc = await wgrajObraz(f, 'podstrona-obraz');
            document.execCommand('insertHTML', false, `<p><img src="${esc(sc)}" alt=""></p>`);
          } catch (err) { alert(err.message); }
        });
        inp.click();
      } else if (cmd === 'html') {
        const kod = prompt('Edycja surowego HTML:', pole.innerHTML);
        if (kod !== null) pole.innerHTML = kod;
      } else {
        document.execCommand(cmd, false, b.getAttribute('data-arg') || null);
      }
    });
  }

  function otworzProdukt(i) {
    trybArkusza = 'produkt';
    edytowanyIdx = i;
    const p = stan.produkty[i] || {};
    el('#arkusz-tytul').textContent = p.nazwa || 'Nowy produkt';
    el('#usun-produkt').hidden = false;
    el('#usun-produkt').textContent = 'Usuń';
    el('#gotowe').textContent = 'Gotowe';

    const kategorie = [...new Set(stan.produkty.map((x) => x.kategoria).filter(Boolean))];
    const opcjeReal = '<option value="">— brak powiązanej realizacji —</option>' +
      stan.realizacje.map((r) => `<option value="${esc(r.id)}"${String(r.id) === String(p.realizacja) ? ' selected' : ''}>${esc(r.tytul)}</option>`).join('');
    const galeria = Array.isArray(p.galeria) ? p.galeria.slice() : [];

    el('#arkusz-pola').innerHTML = `
      <div class="pole">
        <label for="p-nazwa">Nazwa produktu</label>
        <input id="p-nazwa" value="${esc(p.nazwa || '')}" placeholder="np. Szopka bożonarodzeniowa">
      </div>
      <div class="pole-dwa">
        <div class="pole">
          <label for="p-cena">Cena (zł)</label>
          <input id="p-cena" type="number" inputmode="decimal" min="0" step="1"
                 value="${p.cena != null ? esc(p.cena) : ''}" placeholder="249">
        </div>
        <div class="pole">
          <label for="p-jednostka">Jednostka</label>
          <input id="p-jednostka" value="${esc(p.jednostka || 'szt.')}" placeholder="szt.">
        </div>
      </div>
      <div class="pole-dwa">
        <div class="pole">
          <label for="p-kategoria">Kategoria</label>
          <input id="p-kategoria" list="kat-list" value="${esc(p.kategoria || '')}" placeholder="Dekoracje świąteczne">
          <datalist id="kat-list">${kategorie.map((k) => `<option value="${esc(k)}">`).join('')}</datalist>
        </div>
        <div class="pole">
          <label for="p-gabaryt">Gabaryt / wymiary</label>
          <input id="p-gabaryt" value="${esc(p.gabaryt || '')}" placeholder="np. 20×20×8 cm">
        </div>
      </div>
      <div class="pole">
        <label for="p-tagi">Tagi do wyszukiwarki (po przecinku)</label>
        <input id="p-tagi" value="${esc(p.tagi || '')}" placeholder="np. święta, drewno, led, prezent">
      </div>
      <div class="pole">
        <label for="p-opis">Opis</label>
        <textarea id="p-opis" placeholder="Dwa, trzy zdania — co to jest i z czego.">${esc(p.opis || '')}</textarea>
      </div>
      <div class="pole">
        <label for="p-cechy">Cechy produktu (każda w nowej linii)</label>
        <textarea id="p-cechy" rows="2" placeholder="np. Wymiar: 20×20×8 cm">${esc((p.cechy || []).join('\n'))}</textarea>
      </div>
      <div class="pole">
        <label for="p-foto">Zdjęcie główne (ścieżka lub wybór / upload)</label>
        <input id="p-foto" value="${esc(p.foto || '')}" placeholder="assets/img/prod-szopka-420.jpg">
        <div class="kadr-narzedzia mt-8">
          <select id="p-foto-bib" aria-label="Wybierz zdjęcie z biblioteki">${opcjeMediow(p.foto || '')}</select>
          <label class="btn btn-sm">+ Wgraj plik<input type="file" id="p-foto-plik" accept="image/*" hidden></label>
        </div>
      </div>
      <div class="pole">
        <label>Dodatkowe zdjęcia w galerii produktu</label>
        <div id="p-galeria-box" class="akcje-rzad">${galeria.map((g, gi) =>
          `<span class="wiersz-prosty" style="padding:4px 8px">
            <img src="${esc(odswiezSciezkeObrazka(/^(assets\/|admin\/|https?:)/i.test(g) ? g : 'assets/img/' + g))}" alt="" style="width:40px;height:40px;object-fit:cover;border-radius:5px">
            <button type="button" class="btn btn-sm btn-niebezpieczny" data-pgal-usun="${gi}">✕</button>
          </span>`).join('')}</div>
        <div class="kadr-narzedzia mt-8">
          <select id="p-galeria-dodaj-bib" aria-label="Dodaj zdjęcie z biblioteki do galerii">${opcjeMediow('')}</select>
          <label class="btn btn-sm">+ Dodaj zdjęcie<input type="file" id="p-galeria-plik" accept="image/*" hidden></label>
        </div>
      </div>
      <div class="pole">
        <label for="p-realizacja">Powiązana realizacja</label>
        <select id="p-realizacja">${opcjeReal}</select>
      </div>
      <label class="przelacznik"><input type="checkbox" id="p-dostepny"${p.dostepny !== false ? ' checked' : ''}> Widoczny w sklepie i na stronie głównej</label>`;

    el('#p-foto-bib').addEventListener('change', (e) => { if (e.target.value) el('#p-foto').value = e.target.value; });
    el('#p-foto-plik').addEventListener('change', async (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      try {
        const sc = await wgrajObraz(f, 'prod-' + (p.id || 'nowy'));
        el('#p-foto').value = sc;
        el('#p-foto-bib').innerHTML = opcjeMediow(sc);
      } catch (err) { alert(err.message); }
    });
    const odswiezGalerie = () => {
      el('#p-galeria-box').innerHTML = galeria.map((g, gi) =>
        `<span class="wiersz-prosty" style="padding:4px 8px">
          <img src="${esc(odswiezSciezkeObrazka(/^(assets\/|admin\/|https?:)/i.test(g) ? g : 'assets/img/' + g))}" alt="" style="width:40px;height:40px;object-fit:cover;border-radius:5px">
          <button type="button" class="btn btn-sm btn-niebezpieczny" data-pgal-usun="${gi}">✕</button>
        </span>`).join('');
      p._roboczaGaleria = galeria;
    };
    p._roboczaGaleria = galeria;
    el('#p-galeria-box').addEventListener('click', (e) => {
      const b = e.target.closest('[data-pgal-usun]');
      if (!b) return;
      galeria.splice(Number(b.getAttribute('data-pgal-usun')), 1);
      odswiezGalerie();
    });
    el('#p-galeria-dodaj-bib').addEventListener('change', (e) => {
      if (!e.target.value) return;
      galeria.push(e.target.value);
      e.target.value = '';
      odswiezGalerie();
    });
    el('#p-galeria-plik').addEventListener('change', async (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      try {
        const sc = await wgrajObraz(f, 'prod-gal-' + (p.id || 'nowy'));
        galeria.push(sc);
        odswiezGalerie();
      } catch (err) { alert(err.message); }
    });
    otworzArkusz();
  }

  function otworzRealizacje(i) {
    trybArkusza = 'realizacja';
    edytowanyIdx = i;
    const r = stan.realizacje[i] || {};
    el('#arkusz-tytul').textContent = r.tytul || 'Nowa realizacja';
    el('#usun-produkt').hidden = false;
    el('#usun-produkt').textContent = 'Usuń realizację';
    el('#gotowe').textContent = 'Gotowe';

    const opcjeProd = '<option value="">— tylko realizacja (na zamówienie) —</option>' +
      stan.produkty.map((p) => `<option value="${esc(p.id)}"${p.id === r.produkt ? ' selected' : ''}>${esc(p.nazwa)} (${p.cena ? p.cena + ' zł' : 'wycena'})</option>`).join('');

    el('#arkusz-pola').innerHTML = `
      <div class="pole"><label for="r-tytul">Tytuł realizacji *</label><input id="r-tytul" value="${esc(r.tytul || '')}"></div>
      <div class="pole-dwa">
        <div class="pole"><label for="r-kat">Kategoria</label><input id="r-kat" value="${esc(r.kategoria || '')}"></div>
        <div class="pole"><label for="r-data">Data</label><input id="r-data" type="date" value="${esc(r.data || '')}"></div>
      </div>
      <div class="pole"><label for="r-opis">Opis realizacji</label><textarea id="r-opis" rows="3">${esc(r.opis || '')}</textarea></div>
      <div class="pole">
        <label for="r-foto">Zdjęcie</label>
        <input id="r-foto" value="${esc(r.foto || '')}">
        <div class="kadr-narzedzia mt-8">
          <select id="r-foto-bib" aria-label="Zdjęcie z biblioteki">${opcjeMediow(r.foto || '')}</select>
          <label class="btn btn-sm">+ Wgraj plik<input type="file" id="r-foto-plik" accept="image/*" hidden></label>
        </div>
      </div>
      <div class="pole">
        <label for="r-produkt">Powiązany produkt w sklepie</label>
        <div class="pole-z-wyborem">
          <select id="r-produkt">${opcjeProd}</select>
          <button type="button" class="btn btn-sm" id="r-utworz-produkt">+ Utwórz produkt z realizacji</button>
        </div>
      </div>
      <div class="akcje-rzad">
        <label class="przelacznik"><input type="checkbox" id="r-widoczna"${r.widoczna !== false ? ' checked' : ''}> Widoczna na stronie</label>
        <label class="przelacznik"><input type="checkbox" id="r-okolicz"${r.okolicznosciowy ? ' checked' : ''}> Okolicznościowy</label>
      </div>`;

    el('#r-foto-bib').addEventListener('change', (e) => { if (e.target.value) el('#r-foto').value = e.target.value; });
    el('#r-foto-plik').addEventListener('change', async (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      try {
        const sc = await wgrajObraz(f, 'real-' + r.id);
        el('#r-foto').value = sc;
        el('#r-foto-bib').innerHTML = opcjeMediow(sc);
      } catch (err) { alert(err.message); }
    });
    el('#r-utworz-produkt').addEventListener('click', () => {
      const pid = 'prod-z-real-' + r.id;
      if (!stan.produkty.some((x) => x.id === pid)) {
        stan.produkty.push({
          id: pid, slug: pid, kolejnosc: stan.produkty.length + 1,
          nazwa: el('#r-tytul').value.trim() || r.tytul,
          kategoria: el('#r-kat').value.trim() || r.kategoria || 'Na zamówienie',
          cena: null, jednostka: 'szt.', dostepny: true,
          foto: el('#r-foto').value.trim() || r.foto, fotoMala: el('#r-foto').value.trim() || r.foto,
          galeria: [], opis: el('#r-opis').value.trim() || r.opis, cechy: [], realizacja: r.id
        });
      }
      el('#r-produkt').innerHTML = '<option value="">— brak —</option>' +
        stan.produkty.map((p) => `<option value="${esc(p.id)}"${p.id === pid ? ' selected' : ''}>${esc(p.nazwa)}</option>`).join('');
      ustawBrudne(true);
      rysujProdukty();
    });
    otworzArkusz();
  }

  function otworzDodatkowaSekcje(i) {
    trybArkusza = 'sekcja';
    edytowanyIdx = i;
    const s = stan.stronaGlowna.dodatkowe_sekcje[i];
    el('#arkusz-tytul').textContent = s.tytul || 'Dodatkowy blok na stronie głównej';
    el('#usun-produkt').hidden = false;
    el('#usun-produkt').textContent = 'Usuń blok';
    el('#gotowe').textContent = 'Gotowe';
    el('#arkusz-pola').innerHTML = `
      <div class="pole-dwa">
        <div class="pole"><label for="ds-eyebrow">Etykieta nad tytułem</label><input id="ds-eyebrow" value="${esc(s.eyebrow || '')}"></div>
        <div class="pole"><label for="ds-tlo">Tło sekcji</label>
          <select id="ds-tlo">
            <option value="jasne"${s.tlo === 'jasne' ? ' selected' : ''}>Jasne (papier)</option>
            <option value="krem"${s.tlo === 'krem' ? ' selected' : ''}>Kremowe (wyróżnione)</option>
            <option value="ciemne"${s.tlo === 'ciemne' ? ' selected' : ''}>Ciemna zieleń</option>
          </select>
        </div>
      </div>
      <div class="pole"><label for="ds-tytul">Tytuł sekcji</label><input id="ds-tytul" value="${esc(s.tytul || '')}"></div>
      <div class="pole">
        <label>Treść sekcji</label>
        <div class="wysiwyg-bar" id="ds-bar">
          <button type="button" data-cmd="bold"><b>B</b></button>
          <button type="button" data-cmd="italic"><i>I</i></button>
          <button type="button" data-cmd="insertUnorderedList">• Lista</button>
          <button type="button" data-cmd="link">🔗 Link</button>
          <button type="button" data-cmd="html">&lt;/&gt; HTML</button>
        </div>
        <div class="wysiwyg-pole" id="ds-tresc" contenteditable="true" style="min-height:130px">${s.tresc || ''}</div>
      </div>
      <div class="pole">
        <label for="ds-foto">Zdjęcie obok tekstu (opcjonalnie)</label>
        <input id="ds-foto" value="${esc(s.foto || '')}">
        <div class="kadr-narzedzia mt-8">
          <select id="ds-foto-bib" aria-label="Zdjęcie z biblioteki">${opcjeMediow(s.foto || '')}</select>
          <label class="btn btn-sm">+ Wgraj<input type="file" id="ds-foto-plik" accept="image/*" hidden></label>
        </div>
      </div>
      <div class="pole-dwa">
        <div class="pole"><label for="ds-btn-t">Napis na przycisku</label><input id="ds-btn-t" value="${esc(s.przyciskTekst || '')}"></div>
        <div class="pole"><label for="ds-btn-l">Adres przycisku</label><input id="ds-btn-l" value="${esc(s.przyciskLink || '')}"></div>
      </div>
      <label class="przelacznik"><input type="checkbox" id="ds-wid"${s.widoczna !== false ? ' checked' : ''}> Pokaż na stronie głównej</label>`;

    podlaczWysiwyg('#ds-bar', '#ds-tresc');
    el('#ds-foto-bib').addEventListener('change', (e) => { if (e.target.value) el('#ds-foto').value = e.target.value; });
    el('#ds-foto-plik').addEventListener('change', async (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      try { el('#ds-foto').value = await wgrajObraz(f, 'blok-' + i); } catch (err) { alert(err.message); }
    });
    otworzArkusz();
  }

  function otworzWlasnaStrone(i) {
    trybArkusza = 'strona';
    edytowanyIdx = i;
    const s = stan.podstrony_wlasne[i];
    el('#arkusz-tytul').textContent = s.tytul || 'Własna podstrona';
    el('#usun-produkt').hidden = false;
    el('#usun-produkt').textContent = 'Usuń podstronę';
    el('#gotowe').textContent = 'Gotowe';
    el('#arkusz-pola').innerHTML = `
      <div class="pole-dwa">
        <div class="pole"><label for="ws-tytul">Tytuł strony (H1 i menu) *</label><input id="ws-tytul" value="${esc(s.tytul || '')}"></div>
        <div class="pole"><label for="ws-slug">Identyfikator URL (slug)</label><input id="ws-slug" value="${esc(s.slug || '')}" placeholder="np. o-nas"></div>
      </div>
      <div class="pole-dwa">
        <div class="pole"><label for="ws-eyebrow">Etykieta nad tytułem</label><input id="ws-eyebrow" value="${esc(s.eyebrow || '')}"></div>
        <div class="pole"><label for="ws-kol">Kolejność</label><input id="ws-kol" type="number" value="${s.kol || 10}"></div>
      </div>
      <div class="pole"><label for="ws-lead">Krótki wstęp pod tytułem</label><textarea id="ws-lead" rows="2">${esc(s.lead || '')}</textarea></div>
      <div class="akcje-rzad">
        <label class="przelacznik"><input type="checkbox" id="ws-wid"${s.widoczna !== false ? ' checked' : ''}> Opublikowana</label>
        <label class="przelacznik"><input type="checkbox" id="ws-menu"${s.menu !== false ? ' checked' : ''}> W górnym menu</label>
        <label class="przelacznik"><input type="checkbox" id="ws-stopka"${s.stopka ? ' checked' : ''}> W stopce</label>
      </div>
      <div class="pole">
        <label>Treść podstrony (edytor WYSIWYG)</label>
        <div class="wysiwyg-bar" id="ws-bar">
          <button type="button" data-cmd="bold"><b>B</b></button>
          <button type="button" data-cmd="italic"><i>I</i></button>
          <button type="button" data-cmd="underline"><u>U</u></button>
          <button type="button" data-cmd="formatBlock" data-arg="h2">H2</button>
          <button type="button" data-cmd="formatBlock" data-arg="h3">H3</button>
          <button type="button" data-cmd="insertUnorderedList">• Lista</button>
          <button type="button" data-cmd="insertOrderedList">1. Lista</button>
          <button type="button" data-cmd="formatBlock" data-arg="blockquote">„Cytat”</button>
          <button type="button" data-cmd="justifyLeft">Lewa</button>
          <button type="button" data-cmd="justifyCenter">Środek</button>
          <button type="button" data-cmd="link">🔗 Link</button>
          <button type="button" data-cmd="btn">⬒ Przycisk CTA</button>
          <button type="button" data-cmd="foto">🖼 Zdjęcie</button>
          <button type="button" data-cmd="html">&lt;/&gt; HTML</button>
        </div>
        <div class="wysiwyg-pole" id="ws-tresc" contenteditable="true">${s.tresc || ''}</div>
      </div>`;
    podlaczWysiwyg('#ws-bar', '#ws-tresc');
    otworzArkusz();
  }

  function zamknijArkusz(anuluj) {
    if (!anuluj && edytowanyIdx >= 0) {
      if (trybArkusza === 'produkt') {
        const pola = {
          nazwa: el('#p-nazwa'), cena: el('#p-cena'), kategoria: el('#p-kategoria'),
          opis: el('#p-opis'), foto: el('#p-foto')
        };
        if (pola.nazwa) {
          const p = stan.produkty[edytowanyIdx];
          p.nazwa = pola.nazwa.value.trim();
          p.cena = pola.cena.value === '' ? null : Number(pola.cena.value);
          p.jednostka = el('#p-jednostka').value.trim() || 'szt.';
          p.kategoria = pola.kategoria.value.trim();
          p.gabaryt = el('#p-gabaryt').value.trim();
          p.tagi = el('#p-tagi').value.trim();
          p.opis = pola.opis.value.trim();
          p.cechy = el('#p-cechy').value.split('\n').map((x) => x.trim()).filter(Boolean);
          p.foto = pola.foto.value.trim();
          p.fotoMala = p.foto;
          p.galeria = p._roboczaGaleria || p.galeria || [];
          delete p._roboczaGaleria;
          p.realizacja = el('#p-realizacja').value || null;
          p.dostepny = el('#p-dostepny').checked;
          ustawBrudne(true);
          rysujProdukty();
          rysujStroneGlowna();
        }
      } else if (trybArkusza === 'realizacja') {
        const r = stan.realizacje[edytowanyIdx];
        if (r && el('#r-tytul')) {
          r.tytul = el('#r-tytul').value.trim();
          r.kategoria = el('#r-kat').value.trim();
          r.data = el('#r-data').value;
          r.opis = el('#r-opis').value.trim();
          r.foto = el('#r-foto').value.trim();
          r.produkt = el('#r-produkt').value || null;
          r.widoczna = el('#r-widoczna').checked;
          r.okolicznosciowy = el('#r-okolicz').checked;
          ustawBrudne(true);
          rysujRealizacje();
        }
      } else if (trybArkusza === 'sekcja') {
        const s = stan.stronaGlowna.dodatkowe_sekcje[edytowanyIdx];
        if (s && el('#ds-tytul')) {
          s.eyebrow = el('#ds-eyebrow').value.trim();
          s.tlo = el('#ds-tlo').value;
          s.tytul = el('#ds-tytul').value.trim();
          s.tresc = el('#ds-tresc').innerHTML;
          s.foto = el('#ds-foto').value.trim();
          s.przyciskTekst = el('#ds-btn-t').value.trim();
          s.przyciskLink = el('#ds-btn-l').value.trim();
          s.widoczna = el('#ds-wid').checked;
          ustawBrudne(true);
          rysujStroneGlowna();
        }
      } else if (trybArkusza === 'strona') {
        const s = stan.podstrony_wlasne[edytowanyIdx];
        if (s && el('#ws-tytul')) {
          s.tytul = el('#ws-tytul').value.trim() || 'Podstrona';
          s.slug = el('#ws-slug').value.trim().toLowerCase().replace(/[^a-z0-9-_]+/g, '-').replace(/^-+|-+$/g, '') || ('strona-' + Date.now());
          s.eyebrow = el('#ws-eyebrow').value.trim();
          s.kol = Number(el('#ws-kol').value) || 10;
          s.lead = el('#ws-lead').value.trim();
          s.widoczna = el('#ws-wid').checked;
          s.menu = el('#ws-menu').checked;
          s.stopka = el('#ws-stopka').checked;
          s.tresc = el('#ws-tresc').innerHTML;
          ustawBrudne(true);
          rysujWlasnePodstrony();
        }
      } else if (trybArkusza === 'wiadomosc') {
        const imie = el('#nw-imie').value.trim();
        const email = el('#nw-email').value.trim();
        const tresc = el('#nw-tresc').value.trim();
        if (!imie || !email || !tresc) { alert('Uzupełnij imię, e-mail i treść.'); return; }
        stan.wiadomosci.unshift({
          id: 'w-' + Date.now(), sygnatura: 'TEST-' + String(stan.wiadomosci.length + 1).padStart(4, '0'),
          data: new Date().toISOString(), temat: 'zapytanie', imie, email,
          telefon: el('#nw-tel').value.trim(), tresc, status: 'nowa', notatka: '', zrodlo: 'panel'
        });
        ustawBrudne(true);
        rysujWiadomosci();
      }
    }
    el('#arkusz').hidden = true;
    document.body.style.overflow = '';
    edytowanyIdx = -1;
    trybArkusza = null;
  }

  el('#arkusz').addEventListener('click', (e) => {
    if (e.target.closest('[data-zamknij]')) zamknijArkusz(trybArkusza === 'wiadomosc');
  });
  el('#gotowe').addEventListener('click', () => zamknijArkusz(false));

  el('#usun-produkt').addEventListener('click', () => {
    if (edytowanyIdx < 0) return;
    if (!confirm('Usunąć tę pozycję? Tej zmiany nie da się cofnąć po zapisie.')) return;
    if (trybArkusza === 'produkt') { stan.produkty.splice(edytowanyIdx, 1); rysujProdukty(); rysujStroneGlowna(); }
    else if (trybArkusza === 'realizacja') { stan.realizacje.splice(edytowanyIdx, 1); rysujRealizacje(); }
    else if (trybArkusza === 'sekcja') { stan.stronaGlowna.dodatkowe_sekcje.splice(edytowanyIdx, 1); rysujStroneGlowna(); }
    else if (trybArkusza === 'strona') { stan.podstrony_wlasne.splice(edytowanyIdx, 1); rysujWlasnePodstrony(); }
    ustawBrudne(true);
    el('#arkusz').hidden = true;
    document.body.style.overflow = '';
    edytowanyIdx = -1;
    trybArkusza = null;
  });

  /* ---------- zapis zbiorczy ---------- */
  async function zapiszWszystko() {
    const ustawienia = { ...stan.ustawienia };
    [...POOLA_STRONY, ...POOLA_KONTAKTU].forEach(([klucz]) => {
      const pole = el('#u-' + klucz);
      if (pole) {
        if (klucz.startsWith('hero_') || klucz === 'sekcja_tytul') stan.stronaGlowna[klucz] = pole.value;
        ustawienia[klucz] = pole.value;
      }
    });
    if (el('#u-stopka_o_nas')) ustawienia.stopka_o_nas = el('#u-stopka_o_nas').value;
    if (el('#u-tryb-testowy-form')) ustawienia.tryb_testowy_formularza = el('#u-tryb-testowy-form').checked;

    const przyciski = [el('#zapisz'), el('#zapisz-gora')].filter(Boolean);
    przyciski.forEach((b) => { b.disabled = true; });
    komunikat('Zapisuję…');
    try {
      const t = token();
      const cialoZapisu = {
        pelneProdukty: true,
        pelneRealizacje: true,
        zastapStroneGlowna: true,
        produkty: stan.produkty,
        realizacje: stan.realizacje,
        stronaGlowna: stan.stronaGlowna,
        menu: stan.menu,
        podstrony_wlasne: stan.podstrony_wlasne,
        podstrony_wbudowane: stan.podstrony_wbudowane,
        elementy: stan.elementy,
        ustawienia,
        wiadomosci: stan.wiadomosci,
        opisZmiany: 'Zapis pełny z panelu'
      };
      if (t) cialoZapisu.token = t;
      const odp = await zapytanie('/api/zapisz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cialoZapisu)
      });
      const d = await odp.json().catch(() => ({}));
      if (odp.ok && d.ok) {
        stan.ustawienia = ustawienia;
        ustawBrudne(false);
        const btnCofnij = el('#przycisk-cofnij');
        if (btnCofnij) btnCofnij.disabled = !(Number(d.historiaIle) > 0);
        komunikat('Zapisane', 'ok');
        rysujPodsumowanie();
      } else {
        komunikat(d.blad || 'Nie udało się zapisać');
      }
    } catch (err) {
      komunikat('Brak połączenia — nic nie zapisano');
    } finally {
      przyciski.forEach((b) => { b.disabled = false; });
    }
  }

  el('#zapisz').addEventListener('click', zapiszWszystko);
  if (el('#zapisz-gora')) el('#zapisz-gora').addEventListener('click', zapiszWszystko);

  el('#odrzuc-niezapisane').addEventListener('click', async () => {
    if (!confirm('Odrzucić niezapisane zmiany i wrócić do ostatnio zapisanej wersji?')) return;
    const d = await (await pobierzStan()).json();
    wczytajDoStanu(d);
    rysujWszystko();
    komunikat('Odrzucono niezapisane zmiany', 'ok');
  });

  el('#przycisk-cofnij').addEventListener('click', async () => {
    if (!confirm('Przywrócić poprzednią zapisaną wersję z historii?')) return;
    const t = token();
    const odp = await zapytanie('/api/cofnij', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(t ? { token: t } : {})
    });
    const d = await odp.json().catch(() => ({}));
    if (odp.ok && d.ok) {
      const s = await (await pobierzStan()).json();
      wczytajDoStanu(s);
      rysujWszystko();
      komunikat('Cofnięto ostatni zapis', 'ok');
    } else {
      komunikat(d.blad || 'Nie udało się cofnąć');
    }
  });

  /* ---------- wylogowanie ---------- */
  el('#przycisk-wyloguj').addEventListener('click', async () => {
    const t = token();
    await zapytanie('/api/wyloguj', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(t ? { token: t } : {})
    }).catch(() => {});
    zapamietajToken('');
    location.reload();
  });

  /* ---------- ostrzeżenie o niezapisanych zmianach ---------- */
  window.addEventListener('beforeunload', (e) => {
    if (!brudne) return;
    e.preventDefault();
    e.returnValue = '';
  });

  /* ---------- auto-wejście przy ważnej sesji ---------- */
  if (typeof fetch === 'function') {
    pobierzStan().then((o) => { if (o.ok) start(); }).catch(() => {});
  }
})();
