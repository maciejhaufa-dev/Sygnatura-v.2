/* ============================================================
   STUDIO SYGNATURA — wspólne skrypty serwisu
   Ten plik ładuje się na wszystkich podstronach publicznych.
   Tu wrzucaj funkcje wspólne dla całej strony (menu, stopka itd.).
   UWAGA: skrypty z danymi konkretnej strony (np. kalkulator kwot
   z cenami pakietu) zostają w pliku HTML tej strony — bo ceny
   pochodzą z bazy i wstawia je silnik (Python).
   ============================================================ */
(function(){
  // rok w stopce (© Studio Sygnatura 2026)
  var r = document.getElementById('rok-stopki');
  if (r) r.textContent = new Date().getFullYear();

  // menu mobilne: jeśli na stronie jest przycisk #menu-toggle, otwiera/zamyka .nav
  var t = document.getElementById('menu-toggle');
  var n = document.querySelector('.nav');
  if (t && n) {
    t.addEventListener('click', function(){
      n.classList.toggle('open');
      t.setAttribute('aria-expanded', n.classList.contains('open') ? 'true' : 'false');
    });
  }
})();
