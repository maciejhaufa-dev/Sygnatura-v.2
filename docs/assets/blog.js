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
  function parsujDateBlog(value){
    const raw=String(value==null?'':value).trim();if(!raw)return null;
    const m=/^(\d{4})-(\d{1,2})-(\d{1,2})(?:([T ].*)?)$/.exec(raw);
    if(m){const y=+m[1],mo=+m[2]-1,day=+m[3],check=new Date(y,mo,day,12);if(isNaN(check.getTime())||check.getFullYear()!==y||check.getMonth()!==mo||check.getDate()!==day)return null;if(m[4]){const t=new Date(raw);return isNaN(t.getTime())?null:t;}return check;}
    const d=new Date(raw);return isNaN(d.getTime())?null:d;
  }
  function dzien(value){const d=parsujDateBlog(value);return d?d.toLocaleDateString('pl-PL',{day:'numeric',month:'long',year:'numeric'}):'';}
  function sortDodano(w){return Number(w.dodanoSort)||Number(w.id)||0;}
  function okladkaRealizacji(w){
    const opis=[w&&w.tytul,w&&w.kategoria,w&&w.zajawka,w&&w.tresc,w&&w.produkt&&w.produkt.nazwa].join(' ').toLowerCase();
    const normalized=opis.normalize?opis.normalize('NFD').replace(/[\u0300-\u036f]/g,''):opis;
    if(/szyld|tablic/.test(normalized)&&/czesc|powitaln/.test(normalized))return 'assets/media/sklep/szyld-czesc-profesjonalne.png?v=sitecream-1';
    return String(w&&w.okladka||'');
  }

  function videoId(url) {
    const m = String(url || '').match(/(?:v=|youtu\.be\/)([\w-]{6,})/);
    return m ? m[1] : '';
  }

  /* ---------- lista (kafle) ---------- */
  async function lista(kontener) {
    const odp = await SYG.wezwij('blog-lista', {});
    if(odp&&odp.ok&&Array.isArray(odp.wpisy)){try{sessionStorage.setItem('syg-public-blog-cache-v1',JSON.stringify(odp.wpisy));}catch(e){}}
    if (!odp || !odp.ok){
      kontener.innerHTML = '<p class="mala" role="alert" style="padding:14px 0">Nie udało się pobrać realizacji. Odśwież stronę za chwilę.</p>';
      return;
    }
    const wpisy=odp.wpisy||[];
    let order=[];try{const cfg=await SYG.wezwij('strona-glowna-pobierz',{});if(cfg&&cfg.ok&&cfg.dane&&Array.isArray(cfg.dane.blogKolejnosc))order=cfg.dane.blogKolejnosc.map(String);}catch(e){}
    const widoczne=wpisy.filter(function(w){return w.widoczny!==false;});
    widoczne.sort(function(a,b){const ai=order.indexOf(String(a.id)),bi=order.indexOf(String(b.id));if(ai>=0&&bi>=0)return ai-bi;if(ai<0&&bi>=0)return -1;if(ai>=0&&bi<0)return 1;return sortDodano(b)-sortDodano(a);});
    kontener.innerHTML = '';
    if (!widoczne.length) {
      kontener.innerHTML = '<p class="mala" style="padding:14px 0">Nie ma jeszcze wpisów. Pierwsza realizacja pojawi się tu wkrótce.</p>';
      return;
    }
    const kategorie = [];
    widoczne.forEach(function (w) { if (w.kategoria && kategorie.indexOf(w.kategoria) < 0) kategorie.push(w.kategoria); });
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
      siatka.innerHTML = widoczne.filter(function (w) { return !kat || w.kategoria === kat; }).map(function (w) {
        const data=dzien(w.data);
        return '<a class="blog-kafel" href="blog-wpis.html?id=' + encodeURIComponent(w.id) + '">' +
          '<figure class="blog-kafel-foto"><img src="' + esc(okladkaRealizacji(w)) + '" alt="' + esc(w.tytul) + '" loading="lazy">' +
          (w.zajawka ? '<figcaption class="blog-zajawka">' + esc(w.zajawka) + '</figcaption>' : '') + '</figure>' +
          (!SYG.LAUNCH && w.produkt && w.produkt.sklep ? '<span class="blog-badge">dostępny w sklepie</span>' : '') +
          '<span class="blog-kafel-tresc">' +
          '<span class="nazwa">' + esc(w.tytul) + '</span>' +
          (data ? '<span class="blog-data">' + esc(data) + '</span>' : '') +
          (w.kategoria ? '<span class="kat">' + esc(w.kategoria) + '</span>' : '') +
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
  function cachedBlogEntry(id){
    try{var rows=JSON.parse(sessionStorage.getItem('syg-public-blog-cache-v1')||'[]');return Array.isArray(rows)?rows.find(function(w){return w&&String(w.id)===String(id)&&w.widoczny!==false;}):null;}catch(e){return null;}
  }
  function renderCachedBlogEntry(kontener,w){
    const cover=okladkaRealizacji(w);
    kontener.innerHTML='<a class="powrot wpis-powrot" href="realizacje.html">← wszystkie realizacje</a><article class="wpis-artykul"><header class="wpis-naglowek">'+(w.kategoria?'<span class="tag">'+esc(w.kategoria)+'</span>':'')+'<h1>'+esc(w.tytul)+'</h1><p class="sub">'+dzien(w.data)+'</p></header><div class="wpis-uklad"><div class="blog-tresc">'+(w.tresc||'')+'</div><div class="wpis-galeria"><div class="wpis-media-glowny" data-current="0">'+(cover?'<figure class="wpis-okladka"><img src="'+esc(cover)+'" alt="'+esc(w.tytul)+'" loading="eager" fetchpriority="high" decoding="async"></figure>':'')+'</div></div></div></article>';
  }
  async function wpis(kontener) {
    const id = SYG.param('id');
    const cached=cachedBlogEntry(id);
    if(cached)renderCachedBlogEntry(kontener,cached);
    let odp;
    try{odp=await SYG.wezwij('blog-pobierz', { id: id });}catch(error){
      if(!cached)kontener.innerHTML='<div class="sukces"><h2>Nie udało się wczytać realizacji</h2><p>Sprawdź połączenie i spróbuj ponownie.</p></div>';
      return;
    }
    if (!odp.ok || !odp.wpis) {
      if(!cached)kontener.innerHTML = '<div class="sukces"><h2>Nie znaleziono wpisu</h2>' +
        '<p><a class="btn" href="blog.html" style="margin-top:12px">← Wróć do realizacji</a></p></div>';
      return;
    }
    try{var entryRows=JSON.parse(sessionStorage.getItem('syg-public-blog-cache-v1')||'[]');if(!Array.isArray(entryRows))entryRows=[];entryRows=entryRows.filter(function(x){return String(x&&x.id)!==String(odp.wpis.id)});entryRows.push(odp.wpis);sessionStorage.setItem('syg-public-blog-cache-v1',JSON.stringify(entryRows));}catch(e){}
    const w = odp.wpis;
    const cover = okladkaRealizacji(w);
    if (w.widoczny === false) {
      kontener.innerHTML = '<div class="sukces"><h2>Ten wpis jest obecnie niedostępny</h2>' +
        '<p><a class="btn" href="blog.html" style="margin-top:12px">← Wróć do realizacji</a></p></div>';
      return;
    }
    const canonicalUrl = 'https://studiosygnatura.pl/blog-wpis.html?id=' + encodeURIComponent(id);
    const opisTekst = String(w.zajawka || w.tresc || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 155);
    document.title = (w.tytul || 'Realizacja') + ' | Studio Sygnatura Poznań';
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = canonicalUrl;
    function setMeta(selector, attr, value, property) {
      let el = document.querySelector(selector);
      if (!el) { el = document.createElement('meta'); el.setAttribute(property ? 'property' : 'name', attr); document.head.appendChild(el); }
      el.content = value;
    }
    setMeta('meta[name="description"]', 'description', opisTekst || 'Realizacja Studio Sygnatura z Poznania — drewniane dekoracje i projekty na zamówienie.');
    setMeta('meta[property="og:title"]', 'og:title', document.title, true);
    setMeta('meta[property="og:description"]', 'og:description', opisTekst, true);
    setMeta('meta[property="og:url"]', 'og:url', canonicalUrl, true);
    if (cover) setMeta('meta[property="og:image"]', 'og:image', new URL(cover, location.href).href, true);
    const article = {"@context":"https://schema.org","@type":"Article","headline":w.tytul || 'Realizacja Studio Sygnatura',"description":opisTekst,"image":cover ? [new URL(cover, location.href).href] : undefined,"datePublished":w.data || undefined,"author":{"@type":"Organization","name":"Studio Sygnatura","url":"https://studiosygnatura.pl/"},"publisher":{"@type":"Organization","name":"Studio Sygnatura","url":"https://studiosygnatura.pl/"},"mainEntityOfPage":canonicalUrl};
    let articleLd = document.getElementById('seo-article-jsonld');
    if (!articleLd) { articleLd = document.createElement('script'); articleLd.type = 'application/ld+json'; articleLd.id = 'seo-article-jsonld'; document.head.appendChild(articleLd); }
    articleLd.textContent = JSON.stringify(article);

    const lb = lightbox();
    function mediaItem(value, isCover) {
      const item = typeof value === 'string' ? { src: value } : (value || {});
      const src = String(item.src || item.url || item.video || '');
      if (!src) return null;
      const yt = videoId(src), type = String(item.type || '').toLowerCase();
      const video = type === 'video' || type === 'film' || !!yt || /\.(mp4|webm|ogg)(?:[?#]|$)/i.test(src);
      return { src: src, thumb: String(item.thumbnail || item.miniatura || (isCover ? src : src)), video: video, youtube: yt };
    }
    const media = [mediaItem(cover, true)].concat((Array.isArray(w.galeria) ? w.galeria : []).map(function (g) { return mediaItem(g, false); }));
    if (w.video) media.push(mediaItem({ src: w.video, type: 'video' }, false));
    const wszystkie = media.filter(function (m, i, a) { return m && a.findIndex(function (x) { return x && x.src === m.src; }) === i; });
    function renderMainMedia(index) {
      const m = wszystkie[index];
      if (!m) return '';
      if (m.youtube) return '<div class="wpis-okladka wpis-okladka-video"><iframe src="https://www.youtube.com/embed/' + esc(m.youtube) + '" title="Film: ' + esc(w.tytul) + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe></div>';
      if (m.video) return '<div class="wpis-okladka wpis-okladka-video"><video controls playsinline preload="metadata" poster="' + esc(m.thumb || '') + '"><source src="' + esc(m.src) + '"></video></div>';
      return '<figure class="wpis-okladka"><img src="' + esc(m.src) + '" alt="' + esc(w.tytul) + '" loading="eager" fetchpriority="high" decoding="async"></figure>';
    }
    let galeria = '<div class="wpis-galeria"><div class="wpis-media-glowny" data-current="0">' + renderMainMedia(0);
    if (wszystkie.length > 1) {
      galeria += '<div class="wpis-galeria-pasek"><button type="button" class="wpis-galeria-nav" data-dir="-1" aria-label="Przewiń zdjęcia w lewo">‹</button><div class="wpis-miniatury" aria-label="Zdjęcia i filmy realizacji">';
      wszystkie.forEach(function (m, i) {
        galeria += '<button type="button" class="wpis-mini' + (i === 0 ? ' on' : '') + '" data-i="' + i + '" aria-label="' + (m.video ? 'Odtwórz film ' : 'Pokaż zdjęcie ') + (i + 1) + '">' +
          (m.video ? '<span class="wpis-mini-video">▶</span>' : '<img src="' + esc(m.thumb) + '" alt="">') + '</button>';
      });
      galeria += '</div><button type="button" class="wpis-galeria-nav" data-dir="1" aria-label="Przewiń zdjęcia w prawo">›</button></div>';
    }
    galeria += '</div></div>';

    /* blok produktu — w trybie startu każda realizacja ma przycisk e-mail / kontakt */
    let produktBlok = '';
    if (SYG.LAUNCH) {
      const telC = String(SYG.TEL || '').replace(/\D/g, '');
      produktBlok = '<div class="wpis-produkt">' +
        '<div><h2>Podoba Ci się ten projekt?</h2>' +
        '<p class="mala" style="margin:6px 0 14px">Wykonamy taki sam — albo z Twoim napisem, imionami i datą. Napisz lub zadzwoń:</p>' +
        '<div class="przyciski" style="flex-wrap:wrap">' +
        '<a class="btn" href="kontakt.html?projekt=' + encodeURIComponent(w.tytul || '') + '">Napisz / Zamówienie</a>' +
        '<a class="btn outline" href="tel:+' + (telC.length === 9 ? '48' + telC : telC) + '">☎ ' + esc(SYG.TEL) + '</a>' +
        '</div></div></div>';
    } else if (w.produkt && w.produkt.sklep) {
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
      '<a class="powrot wpis-powrot" href="realizacje.html">← wszystkie realizacje</a>' +
      '<article class="wpis-artykul"><header class="wpis-naglowek">' +
      (w.kategoria ? '<span class="tag">' + esc(w.kategoria) + '</span>' : '') +
      '<h1>' + esc(w.tytul) + '</h1>' +
      '<p class="sub">' + dzien(w.data) + '</p></header>' +
      '<div class="wpis-uklad"><div class="blog-tresc">' + (w.tresc || '') + '</div>' + galeria + '</div>' +
      produktBlok + '</article>';

    const mainMedia = kontener.querySelector('.wpis-media-glowny');
    kontener.querySelectorAll('.wpis-mini').forEach(function (button) {
      button.addEventListener('click', function () {
        const index = Number(button.getAttribute('data-i'));
        mainMedia.innerHTML = renderMainMedia(index);
        mainMedia.dataset.current = String(index);
        kontener.querySelectorAll('.wpis-mini').forEach(function (thumb) { thumb.classList.toggle('on', thumb === button); });
      });
    });
    kontener.querySelectorAll('.wpis-galeria-nav').forEach(function (button) {
      button.addEventListener('click', function () {
        const strip = kontener.querySelector('.wpis-miniatury');
        if (strip) strip.scrollBy({ left: Number(button.dataset.dir) * Math.max(220, strip.clientWidth * 0.8), behavior: 'smooth' });
      });
    });
    mainMedia.addEventListener('click', function (event) {
      if (!event.target.matches('.wpis-okladka img')) return;
      const selected = Number(mainMedia.dataset.current || 0), imageIndexes = [];
      wszystkie.forEach(function (m, i) { if (!m.video) imageIndexes.push(i); });
      const lightboxIndex = imageIndexes.indexOf(selected);
      if (lightboxIndex >= 0) lb.otworz(imageIndexes.map(function (i) { return wszystkie[i].src; }), lightboxIndex);
    });

    /* dodaj do koszyka */
    const gK = kontener.querySelector('button[data-koszyk]');
    if (gK) {
      gK.addEventListener('click', function () {
        const id = Number(gK.getAttribute('data-koszyk'));
        const pr = w.produkt || {};
        KOSZYK.dodajProdukt(id, 1, { nazwa: pr.nazwa || w.tytul, cena: pr.cena });
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
