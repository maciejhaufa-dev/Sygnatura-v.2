#!/usr/bin/env python3
# Buduje statyczne strony Studio Sygnatura z pages.py (tresc) + assets/style.css
# CSS i logo sa wstrzykiwane inline, zeby pojedynczy plik HTML dzialal wszedzie.
import base64, os, io, sys
from PIL import Image
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))   # /home/user/pracownia

def ink_png(path, w):
    """PNG 1-bit BW -> RGBA z przezroczystym tlem, czarny tusz (kolorujemy CSS-em)."""
    im = Image.open(path).convert('L')
    h = int(w * im.size[1] / im.size[0])
    im = im.resize((w, h), Image.LANCZOS)
    a = np.array(im)
    rgba = np.zeros((a.shape[0], a.shape[1], 4), dtype=np.uint8)
    rgba[..., 3] = 255 - a
    buf = io.BytesIO(); Image.fromarray(rgba).save(buf, 'PNG', optimize=True)
    return base64.b64encode(buf.getvalue()).decode()

def jpg_b64(path, w, q):
    im = Image.open(path).convert('RGB')
    h = int(w * im.size[1] / im.size[0])
    im = im.resize((w, h), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'JPEG', quality=q, optimize=True, progressive=True)
    return base64.b64encode(buf.getvalue()).decode()

CSS  = open(os.path.join(HERE, 'assets', 'style.css'), encoding='utf-8').read()
CALJS= open(os.path.join(HERE, 'assets', 'kalendarz.js'), encoding='utf-8').read()
LOGO = ink_png(os.path.join(ROOT, 'logo', 'WEKTORY3', 'LOGO_pelne_3000px_BW.png'), 820)
HERO = jpg_b64(os.path.join(ROOT, 'www', 'img', 'hero_v2.jpg'), 1400, 62)

NAV = [('index.html','Start'),('rzemioslo.html','Rzemiosło'),('metryczki.html','Metryczki'),
       ('numery.html','Numery'),('szyldy.html','Szyldy'),('wynajem.html','Wynajem'),
       ('wspolpraca.html','Współpraca'),('dla-firm.html','Dla firm')]

def head(title, cur):
    items = ''.join(
        f'<li><a href="{h}"{" class=\"on\"" if h==cur else ""}>{n}</a></li>' for h,n in NAV)
    return f"""<!DOCTYPE html><html lang="pl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title} — Studio Sygnatura</title>
<style>{CSS}
.brand img{{filter:brightness(0) saturate(100%) invert(26%) sepia(18%) saturate(1400%) hue-rotate(340deg) brightness(94%) contrast(88%)}}
</style></head><body>
<header class="nav"><div class="navin">
  <a class="brand" href="index.html"><img src="data:image/png;base64,{LOGO}" alt="Studio Sygnatura"></a>
  <ul class="menu" id="m">{items}</ul>
  <a class="navcta" href="kontakt.html">Zamów projekt</a>
  <button class="burger" onclick="document.getElementById('m').classList.toggle('open')">☰</button>
</div></header>"""

FREE = """<section class="freeband">
  <span class="pill">Projekt bez opłat</span>
  <h3>Nie możesz znaleźć tego, o czym myślisz?</h3>
  <p>Napisz do nas, a przygotujemy projekt zgodnie z Twoim pomysłem — za darmo. Płacisz dopiero wtedy, gdy zdecydujesz się go wykonać.</p>
  <a class="btn btn1" href="kontakt.html">Opisz swój pomysł</a>
</section>"""

FOOT = """<footer><div class="fgrid">
  <div>
    <h5>Studio Sygnatura</h5>
    <p class="fabout">Warsztat prowadzony we dwoje. Robimy niewiele rzeczy, za to każdą z uporem — warstwa po warstwie, aż detal zacznie się bronić sam.</p>
  </div>
  <div><h5>Wyroby</h5><ul>
    <li><a href="metryczki.html">Metryczki</a></li>
    <li><a href="numery.html">Numery na drzwi</a></li>
    <li><a href="szyldy.html">Szyldy rzeźbione</a></li>
    <li><a href="wynajem.html">Wynajem dekoracji</a></li>
    <li><a href="wspolpraca.html">Pamiątki z okazji</a></li></ul></div>
  <div><h5>Studio</h5><ul>
    <li><a href="rzemioslo.html">Rzemiosło</a></li>
    <li><a href="wspolpraca.html">Dla organizatorów</a></li>
    <li><a href="dla-firm.html">Dla firm</a></li>
    <li><a href="kontakt.html">Kontakt</a></li></ul></div>
  <div><h5>Kontakt</h5><ul>
    <li>kontakt@studiosygnatura.pl</li>
    <li>studiosygnatura.pl</li>
    <li>Poznań i okolice</li></ul></div>
</div><div class="fbot">
  <span>© 2026 Studio Sygnatura</span><span>Wszystko powstaje u nas, bez podwykonawców</span>
</div></footer></body></html>"""

def crumb(*parts):
    out = ['<a href="index.html">Start</a>']
    for label, href in parts:
        out.append(f'<a href="{href}">{label}</a>' if href else f'<span>{label}</span>')
    return '<div class="crumb">' + ' &nbsp;/&nbsp; '.join(out) + '</div>'

def phead(tag, h1, p):
    return f'<section class="phead"><span class="tag">{tag}</span><h1>{h1}</h1><p>{p}</p></section>'

import pages
os.makedirs(HERE, exist_ok=True)
total = 0
for fname, (title, body) in pages.build(head, phead, crumb, FREE, FOOT, HERO, CALJS).items():
    p = os.path.join(HERE, fname)
    open(p, 'w', encoding='utf-8').write(body)
    kb = os.path.getsize(p) / 1024; total += kb
    print(f'{fname:26s} {kb:7.0f} kB')
print(f'{"RAZEM":26s} {total:7.0f} kB')
