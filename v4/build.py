#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Studio Sygnatura — v4 build (wersja 2, po uwagach użytkownika 31.08.2026).

Uwagi wcielone:
- litery logotypu jako OSOBNE pliki PNG (koniec ze sprite+calc → koniec „Ssssss")
- prostokąty OSTRE (zero zaokrągleń)
- hero = napis „Cześć" z ukosa (domyślnie IMG_20260829_230633.jpg, wybór przez hero-picker.html)
- plansza: 2 kolumny tylko na dużych ekranach, 1 kolumna na telefonie
- napisy „Pasją / styl / tradycja" WIDOCZNE od razu (płaskie); animacje = spokojna harmonia
  (miękki opad liter w splashu + subtelny oddech planszy), nie ukrywanie treści
"""
import os
import math
import shutil

from PIL import Image, ImageStat, ImageEnhance, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, 'assets')
LETTERS_DIR = os.path.join(ASSETS, 'letters')
THUMBS_DIR = os.path.join(ASSETS, 'thumbs')
LOGO_DIR = os.path.abspath(os.path.join(HERE, '..', 'pracownia', 'logo', 'WEKTORY3'))
UPLOADS = os.path.abspath(os.path.join(HERE, '..', 'uploads'))

BRUN = (107, 69, 48)  # #6B4530 z księgi znaku
LIGHT_FACTOR = 0.22   # rozjaśnienie SYG (PEŁNA barwa, jeden ton — tunowalne)
LIGHT = tuple(int(c + (255 - c) * LIGHT_FACTOR) for c in BRUN)  # jaśniejszy brąz dla SYG

# Kandydaci hero (zdjęcia użytkownika z ../uploads) — kolejność = numer w pickerze
HERO_CANDIDATES = [
    'IMG_20260829_230633.jpg',   # 1 — tablica z ukosa
    'IMG_20260829_230704.jpg',   # 2 — WYBRANE PRZEZ UŻYTKOWNIKA (31.08.2026)
    'IMG_20260829_231012.jpg',   # 3
    'IMG_20260829_230548.jpg',   # 4
    'IMG_20260828_055508.jpg',   # 5
    'IMG_20260828_055521.jpg',   # 6
    'IMG_20260828_055528.jpg',   # 7
    'IMG_20260828_055536.jpg',   # 8
    'IMG_20260828_055552.jpg',   # 9
    'IMG_20260828_055601.jpg',   # 10
    'IMG_20260828_055623.jpg',   # 11
    'IMG_20260811_232511.jpg',   # 12
]
DEFAULT_HERO = HERO_CANDIDATES[1]  # historyczne (picker); obecnie hero = TŁO NA HERO.png poniżej
HERO_TLO = 'TŁO NA HERO.png'       # KOŃCOWE TŁO HERO (decyzja użytkownika, sesja 8) — kompozycja: „Cześć" po prawej u góry, pusta ściana po lewej i na dole


# ---------------------------------------------------------------- przygotowanie
def ensure_assets():
    os.makedirs(LETTERS_DIR, exist_ok=True)
    os.makedirs(THUMBS_DIR, exist_ok=True)
    for name in ('SYGNET_okrag.svg',):
        src = os.path.join(LOGO_DIR, name)
        if not os.path.exists(src):
            raise SystemExit(f'Brak pliku logo: {src}')
        shutil.copy(src, os.path.join(ASSETS, 'sygnet.svg'))
        shutil.copy(src, os.path.join(ASSETS, 'favicon.svg'))
    # Tło splasha: jeśli w uploads pojawi się las od użytkownika — użyj go zamiast zamiennika
    user_forest = os.path.join(UPLOADS, 'Green and White Atmospheric Forest Presentation_20260831_103357_0000.png')
    if os.path.exists(user_forest):
        print('> tło splasha: znaleziono plik lasu od użytkownika — konwertuję do forest.jpg')
        im = Image.open(user_forest).convert('RGB')
        w, h = im.size
        if w > 1920:
            im = im.resize((1920, round(h * 1920 / w)), Image.LANCZOS)
        im.save(os.path.join(ASSETS, 'forest.jpg'), 'JPEG', quality=82, optimize=True, progressive=True)
    elif not os.path.exists(os.path.join(ASSETS, 'forest.jpg')):
        raise SystemExit('Brak assets/forest.jpg — wrzuć zdjęcie zamglonego lasu do assets/')


def process_photo(src, dst, maxw=1920, q=72):
    """Łagodna obróbka: balans bieli, miękka krzywa tonów, lekkie wygładzenie refleksów."""
    im = Image.open(src).convert('RGB')
    w, h = im.size
    if w > maxw:
        im = im.resize((maxw, round(h * maxw / w)), Image.LANCZOS)
    st = ImageStat.Stat(im)
    r, g, b = st.mean
    kr = math.pow(g / max(r, 1.0), 0.55)
    kb = math.pow(g / max(b, 1.0), 0.55)
    R, G, B = im.split()
    R = R.point(lambda v: min(255, int(v * kr)))
    B = B.point(lambda v: min(255, int(v * kb)))
    im = Image.merge('RGB', (R, G, B))
    Y, Cb, Cr = im.convert('YCbCr').split()
    Y = Y.point(lambda v: min(255, int(255 * min(1.0, 0.90 * (v / 255.0) ** 0.92 + 0.16 * (v / 255.0)))))
    im = Image.merge('YCbCr', (Y, Cb, Cr)).convert('RGB')
    im = ImageEnhance.Contrast(im).enhance(1.04)
    im = ImageEnhance.Brightness(im).enhance(1.02)
    im = ImageEnhance.Color(im).enhance(0.96)
    im = im.filter(ImageFilter.GaussianBlur(0.5))
    im.save(dst, 'JPEG', quality=q, optimize=True, progressive=True)
    return im.size


def process_bg(src, dst, maxw=2880, q=86, blur=1.1, hi_knee=200, hi_gain=0.45):
    """Tło hero — bez korekt kolorów („tak jak jest") + delikatny retusz:
    lekkie wygładzenie (chowa rysy/odciski palców) i przygaszenie refleksów świetlnych
    (kompresja świateł powyżej hi_knee). Parametry tunowalne w wywołaniu w main()."""
    im = Image.open(src).convert('RGB')
    w, h = im.size
    if w > maxw:
        im = im.resize((maxw, round(h * maxw / w)), Image.LANCZOS)
    im = im.filter(ImageFilter.GaussianBlur(blur))
    Y, Cb, Cr = im.convert('YCbCr').split()
    Y = Y.point(lambda v: v if v < hi_knee else hi_knee + int((v - hi_knee) * hi_gain))
    im = Image.merge('YCbCr', (Y, Cb, Cr)).convert('RGB')
    im.save(dst, 'JPEG', quality=q, optimize=True, progressive=True)
    return im.size


# ---------------------------------------------------------------- litery logotypu
def _solidify(mask):
    """Wypełnia kreskowanie do pełnej litery: dylatacja domyka szpary między
    kreskami (2–4 px), erozja wraca do obrysu. Dziury liter (np. A, R) są dużo
    większe niż szpary, więc zostają nietknięte. mask: 'L' 0/255, tusz=255."""
    d = mask.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MaxFilter(5))
    e = d.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.MinFilter(5))
    return e.point(lambda v: 255 if v >= 128 else 0)


def build_letters():
    """Tnie LOGOTYP_3000px_BW.png na 9 liter (SYGNATURA), wypełnia kreskowanie
    do pełnych liter → assets/letters/l0..l8.png.
    Zwraca: kerningi (przerwy/h_ink), SUM_AR, RATIO (sygnet_mm/litera_mm)."""
    src = os.path.join(LOGO_DIR, 'LOGOTYP_3000px_BW.png')
    g = Image.open(src).convert('L')
    W, H = g.size
    px = g.load()

    cols = [any(px[x, y] < 128 for y in range(0, H, 4)) for x in range(W)]
    runs, x = [], 0
    while x < W:
        if cols[x]:
            s = x
            while x < W and cols[x]:
                x += 1
            runs.append((s, x - 1))
        else:
            x += 1
    if len(runs) != 9:
        raise SystemExit(f'Segmentacja logotypu: oczekiwano 9 liter, jest {len(runs)}')

    rows = [y for y in range(H) if any(px[x, y] < 128 for x in range(0, W, 4))]
    y0, y1 = min(rows), max(rows)
    h_ink = y1 - y0 + 1

    TARGET_H = 320  # wysokość wyjściowych PNG liter (powyżej rozmiaru na stronie)

    kerning = []           # przerwa między literą i a i+1, w jednostkach h_ink
    for i, (s, e) in enumerate(runs):
        crop = g.crop((s, y0, e + 1, y1 + 1))
        solid = _solidify(crop.point(lambda v: 0 if v >= 128 else 255))
        nw = max(1, round(solid.width * TARGET_H / solid.height))
        solid = solid.resize((nw, TARGET_H), Image.LANCZOS)
        col = LIGHT if i < 3 else BRUN   # SYG = pełny jaśniejszy brąz, NATURA = pełny
        tile = Image.merge('RGBA', (
            Image.new('L', solid.size, col[0]),
            Image.new('L', solid.size, col[1]),
            Image.new('L', solid.size, col[2]),
            solid))
        tile.save(os.path.join(LETTERS_DIR, f'l{i}.png'))
        if i < len(runs) - 1:
            kerning.append((runs[i + 1][0] - e - 1) / h_ink)

    sum_ar = sum((e - s + 1) / h_ink for s, e in runs)
    ratio = 30.0 / (h_ink / 50.0)   # sygnet 30 mm / wysokość litery w mm (3000px = 60mm)
    return kerning, sum_ar, ratio


def wordmark_html(klass, kerning, falling=False, delay_base=0.0, step=0.12, animated=False):
    out = []
    for i in range(9):
        style = []
        if i > 0:
            style.append(f'margin-left:{kerning[i-1]:.5f}em')
        if falling:
            style.append(f'animation-delay:{delay_base + i * step:.2f}s')
        st = f' style="{";".join(style)}"' if style else ''
        inner = f'<img class="wl {klass} l{i}" src="assets/letters/l{i}.png" alt="">'
        if falling:
            inner = f'<span class="fall"{st}>{inner}</span>'
        else:
            inner = f'<span class="lbox"{st}>{inner}</span>'
        out.append(inner)
    return ''.join(out)


# ---------------------------------------------------------------- szablony
CSS = r'''
:root{
  --butelkowa:#1F3A32; --brunatny:#6B4530; --zloty:#C4A582; --zloty-soft:#DCC9AC;
  --krem:#FBF7F0; --krem-2:#F3EDE2; --ink:#33261C;
  --serif:"Cormorant Garamond","Playfair Display",Georgia,"Palatino Linotype","Book Antiqua",Palatino,serif;
  --script:"Great Vibes","Alex Brush","Brush Script MT",cursive;
}
*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-text-size-adjust:100%}
body{background:var(--krem);color:var(--ink);font-family:var(--serif);-webkit-font-smoothing:antialiased;
  display:flex;flex-direction:column;min-height:100vh;min-height:100svh}
img{display:block;max-width:100%}
a{text-decoration:none;color:inherit}
button{font-family:inherit}

/* ================= SPLASH ================= */
#splash{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;
  background:var(--butelkowa) url('assets/forest.jpg') center/cover no-repeat;
  transition:opacity .8s ease,visibility .8s ease}
#splash::before{content:"";position:absolute;inset:0;
  background:linear-gradient(rgba(31,58,50,.10),rgba(31,58,50,.10)),
  radial-gradient(115% 100% at 50% 36%,rgba(31,58,50,0) 52%,rgba(31,58,50,.30) 100%)}
#splash.hide{opacity:0;visibility:hidden;pointer-events:none}
.splash-card{position:relative;display:flex;flex-direction:column;align-items:center;
  gap:clamp(14px,2.6vw,22px);background:rgba(251,247,240,.97);border:2px solid var(--brunatny);
  border-radius:0;padding:clamp(28px,5vw,46px) clamp(34px,8vw,64px);
  box-shadow:0 42px 90px rgba(15,26,21,.45);
  --sygW:clamp(84px,20vw,126px);
  animation:card-soft 1.1s cubic-bezier(.22,.61,.36,1) .3s both}
.splash-sygnet{width:var(--sygW);height:auto;animation:rise-soft 1.2s cubic-bezier(.22,.61,.36,1) .75s both}
.splash-word{display:flex;align-items:flex-start;font-size:calc(var(--sygW)/@@RATIO@@)}

/* litery logotypu */
.lbox,.fall{display:inline-block;flex:none}
.wl{height:1em;width:auto;display:block}
.fall{opacity:0;animation:softfall .9s cubic-bezier(.22,.61,.36,1) forwards}

@keyframes card-soft{from{opacity:0;transform:translateY(14px) scale(.985)}to{opacity:1;transform:none}}
@keyframes rise-soft{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes softfall{0%{opacity:.3;transform:translateY(-.8em)}100%{opacity:1;transform:none}}

/* ================= NAGŁÓWEK ================= */
/* nagłówek NAD zdjęciem hero (menu przykrywa górę zdjęcia — zdjęcie nie jest ucinane pod spodem) */
.site-head{position:absolute;top:0;left:0;right:0;z-index:40}
.topbar{display:flex;justify-content:flex-end;align-items:center;gap:4px;
  padding:8px clamp(14px,3.5vw,44px);background:rgba(251,247,240,.95);
  border-bottom:1px solid rgba(107,69,48,.16)}
.iconbtn{width:40px;height:40px;display:grid;place-items:center;color:var(--brunatny);
  border-radius:0;background:none;border:0;cursor:pointer}
.iconbtn:hover{background:var(--krem-2)}
.iconbtn svg{width:21px;height:21px}
.burger{display:none}
.menu{display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:2px;
  background:var(--butelkowa);padding:10px clamp(10px,3vw,40px);box-shadow:0 14px 30px rgba(15,26,21,.28)}
.menu a{color:var(--zloty);font-weight:700;font-size:13px;letter-spacing:.13em;text-transform:uppercase;
  padding:9px 13px;transition:background .2s}
.menu a:hover{background:rgba(196,165,130,.14)}
.menu a.on{background:rgba(196,165,130,.2)}

/* ================= HERO ================= */
/* TŁO NA HERO użytkownika — pełna szerokość, bez cięcia boków (100% auto);
   logo DUŻE po lewej na wysokości napisu „Cześć", panel u dołu PO PRAWEJ (rozciągnięty, 4 przyciski obok siebie) */
.hero{flex:1;position:relative;display:flex;flex-direction:column;min-height:100svh;
  background-color:#CECBB6;background-image:url('assets/hero.jpg');
  background-size:100% auto;background-position:center 22%;background-repeat:no-repeat}
.brand{position:absolute;top:clamp(96px,15%,170px);left:clamp(24px,4vw,72px);z-index:2;
  display:flex;flex-direction:column;align-items:flex-start;gap:clamp(12px,1.6vw,18px);
  --sygW:clamp(110px,13vw,176px)}
.brand-sygnet{width:var(--sygW);height:auto;filter:drop-shadow(0 10px 24px rgba(30,20,10,.28));
  opacity:0;animation:rise-soft 1s cubic-bezier(.22,.61,.36,1) 3.9s forwards}
.brand-txt{display:flex;flex-direction:column;align-items:flex-start;gap:9px}
.brand-word{display:flex;align-items:flex-start;font-size:calc(var(--sygW)/@@RATIO@@);
  filter:drop-shadow(0 6px 14px rgba(30,20,10,.30))}
.brand-podpis{font-size:clamp(11px,1.2vw,14px);letter-spacing:.34em;text-transform:uppercase;color:var(--brunatny);
  white-space:nowrap;text-shadow:0 1px 0 rgba(251,247,240,.65);
  opacity:0;animation:rise-soft 1s cubic-bezier(.22,.61,.36,1) 5.05s forwards}
.panel{position:absolute;bottom:clamp(14px,2.6vh,30px);right:clamp(24px,4vw,72px);z-index:3;
  width:min(1140px,calc(100% - clamp(48px,8vw,144px)));
  background:#FFFDF8;border:2px solid var(--brunatny);border-radius:0;
  padding:clamp(20px,2.6vw,36px);box-shadow:0 34px 70px rgba(20,15,8,.42);
  opacity:0;animation:panel-up .85s cubic-bezier(.22,.61,.36,1) 3.7s forwards}
@keyframes panel-up{from{opacity:.4;transform:translateY(14%)}to{opacity:1;transform:none}}
.slow-row{display:flex;align-items:baseline;gap:clamp(10px,1.4vw,16px);flex-wrap:wrap}
.slowo{font-family:var(--serif);color:var(--zloty);font-weight:600;
  font-size:clamp(26px,3.2vw,42px);line-height:1.1;letter-spacing:.05em;
  text-shadow:0 1px 0 rgba(107,69,48,.25),0 6px 16px rgba(20,15,8,.18);
  opacity:0;animation:wipe .8s cubic-bezier(.22,.61,.36,1) forwards}
.slowo.s1{animation-delay:4.3s}.slowo.s2{animation-delay:4.6s}.slowo.s3{animation-delay:4.9s}
.slow-dash{color:var(--brunatny);font-size:clamp(18px,2.2vw,26px);font-weight:600;
  opacity:0;animation:rise-soft .6s cubic-bezier(.22,.61,.36,1) forwards}
.slow-dash.d1{animation-delay:4.5s}.slow-dash.d2{animation-delay:4.8s}
.hero-text{font-size:clamp(14.5px,1.4vw,16.5px);line-height:1.65;color:rgba(51,38,28,.96);
  margin-top:clamp(10px,1.4vw,14px);
  opacity:0;animation:rise-soft 1s cubic-bezier(.22,.61,.36,1) 5.2s forwards}
.btn-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:clamp(14px,2vw,20px)}
.btn-row .btn{opacity:0;animation:rise-soft .9s cubic-bezier(.22,.61,.36,1) forwards}
.btn-row .btn:nth-child(1){animation-delay:5.5s}.btn-row .btn:nth-child(2){animation-delay:5.62s}
.btn-row .btn:nth-child(3){animation-delay:5.74s}.btn-row .btn:nth-child(4){animation-delay:5.86s}
@keyframes wipe{0%{clip-path:inset(0 100% 0 0);opacity:0}100%{clip-path:inset(0 -1% 0 0);opacity:1}}
.btn{width:100%;text-align:center;padding:13px 10px;border-radius:0;font-size:12px;font-weight:700;
  letter-spacing:.14em;text-transform:uppercase;transition:all .25s}
.btn-solid{background:var(--butelkowa);color:var(--zloty);border:1.5px solid var(--butelkowa)}
.btn-solid:hover{background:var(--zloty);color:var(--butelkowa);border-color:var(--zloty)}
.btn-outline{background:transparent;color:var(--brunatny);border:1.5px solid var(--brunatny)}
.btn-outline:hover{background:var(--brunatny);color:var(--krem)}

/* ================= STOPKA ================= */
.site-foot{display:flex;justify-content:space-between;align-items:center;gap:18px;flex-wrap:wrap;
  background:rgba(31,58,50,.94);color:var(--krem);padding:16px clamp(16px,4vw,46px)}
.foot-social{display:flex;align-items:center;gap:14px}
.foot-label{font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--zloty-soft)}
.soc-icons{display:flex;gap:8px}
.soc-icons a{width:36px;height:36px;display:grid;place-items:center;border:1px solid rgba(196,165,130,.45);
  border-radius:50%;color:var(--zloty);transition:all .25s}
.soc-icons a:hover{background:var(--zloty);color:var(--butelkowa)}
.soc-icons svg{width:16px;height:16px}
.foot-mid{display:flex;flex-direction:column;align-items:center;gap:7px;text-align:center}
.copy{font-size:13px;letter-spacing:.04em}
.regbtn{border:1px solid rgba(196,165,130,.6);color:var(--zloty);font-size:10.5px;letter-spacing:.14em;
  text-transform:uppercase;padding:5px 13px;border-radius:0;transition:all .25s}
.regbtn:hover{background:var(--zloty);color:var(--butelkowa)}
.foot-right{display:flex;align-items:center;gap:10px;font-size:13.5px}
.foot-right a:hover{color:var(--zloty)}
.foot-sep{opacity:.4}

/* ================= RESPONSYWNOŚĆ ================= */
@media (max-width:1023px){
  /* telefon/tablet: pas zdjęcia pełnej szerokości POD nagłówkiem — „Cześć" w całości;
     logo na pasie po lewej (na wysokości napisu), panel rozciągnięty na dole */
  .hero{background-position:0 112px}
  .brand{top:120px;left:14px;flex-direction:row;align-items:flex-start;gap:12px;--sygW:clamp(46px,13vw,64px)}
  .brand-txt{gap:6px}
  .brand-podpis{font-size:10px;letter-spacing:.26em}
  .panel{left:14px;right:14px;width:auto;padding:18px 16px}
  .slowo{font-size:clamp(24px,6.4vw,32px)}
  .btn-row{grid-template-columns:1fr 1fr}
}
@media (max-width:860px){
  .menu{display:none;flex-direction:column;align-items:stretch;text-align:center;padding:6px 14px 14px}
  .menu.open{display:flex}
  .menu a{padding:11px 12px}
  .burger{display:grid}
}
/* niskie ekrany desktopowe: ciaśniejszy panel + kadr zdjęcia tak, żeby „Cześć" mieściło się nad panelem */
@media (min-width:1024px) and (max-height:860px){
  .hero{background-position:center 28%}
  .brand{top:clamp(84px,12%,120px);--sygW:clamp(96px,11vw,150px)}
  .panel{padding:14px 22px}
  .slowo{font-size:clamp(24px,3vw,34px)}
  .hero-text{font-size:13.5px;line-height:1.5}
  .btn{padding:10px 8px;font-size:11px;letter-spacing:.1em}
  .btn-row{gap:10px;margin-top:12px}
  .slow-row{gap:10px}
}
/* bardzo szerokie monitory: kadr zdjęcia niżej (więcej góry), ciaśniejszy panel */
@media (min-width:1024px) and (min-aspect-ratio:21/10){
  .hero{background-position:center 18%}
  .panel{padding:14px 22px}
  .slowo{font-size:clamp(24px,3vw,34px)}
  .hero-text{font-size:13.5px;line-height:1.5}
  .btn{padding:10px 8px;font-size:11px;letter-spacing:.1em}
}
@media (max-width:520px){
  .btn{font-size:10.5px;letter-spacing:.1em;padding:12px 8px}
  .btn-row{grid-template-columns:1fr}
  .site-foot{flex-direction:column;gap:14px;padding:18px 16px}
  .foot-social{flex-direction:column;gap:10px}
  .splash-card{padding:26px 30px}
  .brand{top:118px}
}

/* ================= PODSTRONY (stuby) ================= */
body.stub{display:flex;flex-direction:column;min-height:100vh;min-height:100svh}
.stub-head{background:var(--butelkowa);padding:16px clamp(16px,4vw,44px);display:flex;align-items:center}
.stub-brand{display:flex;align-items:center;gap:14px;color:var(--zloty)}
.stub-brand img{width:52px;height:52px}
.stub-brand span{font-weight:700;font-size:15px;letter-spacing:.2em;text-transform:uppercase}
.stub-main{flex:1;display:flex;align-items:center;justify-content:center;padding:36px 18px;background:var(--krem)}
.stub-card{max-width:560px;width:100%;text-align:center;background:#fff;
  border:1.5px solid rgba(107,69,48,.5);border-radius:0;padding:clamp(30px,6vw,52px);
  display:flex;flex-direction:column;align-items:center;gap:14px;
  box-shadow:0 24px 50px rgba(38,29,20,.16)}
.stub-card h1{font-size:clamp(24px,5vw,34px);font-weight:600;color:var(--ink)}
.stub-tag{font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:var(--brunatny)}
.stub-card p{color:rgba(51,38,28,.85);line-height:1.7;font-size:15.5px}
.stub-card .btn{margin-top:8px}
.back{color:var(--brunatny);font-size:13.5px;letter-spacing:.08em;border-bottom:1px solid transparent}
.back:hover{border-color:var(--brunatny)}

/* ================= PICKER HERO ================= */
.picker-head{background:var(--butelkowa);color:var(--krem);padding:22px clamp(16px,4vw,44px)}
.picker-head h1{font-size:22px;font-weight:600}
.picker-head p{margin-top:6px;font-size:13.5px;color:var(--zloty-soft);max-width:760px}
.picker-view{height:46vh;min-height:300px;position:relative;overflow:hidden;
  background:url('assets/hero.jpg') center 40%/cover no-repeat}
.picker-view .pv-label{position:absolute;left:14px;bottom:12px;background:rgba(31,58,50,.88);color:var(--zloty);
  padding:8px 14px;font-size:12.5px;letter-spacing:.06em}
.picker-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px;
  padding:26px clamp(16px,4vw,44px) 60px}
.picker-item{border:2px solid transparent;cursor:pointer;padding:6px;background:#fff;
  border-radius:0;transition:border-color .2s}
.picker-item img{width:100%;height:110px;object-fit:cover}
.picker-item b{display:block;margin-top:6px;font-size:13px}
.picker-item span{display:block;font-size:10.5px;color:#8A7B69;word-break:break-all}
.picker-item.sel{border-color:var(--brunatny)}
'''

ICONS = {
    'cart': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l1.2 13H4.8L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>',
    'user': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.6"/><path d="M5 20c1.4-3.3 3.9-5 7-5s5.6 1.7 7 5"/></svg>',
    'burger': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    'ig': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.15" fill="currentColor" stroke="none"/></svg>',
    'fb': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5V11H8.5v3H11v7h2.5z"/></svg>',
    'pin': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.9 0 1.3.6 1.3 1.4 0 .9-.6 2.2-.9 3.4-.2 1 .5 1.8 1.5 1.8 1.8 0 3.2-1.9 3.2-4.7 0-2.4-1.8-4.1-4.3-4.1-2.9 0-4.6 2.2-4.6 4.4 0 .9.3 1.8.8 2.3l-.3 1.1c-.1.4-.3.5-.6.3-1.1-.5-1.8-2.1-1.8-3.4 0-2.8 2-5.3 5.8-5.3 3 0 5.4 2.2 5.4 5 0 3-1.9 5.4-4.5 5.4-.9 0-1.7-.5-2-1l-.6 2.2c-.2.8-.7 1.7-1 2.3A10 10 0 1 0 12 2z"/></svg>',
}

INDEX = r'''<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Cache-Control" content="no-store, no-cache, must-revalidate">
<title>Studio Sygnatura — rzeczy z drewna, światła i detalu</title>
<meta name="description" content="Studio Sygnatura — rodzinna pracownia. Rzeczy z drewna robione z pasją, stylem i tradycją: metryczki, numery, szyldy, dekoracje.">
<link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&display=swap" rel="stylesheet">
<style>@@CSS@@</style>
</head>
<body>

<div id="splash" aria-hidden="true">
  <div class="splash-card">
    <img class="splash-sygnet" src="assets/sygnet.svg" alt="">
    <div class="splash-word" role="img" aria-label="Sygnatura">@@SPLASH_LETTERS@@</div>
  </div>
</div>

<header class="site-head">
  <div class="topbar">
    <a class="iconbtn" href="#" title="Koszyk — wkrótce" aria-label="Koszyk">@@ICON_CART@@</a>
    <a class="iconbtn" href="#" title="Konto — wkrótce" aria-label="Konto">@@ICON_USER@@</a>
    <button class="iconbtn burger" id="burger" type="button" aria-label="Menu" aria-expanded="false" aria-controls="menu">@@ICON_BURGER@@</button>
  </div>
  <nav class="menu" id="menu" aria-label="Menu główne">
    <a href="index.html" class="on">Start</a>
    <a href="warsztat.html">Rzemiosło</a>
    <a href="galeria.html">Galeria</a>
    <a href="#" title="wkrótce">Metryczki</a>
    <a href="#" title="wkrótce">Numery i szyldy</a>
    <a href="#" title="wkrótce">Wynajem</a>
    <a href="#" title="wkrótce">Współpraca</a>
    <a href="#" title="wkrótce">Dla firm</a>
    <a href="kontakt.html">Kontakt</a>
  </nav>
</header>

<main class="hero">
    <div class="brand" aria-label="Studio Sygnatura">
      <img class="brand-sygnet" src="assets/sygnet.svg" alt="Sygnet Studio Sygnatura — litera S z gałązką w okręgu">
      <div class="brand-txt">
        <div class="brand-word" role="img" aria-label="Sygnatura">@@HERO_LETTERS@@</div>
        <p class="brand-podpis">drewno · światło · detal</p>
      </div>
    </div>
    <section class="panel" aria-label="Studio Sygnatura — zaproszenie">
      <div class="slow-row" role="img" aria-label="Pasja, styl, tradycja">
        <span class="slowo s1">Pasja</span><span class="slow-dash d1">–</span>
        <span class="slowo s2">Styl</span><span class="slow-dash d2">–</span>
        <span class="slowo s3">Tradycja</span>
      </div>
      <p class="hero-text">Kosmos pełen jest szlachetnych minerałów, ale drewno jest tylko na Ziemi. Odkryj niezwykły świat, w którym drewno, światło i głębia współtworzą teatr jakości i stylu. Każdy detal rodzi się z dłoni, które znają materiał, i z oka, które czuje estetykę. Tak ożywiamy wnętrza — dodajemy im duszę, ciepły blask i klimat, w którym dom staje się domem.</p>
      <div class="btn-row">
        <a class="btn btn-solid" href="warsztat.html">Sprawdź, jak pracujemy</a>
        <a class="btn btn-solid" href="galeria.html">Poznaj nasze prace</a>
        <a class="btn btn-solid" href="sklep.html">Znajdź coś dla siebie</a>
        <a class="btn btn-solid" href="kontakt.html">Napisz do nas</a>
      </div>
    </section>
</main>

<footer class="site-foot">
    <div class="foot-social">
      <span class="foot-label">Śledź nasze działania</span>
      <div class="soc-icons">
        <a href="#" aria-label="Instagram" title="Instagram — wkrótce">@@ICON_IG@@</a>
        <a href="#" aria-label="Facebook" title="Facebook — wkrótce">@@ICON_FB@@</a>
        <a href="#" aria-label="Pinterest" title="Pinterest — wkrótce">@@ICON_PIN@@</a>
      </div>
    </div>
    <div class="foot-mid">
      <span class="copy">© Studio Sygnatura</span>
      <a class="regbtn" href="#" title="wkrótce">Regulamin serwisu</a>
    </div>
    <div class="foot-right">
      <a href="kontakt.html">Kontakt</a><span class="foot-sep">/</span><a href="#" title="wkrótce">FAQ</a>
    </div>
</footer>

<script>
(function(){
  var splash=document.getElementById('splash');
  var show=3800;
  document.documentElement.style.overflow='hidden';
  setTimeout(function(){
    if(splash)splash.classList.add('hide');
    document.documentElement.style.overflow='';
  },show);
  setTimeout(function(){if(splash&&splash.parentNode)splash.parentNode.removeChild(splash);},show+700);
  var burger=document.getElementById('burger'),menu=document.getElementById('menu');
  if(burger&&menu){burger.addEventListener('click',function(){
    var open=menu.classList.toggle('open');
    burger.setAttribute('aria-expanded',open?'true':'false');
  });}
})();
</script>
<noscript><style>#splash{display:none}</style></noscript>
</body>
</html>
'''

PICKER = r'''<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Cache-Control" content="no-store, no-cache, must-revalidate">
<title>Wybór zdjęcia hero — Studio Sygnatura</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&display=swap" rel="stylesheet">
<style>@@CSS@@</style>
</head>
<body>
<div class="picker-head">
  <h1>Wybierz zdjęcie hero (napis „Cześć" z ukosa)</h1>
  <p>Kliknij miniaturę, żeby zobaczyć ujęcie w kadrze hero. Aktualne tło: TŁO NA HERO.png (Twoja kompozycja) — logo po lewej, panel u dołu.</p>
</div>
<div class="picker-view" id="view"><span class="pv-label" id="vlabel">Aktualne tło hero: TŁO NA HERO.png (wybrane przez Ciebie)</span></div>
<div class="picker-grid" id="grid">@@ITEMS@@</div>
<script>
var files={@@FILES_JS@@};
var def=@@DEFAULT_JS@@;
var view=document.getElementById('view'),label=document.getElementById('vlabel');
function show(n){
  view.style.backgroundImage="linear-gradient(rgba(250,246,239,.78),rgba(250,246,239,.85)),url('"+files[n]+"')";
  label.textContent=n+" — "+files[n].split('/').pop();
  var items=document.querySelectorAll('.picker-item');
  for(var i=0;i<items.length;i++){items[i].classList.toggle('sel',items[i].getAttribute('data-n')==String(n));}
}
show(def);
document.getElementById('grid').addEventListener('click',function(e){
  var it=e.target.closest('.picker-item');if(!it)return;
  show(Number(it.getAttribute('data-n')));
});
</script>
</body>
</html>
'''

STUB = r'''<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Cache-Control" content="no-store, no-cache, must-revalidate">
<title>@@TITLE@@ — Studio Sygnatura</title>
<link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&display=swap" rel="stylesheet">
<style>@@CSS@@</style>
</head>
<body class="stub">
<header class="stub-head">
  <a href="index.html" class="stub-brand">
    <img src="assets/sygnet.svg" alt="Sygnet Studio Sygnatura">
    <span>Studio Sygnatura</span>
  </a>
</header>
<main class="stub-main">
  <div class="stub-card">
    <h1>@@H1@@</h1>
    <p class="stub-tag">Wkrótce</p>
    <p>@@TEXT@@</p>
    @@EXTRA@@
    <a class="back" href="index.html">← Wróć na stronę główną</a>
  </div>
</main>
</body>
</html>
'''


def render_index(css, kerning, ratio):
    splash = wordmark_html('sw', kerning, falling=True, delay_base=1.25, step=0.13)
    hero = wordmark_html('hw', kerning, falling=True, delay_base=3.95, step=0.12)
    html = (INDEX.replace('@@CSS@@', css)
            .replace('@@SPLASH_LETTERS@@', splash)
            .replace('@@HERO_LETTERS@@', hero))
    for key in ('CART', 'USER', 'BURGER', 'IG', 'FB', 'PIN'):
        html = html.replace(f'@@ICON_{key}@@', ICONS[key.lower()])
    return html


def render_stub(css, title, h1, text, extra=''):
    return (STUB.replace('@@CSS@@', css)
            .replace('@@TITLE@@', title).replace('@@H1@@', h1)
            .replace('@@TEXT@@', text).replace('@@EXTRA@@', extra))


def main():
    ensure_assets()

    print('> tło hero:')
    tlo_src = os.path.join(UPLOADS, HERO_TLO)
    if os.path.exists(tlo_src):
        process_bg(tlo_src, os.path.join(ASSETS, 'hero.jpg'))
        print('   assets/hero.jpg <-', HERO_TLO, '(bez obróbki — „tak jak jest")')
    else:
        print(f'   UWAGA: brak {HERO_TLO} w uploads — zostawiam obecne assets/hero.jpg')

    print('> miniatury pickera:')
    for i, name in enumerate(HERO_CANDIDATES, 1):
        src = os.path.join(UPLOADS, name)
        if not os.path.exists(src):
            print(f'   UWAGA: brak pliku {src}')
            continue
        im = Image.open(src).convert('RGB')
        im.thumbnail((340, 340), Image.LANCZOS)
        im.save(os.path.join(THUMBS_DIR, f't{i}.jpg'), 'JPEG', quality=58, optimize=True)

    print('> litery logotypu:')
    kerning, sum_ar, ratio = build_letters()
    print(f'   kerning(em): {[round(k,4) for k in kerning]}  ratio={ratio:.4f}')

    css = CSS.replace('@@RATIO@@', f'{ratio:.4f}')
    with Image.open(os.path.join(ASSETS, 'hero.jpg')) as him:
        hw, hh = him.size
    css = css.replace('@@HERO_AR@@', f'{hw}/{hh}')
    print(f'   hero.jpg {hw}x{hh}  ->  aspect-ratio {hw}/{hh}')

    index = render_index(css, kerning, ratio)
    with open(os.path.join(HERE, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(index)
    print(f'> index.html  {os.path.getsize(os.path.join(HERE, "index.html")) // 1024} kB')

    items, files_js = [], []
    for i, name in enumerate(HERO_CANDIDATES, 1):
        items.append(
            f'<div class="picker-item" data-n="{i}">'
            f'<img src="assets/thumbs/t{i}.jpg" alt="{name}">'
            f'<b>#{i}</b><span>{name}</span></div>')
        files_js.append(f'{i}:"assets/thumbs/t{i}.jpg"')
    picker = (PICKER.replace('@@CSS@@', css)
              .replace('@@ITEMS@@', ''.join(items))
              .replace('@@FILES_JS@@', ','.join(files_js))
              .replace('@@DEFAULT_JS@@', '2'))
    with open(os.path.join(HERE, 'hero-picker.html'), 'w', encoding='utf-8') as f:
        f.write(picker)
    print(f'> hero-picker.html  {os.path.getsize(os.path.join(HERE, "hero-picker.html")) // 1024} kB')

    stubs = [
        ('warsztat.html', 'Warsztat', 'Jak pracujemy',
         'Budujemy tę stronę — pokażemy tu nasz warsztat: maszyny, proces, materiał i to, jak krok po kroku powstają nasze rzeczy.',
         '<a class="btn btn-outline" href="index.html">Zobacz stronę główną</a>'),
        ('galeria.html', 'Galeria', 'Nasze prace',
         'Szykujemy galerię realizacji i bloga zza kulis. Zajrzyj tu niebawem — będzie na co popatrzeć.',
         '<a class="btn btn-outline" href="index.html">Zobacz stronę główną</a>'),
        ('kontakt.html', 'Kontakt', 'Formularz kontaktowy',
         'Budujemy tę stronę. Tymczasem napisz do nas bezpośrednio — odpowiadamy szybko.',
         '<a class="btn btn-solid" href="mailto:kontakt@studiosygnatura.pl">kontakt@studiosygnatura.pl</a>'),
        ('sklep.html', 'Sklep', 'Sklep i realizacje',
         'Szykujemy naszą ofertę i galerię realizacji. Zajrzyj tu niebawem — będzie na co popatrzeć.',
         '<a class="btn btn-outline" href="index.html">Zobacz stronę główną</a>'),
    ]
    for name, title, h1, text, extra in stubs:
        html = render_stub(css, title, h1, text, extra)
        with open(os.path.join(HERE, name), 'w', encoding='utf-8') as f:
            f.write(html)
        print(f'> {name}  {os.path.getsize(os.path.join(HERE, name)) // 1024} kB')

    print('Gotowe.')


if __name__ == '__main__':
    main()
