/* ============================================================
   Studio Sygnatura v2 — wspólny układ (pasek, nagłówek, stopka, karty)
   Układ wg makiety strony głównej, ale bez elementów, których nie ma:
   - brak konta i koszyka (nie działają) — zamiast nich telefon,
     e-mail i przycisk „Zapytaj o wycenę”,
   - wszystkie dane (telefon, e-mail, produkty, ceny, zdjęcia) pochodzą
     z data/dane.js, czyli z plików produkcyjnych,
   - gdy zdjęcia nie ma w danych, renderuje się szary placeholder,
     nigdy wymyślona grafika.
   ============================================================ */
(function () {
  'use strict';
  const D = window.SYG_DANE || {};

  /* ---------- nakładka z panelu (window.SYG_PANEL) ----------
     Panel zapisuje w admin/panele/dane.json to, co operator zmienił.
     Strona czyta ten plik jako window.SYG_PANEL i nakłada zmiany na dane
     produkcyjne (data/dane.js). Nie ma pliku → strona działa jak dotąd.
     Produkty: puste pole w panelu NIE kasuje wartości produkcyjnej;
     nowe produkty (id „nowy-…") dokładają się na końcu listy. */
  const P = window.SYG_PANEL || {};
  const PU = P.ustawienia || {};
  function nalozPanel() {
    if (!P || (!P.produkty && !P.ustawienia)) return;

    if (PU.telefon) {
      D.firma = D.firma || {};
      D.firma.tel = PU.telefon;
      D.firma.telHref = 'tel:' + String(PU.telefon).replace(/[^\d+]/g, '');
    }
    if (PU.mail) { D.firma = D.firma || {}; D.firma.mail = PU.mail; D.firma.mailHref = 'mailto:' + PU.mail; }
    if (PU.obszar) { D.firma = D.firma || {}; D.firma.obszar = PU.obszar; }

    if (Array.isArray(P.produkty)) {
      const wgId = new Map((D.produkty || []).map((p) => [p.id, p]));
      P.produkty.forEach((z) => {
        if (wgId.has(z.id)) {
          const cel = wgId.get(z.id);
          ['nazwa', 'cena', 'kategoria', 'opis', 'foto', 'fotoMala', 'jednostka', 'dostepny', 'kolejnosc']
            .forEach((k) => { if (z[k] !== '' && z[k] != null) cel[k] = z[k]; });
        } else if (z.nazwa) {
          D.produkty = D.produkty || [];
          D.produkty.push({ ...z, kolejnosc: z.kolejnosc != null ? z.kolejnosc : 999 });
        }
      });
    }
  }
  nalozPanel();

  const F = D.firma || {};
  const Q = new URLSearchParams(location.search);

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const zl = (n) => String(Math.round(Number(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' zł';

  const I = {
    tel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 16.2v2.6a2 2 0 0 1-2.2 2 18.6 18.6 0 0 1-8.1-2.9 18.3 18.3 0 0 1-5.6-5.6A18.6 18.6 0 0 1 1.7 4.1 2 2 0 0 1 3.7 1.9h2.6a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.5 2.1L7.3 9.5a14.8 14.8 0 0 0 6.6 6.6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.6 2.6.7a2 2 0 0 1 1.7 2Z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="15" rx="1.5"/><path d="m3 6.3 9 6.7 9-6.7"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10.2c0 5.5-8 11.8-8 11.8S4 15.7 4 10.2a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.7"/></svg>',
    zegar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7.6V12l3 1.9"/></svg>',
    szukaj: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20.5 20.5-4.2-4.2"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 6.5h17v13h-17z"/><path d="M3.5 6.5 12 12l8.5-5.5"/></svg>',
    kciuk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 10.5h3v9h-3z"/><path d="M6.5 19.5h9.8a2 2 0 0 0 2-1.6l1.2-6a2 2 0 0 0-2-2.4h-4.1l.7-4a1.6 1.6 0 0 0-1.6-1.9h-.6L6.5 10.5"/></svg>',
    liscie: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19c8 0 13-5 13-13-8 0-13 5-13 13Z"/><path d="M5 19c2.4-5 5-8 9-10"/></svg>',
    serce: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20.2S3.6 15 3.6 9.4A4.6 4.6 0 0 1 12 6.8a4.6 4.6 0 0 1 8.4 2.6c0 5.6-8.4 10.8-8.4 10.8Z"/></svg>',
    prezent: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 8.5h17v3.6h-17z"/><path d="M5 12.1h14v8.4H5z"/><path d="M12 8.5v12"/><path d="M12 8.5S10.6 3.8 8.3 3.8a2.4 2.4 0 0 0 0 4.7M12 8.5s1.4-4.7 3.7-4.7a2.4 2.4 0 0 1 0 4.7"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.6" r=".9" fill="currentColor" stroke="none"/></svg>',
    strzalka: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15"/><path d="m13 6 6 6-6 6"/></svg>',
    dalej: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    zamknij: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    dzwonek: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 9.5a5.5 5.5 0 0 1 11 0c0 4 1.5 5.5 1.5 5.5H5s1.5-1.5 1.5-5.5Z"/><path d="M10 18.5a2 2 0 0 0 4 0"/></svg>',
    ramka: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16v16H4z"/><path d="m4 16 5-5 4 4 3-3 4 4"/><circle cx="9" cy="9" r="1.4"/></svg>',
    konto: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3.6"/><path d="M4.8 20.2c.6-3.6 3.6-5.7 7.2-5.7s6.6 2.1 7.2 5.7"/></svg>',
    koszyk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.4 7.8h15.2l-1.4 11.4a1.7 1.7 0 0 1-1.7 1.5H7.5a1.7 1.7 0 0 1-1.7-1.5Z"/><path d="M8.9 10.4V7.2a3.1 3.1 0 0 1 6.2 0v3.2"/></svg>',
    kalendarz: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.6" y="5.4" width="16.8" height="15" rx="1.6"/><path d="M3.6 9.8h16.8M8.4 3.6v3.4M15.6 3.6v3.4"/></svg>',
    ciezarowka: '<svg viewBox="0 0 32 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 5h14v11H2z"/><path d="M16 8.5h6.2l4.3 4.2v3.3H16z"/><circle cx="7.6" cy="18.4" r="2.2"/><circle cx="21.6" cy="18.4" r="2.2"/><path d="M4.4 2.4h8M3 9.2h9"/></svg>',
    medal: '<svg viewBox="0 0 32 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="16" cy="9" r="6.2"/><path d="m13.2 13.6-.9 7.4 3.7-2 3.7 2-.9-7.4"/><path d="m13.6 9 1.9 1.9 3.2-3.4"/></svg>',
    czat: '<svg viewBox="0 0 32 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4.4h24v13.4H12.4L6.6 22v-4.2H4z"/><circle cx="12" cy="11" r="1.05" fill="currentColor" stroke="none"/><circle cx="16" cy="11" r="1.05" fill="currentColor" stroke="none"/><circle cx="20" cy="11" r="1.05" fill="currentColor" stroke="none"/></svg>',
    koperta: '<svg viewBox="0 0 32 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.6" y="4" width="26.8" height="16" rx="1.4"/><path d="m3.4 5.4 12.6 9 12.6-9"/></svg>',
    serce2: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20.4S3.5 15 3.5 9.3A4.7 4.7 0 0 1 12 6.6a4.7 4.7 0 0 1 8.5 2.7c0 5.7-8.5 11.1-8.5 11.1Z"/></svg>',
    fb: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5V11H8.5v3H11v7h2.5z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.15" fill="currentColor" stroke="none"/></svg>',
    yt: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.6 7.4a2.5 2.5 0 0 0-1.8-1.8C18.2 5.2 12 5.2 12 5.2s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.4C2 9 2 12 2 12s0 3 .4 4.6a2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8C22 15 22 12 22 12s0-3-.4-4.6ZM10 15.2V8.8l5.2 3.2Z"/></svg>',
    pin2: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.9 0 1.3.6 1.3 1.4 0 .9-.6 2.2-.9 3.4-.2 1 .5 1.8 1.5 1.8 1.8 0 3.2-1.9 3.2-4.7 0-2.4-1.8-4.1-4.3-4.1-2.9 0-4.6 2.2-4.6 4.4 0 .9.3 1.8.8 2.3l-.3 1.1c-.1.4-.3.5-.6.3-1.1-.5-1.8-2.1-1.8-3.4 0-2.8 2-5.3 5.8-5.3 3 0 5.4 2.2 5.4 5 0 3-1.9 5.4-4.5 5.4-.9 0-1.7-.5-2-1l-.6 2.2c-.2.8-.7 1.7-1 2.3A10 10 0 1 0 12 2z"/></svg>'
  };

  /* Każda pozycja prowadzi do istniejącej strony albo do konkretnej
     sekcji (anchor) — nie tworzymy linków „w pustkę” ani pustych stron. */
  /* Etykiety i kolejność 1:1 z makiety. Każda pozycja prowadzi do
     istniejącej strony albo do konkretnej sekcji na stronie. */
  /* Kanały społecznościowe. Trzeci element = adres; pusty = nie pokazujemy
     ikony, żeby nie prowadziła donikąd. Wpisujemy tu prawdziwy link do
     kanału YouTube, gdy będzie — ikona pojawi się sama.
     Facebook / Instagram / Pinterest: adresy z profilu firmy. */
  // adresy z księgi znaku; pusty adres = ikona widoczna, ale nieklikalna.
  // Panel może nadpisać każdy adres przez SYG_PANEL.ustawienia.<fb|ig|pin|yt>.
  const POLE_SOCIAL = ['fb', 'ig', 'pin', 'youtube'];
  const SOCIAL = [
    ['Facebook', 'fb', PU.fb || 'https://www.facebook.com/p/Studio-SygNatura-61595255863642/'],
    ['Instagram', 'ig', PU.ig || 'https://www.instagram.com/studiosygnatura/'],
    ['Pinterest', 'pin2', PU.pin || 'https://pl.pinterest.com/studiosygnatura/'],
    ['YouTube', 'yt', PU.youtube || '']
  ];

  /* Pola, które operator może zmienić klikając w element na stronie.
     Te same nazwy co w panelu; edytor (admin/edytor.js) ich używa. */
  const POLA = {
    hero_tytul: { etykieta: 'Nagłówek na stronie głównej', typ: 'wielo' },
    hero_lead: { etykieta: 'Podtytuł pod nagłówkiem', typ: 'wielo' },
    hero_przycisk: { etykieta: 'Napis na przycisku', typ: 'krotkie' },
    sekcja_tytul: { etykieta: 'Tytuł sekcji z produktami', typ: 'krotkie' },
    telefon: { etykieta: 'Telefon', typ: 'krotkie' },
    mail: { etykieta: 'E-mail', typ: 'krotkie' },
    obszar: { etykieta: 'Obszar działania', typ: 'krotkie' },
    youtube: { etykieta: 'Adres kanału YouTube', typ: 'krotkie' },
    fb: { etykieta: 'Adres Facebooka', typ: 'krotkie' },
    ig: { etykieta: 'Adres Instagrama', typ: 'krotkie' },
    pin: { etykieta: 'Adres Pinterest', typ: 'krotkie' }
  };
  window.SYG_POLA = POLA;

  const MENU = [
    ['sklep.html', 'Produkty', true],
    ['realizacje.html', 'Szopki'],
    ['wspolpraca.html#okazje', 'Dekoracje okolicznościowe'],
    ['wspolpraca.html#firmy', 'Dla firm'],
    ['realizacje.html', 'Inspiracje'],
    ['pracownia.html', 'O nas'],
    ['kontakt.html', 'Kontakt']
  ];

  const biezaca = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const telHref = F.telHref || 'tel:+48538124538';


  /* ---------- koszyk i konto: czytamy PRAWDZIWE klucze produkcyjne ----------
     Koszyk produkcji trzyma dane w localStorage pod 'syg-koszyk-v1'
     (patrz docs/assets/koszyk.js), a konto w 'syg-konto' (docs/assets/api.js).
     Nic tu nie zapisujemy — tylko odczyt, żeby licznik i podpis w nagłówku
     pokazywały rzeczywisty stan, a nie zmyśloną liczbę. */
  const KLUCZ_KOSZYKA = 'syg-koszyk-v1';
  const KLUCZ_KONTA = 'syg-konto';

  function czytajLS(klucz) {
    try { return JSON.parse(localStorage.getItem(klucz) || 'null'); } catch (e) { return null; }
  }

  function stanKoszyka() {
    const k = czytajLS(KLUCZ_KOSZYKA) || {};
    const pozycje = Array.isArray(k.pozycje) ? k.pozycje : [];
    const suma = pozycje.reduce((s, p) => s + (Number(p.cena || 0) * Number(p.ile || p.ilosc || 1)), 0);
    const sztuk = pozycje.reduce((s, p) => s + Number(p.ile || p.ilosc || 1), 0);
    return { sztuk, suma };
  }

  function stanKonta() {
    const k = czytajLS(KLUCZ_KONTA);
    if (!k || !k.email) return null;
    const imie = String(k.imie || '').trim();
    return { podpis: imie ? imie : 'Moje konto', email: k.email };
  }

  /* plaik: szary placeholder, gdy zdjęcia nie ma w danych */
  function foto(klasa, src, alt, szer, wys, atrybuty) {
    if (src) {
      return `<img class="${klasa}" src="${esc(src)}" alt="${esc(alt)}"${szer ? ` width="${szer}" height="${wys}"` : ''} ${atrybuty || 'loading="lazy" decoding="async"'}>`;
    }
    return `<span class="ph-brak ${klasa}" role="img" aria-label="Brak zdjęcia: ${esc(alt)}">${I.ramka}zdjęcie w przygotowaniu</span>`;
  }


  /* ---------- znak wg księgi znaku ----------
     Nazwa to SYGNATURA. Logotyp z księgi znaku ma SYG kreskowane
     (ok. 211 kresek w pliku) i NATURA lite (9 kresek) — dlatego SYG jest
     z natury jaśniejsze. Wzmacniamy to kryciem 50% (klasa .syg / --krycie),
     żeby akcent położyć na NATURA. Pod spodem „STUDIO ARTYSTYCZNE" złotem
     — zgodnie z ustaleniem, że wyjaśnia ono, skąd „Studio" w nazwie.
     Znak jest w jednym kolorze (brąz #6B4530 na kremie, biel na ciemnym tle). */
  /* Układy znaku:
       'poziomo'  — sygnet obok nazwy (nagłówek); podpis rozciągnięty
                    na szerokość napisu SYGNATURA
       'pionowo'  — sygnet u góry, pod nim nazwa i podpis (stopka);
                    podpis również na szerokość napisu */
  function znak(odmiana, uklad) {
    const ciemny = odmiana === 'ciemny';
    const c = ciemny ? '-bialy' : '';
    const pionowo = uklad === 'pionowo';
    return `
    <span class="znak znak-${ciemny ? 'ciemny' : 'jasny'}${pionowo ? ' znak-pionowo' : ''}">
      <img class="znak-sygnet" src="assets/sygnet-${ciemny ? 'bialy' : 'braz'}.svg" alt="" width="60" height="60">
      <span class="znak-tekst">
        <span class="znak-nazwa" role="img" aria-label="SYGNATURA">
          <img class="syg" src="assets/logotyp-syg${c}.svg" alt="" aria-hidden="true">
          <img class="natura" src="assets/logotyp-natura${c}.svg" alt="" aria-hidden="true">
        </span>
        <span class="znak-podpis">Studio artystyczne</span>
      </span>
    </span>`;
  }


  /* ---------- podpis na szerokość napisu SYGNATURA ----------
     Mierzy realną szerokość napisu (SYG + NATURA razem) i podpisu,
     a potem dobiera odstęp liter tak, żeby podpis kończył się dokładnie
     pod ostatnią literą A. Działa po wczytaniu obrazków i po zmianie
     rozmiaru okna. Jeśli pomiar jest niemożliwy (np. brak layoutu),
     zostaje wartość z CSS — strona się nie psuje. */
  function dopasujPodpisy() {
    document.querySelectorAll('.znak').forEach((z) => {
      const nazwa = z.querySelector('.znak-nazwa');
      const podpis = z.querySelector('.znak-podpis');
      const syg = z.querySelector('.syg');
      const natura = z.querySelector('.natura');
      if (!nazwa || !podpis || !syg || !natura) return;

      // szerokość napisu = suma szerokości obu obrazków (są w jednej linii, gap:0)
      const szerNapis = syg.getBoundingClientRect().width + natura.getBoundingClientRect().width;
      if (!szerNapis) return;

      // najpierw zerujemy odstęp, żeby zmierzyć „goły" tekst
      podpis.style.letterSpacing = '0px';
      const szerTekstu = podpis.getBoundingClientRect().width;
      if (!szerTekstu) return;

      // ile brakuje i na ile przerw między literami to rozłożyć
      const liter = podpis.textContent.trim().length;
      const przerw = Math.max(1, liter - 1);
      const odstep = (szerNapis - szerTekstu) / przerw;
      if (odstep > -2) podpis.style.letterSpacing = odstep.toFixed(2) + 'px';
    });
  }

  function pilnujPodpisow() {
    dopasujPodpisy();
    // obrazki SVG mogą doładować się po pierwszym pomiarze
    document.querySelectorAll('.znak-nazwa img').forEach((img) => {
      if (!img.complete) img.addEventListener('load', dopasujPodpisy, { once: true });
    });
    let ostatnia = 0;
    window.addEventListener('resize', () => {
      const teraz = Date.now();
      if (teraz - ostatnia > 120) { ostatnia = teraz; dopasujPodpisy(); }
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(dopasujPodpisy);
  }

  function naglowek() {
    const menu = MENU.map(([href, etykieta, rozwijane], i) => {
      const plik = href.split('#')[0];
      const pierwszy = MENU.findIndex(m => m[0].split('#')[0] === plik);
      const aktywna = plik === biezaca && pierwszy === i;
      return `<a href="${href}"${aktywna ? ' aria-current="page"' : ''}>${etykieta}`
        + (rozwijane ? `<span class="nav-strzalka" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9.5 6 6 6-6"/></svg></span>` : '')
        + '</a>';
    }).join('');

    const koszyk = stanKoszyka();
    const konto = stanKonta();
    const badge = koszyk.sztuk > 0 ? `<span class="ha-badge">${koszyk.sztuk}</span>` : '';

    return `
<a class="skip" href="#tresc">Przejdź do treści</a>
<header class="site-head">
  <div class="head-top">
    <a class="brand" href="index.html" aria-label="Sygnatura — strona główna">${znak('jasny')}</a>

    <form class="search" action="szukaj.html" method="get" role="search">
      <label class="sr" for="q-head">Szukaj produktów, kategorii, inspiracji</label>
      ${I.szukaj}
      <input id="q-head" type="search" name="q" minlength="2" placeholder="Szukaj produktów, kategorii, inspiracji..." autocomplete="off">
      <button type="submit" aria-label="Szukaj">Szukaj</button>
    </form>

    <div class="head-akcje">
      <a class="ha-item tel" href="${esc(telHref)}" data-pole="telefon">
        ${I.tel}<div><b>${esc(F.tel)}</b><span>Odpowiedź 1–2 dni robocze</span></div>
      </a>
      <span class="ha-sep" aria-hidden="true"></span>
      <a class="ha-item konto" href="konto.html">
        ${I.konto}<div><b>${esc(konto ? konto.podpis : 'Moje konto')}</b><span>${konto ? 'Panel klienta' : 'Zaloguj się'}</span></div>
      </a>
      <span class="ha-sep" aria-hidden="true"></span>
      <a class="ha-item koszyk" href="koszyk.html">
        <span class="ha-ikona">${I.koszyk}${badge}</span>
        <div><b>Koszyk</b><span>${koszyk.suma > 0 ? zl(koszyk.suma) : '0,00 zł'}</span></div>
      </a>
    </div>

    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-glowna" aria-label="Menu">${I.menu}</button>
  </div>

  <nav class="head-nav" aria-label="Menu główne">
    <div class="nav-inner" id="nav-glowna">${menu}</div>
    <a class="nav-czas" href="${esc(telHref)}">${I.tel}<span>${esc(F.tel)}</span></a>
  </nav>
</header>`;
  }

  function stopka() {
    return `
<footer class="site-foot">
  <div class="foot-main wrap">
    <div class="foot-brand">
      <a class="brand" href="index.html" aria-label="Sygnatura — strona główna">${znak('ciemny', 'pionowo')}</a>
    </div>

    <div>
      <h4>O nas</h4>
      <p class="foot-about">Studio Sygnatura to mała pracownia z pasji do drewna i detalu.
      Tworzymy rzeczy, które mają znaczenie.</p>
    </div>

    <div>
      <h4>Przydatne linki</h4>
      <ul>
        <li><a href="sklep.html">Jak zamawiać</a></li>
        <li><a href="pracownia.html">Czas realizacji i dostawa</a></li>
        <li><a href="kontakt.html">Zwroty i reklamacje</a></li>
        <li><a href="kontakt.html#faq">FAQ</a></li>
      </ul>
    </div>

    <div>
      <h4>Bądźmy w kontakcie</h4>
      <div class="social">
        ${SOCIAL.map(([nazwa, ikona, adres], i) => adres
          ? `<a href="${esc(adres)}" data-pole="${POLE_SOCIAL[i]}" target="_blank" rel="noopener noreferrer" aria-label="${esc(nazwa)}" title="${esc(nazwa)}">${I[ikona]}</a>`
          : `<span class="social-brak" role="img" data-pole="${POLE_SOCIAL[i]}" aria-label="${esc(nazwa)} — kanał w przygotowaniu" title="${esc(nazwa)} — kanał w przygotowaniu">${I[ikona]}</span>`
        ).join('')}
      </div>
      <p class="social-label">Zapisz się do newslettera</p>
      <form class="newsletter" data-newsletter novalidate>
        <label class="sr" for="news-mail">Adres e-mail do newslettera</label>
        <input id="news-mail" type="email" name="email" placeholder="Twój adres e-mail" autocomplete="email">
        <button type="submit" aria-label="Zapisz się do newslettera">${I.strzalka}</button>
      </form>
      <p class="newsletter-note" data-newsletter-info></p>
    </div>

    <div>
      <h4>Kontakt</h4>
      <ul class="foot-contact">
        <li>${I.tel}<a href="${esc(telHref)}">${esc(F.tel)}</a></li>
        <li>${I.mail}<a href="mailto:${esc(F.mail)}" data-pole="mail">${esc(F.mail)}</a></li>
        <li>${I.pin}<span data-pole="obszar">Studio Sygnatura, ${esc(F.obszar)}</span></li>
      </ul>
    </div>
  </div>
</footer>`;
  }

  /* ---------- odznaki: tylko to, co potwierdzają dane ---------- */
  function odznakaProduktu(p) {
    const o = D.odznaki || {};
    if (o.bestseller && o.bestseller.produkt === p.id) return ['Bestseller', 'bestseller'];
    if (o.nowosc && o.nowosc.produkt === p.id) return ['Nowość', 'nowosc'];
    if (o.okolicznosciowy && o.okolicznosciowy.produkt === p.id) return ['Okolicznościowy', 'okolicznosciowy'];
    return null;
  }

  /* karta produktu wg makiety: zdjęcie + kolumna z opisem i ceną */
  function kartaProduktu(p) {
    const od = odznakaProduktu(p);
    const badge = od ? `<span class="badge ${od[1]}">${od[0]}</span>` : '';
    const href = 'produkt.html?id=' + encodeURIComponent(p.id);
    return `
<article class="pcard">
  <a class="pcard-foto" href="${href}" aria-label="${esc(p.nazwa)} — szczegóły">
    ${badge}
    ${p.fotoMala || p.foto
      ? `<img src="${esc(p.fotoMala || p.foto)}" srcset="${esc(p.fotoMala || p.foto)} 420w, ${esc(p.foto || p.fotoMala)} 700w"
             sizes="(max-width:1020px) 40vw, 14vw" alt="${esc(p.nazwa)}" loading="lazy" decoding="async" width="420" height="525">`
      : `<span class="ph-brak" role="img" aria-label="Brak zdjęcia: ${esc(p.nazwa)}">${I.ramka}zdjęcie w przygotowaniu</span>`}
  </a>
  <div class="pcard-body">
    <span class="pcard-cat">${esc(p.kategoria)}</span>
    <h3><a href="${href}">${esc(p.nazwa)}</a></h3>
    <p class="pcard-opis">${esc(p.opis)}</p>
    <span class="pcard-cena">${p.cena ? zl(p.cena) : 'wycena indywidualna'}${p.cena ? `<small>/ ${esc(p.jednostka || 'szt.')}</small>` : ''}</span>
    <div class="pcard-foot">
      <a class="link-arrow" href="${href}">Zobacz produkt ${I.strzalka}</a>
    </div>
  </div>
</article>`;
  }

  function kartaRealizacji(r) {
    const href = r.produkt
      ? `produkt.html?id=${encodeURIComponent(r.produkt)}`
      : `kontakt.html?temat=projekt&projekt=${encodeURIComponent(r.tytul)}`;
    const kotwica = biezaca === 'realizacje.html' ? ` id="${esc(r.slug || '')}"` : '';
    return `
<a class="rcard"${kotwica} href="${href}">
  ${foto('', r.foto, r.tytul, 620, 465)}
  <div class="rcard-body">
    <span class="rcard-cat">${esc(r.kategoria)}</span>
    <h3>${esc(r.tytul)}</h3>
    <p>${esc(r.opis)}</p>
    <span class="rc-foot">${r.produkt ? '<span>Cena w sklepie</span>' : '<span>Na zamówienie</span>'}
      <span class="link-arrow">${r.produkt ? 'Zobacz produkt' : 'Zapytaj o wycenę'} ${I.strzalka}</span></span>
  </div>
</a>`;
  }

  /* ---------- newsletter: bez zmyślonego „zapisano” ---------- */
  function podepnijNewsletter() {
    const f = document.querySelector('[data-newsletter]');
    if (!f) return;
    const info = document.querySelector('[data-newsletter-info]');
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const mail = (f.querySelector('[name="email"]') || {}).value || '';
      const ok = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(mail.trim());
      if (!ok) {
        if (info) info.textContent = 'Podaj poprawny adres e-mail, żeby zapisać się do listy.';
        f.querySelector('[name="email"]').focus();
        return;
      }
      /* Nie mamy jeszcze podłączonej listy mailingowej — mówimy to wprost
         i dajemy działającą drogę: e-mail z prośbą o dopisanie. */
      const href = `mailto:${D.firma.mail}?subject=${encodeURIComponent('Prośba o dopisanie do listy')}`
        + `&body=${encodeURIComponent('Proszę dopisać mnie do listy informacji o nowych rzeczach: ' + mail.trim())}`;
      if (info) {
        info.innerHTML = 'Lista mailingowa nie jest jeszcze podłączona. '
          + `<a class="dopisek-zloty" href="${esc(href)}">Wyślij prośbę e-mailem</a>, `
          + 'a dopiszemy Cię ręcznie.';
      }
    });
  }

  function montuj() {
    const h = document.getElementById('naglowek');
    const f = document.getElementById('stopka');
    if (h) h.outerHTML = naglowek();
    if (f) f.outerHTML = stopka();

    const toggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('nav-glowna');
    if (toggle && nav) {
      toggle.addEventListener('click', () => {
        const otwarte = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(otwarte));
        toggle.innerHTML = otwarte ? I.zamknij : I.menu;
        toggle.setAttribute('aria-label', otwarte ? 'Zamknij menu' : 'Menu');
      });
      nav.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.innerHTML = I.menu; toggle.focus(); }
      });
    }

    const q = Q.get('q');
    if (q && biezaca === 'szukaj.html') {
      const pole = document.getElementById('q-head');
      if (pole) pole.value = q;
    }

    document.querySelectorAll('[data-produkty]').forEach(el => {
      const ile = Number(el.getAttribute('data-ile')) || 0; // 0 = wszystkie
      const lista = (D.produkty || [])
        .slice()
        .sort((a, b) => (a.kolejnosc || 0) - (b.kolejnosc || 0))
        .slice(0, ile > 0 ? ile : undefined);
      el.innerHTML = lista.map(kartaProduktu).join('');
    });

    /* dłuższe teksty z panelu dostają mniejszy stopień pisma,
       żeby hero nadal mieściło się w swojej kolumnie bez nachodzenia na zdjęcie */
    [['#hero-tytul', 'hero_tytul', 46], ['.hero-lead', 'hero_lead', 96]].forEach(([sel, pole, limit]) => {
      const el = document.querySelector(sel);
      if (el && PU[pole] && String(PU[pole]).length > limit) el.classList.add('male');
    });

    document.querySelectorAll('[data-realizacje]').forEach(el => {
      const ile = Number(el.getAttribute('data-ile')) || 0;
      const lista = (D.realizacje || []).slice(0, ile > 0 ? ile : undefined);
      el.innerHTML = lista.map(kartaRealizacji).join('');
    });

    /* treści strony z panelu: [selektor, pole] — podmieniamy tylko wtedy,
       gdy operator coś wpisał, żeby puste pole nie wyczyściło tekstu */
    [['#hero-tytul', 'hero_tytul', true], ['.hero-lead', 'hero_lead', true],
     ['#produkty-tytul', 'sekcja_tytul', false]].forEach(([sel, pole, wielolinia]) => {
      const el = document.querySelector(sel);
      const tekst = PU[pole];
      if (!el || !tekst) return;
      if (wielolinia) el.innerHTML = esc(tekst).replace(/\n/g, '<br>');
      else el.textContent = tekst;
    });

    podepnijNewsletter();
    pilnujPodpisow();
    document.dispatchEvent(new CustomEvent('sygnatura:gotowe'));
  }

  window.SYG_UI = { esc, zl, I, IKONA: I, kartaProduktu, kartaRealizacji, odznakaProduktu, MENU, foto, POLA };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montuj);
  else montuj();
})();
