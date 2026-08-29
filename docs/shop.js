/* Studio Sygnatura — koszyk + sygnatury. Baza: POST /api/* (serwer.py / SQLite). Fallback: localStorage. */
(function () {
  var KEY_CART = "ss-cart";
  var KEY_INQ = "ss-inquiries";
  var KEY_ORD = "ss-orders";
  var KEY_MAIL = "ss-email";

  var CATALOG = {
    "metryczka-pelna": { name: "Metryczka podświetlana", price: 349, img: "assets/foto-metryczka.jpg" },
    "metryczka-nled": { name: "Metryczka bez podświetlenia", price: 249, img: "assets/foto-metryczka.jpg" },
    "metryczka-nzdj": { name: "Metryczka bez zdjęcia", price: 229, img: "assets/foto-metryczka.jpg" },
    "metryczka-zestaw": { name: "Zestaw metryczka + numer", price: 429, img: "assets/foto-metryczka.jpg" },
    "odbitka": { name: "Druga odbitka", price: 15, img: "assets/foto-metryczka.jpg" },
    "blizniacza": { name: "Dopłata metryczka bliźniacza", price: 120, img: "assets/foto-metryczka.jpg" },
    "numer-119": { name: "Numer na drzwi", price: 119, img: "assets/foto-numer.jpg" },
    "numer-149": { name: "Numer warstwowy (wariant)", price: 149, img: "assets/foto-numer.jpg" },
    "numer-129": { name: "Numer (wariant)", price: 129, img: "assets/foto-numer.jpg" },
    "szyld-179": { name: "Szyld rzeźbiony (od)", price: 179, img: "assets/foto-szyld.jpg" },
    "szyld-229": { name: "Szyld (od)", price: 229, img: "assets/foto-szyld.jpg" },
    "szyld-349": { name: "Szyld większy (od)", price: 349, img: "assets/foto-szyld.jpg" },
    "pamiatka-89": { name: "Pamiątka z okazji (od)", price: 89, img: "assets/foto-szyld.jpg" }
  };

  function load(k, d) {
    try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(d)); } catch (e) { return d; }
  }
  function save(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
  function api(path, body) {
    var opt = body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {};
    return fetch(path, opt).then(function (r) {
      if (!r.ok) throw new Error("api");
      return r.json();
    });
  }

  function todayStr() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }

  function nextSyg() {
    var day = todayStr();
    var key = "ss-syg-seq-" + day;
    var n = parseInt(localStorage.getItem(key) || "0", 10) + 1;
    if (n > 9999) n = 9999;
    localStorage.setItem(key, String(n));
    return day + "-" + String(n).padStart(4, "0");
  }

  function cart() { return load(KEY_CART, []); }
  function setCart(c) { save(KEY_CART, c); paintCount(); }
  function count() { return cart().reduce(function (s, i) { return s + (i.qty || 1); }, 0); }

  function toast(msg) {
    var t = document.createElement("div");
    t.className = "ss-toast";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2800);
  }

  function addSku(sku, qty) {
    var p = CATALOG[sku];
    if (!p) return;
    var c = cart();
    var f = c.find(function (x) { return x.sku === sku && !x.syg; });
    if (f) f.qty += qty || 1;
    else c.push({ sku: sku, name: p.name, price: p.price, img: p.img, qty: qty || 1, syg: "" });
    setCart(c);
    toast("W koszyku: " + p.name);
  }

  function addSygLine(syg, label) {
    var c = cart();
    c.push({ sku: "syg", name: "Projekt " + syg, price: 0, img: "assets/foto-warsztat.jpg", qty: 1, syg: syg, note: label || "" });
    setCart(c);
    toast("Sygnatura " + syg + " w koszyku");
  }

  function paintCount() {
    var el = document.getElementById("ss-cart-n");
    if (el) el.textContent = String(count());
  }

  function fillPhotos() {
    function pick(label) {
      var u = (label || "").toUpperCase();
      if (u.indexOf("KRZY") >= 0 || u.indexOf("KAFEL") >= 0) return "assets/foto-krzyzowka.jpg";
      if (u.indexOf("MIS") >= 0) return "assets/foto-misie.jpg";
      if (u.indexOf("SERWET") >= 0 || u.indexOf("GÓR") >= 0 || u.indexOf("GOR") >= 0) return "assets/foto-serwetnik.jpg";
      if (u.indexOf("OBR") >= 0 || u.indexOf("MAKRAM") >= 0 || u.indexOf("RODZINK") >= 0) return "assets/foto-makrama.jpg";
      if (u.indexOf("METRY") >= 0 || u.indexOf("ODBIT") >= 0 || u.indexOf("BLIŹ") >= 0) return "assets/foto-metryczka.jpg";
      if (u.indexOf("NUMER") >= 0 || u.indexOf("DRZWI") >= 0) return "assets/foto-numer.jpg";
      if (u.indexOf("SZYLD") >= 0 || u.indexOf("EMBLEM") >= 0 || u.indexOf("CZEŚ") >= 0) return "assets/foto-szyld.jpg";
      if (u.indexOf("SZOP") >= 0) return "assets/foto-szopka.jpg";
      if (u.indexOf("DO DOMU") >= 0 || u.indexOf("WYSTR") >= 0 || u.indexOf("PAKIET") >= 0) return "assets/foto-krzyzowka.jpg";
      return "assets/foto-warsztat.jpg";
    }
    document.querySelectorAll(".ph[data-ph], .main[data-ph]").forEach(function (el) {
      var src = pick(el.getAttribute("data-ph"));
      el.classList.add("hasimg");
      el.style.backgroundImage = "url('" + src + "')";
    });
    document.querySelectorAll(".thumbs div").forEach(function (el, i) {
      var imgs = ["assets/foto-krzyzowka.jpg", "assets/foto-serwetnik.jpg", "assets/foto-misie.jpg", "assets/foto-makrama.jpg"];
      el.style.background = "url('" + imgs[i % imgs.length] + "') center/cover";
      el.style.minHeight = "56px";
    });
  }

  function injectNav() {
    var cta = document.querySelector(".navcta");
    if (!cta || document.getElementById("ss-cart-link")) return;
    var wrap = document.createElement("div");
    wrap.className = "navcta-row";
    cta.parentNode.insertBefore(wrap, cta);
    wrap.appendChild(cta);
    var a = document.createElement("a");
    a.href = "koszyk.html";
    a.className = "cartlink";
    a.id = "ss-cart-link";
    a.innerHTML = 'Koszyk <span class="cartcount" id="ss-cart-n">0</span>';
    wrap.appendChild(a);
    var k = document.createElement("a");
    k.href = "konto.html";
    k.className = "cartlink";
    k.textContent = "Konto";
    wrap.appendChild(k);
    paintCount();
  }

  function bindAdds() {
    document.querySelectorAll("[data-sku]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var sku = btn.getAttribute("data-sku");
        var mode = btn.getAttribute("data-mode") || "cart";
        if (mode === "ask") {
          var label = btn.getAttribute("data-label") || (CATALOG[sku] && CATALOG[sku].name) || sku;
          var payload = { sku: sku, email: localStorage.getItem(KEY_MAIL) || "", txt: label, topic: label };
          function done(syg, via) {
            var inq = load(KEY_INQ, []);
            inq.unshift({ syg: syg, sku: sku, when: new Date().toISOString(), email: payload.email, txt: label });
            save(KEY_INQ, inq);
            addSygLine(syg, label);
            alert("Sygnatura projektu: " + syg + "\n\n" + via);
          }
          api("/api/inquiry", payload).then(function (d) {
            done(d.syg, "Zapisane w bazie SQLite (serwer.py).");
          }).catch(function () {
            done(nextSyg(), "Serwer bazy nie odpowiada — zapis lokalny.");
          });
        } else {
          addSku(sku, 1);
        }
      });
    });
  }

  function bindKontakt() {
    var form = document.querySelector("form.form");
    if (!form || !document.getElementById("n")) return;
    if (document.getElementById("syg-field")) return;
    var full = document.createElement("div");
    full.className = "full";
    full.innerHTML = '<label for="syg-field">Sygnatura projektu (jeśli już masz)</label><input id="syg-field" type="text" placeholder="np. 2026-08-28-0001 — albo zostaw puste, nadamy nową">';
    var btnWrap = form.querySelector(".full:last-of-type");
    form.insertBefore(full, btnWrap);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = (document.getElementById("e").value || "").trim();
      var name = (document.getElementById("n").value || "").trim();
      var topic = document.getElementById("t").value;
      var txt = document.getElementById("w").value;
      if (!email || !name) { alert("Imię i e-mail są potrzebne."); return; }
      localStorage.setItem(KEY_MAIL, email);
      var syg = (document.getElementById("syg-field").value || "").trim();
      if (!syg) syg = nextSyg();
      var inq = load(KEY_INQ, []);
      inq.unshift({ syg: syg, sku: "zapytanie", when: new Date().toISOString(), email: email, name: name, topic: topic, txt: txt });
      save(KEY_INQ, inq);
      var box = document.createElement("div");
      box.style.cssText = "border:1px solid var(--accent);background:var(--accent-soft);padding:22px 26px;margin-top:22px";
      box.innerHTML = "<b class='syg-box'>Sygnatura: " + syg + "</b><p>Zapytanie zapisane na tym urządzeniu (podgląd). Na produkcji pójdzie na kontakt@studiosygnatura.pl. Dodaj sygnaturę do koszyka, jeśli składasz też gotowe produkty.</p>";
      form.parentNode.insertBefore(box, form.nextSibling);
      form.style.display = "none";
    });
  }

  function pageKoszyk() {
    var root = document.getElementById("ss-cart-root");
    if (!root) return;
    function render() {
      var c = cart();
      if (!c.length) {
        root.innerHTML = '<p class="cart-empty">Koszyk jest pusty. Dodaj metryczkę albo inną rzecz z ceną — albo wyślij zapytanie i wrzuć sygnaturę.</p><a class="btn btn1" href="metryczki.html">Metryczki</a>';
        return;
      }
      var sum = 0;
      var rows = c.map(function (i, idx) {
        var line = (i.price || 0) * (i.qty || 1);
        sum += line;
        return "<tr><td><img src='" + (i.img || "assets/foto-metryczka.jpg") + "' alt=''></td><td>" + i.name + (i.syg ? "<br><small>Sygnatura " + i.syg + "</small>" : "") + "</td><td><input class='cart-qty' type='number' min='1' value='" + i.qty + "' data-i='" + idx + "'></td><td>" + (i.price ? i.price + " zł" : "wycena") + "</td><td>" + (line ? line + " zł" : "—") + "</td><td><button type='button' class='btn btn2 ss-del' data-i='" + idx + "'>Usuń</button></td></tr>";
      }).join("");
      var inqs = load(KEY_INQ, []);
      var opts = '<option value="">— bez sygnatury / nowa przy zamówieniu —</option>' + inqs.map(function (q) {
        return '<option value="' + q.syg + '">' + q.syg + " · " + (q.topic || q.txt || "").slice(0, 40) + "</option>";
      }).join("");
      root.innerHTML = "<table class='cart-table'><thead><tr><th></th><th>Produkt</th><th>Ilość</th><th>Cena</th><th>Suma</th><th></th></tr></thead><tbody>" + rows + "</tbody></table>" +
        "<p style='margin-top:18px'>Razem (pozycje z ceną): <b>" + sum + " zł</b>. Personalizacje — wycena po sygnaturze.</p>" +
        "<form class='form' id='ss-order' onsubmit='return false' style='margin-top:28px'>" +
        "<div><label>Imię</label><input id='o-name' required></div>" +
        "<div><label>E-mail</label><input id='o-mail' type='email' required></div>" +
        "<div class='full'><label>Sygnatura projektu</label><select id='o-syg'>" + opts + "</select></div>" +
        "<div class='full'><label>Uwagi / kompozycja</label><textarea id='o-uw' placeholder='Co ma trafić do jednego zamówienia'></textarea></div>" +
        "<div class='full'><label style='display:flex;gap:10px;align-items:flex-start;font-weight:400'><input id='o-reg' type='checkbox' required style='margin-top:4px'> Zapoznałem/am się z <a href='regulamin.html'>regulaminem</a>. Wiem, że rzecz personalizowana (imiona, daty, projekt) nie podlega odstąpieniu w 14 dni; reklamacja wad zostaje.</label></div>" +
        "<div class='full'><button class='btn btn1' type='submit'>Zamów</button></div></form>" +
        "<p class='legal'>Demo: zamówienie zostaje w przeglądarce. Pages nie ma bazy — docelowo mail + ręczna weryfikacja sygnatury.</p>";
      root.querySelectorAll(".cart-qty").forEach(function (inp) {
        inp.onchange = function () {
          var c2 = cart();
          c2[+inp.dataset.i].qty = Math.max(1, parseInt(inp.value, 10) || 1);
          setCart(c2); render();
        };
      });
      root.querySelectorAll(".ss-del").forEach(function (b) {
        b.onclick = function () {
          var c2 = cart(); c2.splice(+b.dataset.i, 1); setCart(c2); render();
        };
      });
      document.getElementById("ss-order").onsubmit = function () {
        var email = document.getElementById("o-mail").value.trim();
        var name = document.getElementById("o-name").value.trim();
        if (!document.getElementById("o-reg").checked) {
          alert("Zaznacz akceptację regulaminu — bez tego nie składamy zamówienia.");
          return;
        }
        if (!email || !name) return;
        localStorage.setItem(KEY_MAIL, email);
        var payload = {
          syg: document.getElementById("o-syg").value,
          email: email, name: name,
          uw: document.getElementById("o-uw").value,
          sum: sum, items: cart()
        };
        function finish(syg, via) {
          var orders = load(KEY_ORD, []);
          orders.unshift({ syg: syg, when: new Date().toISOString(), email: email, name: name, items: cart(), uw: payload.uw, sum: sum });
          save(KEY_ORD, orders);
          setCart([]);
          root.innerHTML = "<div class='syg-box'>Zamówienie " + syg + "</div><p>" + via + "</p><a class='btn btn1' href='konto.html'>Konto</a> <a class='btn btn2' href='warsztat.html'>Warsztat (baza)</a>";
        }
        api("/api/order", payload).then(function (d) {
          finish(d.syg, "Zapisane w bazie SQLite.");
        }).catch(function () {
          finish(payload.syg || nextSyg(), "Baza niedostępna — zapis lokalny.");
        });
      };
    }
    function fillSygOptionsThenRender() {
      api("/api/konto?email=" + encodeURIComponent(localStorage.getItem(KEY_MAIL) || "")).then(function (d) {
        if (d.inquiries) save(KEY_INQ, d.inquiries);
        render();
      }).catch(function () { render(); });
    }
    fillSygOptionsThenRender();
  }

  function pageKonto() {
    var root = document.getElementById("ss-konto-root");
    if (!root) return;
    var mail = localStorage.getItem(KEY_MAIL) || "";
    root.innerHTML = "<form class='form' id='ss-login' onsubmit='return false'><div class='full'><label>E-mail (ten sam co w zapytaniu)</label><input id='k-mail' type='email' value='" + mail.replace(/'/g, "") + "' required></div><div class='full'><button class='btn btn1' type='submit'>Pokaż moje sygnatury</button></div></form><p class='legal'>Konto czyta bazę SQLite. Warsztat: warsztat.html</p><div id='ss-konto-list'></div>";
    function paint(inq, ord) {
      var ul = "<h2 style='margin-top:28px;font-size:26px'>Zapytania</h2><ul class='konto-list'>";
      if (!inq.length) ul += "<li>Brak zapytań.</li>";
      inq.forEach(function (q) {
        ul += "<li><b>" + q.syg + "</b>" + (q.topic || q.txt || "") + "<br><small>" + (q.created || q.when || "") + "</small><br><button type='button' class='btn btn2 ss-add-syg' data-syg='" + q.syg + "'>Do koszyka</button></li>";
      });
      ul += "</ul><h2 style='margin-top:28px;font-size:26px'>Zamówienia</h2><ul class='konto-list'>";
      if (!ord.length) ul += "<li>Brak zamówień.</li>";
      ord.forEach(function (o) {
        var n = (o.items && o.items.length) || 0;
        ul += "<li><b>" + o.syg + "</b>" + (o.sum || 0) + " zł · " + n + " pozycji</li>";
      });
      ul += "</ul>";
      document.getElementById("ss-konto-list").innerHTML = ul;
      document.querySelectorAll(".ss-add-syg").forEach(function (b) {
        b.onclick = function () { addSygLine(b.getAttribute("data-syg")); };
      });
    }
    function show(email) {
      localStorage.setItem(KEY_MAIL, email);
      api("/api/konto?email=" + encodeURIComponent(email)).then(function (d) {
        paint(d.inquiries || [], d.orders || []);
      }).catch(function () {
        var inq = load(KEY_INQ, []).filter(function (x) { return !email || (x.email || "") === email || !(x.email); });
        var ord = load(KEY_ORD, []).filter(function (x) { return !email || x.email === email; });
        paint(inq, ord);
      });
    }
    document.getElementById("ss-login").onsubmit = function () {
      show(document.getElementById("k-mail").value.trim());
    };
    if (mail) show(mail);
  }

  document.addEventListener("DOMContentLoaded", function () {
    injectNav();
    fillPhotos();
    bindAdds();
    bindKontakt();
    pageKoszyk();
    pageKonto();
  });
})();
