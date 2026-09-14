/* ============================================================
   Studio Sygnatura — EDYTOR TREŚCI (edytor.js) v6
   Uniwersalny silnik edycji treści — odzwierciedla podstawowe
   funkcje Microsoft PowerPoint:

   TEKST: czcionka (Google Fonts), rozmiar, B / I / U / przekreślenie,
     kolor tekstu i kolor tła tekstu (z opcją „bez tła" = przezroczyste),
     odstęp między znakami; pasek POKAZUJE czcionkę i rozmiar zaznaczenia.
   AKAPIT: listy punktowane/numerowane, justowanie (lewa/środek/prawa/
     wyjustowanie), wyrównanie pionowe góra/środek/dół (komórki tabeli
     i kształty), kierunek tekstu +90°/−90° (kształty), układ kolumnowy
     1/2/3/4, cytat, etykieta.
   TABELA: wstawianie (wiersze × kolumny, z ramką lub bez), dodawanie
     i usuwanie wierszy/kolumn, przełączanie obramowania.
   RYSOWANIE OBIEKTÓW (sekcja „rysowanie obiektów" — pełna analogia do
     PowerPoint): pole tekstowe, prostokąt, zaokrąglony prostokąt,
     koło/elipsa, linia, strzałka, trójkąt. Każdy element jest OBIEKTEM:
     klik = zaznaczenie, drugie pojedyncze kliknięcie = przełączenie
     trybu rozmiar ↔ obrót (jak w Inkscape), przeciąganie = przesunięcie,
     narożniki = zmiana rozmiaru, zielone kółko = obrót (Shift = co 15°).
     2×klik = okno właściwości: wypełnienie (możliwe przezroczyste),
     ramka (kolor i grubość), kolor/czcionka/rozmiar tekstu, wyrównanie
     pionowe, kierunek tekstu, checkbox „to jest PRZYCISK (klikalny)" +
     pole linku. Ctrl+klik = zaznaczanie kilku obiektów naraz,
     Ctrl+G = GRUPOWANIE (blokada wzajemnego położenia), Ctrl+Shift+G =
     rozgrupowanie, warstwy (na wierzch / na spód / do przodu / do tyłu),
     wyrównywanie względem siebie w pionie i poziomie oraz rozkładanie
     w równych odstępach. Przy zaznaczeniu pokazuje się mini-pasek
     kontekstowy z ikonami funkcji (jak w PowerPoint).

   Użycie:
     var ed = SYG.edytorTresci.stworz(kontener);           // standardowo
     var ed = SYG.edytorTresci.stworz(kontener, poleEl);   // z własnym polem
     ed.ustaw('<h2>…</h2>');   // wczytaj HTML
     ed.pobierz();             // aktualny HTML (do zapisu)
   ============================================================ */
(function () {
  var SANS = "'Segoe UI',Arial,sans-serif";
  var SERIF = "'Cormorant Garamond','Playfair Display',Georgia,serif";
  var MONO = "'Courier New',Courier,monospace";
  var FONTY = {
    serif: SERIF, sans: SANS, mono: MONO,
    georgia: 'Georgia,serif', times: "'Times New Roman',Times,serif",
    arial: 'Arial,Helvetica,sans-serif', verdana: 'Verdana,Geneva,sans-serif',
    impact: 'Impact,Charcoal,sans-serif',
    lato: "'Lato',Arial,sans-serif",
    montserrat: "'Montserrat',Arial,sans-serif",
    oswald: "'Oswald',Arial,sans-serif",
    playfair: "'Playfair Display',Georgia,serif"
  };
  var FONTY_LISTA = [
    ['serif', 'Serif (styl studia)'], ['playfair', 'Playfair Display'],
    ['georgia', 'Georgia'], ['times', 'Times New Roman'],
    ['lato', 'Lato'], ['montserrat', 'Montserrat'], ['oswald', 'Oswald'],
    ['arial', 'Arial'], ['verdana', 'Verdana'], ['sans', 'Segoe UI'],
    ['mono', 'Courier New'], ['impact', 'Impact']
  ];
  var CZCIONKI_WG = {
    'cormorant garamond': 'serif', 'playfair display': 'playfair',
    'georgia': 'georgia', 'times new roman': 'times', 'times': 'times',
    'lato': 'lato', 'montserrat': 'montserrat', 'oswald': 'oswald',
    'arial': 'arial', 'helvetica': 'arial', 'verdana': 'verdana', 'geneva': 'verdana',
    'segoe ui': 'sans', 'courier new': 'mono', 'courier': 'mono', 'impact': 'impact'
  };
  var KSZTALTY_TEKST = ['prostokat', 'zaokraglony', 'elipsa', 'pole'];

  function escA(t){ return String(t == null ? '' : t).replace(/[&"<>]/g, function(c){
    return { '&':'&amp;', '"':'&quot;', '<':'&lt;', '>':'&gt;' }[c]; }); }
  function tekstHtml(t){ return escA(t == null ? '' : t).replace(/\n/g, '<br>'); }
  function tekstZHtml(h){ return String(h == null ? '' : h).replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ''); }
  function opcjeFontow(wybrana){
    return FONTY_LISTA.map(function (f) {
      return '<option value="' + f[0] + '"' + (f[0] === wybrana ? ' selected' : '') + '>' + f[1] + '</option>';
    }).join('');
  }

  /* ---------- mały modal ---------- */
  function modal(tytul, trescHtml, okCb, okEtykieta) {
    var tlo = document.createElement('div');
    tlo.className = 'edtr-modal-tlo';
    var okno = document.createElement('div');
    okno.className = 'edtr-modal';
    okno.innerHTML = '<h3>' + tytul + '</h3>' + trescHtml;
    var guzy = document.createElement('div');
    guzy.className = 'przyciski';
    guzy.style.justifyContent = 'flex-end';
    var anuluj = document.createElement('button');
    anuluj.type = 'button'; anuluj.className = 'btn outline'; anuluj.textContent = 'Anuluj';
    var ok = document.createElement('button');
    ok.type = 'button'; ok.className = 'btn'; ok.textContent = okEtykieta || 'Wstaw';
    guzy.appendChild(anuluj); guzy.appendChild(ok);
    okno.appendChild(guzy);
    tlo.appendChild(okno);
    document.body.appendChild(tlo);
    function zamknij(){ if (tlo.parentNode) tlo.parentNode.removeChild(tlo); }
    anuluj.addEventListener('click', zamknij);
    tlo.addEventListener('click', function (e) { if (e.target === tlo) zamknij(); });
    ok.addEventListener('click', function () {
      var r = okCb && okCb(okno);
      if (r !== false) zamknij();
    });
    return okno;
  }

  /* ============================================================
     KSZTAŁTY — rysowanie obiektów (jak w PowerPoint)
     ============================================================ */
  function budujKsztalt(d) {
    var atry = ' data-ks-typ="' + escA(d.typ) + '" data-ks-tekst="' + escA(d.tekst) + '"' +
      ' data-ks-tlo="' + escA(d.tlo) + '" data-ks-przez="' + (d.przez ? '1' : '') + '"' +
      ' data-ks-ramka="' + escA(d.ramka) + '" data-ks-gr="' + escA(String(d.gr)) + '"' +
      ' data-ks-kolor="' + escA(d.kolor) + '" data-ks-czcionka="' + escA(d.czcionka) + '"' +
      ' data-ks-rozmiar="' + escA(String(d.rozmiar)) + '" data-ks-valign="' + escA(d.valign) + '"' +
      ' data-ks-kier="' + escA(d.kier) + '" data-ks-przycisk="' + (d.przycisk ? '1' : '') + '"' +
      ' data-ks-link="' + escA(d.link) + '" data-ks-rot="' + escA(String(d.rot || 0)) + '"';
    if (d.typ === 'linia') {
      return '<span class="tre-ksztalt tre-linia" contenteditable="false"' + atry +
        ' style="display:inline-block;width:' + d.szer + 'px;height:0;border-top:' + d.gr + 'px solid ' + escA(d.tlo) +
        ';transform:rotate(' + (d.rot || 0) + 'deg);vertical-align:middle"></span>';
    }
    var promien = d.typ === 'elipsa' ? '50%' : (d.typ === 'zaokraglony' ? '14px' : '0');
    var tlo = d.przez ? 'transparent' : d.tlo;
    var ramka = (d.typ === 'trojkat' || d.typ === 'strzalka') ? 'border:none'
      : 'border:' + d.gr + 'px solid ' + (d.ramka === 'transparent' ? 'transparent' : d.ramka);
    var font = FONTY[d.czcionka] || d.czcionka;
    var val = d.valign === 'gora' ? 'flex-start' : (d.valign === 'dol' ? 'flex-end' : 'center');
    var kier = d.kier === '90' ? 'rotate(90deg)' : (d.kier === '270' ? 'rotate(-90deg)' : '');
    var wew = '';
    if (d.typ !== 'trojkat' && d.typ !== 'strzalka') {
      var tresc = tekstHtml(d.tekst);
      wew = d.przycisk
        ? '<a class="tre-ksztalt-a" href="' + escA(d.link || '#') + '">' + tresc + '</a>'
        : tresc;
    }
    return '<span class="tre-ksztalt tre-' + escA(d.typ) + '" contenteditable="false"' + atry +
      ' style="display:inline-block;width:' + d.szer + 'px;height:' + d.wys + 'px;background:' + tlo + ';' + ramka +
      ';border-radius:' + promien + ';vertical-align:middle;transform:rotate(' + (d.rot || 0) + 'deg)">' +
      '<span class="tre-ksztalt-s" style="font-family:' + font + ';color:' + escA(d.kolor) + ';font-size:' + d.rozmiar +
      'px;align-items:' + val + (kier ? ';transform:' + kier : '') + '">' + wew + '</span></span>';
  }

  function czytajKsztalt(ob) {
    if (ob.classList && ob.classList.contains('tre-blok')) {
      /* stary blok z ramką — edytowany przez okno właściwości */
      var st = ob.style || {};
      var bg = st.background || '';
      var przez = !bg || bg === 'transparent' || String(bg).indexOf('transparent') === 0;
      var m = String(st.border || '').match(/(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\))/);
      var r = ob.getBoundingClientRect();
      return { typ: 'blok', tekst: tekstZHtml(ob.innerHTML), tlo: przez ? '#1F3A32' : bg,
        przez: przez, ramka: m ? m[1] : '#C4A582', gr: '1', kolor: '#FBF7F0', czcionka: 'sans',
        rozmiar: 15, valign: 'srodek', kier: '0', przycisk: false, link: '', rot: 0,
        szer: Math.round(r.width) || 300, wys: Math.round(r.height) || 80 };
    }
    var gr = parseInt(ob.getAttribute('data-ks-gr') || '', 10);
    return {
      typ: ob.getAttribute('data-ks-typ') || 'prostokat',
      tekst: ob.getAttribute('data-ks-tekst') || '',
      tlo: ob.getAttribute('data-ks-tlo') || '#1F3A32',
      przez: ob.getAttribute('data-ks-przez') === '1',
      ramka: ob.getAttribute('data-ks-ramka') || '#C4A582',
      gr: gr || 1,
      kolor: ob.getAttribute('data-ks-kolor') || '#FBF7F0',
      czcionka: ob.getAttribute('data-ks-czcionka') || 'serif',
      rozmiar: parseInt(ob.getAttribute('data-ks-rozmiar') || '15', 10) || 15,
      valign: ob.getAttribute('data-ks-valign') || 'srodek',
      kier: ob.getAttribute('data-ks-kier') || '0',
      przycisk: ob.getAttribute('data-ks-przycisk') === '1',
      link: ob.getAttribute('data-ks-link') || '',
      rot: parseFloat(ob.getAttribute('data-ks-rot') || '0') || 0,
      szer: Math.round(ob.getBoundingClientRect().width) || 180,
      wys: Math.round(ob.getBoundingClientRect().height) || 60
    };
  }

  /* okno właściwości obiektu: wypełnienie, ramka, przycisk+link (2×klik) */
  function oknoWlasciwosci(init, cb) {
    var modalOkno = modal('Obiekt — właściwości',
      '<div class="pole"><label>Tekst' + (KSZTALTY_TEKST.indexOf(init.typ) >= 0 ? '' : ' (tylko dla kształtów z tekstem)') + '</label>' +
      '<textarea id="ew-tekst" style="min-height:56px">' + escA(init.tekst) + '</textarea></div>' +
      '<div class="pole" style="display:flex;gap:10px;flex-wrap:wrap">' +
      '<div style="flex:1;min-width:110px"><label>Wypełnienie</label><input type="color" id="ew-tlo" value="' + escA(init.tlo) + '"></div>' +
      '<div style="flex:1;min-width:110px"><label>Ramka</label><input type="color" id="ew-ramka" value="' + escA(init.ramka) + '"></div>' +
      '<div style="flex:1;min-width:110px"><label>Kolor tekstu</label><input type="color" id="ew-kolor" value="' + escA(init.kolor) + '"></div></div>' +
      '<div class="pole" style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-end">' +
      '<label style="cursor:pointer"><input type="checkbox" id="ew-przez" style="width:auto;margin-right:6px"' + (init.przez ? ' checked' : '') + '> Przezroczyste wypełnienie</label>' +
      '<div style="width:110px"><label>Grubość ramki</label><select id="ew-gr">' +
      '<option value="1"' + (init.gr == 1 ? ' selected' : '') + '>1 px</option>' +
      '<option value="2"' + (init.gr == 2 ? ' selected' : '') + '>2 px</option>' +
      '<option value="4"' + (init.gr == 4 ? ' selected' : '') + '>4 px</option></select></div>' +
      '<div style="width:130px"><label>Wyr. pionowe tekstu</label><select id="ew-valign">' +
      '<option value="gora"' + (init.valign === 'gora' ? ' selected' : '') + '>Góra</option>' +
      '<option value="srodek"' + (init.valign === 'srodek' ? ' selected' : '') + '>Środek</option>' +
      '<option value="dol"' + (init.valign === 'dol' ? ' selected' : '') + '>Dół</option></select></div>' +
      '<div style="width:130px"><label>Kierunek tekstu</label><select id="ew-kier">' +
      '<option value="0"' + (init.kier === '0' ? ' selected' : '') + '>Poziomo</option>' +
      '<option value="90"' + (init.kier === '90' ? ' selected' : '') + '>90°</option>' +
      '<option value="270"' + (init.kier === '270' ? ' selected' : '') + '>−90°</option></select></div></div>' +
      '<div class="pole" style="display:flex;gap:10px;flex-wrap:wrap">' +
      '<div style="flex:1;min-width:150px"><label>Czcionka</label><select id="ew-czcionka">' + opcjeFontow(init.czcionka) + '</select></div>' +
      '<div style="width:100px"><label>Rozmiar</label><select id="ew-rozmiar">' +
      [12, 14, 15, 16, 18, 20, 24, 28, 32, 36].map(function (r) {
        return '<option value="' + r + '"' + (init.rozmiar == r ? ' selected' : '') + '>' + r + ' px</option>';
      }).join('') + '</select></div>' +
      '<div style="width:100px"><label>Szerokość (px)</label><input type="number" id="ew-szer" min="10" value="' + init.szer + '"></div>' +
      '<div style="width:100px"><label>Wysokość (px)</label><input type="number" id="ew-wys" min="2" value="' + init.wys + '"></div></div>' +
      '<div class="pole"><label style="cursor:pointer"><input type="checkbox" id="ew-przycisk" style="width:auto;margin-right:6px"' +
      (init.przycisk ? ' checked' : '') + '> To jest PRZYCISK (element klikalny)</label>' +
      '<div id="ew-link-box" style="margin-top:6px;display:' + (init.przycisk ? 'block' : 'none') + '">' +
      '<label>Link (dokąd prowadzi kliknięcie)</label>' +
      '<input type="text" id="ew-link" placeholder="np. sklep.html lub https://…" value="' + escA(init.link) + '"></div></div>' +
      '<p class="mala">Klik = zaznaczenie • drugi klik = tryb obrotu (zielone kółko) • narożniki = rozmiar • przeciąganie = przesunięcie • Ctrl+klik = kilka obiektów • Ctrl+G = grupuj • warstwy i wyrównanie na pasku.</p>',
      function (okno) {
        var d = {
          typ: init.typ,
          tekst: okno.querySelector('#ew-tekst').value,
          tlo: okno.querySelector('#ew-tlo').value,
          przez: okno.querySelector('#ew-przez').checked,
          ramka: okno.querySelector('#ew-ramka').value,
          gr: parseInt(okno.querySelector('#ew-gr').value, 10) || 1,
          kolor: okno.querySelector('#ew-kolor').value,
          czcionka: okno.querySelector('#ew-czcionka').value,
          rozmiar: parseInt(okno.querySelector('#ew-rozmiar').value, 10) || 15,
          valign: okno.querySelector('#ew-valign').value,
          kier: okno.querySelector('#ew-kier').value,
          przycisk: okno.querySelector('#ew-przycisk').checked,
          link: okno.querySelector('#ew-link').value.trim() || '#',
          rot: init.rot,
          szer: Math.max(10, parseInt(okno.querySelector('#ew-szer').value, 10) || init.szer),
          wys: Math.max(2, parseInt(okno.querySelector('#ew-wys').value, 10) || init.wys)
        };
        if (cb(d) === false) return false;
      });
    modalOkno.querySelector('#ew-przez').addEventListener('change', function(){
      modalOkno.querySelector('#ew-tlo').disabled = this.checked;
    });
    modalOkno.querySelector('#ew-przycisk').addEventListener('change', function(){
      modalOkno.querySelector('#ew-link-box').style.display = this.checked ? 'block' : 'none';
    });
    if (init.przez) modalOkno.querySelector('#ew-tlo').disabled = true;
    return modalOkno;
  }

  function zastosujKsztalt(ob, d, zglasz) {
    if (ob.classList && ob.classList.contains('tre-blok')) {
      /* stary blok — aktualizacja stylów bez zmiany klasy */
      ob.style.background = d.przez ? 'transparent' : d.tlo;
      ob.style.border = '1.5px solid ' + (d.ramka === 'transparent' ? 'transparent' : d.ramka);
      ob.style.width = d.szer + 'px';
      ob.style.height = d.wys + 'px';
      var font = FONTY[d.czcionka] || d.czcionka;
      ob.innerHTML = '<p style="color:' + escA(d.kolor) + ';font-family:' + font + ';font-size:' + d.rozmiar + 'px;margin:0">' + tekstHtml(d.tekst) + '</p>';
      if (zglasz) zglasz();
      return ob;
    }
    var tmp = document.createElement('div');
    tmp.innerHTML = budujKsztalt(d);
    var nowy = tmp.firstChild;
    ['position', 'left', 'top', 'right', 'bottom', 'margin', 'zIndex'].forEach(function (p) {
      if (ob.style[p]) nowy.style[p] = ob.style[p];
    });
    var sel = window.getSelection();
    if (sel) sel.removeAllRanges();
    ob.parentNode.replaceChild(nowy, ob);
    if (zglasz) zglasz();
    return nowy;
  }

  /* ---------- stary przycisk-obiekt (wsteczna zgodność) ---------- */
  function budujPrzycisk(d) {
    var font = d.czcionka === 'sans' ? SANS : (d.czcionka === 'mono' ? MONO : SERIF);
    var srodek = d.styl === 'zloty'
      ? '<a class="sl-btn" href="' + escA(d.link) + '">' + escA(d.tekst) + '</a>'
      : '<a class="tre-przycisk tre-' + escA(d.rozmiar) + '" href="' + escA(d.link) +
        '" style="background:' + (d.tlo === 'transparent' ? 'transparent' : escA(d.tlo)) + ';color:' + escA(d.kolor) +
        ';font-family:' + font + '">' + escA(d.tekst) + '</a>';
    return '<span class="tre-przycisk-obiekt" contenteditable="false"' +
      ' data-tb-styl="' + escA(d.styl) + '" data-tb-tekst="' + escA(d.tekst) + '"' +
      ' data-tb-link="' + escA(d.link) + '" data-tb-rozmiar="' + escA(d.rozmiar) + '"' +
      ' data-tb-tlo="' + escA(d.tlo) + '" data-tb-kolor="' + escA(d.kolor) + '"' +
      ' data-tb-czcionka="' + escA(d.czcionka) + '">' + srodek + '</span>';
  }
  function czytajPrzycisk(ob) {
    return {
      styl: ob.getAttribute('data-tb-styl') || 'wlasny',
      tekst: ob.getAttribute('data-tb-tekst') || '',
      link: ob.getAttribute('data-tb-link') || '#',
      rozmiar: ob.getAttribute('data-tb-rozmiar') || 'm',
      tlo: ob.getAttribute('data-tb-tlo') || '#1F3A32',
      kolor: ob.getAttribute('data-tb-kolor') || '#C4A582',
      czcionka: ob.getAttribute('data-tb-czcionka') || 'serif'
    };
  }
  function oknoPrzycisku(init, cb) {
    var modalOkno = modal('Przycisk (stary obiekt)',
      '<div class="pole"><label>Tekst przycisku</label><input type="text" id="eb-tekst" value="' + escA(init.tekst) + '"></div>' +
      '<div class="pole"><label>Link (strona docelowa)</label><input type="text" id="eb-link" value="' + escA(init.link) + '" placeholder="np. sklep.html lub https://…"></div>' +
      '<div class="pole"><label>Styl przycisku</label><select id="eb-styl">' +
      '<option value="zloty"' + (init.styl === 'zloty' ? ' selected' : '') + '>Złoty klasyczny (jak przycisk slajdu)</option>' +
      '<option value="wlasny"' + (init.styl !== 'zloty' ? ' selected' : '') + '>Własny (kolory, rozmiar, czcionka)</option></select></div>' +
      '<div id="eb-wlasny" style="display:' + (init.styl === 'zloty' ? 'none' : 'block') + '">' +
      '<div class="pole"><label>Rozmiar</label><select id="eb-rozmiar">' +
      '<option value="s"' + (init.rozmiar === 's' ? ' selected' : '') + '>Mały (S)</option>' +
      '<option value="m"' + (init.rozmiar === 'm' ? ' selected' : '') + '>Średni (M)</option>' +
      '<option value="l"' + (init.rozmiar === 'l' ? ' selected' : '') + '>Duży (L)</option></select></div>' +
      '<div class="pole"><label style="cursor:pointer"><input type="checkbox" id="eb-przez" style="width:auto;margin-right:8px"' +
      (init.tlo === 'transparent' ? ' checked' : '') + '> Przezroczyste tło (bez koloru)</label></div>' +
      '<div class="pole" style="display:flex;gap:10px">' +
      '<div style="flex:1"><label>Kolor tła</label><input type="color" id="eb-tlo" value="' + escA(init.tlo === 'transparent' ? '#1F3A32' : init.tlo) + '"></div>' +
      '<div style="flex:1"><label>Kolor tekstu</label><input type="color" id="eb-kolor" value="' + escA(init.kolor) + '"></div></div>' +
      '<div class="pole"><label>Czcionka</label><select id="eb-czcionka">' +
      '<option value="serif"' + (init.czcionka === 'serif' ? ' selected' : '') + '>Serif (styl studia)</option>' +
      '<option value="sans"' + (init.czcionka === 'sans' ? ' selected' : '') + '>Bezszeryfowa (nowoczesna)</option>' +
      '<option value="mono"' + (init.czcionka === 'mono' ? ' selected' : '') + '>Maszyna (monospace)</option></select></div>' +
      '</div>',
      function (okno) {
        var tekst = okno.querySelector('#eb-tekst').value.trim();
        var link = okno.querySelector('#eb-link').value.trim() || '#';
        if (!tekst) { alert('Podaj tekst przycisku.'); return false; }
        var styl = okno.querySelector('#eb-styl').value;
        var d = { styl: styl, tekst: tekst, link: link,
          rozmiar: okno.querySelector('#eb-rozmiar').value,
          tlo: okno.querySelector('#eb-przez').checked ? 'transparent' : okno.querySelector('#eb-tlo').value,
          kolor: okno.querySelector('#eb-kolor').value,
          czcionka: okno.querySelector('#eb-czcionka').value };
        if (cb(d) === false) return false;
      });
    modalOkno.querySelector('#eb-styl').addEventListener('change', function(){
      modalOkno.querySelector('#eb-wlasny').style.display = this.value === 'zloty' ? 'none' : 'block';
    });
    modalOkno.querySelector('#eb-przez').addEventListener('change', function(){
      modalOkno.querySelector('#eb-tlo').disabled = this.checked;
    });
    if (init.tlo === 'transparent') modalOkno.querySelector('#eb-tlo').disabled = true;
    return modalOkno;
  }

  /* ---------- fabryka edytora ---------- */
  function stworz(kontener, poleWlasne) {
    if (!kontener) return null;
    kontener.classList.add('edtr');

    var bar = document.createElement('div');
    bar.className = 'edtr-bar';
    kontener.insertBefore(bar, kontener.firstChild);

    var pole = poleWlasne || document.createElement('div');
    if (!poleWlasne){
      pole.className = 'edtr-pole';
      kontener.appendChild(pole);
    }
    pole.contentEditable = 'true';
    pole.setAttribute('aria-label', 'Edytor treści');

    function zglaszaZmiane(){
      try { pole.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) {}
    }

    /* ---------- narzędzia ---------- */
    function B(etykieta, tytul, cmd, arg) {
      var b = document.createElement('button');
      b.type = 'button'; b.title = tytul; b.innerHTML = etykieta;
      b.addEventListener('click', function () {
        pole.focus();
        document.execCommand(cmd, false, arg || null);
      });
      bar.appendChild(b);
      return b;
    }
    function Gr(etykieta, tytul) {
      var s = document.createElement('span');
      s.className = 'edtr-gr'; s.title = tytul; s.innerHTML = etykieta;
      bar.appendChild(s);
    }
    function Sel(opcje, tytul, cb) {
      var s = document.createElement('select');
      s.className = 'edtr-sel'; s.title = tytul;
      opcje.forEach(function (o) {
        var op = document.createElement('option');
        op.value = o.v; op.textContent = o.t;
        s.appendChild(op);
      });
      s.addEventListener('change', function () {
        var v = s.value;
        s.value = '';
        cb(v);
      });
      bar.appendChild(s);
      return s;
    }
    var zamknijWszystkiePalety = function () {};
    function Paleta(znak, tytul, cmd) {
      var przyc = document.createElement('span');
      przyc.className = 'edtr-kolor'; przyc.title = tytul;
      var z = document.createElement('span');
      z.textContent = znak;
      var i = document.createElement('i');
      przyc.appendChild(z); przyc.appendChild(i);
      bar.appendChild(przyc);
      var pop = document.createElement('div');
      pop.className = 'edtr-paleta';
      var KOLORY = ['#33261C','#6B4530','#1F3A32','#C4A582','#E5D9C5','#FBF7F0','#8A2F1D',
        '#B0413E','#C9A227','#2E6E4E','#3D5A80','#B0B0B0','#000000','#FFFFFF'];
      var wybrany = cmd === 'foreColor' ? '#6B4530' : '#E5D9C5';
      pop.innerHTML = '<div class="edtr-paleta-kafle">' + KOLORY.map(function (c) {
        return '<button type="button" class="edtr-kwadrat" style="background:' + c + '" data-c="' + c + '"></button>';
      }).join('') + '</div><div class="edtr-paleta-dol">' +
        '<input type="color" value="' + wybrany + '">' +
        (cmd === 'hiliteColor' ? '<button type="button" class="edtr-bez" title="Bez tła (przezroczyste)">⊘ Bez tła</button>' : '') +
        '<button type="button" class="edtr-ok">OK</button></div>';
      pop.style.display = 'none';
      bar.appendChild(pop);
      function pokazKolor(c) {
        wybrany = c;
        i.style.background = c;
        var inw = pop.querySelector('input[type=color]');
        if (inw) inw.value = c;
      }
      function zamknij() { pop.style.display = 'none'; }
      function otworz() {
        var czy = pop.style.display !== 'none';
        zamknijWszystkiePalety();
        if (czy) return;
        var rp = przyc.getBoundingClientRect();
        var rb = bar.getBoundingClientRect();
        pop.style.left = Math.max(0, rp.left - rb.left) + 'px';
        pop.style.top = (rp.bottom - rb.top + 6) + 'px';
        pop.style.display = 'block';
      }
      przyc.addEventListener('click', function (e) { e.stopPropagation(); otworz(); });
      pop.addEventListener('click', function (e) { e.stopPropagation(); });
      pop.querySelectorAll('.edtr-kwadrat').forEach(function (kw) {
        kw.addEventListener('click', function () { pokazKolor(kw.getAttribute('data-c')); });
      });
      pop.querySelector('input[type=color]').addEventListener('input', function () { pokazKolor(this.value); });
      pop.querySelector('.edtr-ok').addEventListener('click', function () {
        pole.focus();
        document.execCommand(cmd, false, wybrany);
        zamknij();
      });
      var bez = pop.querySelector('.edtr-bez');
      if (bez) bez.addEventListener('click', function () {
        pole.focus();
        document.execCommand('hiliteColor', false, 'transparent');
        zamknij();
      });
      var stara = zamknijWszystkiePalety;
      zamknijWszystkiePalety = function () { stara(); zamknij(); };
      pokazKolor(wybrany);
      return { przyc: przyc, pasek: i };
    }
    document.addEventListener('click', function () { zamknijWszystkiePalety(); });

    function owinSpan(styl) {
      var sel = window.getSelection();
      if (!sel || sel.isCollapsed) return false;
      try {
        var r = sel.getRangeAt(0);
        var sp = document.createElement('span');
        sp.setAttribute('style', styl);
        sp.appendChild(r.extractContents());
        r.insertNode(sp);
        sel.removeAllRanges();
        return true;
      } catch (e) { return false; }
    }
    function stylAkapi(v) {
      pole.focus();
      if (v === 'div.sl-tag') {
        document.execCommand('formatBlock', false, 'div');
        var sel = window.getSelection();
        var n = sel && sel.anchorNode;
        while (n && n !== pole && !(n.nodeType === 1 && n.tagName === 'DIV')) n = n.parentNode;
        if (n && n !== pole) n.className = 'sl-tag';
      } else {
        document.execCommand('formatBlock', false, v);
      }
    }

    /* ================= pasek narzędzi ================= */
    /* --- TEKST (czcionka, rozmiar, styl, kolory, odstęp) --- */
    B('Tytuł', 'Tytuł (nagłówek 2)', 'formatBlock', 'h2');
    B('Podtytuł', 'Podtytuł (nagłówek 3)', 'formatBlock', 'h3');
    B('Tekst', 'Zwykły akapit', 'formatBlock', 'p');
    Gr('|', 'Czcionka, rozmiar, styl, kolory, odstępy');
    var selCzcionka = Sel([{ v:'', t:'Czcionka…' }].concat(FONTY_LISTA.map(function (f) {
      return { v: f[0], t: f[1] };
    })), 'Czcionka (FONT) — zaznacz tekst i wybierz; pasek pokazuje czcionkę zaznaczenia', function (v) {
      if (!v) return;
      var css = FONTY[v] || v;
      if (!owinSpan('font-family:' + css)) document.execCommand('fontName', false, css);
    });
    var selRozmiar = Sel([{ v:'', t:'Rozmiar…' },
      { v:'10', t:'10 px' }, { v:'12', t:'12 px' }, { v:'14', t:'14 px' }, { v:'16', t:'16 px' },
      { v:'18', t:'18 px' }, { v:'20', t:'20 px' }, { v:'24', t:'24 px' }, { v:'28', t:'28 px' },
      { v:'32', t:'32 px' }, { v:'36', t:'36 px' }, { v:'48', t:'48 px' }],
      'Wielkość tekstu — zaznacz tekst i wybierz; pasek pokazuje wielkość zaznaczenia', function (v) {
      if (!v) return;
      if (!owinSpan('font-size:' + v + 'px')) {
        var m = { '10':'1','12':'2','14':'3','16':'4','18':'4','20':'5','24':'5','28':'6','32':'7','36':'7','48':'7' };
        document.execCommand('fontSize', false, m[v] || '4');
      }
    });
    B('<b>B</b>', 'Pogrubienie (Ctrl+B)', 'bold');
    B('<i>I</i>', 'Kursywa (Ctrl+I)', 'italic');
    B('<u>U</u>', 'Podkreślenie', 'underline');
    B('<s>S</s>', 'Przekreślenie', 'strikeThrough');
    var paletaTekst = Paleta('A', 'Kolor tekstu — paleta kolorów z przyciskiem OK', 'foreColor');
    var paletaTlo = Paleta('🖍', 'Kolor tła tekstu (podświetlenie) — z opcją „Bez tła" (przezroczyste)', 'hiliteColor');
    Sel([{ v:'', t:'Odstęp znaków…' }, { v:'0', t:'0 (normalny)' }, { v:'1', t:'1 px' },
      { v:'2', t:'2 px' }, { v:'3', t:'3 px' }, { v:'4', t:'4 px' }, { v:'6', t:'6 px' },
      { v:'8', t:'8 px' }, { v:'-1', t:'−1 px (ścisły)' }],
      'Odstęp między znakami — zaznacz tekst i wybierz', function (v) {
      if (!v) return;
      if (!owinSpan('letter-spacing:' + v + 'px')) alert('Zaznacz tekst, aby ustawić odstęp między znakami.');
    });
    B('✕ Format', 'Wyczyść formatowanie zaznaczenia', 'removeFormat');

    /* --- AKAPIT --- */
    Gr('|', 'Akapit: listy, justowanie, pion, kierunek, kolumny');
    B('• Lista', 'Lista punktowana', 'insertUnorderedList');
    B('1. Lista', 'Lista numerowana', 'insertOrderedList');
    B('„Cytat"', 'Cytat', 'formatBlock', 'blockquote');
    B('⇤', 'Justowanie: do lewej', 'justifyLeft');
    B('↔', 'Justowanie: do środka', 'justifyCenter');
    B('⇥', 'Justowanie: do prawej', 'justifyRight');
    B('≡', 'Justowanie: wyjustuj (rozciągnięcie do lewej i prawej)', 'justifyFull');
    B('⬆', 'Wyrównanie pionowe: góra (komórka tabeli lub kształt)', 'pion-gora');
    B('↕', 'Wyrównanie pionowe: środek (komórka tabeli lub kształt)', 'pion-srodek');
    B('⬇', 'Wyrównanie pionowe: dół (komórka tabeli lub kształt)', 'pion-dol');
    B('↺ +90°', 'Kierunek tekstu: +90° (zaznaczony kształt z tekstem)', 'kier-90');
    B('↻ −90°', 'Kierunek tekstu: −90° (zaznaczony kształt z tekstem)', 'kier-270');
    Sel([{ v:'', t:'Kolumny…' }, { v:'1', t:'1 kolumna' }, { v:'2', t:'2 kolumny' },
      { v:'3', t:'3 kolumny' }, { v:'4', t:'4 kolumny' }],
      'Układ kolumnowy (1–4 kolumny)', function (v) {
      if (!v) return;
      if (v === '1') { pole.focus(); document.execCommand('formatBlock', false, 'p'); return; }
      wstawKolumny(parseInt(v, 10));
    });
    B('🏷 Etykieta', 'Blok-etykieta w ramce (mały napis, np. „Nowości")', 'tag');

    /* --- TABELA --- */
    Gr('|', 'Tabela: wstawianie i edycja');
    B('▦ Tabela…', 'Wstaw tabelę (wiersze × kolumny, z ramką lub bez)', 'tabelaNowa');
    B('+ Wiersz', 'Dodaj wiersz poniżej (stań kursorem w tabeli)', 'tab-wiersz');
    B('+ Kol.', 'Dodaj kolumnę obok (stań kursorem w tabeli)', 'tab-kol');
    B('− Wiersz', 'Usuń wiersz (stań kursorem w tabeli)', 'tab-usun-wiersz');
    B('− Kol.', 'Usuń kolumnę (stań kursorem w tabeli)', 'tab-usun-kol');
    B('◫ Ramka', 'Obramowanie tabeli: włącz / wyłącz', 'tab-ramka');

    /* --- LINKI I MEDIA --- */
    Gr('|', 'Linki i media');
    B('🔗', 'Wstaw link', 'link');
    B('🖼', 'Wstaw obraz (plik)', 'obraz');
    B('▶ Film', 'Wstaw film YouTube', 'youtube');

    /* --- RYSOWANIE OBIEKTÓW (jak PowerPoint) --- */
    Gr('|', 'Rysowanie obiektów: klik = zaznaczenie, 2×klik = właściwości, narożnik = rozmiar, kółko = obrót');
    B('🅃 Pole', 'Pole tekstowe', 'rys-pole');
    B('▭ Prostokąt', 'Prostokąt', 'rys-prostokat');
    B('▢ Zaokrąglony', 'Zaokrąglony prostokąt', 'rys-zaokraglony');
    B('◯ Elipsa', 'Koło / elipsa', 'rys-elipsa');
    B('─ Linia', 'Linia', 'rys-linia');
    B('➜ Strzałka', 'Strzałka', 'rys-strzalka');
    B('△ Trójkąt', 'Trójkąt', 'rys-trojkat');
    B('⊞ Grupuj', 'Grupuj zaznaczone obiekty (blokada wzajemnego położenia, Ctrl+G)', 'grupuj');
    B('⊟ Rozgrupuj', 'Rozgrupuj zaznaczoną grupę (Ctrl+Shift+G)', 'rozgrupuj');

    /* --- OBIEKT: wyrównanie, rozłożenie, warstwy --- */
    Gr('|', 'Obiekt: wyrównanie względem siebie, odstępy, warstwy');
    B('⬅', 'Wyrównaj: do lewej krawędzi (kilka obiektów — względem siebie)', 'obj-lewo');
    B('↔', 'Wyrównaj: do środka (poziomo) (kilka — w jednej kolumnie)', 'obj-srodek');
    B('➡', 'Wyrównaj: do prawej krawędzi (kilka obiektów — względem siebie)', 'obj-prawo');
    B('⬆', 'Wyrównaj: do góry (kilka — w jednej linii)', 'obj-gora');
    B('↕', 'Wyrównaj: do środka (pionowo) (kilka — w jednej linii)', 'obj-srodek-pion');
    B('⬇', 'Wyrównaj: do dołu (kilka obiektów — względem siebie)', 'obj-dol');
    B('⇶', 'Rozłóż w poziomie (jednakowe odstępy)', 'rozloz-poziom');
    B('⇵', 'Rozłóż w pionie (jednakowe odstępy)', 'rozloz-pion');
    B('⤒', 'Warstwa: na wierzch', 'war-wierzch');
    B('🔼', 'Warstwa: do przodu', 'war-przod');
    B('🔽', 'Warstwa: do tyłu', 'war-tyl');
    B('⤓', 'Warstwa: na spód', 'war-spod');
    B('🗑', 'Usuń zaznaczone obiekty (Backspace)', 'usun-obiekty');
    B('⎯ Przerwa', 'Pozioma linia', 'linia');

    /* ---------- link ---------- */
    bar.querySelector('button[title="Wstaw link"]').addEventListener('click', function () {
      pole.focus();
      var url = prompt('Adres (https://…):', 'https://');
      if (url && url !== 'https://') document.execCommand('createLink', false, url);
    });

    /* ---------- obraz ---------- */
    var imgInput = document.createElement('input');
    imgInput.type = 'file';
    imgInput.accept = 'image/*';
    imgInput.style.display = 'none';
    document.body.appendChild(imgInput);
    bar.querySelector('button[title="Wstaw obraz (plik)"]').addEventListener('click', function () {
      imgInput.click();
    });
    imgInput.addEventListener('change', function () {
      var f = imgInput.files && imgInput.files[0];
      if (!f) return;
      var fr = new FileReader();
      fr.onload = function () {
        pole.focus();
        document.execCommand('insertHTML', false,
          '<img src="' + fr.result + '" alt="" style="max-width:100%"><br><br>');
        zglaszaZmiane();
      };
      fr.readAsDataURL(f);
      imgInput.value = '';
    });
    pole.addEventListener('paste', function (e) {
      var items = (e.clipboardData || {}).items || [];
      for (var i = 0; i < items.length; i++) {
        if (items[i].type && items[i].type.indexOf('image') === 0) {
          e.preventDefault();
          var f = items[i].getAsFile();
          var fr = new FileReader();
          fr.onload = function () {
            document.execCommand('insertHTML', false,
              '<img src="' + fr.result + '" alt="" style="max-width:100%"><br>');
            zglaszaZmiane();
          };
          fr.readAsDataURL(f);
          return;
        }
      }
    });

    /* ---------- film YouTube ---------- */
    bar.querySelector('button[title="Wstaw film YouTube"]').addEventListener('click', function () {
      var url = prompt('Link do filmu YouTube:', 'https://www.youtube.com/watch?v=');
      if (!url) return;
      var m = url.match(/(?:v=|youtu\.be\/)([\w-]{6,})/);
      if (!m) { alert('To nie wygląda na link YouTube.'); return; }
      pole.focus();
      document.execCommand('insertHTML', false,
        '<div class="edtr-video"><iframe width="560" height="315" src="https://www.youtube.com/embed/' + m[1] +
        '" frameborder="0" allowfullscreen></iframe></div><p><br></p>');
    });

    /* ---------- kolumny ---------- */
    function wstawKolumny(n) {
      var kom = '<p>Tekst kolumny…</p>';
      var wew = '';
      for (var i = 0; i < n; i++) wew += '<div class="tre-kol">' + kom + '</div>';
      pole.focus();
      document.execCommand('insertHTML', false,
        '<div class="tre-kolumny tre-k-' + n + '">' + wew + '</div><p><br></p>');
    }

    /* ---------- etykieta / linia pozioma ---------- */
    bar.querySelector('button[title^="Blok-etykieta"]').addEventListener('click', function () {
      var txt = prompt('Tekst etykiety (np. „Nowości"):', 'Nowości');
      if (!txt) return;
      pole.focus();
      document.execCommand('insertHTML', false, '<p class="sl-tag">' + escA(txt) + '</p>');
    });
    bar.querySelector('button[title="Pozioma linia"]').addEventListener('click', function () {
      pole.focus();
      document.execCommand('insertHTML', false, '<hr class="tre-linia"><p><br></p>');
    });

    /* ---------- TABELE ---------- */
    function komorka(){
      var sel = window.getSelection();
      if (!sel || !sel.anchorNode) return null;
      var n = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement;
      return n && n.closest ? n.closest('td, th') : null;
    }
    function tabelaOb(){ var k = komorka(); return k ? k.closest('table') : null; }
    bar.querySelector('button[title^="Wstaw tabelę"]').addEventListener('click', function () {
      modal('Tabela',
        '<div class="pole" style="display:flex;gap:10px">' +
        '<div style="flex:1"><label>Wiersze</label><select id="et-r">' +
        [1,2,3,4,5,6].map(function (r) { return '<option value="' + r + '"' + (r === 2 ? ' selected' : '') + '>' + r + '</option>'; }).join('') + '</select></div>' +
        '<div style="flex:1"><label>Kolumny</label><select id="et-c">' +
        [1,2,3,4,5,6].map(function (r) { return '<option value="' + r + '"' + (r === 2 ? ' selected' : '') + '>' + r + '</option>'; }).join('') + '</select></div></div>' +
        '<div class="pole"><label style="cursor:pointer"><input type="checkbox" id="et-ramka" checked style="width:auto;margin-right:8px"> Z obramowaniem</label></div>',
        function (okno) {
          var r = parseInt(okno.querySelector('#et-r').value, 10);
          var c = parseInt(okno.querySelector('#et-c').value, 10);
          var bez = okno.querySelector('#et-ramka').checked ? '' : ' tre-bez';
          var wiersze = '';
          for (var i = 0; i < r; i++) {
            var komorki = '';
            for (var j = 0; j < c; j++) komorki += '<td>Komórka</td>';
            wiersze += '<tr>' + komorki + '</tr>';
          }
          pole.focus();
          document.execCommand('insertHTML', false,
            '<table class="tre-tabela' + bez + '"><tbody>' + wiersze + '</tbody></table><p><br></p>');
          zglaszaZmiane();
        }, 'Wstaw');
    });
    bar.querySelector('button[title="Dodaj wiersz poniżej (stań kursorem w tabeli)"]').addEventListener('click', function () {
      var t = tabelaOb(), k = komorka();
      if (!t) { alert('Stań najpierw kursorem w komórce tabeli.'); return; }
      var row = t.insertRow(k.parentElement.rowIndex + 1);
      for (var i = 0; i < k.parentElement.cells.length; i++) row.insertCell().innerHTML = 'Komórka';
      zglaszaZmiane();
    });
    bar.querySelector('button[title="Dodaj kolumnę obok (stań kursorem w tabeli)"]').addEventListener('click', function () {
      var t = tabelaOb(), k = komorka();
      if (!t) { alert('Stań najpierw kursorem w komórce tabeli.'); return; }
      var idx = k.cellIndex + 1;
      for (var i = 0; i < t.rows.length; i++) t.rows[i].insertCell(idx).innerHTML = 'Komórka';
      zglaszaZmiane();
    });
    bar.querySelector('button[title="Usuń wiersz (stań kursorem w tabeli)"]').addEventListener('click', function () {
      var t = tabelaOb(), k = komorka();
      if (!t) { alert('Stań najpierw kursorem w komórce tabeli.'); return; }
      if (t.rows.length < 2) { alert('To jedyny wiersz tabeli.'); return; }
      t.deleteRow(k.parentElement.rowIndex);
      zglaszaZmiane();
    });
    bar.querySelector('button[title="Usuń kolumnę (stań kursorem w tabeli)"]').addEventListener('click', function () {
      var t = tabelaOb(), k = komorka();
      if (!t) { alert('Stań najpierw kursorem w komórce tabeli.'); return; }
      if (t.rows[0].cells.length < 2) { alert('To jedyna kolumna tabeli.'); return; }
      var idx = k.cellIndex;
      for (var i = 0; i < t.rows.length; i++) t.rows[i].deleteCell(idx);
      zglaszaZmiane();
    });
    bar.querySelector('button[title^="Obramowanie tabeli"]').addEventListener('click', function () {
      var t = tabelaOb();
      if (!t) { alert('Stań najpierw kursorem w komórce tabeli.'); return; }
      t.classList.toggle('tre-bez');
      zglaszaZmiane();
    });

    /* ---------- akapit: pion i kierunek ---------- */
    function pionTekstu(v){
      var k = komorka();
      if (k) {
        k.style.verticalAlign = v === 'gora' ? 'top' : (v === 'dol' ? 'bottom' : 'middle');
        zglaszaZmiane();
        return;
      }
      var ob = obiektZaznaczony();
      if (ob && ob.classList && ob.classList.contains('tre-ksztalt') &&
          KSZTALTY_TEKST.indexOf(ob.getAttribute('data-ks-typ')) >= 0) {
        var w = ob.querySelector('.tre-ksztalt-s');
        if (w) {
          w.style.alignItems = v === 'gora' ? 'flex-start' : (v === 'dol' ? 'flex-end' : 'center');
          ob.setAttribute('data-ks-valign', v);
          zglaszaZmiane();
        }
        return;
      }
      alert('Stań kursorem w komórce tabeli lub zaznacz kształt z tekstem.');
    }
    bar.querySelector('button[title^="Wyrównanie pionowe: góra"]').addEventListener('click', function(){ pionTekstu('gora'); });
    bar.querySelector('button[title^="Wyrównanie pionowe: środek"]').addEventListener('click', function(){ pionTekstu('srodek'); });
    bar.querySelector('button[title^="Wyrównanie pionowe: dół"]').addEventListener('click', function(){ pionTekstu('dol'); });
    function kierunekKsztaltu(stopnie){
      var ob = obiektZaznaczony();
      if (!ob || !ob.classList || !ob.classList.contains('tre-ksztalt')) {
        alert('Zaznacz kształt z tekstem (klik).'); return;
      }
      if (KSZTALTY_TEKST.indexOf(ob.getAttribute('data-ks-typ')) < 0) {
        alert('Ten kształt nie ma tekstu.'); return;
      }
      var w = ob.querySelector('.tre-ksztalt-s');
      if (!w) return;
      var st = ob.getAttribute('data-ks-kier') || '0';
      var nowa = st === String(stopnie) ? '0' : String(stopnie);
      w.style.transform = nowa === '90' ? 'rotate(90deg)' : (nowa === '270' ? 'rotate(-90deg)' : '');
      ob.setAttribute('data-ks-kier', nowa);
      zglaszaZmiane();
    }
    bar.querySelector('button[title^="Kierunek tekstu: +90"]').addEventListener('click', function(){ kierunekKsztaltu('90'); });
    bar.querySelector('button[title^="Kierunek tekstu: −90"]').addEventListener('click', function(){ kierunekKsztaltu('270'); });

    /* ---------- model zaznaczania obiektów ---------- */
    var wybrane = [];
    var trybUchwytu = 'skala';
    var uchwyty = [];
    var klikTimer = null;
    function obiektyEl(){
      var lista = [];
      pole.querySelectorAll('.tre-grupa, .tre-przycisk-obiekt, .tre-ksztalt, .tre-blok, img').forEach(function (el) { lista.push(el); });
      return lista;
    }
    function rysujUchwyty(){
      uchwyty.forEach(function (u) { if (u.parentNode) u.parentNode.removeChild(u); });
      uchwyty = [];
      if (wybrane.length !== 1) return;
      var ob = wybrane[0];
      if (ob.classList && ob.classList.contains('tre-grupa')) return;
      var pr = pole.getBoundingClientRect();
      var r = ob.getBoundingClientRect();
      var L = r.left - pr.left + pole.scrollLeft, T = r.top - pr.top + pole.scrollTop;
      var W = r.width, H = r.height;
      function uchwyt(klasa, kursor, x, y, u){
        var s = document.createElement('span');
        s.className = klasa;
        s.style.left = x + 'px'; s.style.top = y + 'px';
        s.style.cursor = kursor;
        s.setAttribute('data-u', u);
        pole.appendChild(s);
        uchwyty.push(s);
        return s;
      }
      if (trybUchwytu !== 'obrot') {
        uchwyt('tre-uchwyt', 'nwse-resize', L + W - 5, T + H - 5, 'se');
        uchwyt('tre-uchwyt', 'nesw-resize', L + W - 5, T - 5, 'ne');
        uchwyt('tre-uchwyt', 'nesw-resize', L - 5, T + H - 5, 'sw');
        uchwyt('tre-uchwyt', 'nwse-resize', L - 5, T - 5, 'nw');
      }
      uchwyt('tre-uchwyt-obrot', 'grab', L + W / 2 - 7, T - 32, 'obrot');
    }
    function odswiezWybranie(){
      obiektyEl().forEach(function (el) { el.classList.remove('tre-wybrany'); });
      wybrane.forEach(function (el) { if (el && el.classList) el.classList.add('tre-wybrany'); });
      rysujUchwyty();
      rysujKontekst();
    }
    function czyscWybranie(){
      wybrane = [];
      odswiezWybranie();
    }
    function obiektZaznaczony(){
      return wybrane.length === 1 ? wybrane[0] : (wybrane[wybrane.length - 1] || null);
    }
    function zrobAbsolutny(ob){
      if (ob.style.position === 'absolute') return;
      var pr = pole.getBoundingClientRect();
      var r = ob.getBoundingClientRect();
      ob.style.position = 'absolute';
      ob.style.left = Math.max(0, (r.left - pr.left) / pr.width * 100) + '%';
      ob.style.top = Math.max(0, (r.top - pr.top) / pr.height * 100) + '%';
      ob.style.right = 'auto'; ob.style.bottom = 'auto';
      ob.style.margin = '0'; ob.style.zIndex = '5';
    }

    /* ---------- mini-pasek kontekstowy przy zaznaczeniu (ikony jak PowerPoint) ---------- */
    var kontekst = null;
    function rysujKontekst(){
      if (!kontekst) {
        kontekst = document.createElement('div');
        kontekst.className = 'edtr-kontekst';
        function KB(znak, tytul, fn) {
          var b = document.createElement('button');
          b.type = 'button'; b.title = tytul; b.textContent = znak;
          b.addEventListener('click', function (e) {
            e.stopPropagation(); e.preventDefault();
            fn();
          });
          kontekst.appendChild(b);
        }
        KB('✏', 'Edytuj tekst w zaznaczonym kształcie', function () {
          edytujTekstObiektu(obiektZaznaczony());
        });
        KB('🎨', 'Właściwości: wypełnienie, ramka, przycisk/link (2×klik)', function () {
          otworzWlasciwosci(obiektZaznaczony());
        });
        KB('⊞', 'Grupuj zaznaczone (Ctrl+G)', grupuj);
        KB('⊟', 'Rozgrupuj (Ctrl+Shift+G)', rozgrupuj);
        KB('⤒', 'Na wierzch', function(){ warstwa('wierzch'); });
        KB('🔼', 'Do przodu', function(){ warstwa('przod'); });
        KB('🔽', 'Do tyłu', function(){ warstwa('tyl'); });
        KB('⤓', 'Na spód', function(){ warstwa('spod'); });
        KB('🗑', 'Usuń zaznaczone', function () {
          wybrane.forEach(function (el) { if (el.parentNode) el.parentNode.removeChild(el); });
          czyscWybranie();
          zglaszaZmiane();
        });
        pole.appendChild(kontekst);
      }
      if (!wybrane.length) { kontekst.style.display = 'none'; return; }
      var pr = pole.getBoundingClientRect();
      var bL = 1e9, bT = 1e9, bR = -1e9, bB = -1e9;
      wybrane.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.left < bL) bL = r.left;
        if (r.top < bT) bT = r.top;
        if (r.right > bR) bR = r.right;
        if (r.bottom > bB) bB = r.bottom;
      });
      var L = Math.max(0, bL - pr.left + pole.scrollLeft);
      var nad = bT - pr.top + pole.scrollTop - 34;
      var T = nad >= 0 ? nad : (bB - pr.top + pole.scrollTop + 6);
      kontekst.style.display = 'flex';
      kontekst.style.left = L + 'px';
      kontekst.style.top = T + 'px';
    }

    /* ---------- wstawianie kształtów (rysowanie obiektów) ---------- */
    function wstawKsztalt(d){
      var html = budujKsztalt(d) + '&nbsp;';
      var ob = obiektZaznaczony();
      var nowyEl = null;
      if (ob && !(ob.classList && ob.classList.contains('tre-grupa'))){
        ob.insertAdjacentHTML('afterend', html);
        nowyEl = ob.nextElementSibling;
      } else {
        pole.focus();
        document.execCommand('insertHTML', false, html);
      }
      czyscWybranie();
      if (nowyEl && nowyEl.classList && nowyEl.classList.contains('tre-ksztalt')){
        wybrane = [nowyEl];
        odswiezWybranie();
      }
      zglaszaZmiane();
    }
    bar.querySelector('button[title="Pole tekstowe"]').addEventListener('click', function () {
      wstawKsztalt({ typ:'pole', tekst:'Tekst', tlo:'#FBF7F0', przez:true, ramka:'transparent', gr:1,
        kolor:'#33261C', czcionka:'sans', rozmiar:15, valign:'srodek', kier:'0',
        przycisk:false, link:'', rot:0, szer:260, wys:56 });
      /* od razu można pisać — tekst-placeholder jest zaznaczony */
      setTimeout(function () {
        var ob = wybrane[0];
        if (ob && ob.classList && ob.classList.contains('tre-ksztalt')) edytujTekstObiektu(ob, true);
      }, 80);
    });
    bar.querySelector('button[title="Prostokąt"]').addEventListener('click', function () {
      wstawKsztalt({ typ:'prostokat', tekst:'', tlo:'#1F3A32', przez:false, ramka:'#C4A582', gr:2,
        kolor:'#FBF7F0', czcionka:'serif', rozmiar:15, valign:'srodek', kier:'0',
        przycisk:false, link:'', rot:0, szer:180, wys:60 });
    });
    bar.querySelector('button[title="Zaokrąglony prostokąt"]').addEventListener('click', function () {
      wstawKsztalt({ typ:'zaokraglony', tekst:'', tlo:'#1F3A32', przez:false, ramka:'#C4A582', gr:2,
        kolor:'#FBF7F0', czcionka:'serif', rozmiar:15, valign:'srodek', kier:'0',
        przycisk:false, link:'', rot:0, szer:180, wys:60 });
    });
    bar.querySelector('button[title="Koło / elipsa"]').addEventListener('click', function () {
      wstawKsztalt({ typ:'elipsa', tekst:'', tlo:'#1F3A32', przez:false, ramka:'#C4A582', gr:2,
        kolor:'#FBF7F0', czcionka:'serif', rozmiar:15, valign:'srodek', kier:'0',
        przycisk:false, link:'', rot:0, szer:140, wys:140 });
    });
    bar.querySelector('button[title="Linia"]').addEventListener('click', function () {
      wstawKsztalt({ typ:'linia', tekst:'', tlo:'#33261C', przez:false, ramka:'transparent', gr:2,
        kolor:'#FBF7F0', czcionka:'serif', rozmiar:15, valign:'srodek', kier:'0',
        przycisk:false, link:'', rot:0, szer:120, wys:0 });
    });
    bar.querySelector('button[title="Strzałka"]').addEventListener('click', function () {
      wstawKsztalt({ typ:'strzalka', tekst:'', tlo:'#33261C', przez:false, ramka:'transparent', gr:1,
        kolor:'#FBF7F0', czcionka:'serif', rozmiar:15, valign:'srodek', kier:'0',
        przycisk:false, link:'', rot:0, szer:140, wys:24 });
    });
    bar.querySelector('button[title="Trójkąt"]').addEventListener('click', function () {
      wstawKsztalt({ typ:'trojkat', tekst:'', tlo:'#1F3A32', przez:false, ramka:'transparent', gr:1,
        kolor:'#FBF7F0', czcionka:'serif', rozmiar:15, valign:'srodek', kier:'0',
        przycisk:false, link:'', rot:0, szer:100, wys:90 });
    });

    /* ---------- właściwości obiektu (2×klik) ---------- */
    function otworzWlasciwosci(ob){
      if (!ob) { alert('Zaznacz najpierw obiekt (klik).'); return; }
      if (ob.classList && ob.classList.contains('tre-grupa')) {
        alert('To grupa — najpierw ją rozgrupuj (⊟), aby edytować elementy.'); return;
      }
      if (ob.classList && ob.classList.contains('tre-przycisk-obiekt')) {
        var init = czytajPrzycisk(ob);
        oknoPrzycisku(init, function (d) {
          var tmp = document.createElement('div');
          tmp.innerHTML = budujPrzycisk(d);
          var nowy = tmp.firstChild;
          var st = ob.getAttribute('style');
          if (st) nowy.setAttribute('style', st);
          var sel = window.getSelection();
          if (sel) sel.removeAllRanges();
          ob.parentNode.replaceChild(nowy, ob);
          wybrane = [nowy];
          odswiezWybranie();
          zglaszaZmiane();
        });
        return;
      }
      var d0 = czytajKsztalt(ob);
      oknoWlasciwosci(d0, function (d) {
        var nowy = zastosujKsztalt(ob, d, zglaszaZmiane);
        wybrane = [nowy];
        odswiezWybranie();
      });
    }

    /* ---------- edycja tekstu w kształcie (✏) ---------- */
    function edytujTekstObiektu(ob, zaznaczWszystko){
      if (!ob || !ob.classList || !ob.classList.contains('tre-ksztalt')) {
        alert('Zaznacz kształt z tekstem (prostokąt, elipsa, pole tekstowe).'); return;
      }
      if (KSZTALTY_TEKST.indexOf(ob.getAttribute('data-ks-typ')) < 0) {
        alert('Ten kształt nie ma tekstu.'); return;
      }
      var w = ob.querySelector('.tre-ksztalt-s');
      if (!w) return;
      w.setAttribute('contenteditable', 'true');
      w.focus();
      var sel = window.getSelection();
      var r = document.createRange();
      r.selectNodeContents(w);
      if (!zaznaczWszystko) r.collapse(false);
      sel.removeAllRanges();
      sel.addRange(r);
    }
    pole.addEventListener('focusout', function (e) {
      var w = e.target;
      if (w && w.classList && w.classList.contains('tre-ksztalt-s') && w.isContentEditable) {
        var ob = w.closest('.tre-ksztalt');
        w.setAttribute('contenteditable', 'false');
        if (ob) {
          ob.setAttribute('data-ks-tekst', tekstZHtml(w.innerHTML));
          zglaszaZmiane();
        }
      }
    });

    /* ---------- GRUPOWANIE (blokada wzajemnego położenia) ---------- */
    function grupuj(){
      if (wybrane.length < 2) {
        alert('Zaznacz co najmniej 2 obiekty (klik + Ctrl+klik), aby je zgrupować.');
        return;
      }
      for (var i = 0; i < wybrane.length; i++) {
        if (wybrane[i].classList && wybrane[i].classList.contains('tre-grupa')) {
          alert('W zaznaczeniu jest już grupa — najpierw ją rozgrupuj (nie zagnieżdżamy grup).');
          return;
        }
      }
      var pr = pole.getBoundingClientRect();
      var bL = 1e9, bT = 1e9, bR = -1e9, bB = -1e9;
      var rodzice = [];
      wybrane.forEach(function (ob) {
        zrobAbsolutny(ob);
        var r = ob.getBoundingClientRect();
        if (r.left < bL) bL = r.left;
        if (r.top < bT) bT = r.top;
        if (r.right > bR) bR = r.right;
        if (r.bottom > bB) bB = r.bottom;
        if (ob.parentNode && ob.parentNode !== pole && rodzice.indexOf(ob.parentNode) < 0) rodzice.push(ob.parentNode);
      });
      var g = document.createElement('div');
      g.className = 'tre-grupa';
      g.setAttribute('contenteditable', 'false');
      g.style.position = 'absolute';
      g.style.left = Math.max(0, (bL - pr.left) / pr.width * 100) + '%';
      g.style.top = Math.max(0, (bT - pr.top) / pr.height * 100) + '%';
      g.style.width = Math.round(bR - bL) + 'px';
      g.style.height = Math.round(bB - bT) + 'px';
      g.style.zIndex = '5';
      pole.insertBefore(g, wybrane[0]);
      wybrane.forEach(function (ob) {
        var r = ob.getBoundingClientRect();
        ob.style.left = Math.round(r.left - bL) + 'px';
        ob.style.top = Math.round(r.top - bT) + 'px';
        ob.style.right = 'auto'; ob.style.bottom = 'auto';
        ob.style.margin = '0';
        g.appendChild(ob);
      });
      rodzice.forEach(function (p) {
        if (p !== pole && !p.hasChildNodes() === false && p.textContent.trim() === '' && !p.querySelector('img,br,hr,iframe')) {
          if (p.parentNode) p.parentNode.removeChild(p);
        }
      });
      wybrane = [g];
      odswiezWybranie();
      zglaszaZmiane();
    }
    function rozgrupuj(){
      if (!wybrane.length) { alert('Zaznacz grupę (klik), aby ją rozgrupować.'); return; }
      var pr = pole.getBoundingClientRect();
      var nowe = [];
      wybrane.forEach(function (g) {
        if (!(g.classList && g.classList.contains('tre-grupa'))) { nowe.push(g); return; }
        var dzieci = Array.prototype.slice.call(g.children);
        dzieci.forEach(function (ch) {
          var r = ch.getBoundingClientRect();
          ch.style.position = 'absolute';
          ch.style.left = Math.max(0, (r.left - pr.left) / pr.width * 100) + '%';
          ch.style.top = Math.max(0, (r.top - pr.top) / pr.height * 100) + '%';
          ch.style.right = 'auto'; ch.style.bottom = 'auto';
          ch.style.margin = '0'; ch.style.zIndex = '5';
          g.parentNode.insertBefore(ch, g);
          nowe.push(ch);
        });
        if (g.parentNode) g.parentNode.removeChild(g);
      });
      wybrane = nowe;
      odswiezWybranie();
      zglaszaZmiane();
    }
    bar.querySelector('button[title^="Grupuj zaznaczone"]').addEventListener('click', grupuj);
    bar.querySelector('button[title^="Rozgrupuj zaznaczoną"]').addEventListener('click', rozgrupuj);

    /* ---------- WARSTWY (coś nad czymś) ---------- */
    function warstwa(kier){
      if (!wybrane.length) { alert('Zaznacz obiekt(y), aby zmienić warstwę.'); return; }
      wybrane.forEach(zrobAbsolutny);
      var zs = obiektyEl().map(function (o) { return parseFloat(o.style.zIndex) || 5; });
      var maks = Math.max.apply(null, zs.concat([5]));
      var min = Math.min.apply(null, zs.concat([5]));
      wybrane.forEach(function (ob) {
        var z = parseFloat(ob.style.zIndex) || 5;
        if (kier === 'wierzch') z = maks + 1;
        if (kier === 'spod') z = min - 1;
        if (kier === 'przod') z = z + 1;
        if (kier === 'tyl') z = z - 1;
        ob.style.zIndex = String(z);
      });
      zglaszaZmiane();
    }
    bar.querySelector('button[title="Warstwa: na wierzch"]').addEventListener('click', function(){ warstwa('wierzch'); });
    bar.querySelector('button[title="Warstwa: do przodu"]').addEventListener('click', function(){ warstwa('przod'); });
    bar.querySelector('button[title="Warstwa: do tyłu"]').addEventListener('click', function(){ warstwa('tyl'); });
    bar.querySelector('button[title="Warstwa: na spód"]').addEventListener('click', function(){ warstwa('spod'); });
    bar.querySelector('button[title="Usuń zaznaczone obiekty (Backspace)"]').addEventListener('click', function () {
      if (!wybrane.length) { alert('Zaznacz obiekt(y) do usunięcia.'); return; }
      wybrane.forEach(function (el) { if (el.parentNode) el.parentNode.removeChild(el); });
      czyscWybranie();
      zglaszaZmiane();
    });

    /* ---------- WYRÓWNANIE OBIEKTÓW (jeden → pole; kilka → względem siebie) ---------- */
    function wyrownajObiekt(strona){
      if (!wybrane.length) {
        alert('Zaznacz najpierw obiekt(y): klik = jeden, Ctrl+klik = kilka naraz (jak w PowerPoint).');
        return;
      }
      var pr = pole.getBoundingClientRect();
      function pxn(p){ return (p / pr.width * 100) + '%'; }
      function pyn(p){ return (p / pr.height * 100) + '%'; }
      var dane = wybrane.map(function (ob) {
        var or = ob.getBoundingClientRect();
        return { ob: ob, l: or.left - pr.left, t: or.top - pr.top, w: or.width, h: or.height };
      });
      if (wybrane.length === 1){
        var it = dane[0];
        if (strona === 'lewo') it.ob.style.left = '1.5%';
        if (strona === 'prawo') it.ob.style.left = pxn(Math.max(0, pr.width - it.w - pr.width * 0.015));
        if (strona === 'srodek') it.ob.style.left = pxn(Math.max(0, (pr.width - it.w) / 2));
        if (strona === 'gora') it.ob.style.top = '1.5%';
        if (strona === 'dol') it.ob.style.top = pyn(Math.max(0, pr.height - it.h - pr.height * 0.015));
        if (strona === 'srodek-pion') it.ob.style.top = pyn(Math.max(0, (pr.height - it.h) / 2));
      } else {
        var minL = Math.min.apply(null, dane.map(function (x) { return x.l; }));
        var maxR = Math.max.apply(null, dane.map(function (x) { return x.l + x.w; }));
        var minT = Math.min.apply(null, dane.map(function (x) { return x.t; }));
        var maxB = Math.max.apply(null, dane.map(function (x) { return x.t + x.h; }));
        var sx = (minL + maxR) / 2, sy = (minT + maxB) / 2;
        dane.forEach(function (it) {
          var L = it.l, T = it.t;
          if (strona === 'lewo') L = minL;
          if (strona === 'prawo') L = maxR - it.w;
          if (strona === 'srodek') L = sx - it.w / 2;
          if (strona === 'gora') T = minT;
          if (strona === 'dol') T = maxB - it.h;
          if (strona === 'srodek-pion') T = sy - it.h / 2;
          it.ob.style.left = pxn(Math.max(0, Math.min(L, pr.width - it.w)));
          it.ob.style.top = pyn(Math.max(0, Math.min(T, pr.height - it.h)));
        });
      }
      dane.forEach(function (it) {
        it.ob.style.position = 'absolute';
        it.ob.style.right = 'auto'; it.ob.style.bottom = 'auto';
        it.ob.style.margin = '0'; it.ob.style.zIndex = '5';
      });
      odswiezWybranie();
      zglaszaZmiane();
    }
    function rozlozObiekty(kier){
      if (wybrane.length < 3) {
        alert('Zaznacz co najmniej 3 obiekty (Ctrl+klik), aby je rozłożyć w równych odstępach.');
        return;
      }
      var pr = pole.getBoundingClientRect();
      var dane = wybrane.map(function (ob) {
        var or = ob.getBoundingClientRect();
        return { ob: ob, l: or.left - pr.left, t: or.top - pr.top, w: or.width, h: or.height };
      });
      if (kier === 'poziom'){
        dane.sort(function (a, b) { return a.l - b.l; });
        var sumaW = dane.reduce(function (su, x) { return su + x.w; }, 0);
        var minL = dane[0].l, maxR = dane[dane.length - 1].l + dane[dane.length - 1].w;
        var gap = Math.max(0, (maxR - minL - sumaW) / (dane.length - 1));
        var x = dane[0].l;
        dane.forEach(function (it) {
          it.ob.style.left = (x / pr.width * 100) + '%';
          it.ob.style.position = 'absolute';
          it.ob.style.right = 'auto'; it.ob.style.bottom = 'auto';
          it.ob.style.margin = '0'; it.ob.style.zIndex = '5';
          x += it.w + gap;
        });
      } else {
        dane.sort(function (a, b) { return a.t - b.t; });
        var sumaH = dane.reduce(function (su, x) { return su + x.h; }, 0);
        var minT = dane[0].t, maxB = dane[dane.length - 1].t + dane[dane.length - 1].h;
        var gap2 = Math.max(0, (maxB - minT - sumaH) / (dane.length - 1));
        var y = dane[0].t;
        dane.forEach(function (it) {
          it.ob.style.top = (y / pr.height * 100) + '%';
          it.ob.style.position = 'absolute';
          it.ob.style.right = 'auto'; it.ob.style.bottom = 'auto';
          it.ob.style.margin = '0'; it.ob.style.zIndex = '5';
          y += it.h + gap2;
        });
      }
      odswiezWybranie();
      zglaszaZmiane();
    }
    bar.querySelector('button[title="Wyrównaj: do lewej krawędzi"]').addEventListener('click', function(){ wyrownajObiekt('lewo'); });
    bar.querySelector('button[title="Wyrównaj: do środka (poziomo)"]').addEventListener('click', function(){ wyrownajObiekt('srodek'); });
    bar.querySelector('button[title="Wyrównaj: do prawej krawędzi"]').addEventListener('click', function(){ wyrownajObiekt('prawo'); });
    bar.querySelector('button[title="Wyrównaj: do góry"]').addEventListener('click', function(){ wyrownajObiekt('gora'); });
    bar.querySelector('button[title="Wyrównaj: do środka (pionowo)"]').addEventListener('click', function(){ wyrownajObiekt('srodek-pion'); });
    bar.querySelector('button[title="Wyrównaj: do dołu"]').addEventListener('click', function(){ wyrownajObiekt('dol'); });
    bar.querySelector('button[title="Rozłóż w poziomie (jednakowe odstępy)"]').addEventListener('click', function(){ rozlozObiekty('poziom'); });
    bar.querySelector('button[title="Rozłóż w pionie (jednakowe odstępy)"]').addEventListener('click', function(){ rozlozObiekty('pion'); });

    /* ---------- DRAG&DROP + uchwyty rozmiaru i obrotu ---------- */
    var drag = null, justDragged = false, uchwytDrag = null;
    pole.addEventListener('pointerdown', function (e) {
      var t = e.target;
      /* uchwyty: rozmiar (narożniki) i obrót (kółko) */
      if (t && t.classList && (t.classList.contains('tre-uchwyt') || t.classList.contains('tre-uchwyt-obrot'))) {
        e.preventDefault(); e.stopPropagation();
        var ob = wybrane[0];
        var pr = pole.getBoundingClientRect();
        var r = ob.getBoundingClientRect();
        if (ob.style.position !== 'absolute'){
          ob.style.position = 'absolute';
          ob.style.left = Math.max(0, (r.left - pr.left) / pr.width * 100) + '%';
          ob.style.top = Math.max(0, (r.top - pr.top) / pr.height * 100) + '%';
          ob.style.right = 'auto'; ob.style.bottom = 'auto';
          ob.style.margin = '0'; ob.style.zIndex = '5';
          r = ob.getBoundingClientRect();
        }
        if (t.classList.contains('tre-uchwyt-obrot')){
          uchwytDrag = { typ:'obrot', ob: ob,
            cx: r.left + r.width / 2, cy: r.top + r.height / 2,
            a0: Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)),
            rot0: parseFloat(ob.getAttribute('data-ks-rot') || '0') || 0 };
        } else {
          uchwytDrag = { typ:'skala', ob: ob, k: t.getAttribute('data-u'),
            L0: r.left - pr.left, T0: r.top - pr.top, R0: r.left - pr.left + r.width, B0: r.top - pr.top + r.height };
        }
        return;
      }
      if (t && t.closest && t.closest('[contenteditable="true"]')) return;
      if (!(t && t.closest) || e.button !== 0) return;
      var grp = t.closest('.tre-grupa');
      var ob = grp || t.closest('.tre-przycisk-obiekt, .tre-ksztalt, .tre-blok, img');
      if (!ob) return;
      if (e.ctrlKey || e.metaKey){
        var ix = wybrane.indexOf(ob);
        if (ix >= 0) wybrane.splice(ix, 1); else wybrane.push(ob);
      } else if (wybrane.indexOf(ob) < 0){
        wybrane = [ob];
      }
      clearTimeout(klikTimer);
      odswiezWybranie();
      var pr = pole.getBoundingClientRect();
      var start = wybrane.map(function (el) {
        var r = el.getBoundingClientRect();
        return { el: el, offX: e.clientX - r.left, offY: e.clientY - r.top,
                 left0: r.left - pr.left, top0: r.top - pr.top, w0: r.width, h0: r.height };
      });
      drag = { start: start, startX: e.clientX, startY: e.clientY, przes: false };
      e.preventDefault();
      if (ob.setPointerCapture) try { ob.setPointerCapture(e.pointerId); } catch(_){}
    });
    pole.addEventListener('pointermove', function (e) {
      if (uchwytDrag){
        if (uchwytDrag.typ === 'obrot'){
          var a = Math.atan2(e.clientY - uchwytDrag.cy, e.clientX - uchwytDrag.cx);
          var deg = uchwytDrag.rot0 + (a - uchwytDrag.a0) * 180 / Math.PI;
          if (e.shiftKey) deg = Math.round(deg / 15) * 15;
          deg = Math.round(deg);
          uchwytDrag.ob.style.transform = 'rotate(' + deg + 'deg)';
          uchwytDrag.ob.setAttribute('data-ks-rot', String(deg));
        } else {
          var pr = pole.getBoundingClientRect();
          var x = e.clientX - pr.left, y = e.clientY - pr.top;
          var L = uchwytDrag.L0, T = uchwytDrag.T0, R = uchwytDrag.R0, B = uchwytDrag.B0;
          var k = uchwytDrag.k;
          if (k.indexOf('e') >= 0) R = x;
          if (k.indexOf('w') >= 0) L = x;
          if (k.indexOf('s') >= 0) B = y;
          if (k.indexOf('n') >= 0) T = y;
          if (R - L < 20) { if (k.indexOf('w') >= 0) L = R - 20; else R = L + 20; }
          if (B - T < 14) { if (k.indexOf('n') >= 0) T = B - 14; else B = T + 14; }
          uchwytDrag.ob.style.left = L + 'px';
          uchwytDrag.ob.style.top = T + 'px';
          uchwytDrag.ob.style.width = (R - L) + 'px';
          uchwytDrag.ob.style.height = (B - T) + 'px';
        }
        rysujUchwyty();
        rysujKontekst();
        e.preventDefault();
        return;
      }
      if (!drag) return;
      var dx = e.clientX - drag.startX, dy = e.clientY - drag.startY;
      if (!drag.przes && Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
      var pr = pole.getBoundingClientRect();
      if (!drag.przes){
        drag.przes = true;
        drag.start.forEach(function (it) {
          it.el.style.position = 'absolute';
          it.el.style.left = Math.max(0, it.left0 / pr.width * 100) + '%';
          it.el.style.top = Math.max(0, it.top0 / pr.height * 100) + '%';
          it.el.style.right = 'auto'; it.el.style.bottom = 'auto';
          it.el.style.margin = '0'; it.el.style.zIndex = '5';
        });
      }
      drag.start.forEach(function (it) {
        var l = Math.min(Math.max(0, it.left0 + dx), pr.width - it.w0);
        var t2 = Math.min(Math.max(0, it.top0 + dy), pr.height - it.h0);
        it.el.style.left = (l / pr.width * 100) + '%';
        it.el.style.top = (t2 / pr.height * 100) + '%';
      });
      rysujUchwyty();
      rysujKontekst();
      e.preventDefault();
    });
    pole.addEventListener('pointerup', function () {
      if (uchwytDrag && uchwytDrag.typ === 'skala'){
        var pr = pole.getBoundingClientRect();
        var ob = uchwytDrag.ob;
        ob.style.left = (parseFloat(ob.style.left) / pr.width * 100) + '%';
        ob.style.top = (parseFloat(ob.style.top) / pr.height * 100) + '%';
        zglaszaZmiane();
      }
      if (uchwytDrag && uchwytDrag.typ === 'obrot') zglaszaZmiane();
      if (uchwytDrag) justDragged = true;
      if (drag && drag.przes){ justDragged = true; zglaszaZmiane(); }
      drag = null;
      uchwytDrag = null;
    });
    pole.addEventListener('pointercancel', function () { drag = null; uchwytDrag = null; });

    /* ---------- klik: zaznaczenie / przełączenie trybu rozmiar↔obrót ---------- */
    pole.addEventListener('click', function (e) {
      if (justDragged){ justDragged = false; return; }
      var t = e.target;
      if (t && t.classList && (t.classList.contains('tre-uchwyt') || t.classList.contains('tre-uchwyt-obrot'))) return;
      if (t && t.closest){
        if (t.closest('[contenteditable="true"]')) return;
        var grp = t.closest('.tre-grupa');
        var ob = grp || t.closest('.tre-przycisk-obiekt, .tre-ksztalt, .tre-blok, img');
        if (ob){
          e.preventDefault();
          /* drugie pojedyncze kliknięcie tego samego obiektu = tryb rozmiar ↔ obrót (jak Inkscape) */
          if (!e.ctrlKey && !e.metaKey && wybrane.length === 1 && wybrane[0] === ob){
            clearTimeout(klikTimer);
            klikTimer = setTimeout(function () {
              trybUchwytu = trybUchwytu === 'obrot' ? 'skala' : 'obrot';
              rysujUchwyty();
            }, 260);
          }
          return;
        }
        var a = t.closest('a');
        if (a) e.preventDefault(); /* linki w edytorze nie nawigują */
        if (!e.ctrlKey && !e.metaKey) czyscWybranie();
      }
    });
    pole.addEventListener('dblclick', function (e) {
      clearTimeout(klikTimer);
      var t = e.target;
      if (!(t && t.closest)) return;
      var grp = t.closest('.tre-grupa');
      var ob = grp || t.closest('.tre-przycisk-obiekt, .tre-ksztalt, .tre-blok');
      if (!ob) return;
      e.preventDefault();
      if (ob === grp) { alert('To grupa — rozgrupuj (⊟), aby edytować elementy.'); return; }
      wybrane = [ob];
      odswiezWybranie();
      otworzWlasciwosci(ob);
    });

    /* ---------- klawisze ---------- */
    function usunWybrane(e){
      var tg = e.target;
      if (tg && tg.closest && tg.closest('[contenteditable="true"]')) return;
      if ((e.ctrlKey || e.metaKey) && (e.key === 'g' || e.key === 'G')){
        e.preventDefault();
        if (e.shiftKey) rozgrupuj(); else grupuj();
        return;
      }
      if (e.key === 'Escape'){
        if (wybrane.length) czyscWybranie();
        return;
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && wybrane.length){
        var wPolu = tg === pole || (pole.contains(tg) &&
          !(tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA' || tg.tagName === 'SELECT'));
        var naTle = tg === document.body || tg === document.documentElement;
        if (wPolu || naTle){
          e.preventDefault();
          wybrane.forEach(function (el) { if (el.parentNode) el.parentNode.removeChild(el); });
          czyscWybranie();
          zglaszaZmiane();
        }
      }
    }
    pole.addEventListener('keydown', usunWybrane);
    document.addEventListener('keydown', usunWybrane);

    /* ---------- pasek pokazuje czcionkę i wielkość zaznaczonego tekstu ---------- */
    document.addEventListener('selectionchange', function () {
      var sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      var n = sel.anchorNode;
      var el = n && n.nodeType === 1 ? n : (n && n.parentElement);
      if (!el || !pole.contains(el)) return;
      if (el.closest && el.closest('.tre-przycisk-obiekt, .tre-ksztalt, .tre-blok, .tre-grupa, [contenteditable="true"]')) return;
      var cs = window.getComputedStyle(el);
      var fam = String(cs.fontFamily || '').split(',')[0].replace(/['"]/g, '').trim().toLowerCase();
      var klucz = CZCIONKI_WG[fam] || '';
      selCzcionka.value = klucz;
      if (paletaTekst) paletaTekst.pasek.style.background = cs.color || '#6B4530';
      var px = Math.round(parseFloat(cs.fontSize) || 16);
      var naj = '', najlepsza = 99;
      ['10','12','14','16','18','20','24','28','32','36','48'].forEach(function (r) {
        var od = Math.abs(parseInt(r, 10) - px);
        if (od < najlepsza){ najlepsza = od; naj = r; }
      });
      selRozmiar.value = naj;
    });

    /* ---------- API ---------- */
    return {
      ustaw: function (html) {
        pole.innerHTML = html || '';
        pole.querySelectorAll('.tre-blok').forEach(function (b) { b.setAttribute('contenteditable', 'false'); });
        pole.querySelectorAll('[contenteditable="true"]').forEach(function (el) {
          if (el !== pole) el.removeAttribute('contenteditable');
        });
        czyscWybranie();
      },
      pobierz: function () {
        pole.querySelectorAll('.tre-ksztalt-s[contenteditable="true"]').forEach(function (w) {
          var ob = w.closest('.tre-ksztalt');
          w.setAttribute('contenteditable', 'false');
          if (ob) ob.setAttribute('data-ks-tekst', tekstZHtml(w.innerHTML));
        });
        return pole.innerHTML;
      },
      focus: function () { pole.focus(); }
    };
  }

  window.SYG = window.SYG || {};
  SYG.edytorTresci = { stworz: stworz };
})();
