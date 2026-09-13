/* ============================================================
   Studio Sygnatura — EDYTOR TREŚCI (edytor.js) v5
   Uniwersalny silnik edycji treści („EDYTOR TREŚCI") — jeden
   dla całego serwisu: kafle slidera, sekcje strony głównej,
   wpisy bloga, podstrony. Zachowuje się jak MS Word / Canva:

   • Tytuł / podtytuł / akapit — style blokowe
   • Pogrubienie, kursywa, podkreślenie, listy, cytat
   • WYRÓWNANIE: do lewej / do środka / do prawej / WYJUSTOWANIE
     (justowanie jak w Wordzie)
   • Linki, obrazy (plik / schowek), film YouTube
   • Kolumny (2 lub 3), tabele z obramowaniem i bez
   • Etykieta w ramce (blok „tag") i blok z ramką
   • PRZYCISKI jako OBIEKTY: wstawiasz, widzisz od razu; klikasz,
     aby edytować (tekst, link, styl złoty klasyczny lub własny:
     rozmiar S/M/L, kolor tła LUB PRZEZROCZYSTE, kolor tekstu,
     czcionka). Przyciski wstawiane obok siebie stoją W LINII.
   • DRAG&DROP obiektów (przyciski, obrazki) jak „ramka dla
     obrazka" w MS Word — przeciągnij w dowolne miejsce pola;
     położenie zapisuje się w % (skaluje się na stronie).
   • WYRÓWNIANIE OBIEKTÓW: do lewej / środka / prawej / góry /
     środka pionowo / dołu pola edycji.
   • CZCIONKA (FONT) i WIELKOŚĆ tekstu, KOLOR tekstu i KOLOR TŁA
     tekstu (podświetlenie, paleta z przyciskiem OK) — jak w Wordzie;
     STYL AKAPITU (paragraph); pasek POKAZUJE czcionkę i wielkość
     zaznaczonego tekstu
   • OBIEKTY (jak PowerPoint): klik = zaznaczenie, 2×klik = edycja,
     Ctrl+klik = kilka obiektów naraz (wspólne przeciąganie, wyrównanie
     grupy, Backspace usuwa zaznaczone); narożnik = zmiana rozmiaru
     (kształty i obrazki); przycisk/kształt po edycji ZOSTAJE w miejscu,
     w którym został wstawiony
   • KSZTAŁTY: prostokąt, zaokrąglony prostokąt, elipsa, linia — z tekstem,
     wypełnieniem i ramką
   • Separator, wyczyść formatowanie

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
    impact: 'Impact,Charcoal,sans-serif'
  };
  var CZCIONKI_WG = {
    'cormorant garamond': 'serif', 'playfair display': 'serif',
    'georgia': 'georgia', 'times new roman': 'times', 'times': 'times',
    'arial': 'arial', 'helvetica': 'arial', 'verdana': 'verdana', 'geneva': 'verdana',
    'segoe ui': 'sans', 'courier new': 'mono', 'courier': 'mono', 'impact': 'impact'
  };

  function escA(t){ return String(t == null ? '' : t).replace(/[&"<>]/g, function(c){
    return { '&':'&amp;', '"':'&quot;', '<':'&lt;', '>':'&gt;' }[c]; }); }

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

  /* ---------- HTML przycisku (obiektu) ---------- */
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
    var modalOkno = modal('Przycisk',
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
      '</div>' +
      '<p class="mala">Wstawiony przycisk jest OBIEKTEM: klik = zaznaczenie, 2×klik = edycja, przeciąganie myszą = przesunięcie (przycisk zostaje tam, gdzie go położysz), Ctrl+klik = kilka obiektów naraz, Backspace usuwa zaznaczone. Przyciski wstawiane jeden po drugim stoją obok siebie.</p>',
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
        '<input type="color" value="' + wybrany + '"><button type="button" class="edtr-ok">OK</button></div>';
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
      if (v === 'div.sl-tag' || v === 'div.tre-blok') {
        document.execCommand('formatBlock', false, 'div');
        var sel = window.getSelection();
        var n = sel && sel.anchorNode;
        while (n && n !== pole && !(n.nodeType === 1 && n.tagName === 'DIV')) n = n.parentNode;
        if (n && n !== pole) n.className = v.slice(4);
      } else {
        document.execCommand('formatBlock', false, v);
      }
    }

    B('Tytuł', 'Tytuł (nagłówek 2)', 'formatBlock', 'h2');
    B('Podtytuł', 'Podtytuł (nagłówek 3)', 'formatBlock', 'h3');
    B('Tekst', 'Zwykły akapit', 'formatBlock', 'p');
    Gr('|', 'Czcionka (FONT), wielkość, kolory');
    var selCzcionka = Sel([{v:'',t:'Czcionka…'},{v:'serif',t:'Serif (styl studia)'},{v:'georgia',t:'Georgia'},
      {v:'times',t:'Times New Roman'},{v:'arial',t:'Arial'},{v:'verdana',t:'Verdana'},
      {v:'sans',t:'Segoe UI'},{v:'mono',t:'Courier New'},{v:'impact',t:'Impact'}],
      'Czcionka — zaznacz tekst i wybierz (FONT); pasek pokazuje czcionkę zaznaczonego tekstu', function (v) {
        if (!v) return;
        var css = FONTY[v] || v;
        if (!owinSpan('font-family:' + css)) document.execCommand('fontName', false, css);
      });
    var selRozmiar = Sel([{v:'',t:'Rozmiar…'},{v:'10',t:'10 px'},{v:'12',t:'12 px'},{v:'14',t:'14 px'},{v:'16',t:'16 px'},
      {v:'18',t:'18 px'},{v:'20',t:'20 px'},{v:'24',t:'24 px'},{v:'28',t:'28 px'},{v:'32',t:'32 px'},
      {v:'36',t:'36 px'},{v:'48',t:'48 px'}],
      'Wielkość tekstu — zaznacz tekst i wybierz; pasek pokazuje wielkość zaznaczenia', function (v) {
        if (!v) return;
        if (!owinSpan('font-size:' + v + 'px')) {
          var m = { '10':'1','12':'2','14':'3','16':'4','18':'4','20':'5','24':'5','28':'6','32':'7','36':'7','48':'7' };
          document.execCommand('fontSize', false, m[v] || '4');
        }
      });
    var paletaTekst = Paleta('A', 'Kolor tekstu — paleta kolorów z przyciskiem OK', 'foreColor');
    var paletaTlo = Paleta('🖍', 'Kolor tła tekstu (podświetlenie) — paleta kolorów z przyciskiem OK', 'hiliteColor');
    Gr('|', 'Styl akapitu (paragraph)');
    Sel([{v:'',t:'Styl akapitu…'},{v:'p',t:'Akapit'},{v:'h2',t:'Tytuł'},{v:'h3',t:'Podtytuł'},
      {v:'blockquote',t:'Cytat'},{v:'div.sl-tag',t:'Etykieta (ramka)'},{v:'div.tre-blok',t:'Blok (ramka)'}],
      'Styl akapitu — przekształca bieżący akapit (jak Word)', function (v) {
        if (!v) return;
        stylAkapi(v);
      });
    B('<b>B</b>', 'Pogrubienie (Ctrl+B)', 'bold');
    B('<i>I</i>', 'Kursywa (Ctrl+I)', 'italic');
    B('<u>U</u>', 'Podkreślenie', 'underline');
    Gr('•', 'Lista punktowana');
    B('• Lista', 'Lista punktowana', 'insertUnorderedList');
    B('1. Lista', 'Lista numerowana', 'insertOrderedList');
    B('„Cytat"', 'Cytat', 'formatBlock', 'blockquote');
    Gr('|', 'Wyrównanie (jak w Wordzie)');
    B('⇤', 'Wyrównaj do lewej', 'justifyLeft');
    B('↔', 'Wyrównaj do środka', 'justifyCenter');
    B('⇥', 'Wyrównaj do prawej', 'justifyRight');
    B('≡', 'Wyjustuj (tekst na całą szerokość)', 'justifyFull');
    Gr('|', 'Linki i media');
    B('🔗', 'Wstaw link', 'link');
    B('🖼', 'Wstaw obraz (plik)', 'obraz');
    B('▶ Film', 'Wstaw film YouTube', 'youtube');
    Gr('|', 'Układ i bloki');
    B('▥ 2 kol.', 'Dwie kolumny obok siebie', 'kolumny2');
    B('▥▥ 3 kol.', 'Trzy kolumny obok siebie', 'kolumny3');
    B('▦ Tabela', 'Tabela z obramowaniem (2×2)', 'tabela');
    B('▢ Tabela bez', 'Tabela bez obramowania (2×2)', 'tabelaBez');
    B('🏷 Etykieta', 'Blok-etykieta w ramce (mały napis, np. „Nowości")', 'tag');
    B('▭ Blok', 'Blok z ramką (wyróżniony box)', 'blok');
    B('⎯ Przerwa', 'Pozioma linia', 'linia');
    Gr('|', 'Obiekty');
    B('✱ Przycisk', 'Wstaw przycisk (obiekt jak obrazek)', 'przycisk');
    B('◆ Kształt', 'Wstaw kształt (prostokąt, elipsa, linia — obiekt z tekstem i kolorami)', 'ksztalt');
    B('⬅', 'Wyrównaj: do lewej krawędzi (kilka obiektów — względem siebie)', 'obj-lewo');
    B('↔', 'Wyrównaj: do środka (poziomo) (kilka — w jednej kolumnie)', 'obj-srodek');
    B('➡', 'Wyrównaj: do prawej krawędzi (kilka obiektów — względem siebie)', 'obj-prawo');
    B('⬆', 'Wyrównaj: do góry (kilka — w jednej linii)', 'obj-gora');
    B('↕', 'Wyrównaj: do środka (pionowo) (kilka — w jednej linii)', 'obj-srodek-pion');
    B('⬇', 'Wyrównaj: do dołu (kilka obiektów — względem siebie)', 'obj-dol');
    B('⇶', 'Rozłóż w poziomie (jednakowe odstępy)', 'rozloz-poziom');
    B('⇵', 'Rozłóż w pionie (jednakowe odstępy)', 'rozloz-pion');
    B('✕ Format', 'Wyczyść formatowanie zaznaczenia', 'removeFormat');

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
    bar.querySelector('button[title="Dwie kolumny obok siebie"]').addEventListener('click', function () { wstawKolumny(2); });
    bar.querySelector('button[title="Trzy kolumny obok siebie"]').addEventListener('click', function () { wstawKolumny(3); });

    /* ---------- tabele ---------- */
    function wstawTabele(klasa) {
      pole.focus();
      document.execCommand('insertHTML', false,
        '<table class="' + klasa + '"><tbody>' +
        '<tr><td>Komórka</td><td>Komórka</td></tr>' +
        '<tr><td>Komórka</td><td>Komórka</td></tr>' +
        '</tbody></table><p><br></p>');
    }
    bar.querySelector('button[title="Tabela z obramowaniem (2×2)"]').addEventListener('click', function () { wstawTabele('tre-tabela'); });
    bar.querySelector('button[title="Tabela bez obramowania (2×2)"]').addEventListener('click', function () { wstawTabele('tre-tabela tre-bez'); });

    /* ---------- etykieta / blok / linia ---------- */
    bar.querySelector('button[title^="Blok-etykieta"]').addEventListener('click', function () {
      var txt = prompt('Tekst etykiety (np. „Nowości"):', 'Nowości');
      if (!txt) return;
      pole.focus();
      document.execCommand('insertHTML', false, '<p class="sl-tag">' + escA(txt) + '</p>');
    });
    bar.querySelector('button[title^="Blok z ramką"]').addEventListener('click', function () {
      modal('Blok z ramką (prostokąt)',
        '<div class="pole"><label>Tekst bloku</label><textarea id="eb-blok-t" style="min-height:70px">Treść bloku</textarea></div>' +
        '<div class="pole"><label>Szerokość</label><select id="eb-blok-szer">' +
        '<option value="100%">Pełna szerokość</option><option value="75%">¾ szerokości</option>' +
        '<option value="50%">Połowa (½)</option><option value="33%">Jedna trzecia (⅓)</option></select></div>' +
        '<div class="pole"><label style="cursor:pointer"><input type="checkbox" id="eb-blok-bez" style="width:auto;margin-right:8px"> Bez tła (sama ramka)</label></div>' +
        '<div class="pole"><label>Kolor tła bloku</label><input type="color" id="eb-blok-tlo" value="#1F3A32"></div>' +
        '<p class="mala">Blok jest OBIEKTEM (prostokątem): klik = zaznaczenie, 2×klik = edycja tekstu w środku, przeciąganie = przesunięcie, narożny uchwyt = zmiana rozmiaru (dowolna szerokość i wysokość), Ctrl+klik = grupa (wyrównanie względem siebie), Backspace = usunięcie.</p>',
        function (okno) {
          var txt = okno.querySelector('#eb-blok-t').value.trim();
          if (!txt) { alert('Podaj tekst bloku.'); return false; }
          var bez = okno.querySelector('#eb-blok-bez').checked;
          var szer = okno.querySelector('#eb-blok-szer').value;
          var styl = (bez ? ' style="background:transparent;width:' : ' style="background:' + okno.querySelector('#eb-blok-tlo').value + ';width:') + szer + '"';
          pole.focus();
          document.execCommand('insertHTML', false,
            '<div class="tre-blok" contenteditable="false"' + styl + '><p>' + escA(txt) + '</p></div><p><br></p>');
        });
    });
    bar.querySelector('button[title="Pozioma linia"]').addEventListener('click', function () {
      pole.focus();
      document.execCommand('insertHTML', false, '<hr class="tre-linia"><p><br></p>');
    });

    /* ---------- zaznaczanie obiektów: klik = zaznacza, 2×klik = edycja ---------- */
    var wybrane = [];
    var uchwyt = null;
    function obiektyEl(){
      var lista = [];
      pole.querySelectorAll('.tre-przycisk-obiekt, .tre-ksztalt, .tre-blok, img').forEach(function (el) { lista.push(el); });
      return lista;
    }
    function rysujUchwyt(){
      if (uchwyt && uchwyt.parentNode) uchwyt.parentNode.removeChild(uchwyt);
      uchwyt = null;
      if (wybrane.length !== 1) return;
      var ob = wybrane[0];
      var czy = ob.tagName === 'IMG' || (ob.classList &&
        (ob.classList.contains('tre-ksztalt') || ob.classList.contains('tre-blok')));
      if (!czy) return;
      var pr = pole.getBoundingClientRect();
      var r = ob.getBoundingClientRect();
      uchwyt = document.createElement('span');
      uchwyt.className = 'tre-uchwyt';
      pole.appendChild(uchwyt);
      uchwyt.style.left = Math.max(0, r.right - pr.left - 5) + 'px';
      uchwyt.style.top = Math.max(0, r.bottom - pr.top - 5) + 'px';
    }
    function odswiezWybranie(){
      obiektyEl().forEach(function (el) { el.classList.remove('tre-wybrany'); });
      wybrane.forEach(function (el) { if (el && el.classList) el.classList.add('tre-wybrany'); });
      rysujUchwyt();
    }
    function czyscWybranie(){
      wybrane = [];
      odswiezWybranie();
    }
    function obiektZaznaczony(){
      return wybrane.length === 1 ? wybrane[0] : (wybrane[wybrane.length - 1] || null);
    }
    /* blok (prostokąt): 2×klik włącza edycję tekstu w środku */
    var edytowanyBlok = null;
    function wejdzEdycjeBloku(bl){
      zakonczEdycjeBloku();
      edytowanyBlok = bl;
      bl.setAttribute('contenteditable', 'true');
      bl.focus();
      var sel = window.getSelection();
      var r = document.createRange();
      r.selectNodeContents(bl);
      r.collapse(false);
      sel.removeAllRanges();
      sel.addRange(r);
    }
    function zakonczEdycjeBloku(){
      if (edytowanyBlok){
        edytowanyBlok.setAttribute('contenteditable', 'false');
        edytowanyBlok = null;
      }
    }

    /* ---------- PRZYCISK: wstaw obok zaznaczonego obiektu ---------- */
    bar.querySelector('button[title^="Wstaw przycisk"]').addEventListener('click', function () {
      oknoPrzycisku({ styl:'wlasny', tekst:'Zobacz więcej', link:'sklep.html', rozmiar:'m',
        tlo:'#1F3A32', kolor:'#C4A582', czcionka:'serif' }, function (d) {
        var html = budujPrzycisk(d) + '&nbsp;';
        var ob = obiektZaznaczony();
        var nowyEl = null;
        if (ob){
          /* przycisk obok istniejącego — stoją obok siebie w linii */
          ob.insertAdjacentHTML('afterend', html);
          nowyEl = ob.nextElementSibling;
        } else {
          pole.focus();
          document.execCommand('insertHTML', false, html);
        }
        czyscWybranie();
        if (nowyEl && nowyEl.classList && nowyEl.classList.contains('tre-przycisk-obiekt')){
          wybrane = [nowyEl];
          odswiezWybranie();
        }
      });
    });

    /* ---------- KSZTAŁTY (obiekty jak w PowerPoint) ---------- */
    function budujKsztalt(d){
      if (d.typ === 'linia'){
        return '<span class="tre-ksztalt tre-linia" contenteditable="false" data-ks-typ="linia"' +
          ' style="display:inline-block;width:' + d.szer + 'px;height:0;border-top:3px solid ' + escA(d.ramka) + '"></span>';
      }
      var promien = d.typ === 'elipsa' ? '50%' : (d.typ === 'zaokraglony' ? '14px' : '2px');
      var tlo = d.przez ? 'transparent' : d.tlo;
      var font = d.czcionka === 'sans' ? SANS : (d.czcionka === 'mono' ? MONO : SERIF);
      var tekst = d.tekst ? '<span class="tre-ksztalt-t">' + escA(d.tekst) + '</span>' : '';
      return '<span class="tre-ksztalt" contenteditable="false"' +
        ' data-ks-typ="' + escA(d.typ) + '" data-ks-tekst="' + escA(d.tekst) + '"' +
        ' data-ks-tlo="' + escA(d.tlo) + '" data-ks-przez="' + (d.przez ? '1' : '') + '"' +
        ' data-ks-ramka="' + escA(d.ramka) + '" data-ks-czcionka="' + escA(d.czcionka) + '"' +
        ' data-ks-kolor="' + escA(d.kolor) + '"' +
        ' style="display:inline-block;width:' + d.szer + 'px;height:' + d.wys + 'px;background:' + tlo +
        ';border:2px solid ' + escA(d.ramka) + ';border-radius:' + promien + ';vertical-align:middle">' +
        '<span class="tre-ksztalt-s" style="font-family:' + font + ';color:' + escA(d.kolor) + '">' +
        tekst + '</span></span>';
    }
    function czytajKsztalt(ob){
      return {
        typ: ob.getAttribute('data-ks-typ') || 'prostokat',
        tekst: ob.getAttribute('data-ks-tekst') || '',
        tlo: ob.getAttribute('data-ks-tlo') || '#1F3A32',
        przez: ob.getAttribute('data-ks-przez') === '1',
        ramka: ob.getAttribute('data-ks-ramka') || '#C4A582',
        czcionka: ob.getAttribute('data-ks-czcionka') || 'serif',
        kolor: ob.getAttribute('data-ks-kolor') || '#FBF7F0',
        szer: 180, wys: 60
      };
    }
    function oknoKsztaltu(init, cb){
      var modalOkno = modal('Kształt',
        '<div class="pole"><label>Rodzaj kształtu</label><select id="ek-typ">' +
        '<option value="prostokat"' + (init.typ === 'prostokat' ? ' selected' : '') + '>Prostokąt</option>' +
        '<option value="zaokraglony"' + (init.typ === 'zaokraglony' ? ' selected' : '') + '>Zaokrąglony prostokąt</option>' +
        '<option value="elipsa"' + (init.typ === 'elipsa' ? ' selected' : '') + '>Elipsa / koło</option>' +
        '<option value="linia"' + (init.typ === 'linia' ? ' selected' : '') + '>Linia pozioma</option></select></div>' +
        '<div class="pole"><label>Tekst w kształcie (opcjonalnie)</label>' +
        '<input type="text" id="ek-tekst" value="' + escA(init.tekst) + '"></div>' +
        '<div class="pole" style="display:flex;gap:10px;flex-wrap:wrap">' +
        '<div style="flex:1;min-width:120px"><label>Wypełnienie</label><input type="color" id="ek-tlo" value="' + escA(init.tlo) + '"></div>' +
        '<div style="flex:1;min-width:120px"><label>Ramka</label><input type="color" id="ek-ramka" value="' + escA(init.ramka) + '"></div>' +
        '<div style="flex:1;min-width:120px"><label>Kolor tekstu</label><input type="color" id="ek-kolor" value="' + escA(init.kolor) + '"></div></div>' +
        '<div class="pole"><label style="cursor:pointer"><input type="checkbox" id="ek-przez" style="width:auto;margin-right:8px"' +
        (init.przez ? ' checked' : '') + '> Przezroczyste wypełnienie</label></div>' +
        '<div class="pole" style="display:flex;gap:10px">' +
        '<div style="flex:1"><label>Szerokość</label><select id="ek-szer">' +
        '<option value="100">Mała (S)</option><option value="180" selected>Średnia (M)</option>' +
        '<option value="300">Duża (L)</option></select></div>' +
        '<div style="flex:1"><label>Wysokość</label><select id="ek-wys">' +
        '<option value="40">Mała (S)</option><option value="60" selected>Średnia (M)</option>' +
        '<option value="100">Duża (L)</option></select></div></div>' +
        '<p class="mala">Kształt jest OBIEKTEM: klik = zaznaczenie, 2×klik = edycja, przeciąganie myszą = przesunięcie, narożnik = zmiana rozmiaru, Ctrl+klik = kilka obiektów naraz, Backspace = usunięcie.</p>',
        function (okno) {
          var d = {
            typ: okno.querySelector('#ek-typ').value,
            tekst: okno.querySelector('#ek-tekst').value.trim(),
            tlo: okno.querySelector('#ek-tlo').value,
            przez: okno.querySelector('#ek-przez').checked,
            ramka: okno.querySelector('#ek-ramka').value,
            kolor: okno.querySelector('#ek-kolor').value,
            czcionka: 'serif',
            szer: parseInt(okno.querySelector('#ek-szer').value, 10),
            wys: parseInt(okno.querySelector('#ek-wys').value, 10)
          };
          if (cb(d) === false) return false;
        });
      modalOkno.querySelector('#ek-przez').addEventListener('change', function(){
        modalOkno.querySelector('#ek-tlo').disabled = this.checked;
      });
      if (init.przez) modalOkno.querySelector('#ek-tlo').disabled = true;
      return modalOkno;
    }
    bar.querySelector('button[title^="Wstaw kształt"]').addEventListener('click', function () {
      oknoKsztaltu({ typ:'prostokat', tekst:'', tlo:'#1F3A32', przez:false, ramka:'#C4A582',
        czcionka:'serif', kolor:'#FBF7F0', szer:180, wys:60 }, function (d) {
        var html = budujKsztalt(d) + '&nbsp;';
        var ob = obiektZaznaczony();
        var nowyEl = null;
        if (ob){ ob.insertAdjacentHTML('afterend', html); nowyEl = ob.nextElementSibling; }
        else { pole.focus(); document.execCommand('insertHTML', false, html); }
        czyscWybranie();
        if (nowyEl && nowyEl.classList && nowyEl.classList.contains('tre-ksztalt')){
          wybrane = [nowyEl];
          odswiezWybranie();
        }
      });
    });

    /* ---------- WYRÓWNANIE OBIEKTÓW (jak w edytorze graficznym) ---------- */
    function wyrownajObiekt(strona){
      if (!wybrane.length){
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
        /* jeden obiekt — do krawędzi / środka POLA */
        var it = dane[0];
        if (strona === 'lewo') it.ob.style.left = '1.5%';
        if (strona === 'prawo') it.ob.style.left = pxn(Math.max(0, pr.width - it.w - pr.width * 0.015));
        if (strona === 'srodek') it.ob.style.left = pxn(Math.max(0, (pr.width - it.w) / 2));
        if (strona === 'gora') it.ob.style.top = '1.5%';
        if (strona === 'dol') it.ob.style.top = pyn(Math.max(0, pr.height - it.h - pr.height * 0.015));
        if (strona === 'srodek-pion') it.ob.style.top = pyn(Math.max(0, (pr.height - it.h) / 2));
      } else {
        /* kilka obiektów — WYRÓWNANIE WZGLĘDEM SIEBIE (jak PowerPoint):
           np. przyciski w jednej linii / w jednej kolumnie */
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
        it.ob.style.margin = '0'; it.ob.style.zIndex = 5;
      });
      odswiezWybranie();
    }
    /* rozłożenie równo: przyciski/bloki w równych odstępach (linia lub kolumna) */
    function rozlozObiekty(kier){
      if (wybrane.length < 3){
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
          it.ob.style.margin = '0'; it.ob.style.zIndex = 5;
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
          it.ob.style.margin = '0'; it.ob.style.zIndex = 5;
          y += it.h + gap2;
        });
      }
      odswiezWybranie();
    }
    bar.querySelector('button[title="Wyrównaj: do lewej krawędzi"]').addEventListener('click', function(){ wyrownajObiekt('lewo'); });
    bar.querySelector('button[title="Wyrównaj: do środka (poziomo)"]').addEventListener('click', function(){ wyrownajObiekt('srodek'); });
    bar.querySelector('button[title="Wyrównaj: do prawej krawędzi"]').addEventListener('click', function(){ wyrownajObiekt('prawo'); });
    bar.querySelector('button[title="Wyrównaj: do góry"]').addEventListener('click', function(){ wyrownajObiekt('gora'); });
    bar.querySelector('button[title="Wyrównaj: do środka (pionowo)"]').addEventListener('click', function(){ wyrownajObiekt('srodek-pion'); });
    bar.querySelector('button[title="Wyrównaj: do dołu"]').addEventListener('click', function(){ wyrownajObiekt('dol'); });
    bar.querySelector('button[title="Rozłóż w poziomie (jednakowe odstępy)"]').addEventListener('click', function(){ rozlozObiekty('poziom'); });
    bar.querySelector('button[title="Rozłóż w pionie (jednakowe odstępy)"]').addEventListener('click', function(){ rozlozObiekty('pion'); });

    /* ---------- DRAG&DROP obiektów (pojedynczo i w grupie) + uchwyt rozmiaru ---------- */
    var drag = null, justDragged = false, uchwytDrag = null;
    pole.addEventListener('pointerdown', function (e) {
      var t = e.target;
      if (t === uchwyt && wybrane.length === 1 && e.button === 0){
        e.preventDefault();
        var ob = wybrane[0];
        var pr = pole.getBoundingClientRect();
        var r = ob.getBoundingClientRect();
        if (ob.style.position !== 'absolute'){
          ob.style.position = 'absolute';
          ob.style.left = Math.max(0, (r.left - pr.left) / pr.width * 100) + '%';
          ob.style.top = Math.max(0, (r.top - pr.top) / pr.height * 100) + '%';
          ob.style.right = 'auto'; ob.style.bottom = 'auto';
          ob.style.margin = '0'; ob.style.zIndex = 5;
        }
        uchwytDrag = { ob: ob, x0: e.clientX, y0: e.clientY, w0: r.width, h0: r.height };
        return;
      }
      if (!(t && t.closest) || e.button !== 0) return;
      var ob = t.closest('.tre-przycisk-obiekt, .tre-ksztalt, .tre-blok, img');
      if (!ob) return;
      if (ob.classList && ob.classList.contains('tre-blok') && ob.isContentEditable) return;
      if (e.ctrlKey || e.metaKey){
        var ix = wybrane.indexOf(ob);
        if (ix >= 0) wybrane.splice(ix, 1); else wybrane.push(ob);
      } else if (wybrane.indexOf(ob) < 0){
        wybrane = [ob];
      }
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
        var nw = Math.max(24, uchwytDrag.w0 + (e.clientX - uchwytDrag.x0));
        var nh = Math.max(14, uchwytDrag.h0 + (e.clientY - uchwytDrag.y0));
        uchwytDrag.ob.style.width = nw + 'px';
        uchwytDrag.ob.style.height = nh + 'px';
        rysujUchwyt();
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
          it.el.style.margin = '0'; it.el.style.zIndex = 5;
        });
      }
      drag.start.forEach(function (it) {
        var l = Math.min(Math.max(0, it.left0 + dx), pr.width - it.w0);
        var t2 = Math.min(Math.max(0, it.top0 + dy), pr.height - it.h0);
        it.el.style.left = (l / pr.width * 100) + '%';
        it.el.style.top = (t2 / pr.height * 100) + '%';
      });
      rysujUchwyt();
      e.preventDefault();
    });
    pole.addEventListener('pointerup', function () {
      if (drag && drag.przes) justDragged = true;
      drag = null;
      uchwytDrag = null;
    });
    pole.addEventListener('pointercancel', function () { drag = null; uchwytDrag = null; });

    /* ---------- klik w pole: zaznaczanie obiektów i linki ---------- */
    pole.addEventListener('click', function (e) {
      if (justDragged){ justDragged = false; return; }
      var t = e.target;
      if (t === uchwyt) return;
      if (t && t.closest){
        var ob = t.closest('.tre-przycisk-obiekt, .tre-ksztalt, .tre-blok, img');
        if (ob){
          if (ob.classList && ob.classList.contains('tre-blok') && ob.isContentEditable) return;
          e.preventDefault();
          if (edytowanyBlok && edytowanyBlok !== ob) zakonczEdycjeBloku();
          if (e.ctrlKey || e.metaKey){
            var ix = wybrane.indexOf(ob);
            if (ix >= 0) wybrane.splice(ix, 1); else wybrane.push(ob);
          } else if (wybrane.indexOf(ob) < 0){
            wybrane = [ob];
          }
          odswiezWybranie();
          return;
        }
        var a = t.closest('a');
        if (a) e.preventDefault(); /* linki w edytorze nie nawigują */
        if (edytowanyBlok) zakonczEdycjeBloku();
        if (!e.ctrlKey && !e.metaKey) czyscWybranie();
      }
    });
    pole.addEventListener('dblclick', function (e) {
      var t = e.target;
      if (!(t && t.closest)) return;
      var ob = t.closest('.tre-przycisk-obiekt');
      if (ob){
        e.preventDefault();
        wybrane = [ob];
        odswiezWybranie();
        var init = czytajPrzycisk(ob);
        oknoPrzycisku(init, function (d) {
          var tmp = document.createElement('div');
          tmp.innerHTML = budujPrzycisk(d);
          var nowy = tmp.firstChild;
          var st = ob.getAttribute('style');
          if (st) nowy.setAttribute('style', st); /* przycisk ZOSTAJE tam, gdzie był */
          var sel = window.getSelection();
          if (sel) sel.removeAllRanges();
          ob.parentNode.replaceChild(nowy, ob);
          wybrane = [nowy];
          odswiezWybranie();
        });
        return;
      }
      var ks = t.closest('.tre-ksztalt');
      if (ks){
        e.preventDefault();
        wybrane = [ks];
        odswiezWybranie();
        var initK = czytajKsztalt(ks);
        oknoKsztaltu(initK, function (d) {
          var tmp = document.createElement('div');
          tmp.innerHTML = budujKsztalt(d);
          var nowy = tmp.firstChild;
          var st = ks.getAttribute('style');
          if (st) nowy.setAttribute('style', st);
          var sel = window.getSelection();
          if (sel) sel.removeAllRanges();
          ks.parentNode.replaceChild(nowy, ks);
          wybrane = [nowy];
          odswiezWybranie();
        });
      }
    });
    pole.addEventListener('dblclick', function (e2) {
      var t2 = e2.target;
      if (!(t2 && t2.closest)) return;
      var bl = t2.closest('.tre-blok');
      if (bl){
        e2.preventDefault();
        wybrane = [bl];
        odswiezWybranie();
        wejdzEdycjeBloku(bl);
      }
    });
    pole.addEventListener('focusout', function (e2) {
      if (edytowanyBlok && !(e2.relatedTarget && edytowanyBlok.contains(e2.relatedTarget))){
        zakonczEdycjeBloku();
      }
    });
    function usunWybrane(e){
      var tg = e.target;
      if (e.key === 'Escape'){
        if (edytowanyBlok) zakonczEdycjeBloku();
        if (wybrane.length) czyscWybranie();
        return;
      }
      if (edytowanyBlok && (tg === edytowanyBlok || edytowanyBlok.contains(tg))) return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && wybrane.length){
        var wPolu = tg === pole || (pole.contains(tg) &&
          !(tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA' || tg.tagName === 'SELECT'));
        var naTle = tg === document.body || tg === document.documentElement;
        if (wPolu || naTle){
          e.preventDefault();
          wybrane.forEach(function (el) { if (el.parentNode) el.parentNode.removeChild(el); });
          czyscWybranie();
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
      if (el.closest && el.closest('.tre-przycisk-obiekt, .tre-ksztalt')) return;
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
        czyscWybranie();
      },
      pobierz: function () { zakonczEdycjeBloku(); return pole.innerHTML; },
      focus: function () { pole.focus(); }
    };
  }

  window.SYG = window.SYG || {};
  SYG.edytorTresci = { stworz: stworz };
})();
