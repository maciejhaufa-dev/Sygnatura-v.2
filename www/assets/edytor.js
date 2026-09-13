/* ============================================================
   Studio Sygnatura — EDYTOR TREŚCI (edytor.js) v3
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
      '<p class="mala">Wstawiony przycisk jest OBIEKTEM — przeciągnij go myszą w dowolne miejsce (jak obrazek), kliknij, aby edytować; Backspace usuwa go w całości. Przyciski wstawiane jeden po drugim stoją obok siebie.</p>',
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

    B('Tytuł', 'Tytuł (nagłówek 2)', 'formatBlock', 'h2');
    B('Podtytuł', 'Podtytuł (nagłówek 3)', 'formatBlock', 'h3');
    B('Tekst', 'Zwykły akapit', 'formatBlock', 'p');
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
    B('⬅', 'Obiekt: do lewej krawędzi', 'obj-lewo');
    B('↔', 'Obiekt: do środka (poziomo)', 'obj-srodek');
    B('➡', 'Obiekt: do prawej krawędzi', 'obj-prawo');
    B('⬆', 'Obiekt: do góry', 'obj-gora');
    B('↕', 'Obiekt: do środka (pionowo)', 'obj-srodek-pion');
    B('⬇', 'Obiekt: do dołu', 'obj-dol');
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
      var txt = prompt('Tekst bloku:', 'Treść bloku');
      if (!txt) return;
      pole.focus();
      document.execCommand('insertHTML', false,
        '<div class="tre-blok"><p>' + escA(txt) + '</p></div><p><br></p>');
    });
    bar.querySelector('button[title="Pozioma linia"]').addEventListener('click', function () {
      pole.focus();
      document.execCommand('insertHTML', false, '<hr class="tre-linia"><p><br></p>');
    });

    /* ---------- zaznaczony obiekt ---------- */
    function obiektZaznaczony(){
      var sel = window.getSelection();
      if (!sel || !sel.anchorNode) return null;
      var n = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement;
      if (!n || !n.closest) return null;
      return n.closest('.tre-przycisk-obiekt, img');
    }

    /* ---------- PRZYCISK: wstaw obok zaznaczonego obiektu ---------- */
    bar.querySelector('button[title^="Wstaw przycisk"]').addEventListener('click', function () {
      oknoPrzycisku({ styl:'wlasny', tekst:'Zobacz więcej', link:'sklep.html', rozmiar:'m',
        tlo:'#1F3A32', kolor:'#C4A582', czcionka:'serif' }, function (d) {
        var html = budujPrzycisk(d) + '&nbsp;';
        var ob = obiektZaznaczony();
        if (ob){
          /* przycisk obok istniejącego — stoją obok siebie w linii */
          ob.insertAdjacentHTML('afterend', html);
        } else {
          pole.focus();
          document.execCommand('insertHTML', false, html);
        }
      });
    });

    /* ---------- WYRÓWNANIE OBIEKTÓW (jak w edytorze graficznym) ---------- */
    function wyrownajObiekt(strona){
      var ob = obiektZaznaczony();
      if (!ob){ alert('Zaznacz najpierw obiekt (przycisk lub obrazek), klikając na niego.'); return; }
      var pr = pole.getBoundingClientRect();
      var or = ob.getBoundingClientRect();
      if (ob.style.position !== 'absolute'){
        ob.style.position = 'absolute';
        ob.style.left = Math.max(0, (or.left - pr.left) / pr.width * 100) + '%';
        ob.style.top = Math.max(0, (or.top - pr.top) / pr.height * 100) + '%';
        ob.style.right = 'auto'; ob.style.bottom = 'auto';
        ob.style.margin = '0'; ob.style.zIndex = 5;
        or = ob.getBoundingClientRect();
      }
      var w = or.width, h = or.height;
      if (strona === 'lewo'){ ob.style.left = '1.5%'; ob.style.right = 'auto'; ob.style.marginLeft = '0'; }
      if (strona === 'prawo'){ ob.style.left = 'auto'; ob.style.right = '1.5%'; ob.style.marginLeft = '0'; }
      if (strona === 'srodek'){ ob.style.left = '50%'; ob.style.right = 'auto'; ob.style.marginLeft = (-w / 2) + 'px'; }
      if (strona === 'gora'){ ob.style.top = '1.5%'; ob.style.bottom = 'auto'; ob.style.marginTop = '0'; }
      if (strona === 'dol'){ ob.style.top = 'auto'; ob.style.bottom = '1.5%'; ob.style.marginTop = '0'; }
      if (strona === 'srodek-pion'){ ob.style.top = '50%'; ob.style.bottom = 'auto'; ob.style.marginTop = (-h / 2) + 'px'; }
    }
    bar.querySelector('button[title="Obiekt: do lewej krawędzi"]').addEventListener('click', function(){ wyrownajObiekt('lewo'); });
    bar.querySelector('button[title="Obiekt: do środka (poziomo)"]').addEventListener('click', function(){ wyrownajObiekt('srodek'); });
    bar.querySelector('button[title="Obiekt: do prawej krawędzi"]').addEventListener('click', function(){ wyrownajObiekt('prawo'); });
    bar.querySelector('button[title="Obiekt: do góry"]').addEventListener('click', function(){ wyrownajObiekt('gora'); });
    bar.querySelector('button[title="Obiekt: do środka (pionowo)"]').addEventListener('click', function(){ wyrownajObiekt('srodek-pion'); });
    bar.querySelector('button[title="Obiekt: do dołu"]').addEventListener('click', function(){ wyrownajObiekt('dol'); });

    /* ---------- DRAG&DROP obiektów (jak „ramka dla obrazka" w MS Word) ---------- */
    var drag = null, justDragged = false;
    pole.addEventListener('pointerdown', function (e) {
      var t = e.target;
      if (!(t && t.closest) || e.button !== 0) return;
      var ob = t.closest('.tre-przycisk-obiekt, img');
      if (!ob) return;
      var or = ob.getBoundingClientRect();
      drag = { ob: ob, offX: e.clientX - or.left, offY: e.clientY - or.top,
               startX: e.clientX, startY: e.clientY, przes: false };
      e.preventDefault();
      if (ob.setPointerCapture) try { ob.setPointerCapture(e.pointerId); } catch(_){}
    });
    pole.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.startX, dy = e.clientY - drag.startY;
      if (!drag.przes && Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
      if (!drag.przes){
        drag.przes = true;
        var pr0 = pole.getBoundingClientRect();
        var or0 = drag.ob.getBoundingClientRect();
        drag.ob.style.position = 'absolute';
        drag.ob.style.left = Math.max(0, (or0.left - pr0.left) / pr0.width * 100) + '%';
        drag.ob.style.top = Math.max(0, (or0.top - pr0.top) / pr0.height * 100) + '%';
        drag.ob.style.right = 'auto'; drag.ob.style.bottom = 'auto';
        drag.ob.style.margin = '0'; drag.ob.style.zIndex = 5;
      }
      var pr = pole.getBoundingClientRect();
      var or = drag.ob.getBoundingClientRect();
      var l = e.clientX - pr.left - drag.offX;
      var t2 = e.clientY - pr.top - drag.offY;
      l = Math.min(Math.max(0, l), pr.width - or.width);
      t2 = Math.min(Math.max(0, t2), pr.height - or.height);
      drag.ob.style.left = (l / pr.width * 100) + '%';
      drag.ob.style.top = (t2 / pr.height * 100) + '%';
      e.preventDefault();
    });
    pole.addEventListener('pointerup', function () {
      if (drag && drag.przes) justDragged = true;
      drag = null;
    });
    pole.addEventListener('pointercancel', function () { drag = null; });

    /* ---------- klik w pole: obiekty i linki ---------- */
    pole.addEventListener('click', function (e) {
      if (justDragged){ justDragged = false; return; }
      var t = e.target;
      if (t && t.closest){
        var ob = t.closest('.tre-przycisk-obiekt');
        if (ob){
          e.preventDefault();
          var init = czytajPrzycisk(ob);
          oknoPrzycisku(init, function (d) {
            var tmp = document.createElement('div');
            tmp.innerHTML = budujPrzycisk(d);
            ob.parentNode.replaceChild(tmp.firstChild, ob);
          });
          return;
        }
        var a = t.closest('a');
        if (a) e.preventDefault(); /* linki w edytorze nie nawigują */
      }
    });

    /* ---------- API ---------- */
    return {
      ustaw: function (html) { pole.innerHTML = html || ''; },
      pobierz: function () { return pole.innerHTML; },
      focus: function () { pole.focus(); }
    };
  }

  window.SYG = window.SYG || {};
  SYG.edytorTresci = { stworz: stworz };
})();
