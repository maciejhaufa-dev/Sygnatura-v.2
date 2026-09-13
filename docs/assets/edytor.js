/* ============================================================
   Studio Sygnatura — EDYTOR TREŚCI (edytor.js)
   Uniwersalny silnik edycji treści („EDYTOR TREŚCI") — jeden
   dla całego serwisu: kafle slidera, wpisy bloga, podstrony.
   Zachowuje się jak edytor tekstu (MS Word / Canva):

   • Tytuł / podtytuł / akapit — style blokowe
   • Pogrubienie, kursywa, podkreślenie, listy, cytat
   • Linki, obrazy (plik / schowek), film YouTube
   • Kolumny (2 lub 3) — bloki obok siebie
   • Tabele z obramowaniem i bez
   • PRZYCISKI — własne okno: tekst, link, rozmiar (S/M/L),
     kolor tła, kolor tekstu, czcionka
   • Separator, wyczyść formatowanie

   Użycie:
     var ed = SYG.edytorTresci.stworz(document.getElementById('kontener'));
     ed.ustaw('<h2>…</h2>');   // wczytaj HTML
     ed.pobierz();             // aktualny HTML (do zapisu)
   ============================================================ */
(function () {
  var SANS = "'Segoe UI',Arial,sans-serif";
  var SERIF = "'Cormorant Garamond','Playfair Display',Georgia,serif";
  var MONO = "'Courier New',Courier,monospace";

  /* ---------- mały modal (przycisk / pomoc) ---------- */
  function modal(tytul, trescHtml, okCb) {
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
    ok.type = 'button'; ok.className = 'btn'; ok.textContent = 'Wstaw';
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

  /* ---------- fabryka edytora ---------- */
  function stworz(kontener) {
    if (!kontener) return null;
    kontener.classList.add('edtr');

    var bar = document.createElement('div');
    bar.className = 'edtr-bar';
    kontener.innerHTML = '';
    kontener.appendChild(bar);

    var pole = document.createElement('div');
    pole.className = 'edtr-pole';
    pole.contentEditable = 'true';
    pole.setAttribute('aria-label', 'Edytor treści');
    kontener.appendChild(pole);

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
    Gr('|', 'Linki i media');
    B('🔗', 'Wstaw link', 'link');
    B('🖼', 'Wstaw obraz (plik)', 'obraz');
    B('▶ Film', 'Wstaw film YouTube', 'youtube');
    Gr('|', 'Układ');
    B('▥ 2 kol.', 'Dwie kolumny obok siebie', 'kolumny2');
    B('▥▥ 3 kol.', 'Trzy kolumny obok siebie', 'kolumny3');
    B('▦ Tabela', 'Tabela z obramowaniem (2×2)', 'tabela');
    B('▢ Tabela bez', 'Tabela bez obramowania (2×2)', 'tabelaBez');
    B('⎯ Przerwa', 'Pozioma linia', 'linia');
    B('✱', 'Przycisk (tekst, link, kolory, rozmiar)', 'przycisk');
    B('✕ Format', 'Wyczyść formatowanie zaznaczenia', 'removeFormat');

    /* ---------- link ---------- */
    bar.querySelector('button[title="Wstaw link"]').addEventListener('click', function () {
      pole.focus();
      var url = prompt('Adres (https://…):', 'https://');
      if (url && url !== 'https://') document.execCommand('createLink', false, url);
    });

    /* ---------- obraz: plik lub schowek ---------- */
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

    /* ---------- linia ---------- */
    bar.querySelector('button[title="Pozioma linia"]').addEventListener('click', function () {
      pole.focus();
      document.execCommand('insertHTML', false, '<hr class="tre-linia"><p><br></p>');
    });

    /* ---------- PRZYCISK: okno konfiguracji ---------- */
    bar.querySelector('button[title^="Przycisk"]').addEventListener('click', function () {
      var modalOkno = modal('Wstaw przycisk',
        '<div class="pole"><label>Tekst przycisku</label><input type="text" id="eb-tekst" value="Zobacz więcej"></div>' +
        '<div class="pole"><label>Link (strona docelowa)</label><input type="text" id="eb-link" value="sklep.html" placeholder="np. sklep.html lub https://…"></div>' +
        '<div class="pole"><label>Rozmiar</label><select id="eb-rozmiar">' +
        '<option value="s">Mały (S)</option><option value="m" selected>Średni (M)</option><option value="l">Duży (L)</option></select></div>' +
        '<div class="pole" style="display:flex;gap:10px">' +
        '<div style="flex:1"><label>Kolor tła</label><input type="color" id="eb-tlo" value="#1F3A32"></div>' +
        '<div style="flex:1"><label>Kolor tekstu</label><input type="color" id="eb-kolor" value="#C4A582"></div></div>' +
        '<div class="pole"><label>Czcionka</label><select id="eb-czcionka">' +
        '<option value="serif" selected>Serif (styl studia)</option>' +
        '<option value="sans">Bezszeryfowa (nowoczesna)</option>' +
        '<option value="mono">Maszyna (monospace)</option></select></div>',
        function (okno) {
          var tekst = okno.querySelector('#eb-tekst').value.trim();
          var link = okno.querySelector('#eb-link').value.trim() || '#';
          if (!tekst) { alert('Podaj tekst przycisku.'); return false; }
          var rozmiar = okno.querySelector('#eb-rozmiar').value;
          var tlo = okno.querySelector('#eb-tlo').value;
          var kolor = okno.querySelector('#eb-kolor').value;
          var czcionka = okno.querySelector('#eb-czcionka').value;
          var font = czcionka === 'sans' ? SANS : (czcionka === 'mono' ? MONO : SERIF);
          pole.focus();
          document.execCommand('insertHTML', false,
            '<a class="tre-przycisk tre-' + rozmiar + '" href="' + link + '" style="background:' + tlo + ';color:' + kolor +
            ';font-family:' + font + '">' + tekst + '</a>&nbsp;');
        });
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
