/* Studio Sygnatura — terminarz wynajmu (demo, dane lokalne)
   ------------------------------------------------------------------
   ZAJETE TERMINY: edytujesz wylacznie obiekt ZAJETE ponizej.
   Klucz = id pakietu, wartosc = lista dat 'RRRR-MM-DD'.
   Po edycji uruchom build.py — kalendarze zaktualizuja sie same.

   UWAGA: to wersja bez serwera. Rezerwacja wysyla zapytanie,
   a termin blokujemy recznie po potwierdzeniu. Docelowo (etap 2)
   te dane pobiera sie z arkusza Google albo z Kalendarza Google.
   ------------------------------------------------------------------ */

var ZAJETE = {
  "klasyczny":  ["2026-08-29","2026-08-30","2026-09-05","2026-09-12","2026-09-19","2026-10-03","2026-10-10","2026-10-17","2026-11-07"],
  "lesny":      ["2026-08-28","2026-08-29","2026-09-05","2026-09-06","2026-09-26","2026-10-10","2026-10-24","2026-11-14"],
  "rustykalny": ["2026-08-29","2026-09-12","2026-09-13","2026-09-19","2026-10-03","2026-10-31"],
  "komunijny":  ["2026-08-30","2026-09-20","2026-10-11","2026-11-21"],
  "firmowy":    ["2026-08-28","2026-09-17","2026-09-18","2026-10-08","2026-10-22","2026-11-05","2026-11-26"],
  "wlasny":     ["2026-08-29","2026-09-05","2026-09-12","2026-10-10"]
};

var MIES = ["styczeń","luty","marzec","kwiecień","maj","czerwiec","lipiec",
            "sierpień","wrzesień","październik","listopad","grudzień"];
var DNI  = ["pn","wt","śr","cz","pt","so","nd"];

function iso(y, m, d){
  return y + "-" + String(m+1).padStart(2,"0") + "-" + String(d).padStart(2,"0");
}

function Kalendarz(box){
  var id     = box.dataset.pkg;
  var busy   = ZAJETE[id] || [];
  var dzis   = new Date(); dzis.setHours(0,0,0,0);
  var rok    = dzis.getFullYear(), mies = dzis.getMonth();
  var wybor  = null;

  function rysuj(){
    var pierwszy = new Date(rok, mies, 1);
    var przesun  = (pierwszy.getDay() + 6) % 7;          // pn = 0
    var ile      = new Date(rok, mies+1, 0).getDate();
    var wstecz   = (rok < dzis.getFullYear()) ||
                   (rok === dzis.getFullYear() && mies <= dzis.getMonth());

    var h = '<div class="calhead"><b>' + MIES[mies] + " " + rok + '</b>'
          + '<span class="calnav">'
          + '<button type="button" data-go="-1"' + (wstecz ? " disabled" : "") + '>&#8249;</button>'
          + '<button type="button" data-go="1">&#8250;</button></span></div>'
          + '<div class="calgrid">';
    DNI.forEach(function(d){ h += "<i>" + d + "</i>"; });
    for (var i = 0; i < przesun; i++) h += "<span></span>";

    for (var d = 1; d <= ile; d++){
      var data = iso(rok, mies, d);
      var dt   = new Date(rok, mies, d);
      var kl   = "";
      if (dt < dzis)                    kl = "past";
      else if (busy.indexOf(data) > -1) kl = "busy";
      if (data === wybor)               kl = "sel";
      var blok = (kl === "past" || kl === "busy") ? " disabled" : "";
      var opis = kl === "busy" ? " title=\"Termin zajęty\"" : "";
      h += '<button type="button" class="' + kl + '" data-d="' + data + '"' + blok + opis + ">" + d + "</button>";
    }
    h += "</div>"
      +  '<div class="callegend"><em><i></i> wolny</em><em><i class="b"></i> zajęty</em></div>'
      +  '<div class="calpick">' + (wybor ? tekstWyboru(wybor) : "Wybierz datę, żeby sprawdzić dostępność.") + "</div>";
    box.innerHTML = h;

    box.querySelectorAll("[data-go]").forEach(function(b){
      b.onclick = function(){
        mies += parseInt(b.dataset.go, 10);
        if (mies > 11){ mies = 0;  rok++; }
        if (mies < 0) { mies = 11; rok--; }
        rysuj();
      };
    });
    box.querySelectorAll("[data-d]").forEach(function(b){
      b.onclick = function(){ wybor = b.dataset.d; rysuj(); zapiszWybor(id, wybor); };
    });
  }

  function tekstWyboru(d){
    var cz = d.split("-");
    return "Wybrany termin: <b>" + parseInt(cz[2],10) + " " + MIES[parseInt(cz[1],10)-1] + " " + cz[0] + "</b> — wolny.";
  }
  rysuj();
}

/* wybrana data + pakiet trafiaja do formularza rezerwacji */
function zapiszWybor(pkg, data){
  var fd = document.getElementById("rez-data");
  var fp = document.getElementById("rez-pakiet");
  if (fd) fd.value = data;
  if (fp) fp.value = pkg;
  var info = document.getElementById("rez-info");
  if (info){
    var cz = data.split("-");
    info.innerHTML = "Termin <b>" + parseInt(cz[2],10) + " " + MIES[parseInt(cz[1],10)-1] + " " + cz[0]
                   + "</b> — pakiet <b>" + pkg + "</b>. Wyślij zgłoszenie, żeby go zablokować.";
  }
  var f = document.getElementById("rezerwacja");
  if (f) f.scrollIntoView({behavior:"smooth", block:"center"});
}

/* obsluga formularza — wersja bez serwera */
function wyslijRezerwacje(e){
  e.preventDefault();
  var ok = document.getElementById("rez-ok");
  if (ok) ok.style.display = "block";
  return false;
}

document.addEventListener("DOMContentLoaded", function(){
  document.querySelectorAll("[data-pkg]").forEach(Kalendarz);
  var f = document.getElementById("rez-form");
  if (f) f.addEventListener("submit", wyslijRezerwacje);
});
