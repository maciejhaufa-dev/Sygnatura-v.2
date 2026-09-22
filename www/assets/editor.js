/* ============================================================
   Studio Sygnatura — PROSTY EDYTOR TEKSTU (editor.js)
   Działa jak pole posta na forum: zaznaczasz i formatujesz.
   Obsługuje: pogrubienie, kursywę, podkreślenie, nagłówki,
   listy, cytat, link, wstawianie obrazów (wklejone/pliki) i filmów.
   Użycie: <div class="editor" id="..."></div> + <input type="hidden" id="zrodlo">
   Treść HTML trzymana jest w ukrytym polu (id="zrodlo") — to pole
   leci do serwera (demo: localStorage). Do edycji: SYG.edytor.ustaw(html).
   ============================================================ */
(function () {
  function edytor(poleId, zrodloId) {
    const pole = document.getElementById(poleId);
    const zrodlo = document.getElementById(zrodloId);
    if (!pole || !zrodlo) return;

    /* ---------- pasek narzędzi ---------- */
    const bar = document.createElement('div');
    bar.className = 'edytor-bar';
    const B = function (etykieta, tytul, cmd, arg) {
      const b = document.createElement('button');
      b.type = 'button';
      b.title = tytul;
      b.innerHTML = etykieta;
      b.addEventListener('click', function () {
        pole.focus();
        if (cmd === 'link') {
          const url = prompt('Adres (https://…):', 'https://');
          if (url && url !== 'https://') document.execCommand('createLink', false, url);
        } else if (cmd === 'youtube') {
          const url = prompt('Link do filmu YouTube:', 'https://www.youtube.com/watch?v=');
          if (!url) return;
          const m = url.match(/(?:v=|youtu\.be\/)([\w-]{6,})/);
          if (!m) { alert('To nie wygląda na link YouTube.'); return; }
          const div = document.createElement('div');
          div.className = 'edytor-video';
          div.innerHTML = '<iframe width="560" height="315" src="https://www.youtube.com/embed/' + m[1] +
            '" frameborder="0" allowfullscreen></iframe><br><br>';
          pole.appendChild(div);
        } else {
          document.execCommand(cmd, false, arg || null);
        }
        sync();
      });
      bar.appendChild(b);
    };
    B('B', 'Pogrubienie (Ctrl+B)', 'bold');
    B('<i>I</i>', 'Kursywa (Ctrl+I)', 'italic');
    B('<u>U</u>', 'Podkreślenie', 'underline');
    B('H2', 'Nagłówek', 'formatBlock', 'h2');
    B('H3', 'Podnagłówek', 'formatBlock', 'h3');
    B('• Lista', 'Lista punktowana', 'insertUnorderedList');
    B('1. Lista', 'Lista numerowana', 'insertOrderedList');
    B('„Cytat"', 'Cytat', 'formatBlock', 'blockquote');
    B('🔗', 'Wstaw link', 'link');
    B('🖼', 'Wstaw obraz (plik)', 'image');
    B('▶ Film', 'Wstaw film YouTube', 'youtube');

    /* przycisk obrazu podpina ukryte wejście pliku */
    const imgInput = document.createElement('input');
    imgInput.type = 'file';
    imgInput.accept = 'image/*';
    imgInput.style.display = 'none';
    bar.querySelector('button[title="Wstaw obraz (plik)"]').addEventListener('click', function () {
      imgInput.click();
    });
    imgInput.addEventListener('change', function () {
      if (!imgInput.files.length) return;
      const f = imgInput.files[0];
      const fr = new FileReader();
      fr.onload = function () {
        const img = document.createElement('img');
        img.src = fr.result;
        img.style.maxWidth = '100%';
        pole.appendChild(img);
        pole.appendChild(document.createElement('br'));
        sync();
      };
      fr.readAsDataURL(f);
      imgInput.value = '';
    });

    /* wklejanie obrazów prosto ze schowka */
    pole.addEventListener('paste', function (e) {
      const items = (e.clipboardData || {}).items || [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type && items[i].type.indexOf('image/') === 0) {
          e.preventDefault();
          const f = items[i].getAsFile();
          const fr = new FileReader();
          fr.onload = function () {
            const img = document.createElement('img');
            img.src = fr.result;
            img.style.maxWidth = '100%';
            pole.appendChild(img);
            pole.appendChild(document.createElement('br'));
            sync();
          };
          fr.readAsDataURL(f);
          return;
        }
      }
    });

    pole.parentNode.insertBefore(bar, pole);
    pole.setAttribute('contenteditable', 'true');

    function sync() { zrodlo.value = pole.innerHTML; }
    pole.addEventListener('input', sync);

    return {
      ustaw: function (html) { pole.innerHTML = html || ''; sync(); },
      pobierz: function () { return pole.innerHTML; }
    };
  }

  window.SYG = window.SYG || {};
  SYG.edytor = edytor;
})();
