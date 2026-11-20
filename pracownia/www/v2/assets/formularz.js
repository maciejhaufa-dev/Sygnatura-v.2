/* ============================================================
   Studio Sygnatura v2 — formularz zapytania (kontakt.html i produkt.html)
   Wysyła przez prawdziwe API Apps Script (akcja „wiadomosc”), tej samej,
   której używa obecny serwis. Bez kluczy w kodzie strony.
   Zabezpieczenia: zgoda, pułapka na boty, limit czasu, czytelny błąd
   i awaryjny link mailto — nigdy ciche „udało się”.
   ============================================================ */
(function () {
  'use strict';
  const D = window.SYG_DANE || {};
  const F = D.firma || {};
  const API = (D.api || {}).url || '';
  const AKCJA = (D.api || {}).akcjaWiadomosc || 'wiadomosc';
  const Q = new URLSearchParams(location.search);

  const oczekiwanyCzas = 20000;

  function ustawBlad(pole, tekst) {
    const g = pole.closest('.pole');
    if (!g) return;
    g.classList.toggle('nie-ok', !!tekst);
    const b = g.querySelector('.blad');
    if (b) b.textContent = tekst || '';
    if (tekst) pole.setAttribute('aria-invalid', 'true'); else pole.removeAttribute('aria-invalid');
  }

  function pokazKomunikat(box, typ, html) {
    box.className = 'form-msg ' + typ;
    box.innerHTML = html;
  }

  function podepnij(form) {
    if (!form) return;
    const box = document.getElementById(form.getAttribute('data-komunikaty') || 'komunikaty');
    const btn = form.querySelector('[type="submit"]');

    // temat i wstępna treść z adresu: ?temat=projekt&projekt=Nazwa
    const temat = Q.get('temat');
    const produkt = Q.get('projekt');
    if (temat) {
      const sel = form.querySelector('[name="temat"]');
      if (sel && [...sel.options].some(o => o.value === temat)) sel.value = temat;
    }
    const opis = form.querySelector('[name="tresc"]');
    if (opis && produkt && !opis.value) {
      opis.value = `Dzień dobry,\n\ninteresuje mnie „${produkt}”. Proszę o wycenę i termin realizacji.\n\n`;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const dane = {
        temat: (form.querySelector('[name="temat"]') || {}).value || 'inne',
        tresc: (form.querySelector('[name="tresc"]') || {}).value || '',
        imie: (form.querySelector('[name="imie"]') || {}).value || '',
        email: (form.querySelector('[name="email"]') || {}).value || '',
        telefon: (form.querySelector('[name="telefon"]') || {}).value || '',
        zgoda: !!(form.querySelector('[name="zgoda"]') || {}).checked,
        bot: (form.querySelector('[name="strona_www"]') || {}).value || '',
        produkt: produkt || ''
      };
      dane.tresc = dane.tresc.trim();
      dane.imie = dane.imie.trim();
      dane.email = dane.email.trim();

      let bledy = 0;
      const imieOk = dane.imie.length >= 2;
      ustawBlad(form.querySelector('[name="imie"]'), imieOk ? '' : 'Podaj imię i nazwisko.');
      if (!imieOk) bledy++;
      const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(dane.email);
      ustawBlad(form.querySelector('[name="email"]'), emailOk ? '' : 'Podaj poprawny adres e-mail.');
      if (!emailOk) bledy++;
      const trescOk = dane.tresc.length >= 10;
      ustawBlad(form.querySelector('[name="tresc"]'), trescOk ? '' : 'Napisz kilka słów o projekcie (min. 10 znaków).');
      if (!trescOk) bledy++;
      const zg = form.querySelector('[name="zgoda"]');
      if (!dane.zgoda) bledy++;

      if (dane.bot) return; // bot: udajemy, że nic się nie stało
      if (bledy) {
        pokazKomunikat(box, 'err', `Uzupełnij zaznaczone pola${dane.zgoda ? '' : ' i zaznacz zgodę na kontakt'} — wtedy wyślemy zapytanie.`);
        const pierwsze = form.querySelector('.pole.nie-ok input, .pole.nie-ok textarea');
        if (pierwsze) pierwsze.focus(); else if (!dane.zgoda && zg) zg.focus();
        return;
      }
      if (!dane.zgoda) {
        pokazKomunikat(box, 'err', 'Potrzebujemy zgody na kontakt w sprawie tego zapytania.');
        if (zg) zg.focus();
        return;
      }
      btn.disabled = true;
      const etykieta = btn.textContent;
      btn.textContent = 'Wysyłanie…';
      pokazKomunikat(box, '', '');

      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), oczekiwanyCzas);
      const mailto = `mailto:${F.mail}?subject=${encodeURIComponent('Zapytanie: ' + dane.temat)}`
        + `&body=${encodeURIComponent(dane.tresc + '\n\n' + dane.imie + '\n' + dane.email + (dane.telefon ? '\n' + dane.telefon : ''))}`;

      const panelTestowy = !!(window.SYG_PANEL && window.SYG_PANEL.ustawienia && window.SYG_PANEL.ustawienia.tryb_testowy_formularza);
      const trybPodgladu = !API || !!(D.api && D.api.trybPodgladu);

      try {
        if (trybPodgladu) {
          clearTimeout(timer);
          form.hidden = true;
          pokazKomunikat(box, 'ok',
            `<b>Podgląd statyczny — formularz nie wysyła zgłoszeń do pracowni.</b><br>`
            + `Walidacja pól działa poprawnie. W tym podglądzie połączenie z produkcyjnym systemem pracowni jest wyłączone.<br>`
            + `Prawdziwy kontakt: <a href="${escapeHtml(mailto)}">${escapeHtml(F.mail)}</a> lub <a href="${escapeHtml(F.telHref)}">${escapeHtml(F.tel)}</a>.`);
          box.setAttribute('role', 'status');
          try { if (box.scrollIntoView) box.scrollIntoView({ block: 'center' }); } catch (_) {}
          return;
        }

        if (panelTestowy) {
          const odp = await fetch('/api/wiadomosc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dane),
            signal: ctrl.signal
          });
          clearTimeout(timer);
          const json = await odp.json().catch(() => null);
          if (json && json.ok) {
            form.hidden = true;
            pokazKomunikat(box, 'ok',
              `<b>Zapisano w skrzynce testowej panelu (${escapeHtml(json.sygnatura || 'TEST')}).</b><br>Wiadomość jest widoczna w panelu pracowni w zakładce „Wiadomości”.`);
            box.setAttribute('role', 'status');
            try { if (box.scrollIntoView) box.scrollIntoView({ block: 'center' }); } catch (_) {}
            return;
          }
          throw new Error((json && json.blad) || 'Serwer testowy nie przyjął wiadomości.');
        }

        const odp = await fetch(API + '?akcja=' + encodeURIComponent(AKZJA_SAFE()), {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(dane),
          signal: ctrl.signal
        });
        clearTimeout(timer);
        const tekst = await odp.text();
        let json = null;
        try { json = JSON.parse(tekst); } catch (err) { /* nie-JSON = błąd serwera */ }
        if (json && json.ok) {
          form.hidden = true;
          pokazKomunikat(box, 'ok',
            `<b>Dziękujemy — zapytanie poszło.</b><br>Odpowiemy na adres <b>${escapeHtml(dane.email)}</b> w ciągu 1–2 dni roboczych.`
            + (dane.telefon ? ' Jeśli sprawa jest pilna, zadzwoń: <a href="' + escapeHtml(F.telHref) + '">' + escapeHtml(F.tel) + '</a>.' : ''));
          box.setAttribute('role', 'status');
          try { if (box.scrollIntoView) box.scrollIntoView({ block: 'center' }); } catch (_) {}
        } else {
          throw new Error((json && json.blad) || 'Serwer nie potwierdził wysyłki.');
        }
      } catch (err) {
        clearTimeout(timer);
        const powod = err && err.name === 'AbortError'
          ? 'Serwer nie odpowiedział w ciągu 20 sekund.'
          : 'Nie udało się połączyć z formularzem.';
        pokazKomunikat(box, 'err',
          `<b>${powod}</b> Nic nie zostało wysłane. Spróbuj ponownie albo napisz bezpośrednio: `
          + `<a href="${escapeHtml(mailto)}">${escapeHtml(F.mail)}</a> lub zadzwoń `
          + `<a href="${escapeHtml(F.telHref)}">${escapeHtml(F.tel)}</a>.`
          + ` <button type="button" class="btn ghost mt-12" data-wyslij-do-panelu>Zapisz w skrzynce testowej panelu</button>`);
        box.setAttribute('role', 'alert');
        const btnTest = box.querySelector('[data-wyslij-do-panelu]');
        if (btnTest) {
          btnTest.addEventListener('click', async () => {
            btnTest.disabled = true;
            btnTest.textContent = 'Zapisuję w panelu…';
            try {
              const r = await fetch('/api/wiadomosc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dane)
              });
              const j = await r.json().catch(() => null);
              if (r.ok && j && j.ok) {
                form.hidden = true;
                pokazKomunikat(box, 'ok',
                  `<b>Zapisano w skrzynce testowej panelu (${escapeHtml(j.sygnatura || 'TEST')}).</b><br>Otwórz panel admina → zakładka „Wiadomości”, żeby zobaczyć treść i zmienić status.`);
              } else {
                btnTest.disabled = false;
                btnTest.textContent = 'Nie udało się — serwer panelu nie odpowiada';
              }
            } catch (_) {
              btnTest.disabled = false;
              btnTest.textContent = 'Brak połączenia z lokalnym panelem';
            }
          });
        }
      } finally {
        btn.disabled = false;
        btn.textContent = etykieta;
      }
    });
  }

  function AKZJA_SAFE() { return AKCJA; }
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function start() {
    document.querySelectorAll('form[data-zapytanie]').forEach(podepnij);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
