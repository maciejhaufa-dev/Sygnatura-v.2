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
  var SANS = "'Montserrat','Lato',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";
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
    ['montserrat', 'Montserrat (Księga Znaku)'], ['lato', 'Lato'],
    ['serif', 'Cormorant (styl studia)'], ['playfair', 'Playfair Display'],
    ['georgia', 'Georgia'], ['times', 'Times New Roman'],
    ['oswald', 'Oswald'], ['arial', 'Arial'], ['verdana', 'Verdana'],
    ['sans', 'Bezszeryfowa'], ['mono', 'Maszyna (mono)'], ['impact', 'Impact']
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
  function budujKsztalt(d, leftPos, topPos) {
    var isAbs = (d && d.pos === 'absolute') || !!leftPos;
    var posCss = isAbs
      ? 'position:absolute;left:' + (leftPos || '20%') + ';top:' + (topPos || '20%') + ';z-index:5;margin:0;'
      : 'display:inline-block;';
    var atry = ' data-ks-typ="' + escA(d.typ) + '" data-ks-tekst="' + escA(d.tekst) + '"' +
      ' data-ks-tlo="' + escA(d.tlo) + '" data-ks-przez="' + (d.przez ? '1' : '') + '"' +
      ' data-ks-ramka="' + escA(d.ramka) + '" data-ks-gr="' + escA(String(d.gr)) + '"' +
      ' data-ks-kolor="' + escA(d.kolor) + '" data-ks-czcionka="' + escA(d.czcionka) + '"' +
      ' data-ks-rozmiar="' + escA(String(d.rozmiar)) + '" data-ks-valign="' + escA(d.valign) + '"' +
      ' data-ks-kier="' + escA(d.kier) + '" data-ks-przycisk="' + (d.przycisk ? '1' : '') + '"' +
      ' data-ks-link="' + escA(d.link) + '" data-ks-rot="' + escA(String(d.rot || 0)) + '"';
    if (d.typ === 'linia') {
      return '<span class="tre-ksztalt tre-linia" contenteditable="false"' + atry +
        ' style="' + posCss + 'display:inline-block;width:' + d.szer + 'px;height:0;border-top:' + d.gr + 'px solid ' + escA(d.tlo) +
        ';transform:rotate(' + (d.rot || 0) + 'deg);vertical-align:middle;touch-action:none;cursor:move"></span>';
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
      ' style="' + posCss + 'display:inline-block;width:' + d.szer + 'px;height:' + d.wys + 'px;background:' + tlo + ';' + ramka +
      ';border-radius:' + promien + ';vertical-align:middle;transform:rotate(' + (d.rot || 0) + 'deg);touch-action:none;cursor:move">' +
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

    /* Usuwamy ewentualne stare paski narzędzi w tym kontenerze, aby zapobiec powstawaniu podwójnych pasków */
    var stareBary = kontener.querySelectorAll('.edtr-bar');
    stareBary.forEach(function (b) { b.remove(); });

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

    /* ---------- narzędzia (WSTĄŻKA POWERPOINT / CANVA) ---------- */
    function dodajGrupe(nazwa) {
      var gr = document.createElement('div');
      gr.className = 'edtr-grupa';
      var cialo = document.createElement('div');
      cialo.className = 'edtr-grupa-cialo';
      var r1 = document.createElement('div');
      r1.className = 'edtr-grupa-rzad';
      var r2 = document.createElement('div');
      r2.className = 'edtr-grupa-rzad';
      cialo.appendChild(r1);
      cialo.appendChild(r2);
      gr.appendChild(cialo);
      var etyk = document.createElement('div');
      etyk.className = 'edtr-grupa-etyk';
      etyk.textContent = nazwa;
      gr.appendChild(etyk);
      bar.appendChild(gr);
      return { r1: r1, r2: r2, gr: gr };
    }

    function B(rodzic, etykieta, tytul, cmdOrFn, arg) {
      var b = document.createElement('button');
      b.type = 'button'; b.title = tytul; b.innerHTML = etykieta;
      b.addEventListener('click', function (e) {
        pole.focus();
        if (typeof cmdOrFn === 'function') {
          cmdOrFn(e);
        } else if (typeof cmdOrFn === 'string' && cmdOrFn) {
          document.execCommand(cmdOrFn, false, arg || null);
          zglaszaZmiane();
        }
      });
      (rodzic || bar).appendChild(b);
      return b;
    }

    function Gr(etykieta, tytul) {
      var s = document.createElement('span');
      s.className = 'edtr-gr'; s.title = tytul; s.innerHTML = etykieta;
      bar.appendChild(s);
    }

    function Sel(rodzic, opcje, tytul, cb) {
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
      (rodzic || bar).appendChild(s);
      return s;
    }

    var zamknijWszystkiePalety = function () {};
    function Paleta(rodzic, znak, tytul, cmd) {
      var przyc = document.createElement('span');
      przyc.className = 'edtr-kolor'; przyc.title = tytul;
      var z = document.createElement('span');
      z.textContent = znak;
      var i = document.createElement('i');
      przyc.appendChild(z); przyc.appendChild(i);
      (rodzic || bar).appendChild(przyc);
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
      var inColor = pop.querySelector('input[type=color]');
      if (inColor) inColor.addEventListener('input', function () { pokazKolor(this.value); });
      var okBtn = pop.querySelector('.edtr-ok');
      if (okBtn) okBtn.addEventListener('click', function () {
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
        zglaszaZmiane();
        return true;
      } catch (e) { return false; }
    }

    /* ---------- link, obraz, video ---------- */
    function wstawLinkModal() {
      pole.focus();
      var url = prompt('Adres (https://…):', 'https://');
      if (url && url !== 'https://') {
        document.execCommand('createLink', false, url);
        zglaszaZmiane();
      }
    }

    var imgInput = document.createElement('input');
    imgInput.type = 'file';
    imgInput.accept = 'image/*';
    imgInput.style.display = 'none';
    document.body.appendChild(imgInput);
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

      var html = e.clipboardData ? e.clipboardData.getData('text/html') : '';
      if (html) {
        var tmp = document.createElement('div');
        tmp.innerHTML = html;
        tmp.querySelectorAll('style, meta, link, script').forEach(function (el) { el.remove(); });
        tmp.querySelectorAll('*').forEach(function (el) {
          if (el.style) {
            if (el.style.width && el.style.width.indexOf('%') < 0) el.style.width = '';
            if (el.style.minWidth) el.style.minWidth = '';
            if (el.style.maxWidth && el.style.maxWidth.indexOf('%') < 0) el.style.maxWidth = '100%';
            if (el.style.whiteSpace === 'nowrap') el.style.whiteSpace = 'normal';
          }
        });
        var cleanHtml = tmp.innerHTML;
        if (cleanHtml && cleanHtml.trim()) {
          e.preventDefault();
          document.execCommand('insertHTML', false, cleanHtml);
          var k = komorka();
          if (k) {
            var t = k.closest('table');
            if (t) zbalansujSzerokosciKolumn(t);
          }
          zglaszaZmiane();
          return;
        }
      }
    });

    function wstawYoutubeModal() {
      var url = prompt('Link do filmu YouTube:', 'https://www.youtube.com/watch?v=');
      if (!url) return;
      var m = url.match(/(?:v=|youtu\.be\/)([\w-]{6,})/);
      if (!m) { alert('To nie wygląda na link YouTube.'); return; }
      pole.focus();
      document.execCommand('insertHTML', false,
        '<div class="edtr-video"><iframe width="560" height="315" src="https://www.youtube.com/embed/' + m[1] +
        '" frameborder="0" allowfullscreen></iframe></div><p><br></p>');
      zglaszaZmiane();
    }

    function wstawKolumny(n) {
      var kom = '<p>Tekst kolumny…</p>';
      var wew = '';
      for (var i = 0; i < n; i++) wew += '<div class="tre-kol">' + kom + '</div>';
      pole.focus();
      document.execCommand('insertHTML', false,
        '<div class="tre-kolumny tre-k-' + n + '">' + wew + '</div><p><br></p>');
      zglaszaZmiane();
    }

    function wstawEtykiete() {
      var txt = prompt('Tekst etykiety (np. „Nowości"):', 'Nowości');
      if (!txt) return;
      pole.focus();
      document.execCommand('insertHTML', false, '<p class="sl-tag">' + escA(txt) + '</p>');
      zglaszaZmiane();
    }

    /* ---------- TABELE ---------- */
    function komorka(){
      var sel = window.getSelection();
      if (!sel || !sel.anchorNode) return null;
      var n = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement;
      return n && n.closest ? n.closest('td, th') : null;
    }
    function tabelaOb(){
      var k = komorka();
      if (k) return k.closest('table');
      return pole.querySelector('table');
    }
    function zbalansujSzerokosciKolumn(t) {
      if (!t || !t.rows || !t.rows.length) return;
      t.style.tableLayout = 'fixed';
      t.style.width = '100%';
      var numCols = t.rows[0].cells.length;
      if (!numCols) return;
      var pct = (100 / numCols).toFixed(2) + '%';
      for (var r = 0; r < t.rows.length; r++) {
        for (var c = 0; c < t.rows[r].cells.length; c++) {
          var cell = t.rows[r].cells[c];
          cell.style.width = pct;
          cell.style.wordBreak = 'break-word';
          cell.style.overflowWrap = 'break-word';
          cell.style.boxSizing = 'border-box';
        }
      }
    }
    function wyrownajKolumnyTabeli() {
      var t = tabelaOb();
      if (!t) { alert('Stań najpierw kursorem w komórce tabeli.'); return; }
      zbalansujSzerokosciKolumn(t);
      zglaszaZmiane();
    }
    function otworzModalTabeli() {
      var okno = modal('Wstaw tabelę',
        '<div style="font-size:14px;color:rgba(51,38,28,.85);margin-bottom:12px">' +
        'Ustaw liczbę wierszy i kolumn za pomocą strzałek ▲ / ▼ lub wpisz liczbę:' +
        '</div>' +
        '<div class="pole" style="display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap">' +
          '<div style="flex:1;min-width:130px">' +
            '<label style="font-weight:700;margin-bottom:6px;display:block">Liczba wierszy</label>' +
            '<div style="display:flex;align-items:center;gap:6px">' +
              '<input type="number" id="et-r" value="2" min="1" max="50" style="width:70px;text-align:center;font-size:17px;font-weight:700;padding:6px 8px;border:1.5px solid rgba(107,69,48,.45);border-radius:6px;background:#fff">' +
              '<div style="display:flex;flex-direction:column;gap:3px">' +
                '<button type="button" class="et-step-btn" id="et-r-up" style="padding:3px 9px;font-size:11px;line-height:1;border:1px solid rgba(107,69,48,.4);background:#FAF8F5;border-radius:4px;cursor:pointer;font-weight:700" title="Więcej wierszy (▲)">▲</button>' +
                '<button type="button" class="et-step-btn" id="et-r-down" style="padding:3px 9px;font-size:11px;line-height:1;border:1px solid rgba(107,69,48,.4);background:#FAF8F5;border-radius:4px;cursor:pointer;font-weight:700" title="Mniej wierszy (▼)">▼</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div style="flex:1;min-width:130px">' +
            '<label style="font-weight:700;margin-bottom:6px;display:block">Liczba kolumn</label>' +
            '<div style="display:flex;align-items:center;gap:6px">' +
              '<input type="number" id="et-c" value="2" min="1" max="20" style="width:70px;text-align:center;font-size:17px;font-weight:700;padding:6px 8px;border:1.5px solid rgba(107,69,48,.45);border-radius:6px;background:#fff">' +
              '<div style="display:flex;flex-direction:column;gap:3px">' +
                '<button type="button" class="et-step-btn" id="et-c-up" style="padding:3px 9px;font-size:11px;line-height:1;border:1px solid rgba(107,69,48,.4);background:#FAF8F5;border-radius:4px;cursor:pointer;font-weight:700" title="Więcej kolumn (▲)">▲</button>' +
                '<button type="button" class="et-step-btn" id="et-c-down" style="padding:3px 9px;font-size:11px;line-height:1;border:1px solid rgba(107,69,48,.4);background:#FAF8F5;border-radius:4px;cursor:pointer;font-weight:700" title="Mniej kolumn (▼)">▼</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="pole" style="margin-top:14px">' +
          '<label style="cursor:pointer;font-weight:600;display:flex;align-items:center;gap:8px">' +
            '<input type="checkbox" id="et-ramka" checked style="width:auto"> Obramowanie tabeli (widoczna siatka)' +
          '</label>' +
        '</div>' +
        '<div class="pole" style="margin-top:8px">' +
          '<label style="cursor:pointer;font-weight:600;display:flex;align-items:center;gap:8px">' +
            '<input type="checkbox" id="et-rownomierne" checked style="width:auto"> Sztywny układ kolumn (tekst nie rozpycha komórek)' +
          '</label>' +
        '</div>' +
        '<div id="et-podglad" style="margin-top:14px;padding:9px 12px;background:#FAF8F5;border:1px dashed rgba(107,69,48,.45);border-radius:6px;font-size:13.5px;color:var(--brunatny);text-align:center;font-weight:600">' +
          'Tabela: 2 wiersze × 2 kolumny (każda kolumna po 50.0%)' +
        '</div>',
        function (oknoModal) {
          var r = Math.max(1, parseInt(oknoModal.querySelector('#et-r').value, 10) || 2);
          var c = Math.max(1, parseInt(oknoModal.querySelector('#et-c').value, 10) || 2);
          var bez = oknoModal.querySelector('#et-ramka').checked ? '' : ' tre-bez';
          var rowne = oknoModal.querySelector('#et-rownomierne').checked;
          var pct = (100 / c).toFixed(2) + '%';
          var wiersze = '';
          for (var i = 0; i < r; i++) {
            var komorki = '';
            for (var j = 0; j < c; j++) {
              var styleCell = rowne
                ? 'style="width:' + pct + ';word-break:break-word;overflow-wrap:break-word;box-sizing:border-box"'
                : 'style="word-break:break-word;overflow-wrap:break-word;box-sizing:border-box"';
              komorki += '<td ' + styleCell + '>Komórka</td>';
            }
            wiersze += '<tr>' + komorki + '</tr>';
          }
          var styleTable = rowne ? 'style="table-layout:fixed;width:100%"' : 'style="width:100%"';
          var html = '<table class="tre-tabela' + bez + '" ' + styleTable + '><tbody>' + wiersze + '</tbody></table><p><br></p>';
          pole.focus();
          var sel = window.getSelection();
          var wPolu = false;
          if (sel && sel.anchorNode && (sel.anchorNode === pole || pole.contains(sel.anchorNode))) {
            wPolu = true;
          }
          if (!wPolu) {
            var rng = document.createRange();
            rng.selectNodeContents(pole);
            rng.collapse(false);
            sel.removeAllRanges();
            sel.addRange(rng);
          }
          var okCmd = document.execCommand('insertHTML', false, html);
          if (!okCmd) {
            var tmp = document.createElement('div');
            tmp.innerHTML = html;
            while (tmp.firstChild) pole.appendChild(tmp.firstChild);
          }
          zglaszaZmiane();
        }, 'Wstaw tabelę');

      var inpR = okno.querySelector('#et-r');
      var inpC = okno.querySelector('#et-c');
      var podglad = okno.querySelector('#et-podglad');

      function odswiezPodglad() {
        var rVal = Math.max(1, parseInt(inpR.value, 10) || 1);
        var cVal = Math.max(1, parseInt(inpC.value, 10) || 1);
        inpR.value = rVal;
        inpC.value = cVal;
        var pVal = (100 / cVal).toFixed(1) + '%';
        podglad.textContent = 'Tabela: ' + rVal + ' ' + (rVal === 1 ? 'wiersz' : (rVal < 5 ? 'wiersze' : 'wierszy')) +
          ' × ' + cVal + ' ' + (cVal === 1 ? 'kolumna' : (cVal < 5 ? 'kolumny' : 'kolumn')) + ' (każda kolumna po ' + pVal + ')';
      }

      okno.querySelector('#et-r-up').addEventListener('click', function () {
        inpR.value = Math.min(50, (parseInt(inpR.value, 10) || 1) + 1);
        odswiezPodglad();
      });
      okno.querySelector('#et-r-down').addEventListener('click', function () {
        inpR.value = Math.max(1, (parseInt(inpR.value, 10) || 2) - 1);
        odswiezPodglad();
      });
      okno.querySelector('#et-c-up').addEventListener('click', function () {
        inpC.value = Math.min(20, (parseInt(inpC.value, 10) || 1) + 1);
        odswiezPodglad();
      });
      okno.querySelector('#et-c-down').addEventListener('click', function () {
        inpC.value = Math.max(1, (parseInt(inpC.value, 10) || 2) - 1);
        odswiezPodglad();
      });
      inpR.addEventListener('input', odswiezPodglad);
      inpC.addEventListener('input', odswiezPodglad);
    }
    function dodajWierszTabeli() {
      var t = tabelaOb(), k = komorka();
      if (!t) { alert('Stań najpierw kursorem w komórce tabeli.'); return; }
      var rIdx = (k && k.parentElement) ? k.parentElement.rowIndex : t.rows.length - 1;
      var row = t.insertRow(rIdx + 1);
      var numCells = (k && k.parentElement) ? k.parentElement.cells.length : (t.rows[0] ? t.rows[0].cells.length : 2);
      var pct = (100 / numCells).toFixed(2) + '%';
      for (var i = 0; i < numCells; i++) {
        var cell = row.insertCell();
        cell.innerHTML = 'Komórka';
        cell.style.width = pct;
        cell.style.wordBreak = 'break-word';
        cell.style.overflowWrap = 'break-word';
        cell.style.boxSizing = 'border-box';
      }
      zbalansujSzerokosciKolumn(t);
      zglaszaZmiane();
    }
    function dodajKolumneTabeli() {
      var t = tabelaOb(), k = komorka();
      if (!t) { alert('Stań najpierw kursorem w komórce tabeli.'); return; }
      var idx = k ? (k.cellIndex + 1) : (t.rows[0] ? t.rows[0].cells.length : 1);
      for (var i = 0; i < t.rows.length; i++) {
        var cell = t.rows[i].insertCell(idx);
        cell.innerHTML = 'Komórka';
        cell.style.wordBreak = 'break-word';
        cell.style.overflowWrap = 'break-word';
        cell.style.boxSizing = 'border-box';
      }
      zbalansujSzerokosciKolumn(t);
      zglaszaZmiane();
    }
    function usunWierszTabeli() {
      var t = tabelaOb(), k = komorka();
      if (!t) { alert('Stań najpierw kursorem w komórce tabeli.'); return; }
      if (t.rows.length < 2) { alert('To jedyny wiersz tabeli.'); return; }
      var rIdx = (k && k.parentElement) ? k.parentElement.rowIndex : (t.rows.length - 1);
      t.deleteRow(rIdx);
      zglaszaZmiane();
    }
    function usunKolumneTabeli() {
      var t = tabelaOb(), k = komorka();
      if (!t) { alert('Stań najpierw kursorem w komórce tabeli.'); return; }
      if (t.rows[0].cells.length < 2) { alert('To jedyna kolumna tabeli.'); return; }
      var idx = k ? k.cellIndex : (t.rows[0].cells.length - 1);
      for (var i = 0; i < t.rows.length; i++) t.rows[i].deleteCell(idx);
      zbalansujSzerokosciKolumn(t);
      zglaszaZmiane();
    }
    function przelaczRamkeTabeli() {
      var t = tabelaOb();
      if (!t) { alert('Stań najpierw kursorem w tabeli.'); return; }
      t.classList.toggle('tre-bez');
      zglaszaZmiane();
    }

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
        uchwyt('tre-uchwyt', 'nwse-resize', L + W - 6, T + H - 6, 'se');
        uchwyt('tre-uchwyt', 'nesw-resize', L + W - 6, T - 6, 'ne');
        uchwyt('tre-uchwyt', 'nesw-resize', L - 6, T + H - 6, 'sw');
        uchwyt('tre-uchwyt', 'nwse-resize', L - 6, T - 6, 'nw');
      }
      uchwyt('tre-uchwyt-obrot', 'grab', L + W / 2 - 8, T - 30, 'obrot');
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
      if (!ob || !ob.style) return;
      if (ob.style.position === 'absolute') return;
      var pr = pole.getBoundingClientRect();
      var r = ob.getBoundingClientRect();
      var pw = pr.width || 1;
      var ph = pr.height || 1;
      var l = Math.max(0, (r.left - pr.left + pole.scrollLeft) / pw * 100);
      var t = Math.max(0, (r.top - pr.top + pole.scrollTop) / ph * 100);
      ob.style.position = 'absolute';
      ob.style.left = l.toFixed(2) + '%';
      ob.style.top = t.toFixed(2) + '%';
      ob.style.right = 'auto';
      ob.style.bottom = 'auto';
      ob.style.margin = '0';
      if (!ob.style.zIndex) ob.style.zIndex = '5';
    }

    /* ---------- mini-pasek kontekstowy przy zaznaczeniu ---------- */
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
        KB('⇤', 'Wyrównaj do lewej', function(){ wyrownajObiekt('lewo'); });
        KB('⬌', 'Wyrównaj do środka poziomo', function(){ wyrownajObiekt('srodek'); });
        KB('⇥', 'Wyrównaj do prawej', function(){ wyrownajObiekt('prawo'); });
        KB('⬆', 'Wyrównaj do góry', akcjaGora);
        KB('↕', 'Wyrównaj do środka pionowo', akcjaSrodek);
        KB('⬇', 'Wyrównaj do dołu', akcjaDol);
        KB('⇹', 'Rozłóż w poziomie (min. 2 obiekty)', function(){ rozlozObiekty('poziom'); });
        KB('⇳', 'Rozłóż w pionie (min. 2 obiekty)', function(){ rozlozObiekty('pion'); });
        KB('⊞', 'Grupuj zaznaczone (Ctrl+G)', grupuj);
        KB('⊟', 'Rozgrupuj (Ctrl+Shift+G)', rozgrupuj);
        KB('⤒', 'Na wierzch', function(){ warstwa('wierzch'); });
        KB('⤓', 'Na spód', function(){ warstwa('spod'); });
        KB('🗑', 'Usuń zaznaczone (Del)', function () {
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
      var nad = bT - pr.top + pole.scrollTop - 36;
      var T = nad >= 0 ? nad : (bB - pr.top + pole.scrollTop + 6);
      kontekst.style.display = 'flex';
      kontekst.style.left = L + 'px';
      kontekst.style.top = T + 'px';
    }

    /* ---------- wstawianie kształtów ---------- */
    function wstawKsztalt(d){
      d.pos = 'absolute';
      var pr = pole.getBoundingClientRect();
      var pw = pr.width || 600;
      var ph = Math.max(260, pr.height || 300);
      var defL = Math.max(16, Math.round((pw - (d.szer || 160)) / 2));
      var defT = Math.max(16, Math.round(pole.scrollTop + (Math.min(ph, 300) - (d.wys || 60)) / 2));
      var leftPct = ((defL / pw) * 100).toFixed(1) + '%';
      var topPct = ((defT / ph) * 100).toFixed(1) + '%';

      var html = budujKsztalt(d, leftPct, topPct);
      var tmp = document.createElement('div');
      tmp.innerHTML = html;
      var nowyEl = tmp.firstElementChild;
      if (nowyEl) {
        pole.appendChild(nowyEl);
        czyscWybranie();
        wybrane = [nowyEl];
        odswiezWybranie();
        zglaszaZmiane();
      }
    }

    function wstawPoleTekstowe() {
      wstawKsztalt({ typ:'pole', tekst:'Tekst', tlo:'#FBF7F0', przez:true, ramka:'transparent', gr:1,
        kolor:'#33261C', czcionka:'sans', rozmiar:15, valign:'srodek', kier:'0',
        przycisk:false, link:'', rot:0, szer:260, wys:56 });
      setTimeout(function () {
        var ob = wybrane[0];
        if (ob && ob.classList && ob.classList.contains('tre-ksztalt')) edytujTekstObiektu(ob, true);
      }, 80);
    }
    function wstawProstokat() {
      wstawKsztalt({ typ:'prostokat', tekst:'', tlo:'#1F3A32', przez:false, ramka:'#C4A582', gr:2,
        kolor:'#FBF7F0', czcionka:'serif', rozmiar:15, valign:'srodek', kier:'0',
        przycisk:false, link:'', rot:0, szer:180, wys:60 });
    }
    function wstawZaokraglony() {
      wstawKsztalt({ typ:'zaokraglony', tekst:'', tlo:'#1F3A32', przez:false, ramka:'#C4A582', gr:2,
        kolor:'#FBF7F0', czcionka:'serif', rozmiar:15, valign:'srodek', kier:'0',
        przycisk:false, link:'', rot:0, szer:180, wys:60 });
    }
    function wstawElipse() {
      wstawKsztalt({ typ:'elipsa', tekst:'', tlo:'#1F3A32', przez:false, ramka:'#C4A582', gr:2,
        kolor:'#FBF7F0', czcionka:'serif', rozmiar:15, valign:'srodek', kier:'0',
        przycisk:false, link:'', rot:0, szer:140, wys:140 });
    }
    function wstawLinie() {
      wstawKsztalt({ typ:'linia', tekst:'', tlo:'#33261C', przez:false, ramka:'transparent', gr:2,
        kolor:'#FBF7F0', czcionka:'serif', rozmiar:15, valign:'srodek', kier:'0',
        przycisk:false, link:'', rot:0, szer:120, wys:0 });
    }
    function wstawStrzalke() {
      wstawKsztalt({ typ:'strzalka', tekst:'', tlo:'#33261C', przez:false, ramka:'transparent', gr:1,
        kolor:'#FBF7F0', czcionka:'serif', rozmiar:15, valign:'srodek', kier:'0',
        przycisk:false, link:'', rot:0, szer:140, wys:24 });
    }
    function wstawTrojkat() {
      wstawKsztalt({ typ:'trojkat', tekst:'', tlo:'#1F3A32', przez:false, ramka:'transparent', gr:1,
        kolor:'#FBF7F0', czcionka:'serif', rozmiar:15, valign:'srodek', kier:'0',
        przycisk:false, link:'', rot:0, szer:100, wys:90 });
    }

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

    /* ---------- grupy ---------- */
    function grupuj(){
      if (wybrane.length < 2) {
        alert('Zaznacz co najmniej 2 obiekty (Ctrl+klik), aby je zgrupować.');
        return;
      }
      var pr = pole.getBoundingClientRect();
      var minL = 1e9, minT = 1e9, maxR = -1e9, maxB = -1e9;
      wybrane.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.left < minL) minL = r.left;
        if (r.top < minT) minT = r.top;
        if (r.right > maxR) maxR = r.right;
        if (r.bottom > maxB) maxB = r.bottom;
      });
      var g = document.createElement('div');
      g.className = 'tre-grupa';
      g.style.position = 'absolute';
      g.style.left = Math.max(0, (minL - pr.left + pole.scrollLeft) / (pr.width || 1) * 100) + '%';
      g.style.top = Math.max(0, (minT - pr.top + pole.scrollTop) / (pr.height || 1) * 100) + '%';
      g.style.width = Math.max(20, (maxR - minL) / (pr.width || 1) * 100) + '%';
      g.style.height = Math.max(20, (maxB - minT) / (pr.height || 1) * 100) + '%';
      g.style.zIndex = '5';
      pole.appendChild(g);
      var gW = maxR - minL, gH = maxB - minT;
      wybrane.forEach(function (el) {
        var r = el.getBoundingClientRect();
        el.style.position = 'absolute';
        el.style.left = ((r.left - minL) / (gW || 1) * 100) + '%';
        el.style.top = ((r.top - minT) / (gH || 1) * 100) + '%';
        el.style.right = 'auto'; el.style.bottom = 'auto';
        el.style.margin = '0';
        g.appendChild(el);
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
          ch.style.left = Math.max(0, (r.left - pr.left + pole.scrollLeft) / (pr.width || 1) * 100) + '%';
          ch.style.top = Math.max(0, (r.top - pr.top + pole.scrollTop) / (pr.height || 1) * 100) + '%';
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

    /* ---------- warstwy ---------- */
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

    /* ---------- wyrównanie ---------- */
    function wyrownajObiekt(strona){
      if (!wybrane.length) {
        alert('Zaznacz najpierw obiekt(y): klik = jeden, Ctrl+klik = kilka naraz.');
        return;
      }
      wybrane.forEach(zrobAbsolutny);
      var pr = pole.getBoundingClientRect();
      function pxn(p){ return ((p / (pr.width || 1)) * 100).toFixed(2) + '%'; }
      function pyn(p){ return ((p / (pr.height || 1)) * 100).toFixed(2) + '%'; }
      var dane = wybrane.map(function (ob) {
        var or = ob.getBoundingClientRect();
        return {
          ob: ob,
          l: or.left - pr.left + pole.scrollLeft,
          t: or.top - pr.top + pole.scrollTop,
          w: or.width,
          h: or.height
        };
      });
      if (wybrane.length === 1){
        var it = dane[0];
        if (strona === 'lewo') it.ob.style.left = '2%';
        if (strona === 'prawo') it.ob.style.left = pxn(Math.max(0, pr.width - it.w - pr.width * 0.02));
        if (strona === 'srodek') it.ob.style.left = pxn(Math.max(0, (pr.width - it.w) / 2));
        if (strona === 'gora') it.ob.style.top = '2%';
        if (strona === 'dol') it.ob.style.top = pyn(Math.max(0, pr.height - it.h - pr.height * 0.02));
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
        it.ob.style.right = 'auto';
        it.ob.style.bottom = 'auto';
        it.ob.style.margin = '0';
        if (!it.ob.style.zIndex) it.ob.style.zIndex = '5';
      });
      odswiezWybranie();
      zglaszaZmiane();
    }

    /* ---------- rozstawienie / dystrybucja obiektów ---------- */
    function rozlozObiekty(kier) {
      if (wybrane.length < 2) {
        alert('Zaznacz co najmniej 2 obiekty (Ctrl+klik), aby je równomiernie rozstawić.');
        return;
      }
      wybrane.forEach(zrobAbsolutny);
      var pr = pole.getBoundingClientRect();
      function pxn(p) { return ((p / (pr.width || 1)) * 100).toFixed(2) + '%'; }
      function pyn(p) { return ((p / (pr.height || 1)) * 100).toFixed(2) + '%'; }

      var dane = wybrane.map(function (ob) {
        var or = ob.getBoundingClientRect();
        return {
          ob: ob,
          l: or.left - pr.left + pole.scrollLeft,
          t: or.top - pr.top + pole.scrollTop,
          w: or.width,
          h: or.height
        };
      });

      if (kier === 'poziom') {
        dane.sort(function (a, b) { return a.l - b.l; });
        var minL = dane[0].l;
        var maxR = dane[dane.length - 1].l + dane[dane.length - 1].w;
        var totalW = 0;
        dane.forEach(function (d) { totalW += d.w; });
        var availableSpace = (maxR - minL) - totalW;
        var gap = (dane.length > 1) ? Math.max(0, availableSpace / (dane.length - 1)) : 0;
        var curX = minL;
        dane.forEach(function (d) {
          d.ob.style.left = pxn(Math.max(0, Math.min(curX, pr.width - d.w)));
          curX += d.w + gap;
        });
      } else if (kier === 'pion') {
        dane.sort(function (a, b) { return a.t - b.t; });
        var minT = dane[0].t;
        var maxB = dane[dane.length - 1].t + dane[dane.length - 1].h;
        var totalH = 0;
        dane.forEach(function (d) { totalH += d.h; });
        var availableSpace = (maxB - minT) - totalH;
        var gap = (dane.length > 1) ? Math.max(0, availableSpace / (dane.length - 1)) : 0;
        var curY = minT;
        dane.forEach(function (d) {
          d.ob.style.top = pyn(Math.max(0, Math.min(curY, pr.height - d.h)));
          curY += d.h + gap;
        });
      }
      odswiezWybranie();
      zglaszaZmiane();
    }

    function akcjaGora() {
      if (komorka()) { pionTekstu('gora'); return; }
      if (wybrane.length) { wyrownajObiekt('gora'); return; }
      alert('Stań kursorem w komórce tabeli lub zaznacz obiekt.');
    }
    function akcjaSrodek() {
      if (komorka()) { pionTekstu('srodek'); return; }
      if (wybrane.length) { wyrownajObiekt('srodek-pion'); return; }
      alert('Stań kursorem w komórce tabeli lub zaznacz obiekt.');
    }
    function akcjaDol() {
      if (komorka()) { pionTekstu('dol'); return; }
      if (wybrane.length) { wyrownajObiekt('dol'); return; }
      alert('Stań kursorem w komórce tabeli lub zaznacz obiekt.');
    }

    function usunWybrane(e) {
      if (!wybrane.length) return;
      wybrane.forEach(function (el) { if (el && el.parentNode) el.parentNode.removeChild(el); });
      czyscWybranie();
      zglaszaZmiane();
      if (e && e.preventDefault) e.preventDefault();
    }

    /* ================= WSTĄŻKA POWERPOINT / CANVA — POGRUPOWANE MATRYCE ================= */

    /* --- GRUPA 1: CZCIONKA --- */
    var grCzcionka = dodajGrupe('Czcionka');
    var selCzcionka = Sel(grCzcionka.r1, [{ v:'', t:'Czcionka…' }].concat(FONTY_LISTA.map(function (f) {
      return { v: f[0], t: f[1] };
    })), 'Czcionka (FONT) — zaznacz tekst i wybierz; pasek pokazuje czcionkę zaznaczenia', function (v) {
      if (!v) return;
      var css = FONTY[v] || v;
      if (!owinSpan('font-family:' + css)) document.execCommand('fontName', false, css);
    });
    var selRozmiar = Sel(grCzcionka.r1, [{ v:'', t:'Rozmiar…' },
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
    B(grCzcionka.r1, '✕ Format', 'Wyczyść formatowanie zaznaczenia', 'removeFormat');

    B(grCzcionka.r2, '<b>B</b>', 'Pogrubienie (Ctrl+B)', 'bold');
    B(grCzcionka.r2, '<i>I</i>', 'Kursywa (Ctrl+I)', 'italic');
    B(grCzcionka.r2, '<u>U</u>', 'Podkreślenie', 'underline');
    B(grCzcionka.r2, '<s>S</s>', 'Przekreślenie', 'strikeThrough');
    var paletaTekst = Paleta(grCzcionka.r2, 'A', 'Kolor tekstu — paleta kolorów z przyciskiem OK', 'foreColor');
    var paletaTlo = Paleta(grCzcionka.r2, '🖍', 'Kolor tła tekstu (podświetlenie) — z opcją „Bez tła" (przezroczyste)', 'hiliteColor');
    Sel(grCzcionka.r2, [{ v:'', t:'Odstęp…' }, { v:'0', t:'0 (normalny)' }, { v:'1', t:'1 px' },
      { v:'2', t:'2 px' }, { v:'3', t:'3 px' }, { v:'4', t:'4 px' }, { v:'6', t:'6 px' },
      { v:'8', t:'8 px' }, { v:'-1', t:'−1 px' }],
      'Odstęp między znakami — zaznacz tekst i wybierz', function (v) {
      if (!v) return;
      if (!owinSpan('letter-spacing:' + v + 'px')) alert('Zaznacz tekst, aby ustawić odstęp między znakami.');
    });

    /* --- GRUPA 2: AKAPIT --- */
    var grAkapit = dodajGrupe('Akapit');
    B(grAkapit.r1, 'H2 Tytuł', 'Tytuł (nagłówek 2)', 'formatBlock', 'h2');
    B(grAkapit.r1, 'H3 Podtytuł', 'Podtytuł (nagłówek 3)', 'formatBlock', 'h3');
    B(grAkapit.r1, 'P Tekst', 'Zwykły akapit', 'formatBlock', 'p');
    B(grAkapit.r1, '🏷 Etykieta', 'Blok-etykieta w ramce (mały napis, np. „Nowości")', wstawEtykiete);

    B(grAkapit.r2, '⇤', 'Justowanie: do lewej', 'justifyLeft');
    B(grAkapit.r2, '↔', 'Justowanie: do środka', 'justifyCenter');
    B(grAkapit.r2, '⇥', 'Justowanie: do prawej', 'justifyRight');
    B(grAkapit.r2, '≡', 'Justowanie: wyjustuj (rozciągnięcie do lewej i prawej)', 'justifyFull');
    B(grAkapit.r2, '• Lista', 'Lista punktowana', 'insertUnorderedList');
    B(grAkapit.r2, '1. Lista', 'Lista numerowana', 'insertOrderedList');
    B(grAkapit.r2, '„Cytat"', 'Cytat', 'formatBlock', 'blockquote');
    Sel(grAkapit.r2, [{ v:'', t:'Kolumny…' }, { v:'1', t:'1 kolumna' }, { v:'2', t:'2 kolumny' },
      { v:'3', t:'3 kolumny' }, { v:'4', t:'4 kolumny' }],
      'Układ kolumnowy (1–4 kolumny)', function (v) {
      if (!v) return;
      if (v === '1') { pole.focus(); document.execCommand('formatBlock', false, 'p'); return; }
      wstawKolumny(parseInt(v, 10));
    });

    /* --- GRUPA 3: TABELA --- */
    var grTabela = dodajGrupe('Tabela');
    B(grTabela.r1, '▦ Tabela…', 'Wstaw tabelę — ustaw wiersze i kolumny za pomocą strzałek ▲ / ▼', otworzModalTabeli);
    B(grTabela.r1, '◫ Ramka', 'Obramowanie tabeli: włącz / wyłącz', przelaczRamkeTabeli);
    B(grTabela.r1, '⚖ Równe', 'Wyrównaj szerokości kolumn (sztywny układ — równe kolumny)', wyrownajKolumnyTabeli);

    B(grTabela.r2, '▲ +Wiersz', 'Dodaj wiersz poniżej (stań kursorem w tabeli)', dodajWierszTabeli);
    B(grTabela.r2, '▼ −Wiersz', 'Usuń wiersz (stań kursorem w tabeli)', usunWierszTabeli);
    B(grTabela.r2, '► +Kol.', 'Dodaj kolumnę obok (stań kursorem w tabeli)', dodajKolumneTabeli);
    B(grTabela.r2, '◄ −Kol.', 'Usuń kolumnę (stań kursorem w tabeli)', usunKolumneTabeli);

    /* --- GRUPA 4: KSZTAŁTY I MEDIA (Canva / PowerPoint) --- */
    var grKsztalty = dodajGrupe('Kształty i Media');
    B(grKsztalty.r1, '🅃 Pole', 'Pole tekstowe', wstawPoleTekstowe);
    B(grKsztalty.r1, '▭ Prostokąt', 'Prostokąt', wstawProstokat);
    B(grKsztalty.r1, '▢ Zaokrąglony', 'Zaokrąglony prostokąt', wstawZaokraglony);
    B(grKsztalty.r1, '◯ Elipsa', 'Koło / elipsa', wstawElipse);

    B(grKsztalty.r2, '─ Linia', 'Linia', wstawLinie);
    B(grKsztalty.r2, '➜ Strzałka', 'Strzałka', wstawStrzalke);
    B(grKsztalty.r2, '△ Trójkąt', 'Trójkąt', wstawTrojkat);
    B(grKsztalty.r2, '🔗', 'Wstaw link', wstawLinkModal);
    B(grKsztalty.r2, '🖼', 'Wstaw obraz (plik)', function(){ imgInput.click(); });
    B(grKsztalty.r2, '▶ Film', 'Wstaw film YouTube', wstawYoutubeModal);

    /* --- GRUPA 5: UKŁAD I WYRÓWNANIE --- */
    var grUklad = dodajGrupe('Wyrównanie');
    B(grUklad.r1, '⇤ Lewo', 'Wyrównaj do lewej krawędzi (obiekt lub grupa)', function(){ wyrownajObiekt('lewo'); });
    B(grUklad.r1, '⬌ Środek H', 'Wyrównaj do środka w poziomie', function(){ wyrownajObiekt('srodek'); });
    B(grUklad.r1, '⇥ Prawo', 'Wyrównaj do prawej krawędzi', function(){ wyrownajObiekt('prawo'); });
    B(grUklad.r1, '⇹ Rozłóż H', 'Rozłóż równomiernie w poziomie (równy odstęp między obiektami, min. 2 obiekty)', function(){ rozlozObiekty('poziom'); });

    B(grUklad.r2, '⬆ Góra', 'Wyrównaj do góry (obiekt lub komórka)', akcjaGora);
    B(grUklad.r2, '↕ Środek V', 'Wyrównaj do środka pionowo (obiekt lub komórka)', akcjaSrodek);
    B(grUklad.r2, '⬇ Dół', 'Wyrównaj do dołu (obiekt lub komórka)', akcjaDol);
    B(grUklad.r2, '⇳ Rozłóż V', 'Rozłóż równomiernie w pionie (równy odstęp między obiektami, min. 2 obiekty)', function(){ rozlozObiekty('pion'); });

    /* --- GRUPA 6: WARSTWY I GRUPY --- */
    var grWarstwy = dodajGrupe('Warstwy i Grupy');
    B(grWarstwy.r1, '⤒ Na wierzch', 'Warstwa: przenieś na sam wierzch', function(){ warstwa('wierzch'); });
    B(grWarstwy.r1, '🔼 Do przodu', 'Warstwa: przesuń o 1 poziom do przodu', function(){ warstwa('przod'); });
    B(grWarstwy.r1, '⊞ Grupuj', 'Grupuj zaznaczone obiekty (blokada wzajemnego położenia, Ctrl+G)', grupuj);
    B(grWarstwy.r1, '↺ +90°', 'Kierunek tekstu: obróć o 90°', function(){ kierunekKsztaltu('90'); });

    B(grWarstwy.r2, '⤓ Na spód', 'Warstwa: przenieś na sam spód', function(){ warstwa('spod'); });
    B(grWarstwy.r2, '🔽 Do tyłu', 'Warstwa: przesuń o 1 poziom do tyłu', function(){ warstwa('tyl'); });
    B(grWarstwy.r2, '⊟ Rozgrupuj', 'Rozgrupuj zaznaczoną grupę (Ctrl+Shift+G)', rozgrupuj);
    B(grWarstwy.r2, '🗑 Usuń', 'Usuń zaznaczone obiekty (Backspace / Delete)', usunWybrane);

    /* ---------- DRAG&DROP + uchwyty rozmiaru i obrotu ---------- */
    var drag = null, justDragged = false, uchwytDrag = null;

    pole.addEventListener('pointerdown', function (e) {
      var t = e.target;
      if (!t) return;

      /* uchwyty: zmiana rozmiaru lub obrót */
      if (t.classList && (t.classList.contains('tre-uchwyt') || t.classList.contains('tre-uchwyt-obrot'))) {
        e.preventDefault(); e.stopPropagation();
        var ob = wybrane[0];
        if (!ob) return;
        zrobAbsolutny(ob);
        var pr = pole.getBoundingClientRect();
        var r = ob.getBoundingClientRect();
        var L0 = r.left - pr.left + pole.scrollLeft;
        var T0 = r.top - pr.top + pole.scrollTop;

        if (t.classList.contains('tre-uchwyt-obrot')) {
          uchwytDrag = {
            typ: 'obrot', ob: ob,
            cx: r.left + r.width / 2, cy: r.top + r.height / 2,
            a0: Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)),
            rot0: parseFloat(ob.getAttribute('data-ks-rot') || '0') || 0
          };
        } else {
          uchwytDrag = {
            typ: 'skala', ob: ob, k: t.getAttribute('data-u'),
            L0: L0, T0: T0,
            R0: L0 + r.width, B0: T0 + r.height
          };
        }
        if (t.setPointerCapture) try { t.setPointerCapture(e.pointerId); } catch (_) {}
        return;
      }

      /* Jeżeli użytkownik edytuje tekst wewnątrz kształtu lub w formularzu: nie przechwytuj przeciągania */
      if (t.closest && t.closest('.tre-ksztalt-s[contenteditable="true"]')) return;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT') return;

      var grp = t.closest ? t.closest('.tre-grupa') : null;
      var ob2 = grp || (t.closest ? t.closest('.tre-przycisk-obiekt, .tre-ksztalt, .tre-blok, img') : null);
      if (!ob2) {
        if (!e.ctrlKey && !e.metaKey && wybrane.length) {
          czyscWybranie();
        }
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        var ix = wybrane.indexOf(ob2);
        if (ix >= 0) wybrane.splice(ix, 1);
        else wybrane.push(ob2);
      } else if (wybrane.indexOf(ob2) < 0) {
        wybrane = [ob2];
      }
      clearTimeout(klikTimer);
      odswiezWybranie();

      var pr2 = pole.getBoundingClientRect();
      var start = wybrane.map(function (el) {
        var r2 = el.getBoundingClientRect();
        return {
          el: el,
          offX: e.clientX - r2.left,
          offY: e.clientY - r2.top,
          left0: r2.left - pr2.left + pole.scrollLeft,
          top0: r2.top - pr2.top + pole.scrollTop,
          w0: r2.width,
          h0: r2.height
        };
      });
      drag = {
        start: start,
        startX: e.clientX,
        startY: e.clientY,
        przes: false
      };

      if (e.pointerType === 'touch' || e.button === 0) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (ob2.setPointerCapture) try { ob2.setPointerCapture(e.pointerId); } catch (_) {}
    });

    function onPointerMove(e) {
      if (uchwytDrag) {
        e.preventDefault();
        if (uchwytDrag.typ === 'obrot') {
          var a = Math.atan2(e.clientY - uchwytDrag.cy, e.clientX - uchwytDrag.cx);
          var deg = uchwytDrag.rot0 + (a - uchwytDrag.a0) * 180 / Math.PI;
          if (e.shiftKey) deg = Math.round(deg / 15) * 15;
          deg = Math.round(deg);
          uchwytDrag.ob.style.transform = 'rotate(' + deg + 'deg)';
          uchwytDrag.ob.setAttribute('data-ks-rot', String(deg));
        } else {
          var pr = pole.getBoundingClientRect();
          var x = e.clientX - pr.left + pole.scrollLeft;
          var y = e.clientY - pr.top + pole.scrollTop;
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
        return;
      }

      if (!drag) return;
      var dx = e.clientX - drag.startX;
      var dy = e.clientY - drag.startY;
      if (!drag.przes && Math.abs(dx) < 3 && Math.abs(dy) < 3) return;

      e.preventDefault();
      var prMove = pole.getBoundingClientRect();
      var pw = prMove.width || 1;
      var ph = prMove.height || 1;

      if (!drag.przes) {
        drag.przes = true;
        drag.start.forEach(function (it) {
          zrobAbsolutny(it.el);
        });
      }
      drag.start.forEach(function (it) {
        var newLeft = Math.max(0, it.left0 + dx);
        var newTop = Math.max(0, it.top0 + dy);
        it.el.style.left = ((newLeft / pw) * 100).toFixed(2) + '%';
        it.el.style.top = ((newTop / ph) * 100).toFixed(2) + '%';
        it.el.style.right = 'auto';
        it.el.style.bottom = 'auto';
        it.el.style.margin = '0';
        if (!it.el.style.zIndex) it.el.style.zIndex = '5';
      });
      rysujUchwyty();
      rysujKontekst();
    }

    function onPointerUp(e) {
      if (uchwytDrag) {
        if (uchwytDrag.typ === 'skala') {
          var pr = pole.getBoundingClientRect();
          var ob = uchwytDrag.ob;
          var pw = pr.width || 1;
          var ph = pr.height || 1;
          var curL = parseFloat(ob.style.left) || 0;
          var curT = parseFloat(ob.style.top) || 0;
          if (String(ob.style.left).indexOf('px') >= 0) {
            ob.style.left = ((curL / pw) * 100).toFixed(2) + '%';
          }
          if (String(ob.style.top).indexOf('px') >= 0) {
            ob.style.top = ((curT / ph) * 100).toFixed(2) + '%';
          }
          zglaszaZmiane();
        }
        if (uchwytDrag.typ === 'obrot') zglaszaZmiane();
        justDragged = true;
        uchwytDrag = null;
      }
      if (drag) {
        if (drag.przes) {
          justDragged = true;
          zglaszaZmiane();
        }
        drag = null;
      }
    }

    pole.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointermove', onPointerMove, { passive: false });
    pole.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointerup', onPointerUp, { passive: false });
    pole.addEventListener('pointercancel', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp, { passive: false });

    /* ---------- klik: zaznaczenie / przełączenie trybu rozmiar↔obrót ---------- */
    pole.addEventListener('click', function (e) {
      if (justDragged) { justDragged = false; return; }
      var t = e.target;
      if (t && t.classList && (t.classList.contains('tre-uchwyt') || t.classList.contains('tre-uchwyt-obrot'))) return;
      if (t && t.closest && t.closest('.tre-ksztalt-s[contenteditable="true"]')) return;
      var grp = t.closest ? t.closest('.tre-grupa') : null;
      var ob = grp || (t.closest ? t.closest('.tre-przycisk-obiekt, .tre-ksztalt, .tre-blok, img') : null);
      if (ob) {
        e.preventDefault();
        if (!e.ctrlKey && !e.metaKey && wybrane.length === 1 && wybrane[0] === ob) {
          clearTimeout(klikTimer);
          klikTimer = setTimeout(function () {
            trybUchwytu = (trybUchwytu === 'obrot') ? 'skala' : 'obrot';
            rysujUchwyty();
          }, 260);
        }
        return;
      }
      var a = t.closest && t.closest('a');
      if (a) e.preventDefault();
      if (!e.ctrlKey && !e.metaKey) czyscWybranie();
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
      if (ob.classList.contains('tre-ksztalt') && KSZTALTY_TEKST.indexOf(ob.getAttribute('data-ks-typ')) >= 0) {
        edytujTekstObiektu(ob);
      } else {
        otworzWlasciwosci(ob);
      }
    });

    /* ---------- klawisze (przesuwanie strzałkami, usuwanie, skróty) ---------- */
    function obslugaKlawiszy(e) {
      if (!wybrane.length) return;
      var act = document.activeElement;
      if (act && act.isContentEditable && act !== pole && !act.classList.contains('tre-ksztalt-s')) return;
      if (act && (act.tagName === 'INPUT' || act.tagName === 'TEXTAREA' || act.tagName === 'SELECT')) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        usunWybrane(e);
        return;
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        var step = e.shiftKey ? 5 : 1;
        wybrane.forEach(function (ob) {
          zrobAbsolutny(ob);
          var curL = parseFloat(ob.style.left) || 0;
          var curT = parseFloat(ob.style.top) || 0;
          if (e.key === 'ArrowLeft') ob.style.left = Math.max(0, curL - step).toFixed(2) + '%';
          if (e.key === 'ArrowRight') ob.style.left = Math.min(99, curL + step).toFixed(2) + '%';
          if (e.key === 'ArrowUp') ob.style.top = Math.max(0, curT - step).toFixed(2) + '%';
          if (e.key === 'ArrowDown') ob.style.top = Math.min(99, curT + step).toFixed(2) + '%';
        });
        rysujUchwyty();
        rysujKontekst();
        zglaszaZmiane();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'g' || e.key === 'G')) {
        e.preventDefault();
        if (e.shiftKey) rozgrupuj();
        else grupuj();
      }
    }
    pole.addEventListener('keydown', obslugaKlawiszy);
    document.addEventListener('keydown', obslugaKlawiszy);

    /* ---------- pasek pokazuje czcionkę i wielkość zaznaczonego tekstu (throttled) ---------- */
    var selRaf = null;
    document.addEventListener('selectionchange', function () {
      if (selRaf) return;
      selRaf = requestAnimationFrame(function () {
        selRaf = null;
        var sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        var n = sel.anchorNode;
        var el = n && n.nodeType === 1 ? n : (n && n.parentElement);
        if (!el || !pole.contains(el)) return;
        if (el.closest && el.closest('.tre-przycisk-obiekt, .tre-ksztalt, .tre-grupa')) return;
        try {
          var cs = window.getComputedStyle(el);
          var fam = String(cs.fontFamily || '').split(',')[0].replace(/['"]/g, '').trim().toLowerCase();
          var klucz = CZCIONKI_WG[fam] || '';
          if (selCzcionka) selCzcionka.value = klucz;
          if (paletaTekst && paletaTekst.pasek) paletaTekst.pasek.style.background = cs.color || '#6B4530';
          var px = Math.round(parseFloat(cs.fontSize) || 16);
          var naj = '', najlepsza = 99;
          ['10','12','14','16','18','20','24','28','32','36','48'].forEach(function (r) {
            var od = Math.abs(parseInt(r, 10) - px);
            if (od < najlepsza){ najlepsza = od; naj = r; }
          });
          if (selRozmiar) selRozmiar.value = naj;
        } catch (_) {}
      });
    });

    /* ---------- API ---------- */
    return {
      ustaw: function (html) {
        pole.innerHTML = html || '';
        pole.querySelectorAll('.tre-blok').forEach(function (b) { b.setAttribute('contenteditable', 'false'); });
        pole.querySelectorAll('[contenteditable="true"]').forEach(function (el) {
          if (el !== pole) el.removeAttribute('contenteditable');
        });
        pole.querySelectorAll('table.tre-tabela').forEach(function (t) {
          zbalansujSzerokosciKolumn(t);
        });
        czyscWybranie();
      },
      pobierz: function () {
        czyscWybranie();
        pole.querySelectorAll('.tre-uchwyt, .tre-uchwyt-obrot, .edtr-kontekst').forEach(function (u) {
          if (u.parentNode) u.parentNode.removeChild(u);
        });
        pole.querySelectorAll('.tre-wybrany').forEach(function (el) {
          el.classList.remove('tre-wybrany');
        });
        pole.querySelectorAll('.tre-ksztalt-s[contenteditable="true"]').forEach(function (w) {
          var ob = w.closest('.tre-ksztalt');
          w.setAttribute('contenteditable', 'false');
          if (ob) ob.setAttribute('data-ks-tekst', tekstZHtml(w.innerHTML));
        });
        pole.querySelectorAll('table.tre-tabela').forEach(function (t) {
          t.style.tableLayout = 'fixed';
          t.style.width = '100%';
        });
        return pole.innerHTML;
      },
      focus: function () { pole.focus(); }
    };
  }

  window.SYG = window.SYG || {};
  window.SYG.edytorTresci = { stworz: stworz };
})();
