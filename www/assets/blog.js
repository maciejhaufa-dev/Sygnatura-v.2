/* ============================================================
   Studio Sygnatura — BLOG / REALIZACJE (blog.js)
   - lista wpisów (kafle-odnośniki, filtr kategorii)
   - strona wpisu: zdjęcia (galeria + lightbox), opis, film YT,
     i blok produktu: „DODAJ DO KOSZYKA" / „ZAMÓW JUŻ DZIŚ!"
     (personalizacja z odniesieniem do tego produktu)
   Strony: <body data-blog="lista"> i <body data-blog="wpis">.
   ============================================================ */
(function () {
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function dzien(iso) {
    try {
      const d = new Date(iso + 'T12:00:00');
      return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) { return iso || ''; }
  }
  function videoId(url) {
    const m = String(url || '').match(/(?:v=|youtu\.be\/)([\w-]{6,})/);
    return m ? m[1] : '';
  }

  /* ---------- lista (kafle) ---------- */
  async function lista(kontener) {
    const odp = await SYG.wezwij('blog-lista', {});
    const wpisy = (odp.ok && odp.wpisy) || [];
    kontener.innerHTML = '';
    if (!wpisy.length) {
      kontener.innerHTML = '<p class="mala" style="padding:14px 0">Nie ma jeszcze wpisów. Pierwsza realizacja pojawi się tu wkrótce.</p>';
      return;
    }
    const kategorie = [];
    wpisy.forEach(function (w) { if (w.kategoria && kategorie.indexOf(w.kategoria) < 0) kategorie.push(w.kategoria); });
    const filtr = document.createElement('div');
    filtr.className = 'blog-filtr';
    let chips = '<button type="button" class="blog-chip on" data-kat="">Wszystkie</button>';
    kategorie.forEach(function (k) { chips += '<button type="button" class="blog-chip" data-kat="' + esc(k) + '">' + esc(k) + '</button>'; });
    filtr.innerHTML = chips;
    kontener.appendChild(filtr);
    const siatka = document.createElement('div');
    siatka.className = 'blog-siatka';
    kontener.appendChild(siatka);
    function rysuj(kat) {
      siatka.innerHTML = wpisy.filter(function (w) { return !kat || w.kategoria === kat; }).map(function (w) {
        return '<a class="blog-kafel" href="blog-wpis.html?id=' + w.id + '">' +
          '<img src="' + esc(w.okladka) + '" alt="' + esc(w.tytul) + '" loading="lazy">' +
          (w.produkt && w.produkt.sklep ? '<span class="blog-badge">dostępny w sklepie</span>' : '') +
          '<span class="blog-kafel-tresc">' +
          '<span class="kat">' + esc(w.kategoria) + '</span>' +
          '<span class="nazwa">' + esc(w.tytul) + '</span>' +
          '<span class="blog-data">' + dzien(w.data) + '</span>' +
          '<span class="blog-zajawka">' + esc(w.zajawka) + '</span>' +
          '</span></a>';
      }).join('');
    }
    rysuj('');
    filtr.querySelectorAll('.blog-chip').forEach(function (c) {
      c.addEventListener('click', function () {
        filtr.querySelectorAll('.blog-chip').forEach(function (x) { x.classList.remove('on'); });
        c.classList.add('on');
        rysuj(c.getAttribute('data-kat'));
      });
    });
  }

  /* ---------- lightbox ---------- */
  let lbLista = [], lbIdx = 0;
  function lightbox() {
    const tlo = document.createElement('div');
    tlo.className = 'lb-tlo';
    tlo.innerHTML = '<button type="button" class="lb-zamknij" aria-label="Zamknij">✕</button>' +
      '<button type="button" class="lb-nav lb-prev" aria-label="Poprzednie">‹</button>' +
      '<img src="" alt=""><button type="button" class="lb-nav lb-next" aria-label="Następne">›</button>';
    tlo.style.display = 'none';
    document.body.appendChild(tlo);
    function pokaz(i) {
      lbIdx = (i + lbLista.length) % lbLista.length;
      tlo.querySelector('img').src = lbLista[lbIdx];
      tlo.style.display = 'grid';
    }
    tlo.addEventListener('click', function (e) { if (e.target === tlo || e.target.classList.contains('lb-zamknij')) tlo.style.display = 'none'; });
    tlo.querySelector('.lb-prev').addEventListener('click', function (e) { e.stopPropagation(); pokaz(lbIdx - 1); });
    tlo.querySelector('.lb-next').addEventListener('click', function (e) { e.stopPropagation(); pokaz(lbIdx + 1); });
    document.addEventListener('keydown', function (e) {
      if (tlo.style.display !== 'grid') return;
      if (e.key === 'Escape') tlo.style.display = 'none';
      if (e.key === 'ArrowLeft') pokaz(lbIdx - 1);
      if (e.key === 'ArrowRight') pokaz(lbIdx + 1);
    });
    return { otworz: function (lista, i) { lbLista = lista.slice(); pokaz(i || 0); } };
  }

  /* ---------- strona wpisu ---------- */
  async function wpis(kontener) {
    const id = SYG.param('id');
    const odp = await SYG.wezwij('blog-pobierz', { id: id });
    if (!odp.ok || !odp.wpis) {
      kontener.innerHTML = '<div class="sukces"><h2>Nie znaleziono wpisu</h2>' +
        '<p><a class="btn" href="blog.html" style="margin-top:12px">← Wróć do realizacji</a></p></div>';
      return;
    }
    const w = odp.wpis;
    const lb = lightbox();
    const wszystkie = [w.okladka].concat((w.galeria || []).filter(function (g) { return g && g !== w.okladka; }));

    /* galeria: okładka + miniatury */
    let galeria = '<div class="wpis-galeria">' +
      '<figure class="wpis-okladka"><img src="' + esc(w.okladka) + '" alt="' + esc(w.tytul) + '"></figure>';
    if (wszystkie.length > 1) {
      galeria += '<div class="wpis-miniatury">';
      wszystkie.forEach(function (g, i) {
        galeria += '<button type="button" class="wpis-mini" data-i="' + i + '"><img src="' + esc(g) + '" alt="zdjęcie ' + (i + 1) + '"></button>';
      });
      galeria += '</div></div>';
    } else {
      galeria += '</div>';
    }

    /* film YouTube */
    const vId = videoId(w.video);
    const film = vId ? '<div class="wpis-film"><div class="edytor-video"><iframe width="560" height="315" ' +
      'src="https://www.youtube.com/embed/' + vId + '" frameborder="0" allowfullscreen loading="lazy"></iframe></div></div>' : '';

    /* blok produktu */
    let produktBlok = '';
    if (w.produkt && w.produkt.sklep) {
      const pr = w.produkt;
      produktBlok = '<div class="wpis-produkt">' +
        '<div><h2>Podoba Ci się ten projekt?</h2>' +
        '<p class="mala" style="margin:6px 0 14px">' + esc(pr.nazwa) + ' — ' + SYG.zl(pr.cena) + (pr.gabaryt ? ' · ' + esc(pr.gabaryt) : '') + '</p>' +
        '<div class="przyciski" style="flex-wrap:wrap">' +
        '<button type="button" class="btn" data-koszyk="' + Number(pr.id) + '">DODAJ DO KOSZYKA</button>' +
        '<a class="btn outline" href="personalizacja.html?produkt=' + encodeURIComponent(pr.nazwa || w.tytul) + '">ZAMÓW JUŻ DZIŚ!</a>' +
        '</div>' +
        '<p class="mala" style="margin-top:12px">Chcesz otrzymać produkt w wersji spersonalizowanej? Kliknij „ZAMÓW JUŻ DZIŚ!" — przejdziesz do zamówienia personalizacji z odniesieniem do tego produktu.</p>' +
        '</div></div>';
    }

    kontener.innerHTML =
      '<a class="powrot" href="blog.html">← wszystkie realizacje</a>' +
      '<span class="tag">' + esc(w.kategoria) + '</span>' +
      '<h1>' + esc(w.tytul) + '</h1>' +
      '<p class="sub">' + dzien(w.data) + (w.produkt && w.produkt.sklep ? ' · dostępny w sklepie' : '') + '</p>' +
      galeria + film + produktBlok +
      '<div class="blog-tresc">' + (w.tresc || '') + '</div>';

    kontener.querySelectorAll('.wpis-mini').forEach(function (b) {
      b.addEventListener('click', function () { lb.otworz(wszystkie, Number(b.getAttribute('data-i'))); });
    });
    kontener.querySelector('.wpis-okladka img').addEventListener('click', function () { lb.otworz(wszystkie, 0); });

    /* dodaj do koszyka */
    const gK = kontener.querySelector('button[data-koszyk]');
    if (gK) {
      gK.addEventListener('click', function () {
        const id = Number(gK.getAttribute('data-koszyk'));
        KOSZYK.dodajProdukt(id, 1);
        KOSZYK.odswiez();
        gK.textContent = 'DODANO ✓ — przejdź do koszyka';
        setTimeout(function () { window.location.href = 'koszyk.html'; }, 700);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    const kontener = document.getElementById('blog-tresc');
    if (!kontener) return;
    const tryb = document.body.getAttribute('data-blog') || 'lista';
    if (tryb === 'wpis') wpis(kontener); else lista(kontener);
  });
})();
