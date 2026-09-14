/* ============================================================
   Studio Sygnatura — KAFELKI PERSONALIZACJI (pers.js)
   Klient kupuje oczami: 3 kafelki w rzędzie, zdjęcie, podpis,
   cena i checkbox. Po zaznaczeniu pojawia się pole na treść
   personalizacji (max 200 znaków, minimum 10).
   Użycie:
     SYG.personalizacje.renderuj(kontener, wybrane)
     const z = SYG.personalizacje.zbierz(kontener)
     // z.pers = [{id, nazwa, opis, cena}], z.bledy = ['…']
   ============================================================ */
(function () {
  function renderuj(kontener, wybrane) {
    wybrane = wybrane || {};
    const katalog = SYG.PERSONALIZACJE || [];
    if (!kontener) return;
    kontener.innerHTML = katalog.map(function (p, i) {
      const id = 'pers-' + i;
      const opis = wybrane[id] || '';
      return '<label class="pers-kafel' + (wybrane[id] !== undefined ? ' wybrany' : '') + '" data-id="' + id + '">' +
        '<img src="assets/media/sklep/' + (p.foto || 'pers-grawer.jpg') + '" alt="' + p.nazwa + '" loading="lazy">' +
        '<span class="pk-tresc">' +
        '<span class="pk-zaznacz"><input type="checkbox" class="pers-cb"' + (wybrane[id] !== undefined ? ' checked' : '') + '></span>' +
        '<span class="pk-nazwa">' + p.nazwa + '</span>' +
        '<span class="pk-opis">' + p.opis + '</span>' +
        '<span class="pk-cena">' + SYG.zl(p.cena) + '</span>' +
        '</span>' +
        '<span class="pers-pole"' + (wybrane[id] !== undefined ? ' style="display:block"' : '') + '>' +
        '<textarea class="pers-opis" maxlength="200" placeholder="Co ma być wygrawerowane / napisane? (min. 10 znaków, maks. 200)">' +
        opis.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</textarea>' +
        '<span class="pers-licznik">' + opis.length + '/200</span>' +
        '</span>' +
      '</label>';
    }).join('') || '<p class="mala">Brak produktów personalizowanych.</p>';

    kontener.querySelectorAll('.pers-kafel').forEach(function (kaf){
      const cb = kaf.querySelector('.pers-cb');
      const pole = kaf.querySelector('.pers-pole');
      const ta = kaf.querySelector('.pers-opis');
      const licznik = kaf.querySelector('.pers-licznik');
      cb.addEventListener('change', function () {
        kaf.classList.toggle('wybrany', cb.checked);
        pole.style.display = cb.checked ? 'block' : 'none';
        if (cb.checked) ta.focus();
      });
      ta.addEventListener('input', function () {
        licznik.textContent = ta.value.length + '/200';
      });
    });
  }

  function zbierz(kontener) {
    const pers = [];
    const bledy = [];
    if (!kontener) return { pers: pers, bledy: bledy };
    const katalog = SYG.PERSONALIZACJE || [];
    kontener.querySelectorAll('.pers-kafel').forEach(function (kaf){
      const cb = kaf.querySelector('.pers-cb');
      if (!cb.checked) return;
      const idx = Number(kaf.getAttribute('data-id').split('-')[1]);
      const p = katalog[idx];
      if (!p) return;
      const opis = kaf.querySelector('.pers-opis').value.trim();
      if (opis.length < 10) bledy.push('w produkcie „' + p.nazwa + '" wpisz minimum 10 znaków treści personalizacji');
      pers.push({ id: kaf.getAttribute('data-id'), nazwa: p.nazwa, opis: opis, cena: p.cena });
    });
    return { pers: pers, bledy: bledy };
  }

  window.SYG = window.SYG || {};
  SYG.personalizacje = { renderuj: renderuj, zbierz: zbierz };
})();
