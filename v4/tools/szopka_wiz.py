#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Wizualizacje szopki warstwowej dla żony użytkownika.
Buduje: (1) referencję widoku z przodu (do generate_image),
(2) schemat rozstrzelony, (3) przekrój boczny konstrukcji — PIL, czyste schematy."""
from PIL import Image, ImageDraw, ImageFont
import os

HERE = os.path.dirname(os.path.abspath(__file__))
RASTER = os.path.abspath(os.path.join(HERE, '..', '..', 'pracownia', 'szopka', 'RASTER'))
OUT = os.path.abspath(os.path.join(HERE, '..', '..', 'pracownia', 'szopka', 'WIZUALIZACJE', 'v2'))
os.makedirs(OUT, exist_ok=True)

FD = '/usr/share/fonts/truetype/dejavu/'
def F(name, size): return ImageFont.truetype(FD + name, size)

CREAM  = (246, 241, 231)
PINE   = (201, 168, 124)
PINE_D = (166, 130, 84)
PINE_L = (222, 194, 158)
BROWN  = (107, 69, 48)
INK    = (51, 38, 28)
GRAY   = (150, 140, 122)
LED_W  = (255, 214, 130)

# tony warstw (dzień) — od najjaśniejszej z tyłu do najciemniejszej z przodu
TONE = [(70, 55, 42), (61, 46, 33), (54, 40, 29), (46, 34, 24), (39, 29, 20)]


def mask_of(path, bbox=None):
    """Czarna sylwetka z PNG jako maska alfa (255 = drewno)."""
    im = Image.open(path).convert('L')
    if bbox:
        im = im.crop(bbox)
    return im.point(lambda v: 255 if v < 128 else 0)


def bbox_of(path):
    im = Image.open(path).convert('L')
    W, H = im.size
    px = im.load()
    xs = [x for x in range(W) if any(px[x, y] < 128 for y in range(0, H, 3))]
    ys = [y for y in range(H) if any(px[x, y] < 128 for x in range(0, W, 3))]
    return (min(xs), min(ys), max(xs), max(ys))


def paste_layer(base, path, bbox, target_w, target_h, bottom_y, x_center=None,
                x_fraction=None, color=(40, 30, 20)):
    m = mask_of(path, bbox)
    w = target_w
    h = max(1, round(m.height * w / m.width))
    if h > target_h:
        h = target_h
        w = max(1, round(m.width * h / m.height))
    m = m.resize((w, h), Image.LANCZOS)
    tile = Image.new('RGBA', (w, h), color + (255,))
    tile.putalpha(m)
    x = round(x_fraction * (base.width - w)) if x_fraction is not None else (x_center - w // 2)
    base.alpha_composite(tile, (x, bottom_y - h))


def build_front_ref():
    """Kompozyt widoku z przodu (dzień) — referencja do generate_image."""
    W = H = 1024
    win_w, win_h = 800, 780
    win_x, win_y = (W - win_w) // 2, 128
    img = Image.new('RGB', (W, H), CREAM)
    d = ImageDraw.Draw(img, 'RGBA')

    # rama sosnowa (listwa 20x20 mm -> ~105 px)
    fw = (W - win_w) // 2
    d.rectangle([win_x - fw, win_y - fw, win_x + win_w + fw, win_y + win_h + fw],
                fill=PINE, outline=PINE_D, width=3)
    d.rectangle([win_x - fw + 26, win_y - fw + 26, win_x + win_w + fw - 26, win_y + win_h + fw - 26],
                outline=PINE_D, width=2)
    # cien pod ramą
    d.rectangle([win_x - fw + 10, win_y + win_h + fw - 8, win_x + win_w + fw - 10, win_y + win_h + fw + 6],
                fill=(0, 0, 0, 40))
    # okno
    d.rectangle([win_x, win_y, win_x + win_w, win_y + win_h], fill=(238, 231, 218))

    layers = img.convert('RGBA')
    l0b = bbox_of(os.path.join(RASTER, 'L0_niebo.png'))
    paste_layer(layers, os.path.join(RASTER, 'L0_niebo.png'), l0b,
                win_w, win_h, win_y + win_h, x_center=win_x + win_w // 2, color=TONE[0])
    paste_layer(layers, os.path.join(RASTER, 'L1_stajnia.png'), bbox_of(os.path.join(RASTER, 'L1_stajnia.png')),
                int(win_w * 0.66), int(win_h * 0.74), win_y + win_h, x_center=win_x + win_w // 2, color=TONE[1])
    paste_layer(layers, os.path.join(RASTER, 'L2_zwierzeta.png'), bbox_of(os.path.join(RASTER, 'L2_zwierzeta.png')),
                int(win_w * 0.92), int(win_h * 0.92), win_y + win_h, x_center=win_x + win_w // 2, color=TONE[2])
    paste_layer(layers, os.path.join(RASTER, 'L3_postacie.png'), bbox_of(os.path.join(RASTER, 'L3_postacie.png')),
                int(win_w * 0.42), int(win_h * 0.62), win_y + win_h, x_fraction=0.56, color=TONE[3])
    paste_layer(layers, os.path.join(RASTER, 'L4_zlobek.png'), bbox_of(os.path.join(RASTER, 'L4_zlobek.png')),
                int(win_w * 0.50), int(win_h * 0.40), win_y + win_h, x_center=win_x + win_w // 2, color=TONE[4])
    img = layers.convert('RGB')
    img.save(os.path.join(OUT, '_ref_front_dzien.png'))
    print('ref front:', img.size)


def build_exploded():
    """Schemat rozstrzelony (IKEA-style) — rama + warstwy + grzebienie + plecki."""
    W, H = 2200, 1500
    img = Image.new('RGB', (W, H), CREAM)
    d = ImageDraw.Draw(img)
    fH = F('DejaVuSans-Bold.ttf', 44)
    fT = F('DejaVuSans.ttf', 30)
    fS = F('DejaVuSans.ttf', 24)

    d.text((W//2, 36), 'SZOPKA WARSTWOWA — JAK TO JEST ZŁOŻONE', font=fH, fill=INK, anchor='ma')
    d.text((W//2, 92), 'patrzysz z przodu · warstwy wsuwane są od góry, jedna za drugą (odstępy ~6 mm dają głębię)',
           font=fS, fill=BROWN, anchor='ma')

    # --- rama z lewej ---
    rx, ry, rw, rh = 60, 170, 560, 560
    d.rectangle([rx, ry, rx+rw, ry+rh], fill=PINE, outline=PINE_D, width=4)
    d.rectangle([rx+52, ry+52, rx+rw-52, ry+rh-52], fill=(238, 231, 218), outline=PINE_D, width=2)
    d.text((rx+rw//2, ry+rh+24), 'RAMA: listwa sosnowa 20×20 mm', font=fT, fill=INK, anchor='ma')
    d.text((rx+rw//2, ry+rh+58), 'z rowkiem 3,2 mm + ścianki 3 mm na zakładki', font=fS, fill=BROWN, anchor='ma')

    # strzałka
    ax0, ax1 = rx+rw+20, rx+rw+150
    ay = ry+rh//2
    d.line([(ax0, ay), (ax1, ay)], fill=BROWN, width=5)
    d.polygon([(ax1, ay), (ax1-26, ay-14), (ax1-26, ay+14)], fill=BROWN)
    d.text(((ax0+ax1)//2, ay-30), 'wsuń od góry', font=fS, fill=BROWN, anchor='ma')

    # --- warstwy schodkowo ---
    names = [('L0', 'niebo · gwiazdy · księżyc', 'TYŁ'),
             ('L1', 'stajnia', ''),
             ('L2', 'wzgórza · świerki · płot', ''),
             ('L3', 'Maryja i Józef', ''),
             ('L4', 'żłóbek', 'PRZÓD')]
    px0, pw = 760, 210
    py_base = ry+rh
    step_y = 46
    for i, (lab, desc, tag) in enumerate(names):
        x = px0 + i * (pw + 26)
        y = py_base - pw - step_y * (4 - i)  # schodek: przód najniżej
        tone = TONE[i]
        d.rectangle([x-14, y-14, x+pw+14, y+pw+14], fill=(255, 255, 255), outline=BROWN, width=3)
        d.rectangle([x, y, x+pw, y+pw], fill=tone)
        # gwiazdy w L0
        if i == 0:
            for (sx, sy, sr) in [(0.30, 0.30, 9), (0.62, 0.20, 7), (0.45, 0.55, 6), (0.75, 0.62, 8), (0.2, 0.7, 5)]:
                cx, cy = x + pw*sx, y + pw*sy
                d.ellipse([cx-sr, cy-sr, cx+sr, cy+sr], fill=CREAM)
        # uproszczone sylwetki
        if i == 1:
            d.polygon([(x+pw*0.5, y+pw*0.18), (x+pw*0.14, y+pw*0.62), (x+pw*0.86, y+pw*0.62)], fill=CREAM)
            d.rectangle([x+pw*0.16, y+pw*0.62, x+pw*0.30, y+pw*0.95], fill=CREAM)
            d.rectangle([x+pw*0.70, y+pw*0.62, x+pw*0.84, y+pw*0.95], fill=CREAM)
        if i == 2:
            d.ellipse([x+pw*0.16, y+pw*0.38, x+pw*0.44, y+pw*0.66], fill=CREAM)
            d.ellipse([x+pw*0.62, y+pw*0.46, x+pw*0.86, y+pw*0.70], fill=CREAM)
            d.rectangle([x, y+pw*0.86, x+pw, y+pw], fill=CREAM)
        if i == 3:
            for fx in (0.58, 0.78):
                cx = x + pw*fx
                d.polygon([(cx-pw*0.05, y+pw*0.30), (cx+pw*0.05, y+pw*0.30), (cx+pw*0.02, y+pw*0.12),
                           (cx-pw*0.02, y+pw*0.12)], fill=CREAM)
                d.ellipse([cx-pw*0.07, y+pw*0.20, cx+pw*0.07, y+pw*0.34], fill=CREAM)
                d.rectangle([cx-pw*0.05, y+pw*0.34, cx+pw*0.05, y+pw*0.88], fill=CREAM)
            d.rectangle([x, y+pw*0.88, x+pw, y+pw], fill=CREAM)
        if i == 4:
            d.rectangle([x+pw*0.30, y+pw*0.55, x+pw*0.70, y+pw*0.78], fill=CREAM)
            d.ellipse([x+pw*0.42, y+pw*0.78, x+pw*0.58, y+pw*0.84], fill=CREAM)
            d.rectangle([x, y+pw*0.88, x+pw, y+pw], fill=CREAM)
        d.text((x+pw//2, y-40), lab, font=fH, fill=INK, anchor='ma')
        d.text((x+pw//2, y+pw+26), desc, font=fS, fill=BROWN, anchor='ma')
        if tag:
            d.text((x+pw//2, y+pw+58), tag, font=fT, fill=INK, anchor='ma')

    # --- dolny rząd: grzebienie, plecki, ścianki ---
    gy = 1120
    items = [
        ('GRZEBIEŃ ×2', 'wpusty 3,2 mm na warstwy', 'otwory ⌀5 mm na drut LED'),
        ('PLECKI', 'sklejka 3 mm, białe matowe', 'zdejmowane — dostęp do baterii'),
        ('ŚCIANKI ×4', 'sklejka 3 mm, na zakładki', 'dolna z otworami na wkręty'),
    ]
    for i, (t1, t2, t3) in enumerate(items):
        x = 90 + i * 700
        if i == 0:
            # grzebień: pasek z wpustami
            d.rectangle([x, gy, x+520, gy+60], fill=PINE, outline=PINE_D, width=3)
            for k in range(5):
                sx = x + 60 + k * 95
                d.rectangle([sx, gy, sx+9, gy+60], fill=(238, 231, 218))
            for k in range(5):
                hx = x + 30 + k * 95
                d.ellipse([hx, gy+74, hx+22, gy+96], fill=CREAM, outline=BROWN, width=2)
        elif i == 1:
            d.rectangle([x, gy, x+430, gy+430], fill=(238, 231, 218), outline=BROWN, width=3)
            d.rectangle([x+60, gy+160, x+160, gy+250], fill=PINE, outline=PINE_D, width=2)
            d.text((x+110, gy+205), 'baterie', font=fS, fill=BROWN, anchor='ma')
        else:
            d.rectangle([x, gy, x+470, gy+110], fill=PINE, outline=PINE_D, width=3)
            for k in range(4):
                d.ellipse([x+30+k*115, gy+25, x+48+k*115, gy+43], fill=(238, 231, 218))
            d.text((x+235, gy+75), '4 × wkręt (spód)', font=fS, fill=BROWN, anchor='ma')
        d.text((x+100, gy-40), t1, font=fH, fill=INK, anchor='lm')
        d.text((x+100, gy+455 if i==1 else gy+110), t2, font=fT, fill=INK)
        d.text((x+100, gy+492 if i==1 else gy+150), t3, font=fS, fill=BROWN)

    # notka LED
    d.rectangle([60, 1380, W-60, 1470], fill=BROWN)
    d.text((W//2, 1410), 'ŚWIATŁO: drucik LED (fairy lights) ciepły biały 2700 K, wężykiem w 4 szczelinach między warstwami',
           font=fS, fill=(246, 233, 205), anchor='ma')
    d.text((W//2, 1446), 'diody nigdy nie świecą w stronę widza — odbijają się od białych ścianek i plecków',
           font=fS, fill=(246, 233, 205), anchor='ma')

    img.save(os.path.join(OUT, 'WIZ_rozstrzelony.png'))
    print('exploded:', img.size)


def build_przekroj():
    """Przekrój boczny konstrukcji (schemat)."""
    W, H = 2000, 1000
    img = Image.new('RGB', (W, H), CREAM)
    d = ImageDraw.Draw(img)
    fH = F('DejaVuSans-Bold.ttf', 44)
    fT = F('DejaVuSans.ttf', 28)
    fS = F('DejaVuSans.ttf', 24)

    d.text((W//2, 40), 'PRZEKRÓJ BOCZNY — widzisz głębię (40 mm)', font=fH, fill=INK, anchor='ma')
    d.text((W//2, 96), 'przód →', font=fT, fill=BROWN, anchor='ma')

    # geometria: rama 20x20 z rowkiem, 5 warstw, 4 szczeliny po 6 mm
    x0, y0 = 300, 220
    strip = 76          # 20 mm
    gap = 30            # 6 mm
    layer_w = 12        # 3 mm
    depth = 40 + 30
    ys = y0 + strip
    ye = ys + 420
    # profile ramy góra/dół
    for yy in (y0, ye):
        d.rectangle([x0-strip, yy, x0+depth*4, yy+strip], fill=PINE, outline=PINE_D, width=3)
        d.rectangle([x0-strip+30, yy+30, x0-strip+46, yy+strip-30], fill=(238, 231, 218))  # rowek (w uproszczeniu)

    # plecki (białe, z tyłu)
    bx = x0 + 5*depth
    d.rectangle([bx, ys, bx+layer_w, ye], fill=(246, 244, 240), outline=GRAY, width=2)
    d.rectangle([bx-46, ys+90, bx-8, ys+180], fill=PINE, outline=PINE_D, width=2)
    d.text((bx-27, ys+135), 'baterie', font=fS, fill=BROWN, anchor='ma')

    # warstwy (tył → przód)
    labels = ['L0\nniebo', 'L1\nstajnia', 'L2\nwzgórza', 'L3\npostacie', 'L4\nżłóbek']
    for i in range(5):
        lx = x0 + i * depth + gap
        tone = TONE[i]
        d.rectangle([lx, ys, lx+layer_w, ye], fill=tone)
        # drut LED na plecach warstwy (wężyk) — poza L0
        if i > 0:
            zx = lx - 7
            pts = []
            for k in range(9):
                yy2 = ys + 24 + k * ((ye - ys - 48) / 8)
                pts.append((zx + (6 if k % 2 == 0 else 0), yy2))
            d.line(pts, fill=LED_W, width=4)
            for k in range(0, 9, 2):
                d.ellipse([pts[k][0]-5, pts[k][1]-5, pts[k][0]+5, pts[k][1]+5], fill=(255, 236, 170))
        if i > 0:
            d.text((lx-70, ye+60), labels[i], font=fS, fill=BROWN, anchor='ma')
        else:
            d.text((lx+6, ye+60), labels[i], font=fS, fill=BROWN, anchor='ma')
    # L0 label pod
    # odległości
    d.line([(x0+gap, ye+14), (x0+depth+gap, ye+14)], fill=GRAY, width=2)
    d.text((x0+depth//2+gap, ye+22), 'odstęp 6 mm', font=fS, fill=GRAY, anchor='ma')

    d.text((bx+layer_w+40, ys+70), 'PLECKI białe matowe — odbijają światło,\ngwiazdy w L0 świecą (bez dyfuzora)',
           font=fT, fill=INK)
    d.text((bx+layer_w+40, ys+190), 'drut LED (fairy lights 2700 K):\n· wężykiem w każdej szczelinie\n· przy ściankach bocznych\n· diody NIE w stronę widza\n· luzy 3–4 cm przy klejeniu',
           font=fT, fill=BROWN)
    # wymiary
    d.line([(x0-strip, y0-60), (x0+4*depth, y0-60)], fill=INK, width=3)
    d.text((x0+2*depth, y0-80), '20 × 20 cm (lico ramy)', font=fT, fill=INK, anchor='ma')
    d.line([(x0-strip-40, ys), (x0-strip-40, ye)], fill=INK, width=3)
    d.text((x0-strip-60, (ys+ye)//2), '20 cm', font=fT, fill=INK, anchor='mm')
    d.line([(x0-40, ys), (x0-40, ye)], fill=INK, width=3)
    # głębokość
    d.line([(x0, ye+strip+60), (x0+4*depth, ye+strip+60)], fill=INK, width=3)
    d.text((x0+2*depth, ye+strip+80), 'głębokość ~40 mm', font=fT, fill=INK, anchor='ma')

    img.save(os.path.join(OUT, 'WIZ_przekroj_boczny.png'))
    print('przekroj:', img.size)


if __name__ == '__main__':
    build_front_ref()
    build_exploded()
    build_przekroj()
